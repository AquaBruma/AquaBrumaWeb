/*
  IDIOMAS (español / inglés)
  --------------------------
  El sitio está escrito en español. Cuando la persona elige inglés, este script traduce en vivo cada texto
  (y los atributos alt, aria-label, title y placeholder) usando el diccionario de i18n-en.js
  (clave = texto en español, valor = texto en inglés). También traduce lo que el sitio crea después
  (catálogo, ventanas de detalle, comparador, cookies), porque vigila los cambios de la página.

  Para traducir un texto nuevo: agregar la línea  'texto en español': 'English text',  en i18n-en.js.
  Textos con datos variables (nombres, números): reglas con expresiones regulares en AQ_EN_PATTERNS.
  Los textos que falten se pueden ver en la consola con  AQ_I18N.missing()  mientras está en inglés.

  Idioma inicial: ?lang=en / ?lang=es en la dirección  →  lo guardado (aq-lang)  →  el del navegador (inglés si empieza por "en").
*/
(function () {
  'use strict';
  const KEY = 'aq-lang';
  const ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];
  const SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const textRec = new WeakMap();   // nodo de texto → { es, en }
  const attrRec = new WeakMap();   // elemento → { atributo: { es, en } }
  const missing = new Set();
  let lang = 'es';

  const looksText = (k) => /[a-záéíóúüñ]{2,}/i.test(k);
  const dict = () => window.AQ_EN || {};
  const pats = () => window.AQ_EN_PATTERNS || [];

  // español → inglés (o null si no hay traducción)
  function trExact(k) {
    const d = dict();
    if (Object.prototype.hasOwnProperty.call(d, k)) return d[k];
    for (const [re, fn] of pats()) {
      const m = k.match(re);
      if (m) return typeof fn === 'string' ? k.replace(re, fn) : fn.apply(null, m);
    }
    return null;
  }
  function tr(es) {
    const k = norm(es);
    if (!k) return null;
    const r = trExact(k);
    if (r !== null) return r;
    // líneas como "2 a 4 adultos · Desde 2 × 2 m": se traduce cada parte
    if (k.indexOf(' · ') > -1) {
      const out = k.split(' · ').map((p) => { const x = trExact(p); return x !== null ? x : (looksText(p) ? null : p); });
      if (out.every((x) => x !== null)) return out.join(' · ');
    }
    return null;
  }
  // para textos que arma el código (mensajes de WhatsApp, etc.)
  function t(es) {
    if (lang !== 'en') return es;
    const r = tr(es);
    return r === null ? es : r;
  }

  function doText(n) {
    const cur = n.data;
    const rec = textRec.get(n);
    if (lang === 'en') {
      if (rec && rec.en === cur) return;
      const en = tr(cur);
      if (en === null) { const k = norm(cur); if (k && looksText(k)) missing.add(k); return; }
      const lead = cur.match(/^\s*/)[0], trail = cur.match(/\s*$/)[0];
      const out = lead + en + trail;
      textRec.set(n, { es: cur, en: out });
      n.data = out;
    } else if (rec && rec.en === cur) {
      n.data = rec.es;
      textRec.delete(n);
    }
  }

  function doAttr(el, name) {
    if (!el.hasAttribute || !el.hasAttribute(name)) return;
    const cur = el.getAttribute(name);
    let recs = attrRec.get(el);
    const rec = recs && recs[name];
    if (lang === 'en') {
      if (rec && rec.en === cur) return;
      const en = tr(cur);
      if (en === null) { const k = norm(cur); if (k && looksText(k)) missing.add(k); return; }
      if (!recs) { recs = {}; attrRec.set(el, recs); }
      recs[name] = { es: cur, en };
      el.setAttribute(name, en);
    } else if (rec && rec.en === cur) {
      el.setAttribute(name, rec.es);
      delete recs[name];
    }
  }

  const META = 'meta[name="description"], meta[property="og:description"], meta[property="og:title"], meta[name="twitter:title"], meta[name="twitter:description"]';
  function doMeta() {
    document.querySelectorAll(META).forEach((m) => doAttr(m, 'content'));
    // título de la pestaña
    const rec = textRec.get(document.documentElement);
    const cur = document.title;
    if (lang === 'en') {
      if (rec && rec.en === cur) return;
      const en = tr(cur);
      if (en !== null) { textRec.set(document.documentElement, { es: cur, en }); document.title = en; }
    } else if (rec && rec.en === cur) { document.title = rec.es; textRec.delete(document.documentElement); }
  }

  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (SKIP[root.tagName] || root.hasAttribute('data-i18n-skip')) return;
      ATTRS.forEach((a) => doAttr(root, a));
    }
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(n) {
        if (n.nodeType === 1) return (SKIP[n.tagName] || n.hasAttribute('data-i18n-skip')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else ATTRS.forEach((a) => doAttr(n, a));
    }
  }

  const mo = new MutationObserver((list) => {
    if (lang !== 'en') return;
    for (const m of list) {
      if (m.type === 'childList') m.addedNodes.forEach((n) => walk(n));
      else if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttr(m.target, m.attributeName);
    }
  });

  function setLang(next, persist) {
    lang = next === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    window.AQ_LANG = lang;
    if (persist) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
    walk(document.body);
    doMeta();
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.querySelector('.lang-label').textContent = lang === 'en' ? 'ES' : 'EN';
    }
    document.dispatchEvent(new CustomEvent('aq:lang', { detail: lang }));
  }

  function initial() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (q === 'en' || q === 'es') return q;
    } catch (e) {}
    try {
      const s = localStorage.getItem(KEY);
      if (s === 'en' || s === 'es') return s;
    } catch (e) {}
    return /^en\b/i.test(navigator.language || '') ? 'en' : 'es';
  }

  function start() {
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', () => setLang(lang === 'en' ? 'es' : 'en', true));
    setLang(initial(), false);
  }

  window.AQ_LANG = 'es';
  window.AQ_I18N = { t, tr, setLang: (l) => setLang(l, true), lang: () => lang, missing: () => [...missing].sort() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
