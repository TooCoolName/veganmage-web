import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";

export type SectionVariant = "shimmer" | "descent" | "abyss" | "sunrise";

const BG_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

/** Shared universe helpers: starfields and nebulae. */
const UNIVERSE_GLSL = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
  float starLayer(vec2 uv, float aspect, float t, float scale, float thresh) {
    vec2 g = uv * vec2(aspect, 1.0) * scale;
    vec2 id = floor(g);
    float h = hash21(id);
    if (h < thresh) return 0.0;
    vec2 sp = vec2(hash21(id + 7.13), hash21(id + 3.71));
    float d = length(fract(g) - sp);
    float tw = 0.5 + 0.5 * sin(t * (1.5 + h * 3.0) + h * 40.0);
    return smoothstep(0.09, 0.0, d) * tw;
  }
`;

/** Soft transparent glows — the section CSS gradient stays underneath. */
const BG_FRAGMENTS: Record<SectionVariant, string> = {
  // Thin surface shimmer for the marquee strip.
  shimmer: /* glsl */ `
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec3 uPrimary;
    uniform vec3 uAccent;
    varying vec2 vUv;
    ${UNIVERSE_GLSL}
    void main() {
      vec2 uv = vUv;
      float flow = sin((uv.x * 3.0 - uTime * 0.22) + sin(uv.y * 6.0 + uTime * 0.3) * 0.6) * 0.5 + 0.5;
      float band = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.75, uv.y);
      float shimmer = pow(flow, 3.0) * band * 0.55;
      float glow = exp(-pow((uv.y - 0.5 - uMouse.y * 0.08) * 3.2, 2.0)) * 0.4;
      vec3 col = uAccent * (shimmer + glow * 0.7) + uPrimary * glow * 0.4;
      float st = starLayer(uv, uAspect, uTime, 34.0, 0.986);
      col += vec3(1.0, 0.96, 0.84) * st * 0.45;
      float edge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);
      gl_FragColor = vec4(col, (shimmer + glow * 0.55) * edge * 0.65 + st * edge * 0.35);
    }
  `,
  // Slanted god-rays with a green-gold nebula and stars.
  descent: /* glsl */ `
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec3 uPrimary;
    uniform vec3 uAccent;
    varying vec2 vUv;
    ${UNIVERSE_GLSL}
    void main() {
      vec2 uv = vUv;
      float rays = 0.0;
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float x = 0.12 + fi * 0.24 + sin(uTime * 0.05 + fi * 2.3) * 0.05 + uMouse.x * 0.02 * (fi - 1.5);
        float slant = (uv.y - 0.5) * (0.22 + fi * 0.03);
        float d = abs(uv.x - x - slant);
        float w = 0.028 + fi * 0.012;
        rays += exp(-d * d / (w * w)) * (0.5 + 0.5 * sin(uTime * 0.12 + fi * 1.9));
      }
      float depth = smoothstep(0.05, 0.75, 1.0 - uv.y) * 0.7 + 0.3;
      float floor_ = smoothstep(0.55, 1.0, 1.0 - uv.y) * 0.5;
      vec3 col = uAccent * rays * 0.42 * depth + uPrimary * (rays * 0.26 + floor_ * 0.4) * depth;
      float neb = fbm(uv * vec2(uAspect, 1.0) * 2.4 + vec2(uTime * 0.02, -uTime * 0.012));
      float nebM = smoothstep(0.52, 0.85, neb);
      vec3 nebCol = mix(uPrimary, uAccent, smoothstep(0.3, 0.75, neb) * 0.45);
      col += nebCol * nebM * 0.22;
      float st = starLayer(uv, uAspect, uTime, 52.0, 0.978) * smoothstep(0.75, 0.25, uv.y);
      col += vec3(1.0, 0.95, 0.8) * st * 0.4;
      float mask = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
      gl_FragColor = vec4(col, (rays * 0.36 + floor_ * 0.32 + nebM * 0.16 + st * 0.3) * mask);
    }
  `,
  // Deep trench glow for the momentum band (always dark).
  abyss: /* glsl */ `
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec3 uPrimary;
    uniform vec3 uAccent;
    varying vec2 vUv;
    ${UNIVERSE_GLSL}
    float caustic(vec2 uv, float t) {
      vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
      vec2 i = p;
      float c = 1.0;
      float inten = 0.0045;
      for (int n = 0; n < 3; n++) {
        float tt = t * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
      }
      c /= 3.0;
      c = 1.17 - pow(c, 1.4);
      return pow(abs(c), 7.0);
    }
    void main() {
      vec2 uv = vUv;
      vec2 q = (uv - 0.5) * vec2(uAspect, 1.0);
      float t = uTime * 0.1;
      float c = caustic(q * 2.2 + uMouse * 0.15, t) * 0.8 + caustic(q * 3.6 - vec2(t * 0.2, 0.0), t * 1.3 + 40.0) * 0.3;
      c *= smoothstep(0.9, 0.2, length(q)) * 0.8 + 0.1;
      vec2 heart = (uv - vec2(0.5 + uMouse.x * 0.03, 0.46)) * vec2(uAspect, 1.0);
      float heartGlow = exp(-dot(heart, heart) * 3.2) * (0.75 + 0.25 * sin(uTime * 0.4));
      float topLight = exp(-pow((uv.y - 0.92) * 3.0, 2.0)) * 0.5;
      vec3 col = uAccent * (c * 0.55 + heartGlow * 0.6) + uPrimary * (heartGlow * 0.4 + topLight * 0.45 + c * 0.22);
      vec2 nq = q * 1.6 + vec2(uTime * 0.015, uTime * 0.01);
      float neb1 = fbm(nq + 3.1);
      float neb2 = fbm(nq * 1.7 - 1.7);
      float nebM = smoothstep(0.4, 0.85, neb1 * 0.65 + neb2 * 0.35);
      vec3 nebCol = mix(uPrimary, uAccent, smoothstep(0.35, 0.8, neb2));
      col += nebCol * nebM * 0.55;
      float st = starLayer(uv, uAspect, uTime, 60.0, 0.972);
      col += vec3(1.0, 0.95, 0.8) * st * 0.55;
      float a = c * 0.38 + heartGlow * 0.36 + topLight * 0.24 + nebM * 0.4 + st * 0.45;
      gl_FragColor = vec4(col, a);
    }
  `,
  // Sunrise surfacing for the CTA — light wells up from below.
  sunrise: /* glsl */ `
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec3 uPrimary;
    uniform vec3 uAccent;
    varying vec2 vUv;
    ${UNIVERSE_GLSL}
    void main() {
      vec2 uv = vUv;
      vec2 sunP = vec2(0.5 + uMouse.x * 0.04, -0.06 + sin(uTime * 0.25) * 0.008);
      vec2 q = (uv - sunP) * vec2(uAspect, 1.0);
      float sun = exp(-dot(q, q) * 4.5);
      float halo = exp(-dot(q, q) * 1.4) * 0.6;
      float horizon = exp(-pow((uv.y - 0.06) * 4.2, 2.0));
      float rays = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float x = 0.3 + fi * 0.2 + sin(uTime * 0.06 + fi * 2.0) * 0.04;
        float d = abs(uv.x - x + (uv.y) * 0.12);
        rays += exp(-d * d * 90.0) * (1.0 - uv.y);
      }
      float rings = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float ph = fract(uTime * 0.08 + fi / 3.0);
        float r = ph * 0.9;
        float d = abs(length(q) - r);
        rings += exp(-d * d * 220.0) * (1.0 - ph) * 0.6;
      }
      vec2 rp = q * vec2(1.0, 2.3);
      float orbit = exp(-pow((length(rp) - 0.34) * 13.0, 2.0));
      float orbitShimmer = 0.6 + 0.4 * sin(uTime * 0.7);
      float st = starLayer(uv, uAspect, uTime, 48.0, 0.982) * smoothstep(0.35, 0.7, uv.y);
      vec3 col = uAccent * (sun * 1.0 + halo * 0.8 + horizon * 0.55 + rings * 0.45 + orbit * 0.5 * orbitShimmer)
        + uPrimary * (halo * 0.4 + rays * 0.32 + horizon * 0.28)
        + vec3(1.0, 0.96, 0.86) * st * 0.5;
      float a = sun * 0.6 + halo * 0.45 + horizon * 0.36 + rays * 0.2 + rings * 0.24 + orbit * 0.3 * orbitShimmer + st * 0.4;
      gl_FragColor = vec4(col, a * smoothstep(1.0, 0.35, uv.y * 0.9));
    }
  `,
};

const POINTS_VERTEX: Record<SectionVariant, string> = {
  shimmer: /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    attribute float aSeed;
    varying float vTw;
    varying float vSeed;
    void main() {
      vec3 p = position;
      p.x = mod(p.x + 8.0 + uTime * (0.25 + aSeed * 0.5), 16.0) - 8.0;
      p.y += sin(uTime * 0.8 + aSeed * 30.0) * 0.18;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 40.0));
      vSeed = aSeed;
      gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed * 0.8) * (5.0 / max(0.1, -mv.z));
    }
  `,
  descent: /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    attribute float aSeed;
    varying float vTw;
    varying float vSeed;
    void main() {
      vec3 p = position;
      p.y = mod(p.y + 11.0 + uTime * (0.12 + aSeed * 0.22), 22.0) - 11.0;
      p.x += sin(uTime * 0.22 + aSeed * 24.0) * 0.45;
      p.z += cos(uTime * 0.18 + aSeed * 12.0) * 0.4;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float band = smoothstep(-11.0, -8.0, p.y) * smoothstep(11.0, 8.0, p.y);
      vTw = (0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * (0.5 + aSeed) + aSeed * 40.0))) * band;
      vSeed = aSeed;
      gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed * 0.75) * (5.0 / max(0.1, -mv.z));
    }
  `,
  abyss: /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    attribute float aSeed;
    varying float vTw;
    varying float vSeed;
    void main() {
      vec3 p = position;
      float rise = uTime * (0.22 + aSeed * 0.4);
      p.y = mod(p.y + 11.0 + rise, 22.0) - 11.0;
      p.x += sin(uTime * 0.4 + aSeed * 20.0 + p.y * 0.35) * 0.35;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float depthFade = smoothstep(-11.0, -6.0, p.y) * smoothstep(11.0, 6.5, p.y);
      vTw = (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 50.0))) * depthFade;
      vSeed = aSeed;
      gl_PointSize = uSize * uPixelRatio * (0.3 + aSeed * aSeed * 1.1) * (5.0 / max(0.1, -mv.z));
    }
  `,
  sunrise: /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    attribute float aSeed;
    varying float vTw;
    varying float vSeed;
    void main() {
      vec3 p = position;
      float rise = uTime * (0.3 + aSeed * 0.5);
      p.y = mod(p.y + 11.0 + rise, 22.0) - 11.0;
      p.x += sin(uTime * 0.3 + aSeed * 26.0) * (0.3 + aSeed * 0.4);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float low = smoothstep(-11.0, -4.0, p.y);
      float high = smoothstep(11.0, 3.0, p.y);
      vTw = (0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0))) * low * high;
      vSeed = aSeed;
      gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed * 0.85) * (5.0 / max(0.1, -mv.z));
    }
  `,
};

const POINTS_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vTw;
  varying float vSeed;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float isStar = step(0.78, vSeed);
    float soft = smoothstep(0.5, 0.06, d);
    soft *= soft;
    float core = smoothstep(0.2, 0.02, d);
    float a = mix(soft, core, isStar);
    vec3 mote = mix(uColorA, uColorB, vTw * 0.85);
    vec3 starCol = mix(uColorB, vec3(1.0, 0.97, 0.88), 0.7);
    vec3 col = mix(mote, starCol, isStar);
    gl_FragColor = vec4(col, a * vTw * uOpacity * mix(1.0, 1.3, isStar));
  }
`;

