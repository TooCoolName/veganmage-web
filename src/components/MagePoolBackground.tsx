import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import mageMainUrl from "../assets/mage-main.svg";
import { cn } from "../lib/utils";
import { WATER, WATER_SCROLL_GOLD, WATER_SCROLL_MID } from "./colors/water";
import { currentTheme, readPoolScroll, scrollTriad } from "./colors/theme";
import {
  CAUSTIC_FRAGMENT,
  CAUSTIC_VERTEX,
  DUST_FRAGMENT,
  DUST_VERTEX,
  RELEASE_LIFE,
  RELEASE_SLOTS,
  RIPPLE_LIFE,
  RIPPLE_SLOTS,
} from "./pool/shaders";

const DUST_COUNT = 2600;
const DUST_TOTAL = DUST_COUNT;

/** Event the Mage layer dispatches when it blinks in/out, so the pool rings. */
export const MAGE_RIPPLE_EVENT = "mage-ripple";

/** Event the Mage layer dispatches to burn a cosmic void open in the water. */
export const MAGE_RELEASE_EVENT = "mage-release";

export type MageRippleDetail = { x: number; y: number; s: number };
/** r is the starting radius of the shockwave, in half-viewport units */
export type MageReleaseDetail = { x: number; y: number; s: number; r?: number };

