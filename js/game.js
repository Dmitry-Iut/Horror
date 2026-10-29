'use strict';
/* Состояние игры, предметы, головоломки, призрак, события, главный цикл. */
let G = null, objs = [], ghost = { mode: 'off' }, state = 'menu';
const OBJ = [
  'Осмотри зал. Найди следы Веры.',
  'Найди ключ в купели — крещальня, дверь справа.',
  'Открой трапезную — дверь в северной стене зала.',
  'Зажги свечи из летописи. Нужен огонь — загляни на кухню.',
  'Зажги свечи в порядке из летописи.',
  'Найди цифры в кельях и открой библиотеку.',
  'Собери разбитый портрет на столе в библиотеке.',
  'Она проснулась. Не попадайся! Открой колокольню (север библиотеки).',
  'Сыграй её колыбельную на колоколах.',
  'Цепи упали. Найди чётки в часовне (восток библиотеки).',
  'БЕГИ В КРИПТУ! Восточная дверь часовни.',
  'ДЕРЖИ ЕЁ В ЛУЧЕ ФОНАРЯ!',
];
const WP = [[17.5, 15.5], [13.6, 12.6], [20.5, 18.3], [17.5, 12.6], [10.5, 11.5], [10.5, 19.5], [10.5, 25.5], [17.5, 7.5], [21.4, 14.5], [15.5, 17.2]];
const doorAnims = [];

function newGame() {
  buildMap();
  G = { px: 18.5, py: 33.4, ang: -Math.PI / 2, pitch: 0, bob: 0, sway: 0, turn: 0, stepAcc: 0, stage: 0, key: false, matches: false, bellKey: false, rosary: false, chapelOpen: false,
    seq: [], F: {}, ui: null, frozen: false, scare: false, flash: 1, flick: 0, dark: 0, nextEvent: 25, lastScare: -99, time: 0, scares: 0, catches: 0, heartT: 0, tint: [1, 1, 1],
    ending: false, lamp: true, bat: 100, batWarn: false, hidden: null, holding: false, breath: 1, running: false, ritual: null };
  const o = (x, y, s, h, extra = {}) => Object.assign({ x, y, s, h }, extra);
  const bat = (x, y) => o(x, y, 'battery', 0.13, { act: 'battery', self: 0.7 });
  objs = [
    o(16.2, 31.0, 'lectern', .55, { act: 'note', note: 'n1' }), bat(21.5, 33.6), o(14.5, 30.5, 'statue', .95, { statue: 1 }), o(22.5, 30.5, 'statue', .95, { statue: 1 }), o(15.2, 34.2, 'chair', .42), o(20.4, 31.6, 'bench', .3),
    o(27.2, 31.6, 'font', .45, { act: 'font' }), bat(24.6, 33.4), o(28.3, 30.4, 'bones', .15),
    o(13.8, 27.4, 'lectern', .55, { act: 'note', note: 'n2' }),
    o(21.5, 22.5, 'candleOff', .9, { act: 'candle', n: 1, lit: false }), o(13.5, 22.5, 'candleOff', .9, { act: 'candle', n: 2, lit: false }),
    o(21.5, 27.5, 'candleOff', .9, { act: 'candle', n: 3, lit: false }), o(17.5, 22.4, 'candleOff', .9, { act: 'candle', n: 4, lit: false }),
    o(17.5, 25.0, 'table', .34), o(17.5, 26.6, 'table', .34), o(15.6, 25.8, 'chair', .42), o(19.4, 25.8, 'chair', .42), o(13.5, 24.0, 'wardrobe', 1.0, { act: 'hide', face: 0 }),
    o(24.6, 23.4, 'cup', .72, { act: 'cup', kind: 'eyes' }), o(26.5, 23.4, 'cup', .72, { act: 'cup', kind: 'matches' }), o(28.4, 25.0, 'cup', .72, { act: 'cup', kind: 'battery' }),
    o(28.3, 27.3, 'stove', .55), o(24.5, 27.4, 'wardrobe', 1.0, { act: 'hide', face: -Math.PI / 4 }),
    o(10.5, 26.6, 'lectern', .55, { act: 'note', note: 'n3' }), bat(6.5, 22.6), o(6.6, 13.6, 'bones', .15), o(6.8, 18.5, 'chair', .42), o(7.6, 21.4, 'bones', .15),
    o(6, 30, 'bed', .36), o(8, 30, 'bed', .36), o(6, 32.6, 'bed', .36), o(8.2, 32.6, 'bedBody', .38, { id: 'body' }),
    o(10.6, 32.6, 'lectern', .55, { act: 'note', note: 'n4' }), bat(5.5, 33.6), o(11.4, 29.6, 'wardrobe', 1.0, { act: 'hide', face: 2.4 }),
    o(17.5, 15.5, 'desk', .42, { act: 'photo' }), o(16.7, 15.2, 'candleOn', .55, { light: true }),
    o(14.0, 12.6, 'lectern', .55, { act: 'note', note: 'n5' }), o(20.8, 17.6, 'lectern', .55, { act: 'note', note: 'n6' }),
    bat(19.5, 12.6), o(13.5, 17.6, 'wardrobe', 1.0, { act: 'hide', face: -0.7 }), o(21.5, 12.5, 'wardrobe', 1.0, { act: 'hide', face: 2.4 }), o(15.6, 17.6, 'chair', .42),
    o(17.5, 6.6, 'bells', 1.0, { act: 'bells' }), o(15.6, 8.6, 'lectern', .55, { act: 'note', note: 'n7' }), bat(19.4, 5.6),
    o(28.5, 10.7, 'altarR', .42, { act: 'rosary' }), o(24.6, 10.6, 'crossInv', .95), o(32.4, 10.6, 'crossInv', .95),
    o(26.8, 10.6, 'candleOn', .6, { light: true }), o(30.2, 10.6, 'candleOn', .6, { light: true }),
    o(26.5, 13.2, 'bench', .3), o(30.5, 13.2, 'bench', .3), o(26.5, 15, 'bench', .3), o(30.5, 15, 'bench', .3),
    o(31.4, 16.6, 'lectern', .55, { act: 'note', note: 'n8' }), bat(24.6, 16.5),
    o(38.5, 27.6, 'coffin', .4, { act: 'coffin' }), o(34, 25.5, 'candleOn', .6, { light: true }), o(39.8, 25.4, 'candleOn', .6, { light: true }),
    o(35, 28.6, 'bones', .15), o(40, 29, 'bones', .15), o(33.6, 27, 'bones', .15), o(37.3, 19, 'bones', .15),
  ];
  ghost = { mode: 'off', x: 0, y: 0, t: 0, seen: 0, scareDist: 0, timeout: 0, onTimeout: null, kind: 'face', tx: 0, ty: 0, speed: 1, wp: 0, freeze: 0, lx: 0, ly: 0, lost: 0, st: 0, blink: 0 };
  photo.rot = []; doorAnims.length = 0; bfsCache.clear();
}

