'use strict';
/* Комиксы в начале и в конце. Раскладка панелей повторяет присланный шаблон страницы. */
const PANELS = [
  [[22, 12], [216, 12], [268, 314], [22, 352]], [[226, 12], [448, 12], [510, 270], [278, 311]], [[458, 12], [714, 12], [714, 236], [520, 268]],
  [[22, 366], [204, 336], [236, 604], [22, 576]], [[214, 334], [434, 298], [518, 654], [246, 608]], [[446, 296], [714, 250], [714, 576], [528, 650]],
  [[22, 588], [290, 628], [216, 830], [22, 830]], [[300, 630], [516, 664], [492, 830], [226, 830]], [[528, 664], [714, 592], [714, 830], [502, 830]]];
const CW = 736, CH = 842;
const BB = PANELS.map(p => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; });
const cv = $('cv'), cc = cv.getContext('2d'); let cScale = 1, cDpr = 1, comicState = null;

function fitComic() {
  const land = innerWidth > innerHeight; const maxW = land ? innerWidth * 0.56 : innerWidth - 32, maxH = land ? innerHeight - 30 : innerHeight - 190;
  cScale = Math.min(maxW / CW, maxH / CH); cDpr = Math.min(2.5, devicePixelRatio || 1);
  cv.style.width = CW * cScale + 'px'; cv.style.height = CH * cScale + 'px'; cv.width = Math.round(CW * cScale * cDpr); cv.height = Math.round(CH * cScale * cDpr);
  if (comicState) drawComic();
}
function wrap(c, text, maxW) { const words = text.split(' '), lines = []; let l = ''; for (const w of words) { const t = l ? l + ' ' + w : w; if (c.measureText(t).width > maxW && l) { lines.push(l); l = w; } else l = t; } if (l) lines.push(l); return lines; }
function capBox(c, x, y, text, maxW, size = 19) { c.font = `${size}px Neucha, cursive`; const lines = wrap(c, text, maxW - 16); const w = Math.min(maxW, Math.max(...lines.map(l => c.measureText(l).width)) + 16), h = lines.length * size * 1.12 + 12; c.fillStyle = '#e6d3a0'; c.fillRect(x, y, w, h); c.strokeStyle = '#0a0807'; c.lineWidth = 2.5; c.strokeRect(x, y, w, h); c.fillStyle = '#140c08'; lines.forEach((l, i) => c.fillText(l, x + 8, y + 5 + size * (i + 0.88))); }
function bubble(c, x, y, maxW, text, tx, ty, kind = 'speech', size = 21) {
  c.font = `${size}px Neucha, cursive`; const lines = wrap(c, text, maxW - 24); const w = Math.max(...lines.map(l => c.measureText(l).width)) + 28, h = lines.length * size * 1.1 + 18;
  const cx = x + w / 2, cy = y + h / 2; c.save(); c.fillStyle = kind === 'whisper' ? '#1b1816' : '#f4efe2'; c.strokeStyle = kind === 'whisper' ? '#c9c1ad' : '#0a0807'; c.lineWidth = 2.5;
  if (kind === 'whisper') c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(cx - w * 0.12, cy + h * 0.35); c.lineTo(tx, ty); c.lineTo(cx + w * 0.1, cy + h * 0.38); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(cx, cy, w / 2 + 6, h / 2 + 4, 0, 0, 7); c.fill(); c.stroke(); c.setLineDash([]);
  c.fillStyle = kind === 'whisper' ? '#d9d2bf' : '#120c08'; c.textAlign = 'center'; lines.forEach((l, i) => c.fillText(l, cx, y + 9 + size * (i + 0.85))); c.restore();
}
function sfxText(c, x, y, text, size, rot, fill = '#e8dfcb', stroke = '#8a0d10') { c.save(); c.translate(x, y); c.rotate(rot); c.font = `${size}px "Ruslan Display", serif`; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = size * 0.16; c.strokeStyle = '#000'; c.strokeText(text, 0, 0); c.lineWidth = size * 0.07; c.strokeStyle = stroke; c.strokeText(text, 0, 0); c.fillStyle = fill; c.fillText(text, 0, 0); c.restore(); }
function halftone(c, b, col, fn, step = 7) { c.fillStyle = col; let row = 0; for (let y = b.y; y < b.y + b.h; y += step, row++) { for (let x = b.x + (row % 2 ? step / 2 : 0); x < b.x + b.w; x += step) { const r = fn((x - b.x) / b.w, (y - b.y) / b.h) * step * 0.55; if (r > 0.3) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } } } }
function vgrad(c, b, a, z) { const g = c.createLinearGradient(0, b.y, 0, b.y + b.h); g.addColorStop(0, a); g.addColorStop(1, z); c.fillStyle = g; c.fillRect(b.x, b.y, b.w, b.h); }
function tri(c, a, b, d, e, f, g) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.closePath(); c.fill(); }
function monastery(c, x, y, u, win = '#c22a1a', col = '#050405') {
  c.fillStyle = col; c.fillRect(x - 60 * u, y - 50 * u, 120 * u, 52 * u); tri(c, x - 66 * u, y - 50 * u, x + 66 * u, y - 50 * u, x, y - 86 * u);
  c.fillRect(x + 30 * u, y - 122 * u, 28 * u, 124 * u); tri(c, x + 26 * u, y - 122 * u, x + 62 * u, y - 122 * u, x + 44 * u, y - 170 * u); c.fillRect(x + 43 * u, y - 190 * u, 2.5 * u, 22 * u); c.fillRect(x + 37 * u, y - 183 * u, 14 * u, 2.5 * u);
  c.fillRect(x - 80 * u, y - 82 * u, 24 * u, 84 * u); tri(c, x - 84 * u, y - 82 * u, x - 52 * u, y - 82 * u, x - 68 * u, y - 116 * u);
  c.fillStyle = win; c.shadowColor = win; c.shadowBlur = 12 * u; c.fillRect(x + 40 * u, y - 104 * u, 8 * u, 14 * u); c.shadowBlur = 0; c.fillStyle = '#2a2420'; for (let i = 0; i < 4; i++) c.fillRect(x - 48 * u + i * 24 * u, y - 36 * u, 7 * u, 16 * u);
}
function beam(c, x, y, x2, y2, spread, alpha = 0.5) { const a = Math.atan2(y2 - y, x2 - x), l = Math.hypot(x2 - x, y2 - y); c.save(); const g = c.createRadialGradient(x, y, 0, x, y, l); g.addColorStop(0, `rgba(255,240,190,${alpha})`); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - spread) * l, y + Math.sin(a - spread) * l); c.lineTo(x + Math.cos(a + spread) * l, y + Math.sin(a + spread) * l); c.closePath(); c.fill(); c.restore(); }
function rays(c, x, y, n, len, col) { c.save(); c.strokeStyle = col; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.1; c.lineWidth = 2 + (i % 3) * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * len * 0.15, y + Math.sin(a) * len * 0.15); c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); c.stroke(); } c.restore(); }
function speedLines(c, b, cx, cy, n) { c.save(); c.strokeStyle = 'rgba(232,223,203,.5)'; c.lineWidth = 1.5; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r1 = Math.max(b.w, b.h) * 0.35, r2 = Math.max(b.w, b.h) * 0.9; c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); c.stroke(); } c.restore(); }

