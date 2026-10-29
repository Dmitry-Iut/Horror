'use strict';
/* Интерфейс: записки, замок, портрет, колокола, укрытие, пауза, подсказки, ввод с экрана и клавиатуры. */
const MELODY = [2, 0, 1, 3, 2];      // колыбельная: III — I — II — IV — III
const ROM = ['I', 'II', 'III', 'IV'];

function staffSVG() {
  const notes = MELODY.map((b, i) => `<ellipse cx="${46 + i * 46}" cy="${64 - b * 10}" rx="9" ry="6.5" transform="rotate(-18 ${46 + i * 46} ${64 - b * 10})" fill="#2a1a10"/><line x1="${54 + i * 46}" y1="${62 - b * 10}" x2="${54 + i * 46}" y2="${30 - b * 10}" stroke="#2a1a10" stroke-width="2"/>`).join('');
  const lines = [0, 1, 2, 3, 4].map(k => `<line x1="10" x2="270" y1="${24 + k * 10}" y2="${24 + k * 10}" stroke="#6a4a30" stroke-width="1"/>`).join('');
  return `<svg viewBox="0 0 280 90" width="100%" style="max-width:320px;display:block;margin:10px 0" aria-label="Ноты колыбельной">${lines}${notes}</svg>`;
}
const NOTES = {
  n1: { t: 'Записка Веры', b: 'Если ты читаешь это, значит, письмо дошло.\n\nЯ нашла в архиве правду. Агриппину замуровали, а её чётки спрятали в часовне, чтобы душа не нашла покоя. Без них она не может уйти.\n\nКлюч от трапезной я бросила в купель, в крещальне. Это дверь справа. Вода там чёрная, не бойся опустить руку.\n\nФонарь садится быстро. Я оставляю батарейки, где могу.\n\nИ запомни: когда становится тихо, она рядом.\n\n— В.' },
  n2: { t: 'Летопись обители, 1964', b: 'В ночь, когда её замуровали, колокол бил сам по себе. Сначала трижды, потом один раз, потом четырежды, потом дважды.\n\nС тех пор мы зажигаем свечи в трапезной только в этом порядке. Иначе она слышит.\n\nРешётку к кельям заперли на тот же порядок.\n\nНа полях почерком Веры: «III — I — IV — II. Спички на кухне, справа».' },
  n3: { t: 'Записка Веры', b: 'Библиотеку сёстры заперли на кодовый замок, а код нарочно забыли.\n\nНо Агриппина помнила. Она выцарапала по цифре на стене каждой своей кельи.\n\nЧитай по порядку: келья I, келья II, келья III. Первая — самая северная.\n\nВ лазарете в конце коридора есть батарейки. И кое-что ещё. Не смотри на кровати.\n\n— В.' },
  n4: { t: 'Журнал лазарета, 1963', b: 'Тиф пришёл в деревню в ноябре. Сестра Агриппина одна выхаживала детей, ночами пела им колыбельную.\n\nДети умирали всё равно. В деревне стали говорить, что их убивает её песня.\n\nМать-настоятельница велела ей молчать. Агриппина не замолчала.\n\nПоследняя запись другим почерком: «Она ни в чём не виновата. Господи, прости нас».' },
  n5: { t: 'Колыбельная Агриппины', html: true, b: 'Ноты, переписанные дрожащей рукой. На колокольне четыре колокола: I — самый низкий, IV — самый высокий.' },
  n6: { t: 'Записка Веры', b: 'Её портрет разбили и бросили на этом столе. За рамкой спрятан ключ от колокольни.\n\nКогда соберёшь портрет, она проснётся по-настоящему. Будет ходить здесь, по библиотеке и коридору.\n\nВыключай фонарь: в темноте она почти слепая. Не беги без нужды, она слышит шаги. Если увидит — прячься в шкаф и не дыши, пока она рядом.\n\n— В.' },
  n7: { t: 'Записка Веры', b: 'Если колокола споют её колыбельную, цепи на часовне упадут. Так написано в летописи.\n\nЯ ухожу в крипту. Там холодно, но она туда не спускается без чёток.\n\nКогда возьмёшь чётки, беги в крипту через восточную дверь часовни. Положи их на гроб и держи её в свете фонаря, пока она не уйдёт.\n\n— В.' },
  n8: { t: 'Исповедь настоятельницы', b: 'Я приказала замуровать невинную. Её чётки я забрала себе и положила на алтарь, чтобы она никогда не нашла дороги.\n\nКаждую ночь я слышу, как она поёт за стеной.\n\nТот, кто вернёт ей чётки, освободит её. И нас.' },
};
const HINTS = ['Записка лежит на кафедре слева в зале.', 'Крещальня — дверь в правой стене зала. Опусти руку в купель.', 'Дверь трапезной — в северной стене зала. Открой её ключом.', 'Летопись лежит в трапезной у западной стены. Спички — на кухне, дверь справа в трапезной. Проверь все шкафчики.', 'Порядок свечей: III, I, IV, II. Номер свечи видно, когда подходишь к ней.', 'Цифры нацарапаны на дальних стенах келий. Келья I — северная, III — южная. Дверь библиотеки — в восточной стене коридора, напротив кельи I.', 'Подойди к столу в центре библиотеки и поверни все осколки портрета.', 'Колокольня — железная дверь в северной стене библиотеки. Выключай фонарь (кнопка с лампой), прячься в шкафы.', 'Послушай шкатулку и посмотри на ноты в библиотеке. Колокола: I низкий … IV высокий. Мелодия из пяти нот.', 'Часовня — дверь в восточной стене библиотеки. Чётки на алтаре.', 'Восточная дверь часовни ведёт вниз, к крипте. Беги!', 'Наведи центр экрана на призрака и держи, пока не заполнится полоска. Нужен включённый фонарь.'];

