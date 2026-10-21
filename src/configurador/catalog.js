// Opciones del configurador (colores y acabados de EJEMPLO, propios de AquaBruma).
// Cuando haya productos reales de los proveedores, se reemplazan los colores por sus texturas.
export const T = (o) => (typeof o === 'string' ? o : (window.AQ_LANG === 'en' ? o.en : o.es));

export const SHAPES = [
  { id: 'rect',    es: 'Rectangular',  en: 'Rectangular' },
  { id: 'rounded', es: 'Esquinas suaves', en: 'Soft corners' },
  { id: 'L',       es: 'En L',          en: 'L-shaped' },
  { id: 'organic', es: 'Orgánica',      en: 'Organic' }
];

// Revestimiento interior. type define el patrón; colors son los tonos disponibles.
import { REVIGLASS } from './reviglass.js';
import { RENOLIT } from './renolit.js';

const ROLL_NOTE = { es: 'Membrana Renolit Alkorplan en rollos de 1,60 a 2,10 m de ancho y de 20 a 25 m de largo. Espesor de 1,5 mm para uso general y de 1,8 a 2,0 mm en líneas premium, texturizadas o comerciales.', en: 'Renolit Alkorplan membrane in rolls 1.60 to 2.10 m wide and 20 to 25 m long. 1.5 mm thick for general use and 1.8 to 2.0 mm for premium, textured or commercial lines.' };
const renolitColors = (groups) => RENOLIT.filter((m) => groups.includes(m.group)).map((m) => ({ id: m.id, es: m.name, en: m.name, c: m.c, fam: m.group, thick: m.thick, thumb: `img/texturas/renolit/${m.id}-t.jpg`, ...(m.kind === 'img' ? { img: `img/texturas/renolit/${m.id}.jpg`, size: m.size, mirror: true } : {}) }));

export const MOSAIC_FAMS = [
  { id: 'Azul', es: 'Azul', en: 'Blue' }, { id: 'Verde', es: 'Verde', en: 'Green' }, { id: 'Blanco', es: 'Blanco', en: 'White' }, { id: 'Gris', es: 'Gris', en: 'Grey' },
  { id: 'Negro', es: 'Negro', en: 'Black' }, { id: 'Marron', es: 'Marrón', en: 'Brown' }, { id: 'Rosa', es: 'Rosa', en: 'Pink' }
];

export const FINISH_TYPES = [
  { id: 'membrana', es: 'Membrana lisa', en: 'Smooth membrane', note: ROLL_NOTE,
    groups: [{ id: '2000', es: 'Serie 2000', en: '2000 series' }, { id: 'Extreme', es: 'Extreme', en: 'Extreme' }],
    colors: renolitColors(['2000', 'Extreme']) },
  { id: 'impresa', es: 'Membrana con diseño', en: 'Patterned membrane', note: ROLL_NOTE,
    groups: [{ id: 'Ceramics', es: 'Ceramics', en: 'Ceramics' }, { id: 'Touch', es: 'Touch', en: 'Touch' }, { id: 'Ejemplo', es: 'Diseños de ejemplo', en: 'Sample designs' }],
    colors: [
      ...renolitColors(['Ceramics', 'Touch']),
      { id: 'franjas-azul', es: 'Franjas azules', en: 'Blue stripes', c: '#1f6ea8', pattern: 'stripes', fam: 'Ejemplo' },
      { id: 'franjas-gris', es: 'Franjas grises', en: 'Grey stripes', c: '#59707d', pattern: 'stripes', fam: 'Ejemplo' }
    ] },
  { id: 'mosaico', es: 'Mosaico vítreo', en: 'Glass mosaic', groups: MOSAIC_FAMS, note: { es: 'Mosaico vítreo Reviglass, en paños de 33,5 × 33,5 cm. Vidrio en piezas pequeñas, con brillo y profundidad.', en: 'Reviglass glass mosaic in 33.5 × 33.5 cm sheets. Small glass pieces with shine and depth.' },
    colors: REVIGLASS.map((m) => ({ id: m.id, es: m.name, en: m.name, c: m.c, fam: m.fam, size: m.size, img: `img/texturas/reviglass/${m.id}.jpg`, thumb: `img/texturas/reviglass/${m.id}-t.jpg` })) },
  { id: 'porcelanato', es: 'Porcelanato', en: 'Porcelain tile', note: { es: 'Formato grande y juntas finas; fácil de limpiar.', en: 'Large format and fine joints; easy to clean.' },
    colors: [
      { id: 'cemento', es: 'Gris cemento', en: 'Cement grey', c: '#8c8e8e' },
      { id: 'marmol', es: 'Blanco mármol', en: 'Marble white', c: '#e3e3df' },
      { id: 'beige', es: 'Beige piedra', en: 'Stone beige', c: '#c9bba3' },
      { id: 'antracita', es: 'Antracita', en: 'Anthracite', c: '#4a4e52' }
    ] },
  { id: 'piedra', es: 'Piedra natural', en: 'Natural stone', note: { es: 'Carácter natural, textura única en cada pieza.', en: 'Natural character, a unique texture in every piece.' },
    colors: [
      { id: 'bali', es: 'Piedra Bali', en: 'Bali stone', c: '#8e8f86' },
      { id: 'lava', es: 'Lava stone', en: 'Lava stone', c: '#4a4a4b' },
      { id: 'arenisca', es: 'Arenisca', en: 'Sandstone', c: '#c7a883' }
    ] }
];

