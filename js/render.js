'use strict';
/* Рейкастер от первого лица: стены, пол/потолок, спрайты, двери, свет фонаря и свечей.
   Второй холст (#ov) рисует поверх руку с фонарём, пыль в луче и свечение огня. */
const view = $('view'), vctx = view.getContext('2d', { alpha: false });
const ov = $('ov'), octx = ov.getContext('2d');
let W = 0, H = 0, img, out32, zbuf, cone, focal, planeLen, odpr = 1;
const flames = [];
const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), vx: rand(-.01, .01), vy: rand(-.006, .004) }));

function resize() {
  const w = innerWidth, h = innerHeight, s = Math.sqrt(250000 / (w * h));
  W = Math.max(160, Math.round(w * s)); H = Math.max(120, Math.round(h * s));
  view.width = W; view.height = H; img = vctx.createImageData(W, H); out32 = new Uint32Array(img.data.buffer); zbuf = new Float32Array(W);
  focal = Math.max(W / (2 * 0.72), H / (2 * 0.92)); planeLen = W / (2 * focal);
  cone = new Float32Array(W * H); const R = Math.min(W, H) * 0.62;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - W / 2) / R, dy = (y - H / 2) / R, d = dx * dx + dy * dy; cone[y * W + x] = 0.05 + 0.95 * Math.pow(Math.max(0, 1 - d), 1.5); }
  odpr = Math.min(2, devicePixelRatio || 1); ov.width = Math.round(w * odpr); ov.height = Math.round(h * odpr);
  if (typeof fitComic === 'function') fitComic();
}

function lightsList() {
  const L = [];
  for (const o of objs) {
    if (o.gone) continue;
    if ((o.act === 'candle' && o.lit) || o.light) L.push({ x: o.x, y: o.y, i: 0.8 + Math.sin(G.time * 13 + o.x * 3) * 0.08 + Math.random() * 0.06, r: 1.0, g: 0.58, b: 0.28 });
  }
  if (ghost.mode !== 'off') L.push({ x: ghost.x, y: ghost.y, i: 0.45, r: 0.45, g: 0.6, b: 0.78, ghost: 1 });
  return L;
}