let toastT = null;
function toast(t, ms = 2800, warn = false) { const el = $('toast'); el.textContent = t; el.classList.toggle('warn', warn); el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), ms); }
function updateInv() { const a = []; if (G.key) a.push('Ключ'); if (G.matches) a.push('Спички'); if (G.bellKey) a.push('Ключ колокольни'); if (G.rosary) a.push('Чётки'); $('inv').innerHTML = a.map(t => `<span>${t}</span>`).join(''); }
function updateHUD() {
  const b = $('batFill'); b.style.width = Math.max(0, G.bat) + '%'; b.classList.toggle('low', G.bat < 20);
  $('lampBtn').classList.toggle('off', !G.lamp);
  const r = $('ritual'); if (G.ritual) { r.hidden = false; $('ritFill').style.width = (G.ritual.m * 100) + '%'; } else r.hidden = true;
  if (G.hidden) $('breathFill').style.width = (G.breath * 100) + '%';
}

/* ---------- записки ---------- */
function openNote(id) {
  const n = NOTES[id]; $('noteTitle').textContent = n.t;
  if (n.html) $('noteBody').innerHTML = `<p>${n.b}</p>${staffSVG()}<p>Под нотами приписка: «Пять ударов. Последний — как первый».</p>`; else $('noteBody').textContent = n.b;
  $('note').hidden = false; G.ui = 'note'; Snd.click(); $('paper').scrollTop = 0;
}
function closeNote() { $('note').hidden = true; G.ui = null; if (!G.F.firstNote) { G.F.firstNote = 1; setTimeout(() => Snd.knock(3, 0.8, 0.8), 1800); } }
$('noteClose').onclick = closeNote; $('note').addEventListener('click', e => { if (e.target === $('note')) closeNote(); });

/* ---------- кодовый замок ---------- */
const lockVals = [0, 0, 0];
(function buildLock() {
  const w = $('wheels');
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('div'); d.className = 'wheel';
    d.innerHTML = `<button aria-label="Больше">▲</button><span id="lv${i}">0</span><button aria-label="Меньше">▼</button>`;
    const [u, , dn] = d.children;
    u.onclick = () => { lockVals[i] = (lockVals[i] + 1) % 10; $('lv' + i).textContent = lockVals[i]; Snd.click(); };
    dn.onclick = () => { lockVals[i] = (lockVals[i] + 9) % 10; $('lv' + i).textContent = lockVals[i]; Snd.click(); };
    w.appendChild(d);
  }
})();
function openLock() { G.ui = 'lock'; $('lock').hidden = false; }
function closeLock() { $('lock').hidden = true; G.ui = null; }
$('lockBack').onclick = closeLock;
$('lockOk').onclick = () => {
  if (lockVals.join('') === '713') { closeLock(); Snd.click(); openDoor(12, 15, 0.9); setStage(6); toast('Замок щёлкает. Изнутри пахнет пылью и старой бумагой.'); }
  else { Snd.buzz(); G.wrongCode = (G.wrongCode || 0) + 1; if (G.wrongCode % 2 === 0) { closeLock(); flicker(0.6); Snd.knock(4, 1.3, -0.6); toast('С той стороны двери кто-то стучит в ответ.'); } }
};

