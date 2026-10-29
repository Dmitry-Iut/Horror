'use strict';
/* Весь звук синтезируется Web Audio API: эмбиент, музыка, шорохи и крики. */
const BELLF = [392, 440, 523.25, 659.25];   // колокола I..IV

const Snd = (() => {
  let ctx = null, master, amb, mus, sfx, rev, noise, choir, ok = false, mbNext = 0, tension = 0.15, duckT = null;
  const S = {};
  const now = () => ctx.currentTime;
  const G = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const O = (f, t = 'sine') => { const o = ctx.createOscillator(); o.type = t; o.frequency.value = f; return o; };
  const F = (t, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = t; b.frequency.value = f; b.Q.value = q; return b; };
  const N = (loop = false) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = loop; return s; };
  function env(g, t, a, p, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(p, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function curve(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
  function impulse(sec, decay) { const r = ctx.sampleRate, l = (r * sec) | 0, b = ctx.createBuffer(2, l, r); for (let c = 0; c < 2; c++) { const ch = b.getChannelData(c); for (let i = 0; i < l; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / l, decay); } return b; }
  function pan(node, p, dest) { dest = dest || sfx; if (ctx.createStereoPanner) { const s = ctx.createStereoPanner(); s.pan.value = p; node.connect(s); s.connect(dest); } else node.connect(dest); }

  S.ready = () => ok;
  S.init = function () {
    if (ctx) { ctx.resume(); return; }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -9; comp.ratio.value = 5; comp.connect(ctx.destination);
    master = G(0.95); master.connect(comp);
    const len = ctx.sampleRate * 2; noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    rev = ctx.createConvolver(); rev.buffer = impulse(3.4, 2.6); const rg = G(0.6); rev.connect(rg); rg.connect(master);
    amb = G(0); amb.connect(master);
    mus = G(0); mus.connect(master); const ms = G(0.9); mus.connect(ms); ms.connect(rev);
    sfx = G(1); sfx.connect(master); const ss = G(0.32); sfx.connect(ss); ss.connect(rev);
    ambient(); ok = true;
    amb.gain.setTargetAtTime(1, now(), 1.5); mus.gain.setTargetAtTime(1, now(), 2);
  };
  function ambient() {
    const lp = F('lowpass', 170, 7); lp.connect(amb);
    [[41.2, 'sawtooth', .10], [43.65, 'sawtooth', .09], [61.7, 'triangle', .06]].forEach(([f, t, v]) => { const o = O(f, t); o.detune.value = rand(-9, 9); const g = G(v); o.connect(g); g.connect(lp); o.start(); });
    const l1 = O(0.06), l1g = G(80); l1.connect(l1g); l1g.connect(lp.frequency); l1.start();
    const n = N(true), bp = F('bandpass', 520, 0.7), wg = G(0.05); n.connect(bp); bp.connect(wg); wg.connect(amb); n.start();
    const l2 = O(0.09), l2g = G(0.035); l2.connect(l2g); l2g.connect(wg.gain); l2.start();
    const l3 = O(0.04), l3g = G(260); l3.connect(l3g); l3g.connect(bp.frequency); l3.start();
    choir = G(0); choir.connect(mus);
    const f1 = F('bandpass', 720, 9), f2 = F('bandpass', 1180, 10); f1.connect(choir); f2.connect(choir);
    [196, 207.65, 293.66, 311.13].forEach(f => { const o = O(f, 'sawtooth'), v = O(rand(4.5, 5.8)), vg = G(f * 0.012); v.connect(vg); vg.connect(o.frequency); const g = G(0.5); o.connect(g); g.connect(f1); g.connect(f2); o.start(); v.start(); });
  }
  function note(f, v, delay = 0, dec = 2.6) {
    const t = now() + delay; const o = O(f), o2 = O(f * 2.01), g = G(0), g2 = G(0.25);
    o2.connect(g2); g2.connect(g); o.connect(g); g.connect(mus); env(g, t, 0.004, v, dec);
    o.start(t); o2.start(t); o.stop(t + dec + 0.3); o2.stop(t + dec + 0.3);
  }
  S.tick = function () {
    if (!ok) return; const t = now();
    if (t > mbNext && tension < 0.9) { mbNext = t + rand(2.5, 6.5) * (1.4 - tension); const notes = [659.3, 698.5, 783.99, 987.8, 1046.5, 1174.7, 1318.5]; const f = pick(notes); note(f, 0.045); if (Math.random() < 0.3) note(f * 1.0595, 0.03, 0.14); }
    choir.gain.setTargetAtTime(tension * 0.6, t, 0.8);
  };
  S.tension = v => { tension = v; };
  S.melody = function () { if (!ok) return; const seq = [659.3, 783.99, 659.3, 587.3, 523.25, 587.3, 659.3, 0, 659.3, 783.99, 880, 783.99, 659.3, 0, 587.3, 523.25]; seq.forEach((f, i) => { if (f) note(f, 0.08, i * 0.45, 2); }); mbNext = now() + 8; };
  /* шкатулка играет колыбельную теми же высотами, что у колоколов */
  S.musicBox = function (seq) { if (!ok) return; seq.forEach((b, i) => note(BELLF[b] * 2, 0.11, i * 0.62, 1.8)); mbNext = now() + seq.length * 0.62 + 3; };
  S.duck = function (sec, lvl = 0) {
    if (!ok) return; const t = now();
    amb.gain.cancelScheduledValues(t); mus.gain.cancelScheduledValues(t);
    amb.gain.setTargetAtTime(lvl, t, 0.12); mus.gain.setTargetAtTime(lvl, t, 0.12); clearTimeout(duckT);
    duckT = setTimeout(() => { const t2 = now(); amb.gain.setTargetAtTime(1, t2, 1.2); mus.gain.setTargetAtTime(1, t2, 1.6); }, sec * 1000);
  };
  S.mute = m => { if (ok) master.gain.setTargetAtTime(m ? 0 : 0.95, now(), 0.05); };

  S.creak = function (dur = 1.5, pitch = 1, vol = 1) {
    if (!ok) return; const t = now();
    const src = O(9, 'sawtooth'); let r = 9; src.frequency.setValueAtTime(9, t);
    for (let i = 1; i <= 12; i++) { r = clamp(r * rand(0.7, 1.5), 6, 46); src.frequency.linearRampToValueAtTime(r, t + dur * i / 12); }
    const b1 = F('bandpass', 700 * pitch, 16), b2 = F('bandpass', 1450 * pitch, 14), b3 = F('bandpass', 2600 * pitch, 10);
    [b1, b2].forEach(b => { let f = b.frequency.value; for (let i = 1; i <= 8; i++) { f *= rand(0.9, 1.12); b.frequency.linearRampToValueAtTime(f, t + dur * i / 8); } });
    const g = G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(2.6 * vol, t + 0.12); g.gain.setValueAtTime(2.6 * vol, t + dur - 0.25); g.gain.linearRampToValueAtTime(0, t + dur);
    const g3 = G(0.4); src.connect(b1); src.connect(b2); src.connect(b3); b1.connect(g); b2.connect(g); b3.connect(g3); g3.connect(g); g.connect(sfx); src.start(t); src.stop(t + dur + 0.05);
  };
  S.slam = function (v = 1) {
    if (!ok) return; const t = now(); const n = N(), lp = F('lowpass', 900, 0.7), g = G(0); n.connect(lp); lp.connect(g); g.connect(sfx); env(g, t, 0.005, 1.3 * v, 0.6); n.start(t); n.stop(t + 0.8);
    const o = O(80); o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5); const og = G(0); o.connect(og); og.connect(sfx); env(og, t, 0.005, 1.4 * v, 0.7); o.start(t); o.stop(t + 0.9);
  };
  S.scream = function (v = 1, dur = 1.25, pm = 1) {
    if (!ok) return; const t = now(); const ws = ctx.createWaveShaper(); ws.curve = curve(40); const out = G(0); ws.connect(out); out.connect(sfx);
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.85 * v, t + 0.02); out.gain.setValueAtTime(0.85 * v, t + dur * 0.55); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [480, 690, 1020, 1500].forEach(f0 => { const f = f0 * pm; const o = O(f, 'sawtooth'); o.frequency.setValueAtTime(f * 0.55, t); o.frequency.exponentialRampToValueAtTime(f * 1.25, t + 0.12); o.frequency.exponentialRampToValueAtTime(f * 0.9, t + dur);
      const vb = O(rand(8, 13)), vg = G(f * 0.07); vb.connect(vg); vg.connect(o.frequency); const g = G(0.18); o.connect(g); g.connect(ws); o.start(t); vb.start(t); o.stop(t + dur + 0.1); vb.stop(t + dur + 0.1); });
    const n = N(), bp = F('bandpass', 2800 * pm, 0.8), ng = G(0.6); n.connect(bp); bp.connect(ng); ng.connect(ws); n.start(t); n.stop(t + dur + 0.1);
    S.slam(1.1 * v);
  };
  S.hit = () => S.scream(0.55, 0.35, rand(0.8, 1.3));
  S.whisper = function (v = 0.5, p = null) {
    if (!ok) return; const t = now(); const n = N(), bp = F('bandpass', 2400, 4), g = G(0); n.connect(bp); bp.connect(g); pan(g, p === null ? rand(-1, 1) : p);
    g.gain.setValueAtTime(0, t); let tt = t;
    for (let i = 0; i < 8; i++) { const d = rand(0.08, 0.22); bp.frequency.setValueAtTime(rand(1500, 4200), tt); g.gain.linearRampToValueAtTime(rand(0.3, 1) * v * 1.8, tt + d * 0.4); g.gain.linearRampToValueAtTime(0, tt + d); tt += d + rand(0.02, 0.1); }
    n.start(t); n.stop(tt + 0.1);
  };
  S.knock = function (n = 3, v = 1, p = 0) {
    if (!ok) return; let t = now();
    for (let i = 0; i < n; i++) {
      const o = O(120); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.15); const og = G(0); o.connect(og); pan(og, p); env(og, t, 0.003, 0.9 * v, 0.18); o.start(t); o.stop(t + 0.3);
      const ns = N(), lp = F('lowpass', 600, 1), ng = G(0); ns.connect(lp); lp.connect(ng); pan(ng, p); env(ng, t, 0.002, 0.7 * v, 0.08); ns.start(t); ns.stop(t + 0.2); t += rand(0.28, 0.42);
    }
  };
  S.step = function (v = 0.16, p = 0, delay = 0) {
    if (!ok) return; const t = now() + delay; const ns = N(), lp = F('lowpass', 300, 1), ng = G(0); ns.connect(lp); lp.connect(ng); pan(ng, p); env(ng, t, 0.004, v, 0.1); ns.start(t, rand(0, 1.5)); ns.stop(t + 0.2);
    const o = O(62), og = G(0); o.connect(og); pan(og, p); env(og, t, 0.003, v * 1.2, 0.09); o.start(t); o.stop(t + 0.2);
  };
  S.organ = function () { if (!ok) return; const t = now(); const lp = F('lowpass', 1300, 0.8); lp.connect(mus); [65.4, 130.8, 138.6, 185, 196, 261.6, 277.2].forEach(f => { const o = O(f, 'sawtooth'), g = G(0); o.connect(g); g.connect(lp); env(g, t, 0.06, 0.07, 3.2); o.start(t); o.stop(t + 3.5); }); };
  S.pickup = function () { if (!ok) return; const t = now(); [880, 1318.5].forEach((f, i) => { const o = O(f), g = G(0); o.connect(g); g.connect(sfx); env(g, t + i * 0.08, 0.004, 0.18, 1.2); o.start(t); o.stop(t + 1.6); }); };
  S.candle = function () { if (!ok) return; const t = now(); const n = N(), bp = F('bandpass', 700, 1.2), g = G(0); bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(1800, t + 0.35); n.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.05, 0.5, 0.4); n.start(t); n.stop(t + 0.6); };
  S.heart = function (v = 0.6) { if (!ok) return; [0, 0.22].forEach((d, i) => { const t = now() + d; const o = O(58), g = G(0); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); o.connect(g); g.connect(sfx); env(g, t, 0.01, v * (i ? 0.7 : 1), 0.2); o.start(t); o.stop(t + 0.3); }); };
  S.thunder = function () { if (!ok) return; const t = now(); const n = N(true), lp = F('lowpass', 260, 0.6), g = G(0); n.connect(lp); lp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.2, t + 0.08); g.gain.linearRampToValueAtTime(0.5, t + 0.5); g.gain.linearRampToValueAtTime(0.9, t + 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + 3.5); n.start(t); n.stop(t + 3.6); };
  S.crow = function () { if (!ok) return; [0, 0.32].forEach(d => { const t = now() + d; const o = O(900, 'sawtooth'), bp = F('bandpass', 1400, 3), g = G(0); o.frequency.setValueAtTime(950, t); o.frequency.exponentialRampToValueAtTime(480, t + 0.22); o.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.01, 0.5, 0.22); o.start(t); o.stop(t + 0.3); }); };
  S.buzz = function () { if (!ok) return; const t = now(); const o = O(92, 'square'), lp = F('lowpass', 500, 1), g = G(0); o.connect(lp); lp.connect(g); g.connect(sfx); env(g, t, 0.01, 0.35, 0.35); o.start(t); o.stop(t + 0.5); };
  S.rattle = function () { if (!ok) return; let t = now(); for (let i = 0; i < 7; i++) { const n = N(), bp = F('bandpass', rand(2200, 3400), 5), g = G(0); n.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.002, 0.9, 0.06); n.start(t, rand(0, 1.5)); n.stop(t + 0.12); t += rand(0.05, 0.11); } };
  S.click = function () { if (!ok) return; const t = now(); const n = N(), bp = F('bandpass', 3000, 6), g = G(0); n.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.001, 0.6, 0.03); n.start(t); n.stop(t + 0.06); };

  /* новые звуки для разных скримеров и событий */
  S.splash = function () {
    if (!ok) return; const t = now();
    for (let i = 0; i < 3; i++) { const n = N(), lp = F('lowpass', 1800, 0.8), g = G(0); n.connect(lp); lp.connect(g); g.connect(sfx); env(g, t + i * 0.07, 0.005, 0.9 - i * 0.2, 0.35); n.start(t + i * 0.07, rand(0, 1)); n.stop(t + i * 0.07 + 0.5); }
    for (let i = 0; i < 8; i++) { const tt = t + 0.1 + i * rand(0.03, 0.08); const o = O(400); o.frequency.setValueAtTime(rand(300, 600), tt); o.frequency.exponentialRampToValueAtTime(rand(900, 1600), tt + 0.06); const g = G(0); o.connect(g); g.connect(sfx); env(g, tt, 0.003, 0.15, 0.06); o.start(tt); o.stop(tt + 0.1); }
  };
  S.glass = function () {
    if (!ok) return; const t = now();
    for (let i = 0; i < 14; i++) { const tt = t + rand(0, 0.35); const n = N(), bp = F('bandpass', rand(3000, 7000), 8), g = G(0); n.connect(bp); bp.connect(g); g.connect(sfx); env(g, tt, 0.001, rand(0.4, 1), rand(0.05, 0.3)); n.start(tt, rand(0, 1.5)); n.stop(tt + 0.4);
      const o = O(rand(2500, 5200)), og = G(0); o.connect(og); og.connect(sfx); env(og, tt, 0.001, 0.08, rand(0.2, 0.6)); o.start(tt); o.stop(tt + 0.7); }
    const n = N(), hp = F('highpass', 1500, 0.7), g = G(0); n.connect(hp); hp.connect(g); g.connect(sfx); env(g, t, 0.002, 1.1, 0.25); n.start(t); n.stop(t + 0.4);
  };
  S.crack = function (n = 5) { if (!ok) return; let t = now(); for (let i = 0; i < n; i++) { const ns = N(), bp = F('bandpass', rand(1200, 2600), 3), g = G(0); ns.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.001, 1.0, 0.03); ns.start(t, rand(0, 1.5)); ns.stop(t + 0.08); t += rand(0.04, 0.12); } };
  S.growl = function (dur = 1.2, v = 1) {
    if (!ok) return; const t = now(); const ws = ctx.createWaveShaper(); ws.curve = curve(30); const lp = F('lowpass', 700, 2), g = G(0); ws.connect(lp); lp.connect(g); g.connect(sfx);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8 * v, t + 0.06); g.gain.setValueAtTime(0.8 * v, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [55, 58, 83].forEach(f => { const o = O(f, 'sawtooth'); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.6, t + dur); const am = O(rand(18, 30)), ag = G(0.5); am.connect(ag); const og = G(0.5); ag.connect(og.gain); o.connect(og); og.connect(ws); o.start(t); am.start(t); o.stop(t + dur + 0.1); am.stop(t + dur + 0.1); });
    const n = N(), bp = F('bandpass', 400, 1), ng = G(0.4); n.connect(bp); bp.connect(ng); ng.connect(ws); n.start(t); n.stop(t + dur);
  };
  S.static = function (dur = 1) { if (!ok) return; const t = now(); const n = N(true), hp = F('highpass', 800, 0.5), g = G(0); n.connect(hp); hp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); for (let i = 0; i < 20; i++) g.gain.setValueAtTime(rand(0.1, 0.7), t + i * dur / 20); g.gain.setValueAtTime(0, t + dur); n.start(t); n.stop(t + dur + 0.05); };
  S.choirHit = function () { if (!ok) return; const t = now(); const f1 = F('bandpass', 800, 6), f2 = F('bandpass', 1300, 7), g = G(0); f1.connect(g); f2.connect(g); g.connect(sfx); env(g, t, 0.03, 1.6, 1.6); [392, 415.3, 587.3, 622.3, 830.6].forEach(f => { const o = O(f, 'sawtooth'), v = O(6), vg = G(f * 0.02); v.connect(vg); vg.connect(o.frequency); o.connect(f1); o.connect(f2); o.start(t); v.start(t); o.stop(t + 1.8); v.stop(t + 1.8); }); };
  S.wail = function (v = 0.6, dur = 1.6) { if (!ok) return; const t = now(); const o = O(600, 'triangle'), vb = O(6), vg = G(14); vb.connect(vg); vg.connect(o.frequency); o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(880, t + dur * 0.35); o.frequency.linearRampToValueAtTime(430, t + dur); const bp = F('bandpass', 900, 2), g = G(0); o.connect(bp); bp.connect(g); g.connect(mus); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35 * v, t + 0.2); g.gain.linearRampToValueAtTime(0, t + dur); o.start(t); vb.start(t); o.stop(t + dur + 0.1); vb.stop(t + dur + 0.1); };
  S.bell = function (f, v = 0.5) { if (!ok) return; const t = now(); [[1, 1], [2.0, 0.5], [2.4, 0.35], [3.0, 0.25], [4.2, 0.15], [0.5, 0.4]].forEach(([m, a]) => { const o = O(f * m), g = G(0); o.connect(g); g.connect(sfx); env(g, t, 0.004, v * a, 3.5 * (m < 1 ? 1.3 : 1 / m + 0.8)); o.start(t); o.stop(t + 5); }); };
  S.books = function () { if (!ok) return; let t = now(); for (let i = 0; i < 6; i++) { const o = O(90), g = G(0); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.1); o.connect(g); g.connect(sfx); env(g, t, 0.003, 0.6, 0.12); o.start(t); o.stop(t + 0.2); const n = N(), lp = F('lowpass', 1200, 1), ng = G(0); n.connect(lp); lp.connect(ng); ng.connect(sfx); env(ng, t, 0.002, 0.5, 0.08); n.start(t, rand(0, 1)); n.stop(t + 0.15); t += rand(0.08, 0.25); } };
  S.breath = function (v = 0.25) { if (!ok) return; const t = now(); const n = N(), bp = F('bandpass', 1100, 0.9), g = G(0); n.connect(bp); bp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.5); g.gain.linearRampToValueAtTime(0, t + 1.3); n.start(t, rand(0, 0.5)); n.stop(t + 1.4); };
  S.gasp = function () { if (!ok) return; const t = now(); const n = N(), bp = F('bandpass', 1600, 1.5), g = G(0); n.connect(bp); bp.connect(g); g.connect(sfx); env(g, t, 0.02, 0.7, 0.35); n.start(t); n.stop(t + 0.5); };
  S.gust = function () { if (!ok) return; const t = now(); const n = N(true), bp = F('bandpass', 300, 0.8), g = G(0); bp.frequency.setValueAtTime(250, t); bp.frequency.linearRampToValueAtTime(900, t + 1.2); bp.frequency.linearRampToValueAtTime(300, t + 2.5); n.connect(bp); bp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.6, t + 1); g.gain.linearRampToValueAtTime(0, t + 2.6); n.start(t); n.stop(t + 2.7); };
  S.chomp = () => { S.slam(1.2); S.crack(3); };
  return S;
})();