/* ---------- движение ---------- */
const free = (x, y) => tileAt(x, y) === 0;
function freeAt(x, y) { const r = 0.22; return free(x - r, y - r) && free(x + r, y - r) && free(x - r, y + r) && free(x + r, y + r); }
function update(dt) {
  const k = inp.keys; let f = -inp.my, s = inp.mx;
  if (k.KeyW || k.ArrowUp) f = 1; if (k.KeyS || k.ArrowDown) f = -1; if (k.KeyA) s = -1; if (k.KeyD) s = 1;
  if (k.ArrowLeft) { G.ang -= 2.4 * dt; G.turn -= 2.4 * dt; } if (k.ArrowRight) { G.ang += 2.4 * dt; G.turn += 2.4 * dt; }
  const mag = Math.min(1, Math.hypot(f, s)); G.running = false;
  if (mag > 0.08) {
    const run = k.ShiftLeft || k.ShiftRight || (inp.stick !== null && Math.hypot(inp.mx, inp.my) > 0.93); G.running = run;
    const sp = (run ? 3.15 : 1.9) * dt / (Math.hypot(f, s) || 1) * mag;
    const dX = Math.cos(G.ang), dY = Math.sin(G.ang), vx = (dX * f - dY * s) * sp, vy = (dY * f + dX * s) * sp;
    if (freeAt(G.px + vx, G.py)) G.px += vx; if (freeAt(G.px, G.py + vy)) G.py += vy;
    const moved = Math.hypot(vx, vy); G.bob += moved * 7; G.stepAcc += moved;
    if (G.stepAcc > (run ? 0.9 : 0.75)) { G.stepAcc = 0; Snd.step(run ? 0.22 : 0.15); }
  }
}
function setStage(n) { if (n <= G.stage) return; G.stage = n; $('objText').textContent = OBJ[n]; $('obj').classList.toggle('alert', n >= 10); $('obj').classList.remove('new'); void $('obj').offsetWidth; $('obj').classList.add('new'); }
function flicker(sec) { if (G) G.flick = Math.max(G.flick, sec); }
function toggleLamp() { if (!G || G.ui) return; G.lamp = !G.lamp; Snd.click(); if (G.lamp && G.bat <= 0) toast('Фонарь сел. Нужны батарейки.'); }
function addBattery() { G.bat = Math.min(100, G.bat + 35); G.batWarn = false; Snd.pickup(); toast('Батарейки. Фонарь светит ярче.'); }

function los(ax, ay, bx, by) { const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d * 6); for (let i = 1; i < n; i++) { const t = i / n; if (tileAt(ax + (bx - ax) * t, ay + (by - ay) * t) !== 0) return false; } return true; }
function inView(x, y, margin = 0) { return Math.abs(angDiff(Math.atan2(y - G.py, x - G.px), G.ang)) < Math.atan(planeLen) + margin; }