function render() {
  const px = G.px, py = G.py, dirX = Math.cos(G.ang), dirY = Math.sin(G.ang), plX = -dirY * planeLen, plY = dirX * planeLen;
  const hor = (H / 2 + G.pitch + Math.sin(G.bob) * H * 0.008) | 0;
  const fl = G.flash * (1 - G.dark), TR = G.tint[0], TG = G.tint[1], TB = G.tint[2];
  const AR = 0.03, AG = 0.032, AB = 0.045;
  const L = lightsList(), nL = L.length;
  const rd0x = dirX - plX, rd0y = dirY - plY, rd1x = dirX + plX, rd1y = dirY + plY, half = focal * 0.5;
  /* пол и потолок */
  for (let y = 0; y < H; y++) {
    const p = y - hor, row = y * W;
    if (p === 0) { out32.fill(0xFF000000, row, row + W); continue; }
    const isF = p > 0, rd = half / (isF ? p : -p);
    if (rd > 14) { out32.fill(0xFF000000, row, row + W); continue; }
    let fx = px + rd * rd0x, fy = py + rd * rd0y; const sx = rd * (rd1x - rd0x) / W, sy = rd * (rd1y - rd0y) / W;
    const fall = fl * 1.35 / (1 + 0.13 * rd * rd) * (isF ? 1 : 0.7);
    const ctd = TC.d;
    for (let x = 0; x < W; x++, fx += sx, fy += sy) {
      const ti = ((((fy * 128) & 127) << 7) | ((fx * 128) & 127)) << 2;
      const td = isF ? FT[floorMap[(fy | 0) * MW + (fx | 0)] || 0].d : ctd;
      const base = fall * cone[row + x]; let lr = base + AR, lg = base * 0.92 + AG, lb = base * 0.8 + AB;
      for (let k = 0; k < nL; k++) { const l = L[k], dx = fx - l.x, dy = fy - l.y, v = l.i / (1 + (dx * dx + dy * dy) * 2.4); lr += v * l.r; lg += v * l.g; lb += v * l.b; }
      const r = td[ti] * lr * TR, g = td[ti + 1] * lg * TG, b = td[ti + 2] * lb * TB;
      out32[row + x] = 0xFF000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
    }
  }
  /* стены */
  for (let x = 0; x < W; x++) {
    const cam = 2 * x / W - 1, rdx = dirX + plX * cam, rdy = dirY + plY * cam;
    let mx = px | 0, my = py | 0; const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy); let stx, sty, sdx, sdy;
    if (rdx < 0) { stx = -1; sdx = (px - mx) * ddx; } else { stx = 1; sdx = (mx + 1 - px) * ddx; }
    if (rdy < 0) { sty = -1; sdy = (py - my) * ddy; } else { sty = 1; sdy = (my + 1 - py) * ddy; }
    let hit = 0, side = 0, n = 0, shift = 0;
    while (n++ < 90) {
      if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; }
      if (mx < 0 || my < 0 || mx >= MW || my >= MH) { hit = 1; break; }
      const mi = my * MW + mx; hit = map[mi];
      if (hit) {
        const o = dOpen[mi];
        if (o > 0) { const pp = side === 0 ? sdx - ddx : sdy - ddy; let w2 = side === 0 ? py + pp * rdy : px + pp * rdx; w2 -= Math.floor(w2); if (w2 < o) { hit = 0; continue; } shift = o; }
        break;
      }
    }
    const perp = Math.max(0.01, side === 0 ? sdx - ddx : sdy - ddy); zbuf[x] = perp;
    const hx = px + perp * rdx, hy = py + perp * rdy; let wx = side === 0 ? hy : hx; wx -= Math.floor(wx); wx -= shift;
    let tx = (wx * 128) | 0; if ((side === 0 && rdx < 0) || (side === 1 && rdy > 0)) tx = 127 - tx; tx &= 127;
    const tex = WT[hit - 1] || WT[0], td = tex.d, te = tex.e;
    const lh = focal / perp, top = hor - lh * 0.5, bot = hor + lh * 0.5;
    const y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(H, Math.ceil(bot));
    const fall = fl * 1.35 / (1 + 0.13 * perp * perp) * (side ? 0.72 : 1);
    let pr = AR, pg = AG, pb = AB;
    for (let k = 0; k < nL; k++) { const l = L[k], dx = hx - l.x, dy = hy - l.y, v = l.i / (1 + (dx * dx + dy * dy) * 2.4) * (side ? 0.8 : 1); pr += v * l.r; pg += v * l.g; pb += v * l.b; }
    const step = 128 / lh; let tp = (y0 - top) * step;
    const glow = te ? 0.9 + Math.sin(G.time * 2 + x * 0.01) * 0.1 : 0;
    for (let y = y0; y < y1; y++, tp += step) {
      const pi = ((tp & 127) << 7) | tx, ti = pi << 2; let c = fall * cone[y * W + x];
      if (te) c += te[pi] * glow;
      const r = td[ti] * (c + pr) * TR, g = td[ti + 1] * (c * 0.92 + pg) * TG, b = td[ti + 2] * (c * 0.8 + pb) * TB;
      out32[y * W + x] = 0xFF000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
    }
  }
  /* спрайты */
  flames.length = 0;
  const list = [];
  for (const o of objs) { if (o.gone || o === G.hidden) continue; const dx = o.x - px, dy = o.y - py; list.push({ o, d: dx * dx + dy * dy, tex: SP[o.s], h: o.h, self: o.self || ((o.act === 'candle' && o.lit) || o.light ? 1.1 : 0), flame: (o.act === 'candle' && o.lit) || o.light }); }
  if (ghost.mode !== 'off') { const dx = ghost.x - px, dy = ghost.y - py; list.push({ o: ghost, d: dx * dx + dy * dy, tex: (ghost.mode === 'hunt' || ghost.mode === 'chase' || ghost.mode === 'ritual') ? SP.ghostS : SP.ghost, h: 1.05, self: 0.4, ghost: 1 }); }
  list.sort((a, b) => b.d - a.d);
  const invDet = 1 / (plX * dirY - dirX * plY);
  for (const s of list) {
    const dx = s.o.x - px, dy = s.o.y - py;
    const tX = invDet * (dirY * dx - dirX * dy), tY = invDet * (-plY * dx + plX * dy);
    if (tY < 0.15) continue;
    const tex = s.tex; if (!tex) continue;
    const sxc = (W / 2) * (1 + tX / tY), bottom = hor + half / tY, hgt = focal * s.h / tY, top = bottom - hgt, wid = hgt * tex.w / tex.h, left = sxc - wid / 2;
    const x0 = Math.max(0, Math.ceil(left)), x1 = Math.min(W, Math.ceil(left + wid)), y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(H, Math.ceil(bottom));
    if (x0 >= x1 || y0 >= y1) continue;
    if (s.flame) { const fx = sxc | 0; if (fx >= 0 && fx < W && zbuf[fx] > tY) flames.push({ x: sxc, y: top + hgt * 0.07, r: hgt * 0.5 }); }
    const fall = fl * 1.35 / (1 + 0.13 * tY * tY);
    let pr = AR, pg = AG, pb = AB;
    for (let k = 0; k < nL; k++) { const l = L[k]; if (s.ghost && l.ghost) continue; const ex = s.o.x - l.x, ey = s.o.y - l.y, v = l.i / (1 + (ex * ex + ey * ey) * 2.4); pr += v * l.r; pg += v * l.g; pb += v * l.b; }
    const self = s.self, td = tex.d, tw = tex.w, th = tex.h, gt = G.time;
    for (let x = x0; x < x1; x++) {
      if (tY >= zbuf[x]) continue;
      if (s.ghost && Math.random() < 0.06) continue;
      const tx = ((x - left) / wid * tw) | 0;
      const sway = s.ghost ? Math.sin(gt * 3 + tx * 0.12) * 3 : 0;
      for (let y = y0; y < y1; y++) {
        let ty = ((y - top) / hgt * th + (s.ghost ? sway * ((y - top) / hgt) : 0)) | 0; if (ty < 0) ty = 0; else if (ty >= th) ty = th - 1;
        const ti = (ty * tw + tx) << 2; if (td[ti + 3] < 128) continue;
        const c = fall * cone[y * W + x] + self;
        const r = td[ti] * (c + pr) * TR, g = td[ti + 1] * (c * (s.ghost ? 1 : 0.92) + pg) * TG, b = td[ti + 2] * (c * (s.ghost ? 1.08 : 0.8) + pb) * TB;
        out32[y * W + x] = 0xFF000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
      }
    }
  }
  vctx.putImageData(img, 0, 0);
}

