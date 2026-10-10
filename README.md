# AquaBruma

Sitio web de una sola página para **AquaBruma** — piscinas, jacuzzis, saunas/turcos y espacios de bienestar alrededor del agua (*Pool · Spa · Wellness*). Diseño cercano, moderno y minimalista, basado en el **Manual de Identidad 2026** (paleta azul marino/celeste, logo oficial, patrón gráfico de marca).

## Stack técnico

- HTML estático (`index.html`), sin build ni dependencias de Node en producción.
- [Tailwind CSS](https://tailwindcss.com) vía CDN (`cdn.tailwindcss.com`), con la paleta y tipografías configuradas inline en el `<head>`.
- Tipografía: **Figtree** (Google Fonts) como sustituta de **Kripa**, la fuente oficial del manual (comercial, no disponible en Google Fonts). Si se consigue la licencia/archivo de Kripa, se incrusta con `@font-face` y se cambia `fontFamily.sans` en el `tailwind.config`.
- Paleta oficial (manual): `ink #0f2a3d`, `ocean #0e5586`, `sky #b2cbe9` (acento), `mist #dcebff`, `cream #f3ede9`, `sand #c9baa3`.
- JavaScript vanilla (sin frameworks): menú móvil, dropdown de navegación, header que se oculta/muestra al hacer scroll, animaciones de aparición (`IntersectionObserver`), carrusel deslizable de colecciones.

## Estructura del proyecto

```
index.html              → toda la página (una sola sección por bloque, comentada)
aquabruma-logo.png      → logotipo oficial (celeste de marca, fondo transparente)
ab-mark.png             → monograma "ab" oficial (se usa en favicon e íconos)
pattern-olas.png        → patrón gráfico oficial (insumos gráficos del manual)
espacio-dia.jpg,
espacio-noche.jpg       → par de imágenes del comparador Día / Noche (piscina; la de noche es una versión simulada)
jacuzzi-dia.jpg,
jacuzzi-noche.jpg       → segundo par del comparador (jacuzzi; la de noche es una versión simulada)
favicon.*, icon-*.png,
apple-touch-icon.png,
site.webmanifest        → íconos y metadatos del sitio
robots.txt, sitemap.xml → SEO básico
hero-poster-1/2.jpg     → fotogramas de respaldo (poster) para los videos del hero
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

## Despliegue

Al ser un sitio 100% estático, se puede desplegar directamente en Netlify, Vercel, GitHub Pages o cualquier hosting estático, sin pasos de build.
