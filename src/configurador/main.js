import { Configurator } from './ui.js';

let inst = null;
const get = () => inst || (inst = new Configurator());

function decode(s) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return null; }
}

window.AQCfg = {
  open(opts) { get().open(opts || {}); },
  close() { if (inst) inst.close(); },
  instance() { return inst; },
  fromParam(s) { const st = decode(s); if (st && st.shape) get().open({ state: st }); else get().open({}); }
};
