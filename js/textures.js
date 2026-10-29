'use strict';
/* Процедурные текстуры стен (128×128), полов и спрайтов. Ничего не грузится из сети. */
const TS = 128;
const rgb = (c, s = 1) => `rgb(${clamp(c[0] * s, 0, 255) | 0},${clamp(c[1] * s, 0, 255) | 0},${clamp(c[2] * s, 0, 255) | 0})`;

function texFrom(c, amt = 14, emit = null) {
  const x = c.getContext('2d'); const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
  const e = emit ? new Float32Array(c.width * c.height) : null;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    if (d[i + 3] < 10) continue;
    const n = (Math.random() - 0.5) * amt;
    d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    if (e) e[p] = emit(d[i], d[i + 1], d[i + 2], p % c.width, (p / c.width) | 0);
  }
  return { w: c.width, h: c.height, d, e };
}
function cracks(x, n, col = 'rgba(0,0,0,.55)', len = 12) {
  x.strokeStyle = col; x.lineWidth = 1;
  for (let i = 0; i < n; i++) { let a = rand(0, 128), b = rand(0, 128); x.beginPath(); x.moveTo(a, b); for (let k = 0; k < 5; k++) { a += rand(-len, len); b += rand(-len, len); x.lineTo(a, b); } x.stroke(); }
}
function speckle(x, n, w = 128, h = 128) {
  for (let i = 0; i < n; i++) { x.fillStyle = `rgba(0,0,0,${rand(.06, .28)})`; x.beginPath(); x.arc(rand(0, w), rand(0, h), rand(.4, 2.2), 0, 7); x.fill(); }
  for (let i = 0; i < n / 3; i++) { x.fillStyle = `rgba(255,240,220,${rand(.02, .07)})`; x.fillRect(rand(0, w), rand(0, h), rand(1, 3), 1); }
}