export const COPINGS = [
  { id: 'blanco', es: 'Blanco', en: 'White', c: '#ecebe6' },
  { id: 'arena', es: 'Arena', en: 'Sand', c: '#d8c9a8' },
  { id: 'gris', es: 'Gris', en: 'Grey', c: '#8f9396' },
  { id: 'piedra', es: 'Piedra', en: 'Stone', c: '#a49d90', pattern: 'stone' },
  { id: 'ninguno', es: 'Sin borde', en: 'No coping', c: null }
];

export const DECKS = [
  { id: 'madera-clara', es: 'Madera clara', en: 'Light wood', c: '#b48b5c', pattern: 'wood' },
  { id: 'madera-oscura', es: 'Madera oscura', en: 'Dark wood', c: '#5d4533', pattern: 'wood' },
  { id: 'travertino', es: 'Travertino', en: 'Travertine', c: '#dccdb3', pattern: 'tiles' },
  { id: 'travertino-claro', es: 'Travertino blanco', en: 'White travertine', c: '#d8d0bc', pattern: 'tiles' },
  { id: 'porcelanato', es: 'Porcelanato gris', en: 'Grey porcelain', c: '#8e9091', pattern: 'tiles' },
  { id: 'concreto', es: 'Concreto pulido', en: 'Polished concrete', c: '#a6a6a2', pattern: 'concrete' }
];

export const WATERS = [
  { id: 'cristalina', es: 'Cristalina', en: 'Crystal', shallow: '#86dcec', deep: '#1273a6', c: '#4fc3dc' },
  { id: 'turquesa', es: 'Turquesa', en: 'Turquoise', shallow: '#62d8cc', deep: '#078a86', c: '#27c0b2' },
  { id: 'profunda', es: 'Azul profundo', en: 'Deep blue', shallow: '#64aae6', deep: '#0a3d86', c: '#2a72ba' },
  { id: 'esmeralda', es: 'Esmeralda', en: 'Emerald', shallow: '#78d2a2', deep: '#0c6c58', c: '#2fa57f' }
];

export const LIGHTS = [
  { id: 'off', es: 'Apagadas', en: 'Off', c: '#7b8794' },
  { id: 'calida', es: 'Blanco cálido', en: 'Warm white', c: '#ffd9a3', rgb: [1.0, 0.82, 0.58] },
  { id: 'azul', es: 'Azul', en: 'Blue', c: '#4aa8ff', rgb: [0.25, 0.62, 1.0] },
  { id: 'color', es: 'Color cambiante', en: 'Color shift', c: 'conic-gradient(#ff5d73,#ffd24a,#4ade80,#4aa8ff,#a78bfa,#ff5d73)', rgb: null }
];

export const STAIR_ENDS = [
  { id: 'left', es: 'Extremo izquierdo', en: 'Left end' },
  { id: 'right', es: 'Extremo derecho', en: 'Right end' }
];
export const STAIR_POS = [
  { id: 'start', es: 'Esquina', en: 'Corner' },
  { id: 'center', es: 'Centro', en: 'Center' },
  { id: 'end', es: 'Esquina opuesta', en: 'Far corner' }
];

