// Catálogo del configurador de saunas (opciones de ejemplo; se reemplazan por los productos reales de los proveedores)
export const T = (o) => (typeof o === 'string' ? o : (window.AQ_LANG === 'en' ? o.en : o.es));

export const WOODS = [
  { id: 'abeto', es: 'Abeto nórdico', en: 'Nordic spruce', c: '#dbbb84', seed: 11, note: { es: 'Clara y de veta fina; la clásica.', en: 'Light with a fine grain; the classic.' } },
  { id: 'aliso', es: 'Aliso natural', en: 'Natural alder', c: '#c48e5e', seed: 12, note: { es: 'Tono cálido y rojizo, muy uniforme.', en: 'Warm reddish tone, very even.' } },
  { id: 'alamo', es: 'Álamo natural', en: 'Natural aspen', c: '#e6cf9f', seed: 13, note: { es: 'Casi sin nudos, no se calienta de más al tacto.', en: 'Almost knot-free, stays comfortable to touch.' } },
  { id: 'alamo-t', es: 'Álamo termotratado', en: 'Thermo-treated aspen', c: '#8d6139', seed: 14, note: { es: 'Oscurecida con calor: más estable y resistente.', en: 'Darkened with heat: more stable and durable.' } },
  { id: 'aliso-t', es: 'Aliso termotratado', en: 'Thermo-treated alder', c: '#7a4d32', seed: 15, note: { es: 'Tono chocolate profundo.', en: 'Deep chocolate tone.' } },
  { id: 'magnolia-t', es: 'Magnolia termotratada', en: 'Thermo-treated magnolia', c: '#6b4a3a', seed: 16, note: { es: 'Tono grisáceo-oscuro, aspecto moderno.', en: 'Dark greyish tone, modern look.' } },
  { id: 'fresno-t', es: 'Fresno termotratado', en: 'Thermo-treated ash', c: '#5a4132', seed: 17, ext: true, note: { es: 'Solo para el exterior: veta marcada y muy durable.', en: 'Exterior only: bold grain and very durable.' } }
];

export const FLOORS = [
  { id: 'tiles', es: 'Baldosas del espacio', en: 'Existing tiles', note: { es: 'Se usa el piso que ya tienes; no va incluido.', en: 'Uses the floor you already have; not included.' } },
  { id: 'tiles-boards', es: 'Baldosas y tarimas', en: 'Tiles and duckboards', note: { es: 'Tarimas de madera sobre baldosa.', en: 'Wooden duckboards over tile.' } },
  { id: 'rubber-boards', es: 'Caucho y tarimas', en: 'Rubber and duckboards', note: { es: 'Base impermeable de caucho con tarimas encima.', en: 'Waterproof rubber base with duckboards on top.' } }
];

export const LAYOUTS = [
  { id: 'none', es: 'Sin bancas', en: 'No benches' },
  { id: 'back', es: 'Al fondo', en: 'Back wall' },
  { id: 'l-left', es: 'En L (izquierda)', en: 'L-shape (left)' },
  { id: 'l-right', es: 'En L (derecha)', en: 'L-shape (right)' },
  { id: 'u', es: 'En U', en: 'U-shape' },
  { id: 'sides', es: 'Dos laterales', en: 'Two sides' }
];

export const DOORS = [
  { id: 'door', es: 'Solo puerta', en: 'Door only' },
  { id: 'door-glass', es: 'Puerta y panel de vidrio', en: 'Door and glass panel' },
  { id: 'full-glass', es: 'Frente de vidrio completo', en: 'Full glass front' }
];
export const DOOR_POS = [
  { id: 'left', es: 'Izquierda', en: 'Left' },
  { id: 'center', es: 'Centro', en: 'Center' },
  { id: 'right', es: 'Derecha', en: 'Right' }
];

export const HEATERS = [
  { id: 'none', es: 'Sin estufa', en: 'No heater', kind: { es: 'Solo infrarrojos o ninguna', en: 'Infrared only or none' } },
  { id: 'wall', es: 'Estufa eléctrica mural', en: 'Wall electric heater', kind: { es: 'Ahorra espacio, va colgada', en: 'Saves space, wall-mounted' } },
  { id: 'floor', es: 'Estufa eléctrica de pie', en: 'Floor electric heater', kind: { es: 'Más piedras, más vapor', en: 'More stones, more steam' } },
  { id: 'wood', es: 'Estufa de leña', en: 'Wood-burning stove', kind: { es: 'Calor tradicional con chimenea', en: 'Traditional heat with a chimney' } }
];