/* ---------- взаимодействие ---------- */
function findTarget() {
  const dX = Math.cos(G.ang), dY = Math.sin(G.ang); let best = null, bd = 1.6;
  for (const o of objs) {
    if (!o.act || o.gone) continue; const dx = o.x - G.px, dy = o.y - G.py, d = Math.hypot(dx, dy); if (d > bd) continue;
    if (Math.abs(angDiff(Math.atan2(dy, dx), G.ang)) > 0.5) continue;
    if (o.act === 'candle' && o.lit) continue;
    best = o; bd = d;
  }
  if (best) return { kind: 'obj', o: best };
  for (let t = 0.1; t < 1.35; t += 0.05) { const x = G.px + dX * t, y = G.py + dY * t, v = tileAt(x, y); if (v) { if (DOORS.has(v) && !dOpen[(y | 0) * MW + (x | 0)]) return { kind: 'door', v, tx: x | 0, ty: y | 0 }; break; } }
  return null;
}
function labelFor(t) {
  if (!t) return null;
  if (t.kind === 'obj') {
    const o = t.o;
    switch (o.act) {
      case 'note': return ['Читать', 'Прочитать записку']; case 'font': return ['Рука', 'Опустить руку в чёрную воду']; case 'battery': return ['Взять', 'Взять батарейки'];
      case 'candle': return ['Зажечь', 'Свеча ' + ROM[o.n - 1]]; case 'cup': return ['Открыть', 'Открыть шкафчик']; case 'hide': return ['Прятаться', 'Спрятаться в шкафу'];
      case 'photo': return ['Собрать', 'Разбитый портрет']; case 'bells': return ['Звонить', 'Верёвки колоколов']; case 'rosary': return ['Взять', 'Взять чётки'];
      case 'coffin': return G.rosary ? ['Положить', 'Положить чётки на гроб'] : ['Смотреть', 'Гроб Агриппины'];
    }
  }
  switch (t.v) {
    case T.DOOR: return ['Открыть', 'Открыть дверь']; case T.LOCKED: return G.key ? ['Открыть', 'Открыть ключом'] : ['Дёрнуть', 'Дверь заперта']; case T.GRATE: return ['Дёрнуть', 'Ржавая решётка'];
    case T.CODE: return ['Код', 'Кодовый замок']; case T.ENTR: return ['Дёрнуть', 'Входная дверь']; case T.CRYPT: return ['Дёрнуть', 'Каменная плита'];
    case T.BELLD: return G.bellKey ? ['Открыть', 'Открыть колокольню'] : ['Дёрнуть', 'Железная дверь']; case T.CHAPD: return G.chapelOpen ? ['Открыть', 'Открыть часовню'] : ['Дёрнуть', 'Дверь в цепях'];
  }
  return null;
}
let curTarget = null;
function updatePrompt() {
  curTarget = (G.frozen || G.ui) ? null : findTarget(); const l = labelFor(curTarget); const p = $('prompt'), a = $('act');
  if (l) { p.textContent = l[1]; p.classList.add('on'); a.textContent = l[0]; a.classList.add('ready'); } else { p.classList.remove('on'); a.textContent = 'Рука'; a.classList.remove('ready'); }
}
function openDoor(x, y, pitch = 1) { const i = y * MW + x; if (dOpen[i] > 0) return; Snd.creak(1.6, pitch); dOpen[i] = 0.001; doorAnims.push(i); }
function doAction() {
  if (!G || G.frozen || G.ui) return; const t = curTarget; if (!t) { Snd.step(0.08); return; }
  if (t.kind === 'obj') {
    const o = t.o;
    switch (o.act) {
      case 'note': openNote(o.note); if (o.note === 'n1') setStage(1); if (o.note === 'n2' && G.stage < 3) setStage(3); break;
      case 'battery': o.gone = true; addBattery(); break;
      case 'font': fontScare(o); break;
      case 'candle': lightCandle(o); break;
      case 'cup': openCup(o); break;
      case 'hide': hideIn(o); break;
      case 'photo': openPhoto(); break;
      case 'bells': openBells(); break;
      case 'rosary': takeRosary(o); break;
      case 'coffin': if (G.rosary) startRitual(); else { toast('Каменная крышка. На ней выцарапано имя: АГРИППИНА.'); Snd.whisper(0.5); } break;
    }
    return;
  }
  switch (t.v) {
    case T.DOOR: openDoor(t.tx, t.ty); break;
    case T.LOCKED: if (G.key) { Snd.click(); openDoor(t.tx, t.ty, 0.85); setStage(3); } else { Snd.rattle(); toast('Заперто. Нужен ключ.'); } break;
    case T.GRATE: Snd.rattle(); toast(G.stage >= 3 ? 'Решётка не поддаётся. Она связана со свечами.' : 'Ржавая решётка заперта.'); break;
    case T.CODE: openLock(); break;
    case T.ENTR: Snd.rattle(); toast('Дверь не открывается. С той стороны будто кто-то держит.'); setTimeout(() => Snd.whisper(0.7), 700); break;
    case T.CRYPT: Snd.rattle(); toast('Тяжёлая каменная плита. Из щели тянет холодом.'); break;
    case T.BELLD: if (G.bellKey) { Snd.click(); openDoor(t.tx, t.ty, 0.6); setStage(8); } else { Snd.rattle(); toast('Железная дверь с колоколом на замке. Нужен ключ.'); } break;
    case T.CHAPD: if (G.chapelOpen) openDoor(t.tx, t.ty, 0.75); else { Snd.rattle(); toast('Дверь опутана цепями. На замке выбит колокол.'); } break;
  }
}

