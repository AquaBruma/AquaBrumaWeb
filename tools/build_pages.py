#!/usr/bin/env python3
"""
Genera las páginas internas de AquaBruma (cada una con su propia dirección, título y descripción para Google):
  /spas/  /piscinas/  /saunas/  /nosotros/  /contacto/  /disena-tu-piscina/  /disena-tu-sauna/

Uso (desde la carpeta del proyecto):   python tools/build_pages.py
Qué hace:
  - toma el encabezado, el foquito de tema y el botón de WhatsApp de index.html (así siempre quedan iguales),
  - escribe <carpeta>/index.html para cada página,
  - escribe i18n-pages-en.js con la traducción al inglés de los textos nuevos,
  - actualiza sitemap.xml.
Para cambiar un texto o agregar una página: editar PAGES más abajo y volver a correr el script.
Después de correrlo hay que recompilar los estilos:  npx tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o tailwind.css --minify
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://aquabrumapools.com'
os.chdir(ROOT)
index = open('index.html', encoding='utf-8').read()
VER = re.search(r'site\.css\?v=([0-9a-z]+)', index).group(1)

EN = {}
def t(es, en):
    EN[es] = en
    return es
def e(s):
    return html.escape(s, quote=True)

# ---------------------------------------------------------------- piezas tomadas de index.html
header = re.search(r'<header id="site-header".*?</header>', index, re.S).group(0)
theme_fab = re.search(r'<button id="theme-fab".*?</button>', index, re.S).group(0)
wa_fab = re.search(r'<a href="https://wa\.me/573194822386" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp".*?</a>', index, re.S).group(0)

def fix_header(h):
    h = re.sub(r'href="#inicio"', 'href="/"', h)
    h = re.sub(r'href="#(colecciones|proyectos)"', r'href="/#\1"', h)
    h = h.replace('href="#nosotros"', 'href="/nosotros/"').replace('href="#contacto"', 'href="/contacto/"')
    h = h.replace('href="#configurador"', 'href="/disena-tu-piscina/"').replace('href="#sauna"', 'href="/disena-tu-sauna/"')
    h = re.sub(r'href="/#colecciones" data-open-catalog="spas"', 'href="/spas/"', h)
    h = re.sub(r'(src|href)="(?!https?:|/|#|mailto:|tel:|data:)([^"]+)"', lambda m: m.group(1) + '="/' + m.group(2) + '"', h)
    return h
HEADER = fix_header(header)

# ---------------------------------------------------------------- bloques de contenido
BTN = 'inline-flex items-center gap-3 rounded-full bg-sky hover:bg-mist text-ink transition-colors duration-300 text-[11px] tracking-widest2 uppercase px-8 py-4 font-medium'
BTN2 = 'inline-flex items-center gap-3 rounded-full border border-sky/60 text-sky hover:bg-sky hover:text-ink transition-colors duration-300 text-[11px] tracking-widest2 uppercase px-8 py-4'
ARROW = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 5h14M10 1l4 4-4 4"/></svg>'
WA_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.25 8.24z"/></svg>'

def wa(text_es):
    from urllib.parse import quote
    return 'https://wa.me/573194822386?text=' + quote(text_es)

def btn(label, href, kind=1, attrs=''):
    return f'<a href="{e(href)}" class="{BTN if kind == 1 else BTN2}" {attrs}>{e(label)} {ARROW}</a>'

def eyebrow(s): return f'<p class="text-sky text-[11px] tracking-widest2 uppercase mb-4">{e(s)}</p>'

def hero(crumbs, eyebrow_s, h1, intro, ctas, img=None, alt=''):
    bc = ''.join((f'<li><a href="{href}" class="hover:text-sky transition-colors">{e(lbl)}</a></li>' if href else f'<li aria-current="page" class="text-cream/80">{e(lbl)}</li>') + ('' if i == len(crumbs) - 1 else '<li aria-hidden="true">/</li>') for i, (lbl, href) in enumerate(crumbs))
    media = f'<div class="relative rounded-3xl overflow-hidden border border-white/10 min-h-[260px] lg:min-h-[420px] order-1 lg:order-2"><img src="{img}" alt="{e(alt)}" width="1400" height="900" class="absolute inset-0 w-full h-full object-cover" fetchpriority="high"></div>' if img else ''
    cols = 'lg:grid-cols-[1.05fr_1fr]' if img else ''
    return f'''<section class="bg-ink2 pt-32 md:pt-40 pb-14 md:pb-20">
  <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
    <nav aria-label="{e(t('Ubicación', 'Location'))}"><ol class="flex items-center gap-3 text-[11px] tracking-widest2 uppercase text-cream/50 mb-8">{bc}</ol></nav>
    <div class="grid {cols} gap-10 lg:gap-14 items-center">
      <div class="order-2 lg:order-1">
        {eyebrow(eyebrow_s)}
        <h1 class="text-balance text-cream font-light text-4xl md:text-6xl tracking-tight leading-[1.1] mb-6">{e(h1)}</h1>
        <p class="text-cream/75 font-light leading-relaxed text-lg max-w-xl mb-9">{e(intro)}</p>
        <div class="flex flex-wrap gap-4">{ctas}</div>
      </div>
      {media}
    </div>
  </div>
</section>'''

def section(title, lead, body, alt=False):
    bg = 'bg-ink2' if alt else 'bg-ink'
    lead_html = f'<p class="text-cream/70 font-light leading-relaxed mt-4 max-w-2xl">{e(lead)}</p>' if lead else ''
    return f'''<section class="{bg} py-16 md:py-24">
  <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
    <h2 class="text-cream font-light text-3xl md:text-4xl tracking-tight leading-tight max-w-3xl">{e(title)}</h2>
    {lead_html}
    <div class="mt-10 md:mt-12">{body}</div>
  </div>
</section>'''

def cards(items, cols='md:grid-cols-2 lg:grid-cols-4'):
    out = []
    for it in items:
        img = f'<div class="aspect-[4/3] overflow-hidden bg-ink3"><img src="{it["img"]}" alt="{e(it.get("alt", ""))}" loading="lazy" width="800" height="600" class="w-full h-full {"object-contain p-4" if it.get("contain") else "object-cover"}"></div>' if it.get('img') else ''
        link = f'<a href="{e(it["href"])}" class="inline-flex items-center gap-2 mt-4 text-sky text-[11px] tracking-widest2 uppercase link-underline">{e(it["cta"])} {ARROW}</a>' if it.get('href') else ''
        out.append(f'<article class="rounded-2xl overflow-hidden border border-white/10 bg-ink2 flex flex-col">{img}<div class="p-6 flex flex-col flex-1"><h3 class="text-cream text-xl font-normal mb-2">{e(it["title"])}</h3><p class="text-cream/65 font-light text-sm leading-relaxed flex-1">{e(it["text"])}</p>{link}</div></article>')
    return f'<div class="grid gap-6 {cols}">' + ''.join(out) + '</div>'

def checks(items, cols='sm:grid-cols-2'):
    li = ''.join(f'<li class="flex items-start gap-3 text-cream/80 font-light"><span class="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0 mt-2.5"></span><span>{e(x)}</span></li>' for x in items)
    return f'<ul class="grid {cols} gap-x-10 gap-y-4">{li}</ul>'

def steps(items):
    out = ''.join(f'<li class="rounded-2xl border border-white/10 bg-ink2 p-6"><span class="text-sky text-[11px] tracking-widest2 uppercase">{i + 1:02d}</span><h3 class="text-cream text-lg font-normal mt-2 mb-2">{e(a)}</h3><p class="text-cream/65 font-light text-sm leading-relaxed">{e(b)}</p></li>' for i, (a, b) in enumerate(items))
    return f'<ol class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{out}</ol>'

def related(slugs):
    names = {
        'spas-pw': (t('Spas PW', 'PW spas'), t('Spas Premier Wellness en varios colores.', 'Premier Wellness spas in several colors.')),
        'spas': (t('Spas y jacuzzis', 'Spas and jacuzzis'), t('Colecciones Jacuzzi: compara modelos y míralos en 3D.', 'Jacuzzi collections: compare models and view them in 3D.')),
        'piscinas': (t('Piscinas a la medida', 'Custom pools'), t('Diseño, obra y acabados para tu piscina.', 'Design, construction and finishes for your pool.')),
        'saunas': (t('Saunas y turcos', 'Saunas and steam rooms'), t('Calor, vapor y madera integrados a tu espacio.', 'Heat, steam and wood built into your space.')),
        'disena-tu-piscina': (t('Diseña tu piscina en 3D', 'Design your pool in 3D'), t('Forma, medidas, mosaicos y membranas reales.', 'Shape, size, real mosaics and membranes.')),
        'disena-tu-sauna': (t('Diseña tu sauna en 3D', 'Design your sauna in 3D'), t('Medidas, bancas, maderas, estufa y luces.', 'Size, benches, woods, heater and lights.')),
        'nosotros': (t('Quiénes somos', 'About us'), t('Cómo trabajamos y con quién.', 'How we work and with whom.')),
        'contacto': (t('Contacto', 'Contact'), t('Habla con un asesor de AquaBruma.', 'Talk to an AquaBruma advisor.')),
    }
    items = ''.join(f'<a href="/{s}/" class="block rounded-2xl border border-white/10 bg-ink2 hover:border-sky/60 transition-colors p-6"><h3 class="text-cream text-lg font-normal mb-1">{e(names[s][0])}</h3><p class="text-cream/60 font-light text-sm">{e(names[s][1])}</p></a>' for s in slugs)
    return section(t('Sigue explorando', 'Keep exploring'), None, f'<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items}</div>')

def cta_band(text_wa):
    return f'''<section class="bg-ink2 py-16 md:py-24">
  <div class="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
    {eyebrow(t('Hablemos', "Let's talk"))}
    <h2 class="text-balance text-cream font-light text-3xl md:text-5xl tracking-tight leading-tight mb-5">{e(t('Cuéntanos tu idea', 'Tell us your idea'))}</h2>
    <p class="text-cream/70 font-light leading-relaxed max-w-xl mx-auto mb-9">{e(t('Escríbenos y agenda una conversación sin compromiso. Te ayudamos a imaginar lo que el agua puede ser en tu casa.', 'Write to us and book a no-obligation conversation. We help you imagine what water can be in your home.'))}</p>
    <a href="{e(wa(text_wa))}" target="_blank" rel="noopener" class="{BTN}">{WA_SVG} {e(t('Escríbenos por WhatsApp', 'Write to us on WhatsApp'))}</a>
  </div>
</section>'''

# ---------------------------------------------------------------- pie de página
def footer():
    links = [('/spas/', t('Spas y jacuzzis', 'Spas and jacuzzis')), ('/spas-pw/', t('Spas PW', 'PW spas')), ('/piscinas/', t('Piscinas a la medida', 'Custom pools')), ('/saunas/', t('Saunas y turcos', 'Saunas and steam rooms')),
             ('/disena-tu-piscina/', t('Diseña tu piscina en 3D', 'Design your pool in 3D')), ('/disena-tu-sauna/', t('Diseña tu sauna en 3D', 'Design your sauna in 3D')),
             ('/nosotros/', t('Quiénes somos', 'About us')), ('/contacto/', t('Contacto', 'Contact'))]
    lis = ''.join(f'<li><a href="{h}" class="link-underline">{e(n)}</a></li>' for h, n in links)
    return f'''<footer class="bg-ink2 pt-16 pb-24 md:pb-10 border-t border-white/10">
  <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
    <div class="grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
      <div>
        <a href="/" class="inline-block mb-5" aria-label="AquaBruma — inicio"><img src="/aquabruma-logo.png" alt="aquabruma" width="1200" height="214" class="logo-on-dark h-[26px] w-auto"><img src="/aquabruma-logo-dark.png" alt="" aria-hidden="true" width="1200" height="214" class="logo-on-light h-[26px] w-auto"></a>
        <p class="text-sky text-[11px] tracking-widest2 uppercase mb-4">Pool &nbsp;•&nbsp; Spa &nbsp;•&nbsp; Wellness</p>
        <p class="text-cream/55 font-light text-sm max-w-xs leading-relaxed">Crear espacios excepcionales alrededor del agua.</p>
      </div>
      <div>
        <p class="text-cream text-[11px] tracking-widest2 uppercase mb-6">Contacto</p>
        <ul class="space-y-3 text-cream/55 font-light text-sm">
          <li class="text-cream/80 font-normal">AQUABRUMA SAS</li>
          <li>NIT 902062194-8</li>
          <li><address class="not-italic leading-relaxed">Cra 42, Auto. Sur # 75-83,<br>Local 271, Nivel 2<br>Itagüí, Medellín, Colombia</address></li>
          <li><a href="https://wa.me/573194822386" data-wa-direct class="link-underline"><span data-i18n-skip>Juan Castañeda</span> · <span data-i18n-skip>+57 319 482 2386</span></a></li>
          <li><a href="https://wa.me/573123311627" data-wa-direct class="link-underline"><span data-i18n-skip>Mónica Henao</span> · <span data-i18n-skip>+57 312 331 1627</span></a></li>
          <li><a href="mailto:gerencia@aquabrumapools.com" class="link-underline">gerencia@aquabrumapools.com</a></li>
        </ul>
      </div>
      <div>
        <p class="text-cream text-[11px] tracking-widest2 uppercase mb-6">{e(t('Páginas', 'Pages'))}</p>
        <ul class="space-y-3 text-cream/55 font-light text-sm">{lis}</ul>
      </div>
    </div>
    <div class="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-8 text-cream/40 text-xs font-light">
      <p>&copy; 2026 AquaBruma. Todos los derechos reservados.</p>
      <div class="flex items-center gap-6">
        <a href="#" class="link-underline" data-open-cookies>Política de privacidad</a>
        <a href="#" class="link-underline" data-open-cookies>Configurar cookies</a>
      </div>
    </div>
  </div>
</footer>'''

# ---------------------------------------------------------------- páginas
SPA_COLLECTIONS = [
    ('J5', 'img/spas/j509.webp', t('Más bienestar, más tecnología y más formas de relajarte, en un solo spa.', 'More wellness, more technology and more ways to relax, in a single spa.')),
    ('J-4', 'img/spas/j408.webp', t('Un spa pensado para compartir: asientos cómodos, buen hidromasaje y el control al alcance de tu mano.', 'A spa made for sharing: comfortable seats, great hydromassage and control at your fingertips.')),
    ('J-300', 'img/spas/j345.webp', t('Un spa para tu jardín o terraza: buen hidromasaje, luz y control sencillo para disfrutarlo todos los días.', 'A spa for your garden or terrace: great hydromassage, light and simple control to enjoy every day.')),
    ('J-200', 'img/spas/j245.webp', t('Un spa sencillo y bien pensado para empezar a disfrutar del hidromasaje en casa.', 'A simple, well-thought spa to start enjoying hydromassage at home.')),
]

PAGES = []

def page(slug, title, desc, body, schema_type='WebPage', crumb=None, og_image='hero-poster-1.jpg'):
    PAGES.append(dict(slug=slug, title=title, desc=desc, body=body, schema_type=schema_type, crumb=crumb, og_image=og_image))

HOME = ('Inicio', '/')
t('Inicio', 'Home')
HOME_ES = t('Inicio', 'Home')

# --- Spas
spa_cards = cards([dict(title=t('Colección ', 'Collection ') + n if False else (('Colección ' + n)), text=tx, img='/' + im, alt='Spa Jacuzzi ' + n, href='/?catalogo=spas', cta=t('Ver modelos', 'See models')) for n, im, tx in SPA_COLLECTIONS])
for n, _, _ in SPA_COLLECTIONS:
    t('Colección ' + n, 'Collection ' + n); t('Spa Jacuzzi ' + n, 'Jacuzzi spa ' + n)
page('spas',
     t('Spas y jacuzzis Jacuzzi en Colombia | AquaBruma', 'Jacuzzi spas and hot tubs in Colombia | AquaBruma'),
     t('Spas y jacuzzis Jacuzzi para terrazas, jardines e interiores en Colombia. Colecciones J5, J-4, J-300 y J-200: compara modelos, míralos en 3D y pide tu cotización.', 'Jacuzzi spas and hot tubs for terraces, gardens and indoor spaces in Colombia. J5, J-4, J-300 and J-200 collections: compare models, view them in 3D and request your quote.'),
     hero([(HOME_ES, '/'), (t('Spas y jacuzzis', 'Spas and jacuzzis'), None)], t('Jacuzzis & Spas', 'Jacuzzis & Spas'), t('Spas y jacuzzis para vivir el agua en casa', 'Spas and jacuzzis to enjoy water at home'),
          t('Hidroterapia para descansar y desconectar sin salir de casa. Te ayudamos a elegir el modelo, la ubicación y la instalación, con la temperatura, los chorros y la iluminación que más te gusten.', 'Hydrotherapy to rest and switch off without leaving home. We help you choose the model, the location and the installation, with the temperature, jets and lighting you like best.'),
          btn(t('Ver el catálogo de spas', 'See the spa catalog'), '/?catalogo=spas') + btn(t('Cotizar mi jacuzzi', 'Quote my jacuzzi'), wa('Hola, quisiera cotizar un spa o jacuzzi con AquaBruma.'), 2, 'target="_blank" rel="noopener"'),
          '/img/photo-1613487700221-38271bedcb52.jpg', t('Spa y jacuzzi AquaBruma', 'AquaBruma spa and jacuzzi'))
     + section(t('Cuatro colecciones Jacuzzi', 'Four Jacuzzi collections'), t('Cada colección reúne varios modelos. Entra al catálogo para ver cada spa en 3D, compararlos y descubrir sus funciones.', 'Each collection brings together several models. Open the catalog to see each spa in 3D, compare them and discover their features.'), spa_cards)
     + section(t('Qué incluye', 'What is included'), t('Te acompañamos desde la elección hasta que el spa está funcionando.', 'We are with you from choosing the model until the spa is up and running.'),
               checks([t('Modelos empotrados o independientes', 'Built-in or freestanding models'), t('Calefacción y control de temperatura', 'Heating and temperature control'), t('Iluminación ambiental', 'Ambient lighting'), t('Instalación y puesta en marcha', 'Installation and start-up'), t('Asesoría para elegir tamaño y ubicación', 'Advice on choosing size and location'), t('Comparador de dos modelos lado a lado', 'Side-by-side comparison of two models')]), alt=True)
     + related(['spas-pw', 'disena-tu-piscina', 'saunas']) + cta_band('Hola, quisiera información sobre spas y jacuzzis con AquaBruma.'),
     'CollectionPage')


# --- Spas PW (solo si ya existe spaspw-data.js, generado por tools/build_pw.py)
if os.path.exists('spaspw-data.js'):
    pw = json.loads(open('spaspw-data.js', encoding='utf-8').read().split('window.AQ_SPAS_PW =', 1)[1].rstrip().rstrip(';'))
    def pw_text(m):
        sp = m.get('specs') or {}
        return ' · '.join(x for x in [sp.get('capacidad'), sp.get('medidas')] if x) or (str(len(m['colors'])) + ' colores disponibles')
    t('colores disponibles', 'colors available')
    pw_cards = cards([dict(title=m['name'], text=pw_text(m), img='/' + m['cover'][0], alt='Spa PW ' + m['name'], href='/?catalogo=spaspw&producto=' + m['id'], cta=t('Ver colores', 'See colors'), contain=True) for m in pw if m['cover']], 'sm:grid-cols-2 lg:grid-cols-4')
    page('spas-pw',
         t('Spas PW (Premier Wellness) en Colombia | AquaBruma', 'PW spas (Premier Wellness) in Colombia | AquaBruma'),
         t('Spas PW de Premier Wellness en Colombia: modelos con hidromasaje, cromoterapia y gabinete negro, en varios colores. Mira cada modelo en todos sus colores y cotiza con un asesor.', 'PW spas by Premier Wellness in Colombia: models with hydromassage, chromotherapy and a black cabinet, in several colors. See each model in all its colors and get a quote from an advisor.'),
         hero([(HOME_ES, '/'), (t('Spas PW', 'PW spas'), None)], t('Spas PW', 'PW spas'), t('Spas PW para tu casa', 'PW spas for your home'),
              t('La línea PW de Premier Wellness reúne spas con hidromasaje, cromoterapia y generador de ozono, con gabinete negro y varios colores de acrílico. Elige el modelo y mira cómo se ve en cada color.', 'The PW line by Premier Wellness brings together spas with hydromassage, chromotherapy and an ozone generator, with a black cabinet and several acrylic colors. Choose the model and see how it looks in each color.'),
              btn(t('Ver los modelos', 'See the models'), '/?catalogo=spaspw') + btn(t('Cotizar un spa PW', 'Quote a PW spa'), wa('Hola, quisiera cotizar un spa PW con AquaBruma.'), 2, 'target="_blank" rel="noopener"'),
              '/' + (pw[0].get('hero') or pw[0]['cover'][0]), t('Spa PW en un ambiente exterior', 'PW spa in an outdoor setting'))
         + section(t('Los modelos', 'The models'), t('Cada modelo se ve en todos sus colores: entra al catálogo y elige el que más te guste.', 'Every model is shown in all its colors: open the catalog and pick the one you like most.'), pw_cards)
         + related(['spas', 'piscinas', 'contacto']) + cta_band('Hola, quisiera información sobre los spas PW con AquaBruma.'),
         'CollectionPage', og_image=(pw[0].get('hero') or pw[0]['cover'][0]))

# --- Piscinas
page('piscinas',
     t('Piscinas a la medida en Colombia | AquaBruma', 'Custom swimming pools in Colombia | AquaBruma'),
     t('Diseño y construcción de piscinas a la medida en Colombia: desbordantes, infinity, interiores y exteriores. Membranas, mosaicos y porcelanatos de fabricantes reconocidos. Diseña la tuya en 3D.', 'Design and construction of custom swimming pools in Colombia: overflow, infinity, indoor and outdoor. Membranes, mosaics and porcelain tiles from recognized manufacturers. Design yours in 3D.'),
     hero([(HOME_ES, '/'), (t('Piscinas a la medida', 'Custom pools'), None)], t('Piscinas', 'Pools'), t('Piscinas a la medida para tu espacio', 'Custom pools for your space'),
          t('Desbordantes, infinity, interiores o exteriores. Estudiamos tu espacio y diseñamos una piscina que se sienta tuya desde el primer día, con acabados que resisten el sol y el uso diario.', 'Overflow, infinity, indoor or outdoor. We study your space and design a pool that feels yours from day one, with finishes that withstand the sun and daily use.'),
          btn(t('Diseña tu piscina en 3D', 'Design your pool in 3D'), '/disena-tu-piscina/', 1, 'data-open-configurator') + btn(t('Cotizar mi piscina', 'Quote my pool'), wa('Hola, quisiera cotizar una piscina con AquaBruma.'), 2, 'target="_blank" rel="noopener"'),
          '/img/photo-1766802124827-0bd80273d7ac.jpg', t('Piscina a la medida AquaBruma', 'Custom AquaBruma pool'))
     + section(t('Del boceto al último detalle', 'From the first sketch to the last detail'), t('Acompañamos a familias, arquitectos e interioristas en cada etapa.', 'We support families, architects and interior designers at every stage.'),
               checks([t('Diseño y cálculo a la medida', 'Custom design and engineering'), t('Formas clásicas u orgánicas', 'Classic or organic shapes'), t('Iluminación y automatización', 'Lighting and automation'), t('Obra y entrega', 'Construction and handover'), t('Renovación sin romper la obra', 'Renovation without breaking the structure'), t('Servicio y mantenimiento', 'Service and maintenance')]))
     + section(t('Acabados para cada proyecto', 'Finishes for every project'), t('Trabajamos con fabricantes reconocidos para que el color, la textura y la durabilidad respondan a tu idea.', 'We work with recognized manufacturers so that color, texture and durability match your idea.'),
               cards([
                   dict(title=t('Membranas para piscinas', 'Pool membranes'), text=t('Membranas resistentes con impermeabilización total, en colores lisos, mosaicos impresos y texturas.', 'Resistant membranes with total waterproofing, in plain colors, printed mosaics and textures.'), img='/img/photo-1747139089205-ee42a2221987.jpg', alt=t('Membranas para piscinas', 'Pool membranes')),
                   dict(title=t('Mosaico vítreo', 'Glass mosaic'), text=t('Vidrio en piezas pequeñas, con brillo y profundidad, en decenas de colores.', 'Small glass pieces with shine and depth, in dozens of colors.'), img='/img/photo-1729689706848-7dd56e6759fc.jpg', alt=t('Mosaico vítreo', 'Glass mosaic')),
                   dict(title=t('Porcelanato y piedra', 'Porcelain tile and stone'), text=t('Porcelanatos y piezas antideslizantes para bordes, terrazas y zonas húmedas.', 'Porcelain tiles and non-slip pieces for coping, terraces and wet areas.'), img='/img/photo-1769339764809-522564cf34c9.jpg', alt=t('Porcelanato para piscinas', 'Porcelain tile for pools')),
               ], 'md:grid-cols-3'), alt=True)
     + related(['disena-tu-piscina', 'spas', 'nosotros']) + cta_band('Hola, quisiera información sobre piscinas con AquaBruma.'),
     'Service')

# --- Saunas
page('saunas',
     t('Saunas y baños turcos en Colombia | AquaBruma', 'Saunas and steam rooms in Colombia | AquaBruma'),
     t('Saunas secos, de vapor y baños turcos a la medida en Colombia: maderas seleccionadas, estufas, iluminación e instalación. Diseña tu sauna en 3D y pide tu cotización.', 'Custom dry saunas, steam saunas and steam rooms in Colombia: selected woods, heaters, lighting and installation. Design your sauna in 3D and request your quote.'),
     hero([(HOME_ES, '/'), (t('Saunas y turcos', 'Saunas and steam rooms'), None)], t('Saunas & Turcos', 'Saunas & Steam rooms'), t('Saunas y turcos que se integran a tu espacio', 'Saunas and steam rooms that blend into your space'),
          t('Calor, vapor y madera para una pausa que se siente en el cuerpo. Se integran a tu arquitectura sin complicaciones, en casas, spas y gimnasios.', 'Heat, steam and wood for a pause you can feel in your body. They blend into your architecture without fuss, in homes, spas and gyms.'),
          btn(t('Diseña tu sauna en 3D', 'Design your sauna in 3D'), '/disena-tu-sauna/', 1, 'data-open-sauna') + btn(t('Cotizar mi sauna o turco', 'Quote my sauna or steam room'), wa('Hola, quisiera cotizar una sauna o turco con AquaBruma.'), 2, 'target="_blank" rel="noopener"'),
          '/img/photo-1769011496453-d6c20730843f.jpg', t('Sauna AquaBruma', 'AquaBruma sauna'))
     + section(t('Qué podemos hacer por ti', 'What we can do for you'), None,
               checks([t('Sauna seco o vapor (turco)', 'Dry sauna or steam (steam room)'), t('Maderas y revestimientos seleccionados', 'Selected woods and linings'), t('Generadores y control digital', 'Generators and digital control'), t('Estufas eléctricas o de leña, e infrarrojos', 'Electric or wood-burning heaters, and infrared'), t('Bancas en uno o dos niveles', 'Benches on one or two levels'), t('Diseño e instalación', 'Design and installation')]))
     + section(t('Míralo antes de decidir', 'See it before you decide'), t('Con nuestro configurador 3D defines las medidas, las bancas, la puerta, las maderas, la estufa y la iluminación, y lo ves por dentro y por fuera.', 'With our 3D configurator you set the size, benches, door, woods, heater and lighting, and see it inside and out.'),
               f'<div class="flex flex-wrap gap-4">{btn(t("Abrir el configurador de saunas", "Open the sauna configurator"), "/disena-tu-sauna/", 1, "data-open-sauna")}</div>', alt=True)
     + related(['disena-tu-sauna', 'spas', 'piscinas']) + cta_band('Hola, quisiera información sobre saunas y turcos con AquaBruma.'),
     'Service')

# --- Nosotros
page('nosotros',
     t('Quiénes somos | AquaBruma', 'About us | AquaBruma'),
     t('AquaBruma nace en 2026 para que disfrutar del agua en casa sea una experiencia cercana, bien pensada y sin complicaciones. Piscinas, spas, saunas y espacios de bienestar en Colombia.', 'AquaBruma was founded in 2026 so that enjoying water at home is a close, well-thought and hassle-free experience. Pools, spas, saunas and wellness spaces in Colombia.'),
     hero([(HOME_ES, '/'), (t('Quiénes somos', 'About us'), None)], 'Pool • Spa • Wellness', t('Dominamos la técnica y la convertimos en diseño', 'We master the technique and turn it into design'),
          t('AquaBruma nace en 2026 con una idea sencilla: que disfrutar del agua en casa sea una experiencia cercana, bien pensada y sin complicaciones.', 'AquaBruma was founded in 2026 with a simple idea: that enjoying water at home should be a close, well-thought and hassle-free experience.'),
          btn(t('Hablar con un asesor', 'Talk to an advisor'), wa('Hola, quisiera conocer más sobre AquaBruma.'), 1, 'target="_blank" rel="noopener"'),
          '/img/photo-1617182726501-1f5f7b05a68f.jpg', t('Piscina interior de líneas limpias en tonos claros', 'Indoor pool with clean lines in light tones'))
     + section(t('Cómo trabajamos', 'How we work'), t('Acompañamos a familias, arquitectos e interioristas en cada etapa: desde el primer boceto hasta el último detalle del acabado.', 'We support families, architects and interior designers at every stage: from the first sketch to the last detail of the finish.'),
               steps([(t('Escuchamos', 'We listen'), t('Entendemos tu espacio, tu estilo y cómo quieres vivir el agua.', 'We understand your space, your style and how you want to live with water.')),
                      (t('Diseñamos', 'We design'), t('Proponemos formas, medidas y materiales, y los vemos juntos en 3D.', 'We propose shapes, sizes and materials, and look at them together in 3D.')),
                      (t('Construimos', 'We build'), t('Obra, instalación y acabados con fabricantes reconocidos.', 'Construction, installation and finishes with recognized manufacturers.')),
                      (t('Cuidamos', 'We care'), t('Servicio y mantenimiento para que todo siga como el primer día.', 'Service and maintenance so everything stays like day one.'))]))
     + section(t('Fabricantes con los que trabajamos', 'Manufacturers we work with'), t('Productos de marcas reconocidas en piscinas, spas, saunas y acabados.', 'Products from recognized brands in pools, spas, saunas and finishes.'),
               '<ul class="flex flex-wrap items-center gap-x-10 gap-y-6">' + ''.join(f'<li><img src="/img/marcas/{m}.png" alt="{n}" data-i18n-skip loading="lazy" height="40" class="h-10 w-auto opacity-90"></li>' for m, n in [('jacuzzi', 'Jacuzzi'), ('renolit', 'Renolit'), ('reviglass', 'Reviglass'), ('gres-aragon', 'Gres Aragón'), ('togama', 'Togama'), ('mapei', 'Mapei'), ('astralpool', 'AstralPool'), ('jandy', 'Jandy'), ('pentair', 'Pentair'), ('hayward', 'Hayward'), ('emaux', 'Emaux')]) + '</ul>', alt=True)
     + related(['piscinas', 'spas', 'contacto']) + cta_band('Hola, quisiera conocer más sobre AquaBruma.'),
     'AboutPage')

# --- Contacto
def advisor(n, ph, link):
    return f'<a href="{link}" data-wa-direct class="block rounded-2xl border border-white/10 bg-ink2 hover:border-sky/60 transition-colors p-6"><p class="text-cream text-lg font-normal" data-i18n-skip>{n}</p><p class="text-cream/60 font-light text-sm mt-1" data-i18n-skip>{ph}</p><p class="text-sky text-[11px] tracking-widest2 uppercase mt-4">{e(t("Escribir por WhatsApp", "Write on WhatsApp"))}</p></a>'
page('contacto',
     t('Contacto | AquaBruma', 'Contact | AquaBruma'),
     t('Contacta a AquaBruma en Itagüí, Medellín: asesores por WhatsApp, correo y dirección. Cuéntanos tu idea de piscina, spa o sauna y agenda una conversación sin compromiso.', 'Contact AquaBruma in Itagüí, Medellín: advisors on WhatsApp, email and address. Tell us your pool, spa or sauna idea and book a no-obligation conversation.'),
     hero([(HOME_ES, '/'), (t('Contacto', 'Contact'), None)], t('Hablemos', "Let's talk"), t('Cuéntanos tu idea', 'Tell us your idea'),
          t('Escríbenos y agenda una conversación sin compromiso. Te ayudamos a imaginar lo que el agua puede ser en tu casa.', 'Write to us and book a no-obligation conversation. We help you imagine what water can be in your home.'),
          btn(t('Escríbenos por WhatsApp', 'Write to us on WhatsApp'), wa('Hola, quisiera hablar con un asesor de AquaBruma.'), 1, 'target="_blank" rel="noopener"'))
     + section(t('Nuestros asesores', 'Our advisors'), t('Te respondemos por WhatsApp. Elige con quién quieres hablar.', 'We reply on WhatsApp. Choose who you would like to talk to.'),
               '<div class="grid gap-5 sm:grid-cols-2 max-w-3xl">' + advisor('Juan Castañeda', '+57 319 482 2386', 'https://wa.me/573194822386') + advisor('Mónica Henao', '+57 312 331 1627', 'https://wa.me/573123311627') + '</div>')
     + section(t('Dónde estamos', 'Where we are'), None,
               f'''<div class="grid gap-8 md:grid-cols-2 max-w-4xl"><div class="text-cream/75 font-light leading-relaxed"><p class="text-cream font-normal mb-2">AQUABRUMA SAS</p><address class="not-italic">Cra 42, Auto. Sur # 75-83,<br>Local 271, Nivel 2<br>Itagüí, Medellín, Colombia</address><p class="mt-4"><a href="mailto:gerencia@aquabrumapools.com" class="link-underline text-sky">gerencia@aquabrumapools.com</a></p></div><div><a href="https://www.google.com/maps/search/?api=1&query=Cra+42+Autopista+Sur+75-83+Itag%C3%BCi+Antioquia+Colombia" target="_blank" rel="noopener" class="{BTN2}">{e(t("Ver en Google Maps", "View on Google Maps"))} {ARROW}</a></div></div>''', alt=True)
     + related(['spas', 'piscinas', 'saunas']),
     'ContactPage')

# --- Diseña tu piscina
page('disena-tu-piscina',
     t('Diseña tu piscina en 3D | AquaBruma', 'Design your pool in 3D | AquaBruma'),
     t('Configurador 3D de piscinas: elige forma, medidas, mosaicos Reviglass, membranas Renolit, borde, terraza, agua y luces. Míralo de día y de noche y pide tu cotización con el diseño listo.', '3D pool configurator: choose shape, size, Reviglass mosaics, Renolit membranes, coping, deck, water and lights. See it by day and by night and request your quote with the design ready.'),
     hero([(HOME_ES, '/'), (t('Diseña tu piscina', 'Design your pool'), None)], t('Configurador 3D', '3D configurator'), t('Diseña tu piscina en 3D', 'Design your pool in 3D'),
          t('Elige la forma, las medidas, el revestimiento, la terraza y las luces. Míralo de día y de noche, gíralo desde todos los ángulos y pide tu cotización con el diseño listo.', 'Choose the shape, size, finish, deck and lights. See it by day and by night, rotate it from every angle and request your quote with the design ready.'),
          btn(t('Empezar a diseñar', 'Start designing'), '/disena-tu-piscina/', 1, 'data-open-configurator'),
          '/img/configurador-promo.jpg', t('Piscina diseñada en el configurador 3D de AquaBruma', 'Pool designed in the AquaBruma 3D configurator'))
     + section(t('Cómo funciona', 'How it works'), t('Siete pasos, a tu ritmo. En cualquier momento puedes volver atrás y cambiar lo que quieras.', 'Seven steps, at your own pace. You can go back and change anything at any time.'),
               steps([(t('Estilo', 'Style'), t('Parte de un diseño ya armado: Espejo, Moderna, Mediterránea, Resort o Natural.', 'Start from a ready-made design: Mirror, Modern, Mediterranean, Resort or Natural.')),
                      (t('Forma y medidas', 'Shape and size'), t('Rectangular, esquinas suaves, en L u orgánica, con largo, ancho y profundidad.', 'Rectangular, rounded, L-shaped or organic, with length, width and depth.')),
                      (t('Revestimiento', 'Finish'), t('Membranas Renolit, mosaico vítreo Reviglass, porcelanato o piedra; combínalos en piso, paredes y escalera.', 'Renolit membranes, Reviglass glass mosaic, porcelain or stone; mix them on floor, walls and steps.')),
                      (t('Borde, terraza, agua y luz', 'Coping, deck, water and light'), t('Borde espejo, terraza, color del agua y luces subacuáticas, de día o de noche.', 'Mirror edge, deck, water color and underwater lights, by day or night.'))]))
     + section(t('Qué puedes hacer', 'What you can do'), None,
               checks([t('Escalera con ancho, peldaños y material propios', 'Steps with their own width, number of steps and material'), t('Quitar el agua para ver el fondo y los contornos', 'Hide the water to see the floor and edges'), t('Spa adosado, tumbonas y sombrilla', 'Attached spa, loungers and parasol'), t('Vista aérea, frontal, planta y a ras del agua', 'Aerial, front, top and water-level views'), t('Descargar una imagen de tu diseño', 'Download an image of your design'), t('Pedir cotización a un asesor por WhatsApp', 'Request a quote from an advisor on WhatsApp')]), alt=True)
     + related(['piscinas', 'disena-tu-sauna', 'contacto']) + cta_band('Hola, quisiera diseñar una piscina con AquaBruma.'),
     'WebApplication', og_image='img/configurador-promo.jpg')

# --- Diseña tu sauna
page('disena-tu-sauna',
     t('Diseña tu sauna en 3D | AquaBruma', 'Design your sauna in 3D | AquaBruma'),
     t('Configurador 3D de saunas: define medidas, bancas, puerta y vidrio, maderas, estufa, infrarrojos e iluminación. Míralo por dentro y por fuera y pide tu cotización con el diseño listo.', '3D sauna configurator: set the size, benches, door and glass, woods, heater, infrared and lighting. See it inside and out and request your quote with the design ready.'),
     hero([(HOME_ES, '/'), (t('Diseña tu sauna', 'Design your sauna'), None)], t('Configurador 3D', '3D configurator'), t('Diseña tu sauna en 3D', 'Design your sauna in 3D'),
          t('Define las medidas, las bancas, la puerta y las maderas. Elige la estufa y la iluminación, míralas por dentro y por fuera, y pide tu cotización con el diseño listo.', 'Set the size, benches, door and woods. Choose the heater and lighting, view them inside and out, and request your quote with the design ready.'),
          btn(t('Diseñar mi sauna', 'Design my sauna'), '/disena-tu-sauna/', 1, 'data-open-sauna'),
          '/img/sauna-promo.jpg', t('Sauna diseñada en el configurador 3D de AquaBruma', 'Sauna designed in the AquaBruma 3D configurator'))
     + section(t('Cómo funciona', 'How it works'), t('Siete pasos, a tu ritmo. Puedes volver atrás cuando quieras.', 'Seven steps, at your own pace. You can go back whenever you like.'),
               steps([(t('Estilo y espacio', 'Style and space'), t('Elige un diseño de partida y las medidas exteriores de la cabina.', 'Pick a starting design and the cabin’s outside size.')),
                      (t('Distribución', 'Layout'), t('Bancas al fondo, en L, en U o laterales; una o dos alturas; puerta con vidrio y su posición.', 'Benches at the back, L-shaped, U-shaped or on the sides; one or two levels; glass door and its position.')),
                      (t('Materiales', 'Materials'), t('Siete maderas, por separado para paredes, techo, bancas y exterior.', 'Seven woods, set separately for walls, ceiling, benches and exterior.')),
                      (t('Calor y luz', 'Heat and light'), t('Estufa mural, de pie o de leña, paneles infrarrojos, focos y LED de colores.', 'Wall, floor or wood-burning heater, infrared panels, spotlights and colored LED.'))]))
     + section(t('Qué puedes hacer', 'What you can do'), None,
               checks([t('Ver la capacidad en personas y la potencia sugerida de la estufa', 'See the capacity in people and the suggested heater power'), t('Mirarla en corte interior, dentro de la sauna, por fuera y en planta', 'View it as an interior cutaway, inside, outside and from above'), t('Probar la luz de la habitación de día o de noche', 'Try the room light by day or night'), t('Descargar una imagen y compartir el enlace de tu diseño', 'Download an image and share your design link'), t('Agregar accesorios y servicios de instalación', 'Add accessories and installation services'), t('Pedir cotización a un asesor por WhatsApp', 'Request a quote from an advisor on WhatsApp')]), alt=True)
     + related(['saunas', 'disena-tu-piscina', 'contacto']) + cta_band('Hola, quisiera diseñar una sauna con AquaBruma.'),
     'WebApplication', og_image='img/sauna-promo.jpg')

# ---------------------------------------------------------------- ensamblado
THEME_BOOT = '''<script>
  try { if (localStorage.getItem('aq-theme') === 'light') document.documentElement.setAttribute('data-theme', 'light'); } catch (e) {}
</script>'''

def build(pg):
    url = f"{SITE}/{pg['slug']}/"
    crumb_name = pg['body'] and re.search(r'<li aria-current="page"[^>]*>(.*?)</li>', pg['body']).group(1)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": pg['schema_type'], "@id": url + '#pagina', "url": url, "name": pg['title'], "description": pg['desc'], "inLanguage": "es", "isPartOf": {"@id": SITE + "/#sitio"}, "publisher": {"@id": SITE + "/#empresa"}},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": html.unescape(crumb_name), "item": url}]}]}
    if pg['schema_type'] == 'WebApplication':
        ld['@graph'][0].update({"applicationCategory": "DesignApplication", "operatingSystem": "Web", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "COP"}})
    return f'''<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
<meta charset="UTF-8">
{THEME_BOOT}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(pg['title'])}</title>
<meta name="description" content="{e(pg['desc'])}">
<meta name="theme-color" content="#0f2a3d">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AquaBruma">
<meta property="og:title" content="{e(pg['title'])}">
<meta property="og:description" content="{e(pg['desc'])}">
<meta property="og:image" content="{SITE}/{pg['og_image']}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="es_CO">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(pg['title'])}">
<meta name="twitter:description" content="{e(pg['desc'])}">
<meta name="twitter:image" content="{SITE}/{pg['og_image']}">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
<link rel="stylesheet" href="/fonts.css">
<link rel="stylesheet" href="/tailwind.css?v={VER}">
<link rel="stylesheet" href="/site.css?v={VER}">
</head>
<body class="bg-ink text-cream antialiased font-light">
{HEADER}
{theme_fab}
{wa_fab}
<main>
{pg['body']}
</main>
{footer()}
<script src="/i18n-en.js?v={VER}"></script>
<script src="/i18n-pages-en.js?v={VER}"></script>
<script src="/i18n.js?v={VER}"></script>
<script src="/cookies.js?v={VER}"></script>
<script src="/advisors.js?v={VER}"></script>
<script src="/page.js?v={VER}"></script>
</body>
</html>
'''

for pg in PAGES:
    os.makedirs(pg['slug'], exist_ok=True)
    open(os.path.join(pg['slug'], 'index.html'), 'w', encoding='utf-8', newline='\n').write(build(pg))
    print('ok', pg['slug'])

# traducciones al inglés de los textos nuevos
js = '// Generado por tools/build_pages.py — traducciones de las páginas internas\nObject.assign(window.AQ_EN = window.AQ_EN || {}, ' + json.dumps({k: v for k, v in EN.items()}, ensure_ascii=False, indent=1) + ');\n'
open('i18n-pages-en.js', 'w', encoding='utf-8', newline='\n').write(js)

# sitemap
urls = [SITE + '/'] + [f"{SITE}/{p['slug']}/" for p in PAGES]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url>\n    <loc>{u}</loc>\n    <lastmod>2026-10-21</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{"1.0" if u == SITE + "/" else "0.8"}</priority>\n  </url>\n' for u in urls) + '</urlset>\n'
open('sitemap.xml', 'w', encoding='utf-8', newline='\n').write(sm)
print(len(EN), 'traducciones;', len(urls), 'URLs en el sitemap')
