'use strict';
/* Скримеры: 11 разных видов, у каждого своя картинка, анимация и звук. */
const scv = $('scare'), sctx = scv.getContext('2d');

function nunFace(c, cx, cy, s, o = {}) {
  const sc = o.scream ?? 1, r = seeded(o.seed || 7);
  c.save();
  c.fillStyle = '#050405'; c.beginPath(); c.moveTo(cx - s * 1.95, cy + s * 2.8); c.bezierCurveTo(cx - s * 2.05, cy - s * 1.2, cx - s * 1.2, cy - s * 2.15, cx, cy - s * 2.2); c.bezierCurveTo(cx + s * 1.2, cy - s * 2.15, cx + s * 2.05, cy - s * 1.2, cx + s * 1.95, cy + s * 2.8); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(130,130,140,.3)'; c.lineWidth = s * 0.04; c.stroke();
  c.fillStyle = '#d9d4c6'; c.beginPath(); c.ellipse(cx, cy + s * 0.15, s * 1.12, s * 1.45, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(cx, cy + s * 1.65, s * 1.5, s * 0.55, 0, 0, 7); c.fill();
  c.fillStyle = '#efeadf'; c.fillRect(cx - s, cy - s * 1.2, s * 2, s * 0.3);
  const g = c.createRadialGradient(cx, cy - s * 0.1, s * 0.1, cx, cy + s * 0.1, s * 1.05); g.addColorStop(0, o.pale ? '#c8c8bc' : '#aab19e'); g.addColorStop(0.65, '#6d7564'); g.addColorStop(1, '#272b23');
  c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy + s * 0.1, s * 0.82, s * 1.06, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(35,20,35,.6)'; c.lineWidth = Math.max(1, s * 0.018);
  for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2; let x = cx + Math.cos(a) * s * 0.78, y = cy + s * 0.1 + Math.sin(a) * s; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (cx - x) * 0.18 + (r() - 0.5) * s * 0.12; y += (cy - y) * 0.18 + (r() - 0.5) * s * 0.12; c.lineTo(x, y); } c.stroke(); }
  for (const sd of [-1, 1]) {
    const ex = cx + sd * s * 0.34, ey = cy - s * 0.18;
    const eg = c.createRadialGradient(ex, ey, s * 0.1, ex, ey, s * 0.36); eg.addColorStop(0, 'rgba(0,0,0,.95)'); eg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = eg; c.beginPath(); c.ellipse(ex, ey, s * 0.38, s * 0.34, 0, 0, 7); c.fill();
    c.fillStyle = o.whiteEyes ? '#e8e4d8' : '#000'; c.beginPath(); c.ellipse(ex, ey + s * 0.02, s * 0.21, s * 0.22 * (o.eyeH || 1), sd * 0.15, 0, 7); c.fill();
    c.fillStyle = o.whiteEyes ? '#000' : '#f4f1e8'; c.beginPath(); c.arc(ex + sd * s * 0.02, ey, s * (o.whiteEyes ? 0.05 : 0.028), 0, 7); c.fill();
    c.strokeStyle = '#7a0a0c'; c.lineWidth = s * 0.035; c.beginPath(); c.moveTo(ex - sd * s * 0.05, ey + s * 0.2); c.quadraticCurveTo(ex - sd * s * 0.08, ey + s * 0.5, ex - sd * s * 0.02, ey + s * (0.7 + r() * 0.3)); c.stroke();
  }
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(cx, cy + s * 0.05); c.lineTo(cx - s * 0.08, cy + s * 0.32); c.lineTo(cx + s * 0.08, cy + s * 0.32); c.fill();
  const mw = s * (0.16 + 0.16 * sc), mh = s * (0.08 + 0.42 * sc), my = cy + s * 0.62 + mh * 0.25;
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(cx, my, mw, mh, 0, 0, 7); c.fill();
  c.fillStyle = '#8c8676';
  for (let i = 0; i < 7; i++) { const tx = cx - mw * 0.8 + i * mw * 0.27; c.beginPath(); c.moveTo(tx, my - mh * 0.92); c.lineTo(tx + mw * 0.12, my - mh * 0.6); c.lineTo(tx + mw * 0.24, my - mh * 0.9); c.fill(); c.beginPath(); c.moveTo(tx, my + mh * 0.92); c.lineTo(tx + mw * 0.12, my + mh * 0.62); c.lineTo(tx + mw * 0.24, my + mh * 0.9); c.fill(); }
  c.restore();
}
function nunFigure(c, x, y, h, o = {}) {
  const u = h / 100; c.save(); c.fillStyle = o.col || '#050405';
  c.beginPath(); c.moveTo(x, y - h); c.bezierCurveTo(x - 18 * u, y - h + 2 * u, x - 20 * u, y - h + 30 * u, x - 18 * u, y - h + 40 * u); c.lineTo(x - 28 * u, y); c.lineTo(x + 28 * u, y); c.lineTo(x + 18 * u, y - h + 40 * u); c.bezierCurveTo(x + 20 * u, y - h + 30 * u, x + 18 * u, y - h + 2 * u, x, y - h); c.fill();
  c.fillStyle = '#d6d0c1'; c.beginPath(); c.ellipse(x, y - h + 17 * u, 10 * u, 12 * u, 0, 0, 7); c.fill();
  c.fillStyle = o.face || '#8f9785'; c.beginPath(); c.ellipse(x, y - h + 18 * u, 7 * u, 9 * u, 0, 0, 7); c.fill();
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(x - 2.6 * u, y - h + 16 * u, 1.8 * u, 2.2 * u, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 2.6 * u, y - h + 16 * u, 1.8 * u, 2.2 * u, 0, 0, 7); c.fill();
  if (o.arms) { c.strokeStyle = '#9aa190'; c.lineWidth = 2.2 * u; c.beginPath(); c.moveTo(x - 16 * u, y - h + 40 * u); c.lineTo(x - 30 * u, y - h + 70 * u); c.moveTo(x + 16 * u, y - h + 40 * u); c.lineTo(x + 30 * u, y - h + 70 * u); c.stroke(); }
  c.restore();
}

