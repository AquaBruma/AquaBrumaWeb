# AquaBruma

Sitio web de una sola página para **AquaBruma** — piscinas, jacuzzis, saunas/turcos y espacios de bienestar alrededor del agua (*Pool · Spa · Wellness*). Diseño cercano, moderno y minimalista, basado en el **Manual de Identidad 2026** (paleta azul marino/celeste, logo oficial, patrón gráfico de marca).

## Stack técnico

- HTML estático (`index.html`), sin build ni dependencias de Node en producción.
- [Tailwind CSS](https://tailwindcss.com) vía CDN (`cdn.tailwindcss.com`), con la paleta y tipografías configuradas inline en el `<head>`.
- Tipografía: **Figtree** (Google Fonts) como sustituta de **Kripa**, la fuente oficial del manual (comercial, no disponible en Google Fonts). Si se consigue la licencia/archivo de Kripa, se incrusta con `@font-face` y se cambia `fontFamily.sans` en el `tailwind.config`.
- Paleta oficial (manual): `ink #0f2a3d`, `ocean #0e5586`, `sky #b2cbe9` (acento), `mist #dcebff`, `cream #f3ede9`, `sand #c9baa3`.
- Pantalla de entrada (`#preloader`): el logo se escribe, cae una gota que lo difumina y aparece el monograma "ab" (~4,5 s; se salta con un toque/clic o Enter). El video del hero y las animaciones de aparición arrancan cuando termina.
- Interactividad: íconos que se animan al pasar (gota, sol, luna, ondas, loto, corazón…), los cinco elementos cambian su descripción, etiquetas que se abren, franja que se pausa y una onda de agua al hacer clic/tocar.
- Ventana de detalle (`#modal`): al tocar un proyecto o una colección se abre un resumen (foto, ubicación, tipo, superficie, descripción, características y botón de WhatsApp con mensaje prellenado). Navega con flechas del teclado, botones o deslizando en el celular. Los textos viven en el objeto `DATA` del script al final de `index.html`.
- Catálogo: la opción "Catálogo" del menú lleva a "Seis formas de vivir el agua" (`#colecciones`), cuyas tarjetas abren su resumen en la ventana de detalle.
- Catálogo de productos: dentro del resumen de cada "forma de vivir el agua" las fotos de la categoría van pasando solas, y el botón "Ver productos" abre un catálogo con filtros por familia, tarjetas, ficha de cada producto (fotos, ficha técnica, características, cotizar por WhatsApp) y un formulario que envía los datos por WhatsApp. Inspirado en la estructura categoría → colecciones → modelos → ficha de ambienteazul.com.co. Todo sale de `catalogo-data.js`.
- Modo claro / oscuro: el foquito del encabezado alterna entre el fondo oscuro (por defecto) y uno claro (crema, texto marino, acento azul profundo). Se recuerda la elección de cada persona (`localStorage`, clave `aq-theme`) y se aplica antes de pintar para evitar parpadeos. Los colores salen de variables `--c-*` (bloque "TEMAS" del `<style>`); las zonas sobre fotos o video (hero, tarjetas con foto, comparador Día/Noche, "Cuéntanos tu idea") se quedan oscuras en ambos modos.
- JavaScript vanilla (sin frameworks): menú móvil, dropdown de navegación, header que se oculta/muestra al hacer scroll, animaciones de aparición (`IntersectionObserver`), carrusel deslizable de colecciones.

## Estructura del proyecto

```
index.html              → toda la página (una sola sección por bloque, comentada)
aquabruma-logo.png      → logotipo oficial (celeste de marca, fondo transparente)
ab-mark.png             → monograma "ab" oficial (se usa en favicon e íconos)
aquabruma-logo-dark.png → logo en marino (para el modo claro)
pattern-olas-claro.png  → patrón en celestes de marca (para el modo claro)
pattern-olas.png        → patrón gráfico oficial (insumos gráficos del manual)
espacio-dia.jpg,
espacio-noche.jpg       → par de imágenes del comparador Día / Noche (piscina; la de noche es una versión simulada)
jacuzzi-dia.jpg,
jacuzzi-noche.jpg       → segundo par del comparador (jacuzzi; la de noche es una versión simulada)
catalogo-data.js        → productos del catálogo ("Ver productos"): categorías, familias, fichas técnicas y fotos. DATOS DE EJEMPLO
favicon.*, icon-*.png,
apple-touch-icon.png,
site.webmanifest        → íconos y metadatos del sitio
robots.txt, sitemap.xml → SEO básico
hero-poster-1/2.jpg     → fotogramas de respaldo (poster) para los videos del hero
hero-dia.mp4,
hero-dia-poster.jpg   → video y portada del hero en modo claro (Pexels, licencia gratuita: piscina de agua en calma entre montañas). Solo se descarga si la persona activa el modo claro
352854_medium.mp4,
352876_medium.mp4       → videos candidatos para el hero de inicio (piscina infinita nocturna)
```

## Ver el sitio en local

No requiere instalación. Basta con levantar cualquier servidor estático desde esta carpeta, por ejemplo:

```bash
python -m http.server 4173
```

y abrir `http://localhost:4173/index.html`. (Abrirlo directamente como archivo `file://` también funciona, salvo por el video de fondo, que algunos navegadores restringen sin servidor).

## Pendientes / por confirmar

- **Video del hero**: hay dos videos candidatos (`352854_medium.mp4` y `352876_medium.mp4`); actualmente está activo el segundo. Definir cuál se queda.
- **Datos de contacto**: el número de WhatsApp (+57 300 000 0000), correo y dirección son de ejemplo — reemplazar por los datos reales de AquaBruma.
- **Dominio**: `robots.txt`, `sitemap.xml` y las etiquetas Open Graph usan `https://www.aquabruma.com` como marcador de posición.
- **Contenido de testimonios y proyectos**: son de ejemplo, pendientes de contenido real del negocio.
- **Tono de los textos**: están redactados en "tú" (cercano). Si el gerente prefiere "usted", es un ajuste rápido de textos.
- **Fotografía**: el manual pide detalles, texturas y tonos verde-azulados suaves (nada de piscinas azul saturado, flotadores ni imágenes de IA). Las fotos de stock actuales siguen esa línea, pero deben cambiarse por fotos propias de AquaBruma.

- **Comparador Día / Noche** (pestañas Piscina y Jacuzzi): las imágenes de noche (`espacio-noche.jpg`, `jacuzzi-noche.jpg`) son versiones *simuladas* (procesadas por computador) de las de día. Reemplazar cada par por fotos reales del mismo proyecto de AquaBruma, de día y de noche, con el mismo encuadre.

- **Datos de los proyectos**: ubicaciones, superficies, años y descripciones de la ventana de detalle son de ejemplo. Reemplazar por los datos reales de cada proyecto en el objeto `DATA` (al final de `index.html`).

- **Productos del catálogo**: los 26 productos de `catalogo-data.js` (nombres, medidas, capacidades, descripciones) son de ejemplo. Reemplazar por los productos reales y sus fotos.

## Despliegue

Al ser un sitio 100% estático, se puede desplegar directamente en Netlify, Vercel, GitHub Pages o cualquier hosting estático, sin pasos de build.
