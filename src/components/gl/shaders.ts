// Ashima Arts / Stefan Gustavson 3D simplex noise (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uVelocity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uAspect;
uniform float uIntro;
uniform float uDim;
// Shape weights, in SHAPES order (scene.ts):
// core, network, gateway, observe, talk, layers, galaxy, text.
uniform float uW[8];

attribute vec3 aNetwork;
attribute vec3 aLayers;
attribute vec3 aGalaxy;
attribute vec3 aText;
attribute vec3 aTalk;
attribute vec3 aGate;
attribute vec3 aScope;
attribute vec2 aNetworkEdge;
attribute vec2 aLayersEdge;
attribute vec2 aTalkEdge;
attribute float aRand;

varying vec3 vColor;
varying float vAlpha;

${noise}

const float TAU = 6.28318530718;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

mat3 rotY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

float packet(vec2 edge, float speed) {
  if (edge.y < 0.0) return 0.0;
  float f = fract(edge.x - uTime * speed + edge.y * 0.371);
  return smoothstep(0.86, 0.99, f);
}

// Brightness boost written by the procedural shapes below.
float gGlow;

// Position in the gateway's traffic cycle (0..1): burst at 0, refill-rate
// requests until ~0.46, then a lull while the bucket refills.
float gateCycle() {
  return fract(uTime * 0.16);
}

vec3 gatewayShape() {
  float u = aGate.x;
  float lane = aGate.y;
  float kind = aGate.z;
  float h1 = hash(aRand * 91.7 + 1.3);
  float h2 = hash(aRand * 47.1 + 7.9);
  float h3 = hash(aRand * 13.3 + 3.1);
  vec3 p;
  gGlow = 0.0;
  if (kind < 0.5) {
    // TLS ring: outer frame and counter-rotating inner iris
    float a = u * TAU + uTime * (lane < 0.5 ? 0.12 : -0.35);
    float r = lane < 0.5 ? 1.15 : 0.8;
    p = vec3((h1 - 0.5) * 0.05, cos(a) * r, sin(a) * r);
    gGlow = lane < 0.5 ? 0.2 : 0.45;
  } else if (kind < 1.5) {
    // inbound: unordered stream narrowing into the ring
    float t = fract(u + uTime * 0.14);
    float spread = mix(1.3, 0.06, smoothstep(0.0, 1.0, t));
    p = vec3(mix(-3.3, -0.1, t), (h1 * 2.0 - 1.0) * spread, (h2 * 2.0 - 1.0) * spread);
    p.y += sin(uTime * 1.7 + h3 * 40.0) * 0.06 * (1.0 - t);
  } else if (kind < 2.5) {
    // Token bucket: a full bucket lets a burst through, then requests leave
    // at the refill rate, then the bucket refills during the lull.
    float slot = floor(u * 7.0);
    float depart = slot < 4.0 ? slot * 0.028 : 0.2 + (slot - 4.0) * 0.13;
    float t = fract(gateCycle() - depart) * 1.6 + (h1 - 0.5) * 0.012;
    float laneY = (lane - 1.0) * 0.9;
    p = vec3(mix(0.1, 3.0, t), laneY * smoothstep(0.0, 0.3, t) + (h2 - 0.5) * 0.05, (h3 - 0.5) * 0.05);
    p.x = t > 1.0 ? 3.0 : p.x;
    gGlow = 0.75;
  } else if (kind < 3.5) {
    vec3 dir = normalize(vec3(h1 - 0.5, h2 - 0.5, h3 - 0.5) + 1e-4);
    p = vec3(3.25, (lane - 1.0) * 0.9, 0.0) + dir * 0.2;
    gGlow = 0.35;
  } else {
    // token bucket above the ring
    if (lane < 0.5) {
      float s = u * 3.0;
      if (s < 1.0) p = vec3(-0.5, mix(2.05, 1.45, s), 0.0);
      else if (s < 2.0) p = vec3(mix(-0.5, 0.5, s - 1.0), 1.45, 0.0);
      else p = vec3(0.5, mix(1.45, 2.05, s - 2.0), 0.0);
      p.z = h1 < 0.5 ? -0.28 : 0.28;
    } else if (lane < 1.5) {
      // drains on the burst, stays empty at the refill rate, refills in the lull
      float c = gateCycle();
      float fill = c < 0.1 ? 1.0 - c / 0.1 : c < 0.46 ? 0.06 : (c - 0.46) / 0.54;
      float level = 1.5 + 0.5 * fill;
      p = vec3(mix(-0.42, 0.42, h1), mix(1.5, level, h2), mix(-0.22, 0.22, h3));
      gGlow = 0.6;
    } else {
      float t = fract(u + uTime * 0.5);
      p = vec3((h1 - 0.5) * 0.06, mix(1.42, 0.95, t), (h2 - 0.5) * 0.06);
      gGlow = 0.9;
    }
  }
  p.y -= 0.35;
  return rotY(0.62) * p;
}