/* ---------- стены ---------- */
function stoneC(base = [74, 68, 62], stain = 0, rows = 4) {
  const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#0e0b09'; x.fillRect(0, 0, 128, 128);
  const rh = 128 / rows;
  for (let r = 0; r < rows; r++) {
    const by = r * rh, ws = []; let sum = 0;
    while (sum < 128) { let w = rand(34, 60); if (128 - sum - w < 26) w = 128 - sum; ws.push(w); sum += w; }
    let px = rand(0, 60);
    for (const bw of ws) {
      const s = rand(.7, 1.12);
      for (const ox of [px, px - 128]) {
        const g = x.createLinearGradient(ox, by, ox + bw * 0.6, by + rh); g.addColorStop(0, rgb(base, s * 1.25)); g.addColorStop(1, rgb(base, s * 0.68));
        x.fillStyle = g; x.beginPath(); x.roundRect(ox + 2, by + 2, bw - 4, rh - 4, 4); x.fill();
        x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(ox + 4, by + 3, bw - 8, 2);
        x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(ox + 4, by + rh - 5, bw - 8, 3);
      }
      px += bw;
    }
  }
  speckle(x, 170); cracks(x, 3);
  for (let i = 0; i < stain; i++) { const sx = rand(0, 124), g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(20,34,16,.65)'); g.addColorStop(1, 'rgba(20,34,16,0)'); x.fillStyle = g; x.fillRect(sx, 0, rand(3, 9), rand(40, 128)); }
  return c;
}
function woodC() {
  const c = cnv(128, 128), x = c.getContext('2d');
  for (let i = 0; i < 8; i++) {
    const s = rand(.72, 1.08); x.fillStyle = rgb([64, 41, 26], s); x.fillRect(i * 16, 0, 16, 128);
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1;
    for (let k = 0; k < 5; k++) { const ox = i * 16 + rand(2, 14); x.beginPath(); x.moveTo(ox, 0); for (let y = 0; y <= 128; y += 8) x.lineTo(ox + Math.sin(y * 0.08 + k) * 1.5, y); x.stroke(); }
    if (Math.random() < 0.5) { x.fillStyle = 'rgba(20,10,5,.6)'; x.beginPath(); x.ellipse(i * 16 + 8, rand(10, 118), 2.5, 4, 0, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(i * 16, 0, 1.5, 128);
  }
  x.fillStyle = '#2a1a10'; x.fillRect(0, 58, 128, 10); x.fillStyle = 'rgba(255,220,180,.08)'; x.fillRect(0, 58, 128, 2); x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, 66, 128, 2);
  x.fillStyle = '#4a4440'; for (let i = 0; i < 8; i++) { x.fillRect(i * 16 + 7, 61, 2, 2); }
  return c;
}
function doorC(kind) {
  const c = stoneC(), x = c.getContext('2d');
  x.fillStyle = '#0a0705'; x.fillRect(10, 4, 108, 124);
  for (let i = 0; i < 6; i++) { const g = x.createLinearGradient(14 + i * 17, 0, 30 + i * 17, 0); const s = rand(.8, 1.05); g.addColorStop(0, rgb([80, 52, 32], s)); g.addColorStop(1, rgb([52, 33, 20], s)); x.fillStyle = g; x.fillRect(14 + i * 17, 8, 16, 120); }
  x.strokeStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 24; i++) { const ox = rand(14, 114); x.beginPath(); x.moveTo(ox, 8); x.lineTo(ox + rand(-2, 2), 128); x.stroke(); }
  for (const yy of [24, 96]) { x.fillStyle = '#2b2826'; x.fillRect(12, yy, 104, 8); x.fillStyle = '#5c564f'; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(18 + i * 15, yy + 4, 1.8, 0, 7); x.fill(); } }
  x.strokeStyle = '#6a625a'; x.lineWidth = 3; x.beginPath(); x.arc(96, 68, 8, 0, 7); x.stroke();
  if (kind === 'lock') { x.fillStyle = '#8a7340'; x.fillRect(54, 60, 20, 18); x.strokeStyle = '#8a7340'; x.lineWidth = 4; x.beginPath(); x.arc(64, 60, 8, Math.PI, 0); x.stroke(); x.fillStyle = '#1a1208'; x.fillRect(62, 66, 4, 8); }
  if (kind === 'code') { x.fillStyle = '#18181a'; x.fillRect(44, 44, 40, 40); x.strokeStyle = '#5a5a60'; x.lineWidth = 2; x.strokeRect(45, 45, 38, 38); x.fillStyle = '#b22a1e'; x.font = 'bold 16px monospace'; x.fillText('_ _ _', 48, 60); x.fillStyle = '#555'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) x.fillRect(50 + i * 10, 68 + j * 8, 6, 4); }
  if (kind === 'entr') { x.fillStyle = '#000'; x.fillRect(62, 8, 4, 120); x.strokeStyle = '#6a625a'; x.beginPath(); x.arc(52, 68, 6, 0, 7); x.arc(76, 68, 6, 0, 7); x.stroke(); }
  if (kind === 'chap') { x.strokeStyle = '#3d3a37'; x.lineWidth = 6; x.beginPath(); x.moveTo(12, 14); x.lineTo(116, 118); x.moveTo(116, 14); x.lineTo(12, 118); x.stroke(); x.strokeStyle = '#7a756d'; x.lineWidth = 2; for (let i = 0; i < 12; i++) { const t = i / 12; x.strokeRect(12 + t * 104 - 3, 14 + t * 104 - 2, 6, 4); x.strokeRect(116 - t * 104 - 3, 14 + t * 104 - 2, 6, 4); } x.fillStyle = '#8a1010'; x.beginPath(); x.arc(64, 66, 9, 0, 7); x.fill(); }
  return c;
}
function ironDoorC() {
  const c = stoneC(), x = c.getContext('2d');
  const g = x.createLinearGradient(10, 0, 118, 0); g.addColorStop(0, '#2a2a2c'); g.addColorStop(0.5, '#45454a'); g.addColorStop(1, '#202022'); x.fillStyle = g; x.fillRect(10, 4, 108, 124);
  x.fillStyle = '#18181a'; for (const yy of [20, 64, 108]) x.fillRect(10, yy, 108, 4);
  x.fillStyle = '#6a6a70'; for (let i = 0; i < 9; i++) for (const yy of [16, 60, 104]) { x.beginPath(); x.arc(16 + i * 12, yy, 1.8, 0, 7); x.fill(); }
  x.fillStyle = '#8a7340'; x.beginPath(); x.moveTo(64, 30); x.quadraticCurveTo(44, 34, 46, 56); x.lineTo(42, 60); x.lineTo(86, 60); x.lineTo(82, 56); x.quadraticCurveTo(84, 34, 64, 30); x.fill(); x.beginPath(); x.arc(64, 62, 3, 0, 7); x.fill();
  x.fillStyle = '#8a7340'; x.fillRect(56, 80, 16, 14); x.strokeStyle = '#8a7340'; x.lineWidth = 3; x.beginPath(); x.arc(64, 80, 6, Math.PI, 0); x.stroke();
  return c;
}
function grateC() {
  const c = cnv(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 80, 4, 64, 80, 80); g.addColorStop(0, '#1c1714'); g.addColorStop(1, '#040303'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { const gg = x.createLinearGradient(6 + i * 16, 0, 12 + i * 16, 0); gg.addColorStop(0, '#2a2420'); gg.addColorStop(0.5, '#5a4e44'); gg.addColorStop(1, '#2a2420'); x.fillStyle = gg; x.fillRect(6 + i * 16, 0, 6, 128); x.fillStyle = '#6a3a20'; x.fillRect(6 + i * 16, rand(0, 120), 6, rand(4, 12)); }
  x.fillStyle = '#4a4038'; x.fillRect(0, 16, 128, 7); x.fillRect(0, 104, 128, 7); x.fillStyle = '#8a7340'; x.fillRect(56, 56, 16, 16);
  return c;
}
function crossC() { const c = stoneC([70, 64, 60]), x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(56, 18, 16, 94); x.fillRect(34, 40, 60, 14); x.fillStyle = 'rgba(255,240,220,.1)'; x.fillRect(56, 18, 2, 94); x.fillRect(34, 40, 60, 2); return c; }
function frescoC() {
  const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#6d6250'; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#4a3a2a'; x.beginPath(); x.moveTo(16, 128); x.lineTo(16, 40); x.quadraticCurveTo(64, -12, 112, 40); x.lineTo(112, 128); x.fill();
  const hg = x.createRadialGradient(64, 44, 4, 64, 44, 26); hg.addColorStop(0, '#c9a65a'); hg.addColorStop(1, '#8c7a4a'); x.fillStyle = hg; x.beginPath(); x.arc(64, 44, 24, 0, 7); x.fill();
  x.fillStyle = '#16110e'; x.beginPath(); x.moveTo(64, 28); x.bezierCurveTo(40, 30, 36, 60, 36, 80); x.lineTo(28, 128); x.lineTo(100, 128); x.lineTo(92, 80); x.bezierCurveTo(92, 60, 88, 30, 64, 28); x.fill();
  x.fillStyle = '#c9c1ad'; x.beginPath(); x.ellipse(64, 50, 14, 17, 0, 0, 7); x.fill(); x.fillStyle = '#a49a82'; x.beginPath(); x.ellipse(64, 52, 10, 13, 0, 0, 7); x.fill();
  x.fillStyle = '#000'; x.fillRect(56, 46, 6, 6); x.fillRect(66, 46, 6, 6);
  x.strokeStyle = '#000'; x.lineWidth = 1.2; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(59 + rand(-2, 2), 44); x.lineTo(57 + rand(-8, 8), 54 + rand(0, 12)); x.stroke(); x.beginPath(); x.moveTo(69, 44); x.lineTo(69 + rand(-8, 8), 54 + rand(0, 12)); x.stroke(); }
  x.strokeStyle = '#6a0a0a'; x.lineWidth = 2; x.beginPath(); x.moveTo(58, 53); x.lineTo(57, 70); x.moveTo(70, 53); x.lineTo(71, 74); x.stroke();
  cracks(x, 10, 'rgba(20,10,5,.6)', 16);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(40,30,20,${rand(.1, .4)})`; x.fillRect(rand(0, 128), rand(0, 128), rand(2, 10), rand(2, 10)); }
  return c;
}
function writeC(lines, base) {
  const c = base || stoneC(), x = c.getContext('2d'); x.fillStyle = '#7a0b0d'; x.textAlign = 'center';
  lines.forEach(l => { x.font = `${l.s}px Neucha, cursive`; x.fillText(l.t, 64 + rand(-2, 2), l.y); });
  for (let i = 0; i < 16; i++) { const px = rand(16, 112), py = rand(50, 100); const g = x.createLinearGradient(0, py, 0, py + 30); g.addColorStop(0, 'rgba(122,11,13,.9)'); g.addColorStop(1, 'rgba(122,11,13,0)'); x.fillStyle = g; x.fillRect(px, py, 2, rand(8, 30)); }
  return c;
}
function tileC(top, low, half) {
  const c = cnv(128, 128), x = c.getContext('2d');
  if (half) { x.fillStyle = rgb(top); x.fillRect(0, 0, 128, 60); for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(60,50,30,${rand(.05, .2)})`; x.fillRect(rand(0, 128), rand(0, 60), rand(2, 12), rand(2, 8)); } x.fillStyle = '#3a3a30'; x.fillRect(0, 58, 128, 6); }
  const y0 = half ? 64 : 0;
  for (let y = y0; y < 128; y += 16) for (let xx = 0; xx < 128; xx += 16) { const s = rand(.85, 1.05); x.fillStyle = rgb(low, s); x.fillRect(xx + 1, y + 1, 14, 14); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(xx + 1, y + 1, 14, 2); if (Math.random() < 0.08) { x.fillStyle = '#1a1612'; x.fillRect(xx + 1, y + 1, 14, 14); } }
  for (let i = 0; i < 5; i++) { const px = rand(0, 128), g = x.createLinearGradient(0, y0, 0, 128); g.addColorStop(0, 'rgba(70,40,20,.5)'); g.addColorStop(1, 'rgba(70,40,20,0)'); x.fillStyle = g; x.fillRect(px, y0, rand(2, 8), 128); }
  if (Math.random() < 0.6) { x.fillStyle = 'rgba(110,10,12,.7)'; x.beginPath(); x.ellipse(rand(30, 100), rand(70, 110), rand(4, 10), rand(3, 8), 0, 0, 7); x.fill(); }
  cracks(x, 4); return c;
}
function shelfC() {
  const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#0d0907'; x.fillRect(0, 0, 128, 128);
  const pal = [[96, 22, 18], [30, 52, 36], [70, 48, 26], [28, 34, 62], [80, 70, 50], [52, 22, 46], [40, 30, 22]];
  for (let r = 0; r < 4; r++) {
    const by = r * 32; let px = 4;
    while (px < 120) {
      const bw = rand(5, 11), bh = rand(18, 27), col = pick(pal), s = rand(.7, 1.1);
      if (Math.random() < 0.1) { px += bw; continue; }
      const lean = Math.random() < 0.12;
      x.save(); x.translate(px, by + 30); if (lean) x.rotate(-0.25);
      const g = x.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, rgb(col, s * 1.3)); g.addColorStop(1, rgb(col, s * 0.6)); x.fillStyle = g; x.fillRect(0, -bh, bw, bh);
      x.fillStyle = 'rgba(200,170,90,.45)'; x.fillRect(0, -bh + 4, bw, 1.5); x.fillRect(0, -6, bw, 1.5); x.restore();
      px += bw + rand(0, 1.5);
    }
    const g = x.createLinearGradient(0, by + 28, 0, by + 34); g.addColorStop(0, '#5a3a22'); g.addColorStop(1, '#22150c'); x.fillStyle = g; x.fillRect(0, by + 28, 128, 5);
  }
  x.fillStyle = '#3a2516'; x.fillRect(0, 0, 4, 128); x.fillRect(124, 0, 4, 128);
  x.strokeStyle = 'rgba(220,220,220,.18)'; x.lineWidth = 0.6; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(4, 0); x.lineTo(4 + i * 5, 24 - i * 3); x.stroke(); }
  return c;
}
function brickC() {
  const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#1a0f0b'; x.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 9; r++) for (let k = -1; k < 5; k++) { const bx = k * 32 + (r % 2) * 16, by = r * 14.2, s = rand(.7, 1.15); const g = x.createLinearGradient(bx, by, bx, by + 13); g.addColorStop(0, rgb([110, 52, 36], s * 1.15)); g.addColorStop(1, rgb([110, 52, 36], s * 0.7)); x.fillStyle = g; x.fillRect(bx + 1, by + 1, 30, 12); }
  speckle(x, 120); cracks(x, 2); return c;
}
function glassC() {
  const c = stoneC([66, 62, 58]), x = c.getContext('2d');
  x.save(); x.beginPath(); x.moveTo(26, 124); x.lineTo(26, 46); x.quadraticCurveTo(64, -6, 102, 46); x.lineTo(102, 124); x.closePath(); x.fillStyle = '#000'; x.fill(); x.clip();
  const pal = ['#9a1414', '#1d3486', '#a57a18', '#1c6a40', '#5a1a6a', '#b0401a'];
  for (let y = 0; y < 128; y += 14) for (let xx = 26; xx < 104; xx += 13) { x.fillStyle = pick(pal); x.fillRect(xx, y, 13, 14); }
  x.fillStyle = '#d8b050'; x.beginPath(); x.arc(64, 52, 13, 0, 7); x.fill();
  x.fillStyle = '#0c0a0a'; x.beginPath(); x.moveTo(64, 44); x.bezierCurveTo(52, 46, 50, 62, 50, 74); x.lineTo(44, 124); x.lineTo(84, 124); x.lineTo(78, 74); x.bezierCurveTo(78, 62, 76, 46, 64, 44); x.fill();
  x.fillStyle = '#e4dccb'; x.beginPath(); x.ellipse(64, 54, 6, 7, 0, 0, 7); x.fill();
  x.strokeStyle = '#080606'; x.lineWidth = 2.2; for (let y = 0; y < 128; y += 14) { x.beginPath(); x.moveTo(26, y); x.lineTo(102, y); x.stroke(); } for (let xx = 26; xx < 104; xx += 13) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, 128); x.stroke(); }
  x.restore();
  x.strokeStyle = '#2a2622'; x.lineWidth = 5; x.beginPath(); x.moveTo(26, 124); x.lineTo(26, 46); x.quadraticCurveTo(64, -6, 102, 46); x.lineTo(102, 124); x.stroke();
  return c;
}
function ossC() {
  const c = stoneC([56, 52, 46], 2), x = c.getContext('2d');
  for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
    const cx = 22 + k * 42, cy = 30 + r * 62;
    x.fillStyle = '#060505'; x.beginPath(); x.moveTo(cx - 16, cy + 22); x.lineTo(cx - 16, cy - 8); x.arc(cx, cy - 8, 16, Math.PI, 0); x.lineTo(cx + 16, cy + 22); x.fill();
    const g = x.createRadialGradient(cx - 3, cy, 2, cx, cy + 2, 12); g.addColorStop(0, '#d8cfb8'); g.addColorStop(1, '#7a705e'); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy + 2, 10, 11, 0, 0, 7); x.fill(); x.fillRect(cx - 6, cy + 10, 12, 7);
    x.fillStyle = '#100c0a'; x.beginPath(); x.ellipse(cx - 4, cy + 2, 3, 3.6, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx + 4, cy + 2, 3, 3.6, 0, 0, 7); x.fill(); x.fillRect(cx - 1, cy + 7, 2, 3);
  }
  return c;
}