const COUNT: Record<SectionVariant, number> = {
  shimmer: 380,
  descent: 750,
  abyss: 650,
  sunrise: 560,
};

const POINT_SIZE: Record<SectionVariant, number> = {
  shimmer: 4.0,
  descent: 5.0,
  abyss: 5.6,
  sunrise: 5.0,
};

const OPACITY: Record<SectionVariant, number> = {
  shimmer: 0.62,
  descent: 0.55,
  abyss: 0.7,
  sunrise: 0.62,
};

const FEATHER_MASK: Record<string, string> = {
  top: "linear-gradient(180deg, transparent 0%, black 14%)",
  bottom: "linear-gradient(180deg, black 86%, transparent 100%)",
  both: "linear-gradient(180deg, transparent 0%, black 12%, black 86%, transparent 100%)",
};

/** Hardcoded Mage palette per theme — mirrors MageFinField.
 *  (THREE.Color cannot parse the oklch() tokens from getComputedStyle.) */
const PALETTE = {
  light: { primary: "#2eb45c", accent: "#c98a00" },
  dark: { primary: "#2fd06f", accent: "#ffd000" },
} as const;

function themeColors(): { primary: string; accent: string } {
  return document.documentElement.getAttribute("data-theme") === "custom-dark"
    ? { ...PALETTE.dark }
    : { ...PALETTE.light };
}

