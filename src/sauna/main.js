import { SaunaConfigurator } from './ui.js';

let inst = null;
const get = () => inst || (inst = new SaunaConfigurator());

function decode(s) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return null; }
}

window.AQSauna = {
  open(opts) { get().open(opts || {}); },
  close() { if (inst) inst.close(); },
  instance() { return inst; },
  fromParam(s) { const st = decode(s); if (st && st.width) get().open({ state: st }); else get().open({}); }
};