/* ---------- головоломки и события ---------- */
function fontScare(o) {
  G.frozen = true; o.act = null; Snd.duck(2); toast('Вода ледяная… Пальцы нащупали что-то металлическое.');
  setTimeout(() => screamer('hands', () => { G.frozen = false; G.key = true; o.s = 'fontE'; updateInv(); Snd.pickup(); setStage(2); toast('Ключ у тебя. Кто-то держал его со дна.'); setTimeout(keyFollowUp, 2500); }), 1300);
}
function keyFollowUp() { Snd.duck(3); G.dark = 0.3; setTimeout(() => { G.dark = 0; ghostStand(24.6, 31.5, 4.5, 9, 'face', () => { Snd.slam(1); toast('Где-то хлопнула дверь.'); }); }, 1500); }
function openCup(o) {
  o.s = 'cupOpen'; o.act = null; Snd.creak(0.5, 1.5, 0.6);
  if (o.kind === 'matches') { G.matches = true; updateInv(); Snd.pickup(); toast('Коробок спичек. Сухие!'); if (G.stage >= 3) setStage(4); }
  else if (o.kind === 'battery') addBattery();
  else if (o.kind === 'eyes') { G.frozen = true; setTimeout(() => screamer('eyes', () => { G.frozen = false; toast('Пусто. Только царапины изнутри дверцы.'); }), 350); }
}
const ORDER = [3, 1, 4, 2];
function lightCandle(o) {
  if (!G.matches) { toast('Нужен огонь. На кухне могут быть спички.'); setStage(3); return; }
  o.lit = true; o.s = 'candleOn'; Snd.candle(); G.seq.push(o.n);
  const i = G.seq.length - 1;
  if (G.seq[i] !== ORDER[i]) {
    G.frozen = true; toast('Пламя гаснет само…');
    setTimeout(() => { objs.forEach(c => { if (c.act === 'candle') { c.lit = false; c.s = 'candleOff'; } }); G.seq = []; G.dark = 0.85; Snd.duck(1.4); }, 500);
    setTimeout(() => screamer('strobe', () => { G.dark = 0; G.frozen = false; }), 1300);
    return;
  }
  if (G.seq.length === 4) setTimeout(() => { Snd.organ(); toast('Где-то за стеной лязгнула решётка.'); openDoor(12, 25, 0.6); setStage(5); }, 700);
}
function photoSolved() {
  const d = objs.find(o => o.act === 'photo'); d.s = 'deskDone'; d.act = null; G.frozen = true;
  setTimeout(() => screamer('portrait', () => {
    G.frozen = false; G.bellKey = true; updateInv(); setStage(7); Snd.tension(0.55);
    toast('Из-за рамки выпал ключ от колокольни. В коридоре кто-то идёт…', 4000);
    Object.assign(ghost, { mode: 'patrol', x: 10.5, y: 11.5, wp: 5, freeze: 3, t: 0 });
  }), 400);
}
function bellsSolved() {
  G.frozen = true; ghostOff(); MELODY.forEach((b, i) => setTimeout(() => Snd.bell(BELLF[b], 0.7), i * 450));
  setTimeout(() => { Snd.duck(3, 0); G.dark = 0.7; }, 2600);
  setTimeout(() => screamer('glass', () => { G.dark = 0; G.frozen = false; G.chapelOpen = true; setStage(9); Snd.tension(0.2); Snd.slam(0.6); Snd.rattle(); toast('Внизу с грохотом упали цепи. Часовня открыта.', 3500); }), 4200);
}
function takeRosary(o) {
  G.rosary = true; o.s = 'altar'; o.act = null; updateInv(); Snd.pickup(); G.frozen = true; toast('Чётки ледяные. Бусины будто шевелятся в ладони.');
  setTimeout(() => { Snd.duck(4, 0); G.dark = 0.92; }, 900);
  setTimeout(() => flicker(1.2), 2600);
  setTimeout(() => screamer('face', () => {
    G.frozen = false; G.dark = 0; setStage(10); Snd.tension(1); openDoor(33, 13, 0.7);
    Object.assign(ghost, { mode: 'chase', x: 24.6, y: 14.5, freeze: 1.4, t: 0, blink: 0 }); toast('Восточная дверь открылась! БЕГИ!', 3500, true);
  }), 3900);
}
function startRitual() {
  if (G.ritual || G.ending) return; G.rosary = false; updateInv(); G.ritual = { m: 0 }; G.bat = Math.max(G.bat, 55); G.lamp = true; setStage(11); Snd.organ(); Snd.choirHit();
  Object.assign(ghost, { mode: 'ritual', x: 37.5, y: 22.5, freeze: 1.0, t: 0 }); toast('Чётки на гробу. Она идёт! Держи её в луче!', 3500, true);
}
function finale() {
  if (G.ending) return; G.ending = true; G.frozen = true; ghostOff(); G.ritual = null; Snd.duck(10, 0); Snd.tension(0);
  setTimeout(() => screamer('light', () => {
    const f = $('fade'); f.style.background = '#fff'; f.style.opacity = '1';
    setTimeout(() => { state = 'comic'; $('hud').hidden = true; $('ov').style.opacity = '0'; openComic(OUTRO, showEnd); }, 900);
  }), 600);
}

