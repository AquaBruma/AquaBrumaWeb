/*
  SPAS JACUZZI EN 3D — datos
  --------------------------
  Cada modelo abre la experiencia 3D / realidad aumentada oficial de Jacuzzi (Brand3D),
  que se carga en una ventana solo cuando el visitante la abre.
    id    → código de la experiencia (https://jg-embed.brand3d.com/<id>)
    img   → miniatura en img/spas/<img>.webp
  Para agregar o quitar un modelo, editar la lista AQ_SPAS.
  Comparador: si un modelo trae  specs: { capacidad: '5 personas', medidas: '229 × 229 × 91 cm', volumen: '1.400 L', chorros: '55' }
  la tabla de comparación muestra esas filas (las etiquetas están en AQ_SPA_SPEC_LABELS; agregar una fila = agregar una etiqueta).
  Fuente de la lista: https://brand3d-ar.web.app/jacuzzi-hot-tubs
*/
window.AQ_SPA_COLLECTIONS = [
  { key: 'J5',    name: 'Colección J5' },
  { key: 'J-4',   name: 'Colección J-4' },
  { key: 'J-400', name: 'Colección J-400' },
  { key: 'J-300', name: 'Colección J-300' },
  { key: 'J-200', name: 'Colección J-200' },
  { key: 'Play',  name: 'Colección Play' }
];
window.AQ_SPA_SPEC_LABELS = [
  ['capacidad', 'Capacidad'],
  ['medidas', 'Medidas'],
  ['volumen', 'Volumen de agua'],
  ['chorros', 'Chorros']
];
window.AQ_SPAS = [
  { c: 'J5', name: 'J509',  year: 2026, id: '0sW6P3WKTupPRQoVIZE2', img: 'j509' },
  { c: 'J5', name: 'J508L', year: 2026, id: 'ACDtfPL1KCuu1MtjiJDY', img: 'j508l' },
  { c: 'J5', name: 'J508',  year: 2026, id: 'fYfELG4myEMMgFIRN73I', img: 'j508' },
  { c: 'J-4', name: 'J408',  year: 2024, id: 'DFLsGRfe1J77d6muLhpM', img: 'j408' },
  { c: 'J-4', name: 'J408L', year: 2024, id: 'FdG1ZEIiGONMt5SRz1I4', img: 'j408l' },
  { c: 'J-4', name: 'J404L', year: 2025, id: 'gKc1G2mVsRLI1bpx8Xc7', img: 'j404l' },
  { c: 'J-400', name: 'J-425', year: 2022, id: '8u6MrQTxnAfQnEMA6ZMm', img: 'j425' },
  { c: 'J-400', name: 'J-435', year: 2024, id: 'nTWDn0N3TAlhUwgCF66i', img: 'j435' },
  { c: 'J-400', name: 'J-445', year: 2024, id: 'MfisjX4LHxknkjybnBc7', img: 'j445' },
  { c: 'J-400', name: 'J-475', year: 2024, id: 'o3cF9Yv7uvsSICEM7NS8', img: 'j475' },
  { c: 'J-400', name: 'J-485', year: 2024, id: 'lRKF7DnCG54CQPFvUDU7', img: 'j485' },
  { c: 'J-400', name: 'J-495', year: 2024, id: 'sW2yfSoeuskw0xISCIv0', img: 'j495' },
  { c: 'J-300', name: 'J-315', year: 2025, id: 'evjOLkip4x8b7PAQNE0r', img: 'j315' },
  { c: 'J-300', name: 'J-325', year: 2025, id: 'uFTRRTWGs6NEGAco8Bfe', img: 'j325' },
  { c: 'J-300', name: 'J-335', year: 2025, id: 'hGwO7Y2zYFFRiTYyY7hT', img: 'j335' },
  { c: 'J-300', name: 'J-345', year: 2025, id: 'JFRxtJGNtisXgs7bmeJt', img: 'j345' },
  { c: 'J-300', name: 'J-355', year: 2025, id: 'wLGvNmZB0a60a5ksb3hv', img: 'j355' },
  { c: 'J-300', name: 'J-365', year: 2025, id: 'e35SZZkMKEapXMI0FW5C', img: 'j365' },
  { c: 'J-300', name: 'J-375', year: 2025, id: 'RpvVb8Ehs58tPBXMkuO8', img: 'j375' },
  { c: 'J-300', name: 'J-385', year: 2025, id: 'c2D2fAzeCNj7D7G7xmTd', img: 'j385' },
  { c: 'J-200', name: 'J-215', year: 2026, id: 'bphr21RPyQMl6ualEqgc', img: 'j215' },
  { c: 'J-200', name: 'J-225', year: 2026, id: 'nsktvwXod9WZ2Fz5YVjc', img: 'j225' },
  { c: 'J-200', name: 'J-235', year: 2026, id: 'KO6P9teCBxue03Z1d7g0', img: 'j235' },
  { c: 'J-200', name: 'J-245', year: 2026, id: 'dT64PW5EKVDIGIHeBBS1', img: 'j245' },
  { c: 'J-200', name: 'J-275', year: 2026, id: 't7x3BCq5y5mAexiHL99m', img: 'j275' },
  { c: 'J-200', name: 'J-285', year: 2026, id: 'NC39zP5hQNf02MXr3e05', img: 'j285' },
  { c: 'Play', name: 'Echo', year: 2024, id: 'DrmNLJavxS2BzgjNdTGp', img: 'echo' },
  { c: 'Play', name: 'Mood', year: 2024, id: 'gX4jywpz9ZqDgPqimYHG', img: 'mood' },
  { c: 'Play', name: 'Soul', year: 2024, id: 'ramYD8u3V1PZYOvh2zto', img: 'soul' }
];

