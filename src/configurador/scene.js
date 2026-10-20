import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { outline, bounds, flatGeometry, wallsGeometry, ribbonGeometry, worldUV, perimeterSamples, WATER_Y } from './geometry.js';
import { finishTexture, surfaceTexture, makeTexture } from './textures.js';
import { findFinish, byId, COPINGS, DECKS, WATERS, LIGHTS } from './catalog.js';

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const col = (h) => new THREE.Color(h);

// ---------- Cielo ----------
const SKY_VERT = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const SKY_FRAG = `
varying vec3 vDir;
uniform vec3 uTop, uHor, uSunDir, uSunCol; uniform float uNight;
float hash(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
void main(){
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHor, uTop, pow(h, 0.55));
  if (d.y < 0.0) c = mix(uHor, uHor*0.55, clamp(-d.y*3.0,0.0,1.0));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  c += uSunCol * (pow(s, 900.0) * 6.0 + pow(s, 14.0) * 0.28) * (1.0 - uNight*0.2);
  float star = step(0.9975, hash(floor(d*260.0))) * smoothstep(0.05, 0.4, d.y) * uNight;
  c += vec3(star);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

// ---------- Agua ----------
const WATER_VERT = 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const WATER_FRAG = `
varying vec3 vW;
uniform float uTime, uNight, uLightAmt, uOpacity;
uniform vec3 uTint, uDeep, uSkyTop, uSkyHor, uSunDir, uSunCol, uLight;
vec3 skyCol(vec3 d){ float t = clamp(d.y*1.6+0.05, 0.0, 1.0); return mix(uSkyHor, uSkyTop, pow(t, 0.7)); }
void main(){
  vec2 p = vW.xz; float t = uTime;
  vec2 g = vec2(0.0);
  g += vec2(cos(p.x*1.7+t*0.9), sin(p.y*1.9+t*0.8))*0.020;
  g += vec2(cos(p.x*3.9-t*1.3+p.y*1.1), sin(p.y*4.3+t*1.1-p.x*0.7))*0.012;
  g += vec2(cos(p.x*9.0+t*2.0+p.y*2.0), sin(p.y*8.0-t*1.8))*0.0042;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0) * 0.72 + 0.02;
  vec3 R = reflect(-V, n);
  vec3 refl = skyCol(R);
  float spec = pow(max(dot(R, normalize(uSunDir)), 0.0), 260.0);
  vec3 body = mix(uTint, uDeep, 0.62);
  body += uLight * uLightAmt;
  body *= mix(1.0, 0.55, uNight*(1.0-uLightAmt));
  vec3 c = mix(body, refl, fres) + uSunCol * spec * 2.2 * (1.0 - uNight*0.75);
  float a = clamp(mix(uOpacity*0.72, 0.95, fres) + uLightAmt*0.16, 0.0, 0.98);
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`;

export class PoolScene {
  constructor(host) {
    this.host = host;
    this.time = 0; this.night = 0; this.nightTarget = 0; this.running = false; this.disposed = false;
    this.cache = new Map(); this.lightsOn = false; this.lightRGB = [1, 0.82, 0.58]; this.shift = false;
    this.uni = { uTime: { value: 0 }, uCaus: { value: 0.7 } };

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(r.domElement);
    r.domElement.setAttribute('aria-label', 'Vista 3D de la piscina. Arrastra para girar, usa la rueda para acercar.');
    r.domElement.style.touchAction = 'none';
    this.aniso = Math.min(8, r.capabilities.getMaxAnisotropy());

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
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
    this.skyU = { uTop: { value: col('#5aa2e8') }, uHor: { value: col('#cfe6f6') }, uSunDir: { value: new THREE.Vector3(0.55, 0.62, 0.45) }, uSunCol: { value: col('#fff2d0') }, uNight: { value: 0 } };
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 24), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog('#cfe6f6', 55, 180);
  }
  buildLights() {
    this.hemi = new THREE.HemisphereLight('#cfe6ff', '#6b8a5a', 0.7); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff0d4', 2.6);
    this.sun.position.set(22, 25, 18); this.sun.castShadow = true;
    const sc = this.sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 90;
    this.sun.shadow.mapSize.set(2048, 2048); this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);
    this.moon = new THREE.DirectionalLight('#7da2ff', 0); this.moon.position.set(-20, 22, 10); this.scene.add(this.moon);
    this.terrace = [new THREE.PointLight('#ffb870', 0, 14, 1.6), new THREE.PointLight('#ffb870', 0, 14, 1.6)];
    this.terrace.forEach((l) => this.scene.add(l));
  }
  buildEnvMaps() {
    const pm = new THREE.PMREMGenerator(this.renderer);
    const make = (top, hor, night) => {
      const s = new THREE.Scene();
      const u = { uTop: { value: col(top) }, uHor: { value: col(hor) }, uSunDir: { value: new THREE.Vector3(0.55, 0.62, 0.45) }, uSunCol: { value: col('#fff2d0') }, uNight: { value: night } };
      s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: u, side: THREE.BackSide })));
      const t = pm.fromScene(s, 0.04); return t.texture;
    };
    this.envDay = make('#5aa2e8', '#cfe6f6', 0);
    this.envNight = make('#050a1a', '#18284a', 1);
    pm.dispose();
    this.scene.environment = this.envDay; this.scene.environmentIntensity = 0.6;
  }
  buildEnvironment() {
    const g = this.envGroup = new THREE.Group(); this.scene.add(g);
    const grass = makeTexture({ kind: 'grass' }, this.aniso);
    grass.map.repeat.set(1 / 5, 1 / 5);
    this.ground = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ map: grass.map, roughness: 1, color: '#b9d6a0', side: THREE.DoubleSide }));
    this.ground.receiveShadow = true; g.add(this.ground);
    this.house = new THREE.Group(); g.add(this.house);
    this.trees = new THREE.Group(); g.add(this.trees);
    this.furniture = new THREE.Group(); g.add(this.furniture);
  }

  // ---------- día / noche ----------
  setNight(on, instant) { this.nightTarget = on ? 1 : 0; if (instant) { this.night = this.nightTarget; this.applyNight(this.night); } }
  applyNight(n) {
    const T = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), n);
    const top = T('#5aa2e8', '#050a1a'), hor = T('#cfe6f6', '#18284a');
    this.skyU.uTop.value.copy(top); this.skyU.uHor.value.copy(hor); this.skyU.uNight.value = n;
    this.scene.fog.color.copy(hor);
    this.sun.intensity = lerp(2.6, 0, Math.min(1, n * 1.6));
    this.moon.intensity = lerp(0, 0.55, n);
    this.hemi.intensity = lerp(0.72, 0.28, n);
    this.hemi.color.copy(T('#cfe6ff', '#2a3d78')); this.hemi.groundColor.copy(T('#6b8a5a', '#0d1426'));
    this.renderer.toneMappingExposure = lerp(1.0, 1.15, n);
    this.scene.environmentIntensity = lerp(0.6, 0.35, n);
    this.scene.environment = n > 0.5 ? this.envNight : this.envDay;
    this.terrace.forEach((l) => { l.intensity = lerp(0, 9, n); });
    if (this.winMat) { this.winMat.emissiveIntensity = lerp(0.0, 1.5, n); this.winMat.color.copy(T('#9db8c8', '#2a2f3a')); }
    if (this.waterMat) { this.waterMat.uniforms.uNight.value = n; }
    this.updateLightsAmount();
    const sunDir = this.skyU.uSunDir.value; this.sun.position.copy(sunDir).multiplyScalar(40);
  }
  updateLightsAmount() {
    const amt = this.lightsOn ? (0.28 + 0.72 * this.night) : 0;
    this.lightAmt = amt;
    if (this.waterMat) this.waterMat.uniforms.uLightAmt.value = amt * 0.5;
    if (this.poolLights) this.poolLights.forEach((l) => { l.light.intensity = amt * (this.lightsOn ? 11 : 0); l.disc.visible = this.lightsOn; l.disc.material.opacity = 0.55 + 0.45 * this.night; });
    if (this.spaLight) { this.spaLight.intensity = amt * 6; }
  }

  // ---------- construcción de la piscina ----------
  tex(key, build) { if (!this.cache.has(key)) this.cache.set(key, build()); return this.cache.get(key); }
  matFrom(t, extra = {}) {
    t.map.repeat.set(1 / t.scale, 1 / t.scale); if (t.bumpMap) t.bumpMap.repeat.set(1 / t.scale, 1 / t.scale);
    return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bumpMap || null, bumpScale: 0.9, roughness: t.rough, metalness: t.metal || 0, side: THREE.DoubleSide, ...extra });
  }
  interiorMaterial(t) {
    const m = this.matFrom(t, { envMapIntensity: 0.9 });
    const uni = this.uni;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uni.uTime; sh.uniforms.uCaus = uni.uCaus;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP; uniform float uTime; uniform float uCaus;
float caus(vec2 p, float t){ float a = 0.0; vec2 q = p*2.1; for(int i=0;i<3;i++){ q += vec2(sin(q.y*1.7+t*0.8+float(i)), cos(q.x*1.5-t*0.7+float(i)*1.7))*0.55; a += abs(sin(q.x)*sin(q.y)); } a /= 3.0; return pow(1.0 - a, 5.0); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
float below = 1.0 - smoothstep(-0.16, -0.08, vWP.y);
float cz = caus(vWP.xz*0.9 + vec2(vWP.y*0.4, -vWP.y*0.3), uTime);
diffuseColor.rgb *= 1.0 + cz * uCaus * 0.85 * below;
diffuseColor.rgb *= mix(1.0, 0.9, below);`);
    };
    m.customProgramCacheKey = () => 'interior-caustics';
    return m;
  }
  disposeGroup(g) { g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); if (o.isLight && o.dispose) o.dispose(); }); while (g.children.length) g.remove(g.children[0]); }

  update(state) {
    this.state = state;
    const { shape, length: L, width: W, depth: D } = state;
    this.disposeGroup(this.poolGroup);
    const pts = this.pts = outline(shape, L, W);
    const bb = this.bb = bounds(pts);
    const { type, color } = findFinish(state);
    const ft = this.tex(`f:${type.id}:${color.id}`, () => finishTexture(type.id, color, this.aniso));
    const inner = this.interiorMaterial(ft);
    const g = this.poolGroup;

    // interior
    const floor = new THREE.Mesh(flatGeometry(pts, null, -D), inner); floor.receiveShadow = false; g.add(floor);
    const walls = new THREE.Mesh(wallsGeometry(pts, 0.0, -D), inner); g.add(walls);

    // escalera
    if (state.stairs !== 'none' && (shape === 'rect' || shape === 'L')) {
      const sw = state.stairs === 'full' ? W - 0.02 : Math.min(1.4, W * 0.45);
      const z0 = -W / 2 + sw / 2;
      for (let k = 1; k <= 3; k++) {
        const top = -0.3 * k; if (-D > top - 0.2) continue;
        const h = top + D, len = 0.34 * k;
        const geom = new THREE.BoxGeometry(len, h, sw);
        const mesh = new THREE.Mesh(geom, inner);
        mesh.position.set(-L / 2 + len / 2, -D + h / 2, z0);
        mesh.updateMatrixWorld(); worldUV(geom, mesh.matrixWorld);
        g.add(mesh);
      }
    }

    // agua
    const wt = byId(WATERS, state.water);
    const wm = this.waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT, fragmentShader: WATER_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: {
        uTime: this.uni.uTime, uNight: { value: this.night }, uLightAmt: { value: 0 }, uOpacity: { value: 0.75 },
        uTint: { value: col(wt.shallow) }, uDeep: { value: col(wt.deep) },
        uSkyTop: this.skyU.uTop, uSkyHor: this.skyU.uHor, uSunDir: this.skyU.uSunDir, uSunCol: this.skyU.uSunCol, uLight: { value: new THREE.Color(1, 0.82, 0.58) }
      }
    });
    const water = new THREE.Mesh(flatGeometry(pts, null, WATER_Y), wm); water.renderOrder = 5; g.add(water);

    // borde (coping)
    const cp = byId(COPINGS, state.coping);
    if (cp.c) {
      const t = this.tex(`c:${cp.id}`, () => surfaceTexture({ ...cp, pattern: cp.pattern || 'plain' }, this.aniso));
      const cm = this.matFrom(t, { envMapIntensity: 0.5 });
      const top = new THREE.Mesh(ribbonGeometry(pts, -0.03, 0.3, 0.05, 0.05), cm);
      const lipIn = new THREE.Mesh(ribbonGeometry(pts, -0.03, -0.03, 0.05, -0.05), cm);
      const lipOut = new THREE.Mesh(ribbonGeometry(pts, 0.3, 0.3, 0.05, 0.0), cm);
      [top, lipIn, lipOut].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
    }

    // terraza
    const spa = !!state.spa; this.spaOn = spa;
    const m = 2.7, spaR = 1.15, extraX = spa ? spaR * 2 + 1.7 : 0;
    const dk = byId(DECKS, state.deck);
    const dt = this.tex(`d:${dk.id}`, () => surfaceTexture(dk, this.aniso));
    const dm = this.matFrom(dt, { envMapIntensity: 0.45 });
    const dx0 = bb.minX - m, dx1 = bb.maxX + m + extraX, dz0 = bb.minZ - m, dz1 = bb.maxZ + m;
    this.deckBox = { x0: dx0, x1: dx1, z0: dz0, z1: dz1 };
    const deck = new THREE.Mesh(flatGeometry([[dx0, dz0], [dx1, dz0], [dx1, dz1], [dx0, dz1]], [pts], 0.0), dm);
    deck.receiveShadow = true; g.add(deck);
    // base de la piscina para que el suelo no deje ver el césped por los muros

    // spa adosado
    this.spaLight = null;
    if (spa) {
      const cx = bb.maxX + 0.95 + spaR, cz = (bb.minZ + bb.maxZ) / 2, hgt = 0.5;
      const cpItem = cp.c ? cp : DECKS[2];
      const ct = this.tex(`c:${cpItem.id}`, () => surfaceTexture({ ...cpItem, pattern: cpItem.pattern || 'plain' }, this.aniso));
      const cmat = this.matFrom(ct);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(spaR, spaR + 0.02, hgt, 48, 1, true), cmat); wall.position.set(cx, hgt / 2, cz); wall.castShadow = true; g.add(wall);
      const ring = new THREE.Mesh(new THREE.RingGeometry(spaR - 0.22, spaR + 0.04, 48), cmat); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, hgt + 0.001, cz); g.add(ring);
      const sf = new THREE.Mesh(new THREE.CircleGeometry(spaR - 0.2, 40), inner); sf.rotation.x = -Math.PI / 2; sf.position.set(cx, hgt - 0.62, cz); g.add(sf);
      const sw = new THREE.Mesh(new THREE.CylinderGeometry(spaR - 0.2, spaR - 0.2, 0.62, 40, 1, true), inner); sw.position.set(cx, hgt - 0.31, cz); g.add(sw);
      const sm = wm.clone(); sm.uniforms = { ...wm.uniforms, uOpacity: { value: 0.9 } };
      const sWater = new THREE.Mesh(new THREE.CircleGeometry(spaR - 0.2, 40), sm); sWater.rotation.x = -Math.PI / 2; sWater.position.set(cx, hgt - 0.1, cz); sWater.renderOrder = 6; g.add(sWater);
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
    this.updateLightsAmount();

    this.layoutEnvironment();
    this.sun.shadow.camera.updateProjectionMatrix();
    this.fitInfo = { size: Math.max(L, W), L, W, D };
    if (!this.userMoved && !this.tween) this.setView('aerial', true);
  }
  setLightColor(rgb) {
    const c = new THREE.Color(rgb[0], rgb[1], rgb[2]);
    if (this.poolLights) this.poolLights.forEach((l) => { l.light.color.copy(c); l.disc.material.color.copy(c).lerp(new THREE.Color(1, 1, 1), 0.45); });
    if (this.spaLight) this.spaLight.color.copy(c);
    if (this.waterMat) this.waterMat.uniforms.uLight.value.copy(c);
  }

  // ---------- entorno: casa, árboles, mobiliario ----------
  layoutEnvironment() {
    [this.house, this.trees, this.furniture].forEach((g) => this.disposeGroup(g));
    const d = this.deckBox, st = this.state;
    this.ground.geometry.dispose();
    this.ground.geometry = flatGeometry([[-160, -160], [160, -160], [160, 160], [-160, 160]], [[[d.x0, d.z0], [d.x1, d.z0], [d.x1, d.z1], [d.x0, d.z1]]], -0.03);
    const cx = (d.x0 + d.x1) / 2, houseZ = d.z0;
    const white = new THREE.MeshStandardMaterial({ color: '#efece6', roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: '#3a4046', roughness: 0.6, metalness: 0.35 });
    const woodT = this.tex('house:wood', () => surfaceTexture(DECKS[1], this.aniso)); woodT.map.repeat.set(1.2, 0.6);
    const wood = new THREE.MeshStandardMaterial({ map: woodT.map, roughness: 0.75, color: '#caa27a' });
    this.winMat = new THREE.MeshStandardMaterial({ color: '#9db8c8', roughness: 0.08, metalness: 0.5, emissive: '#ffcf8e', emissiveIntensity: 0, envMapIntensity: 1.2 });
    const hw = (d.x1 - d.x0) + 12, hh = 3.6, hd = 6;
    const body = new THREE.Mesh(new THREE.BoxGeometry(hw, hh, hd), white); body.position.set(cx, hh / 2, houseZ - hd / 2); body.castShadow = true; body.receiveShadow = true; this.house.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(hw + 1.2, 0.18, hd + 2.4), dark); roof.position.set(cx, hh + 0.09, houseZ - hd / 2 + 0.6); roof.castShadow = true; this.house.add(roof);
    const band = new THREE.Mesh(new THREE.BoxGeometry(hw * 0.34, hh - 0.2, 0.06), wood); band.position.set(cx - hw * 0.28, hh / 2, houseZ + 0.03); this.house.add(band);
    const panes = 3, pw = Math.min(5.2, (hw * 0.5) / panes - 0.2);
    for (let i = 0; i < panes; i++) {
      const px = cx + hw * 0.05 + i * (pw + 0.35) - (panes - 1) * (pw + 0.35) / 2 + hw * 0.16;
      const f = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.16, 2.7, 0.1), dark); f.position.set(px, 1.5, houseZ + 0.05); this.house.add(f);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(pw, 2.55), this.winMat); gl.position.set(px, 1.5, houseZ + 0.115); this.house.add(gl);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.55, 0.06), dark); bar.position.set(px, 1.5, houseZ + 0.14); this.house.add(bar);
    }
    this.terrace[0].position.set(d.x0 + 2, 2.6, houseZ + 0.6); this.terrace[1].position.set(d.x1 - 2, 2.6, houseZ + 0.6);

    // vegetación
    const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a46', roughness: 0.9 }), leaf2 = new THREE.MeshStandardMaterial({ color: '#6aa35a', roughness: 0.9 }), trunk = new THREE.MeshStandardMaterial({ color: '#6b5036', roughness: 1 });
    const tree = (x, z, s, m) => {
      const g = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.14 * s, 1.6 * s, 8), trunk); t.position.y = 0.8 * s; t.castShadow = true; g.add(t);
      [[0, 2.1, 0, 1.1], [0.5, 1.7, 0.2, 0.75], [-0.45, 1.8, -0.2, 0.8]].forEach(([a, b, c, r]) => { const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 1), m); cr.position.set(a * s, b * s, c * s); cr.castShadow = true; g.add(cr); });
      g.position.set(x, 0, z); this.trees.add(g);
    };
    const R = (a, b, s) => a + (Math.sin(s * 12.9898) * 43758.5453 % 1 + 1) % 1 * (b - a);
    [[d.x0 - 5.5, d.z0 + 0.5, 1.15], [d.x0 - 7.5, (d.z0 + d.z1) / 2 - 1, 0.95], [d.x0 - 6.2, d.z1 - 3, 1.05], [d.x1 + 5.5, d.z0 + 1.5, 1.1], [d.x1 + 7.5, (d.z0 + d.z1) / 2, 1.0], [d.x1 + 6.5, d.z1 - 2.5, 0.9], [cx - 9, d.z0 - 8, 1.5], [cx + 8, d.z0 - 9, 1.3]].forEach(([x, z, s], i) => tree(x, z, s, i % 2 ? leaf : leaf2));
    // setos / macetas junto a la casa
    for (let i = 0; i < 5; i++) {
      const x = d.x0 + 1.2 + i * ((d.x1 - d.x0 - 2.4) / 4);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.5, 20), new THREE.MeshStandardMaterial({ color: '#d9d4c9', roughness: 0.85 })); pot.position.set(x, 0.25, d.z0 + 0.55); pot.castShadow = true; this.trees.add(pot);
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), i % 2 ? leaf : leaf2); bush.position.set(x, 0.85, d.z0 + 0.55); bush.scale.y = 1.2; bush.castShadow = true; this.trees.add(bush);
    }
    // tumbonas
    if (st.loungers) {
      const frame = new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.6 }), cush = new THREE.MeshStandardMaterial({ color: '#e9e2d3', roughness: 0.95 });
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
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.4, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9, side: THREE.DoubleSide })); top.position.y = 2.3; top.castShadow = true; parasol.add(top);
      parasol.position.set(mx + 1.3, 0, zf - 0.2); this.furniture.add(parasol);
    }
  }

  // ---------- cámara ----------
  setView(name, instant) {
    const f = this.fitInfo || { size: 9, L: 9, W: 4 }, s = f.size, L = f.L, W = f.W;
    let p, t;
    if (name === 'front') { p = [0, 2.3, W / 2 + s * 1.05 + 3]; t = [0, 0.3, 0]; }
    else if (name === 'top') { p = [0.01, s * 1.55 + 6, 0.01]; t = [0, 0, 0]; }
    else if (name === 'water') { p = [-L / 2 - 2.8, 1.0, W / 2 + 3.2]; t = [L * 0.12, -0.3, 0]; }
    else if (name === 'house') { p = [L * 0.2, 2.0, this.deckBox ? this.deckBox.z1 + 4 + s * 0.25 : 14]; t = [L * 0.05, 1.5, this.deckBox ? this.deckBox.z0 : -6]; }
    else { p = [s * 0.9 + 3.5, s * 0.66 + 3.4, s * 0.9 + W * 0.5 + 4.5]; t = [0, -0.4, -0.3]; name = 'aerial'; }
    this.currentView = name;
    if (this.house) this.house.visible = name !== 'top';   // en planta, la casa no tapa la piscina
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
    this.camera.aspect = w / h; this.camera.fov = w / h < 0.9 ? 56 : 42; this.camera.updateProjectionMatrix();
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
    this.disposeGroup(this.poolGroup); this.disposeGroup(this.house); this.disposeGroup(this.trees); this.disposeGroup(this.furniture);
    this.renderer.dispose(); if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}
