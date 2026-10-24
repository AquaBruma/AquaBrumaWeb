#!/usr/bin/env python3
"""
Procesa la carpeta de fotos de los spas PW (Premier Wellness) y genera:
  - img/spaspw/<referencia>/<color>-<n>.webp   (foto principal, liviana; fondo blanco -> transparente en las fotos de producto)
  - img/spaspw/<referencia>/<color>-<n>-t.webp (miniatura)
  - img/spaspw/<referencia>/hero.webp          (foto de ambiente, si la referencia la trae)
  - spaspw-data.js                             (lista window.AQ_SPAS_PW que lee el catálogo)
Carpeta de origen (no se publica):  texturas-nuevas/Spas PW/<BD-001 JAZ>/<BD-001 COPPER BLACK>/<fotos>
Uso:   python tools/build_pw.py            (todo)      |      ONLY=BD-001 python tools/build_pw.py   (una referencia)
Las medidas, capacidad, volumen y chorros se leen de las fichas técnicas (PDF) que estén dentro de cada carpeta; si una referencia
no trae ficha, el catálogo muestra solo el nombre y un asesor da los datos. Se pueden corregir a mano en OVERRIDES.
"""
import json, os, re, subprocess, sys, glob
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = 'texturas-nuevas/Spas PW'
OUT = 'img/spaspw'
ONLY = os.environ.get('ONLY')

COLORS = [('WHITE MARBLE', 'White Marble'), ('MARBLE WHITE', 'White Marble'), ('OCEAN WAVE', 'Ocean Wave'), ('COPPER', 'Copper'), ('GYPSUM', 'Gypsum'),
          ('MIDNIGHT', 'Midnight'), ('OYSTER', 'Oyster'), ('PEARL', 'Pearl'), ('SUNSET', 'Sunset'), ('WHITE', 'White')]
PREFERRED = ['White Marble', 'Pearl', 'White', 'Gypsum', 'Oyster', 'Ocean Wave', 'Midnight', 'Sunset', 'Copper']
# datos que se corrigen a mano (clave = referencia): {'capacidad': '4 personas', 'medidas': '...', 'volumen': '...', 'chorros': '...'}
OVERRIDES = {}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def cutout(im, thr=246):
    a = np.asarray(im.convert('RGB'))
    near = a.min(axis=2) >= thr
    lab, n = ndi.label(near)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    fg = ~np.isin(lab, list(border))
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_fill_holes(fg)
    lab2, n2 = ndi.label(fg)
    if n2 > 1:
        sizes = ndi.sum(fg, lab2, range(1, n2 + 1)); fg = lab2 == (1 + int(np.argmax(sizes)))
    fg = ndi.binary_erosion(fg, iterations=1)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    out = im.convert('RGBA'); out.putalpha(alpha)
    bb = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb:
        pad = int(0.04 * max(out.size))
        bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(out.width, bb[2] + pad), min(out.height, bb[3] + pad))
        out = out.crop(bb)
    return out


def is_product_shot(im):
    a = np.asarray(im.convert('RGB').resize((200, int(200 * im.height / im.width))))
    edge = np.r_[a[0].reshape(-1, 3), a[-1].reshape(-1, 3), a[:, 0].reshape(-1, 3), a[:, -1].reshape(-1, 3)]
    return (edge.min(axis=1) >= 246).mean() > 0.9


def load(path, maxw):
    im = Image.open(path)
    try: im.draft('RGB', (maxw * 2, maxw * 2))
    except Exception: pass
    im = im.convert('RGB')
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    return im


def save_webp(im, path, q, maxw):
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=4, **({'alpha_quality': 90} if im.mode == 'RGBA' else {}))
    return im.size