/* ---------- полы и потолок ---------- */
function floorStone() {
  const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#0f0c0a'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const s = rand(.8, 1.1); const g = x.createLinearGradient(i * 64, j * 64, i * 64 + 64, j * 64 + 64); g.addColorStop(0, rgb([58, 52, 46], s * 1.1)); g.addColorStop(1, rgb([58, 52, 46], s * 0.8)); x.fillStyle = g; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); }
  speckle(x, 140); cracks(x, 4);
  return c;
}
function floorTile() { const c = cnv(128, 128), x = c.getContext('2d'); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? rgb([150, 146, 132], rand(.7, .9)) : rgb([34, 32, 30], rand(.8, 1.1)); x.fillRect(i * 16, j * 16, 16, 16); } x.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i <= 8; i++) { x.fillRect(i * 16, 0, 1, 128); x.fillRect(0, i * 16, 128, 1); } for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(50,30,15,${rand(.1, .35)})`; x.beginPath(); x.ellipse(rand(0, 128), rand(0, 128), rand(3, 14), rand(2, 9), 0, 0, 7); x.fill(); } cracks(x, 3); return c; }
function floorWood() { const c = cnv(128, 128), x = c.getContext('2d'); for (let i = 0; i < 8; i++) { const s = rand(.7, 1.05); x.fillStyle = rgb([58, 38, 24], s); x.fillRect(0, i * 16, 128, 16); x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, i * 16, 128, 1.5); const cut = rand(10, 118); x.fillRect(cut, i * 16, 1.5, 16); x.strokeStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 3; k++) { const oy = i * 16 + rand(3, 13); x.beginPath(); x.moveTo(0, oy); for (let xx = 0; xx <= 128; xx += 8) x.lineTo(xx, oy + Math.sin(xx * 0.1 + k) * 1.2); x.stroke(); } } speckle(x, 60); return c; }
function floorDirt() { const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#2a2018'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${rand(10, 70) | 0},${rand(8, 50) | 0},${rand(5, 30) | 0},${rand(.2, .6)})`; x.beginPath(); x.arc(rand(0, 128), rand(0, 128), rand(0.5, 3), 0, 7); x.fill(); } for (let i = 0; i < 5; i++) { x.fillStyle = '#9a917c'; x.save(); x.translate(rand(10, 118), rand(10, 118)); x.rotate(rand(0, 3)); x.fillRect(-6, -1, 12, 2.5); x.beginPath(); x.arc(-6, 0, 2, 0, 7); x.arc(6, 0, 2, 0, 7); x.fill(); x.restore(); } return c; }
function ceilC() { const c = cnv(128, 128), x = c.getContext('2d'); x.fillStyle = '#15100c'; x.fillRect(0, 0, 128, 128); for (const y of [0, 64]) { const g = x.createLinearGradient(0, y, 0, y + 22); g.addColorStop(0, '#3a2a1e'); g.addColorStop(1, '#1a120c'); x.fillStyle = g; x.fillRect(0, y, 128, 22); } x.strokeStyle = 'rgba(210,210,210,.07)'; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(rand(0, 128), rand(22, 64)); x.lineTo(rand(0, 128), rand(22, 64)); x.stroke(); } speckle(x, 40); return c; }

