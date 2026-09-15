export const RIPPLE_SLOTS = 5;
export const RIPPLE_LIFE = 1.8;

export const RIPPLES_GLSL = /* glsl */ `
  uniform vec4 uRipples[${RIPPLE_SLOTS}];
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
  varying vec2 vUv;
  ${RIPPLES_GLSL}

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

    col *= 1.0 - 0.006 * dot(q, q);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const FIN_VERTEX = /* glsl */ `
  uniform float uMorph;
  uniform float uSize;
  uniform float uBurst;
  uniform float uStir;
  uniform float uFlow;
  uniform float uTime;
  uniform float uDensity;
  varying float vTint;
  varying float vAlpha;
  attribute vec3 aChaos;
  attribute float aSeed;
  attribute float aTint;
  attribute float aGate;

  void main() {
    float local = clamp((uMorph - aSeed * 0.45) / 0.55, 0.0, 1.0);
    float m = local * local * (3.0 - 2.0 * local);

    vec3 c = aChaos;
    c *= 1.0 + uBurst * 1.25;
    c.y -= uBurst * uBurst * 1.1;

    vec3 p = mix(c, position, m);

    // radial falloff: dots toward the centre of the fin are free to move,
    // while the outer edge holds its silhouette steady
    float rad = length(position.xy);
    float inner = 1.0 - smoothstep(0.1, 1.4, rad);

    // fluid response to scroll: dots swirl inside the formed shape, a
    // different arrangement for every scroll position. Gated by
    // formed-ness so the drift cloud stays a still picture.
    float fluid = m * uStir;
    float ang = uFlow * (0.3 + aSeed * 0.5) + aSeed * 6.28318;
    p.xy += vec2(cos(ang), sin(ang)) * (fluid * 0.35 * inner);
    p.z += fluid * sin(uFlow * 2.0 + aSeed * 40.0) * 0.15;

    // idle drift — always a little alive in the same swirl language, so a
    // scroll joins an ongoing motion instead of starting from stillness
    float idleAng = uTime * 0.3 + aSeed * 6.28318;
    p.xy += vec2(cos(idleAng), sin(idleAng)) * (m * 0.07 * inner);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float sz = mix(1.7, 1.0, m) * (0.55 + aSeed * 0.75);
    // dot count thins with the Mage's size and scatters sparser than it forms
    float gate = step(aGate, uDensity * mix(0.4, 1.0, m));
    gl_PointSize = uSize * sz * (5.0 / max(0.1, -mv.z)) * gate;
    vTint = aTint;
    vAlpha = mix(0.72, 0.95, m) * smoothstep(17.0, 4.0, -mv.z) * gate;
  }
`;

export const FIN_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uFade;
  uniform float uCast;
  uniform float uIntensity;
  varying float vTint;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.06, length(uv));
    a *= a;
    // ~2/3 green, ~1/3 yellow across the fin
    vec3 col = mix(uColorA, uColorB, step(0.57 - uCast * 0.3, vTint));
    // brightest dots catch a highlight, so the fin reads with a lit ridge
    col = mix(col, uColorC, step(0.93, vTint));
    float light = min(1.0, 0.5 + 0.5 * vTint + uCast * 0.4);
    gl_FragColor = vec4(col, a * vAlpha * uFade * light * uIntensity);
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