/* ---------- укрытие ---------- */
function hideIn(o) {
  if (G.stage >= 10) { toast('Сейчас не время прятаться!'); return; }
  G.hidden = o; G.prev = { x: G.px, y: G.py }; G.px = o.x; G.py = o.y; G.ang = o.face; G.pitch = 0; G.ui = 'hide'; G.breath = 1; G.holding = false;
  showHideUI(true); Snd.creak(0.7, 1.3, 0.5);
}
function leaveHide(force) {
  if (!G.hidden) return; const o = G.hidden; G.hidden = null; G.ui = null; G.holding = false; $('holdBtn').classList.remove('on'); showHideUI(false);
  let nx = o.x + Math.cos(o.face) * 0.6, ny = o.y + Math.sin(o.face) * 0.6; if (!freeAt(nx, ny)) { nx = G.prev.x; ny = G.prev.y; } G.px = nx; G.py = ny;
  if (!force) Snd.creak(0.6, 1.3, 0.4);
}

/* ---------- призрак ---------- */
const bfsCache = new Map();
function bfsFrom(tx, ty) {
  const key = (ty | 0) * MW + (tx | 0); let d = bfsCache.get(key); if (d) return d;
  d = new Int16Array(MW * MH).fill(-1); const q = [key]; d[key] = 0;
  for (let h = 0; h < q.length; h++) { const c = q[h], cx = c % MW, cy = (c / MW) | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + a, ny = cy + b; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const ni = ny * MW + nx; if (d[ni] !== -1 || map[ni] !== 0) continue; d[ni] = d[c] + 1; q.push(ni); } }
  if (bfsCache.size > 60) bfsCache.clear(); bfsCache.set(key, d); return d;
}
function moveGhost(tx, ty, sp, dt) {
  const d = bfsFrom(tx, ty), gx = ghost.x | 0, gy = ghost.y | 0, gi = gy * MW + gx; let nx = tx, ny = ty;
  if (d[gi] > 0) { let best = d[gi]; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = (gy + b) * MW + gx + a; if (d[ni] >= 0 && d[ni] < best) { best = d[ni]; nx = gx + a + 0.5; ny = gy + b + 0.5; } } }
  const ex = nx - ghost.x, ey = ny - ghost.y, l = Math.hypot(ex, ey); if (l > 0.001) { const m = Math.min(sp * dt, l); ghost.x += ex / l * m; ghost.y += ey / l * m; }
  return d[gi];
}
function ghostStand(x, y, scareDist, timeout, kind, onTimeout) { Object.assign(ghost, { mode: 'stand', x, y, t: 0, seen: 0, scareDist, timeout, kind: kind || 'face', onTimeout }); }
function ghostWalk(x, y, tx, ty, speed) { Object.assign(ghost, { mode: 'walk', x, y, tx, ty, speed, t: 0 }); }
function ghostOff() { ghost.mode = 'off'; }
function pickWP() { let i; do { i = (Math.random() * WP.length) | 0; } while (i === ghost.wp); return i; }
function canDetect(dist, sees) { return sees && dist < ((G.lamp && G.bat > 0) ? 7.5 : 3.0) + (G.running ? 2 : 0); }
function startHunt() { ghost.mode = 'hunt'; ghost.lx = G.px; ghost.ly = G.py; ghost.lost = 0; Snd.wail(0.9, 1.4); flicker(0.4); toast('ОНА ТЕБЯ ВИДИТ! Беги и прячься!', 2500, true); }

