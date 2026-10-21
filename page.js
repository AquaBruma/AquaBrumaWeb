/*
  Comportamiento común de las páginas internas (spas, piscinas, saunas, nosotros, contacto, diseña tu piscina / sauna).
  Es la versión corta de lo que index.html hace en la página principal: menú desplegable, menú del celular,
  encabezado que se oculta al bajar, foquito de tema claro/oscuro y carga de los configuradores 3D al pedirlos.
*/
(function () {
  'use strict';
  const V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '';
  const q = V ? '?v=' + V : '';

  window.scrollTo(0, 0);

  // Menú desplegable de escritorio
  (function () {
    const wrap = document.getElementById('nav-dropdown'), btn = document.getElementById('nav-dropdown-btn'), panel = document.getElementById('nav-dropdown-panel'), chevron = document.getElementById('nav-dropdown-chevron');
    if (!wrap || !btn || !panel) return;
    let open = false;
    const close = () => { open = false; panel.classList.add('opacity-0', 'invisible', '-translate-y-2'); if (chevron) chevron.style.transform = 'rotate(0deg)'; btn.setAttribute('aria-expanded', 'false'); };
    const show = () => { open = true; panel.classList.remove('opacity-0', 'invisible', '-translate-y-2'); if (chevron) chevron.style.transform = 'rotate(180deg)'; btn.setAttribute('aria-expanded', 'true'); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); open ? close() : show(); });
    document.addEventListener('click', (e) => { if (open && !wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') { close(); btn.focus(); } });
  })();

  // Tema claro / oscuro
  (function () {
    const root = document.documentElement, btns = [...document.querySelectorAll('[data-theme-switch]')], meta = document.querySelector('meta[name="theme-color"]');
    const sync = () => {
      const light = root.getAttribute('data-theme') === 'light';
      btns.forEach((b) => { b.setAttribute('aria-pressed', light ? 'true' : 'false'); b.setAttribute('aria-label', light ? 'Cambiar a fondo oscuro' : 'Cambiar a fondo claro'); });
      if (meta) meta.setAttribute('content', light ? '#f3ede9' : '#0f2a3d');
    };
    sync();
    btns.forEach((b) => b.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.classList.add('theme-anim');
      if (next === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('aq-theme', next); } catch (e) {}
      sync(); setTimeout(() => root.classList.remove('theme-anim'), 600);
    }));
    const fab = document.getElementById('theme-fab'), hdr = document.getElementById('site-header');
    if (fab && hdr) {
      const upd = () => { const show = window.scrollY > 160 && hdr.classList.contains('header-hidden'); fab.classList.toggle('opacity-0', !show); fab.classList.toggle('pointer-events-none', !show); fab.classList.toggle('translate-y-3', !show); };
      new MutationObserver(upd).observe(hdr, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('scroll', upd, { passive: true }); upd();
    }
  })();

  // Encabezado: fondo al bajar y se oculta al bajar / aparece al subir
  const header = document.getElementById('site-header'), mobileMenu = document.getElementById('mobile-menu');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 40) { header.classList.remove('bg-transparent'); header.classList.add('bg-ink/95', 'backdrop-blur-sm', 'shadow-lg', 'shadow-black/20'); }
    else { header.classList.add('bg-transparent'); header.classList.remove('bg-ink/95', 'backdrop-blur-sm', 'shadow-lg', 'shadow-black/20'); }
    if (mobileMenu.classList.contains('hidden-menu')) { if (y > lastY && y > 160) header.classList.add('header-hidden'); else header.classList.remove('header-hidden'); }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll); onScroll();

  // Menú del celular
  const menuBtn = document.getElementById('menu-btn'), menuClose = document.getElementById('menu-close');
  if (menuBtn) menuBtn.addEventListener('click', () => { mobileMenu.classList.remove('hidden-menu'); onScroll(); });
  if (menuClose) menuClose.addEventListener('click', () => { mobileMenu.classList.add('hidden-menu'); onScroll(); });
  document.querySelectorAll('.mobile-link').forEach((a) => a.addEventListener('click', () => { mobileMenu.classList.add('hidden-menu'); onScroll(); }));

  // Configuradores 3D: se descargan solo cuando alguien los abre
  let p = null, ps = null;
  const css = () => { if (!document.querySelector('link[href*="configurador.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/configurador.css' + q; document.head.appendChild(l); } };
  const loadJs = (src, flag) => new Promise((res, rej) => { if (window[flag]) { res(); return; } css(); const s = document.createElement('script'); s.src = src + q; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  function open(kind, param) {
    const pool = kind === 'pool', flag = pool ? 'AQCfg' : 'AQSauna';
    document.documentElement.classList.add('cfg-loading-js');
    const prom = pool ? (p = p || loadJs('/configurador.js', flag)) : (ps = ps || loadJs('/sauna.js', flag));
    return prom.then(() => { document.documentElement.classList.remove('cfg-loading-js'); if (param) window[flag].fromParam(param); else window[flag].open(); })
      .catch(() => { if (pool) p = null; else ps = null; document.documentElement.classList.remove('cfg-loading-js'); if (window.AQAdvisors) window.AQAdvisors.open({ text: pool ? 'Hola, quisiera diseñar una piscina con AquaBruma.' : 'Hola, quisiera diseñar una sauna con AquaBruma.' }); });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-open-configurator],[data-open-sauna]'); if (!a) return;
    e.preventDefault(); open(a.hasAttribute('data-open-sauna') ? 'sauna' : 'pool');
  });
  document.addEventListener('pointerover', (e) => { if (e.target.closest && e.target.closest('[data-open-configurator],[data-open-sauna]')) { const sauna = !!e.target.closest('[data-open-sauna]'); (sauna ? loadJs('/sauna.js', 'AQSauna') : loadJs('/configurador.js', 'AQCfg')).catch(() => {}); } }, { once: true, passive: true });
  // enlaces compartidos de diseños (?diseno=… / ?sauna=…)
  try {
    const sp = new URLSearchParams(location.search), d = sp.get('diseno'), s = sp.get('sauna');
    if (d) setTimeout(() => open('pool', d), 400); else if (s) setTimeout(() => open('sauna', s), 400);
  } catch (e) {}
})();
