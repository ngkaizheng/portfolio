export const vertex = /* glsl */ `
varying vec2 vPos;
void main() { vPos = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

// Ray-marched black hole: light paths are bent by a Schwarzschild-like
// acceleration, the accretion disk is sampled on each crossing of the y=0 plane.
export const fragment = /* glsl */ `
uniform vec2 uRes;
varying vec2 vPos;
uniform float uTime;
uniform vec3 uCam;
uniform vec3 uLook;
uniform vec2 uShift;
uniform float uFlash;
uniform float uFlip;

float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ns(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * ns(p); p *= 2.03; a *= 0.5; }
  return s;
}
vec3 stars(vec3 d) {
  vec3 q = d * 90.0;
  vec3 i = floor(q);
  float h = h21(i.xy + i.z * 17.3);
  float m = smoothstep(0.45, 0.0, length(fract(q) - 0.5));
  return vec3(m * step(0.985, h) * (0.6 + h)) * vec3(0.8, 0.9, 1.2);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  // Screen position comes from the quad itself so it stays correct at any render resolution.
  vec2 uv = vPos * 0.5 * uRes / min(uRes.x * 1.25, uRes.y) - uShift;
  vec3 ro = uCam;
  vec3 f = normalize(uLook - ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 up = cross(f, rt);
  vec3 v = normalize(f * 1.5 + rt * uv.x + up * uv.y);
  vec3 p = ro;
  vec3 hh = cross(p, v);
  float h2 = dot(hh, hh);
  vec3 col = vec3(0.0);
  float tr = 1.0;
  float mr = 99.0;
  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(p, p);
    if (r2 < 1.0) { tr = 0.0; break; }
    if (r2 > 400.0) break;
    float rl = sqrt(r2);
    mr = min(mr, rl);
    float dt = (0.04 + 0.045 * rl) * STEP_SCALE;
    v += -1.5 * h2 * p / (r2 * r2 * rl) * dt;
    vec3 np = p + v * dt;
    if (p.y * np.y < 0.0) {
      vec3 c = mix(p, np, p.y / (p.y - np.y));
      float rr = length(c.xz);
      if (rr > 2.3 && rr < 10.0) {
        float I = smoothstep(2.3, 2.9, rr) * smoothstep(10.0, 3.5, rr);
        vec2 s1 = rot(uTime * 0.22) * c.xz;
        vec2 s2 = rot(uTime * 0.13 + 2.0) * c.xz;
        float n = 0.3 + 0.9 * fbm(vec2(rr * 5.0, 1.0)) * (0.55 * fbm(s1 * 1.3 + 3.0) + 0.55 * fbm(s2 * 2.1));
        float dop = 1.0 + 0.75 * c.x / rr;
        vec3 dc = mix(vec3(1.0, 0.28, 0.05), vec3(1.0, 0.85, 0.6), I * I) * I * n * dop * dop * 1.45;
        dc = mix(dc, dc.bgr * 1.2, smoothstep(6.0, 10.0, rr) * 0.6);
        dc = mix(dc, dc.bgr * 1.15, uFlip);
        col += tr * dc;
        tr *= 1.0 - 0.75 * I;
      }
    }
    p = np;
  }
  vec3 d = normalize(v);
  col += tr * stars(d) * 2.0;
  col += tr * mix(vec3(0.25, 0.1, 0.4), vec3(0.05, 0.25, 0.4), uFlip) * fbm(d.xy * 3.0 + d.z) * 0.22;
  col += mix(vec3(1.0, 0.6, 0.3), vec3(0.4, 0.7, 1.0), uFlip) * 0.014 / (abs(mr - 1.55) + 0.04) * step(0.001, tr);
  col = mix(col, vec3(4.0), uFlash);
  gl_FragColor = vec4(col, 1.0);
}
`