float heartbeat(float x) {
  float y = 0.12 * exp(-pow((x - 0.2) / 0.035, 2.0));
  y -= 0.18 * exp(-pow((x - 0.36) / 0.012, 2.0));
  y += 1.0 * exp(-pow((x - 0.4) / 0.016, 2.0));
  y -= 0.3 * exp(-pow((x - 0.44) / 0.014, 2.0));
  y += 0.25 * exp(-pow((x - 0.62) / 0.06, 2.0));
  return y;
}

vec3 scopeShape() {
  float u = aScope.x;
  float lane = aScope.y;
  float kind = aScope.z;
  float h1 = hash(aRand * 71.3 + 2.1);
  float h2 = hash(aRand * 29.9 + 5.7);
  float sweep = mod(uTime * 1.1, TAU);
  vec3 p;
  gGlow = 0.0;
  if (kind > 2.5 && kind < 3.5) {
    // heartbeat trace above the scope
    float x = mix(-2.9, 2.9, u);
    float y = heartbeat(fract(u * 1.6 - uTime * 0.35));
    gGlow = clamp(abs(y) * 1.4, 0.0, 1.0);
    return vec3(x, 1.3 + y * 0.55 + (h1 - 0.5) * 0.02, 0.4);
  }
  if (kind < 0.5) {
    float a = u * TAU;
    float r = 0.55 * (lane + 1.0) + (h1 - 0.5) * 0.02;
    p = vec3(cos(a) * r, sin(a) * r, 0.0);
    gGlow = exp(-mod(sweep - a, TAU) * 2.2) * 0.9;
  } else if (kind < 1.5) {
    float a = lane > 3.5 ? sweep : lane * TAU * 0.25;
    float r = u * 1.7;
    p = vec3(cos(a) * r, sin(a) * r, 0.0);
    gGlow = lane > 3.5 ? 0.9 : 0.0;
  } else if (kind < 2.5) {
    float a = u * TAU;
    float r = 0.3 + lane * 1.3;
    p = vec3(cos(a) * r, sin(a) * r, 0.0) + vec3(h1 - 0.5, h2 - 0.5, 0.0) * 0.05;
    gGlow = exp(-mod(sweep - a, TAU) * 1.2) * 1.4;
  } else {
    // log lines streaming into the scope from both sides
    float side = lane < 5.5 ? -1.0 : 1.0;
    float row = mod(lane, 6.0);
    float t = fract(floor(u * 6.0) / 6.0 + h1 * 0.07 + uTime * 0.16 + row * 0.13);
    p = vec3(side * mix(3.0, 1.75, t), mix(-1.2, 1.2, row / 5.0), 0.0);
    gGlow = 0.25 + 0.4 * t;
  }
  p = rotX(-1.0) * p;
  p.y -= 0.4;
  return p;
}

