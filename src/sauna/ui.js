import { SaunaScene } from './scene.js';
import { computeLayout } from './layout.js';
import { WOODS, FLOORS, LAYOUTS, DOORS, DOOR_POS, HEATERS, LIGHTS, LED_COLORS, EXTRAS, SERVICES, PRESETS, DEFAULTS, normalize, T, byId } from './catalog.js';

const lang = () => (window.AQ_LANG === 'en' ? 'en' : 'es');
const tr = (es, en) => (lang() === 'en' ? en : es);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nf = (n, d = 0) => new Intl.NumberFormat(lang() === 'en' ? 'en-US' : 'es-CO', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);

const I = {
  close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  bulb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a5.5 5.5 0 0 0-3.2 10c.5.4.8 1 .8 1.6v.9h4.8v-.9c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 4z"/><path d="M9.6 19h4.8M10.6 21.5h2.8"/></svg>',
  sun: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  rotate: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/></svg>',
  cam: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  link: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  wa: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.25 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.56.13-.17.25-.64.8-.79.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.53.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>',
  arrow: '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 5h14M10 1l4 4-4 4"/></svg>',
  back: '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M15 5H1M6 1L2 5l4 4"/></svg>',
  reset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  expand: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
  shrink: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/></svg>',
  full: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  panel: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M14.5 4.5v15"/></svg>'
};
const ic = (p) => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const VIEWS = [
  { id: 'cutaway', es: 'Vista interior (corte)', en: 'Interior cutaway', ic: ic('<path d="M4 20V8l8-4 8 4v12z"/><path d="M4 8l8 4 8-4M12 12v8"/>') },
  { id: 'inside', es: 'Dentro de la sauna', en: 'Inside the sauna', ic: ic('<circle cx="12" cy="8" r="3"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>') },
  { id: 'outside', es: 'Exterior', en: 'Exterior', ic: ic('<path d="M3 11l9-6 9 6v9H3z"/><path d="M10 20v-6h4v6"/>') },
  { id: 'top', es: 'Vista superior', en: 'Top view', ic: ic('<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M3.5 12h8M11.5 12v6.5"/>') }
];
const STEPS = [
  { id: 'estilo', es: 'Estilo', en: 'Style' },
  { id: 'espacio', es: 'Espacio', en: 'Space' },
  { id: 'distribucion', es: 'Distribución', en: 'Layout' },
  { id: 'materiales', es: 'Materiales', en: 'Materials' },
  { id: 'calor', es: 'Calor y luz', en: 'Heat & light' },
  { id: 'extras', es: 'Opciones', en: 'Options' },
  { id: 'resumen', es: 'Resumen', en: 'Summary' }
];
export const RANGES = { width: { min: 1.2, max: 4, step: 0.05 }, depth: { min: 1.2, max: 4, step: 0.05 }, height: { min: 2, max: 2.6, step: 0.05 } };

export class SaunaConfigurator {
  constructor() {
    this.state = DEFAULTS(); this.step = 0; this.scene = null; this.rootEl = null; this.pending = false; this.openState = false; this.autoRotate = false; this.wide = false; this.noPanel = false; this.matTarget = 'wallWood';
    this.build();
  }

