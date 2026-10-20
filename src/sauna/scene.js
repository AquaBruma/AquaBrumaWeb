import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeTexture } from '../configurador/textures.js';
import { worldUV } from '../configurador/geometry.js';
import { WOODS, LED_COLORS, byId } from './catalog.js';
import { computeLayout } from './layout.js';

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const col = (h) => new THREE.Color(h);
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export class SaunaScene {
  constructor(host) {
    this.host = host; this.running = false; this.disposed = false; this.night = 0; this.nightTarget = 0;
    this.cache = new Map(); this.view = 'cutaway'; this.userMoved = false; this.time = 0;
    this.mobile = Math.min(window.innerWidth, window.innerHeight) < 700;

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.5), 2));
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(r.domElement);
    r.domElement.setAttribute('aria-label', 'Vista 3D de la sauna. Arrastra para girar, usa la rueda para acercar.');
    r.domElement.style.touchAction = 'none';
    this.aniso = Math.min(16, r.capabilities.getMaxAnisotropy());

    this.scene = new THREE.Scene();
    this.scene.background = col('#d8d4cc'); this.scene.fog = new THREE.Fog('#d8d4cc', 14, 46);
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.05, 120);
    this.camera.position.set(5, 3.4, 5.6);
    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.07, maxPolarAngle: Math.PI / 2 - 0.01, minDistance: 0.4, maxDistance: 16, rotateSpeed: 0.7, zoomSpeed: 0.8, panSpeed: 0.6, autoRotateSpeed: 0.8 });
    this.controls.target.set(0, 1.0, 0);
    r.domElement.tabIndex = 0; this.controls.listenToKeyEvents(r.domElement);
    this.controls.addEventListener('start', () => { this.userMoved = true; this.tween = null; if (this.onInteract) this.onInteract(); });

    const pm = new THREE.PMREMGenerator(r);
    this.envDay = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.scene.environment = this.envDay; this.scene.environmentIntensity = 0.55;

    this.hemi = new THREE.HemisphereLight('#fff6e8', '#9a948a', 0.5); this.scene.add(this.hemi);
    this.key = new THREE.DirectionalLight('#fff3df', 2.1); this.key.position.set(4, 7, 5);
    this.key.castShadow = true; this.key.shadow.mapSize.set(2048, 2048); this.key.shadow.bias = -0.0004; this.key.shadow.normalBias = 0.02; this.key.shadow.radius = 3;
    const sc = this.key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 24;
    this.scene.add(this.key, this.key.target);
    this.fill = new THREE.PointLight('#fff1dc', 4, 9, 1.6); this.scene.add(this.fill);

    // piso del cuarto (baldosa clara que se pierde en la niebla)
    const ft = makeTexture({ kind: 'tiles', base: '#cdc7bc', n: 2, gap: 1.4, vari: 0.1, seed: 3, S: 1024 }, this.aniso);
    ft.map.repeat.set(66, 66); if (ft.bumpMap) ft.bumpMap.repeat.set(66, 66);
    this.floorMat = new THREE.MeshStandardMaterial({ map: ft.map, bumpMap: ft.bumpMap, bumpScale: 0.6, roughness: 0.55, metalness: 0 });
    this.roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), this.floorMat); this.roomFloor.rotation.x = -Math.PI / 2; this.roomFloor.position.y = -0.002; this.roomFloor.receiveShadow = true; this.scene.add(this.roomFloor);

    this.cabin = new THREE.Group(); this.scene.add(this.cabin);
    this.parts = {};
    this.applyNight(0);
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.loop = this.loop.bind(this);
  }

  // ---------- materiales ----------
  woodMat(id, tint) {
    const key = `w:${id}:${tint || ''}`;
    if (!this.cache.has(key)) {
      const w = byId(WOODS, id);
      const t = makeTexture({ kind: 'wood', base: w.c, seed: w.seed }, this.aniso);
      t.map.repeat.set(1.35, 1.35); if (t.bumpMap) t.bumpMap.repeat.set(1.35, 1.35);
      this.cache.set(key, new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bumpMap, bumpScale: 0.8, roughness: 0.72, metalness: 0, color: tint || '#ffffff', envMapIntensity: 0.6 }));
    }
    return this.cache.get(key);
  }
  std(key, props) { if (!this.cache.has(key)) this.cache.set(key, new THREE.MeshStandardMaterial(props)); return this.cache.get(key); }
  disposeGroup(g) {
    const shared = new Set(); this.cache.forEach((v) => { if (v && v.isMaterial) shared.add(v); });
    g.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!shared.has(m)) m.dispose(); });
      if (o.isLight && o.dispose) o.dispose();
    });
    while (g.children.length) g.remove(g.children[0]);
  }
  // caja por límites; las UV siguen metros del mundo para que la veta no se estire
  box(parent, x0, x1, y0, y1, z0, z1, mat, o = {}) {
    const g = new THREE.BoxGeometry(Math.max(0.001, x1 - x0), Math.max(0.001, y1 - y0), Math.max(0.001, z1 - z0));
    const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false; m.updateMatrix();
    if (o.uv !== false) {
      worldUV(g, m.matrix);
      if (o.swap) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i)); uv.needsUpdate = true; }
    }
    parent.add(m); return m;
  }

  // ---------- construcción ----------
  update(st) {
    this.state = st;
    const L = this.L = computeLayout(st);
    const { W, D, H } = L;
    this.disposeGroup(this.cabin);
    const mk = (n) => { const g = new THREE.Group(); g.name = n; this.cabin.add(g); return g; };
    const P = this.parts = { front: mk('front'), back: mk('back'), left: mk('left'), right: mk('right'), ceil: mk('ceil'), inner: mk('inner') };
    const wallM = this.woodMat(st.ceilWood === st.wallWood ? st.wallWood : st.wallWood), ceilM = this.woodMat(st.ceilWood), extM = this.woodMat(st.extWood), benchM = this.woodMat(st.benchWood);
    const dark = this.std('dark', { color: '#26282c', roughness: 0.5, metalness: 0.5 });
    const hy = H - 0.09, oT = 0.055, iT = 0.035;

    // muros de fondo y laterales: capa exterior e interior
    const slab = (grp, x0, x1, y0, y1, z0, z1, side) => {
      // side: 'z-' | 'z+' | 'x-' | 'x+' (hacia dónde mira el exterior)
      if (side === 'z-') { this.box(grp, x0, x1, y0, y1, z0, z0 + oT, extM); this.box(grp, x0, x1, y0, y1, z0 + oT, z1, wallM); }
      else if (side === 'z+') { this.box(grp, x0, x1, y0, y1, z1 - oT, z1, extM); this.box(grp, x0, x1, y0, y1, z0, z1 - oT, wallM); }
      else if (side === 'x-') { this.box(grp, x0, x0 + oT, y0, y1, z0, z1, extM); this.box(grp, x0 + oT, x1, y0, y1, z0, z1, wallM); }
      else { this.box(grp, x1 - oT, x1, y0, y1, z0, z1, extM); this.box(grp, x0, x1 - oT, y0, y1, z0, z1, wallM); }
    };
    slab(P.back, -W / 2, W / 2, 0, hy, -D / 2, -D / 2 + 0.09, 'z-');
    slab(P.left, -W / 2, -W / 2 + 0.09, 0, hy, -D / 2 + 0.09, D / 2 - 0.09, 'x-');
    slab(P.right, W / 2 - 0.09, W / 2, 0, hy, -D / 2 + 0.09, D / 2 - 0.09, 'x+');
    // techo
    this.box(P.ceil, -W / 2, W / 2, hy, H - oT, -D / 2, D / 2, ceilM);
    this.box(P.ceil, -W / 2, W / 2, H - oT, H, -D / 2, D / 2, extM);

    // frente: tramos de madera alrededor de la puerta y los vidrios
    const fz0 = D / 2 - 0.09, fz1 = D / 2;
    const ops = L.front.slice().sort((a, b) => a.x0 - b.x0);
    let cur = -W / 2;
    ops.forEach((o) => { if (o.x0 - cur > 0.004) slab(P.front, cur, o.x0, 0, hy, fz0, fz1, 'z+'); cur = o.x1; });
    if (W / 2 - cur > 0.004) slab(P.front, cur, W / 2, 0, hy, fz0, fz1, 'z+');
    const glass = this.std('glass', { color: '#cfe6ea', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.2, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false });
    const frameM = this.std('frame', { color: '#1f2124', roughness: 0.45, metalness: 0.6 });
    const bar = this.std('bar', { color: '#b9bcc2', roughness: 0.25, metalness: 0.9 });
    ops.forEach((o) => {
      const h = Math.min(o.h, hy);
      if (hy - h > 0.004) slab(P.front, o.x0, o.x1, h, hy, fz0, fz1, 'z+');
      const zc = D / 2 - 0.045, w = o.x1 - o.x0;
      if (o.kind === 'glass' || o.glass) {
        const m = this.box(P.front, o.x0 + 0.02, o.x1 - 0.02, 0.03, h - 0.02, zc - 0.006, zc + 0.006, glass, { uv: false, cast: false }); m.renderOrder = 3;
        [[o.x0, o.x0 + 0.03, 0, h], [o.x1 - 0.03, o.x1, 0, h]].forEach(([a, b, c, d]) => this.box(P.front, a, b, c, d, zc - 0.02, zc + 0.02, frameM, { uv: false }));
        this.box(P.front, o.x0, o.x1, 0, 0.035, zc - 0.02, zc + 0.02, frameM, { uv: false });
        this.box(P.front, o.x0, o.x1, h - 0.03, h, zc - 0.02, zc + 0.02, frameM, { uv: false });
      }
      if (o.kind === 'door') {
        if (!o.glass) { this.box(P.front, o.x0 + 0.01, o.x1 - 0.01, 0.015, h, D / 2 - 0.035, D / 2 - 0.005, extM); this.box(P.front, o.x0 + 0.01, o.x1 - 0.01, 0.015, h, D / 2 - 0.07, D / 2 - 0.035, wallM); }
        else { [[o.x0, o.x0 + 0.035, 0, h], [o.x1 - 0.035, o.x1, 0, h]].forEach(([a, b, c, d]) => this.box(P.front, a, b, c, d, zc - 0.025, zc + 0.025, frameM, { uv: false })); this.box(P.front, o.x0, o.x1, h - 0.035, h, zc - 0.025, zc + 0.025, frameM, { uv: false }); this.box(P.front, o.x0, o.x1, 0, 0.035, zc - 0.025, zc + 0.025, frameM, { uv: false }); }
        const hx = (ops.indexOf(o) >= 0 && this.state.doorPos === 'left') ? o.x1 - 0.1 : (this.state.doorPos === 'right' ? o.x0 + 0.1 : o.x1 - 0.1);
        this.box(P.front, hx - 0.012, hx + 0.012, h * 0.35, h * 0.35 + 0.5, D / 2 + 0.01, D / 2 + 0.035, bar, { uv: false });
        this.box(P.front, hx - 0.012, hx + 0.012, h * 0.35, h * 0.35 + 0.5, D / 2 - 0.1, D / 2 - 0.075, bar, { uv: false });
      }
    });

    this.buildFloor(P.inner, L, st);
    this.buildBenches(P.inner, L, st, benchM);
    this.buildHeater(P.inner, L, st, benchM, dark);
    this.buildLights(P.inner, L, st);
    this.buildExtras(P.inner, L, st, benchM);

    this.setView(this.view, !this.userMoved && !this.tween);
    this.applyNight(this.night);
    const s = Math.max(W, D, H);
    this.key.position.set(s * 1.0 + 2, s * 2.2 + 3, s * 1.3 + 2.5); this.key.target.position.set(0, 0.8, 0);
    const sc = this.key.shadow.camera; sc.left = -s * 1.6; sc.right = s * 1.6; sc.top = s * 1.6; sc.bottom = -s * 1.6; sc.updateProjectionMatrix();
    this.fill.position.set(0, H - 0.35, 0); this.fill.distance = s * 4;
  }

  buildFloor(g, L, st) {
    const { iw, id } = L;
    if (st.floor === 'tiles') return;
    const board = this.woodMat(st.benchWood, '#e8ddc8');
    if (st.floor === 'rubber-boards') this.box(g, -iw / 2, iw / 2, 0, 0.012, -id / 2, id / 2, this.std('rubber', { color: '#2c2d30', roughness: 0.95, metalness: 0 }), { uv: false, cast: false });
    this.box(g, -iw / 2 + 0.01, iw / 2 - 0.01, 0.012, 0.04, -id / 2 + 0.01, id / 2 - 0.01, board, { cast: false });
  }

  buildBenches(g, L, st, benchM) {
    const base = this.woodMat(st.benchWood, '#9d8d78');
    const led = ['led', 'both'].includes(st.lights), ledC = col(byId(LED_COLORS, st.ledColor).c);
    const lk = 'led:' + st.ledColor; if (!this.cache.has(lk)) this.cache.set(lk, new THREE.MeshBasicMaterial({ color: ledC, toneMapped: false }));
    this.ledMat = this.cache.get(lk);
    this.ledPoints = [];
    L.benches.forEach((b) => {
      const th = 0.04, swap = b.axis === 'z';
      this.box(g, b.x0, b.x1, b.top - th, b.top, b.z0, b.z1, benchM, { swap });
      this.box(g, b.x0 + 0.03, b.x1 - 0.03, 0.04, b.top - th, b.z0 + 0.03, b.z1 - 0.03, base, { swap });
      if (led) {
        // tira LED en el borde libre, justo debajo del asiento
        if (b.axis === 'x') this.box(g, b.x0 + 0.05, b.x1 - 0.05, b.top - th - 0.025, b.top - th - 0.012, b.z1 - 0.028, b.z1 - 0.005, this.ledMat, { uv: false, cast: false, recv: false });
        else { const lf = b.x1 < 0 || (b.x0 + b.x1) / 2 < 0; const xe = lf ? b.x1 : b.x0; this.box(g, lf ? xe - 0.028 : xe + 0.005, lf ? xe - 0.005 : xe + 0.028, b.top - th - 0.025, b.top - th - 0.012, b.z0 + 0.05, b.z1 - 0.05, this.ledMat, { uv: false, cast: false, recv: false }); }
        const lx = b.axis === 'x' ? (b.x0 + b.x1) / 2 : ((b.x0 + b.x1) / 2 < 0 ? b.x1 + 0.1 : b.x0 - 0.1), lz = b.axis === 'x' ? b.z1 + 0.1 : (b.z0 + b.z1) / 2;
        if (b.tier === 'upper' && this.ledPoints.length < 3) { const p = new THREE.PointLight(ledC, 0, 3.2, 1.8); p.position.set(lx, b.top - 0.25, lz); g.add(p); this.ledPoints.push(p); }
      }
    });
    this.hasLed = led;
  }

  buildHeater(g, L, st, benchM, dark) {
    const { hx, hz, iw, id } = L, h = st.heater;
    const metal = this.std('heater', { color: '#2a2c30', roughness: 0.42, metalness: 0.7, envMapIntensity: 1.1 });
    const stone = this.std('stone', { color: '#6b6963', roughness: 0.92, metalness: 0 });
    this.fireMat = this.std('fire', { color: '#ff7a2b', emissive: '#ff5a14', emissiveIntensity: 0.9, roughness: 0.6 });
    const stones = (cx, cy, cz, rx, rz, n, seed) => {
      const R = seeded(seed), geo = new THREE.IcosahedronGeometry(1, 1);
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(geo, stone), r = 0.045 + R() * 0.03;
        m.scale.set(r * (1 + R() * 0.3), r * (0.8 + R() * 0.3), r * (1 + R() * 0.3));
        m.position.set(cx + (R() - 0.5) * rx, cy + (R() * 0.07), cz + (R() - 0.5) * rz); m.rotation.set(R() * 3, R() * 3, R() * 3); m.castShadow = true; g.add(m);
      }
    };
    if (h !== 'none') {
      let top = 0;
      if (h === 'floor') { this.box(g, hx - 0.25, hx + 0.25, 0.04, 0.78, hz - 0.2, hz + 0.2, metal, { uv: false }); this.box(g, hx - 0.2, hx + 0.2, 0.62, 0.7, hz + 0.19, hz + 0.205, this.fireMat, { uv: false, cast: false }); this.box(g, hx - 0.25, hx + 0.25, 0.78, 0.82, hz - 0.2, hz + 0.2, dark, { uv: false }); stones(hx, 0.86, hz, 0.34, 0.26, 16, 5); top = 0.95; }
      else if (h === 'wall') { this.box(g, hx - 0.3, hx + 0.3, 0.3, 0.8, hz - 0.12, hz + 0.12, metal, { uv: false }); this.box(g, hx - 0.25, hx + 0.25, 0.4, 0.46, hz + 0.115, hz + 0.13, this.fireMat, { uv: false, cast: false }); this.box(g, hx - 0.3, hx + 0.3, 0.8, 0.83, hz - 0.12, hz + 0.12, dark, { uv: false }); stones(hx, 0.87, hz, 0.46, 0.14, 12, 6); top = 0.95; }
      else { this.box(g, hx - 0.26, hx + 0.26, 0.05, 0.8, hz - 0.26, hz + 0.26, metal, { uv: false }); this.box(g, hx - 0.17, hx + 0.17, 0.2, 0.52, hz + 0.255, hz + 0.27, this.fireMat, { uv: false, cast: false }); this.box(g, hx - 0.26, hx + 0.26, 0.8, 0.84, hz - 0.26, hz + 0.26, dark, { uv: false }); stones(hx, 0.88, hz, 0.34, 0.34, 14, 7);
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, L.H + 0.45 - 0.84, 16), metal); pipe.position.set(hx, 0.84 + (L.H + 0.45 - 0.84) / 2, hz); pipe.castShadow = true; g.add(pipe); top = 0.9; }
      // barandilla de seguridad de madera
      if (h !== 'wall') {
        const sgn = hx > 0 ? 1 : -1, gx = hx - sgn * 0.42, gz = hz - 0.42, ws = hx + sgn * (iw / 2 - Math.abs(hx) + 0.0);
        const wallX = sgn * (iw / 2), frontZ = id / 2;
        const rail = (x0, x1, z0, z1) => { this.box(g, Math.min(x0, x1) - 0.02, Math.max(x0, x1) + 0.02, 0.62, 0.66, Math.min(z0, z1) - 0.02, Math.max(z0, z1) + 0.02, benchM, { cast: false }); this.box(g, Math.min(x0, x1) - 0.02, Math.max(x0, x1) + 0.02, 0.28, 0.32, Math.min(z0, z1) - 0.02, Math.max(z0, z1) + 0.02, benchM, { cast: false }); };
        rail(gx, gx, gz, frontZ - 0.02); rail(gx, wallX - sgn * 0.02, gz, gz);
        [[gx, gz], [gx, frontZ - 0.05], [wallX - sgn * 0.05, gz]].forEach(([px, pz]) => this.box(g, px - 0.025, px + 0.025, 0.04, 0.7, pz - 0.025, pz + 0.025, benchM, { cast: false }));
      }
      void top;
    }
    // paneles infrarrojos en el muro del fondo
    if (st.infrared) {
      const irM = this.std('ir', { color: '#4a2418', emissive: '#ff3a10', emissiveIntensity: 0.2, roughness: 0.6 });
      const xs = iw > 2.1 ? [-iw * 0.25, iw * 0.25] : [0];
      xs.forEach((x) => { this.box(g, x - 0.3, x + 0.3, 1.0, 1.7, -id / 2 + 0.005, -id / 2 + 0.035, irM, { uv: false, cast: false }); this.box(g, x - 0.33, x + 0.33, 0.97, 1.0, -id / 2 + 0.005, -id / 2 + 0.045, benchM, { cast: false }); this.box(g, x - 0.33, x + 0.33, 1.7, 1.73, -id / 2 + 0.005, -id / 2 + 0.045, benchM, { cast: false }); });
      this.irOn = true;
    } else this.irOn = false;
  }

  buildLights(g, L, st) {
    const spots = ['spots', 'both'].includes(st.lights);
    this.spotLight = null;
    if (spots) {
      const lamp = new THREE.MeshBasicMaterial({ color: '#fff0d0', toneMapped: false });
      const pos = [[-L.iw * 0.22, -L.id * 0.2], [L.iw * 0.22, -L.id * 0.2], [-L.iw * 0.22, L.id * 0.12], [L.iw * 0.22, L.id * 0.12]];
      pos.forEach(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 20), lamp); m.position.set(x, L.H - 0.098, z); g.add(m); });
      this.spotLight = new THREE.PointLight('#ffd9a8', 0, 7, 1.5); this.spotLight.position.set(0, L.H - 0.3, 0); g.add(this.spotLight);
    }
  }

  buildExtras(g, L, st, benchM) {
    const ex = st.extras || [];
    const up = L.benches.filter((b) => b.tier === 'upper');
    if (ex.includes('backrest')) {
      up.forEach((b) => {
        const len = b.axis === 'x' ? b.x1 - b.x0 : b.z1 - b.z0;
        const geo = new THREE.BoxGeometry(b.axis === 'x' ? len - 0.1 : 0.035, 0.42, b.axis === 'x' ? 0.035 : len - 0.1);
        const m = new THREE.Mesh(geo, benchM); m.castShadow = true; const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
        if (b.axis === 'x') { m.position.set(cx, b.top + 0.3, b.z0 + 0.07); m.rotation.x = -0.2; }
        else { const left = cx < 0; m.position.set(left ? b.x0 + 0.07 : b.x1 - 0.07, b.top + 0.3, cz); m.rotation.z = left ? 0.2 : -0.2; }
        g.add(m);
      });
    }
    if (ex.includes('bucket')) {
      const wood = this.woodMat('alamo-t'), band = this.std('band', { color: '#8c8f95', roughness: 0.35, metalness: 0.9 });
      const grp = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.24, 24), wood); body.position.y = 0.12; body.castShadow = true; grp.add(body);
      [0.05, 0.19].forEach((y) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.133 - (0.19 - y) * 0.08, 0.133 - (0.19 - y) * 0.08, 0.018, 24), band); b.position.y = y; grp.add(b); });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), wood); handle.position.set(0.1, 0.3, 0); handle.rotation.z = -0.5; handle.castShadow = true; grp.add(handle);
      const ub = up[0];
      if (ub) { const cx = ub.axis === 'x' ? ub.x0 + 0.3 : (ub.x0 + ub.x1) / 2, cz = ub.axis === 'x' ? (ub.z0 + ub.z1) / 2 : ub.z0 + 0.3; grp.position.set(cx, ub.top, cz); }
      else grp.position.set(-L.hx * 0.7, 0.04, 0);
      g.add(grp);
    }
    if (ex.includes('thermo')) {
      const wood = this.woodMat('alamo-t'), face = this.std('face', { color: '#f1ede4', roughness: 0.6 });
      const grp = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 32), wood); ring.rotation.x = Math.PI / 2; grp.add(ring);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.034, 32), face); dial.rotation.x = Math.PI / 2; dial.position.z = 0.002; grp.add(dial);
      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.055, 0.004), this.std('needle', { color: '#b02a1a', roughness: 0.5 })); needle.position.z = 0.02; needle.rotation.z = -0.9; needle.position.y = 0.012; grp.add(needle);
      const x = (L.hx > 0 ? -1 : 1) * Math.min(0.8, L.iw * 0.3);
      grp.position.set(x, 1.6, -L.id / 2 + 0.02); g.add(grp);
    }
  }

  // ---------- día / noche, vistas ----------
  setNight(on, instant) { this.nightTarget = on ? 1 : 0; if (instant) { this.night = this.nightTarget; this.applyNight(this.night); } }
  applyNight(n) {
    const bg = col('#d8d4cc').lerp(col('#0b0d11'), n);
    this.scene.background = bg; this.scene.fog.color.copy(bg);
    this.key.intensity = 2.1 * (1 - n * 0.93); this.hemi.intensity = 0.5 * (1 - n * 0.9);
    this.scene.environmentIntensity = 0.55 * (1 - n * 0.85);
    this.renderer.toneMappingExposure = 1.0 + n * 0.25;
    this.floorMat.color.copy(col('#ffffff').lerp(col('#2a2a2e'), n * 0.7));
    const st = this.state || {}, lights = st.lights && st.lights !== 'none';
    this.fill.intensity = 3.2 * (1 - n * 0.55) * (lights ? 0.7 : 1);
    if (this.spotLight) this.spotLight.intensity = 4.5 * (0.35 + 0.65 * n);
    if (this.ledPoints) this.ledPoints.forEach((p) => { p.intensity = 5 * (0.4 + 0.6 * n); });
    if (this.fireMat) this.fireMat.emissiveIntensity = 0.7 + n * 0.9;
  }
  setView(name, instant) {
    const L = this.L || { W: 2.2, D: 2, H: 2.2 }, s = Math.max(L.W, L.D, L.H);
    this.view = name; const P = this.parts || {};
    const hide = { cutaway: ['front', 'right', 'ceil'], top: ['ceil'], inside: [], outside: [] }[name] || [];
    ['front', 'right', 'ceil', 'back', 'left'].forEach((k) => { if (P[k]) P[k].visible = !hide.includes(k); });
    let p, t;
    if (name === 'outside') { p = [s * 0.95 + 1.2, s * 0.62 + 1.1, s * 1.55 + 2.2]; t = [0, L.H * 0.45, 0]; }
    else if (name === 'top') { p = [0.01, s * 2.2 + 3, 0.01]; t = [0, 0, 0]; }
    else if (name === 'inside') { p = [L.W / 2 - 0.22, 1.4, L.D / 2 - 0.2]; t = [-L.W * 0.2, 0.95, -L.D / 2 + 0.2]; }
    else { p = [s * 1.0 + 1.8, s * 1.05 + 1.2, s * 1.35 + 2.1]; t = [0, L.H * 0.4, 0]; this.view = 'cutaway'; }
    this.controls.minDistance = name === 'inside' ? 0.15 : 0.6; this.fovBoost = name === 'inside' ? 1.85 : 1; this.resize();
    if (instant) { this.camera.position.set(...p); this.controls.target.set(...t); this.controls.update(); return; }
    this.userMoved = true;
    this.tween = { t0: performance.now(), dur: 1000, p0: this.camera.position.clone(), t0v: this.controls.target.clone(), p1: new THREE.Vector3(...p), t1: new THREE.Vector3(...t) };
  }

  // ---------- bucle ----------
  resize() {
    const w = this.host.clientWidth || 800, h = this.host.clientHeight || 500;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h; this.camera.fov = (w / h < 0.9 ? 52 : 36) * (this.fovBoost || 1); this.camera.updateProjectionMatrix();
  }
  start() { if (this.running || this.disposed) return; this.running = true; this.last = performance.now(); requestAnimationFrame(this.loop); }
  stop() { this.running = false; }
  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.time += dt;
    if (Math.abs(this.night - this.nightTarget) > 0.001) { this.night += Math.sign(this.nightTarget - this.night) * Math.min(Math.abs(this.nightTarget - this.night), dt / 1.0); this.applyNight(this.night); }
    if (this.tween) { const k = Math.min(1, (now - this.tween.t0) / this.tween.dur), e = ease(k); this.camera.position.lerpVectors(this.tween.p0, this.tween.p1, e); this.controls.target.lerpVectors(this.tween.t0v, this.tween.t1, e); if (k >= 1) this.tween = null; }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    if (!this.firstDone) { this.firstDone = true; if (this.onFirst) this.onFirst(); }
    requestAnimationFrame(this.loop);
  }
  snapshot() { this.renderer.render(this.scene, this.camera); return this.renderer.domElement; }
  dispose() {
    this.disposed = true; this.running = false; this.ro.disconnect(); this.controls.dispose(); this.disposeGroup(this.cabin);
    this.renderer.dispose(); if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}