/**
 * Water only: caustics + dust + ripples + palette.
 * Own fixed canvas (z-0). Colors live in `./colors/water` (`WATER` plus the
 * `WATER_SCROLL_MID`/`WATER_SCROLL_GOLD` scroll stops) — the Mage lives
 * elsewhere.
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
      uReleases: {
        value: Array.from(
          { length: RELEASE_SLOTS },
          () => new THREE.Vector4(0, 0, -100, 0),
        ),
      },
      uReleaseStart: { value: new Float32Array(RELEASE_SLOTS) },
    };

    const pal = WATER[currentTheme()];
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
      uVoidColor: { value: new THREE.Color(pal.voidColor) },
      uVoidStrength: { value: pal.voidStrength },
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
        uColorA: { value: new THREE.Color(pal.dust) },
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
      dust: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(pal.bgTop),
      bgBottom: new THREE.Color(pal.bgBottom),
      glow: new THREE.Color(pal.glow),
      dust: new THREE.Color(pal.dust),
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
      dust: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(WATER[themeName].bgTop),
      bgBottom: new THREE.Color(WATER[themeName].bgBottom),
      glow: new THREE.Color(WATER[themeName].glow),
      dust: new THREE.Color(WATER[themeName].dust),
      strength: WATER[themeName].strength,
      wash: WATER[themeName].wash,
    };
    const gold: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      dust: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(WATER_SCROLL_GOLD[themeName].bgTop),
      bgBottom: new THREE.Color(WATER_SCROLL_GOLD[themeName].bgBottom),
      glow: new THREE.Color(WATER_SCROLL_GOLD[themeName].glow),
      dust: new THREE.Color(WATER_SCROLL_GOLD[themeName].dust),
      strength: WATER_SCROLL_GOLD[themeName].strength,
      wash: WATER_SCROLL_GOLD[themeName].wash,
    };
    const mid: {
      bgTop: THREE.Color;
      bgBottom: THREE.Color;
      glow: THREE.Color;
      dust: THREE.Color;
      strength: number;
      wash: number;
    } = {
      bgTop: new THREE.Color(WATER_SCROLL_MID[themeName].bgTop),
      bgBottom: new THREE.Color(WATER_SCROLL_MID[themeName].bgBottom),
      glow: new THREE.Color(WATER_SCROLL_MID[themeName].glow),
      dust: new THREE.Color(WATER_SCROLL_MID[themeName].dust),
      strength: WATER_SCROLL_MID[themeName].strength,
      wash: WATER_SCROLL_MID[themeName].wash,
    };
    // release palette is stable (not scroll-morphed), so it just eases on theme
    const voidTarget = new THREE.Color(pal.voidColor);
    let voidStrengthTarget = pal.voidStrength;
    let scrollTarget = 0;
    let scrollMix = 0;
    const refreshThemeBases = () => {
      themeName = currentTheme();
      base.bgTop.set(WATER[themeName].bgTop);
      base.bgBottom.set(WATER[themeName].bgBottom);
      base.glow.set(WATER[themeName].glow);
      base.dust.set(WATER[themeName].dust);
      base.strength = WATER[themeName].strength;
      base.wash = WATER[themeName].wash;
      gold.bgTop.set(WATER_SCROLL_GOLD[themeName].bgTop);
      gold.bgBottom.set(WATER_SCROLL_GOLD[themeName].bgBottom);
      gold.glow.set(WATER_SCROLL_GOLD[themeName].glow);
      gold.dust.set(WATER_SCROLL_GOLD[themeName].dust);
      gold.strength = WATER_SCROLL_GOLD[themeName].strength;
      gold.wash = WATER_SCROLL_GOLD[themeName].wash;
      mid.bgTop.set(WATER_SCROLL_MID[themeName].bgTop);
      mid.bgBottom.set(WATER_SCROLL_MID[themeName].bgBottom);
      mid.glow.set(WATER_SCROLL_MID[themeName].glow);
      mid.dust.set(WATER_SCROLL_MID[themeName].dust);
      mid.strength = WATER_SCROLL_MID[themeName].strength;
      mid.wash = WATER_SCROLL_MID[themeName].wash;
      causticsUniforms.uVeins.value = WATER[themeName].veins ? 1 : 0;
      causticsUniforms.uDensity.value = WATER[themeName].causticDensity;
      causticsUniforms.uSharp.value = WATER[themeName].causticSharp;
      voidTarget.set(WATER[themeName].voidColor);
      voidStrengthTarget = WATER[themeName].voidStrength;
      dustMaterial.blending = WATER[themeName].additive
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
    type Release = { x: number; y: number; t0: number; s: number; r: number };
    const releases: Release[] = [];
    const pushRelease = (x: number, y: number, s: number, r: number) => {
      if (reduced) return;
      releases.push({ x, y, t0: elapsed(), s, r });
      while (releases.length > RELEASE_SLOTS) releases.shift();
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
    const onMageRelease = (e: Event) => {
      const d = (e as CustomEvent<MageReleaseDetail>).detail;
      if (d) pushRelease(d.x, d.y, d.s, d.r ?? 0);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener(MAGE_RIPPLE_EVENT, onMageRipple);
    window.addEventListener(MAGE_RELEASE_EVENT, onMageRelease);
    scrollTarget = readPoolScroll();
    scrollMix = scrollTarget;
    const onScroll = () => {
      scrollTarget = readPoolScroll();
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
      scrollTarget = readPoolScroll();
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

      while (releases.length && t - releases[0].t0 > RELEASE_LIFE) releases.shift();
      const releaseSlots = shared.uReleases.value;
      const releaseStart = shared.uReleaseStart.value;
      for (let i = 0; i < RELEASE_SLOTS; i++) {
        const rl = releases[i];
        if (rl) {
          releaseSlots[i].set(rl.x, rl.y, rl.t0, rl.s);
          releaseStart[i] = rl.r;
        } else {
          releaseSlots[i].set(0, 0, -100, 0);
          releaseStart[i] = 0;
        }
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
      // Slow linear travel: first half green slowly dissolves toward white,
      // second half yellow slowly surfaces from white. No snapping. The triad
      // helper owns the green -> lime -> gold routing so the orb matches.
      const { from, to, k } = scrollTriad(scrollMix, base, mid, gold);
      targets.bgTop.copy(from.bgTop).lerp(to.bgTop, k);
      targets.bgBottom.copy(from.bgBottom).lerp(to.bgBottom, k);
      targets.glow.copy(from.glow).lerp(to.glow, k);
      targets.dust.copy(from.dust).lerp(to.dust, k);
      targets.strength = from.strength + (to.strength - from.strength) * k;
      targets.wash = from.wash + (to.wash - from.wash) * k;

      causticsUniforms.uBgTop.value.lerp(targets.bgTop, 0.03);
      causticsUniforms.uBgBottom.value.lerp(targets.bgBottom, 0.03);
      causticsUniforms.uGlow.value.lerp(targets.glow, 0.03);
      causticsUniforms.uStrength.value +=
        (targets.strength - causticsUniforms.uStrength.value) * 0.03;
      causticsUniforms.uWash.value +=
        (targets.wash - causticsUniforms.uWash.value) * 0.03;
      (dustMaterial.uniforms.uColorA.value as THREE.Color).lerp(targets.dust, 0.03);
      causticsUniforms.uVoidColor.value.lerp(voidTarget, 0.03);
      causticsUniforms.uVoidStrength.value +=
        (voidStrengthTarget - causticsUniforms.uVoidStrength.value) * 0.03;

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
      window.removeEventListener(MAGE_RELEASE_EVENT, onMageRelease);
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
            src={mageMainUrl}
            alt=""
            className="w-[62vw] max-w-md opacity-[0.16] dark:opacity-[0.14]"
          />
        </div>
      )}
    </>
  );
}
