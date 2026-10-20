// Texturas generadas por código (sin imágenes externas): mosaico, porcelanato, piedra, madera, membrana...
import * as THREE from 'three';

// Aleatorio repetible: la misma textura sale igual cada vez
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c, k = 1) => `rgb(${Math.max(0, Math.min(255, c[0] * k)) | 0},${Math.max(0, Math.min(255, c[1] * k)) | 0},${Math.max(0, Math.min(255, c[2] * k)) | 0})`;

function canvas(size) { const c = document.createElement('canvas'); c.width = c.height = size; return c; }

function finish(cv, bump, maxAniso) {
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAniso;
  let bumpMap = null;
  if (bump) { bumpMap = new THREE.CanvasTexture(bump); bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping; bumpMap.anisotropy = maxAniso; }
  return { map, bumpMap };
}

// Cuadrícula de piezas (mosaico, porcelanato...). n = piezas por lado de la textura (que cubre 1 m)
function tilesTexture({ base, n, gap, vari, seed, shine = 0, big = false, vein = 0, S = 1024 }, aniso) {
  gap = gap * (S / 512);
  const cv = canvas(S), g = cv.getContext('2d'), bv = canvas(S), b = bv.getContext('2d');
  const R = rng(seed), bc = hex(base), grout = mix(bc, [235, 235, 232], 0.55);
  g.fillStyle = css(mix(bc, [200, 205, 205], 0.35), 0.82); g.fillRect(0, 0, S, S);
  b.fillStyle = '#000'; b.fillRect(0, 0, S, S);
  const cell = S / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = (R() - 0.5) * 2 * vari;
    const col = mix(bc, v > 0 ? [255, 255, 255] : [20, 40, 60], Math.abs(v));
    const px = x * cell + gap / 2, py = y * cell + gap / 2, w = cell - gap, h = cell - gap;
    g.fillStyle = css(col); g.fillRect(px, py, w, h);
    if (shine) { const gr = g.createLinearGradient(px, py, px + w, py + h); gr.addColorStop(0, `rgba(255,255,255,${shine})`); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, `rgba(0,0,0,${shine * 0.6})`); g.fillStyle = gr; g.fillRect(px, py, w, h); }
    if (vein) { g.strokeStyle = `rgba(255,255,255,${vein})`; g.lineWidth = 1 + R() * 1.5; g.beginPath(); const sx = px + R() * w, sy = py + R() * h; g.moveTo(sx, sy); g.bezierCurveTo(px + R() * w, py + R() * h, px + R() * w, py + R() * h, px + R() * w, py + R() * h); g.stroke(); }
    b.fillStyle = '#fff'; b.fillRect(px, py, w, h);
  }
  g.strokeStyle = css(grout); g.lineWidth = gap; g.globalAlpha = 0.9;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, S); g.stroke(); g.beginPath(); g.moveTo(0, i * cell); g.lineTo(S, i * cell); g.stroke(); }
  g.globalAlpha = 1;
  return finish(cv, bv, aniso);
}

// Franjas anchas (como las de las piscinas espejo): bandas claras y oscuras
function stripesTexture({ base, seed }, aniso) {
  const S = 512, cv = canvas(S), g = cv.getContext('2d'), R = rng(seed), bc = hex(base);
  for (let i = 0; i < 4; i++) { const dark = i % 2 === 1; g.fillStyle = css(mix(bc, dark ? [10, 30, 70] : [150, 205, 235], dark ? 0.15 : 0.42), dark ? 0.85 : 1); g.fillRect(i * S / 4, 0, S / 4, S); }
  for (let i = 0; i < 4000; i++) { const a = (R() - 0.5) * 0.07; g.fillStyle = a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`; g.fillRect(R() * S, R() * S, 2 + R() * 3, 2 + R() * 3); }
  return finish(cv, null, aniso);
}

function plainTexture({ base, seed, noise = 0.06 }, aniso) {
  const S = 512, cv = canvas(S), g = cv.getContext('2d'), R = rng(seed), bc = hex(base);
  g.fillStyle = css(bc); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 9000; i++) { const a = (R() - 0.5) * noise * 2; g.fillStyle = a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`; g.fillRect(R() * S, R() * S, 2 + R() * 3, 2 + R() * 3); }
  return finish(cv, null, aniso);
}

function stoneTexture({ base, seed }, aniso) {
  const S = 768, cv = canvas(S), g = cv.getContext('2d'), bv = canvas(S), b = bv.getContext('2d'), R = rng(seed), bc = hex(base);
  g.fillStyle = css(bc, 0.55); g.fillRect(0, 0, S, S); b.fillStyle = '#000'; b.fillRect(0, 0, S, S);
  const pts = []; for (let i = 0; i < 56; i++) pts.push([R() * S, R() * S, R()]);
  const img = g.getImageData(0, 0, S, S), bi = b.getImageData(0, 0, S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let d1 = 1e9, d2 = 1e9, id = 0;
    for (let k = 0; k < pts.length; k++) {
      let dx = Math.abs(x - pts[k][0]); if (dx > S / 2) dx = S - dx;
      let dy = Math.abs(y - pts[k][1]); if (dy > S / 2) dy = S - dy;
      const d = dx * dx + dy * dy;
      if (d < d1) { d2 = d1; d1 = d; id = k; } else if (d < d2) d2 = d;
    }
    const edge = Math.sqrt(d2) - Math.sqrt(d1), e = Math.min(1, edge / 7);
    const tone = 0.82 + pts[id][2] * 0.36, grain = 0.94 + R() * 0.12;
    const o = (y * S + x) * 4, col = mix(bc, [255, 255, 255], (pts[id][2] - 0.5) * 0.18);
    const k = (0.45 + 0.55 * e) * tone * grain;
    img.data[o] = col[0] * k; img.data[o + 1] = col[1] * k; img.data[o + 2] = col[2] * k; img.data[o + 3] = 255;
    const v = e * 255; bi.data[o] = bi.data[o + 1] = bi.data[o + 2] = v; bi.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0); b.putImageData(bi, 0, 0);
  return finish(cv, bv, aniso);
}

