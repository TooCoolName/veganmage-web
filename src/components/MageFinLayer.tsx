import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import magefinUrl from "../assets/magefin.svg";
import { cn } from "../lib/utils";
import { PALETTE, clamp01, currentTheme } from "./pool/palette";
import { FIN_FRAGMENT, FIN_VERTEX } from "./pool/shaders";

const FIN_HEIGHT = 3.3;
const FIN_MAX_POINTS = 18000;
/**
 * base fin height (scale × viewport height, in px) the full dot cloud is tuned
 * for — roughly a 1900×1300 desktop. Smaller renders thin the cloud
 * quadratically so dots-per-pixel (the density you actually see) stays even.
 */
const FIN_REFERENCE_PX = 1.35 * 1300;
/** how visible the loose dot cloud is between stations */
const DRIFT_FADE = 0.7;
/** scroll speed (px/s) above which stations are skipped entirely */
const SKIP_SPEED = 2000;
/** seconds after load before the Mage begins to appear */
const APPEAR_DELAY = 1;
/** seconds the entrance fade takes once it begins */
const APPEAR_TIME = 1.4;
/** slower gather while the Mage makes its first entrance */
const ENTRANCE_FORM_RATE = 2;
/** faster gather for every later station appearance */
const FORM_RATE = 5;

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
};

type ResolvedStation = {
  at: MageAnchor;
  scale: number;
  hold: MageHold;
};

type FinSample = {
  xy: Float32Array;
  w: number;
  h: number;
};

async function sampleFin(): Promise<FinSample | null> {
  try {
    const img = new Image();
    img.src = magefinUrl;
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
    const pts: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 140) {
          pts.push(x + Math.random(), y + Math.random());
        }
      }
    }
    if (pts.length < 400) return null;
    return { xy: new Float32Array(pts), w, h };
  } catch {
    return null;
  }
}

/**
 * Mage only: fin dots + station blink. Transparent canvas above the pool.
 * Edit Mage colors/behavior here — pool colors live in MagePoolBackground.
 */