  build() {
    const r = this.rootEl = document.createElement('div');
    r.id = 'sauna-cfg'; r.className = 'cfg'; r.setAttribute('role', 'dialog'); r.setAttribute('aria-modal', 'true'); r.setAttribute('aria-label', 'Configurador de saunas'); r.setAttribute('aria-hidden', 'true');
    r.innerHTML = `
      <div class="cfg-stage" style="background:linear-gradient(180deg,#e8e4dc,#cfc9bd)">
        <div class="cfg-canvas" data-canvas></div>
        <div class="cfg-loading" data-loading><div class="cfg-drop"></div><p data-i>Preparando tu sauna…</p></div>
        <div class="cfg-top">
          <button type="button" class="cfg-btn cfg-back" data-act="close">${I.back}<span data-lbl="close">Volver</span></button>
          <p class="cfg-title"><span data-lbl="title">Diseña tu sauna</span></p>
          <div class="cfg-top-r"><button type="button" class="cfg-ico" data-act="full" data-lbl-t="full">${I.full}</button><button type="button" class="cfg-ico" data-act="theme" aria-label="Fondo claro / oscuro" title="Fondo claro / oscuro">${I.bulb}</button><button type="button" class="cfg-ico" data-act="close" aria-label="Cerrar">${I.close}</button></div>
        </div>
        <div class="cfg-tools" data-tools role="toolbar"></div>
        <p class="cfg-hint" data-hint></p>
        <div class="cfg-fallback" data-fallback hidden></div>
      </div>
      <aside class="cfg-panel">
        <nav class="cfg-steps" data-steps aria-label="Pasos"></nav>
        <div class="cfg-body" data-body></div>
        <div class="cfg-foot" data-foot></div>
      </aside>`;
    document.body.appendChild(r);
    this.q = (s) => r.querySelector(s);
    r.addEventListener('click', (e) => this.onClick(e));
    r.addEventListener('input', (e) => this.onInput(e));
    document.addEventListener('keydown', (e) => { if (this.openState && e.key === 'Escape' && !document.querySelector('#advisor-modal[aria-hidden="false"]') && !document.querySelector('#cookie-modal[aria-hidden="false"]')) { e.stopImmediatePropagation(); this.close(); } }, true);
    const fsOk = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!fsOk) r.querySelector('[data-act="full"]').hidden = true;
    const onFs = () => this.syncWide();
    document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
    document.addEventListener('aq:lang', () => { if (this.openState) this.renderAll(); });
    document.addEventListener('visibilitychange', () => { if (!this.scene) return; if (document.hidden) this.scene.stop(); else if (this.openState) this.scene.start(); });
  }

  open(opts = {}) {
    if (opts.state) this.state = normalize(opts.state);
    this.lastFocus = document.activeElement;
    this.rootEl.classList.add('open'); this.rootEl.setAttribute('aria-hidden', 'false'); this.openState = true;
    document.documentElement.classList.add('modal-open', 'cfg-open');
    this.wide = false; this.noPanel = false; this.syncWide();
    this.renderAll();
    const done = () => { this.q('[data-loading]').classList.add('off'); this.showHint(); };
    if (!this.scene) {
      setTimeout(() => {
        try {
          this.scene = new SaunaScene(this.q('[data-canvas]'));
          this.scene.onInteract = () => this.hideHint();
          this.scene.setNight(this.state.night, true);
          this.scene.onFirst = () => setTimeout(done, 250);
          this.scene.update(this.state); this.scene.start(); this.updateStats(); this.renderLabels();
          setTimeout(done, 4000);
        } catch (err) { console.error(err); this.showFallback(); }
      }, 80);
    } else { this.scene.setNight(this.state.night, true); this.scene.update(this.state); this.scene.start(); this.updateStats(); done(); }
    setTimeout(() => { const c = this.q('.cfg-ico[data-act="close"]'); if (c) c.focus(); }, 80);
  }
  close() {
    this.exitFull();
    this.openState = false; this.rootEl.classList.remove('open'); this.rootEl.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cfg-open');
    if (!document.querySelector('#catalog.open, #modal.open, #cookie-modal[aria-hidden="false"]')) document.documentElement.classList.remove('modal-open');
    if (this.scene) this.scene.stop();
    if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true });
  }
  isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  exitFull() { if (this.isFull()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } }
  syncWide() {
    const full = this.isFull(), wide = false;
    this.rootEl.classList.toggle('wide', wide); this.rootEl.classList.toggle('no-panel', wide && this.noPanel);
    const set = (k, label, icon) => { const b = this.rootEl.querySelector(`[data-lbl-t="${k}"]`); if (!b) return; b.setAttribute('aria-label', label); b.title = label; if (icon !== undefined) b.innerHTML = icon; b.classList.toggle('on', k === 'wide' ? wide : k === 'full' ? full : wide && !this.noPanel); };
    set('wide', wide ? tr('Vista normal', 'Normal view') : tr('Ampliar la vista 3D', 'Enlarge the 3D view'), wide ? I.shrink : I.expand);
    set('full', full ? tr('Salir de pantalla completa', 'Exit full screen') : tr('Pantalla completa', 'Full screen'));
    set('panel', this.noPanel ? tr('Mostrar opciones', 'Show options') : tr('Ocultar opciones', 'Hide options'));
    if (this.scene) setTimeout(() => this.scene.resize(), 380);
  }
  toggleFull() {
    if (this.isFull()) { this.exitFull(); return; }
    const el = this.rootEl, f = el.requestFullscreen || el.webkitRequestFullscreen;
    if (f) { try { const r = f.call(el); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
    this.syncWide();
  }
  showFallback() {
    const f = this.q('[data-fallback]'); this.q('[data-loading]').classList.add('off'); f.hidden = false;
    f.innerHTML = `<div><h3>${tr('Tu navegador no pudo mostrar el 3D', 'Your browser could not show the 3D view')}</h3><p>${tr('Prueba abrir la página en Chrome, Edge o Safari actualizados, o habla con un asesor y te ayudamos a diseñarla.', 'Try opening the page in an up-to-date Chrome, Edge or Safari, or talk to an advisor and we will help you design it.')}</p><button type="button" class="cfg-btn cfg-primary" data-act="advisor">${I.wa}<span>${tr('Hablar con un asesor', 'Talk to an advisor')}</span></button></div>`;
  }

  // ---------- estado ----------
  set(patch, { rebuild = true, panel = true } = {}) {
    this.state = { ...this.state, ...patch };
    if (patch.preset === undefined && !patch._keepPreset) this.state.preset = null;
    if (rebuild && this.scene) { if (!this.pending) { this.pending = true; requestAnimationFrame(() => { this.pending = false; this.scene.update(this.state); }); } }
    this.updateStats();
    if (panel) this.renderBody();
    this.saveLocal();
  }
  saveLocal() { try { sessionStorage.setItem('aq-sauna', JSON.stringify(this.state)); } catch (e) {} }
  encode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(this.state)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; } }
  link() { return `${location.origin}${location.pathname}?sauna=${this.encode()}`; }
  L() { return computeLayout(this.state); }

  onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, v = el.dataset.val, s = this.state;
    switch (a) {
      case 'close': this.close(); break;
      case 'full': this.toggleFull(); break;
      case 'theme': { const b = document.getElementById('theme-toggle'); if (b) b.click(); break; }
      case 'step': this.step = +v; this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'next': this.step = Math.min(STEPS.length - 1, this.step + 1); this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'prev': this.step = Math.max(0, this.step - 1); this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'preset': { const p = PRESETS.find((x) => x.id === v); if (p) this.set({ ...p.s, extras: [...p.s.extras], preset: p.id }); break; }
      case 'floor': case 'layout': case 'door': case 'doorPos': case 'heater': case 'lights': case 'ledColor': this.set({ [a]: v }); break;
      case 'tiers': this.set({ tiers: +v }); break;
      case 'mtarget': this.matTarget = v; this.renderBody(); break;
      case 'wood': this.set(this.woodPatch(v)); break;
      case 'xtra': { const ex = new Set(s.extras); if (ex.has(v)) ex.delete(v); else ex.add(v); this.set({ extras: [...ex] }); break; }
      case 'toggle': this.set({ [v]: !s[v] }); break;
      case 'dec': case 'inc': { const k = el.dataset.k, d = RANGES[k]; const nv = Math.min(d.max, Math.max(d.min, +(s[k] + (a === 'inc' ? d.step : -d.step)).toFixed(2))); this.set({ [k]: nv }, { panel: false }); this.syncRange(k); break; }
      case 'view': this.scene && this.scene.setView(v); this.markView(v); break;
      case 'night': this.set({ night: !s.night }, { rebuild: false, panel: false }); this.scene && this.scene.setNight(this.state.night); this.renderTools(); break;
      case 'rotate': this.autoRotate = !this.autoRotate; if (this.scene) this.scene.controls.autoRotate = this.autoRotate; this.renderTools(); break;
      case 'shot': this.capture(); break;
      case 'copy': this.copyLink(el); break;
      case 'reset': this.state = DEFAULTS(); this.matTarget = 'wallWood'; this.scene && this.scene.setNight(false, true); this.scene && (this.scene.userMoved = false); this.step = 0; this.renderAll(); this.scene && this.scene.update(this.state); this.updateStats(); break;
      case 'quote': this.quote(); break;
      case 'advisor': if (window.AQAdvisors) window.AQAdvisors.open({ text: tr('Hola, quisiera diseñar una sauna con AquaBruma.', 'Hi, I would like to design a sauna with AquaBruma.') }); break;
    }
  }
  woodPatch(id) {
    const t = this.matTarget;
    if (t === 'all') return { wallWood: id, ceilWood: id, benchWood: id };
    return { [t]: id };
  }
  onInput(e) {
    const el = e.target.closest('input[type=range][data-k]'); if (!el) return;
    const k = el.dataset.k; this.set({ [k]: +el.value }, { panel: false }); this.syncRange(k, true);
  }
  syncRange(k, fromInput) {
    const d = RANGES[k], v = this.state[k];
    const out = this.rootEl.querySelector(`[data-out="${k}"]`); if (out) out.textContent = `${nf(v, 2)} m`;
    const inp = this.rootEl.querySelector(`input[data-k="${k}"]`); if (inp) { if (!fromInput) inp.value = v; inp.style.setProperty('--p', `${((v - d.min) / (d.max - d.min)) * 100}%`); }
  }

  // ---------- render ----------
  renderAll() { this.renderLabels(); this.renderSteps(); this.renderBody(); this.renderTools(); this.updateStats(); }
  renderLabels() {
    this.rootEl.setAttribute('aria-label', tr('Configurador de saunas', 'Sauna configurator'));
    const cv = this.rootEl.querySelector('canvas'); if (cv) cv.setAttribute('aria-label', tr('Vista 3D de la sauna. Arrastra para girar, usa la rueda para acercar.', '3D view of the sauna. Drag to rotate, use the wheel to zoom.'));
    const sn = this.q('[data-steps]'); if (sn) sn.setAttribute('aria-label', tr('Pasos', 'Steps'));
    this.rootEl.querySelectorAll('.cfg-ico[data-act="close"]').forEach((b) => b.setAttribute('aria-label', tr('Cerrar', 'Close')));
    const th = this.rootEl.querySelector('.cfg-ico[data-act="theme"]'); if (th) { th.setAttribute('aria-label', tr('Fondo claro / oscuro', 'Light / dark background')); th.title = th.getAttribute('aria-label'); }
    const hn = this.q('[data-hint]'); if (hn && hn.classList.contains('on')) hn.textContent = tr('Arrastra para girar · rueda o pellizco para acercar', 'Drag to rotate · wheel or pinch to zoom');
    this.syncWide(); this.q('[data-lbl="close"]').textContent = tr('Volver', 'Back'); this.q('[data-lbl="title"]').textContent = tr('Diseña tu sauna', 'Design your sauna');
    const l = this.q('[data-loading] [data-i]'); if (l) l.textContent = tr('Preparando tu sauna…', 'Preparing your sauna…');
  }
  renderSteps() {
    this.q('[data-steps]').innerHTML = STEPS.map((s, i) => `<button type="button" class="cfg-step${i === this.step ? ' on' : ''}${i < this.step ? ' done' : ''}" data-act="step" data-val="${i}" title="${esc(T(s))}" aria-label="${i + 1}. ${esc(T(s))}" ${i === this.step ? 'aria-current="step"' : ''}><b>${i + 1}</b><span>${esc(T(s))}</span></button>`).join('');
    const on = this.q('.cfg-step.on'), n = this.q('[data-steps]'); if (on && n) { const a = on.getBoundingClientRect(), b = n.getBoundingClientRect(); n.scrollLeft = Math.max(0, n.scrollLeft + (a.left - b.left) - n.clientWidth / 2 + a.width / 2); }
  }
  renderTools() {
    const s = this.state, cur = this.scene ? this.scene.view : 'cutaway';
    this.q('[data-tools]').innerHTML = `
      <div class="cfg-group">${VIEWS.map((v) => `<button type="button" class="cfg-tool${cur === v.id ? ' on' : ''}" data-act="view" data-val="${v.id}" data-v="${v.id}" aria-label="${esc(T(v))}" title="${esc(T(v))}">${v.ic}</button>`).join('')}</div>
      <div class="cfg-group">
        <button type="button" class="cfg-tool${s.night ? ' on' : ''}" data-act="night" aria-pressed="${s.night}" aria-label="${tr('Luz de la habitación', 'Room light')}" title="${tr('Luz de la habitación: día / noche', 'Room light: day / night')}">${s.night ? I.moon : I.sun}</button>
        <button type="button" class="cfg-tool${this.autoRotate ? ' on' : ''}" data-act="rotate" aria-pressed="${this.autoRotate}" aria-label="${tr('Girar solo', 'Auto-rotate')}" title="${tr('Girar solo', 'Auto-rotate')}">${I.rotate}</button>
        <button type="button" class="cfg-tool" data-act="shot" aria-label="${tr('Descargar imagen', 'Download image')}" title="${tr('Descargar imagen', 'Download image')}">${I.cam}</button>
      </div>`;
  }
  markView(id) { this.rootEl.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === id)); }
  updateStats() {
    if (!this.q('[data-stats]')) return;
    const L = this.L(), s = this.state;
    this.q('[data-stats]').innerHTML = `<div><b>${nf(s.width, 2)} × ${nf(s.depth, 2)}</b><span>m ${tr('exterior', 'outside')}</span></div><div><b>${L.people}</b><span>${tr('personas', 'people')}</span></div><div><b>${nf(L.kw, 1)}</b><span>kW ${tr('sugeridos', 'suggested')}</span></div>`;
  }
  showHint() { const h = this.q('[data-hint]'); h.textContent = tr('Arrastra para girar · rueda o pellizco para acercar', 'Drag to rotate · wheel or pinch to zoom'); h.classList.add('on'); clearTimeout(this.hintT); this.hintT = setTimeout(() => this.hideHint(), 6500); }
  hideHint() { this.q('[data-hint]').classList.remove('on'); }

  sw(act, items, selected, cls = '') {
    return `<div class="cfg-sws ${cls}">${items.map((i) => `<button type="button" class="cfg-sw${selected === i.id ? ' on' : ''}" data-act="${act}" data-val="${i.id}" aria-pressed="${selected === i.id}" aria-label="${esc(T(i))}" title="${esc(T(i))}"><i class="p-${i.pattern || ''}" style="background-color:${i.c}"></i><span>${esc(T(i))}</span></button>`).join('')}</div>`;
  }
  seg(act, items, selected, disabled) {
    return `<div class="cfg-seg cfg-seg-wrap">${items.map((x) => `<button type="button" class="${String(selected) === String(x.id) ? 'on' : ''}" data-act="${act}" data-val="${x.id}" aria-pressed="${String(selected) === String(x.id)}" ${disabled ? 'disabled' : ''}>${esc(T(x))}</button>`).join('')}</div>`;
  }
  range(k, label) {
    const d = RANGES[k], v = this.state[k], p = ((v - d.min) / (d.max - d.min)) * 100;
    return `<div class="cfg-row"><div class="cfg-rl"><label for="r-${k}">${esc(label)}</label><output data-out="${k}">${nf(v, 2)} m</output></div>
      <div class="cfg-rr"><button type="button" class="cfg-pm" data-act="dec" data-k="${k}" aria-label="${tr('Menos', 'Less')}">−</button><input id="r-${k}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-k="${k}" style="--p:${p}%"><button type="button" class="cfg-pm" data-act="inc" data-k="${k}" aria-label="${tr('Más', 'More')}">+</button></div></div>`;
  }
  switchRow(key, label, hint, on, disabled) {
    return `<button type="button" class="cfg-switch${on ? ' on' : ''}" data-act="toggle" data-val="${key}" role="switch" aria-checked="${on}" ${disabled ? 'disabled' : ''}><span><b>${esc(label)}</b><em>${esc(hint)}</em></span><i></i></button>`;
  }

  renderBody() {
    const s = this.state, id = STEPS[this.step].id; let h = '';
    const head = (t, d) => `<h2 class="cfg-h">${esc(t)}</h2><p class="cfg-d">${esc(d)}</p>`;
    const sub = (t) => `<h3 class="cfg-s">${esc(t)}</h3>`;
    if (id === 'estilo') {
      h = head(tr('Elige un estilo para empezar', 'Pick a style to start'), tr('Cada uno arma una sauna completa. Después ajustas todo a tu gusto.', 'Each one builds a complete sauna. Then fine-tune everything.')) +
        `<div class="cfg-presets">${PRESETS.map((p) => `<button type="button" class="cfg-preset${s.preset === p.id ? ' on' : ''}" data-act="preset" data-val="${p.id}" aria-pressed="${s.preset === p.id}"><span class="dots">${p.sw.map((c) => `<i style="background:${c}"></i>`).join('')}</span><b>${esc(T(p))}</b><em>${esc(T(p.d))}</em></button>`).join('')}</div>`;
    } else if (id === 'espacio') {
      h = head(tr('Dimensiones de la sauna', 'Sauna dimensions'), tr('Son las medidas exteriores de la cabina. Mide el espacio donde irá.', 'These are the cabin’s outside measurements. Measure the spot where it will go.')) +
        this.range('width', tr('Ancho', 'Width')) + this.range('depth', tr('Fondo', 'Depth')) + this.range('height', tr('Alto', 'Height')) +
        sub(tr('Piso', 'Floor')) + this.seg('floor', FLOORS, s.floor) + `<p class="cfg-note">${esc(T(byId(FLOORS, s.floor).note))}</p>` +
        `<p class="cfg-note">${tr('Medidas interiores', 'Inside size')}: ${nf(this.L().iw, 2)} × ${nf(this.L().id, 2)} × ${nf(this.L().ih, 2)} m</p>`;
    } else if (id === 'distribucion') {
      h = head(tr('Bancas y puerta', 'Benches and door'), tr('Elige cómo se sientan las personas y por dónde se entra.', 'Choose how people sit and where they come in.')) +
        sub(tr('Distribución de las bancas', 'Bench layout')) + this.seg('layout', LAYOUTS, s.layout) +
        sub(tr('Niveles', 'Levels')) + this.seg('tiers', [{ id: 1, es: 'Un nivel', en: 'One level' }, { id: 2, es: 'Dos niveles', en: 'Two levels' }], s.tiers) +
        sub(tr('Puerta y vidrio', 'Door and glass')) + this.seg('door', DOORS, s.door) +
        sub(tr('Posición de la puerta', 'Door position')) + this.seg('doorPos', DOOR_POS, s.doorPos) +
        `<p class="cfg-note">${tr('Capacidad estimada', 'Estimated capacity')}: ${this.L().people} ${tr('personas', 'people')}</p>`;
    } else if (id === 'materiales') {
      const parts = [{ id: 'all', es: 'Interior', en: 'Interior' }, { id: 'wallWood', es: 'Paredes', en: 'Walls' }, { id: 'ceilWood', es: 'Techo', en: 'Ceiling' }, { id: 'benchWood', es: 'Bancas', en: 'Benches' }, { id: 'extWood', es: 'Exterior', en: 'Exterior' }];
      const cur = this.matTarget === 'all' ? s.wallWood : s[this.matTarget];
      const list = WOODS.filter((w) => !w.ext || this.matTarget === 'extWood').map((w) => ({ ...w, pattern: 'wood' }));
      h = head(tr('Maderas', 'Woods'), tr('Elige a qué parte se aplica y prueba cada madera. El interior y el exterior pueden ser distintos.', 'Pick which part it applies to and try each wood. Inside and outside can differ.')) +
        sub(tr('Aplicar a', 'Apply to')) + this.seg('mtarget', parts, this.matTarget) +
        this.sw('wood', list, cur) + `<p class="cfg-note">${esc(T(byId(WOODS, cur).note))}</p>` +
        `<div class="cfg-sum" style="margin-top:14px">${[['wallWood', tr('Paredes', 'Walls')], ['ceilWood', tr('Techo', 'Ceiling')], ['benchWood', tr('Bancas', 'Benches')], ['extWood', tr('Exterior', 'Exterior')]].map(([k, l]) => `<div class="cfg-sum-r"><span>${esc(l)}</span><b>${esc(T(byId(WOODS, s[k])))}</b></div>`).join('')}</div>`;
    } else if (id === 'calor') {
      h = head(tr('Calefacción e iluminación', 'Heating and lighting'), tr('La estufa se coloca en la esquina delantera, lejos de la puerta. Un asesor confirma las distancias de seguridad.', 'The heater goes in the front corner away from the door. An advisor confirms safety distances.')) +
        sub(tr('Estufa', 'Heater')) + `<div class="cfg-opts">${HEATERS.map((x) => `<button type="button" class="cfg-opt${s.heater === x.id ? ' on' : ''}" data-act="heater" data-val="${x.id}" aria-pressed="${s.heater === x.id}"><b>${esc(T(x))}</b><em>${esc(T(x.kind))}</em></button>`).join('')}</div>` +
        this.switchRow('infrared', tr('Paneles infrarrojos', 'Infrared panels'), tr('Calor suave sobre el muro del fondo.', 'Gentle heat on the back wall.'), s.infrared) +
        sub(tr('Iluminación', 'Lighting')) + this.seg('lights', LIGHTS, s.lights) +
        (['led', 'both'].includes(s.lights) ? sub(tr('Color del LED', 'LED color')) + this.sw('ledColor', LED_COLORS, s.ledColor, 'cfg-sws-sm') : '') +
        `<p class="cfg-note">${tr('Potencia sugerida de la estufa', 'Suggested heater power')}: ≈ ${nf(this.L().kw, 1)} kW (${tr('referencia', 'reference')}).</p>` +
        this.switchRow('night', tr('Apagar la luz de la habitación', 'Dim the room light'), tr('Así se aprecia mejor la iluminación de la sauna.', 'The sauna lighting looks best this way.'), s.night);
    } else if (id === 'extras') {
      h = head(tr('Opciones', 'Options'), tr('Accesorios y servicios opcionales. Los precios los confirma un asesor.', 'Optional accessories and services. An advisor confirms prices.')) +
        sub(tr('Accesorios', 'Accessories')) + EXTRAS.map((x) => this.switchRowX(x, s.extras.includes(x.id))).join('') +
        sub(tr('Servicios', 'Services')) + SERVICES.map((x) => this.switchRow(x.id, T(x), T(x.d), s[x.id])).join('');
    } else {
      const L = this.L(), row = (k, v) => `<div class="cfg-sum-r"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
      const extras = s.extras.length ? s.extras.map((x) => T(byId(EXTRAS, x))).join(', ') : tr('Ninguno', 'None');
      const services = SERVICES.filter((x) => s[x.id]).map((x) => T(x)).join(', ') || tr('Ninguno', 'None');
      h = head(tr('Tu diseño', 'Your design'), tr('Esto es lo que armaste. Un asesor lo revisa contigo y te cotiza.', 'This is what you built. An advisor reviews it with you and quotes it.')) +
        `<div class="cfg-sum">${row(tr('Medidas exteriores', 'Outside size'), `${nf(s.width, 2)} × ${nf(s.depth, 2)} × ${nf(s.height, 2)} m`)}${row(tr('Medidas interiores', 'Inside size'), `${nf(L.iw, 2)} × ${nf(L.id, 2)} × ${nf(L.ih, 2)} m`)}${row(tr('Capacidad', 'Capacity'), `≈ ${L.people} ${tr('personas', 'people')}`)}${row(tr('Piso', 'Floor'), T(byId(FLOORS, s.floor)))}${row(tr('Bancas', 'Benches'), `${T(byId(LAYOUTS, s.layout))}${s.layout === 'none' ? '' : ` · ${s.tiers === 2 ? tr('2 niveles', '2 levels') : tr('1 nivel', '1 level')}`}`)}${row(tr('Puerta', 'Door'), `${T(byId(DOORS, s.door))} · ${T(byId(DOOR_POS, s.doorPos))}`)}${row(tr('Paredes', 'Walls'), T(byId(WOODS, s.wallWood)))}${row(tr('Techo', 'Ceiling'), T(byId(WOODS, s.ceilWood)))}${row(tr('Bancas (madera)', 'Benches (wood)'), T(byId(WOODS, s.benchWood)))}${row(tr('Exterior', 'Exterior'), T(byId(WOODS, s.extWood)))}${row(tr('Estufa', 'Heater'), T(byId(HEATERS, s.heater)))}${row(tr('Infrarrojos', 'Infrared'), s.infrared ? tr('Sí', 'Yes') : tr('No', 'No'))}${row(tr('Iluminación', 'Lighting'), `${T(byId(LIGHTS, s.lights))}${['led', 'both'].includes(s.lights) ? ' · ' + T(byId(LED_COLORS, s.ledColor)) : ''}`)}${row(tr('Potencia sugerida', 'Suggested power'), `≈ ${nf(L.kw, 1)} kW`)}${row(tr('Accesorios', 'Accessories'), extras)}${row(tr('Servicios', 'Services'), services)}</div>` +
        `<p class="cfg-note">${tr('Diseño preliminar de referencia, sin precios. Un asesor de AquaBruma confirma los detalles de construcción, las distancias de seguridad de la estufa y las condiciones de entrega e instalación.', 'Preliminary reference design, no prices. An AquaBruma advisor confirms construction details, heater safety distances and delivery and installation terms.')}</p>` +
        `<div class="cfg-actions"><button type="button" class="cfg-btn cfg-primary" data-act="quote">${I.wa}<span>${tr('Pedir cotización de esta sauna', 'Request a quote for this sauna')}</span></button>
          <div class="cfg-two"><button type="button" class="cfg-btn" data-act="shot">${I.cam}<span>${tr('Descargar imagen', 'Download image')}</span></button><button type="button" class="cfg-btn" data-act="copy">${I.link}<span>${tr('Copiar enlace', 'Copy link')}</span></button></div>
          <button type="button" class="cfg-btn cfg-ghost" data-act="reset">${I.reset}<span>${tr('Empezar de nuevo', 'Start over')}</span></button></div>`;
    }
    this.q('[data-body]').innerHTML = h;
    ['width', 'depth', 'height'].forEach((k) => { if (this.rootEl.querySelector(`input[data-k="${k}"]`)) this.syncRange(k, true); });
    const last = this.step === STEPS.length - 1;
    this.q('[data-foot]').innerHTML = `<button type="button" class="cfg-btn cfg-ghost" data-act="prev" ${this.step === 0 ? 'disabled' : ''}>${I.back}<span>${tr('Atrás', 'Back')}</span></button>
      ${last ? `<button type="button" class="cfg-btn cfg-primary" data-act="quote">${I.wa}<span>${tr('Cotizar', 'Get a quote')}</span></button>` : `<button type="button" class="cfg-btn cfg-primary" data-act="next"><span>${tr('Siguiente', 'Next')}</span>${I.arrow}</button>`}`;
  }
  switchRowX(x, on) { return `<button type="button" class="cfg-switch${on ? ' on' : ''}" data-act="xtra" data-val="${x.id}" role="switch" aria-checked="${on}"><span><b>${esc(T(x))}</b></span><i></i></button>`; }

  // ---------- salidas ----------
  describe() {
    const s = this.state, L = this.L(), en = lang() === 'en';
    const extras = s.extras.map((x) => T(byId(EXTRAS, x)).toLowerCase()).join(', ');
    const services = SERVICES.filter((x) => s[x.id]).map((x) => T(x).toLowerCase()).join(', ');
    if (en) return `${nf(s.width, 2)} × ${nf(s.depth, 2)} × ${nf(s.height, 2)} m outside (≈ ${L.people} people), benches: ${T(byId(LAYOUTS, s.layout)).toLowerCase()}, ${T(byId(DOORS, s.door)).toLowerCase()} (${T(byId(DOOR_POS, s.doorPos)).toLowerCase()}), walls ${T(byId(WOODS, s.wallWood)).toLowerCase()}, exterior ${T(byId(WOODS, s.extWood)).toLowerCase()}, heater: ${T(byId(HEATERS, s.heater)).toLowerCase()}${s.infrared ? ' + infrared' : ''} (≈ ${nf(L.kw, 1)} kW), lighting: ${T(byId(LIGHTS, s.lights)).toLowerCase()}${extras ? `, extras: ${extras}` : ''}${services ? `, services: ${services}` : ''}`;
    return `${nf(s.width, 2)} × ${nf(s.depth, 2)} × ${nf(s.height, 2)} m exterior (≈ ${L.people} personas), bancas: ${T(byId(LAYOUTS, s.layout)).toLowerCase()}, ${T(byId(DOORS, s.door)).toLowerCase()} (${T(byId(DOOR_POS, s.doorPos)).toLowerCase()}), paredes en ${T(byId(WOODS, s.wallWood)).toLowerCase()}, exterior en ${T(byId(WOODS, s.extWood)).toLowerCase()}, estufa: ${T(byId(HEATERS, s.heater)).toLowerCase()}${s.infrared ? ' + infrarrojos' : ''} (≈ ${nf(L.kw, 1)} kW), iluminación: ${T(byId(LIGHTS, s.lights)).toLowerCase()}${extras ? `, accesorios: ${extras}` : ''}${services ? `, servicios: ${services}` : ''}`;
  }
  quote() {
    const text = lang() === 'en'
      ? `Hi, I designed a sauna in the AquaBruma configurator: ${this.describe()}. My design: ${this.link()} . Could you advise me and give me a quote?`
      : `Hola, diseñé una sauna en el configurador de AquaBruma: ${this.describe()}. Mi diseño: ${this.link()} . ¿Me pueden asesorar y cotizar?`;
    if (window.AQAdvisors) window.AQAdvisors.open({ text });
  }
  copyLink(btn) {
    const url = this.link(), done = () => { const sp = btn.querySelector('span'); if (sp) { const o = sp.textContent; sp.textContent = tr('¡Enlace copiado!', 'Link copied!'); setTimeout(() => { sp.textContent = o; }, 1800); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => { prompt(tr('Copia este enlace:', 'Copy this link:'), url); });
    else prompt(tr('Copia este enlace:', 'Copy this link:'), url);
  }
  capture() {
    if (!this.scene) return;
    const src = this.scene.snapshot(), w = src.width, h = src.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(src, 0, 0);
    const bar = Math.round(h * 0.11); const gr = g.createLinearGradient(0, h - bar * 1.6, 0, h); gr.addColorStop(0, 'rgba(6,20,33,0)'); gr.addColorStop(1, 'rgba(6,20,33,0.82)'); g.fillStyle = gr; g.fillRect(0, h - bar * 1.6, w, bar * 1.6);
    const fs = Math.max(14, Math.round(h * 0.03)); g.fillStyle = '#fff'; g.font = `300 ${fs * 1.3}px Figtree, sans-serif`; g.textBaseline = 'alphabetic'; g.fillText('aquabruma', fs, h - bar * 0.62);
    g.font = `400 ${fs * 0.72}px Figtree, sans-serif`; g.fillStyle = 'rgba(255,255,255,0.85)';
    const L = this.L(); g.fillText(`${nf(this.state.width, 2)} × ${nf(this.state.depth, 2)} × ${nf(this.state.height, 2)} m · ≈ ${L.people} ${tr('personas', 'people')}  —  ${tr('Diseñada en el configurador de AquaBruma', 'Designed with the AquaBruma configurator')}`, fs, h - bar * 0.22);
    c.toBlob((blob) => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mi-sauna-aquabruma.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }, 'image/png');
  }
}