/*
  FICHA DE COLECCIÓN (banner + carrusel de características)
  Si una colección está aquí, al entrar se muestra su banner y un carrusel con estas características.
    key → clave de AQ_SPA_COLLECTIONS (J5, J-4, ...)   banner → imagen del banner   features → tarjetas del carrusel
  Los textos son descripciones propias de AquaBruma; las fotos son material de Jacuzzi® entregado por el cliente.
*/
window.AQ_SPA_COLLECTION_INFO = {
  'J5': {
    banner: 'img/j5/ambiente.webp',
    title: 'Colección J5',
    tagline: 'Más bienestar, más tecnología y más formas de relajarte, en un solo spa.',
    featuresTitle: 'Qué hace especial a la J5',
    features: [
      { img: 'img/j5/infrarrojo.webp', title: 'Terapia infrarroja y luz roja', text: 'Un asiento de terapia con paneles de luz integrados que acompañan el hidromasaje con calor y luz roja para la espalda.' },
      { img: 'img/j5/agua.webp', title: 'Agua True Water® con nanoburbujas', text: 'Una tecnología de burbujas ultrafinas pensada para que el agua se vea más clara, se sienta más suave y dure agradable por más tiempo.' },
      { img: 'img/j5/app.webp', title: 'Tu bienestar en una app', text: 'Sigue tus terapias, elige modos de experiencia y paisajes sonoros desde el celular.' },
      { img: 'img/j5/ambiente.webp', title: 'Atmósfera de luz', text: 'Iluminación de colores en el spa y en su base para crear el ambiente de cada momento, de día o de noche.' },
      { img: 'img/j5/celular.webp', title: 'Control en tu mano', text: 'Consulta y ajusta la temperatura y las funciones del spa desde el celular, estés donde estés en casa.' },
      { img: 'img/j5/chorros.webp', title: 'Hidromasaje envolvente', text: 'Chorros de hidroterapia de diseño cuidado para un masaje que acompaña todo el cuerpo.' },
      { img: 'img/j5/pantalla.webp', title: 'Pantalla táctil', text: 'Un panel táctil en el borde del spa para elegir terapias y programas con un solo toque.' },
      { img: 'img/j5/detalles.webp', title: 'Detalles que se disfrutan', text: 'Una cascada iluminada y una repisa para tu bebida: pequeños detalles para quedarte más tiempo.' }
    ],
    note: 'Las funciones pueden variar según el modelo. Consulta con un asesor cuál se ajusta a tu espacio.'
  }
};