function updateGhost(dt) {
  if (ghost.mode === 'off' || scareActive) return; if (G.ui && G.ui !== 'hide') return;
  const dx = ghost.x - G.px, dy = ghost.y - G.py, dist = Math.hypot(dx, dy);
  const sees = !G.hidden && los(ghost.x, ghost.y, G.px, G.py), vis = sees && inView(ghost.x, ghost.y, 0.05);
  ghost.t += dt;
  if (ghost.freeze > 0) { ghost.freeze -= dt; return; }
  switch (ghost.mode) {
    case 'stand':
      if (vis) { ghost.seen += dt; if (dist < ghost.scareDist && ghost.seen > 0.12) { ghostOff(); screamer(ghost.kind); } else if (ghost.seen > 0.8) { ghostOff(); Snd.whisper(0.7); flicker(0.4); } }
      if (ghost.mode === 'stand' && ghost.t > ghost.timeout) { ghostOff(); ghost.onTimeout && ghost.onTimeout(); }
      break;
    case 'walk': { const ex = ghost.tx - ghost.x, ey = ghost.ty - ghost.y, d = Math.hypot(ex, ey); if (d < 0.1 || ghost.t > 12) { ghostOff(); break; } ghost.x += ex / d * ghost.speed * dt; ghost.y += ey / d * ghost.speed * dt; break; }
    case 'patrol': { const w = WP[ghost.wp]; moveGhost(w[0], w[1], 0.95, dt); if (Math.hypot(w[0] - ghost.x, w[1] - ghost.y) < 0.3) ghost.wp = pickWP(); if (canDetect(dist, sees)) startHunt(); break; }
    case 'hunt':
      if (sees) { ghost.lx = G.px; ghost.ly = G.py; ghost.lost = 0; } else ghost.lost += dt;
      moveGhost(ghost.lx, ghost.ly, 2.0, dt);
      if (dist < 0.6 && !G.hidden) { caught(); return; }
      if (ghost.lost > 3 || (G.hidden && Math.hypot(ghost.x - ghost.lx, ghost.y - ghost.ly) < 0.5)) { ghost.mode = 'search'; ghost.st = 0; }
      break;
    case 'search':
      moveGhost(ghost.lx, ghost.ly, 1.2, dt); ghost.st += dt;
      if (canDetect(dist, sees)) startHunt();
      else if (ghost.st > 4.5) { ghost.mode = 'patrol'; ghost.wp = pickWP(); Snd.whisper(0.5); }
      break;
    case 'chase': {
      const bd = moveGhost(G.px, G.py, G.catches >= 2 ? 1.75 : 2.05, dt);
      if (dist < 0.6) { caught(); return; }
      ghost.blink += dt; if (bd > 10 && ghost.blink > 4) { ghost.blink = 0; const p = stepBack(5); if (p) { ghost.x = p[0]; ghost.y = p[1]; Snd.whisper(0.9); flicker(0.3); } }
      break;
    }
    case 'ritual': {
      const inBeam = G.lamp && G.bat > 0 && vis && Math.abs(angDiff(Math.atan2(dy, dx), G.ang)) < 0.22;
      moveGhost(G.px, G.py, inBeam ? 0.2 : 1.05, dt);
      G.ritual.m = clamp(G.ritual.m + (inBeam ? dt / 7 : -dt / 25), 0, 1); G.ritual.beam = inBeam;
      if (inBeam && Math.random() < dt * 1.5) Snd.wail(0.5, 0.8);
      if (G.ritual.m >= 1) { finale(); return; }
      if (dist < 0.7) { G.frozen = true; screamer(pickScare(['mouth', 'crawl', 'face']), () => { G.frozen = false; ghost.x = 37.5; ghost.y = 22.5; ghost.freeze = 1; G.ritual.m *= 0.6; }); }
      break;
    }
  }
  if (G.hidden && (ghost.mode === 'search' || ghost.mode === 'patrol' || ghost.mode === 'hunt') && dist < 2.2 && !G.holding) { leaveHide(true); caught(); }
}
function stepBack(n) { const d = bfsFrom(G.px, G.py); let best = null, bd = 1e9; for (let i = 0; i < MW * MH; i++) { if (d[i] !== n) continue; const x = i % MW + 0.5, y = ((i / MW) | 0) + 0.5, dd = Math.hypot(x - ghost.x, y - ghost.y); if (dd < bd && !inView(x, y, 0.1)) { bd = dd; best = [x, y]; } } return best; }
function caught() {
  G.catches++; const final = G.stage >= 10; ghostOff(); G.frozen = true;
  screamer(pickScare(['face', 'mouth', 'crawl', 'vhs', 'hands']), () => {
    G.frozen = false; G.bat = Math.max(5, G.bat - 10);
    if (final) { G.px = 34.5; G.py = 13.5; G.ang = 0; Object.assign(ghost, { mode: 'chase', x: 24.6, y: 14.5, freeze: 2.5, t: 0, blink: 0 }); toast('Она отпустила тебя. Пока что. Беги!', 3000, true); }
    else { G.px = 13.6; G.py = 15.5; G.ang = 0; let far = 0, fd = 0; WP.forEach((w, i) => { const d = Math.hypot(w[0] - G.px, w[1] - G.py); if (d > fd) { fd = d; far = i; } }); Object.assign(ghost, { mode: 'patrol', x: WP[far][0], y: WP[far][1], wp: pickWP(), freeze: 3, t: 0 }); toast('Темнота отступила. Она всё ещё бродит где-то рядом.', 3500); }
  });
}

