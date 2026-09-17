import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import mageMainUrl from "../assets/mage-main.svg";
import { cn } from "../lib/utils";
import { MAGE_RELEASE_EVENT, type MageReleaseDetail } from "./MagePoolBackground";
import { MAGE_DOTS } from "./colors/mage-dots";
import { MAGE_ORB, MAGE_ORB_SCROLL } from "./colors/mage-orb";
import { clamp01, currentTheme, readPoolScroll, scrollTriad, smoothstep } from "./colors/theme";
import { BUBBLE_FRAGMENT, BUBBLE_VERTEX, FIGURE_FRAGMENT, FIGURE_VERTEX } from "./pool/shaders";

const FIGURE_HEIGHT = 3.3;
const FIGURE_MAX_POINTS = 18000;
/** how much larger the shield orb renders than the figure's silhouette radius */
const SHIELD_SCALE = 1.1;
/** the plasma glass ball, as a fraction of the orb plane's half-size */
const BALL = 0.9;
/** formed-ness at which an appearance releases a cosmic pulse (as the orb seals) */
const RELEASE_AT = 0.7;
/** formed-ness below which the Mage is re-armed for its next release */
const RELEASE_REARM = 0.32;
/** formed-ness at which the dot cloud has fully gathered into the plasma ball */
const GATHER_AT = 0.62;
/** formed-ness at which the gathered dots have fully become the plasma orb */
const CRYSTAL_TO = 0.9;
/** how visible the loose dot cloud is between stations */
const DRIFT_FADE = 0.7;
/** scroll speed (px/s) above which stations are skipped entirely */
const SKIP_SPEED = 2000;
/** seconds after load before the Mage begins to appear */
const APPEAR_DELAY = 0;
/** seconds the entrance fade takes once it begins */
const APPEAR_TIME = 0.9;
/** slower gather while the Mage makes its first entrance */
const ENTRANCE_FORM_RATE = 2;
/** gather rate for every later station appearance */
const FORM_RATE = 3;
/** seconds the orb takes to shatter into dots once the Mage starts dissolving */
const SHATTER_TIME = 0.7;
/** how hard the shattering dots are thrown outward before they settle */
const SHATTER_BURST = 1;
/** fraction of the shatter over which the orb fades away */
const SHATTER_ORB_FADE = 0.4;
/** formed-ness below which the cloud may swap to another figure's silhouette */
const FIGURE_SWAP_AT = 0.4;
/** viewport width below which the Mage is not drawn at all (Tailwind `md`) */
const MAGE_MIN_WIDTH = 768;

export type MageBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
/** a single value, or one per breakpoint with `base` as the mobile fallback */
export type Responsive<T> = T | ({ base: T } & Partial<Record<Exclude<MageBreakpoint, "base">, T>>);
export type MageAnchor = { x: number; y: number };
export type MageHold = { up: number; down: number };

/** Tailwind's default breakpoints, widest first so the first match wins */
const BREAKPOINTS: ReadonlyArray<{ at: number; key: Exclude<MageBreakpoint, "base"> }> = [
  { at: 1280, key: "xl" },
  { at: 1024, key: "lg" },
  { at: 768, key: "md" },
  { at: 640, key: "sm" },
];

/** resolve a per-breakpoint value against a viewport width */
function readResponsive<T>(value: Responsive<T>, width: number): T {
  if (typeof value !== "object" || value === null || !("base" in value)) {
    return value as T;
  }
  const map = value as { base: T } & Partial<Record<Exclude<MageBreakpoint, "base">, T>>;
  for (const { at, key } of BREAKPOINTS) {
    if (width >= at && map[key] !== undefined) return map[key] as T;
  }
  return map.base;
}

export type MageStation = {
  /** section the Mage appears in */
  ref: RefObject<HTMLElement | null>;
  /**
   * where the Mage sits on screen, as fractions of the viewport (x right,
   * y down). Provide one value for every size, or `base`/`sm`/`md`/`lg`/`xl`
   * for a layout that changes between phones, tablets, and desktop.
   */
  at: Responsive<MageAnchor>;
  scale: Responsive<number>;
  /**
   * how long the Mage holds before dissolving, in screen heights of scroll.
   * `up` is the distance above the gather point, `down` below it.
   */
  hold: Responsive<MageHold>;
  /**
   * image whose silhouette forms this appearance. Defaults to the main mage,
   * so a station only needs to set it to show a different figure.
   */
  figure?: string;
};

type ResolvedStation = {
  at: MageAnchor;
  scale: number;
  hold: MageHold;
  figure?: string;
};

