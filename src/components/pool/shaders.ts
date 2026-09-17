export const RIPPLE_SLOTS = 5;
export const RIPPLE_LIFE = 1.8;

export const RIPPLES_GLSL = /* glsl */ `
  uniform vec4 uRipples[${RIPPLE_SLOTS}];
`;

/** concurrent cosmic void releases the Mage can have in flight */
export const RELEASE_SLOTS = 4;
/** seconds one release's shockwave takes to cross the pool */
export const RELEASE_LIFE = 2.6;
/** how fast the void front expands, in half-viewport units per second */
export const RELEASE_SPEED = 1.65;

export const RELEASES_GLSL = /* glsl */ `
  uniform vec4 uReleases[${RELEASE_SLOTS}];
  uniform float uReleaseStart[${RELEASE_SLOTS}];
`;

export const CAUSTIC_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

export const CAUSTIC_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec3 uBgTop;
  uniform vec3 uBgBottom;
  uniform vec3 uGlow;
  uniform float uStrength;
  uniform float uVeins;
  uniform float uDensity;
  uniform float uSharp;
  uniform float uWash;
  uniform vec3 uVoidColor;
  uniform float uVoidStrength;
  varying vec2 vUv;
  ${RIPPLES_GLSL}
  ${RELEASES_GLSL}

  /** dark: glow brightens the water. light: glow dyes the lines toward its
      color so they read on white without washing it out. */
  vec3 glow(vec3 col, float amt) {
    if (uVeins > 0.5) return mix(col, uGlow, pow(clamp(amt, 0.0, 1.0), 1.25));
    return col + uGlow * amt;
  }

  float caustic(vec2 uv, float t) {
    vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.0045;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 4.0;
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), uSharp);
  }

  void main() {
    vec2 uv = vUv;
    vec2 q = (uv - 0.5) * vec2(uAspect, 1.0);
    vec3 col = mix(uBgBottom, uBgTop, 0.65 + 0.35 * smoothstep(-0.5, 1.0, uv.y));

    // Keep the caustic feature scale tied to a reference viewport, so wide
    // screens don't tile the pattern into extra repeats across the width.
    float cs = min(1.0, 1.6 / uAspect);

    float t = uTime * 0.055;
    float c1 = caustic(q * 2.6 * uDensity * cs + vec2(0.0, t * 0.4), t);
    float c2 = caustic(q * 4.1 * uDensity * cs - vec2(t * 0.25, 0.0), t * 1.3 + 40.0);
    float c = c1 * 0.75 + c2 * 0.35;
    c *= 0.75 + 0.25 * smoothstep(-0.6, 0.8, uv.y);
    col = glow(col, c * uStrength);
    col = min(col, vec3(1.0));
    // whole-surface wash: spreads the glow color everywhere, not just veins
    col = mix(col, uGlow, uWash);

    float ray = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float x = 0.2 + fi * 0.3 + sin(uTime * 0.02 + fi * 2.1) * 0.06;
      float d = abs(uv.x - x - (uv.y - 1.0) * 0.2);
      ray += exp(-d * d * 80.0) * (0.55 + 0.45 * sin(uTime * 0.05 + fi * 1.7));
    }
    col = glow(col, ray * uStrength * 0.2);

    vec2 m = (uMouse * 0.5 + 0.5 - 0.5) * vec2(uAspect, 1.0);
    float mouseAmt = exp(-dot(q - m, q - m) * 7.0) * uStrength * 0.35;
    // light: keep the cursor halo very faint so it never reads as a green blob
    if (uVeins > 0.5) mouseAmt *= 0.25;
    // dark: additive makes the halo bloom, so keep it much weaker too
    else mouseAmt *= 0.18;
    col = glow(col, mouseAmt);

    float rings = 0.0;
    for (int i = 0; i < ${RIPPLE_SLOTS}; i++) {
      float t0 = uRipples[i].z;
      float age = uTime - t0;
      if (t0 < 0.0 || age > ${RIPPLE_LIFE.toFixed(1)}) continue;
      vec2 rc = (uRipples[i].xy * 0.5 + 0.5 - 0.5) * vec2(uAspect, 1.0);
      float d = length(q - rc);
      float front = age * 1.1;
      rings += sin((d - front) * 18.0) * exp(-abs(d - front) * 5.0) * exp(-age * 2.0) * uRipples[i].w;
    }
    col = glow(col, max(rings, 0.0) * uStrength * 0.9);

    // ── cosmic void release ────────────────────────────────────────────
    // The Mage stays put; instead it tears the water open. A front expands
    // outward, swallowing everything it passes into a deep void, while a
    // bright plasma rim (and a fainter trailing one) burns along the edge.
    float voidAmt = 0.0;
    float cosmic = 0.0;
    for (int i = 0; i < ${RELEASE_SLOTS}; i++) {
      float t0 = uReleases[i].z;
      float age = uTime - t0;
      if (t0 < 0.0 || age > ${RELEASE_LIFE.toFixed(1)}) continue;
      vec2 rc = uReleases[i].xy * 0.5 * vec2(uAspect, 1.0);
      float d = length(q - rc);
      float life = clamp(1.0 - age / ${RELEASE_LIFE.toFixed(1)}, 0.0, 1.0);
      float w = uReleases[i].w;
      // begin clear of the Mage's silhouette, so the wave wraps the shape
      // instead of erupting from a point at its centre
      float r0 = max(uReleaseStart[i], 0.0);
      float front = r0 + age * ${RELEASE_SPEED.toFixed(2)};
      // inside the front, the water is gone: a soft-edged void
      voidAmt += smoothstep(front, front - 0.5, d) * pow(life, 1.3) * w;
      // one wave leaves: the front runs outward from the shield and dies.
      // The thin circle itself is the Mage's persistent aura (MageFigureLayer),
      // not part of this burst.
      cosmic += exp(-abs(d - front) * 8.0) * pow(life, 1.7) * w;
    }
    voidAmt = clamp(voidAmt, 0.0, 1.0);
    col = mix(col, uVoidColor, voidAmt * uVoidStrength);
    col = glow(col, cosmic * uStrength * 1.3);

    col *= 1.0 - 0.006 * dot(q, q);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const FIGURE_VERTEX = /* glsl */ `
  uniform float uMorph;
  uniform float uSize;
  uniform float uBurst;
  uniform float uGrow;
  uniform float uStir;
  uniform float uFlow;
  uniform float uTime;
  uniform float uDensity;
  varying float vTint;
  varying float vAlpha;
  varying float vSeed;
  varying vec2 vDir;
  attribute vec3 aChaos;
  attribute float aSeed;
  attribute float aTint;
  attribute float aGate;

  void main() {
    float local = clamp((uMorph - aSeed * 0.45) / 0.55, 0.0, 1.0);
    float m = local * local * (3.0 - 2.0 * local);

    // the orb blooms out of a gathering point: the shell radius grows from a
    // vertex as the Mage forms, so the stars converge inward and then expand
    vec3 shell = position * uGrow;
    vec3 p = mix(aChaos, shell, m);

    // vortex: stars sweep around the ball's axis as they gather, the outer
    // cloud lagging behind so the swarm twists into a spiral and then untwists
    // as the shape locks in. A shatter runs it in reverse, flinging the stars
    // back out along the same spiral.
    float spin = (1.0 - m) * 6.5 * (0.55 + aSeed * 0.9);
    float ca = cos(spin);
    float sa = sin(spin);
    p.xy = mat2(ca, -sa, sa, ca) * p.xy;

    // shatter: as the orb breaks, its stars are thrown outward and fall before
    // relaxing back into the drift cloud (applied after the mix so the burst
    // reads even while the stars are still on the ball's shell)
    p *= 1.0 + uBurst * 1.25;
    p.y -= uBurst * uBurst * 1.1;

    // radial falloff: stars toward the centre of the figure are free to move,
    // while the outer edge holds its silhouette steady
    float rad = length(position.xy);
    float inner = 1.0 - smoothstep(0.1, 1.4, rad);

    // fluid response to scroll: stars swirl inside the formed shape, a
    // different arrangement for every scroll position. Gated by
    // formed-ness so the drift cloud stays a still picture.
    float fluid = m * uStir;
    float ang = uFlow * (0.3 + aSeed * 0.5) + aSeed * 6.28318;
    p.xy += vec2(cos(ang), sin(ang)) * (fluid * 0.35 * inner);
    p.z += fluid * sin(uFlow * 2.0 + aSeed * 40.0) * 0.15;

    // idle drift — deliberately tiny: the Mage is meant to read as a still,
    // anchored sigil while the water around it does the moving
    float idleAng = uTime * 0.12 + aSeed * 6.28318;
    p.xy += vec2(cos(idleAng), sin(idleAng)) * (m * 0.018 * inner);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float sz = mix(1.35, 1.0, m) * (0.55 + aSeed * 0.75);
    // star count thins with the Mage's size and scatters sparser than it forms
    float gate = step(aGate, uDensity * mix(0.4, 1.0, m));
    // a burst puffs every star, so the sparks read as they fly apart
    gl_PointSize = uSize * sz * (5.0 / max(0.1, -mv.z)) * gate * (1.0 + uBurst * 0.8);
    vTint = aTint;
    vAlpha = mix(0.72, 0.95, m) * smoothstep(17.0, 4.0, -mv.z) * gate;

    // star sprite data: a rotation seed, and the outward direction the star is
    // travelling, so a burst can orient each spark along its own flight path
    vSeed = aSeed;
    vDir = normalize(p.xy + vec2(0.0001));
  }
`;