/* ---------- верхний слой: огонь, пыль, рука с фонарём ---------- */
function drawOverlay(dt) {
  const c = octx, w = innerWidth, h = innerHeight; c.setTransform(odpr, 0, 0, odpr, 0, 0); c.clearRect(0, 0, w, h);
  const kx = w / W, ky = h / H, fl = G.flash * (1 - G.dark);
  c.globalCompositeOperation = 'lighter';
  for (const f of flames) { const x = f.x * kx, y = f.y * ky, r = Math.max(8, f.r * ky) * (0.9 + Math.random() * 0.15); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,170,80,.45)'); g.addColorStop(0.35, 'rgba(255,120,40,.12)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  if (fl > 0.05) {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.55); g.addColorStop(0, `rgba(255,235,190,${0.06 * fl})`); g.addColorStop(1, 'rgba(255,235,190,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (const p of dust) {
      p.x += (p.vx - G.sway * 0.05) * dt; p.y += p.vy * dt; if (p.x < 0) p.x += 1; if (p.x > 1) p.x -= 1; if (p.y < 0) p.y += 1; if (p.y > 1) p.y -= 1;
      const dx = p.x - 0.5, dy = (p.y - 0.5) * h / w, d = Math.sqrt(dx * dx + dy * dy); const a = fl * Math.max(0, 1 - d / 0.33) * 0.55; if (a < 0.02) continue;
      c.fillStyle = `rgba(255,240,210,${a})`; const s = 0.6 + p.z * 1.6; c.fillRect(p.x * w, p.y * h, s, s);
    }
  }
  c.globalCompositeOperation = 'source-over';
  if (!G.hidden) drawHand(c, w, h);
}
function drawHand(c, w, h) {
  const u = Math.min(w, h) / 390;
  const bx = w * 0.76 + Math.sin(G.bob * 0.5) * 7 * u - G.sway * 26 * u, by = h + 10 * u + Math.abs(Math.cos(G.bob * 0.5)) * 7 * u + (G.lamp ? 0 : 40 * u);
  c.save(); c.translate(bx, by); c.rotate(-0.38 + G.sway * 0.08);
  const sl = c.createLinearGradient(-40 * u, 0, 40 * u, 0); sl.addColorStop(0, '#0b0807'); sl.addColorStop(0.5, '#231a14'); sl.addColorStop(1, '#0b0807');
  c.fillStyle = sl; c.beginPath(); c.moveTo(-46 * u, 40 * u); c.lineTo(46 * u, 40 * u); c.lineTo(26 * u, -74 * u); c.lineTo(-24 * u, -74 * u); c.fill();
  const mg = c.createLinearGradient(-13 * u, 0, 13 * u, 0); mg.addColorStop(0, '#141416'); mg.addColorStop(0.45, '#6e6e76'); mg.addColorStop(1, '#222226');
  c.fillStyle = mg; c.fillRect(-12 * u, -186 * u, 24 * u, 120 * u);
  c.fillStyle = '#2a2a2e'; for (let i = 0; i < 6; i++) c.fillRect(-12 * u, (-170 + i * 9) * u, 24 * u, 2 * u);
  c.fillStyle = mg; c.beginPath(); c.moveTo(-13 * u, -186 * u); c.lineTo(-20 * u, -214 * u); c.lineTo(20 * u, -214 * u); c.lineTo(13 * u, -186 * u); c.fill();
  c.fillStyle = (G.lamp && G.bat > 0) ? '#fff4cc' : '#2b2b2e'; c.beginPath(); c.ellipse(0, -214 * u, 20 * u, 5 * u, 0, 0, 7); c.fill();
  if (G.lamp && G.bat > 0) { c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(0, -214 * u, 0, 0, -214 * u, 60 * u); lg.addColorStop(0, `rgba(255,240,200,${0.5 * G.flash})`); lg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = lg; c.beginPath(); c.arc(0, -214 * u, 60 * u, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; }
  const sk = c.createLinearGradient(-30 * u, 0, 20 * u, 0); sk.addColorStop(0, '#6a5444'); sk.addColorStop(0.6, '#b49a82'); sk.addColorStop(1, '#7a6250'); c.fillStyle = sk;
  c.beginPath(); c.roundRect(-24 * u, -152 * u, 40 * u, 58 * u, 12 * u); c.fill();
  c.fillStyle = 'rgba(40,24,16,.45)'; for (let i = 1; i < 4; i++) c.fillRect(-24 * u, (-152 + i * 14.5) * u, 30 * u, 1.6 * u);
  c.fillStyle = 'rgba(255,230,210,.18)'; c.fillRect(-22 * u, -150 * u, 6 * u, 54 * u);
  c.fillStyle = sk; c.beginPath(); c.ellipse(13 * u, -150 * u, 7 * u, 17 * u, -0.25, 0, 7); c.fill();
  c.restore();
}