export function MageFinLayer({ stations }: { stations?: MageStation[] }) {
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

    const pal = PALETTE[currentTheme()];
    const finUniforms = {
      uMorph: { value: 0 },
      uSize: { value: 7 },
      uFade: { value: 0 },
      uBurst: { value: 0 },
      uCast: { value: 0 },
      uStir: { value: 0 },
      uFlow: { value: 0 },
      uTime: { value: 0 },
      uDensity: { value: 1 },
      uIntensity: { value: pal.mageIntensity },
      uColorA: { value: new THREE.Color(pal.mageA) },
      uColorB: { value: new THREE.Color(pal.mageB) },
      uColorC: { value: new THREE.Color(pal.mageC) },
    };
    const finMaterial = new THREE.ShaderMaterial({
      vertexShader: FIN_VERTEX,
      fragmentShader: FIN_FRAGMENT,
      uniforms: finUniforms,
      transparent: true,
      depthWrite: false,
      blending: pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    void sampleFin().then((sample) => {
      if (disposed) return;
      if (!sample) return;
      const { xy, w, h } = sample;
      const raw = Math.floor(xy.length / 2);
      const stride = Math.max(1, Math.ceil(raw / FIN_MAX_POINTS));
      const n = Math.floor(raw / stride);
      const pos = new Float32Array(n * 3);
      const chaos = new Float32Array(n * 3);
      const seeds = new Float32Array(n);
      const tints = new Float32Array(n);
      const gates = new Float32Array(n);
      const scale = FIN_HEIGHT / h;
      for (let i = 0; i < n; i++) {
        const x = xy[i * stride * 2];
        const y = xy[i * stride * 2 + 1];
        pos[i * 3] = (x - w / 2) * scale;
        pos[i * 3 + 1] = (h / 2 - y) * scale;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
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
      const fin = new THREE.Points(geometry, finMaterial);
      fin.frustumCulled = false;
      fin.renderOrder = 1;
      mage.add(fin);
    });

    const targets = {
      a: new THREE.Color(pal.mageA),
      b: new THREE.Color(pal.mageB),
      c: new THREE.Color(pal.mageC),
    };
    const observer = new MutationObserver(() => {
      const p = PALETTE[currentTheme()];
      targets.a.set(p.mageA);
      targets.b.set(p.mageB);
      targets.c.set(p.mageC);
      finUniforms.uIntensity.value = p.mageIntensity;
      finMaterial.blending = p.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      finMaterial.needsUpdate = true;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let baseScale = 1;
    let pointSize = 6.5;
    /** current station config picked for the live breakpoint */
    let resolved: ResolvedStation[] = [];
    const resolveStations = () => {
      const w = window.innerWidth;
      resolved = (stationsRef.current ?? []).map((s) => ({
        at: readResponsive(s.at, w),
        scale: readResponsive(s.scale, w),
        hold: readResponsive(s.hold, w),
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
      pointSize = wide ? 6.5 : 5.5;
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
    let maxStationScale = 1;

    /** bake the whole page: when/where the Mage shows, moves, and how far */
    const buildTimeline = () => {
      const list = stationsRef.current ?? [];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;
      anchors = [];
      maxStationScale = 1;
      for (const s of resolved) maxStationScale = Math.max(maxStationScale, s.scale);
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
        // before the first home: the fin is already present on load
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
    let targetMorph = 0;
    let targetStation = -1;

    /** sample the baked timeline at a scroll position */
    const sample = (sy: number) => {
      if (segments.length === 0) {
        targetMorph = 0;
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
        const len = Math.max(1, seg.end - seg.start);
        const edge = seg.edge ?? Math.min(EDGE * window.innerHeight, len * 0.4);
        const inEdge = seg.formedOnLoad ? 1 : clamp01((sy - seg.start) / Math.max(1, edge));
        const outEdge = clamp01((seg.end - sy) / Math.max(1, edge));
        targetMorph = Math.min(inEdge, outEdge);
        targetStation = seg.i as number;
      } else if (seg.kind === "travel") {
        const a = anchors[seg.from as number] ?? target;
        const b = anchors[seg.to as number] ?? target;
        const t = clamp01((sy - seg.start) / Math.max(1, seg.end - seg.start));
        const e = t * t * (3 - 2 * t);
        tmpA.copy(a);
        target.copy(tmpA).lerp(b, e);
        targetMorph = 0;
        targetStation = seg.to as number;
      } else {
        const a = anchors[seg.i as number];
        if (a) target.copy(a);
        targetMorph = seg.morph ?? 0;
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

      if (segments.length === 0) {
        mage.visible = false;
        renderer.render(scene, camera);
        return;
      }

      sample(sy);
      const station = targetStation >= 0 ? resolved[targetStation] : undefined;
      const targetScale = baseScale * (station ? station.scale : 1);
      // first frame: snap position so a reload never slides the Mage in from
      // the world origin, but let formation gather for the entrance
      if (!seeded) {
        seeded = true;
        pos.copy(target);
        formation = reduced ? targetMorph : 0;
        curScale = targetScale;
      }
      // blasting past keeps the Mage scattered, so stops read as skipped
      const wantMorph = (fast ? targetMorph * 0.12 : targetMorph) * entrance;

      if (reduced) {
        pos.copy(target);
        formation = targetMorph;
      } else {
        // scattered cloud glides (low rate) so jumpy scroll reads as flow,
        // while a forming Mage locks onto its anchor quickly
        const posRate = fast ? 10 : 3 + formation * 9;
        pos.lerp(target, 1 - Math.exp(-dt * posRate));
        const formRate = entrance < 1 ? ENTRANCE_FORM_RATE : FORM_RATE;
        formation += (wantMorph - formation) * (1 - Math.exp(-dt * formRate));
        formation = clamp01(formation);
      }

      const fade = entrance * (DRIFT_FADE + (1 - DRIFT_FADE) * formation);
      // ambient wander so the loose cloud keeps drifting even when the page
      // is still; it fades out as the Mage forms and locks to its anchor
      const wander = reduced ? 0 : 1 - formation;
      const tsec = now / 1000;
      mage.position.set(
        pos.x + (Math.sin(tsec * 0.16) * 0.16 + Math.sin(tsec * 0.061 + 1.7) * 0.11) * wander,
        pos.y + (Math.cos(tsec * 0.11 + 0.4) * 0.12 + Math.sin(tsec * 0.047) * 0.09) * wander,
        pos.z,
      );
      mage.rotation.set(0, 0, 0);
      curScale += (targetScale - curScale) * (1 - Math.exp(-dt * 5));
      mage.scale.setScalar(curScale);
      // density tracks how big the fin actually renders: relative to the
      // tallest station, then scaled by the viewport's share of the reference
      // (squared, since dots spread over an area that shrinks quadratically)
      const viewport = clamp01((baseScale * window.innerHeight) / FIN_REFERENCE_PX);
      finUniforms.uDensity.value =
        clamp01(curScale / (baseScale * maxStationScale)) * viewport * viewport;
      mage.visible = fade > 0.002;

      finUniforms.uMorph.value = formation;
      finUniforms.uFade.value = fade;
      finUniforms.uBurst.value = 0;
      finUniforms.uCast.value = 0;
      finUniforms.uStir.value = 0;
      finUniforms.uFlow.value = 0;
      finUniforms.uTime.value = reduced ? 0 : now / 1000;
      finUniforms.uSize.value = pointSize;
      finUniforms.uColorA.value.lerp(targets.a, 0.05);
      finUniforms.uColorB.value.lerp(targets.b, 0.05);
      finUniforms.uColorC.value.lerp(targets.c, 0.05);

      // always live — the timeline is a pure function of scroll, so the
      // frame can never trail it; only the insides move
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
    };
    window.addEventListener("resize", onResize);
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
      window.removeEventListener("load", scheduleRebuild);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      mage.traverse((obj) => {
        if (obj instanceof THREE.Points) obj.geometry.dispose();
      });
      finMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("mage-fin pointer-events-none fixed inset-0 z-[1] size-full")}
    />
  );
}