/* ---------- портрет ---------- */
const photo = { rot: [], cv: $('photoCv') };
function openPhoto() {
  if (!photo.rot.length) { photo.rot = Array.from({ length: 9 }, () => (1 + (Math.random() * 3 | 0))); photo.rot[4] = 0; }
  G.ui = 'photo'; $('photo').hidden = false; drawPhoto();
}
function drawPhoto() {
  const c = photo.cv.getContext('2d'), s = 110; c.fillStyle = '#0a0706'; c.fillRect(0, 0, 330, 330);
  for (let i = 0; i < 9; i++) { const gx = i % 3, gy = (i / 3) | 0; c.save(); c.translate(gx * s + s / 2, gy * s + s / 2); c.rotate(photo.rot[i] * Math.PI / 2); c.drawImage(portraitCv, gx * s, gy * s, s, s, -s / 2 + 2, -s / 2 + 2, s - 4, s - 4); c.restore(); }
  c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 3; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(k * s, 0); c.lineTo(k * s, 330); c.moveTo(0, k * s); c.lineTo(330, k * s); c.stroke(); }
}
photo.cv.addEventListener('click', e => {
  const r = photo.cv.getBoundingClientRect(), gx = ((e.clientX - r.left) / r.width * 3) | 0, gy = ((e.clientY - r.top) / r.height * 3) | 0, i = clamp(gy, 0, 2) * 3 + clamp(gx, 0, 2);
  photo.rot[i] = (photo.rot[i] + 1) % 4; Snd.click(); drawPhoto();
  if (photo.rot.every(v => v === 0)) { G.ui = 'locked'; setTimeout(() => { $('photo').hidden = true; G.ui = null; photoSolved(); }, 900); }
});
$('photoBack').onclick = () => { $('photo').hidden = true; G.ui = null; };

/* ---------- колокола ---------- */
let bellInput = [];
(function buildBells() {
  const box = $('ropes');
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('button'); b.className = 'rope'; b.innerHTML = `<i></i><b>${ROM[i]}</b>`; b.setAttribute('aria-label', 'Колокол ' + ROM[i]);
    b.onclick = () => ringBell(i, b); box.appendChild(b);
  }
})();
function openBells() { G.ui = 'bells'; bellInput = []; renderBellSeq(); $('bells').hidden = false; }
function closeBells() { $('bells').hidden = true; G.ui = null; }
function renderBellSeq() { $('bellSeq').innerHTML = MELODY.map((_, i) => `<span class="${i < bellInput.length ? 'on' : ''}">${i < bellInput.length ? ROM[bellInput[i]] : '·'}</span>`).join(''); }
function ringBell(i, el) {
  if (G.ui !== 'bells') return;
  Snd.bell(BELLF[i], 0.55); el.classList.remove('swing'); void el.offsetWidth; el.classList.add('swing');
  bellInput.push(i); renderBellSeq();
  const k = bellInput.length - 1;
  if (bellInput[k] !== MELODY[k]) {
    G.wrongBells = (G.wrongBells || 0) + 1;
    setTimeout(() => { Snd.buzz(); $('bellMsg').textContent = 'Фальшь. Колокола гудят недовольно. Начни сначала.'; bellInput = []; renderBellSeq(); if (G.wrongBells % 3 === 0) { closeBells(); subliminal('eyes'); } }, 350);
    return;
  }
  if (bellInput.length === MELODY.length) { G.ui = 'locked'; setTimeout(() => { closeBells(); bellsSolved(); }, 900); }
}
$('musicBox').onclick = () => { Snd.musicBox(MELODY); $('bellMsg').textContent = 'Шкатулка играет пять нот…'; };
$('bellsBack').onclick = closeBells;

/* ---------- укрытие в шкафу ---------- */
function showHideUI(on) { $('hide').hidden = !on; $('hud').classList.toggle('hiding', on); }
const holdBtn = $('holdBtn');
holdBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (G.breath > 0.05) { G.holding = true; holdBtn.classList.add('on'); } });
const release = () => { if (G.holding) { G.holding = false; holdBtn.classList.remove('on'); Snd.breath(0.2); } };
holdBtn.addEventListener('pointerup', release); holdBtn.addEventListener('pointercancel', release); holdBtn.addEventListener('pointerleave', release);
$('leaveBtn').onclick = () => leaveHide();

