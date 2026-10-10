# AquaBruma

Sitio web de una sola página para **AquaBruma** — piscinas, jacuzzis, saunas/turcos y espacios de bienestar alrededor del agua (*Pool · Spa · Wellness*). Diseño cercano, moderno y minimalista, basado en el **Manual de Identidad 2026** (paleta azul marino/celeste, logo oficial, patrón gráfico de marca).

## Stack técnico

- HTML estático (`index.html`), sin build ni dependencias de Node en producción.
- [Tailwind CSS](https://tailwindcss.com) v3 **compilado a un archivo propio** (`tailwind.css`), sin depender de internet al abrir la página. La configuración está en `tailwind.config.js` y la fuente del CSS en `src/input.css`.
- Tipografía: **Figtree** alojada en el propio sitio (`fonts.css` + carpeta `fonts/`, licencia OFL) como sustituta de **Kripa**, la fuente oficial del manual (comercial, no disponible en Google Fonts). Si se consigue la licencia/archivo de Kripa, se incrusta con `@font-face` y se cambia `fontFamily.sans` en el `tailwind.config`.
- Paleta oficial (manual): `ink #0f2a3d`, `ocean #0e5586`, `sky #b2cbe9` (acento), `mist #dcebff`, `cream #f3ede9`, `sand #c9baa3`.
- Pantalla de entrada (`#preloader`): el logo se escribe, cae una gota que lo difumina y aparece el monograma "ab" (~4,5 s; se salta con un toque/clic o Enter). El video del hero y las animaciones de aparición arrancan cuando termina.
- Interactividad: íconos que se animan al pasar (gota, sol, luna, ondas, loto, corazón…), los cinco elementos cambian su descripción, etiquetas que se abren, franja que se pausa y una onda de agua al hacer clic/tocar.
- Ventana de detalle (`#modal`): al tocar un proyecto o una colección se abre un resumen (foto, ubicación, tipo, superficie, descripción, características y botón de WhatsApp con mensaje prellenado). Navega con flechas del teclado, botones o deslizando en el celular. Los textos viven en el objeto `DATA` del script al final de `index.html`.
- Catálogo: la opción "Catálogo" del menú lleva a "Seis formas de vivir el agua" (`#colecciones`), cuyas tarjetas abren su resumen en la ventana de detalle.
- Catálogo de productos: dentro del resumen de cada "forma de vivir el agua" las fotos de la categoría van pasando solas, y el botón "Ver productos" abre un catálogo con filtros por familia, tarjetas, ficha de cada producto (fotos, ficha técnica, características, cotizar por WhatsApp) y un formulario que envía los datos por WhatsApp. Inspirado en la estructura categoría → colecciones → modelos → ficha de ambienteazul.com.co. Todo sale de `catalogo-data.js`.
- Modo claro / oscuro: el foquito del encabezado alterna entre el fondo oscuro (por defecto) y uno claro (crema, texto marino, acento azul profundo). Se recuerda la elección de cada persona (`localStorage`, clave `aq-theme`) y se aplica antes de pintar para evitar parpadeos. Los colores salen de variables `--c-*` (bloque "TEMAS" del `<style>`); en modo claro la letra es más gruesa y más oscura que en oscuro, los textos pequeños son un punto más grandes y las etiquetas, círculos, botones y tarjetas llevan un borde navy sutil (bloque "Modo claro" del `<style>`); las zonas sobre fotos o video (hero, tarjetas con foto, comparador Día/Noche, "Cuéntanos tu idea") se quedan oscuras en ambos modos.
- Franja de mensajes (debajo del inicio): tres tarjetas redondeadas que se desplazan en bucle ("Lo que todos ven", "Lo que nosotros sabemos hacer", "La superficie es la experiencia. La profundidad es Aquabruma."); se pausa al pasar el cursor. Son 8 copias del grupo para que el bucle no deje huecos en pantallas muy anchas.
- Transición hero → franja: el hero se funde con el color de fondo de la página (`.hero-fade`, funciona en ambos temas).
- Spas Jacuzzi en 3D, dentro del catálogo "Jacuzzis & Spas" (se abre desde "Seis formas de vivir el agua" → Jacuzzis & Spas → Ver productos, o desde el menú "Spas Jacuzzi"): 29 modelos (colecciones J5, J-4, J-400, J-300, J-200 y Play, versión más reciente de cada uno) como filtro "Spas Jacuzzi" con subfiltro por colección, junto a los jacuzzis empotrados y tinas de ejemplo. El detalle de cada modelo muestra la experiencia 3D / realidad aumentada oficial de Jacuzzi (Brand3D, `jg-embed.brand3d.com`, en español), que **solo se carga al abrir el detalle** (al entrar al catálogo de Jacuzzi se hacen conexiones anticipadas y una precarga invisible de ~9 s con lo que comparten todos los visores; mientras carga se muestra la foto del modelo) (es el único contenido externo del sitio). Los datos están en `spas-data.js` (id de la experiencia + miniatura en `img/spas/`; `catalogo-data.js` los convierte en productos); fuente: https://brand3d-ar.web.app/jacuzzi-hot-tubs.
- Marcas (`#marcas`, antes de "Seis formas de vivir el agua"): cuadrícula de 11 logos PNG sin recuadro y sin enlaces (75 % del tamaño original; el de Renolit, que es cuadrado, va un poco más grande). En tema oscuro se ven en blanco y se aclaran al pasar el cursor; en tema claro, en gris y a color al pasar el cursor (en celular a color). Para agregar o quitar una marca, editar la lista `<ul>` de esa sección.
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
img/spas/               → miniaturas (webp) de los 29 spas Jacuzzi; `spas-data.js` → lista de modelos
img/marcas/             → logos (PNG) de las 11 marcas aliadas (Gres Aragón, Renolit, Jacuzzi, Togama, Reviglass, Mapei, AstralPool, Jandy, Pentair, Hayward, Emaux), tomados de sus sitios oficiales
img/                    → fotos del sitio (copias locales de las de stock)
favicon.*, icon-*.png,
apple-touch-icon.png,
site.webmanifest        → íconos y metadatos del sitio
robots.txt, sitemap.xml → SEO básico
hero-poster-1/2.jpg     → fotogramas de respaldo (poster) para los videos del hero
hero-dia.mp4,
hero-dia-poster.jpg   → video y portada del hero en modo claro (Pexels 8045121, licencia gratuita: piscina de borde infinito frente al mar con una palmera; recortado del segundo 8 al 10, 2 s, ~1 MB). Solo se descarga si la persona activa el modo claro
hero-atardecer.mp4,
hero-atardecer-poster.jpg → video y portada del hero en modo OSCURO (Pexels 39576530, licencia gratuita: casa con piscina y cascada frente a una bahía, al atardecer; 1920×1080, 5,9 s, 4,3 MB)
352854_medium.mp4,
352876_medium.mp4       → videos nocturnos anteriores del hero (ya no se usan; se pueden borrar)
```

## Cómo regenerar tailwind.css

`tailwind.css` es el diseño ya compilado. Si se agregan o cambian clases de Tailwind en `index.html` (o en `catalogo-data.js`), hay que regenerarlo con Node instalado:

```bash
npx tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o tailwind.css --minify
```

Los estilos propios (animaciones, temas claro/oscuro, etc.) siguen dentro del `<style>` de `index.html` y no necesitan este paso.

## Ver el sitio en local

No requiere instalación. Basta con levantar cualquier servidor estático desde esta carpeta, por ejemplo:

```bash
python -m http.server 4173
```

y abrir `http://localhost:4173/index.html`. (Abrirlo directamente como archivo `file://` también funciona, salvo por el video de fondo, que algunos navegadores restringen sin servidor).

## Pendientes / por confirmar

- **Datos de contacto**: el número de WhatsApp (+57 300 000 0000), correo y dirección son de ejemplo — reemplazar por los datos reales de AquaBruma.
- **Dominio**: `robots.txt`, `sitemap.xml` y las etiquetas Open Graph usan `https://www.aquabruma.com` como marcador de posición.
- **Contenido de testimonios y proyectos**: son de ejemplo, pendientes de contenido real del negocio.
- **Tono de los textos**: están redactados en "tú" (cercano). Si el gerente prefiere "usted", es un ajuste rápido de textos.
- **Fotografía**: el manual pide detalles, texturas y tonos verde-azulados suaves (nada de piscinas azul saturado, flotadores ni imágenes de IA). Las fotos de stock actuales siguen esa línea, pero deben cambiarse por fotos propias de AquaBruma.

- **Comparador Día / Noche** (pestañas Piscina y Jacuzzi): las imágenes de noche (`espacio-noche.jpg`, `jacuzzi-noche.jpg`) son versiones *simuladas* (procesadas por computador) de las de día. Reemplazar cada par por fotos reales del mismo proyecto de AquaBruma, de día y de noche, con el mismo encuadre.

- **Datos de los proyectos**: ubicaciones, superficies, años y descripciones de la ventana de detalle son de ejemplo. Reemplazar por los datos reales de cada proyecto en el objeto `DATA` (al final de `index.html`).

- **Productos del catálogo**: los 26 productos de `catalogo-data.js` (nombres, medidas, capacidades, descripciones) son de ejemplo. Reemplazar por los productos reales y sus fotos.

- **Fotos de stock**: todas las fotos (32) viven en `img/` (descargadas de Unsplash, licencia gratuita; 1200 px, ~6 MB en total), así que la página no depende de ningún servidor externo. Son de ejemplo: cambiarlas por fotos propias de AquaBruma, manteniendo el mismo nombre o actualizando las rutas en `index.html` y `catalogo-data.js`.

- **Spas Jacuzzi 3D**: confirmar con Jacuzzi/Brand3D que AquaBruma puede mostrar sus modelos (miniaturas y visor) como distribuidor; el visor muestra al final de cada experiencia las opciones de acabado de Jacuzzi. Pendiente: agregar precios/medidas reales y revisar qué modelos se venderán en Colombia (se muestran los 29 de la lista pública).
- **Uso de logos de marcas**: los logos pertenecen a sus titulares. Confirmar que AquaBruma tiene autorización para mostrarlos como marcas aliadas/distribuidas, y reemplazar por las versiones oficiales de sus kits de marca si las tienen (algunos logos son de baja resolución: Jandy, Emaux, Reviglass).

## Despliegue

Al ser un sitio 100% estático, se puede desplegar directamente en Netlify, Vercel, GitHub Pages o cualquier hosting estático, sin pasos de build.