export const FIGURE_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uBallA;
  uniform vec3 uBallB;
  uniform vec3 uBallC;
  uniform float uBallMix;
  uniform float uFade;
  uniform float uCast;
  uniform float uIgnite;
  uniform float uBurst;
  uniform float uTime;
  uniform float uIntensity;
  varying float vTint;
  varying float vAlpha;
  varying float vSeed;
  varying vec2 vDir;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // orient each star's cross along its travel direction while the orb
    // shatters, so the scattered swarm reads as sparks flying outward
    vec2 dir = normalize(vDir + vec2(0.0001));
    vec2 q = vec2(dir.x * uv.x + dir.y * uv.y, -dir.y * uv.x + dir.x * uv.y);

    // rotate the star per seed so the field never settles into a grid
    float spin = vSeed * 6.28318;
    float cs = cos(spin);
    float ss = sin(spin);
    vec2 sp = vec2(cs * q.x - ss * q.y, ss * q.x + cs * q.y);

    float r = length(sp);
    // a hot little core
    float core = exp(-r * r * 30.0);
    // four-point flare: a thin cross of light reaching to the sprite's edge
    float flare =
      exp(-abs(sp.x) * 6.0) * exp(-abs(sp.y) * 15.0) +
      exp(-abs(sp.y) * 6.0) * exp(-abs(sp.x) * 15.0);
    // twinkle, so the swarm feels alive without moving
    float tw = 0.72 + 0.28 * sin(uTime * 2.3 + vSeed * 40.0);
    float a = clamp(core + flare * 0.55, 0.0, 1.0) * tw;

    // while a yellow plasma orb is being born, the swarm gathered at its centre
    // takes on that yellow *before* it blooms, so the ball grows out of yellow
    // dots rather than green ones (uBallMix falls back to 0 for a green ball)
    vec3 cA = mix(uColorA, uBallA, uBallMix);
    vec3 cB = mix(uColorB, uBallB, uBallMix);
    vec3 cC = mix(uColorC, uBallC, uBallMix);

    // ~2/3 green, ~1/3 yellow across the figure
    vec3 col = mix(cA, cB, step(0.57 - uCast * 0.3, vTint));
    // brightest stars catch a highlight, so the figure reads with a lit ridge
    col = mix(col, cC, step(0.93, vTint));
    // flares, the gather ignite, and the shatter burst all burn toward the
    // highlight, so appearing and disappearing both flash hot at the core
    col = mix(col, cC, clamp(max(flare - 0.4, 0.0) * 0.45 + uCast + uIgnite, 0.0, 1.0));
    float light = min(1.0, 0.55 + 0.45 * vTint + uCast * 0.4 + uIgnite * 0.6);
    gl_FragColor = vec4(col, a * vAlpha * uFade * light * uIntensity);
  }