def specs_from_pdfs(folder):
    s = {}
    for f in glob.glob(os.path.join(folder, '*.pdf')):
        t = subprocess.run(['pdftotext', '-layout', '-enc', 'UTF-8', f, '-'], capture_output=True).stdout.decode('utf-8', 'ignore')
        cap = re.search(r'Capacidad:\s+(\d+(?:\s*-\s*\d+)?)\s*personas', t)
        if not cap: continue
        dim = re.search(r'(\d{2,3})\s*[xX]\s*(\d{2,3})\s*[xX]\s*(\d{2,3})\s*cms?', t)
        rnd = re.search(r'Ø\s*(\d{2,3})\s*[xX]\s*(\d{2,3})', t)
        wat = re.search(r'(\d[\d.,]*)\s*litros', t)
        jets = re.search(r'(\d{2,3})\s*unidades', t)
        s['capacidad'] = cap.group(1).replace(' ', '') + ' personas'
        if dim: s['medidas'] = f'{dim.group(1)} × {dim.group(2)} × {dim.group(3)} cm'
        elif rnd: s['medidas'] = f'Ø {rnd.group(1)} × {rnd.group(2)} cm'
        if wat: s['volumen'] = f'{int(wat.group(1).replace(".", "").replace(",", "")):,}'.replace(',', '.') + ' L'
        if jets: s['chorros'] = jets.group(1)
        kg = re.findall(r'(\d[\d.,]*)\s*Kg', t, re.I)
        kws = re.findall(r'(\d+[,.]?\d*)\s*KW', t, re.I)
        mx = re.search(r'(\d+[,.]?\d*)\s*KW\s*(\d+)\s*A\s*in\s*(\d+)\s*V', t, re.I)
        fmt = lambda v: f'{int(v.replace(".", "").replace(",", "")):,}'.replace(',', '.')
        if len(kg) >= 2: s['peso_vacio'] = fmt(kg[0]) + ' kg'; s['peso_lleno'] = fmt(kg[1]) + ' kg'
        if len(kws) >= 3: s['calentador'] = kws[2].replace('.', ',') + ' kW'
        if mx: s['consumo'] = f'{mx.group(1)} kW · {mx.group(2)} A · {mx.group(3)} V'
    return s


def parse_color(folder_name):
    u = folder_name.upper()
    for key, label in COLORS:
        if key in u: return label
    return None


