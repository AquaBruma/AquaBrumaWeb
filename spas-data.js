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
  { key: 'J-300', name: 'Colección J-300' },
  { key: 'J-200', name: 'Colección J-200' },
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
    video: 'HJV5D7RL4FI', videoHalf: true,   // video en la mitad derecha del banner (con el velo); sin videoHalf cubre todo el banner
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
  },
  'J-4': {
    banner: 'img/j4/asientos.webp',
    video: 'FNCXhxzeoOM', videoHalf: true,   // YouTube (reproductor oficial, solo con permiso de cookies); si falta, solo se ve la foto
    title: 'Colección J-4',
    tagline: 'Un spa pensado para compartir: asientos cómodos, buen hidromasaje y el control al alcance de tu mano.',
    featuresTitle: 'Qué hace especial a la J-4',
    features: [
      { img: 'img/j4/luz.webp', title: 'Hidromasaje con luz', text: 'Chorros y burbujas que se combinan con luz de colores dentro del agua para una experiencia más envolvente.' },
      { img: 'img/j4/relax.webp', title: 'Un momento solo para ti', text: 'Agua cálida y tranquila para soltar la tensión del día y recuperar la calma.' },
      { img: 'img/j4/cabezal.webp', title: 'Comodidad en cada asiento', text: 'Cabezales y asientos moldeados para apoyarte y quedarte más tiempo, con una luz suave que acompaña el atardecer.' },
      { img: 'img/j4/celular.webp', title: 'Control desde el celular', text: 'Ajusta la temperatura y las funciones del spa desde el celular, sin salir del agua.' },
      { img: 'img/j4/chorro.webp', title: 'Chorros de hidroterapia', text: 'Chorros de buen caudal que se dirigen al cuerpo para un masaje que alivia la espalda y los hombros.' },
      { img: 'img/j4/pantalla.webp', title: 'Pantalla táctil', text: 'Un panel táctil en el borde del spa para elegir las funciones con un solo toque.' },
      { img: 'img/j4/asientos.webp', title: 'Asientos y chorros para todos', text: 'Una distribución de asientos y chorros pensada para que cada persona encuentre su lugar y su masaje.' },
      { img: 'img/j4/cascada.webp', title: 'Cascada de agua', text: 'Una cascada en el borde que suma el sonido del agua y un toque de calma al ambiente.' }
    ],
    note: 'Las funciones pueden variar según el modelo. Consulta con un asesor cuál se ajusta a tu espacio.'
  },
  'J-300': {
    banner: 'img/j3/exterior.webp',
    title: 'Colección J-300',
    tagline: 'Un spa para tu jardín o terraza: buen hidromasaje, luz y control sencillo para disfrutarlo todos los días.',
    featuresTitle: 'Qué hace especial a la J-300',
    features: [
      { img: 'img/j3/exterior.webp', title: 'Hecho para tu espacio', text: 'Un diseño sobrio que se integra al jardín o a la terraza, con un gabinete oscuro y una cubierta clara.' },
      { img: 'img/j3/luz.webp', title: 'Hidromasaje con luz', text: 'Chorros y burbujas acompañados de luces de colores dentro del agua para una experiencia más envolvente.' },
      { img: 'img/j3/pantalla.webp', title: 'Pantalla táctil', text: 'Un panel táctil en el borde del spa para ajustar la temperatura, las luces y los chorros con un toque.' },
      { img: 'img/j3/cabezal.webp', title: 'Cabezales con luz', text: 'Cabezales cómodos para apoyar el cuello, con una luz suave que se refleja en el agua.' },
      { img: 'img/j3/burbujas.webp', title: 'Masaje con burbujas', text: 'Chorros distribuidos para que el agua y las burbujas trabajen la espalda, las piernas y los pies.' },
      { img: 'img/j3/celular.webp', title: 'Control desde el celular', text: 'Consulta y ajusta la temperatura del spa desde el celular, sin salir del agua.' },
      { img: 'img/j3/agua.webp', title: 'Cuidado del agua', text: 'Un sistema de manejo del agua, el Clear Ray®, pensado para ayudar a mantenerla limpia y lista para usar.' },
      { img: 'img/j3/cascada.webp', title: 'Cascada iluminada', text: 'Una cascada con luz de color que suma el sonido del agua y un ambiente de calma por las noches.' }
    ],
    note: 'Las funciones pueden variar según el modelo. Consulta con un asesor cuál se ajusta a tu espacio.'
  },
  'J-200': {
    banner: 'img/j2/exterior.webp',
    title: 'Colección J-200',
    tagline: 'Un spa sencillo y bien pensado para empezar a disfrutar del hidromasaje en casa.',
    featuresTitle: 'Qué hace especial a la J-200',
    features: [
      { img: 'img/j2/exterior.webp', title: 'Hecho para tu jardín', text: 'Un spa de líneas limpias y gabinete oscuro que se integra a la terraza o al jardín.' },
      { img: 'img/j2/chorros.webp', title: 'Chorros de hidromasaje', text: 'Chorros distribuidos para que el agua y las burbujas acompañen la espalda y las piernas.' },
      { img: 'img/j2/acabado.webp', title: 'Acabados cuidados', text: 'Un gabinete con textura de madera oscura y detalles que se ven bien y se mantienen fácil.' },
      { img: 'img/j2/cabezal.webp', title: 'Cabezales con luz', text: 'Cabezales cómodos para apoyar el cuello, con una luz suave que acompaña el atardecer.' },
      { img: 'img/j2/agua.webp', title: 'Cuidado del agua', text: 'Un sistema de manejo del agua, el Clear Ray®, pensado para ayudar a mantenerla limpia y lista para usar.' }
    ],
    note: 'Las funciones pueden variar según el modelo. Consulta con un asesor cuál se ajusta a tu espacio.'
  }
};
