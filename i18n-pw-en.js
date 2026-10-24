/* Traducción al inglés del catálogo de Spas PW (se suma a i18n-en.js; debe cargarse después de él y antes de i18n.js) */
Object.assign(window.AQ_EN = window.AQ_EN || {}, {
  'Spas PW': 'PW spas',
  'Spas de la línea PW (Premier Wellness) con hidromasaje, cromoterapia y gabinete negro, en varios colores de acrílico. Elige el modelo y mira cómo se ve en cada color.': 'Spas from the PW line (Premier Wellness) with hydromassage, chromotherapy and a black cabinet, in several acrylic colors. Choose the model and see how it looks in each color.',
  'Elige el color': 'Choose the color',
  'Gabinete negro en todos los colores.': 'Black cabinet in every color.',
  'Cotizar este spa': 'Quote this spa',
  'Volumen de agua': 'Water volume',
  'Chorros': 'Jets',
  'Referencia': 'Reference',
  'Cromoterapia con luz LED multicolor': 'Chromotherapy with multicolor LED light',
  'Generador de ozono': 'Ozone generator',
  'Panel de control Balboa': 'Balboa control panel',
  'Acrílico termoformado': 'Thermoformed acrylic',
  'Gabinete en aluminio y estructura en acero galvanizado': 'Aluminum cabinet and galvanized steel frame'
});
(window.AQ_EN_PATTERNS = window.AQ_EN_PATTERNS || []).push(
  [/^Spas PW · (.+)$/, (m, r) => 'PW spas · ' + r],
  [/^(\d+) colores disponibles$/, (m, n) => n + ' colors available'],
  [/^(\d+) colores$/, (m, n) => n + ' colors'],
  [/^(\d+(?:\s*-\s*\d+)?) personas( · .+)?$/, (m, n, rest) => n + ' people' + (rest || '')],
  [/^Spa (.+) de la línea PW, disponible en (\d+) colores\. Un asesor te da las medidas, la capacidad y las condiciones de instalación\.$/, (m, a, n) => 'Spa ' + a + ' from the PW line, available in ' + n + ' colors. An advisor gives you the dimensions, capacity and installation requirements.'],
  [/^Spa (.+?) para (\d+(?:-\d+)?) personas(?:, de (.+?))?(?: y (.+?) de agua)?(?:, con (\d+) chorros de hidromasaje)?, cromoterapia y generador de ozono\. Disponible en (\d+) colores\.$/, (m, a, cap, dims, vol, jets, n) =>
    'Spa ' + a + ' for ' + cap + ' people' + (dims ? ', ' + dims : '') + (vol ? ' and ' + vol + ' of water' : '') + (jets ? ', with ' + jets + ' hydromassage jets' : '') + ', chromotherapy and an ozone generator. Available in ' + n + ' colors.']
);