// Estilos de partida: un clic y todo el diseño cambia
export const PRESETS = [
  { id: 'espejo', es: 'Espejo', en: 'Mirror', d: { es: 'Agua a ras de la terraza, travertino blanco y franjas azules.', en: 'Water flush with the deck, white travertine and blue stripes.' },
    sw: ['#1f6ea8', '#e4dcc8', '#27c0b2'],
    s: { shape: 'rect', length: 10, width: 4.5, depth: 1.5, finish: ['impresa', 'franjas-azul'], coping: 'ninguno', deck: 'travertino-claro', water: 'cristalina', lights: 'calida', stairs: true, stairsSteps: 3, stairsWidth: 2.0, stairsEnd: 'left', stairsPos: 'start', spa: false, loungers: true, mirror: true } },
  { id: 'moderna', es: 'Moderna', en: 'Modern', d: { es: 'Líneas rectas, tonos grises y luz cálida.', en: 'Straight lines, grey tones and warm light.' },
    sw: ['#8c8e8e', '#33c4b8', '#5d4533'],
    s: { shape: 'rect', length: 9, width: 4, depth: 1.5, finish: ['porcelanato', 'cemento'], coping: 'gris', deck: 'madera-oscura', water: 'turquesa', lights: 'calida', stairs: true, stairsSteps: 3, stairsWidth: 4, stairsEnd: 'left', stairsPos: 'start', spa: false, loungers: true, mirror: false } },
  { id: 'mediterranea', es: 'Mediterránea', en: 'Mediterranean', d: { es: 'Azul profundo, piedra clara y madera natural.', en: 'Deep blue, light stone and natural wood.' },
    sw: ['#1d5f94', '#ecebe6', '#b48b5c'],
    s: { shape: 'rounded', length: 8, width: 4, depth: 1.5, finish: ['mosaico', 'ps-27-liso'], coping: 'blanco', deck: 'travertino', water: 'profunda', lights: 'calida', stairs: false, stairsSteps: 3, stairsWidth: 1.6, stairsEnd: 'left', stairsPos: 'start', spa: false, loungers: true, mirror: false } },
  { id: 'resort', es: 'Resort', en: 'Resort', d: { es: 'Piscina en L con spa adosado y luz azul.', en: 'L-shaped pool with attached spa and blue light.' },
    sw: ['#25a8b8', '#d8c9a8', '#b48b5c'],
    s: { shape: 'L', length: 10, width: 5, depth: 1.4, finish: ['mosaico', 'ps-53-niebla'], coping: 'arena', deck: 'madera-clara', water: 'cristalina', lights: 'azul', stairs: true, stairsSteps: 3, stairsWidth: 1.6, stairsEnd: 'left', stairsPos: 'start', spa: true, loungers: true, mirror: false } },
  { id: 'natural', es: 'Natural', en: 'Natural', d: { es: 'Forma libre, piedra y verdes suaves.', en: 'Free form, stone and soft greens.' },
    sw: ['#8e8f86', '#3aa886', '#a49d90'],
    s: { shape: 'organic', length: 8, width: 5, depth: 1.4, finish: ['piedra', 'bali'], coping: 'piedra', deck: 'concreto', water: 'esmeralda', lights: 'calida', stairs: false, stairsSteps: 3, stairsWidth: 1.6, stairsEnd: 'left', stairsPos: 'start', spa: false, loungers: true, mirror: false } }
];

export const DEFAULTS = () => {
  const p = PRESETS[0].s;
  return { preset: PRESETS[0].id, night: false, ...p, finish: [...p.finish], finishWalls: [...p.finish], finishStairs: [...p.finish] };
};

// Normaliza un estado (por ejemplo, de un enlace antiguo) para que tenga todos los campos
export function normalize(st) {
  const d = DEFAULTS(), o = { ...d, ...(st || {}) };
  o.finish = [...(o.finish || d.finish)];
  o.finishWalls = [...(o.finishWalls || o.finish)];
  o.finishStairs = [...(o.finishStairs || o.finish)];
  if (typeof o.stairs === 'string') { const full = o.stairs === 'full'; o.stairs = o.stairs !== 'none'; if (full) o.stairsWidth = o.width; }
  return o;
}

export function findFinish(state, part = 'floor') {
  const pair = part === 'walls' ? state.finishWalls : part === 'stairs' ? state.finishStairs : state.finish;
  const f = pair || state.finish;
  const type = FINISH_TYPES.find((t) => t.id === f[0]) || FINISH_TYPES[0];
  const color = type.colors.find((c) => c.id === f[1]) || type.colors[0];
  return { type, color };
}
export const byId = (list, id) => list.find((x) => x.id === id) || list[0];