/* портрет Агриппины: для головоломки и для скримера */
const portraitCv = cnv(330, 330);
function makePortrait() {
  const c = portraitCv.getContext('2d');
  const bg = c.createRadialGradient(165, 150, 20, 165, 165, 230); bg.addColorStop(0, '#c9ab7e'); bg.addColorStop(1, '#4a3420'); c.fillStyle = bg; c.fillRect(0, 0, 330, 330);
  c.fillStyle = '#1a120c'; c.beginPath(); c.moveTo(165, 40); c.bezierCurveTo(70, 48, 60, 170, 64, 240); c.lineTo(40, 330); c.lineTo(290, 330); c.lineTo(266, 240); c.bezierCurveTo(270, 170, 260, 48, 165, 40); c.fill();
  c.fillStyle = '#e6dcc6'; c.beginPath(); c.ellipse(165, 155, 62, 76, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(165, 248, 90, 34, 0, 0, 7); c.fill();
  const fg = c.createRadialGradient(158, 145, 10, 165, 160, 60); fg.addColorStop(0, '#e8d0b0'); fg.addColorStop(1, '#a88a68'); c.fillStyle = fg; c.beginPath(); c.ellipse(165, 160, 44, 58, 0, 0, 7); c.fill();
  c.fillStyle = '#3a2618'; [147, 183].forEach(ex => { c.beginPath(); c.ellipse(ex, 145, 8, 5, 0, 0, 7); c.fill(); c.fillStyle = '#e8dcc6'; c.fillRect(ex - 2, 143, 2, 2); c.fillStyle = '#3a2618'; });
  c.strokeStyle = '#6a4a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(137, 132); c.quadraticCurveTo(147, 127, 157, 132); c.moveTo(173, 132); c.quadraticCurveTo(183, 127, 193, 132); c.stroke();
  c.beginPath(); c.moveTo(165, 150); c.lineTo(160, 175); c.lineTo(168, 177); c.stroke();
  c.strokeStyle = '#7a4a3a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(152, 192); c.quadraticCurveTo(165, 198, 178, 192); c.stroke();
  c.fillStyle = 'rgba(60,40,20,.25)'; for (let i = 0; i < 300; i++) c.fillRect(rand(0, 330), rand(0, 330), rand(1, 3), rand(1, 3));
  c.fillStyle = 'rgba(30,20,10,.75)'; c.fillRect(85, 296, 160, 26); c.fillStyle = '#e8d8b0'; c.font = '17px Neucha, cursive'; c.textAlign = 'center'; c.fillText('Сестра Агриппина · 1961', 165, 315);
  c.strokeStyle = '#2a1a0c'; c.lineWidth = 14; c.strokeRect(0, 0, 330, 330);
}

function glitch(c, w, h, n, amt = 40) { for (let i = 0; i < n; i++) { const y = rand(0, h), hh = rand(4, 40) * (h / 800); c.drawImage(c.canvas, 0, y, w, hh, rand(-amt, amt) * (w / 800), y, w, hh); } }
function redwash(c, w, h, a) { c.fillStyle = `rgba(160,0,0,${a})`; c.fillRect(0, 0, w, h); }

const SCARES = {
  face: { dur: 950, sound() { Snd.scream(1.05, 1.25, 1); },
    draw(c, w, h, t, d) { c.fillStyle = Math.random() < .25 ? '#5a0000' : '#000'; c.fillRect(0, 0, w, h); const z = 0.85 + Math.pow(Math.min(1, t * 1.4), .5) * .75, s = Math.min(w, h) * 0.2 * z; nunFace(c, w / 2 + rand(-1, 1) * s * .08, h / 2 + rand(-1, 1) * s * .08, s, { seed: d.seed, scream: .7 + Math.random() * .3, eyeH: d.eyeH }); glitch(c, w, h, 6); redwash(c, w, h, .15 + Math.random() * .2); } },

  hands: { dur: 1300, sound() { Snd.splash(); setTimeout(() => Snd.scream(0.95, 1.1, 0.8), 160); },
    init(w, h) { return { arms: Array.from({ length: 7 }, (_, i) => ({ bx: w * (i / 6) + rand(-30, 30), tx: w / 2 + rand(-0.32, 0.32) * w, ty: h * rand(0.15, 0.55), dl: rand(0, 0.3), sd: i < 3.5 ? -1 : 1 })) }; },
    draw(c, w, h, t, d) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#02090c'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const wl = h * 0.8, s = Math.min(w, h) * 0.22, fy = h * 1.05 - easeOut(t * 1.3) * h * 0.5;
      c.save(); c.beginPath(); c.rect(0, 0, w, wl); c.clip(); nunFace(c, w / 2, fy, s, { seed: 11, scream: 0.9, whiteEyes: true }); c.restore();
      c.fillStyle = 'rgba(8,26,32,.88)'; c.fillRect(0, wl, w, h - wl); c.strokeStyle = 'rgba(140,190,200,.35)'; c.lineWidth = 2;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(w / 2, wl + 4, (t * 2 + i * 0.2) % 1.2 * w * 0.5, 8 + i * 3, 0, 0, 7); c.stroke(); }
      const u = Math.min(w, h) / 400;
      for (const a of d.arms) {
        const p = easeOut((t - a.dl) / 0.45); if (p <= 0) continue;
        const wx = lerp(a.bx, a.tx, p), wy = lerp(h + 40, a.ty, p);
        c.strokeStyle = '#7f8c86'; c.lineCap = 'round'; c.lineWidth = 26 * u; c.beginPath(); c.moveTo(a.bx, h + 40); c.quadraticCurveTo(a.bx + a.sd * 40 * u, (h + wy) / 2, wx, wy); c.stroke();
        c.strokeStyle = '#a7b3ab'; c.lineWidth = 14 * u; c.stroke();
        const ang = Math.atan2(wy - (h + 40), wx - a.bx);
        c.fillStyle = '#a3afa7'; c.beginPath(); c.ellipse(wx, wy, 18 * u, 14 * u, ang, 0, 7); c.fill();
        c.strokeStyle = '#a3afa7'; c.lineWidth = 6 * u;
        for (let f = -2; f <= 2; f++) { const fa = ang + f * 0.32, L = (f === -2 ? 30 : 52) * u; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(fa) * L, wy + Math.sin(fa) * L); c.stroke(); c.fillStyle = '#1a1414'; c.beginPath(); c.arc(wx + Math.cos(fa) * L, wy + Math.sin(fa) * L, 3 * u, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(120,170,180,.5)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const dx = wx + rand(-12, 12) * u; c.beginPath(); c.moveTo(dx, wy + 10 * u); c.lineTo(dx, wy + rand(20, 60) * u); c.stroke(); }
      }
      c.fillStyle = 'rgba(0,60,80,.18)'; c.fillRect(0, 0, w, h); glitch(c, w, h, 3, 20);
    } },

  ceiling: { dur: 1200, sound() { Snd.crack(7); setTimeout(() => Snd.scream(1, 1.1, 1.15), 220); },
    draw(c, w, h, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      const s = Math.min(w, h) * 0.24, el = t < 0.35 ? Math.pow(t / 0.35, 2) : 1 + Math.sin((t - 0.35) * 26) * 0.07 * (1 - t);
      const yy = -h * 0.55 + el * h * 0.98;
      c.fillStyle = '#050405'; c.beginPath(); c.moveTo(w / 2 - s * 1.6, 0); c.lineTo(w / 2 + s * 1.6, 0); c.lineTo(w / 2 + s * 1.3, yy); c.lineTo(w / 2 - s * 1.3, yy); c.fill();
      c.strokeStyle = '#8d968a'; c.lineWidth = s * 0.07; c.lineCap = 'round';
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(w / 2 + sd * s * 1.1, yy - s * 1.4); c.lineTo(w / 2 + sd * s * 1.9, yy - s * 0.2); c.lineTo(w / 2 + sd * s * 1.5, yy + s * 1.3); c.stroke(); c.lineWidth = s * 0.025; for (let f = 0; f < 4; f++) { c.beginPath(); c.moveTo(w / 2 + sd * s * 1.5, yy + s * 1.3); c.lineTo(w / 2 + sd * s * (1.4 + f * 0.08), yy + s * (1.65 + f * 0.04)); c.stroke(); } c.lineWidth = s * 0.07; }
      c.save(); c.translate(w / 2, yy); c.rotate(Math.PI + Math.sin(t * 30) * 0.04); nunFace(c, 0, 0, s, { seed: 23, scream: 1, eyeH: 1.3 }); c.restore();
      glitch(c, w, h, 4); redwash(c, w, h, t > 0.35 ? 0.2 : 0);
    } },

  glass: { dur: 1250, sound() { Snd.glass(); setTimeout(() => Snd.scream(0.9, 1, 1.25), 120); },
    init(w, h) {
      const ix = w * rand(.4, .6), iy = h * rand(.38, .55), n = 16, R = Math.max(w, h) * 1.5, angs = Array.from({ length: n }, (_, i) => (i + rand(-0.3, 0.3)) / n * Math.PI * 2).sort((a, b) => a - b);
      const shards = angs.map((a, i) => { const b = angs[(i + 1) % n] + (i === n - 1 ? Math.PI * 2 : 0); return { a, b, dx: Math.cos((a + b) / 2) * rand(10, 60), dy: Math.sin((a + b) / 2) * rand(10, 60) + rand(0, 40), rot: rand(-.06, .06) }; });
      const lines = angs.map(a => { const pts = [[ix, iy]]; let x = ix, y = iy; for (let k = 0; k < 6; k++) { x += Math.cos(a + rand(-.15, .15)) * R / 10; y += Math.sin(a + rand(-.15, .15)) * R / 10; pts.push([x, y]); } return pts; });
      return { ix, iy, R, shards, lines };
    },
    draw(c, w, h, t, d) {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h); const s = Math.min(w, h) * (0.22 + t * 0.05);
      if (t < 0.12) { nunFace(c, w / 2, h / 2, s, { seed: 41, scream: .4 }); c.fillStyle = `rgba(255,255,255,${(t / 0.12) * 0.6})`; c.fillRect(0, 0, w, h); return; }
      const p = easeOut((t - 0.12) * 1.3);
      for (const sh of d.shards) {
        c.save(); c.beginPath(); c.moveTo(d.ix, d.iy); c.lineTo(d.ix + Math.cos(sh.a) * d.R, d.iy + Math.sin(sh.a) * d.R); c.lineTo(d.ix + Math.cos(sh.b) * d.R, d.iy + Math.sin(sh.b) * d.R); c.closePath(); c.clip();
        c.translate(sh.dx * p, sh.dy * p); c.translate(d.ix, d.iy); c.rotate(sh.rot * p); c.translate(-d.ix, -d.iy);
        c.fillStyle = '#0a0606'; c.fillRect(-50, -50, w + 100, h + 100); nunFace(c, w / 2, h / 2, s, { seed: 41, scream: 1 }); c.restore();
      }
      c.strokeStyle = 'rgba(240,240,255,.8)'; c.lineWidth = 1.5; for (const pts of d.lines) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
      redwash(c, w, h, 0.1);
    } },

  eyes: { dur: 1400, sound() { Snd.whisper(1, -0.5); Snd.whisper(1, 0.5); setTimeout(() => Snd.choirHit(), 500); setTimeout(() => Snd.hit(), 1000); },
    init(w, h) { const u = Math.min(w, h) / 400; return { eyes: Array.from({ length: 44 }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(12, 46) * u, dl: rand(0, 0.55) })) }; },
    draw(c, w, h, t, d) {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      for (const e of d.eyes) {
        const o = clamp((t - e.dl) / 0.12, 0, 1); if (o <= 0) continue;
        c.save(); c.beginPath(); c.ellipse(e.x, e.y, e.r, e.r * 0.55 * o, 0, 0, 7); c.clip();
        const g = c.createRadialGradient(e.x, e.y, e.r * 0.2, e.x, e.y, e.r); g.addColorStop(0, '#e2d8c4'); g.addColorStop(1, '#8a5a50'); c.fillStyle = g; c.fillRect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
        c.strokeStyle = 'rgba(160,20,20,.7)'; c.lineWidth = 1; for (let k = 0; k < 6; k++) { const a = k * 1.05; c.beginPath(); c.moveTo(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r * 0.5); c.lineTo(e.x + Math.cos(a) * e.r * 0.5, e.y + Math.sin(a) * e.r * 0.25); c.stroke(); }
        const dx = w / 2 - e.x, dy = h / 2 - e.y, dl = Math.hypot(dx, dy) || 1, ix = e.x + dx / dl * e.r * 0.35, iy = e.y + dy / dl * e.r * 0.15;
        c.fillStyle = '#4a0808'; c.beginPath(); c.arc(ix, iy, e.r * 0.42, 0, 7); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(ix, iy, e.r * 0.2, 0, 7); c.fill();
        c.restore(); c.strokeStyle = '#1a0a08'; c.lineWidth = 2; c.beginPath(); c.ellipse(e.x, e.y, e.r, e.r * 0.55 * o, 0, 0, 7); c.stroke();
      }
      if (t > 0.72) { const p = (t - 0.72) / 0.28; nunFace(c, w / 2, h / 2, Math.min(w, h) * (0.15 + p * 0.25), { seed: 3, scream: 1 }); redwash(c, w, h, p * 0.3); glitch(c, w, h, 5); }
    } },

  vhs: { dur: 1300, sound() { Snd.static(1.3); setTimeout(() => Snd.scream(0.9, 0.9, 0.7), 300); },
    init() { return { n: cnv(160, 90) }; },
    draw(c, w, h, t, d) {
      const nx = d.n.getContext('2d'), im = nx.createImageData(160, 90); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } nx.putImageData(im, 0, 0);
      c.imageSmoothingEnabled = false; c.drawImage(d.n, 0, 0, w, h); c.imageSmoothingEnabled = true;
      const s = Math.min(w, h) * (0.24 + t * 0.12); c.globalAlpha = t < 0.15 ? 0.3 : 0.9;
      nunFace(c, w / 2 + rand(-8, 8), h / 2, s, { seed: 19, scream: t > 0.4 ? 1 : 0.2, pale: true }); c.globalAlpha = 1;
      glitch(c, w, h, 14, 90);
      c.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 2);
      const by = ((t * 3) % 1) * h; c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, by, w, h * 0.08);
      const fs = Math.max(18, Math.min(w, h) * 0.07); c.font = `bold ${fs}px monospace`; c.textAlign = 'center';
      if (Math.random() < 0.8) { c.fillStyle = 'rgba(255,0,60,.8)'; c.fillText('ОНА ВИДИТ ТЕБЯ', w / 2 - 3, h * 0.88); c.fillStyle = 'rgba(0,255,255,.7)'; c.fillText('ОНА ВИДИТ ТЕБЯ', w / 2 + 3, h * 0.88); c.fillStyle = '#fff'; c.fillText('ОНА ВИДИТ ТЕБЯ', w / 2, h * 0.88); }
      c.textAlign = 'left'; c.font = `${fs * 0.6}px monospace`; c.fillStyle = '#fff'; c.fillText('▶ PLAY   03:13', 24, fs);
    } },

  mouth: { dur: 1100, sound() { Snd.growl(1.1, 1.1); setTimeout(() => Snd.chomp(), 900); },
    init(w) { return { up: Array.from({ length: 11 }, () => rand(0.7, 1.3)), lo: Array.from({ length: 11 }, () => rand(0.7, 1.3)) }; },
    draw(c, w, h, t, d) {
      const open = t < 0.6 ? 1 : 1 - easeIn((t - 0.6) / 0.4), mid = h / 2, gap = open * h * 0.36 + 2;
      const tg = c.createRadialGradient(w / 2, mid, 0, w / 2, mid, h * 0.6); tg.addColorStop(0, '#000'); tg.addColorStop(0.5, '#2a0306'); tg.addColorStop(1, '#5a0a10'); c.fillStyle = tg; c.fillRect(0, 0, w, h);
      c.fillStyle = '#4a1016'; c.beginPath(); c.ellipse(w / 2, mid + gap * 0.6, w * 0.25, h * 0.08, 0, 0, 7); c.fill();
      const gum = '#6a141c', th = h * 0.16, n = 11, tw = w / n;
      c.fillStyle = gum; c.fillRect(0, 0, w, mid - gap); c.fillRect(0, mid + gap, w, h);
      for (let i = 0; i < n; i++) {
        const x = i * tw, s1 = d.up[i], s2 = d.lo[i];
        let g = c.createLinearGradient(0, mid - gap, 0, mid - gap + th * s1); g.addColorStop(0, '#7a6a4c'); g.addColorStop(1, '#d6c9a2'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 2, mid - gap); c.lineTo(x + tw / 2, mid - gap + th * s1); c.lineTo(x + tw - 2, mid - gap); c.fill();
        g = c.createLinearGradient(0, mid + gap, 0, mid + gap - th * s2); g.addColorStop(0, '#7a6a4c'); g.addColorStop(1, '#d6c9a2'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 2, mid + gap); c.lineTo(x + tw / 2, mid + gap - th * s2); c.lineTo(x + tw - 2, mid + gap); c.fill();
      }
      c.strokeStyle = 'rgba(200,190,170,.5)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const x = w * (0.2 + i * 0.15); c.beginPath(); c.moveTo(x, mid - gap + th * 0.5); c.quadraticCurveTo(x + 6, mid, x - 4, mid + gap - th * 0.5); c.stroke(); }
      if (t > 0.97) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); }
    } },

  strobe: { dur: 1300, sound() { [0, 260, 520, 780].forEach(ms => setTimeout(() => Snd.click(), ms)); setTimeout(() => Snd.scream(1.1, 1, 0.95), 1000); },
    draw(c, w, h, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      const ph = Math.min(4, Math.floor(t * 5)), lp = t * 5 - ph; if (lp > 0.4 && ph < 4) return;
      c.fillStyle = '#d8d4c8'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#5a5650'; c.lineWidth = 2; for (const [a, b] of [[0, 0], [w, 0], [0, h], [w, h]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(w / 2, h / 2); c.stroke(); }
      c.fillStyle = '#9a968c'; c.fillRect(w / 2 - w * 0.08, h / 2 - h * 0.12, w * 0.16, h * 0.24);
      if (ph < 4) { const sc = [0.22, 0.42, 0.7, 1.15][ph]; nunFigure(c, w / 2, h / 2 + h * 0.5 * sc, h * sc, { arms: true }); }
      else nunFace(c, w / 2, h / 2, Math.min(w, h) * 0.3, { seed: 51, scream: 1 });
    } },

  portrait: { dur: 1500, sound() { Snd.wail(1, 1); setTimeout(() => Snd.scream(1.1, 1, 0.85), 700); },
    draw(c, w, h, t) {
      c.fillStyle = '#100a06'; c.fillRect(0, 0, w, h);
      const z = Math.min(w, h) * 0.85 * (1 + easeIn(t) * 0.8), x = w / 2 - z / 2, y = h / 2 - z / 2;
      c.drawImage(portraitCv, x, y, z, z); const k = z / 330;
      if (t > 0.2) { c.fillStyle = '#000'; [147, 183].forEach(ex => { c.beginPath(); c.ellipse(x + ex * k, y + 145 * k, 12 * k, 10 * k * Math.min(1, (t - .2) * 5), 0, 0, 7); c.fill(); });
        c.strokeStyle = '#8a0a0c'; c.lineWidth = 4 * k; [147, 183].forEach(ex => { c.beginPath(); c.moveTo(x + ex * k, y + 152 * k); c.lineTo(x + ex * k + rand(-2, 2), y + (152 + (t - .2) * 220) * k); c.stroke(); }); }
      if (t > 0.5) { const p = (t - 0.5) * 2; c.globalAlpha = p; nunFace(c, w / 2, h / 2, Math.min(w, h) * (0.2 + p * 0.15), { seed: 61, scream: 1 }); c.globalAlpha = 1; glitch(c, w, h, 8); redwash(c, w, h, p * 0.25); }
    } },

  crawl: { dur: 1250, sound() { let k = 0; const iv = setInterval(() => { Snd.knock(1, 0.7, rand(-0.4, 0.4)); if (++k > 8) clearInterval(iv); }, 90); setTimeout(() => Snd.growl(0.6, 1), 300); setTimeout(() => Snd.scream(1, 0.9, 1.1), 900); },
    draw(c, w, h, t) {
      const g = c.createLinearGradient(0, h * 0.45, 0, h); g.addColorStop(0, '#000'); g.addColorStop(1, '#1a1612'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const z = 0.08 / Math.max(0.06, 1.02 - t), cx = w / 2 + Math.sin(t * 40) * 6 * z, cy = h * 0.55 + z * h * 0.12, u = Math.min(w, h) * z;
      if (t > 0.85) { nunFace(c, w / 2, h / 2, Math.min(w, h) * 0.38, { seed: 71, scream: 1, eyeH: 1.4 }); redwash(c, w, h, 0.25); glitch(c, w, h, 6); return; }
      c.strokeStyle = '#0a0809'; c.lineCap = 'round'; c.lineWidth = u * 0.12;
      const j = Math.sin(t * 60) * 0.25;
      for (const [sd, ph] of [[-1, 0], [1, 1], [-1, 1.5], [1, 0.5]]) { const k = Math.sin(t * 50 + ph * 3); c.beginPath(); c.moveTo(cx + sd * u * 0.2, cy); c.lineTo(cx + sd * u * (0.9 + k * 0.15), cy - u * (0.55 + j)); c.lineTo(cx + sd * u * (1.25 + k * 0.1), cy + u * 0.35); c.stroke(); }
      c.fillStyle = '#060506'; c.beginPath(); c.ellipse(cx, cy + u * 0.05, u * 0.55, u * 0.28, 0, 0, 7); c.fill();
      c.save(); c.translate(cx, cy - u * 0.05); c.rotate(Math.sin(t * 30) * 0.3); nunFace(c, 0, 0, u * 0.18, { seed: 81, scream: 0.8 }); c.restore();
    } },

  light: { dur: 1700, sound() { Snd.choirHit(); Snd.wail(1.2, 1.6); setTimeout(() => Snd.scream(0.8, 1.2, 1.3), 200); },
    init(w, h) { return { parts: Array.from({ length: 140 }, () => ({ a: rand(0, 7), v: rand(0.2, 1), s: rand(2, 9) })) }; },
    draw(c, w, h, t, d) {
      c.fillStyle = `rgb(${200 + t * 55 | 0},${190 + t * 65 | 0},${150 + t * 100 | 0})`; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) { const a = i / 30 * 7 + t; c.lineWidth = 3 + (i % 3) * 4; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a) * w, h / 2 + Math.sin(a) * w); c.stroke(); }
      c.globalAlpha = Math.max(0, 1 - t * 1.2); nunFace(c, w / 2, h / 2, Math.min(w, h) * 0.24, { seed: 91, scream: 1, pale: true }); c.globalAlpha = 1;
      c.fillStyle = '#2a2622'; const R = Math.min(w, h) * 0.6 * t; for (const p of d.parts) c.fillRect(w / 2 + Math.cos(p.a) * R * p.v, h / 2 + Math.sin(p.a) * R * p.v, p.s, p.s);
    } },
};