type FigureSample = {
  /** the figure's alpha mask, composited behind the plasma orb */
  texture: THREE.CanvasTexture;
  w: number;
  h: number;
  /** silhouette radius in world units — sizes both the orb and the dot ball */
  radius: number;
  /** the silhouette's centre, in the mask's flipped texture space */
  center: THREE.Vector2;
};

async function sampleFigure(src: string): Promise<FigureSample | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const iw = img.naturalWidth || 1024;
    const ih = img.naturalHeight || 872;
    const w = 400;
    const h = Math.max(1, Math.round((ih / iw) * w));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const scale = FIGURE_HEIGHT / h;
    let count = 0;
    let minX = w;
    let maxX = -1;
    let minY = h;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 140) continue;
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (count < 400) return null;
    // centre the orb on the silhouette itself, not the SVG canvas, so the Mage
    // sits dead-centre in its plasma ball
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    let radius = FIGURE_HEIGHT * 0.5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 140) continue;
        const r = Math.hypot((x - cx) * scale, (cy - y) * scale);
        if (r > radius) radius = r;
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // CanvasTexture flips vertically, so the mask's v axis runs bottom-up
    const center = new THREE.Vector2(cx / w, 1 - cy / h);
    return { texture, w, h, radius, center };
  } catch {
    return null;
  }
}

/**
 * Mage only: figure dots + station blink. Transparent canvas above the pool.
 *
 * Colors live in `./colors`:
 * - dot cloud -> `MAGE_DOTS`
 * - plasma orb shell -> `MAGE_ORB`
 * - orb green -> yellow scroll walk -> `MAGE_ORB_SCROLL`
 */
