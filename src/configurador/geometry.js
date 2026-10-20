// Geometría de la piscina: contorno según la forma, muros, piso, bordes y terraza.
// Coordenadas: X = largo, Z = ancho, Y = alto. La superficie del terreno está en y = 0.
import * as THREE from 'three';

export const WATER_Y = -0.12;

function area2(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }
export const polyArea = (p) => Math.abs(area2(p));
export function polyPerimeter(p) { let s = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; s += Math.hypot(q[0] - p[i][0], q[1] - p[i][1]); } return s; }
function ccw(p) { return area2(p) >= 0 ? p : p.slice().reverse(); }

function arc(cx, cz, r, a0, a1, n) { const out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } return out; }

// Contorno (lista de [x, z]) de cada forma, centrado en el origen
export function outline(shape, L, W) {
  const hx = L / 2, hz = W / 2;
  if (shape === 'rounded') {
    const r = Math.min(0.9, W * 0.3);
    return ccw([...arc(hx - r, hz - r, r, 0, Math.PI / 2, 8), ...arc(-hx + r, hz - r, r, Math.PI / 2, Math.PI, 8), ...arc(-hx + r, -hz + r, r, Math.PI, Math.PI * 1.5, 8), ...arc(hx - r, -hz + r, r, Math.PI * 1.5, Math.PI * 2, 8)]);
  }
  if (shape === 'L') {
    const nx = Math.max(1.6, L * 0.3), nz = W * 0.46;
    return ccw([[-hx, -hz], [hx, -hz], [hx, hz - nz], [hx - nx, hz - nz], [hx - nx, hz], [-hx, hz]]);
  }
  if (shape === 'organic') {
    const ctrl = [[-0.5, -0.12], [-0.38, -0.46], [-0.08, -0.36], [0.2, -0.5], [0.5, -0.3], [0.47, 0.08], [0.28, 0.44], [-0.02, 0.28], [-0.28, 0.5], [-0.5, 0.22]];
    const curve = new THREE.CatmullRomCurve3(ctrl.map((c) => new THREE.Vector3(c[0], 0, c[1])), true, 'centripetal');
    const pts = curve.getPoints(110).slice(0, -1).map((v) => [v.x, v.z]);
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    pts.forEach(([x, z]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); });
    const sx = L / (maxX - minX), sz = W / (maxZ - minZ), cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    return ccw(pts.map(([x, z]) => [(x - cx) * sx, (z - cz) * sz]));
  }
  return ccw([[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]]);
}

export function bounds(p) {
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  p.forEach(([x, z]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); });
  return { minX, maxX, minZ, maxZ };
}

// Normales hacia afuera en cada vértice (para desplazar bordes)
export function outwardNormals(p) {
  const n = p.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n];
    const e1 = [b[0] - a[0], b[1] - a[1]], e2 = [c[0] - b[0], c[1] - b[1]];
    const l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1;
    const n1 = [e1[1] / l1, -e1[0] / l1], n2 = [e2[1] / l2, -e2[0] / l2];
    let nx = n1[0] + n2[0], nz = n1[1] + n2[1]; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
    const k = 1 / Math.max(0.45, nx * n1[0] + nz * n1[1]);
    out.push([nx * k, nz * k]);
  }
  return out;
}

function geo(positions, uvs, index) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

// Superficie plana (suelo, agua, terraza con hueco) a la altura y
export function flatGeometry(contour, holes, y, up = true) {
  const c = ccw(contour).map(([x, z]) => new THREE.Vector2(x, z));
  const hs = (holes || []).map((h) => { const hh = ccw(h).slice().reverse(); return hh.map(([x, z]) => new THREE.Vector2(x, z)); });
  const faces = THREE.ShapeUtils.triangulateShape(c, hs);
  const all = c.concat(...hs);
  const pos = [], uv = [];
  all.forEach((v) => { pos.push(v.x, y, v.y); uv.push(v.x, v.y); });
  const idx = [];
  faces.forEach((f) => { if (up) idx.push(f[0], f[2], f[1]); else idx.push(f[0], f[1], f[2]); });
  const g = geo(pos, uv, idx);
  return g;
}

// Muros: franja vertical alrededor del contorno
export function wallsGeometry(p, yTop, yBottom) {
  const pos = [], uv = [], idx = [];
  let u = 0;
  for (let i = 0; i <= p.length; i++) {
    const a = p[i % p.length];
    if (i > 0) { const b = p[i - 1]; u += Math.hypot(a[0] - b[0], a[1] - b[1]); }
    pos.push(a[0], yTop, a[1], a[0], yBottom, a[1]);
    uv.push(u, yTop, u, yBottom);
    if (i > 0) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  return geo(pos, uv, idx);
}

// Cinta que sigue el contorno entre dos desplazamientos (offA→offB) y dos alturas (yA→yB)
export function ribbonGeometry(p, offA, offB, yA, yB) {
  const nrm = outwardNormals(p), pos = [], uv = [], idx = [];
  let u = 0;
  for (let i = 0; i <= p.length; i++) {
    const j = i % p.length, a = p[j], n = nrm[j];
    if (i > 0) { const b = p[i - 1]; u += Math.hypot(a[0] - b[0], a[1] - b[1]); }
    pos.push(a[0] + n[0] * offA, yA, a[1] + n[1] * offA, a[0] + n[0] * offB, yB, a[1] + n[1] * offB);
    uv.push(u, offA, u, offB);
    if (i > 0) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  return geo(pos, uv, idx);
}

// Proyecta las UV de una caja en metros del mundo (para que la textura no se estire)
export function worldUV(geometry, matrix) {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal, uv = geometry.attributes.uv;
  const v = new THREE.Vector3(), nv = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(matrix);
    nv.fromBufferAttribute(nor, i);
    const ax = Math.abs(nv.x), ay = Math.abs(nv.y), az = Math.abs(nv.z);
    if (ay >= ax && ay >= az) uv.setXY(i, v.x, v.z); else if (ax >= az) uv.setXY(i, v.z, v.y); else uv.setXY(i, v.x, v.y);
  }
  uv.needsUpdate = true;
}

// Puntos repartidos por el perímetro (para las luces)
export function perimeterSamples(p, n) {
  const total = polyPerimeter(p), step = total / n, out = [];
  let acc = 0, target = step / 2;
  const nrm = outwardNormals(p);
  for (let i = 0; i < p.length && out.length < n; i++) {
    const a = p[i], b = p[(i + 1) % p.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (target <= acc + len && out.length < n) {
      const t = (target - acc) / len;
      const nn = [nrm[i][0] * (1 - t) + nrm[(i + 1) % p.length][0] * t, nrm[i][1] * (1 - t) + nrm[(i + 1) % p.length][1] * t];
      const nl = Math.hypot(nn[0], nn[1]) || 1;
      out.push({ x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, nx: nn[0] / nl, nz: nn[1] / nl });
      target += step;
    }
    acc += len;
  }
  return out;
}