/* ---------- сюжетные триггеры по комнатам ---------- */
function triggers() {
  const F = G.F, r = roomAt(G.px, G.py), y = G.py;
  if (!r) return;
  if (!F['in_' + r]) {
    F['in_' + r] = 1;
    switch (r) {
      case 'ref': ghostWalk(13.6, 22.3, 21.4, 22.3, 1.1); setTimeout(() => Snd.whisper(0.6), 400); setStage(G.matches ? 4 : 3); toast('Длинные столы, накрытые на тридцать лет вперёд.'); break;
      case 'kit': Snd.knock(2, 0.6, -0.5); toast('Из шкафчика слева доносится скрежет.'); break;
      case 'corr': if (G.stage >= 5) { for (let i = 0; i < 6; i++) Snd.step(0.25, 0, 0.6 + i * 0.55); setTimeout(() => Snd.duck(2.5), 4000); } else F.in_corr = 0; break;
      case 'inf': setTimeout(() => { if (G.stage < 10) ghostStand(8.2, 32.4, 5.5, 12, 'ceiling', () => { const b = objs.find(o => o.id === 'body'); if (b) b.s = 'bed'; Snd.knock(3, 1, 0); toast('Простыня на кровати опала. Под ней никого.'); }); }, 2200); toast('Лазарет. Ряды пустых коек.'); break;
      case 'lib': Snd.books(); toast('С полки посыпались книги. Сами.'); setTimeout(() => { map[16 * MW + 22] = T.W3; }, 5000); break;
      case 'bell': Snd.gust(); setTimeout(() => Snd.crow(), 800); break;
      case 'chap': Snd.organ(); flicker(0.7); break;
      case 'crypt': if (G.stage >= 10) toast('Гроб в глубине крипты!', 2500, true); else F.in_crypt = 0; break;
      case 'cpass': if (G.stage >= 10) Snd.knock(4, 1.2, -1); else F.in_cpass = 0; break;
    }
  }
  if (!F.c2 && r === 'corr' && G.stage >= 5 && y > 17.4 && y < 18.9) { F.c2 = 1; Snd.duck(3); setTimeout(() => ghostStand(7, 18, 4.8, 9, 'face', () => Snd.knock(5, 1.3, -0.9)), 1500); }
  if (!F.c3 && r === 'corr' && G.stage >= 5 && y > 21.5 && y < 22.6) { F.c3 = 1; subliminal('vhs'); }
}
function randomEvents(dt) {
  if (G.stage < 2 || G.stage >= 10 || G.ending || G.hidden) return;
  G.nextEvent -= dt; if (G.nextEvent > 0) return; G.nextEvent = rand(18, 38);
  if (G.time - G.lastScare < 8 || (ghost.mode !== 'off' && G.stage < 7)) return;
  const stealth = G.stage === 7 || G.stage === 8, r = Math.random();
  if (stealth) { if (r < 0.5) Snd.whisper(0.6); else Snd.knock(3, 0.7, rand(-1, 1)); return; }
  if (r < 0.14) Snd.whisper(0.7);
  else if (r < 0.26) Snd.knock(3, 0.9, rand(-1, 1));
  else if (r < 0.36) Snd.creak(1.8, rand(0.7, 1.1), 0.45);
  else if (r < 0.46) for (let i = 0; i < 4; i++) Snd.step(0.2, 0, i * 0.6);
  else if (r < 0.58) subliminal();
  else if (r < 0.68) { Snd.duck(3); flicker(0.5); }
  else if (r < 0.8) { objs.forEach(o => { if (o.statue && !inView(o.x, o.y, 0.2)) o.s = o.s === 'statue' ? 'statueLook' : 'statue'; }); Snd.crack(2); }
  else { const s = spotBehind(); if (s) ghostStand(s[0], s[1], 2.4, 7, pick(['face', 'crawl', 'mouth']), null); }
}
function spotBehind() { for (let k = 0; k < 40; k++) { const a = G.ang + Math.PI + rand(-0.9, 0.9), d = rand(3, 7), x = G.px + Math.cos(a) * d, y = G.py + Math.sin(a) * d; if (tileAt(x, y) === 0 && los(G.px, G.py, x, y)) return [(x | 0) + 0.5, (y | 0) + 0.5]; } return null; }