export function MageFigureLayer({ stations }: { stations?: MageStation[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stationsRef = useRef(stations);
  stationsRef.current = stations;

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
      return;
    }
    renderer.setClearColor(0x000000, 0);

    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.z = 7;
    const mage = new THREE.Group();
    scene.add(mage);

    const dots = MAGE_DOTS[currentTheme()];
    const orb = MAGE_ORB[currentTheme()];
    const ball = MAGE_ORB_SCROLL[currentTheme()];
    const figureUniforms = {
      uMorph: { value: 0 },
      uSize: { value: 7 },
      uFade: { value: 0 },
      uBurst: { value: 0 },
      uGrow: { value: 0 },
      uCast: { value: 0 },
      uIgnite: { value: 0 },
      uStir: { value: 0 },
      uFlow: { value: 0 },
      uTime: { value: 0 },
      uDensity: { value: 1 },
      uIntensity: { value: dots.intensity },
      uColorA: { value: new THREE.Color(dots.primary) },
      uColorB: { value: new THREE.Color(dots.accent) },
      uColorC: { value: new THREE.Color(dots.highlight) },
      // the orb's current hue, so a yellow ball can be born from yellow dots
      uBallA: { value: new THREE.Color(ball.green.main) },
      uBallB: { value: new THREE.Color(ball.green.accent) },
      uBallC: { value: new THREE.Color(ball.green.highlight) },
      uBallMix: { value: 0 },
    };
    const figureMaterial = new THREE.ShaderMaterial({
      vertexShader: FIGURE_VERTEX,
      fragmentShader: FIGURE_FRAGMENT,
      uniforms: figureUniforms,
      transparent: true,
      depthWrite: false,
      blending: dots.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    // the plasma orb: a single opaque ball. The Mage's silhouette is composited
    // *behind* it right in the shader, so the plasma always reads on top. Its
    // dominant colour walks green -> yellow with the mana pool (see MAGE_ORB_SCROLL),
    // so the ball matches the water it swims in.
    const bubbleUniforms = {
      uColor: { value: new THREE.Color(ball.green.main) },
      uColorB: { value: new THREE.Color(ball.green.accent) },
      uColorC: { value: new THREE.Color(ball.green.highlight) },
      uMap: { value: null as THREE.Texture | null },
      uMapScale: { value: new THREE.Vector2(1, 1) },
      uMapCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uGlass: { value: new THREE.Color(orb.glass) },
      uInk: { value: new THREE.Color(orb.ink) },
      uInkAmount: { value: orb.inkAmount },
      uVeil: { value: orb.veil },
    };
    const bubbleMaterial = new THREE.ShaderMaterial({
      vertexShader: BUBBLE_VERTEX,
      fragmentShader: BUBBLE_FRAGMENT,
      uniforms: bubbleUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      // the orb is an opaque little world, so it always blends normally and
      // occludes the water behind it (additive would let the pool show through)
      blending: THREE.NormalBlending,
    });

    /**
     * Every distinct silhouette ever shown gets its own dot cloud and plasma orb,
     * sharing one set of materials. Only the active station's group is visible,
     * so `.figure` on a station swaps the Mage.
     */
    type FigureEntry = {
      group: THREE.Group;
      texture: THREE.CanvasTexture;
      /** figure silhouette radius, so a release can launch off the orb rim */
      radius: number;
      /** the orb plane, scaled at runtime so the bubble can grow out of the point */
      bubble: THREE.Mesh;
      /** the orb's full-size scale, multiplied by the bloom factor each frame */
      bubbleScale: number;
      /** maps the orb's local uv onto the figure mask */
      mapScale: THREE.Vector2;
      /** the figure mask's centre, aligned with the orb's centre */
      mapCenter: THREE.Vector2;
    };
    const figures = new Map<string, FigureEntry>();
    const figureLoads = new Map<string, Promise<void>>();
    let activeFigure = mageMainUrl;
    /** whether the Mage is drawn at the current viewport width */
    let mageEnabled = window.innerWidth >= MAGE_MIN_WIDTH;

    /** build one figure's dot cloud, bubble, solid Mage, and flames as a group */
    const buildFigure = (sample: FigureSample): FigureEntry => {
      const { texture, w, h, radius } = sample;
      const scale = FIGURE_HEIGHT / h;
      const n = FIGURE_MAX_POINTS;
      const pos = new Float32Array(n * 3);
      const chaos = new Float32Array(n * 3);
      const seeds = new Float32Array(n);
      const tints = new Float32Array(n);
      const gates = new Float32Array(n);
      // the dots assemble into the whole spherical orb, not the Mage's outline:
      // an even golden-angle shell, jittered into a swarm and flattened slightly
      // in depth so it sits with the plasma plane
      const ball = radius * SHIELD_SCALE * BALL;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
        const theta = golden * i + (Math.random() - 0.5) * 0.7;
        const rr = ball * (0.82 + Math.random() * 0.18);
        const sp = Math.sin(phi);
        pos[i * 3] = rr * sp * Math.cos(theta);
        pos[i * 3 + 1] = rr * Math.cos(phi);
        pos[i * 3 + 2] = rr * sp * Math.sin(theta) * 0.6;
        const rad = Math.pow(Math.random(), 0.55) * 5.1;
        const th = Math.random() * Math.PI * 2;
        chaos[i * 3] = Math.cos(th) * rad;
        chaos[i * 3 + 1] = Math.sin(th) * rad * 0.75;
        chaos[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
        seeds[i] = Math.random();
        tints[i] = Math.pow(Math.random(), 1.4);
        gates[i] = Math.random();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute("aChaos", new THREE.BufferAttribute(chaos, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));
      geometry.setAttribute("aGate", new THREE.BufferAttribute(gates, 1));
      const figure = new THREE.Points(geometry, figureMaterial);
      figure.frustumCulled = false;
      // the plasma orb paints after the dots, so it always reads in front
      figure.renderOrder = 1;
      const group = new THREE.Group();
      group.add(figure);

      const bubbleGeometry = new THREE.PlaneGeometry(2, 2);
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      const bubbleScale = radius * SHIELD_SCALE;
      bubble.scale.setScalar(bubbleScale);
      bubble.renderOrder = 2;
      group.add(bubble);

      // map the orb's local uv onto the figure mask: the orb plane half-size is
      // radius*SHIELD_SCALE, the mask spans w*scale by h*scale
      const mapScale = new THREE.Vector2(
        (radius * SHIELD_SCALE) / (w * scale),
        (radius * SHIELD_SCALE) / (h * scale),
      );

      group.visible = false;
      mage.add(group);
      return { group, texture, radius, bubble, bubbleScale, mapScale, mapCenter: sample.center };
    };

    const applyFigureVisibility = () => {
      for (const [src, entry] of figures) entry.group.visible = src === activeFigure;
    };

    const activateEntry = (entry: FigureEntry) => {
      bubbleUniforms.uMap.value = entry.texture;
      bubbleUniforms.uMapScale.value.copy(entry.mapScale);
      bubbleUniforms.uMapCenter.value.copy(entry.mapCenter);
    };

    const ensureFigure = (src: string) => {
      if (figures.has(src) || figureLoads.has(src)) return;
      const load = sampleFigure(src).then((sample) => {
        if (disposed || !sample) return;
        const entry = buildFigure(sample);
        figures.set(src, entry);
        applyFigureVisibility();
        if (src === activeFigure) activateEntry(entry);
      });
      figureLoads.set(src, load);
    };

    const setActiveFigure = (src: string) => {
      if (src === activeFigure) return;
      activeFigure = src;
      ensureFigure(src);
      applyFigureVisibility();
      const entry = figures.get(src);
      if (entry) activateEntry(entry);
    };

    ensureFigure(activeFigure);
    // warm every station's silhouette up front so a swap never waits on a load
    for (const s of stationsRef.current ?? []) {
      if (s.figure) ensureFigure(s.figure);
    }

    const targets = {
      a: new THREE.Color(dots.primary),
      b: new THREE.Color(dots.accent),
      c: new THREE.Color(dots.highlight),
    };
    // orb palette: green -> mid -> yellow walks with the pool scroll. Each stop
    // carries its own main/accent/highlight, so the plasma is always one hue:
    // green ball = green+black, yellow ball = yellow+black.
    type BallStop = { main: THREE.Color; accent: THREE.Color; highlight: THREE.Color };
    const toBallStop = (s: { main: string; accent: string; highlight: string }): BallStop => ({
      main: new THREE.Color(s.main),
      accent: new THREE.Color(s.accent),
      highlight: new THREE.Color(s.highlight),
    });
    const ballStops: Record<"green" | "mid" | "yellow", BallStop> = {
      green: toBallStop(ball.green),
      mid: toBallStop(ball.mid),
      yellow: toBallStop(ball.yellow),
    };
    const observer = new MutationObserver(() => {
      const p = MAGE_DOTS[currentTheme()];
      const o = MAGE_ORB[currentTheme()];
      const b = MAGE_ORB_SCROLL[currentTheme()];
      targets.a.set(p.primary);
      targets.b.set(p.accent);
      targets.c.set(p.highlight);
      bubbleUniforms.uGlass.value.set(o.glass);
      bubbleUniforms.uInk.value.set(o.ink);
      bubbleUniforms.uInkAmount.value = o.inkAmount;
      bubbleUniforms.uVeil.value = o.veil;
      figureUniforms.uIntensity.value = p.intensity;
      figureMaterial.blending = p.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      figureMaterial.needsUpdate = true;
      for (const key of ["green", "mid", "yellow"] as const) {
        ballStops[key].main.set(b[key].main);
        ballStops[key].accent.set(b[key].accent);
        ballStops[key].highlight.set(b[key].highlight);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let baseScale = 1;
    let pointSize = 5;
    /** current station config picked for the live breakpoint */
    let resolved: ResolvedStation[] = [];
    const resolveStations = () => {
      const w = window.innerWidth;
      resolved = (stationsRef.current ?? []).map((s) => ({
        at: readResponsive(s.at, w),
        scale: readResponsive(s.scale, w),
        hold: readResponsive(s.hold, w),
        figure: s.figure,
      }));
    };
    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // capped below device ratio on purpose: soft dots hide the difference,
      // but full-ratio fill-rate is what made the canvas trail the scroll
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w >= 1024;
      baseScale = wide ? 1.35 : 0.85;
      // same cloud on every device; small screens just get finer dots
      pointSize = wide ? 5 : 3.4;
      mageEnabled = w >= MAGE_MIN_WIDTH;
      resolveStations();
    };
    layout();

    const planeSize = () => {
      const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      return { w: h * camera.aspect, h };
    };
    const worldOf = (sx: number, sy: number, out: THREE.Vector3) => {
      const { w, h } = planeSize();
      return out.set((sx / window.innerWidth - 0.5) * w, (0.5 - sy / window.innerHeight) * h, 0);
    };
    /**
     * Tell the pool to burn a cosmic void open around the Mage's current
     * screen spot. The Mage itself barely moves — the water is what releases.
     */
    const emitRelease = (strength: number) => {
      const { w: pw, h: ph } = planeSize();
      const radius = figures.get(activeFigure)?.radius ?? FIGURE_HEIGHT * 0.5;
      window.dispatchEvent(
        new CustomEvent<MageReleaseDetail>(MAGE_RELEASE_EVENT, {
          detail: {
            x: (mage.position.x / pw) * 2,
            y: (mage.position.y / ph) * 2,
            // the shock launches off the orb's glass rim, so the ball reads
            // as the source rather than the figure's own contour
            r: ((radius * curScale) / ph) * SHIELD_SCALE * BALL,
            s: strength,
          },
        }),
      );
    };
    /** hold distances above/below the gather point, in px */
    const holdBoundsFor = (i: number) => {
      const hold = resolved[i]?.hold;
      const vh = window.innerHeight;
      if (!hold) return { up: 0, down: 0 };
      return { up: hold.up * vh, down: hold.down * vh };
    };
    /** total hold span (px) — caps a home and scales the gather/scatter edge */
    const allowanceFor = (i: number) => {
      const b = holdBoundsFor(i);
      return b.up + b.down;
    };

    // ── scroll-indexed choreography ─────────────────────────────────────
    // The canvas is viewport-fixed, so the Mage's whole life is a pure
    // function of scrollY. Precompute that function once per layout as a
    // segment list: HOME (gathered at a fixed anchor) and TRAVEL (scattered
    // cloud gliding to the next anchor). The runtime only samples it — no
    // phase machine, and one sampled position can never render twice.
    type Segment = {
      kind: "home" | "travel" | "hold";
      start: number;
      end: number;
      i?: number;
      from?: number;
      to?: number;
      /** morph to hold on a `hold` segment (0 = cloud, 1 = formed) */
      morph?: number;
      /** gather/scatter ramp length in px */
      edge?: number;
      /** first home is already present on load, so it never ramps in */
      formedOnLoad?: boolean;
    };

    /** gather/scatter ramp length, as a fraction of the viewport height */
    const EDGE = 0.28;
    /** minimum scroll gap between homes, so travel reads as a journey */
    const MIN_TRAVEL = 0.4;
    /** a station squeezed shorter than this is skipped entirely */
    const MIN_HOME = 0.1;

    let segments: Segment[] = [];
    let anchors: THREE.Vector3[] = [];

    /** bake the whole page: when/where the Mage shows, moves, and how far */
    const buildTimeline = () => {
      const list = stationsRef.current ?? [];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;
      anchors = [];
      const homes: { start: number; end: number; i: number }[] = [];

      for (let i = 0; i < list.length; i++) {
        const el = list[i].ref.current;
        const station = resolved[i];
        if (!el || !station) continue;
        const at = station.at;
        const r = el.getBoundingClientRect();
        const top = r.top + scrollTop;
        const mx = vw * 0.05;
        const axPx = Math.min(Math.max(vw * at.x, mx), vw - mx);
        const ayPx = Math.min(Math.max(vh * at.y, vh * 0.3), vh - vh * 0.32);
        const anchor = new THREE.Vector3();
        worldOf(axPx, ayPx, anchor);
        anchors[i] = anchor;

        // scroll that brings the section's center to the viewport's center
        const center = top + r.height / 2 - vh / 2;

        const bounds = holdBoundsFor(i);
        homes.push({
          start: center - bounds.up,
          end: center + bounds.down,
          i,
        });
      }

      const built: Segment[] = [];
      let prevEnd: number | null = null;
      let prevIdx = -1;
      for (const h of homes) {
        let start = h.start;
        if (prevEnd !== null) start = Math.max(start, prevEnd + MIN_TRAVEL * vh);
        let end = Math.min(h.end, start + allowanceFor(h.i));
        const first = built.length === 0;
        const edge = Math.min(EDGE * vh, allowanceFor(h.i) * 0.4);
        // the very first home is present on load — keep it formed at sy 0
        if (first) end = Math.max(end, edge);
        if (end - start < MIN_HOME * vh) continue; // squeezed out → skip
        if (prevEnd !== null && prevIdx >= 0) {
          built.push({
            kind: "travel",
            start: prevEnd,
            end: start,
            from: prevIdx,
            to: h.i,
          });
        }
        built.push({
          kind: "home",
          start,
          end,
          i: h.i,
          edge,
          formedOnLoad: first,
        });
        prevEnd = end;
        prevIdx = h.i;
      }

      if (built.length > 0) {
        // before the first home: the figure is already present on load
        if (built[0].start > 0) {
          built.unshift({
            kind: "hold",
            start: Number.NEGATIVE_INFINITY,
            end: built[0].start,
            i: built[0].i,
            morph: 1,
          });
        }
        // after the last home: scatter to a cloud and linger there
        built.push({
          kind: "hold",
          start: prevEnd ?? 0,
          end: Number.POSITIVE_INFINITY,
          i: prevIdx,
          morph: 0,
        });
      }
      segments = built;
    };

    const tmpA = new THREE.Vector3();
    const target = new THREE.Vector3();
    /** whether the Mage should be whole right now (scroll only starts/stops it) */
    let targetFormed = false;
    let targetStation = -1;

    /** sample the baked timeline at a scroll position */
    const sample = (sy: number) => {
      if (segments.length === 0) {
        targetFormed = false;
        targetStation = -1;
        return;
      }
      let seg = segments[segments.length - 1];
      for (let i = 0; i < segments.length; i++) {
        if (sy < segments[i].end) {
          seg = segments[i];
          break;
        }
      }
      if (seg.kind === "home") {
        const a = anchors[seg.i as number];
        if (a) target.copy(a);
        // entering a station is the trigger; the gather itself is time-driven
        targetFormed = true;
        targetStation = seg.i as number;
      } else if (seg.kind === "travel") {
        const a = anchors[seg.from as number] ?? target;
        const b = anchors[seg.to as number] ?? target;
        const t = clamp01((sy - seg.start) / Math.max(1, seg.end - seg.start));
        const e = t * t * (3 - 2 * t);
        tmpA.copy(a);
        target.copy(tmpA).lerp(b, e);
        targetFormed = false;
        targetStation = seg.to as number;
      } else {
        const a = anchors[seg.i as number];
        if (a) target.copy(a);
        targetFormed = (seg.morph ?? 0) > 0.5;
        targetStation = (seg.i as number) ?? -1;
      }
    };

    let formation = 0;
    let curScale = baseScale;
    let seeded = false;
    const pos = new THREE.Vector3();
    let lastScrollY = window.scrollY;
    /** smoothed scroll speed (px/s) — fast flicks skip stations */
    let scrollSpeed = 0;
    /** pool scroll recolour target/mix, so the orb tracks the water's hue */
    let poolScrollTarget = readPoolScroll();
    let poolScrollMix = poolScrollTarget;
    /** true once the Mage has settled enough to release its next appearance pulse */
    let releaseArmed = true;
    /** whether the orb was up last frame, so a dissolve can trigger one shatter */
    let wasFormed = false;
    /** seconds elapsed in the current orb->dots shatter, or -1 when idle */
    let shatter = -1;

    let last = performance.now();
    const born = last;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // hold the Mage back on load, then ease it in over APPEAR_TIME
      const age = (now - born) / 1000;
      const entrance = reduced ? 1 : clamp01((age - APPEAR_DELAY) / APPEAR_TIME);

      const sy = window.scrollY;
      const delta = sy - lastScrollY;
      lastScrollY = sy;
      scrollSpeed += (Math.abs(delta) / Math.max(dt, 1e-3) - scrollSpeed) * (1 - Math.exp(-dt * 6));
      const fast = !reduced && scrollSpeed > SKIP_SPEED;

      if (!mageEnabled || segments.length === 0) {
        mage.visible = false;
        renderer.render(scene, camera);
        return;
      }

      sample(sy);
      const station = targetStation >= 0 ? resolved[targetStation] : undefined;
      // every appearance and dissolve plays with its own station's silhouette.
      // The swap is driven by the animation, never by how far the page has
      // scrolled: hold the current SVG through its shatter, then switch the
      // moment the cloud has scattered (invisible, since it is already loose).
      const desiredFigure = station?.figure ?? mageMainUrl;
      if (
        (reduced || (shatter < 0 && formation < FIGURE_SWAP_AT)) &&
        desiredFigure !== activeFigure
      ) {
        setActiveFigure(desiredFigure);
      }
      // if the next station asks for a different figure, keep the cloud loose
      // until the swap above actually happened — so a short scroll can never
      // gather the new station with the previous set's image still loaded
      const figureReady = desiredFigure === activeFigure;
      const targetScale = baseScale * (station ? station.scale : 1);
      // first frame: snap position so a reload never slides the Mage in from
      // the world origin, but let formation gather for the entrance
      if (!seeded) {
        seeded = true;
        pos.copy(target);
        formation = reduced ? (targetFormed ? 1 : 0) : 0;
        curScale = targetScale;
      }
      // scroll only decides *whether* the Mage is gathering or scattering; the
      // gather itself runs on time, so once a station starts it the ball always
      // finishes forming and bursts without waiting for more scroll
      const wantForm = (targetFormed && figureReady ? 1 : 0) * entrance;

      if (reduced) {
        pos.copy(target);
        formation = targetFormed ? 1 : 0;
      } else {
        // scattered cloud glides (low rate) so jumpy scroll reads as flow,
        // while a forming Mage locks onto its anchor quickly
        const posRate = fast ? 10 : 3 + formation * 9;
        pos.lerp(target, 1 - Math.exp(-dt * posRate));
        // only a genuine flick accelerates the gather/scatter. Ordinary
        // scrolling always gets the calm rate, so a smaller Mage down the page
        // visibly assembles instead of popping in the moment its station starts.
        const flick = smoothstep(SKIP_SPEED, SKIP_SPEED * 2, scrollSpeed);
        const speedBoost = 1 + flick * 5;
        const formRate = (entrance < 1 ? ENTRANCE_FORM_RATE : FORM_RATE) * speedBoost;
        formation += (wantForm - formation) * (1 - Math.exp(-dt * formRate));
        formation = clamp01(formation);
      }

      const fade = entrance * (DRIFT_FADE + (1 - DRIFT_FADE) * formation);
      // 0 = loose dot cloud, 1 = solid Mage sealed in the plasma orb. The dots
      // gather into the silhouette by GATHER_AT, then crystallise into the solid
      // shape as the orb assembles, so the Mage is never dots and shape at once.
      const crystal = clamp01((formation - GATHER_AT) / (CRYSTAL_TO - GATHER_AT));
      const crystalEase = crystal * crystal * (3 - 2 * crystal);

      // A fast flick can collapse `formation` in a single frame, which used to
      // snap the orb straight to dots. Give the dissolve its own one-shot clock
      // so the ball->dots burst always plays out at a readable speed.
      const formedNow = formation > CRYSTAL_TO;
      if (reduced) {
        shatter = -1;
      } else if (formedNow) {
        shatter = -1;
      } else if (shatter < 0 && wasFormed) {
        shatter = 0;
      }
      if (shatter >= 0 && (shatter += dt) >= SHATTER_TIME) shatter = -1;
      wasFormed = formedNow;
      // 0 at the instant the orb breaks, 1 once the dots have scattered
      const sv = shatter < 0 ? 1 : clamp01(shatter / SHATTER_TIME);

      // ambient drift only while the Mage is scattered; it is deliberately
      // faint so a formed Mage reads as a still anchor, not a swimming school
      const wander = reduced ? 0 : 1 - formation;
      const tsec = now / 1000;
      mage.position.set(
        pos.x + (Math.sin(tsec * 0.16) * 0.05 + Math.sin(tsec * 0.061 + 1.7) * 0.035) * wander,
        pos.y + (Math.cos(tsec * 0.11 + 0.4) * 0.04 + Math.sin(tsec * 0.047) * 0.028) * wander,
        pos.z,
      );
      mage.rotation.set(0, 0, 0);
      curScale += (targetScale - curScale) * (1 - Math.exp(-dt * 5));
      mage.scale.setScalar(curScale);

      // once per appearance: the Mage holds still while the water releases a
      // single cosmic pulse. No heartbeat — one burst, then quiet.
      if (!reduced && entrance >= 1) {
        if (formation > RELEASE_AT && releaseArmed) {
          releaseArmed = false;
          emitRelease(1);
        } else if (formation < RELEASE_REARM) {
          releaseArmed = true;
        }
      }
      // every device shows the full cloud: the orb is the same little world at
      // any size, and smaller screens just get smaller dots (see pointSize)
      figureUniforms.uDensity.value = 1;
      mage.visible = fade > 0.002;

      // dots assemble into the whole plasma ball before the orb takes over, so
      // the ball forms out of the swarm rather than a Mage drifting inside it.
      // While shattering they are driven by the shatter clock instead, so the
      // burst always walks the ball -> cloud path even if formation snapped.
      const formMorph = clamp01(formation / GATHER_AT);
      const shatterMorph = 1 - sv * sv * sv;
      figureUniforms.uMorph.value = shatter < 0 ? formMorph : Math.min(formMorph, shatterMorph);
      // the orb blooms out of the gathering point: the dots converge to a small
      // vertex while they gather, then the shell (and the bubble around it) grows
      // to full size as the Mage crystallises. A shatter holds the ball whole so
      // it bursts outward instead of imploding.
      const bloom = smoothstep(GATHER_AT, CRYSTAL_TO, formation);
      const grow = reduced
        ? formation >= GATHER_AT
          ? 1
          : 0.12
        : shatter < 0
          ? 0.12 + 0.88 * bloom
          : 1;
      figureUniforms.uGrow.value = grow;
      const activeEntry = figures.get(activeFigure);
      if (activeEntry) {
        activeEntry.bubble.scale.setScalar(Math.max(activeEntry.bubbleScale * grow, 0.0001));
      }
      // the dot ball burns off as the plasma orb and its Mage take over; during
      // a shatter the two cross-fade on the shatter clock instead
      const dotFade = shatter < 0 ? fade * (1 - crystalEase) : fade * clamp01(sv / SHATTER_ORB_FADE);
      figureUniforms.uFade.value = dotFade;
      // a quick outward punch that eases back to nothing, so the dots fly clear
      // of the orb and then settle into the drift cloud
      figureUniforms.uBurst.value =
        shatter < 0 ? 0 : Math.sin(Math.PI * Math.pow(sv, 0.6)) * SHATTER_BURST;
      // brief hot flash as the orb breaks, so the burst reads as an event
      figureUniforms.uCast.value =
        shatter < 0 ? 0 : Math.exp(-Math.pow((sv - 0.3) / 0.18, 2)) * 0.8;
      // matching flash as the swarm crystallises into the orb, so appearing is
      // as much an event as disappearing — peaks mid-gather and fades as the
      // ball locks in
      figureUniforms.uIgnite.value =
        shatter < 0 ? Math.sin(Math.PI * crystalEase) * 0.85 : 0;
      figureUniforms.uStir.value = 0;
      figureUniforms.uFlow.value = 0;
      figureUniforms.uTime.value = reduced ? 0 : now / 1000;
      figureUniforms.uSize.value = pointSize;
      figureUniforms.uColorA.value.lerp(targets.a, 0.05);
      figureUniforms.uColorB.value.lerp(targets.b, 0.05);
      figureUniforms.uColorC.value.lerp(targets.c, 0.05);

      // the plasma orb assembles in step with the crystallisation and holds only
      // once the Mage is whole. During a shatter it fades on its own clock so a
      // fast scroll can't pop it off in one frame. It stays fully opaque, so the
      // mana pool never shows through the glass.
      const orbFade =
        shatter < 0 ? crystalEase : 1 - clamp01(sv / SHATTER_ORB_FADE);
      bubbleUniforms.uOpacity.value = orbFade * entrance;
      bubbleUniforms.uTime.value = reduced ? 0 : now / 1000;
      // dominant walks green -> mid -> yellow -> mid -> green with the pool, so
      // the ball is green over green water and yellow over yellow water. Accent
      // and highlight ride along, keeping each phase a single hue on black. The
      // triad helper owns the routing shared with the pool's own recolor.
      if (!reduced) {
        poolScrollMix += (poolScrollTarget - poolScrollMix) * 0.035;
      } else {
        poolScrollMix = 0;
      }
      const psm = clamp01(poolScrollMix);
      const { from: pFrom, to: pTo, k: pk } = scrollTriad(
        psm,
        ballStops.green,
        ballStops.mid,
        ballStops.yellow,
      );
      bubbleUniforms.uColor.value.copy(pFrom.main).lerp(pTo.main, pk);
      bubbleUniforms.uColorB.value.copy(pFrom.accent).lerp(pTo.accent, pk);
      bubbleUniforms.uColorC.value.copy(pFrom.highlight).lerp(pTo.highlight, pk);
      // hand the orb's hue to the swarm: only on the yellow half of the scroll,
      // and only while the dots are still gathered at the centre (`bloom` 0),
      // so a yellow ball is born from yellow dots before it grows out
      figureUniforms.uBallA.value.copy(bubbleUniforms.uColor.value);
      figureUniforms.uBallB.value.copy(bubbleUniforms.uColorB.value);
      figureUniforms.uBallC.value.copy(bubbleUniforms.uColorC.value);
      figureUniforms.uBallMix.value = clamp01((psm - 0.5) * 2) * (1 - bloom);

      // always live — position comes straight from the scroll timeline while
      // the gather/scatter and plasma churn run on their own clocks
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

    // the timeline is geometry — rebuild it whenever the page reflows
    let rebuildRaf = 0;
    const scheduleRebuild = () => {
      if (rebuildRaf) return;
      rebuildRaf = requestAnimationFrame(() => {
        rebuildRaf = 0;
        buildTimeline();
      });
    };
    const onResize = () => {
      layout();
      buildTimeline();
      poolScrollTarget = readPoolScroll();
    };
    const onScroll = () => {
      poolScrollTarget = readPoolScroll();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", scheduleRebuild);
    const resizeObserver = new ResizeObserver(scheduleRebuild);
    for (const s of stationsRef.current ?? []) {
      if (s.ref.current) resizeObserver.observe(s.ref.current);
    }
    resizeObserver.observe(document.documentElement);
    void document.fonts?.ready.then(scheduleRebuild);

    buildTimeline();
    start();

    return () => {
      disposed = true;
      stop();
      if (rebuildRaf) cancelAnimationFrame(rebuildRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", scheduleRebuild);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      mage.traverse((obj) => {
        if (obj instanceof THREE.Points || obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      for (const entry of figures.values()) entry.texture.dispose();
      figureMaterial.dispose();
      bubbleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("mage-figure pointer-events-none fixed inset-0 z-[1] size-full")}
    />
  );
}
