'use strict';
/* Карта обители. Клетка 0 — пол, остальное — номер текстуры стены + 1. */
const MW = 42, MH = 38;
const T = { STONE: 1, STONE2: 2, WOOD: 3, DOOR: 4, LOCKED: 5, GRATE: 6, CODE: 7, CROSS: 8, FRESCO: 9, D1: 10, D2: 11, D3: 12, W1: 13, ENTR: 14, CRYPT: 15, W2: 16, TILE: 17, TILE2: 18, SHELF: 19, BRICK: 20, GLASS: 21, OSS: 22, BELLD: 23, CHAPD: 24, W3: 25 };
const DOORS = new Set([T.DOOR, T.LOCKED, T.GRATE, T.CODE, T.ENTR, T.CRYPT, T.BELLD, T.CHAPD]);

/* комнаты: прямоугольник пола, текстура стен, текстура пола (0 камень, 1 плитка, 2 доски, 3 земля) */
const ROOMS = [
  { id: 'hall', name: 'Зал', r: [14, 30, 22, 34], w: T.STONE, f: 0 },
  { id: 'bapt', name: 'Крещальня', r: [24, 30, 28, 33], w: T.STONE2, f: 0 },
  { id: 'ref', name: 'Трапезная', r: [13, 22, 22, 28], w: T.WOOD, f: 2 },
  { id: 'kit', name: 'Кухня', r: [24, 23, 28, 27], w: T.TILE, f: 1 },
  { id: 'corr', name: 'Коридор келий', r: [10, 10, 11, 27], w: T.STONE, f: 0 },
  { id: 'c1', name: 'Келья I', r: [6, 13, 8, 15], w: T.STONE2, f: 3 },
  { id: 'c2', name: 'Келья II', r: [6, 17, 8, 19], w: T.STONE2, f: 3 },
  { id: 'c3', name: 'Келья III', r: [6, 21, 8, 23], w: T.STONE2, f: 3 },
  { id: 'inf', name: 'Лазарет', r: [5, 29, 11, 33], w: T.TILE2, f: 1 },
  { id: 'lib', name: 'Библиотека', r: [13, 12, 21, 18], w: T.SHELF, f: 2 },
  { id: 'bell', name: 'Колокольня', r: [15, 5, 19, 9], w: T.BRICK, f: 0 },
  { id: 'chap', name: 'Часовня', r: [24, 10, 32, 17], w: T.CROSS, f: 0 },
  { id: 'cpass', name: 'Спуск в крипту', r: [34, 13, 37, 13], w: T.OSS, f: 3 },
  { id: 'cpass', name: 'Спуск в крипту', r: [37, 14, 37, 24], w: T.OSS, f: 3 },
  { id: 'crypt', name: 'Крипта', r: [33, 25, 40, 29], w: T.OSS, f: 3 },
];
let map, dOpen, floorMap, roomMap;
const tileAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? 1 : map[(y | 0) * MW + (x | 0)];
const roomAt = (x, y) => { const i = roomMap[(y | 0) * MW + (x | 0)]; return i >= 0 ? ROOMS[i].id : null; };

function buildMap() {
  map = new Uint8Array(MW * MH).fill(T.STONE); dOpen = new Float32Array(MW * MH); floorMap = new Uint8Array(MW * MH); roomMap = new Int8Array(MW * MH).fill(-1);
  const set = (x, y, v) => { map[y * MW + x] = v; };
  const get = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? 1 : map[y * MW + x];
  ROOMS.forEach((R, ri) => { const [x0, y0, x1, y1] = R.r; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { set(x, y, 0); floorMap[y * MW + x] = R.f; roomMap[y * MW + x] = ri; } });
  [[9, 14], [9, 18], [9, 22], [17, 10], [22, 14]].forEach(([x, y]) => set(x, y, 0));
  // стены берут текстуру соседней комнаты
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (get(x, y) === 0) continue;
    let w = 0;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const i = (y + b) * MW + x + a; if (x + a < 0 || y + b < 0 || x + a >= MW || y + b >= MH) continue; if (map[i] === 0 && roomMap[i] >= 0) { w = ROOMS[roomMap[i]].w; break; } }
    if (!w) w = Math.random() < 0.25 ? T.STONE2 : T.STONE;
    if (w === T.CROSS) w = (y === 9) ? ((x % 2) ? T.GLASS : T.CROSS) : ((x + y) % 3 === 0 ? T.FRESCO : T.CROSS);
    if (w === T.STONE && Math.random() < 0.2) w = T.STONE2;
    set(x, y, w);
  }
  set(23, 31, T.DOOR); set(18, 29, T.LOCKED); set(23, 25, T.DOOR); set(12, 25, T.GRATE); set(10, 28, T.DOOR);
  set(12, 15, T.CODE); set(17, 11, T.BELLD); set(23, 14, T.CHAPD); set(33, 13, T.CRYPT); set(18, 35, T.ENTR);
  set(5, 14, T.D1); set(5, 18, T.D2); set(5, 22, T.D3);
  set(9, 20, T.W1); set(9, 16, T.W1); set(38, 20, T.W2); set(14, 29, T.W2);
  set(13, 32, T.FRESCO); set(23, 33, T.FRESCO); set(16, 4, T.GLASS); set(18, 4, T.GLASS);
}