`;

export const BUBBLE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v;
  }
`;

export const BUBBLE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform sampler2D uMap;
  uniform vec2 uMapScale;
  uniform vec2 uMapCenter;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uGlass;
  uniform vec3 uInk;
  uniform float uInkAmount;
  uniform float uVeil;
  varying vec2 vUv;

  ${NOISE_GLSL}

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    if (r > 1.0) discard;

    // the ball is a solid little world: its own dark glass, sealed by the rim
    const float BALL = 0.9;
    float inside = 1.0 - smoothstep(BALL - 0.006, BALL + 0.006, r);
    float rr = min(1.0, r / BALL);
    float z = sqrt(max(0.0, 1.0 - rr * rr));
    float fres = pow(1.0 - z, 2.2);
    vec2 sp = p / BALL;
    float ang = atan(sp.y, sp.x);
    float t = uTime * 0.16;

    // liquid plasma churn: a domain-warped noise field
    vec2 w = vec2(
      fbm(sp * 2.0 + vec2(t, -t * 0.8)),
      fbm(sp * 2.0 + vec2(5.2, 1.3) + vec2(-t * 0.7, t))
    );
    float plasma = fbm(sp * 2.3 + w * 1.9 + vec2(0.0, -t * 0.7));
    float clouds = smoothstep(0.4, 1.0, plasma);

    // hot filaments spiral off the core and lick the glass all the way out
    float vein = pow(0.5 + 0.5 * sin(ang * 6.0 + plasma * 9.0 - t * 3.2), 3.0);
    float reach = smoothstep(0.1, 1.0, length(sp));
    float tendrils = vein * reach * (0.5 + 0.5 * clouds);
    // a hot, churning heart so the plasma reads with depth
    float core = exp(-rr * rr * 3.0) * (0.45 + 0.55 * clouds);

    // nothing behind the orb shows through: its own solid glass, a direct
    // per-theme color (near-white on light, near-black on dark) so the backing
    // can never fall back to the dark self-tint on the light theme.
    vec3 col = uGlass * (0.5 + 0.7 * (1.0 - rr));

    // the Mage stands *behind* the plasma: sample its silhouette in the orb's
    // local space and let it only dim the ball's own glass. The churn, tendrils
    // and core below then paint over it, so the figure reads through the liquid
    // rather than stamped on top of it.
    vec2 muv = uMapCenter + p * uMapScale;
    float inMap =
      step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y) * step(muv.y, 1.0);
    float mage = smoothstep(0.4, 0.6, texture2D(uMap, clamp(muv, 0.0, 1.0)).a) * inMap;
    // dark: the silhouette sinks toward black. light: it inks toward green, so
    // the figure stays a green presence on the white glass.
    col = mix(col, uInk, mage * uInkAmount);

    col += uColor * clouds * 0.55;
    col += uColorB * pow(clouds, 2.0) * 0.4;
    col += mix(uColorB, uColorC, 0.35) * tendrils * 1.05;
    col += uColorC * pow(tendrils, 3.0) * 0.8;
    col += mix(uColorB, uColorC, 0.5) * core * 0.35;

    // a soft veil over the churn so the figure reads through the liquid without
    // ever sitting on top of it. dark: dims the plasma so the figure sinks.
    // light: washes it to the ink (white) so the figure glows.
    col = mix(col, uInk, mage * uVeil);

    // inner-glass fresnel bloom, then the solid rim circle
    col += uColor * fres * 0.3;
    float rim = 1.0 - smoothstep(0.0, 0.013, abs(r - BALL));
    col += uColorC * rim;

    // specular highlight up-left
    float hl = smoothstep(0.5, 0.0, length(p - vec2(-0.34, 0.4)));
    col += uColorC * hl * 0.55;

    // crisp glass edge, with a faint halo bleeding just past it
    float halo = (1.0 - inside) * (1.0 - smoothstep(BALL, 1.0, r));
    col += uColor * halo * 0.2;
    float a = inside + halo * 0.3;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uOpacity);
  }
`;

export const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vTw;

  void main() {
    vec3 p = position;
    p.y = mod(p.y + 11.0 + uTime * (0.1 + aSeed * 0.16), 22.0) - 11.0;
    p.x += sin(uTime * 0.35 + aSeed * 24.0) * 0.3;
    p.z += sin(uTime * 0.25 + aSeed * 12.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.5 + 0.5 * sin(uTime * (0.4 + aSeed * 1.5) + aSeed * 40.0);
    float band = (p.y + 11.0) / 22.0;
    float edge = smoothstep(0.0, 0.08, band) * smoothstep(1.0, 0.92, band);
    vTw = (0.35 + 0.65 * tw) * edge * smoothstep(20.0, 6.0, -mv.z);
    gl_PointSize = uSize * (0.35 + aSeed * 0.7) * (5.0 / max(0.1, -mv.z));
  }
`;

export const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform float uFade;
  varying float vTw;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.05, length(uv));
    a *= a;
    gl_FragColor = vec4(uColorA, a * vTw * uFade * 0.55);
  }
`;