/* ---------- спрайты ---------- */
function spr(w, h, fn, amt = 8) { const c = cnv(w, h), x = c.getContext('2d'); fn(x, c); return texFrom(c, amt); }
function ell(x, cx, cy, rx, ry, rot = 0) { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, 7); x.fill(); }

function lectern(x) { x.scale(1.5, 1.5); x.fillStyle = '#3a2516'; x.fillRect(14, 18, 4, 24); x.fillRect(8, 40, 16, 4); x.beginPath(); x.moveTo(4, 20); x.lineTo(28, 12); x.lineTo(28, 18); x.lineTo(4, 24); x.fill(); x.fillStyle = '#efe4c8'; x.beginPath(); x.moveTo(7, 18); x.lineTo(25, 11); x.lineTo(25, 15); x.lineTo(7, 21); x.fill(); x.fillStyle = '#6a3a22'; x.fillRect(10, 16, 10, 0.8); x.fillRect(11, 17.5, 8, 0.8); }
function fontS(x, key) { x.scale(1.5, 1.5); x.fillStyle = '#5a544c'; x.fillRect(18, 22, 12, 14); x.fillRect(12, 34, 24, 6); ell(x, 24, 18, 20, 7); x.fillStyle = '#3b3631'; x.beginPath(); x.ellipse(24, 22, 18, 5, 0, 0, Math.PI); x.fill(); x.fillStyle = '#0a1216'; ell(x, 24, 16, 16, 4.5); x.fillStyle = 'rgba(120,150,160,.4)'; ell(x, 20, 15, 6, 1); if (key) { x.fillStyle = '#c9a64a'; x.fillRect(18, 14, 10, 2); x.beginPath(); x.arc(30, 15, 3, 0, 7); x.fill(); } }
function candleS(x, lit, fr) { x.scale(1.2, 1.15); x.fillStyle = '#2a2522'; x.fillRect(9, 22, 2, 34); x.fillRect(3, 54, 14, 2); x.fillRect(5, 20, 10, 3); const g = x.createLinearGradient(7, 0, 13, 0); g.addColorStop(0, '#f2e8cf'); g.addColorStop(1, '#a89c80'); x.fillStyle = g; x.fillRect(7, 9, 6, 12); x.fillStyle = '#e8dcc0'; x.fillRect(6.5, 14, 1.5, 4); if (lit) { x.fillStyle = '#ff9a30'; ell(x, 10, 5 + (fr ? .5 : 0), 2.6, 4.8 + (fr ? .6 : 0)); x.fillStyle = '#fff3c0'; ell(x, 10, 6, 1.1, 2.2); } else { x.fillStyle = '#111'; x.fillRect(9.5, 6, 1, 3); } }
function altarS(x, ros) { x.scale(1.15, 1.15); x.fillStyle = '#2b241f'; x.fillRect(4, 12, 48, 24); x.fillStyle = '#d6cfbd'; x.fillRect(2, 8, 52, 8); x.fillRect(10, 16, 36, 14); x.fillStyle = '#7a0b0d'; x.fillRect(25, 16, 6, 14); x.fillStyle = '#b89a50'; x.fillRect(27, 18, 2, 8); x.fillRect(25, 20, 6, 2); if (ros) { x.strokeStyle = '#efe6cf'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(28, 8, 9, 3, 0, 0, 7); x.stroke(); x.fillStyle = '#efe6cf'; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; x.fillRect(28 + Math.cos(a) * 9 - 1, 8 + Math.sin(a) * 3 - 1, 2, 2); } x.fillRect(36, 9, 1.5, 6); x.fillRect(34.5, 11, 4.5, 1.5); } }
function coffinS(x) { x.scale(1.25, 1.25); const g = x.createLinearGradient(0, 8, 0, 34); g.addColorStop(0, '#5a554e'); g.addColorStop(1, '#2a2622'); x.fillStyle = g; x.beginPath(); x.moveTo(4, 14); x.lineTo(60, 14); x.lineTo(56, 34); x.lineTo(8, 34); x.fill(); x.fillStyle = '#6a645c'; x.beginPath(); x.moveTo(2, 8); x.lineTo(62, 8); x.lineTo(60, 15); x.lineTo(4, 15); x.fill(); x.fillStyle = '#211e1b'; x.fillRect(30, 9, 4, 5); x.fillRect(26, 10, 12, 2); x.strokeStyle = '#1a1715'; x.beginPath(); x.moveTo(10, 20); x.lineTo(20, 30); x.moveTo(44, 18); x.lineTo(50, 28); x.stroke(); x.fillStyle = '#b8ae98'; x.font = '5px serif'; x.fillText('AGRIPPINA', 18, 26); }
function crossInvS(x) { x.scale(1.4, 1.4); x.fillStyle = '#2a2420'; x.fillRect(10, 8, 4, 54); x.fillRect(2, 44, 20, 4); x.fillRect(4, 60, 16, 4); x.fillStyle = '#b8ab92'; x.fillRect(11, 28, 2, 10); }
function bonesS(x) { x.scale(1.5, 1.5); x.fillStyle = '#c4baa2'; x.beginPath(); x.arc(10, 8, 5, 0, 7); x.fill(); x.fillStyle = '#000'; x.fillRect(7, 6, 2, 2); x.fillRect(11, 6, 2, 2); x.fillStyle = '#c4baa2'; x.fillRect(16, 10, 20, 2); x.fillRect(20, 7, 2, 7); x.fillRect(26, 12, 12, 2); }
function benchS(x) { x.scale(1.4, 1.4); x.fillStyle = '#3a2516'; x.fillRect(0, 4, 56, 5); x.fillRect(4, 9, 3, 11); x.fillRect(49, 9, 3, 11); x.fillStyle = 'rgba(255,220,180,.15)'; x.fillRect(0, 4, 56, 1); }
function tableS(x) { x.scale(1.3, 1.3); x.fillStyle = '#3a2516'; x.fillRect(0, 6, 60, 5); x.fillRect(4, 11, 3, 10); x.fillRect(53, 11, 3, 10); x.fillStyle = '#d6cdb8'; ell(x, 12, 5, 4, 1.4); ell(x, 30, 5, 4, 1.4); ell(x, 46, 5, 4, 1.4); x.fillStyle = '#6a6a70'; x.fillRect(20, 1, 3, 5); x.fillRect(38, 2, 6, 3); }
function chairS(x) { x.scale(1.4, 1.4); x.fillStyle = '#3a2516'; x.fillRect(4, 2, 3, 34); x.fillRect(4, 18, 18, 3); x.fillRect(19, 18, 3, 18); x.fillRect(4, 8, 18, 2); }
function batteryS(x) { const g = x.createLinearGradient(6, 0, 18, 0); g.addColorStop(0, '#1d2a1a'); g.addColorStop(0.5, '#4e6a3a'); g.addColorStop(1, '#1d2a1a'); x.fillStyle = g; x.fillRect(6, 4, 12, 18); x.fillStyle = '#c8b46a'; x.fillRect(9, 2, 6, 3); x.fillStyle = '#d8d0b0'; x.fillRect(6, 10, 12, 4); x.strokeStyle = '#e2d27a'; x.lineWidth = 1; x.strokeRect(5.5, 3.5, 13, 19); }
function statueS(x, look) {
  const g = x.createLinearGradient(0, 0, 48, 0); g.addColorStop(0, '#4c4a46'); g.addColorStop(0.5, '#8a867e'); g.addColorStop(1, '#3a3834'); x.fillStyle = g;
  x.fillRect(8, 100, 32, 12); x.beginPath(); x.moveTo(24, 22); x.bezierCurveTo(10, 24, 10, 46, 12, 56); x.lineTo(8, 100); x.lineTo(40, 100); x.lineTo(36, 56); x.bezierCurveTo(38, 46, 38, 24, 24, 22); x.fill();
  x.fillStyle = '#6a6760'; ell(x, look ? 22 : 24, look ? 20 : 22, 9, 11, look ? -0.3 : 0.25);
  x.fillStyle = '#9a958c'; ell(x, look ? 22 : 25, look ? 21 : 24, 6, 7.5, look ? -0.3 : 0.25);
  if (look) { x.fillStyle = '#000'; ell(x, 19.5, 19.5, 1.8, 2.2); ell(x, 24.5, 19.5, 1.8, 2.2); x.fillStyle = '#d02010'; x.fillRect(19, 19, 1, 1); x.fillRect(24, 19, 1, 1); x.fillStyle = '#000'; ell(x, 22, 26, 1.6, 2.5); }
  else { x.strokeStyle = '#3a3834'; x.lineWidth = 1; x.beginPath(); x.moveTo(21, 23); x.lineTo(24, 24); x.moveTo(27, 24); x.lineTo(30, 25); x.stroke(); }
  x.fillStyle = '#7a776f'; x.beginPath(); x.moveTo(24, 40); x.lineTo(20, 54); x.lineTo(28, 54); x.fill();
  x.fillStyle = 'rgba(20,35,15,.5)'; x.fillRect(12, 60, 4, 40); x.fillRect(30, 30, 3, 30);
}
function wardrobeS(x) {
  const g = x.createLinearGradient(0, 0, 52, 0); g.addColorStop(0, '#24170e'); g.addColorStop(0.5, '#4a3020'); g.addColorStop(1, '#1e130b'); x.fillStyle = g; x.fillRect(2, 4, 48, 100);
  x.fillStyle = '#5a3a24'; x.fillRect(0, 0, 52, 6); x.fillStyle = '#0a0604'; x.fillRect(25, 8, 2, 92);
  for (let y = 14; y < 92; y += 6) { x.fillStyle = '#100a06'; x.fillRect(6, y, 17, 3); x.fillRect(29, y, 17, 3); }
  x.fillStyle = '#9a8a5a'; x.fillRect(21, 52, 2, 6); x.fillRect(29, 52, 2, 6);
}
function cupS(x, open) {
  const g = x.createLinearGradient(0, 0, 44, 0); g.addColorStop(0, '#2a1c10'); g.addColorStop(0.5, '#5a3c26'); g.addColorStop(1, '#24170d'); x.fillStyle = g; x.fillRect(2, 4, 40, 56);
  x.fillStyle = '#6a4a30'; x.fillRect(0, 0, 44, 5);
  if (open) { x.fillStyle = '#050302'; x.fillRect(6, 9, 32, 46); x.fillStyle = '#3a2516'; x.fillRect(6, 30, 32, 3); x.fillStyle = '#4a3020'; x.fillRect(-2, 9, 8, 46); x.fillRect(38, 9, 8, 46); }
  else { x.fillStyle = '#100a06'; x.fillRect(21, 9, 2, 46); x.strokeStyle = '#1a1009'; x.lineWidth = 2; x.strokeRect(7, 12, 12, 40); x.strokeRect(25, 12, 12, 40); x.fillStyle = '#9a8a5a'; x.fillRect(18, 30, 2, 4); x.fillRect(24, 30, 2, 4); }
}
function deskS(x, done) {
  x.scale(1.2, 1.2); x.fillStyle = '#3a2516'; x.fillRect(0, 12, 56, 5); x.fillRect(3, 17, 4, 14); x.fillRect(49, 17, 4, 14); x.fillStyle = '#2a1a0e'; x.fillRect(8, 17, 16, 9);
  if (done) { x.fillStyle = '#6a4a20'; x.fillRect(18, -2, 20, 15); x.fillStyle = '#b39a74'; x.fillRect(20, 0, 16, 11); x.fillStyle = '#2a1e14'; ell(x, 28, 5, 4, 5); x.fillStyle = '#d8ccb0'; ell(x, 28, 5.5, 2.5, 3); }
  else { x.fillStyle = '#b39a74'; for (let i = 0; i < 6; i++) { x.save(); x.translate(10 + i * 7, 10); x.rotate(rand(-.6, .6)); x.fillRect(-3, -2, 6, 4); x.restore(); } x.fillStyle = '#6a4a20'; x.fillRect(30, 8, 14, 3); }
}
function bedS(x, body) {
  x.scale(1.2, 1.2); x.strokeStyle = '#3a3a3e'; x.lineWidth = 2; x.strokeRect(2, 6, 4, 22); x.strokeRect(48, 12, 3, 16); x.fillStyle = '#3a3a3e'; x.fillRect(2, 18, 50, 3);
  x.fillStyle = '#b8b2a2'; x.fillRect(5, 12, 45, 7); x.fillStyle = '#d0cabb'; x.fillRect(6, 10, 8, 5);
  if (body) { const g = x.createLinearGradient(0, 2, 0, 18); g.addColorStop(0, '#d8d2c2'); g.addColorStop(1, '#8a8474'); x.fillStyle = g; x.beginPath(); x.moveTo(6, 14); x.quadraticCurveTo(10, 2, 16, 6); x.quadraticCurveTo(30, 6, 48, 10); x.lineTo(50, 18); x.lineTo(6, 18); x.fill(); x.fillStyle = 'rgba(110,10,12,.7)'; ell(x, 24, 15, 5, 2); }
}
function bellsS(x) {
  x.fillStyle = '#1a120c'; x.fillRect(0, 0, 56, 6);
  [8, 21, 35, 48].forEach((rx, i) => { x.strokeStyle = '#8a7650'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(rx, 4); for (let y = 4; y < 104; y += 6) x.lineTo(rx + Math.sin(y * 0.2 + i) * 0.8, y); x.stroke(); x.fillStyle = '#6a5838'; ell(x, rx, 104, 3, 5); x.fillStyle = '#d8ccb0'; x.font = '7px serif'; x.textAlign = 'center'; x.fillText(['I', 'II', 'III', 'IV'][i], rx, 116); });
}
function stoveS(x) { x.scale(1.1, 1.1); const g = x.createLinearGradient(0, 0, 48, 0); g.addColorStop(0, '#1a1a1a'); g.addColorStop(0.5, '#3a3836'); g.addColorStop(1, '#151515'); x.fillStyle = g; x.fillRect(2, 10, 44, 30); x.fillStyle = '#0a0a0a'; x.fillRect(10, 20, 28, 14); x.fillStyle = 'rgba(200,60,20,.4)'; x.fillRect(12, 28, 24, 5); x.fillStyle = '#2a2826'; x.fillRect(30, 0, 6, 10); x.fillStyle = '#4a4440'; ell(x, 14, 8, 8, 3); }
function ghostS(x, scream) {
  const g = x.createLinearGradient(0, 20, 0, 192); g.addColorStop(0, '#171317'); g.addColorStop(1, '#040304'); x.fillStyle = g;
  x.beginPath(); x.moveTo(48, 12); x.bezierCurveTo(20, 16, 14, 56, 18, 82); x.lineTo(6, 192); x.lineTo(90, 192); x.lineTo(78, 82); x.bezierCurveTo(82, 56, 76, 16, 48, 12); x.fill();
  x.strokeStyle = 'rgba(110,110,125,.22)'; x.lineWidth = 2; [28, 38, 58, 68].forEach(i => { x.beginPath(); x.moveTo(i, 92); x.quadraticCurveTo(i + rand(-6, 6), 140, i + (i - 48) * 0.45, 190); x.stroke(); });
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 10; i++) { const bx = 6 + i * 8.6; x.beginPath(); x.moveTo(bx, 193); x.lineTo(bx + 4, 172 + rand(-8, 8)); x.lineTo(bx + 8.6, 193); x.fill(); } x.globalCompositeOperation = 'source-over';
  x.fillStyle = '#d6d1c3'; ell(x, 48, 46, 18, 22); ell(x, 48, 74, 25, 10);
  const fg = x.createRadialGradient(46, 46, 2, 48, 50, 16); fg.addColorStop(0, '#b2b8a6'); fg.addColorStop(1, '#5a6250'); x.fillStyle = fg; ell(x, 48, 49, 12.5, 16);
  x.fillStyle = '#000'; ell(x, 43, 45, 4.2, scream ? 5.5 : 4.8); ell(x, 53, 45, 4.2, scream ? 5.5 : 4.8);
  x.fillStyle = '#fff'; x.fillRect(43, 44, 1, 1); x.fillRect(53, 44, 1, 1);
  x.fillStyle = '#6a0a0a'; x.fillRect(42, 50, 1.5, 9); x.fillRect(53.5, 50, 1.5, 11);
  x.fillStyle = '#000'; ell(x, 48, scream ? 59 : 58, scream ? 5 : 2.6, scream ? 7 : 1.5);
  x.fillStyle = '#a8ae9c'; [[36, 116], [60, 116]].forEach(([hx, hy]) => { ell(x, hx, hy, 4.5, 5.5); x.fillRect(hx - 4, hy + 3, 1.4, scream ? 20 : 15); x.fillRect(hx - 1.5, hy + 4, 1.4, scream ? 23 : 17); x.fillRect(hx + 1, hy + 4, 1.4, scream ? 22 : 16); x.fillRect(hx + 3.4, hy + 3, 1.4, scream ? 18 : 13); });
}

