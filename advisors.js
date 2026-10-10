/*
  ASESORES DE WHATSAPP
  --------------------
  Todos los botones de WhatsApp del sitio (flotante, encabezado, catálogo, fichas de producto, comparador,
  formularios, pie de página) abren esta ventana para elegir con quién hablar. El mensaje que se envía ya lleva
  el producto o proyecto que la persona estaba viendo, para que el asesor sepa cómo atenderla.

  Para cambiar un asesor: editar AQ_ADVISORS (nombre, cargo, número con indicativo de país y sin símbolos).
  El avatar es un dibujo propio (SVG) para no depender de fotos; se puede reemplazar por una foto con  photo: 'img/juan.jpg'.

  API: AQAdvisors.open({ text: 'Hola, me interesa ...' })
  Cualquier enlace https://wa.me/... del sitio se intercepta solo; para saltarse la ventana, usar el atributo data-wa-direct.
*/
(function () {
  'use strict';
  const ADVISORS = window.AQ_ADVISORS = [
    { id: 'juan',   first: 'Juan',   name: 'Juan Castañeda', role: 'Asesor de experiencias',  phone: '573194822386', show: '+57 319 482 2386', avatar: 'man' },
    { id: 'monica', first: 'Mónica', name: 'Mónica Henao',   role: 'Asesora de experiencias', phone: '573123311627', show: '+57 312 331 1627', avatar: 'woman' }
  ];
  const DEFAULT_TEXT = 'Hola, quisiera información sobre AquaBruma.';
  const T = (s) => (window.AQ_I18N ? window.AQ_I18N.t(s) : s);

  const AVATARS = {
    man: `<svg viewBox="0 0 120 120" class="w-full h-full" aria-hidden="true">
      <defs><clipPath id="adv-c1"><circle cx="60" cy="60" r="60"/></clipPath></defs>
      <g clip-path="url(#adv-c1)">
        <rect width="120" height="120" fill="#b2cbe9"/>
        <path d="M14 124c0-26 20-40 46-40s46 14 46 40z" fill="#0f2a3d"/>
        <path d="M44 86l16 18 16-18" fill="#f3ede9"/>
        <path d="M54 80h12v10c0 3-3 6-6 6s-6-3-6-6z" fill="#d9a77f"/>
        <ellipse cx="60" cy="52" rx="21" ry="24" fill="#e6b891"/>
        <path d="M38 50c-2-20 10-30 24-30 15 0 24 10 20 30-3-9-8-14-14-15-9 3-20 4-30 15z" fill="#2a2420"/>
        <circle cx="52" cy="54" r="2.3" fill="#2a2420"/><circle cx="68" cy="54" r="2.3" fill="#2a2420"/>
        <path d="M53 66c4 4 10 4 14 0" stroke="#8a4f3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g></svg>`,
    woman: `<svg viewBox="0 0 120 120" class="w-full h-full" aria-hidden="true">
      <defs><clipPath id="adv-c2"><circle cx="60" cy="60" r="60"/></clipPath></defs>
      <g clip-path="url(#adv-c2)">
        <rect width="120" height="120" fill="#dcebff"/>
        <path d="M30 120c-6-44 4-86 30-86s36 42 30 86z" fill="#4a2f23"/>
        <path d="M14 124c0-26 20-40 46-40s46 14 46 40z" fill="#16384f"/>
        <path d="M46 86c4 12 10 14 14 14s10-2 14-14c-6 4-22 4-28 0z" fill="#f3ede9"/>
        <path d="M54 80h12v10c0 3-3 6-6 6s-6-3-6-6z" fill="#d9a77f"/>
        <ellipse cx="60" cy="52" rx="20" ry="23" fill="#e9bf9a"/>
        <path d="M38 52c-1-20 10-31 23-31 14 0 24 10 22 31-4-12-10-18-22-20-10 2-18 8-23 20z" fill="#4a2f23"/>
        <circle cx="52" cy="54" r="2.3" fill="#2a2420"/><circle cx="68" cy="54" r="2.3" fill="#2a2420"/>
        <path d="M53 65c4 4.5 10 4.5 14 0" stroke="#b2534a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      </g></svg>`
  };
  const WA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.25 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.56.13-.17.25-.64.8-.79.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.53.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let modal = null, lastFocus = null, current = DEFAULT_TEXT;

  function personalize(text, first) {
    return text.replace(/^(Hola|Hi)\b/, '$1 ' + first);
  }
  function link(a, text) {
    return 'https://wa.me/' + a.phone + '?text=' + encodeURIComponent(personalize(text, a.first));
  }

  function build() {
    modal = document.createElement('div');
    modal.id = 'advisor-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.className = 'fixed inset-0 z-[97] flex items-center justify-center p-3 sm:p-6 opacity-0 invisible transition-opacity duration-300';
    modal.innerHTML = `
      <div data-adv-close class="absolute inset-0 bg-ink2/85 backdrop-blur-md"></div>
      <div role="dialog" aria-modal="true" aria-labelledby="adv-title" class="relative w-full max-w-xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl bg-ink border border-cream/15 shadow-2xl shadow-black/50 p-6 sm:p-9 translate-y-3 transition-transform duration-300">
        <button type="button" data-adv-close aria-label="Cerrar" class="absolute top-4 right-4 w-10 h-10 rounded-full border border-cream/25 hover:bg-sky hover:text-ink transition-colors flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p class="text-sky text-[11px] tracking-widest2 uppercase mb-3">WhatsApp</p>
        <h2 id="adv-title" class="text-2xl sm:text-3xl font-light tracking-tight mb-3 pr-12">Habla con un asesor</h2>
        <p class="text-cream/70 text-sm font-light leading-relaxed mb-5">Elige con quién quieres hablar. Le llegará tu mensaje, con lo que estás viendo, para que te asesore mejor.</p>
        <div class="rounded-2xl border border-cream/15 bg-ink3/50 px-4 py-3 mb-6">
          <p class="text-[10px] tracking-widest2 uppercase text-cream/55 mb-1">Tu mensaje</p>
          <p id="adv-text" class="text-sm text-cream/90 font-light leading-relaxed"></p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4" id="adv-list"></div>
        <p class="text-cream/50 text-xs font-light mt-5 text-center">Se abrirá WhatsApp en una pestaña nueva.</p>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target.closest('[data-adv-close]')) close(); else if (e.target.closest('[data-adv-go]')) setTimeout(close, 150); });
  }

  function render() {
    modal.querySelector('#adv-text').textContent = T(current);
    modal.querySelector('#adv-list').innerHTML = ADVISORS.map((a) => `
      <a href="${esc(link(a, T(current)))}" target="_blank" rel="noopener" data-wa-direct data-adv-go class="group flex flex-col items-center text-center rounded-2xl border border-cream/15 hover:border-sky bg-ink3/40 hover:bg-ink3/70 p-5 transition-colors duration-300">
        <span class="block w-24 h-24 rounded-full overflow-hidden ring-2 ring-sky/40 group-hover:ring-sky transition-all duration-300 mb-4">${a.photo ? `<img src="${esc(a.photo)}" alt="" class="w-full h-full object-cover">` : AVATARS[a.avatar]}</span>
        <span class="text-lg font-normal leading-tight">${esc(a.name)}</span>
        <span class="text-sky text-[10px] tracking-[.14em] uppercase mt-1 mb-1 whitespace-nowrap">${esc(a.role)}</span>
        <span class="text-cream/55 text-xs font-light mb-4" data-i18n-skip>${esc(a.show)}</span>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky group-hover:bg-mist text-ink text-[10px] tracking-[.14em] uppercase px-4 py-2.5 font-medium transition-colors whitespace-nowrap">${WA}<span>Escribir por WhatsApp</span></span>
      </a>`).join('');
  }

  function open(opts) {
    if (!modal) build();
    current = (opts && opts.text) || DEFAULT_TEXT;
    lastFocus = document.activeElement;
    render();
    modal.classList.remove('opacity-0', 'invisible');
    modal.firstElementChild.nextElementSibling.classList.remove('translate-y-3');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    setTimeout(() => { const f = modal.querySelector('[data-adv-go]'); if (f) f.focus(); }, 60);
  }
  function close() {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    modal.classList.add('opacity-0', 'invisible');
    modal.firstElementChild.nextElementSibling.classList.add('translate-y-3');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('#catalog.open, #modal.open, #cookie-modal[aria-hidden="false"]')) document.documentElement.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); close(); }
    else if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll('button, a[href]')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);
  document.addEventListener('aq:lang', () => { if (modal && modal.getAttribute('aria-hidden') === 'false') render(); });

  // Intercepta cualquier enlace de WhatsApp del sitio (también los que se crean después)
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (!a || a.hasAttribute('data-wa-direct')) return;
    e.preventDefault();
    let text = '';
    try { text = new URL(a.href).searchParams.get('text') || ''; } catch (err) {}
    open({ text: text || a.getAttribute('data-wa-text') || DEFAULT_TEXT });
  }, true);

  window.AQAdvisors = { open, close, list: ADVISORS };
})();
