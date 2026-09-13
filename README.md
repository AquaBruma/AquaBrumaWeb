# AquaBruma

Sitio web de una sola página para **AquaBruma** — piscinas de autor, jacuzzis, saunas/turcos y zonas de bienestar a la medida. Diseño oscuro y elegante (paleta ink/dorado), enfocado en un segmento de clientes exigente.

## Stack técnico

- HTML estático (`index.html`), sin build ni dependencias de Node en producción.
- [Tailwind CSS](https://tailwindcss.com) vía CDN (`cdn.tailwindcss.com`), con la paleta y tipografías configuradas inline en el `<head>`.
- Tipografías: **Cormorant Garamond** (serif, títulos) y **Jost** (sans, cuerpo), vía Google Fonts.
- JavaScript vanilla (sin frameworks): menú móvil, dropdown de navegación, header que se oculta/muestra al hacer scroll, animaciones de aparición (`IntersectionObserver`), carrusel deslizable de colecciones.

## Estructura del proyecto

```
index.html              → toda la página (una sola sección por bloque, comentada)
logo-mark.png           → logotipo (marca de agua dorada, fondo transparente)
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
- **Contenido de marcas, testimonios y cifras**: son de ejemplo, pendientes de contenido real del negocio.
- **Fotografía real**: varias imágenes son de stock (Unsplash/Pexels) mientras se consigue material fotográfico propio de proyectos de AquaBruma.

## Despliegue

Al ser un sitio 100% estático, se puede desplegar directamente en Netlify, Vercel, GitHub Pages o cualquier hosting estático, sin pasos de build.