/* ---------- главный цикл ---------- */
let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (state === 'play' && G) {
    G.time += dt;
    if (!G.frozen && !G.ui) update(dt);
    updateGhost(dt);
    if (!G.ui && !G.frozen) { triggers(); randomEvents(dt); }
    for (let k = doorAnims.length - 1; k >= 0; k--) { const i = doorAnims[k]; dOpen[i] = Math.min(1, dOpen[i] + dt / 0.9); if (dOpen[i] >= 1) { map[i] = 0; bfsCache.clear(); doorAnims.splice(k, 1); } }
    if (G.lamp && G.bat > 0) { G.bat = Math.max(0, G.bat - dt * 0.24 * (G.ritual ? 2.2 : 1)); if (G.bat <= 0) toast('Фонарь сел. Ищи батарейки.'); else if (G.bat < 15 && !G.batWarn) { G.batWarn = true; toast('Фонарь садится…'); } }
    if (G.hidden) { if (G.holding) { G.breath -= dt / 5; if (G.breath <= 0) { G.breath = 0; G.holding = false; $('holdBtn').classList.remove('on'); Snd.gasp(); } } else G.breath = Math.min(1, G.breath + dt / 3); }
    // фонарь
    let base = G.lamp ? (G.bat > 0 ? 0.55 + 0.45 * Math.min(1, G.bat / 25) : 0) : 0, f = base;
    if (G.flick > 0) { G.flick -= dt; f = base * (Math.random() < 0.5 ? rand(0, 0.3) : rand(0.6, 1)); }
    else if (Math.random() < (G.bat < 15 ? 0.03 : 0.003)) G.flick = rand(0.08, 0.25);
    G.flash += (f - G.flash) * Math.min(1, dt * 30);
    G.sway += (clamp(G.turn * 8, -1, 1) - G.sway) * Math.min(1, dt * 8); G.turn = 0;
    // сердце, красный оттенок, напряжение
    let red = 0;
    if (ghost.mode !== 'off') { const d = Math.hypot(ghost.x - G.px, ghost.y - G.py); if (d < 7) { G.heartT -= dt; if (G.heartT <= 0) { G.heartT = 0.35 + d * 0.13; Snd.heart(0.7 - d * 0.06); } red = clamp(1 - d / 7, 0, 1); } }
    if (G.stage >= 10 && !G.ending) red = Math.max(red, 0.35);
    G.tint = [1, 1 - red * 0.45, 1 - red * 0.5]; $('redwash').style.opacity = red * 0.8;
    if (G.stage < 10 && !G.ending) Snd.tension(ghost.mode === 'hunt' ? 0.9 : ghost.mode !== 'off' ? 0.55 : (G.stage >= 5 ? 0.3 : 0.15));
    render(); drawOverlay(dt); updatePrompt(); updateHUD(); Snd.tick();
  }
  requestAnimationFrame(frame);
}

/* ---------- запуск ---------- */
function startPlay() {
  state = 'play'; $('hud').hidden = false; $('ov').style.opacity = '1'; $('help').classList.remove('gone'); inp.used = false;
  $('objText').textContent = OBJ[0]; $('obj').classList.remove('alert'); updateInv();
  const f = $('fade'); f.style.background = '#000'; f.style.opacity = '1'; setTimeout(() => { f.style.opacity = '0'; }, 50);
  G.frozen = true; setTimeout(() => { G.frozen = false; Snd.duck(2.5); toast('На кафедре слева лежит записка.'); }, 900);
  setTimeout(() => { if (!inp.used) $('help').classList.add('gone'); }, 9000);
}
async function begin() {
  Snd.init();
  try { await Promise.all(['21px Neucha', '30px "Ruslan Display"', '16px "PT Sans Narrow"'].map(f => document.fonts.load(f))); } catch (e) {}
  if (!WT.length) { buildTextures(); makePortrait(); }
  newGame(); resize(); showHideUI(false);
  ['note', 'lock', 'photo', 'bells', 'pause'].forEach(id => $(id).hidden = true);
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) {}
  $('menu').hidden = true; $('end').hidden = true; $('hud').hidden = true; state = 'comic'; openComic(INTRO, startPlay);
}
function showEnd() {
  state = 'end'; $('fade').style.opacity = '0'; $('fade').style.background = '#000'; $('hud').hidden = true;
  const m = Math.max(1, Math.round(G.time / 60));
  $('stats').textContent = `Время: ${m} мин · Испугов: ${G.scares} · Поймали: ${G.catches}`; $('end').hidden = false; Snd.tension(0.1);
}
$('startBtn').onclick = begin; $('againBtn').onclick = begin;
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play' && G && !G.ui) pause(); });
(function grain() { const c = cnv(160, 160), x = c.getContext('2d'), im = x.createImageData(160, 160); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); $('grain').style.backgroundImage = `url(${c.toDataURL()})`; })();
if (innerWidth > innerHeight) $('orientHint').hidden = true;
resize(); requestAnimationFrame(frame);