let WT = [], FT = [], TC, SP = {};
function buildTextures() {
  WT = [];
  WT[0] = texFrom(stoneC()); WT[1] = texFrom(stoneC([66, 62, 54], 5)); WT[2] = texFrom(woodC()); WT[3] = texFrom(doorC()); WT[4] = texFrom(doorC('lock'));
  WT[5] = texFrom(grateC()); WT[6] = texFrom(doorC('code')); WT[7] = texFrom(crossC()); WT[8] = texFrom(frescoC(), 10);
  WT[9] = texFrom(writeC([{ t: 'I', y: 34, s: 26 }, { t: '7', y: 104, s: 76 }]));
  WT[10] = texFrom(writeC([{ t: 'II', y: 34, s: 26 }, { t: '1', y: 104, s: 76 }]));
  WT[11] = texFrom(writeC([{ t: 'III', y: 34, s: 26 }, { t: '3', y: 104, s: 76 }]));
  WT[12] = texFrom(writeC([{ t: 'НЕ', y: 38, s: 30 }, { t: 'ОГЛЯДЫ-', y: 72, s: 28 }, { t: 'ВАЙСЯ', y: 104, s: 28 }]));
  WT[13] = texFrom(doorC('entr'));
  const cr = stoneC([58, 56, 54], 3), cx = cr.getContext('2d'); cx.fillStyle = '#0b0908'; cx.fillRect(16, 8, 96, 120); const cg = cx.createLinearGradient(20, 0, 108, 0); cg.addColorStop(0, '#2c2a26'); cg.addColorStop(0.5, '#4a4640'); cg.addColorStop(1, '#2a2824'); cx.fillStyle = cg; cx.fillRect(20, 12, 88, 116); cx.fillStyle = '#141210'; cx.fillRect(58, 28, 12, 60); cx.fillRect(42, 44, 44, 10); cx.strokeStyle = '#6a6158'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(20, 60); cx.quadraticCurveTo(64, 88, 108, 60); cx.stroke(); WT[14] = texFrom(cr);
  WT[15] = texFrom(writeC([{ t: 'ОНА', y: 54, s: 40 }, { t: 'ПОЁТ', y: 102, s: 40 }]));
  WT[16] = texFrom(tileC([170, 162, 140], [176, 170, 150], false));
  WT[17] = texFrom(tileC([150, 150, 128], [92, 120, 104], true));
  WT[18] = texFrom(shelfC(), 10);
  WT[19] = texFrom(brickC());
  WT[20] = texFrom(glassC(), 10, (r, g, b, px, py) => (px > 27 && px < 101 && py > 6 && (Math.max(r, g, b) - Math.min(r, g, b) > 40 || r > 190)) ? 1 : 0);
  WT[21] = texFrom(ossC());
  WT[22] = texFrom(ironDoorC());
  WT[23] = texFrom(doorC('chap'));
  WT[24] = texFrom(writeC([{ t: 'ОБЕР-', y: 56, s: 40 }, { t: 'НИСЬ', y: 104, s: 40 }]));
  FT = [texFrom(floorStone(), 12), texFrom(floorTile(), 10), texFrom(floorWood(), 10), texFrom(floorDirt(), 12)];
  TC = texFrom(ceilC(), 10);
  SP.lectern = spr(48, 66, lectern); SP.font = spr(72, 60, x => fontS(x, true)); SP.fontE = spr(72, 60, x => fontS(x, false));
  SP.candleOff = spr(24, 64, x => candleS(x, false)); SP.candleOn = spr(24, 64, x => candleS(x, true, 0), 3);
  SP.altarR = spr(64, 42, x => altarS(x, true)); SP.altar = spr(64, 42, x => altarS(x, false)); SP.coffin = spr(80, 44, coffinS);
  SP.crossInv = spr(34, 90, crossInvS); SP.bones = spr(60, 24, bonesS); SP.bench = spr(78, 28, benchS); SP.table = spr(78, 28, tableS); SP.chair = spr(36, 50, chairS);
  SP.battery = spr(24, 24, batteryS, 4); SP.statue = spr(48, 112, x => statueS(x, false)); SP.statueLook = spr(48, 112, x => statueS(x, true));
  SP.wardrobe = spr(52, 104, wardrobeS); SP.cup = spr(44, 60, x => cupS(x, false)); SP.cupOpen = spr(44, 60, x => cupS(x, true));
  SP.desk = spr(68, 38, x => deskS(x, false)); SP.deskDone = spr(68, 38, x => deskS(x, true)); SP.bed = spr(64, 36, x => bedS(x, false)); SP.bedBody = spr(64, 36, x => bedS(x, true));
  SP.bells = spr(56, 120, bellsS); SP.stove = spr(54, 46, stoveS);
  SP.ghost = spr(96, 192, x => ghostS(x, false), 5); SP.ghostS = spr(96, 192, x => ghostS(x, true), 5);
}