void main() {
  // Sharpen the weights per particle: some particles commit to the
  // incoming shape early, others late, so morphs read as a wave.
  float k = mix(0.45, 2.6, fract(aRand * 7.31));
  float w0 = pow(max(uW[0], 0.0), k);
  float w1 = pow(max(uW[1], 0.0), k);
  float w2 = pow(max(uW[2], 0.0), k);
  float w3 = pow(max(uW[3], 0.0), k);
  float w4 = pow(max(uW[4], 0.0), k);
  float w5 = pow(max(uW[5], 0.0), k);
  float w6 = pow(max(uW[6], 0.0), k);
  float w7 = pow(max(uW[7], 0.0), k);
  float sum = max(w0 + w1 + w2 + w3 + w4 + w5 + w6 + w7, 1e-4);
  w0 /= sum; w1 /= sum; w2 /= sum; w3 /= sum; w4 /= sum; w5 /= sum; w6 /= sum; w7 /= sum;

  vec3 p = vec3(0.0);
  float glow = 0.0;
  if (w0 > 0.001) {
    float breath = snoise(position * 0.85 + vec3(0.0, 0.0, uTime * 0.22));
    p += w0 * (position + normalize(position + 1e-4) * breath * 0.26);
  }
  if (w1 > 0.001) p += w1 * aNetwork;
  if (w2 > 0.001) {
    p += w2 * gatewayShape();
    glow += w2 * gGlow;
  }
  if (w3 > 0.001) {
    p += w3 * scopeShape();
    glow += w3 * gGlow;
  }
  if (w4 > 0.001) p += w4 * aTalk;
  if (w5 > 0.001) p += w5 * aLayers;
  if (w6 > 0.001) {
    // galaxy arms rotate, faster toward the centre
    float spin = uTime * 0.12 / (0.6 + length(aGalaxy.xz));
    vec3 g = aGalaxy;
    g.xz = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * g.xz;
    p += w6 * g;
  }
  if (w7 > 0.001) p += w7 * aText;

  float settled = max(max(max(w0, w1), max(w2, w3)), max(max(w4, w5), max(w6, w7)));
  float transit = clamp((1.0 - settled) * 2.0, 0.0, 1.0);

  // Curl-ish drift; explodes mid-morph and when scrolling fast. Crisp
  // shapes (text, people, gateway) drift less.
  float crisp = w7 * 0.8 + (w2 + w3 + w4) * 0.6;
  vec3 np = p * 0.55 + vec3(uTime * 0.07);
  vec3 drift = vec3(snoise(np), snoise(np + 17.3), snoise(np + 41.7));
  p += drift * (0.03 + transit * 0.6 + uVelocity * 0.35) * (1.0 - crisp);

  // Intro: particles fall in from a wide shell.
  p *= mix(3.2, 1.0, uIntro);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Screen-space pointer repulsion.
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float force = (1.0 - smoothstep(0.0, 0.34, length(d))) * uMouseStrength;
  mv.xy += normalize(d + 1e-5) * force * 0.55;

  gl_Position = projectionMatrix * mv;

  float pulse = packet(aNetworkEdge, 0.42) * w1
              + packet(aLayersEdge, 0.55) * w5
              + packet(aTalkEdge, 0.38) * w4;

  vec3 cool = vec3(0.56, 0.62, 0.8);
  vec3 warm = vec3(0.96, 0.95, 0.9);
  vec3 acid = vec3(0.83, 1.0, 0.24);
  vec3 col = mix(cool, warm, aRand);
  col = mix(col, acid, step(0.94, aRand));
  float lit = clamp(pulse * 1.4 + glow + force * 1.3 + transit * 0.18, 0.0, 1.0);
  col = mix(col, acid * 1.5, lit);
  vColor = col;

  vAlpha = (0.38 + 0.5 * aRand + pulse * 1.2 + glow * 0.6) * uIntro * uDim;

  float size = uSize * (0.55 + aRand * 0.95 + pulse * 1.6 + glow * 0.6 + force * 0.8);
  gl_PointSize = size * uPixelRatio / -mv.z;
}
`

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(1.0 - d * 2.0, 1.7);
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`
