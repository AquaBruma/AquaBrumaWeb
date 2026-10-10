/*
  CATÁLOGO DE AQUABRUMA — datos de ejemplo
  ---------------------------------------
  Todo lo que aparece en "Ver productos" sale de este archivo. Los nombres, medidas,
  capacidades y descripciones son DE EJEMPLO: reemplazarlos por los productos reales.

  Estructura de cada categoría:
    title     → nombre de la categoría
    intro     → párrafo de presentación
    photos    → fotos de la categoría (se muestran en la galería de la ventana)
    families  → grupos para filtrar (como "colecciones")
    products  → lista de productos:
        id, family, name, tagline, text,
        specs    → pares [nombre, valor] (ficha técnica)
        features → lista de características
        photos   → posiciones (empezando en 0) de las fotos de la categoría que usa el producto
*/
(function () {
  const U = (id) => 'img/photo-' + id + '.jpg';

  window.AQ_CATALOG = {
    piscinas: {
      title: 'Piscinas a la medida',
      intro: 'Desde la más sencilla hasta la más ambiciosa. Cada piscina se diseña para tu espacio, tu arquitectura y la forma en que quieres vivirla.',
      photos: ['espacio-dia.jpg', U('1766802124827-0bd80273d7ac'), U('1633368098496-be7b5571547c'), U('1721222203704-da4b946207a5'),
               U('1789374398591-fb5f3256b869'), U('1780287857843-b461b70a9b2b'), U('1649966422447-1cb8ec3b1063'), U('1617182726501-1f5f7b05a68f')],
      families: ['Borde infinito', 'Residenciales', 'Interiores', 'Terrazas'],
      products: [
        { id: 'p-horizonte', family: 'Borde infinito', name: 'Piscina Horizonte', tagline: 'El agua que se funde con el paisaje',
          text: 'Borde infinito con canal de rebose para que el agua parezca continuar más allá del límite. Ideal para terrenos con vista.',
          specs: [['Tipo', 'Borde infinito'], ['Medidas', 'Desde 8 × 4 m (a la medida)'], ['Profundidad', '1,2 a 1,5 m'], ['Acabado', 'Mosaico vítreo o porcelanato']],
          features: ['Canal de rebose y tanque de compensación', 'Iluminación LED subacuática', 'Filtración y nivel automatizados', 'Escalera integrada al diseño'], photos: [0, 2, 6] },
        { id: 'p-jardin', family: 'Residenciales', name: 'Piscina Jardín', tagline: 'Forma orgánica, ambiente natural',
          text: 'Una piscina de líneas suaves que acompaña el jardín. Perfecta para el descanso en familia, con zonas de poca profundidad.',
          specs: [['Tipo', 'Residencial, forma orgánica'], ['Medidas', 'Desde 6 × 3 m'], ['Profundidad', '1,1 a 1,6 m'], ['Acabado', 'Mosaico vítreo o membrana armada']],
          features: ['Zona baja para niños', 'Deck en madera o piedra', 'Iluminación ambiental', 'Cobertor de seguridad opcional'], photos: [3, 5, 6] },
        { id: 'p-espejo', family: 'Residenciales', name: 'Piscina Espejo', tagline: 'Líneas rectas, calma absoluta',
          text: 'Geometría limpia y agua en reposo. Un espejo que refleja el cielo y la arquitectura de la casa.',
          specs: [['Tipo', 'Residencial rectangular'], ['Medidas', 'Desde 7 × 3,5 m'], ['Profundidad', '1,3 a 1,6 m'], ['Acabado', 'Porcelanato o mosaico vítreo']],
          features: ['Borde minimalista', 'Iluminación en nicho', 'Filtración silenciosa', 'Escalera oculta'], photos: [1, 0, 7] },
        { id: 'p-calma', family: 'Interiores', name: 'Piscina Calma', tagline: 'Para usar todo el año',
          text: 'Piscina interior climatizada para disfrutar sin importar el clima, integrada a la arquitectura de la casa o del spa.',
          specs: [['Tipo', 'Interior climatizada'], ['Medidas', 'Desde 6 × 3 m'], ['Profundidad', '1,2 a 1,5 m'], ['Control', 'Temperatura y humedad']],
          features: ['Climatización de agua y ambiente', 'Deshumidificación', 'Iluminación de bajo consumo', 'Acabados antideslizantes'], photos: [7, 1, 4] },
        { id: 'p-terraza', family: 'Terrazas', name: 'Piscina Terraza', tagline: 'Agua en las alturas',
          text: 'Piscinas ligeras para azoteas y terrazas, con estructura calculada para el edificio y filtración compacta.',
          specs: [['Tipo', 'Azotea / terraza'], ['Medidas', 'Desde 4 × 2,5 m'], ['Profundidad', '1,1 a 1,4 m'], ['Estructura', 'Calculada por ingeniería']],
          features: ['Estructura ligera', 'Impermeabilización total', 'Cuarto de máquinas compacto', 'Vista abierta y barandas de cristal'], photos: [4, 0, 2] }
      ]
    },

    spas: {
      title: 'Jacuzzis & Spas',
      intro: 'Hidroterapia para descansar y desconectar sin salir de casa: spas Jacuzzi® que puedes ver en 3D y en tu propio espacio, jacuzzis empotrados y tinas de inmersión.',
      photos: ['jacuzzi-dia.jpg', 'jacuzzi-noche.jpg', U('1613487700221-38271bedcb52'), U('1777197255393-bade85462eb9'),
               U('1766603636584-38baba9fcfd4'), U('1781455495098-3643ccc923a0'), U('1672865362635-2111835dd0bf'), U('1743440164715-c99801efbb0e')],
      families: ['Spas Jacuzzi', 'Empotrados', 'Tinas'],
      subs: { 'Spas Jacuzzi': (window.AQ_SPA_COLLECTIONS || []).map((c) => c.name) },
      products: [
        // Spas Jacuzzi: salen de spas-data.js (cada uno abre su experiencia 3D / realidad aumentada oficial)
        ...(window.AQ_SPAS || []).map((s) => {
          const col = ((window.AQ_SPA_COLLECTIONS || []).find((c) => c.key === s.c) || {}).name || s.c;
          return {
            id: 'jz-' + s.img, family: 'Spas Jacuzzi', sub: col, embed: s.id, img: 'img/spas/' + s.img + '.webp', photos: [], info: s.specs || {},
            name: 'Jacuzzi® ' + s.name, tagline: 'Míralo y personalízalo en 3D',
            text: 'Explora el Jacuzzi® ' + s.name + ' en 3D desde todos los ángulos, cambia sus acabados y míralo en tu propio espacio con realidad aumentada. Nuestro equipo te asesora con medidas, instalación y disponibilidad.',
            specs: [['Modelo', String(s.year)], ['Experiencia', '3D y realidad aumentada'], ['Marca', 'Jacuzzi®'], ['Colección', col]],
            features: ['Visor 3D con opciones de gabinete y carcasa', 'Realidad aumentada desde el celular («Ver en tu espacio»)', 'Asesoría de instalación e hidráulica con AquaBruma', 'Cotización personalizada por WhatsApp']
          };
        }),
        { id: 's-terraza', family: 'Empotrados', name: 'Jacuzzi Terraza', tagline: 'Integrado al deck',
          text: 'Jacuzzi empotrado en madera o piedra, diseñado a la medida de tu terraza, con acabados que resisten el sol y la humedad.',
          specs: [['Capacidad', '2 a 6 adultos'], ['Medidas', 'A la medida'], ['Acabado', 'Madera, piedra o porcelanato'], ['Calefacción', 'Control de temperatura']],
          features: ['Diseño a la medida', 'Iluminación subacuática', 'Cuarto técnico discreto', 'Cubierta motorizada opcional'], photos: [0, 1, 2] },
        { id: 's-azotea', family: 'Empotrados', name: 'Jacuzzi Azotea', tagline: 'Con vista a la ciudad',
          text: 'Un rincón para el atardecer sobre la ciudad. Estructura liviana y chorros de hidromasaje.',
          specs: [['Capacidad', '2 a 4 adultos'], ['Medidas', 'Desde 2 × 2 m'], ['Estructura', 'Ligera, calculada'], ['Calefacción', 'Eléctrica o a gas']],
          features: ['Instalación sobre azotea', 'Baranda de cristal', 'Hidromasaje', 'Iluminación nocturna'], photos: [3, 4, 0] },
        { id: 's-calma', family: 'Tinas', name: 'Tina Calma', tagline: 'Inmersión y silencio',
          text: 'Una tina de inmersión profunda para el baño lento: agua caliente, silencio y nada más.',
          specs: [['Capacidad', '1 a 2 adultos'], ['Medidas', 'Desde 180 × 90 cm'], ['Material', 'Piedra, resina o acrílico'], ['Uso', 'Interior o exterior']],
          features: ['Diseño escultórico', 'Desagüe oculto', 'Opción con calentador', 'Acabados mate'], photos: [2, 7, 4] }
      ]
    },

    saunas: {
      title: 'Saunas & Turcos',
      intro: 'Calor seco o vapor, en maderas y revestimientos que se integran a tu casa, spa o gimnasio.',
      photos: [U('1769011496453-d6c20730843f'), U('1770573319864-b3513c899089'), U('1761470575018-135c213340eb'),
               U('1779956511263-7fc151a832ef'), U('1728404259075-209cfb5bb89c'), U('1759300031446-88e81c8a26c9')],
      families: ['Sauna seco', 'Baño turco', 'Portátiles'],
      products: [
        { id: 'sa-cabina', family: 'Sauna seco', name: 'Sauna Cabina', tagline: 'De 2 a 4 personas',
          text: 'Cabina de madera termotratada, estable y resistente a la humedad. Fácil de instalar en interiores.',
          specs: [['Capacidad', '2 a 4 personas'], ['Medidas', 'Desde 150 × 120 × 200 cm'], ['Madera', 'Termotratada'], ['Calefactor', 'Eléctrico, 4,5 a 6 kW']],
          features: ['Control digital de temperatura', 'Iluminación cálida', 'Bancas a dos niveles', 'Vidrio templado'], photos: [0, 1, 3] },
        { id: 'sa-barril', family: 'Portátiles', name: 'Sauna Barril', tagline: 'Para jardín o terraza',
          text: 'La forma de barril concentra el calor y se ve bien en cualquier jardín. Disponible en cuatro tamaños.',
          specs: [['Capacidad', '2 a 6 personas'], ['Largo', '1,8 a 3 m'], ['Madera', 'Termotratada'], ['Calefactor', 'Eléctrico o de leña']],
          features: ['Fácil instalación', 'Opción de terapia infrarroja', 'Techo panorámico opcional', 'Uso personal, familiar o comercial'], photos: [4, 5, 0] },
        { id: 'sa-turco', family: 'Baño turco', name: 'Turco Residencial', tagline: 'Vapor suave y constante',
          text: 'Cabina de vapor revestida en mosaico o porcelanato, con generador silencioso y bancas ergonómicas.',
          specs: [['Capacidad', '2 a 6 personas'], ['Medidas', 'A la medida'], ['Revestimiento', 'Mosaico o porcelanato'], ['Generador', 'Eléctrico, 3 a 9 kW']],
          features: ['Generador de vapor silencioso', 'Aromaterapia', 'Iluminación en cromoterapia', 'Piso antideslizante'], photos: [2, 1, 0] },
        { id: 'sa-infrarrojo', family: 'Sauna seco', name: 'Cabina Infrarroja', tagline: 'Calor profundo y suave',
          text: 'Calor infrarrojo que penetra con menos temperatura ambiente. Para sesiones más largas y cómodas.',
          specs: [['Capacidad', '1 a 3 personas'], ['Medidas', 'Desde 120 × 100 × 190 cm'], ['Paneles', 'Infrarrojo de espectro completo'], ['Consumo', 'Bajo']],
          features: ['Calentamiento rápido', 'Control digital', 'Sonido ambiental', 'Madera sin nudos'], photos: [3, 5, 1] }
      ]
    },

    servicio: {
      title: 'Servicio & Mantenimiento',
      intro: 'Cuidamos tu piscina o spa para que siempre esté lista para disfrutar, con planes que se adaptan a ti.',
      photos: [U('1562016600-ece13e8ba570'), U('1769339764809-522564cf34c9'), U('1778166156635-0febdb3303ff'), U('1747139089205-ee42a2221987')],
      families: ['Planes', 'Reparaciones'],
      products: [
        { id: 'm-esencial', family: 'Planes', name: 'Plan Esencial', tagline: 'Una visita al mes',
          text: 'Lo básico para mantener el agua limpia y equilibrada, con una visita técnica mensual.',
          specs: [['Visitas', '1 al mes'], ['Para', 'Piscinas y spas residenciales'], ['Incluye', 'Limpieza y balance químico'], ['Reporte', 'Informe por visita']],
          features: ['Limpieza de fondo y paredes', 'Medición y balance del agua', 'Revisión visual de equipos', 'Atención por WhatsApp'], photos: [0, 1] },
        { id: 'm-completo', family: 'Planes', name: 'Plan Completo', tagline: 'Visitas quincenales',
          text: 'Más cuidado para quienes usan la piscina a diario: visitas cada dos semanas y revisión de equipos.',
          specs: [['Visitas', '2 al mes'], ['Para', 'Uso frecuente'], ['Incluye', 'Todo lo del plan esencial + equipos'], ['Reporte', 'Informe y recomendaciones']],
          features: ['Lavado de filtros', 'Revisión de bombas y calentador', 'Productos básicos incluidos', 'Prioridad en reparaciones'], photos: [1, 2] },
        { id: 'm-club', family: 'Planes', name: 'Plan Hotel & Club', tagline: 'Para edificios y condominios',
          text: 'Mantenimiento continuo para piscinas de uso colectivo, con personal capacitado y reportes para la administración.',
          specs: [['Visitas', 'Según uso'], ['Para', 'Hoteles, clubes y conjuntos'], ['Incluye', 'Operación y control de calidad'], ['Reporte', 'Bitácora y análisis']],
          features: ['Control de calidad del agua', 'Cumplimiento de normativa', 'Personal capacitado', 'Soporte ante emergencias'], photos: [2, 3] },
        { id: 'm-reparacion', family: 'Reparaciones', name: 'Reparación y repuestos', tagline: 'Cuando algo falla',
          text: 'Diagnóstico y reparación de bombas, filtros, calentadores, iluminación y automatización, con repuestos disponibles.',
          specs: [['Servicio', 'A domicilio'], ['Para', 'Piscinas, spas y saunas'], ['Incluye', 'Diagnóstico y cotización'], ['Garantía', 'En mano de obra']],
          features: ['Diagnóstico en sitio', 'Repuestos originales', 'Reparación de fugas', 'Modernización de equipos'], photos: [3, 0] }
      ]
    },

    membranas: {
      title: 'Membranas para Piscinas',
      intro: 'Membranas resistentes con impermeabilización total, en acabados para cada proyecto, para obra nueva o renovación.',
      photos: [U('1747139089205-ee42a2221987'), U('1708103374854-beeb699854f0'), U('1511933801659-156d99ebea3e'),
               U('1769339764809-522564cf34c9'), U('1791220178491-fddf4dd8333a')],
      families: ['Membrana armada', 'Renovación'],
      products: [
        { id: 'mb-lisa', family: 'Membrana armada', name: 'Membrana Lisa', tagline: 'Color uniforme, limpieza fácil',
          text: 'Superficie lisa y uniforme en una gama de colores que va del celeste al azul profundo.',
          specs: [['Espesor', '1,5 mm'], ['Colores', 'Celeste, azul, arena, gris'], ['Garantía', 'Según fabricante'], ['Instalación', 'Soldada en sitio']],
          features: ['Resistente a cloro y sol', 'Soldadura termofusionada', 'Impermeabilización total', 'Mantenimiento sencillo'], photos: [0, 3] },
        { id: 'mb-texturizada', family: 'Membrana armada', name: 'Membrana Texturizada', tagline: 'Antideslizante donde importa',
          text: 'Relieve antideslizante para escalones, playas y zonas de poca profundidad.',
          specs: [['Espesor', '1,8 mm'], ['Acabado', 'Texturizado antideslizante'], ['Colores', 'Arena, gris, blanco'], ['Instalación', 'Soldada en sitio']],
          features: ['Agarre seguro', 'Resistente al desgaste', 'Combinable con membrana lisa', 'Apta para zonas húmedas'], photos: [1, 4] },
        { id: 'mb-diseno', family: 'Membrana armada', name: 'Membrana con diseño', tagline: 'Efecto mosaico o piedra',
          text: 'Estampados que imitan mosaico o piedra, para lograr el aspecto de un acabado clásico con la practicidad de una membrana.',
          specs: [['Espesor', '1,5 mm'], ['Acabado', 'Mosaico o piedra'], ['Colores', 'Varios'], ['Instalación', 'Soldada en sitio']],
          features: ['Aspecto de acabado clásico', 'Menos juntas y fugas', 'Instalación rápida', 'Costo accesible'], photos: [2, 4] },
        { id: 'mb-renovacion', family: 'Renovación', name: 'Renovación sin demolición', tagline: 'Nueva vida para tu piscina',
          text: 'Cubrimos tu piscina existente con membrana armada, sin romper la obra ni hacer grandes demoliciones.',
          specs: [['Plazo', 'Desde 7 días'], ['Para', 'Piscinas en concreto'], ['Incluye', 'Preparación y membrana'], ['Garantía', 'En instalación']],
          features: ['Sin demoler', 'Corrige filtraciones', 'Cambia color y aspecto', 'Obra limpia y rápida'], photos: [3, 0] }
      ]
    },

    ceramicas: {
      title: 'Porcelanato para Piscinas',
      intro: 'Porcelanatos, mosaicos y piedras seleccionadas pieza por pieza para que cada proyecto tenga color, textura y carácter propios.',
      photos: [U('1729689706848-7dd56e6759fc'), U('1784772663654-b9a89ba18271'), U('1786384452568-141f055b0c8a'),
               U('1769490315056-fd1bb6832239'), U('1769490315674-bc96e16e2cfe'), U('1791220178491-fddf4dd8333a')],
      families: ['Mosaico', 'Porcelanato', 'Piedra', 'Piezas especiales'],
      products: [
        { id: 'c-mosaico', family: 'Mosaico', name: 'Mosaico vítreo', tagline: 'Color con brillo propio',
          text: 'Mosaico de vidrio en una amplia paleta, con sistema de instalación que asegura juntas parejas.',
          specs: [['Material', 'Vidrio'], ['Formato', '2,5 × 2,5 cm en malla'], ['Colores', 'Más de 20'], ['Uso', 'Piscinas, spas y turcos']],
          features: ['No absorbe agua', 'Resistente a químicos', 'Paleta amplia', 'Instalación pareja'], photos: [1, 0, 3] },
        { id: 'c-porcelanato', family: 'Porcelanato', name: 'Porcelanato antideslizante', tagline: 'Para bordes y zonas húmedas',
          text: 'Porcelanato especializado para zonas húmedas, con distintos acabados, tamaños y texturas.',
          specs: [['Material', 'Porcelanato'], ['Formatos', '60 × 60 y 120 × 60 cm'], ['Acabado', 'Mate, texturizado'], ['Uso', 'Bordes y playas']],
          features: ['Alta resistencia al deslizamiento', 'Resistente a heladas y sol', 'Varios tonos', 'Fácil de limpiar'], photos: [2, 4] },
        { id: 'c-piedra', family: 'Piedra', name: 'Piedra natural', tagline: 'Bali, lava stone y más',
          text: 'Piedras naturales como la piedra Bali y la lava stone, que le dan carácter y calidez a los bordes y paredes.',
          specs: [['Material', 'Piedra natural'], ['Tipos', 'Bali, lava stone'], ['Acabado', 'Natural'], ['Uso', 'Bordes, muros y decks']],
          features: ['Textura única en cada pieza', 'Se mantiene fresca al sol', 'Larga duración', 'Combina con madera'], photos: [5, 2] },
        { id: 'c-especiales', family: 'Piezas especiales', name: 'Piezas especiales a la medida', tagline: 'Escalones, esquinas y canales',
          text: 'Piezas diseñadas exactamente a la medida: escalones, esquinas, canaletas y remates que completan el diseño.',
          specs: [['Material', 'Porcelanato y piedra'], ['Medidas', 'A la medida'], ['Plazo', 'Según diseño'], ['Uso', 'Remates y detalles']],
          features: ['Hechas a la medida', 'Combinan con tu acabado', 'Menos cortes en obra', 'Remates impecables'], photos: [3, 4, 0] }
      ]
    }
  };

  // Orden en que aparecen las tarjetas de "Seis formas de vivir el agua"
  window.AQ_CATALOG_ORDER = ['piscinas', 'spas', 'saunas', 'servicio', 'membranas', 'ceramicas'];
})();
