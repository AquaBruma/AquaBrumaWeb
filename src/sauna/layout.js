// Cálculo de la cabina: medidas interiores, bancas, puerta, vidrios, estufa, capacidad y potencia sugerida.
// Coordenadas en metros: X = ancho (+ derecha), Z = fondo (+ hacia el frente, donde está la puerta), Y = alto. Origen al centro de la huella.
export const WALL = 0.09; // grosor total del muro (madera interior + madera exterior)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function computeLayout(st) {
  const W = st.width, D = st.depth, H = st.height;
  const iw = W - 2 * WALL, id = D - 2 * WALL, ih = H - WALL;
  const bd = clamp(0.6, 0.4, iw * 0.3), ld = 0.42;
  const two = st.tiers === 2;
  const top = two ? 0.9 : 0.5;
  const lay = st.layout;
  const hasBack = lay === 'back' || lay === 'l-left' || lay === 'l-right' || lay === 'u';
  const left = lay === 'l-left' || lay === 'u' || lay === 'sides';
  const right = lay === 'l-right' || lay === 'u' || lay === 'sides';
  const benches = [];
  const x0 = -iw / 2, x1 = iw / 2, zb = -id / 2;
  const zEnd = Math.max(zb + bd + 0.3, id / 2 - 0.9);
  const zSideStart = hasBack ? zb + bd : zb;
  if (lay !== 'none') {
    if (hasBack) benches.push({ x0, x1, z0: zb, z1: zb + bd, top, axis: 'x', tier: 'upper' });
    if (left) benches.push({ x0, x1: x0 + bd, z0: zSideStart, z1: zEnd, top, axis: 'z', tier: 'upper' });
    if (right) benches.push({ x0: x1 - bd, x1, z0: zSideStart, z1: zEnd, top, axis: 'z', tier: 'upper' });
    if (two) {
      const lx0 = x0 + (left ? bd + ld : 0), lx1 = x1 - (right ? bd + ld : 0);
      if (hasBack && lx1 - lx0 > 0.2) benches.push({ x0: lx0, x1: lx1, z0: zb + bd, z1: zb + bd + ld, top: 0.45, axis: 'x', tier: 'lower' });
      if (left) benches.push({ x0: x0 + bd, x1: x0 + bd + ld, z0: zSideStart + (hasBack ? ld : 0), z1: zEnd, top: 0.45, axis: 'z', tier: 'lower' });
      if (right) benches.push({ x0: x1 - bd - ld, x1: x1 - bd, z0: zSideStart + (hasBack ? ld : 0), z1: zEnd, top: 0.45, axis: 'z', tier: 'lower' });
    }
  }
  // capacidad: lugares sentados sobre la banca más alta (0,6 m por persona)
  let seatLen = 0;
  benches.filter((b) => b.tier === 'upper').forEach((b) => { seatLen += b.axis === 'x' ? b.x1 - b.x0 : b.z1 - b.z0; });
  if (hasBack && (left || right)) seatLen -= (left ? bd : 0) + (right ? bd : 0); // las esquinas se cuentan una sola vez
  const people = lay === 'none' ? 0 : Math.max(0, Math.floor(seatLen / 0.6 + 0.001));

  // frente: puerta y vidrios
  const dw = 0.75, dh = Math.min(1.9, H - 0.15), margin = 0.22 + dw / 2;
  const dcx = st.doorPos === 'left' ? -(W / 2 - margin) : st.doorPos === 'right' ? W / 2 - margin : 0;
  const front = [{ kind: 'door', x0: dcx - dw / 2, x1: dcx + dw / 2, h: dh }];
  if (st.door === 'door-glass') {
    const gw = 0.6;
    const toRight = st.doorPos !== 'right';
    const gx0 = toRight ? dcx + dw / 2 : dcx - dw / 2 - gw, gx1 = toRight ? dcx + dw / 2 + gw : dcx - dw / 2;
    if (gx0 > -W / 2 + 0.08 && gx1 < W / 2 - 0.08) front.push({ kind: 'glass', x0: gx0, x1: gx1, h: dh });
  } else if (st.door === 'full-glass') {
    const gh = H - 0.14;
    front.length = 0;
    front.push({ kind: 'glass', x0: -W / 2 + 0.05, x1: dcx - dw / 2, h: gh }, { kind: 'door', x0: dcx - dw / 2, x1: dcx + dw / 2, h: dh, glass: true }, { kind: 'glass', x0: dcx + dw / 2, x1: W / 2 - 0.05, h: gh });
    for (let i = front.length - 1; i >= 0; i--) if (front[i].kind === 'glass' && front[i].x1 - front[i].x0 < 0.12) front.splice(i, 1);
  }

  // estufa: en la esquina delantera opuesta a la puerta
  const hx = (st.doorPos === 'left' ? 1 : -1) * (iw / 2 - 0.34), hz = id / 2 - 0.34;
  const glassArea = front.filter((f) => f.kind === 'glass' || f.glass).reduce((a, f) => a + (f.x1 - f.x0) * f.h, 0);
  const vol = iw * id * ih;
  const kw = Math.max(2.0, Math.round((vol + glassArea * 0.9) * 2) / 2);
  return { W, D, H, iw, id, ih, benches, people, front, hx, hz, vol, glassArea, kw, bd, ld, hasBack, left, right };
}
