/* Traducción al inglés del catálogo de Spas PW (se suma a i18n-en.js; debe cargarse después de él y antes de i18n.js) */
Object.assign(window.AQ_EN = window.AQ_EN || {}, {
  'Spas PW': 'PW spas',
  'Spas de la línea PW (Premier Wellness) con hidromasaje, cromoterapia y gabinete negro, en varios colores de acrílico. Elige el modelo y mira cómo se ve en cada color.': 'Spas from the PW line (Premier Wellness) with hydromassage, chromotherapy and a black cabinet, in several acrylic colors. Choose the model and see how it looks in each color.',
  'Elige el color': 'Choose the color',
  'Gabinete negro en todos los colores.': 'Black cabinet in every color.',
  'Cotizar este spa': 'Quote this spa',
  'Volumen de agua': 'Water volume',
  'Chorros': 'Jets',
  'Agua': 'Water',
  'Personas': 'People',
  'Consumo de agua': 'Water use',
  '1 a 2': '1 to 2', '3 a 4': '3 to 4', '5 a 6': '5 to 6', '7 o más': '7 or more',
  'Hasta 700 L': 'Up to 700 L', '700 a 1.000 L': '700 to 1,000 L', 'Más de 1.000 L': 'Over 1,000 L',
  'Hasta 20': 'Up to 20', '21 a 35': '21 to 35', '36 o más': '36 or more',
  'Quitar filtros': 'Clear filters',
  'Los modelos que aún no tienen datos publicados no aparecen al filtrar.': 'Models without published data do not appear when filtering.',
  'Ningún modelo coincide con esos filtros. Quita alguno para ver más.': 'No model matches those filters. Remove one to see more.',
  'Peso vacío': 'Dry weight',
  'Peso lleno': 'Full weight',
  'Calentador': 'Heater',
  'Consumo máximo': 'Max. consumption',
  'Referencia': 'Reference',
  'Un asesor te da la capacidad, las medidas y los litros de este modelo.': 'An advisor gives you the capacity, dimensions and liters of this model.',
  'Cromoterapia con luz LED multicolor': 'Chromotherapy with multicolor LED light',
  'Generador de ozono': 'Ozone generator',
  'Panel de control Balboa': 'Balboa control panel',
  'Acrílico termoformado': 'Thermoformed acrylic',
  'Gabinete en aluminio y estructura en acero galvanizado': 'Aluminum cabinet and galvanized steel frame'
});
(window.AQ_EN_PATTERNS = window.AQ_EN_PATTERNS || []).push(
  [/^Mostrando (\d+) de (\d+) modelos$/, (m, a, b) => 'Showing ' + a + ' of ' + b + ' models'],
  [/^Spas PW · (.+)$/, (m, r) => 'PW spas · ' + r],
  [/^(\d+) colores disponibles$/, (m, n) => n + ' colors available'],
  [/^(\d+) colores$/, (m, n) => n + ' colors'],
  [/^(\d+(?:\s*-\s*\d+)?) personas( · .+)?$/, (m, n, rest) => n + ' people' + (rest || '')],
  [/^Spa (.+) de la línea PW, disponible en (\d+) colores\. Un asesor te da las medidas, la capacidad y las condiciones de instalación\.$/, (m, a, n) => 'Spa ' + a + ' from the PW line, available in ' + n + ' colors. An advisor gives you the dimensions, capacity and installation requirements.'],
  [/^Spa (.+?) para (\d+(?:-\d+)?) personas(?:, de (.+?))?(?: y (.+?) de agua)?(?:, con (\d+) chorros de hidromasaje)?, cromoterapia y generador de ozono\. Disponible en (\d+) colores\.$/, (m, a, cap, dims, vol, jets, n) =>
    'Spa ' + a + ' for ' + cap + ' people' + (dims ? ', ' + dims : '') + (vol ? ' and ' + vol + ' of water' : '') + (jets ? ', with ' + jets + ' hydromassage jets' : '') + ', chromotherapy and an ozone generator. Available in ' + n + ' colors.']
);