if os.environ.get('SPECS_ONLY'):
    js_old = open('spaspw-data.js', encoding='utf-8').read()
    head, body = js_old.split('window.AQ_SPAS_PW =', 1)
    data = json.loads(body.rstrip().rstrip(';'))
    for m in data:
        mdir = next(d for d in os.listdir(SRC) if d.startswith(m['ref']))
        sp = specs_from_pdfs(os.path.join(SRC, mdir)); sp.update(OVERRIDES.get(m['ref'], {})); m['specs'] = sp
    open('spaspw-data.js', 'w', encoding='utf-8', newline=chr(10)).write(head + 'window.AQ_SPAS_PW = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';' + chr(10))
    print('fichas actualizadas'); sys.exit(0)

models = []
color_samples = {}
for mdir in sorted(d for d in os.listdir(SRC) if d.startswith('BD-')):
    ref = mdir.split()[0]
    if ONLY and ONLY != ref: continue
    name = mdir[len(ref):].strip()
    mslug = ref.lower()
    os.makedirs(os.path.join(OUT, mslug), exist_ok=True)
    model = dict(ref=ref, id='pw-' + mslug, name=name, colors=[], hero=None)
    # foto de ambiente (jpg suelta al nivel de la referencia)
    top = [f for f in sorted(os.listdir(os.path.join(SRC, mdir))) if f.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.isfile(os.path.join(SRC, mdir, f))]
    if top:
        im = load(os.path.join(SRC, mdir, top[0]), 1600)
        save_webp(im, os.path.join(OUT, mslug, 'hero.webp'), 78, 1600)
        model['hero'] = f'img/spaspw/{mslug}/hero.webp'
    sp = specs_from_pdfs(os.path.join(SRC, mdir))
    sp.update(OVERRIDES.get(ref, {}))
    model['specs'] = sp
    for cdir in sorted(d for d in os.listdir(os.path.join(SRC, mdir)) if os.path.isdir(os.path.join(SRC, mdir, d))):
        cname = parse_color(cdir)
        if not cname:
            print('  (color no reconocido)', mdir, cdir); continue
        cslug = slug(cname)
        files = []
        for f in os.listdir(os.path.join(SRC, mdir, cdir)):
            m = re.search(r'(\d+)\.(png|jpg|jpeg)$', f, re.I)
            if m: files.append((int(m.group(1)), f))
        files.sort()
        imgs = []
        for n, f in files:
            p = os.path.join(SRC, mdir, cdir, f)
            im = load(p, 1500)
            cut = is_product_shot(im)
            if cut:
                out = cutout(im)
                s1 = save_webp(out, os.path.join(OUT, mslug, f'{cslug}-{n}.webp'), 82, 1200)
                th = out.copy(); th.thumbnail((420, 420), Image.LANCZOS)
            else:
                out = im
                save_webp(out, os.path.join(OUT, mslug, f'{cslug}-{n}.webp'), 80, 1300)
                th = out.copy(); th.thumbnail((420, 420), Image.LANCZOS)
            th.save(os.path.join(OUT, mslug, f'{cslug}-{n}-t.webp'), 'WEBP', quality=72, method=4, **({'alpha_quality': 80} if th.mode == 'RGBA' else {}))
            imgs.append(dict(n=n, cut=1 if cut else 0, s=f'img/spaspw/{mslug}/{cslug}-{n}.webp', t=f'img/spaspw/{mslug}/{cslug}-{n}-t.webp'))
            if not cut:
                a = np.asarray(im.resize((60, 40)))[10:30, 15:45].reshape(-1, 3)
                color_samples.setdefault(cname, []).append(np.median(a, axis=0))
        # primero las fotos de producto (con fondo transparente), luego los detalles
        imgs.sort(key=lambda d: (-d['cut'], {3: 0, 2: 1, 1: 2}.get(d['n'], 3 + d['n']) if d['cut'] else d['n']))
        model['colors'].append(dict(id=cslug, name=cname, imgs=imgs))
        print(ref, cname, [d['n'] for d in imgs], flush=True)
    # orden de colores y portada
    order = {n: i for i, n in enumerate(PREFERRED)}
    model['colors'].sort(key=lambda c: order.get(c['name'], 99))
    cover = []
    for c in model['colors']:
        cuts = [d for d in c['imgs'] if d['cut']]
        if cuts:
            pick = sorted(cuts, key=lambda d: {3: 0, 2: 1, 1: 2}.get(d['n'], 3))
            cover.append(pick[0]['s'])
            if len(pick) > 1: cover.append(pick[1]['s'])
            break
    if model['hero']: cover.insert(1, model['hero'])
    if len(cover) < 3:
        for c in model['colors']:
            det = [d for d in c['imgs'] if not d['cut']]
            if det: cover.append(det[0]['s']); break
    model['cover'] = cover[:3] if cover else []
    models.append(model)

if ONLY:
    print('(solo', ONLY, 'procesada; no se reescribe spaspw-data.js)'); sys.exit(0)

# color representativo de cada nombre (promedio de las muestras de todas las referencias)
HEX = {}
for cname, arr in color_samples.items():
    v = np.median(np.array(arr), axis=0)
    HEX[cname] = '#%02x%02x%02x' % tuple(int(x) for x in v)
for m in models:
    for c in m['colors']: c['hex'] = HEX.get(c['name'], '#888888')

js = '''/*
  SPAS PW (Premier Wellness) — datos
  ----------------------------------
  Archivo generado por tools/build_pw.py a partir de la carpeta de fotos y las fichas técnicas. No editar a mano:
  para corregir un dato, usar OVERRIDES en tools/build_pw.py y volver a correr el script.
    cover   → 2 o 3 fotos de la tarjeta (cambian al pasar el mouse)
    colors  → cada color con sus fotos (cut = foto de producto con fondo transparente)
*/
window.AQ_SPAS_PW = ''' + json.dumps(models, ensure_ascii=False, indent=1) + ';\n'
open('spaspw-data.js', 'w', encoding='utf-8', newline='\n').write(js)
print(len(models), 'referencias;', sum(len(m['colors']) for m in models), 'colores;', sum(len(c['imgs']) for m in models for c in m['colors']), 'fotos')
