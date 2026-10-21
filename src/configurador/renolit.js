// Membranas Renolit Alkorplan (fotos optimizadas en img/texturas/renolit/). Rollos de 1,60 a 2,10 m de ancho y 20 a 25 m de largo.
// kind 'plain': color liso (la foto es solo la miniatura). kind 'img': la foto se usa como textura y se repite en espejo cada `size` metros.
// thick: espesor de la línea (1,5 mm uso general; 1,8 a 2,0 mm líneas premium, texturizadas o comerciales). Tamaño de la tesela impresa de Ceramics: 2,5 cm (supuesto).
export const RENOLIT = [
 { id: '2000-white', name: '2000 White', group: '2000', kind: 'plain', c: '#efefef', thick: '1,5 mm' },
 { id: '2000-sand', name: '2000 Sand', group: '2000', kind: 'plain', c: '#e4d4bb', thick: '1,5 mm' },
 { id: '2000-light-blue', name: '2000 Light Blue', group: '2000', kind: 'plain', c: '#a9cddb', thick: '1,5 mm' },
 { id: '2000-adriatic-blue', name: '2000 Adriatic Blue', group: '2000', kind: 'plain', c: '#018db9', thick: '1,5 mm' },
 { id: '2000-caribbean-green', name: '2000 Caribbean Green', group: '2000', kind: 'plain', c: '#41b6b1', thick: '1,5 mm' },
 { id: '2000-light-grey', name: '2000 Light Grey', group: '2000', kind: 'plain', c: '#aeaeae', thick: '1,5 mm' },
 { id: '2000-dark-grey', name: '2000 Dark Grey', group: '2000', kind: 'plain', c: '#434343', thick: '1,5 mm' },
 { id: 'extreme-ice', name: 'Extreme Ice', group: 'Extreme', kind: 'plain', c: '#efefea', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-sahara', name: 'Extreme Sahara', group: 'Extreme', kind: 'plain', c: '#e1ca9f', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-silver', name: 'Extreme Silver', group: 'Extreme', kind: 'plain', c: '#929a9c', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-volcano', name: 'Extreme Volcano', group: 'Extreme', kind: 'plain', c: '#45434b', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-onyx', name: 'Extreme Onyx', group: 'Extreme', kind: 'plain', c: '#0e0e0e', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-blue-fresh', name: 'Extreme Blue Fresh', group: 'Extreme', kind: 'plain', c: '#91bcd8', thick: '1,8 – 2,0 mm' },
 { id: 'extreme-azur', name: 'Extreme Azur', group: 'Extreme', kind: 'plain', c: '#5798c3', thick: '1,8 – 2,0 mm' },
 { id: 'ceramics-selene', name: 'Ceramics Selene', group: 'Ceramics', kind: 'img', c: '#e0e0e0', thick: '1,8 – 2,0 mm', size: 0.35, mirror: true },
 { id: 'ceramics-etna', name: 'Ceramics Etna', group: 'Ceramics', kind: 'img', c: '#adaeb6', thick: '1,8 – 2,0 mm', size: 0.325, mirror: true },
 { id: 'ceramics-sofia', name: 'Ceramics Sofia', group: 'Ceramics', kind: 'img', c: '#f7e2bd', thick: '1,8 – 2,0 mm', size: 0.35, mirror: true },
 { id: 'ceramics-atenea', name: 'Ceramics Atenea', group: 'Ceramics', kind: 'img', c: '#4686eb', thick: '1,8 – 2,0 mm', size: 0.35, mirror: true },
 { id: 'touch-authentic', name: 'Touch Authentic', group: 'Touch', kind: 'img', c: '#8e5c35', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true },
 { id: 'touch-relax', name: 'Touch Relax', group: 'Touch', kind: 'img', c: '#c9b482', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true },
 { id: 'touch-elegance', name: 'Touch Elegance', group: 'Touch', kind: 'img', c: '#282c30', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true },
 { id: 'touch-vanity', name: 'Touch Vanity', group: 'Touch', kind: 'img', c: '#d2d2cf', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true },
 { id: 'touch-sublime', name: 'Touch Sublime', group: 'Touch', kind: 'img', c: '#c1ac8c', thick: '1,8 – 2,0 mm', size: 0.5, mirror: true },
 { id: 'touch-prestige', name: 'Touch Prestige', group: 'Touch', kind: 'img', c: '#5c5c5c', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true },
 { id: 'touch-origin', name: 'Touch Origin', group: 'Touch', kind: 'img', c: '#cdcdcf', thick: '1,8 – 2,0 mm', size: 0.9, mirror: true }
];
