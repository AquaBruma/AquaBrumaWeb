import { PoolScene } from './scene.js';
import { outline, polyArea, polyPerimeter } from './geometry.js';
import { SHAPES, FINISH_TYPES, COPINGS, DECKS, WATERS, LIGHTS, STAIRS, PRESETS, DEFAULTS, T, byId, findFinish } from './catalog.js';

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
  reset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
};
const SHAPE_ICON = {
  rect: '<svg viewBox="0 0 44 28"><rect x="4" y="5" width="36" height="18" rx="1.5"/></svg>',
  rounded: '<svg viewBox="0 0 44 28"><rect x="4" y="5" width="36" height="18" rx="7"/></svg>',
  L: '<svg viewBox="0 0 44 28"><path d="M4 5h36v10H27v8H4z"/></svg>',
  organic: '<svg viewBox="0 0 44 28"><path d="M5 12C6 5 14 4 20 7s11-4 17 0 4 10-1 14-9 0-14 1-16 3-17-4z"/></svg>'
};
const VIEWS = [
  { id: 'aerial', es: 'Vista aérea', en: 'Aerial view', ic: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/></svg>' },
  { id: 'front', es: 'Vista frontal', en: 'Front view', ic: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 17h18M5 17V9l7-4 7 4v8"/></svg>' },
  { id: 'top', es: 'Planta', en: 'Top view', ic: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><rect x="7" y="9" width="10" height="6" rx="1"/></svg>' },
  { id: 'water', es: 'A ras del agua', en: 'Water level', ic: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 13c2 0 2-2 4.5-2S10 13 12 13s2.5-2 4.5-2S19 13 21 13"/><path d="M3 18c2 0 2-2 4.5-2S10 18 12 18s2.5-2 4.5-2S19 18 21 18"/><circle cx="12" cy="6" r="2"/></svg>' },
  { id: 'house', es: 'Desde la terraza', en: 'From the terrace', ic: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 11l8-6 8 6v8H4z"/><path d="M10 19v-5h4v5"/></svg>' }
];
const STEPS = [
  { id: 'estilo', es: 'Estilo', en: 'Style' },
  { id: 'forma', es: 'Forma', en: 'Shape' },
  { id: 'acabado', es: 'Revestimiento', en: 'Finish' },
  { id: 'entorno', es: 'Borde y terraza', en: 'Coping & deck' },
  { id: 'agua', es: 'Agua y luz', en: 'Water & light' },
  { id: 'extras', es: 'Extras', en: 'Extras' },
  { id: 'resumen', es: 'Resumen', en: 'Summary' }
];

export class Configurator {
  constructor() {
    this.state = DEFAULTS(); this.step = 0; this.scene = null; this.rootEl = null; this.pending = false; this.openState = false; this.autoRotate = false;
    this.build();
  }

  // ---------- estructura ----------
  build() {
    const r = this.rootEl = document.createElement('div');
    r.id = 'cfg'; r.className = 'cfg'; r.setAttribute('role', 'dialog'); r.setAttribute('aria-modal', 'true'); r.setAttribute('aria-label', 'Configurador de piscinas'); r.setAttribute('aria-hidden', 'true');
    r.innerHTML = `
      <div class="cfg-stage">
        <div class="cfg-canvas" data-canvas></div>
        <div class="cfg-loading" data-loading><div class="cfg-drop"></div><p data-i>Preparando tu piscina…</p></div>
        <div class="cfg-top">
          <button type="button" class="cfg-btn cfg-back" data-act="close">${I.back}<span data-lbl="close">Volver</span></button>
          <p class="cfg-title"><span data-lbl="title">Diseña tu piscina</span></p>
          <div class="cfg-top-r"><button type="button" class="cfg-ico" data-act="theme" aria-label="Fondo claro / oscuro" title="Fondo claro / oscuro">${I.bulb}</button><button type="button" class="cfg-ico" data-act="close" aria-label="Cerrar">${I.close}</button></div>
        </div>
        <div class="cfg-tools" data-tools role="toolbar"></div>
        <div class="cfg-stats" data-stats aria-live="polite"></div>
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
    document.addEventListener('aq:lang', () => { if (this.openState) this.renderAll(); });
    document.addEventListener('visibilitychange', () => { if (!this.scene) return; if (document.hidden) this.scene.stop(); else if (this.openState) this.scene.start(); });
  }

  // ---------- abrir / cerrar ----------
  open(opts = {}) {
    if (opts.state) this.state = { ...DEFAULTS(), ...opts.state, finish: [...(opts.state.finish || DEFAULTS().finish)] };
    this.lastFocus = document.activeElement;
    this.rootEl.classList.add('open'); this.rootEl.setAttribute('aria-hidden', 'false'); this.openState = true;
    document.documentElement.classList.add('modal-open', 'cfg-open');
    this.renderAll();
    const done = () => { this.q('[data-loading]').classList.add('off'); this.showHint(); };
    if (!this.scene) {
      setTimeout(() => {
        try {
          this.scene = new PoolScene(this.q('[data-canvas]'));
          this.scene.onInteract = () => this.hideHint();
          this.scene.setNight(this.state.night, true);
          this.scene.onFirst = () => setTimeout(done, 250);
          this.scene.update(this.state); this.scene.start(); this.updateStats();
          setTimeout(done, 4000);
        } catch (err) { console.error(err); this.showFallback(); }
      }, 80);
    } else { this.scene.setNight(this.state.night, true); this.scene.update(this.state); this.scene.start(); this.updateStats(); done(); }
    setTimeout(() => { const c = this.q('.cfg-ico[data-act="close"]'); if (c) c.focus(); }, 80);
  }
  close() {
    this.openState = false; this.rootEl.classList.remove('open'); this.rootEl.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cfg-open');
    if (!document.querySelector('#catalog.open, #modal.open, #cookie-modal[aria-hidden="false"]')) document.documentElement.classList.remove('modal-open');
    if (this.scene) this.scene.stop();
    if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true });
  }
  showFallback() {
    const f = this.q('[data-fallback]'); this.q('[data-loading]').classList.add('off');
    f.hidden = false;
    f.innerHTML = `<div><h3>${tr('Tu navegador no pudo mostrar el 3D', 'Your browser could not show the 3D view')}</h3><p>${tr('Prueba abrir la página en Chrome, Edge o Safari actualizados, o habla con un asesor y te ayudamos a diseñarla.', 'Try opening the page in an up-to-date Chrome, Edge or Safari, or talk to an advisor and we will help you design it.')}</p><button type="button" class="cfg-btn cfg-primary" data-act="advisor">${I.wa}<span>${tr('Hablar con un asesor', 'Talk to an advisor')}</span></button></div>`;
  }

  // ---------- estado ----------
  set(patch, { rebuild = true, panel = true } = {}) {
    this.state = { ...this.state, ...patch };
    if (patch.preset === undefined && !patch._keepPreset) this.state.preset = null;
    if (this.state.stairs !== 'none' && !(this.state.shape === 'rect' || this.state.shape === 'L')) this.state.stairs = 'none';
    if (rebuild && this.scene) { if (!this.pending) { this.pending = true; requestAnimationFrame(() => { this.pending = false; this.scene.update(this.state); }); } }
    this.updateStats();
    if (panel) this.renderBody();
    this.saveLocal();
  }
  metrics() {
    const s = this.state, pts = outline(s.shape, s.length, s.width), area = polyArea(pts), per = polyPerimeter(pts);
    return { area, per, vol: area * s.depth * 0.93, surface: area + per * s.depth };
  }
  saveLocal() { try { sessionStorage.setItem('aq-cfg', JSON.stringify(this.state)); } catch (e) {} }
  encode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(this.state)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; } }
  link() { return `${location.origin}${location.pathname}?diseno=${this.encode()}`; }

  // ---------- eventos ----------
  onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, v = el.dataset.val, s = this.state;
    switch (a) {
      case 'close': this.close(); break;
      case 'theme': { const b = document.getElementById('theme-toggle'); if (b) b.click(); break; }
      case 'step': this.step = +v; this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'next': this.step = Math.min(STEPS.length - 1, this.step + 1); this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'prev': this.step = Math.max(0, this.step - 1); this.renderAll(); this.q('[data-body]').scrollTop = 0; break;
      case 'preset': { const p = PRESETS.find((x) => x.id === v); if (p) { this.set({ ...p.s, finish: [...p.s.finish], preset: p.id }, { panel: true }); } break; }
      case 'shape': this.set({ shape: v }); break;
      case 'ftype': { const t = FINISH_TYPES.find((x) => x.id === v); this.set({ finish: [t.id, t.colors[0].id] }); break; }
      case 'fcolor': this.set({ finish: [s.finish[0], v] }); break;
      case 'coping': this.set({ coping: v }); break;
      case 'deck': this.set({ deck: v }); break;
      case 'water': this.set({ water: v }); break;
      case 'lights': this.set({ lights: v }); break;
      case 'stairs': this.set({ stairs: v }); break;
      case 'toggle': this.set({ [v]: !s[v] }); break;
      case 'dec': case 'inc': { const k = el.dataset.k, def = RANGES[k]; const nv = Math.min(def.max, Math.max(def.min, +(s[k] + (a === 'inc' ? def.step : -def.step)).toFixed(2))); this.set({ [k]: nv }, { panel: false }); this.syncRange(k); break; }
      case 'view': this.scene && this.scene.setView(v); this.markView(v); break;
      case 'night': this.set({ night: !s.night }, { rebuild: false, panel: false }); this.scene && this.scene.setNight(this.state.night); this.renderTools(); break;
      case 'rotate': this.autoRotate = !this.autoRotate; if (this.scene) this.scene.controls.autoRotate = this.autoRotate; this.renderTools(); break;
      case 'shot': this.capture(); break;
      case 'copy': this.copyLink(el); break;
      case 'reset': this.state = DEFAULTS(); this.scene && this.scene.setNight(false, true); this.scene && (this.scene.userMoved = false); this.step = 0; this.renderAll(); this.scene && this.scene.update(this.state); this.updateStats(); break;
      case 'quote': this.quote(); break;
      case 'advisor': if (window.AQAdvisors) window.AQAdvisors.open({ text: tr('Hola, quisiera diseñar una piscina con AquaBruma.', 'Hi, I would like to design a pool with AquaBruma.') }); break;
    }
  }
  onInput(e) {
    const el = e.target.closest('input[type=range][data-k]'); if (!el) return;
    const k = el.dataset.k; this.set({ [k]: +el.value }, { panel: false }); this.syncRange(k, true);
  }
  syncRange(k, fromInput) {
    const out = this.rootEl.querySelector(`[data-out="${k}"]`); if (out) out.textContent = `${nf(this.state[k], 1)} m`;
    const inp = this.rootEl.querySelector(`input[data-k="${k}"]`); if (inp && !fromInput) inp.value = this.state[k];
    if (inp) inp.style.setProperty('--p', `${((this.state[k] - RANGES[k].min) / (RANGES[k].max - RANGES[k].min)) * 100}%`);
  }

  // ---------- render ----------
  renderAll() { this.renderLabels(); this.renderSteps(); this.renderBody(); this.renderTools(); this.updateStats(); }
  renderLabels() {
    this.q('[data-lbl="close"]').textContent = tr('Volver', 'Back'); this.q('[data-lbl="title"]').textContent = tr('Diseña tu piscina', 'Design your pool');
    const l = this.q('[data-loading] [data-i]'); if (l) l.textContent = tr('Preparando tu piscina…', 'Preparing your pool…');
  }
  renderSteps() {
    this.q('[data-steps]').innerHTML = STEPS.map((s, i) => `<button type="button" class="cfg-step${i === this.step ? ' on' : ''}${i < this.step ? ' done' : ''}" data-act="step" data-val="${i}" title="${esc(T(s))}" aria-label="${i + 1}. ${esc(T(s))}" ${i === this.step ? 'aria-current="step"' : ''}><b>${i + 1}</b><span>${esc(T(s))}</span></button>`).join('');
    const on = this.q('.cfg-step.on'), n = this.q('[data-steps]'); if (on && n) { const a = on.getBoundingClientRect(), b = n.getBoundingClientRect(); n.scrollLeft = Math.max(0, n.scrollLeft + (a.left - b.left) - n.clientWidth / 2 + a.width / 2); }
  }
  renderTools() {
    const s = this.state, cur = this.scene ? this.scene.currentView : 'aerial';
    this.q('[data-tools]').innerHTML = `
      <div class="cfg-group">${VIEWS.map((v) => `<button type="button" class="cfg-tool${cur === v.id ? ' on' : ''}" data-act="view" data-val="${v.id}" data-v="${v.id}" aria-label="${esc(T(v))}" title="${esc(T(v))}">${v.ic}</button>`).join('')}</div>
      <div class="cfg-group">
        <button type="button" class="cfg-tool${s.night ? ' on' : ''}" data-act="night" aria-pressed="${s.night}" aria-label="${tr('Día / noche', 'Day / night')}" title="${tr('Día / noche', 'Day / night')}">${s.night ? I.moon : I.sun}</button>
        <button type="button" class="cfg-tool${this.autoRotate ? ' on' : ''}" data-act="rotate" aria-pressed="${this.autoRotate}" aria-label="${tr('Girar solo', 'Auto-rotate')}" title="${tr('Girar solo', 'Auto-rotate')}">${I.rotate}</button>
        <button type="button" class="cfg-tool" data-act="shot" aria-label="${tr('Descargar imagen', 'Download image')}" title="${tr('Descargar imagen', 'Download image')}">${I.cam}</button>
      </div>`;
  }
  markView(id) { this.rootEl.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === id)); }
  updateStats() {
    const m = this.metrics(), s = this.state;
    this.q('[data-stats]').innerHTML = `<div><b>${nf(m.area, 1)}</b><span>m²</span></div><div><b>${nf(m.vol * 1000, 0)}</b><span>${tr('litros', 'liters')}</span></div><div><b>${nf(s.depth, 1)}</b><span>${tr('m prof.', 'm deep')}</span></div>`;
  }
  showHint() { const h = this.q('[data-hint]'); h.textContent = tr('Arrastra para girar · rueda o pellizco para acercar', 'Drag to rotate · wheel or pinch to zoom'); h.classList.add('on'); clearTimeout(this.hintT); this.hintT = setTimeout(() => this.hideHint(), 6500); }
  hideHint() { this.q('[data-hint]').classList.remove('on'); }

  sw(act, items, selected, cls = '') {
    return `<div class="cfg-sws ${cls}">${items.map((i) => {
      const bg = i.c ? (String(i.c).startsWith('conic') ? i.c : i.c) : 'transparent';
      return `<button type="button" class="cfg-sw${selected === i.id ? ' on' : ''}${i.c ? '' : ' none'}" data-act="${act}" data-val="${i.id}" aria-pressed="${selected === i.id}" aria-label="${esc(T(i))}" title="${esc(T(i))}"><i class="p-${i.pattern || ''}" style="background-color:${i.c && !String(i.c).startsWith('conic') ? i.c : 'transparent'};${String(i.c || '').startsWith('conic') ? `background:${i.c}` : ''}"></i><span>${esc(T(i))}</span></button>`;
    }).join('')}</div>`;
  }
  range(k, label) {
    const d = RANGES[k], v = this.state[k], p = ((v - d.min) / (d.max - d.min)) * 100;
    return `<div class="cfg-row"><div class="cfg-rl"><label for="r-${k}">${esc(label)}</label><output data-out="${k}">${nf(v, 1)} m</output></div>
      <div class="cfg-rr"><button type="button" class="cfg-pm" data-act="dec" data-k="${k}" aria-label="${tr('Menos', 'Less')}">−</button><input id="r-${k}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-k="${k}" style="--p:${p}%"><button type="button" class="cfg-pm" data-act="inc" data-k="${k}" aria-label="${tr('Más', 'More')}">+</button></div></div>`;
  }
  switchRow(key, label, hint, on, disabled) {
    return `<button type="button" class="cfg-switch${on ? ' on' : ''}" data-act="toggle" data-val="${key}" role="switch" aria-checked="${on}" ${disabled ? 'disabled' : ''}><span><b>${esc(label)}</b><em>${esc(hint)}</em></span><i></i></button>`;
  }

  renderBody() {
    const s = this.state, id = STEPS[this.step].id; let h = '';
    const head = (t, d) => `<h2 class="cfg-h">${esc(t)}</h2><p class="cfg-d">${esc(d)}</p>`;
    if (id === 'estilo') {
      h = head(tr('Elige un estilo para empezar', 'Pick a style to start'), tr('Cada uno arma una piscina completa. Después ajustas todo a tu gusto.', 'Each one builds a complete pool. Then fine-tune everything.')) +
        `<div class="cfg-presets">${PRESETS.map((p) => `<button type="button" class="cfg-preset${s.preset === p.id ? ' on' : ''}" data-act="preset" data-val="${p.id}" aria-pressed="${s.preset === p.id}"><span class="dots">${p.sw.map((c) => `<i style="background:${c}"></i>`).join('')}</span><b>${esc(T(p))}</b><em>${esc(T(p.d))}</em></button>`).join('')}</div>`;
    } else if (id === 'forma') {
      h = head(tr('Forma y medidas', 'Shape and size'), tr('Mueve los controles y mira cómo cambia el agua en tiempo real.', 'Move the controls and watch the water change in real time.')) +
        `<div class="cfg-shapes">${SHAPES.map((x) => `<button type="button" class="cfg-shape${s.shape === x.id ? ' on' : ''}" data-act="shape" data-val="${x.id}" aria-pressed="${s.shape === x.id}">${SHAPE_ICON[x.id]}<span>${esc(T(x))}</span></button>`).join('')}</div>` +
        this.range('length', tr('Largo', 'Length')) + this.range('width', tr('Ancho', 'Width')) + this.range('depth', tr('Profundidad', 'Depth')) +
        `<p class="cfg-note">${tr('Medidas de ejemplo. Un asesor ajusta el diseño a tu terreno.', 'Sample sizes. An advisor adapts the design to your site.')}</p>`;
    } else if (id === 'acabado') {
      const { type, color } = findFinish(s);
      h = head(tr('Revestimiento interior', 'Interior finish'), tr('El material del piso y de los muros de la piscina.', 'The material of the pool floor and walls.')) +
        `<div class="cfg-tabs" role="tablist">${FINISH_TYPES.map((t) => `<button type="button" role="tab" class="cfg-tab${type.id === t.id ? ' on' : ''}" aria-selected="${type.id === t.id}" data-act="ftype" data-val="${t.id}">${esc(T(t))}</button>`).join('')}</div>` +
        `<p class="cfg-note">${esc(T(type.note))}</p>` + this.sw('fcolor', type.colors.map((c) => ({ ...c, pattern: type.id === 'mosaico' || c.pattern === 'mosaic' ? 'mosaic' : type.id === 'porcelanato' ? 'tiles' : type.id === 'piedra' || c.pattern === 'stone' ? 'stone' : '' })), color.id);
    } else if (id === 'entorno') {
      h = head(tr('Borde y terraza', 'Coping and deck'), tr('Lo que rodea el agua: el borde de la piscina y el piso de la terraza.', 'What surrounds the water: the pool edge and the terrace floor.')) +
        `<h3 class="cfg-s">${tr('Borde', 'Coping')}</h3>` + this.sw('coping', COPINGS, s.coping) + `<h3 class="cfg-s">${tr('Terraza', 'Deck')}</h3>` + this.sw('deck', DECKS, s.deck);
    } else if (id === 'agua') {
      h = head(tr('Agua y luz', 'Water and light'), tr('El color del agua y las luces de la piscina. Prueba la vista de noche.', 'The water color and the pool lights. Try the night view.')) +
        `<h3 class="cfg-s">${tr('Color del agua', 'Water color')}</h3>` + this.sw('water', WATERS, s.water) + `<h3 class="cfg-s">${tr('Luces subacuáticas', 'Underwater lights')}</h3>` + this.sw('lights', LIGHTS, s.lights) +
        this.switchRow('night', tr('Ver de noche', 'Night view'), tr('Las luces se aprecian mejor sin sol.', 'Lights look best without sun.'), s.night);
    } else if (id === 'extras') {
      const canStairs = s.shape === 'rect' || s.shape === 'L';
      h = head(tr('Extras', 'Extras'), tr('Detalles que cambian la forma de usar tu piscina.', 'Details that change how you use your pool.')) +
        `<h3 class="cfg-s">${tr('Escalera', 'Steps')}</h3>` + `<div class="cfg-seg">${STAIRS.map((x) => `<button type="button" class="${s.stairs === x.id ? 'on' : ''}" data-act="stairs" data-val="${x.id}" aria-pressed="${s.stairs === x.id}" ${!canStairs && x.id !== 'none' ? 'disabled' : ''}>${esc(T(x))}</button>`).join('')}</div>` +
        (canStairs ? '' : `<p class="cfg-note">${tr('La escalera está disponible en formas rectangular y en L.', 'Steps are available on rectangular and L shapes.')}</p>`) +
        this.switchRow('spa', tr('Spa adosado', 'Attached spa'), tr('Un spa elevado junto a la piscina.', 'A raised spa next to the pool.'), s.spa) +
        this.switchRow('loungers', tr('Tumbonas y sombrilla', 'Loungers and parasol'), tr('Para ver cómo se vive el espacio.', 'To see how the space feels.'), s.loungers);
    } else {
      const m = this.metrics(), { type, color } = findFinish(s);
      const row = (k, v) => `<div class="cfg-sum-r"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
      h = head(tr('Tu diseño', 'Your design'), tr('Esto es lo que armaste. Un asesor lo revisa contigo y te cotiza.', 'This is what you built. An advisor reviews it with you and quotes it.')) +
        `<div class="cfg-sum">${row(tr('Forma', 'Shape'), T(byId(SHAPES, s.shape)))}${row(tr('Medidas', 'Size'), `${nf(s.length, 1)} × ${nf(s.width, 1)} m · ${nf(s.depth, 1)} m ${tr('prof.', 'deep')}`)}${row(tr('Superficie', 'Surface'), `≈ ${nf(m.area, 1)} m²`)}${row(tr('Volumen', 'Volume'), `≈ ${nf(m.vol * 1000, 0)} ${tr('litros', 'liters')}`)}${row(tr('Revestimiento', 'Finish'), `${T(type)} · ${T(color)}`)}${row(tr('Borde', 'Coping'), T(byId(COPINGS, s.coping)))}${row(tr('Terraza', 'Deck'), T(byId(DECKS, s.deck)))}${row(tr('Agua', 'Water'), T(byId(WATERS, s.water)))}${row(tr('Luces', 'Lights'), T(byId(LIGHTS, s.lights)))}${row(tr('Escalera', 'Steps'), T(byId(STAIRS, s.stairs)))}${row(tr('Spa adosado', 'Attached spa'), s.spa ? tr('Sí', 'Yes') : tr('No', 'No'))}</div>` +
        `<p class="cfg-note">${tr('Los valores son aproximados y de referencia; no incluyen precios. Es una simulación con materiales de ejemplo.', 'Values are approximate references and do not include prices. This is a simulation using sample materials.')}</p>` +
        `<div class="cfg-actions"><button type="button" class="cfg-btn cfg-primary" data-act="quote">${I.wa}<span>${tr('Pedir cotización de este diseño', 'Request a quote for this design')}</span></button>
          <div class="cfg-two"><button type="button" class="cfg-btn" data-act="shot">${I.cam}<span>${tr('Descargar imagen', 'Download image')}</span></button><button type="button" class="cfg-btn" data-act="copy">${I.link}<span>${tr('Copiar enlace', 'Copy link')}</span></button></div>
          <button type="button" class="cfg-btn cfg-ghost" data-act="reset">${I.reset}<span>${tr('Empezar de nuevo', 'Start over')}</span></button></div>`;
    }
    this.q('[data-body]').innerHTML = h;
    ['length', 'width', 'depth'].forEach((k) => { const i = this.rootEl.querySelector(`input[data-k="${k}"]`); if (i) this.syncRange(k, true); });
    const last = this.step === STEPS.length - 1;
    this.q('[data-foot]').innerHTML = `<button type="button" class="cfg-btn cfg-ghost" data-act="prev" ${this.step === 0 ? 'disabled' : ''}>${I.back}<span>${tr('Atrás', 'Back')}</span></button>
      ${last ? `<button type="button" class="cfg-btn cfg-primary" data-act="quote">${I.wa}<span>${tr('Cotizar', 'Get a quote')}</span></button>` : `<button type="button" class="cfg-btn cfg-primary" data-act="next"><span>${tr('Siguiente', 'Next')}</span>${I.arrow}</button>`}`;
  }

  // ---------- salidas ----------
  describe() {
    const s = this.state, m = this.metrics(), { type, color } = findFinish(s), en = lang() === 'en';
    const stairs = s.stairs === 'none' ? '' : (en ? `, ${T(byId(STAIRS, s.stairs)).toLowerCase()}` : `, escalera ${T(byId(STAIRS, s.stairs)).toLowerCase().replace('escalera', '').trim() || ''}`);
    const L = nf(s.length, 1), W = nf(s.width, 1), D = nf(s.depth, 1);
    if (en) return `${T(byId(SHAPES, s.shape)).toLowerCase()} shape, ${L} × ${W} m, ${D} m deep (≈ ${nf(m.area, 1)} m², ≈ ${nf(m.vol * 1000, 0)} liters), ${T(type).toLowerCase()} finish in ${T(color).toLowerCase()}, ${s.coping === 'ninguno' ? 'no coping' : `${T(byId(COPINGS, s.coping)).toLowerCase()} coping`}, ${T(byId(DECKS, s.deck)).toLowerCase()} deck, ${T(byId(WATERS, s.water)).toLowerCase()} water, lights: ${T(byId(LIGHTS, s.lights)).toLowerCase()}${stairs}${s.spa ? ', attached spa' : ''}`;
    return `forma ${T(byId(SHAPES, s.shape)).toLowerCase()}, ${L} × ${W} m y ${D} m de profundidad (≈ ${nf(m.area, 1)} m², ≈ ${nf(m.vol * 1000, 0)} litros), revestimiento ${T(type).toLowerCase()} ${T(color).toLowerCase()}, ${s.coping === 'ninguno' ? 'sin borde' : `borde ${T(byId(COPINGS, s.coping)).toLowerCase()}`}, terraza ${T(byId(DECKS, s.deck)).toLowerCase()}, agua ${T(byId(WATERS, s.water)).toLowerCase()}, luces: ${T(byId(LIGHTS, s.lights)).toLowerCase()}${stairs}${s.spa ? ', con spa adosado' : ''}`;
  }
  quote() {
    const text = lang() === 'en'
      ? `Hi, I designed a pool in the AquaBruma configurator: ${this.describe()}. My design: ${this.link()} . Could you advise me and give me a quote?`
      : `Hola, diseñé una piscina en el configurador de AquaBruma: ${this.describe()}. Mi diseño: ${this.link()} . ¿Me pueden asesorar y cotizar?`;
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
    const m = this.metrics(); g.fillText(`${nf(this.state.length, 1)} × ${nf(this.state.width, 1)} m · ${nf(this.state.depth, 1)} m · ≈ ${nf(m.area, 1)} m²  —  ${tr('Diseñado en el configurador de AquaBruma', 'Designed with the AquaBruma configurator')}`, fs, h - bar * 0.22);
    c.toBlob((blob) => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mi-piscina-aquabruma.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }, 'image/png');
  }
}

export const RANGES = { length: { min: 3, max: 16, step: 0.5 }, width: { min: 2, max: 8, step: 0.5 }, depth: { min: 0.9, max: 2.4, step: 0.1 } };