const INTRO = [
  { text: 'Монастырь на холме пустует уже тридцать лет. Местные обходят его стороной даже днём.', sfx: () => Snd.thunder(), draw(c, b) { vgrad(c, b, '#0a1120', '#2c1f2e'); const mx = b.x + b.w * 0.68, my = b.y + b.h * 0.2;
    halftone(c, b, 'rgba(232,223,203,.18)', (u, v) => Math.max(0, 1 - Math.hypot(u - 0.68, v - 0.2) * 2.2)); c.fillStyle = '#e8dfcb'; c.beginPath(); c.arc(mx, my, b.w * 0.13, 0, 7); c.fill(); c.fillStyle = 'rgba(150,140,120,.5)'; c.beginPath(); c.arc(mx - 8, my - 6, 6, 0, 7); c.arc(mx + 10, my + 8, 4, 0, 7); c.fill();
    c.fillStyle = 'rgba(10,10,16,.85)'; c.fillRect(b.x, my + 4, b.w, 9); c.fillRect(b.x + b.w * 0.3, my + 18, b.w, 6);
    c.fillStyle = '#050405'; c.beginPath(); c.moveTo(b.x, b.y + b.h); c.quadraticCurveTo(b.cx, b.y + b.h * 0.6, b.x + b.w + 40, b.y + b.h * 0.85); c.lineTo(b.x + b.w + 40, b.y + b.h); c.fill();
    monastery(c, b.cx + 6, b.y + b.h * 0.74, b.w / 330); capBox(c, b.x + 8, b.y + 8, 'Обитель Св. Агаты. 1994', b.w * 0.8); } },
  { text: 'Твоя сестра Вера, реставратор фресок, уехала сюда неделю назад. Вчера пришло письмо без обратного адреса.', sfx: () => Snd.click(), draw(c, b) { c.fillStyle = '#2a1c12'; c.fillRect(b.x, b.y, b.w, b.h); halftone(c, b, 'rgba(0,0,0,.45)', (u, v) => v * 0.9 + 0.1, 6);
    c.save(); c.translate(b.cx + 14, b.cy + 20); c.rotate(-0.08); c.fillStyle = '#e8dcc0'; c.fillRect(-b.w * 0.36, -b.h * 0.32, b.w * 0.72, b.h * 0.62); c.fillStyle = '#2a1a10'; c.font = '21px Neucha, cursive';
    ['Я нашла её крипту.', 'Она не спит.', 'Не приезжай', 'за мной.', '— В.'].forEach((l, i) => c.fillText(l, -b.w * 0.3, -b.h * 0.2 + i * 28)); c.fillStyle = 'rgba(138,13,16,.75)'; c.beginPath(); c.ellipse(b.w * 0.2, b.h * 0.18, 14, 10, 0.5, 0, 7); c.fill(); c.restore();
    capBox(c, b.x + 64, b.y + 8, 'Письмо от Веры', b.w * 0.6); } },
  { text: 'Ты приезжаешь в полночь. Мотор глохнет сам, у самых ворот.', sfx: () => Snd.creak(0.6, 0.5, 0.4), draw(c, b) { vgrad(c, b, '#05070c', '#1a1618');
    c.fillStyle = '#24201d'; c.beginPath(); c.moveTo(b.cx - 20, b.y + b.h * 0.45); c.lineTo(b.cx + 20, b.y + b.h * 0.45); c.lineTo(b.x + b.w + 30, b.y + b.h); c.lineTo(b.x + 40, b.y + b.h); c.fill();
    beam(c, b.cx - 14, b.y + b.h * 0.78, b.cx - 6, b.y + b.h * 0.36, 0.32, 0.45); beam(c, b.cx + 40, b.y + b.h * 0.78, b.cx + 30, b.y + b.h * 0.36, 0.32, 0.45);
    c.fillStyle = '#050405'; for (let i = 0; i < 7; i++) c.fillRect(b.cx - 30 + i * 10, b.y + b.h * 0.3, 3, b.h * 0.16); c.fillRect(b.cx - 34, b.y + b.h * 0.3, 70, 4);
    c.fillStyle = '#0a0908'; c.beginPath(); c.roundRect(b.cx - 50, b.y + b.h * 0.7, 120, b.h * 0.24, 14); c.fill(); c.fillRect(b.cx - 30, b.y + b.h * 0.62, 80, b.h * 0.12);
    c.fillStyle = '#d01a12'; c.shadowColor = '#ff2a1a'; c.shadowBlur = 14; c.fillRect(b.cx - 44, b.y + b.h * 0.77, 18, 8); c.fillRect(b.cx + 46, b.y + b.h * 0.77, 18, 8); c.shadowBlur = 0;
    capBox(c, b.x + b.w - 120, b.y + 8, 'Полночь', 100); } },
  { text: 'Цепь на воротах перекушена. Кто-то вошёл раньше тебя.', sfx: () => Snd.crow(), draw(c, b) { vgrad(c, b, '#3a3a40', '#121114'); halftone(c, b, 'rgba(0,0,0,.5)', (u, v) => v, 6);
    c.fillStyle = '#050405'; for (let i = 0; i < 6; i++) { const x = b.x + 16 + i * b.w / 6; c.fillRect(x, b.y + 40, 9, b.h); tri(c, x - 4, b.y + 42, x + 13, b.y + 42, x + 4.5, b.y + 22); } c.fillRect(b.x, b.y + b.h * 0.4, b.w + 40, 10);
    c.strokeStyle = '#8a8478'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(b.cx - 30 + i * 12, b.y + b.h * 0.47 + i * 9, 8, 5, 0.6, 0, 7); c.stroke(); } c.fillStyle = '#7a6a40'; c.fillRect(b.cx + 30, b.y + b.h * 0.62, 20, 18);
    const kx = b.x + b.w * 0.62, ky = b.y + b.h * 0.36; c.fillStyle = '#000'; c.beginPath(); c.ellipse(kx, ky, 16, 9, 0, 0, 7); c.fill(); c.beginPath(); c.arc(kx + 14, ky - 4, 6, 0, 7); c.fill(); tri(c, kx + 18, ky - 4, kx + 28, ky - 2, kx + 18, ky); tri(c, kx - 12, ky - 2, kx - 30, ky - 10, kx - 14, ky + 4);
    sfxText(c, b.x + b.w * 0.52, b.y + b.h * 0.2, 'КАР!', 40, -0.15); } },
  { text: 'Внутри пахнет воском и сыростью. В луче фонаря на миг появляется фигура в чёрном.', sfx: () => Snd.whisper(0.8), draw(c, b) { c.fillStyle = '#070607'; c.fillRect(b.x, b.y, b.w, b.h);
    const vx = b.cx + 10, vy = b.y + b.h * 0.42; c.fillStyle = '#131012'; c.beginPath(); c.moveTo(b.x, b.y + b.h); c.lineTo(vx - 30, vy + 30); c.lineTo(vx + 30, vy + 30); c.lineTo(b.x + b.w + 40, b.y + b.h); c.fill();
    c.fillStyle = '#0d0b0c'; for (let i = 0; i < 4; i++) { const t = i / 4, s = 1 - t * 0.7; c.fillRect(b.x + 20 + t * (vx - 60 - b.x), vy - 140 * s, 22 * s, 240 * s); c.fillRect(b.x + b.w - 30 - t * (b.x + b.w - vx - 50), vy - 140 * s, 22 * s, 240 * s); }
    beam(c, b.cx, b.y + b.h + 20, vx, vy + 10, 0.26, 0.55); nunFigure(c, vx, vy + 34, 62); halftone(c, b, 'rgba(0,0,0,.35)', (u, v) => Math.abs(u - 0.5) * 1.6, 6); bubble(c, b.x + b.w * 0.5, b.y + 24, 170, 'ш-ш-ш…', vx + 6, vy - 24, 'whisper'); } },
  { text: 'Говорят, сестру Агриппину замуровали заживо в крипте. Она пела по ночам, и в деревне умирали люди.', sfx: () => Snd.organ(), draw(c, b) { c.fillStyle = '#6b4a2e'; c.fillRect(b.x, b.y, b.w, b.h);
    for (let r = 0; r < 14; r++) for (let k = 0; k < 9; k++) { const x = b.x + k * 40 + (r % 2) * 20 - 20, y = b.y + r * 24; if (Math.hypot(x + 20 - b.cx, y + 12 - b.cy - 10) < 62) continue; c.fillStyle = `rgb(${110 + ((r * 7 + k * 13) % 30)},${68 + ((r * 5 + k * 3) % 20)},40)`; c.fillRect(x + 1, y + 1, 38, 22); }
    c.fillStyle = '#120a06'; c.beginPath(); c.ellipse(b.cx, b.cy + 10, 52, 46, 0, 0, 7); c.fill();
    c.fillStyle = '#bdb79f'; c.beginPath(); c.ellipse(b.cx - 6, b.cy + 18, 16, 20, -0.4, 0, 7); c.fill(); for (let i = 0; i < 4; i++) { c.save(); c.translate(b.cx - 14 + i * 7, b.cy + 2); c.rotate(-0.6 + i * 0.15); c.fillRect(-2.5, -34, 5, 34); c.restore(); }
    halftone(c, b, 'rgba(40,20,10,.5)', () => 0.6, 6); capBox(c, b.x + b.w - 80, b.y + 56, '1964', 62, 22); } },
  { text: 'Голос звучит прямо у тебя за спиной.', sfx: () => Snd.whisper(1), draw(c, b) { c.fillStyle = '#000'; c.fillRect(b.x, b.y, b.w, b.h); nunFace(c, b.cx - 10, b.cy + 60, b.w * 0.42, { seed: 31, scream: 0.05 });
    bubble(c, b.x + 30, b.y + b.h * 0.08, 200, 'Ты здесь из-за неё…', b.cx, b.cy, 'whisper', 20); } },
  { text: 'Входная дверь захлопывается. Замок щёлкает сам.', sfx: () => Snd.slam(1.2), draw(c, b) { c.fillStyle = '#120d0a'; c.fillRect(b.x, b.y, b.w, b.h); speedLines(c, b, b.cx, b.cy, 38);
    c.fillStyle = '#3e281a'; c.beginPath(); c.moveTo(b.cx - 70, b.y + 30); c.lineTo(b.cx + 40, b.y + 50); c.lineTo(b.cx + 40, b.y + b.h); c.lineTo(b.cx - 70, b.y + b.h); c.fill(); c.fillStyle = '#1c120c'; for (let i = 1; i < 5; i++) c.fillRect(b.cx - 70 + i * 22, b.y + 40, 3, b.h);
    c.fillStyle = '#2b2826'; c.fillRect(b.cx - 70, b.y + 70, 110, 8); c.fillRect(b.cx - 70, b.y + b.h - 46, 110, 8); sfxText(c, b.cx, b.cy + 10, 'БАМ!', 62, -0.12); } },
  { text: 'Обратного пути нет. Найди Веру и узнай, чего хочет Агриппина.', draw(c, b) { c.fillStyle = '#070606'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#16110e'; c.fillRect(b.x, b.y + b.h * 0.62, b.w + 40, b.h);
    beam(c, b.x + 44, b.y + b.h * 0.8, b.x + b.w * 0.8, b.y + b.h * 0.32, 0.28, 0.6); c.fillStyle = '#2a2a2e'; c.save(); c.translate(b.x + 44, b.y + b.h * 0.8); c.rotate(-0.45); c.fillRect(-36, -8, 40, 16); c.fillRect(2, -11, 10, 22); c.restore();
    c.fillStyle = '#7a0b0d'; c.font = '30px Neucha, cursive'; c.save(); c.translate(b.x + b.w * 0.64, b.y + b.h * 0.3); c.rotate(-0.06); c.fillText('ОНА', -26, 0); c.fillText('ПОЁТ', -36, 32); c.restore();
    capBox(c, b.x + 10, b.y + b.h - 70, 'Найди Веру. Не оглядывайся.', b.w * 0.85); } },
];
const OUTRO = [
  { text: 'Свет фонаря держит её, а чётки ложатся на крышку гроба. Камень начинает светиться изнутри.', sfx: () => Snd.organ(), draw(c, b) { c.fillStyle = '#050404'; c.fillRect(b.x, b.y, b.w, b.h); rays(c, b.cx, b.cy + 40, 22, b.w, 'rgba(255,236,170,.35)');
    c.fillStyle = '#3e3a35'; c.fillRect(b.cx - 80, b.cy + 20, 160, 60); c.fillStyle = '#5a554e'; c.fillRect(b.cx - 88, b.cy + 8, 176, 18); c.strokeStyle = '#fff2c4'; c.lineWidth = 3; c.beginPath(); c.moveTo(b.cx - 60, b.cy + 26); c.lineTo(b.cx - 30, b.cy + 60); c.lineTo(b.cx - 10, b.cy + 40); c.moveTo(b.cx + 40, b.cy + 24); c.lineTo(b.cx + 56, b.cy + 70); c.stroke();
    c.strokeStyle = '#efe6cf'; c.lineWidth = 2; c.beginPath(); c.ellipse(b.cx, b.cy + 14, 30, 7, 0, 0, 7); c.stroke(); capBox(c, b.x + 8, b.y + 8, 'Чётки вернулись к ней', b.w * 0.8); } },
  { text: 'Агриппина кричит, и её крик рассыпается светом.', sfx: () => Snd.scream(0.7, 1), draw(c, b) { c.fillStyle = '#e8dcb0'; c.fillRect(b.x, b.y, b.w, b.h); rays(c, b.cx, b.cy, 30, b.w, 'rgba(255,255,255,.9)');
    nunFace(c, b.cx, b.cy + 30, b.w * 0.22, { seed: 77, scream: 1 }); c.fillStyle = '#e8dcb0'; for (let i = 0; i < 60; i++) c.fillRect(b.cx + rand(-120, 120), b.y + rand(0, b.h * 0.5), rand(3, 9), rand(3, 9)); sfxText(c, b.cx, b.y + b.h * 0.86, 'А-А-А!', 40, 0.08, '#8a0d10', '#000'); } },
  { text: 'Потом становится очень тихо. Где-то наверху сам собой звякает колокол.', draw(c, b) { c.fillStyle = '#000'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#8a847a'; c.font = '24px Neucha, cursive'; c.textAlign = 'center'; c.fillText('…тишина…', b.cx + 20, b.cy); c.textAlign = 'left'; } },
  { text: 'В углу крипты сидит Вера. Живая.', draw(c, b) { c.fillStyle = '#060505'; c.fillRect(b.x, b.y, b.w, b.h); const g = c.createRadialGradient(b.cx, b.cy + 30, 10, b.cx, b.cy + 30, 120); g.addColorStop(0, 'rgba(255,236,180,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(b.x, b.y, b.w, b.h);
    c.fillStyle = '#0b0908'; c.beginPath(); c.arc(b.cx, b.cy + 8, 18, 0, 7); c.fill(); c.beginPath(); c.ellipse(b.cx, b.cy + 60, 34, 40, 0, 0, 7); c.fill(); c.fillStyle = '#3a2a1e'; c.beginPath(); c.moveTo(b.cx - 16, b.cy); c.quadraticCurveTo(b.cx, b.cy - 24, b.cx + 18, b.cy + 2); c.lineTo(b.cx + 22, b.cy + 40); c.lineTo(b.cx - 22, b.cy + 40); c.fill();
    bubble(c, b.x + 20, b.y + 30, 140, 'Ты здесь…', b.cx - 4, b.cy - 14); } },
  { text: 'Двери, запертые всю ночь, открываются сами. Вы бежите не оглядываясь.', sfx: () => Snd.creak(1.8, 0.8), draw(c, b) { c.fillStyle = '#0b0908'; c.fillRect(b.x, b.y, b.w, b.h); const dx = b.cx + 20, dy = b.y + b.h * 0.32;
    rays(c, dx, dy + 50, 20, b.w * 0.9, 'rgba(255,248,220,.3)'); c.fillStyle = '#fffbe8'; c.fillRect(dx - 34, dy, 68, 110); c.fillStyle = '#050405';
    [[dx - 70, b.y + b.h * 0.86, 90], [dx + 40, b.y + b.h * 0.8, 80]].forEach(([x, y, h]) => { c.beginPath(); c.arc(x, y - h, h * 0.12, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - h * 0.12, y - h * 0.85); c.lineTo(x + h * 0.14, y - h * 0.85); c.lineTo(x + h * 0.3, y - h * 0.4); c.lineTo(x + h * 0.1, y); c.lineTo(x - h * 0.05, y - h * 0.38); c.lineTo(x - h * 0.3, y); c.lineTo(x - h * 0.16, y - h * 0.42); c.closePath(); c.fill(); });
    speedLines(c, b, dx, dy + 50, 24); } },
  { text: 'Над холмом встаёт солнце. Обитель снова выглядит просто старым домом.', sfx: () => Snd.pickup(), draw(c, b) { vgrad(c, b, '#e89a5a', '#f3d3a0'); c.fillStyle = '#fff1c8'; c.beginPath(); c.arc(b.cx + 60, b.y + b.h * 0.62, 40, 0, 7); c.fill();
    halftone(c, b, 'rgba(190,80,40,.3)', (u, v) => 1 - v, 7); c.fillStyle = '#3a2620'; c.beginPath(); c.moveTo(b.x, b.y + b.h); c.quadraticCurveTo(b.cx, b.y + b.h * 0.62, b.x + b.w, b.y + b.h * 0.8); c.lineTo(b.x + b.w, b.y + b.h); c.fill();
    monastery(c, b.cx - 20, b.y + b.h * 0.76, b.w / 360, '#5a3a2a', '#3a2620'); c.strokeStyle = '#3a2620'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const x = b.x + 50 + i * 30, y = b.y + 40 + i * 12; c.beginPath(); c.moveTo(x - 8, y); c.quadraticCurveTo(x - 4, y - 5, x, y); c.quadraticCurveTo(x + 4, y - 5, x + 8, y); c.stroke(); } } },
  { text: 'Вы уезжаете. Вера всю дорогу молчит и смотрит в окно.', draw(c, b) { vgrad(c, b, '#c7a07a', '#6a5a50'); c.fillStyle = '#3a332e'; c.beginPath(); c.moveTo(b.x, b.y + b.h * 0.62); c.lineTo(b.x + b.w, b.y + b.h * 0.5); c.lineTo(b.x + b.w, b.y + b.h * 0.66); c.lineTo(b.x, b.y + b.h * 0.82); c.fill();
    c.fillStyle = '#1a1614'; for (let i = 0; i < 7; i++) { const x = b.x + i * 32; tri(c, x, b.y + b.h * 0.6 - i * 3, x + 14, b.y + b.h * 0.25 - i * 3, x + 28, b.y + b.h * 0.6 - i * 3); }
    c.fillStyle = '#0a0908'; c.beginPath(); c.roundRect(b.cx - 30, b.y + b.h * 0.6, 70, 24, 6); c.fill(); c.fillRect(b.cx - 16, b.y + b.h * 0.56, 40, 10); c.fillStyle = '#d01a12'; c.fillRect(b.cx - 28, b.y + b.h * 0.63, 6, 4); } },
  { text: 'На повороте ты бросаешь взгляд в зеркало заднего вида…', scare: true, draw(c, b) { c.fillStyle = '#14110f'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#2a2420'; c.fillRect(b.x, b.y + b.h * 0.72, b.w + 40, b.h);
    c.fillStyle = '#050404'; c.fillRect(b.cx - 6, b.y + 10, 10, 40); c.beginPath(); c.roundRect(b.cx - 90, b.y + 44, 180, 74, 14); c.fill();
    c.save(); c.beginPath(); c.roundRect(b.cx - 82, b.y + 52, 164, 58, 10); c.clip(); vgrad(c, { x: b.cx - 82, y: b.y + 52, w: 164, h: 58 }, '#5a4a3e', '#2a2420'); nunFace(c, b.cx + 28, b.y + 92, 20, { seed: 5, scream: 0.1 }); c.restore();
    c.strokeStyle = '#e8dfcb'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.cx - 80, b.y + b.h * 0.85); c.quadraticCurveTo(b.cx, b.y + b.h * 0.7, b.cx + 80, b.y + b.h * 0.85); c.stroke(); } },
  { text: '…а Вера тихо напевает колыбельную из колокольни.', sfx: () => Snd.melody(), draw(c, b) { c.fillStyle = '#0a0808'; c.fillRect(b.x, b.y, b.w, b.h);
    c.fillStyle = '#c9b69a'; c.beginPath(); c.moveTo(b.cx - 40, b.y + b.h); c.lineTo(b.cx - 40, b.cy + 10); c.quadraticCurveTo(b.cx - 44, b.cy - 60, b.cx + 10, b.cy - 62); c.quadraticCurveTo(b.cx + 44, b.cy - 50, b.cx + 40, b.cy - 10); c.lineTo(b.cx + 50, b.cy + 4); c.lineTo(b.cx + 38, b.cy + 14); c.lineTo(b.cx + 36, b.cy + 40); c.lineTo(b.cx + 10, b.cy + 50); c.lineTo(b.cx + 10, b.y + b.h); c.fill();
    c.fillStyle = '#2a1a12'; c.beginPath(); c.moveTo(b.cx - 44, b.cy + 30); c.quadraticCurveTo(b.cx - 60, b.cy - 70, b.cx + 12, b.cy - 74); c.quadraticCurveTo(b.cx + 40, b.cy - 70, b.cx + 30, b.cy - 40); c.quadraticCurveTo(b.cx - 10, b.cy - 50, b.cx - 14, b.cy + 40); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(b.cx + 24, b.cy - 16, 6, 7, 0, 0, 7); c.fill(); c.strokeStyle = '#7a0a0c'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.cx + 24, b.cy - 8); c.lineTo(b.cx + 22, b.cy + 14); c.stroke();
    c.fillStyle = '#e8dfcb'; c.font = '26px serif'; c.fillText('♪', b.cx + 58, b.cy - 30); c.fillText('♫', b.cx + 74, b.cy - 60); sfxText(c, b.cx, b.y + b.h - 24, 'КОНЕЦ?', 36, 0, '#b0161a', '#000'); } },
];