export const LIGHTS = [
  { id: 'none', es: 'Sin iluminación', en: 'No lighting' },
  { id: 'spots', es: 'Focos cálidos', en: 'Warm spotlights' },
  { id: 'led', es: 'LED bajo las bancas', en: 'LED under benches' },
  { id: 'both', es: 'Focos y LED', en: 'Spots and LED' }
];
export const LED_COLORS = [
  { id: 'ambar', es: 'Ámbar', en: 'Amber', c: '#ffa94d' },
  { id: 'blanco', es: 'Blanco cálido', en: 'Warm white', c: '#ffe2b8' },
  { id: 'azul', es: 'Azul', en: 'Blue', c: '#4aa3ff' },
  { id: 'violeta', es: 'Violeta', en: 'Violet', c: '#b078ff' }
];

export const EXTRAS = [
  { id: 'bucket', es: 'Cubo y cucharón', en: 'Bucket and ladle' },
  { id: 'thermo', es: 'Termo-higrómetro', en: 'Thermo-hygrometer' },
  { id: 'backrest', es: 'Respaldos de madera', en: 'Wooden backrests' }
];
export const SERVICES = [
  { id: 'assembly', es: 'Montaje', en: 'Assembly', d: { es: 'Nuestro equipo la arma en tu espacio.', en: 'Our team builds it at your place.' } },
  { id: 'electrical', es: 'Instalación eléctrica', en: 'Electrical installation', d: { es: 'Conexión de la estufa y las luces.', en: 'Heater and lights wiring.' } },
  { id: 'treatment', es: 'Tratamiento de la madera', en: 'Wood treatment', d: { es: 'Protección del interior contra la humedad.', en: 'Interior moisture protection.' } }
];

export const PRESETS = [
  { id: 'compacta', es: 'Compacta', en: 'Compact', d: { es: 'Para 2 personas, ideal para un baño o un rincón.', en: 'For 2 people, ideal for a bathroom or a corner.' }, sw: ['#dbbb84', '#c48e5e', '#ffa94d'],
    s: { width: 1.6, depth: 1.4, height: 2.1, floor: 'tiles-boards', layout: 'back', tiers: 2, door: 'door', doorPos: 'right', wallWood: 'abeto', ceilWood: 'abeto', extWood: 'abeto', benchWood: 'alamo', heater: 'wall', infrared: false, lights: 'led', ledColor: 'ambar', extras: ['bucket', 'thermo'], assembly: false, electrical: false, treatment: false } },
  { id: 'familiar', es: 'Familiar', en: 'Family', d: { es: 'Bancas en L, puerta con vidrio y estufa de pie.', en: 'L-shaped benches, glass-panel door and floor heater.' }, sw: ['#c48e5e', '#e6cf9f', '#ffe2b8'],
    s: { width: 2.3, depth: 2.0, height: 2.2, floor: 'tiles-boards', layout: 'l-left', tiers: 2, door: 'door-glass', doorPos: 'right', wallWood: 'aliso', ceilWood: 'aliso', extWood: 'alamo-t', benchWood: 'alamo', heater: 'floor', infrared: false, lights: 'both', ledColor: 'ambar', extras: ['bucket', 'thermo', 'backrest'], assembly: true, electrical: false, treatment: false } },
  { id: 'premium', es: 'Premium', en: 'Premium', d: { es: 'Madera termotratada, frente de vidrio y luz de colores.', en: 'Thermo-treated wood, glass front and colored light.' }, sw: ['#6b4a3a', '#8d6139', '#b078ff'],
    s: { width: 2.8, depth: 2.2, height: 2.3, floor: 'rubber-boards', layout: 'u', tiers: 2, door: 'full-glass', doorPos: 'center', wallWood: 'magnolia-t', ceilWood: 'magnolia-t', extWood: 'fresno-t', benchWood: 'alamo-t', heater: 'floor', infrared: true, lights: 'both', ledColor: 'violeta', extras: ['bucket', 'thermo', 'backrest'], assembly: true, electrical: true, treatment: true } },
  { id: 'infrarrojo', es: 'Infrarrojos', en: 'Infrared', d: { es: 'Calor suave con paneles, sin estufa de piedras.', en: 'Gentle heat from panels, no stone heater.' }, sw: ['#e6cf9f', '#e6cf9f', '#ff7a4d'],
    s: { width: 1.5, depth: 1.3, height: 2.1, floor: 'tiles', layout: 'back', tiers: 1, door: 'door-glass', doorPos: 'center', wallWood: 'alamo', ceilWood: 'alamo', extWood: 'alamo', benchWood: 'alamo', heater: 'none', infrared: true, lights: 'spots', ledColor: 'blanco', extras: ['thermo'], assembly: false, electrical: false, treatment: false } }
];

export const DEFAULTS = () => ({ preset: PRESETS[1].id, night: false, ...PRESETS[1].s, extras: [...PRESETS[1].s.extras] });

export function normalize(st) {
  const o = { ...DEFAULTS(), ...(st || {}) };
  o.extras = Array.isArray(o.extras) ? [...o.extras] : [];
  return o;
}

export const byId = (list, id) => list.find((x) => x.id === id) || list[0];
