import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import magefinUrl from "../assets/magefin.svg";
import { cn } from "../lib/utils";
import { PALETTE, SCROLL_GOLD, SCROLL_MID, clamp01, currentTheme } from "./pool/palette";
import {
  CAUSTIC_FRAGMENT,
  CAUSTIC_VERTEX,
  DUST_FRAGMENT,
  DUST_VERTEX,
  RIPPLE_LIFE,
  RIPPLE_SLOTS,
} from "./pool/shaders";

const DUST_COUNT = 2600;
const DUST_TOTAL = DUST_COUNT;

/** Event the Mage layer dispatches when it blinks in/out, so the pool rings. */
export const MAGE_RIPPLE_EVENT = "mage-ripple";

export type MageRippleDetail = { x: number; y: number; s: number };

/**
 * Water only: caustics + dust + ripples + palette.
 * Own fixed canvas (z-0). Edit pool colors here — the Mage lives elsewhere.
 */
export function MagePoolBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      return;
    }

    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.z = 7;

    const t0 = performance.now();
    const elapsed = () => (performance.now() - t0) / 1000;

    const shared = {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uRipples: {
        value: Array.from(
          { length: RIPPLE_SLOTS },
          () => new THREE.Vector4(0, 0, -100, 0),
        ),
      },
    };

    const pal = PALETTE[currentTheme()];
    const causticsUniforms = {
      ...shared,
      uMouse: { value: new THREE.Vector2() },
      uBgTop: { value: new THREE.Color(pal.bgTop) },
      uBgBottom: { value: new THREE.Color(pal.bgBottom) },
      uGlow: { value: new THREE.Color(pal.glow) },
      uStrength: { value: pal.strength },
      uVeins: { value: pal.veins ? 1 : 0 },
      uDensity: { value: pal.causticDensity },
      uSharp: { value: pal.causticSharp },
      uWash: { value: pal.wash },
    };
    const causticsMaterial = new THREE.ShaderMaterial({
      vertexShader: CAUSTIC_VERTEX,
      fragmentShader: CAUSTIC_FRAGMENT,
      uniforms: causticsUniforms,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const causticsGeometry = new THREE.PlaneGeometry(2, 2);
    const caustics = new THREE.Mesh(causticsGeometry, causticsMaterial);
    caustics.frustumCulled = false;
    caustics.renderOrder = -10;
    scene.add(caustics);

    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
      uniforms: {
        uTime: shared.uTime,
        uFade: { value: 1 },
        uColorA: { value: new THREE.Color(pal.a) },
        uSize: { value: 4 },
      },
      transparent: true,
      depthWrite: false,
      blending: pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const dustGeometry = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(DUST_TOTAL * 3);
      const seed = new Float32Array(DUST_TOTAL);
      for (let i = 0; i < DUST_TOTAL; i++) {
        const rad = 2.5 + Math.pow(Math.random(), 1.5) * 9;
        const th = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(th) * rad;
        pos[i * 3 + 1] = Math.sin(th) * rad * 0.8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        seed[i] = Math.random();
      }
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    }
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    dust.frustumCulled = false;
    scene.add(dust);

    const targets: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      a: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(pal.bgTop),
      bgBottom: new THREE.Color(pal.bgBottom),
      glow: new THREE.Color(pal.glow),
      a: new THREE.Color(pal.a),
      strength: pal.strength,
      wash: pal.wash,
    };
    // ── scroll-driven recolor: green -> pale bridge -> yellow -> green ──
    // Short pause, pattern never dissolves: MID keeps veins visible while
    // the hue blends green → pale lime → gold. Color morph, not opacity.
    let themeName = currentTheme();
    const base: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      a: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(PALETTE[themeName].bgTop),
      bgBottom: new THREE.Color(PALETTE[themeName].bgBottom),
      glow: new THREE.Color(PALETTE[themeName].glow),
      a: new THREE.Color(PALETTE[themeName].a),
      strength: PALETTE[themeName].strength,
      wash: PALETTE[themeName].wash,
    };
    const gold: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      a: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(SCROLL_GOLD[themeName].bgTop),
      bgBottom: new THREE.Color(SCROLL_GOLD[themeName].bgBottom),
      glow: new THREE.Color(SCROLL_GOLD[themeName].glow),
      a: new THREE.Color(SCROLL_GOLD[themeName].a),
      strength: SCROLL_GOLD[themeName].strength,
      wash: SCROLL_GOLD[themeName].wash,
    };
    const mid: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      a: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(SCROLL_MID[themeName].bgTop),
      bgBottom: new THREE.Color(SCROLL_MID[themeName].bgBottom),
      glow: new THREE.Color(SCROLL_MID[themeName].glow),
      a: new THREE.Color(SCROLL_MID[themeName].a),
      strength: SCROLL_MID[themeName].strength,
      wash: SCROLL_MID[themeName].wash,
    };
    let scrollTarget = 0;
    let scrollMix = 0;
    const readScrollTarget = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      const p = clamp01(window.scrollY / max);
      // hold green for the first/last 10% of the scroll, then ease the middle:
      // 0 at top, 1 mid-page, back to 0 at bottom.
      const q = clamp01((p - 0.1) / 0.8);
      return Math.sin(q * Math.PI);
    };
    const refreshThemeBases = () => {
      themeName = currentTheme();
      base.bgTop.set(PALETTE[themeName].bgTop);
      base.bgBottom.set(PALETTE[themeName].bgBottom);
      base.glow.set(PALETTE[themeName].glow);
      base.a.set(PALETTE[themeName].a);
      base.strength = PALETTE[themeName].strength;
      base.wash = PALETTE[themeName].wash;
      gold.bgTop.set(SCROLL_GOLD[themeName].bgTop);
      gold.bgBottom.set(SCROLL_GOLD[themeName].bgBottom);
      gold.glow.set(SCROLL_GOLD[themeName].glow);
      gold.a.set(SCROLL_GOLD[themeName].a);
      gold.strength = SCROLL_GOLD[themeName].strength;
      gold.wash = SCROLL_GOLD[themeName].wash;
      mid.bgTop.set(SCROLL_MID[themeName].bgTop);
      mid.bgBottom.set(SCROLL_MID[themeName].bgBottom);
      mid.glow.set(SCROLL_MID[themeName].glow);
      mid.a.set(SCROLL_MID[themeName].a);
      mid.strength = SCROLL_MID[themeName].strength;
      mid.wash = SCROLL_MID[themeName].wash;
      causticsUniforms.uVeins.value = PALETTE[themeName].veins ? 1 : 0;
      causticsUniforms.uDensity.value = PALETTE[themeName].causticDensity;
      causticsUniforms.uSharp.value = PALETTE[themeName].causticSharp;
      dustMaterial.blending = PALETTE[themeName].additive
        ? THREE.AdditiveBlending
        : THREE.NormalBlending;
      dustMaterial.needsUpdate = true;
    };
    const observer = new MutationObserver(() => {
      refreshThemeBases();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mouse = { x: 0, y: 0 };
    const mouseSmooth = new THREE.Vector2();
    const tmpVec = new THREE.Vector2();
    type Ripple = { x: number; y: number; t0: number; s: number };
    const ripples: Ripple[] = [];
    const pushRipple = (x: number, y: number, s: number) => {
      if (reduced) return;
      ripples.push({ x, y, t0: elapsed(), s });
      while (ripples.length > RIPPLE_SLOTS) ripples.shift();
    };
    const onPointer = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onPointerDown = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      pushRipple(x, y, 0.6);
    };
    const onMageRipple = (e: Event) => {
      const d = (e as CustomEvent<MageRippleDetail>).detail;
      if (d) pushRipple(d.x, d.y, d.s);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener(MAGE_RIPPLE_EVENT, onMageRipple);
    scrollTarget = readScrollTarget();
    scrollMix = scrollTarget;
    const onScroll = () => {
      scrollTarget = readScrollTarget();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      shared.uAspect.value = w / h;
      scrollTarget = readScrollTarget();
    };
    layout();
    window.addEventListener("resize", layout);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = reduced ? 14 : elapsed();
      shared.uTime.value = t;

      while (ripples.length && t - ripples[0].t0 > RIPPLE_LIFE) ripples.shift();
      const slots = shared.uRipples.value;
      for (let i = 0; i < RIPPLE_SLOTS; i++) {
        const rp = ripples[i];
        if (rp) slots[i].set(rp.x, rp.y, rp.t0, rp.s);
        else slots[i].set(0, 0, -100, 0);
      }

      // Slow trailing mix toward the scroll target, then rebuild the color
      // targets via base -> mid -> gold. First half fades green toward lime,
      // second half lime toward pure yellow, so mid-scroll is green mixed
      // with yellow, never muddy olive.
      if (!reduced) {
        scrollMix += (scrollTarget - scrollMix) * 0.035;
      } else {
        scrollMix = 0;
      }
      const m = clamp01(scrollMix);
      // Slow linear travel: first half green slowly dissolves toward white,
      // second half yellow slowly surfaces from white. No snapping.
      const k = m < 0.5 ? m * 2 : (m - 0.5) * 2;
      const from = m < 0.5 ? base : mid;
      const to = m < 0.5 ? mid : gold;
      targets.bgTop.copy(from.bgTop).lerp(to.bgTop, k);
      targets.bgBottom.copy(from.bgBottom).lerp(to.bgBottom, k);
      targets.glow.copy(from.glow).lerp(to.glow, k);
      targets.a.copy(from.a).lerp(to.a, k);
      targets.strength = from.strength + (to.strength - from.strength) * k;
      targets.wash = from.wash + (to.wash - from.wash) * k;

      causticsUniforms.uBgTop.value.lerp(targets.bgTop, 0.03);
      causticsUniforms.uBgBottom.value.lerp(targets.bgBottom, 0.03);
      causticsUniforms.uGlow.value.lerp(targets.glow, 0.03);
      causticsUniforms.uStrength.value +=
        (targets.strength - causticsUniforms.uStrength.value) * 0.03;
      causticsUniforms.uWash.value +=
        (targets.wash - causticsUniforms.uWash.value) * 0.03;
      (dustMaterial.uniforms.uColorA.value as THREE.Color).lerp(targets.a, 0.03);

      const mx = reduced ? 0 : mouse.x;
      const my = reduced ? 0 : mouse.y;
      mouseSmooth.lerp(tmpVec.set(mx, my), 0.06);
      causticsUniforms.uMouse.value.copy(mouseSmooth);

      renderer.render(scene, camera);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      disposed = true;
      void disposed;
      stop();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", layout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(MAGE_RIPPLE_EVENT, onMageRipple);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      causticsGeometry.dispose();
      causticsMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "mage-pool pointer-events-none fixed inset-0 z-0 size-full",
          failed && "hidden",
        )}
      />
      {failed && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-[14vh] z-0 flex justify-center"
        >
          <img
            src={magefinUrl}
            alt=""
            className="w-[62vw] max-w-md opacity-[0.16] dark:opacity-[0.14]"
          />
        </div>
      )}
    </>
  );
}