function drawComic() {
  const st = comicState; if (!st) return; const c = cc; c.setTransform(cScale * cDpr, 0, 0, cScale * cDpr, 0, 0);
  c.fillStyle = '#ece4d2'; c.fillRect(0, 0, CW, CH);
  st.panels.forEach((p, i) => {
    const poly = PANELS[i]; c.save(); c.beginPath(); poly.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
    if (i < st.shown) { const a = i === st.shown - 1 ? st.alpha : 1; c.fillStyle = '#000'; c.fillRect(BB[i].x, BB[i].y, BB[i].w, BB[i].h); c.globalAlpha = a; p.draw(c, BB[i]); c.globalAlpha = 1; }
    else { c.fillStyle = '#171311'; c.fillRect(BB[i].x, BB[i].y, BB[i].w, BB[i].h); }
    c.restore(); c.beginPath(); poly.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.lineWidth = 6; c.strokeStyle = '#0a0807'; c.lineJoin = 'miter'; c.stroke();
  });
}
function openComic(panels, done) { $('comic').hidden = false; $('fade').style.opacity = '0'; comicState = { panels, shown: 0, alpha: 1, done, busy: false }; fitComic(); nextPanel(); }
function nextPanel() {
  const st = comicState; if (!st || st.busy) return;
  if (st.shown >= st.panels.length) { const d = st.done; comicState = null; $('comic').hidden = true; d && d(); return; }
  st.shown++; st.alpha = 0; st.busy = true; const p = st.panels[st.shown - 1]; $('capText').textContent = p.text; p.sfx && p.sfx();
  const t0 = performance.now();
  (function an() { st.alpha = Math.min(1, (performance.now() - t0) / 450); drawComic(); if (st.alpha < 1) requestAnimationFrame(an); else { st.busy = false; if (p.scare) setTimeout(() => screamer('vhs'), 700); } })();
  $('tapHint').textContent = st.shown >= st.panels.length ? 'Нажми, чтобы продолжить' : 'Нажми, чтобы листать';
}
$('comic').addEventListener('click', e => { if (e.target.id === 'skipBtn') return; nextPanel(); });
$('skipBtn').onclick = () => { const st = comicState; if (!st) return; comicState = null; $('comic').hidden = true; st.done && st.done(); };