let lastScare = '';
function pickScare(pool) { const opts = pool.filter(k => k !== lastScare); return pick(opts.length ? opts : pool); }
let scareActive = false;
function screamer(kind, after) {
  if (scareActive) { after && after(); return; }
  kind = kind || pickScare(['face', 'mouth', 'crawl', 'vhs', 'eyes']); lastScare = kind;
  const S = SCARES[kind]; scareActive = true; G.scare = true; G.scares++; G.lastScare = G.time;
  S.sound();
  view.classList.remove('shake'); void view.offsetWidth; view.classList.add('shake');
  const dpr = Math.min(2, devicePixelRatio || 1); scv.width = innerWidth * dpr; scv.height = innerHeight * dpr; scv.style.display = 'block';
  const w = scv.width, h = scv.height, d = Object.assign({ seed: (Math.random() * 1e6 | 0) + 1, eyeH: rand(0.8, 1.4) }, S.init ? S.init(w, h) : {});
  const t0 = performance.now();
  (function fr() {
    const t = (performance.now() - t0) / S.dur;
    sctx.setTransform(1, 0, 0, 1, 0, 0); S.draw(sctx, w, h, Math.min(1, t), d);
    if (t < 1) requestAnimationFrame(fr); else { scv.style.display = 'none'; scareActive = false; G.scare = false; flicker(0.5); after && after(); }
  })();
}
function subliminal(kind) {
  if (scareActive) return; kind = kind || pick(['face', 'vhs', 'eyes', 'crawl']);
  G.scares++; G.lastScare = G.time; Snd.hit();
  scv.width = innerWidth; scv.height = innerHeight; scv.style.display = 'block';
  const S = SCARES[kind], d = Object.assign({ seed: (Math.random() * 1e5 | 0) + 1, eyeH: 1 }, S.init ? S.init(scv.width, scv.height) : {});
  sctx.setTransform(1, 0, 0, 1, 0, 0); S.draw(sctx, scv.width, scv.height, kind === 'eyes' ? 0.9 : 0.7, d);
  setTimeout(() => { if (!scareActive) scv.style.display = 'none'; }, 150); flicker(0.4);
}
