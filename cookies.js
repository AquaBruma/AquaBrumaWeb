/*
  COOKIES Y PRIVACIDAD
  --------------------
  AquaBruma no usa cookies propias de seguimiento. Guarda en el navegador (almacenamiento local) solo:
    aq-theme (tema claro/oscuro), aq-lang (idioma) y aq-consent (esta elección).
  El contenido de terceros es el visor 3D de Jacuzzi® (Brand3D / p3d.in) y el mapa de Google Maps del pie de página.
  Por eso NO se cargan hasta que la persona lo permite (AQConsent.third()).

  Uso desde otros scripts:
    AQConsent.third()      → true si permitió contenido de terceros
    AQConsent.grantThird() → registra el permiso (por ejemplo, desde un botón "Permitir y ver en 3D")
    AQConsent.open()       → abre las preferencias
    evento 'aq:consent'    → se dispara cada vez que cambia la elección
  La elección se guarda en localStorage (aq-consent) y se puede cambiar desde el pie de página.
  Los textos están en español; la traducción al inglés está en i18n-en.js.
*/
(function () {
  'use strict';
  const KEY = 'aq-consent';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  let state = read();
  let banner = null, modal = null, lastFocus = null;

  const btnMain = 'rounded-full bg-sky hover:bg-mist text-ink transition-colors duration-300 text-[11px] tracking-widest2 uppercase px-6 py-3 font-medium';
  const btnLine = 'rounded-full border border-cream/30 hover:border-sky hover:text-sky transition-colors duration-300 text-[11px] tracking-widest2 uppercase px-6 py-3';
  const toggle = (id, on, disabled) => `
    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input id="${id}" type="checkbox" class="peer sr-only" ${on ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span class="block w-12 h-7 rounded-full bg-cream/25 peer-checked:bg-sky peer-disabled:opacity-60 transition-colors duration-300 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-sky"></span>
    </label>`;

  function decide(third) {
    state = { v: 1, third: !!third, ts: Date.now() };
    write(state);
    hideBanner();
    closeModal();
    document.dispatchEvent(new CustomEvent('aq:consent', { detail: state }));
  }

  /* ---------- Aviso inferior ---------- */
  function showBanner() {
    if (banner || state) return;
    banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.className = 'fixed z-[95] left-3 right-3 bottom-3 sm:left-auto sm:right-6 sm:bottom-24 sm:max-w-md rounded-3xl bg-ink border border-cream/20 shadow-2xl shadow-black/50 p-6 transition-all duration-500 opacity-0 translate-y-4';
    banner.innerHTML = `
      <h2 id="cookie-banner-title" class="text-lg font-normal mb-2">Tu privacidad y las cookies</h2>
      <p class="text-cream/75 text-sm font-light leading-relaxed mb-5">Solo guardamos en tu navegador lo necesario para recordar tus preferencias (tema, idioma y esta elección). El visor 3D de Jacuzzi®, el video de YouTube y el mapa de Google Maps cargan contenido de terceros que puede usar cookies y analítica: tú decides si lo permites.</p>
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" data-cookie="all" class="${btnMain}">Aceptar todas</button>
        <button type="button" data-cookie="necessary" class="${btnLine}">Solo necesarias</button>
      </div>
      <button type="button" data-cookie="prefs" class="mt-4 text-xs text-sky underline underline-offset-4 hover:text-mist">Configurar y ver la política de cookies</button>`;
    document.body.appendChild(banner);
    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cookie]'); if (!b) return;
      if (b.dataset.cookie === 'all') decide(true);
      else if (b.dataset.cookie === 'necessary') decide(false);
      else openModal();
    });
    requestAnimationFrame(() => requestAnimationFrame(() => banner && banner.classList.remove('opacity-0', 'translate-y-4')));
  }
  function hideBanner() {
    if (!banner) return;
    const b = banner; banner = null;
    b.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => b.remove(), 500);
  }

  /* ---------- Preferencias y política ---------- */
  function buildModal() {
    modal = document.createElement('div');
    modal.id = 'cookie-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.className = 'fixed inset-0 z-[96] flex items-center justify-center p-3 sm:p-6 opacity-0 invisible transition-opacity duration-300';
    modal.innerHTML = `
      <div data-close class="absolute inset-0 bg-ink2/85 backdrop-blur-md"></div>
      <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" class="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl bg-ink border border-cream/15 shadow-2xl shadow-black/50 p-6 sm:p-9">
        <button type="button" data-close aria-label="Cerrar" class="absolute top-4 right-4 w-10 h-10 rounded-full border border-cream/25 hover:bg-sky hover:text-ink transition-colors flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p class="text-sky text-[11px] tracking-widest2 uppercase mb-3">Privacidad</p>
        <h2 id="cookie-title" class="text-2xl sm:text-3xl font-light tracking-tight mb-4 pr-12">Preferencias de cookies</h2>
        <p class="text-cream/75 text-sm font-light leading-relaxed mb-6">Las cookies y el almacenamiento local son pequeños datos que un sitio guarda en tu navegador. Aquí puedes elegir cuáles permites. Puedes cambiar tu decisión cuando quieras desde «Configurar cookies», en el pie de página.</p>

        <div class="space-y-4 mb-7">
          <div class="rounded-2xl border border-cream/15 p-5 flex items-start justify-between gap-5">
            <div>
              <h3 class="text-base font-normal mb-1">Necesarias</h3>
              <p class="text-cream/70 text-sm font-light leading-relaxed">Guardan en tu navegador tu tema (claro u oscuro), tu idioma y esta elección sobre cookies. No rastrean tu actividad ni se comparten con nadie. Siempre activas.</p>
            </div>
            ${toggle('cookie-necessary', true, true)}
          </div>
          <div class="rounded-2xl border border-cream/15 p-5 flex items-start justify-between gap-5">
            <div>
              <h3 class="text-base font-normal mb-1">Contenido de terceros</h3>
              <p class="text-cream/70 text-sm font-light leading-relaxed">Visor 3D y de realidad aumentada de Jacuzzi® (Brand3D y p3d.in), video de YouTube y mapa de ubicación de Google Maps. Al cargarlos, esos servicios pueden guardar cookies y medir su uso (por ejemplo, con Google Analytics) según sus propias políticas. Si no lo permites, verás la foto del producto y un botón para abrir el visor, el video o el mapa en otra pestaña cuando quieras.</p>
            </div>
            ${toggle('cookie-third', !!(state && state.third), false)}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 mb-8">
          <button type="button" data-cookie="save" class="${btnMain}">Guardar preferencias</button>
          <button type="button" data-cookie="all" class="${btnLine}">Aceptar todas</button>
          <button type="button" data-cookie="necessary" class="${btnLine}">Solo necesarias</button>
        </div>

        <div class="border-t border-cream/15 pt-6">
          <h3 class="text-lg font-normal mb-3">Política de cookies y privacidad</h3>
          <div class="space-y-3 text-cream/70 text-sm font-light leading-relaxed">
            <p><span class="text-cream">Qué guardamos nosotros.</span> Tres datos en el almacenamiento local de tu navegador, hasta que los borres: <em>aq-theme</em> (tema), <em>aq-lang</em> (idioma) y <em>aq-consent</em> (tu elección sobre cookies). No usamos cookies de publicidad ni de seguimiento propias.</p>
            <p><span class="text-cream">Qué cargan terceros.</span> Solo si lo permites, el visor 3D de Jacuzzi® (Brand3D / p3d.in), el video de YouTube y el mapa de Google Maps pueden usar cookies y herramientas de analítica propias, y recibir datos técnicos como tu dirección IP y tu navegador. Su tratamiento se rige por las políticas de esas empresas.</p>
            <p><span class="text-cream">Enlaces externos.</span> Al escribirnos por WhatsApp o visitar los sitios de nuestras marcas aliadas sales de este sitio y aplican sus propias políticas.</p>
            <p><span class="text-cream">Tus datos de contacto.</span> Los formularios de este sitio no guardan tus datos: abren WhatsApp con un mensaje listo para que lo envíes tú.</p>
            <p><span class="text-cream">Cómo cambiar tu decisión.</span> Usa «Configurar cookies» en el pie de página, o borra los datos del sitio desde tu navegador. Dudas: gerencia@aquabruma.com.</p>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) { closeModal(); return; }
      const b = e.target.closest('[data-cookie]'); if (!b) return;
      if (b.dataset.cookie === 'all') decide(true);
      else if (b.dataset.cookie === 'necessary') decide(false);
      else if (b.dataset.cookie === 'save') decide(modal.querySelector('#cookie-third').checked);
    });
  }
  function openModal() {
    if (!modal) buildModal();
    lastFocus = document.activeElement;
    modal.querySelector('#cookie-third').checked = !!(state && state.third);
    modal.classList.remove('opacity-0', 'invisible');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    setTimeout(() => { const c = modal.querySelector('[data-close][aria-label]'); if (c) c.focus(); }, 50);
  }
  function closeModal() {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    modal.classList.add('opacity-0', 'invisible');
    modal.setAttribute('aria-hidden', 'true');
    // no soltar el bloqueo de scroll si hay otra ventana del sitio abierta
    const other = document.querySelector('#catalog.open, #modal.open');
    if (!other) document.documentElement.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') { e.stopImmediatePropagation(); closeModal(); }
  }, true);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-open-cookies]');
    if (a) { e.preventDefault(); openModal(); }
  });

  window.AQConsent = {
    third: () => !!(state && state.third),
    decided: () => !!state,
    grantThird: () => decide(true),
    open: openModal
  };

  function start() {
    if (state) return;
    const pre = document.getElementById('preloader');
    if (!pre || pre.classList.contains('done')) setTimeout(showBanner, 700);
    else document.addEventListener('aq:intro-done', () => setTimeout(showBanner, 1200), { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