/* ---------- пауза ---------- */
function pause() { if (!G || G.ui || state !== 'play') return; G.ui = 'pause'; $('hintText').textContent = ''; $('pause').hidden = false; }
function resume() { $('pause').hidden = true; G.ui = null; }
$('pauseBtn').onclick = pause; $('resumeBtn').onclick = resume;
$('hintBtn').onclick = () => { $('hintText').textContent = HINTS[G.stage] || ''; };
let muted = false; $('muteBtn').onclick = () => { muted = !muted; Snd.mute(muted); $('muteBtn').textContent = 'Звук: ' + (muted ? 'выключен' : 'включён'); };
$('restartBtn').onclick = () => { $('pause').hidden = true; begin(); };
$('lampBtn').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); toggleLamp(); });
$('act').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); doAction(); });

/* ---------- ввод ---------- */
const inp = { mx: 0, my: 0, keys: {}, stick: null, look: null, sx: 0, sy: 0, lx: 0, ly: 0, used: false };
const touch = $('touch'), stickEl = $('stick'), knob = $('knob');
touch.addEventListener('pointerdown', e => {
  if (!G || state !== 'play') return; if (G.ui && G.ui !== 'hide') return; e.preventDefault();
  if (e.pointerType !== 'mouse' && e.clientX < innerWidth * 0.45 && inp.stick === null && !G.hidden) {
    inp.stick = e.pointerId; inp.sx = e.clientX; inp.sy = e.clientY; stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px'; stickEl.style.display = 'block'; knob.style.transform = 'translate(0,0)';
  } else if (inp.look === null) { inp.look = e.pointerId; inp.lx = e.clientX; inp.ly = e.clientY; }
  try { touch.setPointerCapture(e.pointerId); } catch (_) {}
  hideHelp();
});
touch.addEventListener('pointermove', e => {
  if (e.pointerId === inp.stick) { let dx = e.clientX - inp.sx, dy = e.clientY - inp.sy; const d = Math.hypot(dx, dy), m = 55; if (d > m) { dx *= m / d; dy *= m / d; } inp.mx = dx / m; inp.my = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; }
  else if (e.pointerId === inp.look) {
    const dx = e.clientX - inp.lx, dy = e.clientY - inp.ly; inp.lx = e.clientX; inp.ly = e.clientY;
    if (G && !G.frozen) { G.ang += dx * 0.0068; G.turn += dx * 0.0068; G.pitch = clamp(G.pitch - dy * (H / innerHeight) * 0.9, -H * 0.3, H * 0.3); if (G.hidden) G.ang = G.hidden.face + clamp(angDiff(G.ang, G.hidden.face), -0.7, 0.7); }
  }
});
const endPtr = e => { if (e.pointerId === inp.stick) { inp.stick = null; inp.mx = inp.my = 0; stickEl.style.display = 'none'; } if (e.pointerId === inp.look) inp.look = null; };
touch.addEventListener('pointerup', endPtr); touch.addEventListener('pointercancel', endPtr);
addEventListener('keydown', e => {
  inp.keys[e.code] = true; if (!G || state !== 'play') return;
  if (e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); if (G.ui === 'note') closeNote(); else if (G.hidden) leaveHide(); else if (!G.ui) doAction(); }
  if (e.code === 'Space') { e.preventDefault(); if (G.hidden && G.breath > 0.05) { G.holding = true; holdBtn.classList.add('on'); } else if (!G.ui) doAction(); }
  if (e.code === 'KeyF' && !G.ui) toggleLamp();
  if (e.code === 'Escape') { if (G.ui === 'pause') resume(); else if (!G.ui) pause(); else if (G.ui === 'note') closeNote(); else if (G.ui === 'lock') closeLock(); else if (G.ui === 'bells') closeBells(); else if (G.ui === 'photo') { $('photo').hidden = true; G.ui = null; } }
  hideHelp();
});
addEventListener('keyup', e => { inp.keys[e.code] = false; if (e.code === 'Space') release(); });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (e.target.closest && e.target.closest('.paper')) return; e.preventDefault(); }, { passive: false });
function hideHelp() { if (!inp.used) { inp.used = true; setTimeout(() => $('help').classList.add('gone'), 1500); } }
