import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outline, bounds, flatGeometry, flatXY, wallsGeometry, ribbonGeometry, worldUV, perimeterSamples } from './geometry.js';
import { finishTexture, surfaceTexture, makeTexture } from './textures.js';
import { findFinish, byId, COPINGS, DECKS, WATERS, LIGHTS } from './catalog.js';

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const col = (h) => new THREE.Color(h);
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------- Cielo (con nubes y estrellas) ----------
const SKY_VERT = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const SKY_FRAG = `
varying vec3 vDir;
uniform vec3 uTop, uHor, uSunDir, uSunCol; uniform float uNight, uTime;
float hash(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float h2(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<5;i++){ s += a*n2(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHor, uTop, pow(h, 0.5));
  if (d.y < 0.0) c = mix(uHor, uHor*0.6, clamp(-d.y*3.0,0.0,1.0));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  c += uSunCol * (pow(s, 1200.0) * 8.0 + pow(s, 16.0) * 0.3 + pow(s, 3.0) * 0.06) * (1.0 - uNight*0.2);
  if (d.y > 0.0) {
    vec2 cp = d.xz / (d.y + 0.2) * 1.5 + vec2(uTime*0.006, uTime*0.002);
    float cl = smoothstep(0.5, 0.82, fbm(cp));
    cl *= smoothstep(0.0, 0.16, d.y);
    vec3 cc = mix(vec3(1.0, 1.0, 1.0), uHor, 0.18) * (1.0 - uNight*0.93) + vec3(0.05, 0.07, 0.12) * uNight;
    cc *= 1.0 - 0.22 * smoothstep(0.5, 0.95, fbm(cp*1.7 + 4.0));
    c = mix(c, cc, cl * 0.88);
  }
  float star = step(0.9978, hash(floor(d*280.0))) * smoothstep(0.05, 0.4, d.y) * uNight;
  c += vec3(star);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

// ---------- Agua con reflejo real (espejo plano) ----------
const WATER_VERT = `
uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
void main(){ vUv = textureMatrix * vec4(position, 1.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const WATER_FRAG = `
uniform sampler2D tDiffuse; uniform vec3 color;
varying vec4 vUv; varying vec3 vW;
uniform float uTime, uNight, uLightAmt, uOpacity, uReflect;
uniform vec3 uTint, uDeep, uSunDir, uSunCol, uLight;
void main(){
  vec2 p = vW.xz; float t = uTime;
  vec2 g = vec2(0.0);
  g += vec2(cos(p.x*1.7+t*0.9), sin(p.y*1.9+t*0.8))*0.018;
  g += vec2(cos(p.x*3.9-t*1.3+p.y*1.1), sin(p.y*4.3+t*1.1-p.x*0.7))*0.010;
  g += vec2(cos(p.x*9.0+t*2.0+p.y*2.0), sin(p.y*8.0-t*1.8))*0.0035;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - vW);
  float ndv = max(dot(n, V), 0.0);
  float fres = clamp(uReflect + pow(1.0 - ndv, 4.0) * (1.0 - uReflect), 0.0, 1.0);
  vec4 uv = vUv; uv.xy += g * uv.w * 1.8;
  vec3 refl = texture2DProj(tDiffuse, uv).rgb;
  vec3 R = reflect(-V, n);
  float spec = pow(max(dot(R, normalize(uSunDir)), 0.0), 420.0);
  vec3 body = mix(uTint, uDeep, 0.62);
  body += uLight * uLightAmt;
  body *= mix(1.0, 0.5, uNight*(1.0-uLightAmt));
  vec3 c = mix(body, refl, fres) + uSunCol * spec * 3.0 * (1.0 - uNight*0.75);
  float a = clamp(mix(uOpacity*0.72, 0.96, fres) + uLightAmt*0.14, 0.0, 0.985);
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
// Agua simple (spa): reflejo del cielo calculado, sin espejo
const WATER_SIMPLE_FRAG = `
varying vec3 vW; varying vec4 vUv;
uniform float uTime, uNight, uLightAmt, uOpacity;
uniform vec3 uTint, uDeep, uSkyTop, uSkyHor, uSunDir, uSunCol, uLight;
vec3 skyCol(vec3 d){ float t = clamp(d.y*1.6+0.05, 0.0, 1.0); return mix(uSkyHor, uSkyTop, pow(t, 0.7)); }
void main(){
  vec2 p = vW.xz; float t = uTime;
  vec2 g = vec2(cos(p.x*3.9-t*1.3+p.y*1.1), sin(p.y*4.3+t*1.1-p.x*0.7))*0.02 + vec2(cos(p.x*9.0+t*2.0), sin(p.y*8.0-t*1.8))*0.006;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0) * 0.7 + 0.03;
  vec3 R = reflect(-V, n);
  vec3 body = mix(uTint, uDeep, 0.55) + uLight * uLightAmt; body *= mix(1.0, 0.5, uNight*(1.0-uLightAmt));
  vec3 c = mix(body, skyCol(R), fres) + uSunCol * pow(max(dot(R, normalize(uSunDir)), 0.0), 260.0) * 2.0 * (1.0 - uNight*0.75);
  gl_FragColor = vec4(c, clamp(mix(uOpacity*0.8, 0.96, fres), 0.0, 0.98));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const SIMPLE_VERT = 'varying vec3 vW; varying vec4 vUv; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = vec4(0.0); gl_Position = projectionMatrix * viewMatrix * w; }';

export class PoolScene {
  constructor(host) {
    this.host = host;
    this.time = 0; this.night = 0; this.nightTarget = 0; this.running = false; this.disposed = false;
    this.cache = new Map(); this.waterOn = true; this.lightsOn = false; this.shift = false; this.waterY = -0.12;
    this.uni = { uTime: { value: 0 }, uCaus: { value: 0.7 }, uWY: { value: -0.12 } };
    this.mobile = Math.min(window.innerWidth, window.innerHeight) < 700;

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    // un poco de supermuestreo en pantallas normales para que se vea nítido
    r.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.5), 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.92;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(r.domElement);
    r.domElement.setAttribute('aria-label', 'Vista 3D de la piscina. Arrastra para girar, usa la rueda para acercar.');
    r.domElement.style.touchAction = 'none';
    this.aniso = Math.min(16, r.capabilities.getMaxAnisotropy());
    this.maxShadow = Math.min(4096, r.capabilities.maxTextureSize);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    this.camera.position.set(11, 8, 12);
    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.07, maxPolarAngle: Math.PI / 2 - 0.02, minDistance: 2.5, maxDistance: 60, rotateSpeed: 0.7, zoomSpeed: 0.8, panSpeed: 0.6, autoRotateSpeed: 0.7 });
    this.controls.target.set(0, -0.2, 0);
    this.userMoved = false;
    r.domElement.tabIndex = 0; this.controls.listenToKeyEvents(r.domElement); this.controls.keyPanSpeed = 14;
    this.controls.addEventListener('start', () => { this.userMoved = true; this.tween = null; if (this.onInteract) this.onInteract(); });

    this.buildSky();
    this.buildLights();
    this.buildEnvironment();
    this.poolGroup = new THREE.Group(); this.scene.add(this.poolGroup);
    this.buildEnvMaps();
    this.applyNight(0);
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.loop = this.loop.bind(this);
  }

  // ---------- cielo y luces ----------
  buildSky() {
    this.skyU = { uTop: { value: col('#4d9be6') }, uHor: { value: col('#d3e8f6') }, uSunDir: { value: new THREE.Vector3(0.55, 0.55, 0.45) }, uSunCol: { value: col('#fff2d0') }, uNight: { value: 0 }, uTime: this.uni.uTime };
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(230, 40, 28), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog('#d3e8f6', 70, 210);
  }
  buildLights() {
    this.hemi = new THREE.HemisphereLight('#cfe6ff', '#8aa57a', 0.55); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff1d8', 2.5);
    this.sun.castShadow = true;
    const sc = this.sun.shadow.camera; sc.left = -20; sc.right = 20; sc.top = 20; sc.bottom = -20; sc.near = 1; sc.far = 110;
    this.sun.shadow.mapSize.set(this.maxShadow, this.maxShadow); this.sun.shadow.bias = -0.0003; this.sun.shadow.normalBias = 0.035; this.sun.shadow.radius = 3;
    this.scene.add(this.sun, this.sun.target);
    this.moon = new THREE.DirectionalLight('#7da2ff', 0); this.moon.position.set(-20, 22, 10); this.scene.add(this.moon);
    this.terrace = [new THREE.PointLight('#ffb870', 0, 16, 1.5), new THREE.PointLight('#ffb870', 0, 16, 1.5)];
    this.terrace.forEach((l) => this.scene.add(l));
  }
  buildEnvMaps() {
    const pm = new THREE.PMREMGenerator(this.renderer);
    const make = (top, hor, night) => {
      const s = new THREE.Scene();
      const u = { uTop: { value: col(top) }, uHor: { value: col(hor) }, uSunDir: { value: new THREE.Vector3(0.55, 0.55, 0.45) }, uSunCol: { value: col('#fff2d0') }, uNight: { value: night }, uTime: { value: 0 } };
      s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 20), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: u, side: THREE.BackSide })));
      return pm.fromScene(s, 0.03).texture;
    };
    this.envDay = make('#4d9be6', '#d3e8f6', 0);
    this.envNight = make('#050a1a', '#18284a', 1);
    pm.dispose();
    this.scene.environment = this.envDay; this.scene.environmentIntensity = 0.7;
  }
  buildEnvironment() {
    const g = this.envGroup = new THREE.Group(); this.scene.add(g);
    const grass = makeTexture({ kind: 'grass' }, this.aniso);
    grass.map.repeat.set(1 / 5, 1 / 5);
    this.ground = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ map: grass.map, roughness: 1, color: '#a9c486', side: THREE.DoubleSide }));
    this.ground.receiveShadow = true; g.add(this.ground);
    this.house = new THREE.Group(); g.add(this.house);
    this.trees = new THREE.Group(); g.add(this.trees);
    this.furniture = new THREE.Group(); g.add(this.furniture);
    this.hills = new THREE.Group(); g.add(this.hills);
    // colinas lejanas: dan profundidad y esconden el borde del terreno
    const R = seeded(5);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + R() * 0.2, dist = 105 + R() * 40, s = 30 + R() * 30;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshStandardMaterial({ color: '#4f7c4a', roughness: 1 })); m.scale.set(s * 1.6, s * 0.38 + R() * 6, s); m.position.set(Math.cos(a) * dist, -2, Math.sin(a) * dist); m.rotation.y = R() * 3; this.hills.add(m);
    }
  }

  // ---------- día / noche ----------
  setNight(on, instant) { this.nightTarget = on ? 1 : 0; if (instant) { this.night = this.nightTarget; this.applyNight(this.night); } }
  applyNight(n) {
    const T = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), n);
    const top = T('#4d9be6', '#050a1a'), hor = T('#d3e8f6', '#18284a');
    this.skyU.uTop.value.copy(top); this.skyU.uHor.value.copy(hor); this.skyU.uNight.value = n;
    this.scene.fog.color.copy(hor);
    this.sun.intensity = lerp(2.5, 0, Math.min(1, n * 1.6));
    this.moon.intensity = lerp(0, 0.6, n);
    this.hemi.intensity = lerp(0.6, 0.26, n);
    this.hemi.color.copy(T('#cfe6ff', '#2a3d78')); this.hemi.groundColor.copy(T('#8aa57a', '#0d1426'));
    this.renderer.toneMappingExposure = lerp(0.92, 1.2, n);
    this.scene.environmentIntensity = lerp(0.7, 0.35, n);
    this.scene.environment = n > 0.5 ? this.envNight : this.envDay;
    this.terrace.forEach((l) => { l.intensity = lerp(0, 10, n); });
    if (this.winMat) { this.winMat.emissiveIntensity = lerp(0.0, 1.6, n); this.winMat.color.copy(T('#9db8c8', '#2a2f3a')); }
    if (this.waterMat) this.waterMat.uniforms.uNight.value = n;
    if (this.spaMat) this.spaMat.uniforms.uNight.value = n;
    this.hills.children.forEach((h) => h.material.color.copy(T('#4f7c4a', '#0e1a14')));
    this.ground.material.color.copy(T('#a9c486', '#3a4a3c'));
    this.updateLightsAmount();
    this.sun.position.copy(this.skyU.uSunDir.value).multiplyScalar(45);
  }
  updateLightsAmount() {
    const amt = this.lightsOn ? (0.28 + 0.72 * this.night) : 0;
    this.lightAmt = amt;
    if (this.waterMat) this.waterMat.uniforms.uLightAmt.value = amt * 0.5;
    if (this.spaMat) this.spaMat.uniforms.uLightAmt.value = amt * 0.5;
    if (this.poolLights) this.poolLights.forEach((l) => { l.light.intensity = amt * (this.lightsOn ? 11 : 0); l.disc.visible = this.lightsOn; l.disc.material.opacity = 0.55 + 0.45 * this.night; });
    if (this.spaLight) this.spaLight.intensity = amt * 6;
  }

  // ---------- materiales ----------
  tex(key, build) { if (!this.cache.has(key)) this.cache.set(key, build()); return this.cache.get(key); }
  matFrom(t, extra = {}) {
    t.map.repeat.set(1 / t.scale, 1 / t.scale); if (t.bumpMap) t.bumpMap.repeat.set(1 / t.scale, 1 / t.scale);
    return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bumpMap || null, bumpScale: 0.9, roughness: t.rough, metalness: t.metal || 0, side: THREE.DoubleSide, ...extra });
  }
  interiorMaterial(t) {
    const m = this.matFrom(t, { envMapIntensity: 0.9 });
    const uni = this.uni;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uni.uTime; sh.uniforms.uCaus = uni.uCaus; sh.uniforms.uWY = uni.uWY;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP; uniform float uTime; uniform float uCaus; uniform float uWY;
float caus(vec2 p, float t){ float a = 0.0; vec2 q = p*2.1; for(int i=0;i<3;i++){ q += vec2(sin(q.y*1.7+t*0.8+float(i)), cos(q.x*1.5-t*0.7+float(i)*1.7))*0.55; a += abs(sin(q.x)*sin(q.y)); } a /= 3.0; return pow(1.0 - a, 5.0); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
float below = 1.0 - smoothstep(uWY - 0.03, uWY + 0.05, vWP.y);
float cz = caus(vWP.xz*0.9 + vec2(vWP.y*0.4, -vWP.y*0.3), uTime);
diffuseColor.rgb *= 1.0 + cz * uCaus * 0.85 * below;
diffuseColor.rgb *= mix(1.0, 0.88, below);`);
    };
    m.customProgramCacheKey = () => 'interior-caustics';
    return m;
  }
  partMaterial(state, part) {
    const { type, color } = findFinish(state, part);
    const key = `im:${type.id}:${color.id}`;
    if (!this.cache.has(key)) {
      const t = this.tex(`f:${type.id}:${color.id}`, () => finishTexture(type.id, color, this.aniso));
      this.cache.set(key, this.interiorMaterial(t));
    }
    return this.cache.get(key);
  }
  disposeGroup(g) {
    const shared = new Set(); this.cache.forEach((v) => { if (v && v.isMaterial) shared.add(v); });
    g.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!shared.has(m)) m.dispose(); });
      if (o.isReflector && o.dispose) o.dispose();
      if (o.isLight && o.dispose) o.dispose();
    });
    while (g.children.length) g.remove(g.children[0]);
  }

  // ---------- construcción de la piscina ----------
  update(state) {
    this.state = state;
    const { shape, length: L, width: W, depth: D } = state;
    this.disposeGroup(this.poolGroup);
    const pts = this.pts = outline(shape, L, W);
    const bb = this.bb = bounds(pts);
    const floorM = this.partMaterial(state, 'floor'), wallM = this.partMaterial(state, 'walls'), stairM = this.partMaterial(state, 'stairs');
    const g = this.poolGroup;
    const mirror = !!state.mirror;
    const wy = this.waterY = mirror ? -0.03 : -0.12; this.uni.uWY.value = wy;

    g.add(new THREE.Mesh(flatGeometry(pts, null, -D), floorM));
    g.add(new THREE.Mesh(wallsGeometry(pts, 0.0, -D), wallM));

    // escalera: ancho, peldaños, extremo, posición y material propios
    this.stairsInfo = null;
    if (state.stairs && (shape === 'rect' || shape === 'L')) {
      const maxW = W - 0.1;
      const sw = Math.max(0.8, Math.min(state.stairsWidth || 1.6, maxW));
      const end = shape === 'L' ? 'left' : (state.stairsEnd || 'left');
      const rise = 0.28, tread = 0.34;
      const n = Math.max(1, Math.min(state.stairsSteps || 3, Math.floor((D - 0.25) / rise)));
      const pos = state.stairsPos || 'start';
      const z0 = pos === 'center' ? 0 : pos === 'end' ? W / 2 - sw / 2 : -W / 2 + sw / 2;
      const dir = end === 'left' ? 1 : -1, xw = end === 'left' ? -L / 2 : L / 2;
      let vol = 0;
      for (let k = 1; k <= n; k++) {
        const top = -rise * k, h = top + D, len = tread * (n - k + 1);
        const geom = new THREE.BoxGeometry(len, h, sw);
        const mesh = new THREE.Mesh(geom, stairM);
        mesh.position.set(xw + dir * len / 2, -D + h / 2, z0);
        mesh.updateMatrixWorld(); worldUV(geom, mesh.matrixWorld); g.add(mesh);
        vol += len * h * sw;
      }
      this.stairsInfo = { width: sw, steps: n, volume: vol };
    }

    // agua con reflejo real
    const wt = byId(WATERS, state.water);
    const shader = {
      name: 'AquaWater',
      uniforms: {
        color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
        uTime: this.uni.uTime, uNight: { value: this.night }, uLightAmt: { value: 0 }, uOpacity: { value: 0.75 }, uReflect: { value: mirror ? 0.2 : 0.1 },
        uTint: { value: col(wt.shallow) }, uDeep: { value: col(wt.deep) }, uSunDir: this.skyU.uSunDir, uSunCol: this.skyU.uSunCol, uLight: { value: new THREE.Color(1, 0.82, 0.58) }
      },
      vertexShader: WATER_VERT, fragmentShader: WATER_FRAG
    };
    const q = this.mobile ? 0.6 : 0.85;
    const water = new Reflector(flatXY(pts), { color: 0x888888, textureWidth: Math.round((this.host.clientWidth || 900) * q), textureHeight: Math.round((this.host.clientHeight || 600) * q), clipBias: 0.003, shader, multisample: this.mobile ? 0 : 4 });
    water.rotation.x = -Math.PI / 2; water.position.y = wy; water.renderOrder = 5;
    water.material.transparent = true; water.material.depthWrite = false; water.material.side = THREE.DoubleSide;
    this.waterMat = water.material; this.water = water; g.add(water);

    // borde (coping)
    const cp = byId(COPINGS, state.coping);
    if (cp.c && !mirror) {
      const t = this.tex(`c:${cp.id}`, () => surfaceTexture({ ...cp, pattern: cp.pattern || 'plain' }, this.aniso));
      const cm = this.matFrom(t, { envMapIntensity: 0.5 });
      const top = new THREE.Mesh(ribbonGeometry(pts, -0.03, 0.3, 0.05, 0.05), cm);
      const lipIn = new THREE.Mesh(ribbonGeometry(pts, -0.03, -0.03, 0.05, -0.05), cm);
      const lipOut = new THREE.Mesh(ribbonGeometry(pts, 0.3, 0.3, 0.05, 0.0), cm);
      [top, lipIn, lipOut].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
    }

    // terraza
    const spa = !!state.spa;
    const m = 2.9, spaR = 1.15, extraX = spa ? spaR * 2 + 1.7 : 0;
    const dk = byId(DECKS, state.deck);
    const dt = this.tex(`d:${dk.id}`, () => surfaceTexture(dk, this.aniso));
    const dm = this.matFrom(dt, { envMapIntensity: 0.5 });
    const dx0 = bb.minX - m, dx1 = bb.maxX + m + extraX, dz0 = bb.minZ - m, dz1 = bb.maxZ + m;
    this.deckBox = { x0: dx0, x1: dx1, z0: dz0, z1: dz1 };
    const deck = new THREE.Mesh(flatGeometry([[dx0, dz0], [dx1, dz0], [dx1, dz1], [dx0, dz1]], [pts], 0.0), dm);
    deck.receiveShadow = true; g.add(deck);
    // en la piscina espejo el agua llega al borde: una franja fina de sombra lo define
    if (mirror) g.add(new THREE.Mesh(ribbonGeometry(pts, 0, 0.0, 0.0, -0.06), new THREE.MeshStandardMaterial({ color: '#1b2a30', roughness: 0.9, side: THREE.DoubleSide })));

    // spa adosado
    this.spaLight = null; this.spaMat = null; this.spaWater = null;
    if (spa) {
      const cx = bb.maxX + 0.95 + spaR, cz = (bb.minZ + bb.maxZ) / 2, hgt = 0.5;
      const cpItem = cp.c ? cp : DECKS[2];
      const ct = this.tex(`c:${cpItem.id}`, () => surfaceTexture({ ...cpItem, pattern: cpItem.pattern || 'plain' }, this.aniso));
      const cmat = this.matFrom(ct);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(spaR, spaR + 0.02, hgt, 64, 1, true), cmat); wall.position.set(cx, hgt / 2, cz); wall.castShadow = true; g.add(wall);
      const ring = new THREE.Mesh(new THREE.RingGeometry(spaR - 0.22, spaR + 0.04, 64), cmat); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, hgt + 0.001, cz); g.add(ring);
      const sf = new THREE.Mesh(new THREE.CircleGeometry(spaR - 0.2, 48), floorM); sf.rotation.x = -Math.PI / 2; sf.position.set(cx, hgt - 0.62, cz); g.add(sf);
      const sw2 = new THREE.Mesh(new THREE.CylinderGeometry(spaR - 0.2, spaR - 0.2, 0.62, 48, 1, true), wallM); sw2.position.set(cx, hgt - 0.31, cz); g.add(sw2);
      const sm = this.spaMat = new THREE.ShaderMaterial({
        vertexShader: SIMPLE_VERT, fragmentShader: WATER_SIMPLE_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { uTime: this.uni.uTime, uNight: { value: this.night }, uLightAmt: { value: 0 }, uOpacity: { value: 0.9 }, uTint: { value: col(wt.shallow) }, uDeep: { value: col(wt.deep) }, uSkyTop: this.skyU.uTop, uSkyHor: this.skyU.uHor, uSunDir: this.skyU.uSunDir, uSunCol: this.skyU.uSunCol, uLight: { value: new THREE.Color(1, 0.82, 0.58) } }
      });
      const sWater = new THREE.Mesh(new THREE.CircleGeometry(spaR - 0.2, 48), sm); sWater.rotation.x = -Math.PI / 2; sWater.position.set(cx, hgt - 0.1, cz); sWater.renderOrder = 6; g.add(sWater); this.spaWater = sWater;
      this.spaLight = new THREE.PointLight('#ffd9a3', 0, 6, 1.8); this.spaLight.position.set(cx, hgt - 0.3, cz); g.add(this.spaLight);
    }

    // luces subacuáticas
    this.poolLights = [];
    const N = Math.max(4, Math.min(6, Math.round((bb.maxX - bb.minX) / 2)));
    perimeterSamples(pts, N).forEach((s) => {
      const light = new THREE.PointLight('#ffd9a3', 0, 7, 1.7);
      light.position.set(s.x - s.nx * 0.5, -0.75, s.z - s.nz * 0.5); g.add(light);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), new THREE.MeshBasicMaterial({ color: '#ffe9c4', transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false }));
      disc.position.set(s.x - s.nx * 0.02, -0.55, s.z - s.nz * 0.02); disc.lookAt(s.x - s.nx * 1.0, -0.55, s.z - s.nz * 1.0); g.add(disc);
      this.poolLights.push({ light, disc });
    });
    const lt = LIGHTS.find((x) => x.id === state.lights) || LIGHTS[0];
    this.lightsOn = lt.id !== 'off'; this.shift = lt.id === 'color';
    this.setLightColor(lt.rgb || [1, 0.4, 0.4]);
    this.applyNight(this.night);

    this.layoutEnvironment();
    this.sun.shadow.camera.updateProjectionMatrix();
    this.setWater(this.waterOn);
    this.fitInfo = { size: Math.max(L, W), L, W, D };
    if (!this.userMoved && !this.tween) this.setView('aerial', true);
  }
  // quitar o poner el agua (para ver el fondo, los muros y la escalera)
  setWater(on) {
    this.waterOn = on;
    if (this.water) this.water.visible = on;
    if (this.spaWater) this.spaWater.visible = on;
    this.uni.uWY.value = on ? this.waterY : -100;
  }
  setLightColor(rgb) {
    const c = new THREE.Color(rgb[0], rgb[1], rgb[2]);
    if (this.poolLights) this.poolLights.forEach((l) => { l.light.color.copy(c); l.disc.material.color.copy(c).lerp(new THREE.Color(1, 1, 1), 0.45); });
    if (this.spaLight) this.spaLight.color.copy(c);
    if (this.waterMat) this.waterMat.uniforms.uLight.value.copy(c);
    if (this.spaMat) this.spaMat.uniforms.uLight.value.copy(c);
  }

  // ---------- entorno: villa moderna, palmeras, árboles, mobiliario ----------
  blob(r, seed, c1, c2, detail = 3) {
    let g = new THREE.IcosahedronGeometry(r, detail); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 1e-4);
    const R = seeded(seed), pos = g.attributes.position, colors = [];
    const a = col(c1), b = col(c2), tmp = new THREE.Color(), v = new THREE.Vector3(), phase = [R() * 6, R() * 6, R() * 6];
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); const n = v.clone().normalize();
      const d = 1 + 0.16 * Math.sin(n.x * 5 + phase[0]) * Math.cos(n.y * 4.2 + phase[1]) + 0.11 * Math.sin(n.z * 7 + phase[2]) + (R() - 0.5) * 0.05;
      pos.setXYZ(i, n.x * r * d, n.y * r * d * 0.92, n.z * r * d);
      tmp.copy(a).lerp(b, Math.min(1, Math.max(0, (n.y + 1) / 2 + (R() - 0.5) * 0.25))); colors.push(tmp.r, tmp.g, tmp.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); g.computeVertexNormals();
    return g;
  }
  palm(x, z, s, seed) {
    const R = seeded(seed), g = new THREE.Group();
    const lean = [(R() - 0.5) * 1.2, (R() - 0.5) * 1.2];
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean[0] * 0.15, 1.6 * s, lean[1] * 0.15), new THREE.Vector3(lean[0] * 0.5, 3.3 * s, lean[1] * 0.5), new THREE.Vector3(lean[0] * 0.9, 4.8 * s, lean[1] * 0.9)]);
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.13 * s, 8, false), new THREE.MeshStandardMaterial({ color: '#8a6f55', roughness: 0.95 })); trunk.castShadow = true; g.add(trunk);
    const top = curve.getPoint(1), fm = new THREE.MeshStandardMaterial({ color: '#3f8a3c', roughness: 0.75, side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + R() * 0.3, len = (2.4 + R() * 0.9) * s, seg = 10, pos = [], idx = [];
      for (let k = 0; k <= seg; k++) {
        const t = k / seg, w = 0.42 * s * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.7);
        const px = Math.cos(a) * len * t, pz = Math.sin(a) * len * t, py = len * (0.55 * t - 0.95 * t * t) + 0.25 * s;
        const sx = -Math.sin(a) * w, sz = Math.cos(a) * w;
        pos.push(px + sx, py, pz + sz, px - sx, py - 0.02, pz - sz);
        if (k > 0) { const q = (k - 1) * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
      }
      const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setIndex(idx); fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, fm); f.position.copy(top); f.castShadow = true; g.add(f);
    }
    g.position.set(x, 0, z); g.rotation.y = R() * 6; this.trees.add(g);
  }
  layoutEnvironment() {
    [this.house, this.trees, this.furniture].forEach((g) => this.disposeGroup(g));
    const d = this.deckBox, st = this.state;
    this.ground.geometry.dispose();
    this.ground.geometry = flatGeometry([[-170, -170], [170, -170], [170, 170], [-170, 170]], [[[d.x0, d.z0], [d.x1, d.z0], [d.x1, d.z1], [d.x0, d.z1]]], -0.03);
    const cx = (d.x0 + d.x1) / 2, houseZ = d.z0;
    const white = new THREE.MeshStandardMaterial({ color: '#f3f0ea', roughness: 0.85 });
    const dark = new THREE.MeshStandardMaterial({ color: '#2f353b', roughness: 0.55, metalness: 0.4 });
    const woodT = this.tex('house:wood', () => surfaceTexture({ c: '#9b6f44', pattern: 'wood' }, this.aniso)); woodT.map.repeat.set(0.9, 0.9);
    const wood = new THREE.MeshStandardMaterial({ map: woodT.map, roughness: 0.7, color: '#d4ab80' });
    this.winMat = new THREE.MeshStandardMaterial({ color: '#9db8c8', roughness: 0.06, metalness: 0.55, emissive: '#ffcf8e', emissiveIntensity: 0, envMapIntensity: 1.4 });
    const glass = new THREE.MeshStandardMaterial({ color: '#cfe5ee', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.35, envMapIntensity: 1.6 });
    const hw = (d.x1 - d.x0) + 10, h1 = 3.3, hd = 7;
    const add = (geom, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geom, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; this.house.add(m); return m; };
    // planta baja con grandes vidrios
    add(new THREE.BoxGeometry(hw, h1, hd), white, cx, h1 / 2, houseZ - hd / 2);
    const panes = 4, pw = Math.min(4.6, (hw * 0.62) / panes - 0.25), gx0 = cx + hw * 0.1;
    for (let i = 0; i < panes; i++) {
      const px = gx0 + (i - (panes - 1) / 2) * (pw + 0.3);
      add(new THREE.BoxGeometry(pw + 0.14, 2.9, 0.12), dark, px, 1.55, houseZ + 0.05, false);
      add(new THREE.PlaneGeometry(pw, 2.74), this.winMat, px, 1.55, houseZ + 0.12, false);
      add(new THREE.BoxGeometry(0.05, 2.74, 0.05), dark, px, 1.55, houseZ + 0.15, false);
    }
    add(new THREE.BoxGeometry(hw * 0.2, h1 - 0.3, 0.08), wood, cx - hw * 0.4, h1 / 2, houseZ + 0.04, false);
    // planta alta retranqueada, con voladizo de madera y barandilla de cristal
    const up = hw * 0.62, h2 = 3.0, ux = cx + hw * 0.1;
    add(new THREE.BoxGeometry(up, h2, hd - 1.2), white, ux, h1 + h2 / 2, houseZ - (hd - 1.2) / 2 - 0.6);
    add(new THREE.BoxGeometry(up + 0.8, 0.3, 2.6), white, ux, h1 + 0.15, houseZ + 0.7);
    add(new THREE.PlaneGeometry(up + 0.7, 2.5), wood, ux, h1 - 0.01, houseZ + 0.7, false).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(up + 0.8, 1.0, 0.04), glass, ux, h1 + 0.8, houseZ + 1.95, false);
    add(new THREE.BoxGeometry(up + 0.9, 0.05, 0.08), dark, ux, h1 + 1.33, houseZ + 1.95, false);
    for (let i = 0; i < panes - 1; i++) { const px = ux + (i - (panes - 2) / 2) * ((up - 1) / (panes - 1)) * 1.1; add(new THREE.BoxGeometry(pw * 0.9, 2.5, 0.1), dark, px, h1 + h2 / 2 + 0.1, houseZ - 0.55, false); add(new THREE.PlaneGeometry(pw * 0.86, 2.3), this.winMat, px, h1 + h2 / 2 + 0.1, houseZ - 0.48, false); }
    [-up / 2 + 0.2, up / 2 - 0.2].forEach((dx) => add(new THREE.BoxGeometry(0.34, h1, 0.34), white, ux + dx, h1 / 2, houseZ + 1.9));
    add(new THREE.BoxGeometry(up + 1.0, 0.18, hd + 0.6), dark, ux, h1 + h2 + 0.09, houseZ - hd / 2 + 0.4);
    this.terrace[0].position.set(d.x0 + 2, 2.8, houseZ + 0.7); this.terrace[1].position.set(d.x1 - 2, 2.8, houseZ + 0.7);

    // palmeras, árboles y arbustos
    [[d.x0 - 2.6, d.z0 + 1.2, 1.15], [d.x1 + 2.8, d.z0 + 1.8, 1.25], [d.x0 - 4.2, d.z1 - 2.2, 1.0], [d.x1 + 4.2, d.z1 - 2.4, 1.1]].forEach(([x, z, s], i) => this.palm(x, z, s, 30 + i));
    [[d.x0 - 7, d.z0 + 2, 1.5], [d.x0 - 9, (d.z0 + d.z1) / 2, 1.2], [d.x1 + 8, d.z0 + 3, 1.6], [d.x1 + 10, (d.z0 + d.z1) / 2 + 2, 1.3], [cx - 10, d.z0 - 9, 1.9], [cx + 9, d.z0 - 10, 1.7], [cx, d.z0 - 14, 2.1]].forEach(([x, z, s], i) => {
      const g = new THREE.Group(), t = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.17 * s, 1.9 * s, 10), new THREE.MeshStandardMaterial({ color: '#6b5036', roughness: 1 })); t.position.y = 0.95 * s; t.castShadow = true; g.add(t);
      [[0, 2.5, 0, 1.25], [0.6, 2.0, 0.3, 0.85], [-0.55, 2.1, -0.3, 0.9]].forEach(([a, b, c2, rr], k) => { const cr = new THREE.Mesh(this.blob(rr * s, 100 + i * 7 + k, '#356b36', '#7bb257'), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); cr.position.set(a * s, b * s, c2 * s); cr.castShadow = true; g.add(cr); });
      g.position.set(x, 0, z); this.trees.add(g);
    });
    // macetas con arbustos a lo largo de la casa
    for (let i = 0; i < 6; i++) {
      const x = d.x0 + 1.0 + i * ((d.x1 - d.x0 - 2.0) / 5);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.27, 0.55, 24), new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: 0.85 })); pot.position.set(x, 0.275, d.z0 + 0.6); pot.castShadow = true; this.trees.add(pot);
      const bush = new THREE.Mesh(this.blob(0.5, 200 + i, '#2f6b3a', '#6fae58', 2), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })); bush.position.set(x, 0.95, d.z0 + 0.6); bush.castShadow = true; this.trees.add(bush);
    }
    // tumbonas y sombrilla al fondo, mirando a la piscina
    if (st.loungers) {
      const frame = new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.6 }), cush = new THREE.MeshStandardMaterial({ color: '#ebe4d4', roughness: 0.95 });
      const lounger = (x, z, rot) => {
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 1.35), frame); base.position.set(0, 0.34, 0.2); base.castShadow = true; g.add(base);
        const cu = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 1.28), cush); cu.position.set(0, 0.43, 0.2); cu.castShadow = true; g.add(cu);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.75), frame); back.position.set(0, 0.62, -0.8); back.rotation.x = 0.62; back.castShadow = true; g.add(back);
        const bc = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 0.7), cush); bc.position.set(0, 0.68, -0.8); bc.rotation.x = 0.62; bc.castShadow = true; g.add(bc);
        [[-0.3, 0.7], [0.3, 0.7], [-0.3, -0.35], [0.3, -0.35]].forEach(([lx, lz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 8), frame); l.position.set(lx, 0.17, lz); g.add(l); });
        g.position.set(x, 0, z); g.rotation.y = rot; this.furniture.add(g);
      };
      const bb = this.bb, zf = bb.minZ - 1.55, mx = (bb.minX + bb.maxX) / 2;
      lounger(mx - 1.5, zf, 0); lounger(mx - 0.3, zf, 0);
      const parasol = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), frame); pole.position.y = 1.15; parasol.add(pole);
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.4, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9, side: THREE.DoubleSide })); top.position.y = 2.3; top.castShadow = true; parasol.add(top);
      parasol.position.set(mx + 1.3, 0, zf - 0.2); this.furniture.add(parasol);
    }
  }

  // ---------- cámara ----------
  setView(name, instant) {
    const f = this.fitInfo || { size: 9, L: 9, W: 4 }, s = f.size, L = f.L, W = f.W;
    let p, t;
    if (name === 'front') { p = [0, 2.3, W / 2 + s * 1.05 + 3]; t = [0, 0.3, 0]; }
    else if (name === 'top') { p = [0.01, s * 1.55 + 6, 0.01]; t = [0, 0, 0]; }
    else if (name === 'water') { p = [-L / 2 - 2.8, 0.9, W / 2 + 3.2]; t = [L * 0.12, -0.2, 0]; }
    else if (name === 'house') { p = [L * 0.2, 2.0, this.deckBox ? this.deckBox.z1 + 4 + s * 0.25 : 14]; t = [L * 0.05, 1.5, this.deckBox ? this.deckBox.z0 : -6]; }
    else { p = [s * 1.05 + 5.5, s * 0.6 + 4.2, s * 1.05 + W * 0.5 + 7]; t = [0.5, 0.2, -1.2]; name = 'aerial'; }
    this.currentView = name;
    if (this.house) this.house.visible = name !== 'top';
    this.controls.maxDistance = Math.max(30, s * 4);
    if (instant) { this.camera.position.set(...p); this.controls.target.set(...t); this.controls.update(); return; }
    this.userMoved = true;
    this.tween = { t0: performance.now(), dur: 1100, p0: this.camera.position.clone(), t0v: this.controls.target.clone(), p1: new THREE.Vector3(...p), t1: new THREE.Vector3(...t) };
  }

  // ---------- bucle ----------
  resize() {
    const w = this.host.clientWidth || 800, h = this.host.clientHeight || 500;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h; this.camera.fov = w / h < 0.9 ? 54 : 40; this.camera.updateProjectionMatrix();
    if (this.water) { const q = this.mobile ? 0.6 : 0.85; this.water.getRenderTarget().setSize(Math.round(w * q), Math.round(h * q)); }
  }
  start() { if (this.running || this.disposed) return; this.running = true; this.last = performance.now(); requestAnimationFrame(this.loop); }
  stop() { this.running = false; }
  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.time += dt * (reduce ? 0.3 : 1); this.uni.uTime.value = this.time;
    if (Math.abs(this.night - this.nightTarget) > 0.001) { this.night += Math.sign(this.nightTarget - this.night) * Math.min(Math.abs(this.nightTarget - this.night), dt / 1.3); this.applyNight(this.night); }
    if (this.shift && this.lightsOn) { const h = (this.time * 0.08) % 1; const c = new THREE.Color().setHSL(h, 0.9, 0.55); this.setLightColor([c.r, c.g, c.b]); }
    if (this.tween) { const k = Math.min(1, (now - this.tween.t0) / this.tween.dur), e = ease(k); this.camera.position.lerpVectors(this.tween.p0, this.tween.p1, e); this.controls.target.lerpVectors(this.tween.t0v, this.tween.t1, e); if (k >= 1) this.tween = null; }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    if (!this.firstDone) { this.firstDone = true; if (this.onFirst) this.onFirst(); }
    requestAnimationFrame(this.loop);
  }
  snapshot() { this.renderer.render(this.scene, this.camera); return this.renderer.domElement; }
  dispose() {
    this.disposed = true; this.running = false; this.ro.disconnect(); this.controls.dispose();
    [this.poolGroup, this.house, this.trees, this.furniture, this.hills].forEach((g) => this.disposeGroup(g));
    this.renderer.dispose(); if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}