export function SectionScene({
  variant,
  className = "",
  feather,
}: {
  variant: SectionVariant;
  className?: string;
  /** feather the canvas edges so sections melt into each other */
  feather?: "top" | "bottom" | "both";
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      canvas.remove();
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.z = 7;

    const startColors = themeColors();
    const targets = {
      primary: new THREE.Color(startColors.primary),
      accent: new THREE.Color(startColors.accent),
    };

    const shared = {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const bgUniforms = {
      ...shared,
      uPrimary: { value: new THREE.Color(startColors.primary) },
      uAccent: { value: new THREE.Color(startColors.accent) },
    };
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: BG_VERTEX,
      fragmentShader: BG_FRAGMENTS[variant],
      uniforms: bgUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
    bg.frustumCulled = false;
    bg.renderOrder = -10;
    scene.add(bg);

    // Particle spread adapts to wide vs. tall sections.
    const count = window.innerWidth < 768 ? Math.floor(COUNT[variant] * 0.6) : COUNT[variant];
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const wide = variant === "shimmer";
    for (let i = 0; i < count; i++) {
      const rad = 2 + Math.pow(Math.random(), 1.4) * 8;
      const th = Math.random() * Math.PI * 2;
      pos[i * 3] = wide
        ? (Math.random() - 0.5) * 16
        : Math.cos(th) * rad;
      pos[i * 3 + 1] = wide
        ? (Math.random() - 0.5) * 5
        : Math.sin(th) * rad * 0.75;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      seed[i] = Math.random();
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pointsGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const pointsUniforms = {
      uTime: shared.uTime,
      uMouse: shared.uMouse,
      uSize: { value: POINT_SIZE[variant] },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      uColorA: { value: new THREE.Color(startColors.primary) },
      uColorB: { value: new THREE.Color(startColors.accent) },
      uOpacity: { value: OPACITY[variant] },
    };
    const pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERTEX[variant],
      fragmentShader: POINTS_FRAGMENT,
      uniforms: pointsUniforms,
      transparent: true,
      depthWrite: false,
      blending:
        variant === "abyss" ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    points.frustumCulled = false;
    points.renderOrder = -9;
    scene.add(points);

    const observer = new MutationObserver(() => {
      const c = themeColors();
      targets.primary.set(c.primary);
      targets.accent.set(c.accent);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mouse = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const layout = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      shared.uAspect.value = w / h;
      pointsUniforms.uPixelRatio.value = Math.min(
        window.devicePixelRatio,
        1.5,
      );
    };
    layout();
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(host);

    const t0 = performance.now();
    let raf = 0;
    let visible = true;
    const render = (t: number) => {
      shared.uTime.value = t;
      bgUniforms.uPrimary.value.lerp(targets.primary, 0.06);
      bgUniforms.uAccent.value.lerp(targets.accent, 0.06);
      pointsUniforms.uColorA.value.lerp(targets.primary, 0.06);
      pointsUniforms.uColorB.value.lerp(targets.accent, 0.06);
      shared.uMouse.value.lerp(
        new THREE.Vector2(mouse.x, mouse.y),
        0.05,
      );
      renderer.render(scene, camera);
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      render((performance.now() - t0) / 1000);
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (reduced) {
          if (visible) render(14);
          return;
        }
        if (visible && !raf) tick();
        else if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.02 },
    );
    io.observe(host);

    if (reduced) {
      render(14);
    } else {
      tick();
    }
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (visible && !raf && !reduced) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      if (raf) cancelAnimationFrame(raf);
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      bg.geometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [variant]);

  const featherStyle: CSSProperties | undefined = feather
    ? {
        maskImage: FEATHER_MASK[feather],
        WebkitMaskImage: FEATHER_MASK[feather],
      }
    : undefined;

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={featherStyle}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
}