function woodTexture({ base, seed }, aniso) {
  const S = 1024, cv = canvas(S), g = cv.getContext('2d'), bv = canvas(S), b = bv.getContext('2d'), R = rng(seed), bc = hex(base);
  const rows = 8, h = S / rows;
  b.fillStyle = '#000'; b.fillRect(0, 0, S, S);
  for (let r = 0; r < rows; r++) {
    const tone = 0.86 + R() * 0.28; g.fillStyle = css(bc, tone); g.fillRect(0, r * h, S, h);
    for (let i = 0; i < 26; i++) { const y = r * h + R() * h; g.strokeStyle = `rgba(${R() > 0.5 ? '0,0,0' : '255,255,255'},${0.04 + R() * 0.06})`; g.lineWidth = 0.6 + R() * 1.2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S * 0.3, y + (R() - 0.5) * 4, S * 0.6, y + (R() - 0.5) * 4, S, y + (R() - 0.5) * 3); g.stroke(); }
    const cut = R() * S; g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(cut, r * h, 2, h);
    b.fillStyle = '#fff'; b.fillRect(0, r * h + 2, S, h - 4);
  }
  g.fillStyle = 'rgba(0,0,0,0.5)'; for (let r = 0; r <= rows; r++) g.fillRect(0, r * h - 1, S, 2.4);
  return finish(cv, bv, aniso);
}

function concreteTexture({ base, seed }, aniso) { return plainTexture({ base, seed, noise: 0.09 }, aniso); }

// Texturas de césped y de suelo
function grassTexture(aniso) {
  const S = 256, cv = canvas(S), g = cv.getContext('2d'), R = rng(77);
  g.fillStyle = '#5d8a48'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) { const t = R(); g.fillStyle = `rgba(${70 + t * 50 | 0},${120 + t * 50 | 0},${55 + t * 30 | 0},${0.12 + R() * 0.2})`; g.fillRect(R() * S, R() * S, 1 + R() * 2, 3 + R() * 5); }
  return finish(cv, null, aniso);
}

export function makeTexture(spec, aniso = 4) {
  const key = spec.kind;
  if (key === 'tiles') return tilesTexture(spec, aniso);
  if (key === 'plain') return plainTexture(spec, aniso);
  if (key === 'stripes') return stripesTexture(spec, aniso);
  if (key === 'stone') return stoneTexture(spec, aniso);
  if (key === 'wood') return woodTexture(spec, aniso);
  if (key === 'concrete') return concreteTexture(spec, aniso);
  if (key === 'grass') return grassTexture(aniso);
  return plainTexture(spec, aniso);
}

// Traducción de una opción del catálogo a la textura que le corresponde.
// scale = metros que cubre una repetición de la textura.
export function finishTexture(typeId, color, aniso) {
  const base = color.c;
  switch (typeId) {
    case 'membrana': return { ...makeTexture({ kind: 'plain', base, seed: 11, noise: 0.045 }, aniso), scale: 1, rough: 0.55, metal: 0.0 };
    case 'impresa':
      if (color.pattern === 'stripes') return { ...makeTexture({ kind: 'stripes', base, seed: 37 }, aniso), scale: 4, rough: 0.35, metal: 0 };
      if (color.pattern === 'stone') return { ...makeTexture({ kind: 'stone', base, seed: 23 }, aniso), scale: 1.2, rough: 0.7, metal: 0 };
      return { ...makeTexture({ kind: 'tiles', base, n: 20, gap: 1.6, vari: 0.07, seed: 31 }, aniso), scale: 1, rough: 0.6, metal: 0 };
    case 'mosaico': return { ...makeTexture({ kind: 'tiles', base, n: 40, gap: 1.1, vari: 0.14, seed: 41, shine: 0.28, S: 2048 }, aniso), scale: 1, rough: 0.16, metal: 0.05 };
    case 'porcelanato': return { ...makeTexture({ kind: 'tiles', base, n: 4, gap: 2.4, vari: 0.05, seed: 53, vein: 0.07 }, aniso), scale: 2, rough: 0.35, metal: 0 };
    case 'piedra': return { ...makeTexture({ kind: 'stone', base, seed: 61 }, aniso), scale: 1.4, rough: 0.78, metal: 0 };
    default: return { ...makeTexture({ kind: 'plain', base, seed: 11 }, aniso), scale: 1, rough: 0.5, metal: 0 };
  }
}

export function surfaceTexture(item, aniso) {
  const base = item.c;
  switch (item.pattern) {
    case 'wood': return { ...makeTexture({ kind: 'wood', base, seed: 71 }, aniso), scale: 1.2, rough: 0.7 };
    case 'tiles': return { ...makeTexture({ kind: 'tiles', base, n: 3, gap: 3, vari: 0.06, seed: 83, vein: 0.05 }, aniso), scale: 1.8, rough: 0.6 };
    case 'stone': return { ...makeTexture({ kind: 'stone', base, seed: 91 }, aniso), scale: 1.2, rough: 0.8 };
    case 'concrete': return { ...makeTexture({ kind: 'concrete', base, seed: 97 }, aniso), scale: 2, rough: 0.8 };
    default: return { ...makeTexture({ kind: 'plain', base, seed: 101, noise: 0.05 }, aniso), scale: 1.5, rough: 0.7 };
  }
}
