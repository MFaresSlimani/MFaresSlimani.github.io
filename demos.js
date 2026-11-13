(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  };
  let drawMoon = () => {};
  addEventListener('themechange', () => drawMoon());

  /* ---------- scrolly phones ---------- */
  $$('.case').forEach((c) => {
    const screen = $('.phone__screen', c);
    const steps = $$('.step', c);
    const imgs = steps.map((s, i) => {
      const src = $('.step__shot', s);
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = '';
      img.decoding = 'async';
      if (i === 0) img.classList.add('is-on');
      screen.appendChild(img);
      return img;
    });
    steps[0].classList.add('is-on');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = steps.indexOf(e.target);
        steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
        imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  });

  /* ---------- 01 zakat ---------- */
  if ($('#moon')) {
  const SYNODIC = 29.530588853;
  const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14);
  const moonCanvas = $('#moon');

  function moonPhase(date) {
    const days = (date.getTime() - NEW_MOON_REF) / 86400000;
    return ((days / SYNODIC) % 1 + 1) % 1;
  }
  function phaseName(p) {
    const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
    return names[Math.round(p * 8) % 8];
  }
  drawMoon = function () {
    if (!moonCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 200;
    moonCanvas.width = size * dpr; moonCanvas.height = size * dpr;
    const ctx = moonCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = 84;
    const dark = isDark();
    const p = moonPhase(new Date());
    const k = Math.cos(2 * Math.PI * p);
    const waxing = p < 0.5;

    // unlit disc with earthshine
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = dark ? '#1F2622' : '#33382F'; ctx.fill();

    // lit region
    ctx.save();
    ctx.beginPath();
    if (waxing) {
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.ellipse(cx, cy, r * Math.abs(k), r, 0, Math.PI / 2, -Math.PI / 2, k > 0);
    } else {
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true);
      ctx.ellipse(cx, cy, r * Math.abs(k), r, 0, Math.PI / 2, -Math.PI / 2, k < 0);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, dark ? '#F4ECD6' : '#FBF6E8');
    g.addColorStop(1, dark ? '#C9BC97' : '#D8C79C');
    ctx.fillStyle = g; ctx.fill();
    ctx.clip();
    // a few maria, only visible on the lit side
    ctx.fillStyle = dark ? 'rgba(90,85,70,.22)' : 'rgba(120,105,75,.16)';
    [[-0.25, -0.3, 0.22], [0.15, -0.2, 0.16], [-0.05, 0.12, 0.2], [0.3, 0.25, 0.12], [-0.38, 0.28, 0.1]].forEach(([x, y, s]) => {
      ctx.beginPath(); ctx.ellipse(cx + x * r, cy + y * r, s * r, s * r * 0.8, 0.4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'; ctx.lineWidth = 1; ctx.stroke();

    const illum = Math.round((1 - k) / 2 * 100);
    $('#moon-phase').textContent = `${phaseName(p)} · ${illum}% lit · day ${Math.floor(p * SYNODIC) + 1} of the lunar month`;
  }
  try {
    $('#moon-hijri').textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  } catch (e) {}
  drawMoon();


  const ring = $('#ring');
  let hijriMonth = 1;
  try { hijriMonth = +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { month: 'numeric' }).format(new Date()) || 1; } catch (e) {}
  const SVGNS = 'http://www.w3.org/2000/svg';
  const arc = (cx, cy, r, a0, a1) => {
    const rad = (a) => (a - 90) * Math.PI / 180;
    const x0 = cx + r * Math.cos(rad(a0)), y0 = cy + r * Math.sin(rad(a0));
    const x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1));
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  function drawRing(len) {
    ring.innerHTML = '';
    const n = 12 / len;
    const current = Math.floor((hijriMonth - 1) / len);
    for (let m = 0; m < 12; m++) {
      const a = m * 30, rad = (a - 90) * Math.PI / 180;
      const t = document.createElementNS(SVGNS, 'line');
      t.setAttribute('x1', 110 + 98 * Math.cos(rad)); t.setAttribute('y1', 110 + 98 * Math.sin(rad));
      t.setAttribute('x2', 110 + 104 * Math.cos(rad)); t.setAttribute('y2', 110 + 104 * Math.sin(rad));
      t.setAttribute('stroke', 'var(--c-muted)'); t.setAttribute('stroke-width', '1.2');
      ring.appendChild(t);
    }
    for (let i = 0; i < n; i++) {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', arc(110, 110, 84, i * len * 30 + 3, (i + 1) * len * 30 - 3));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-width', '14');
      p.setAttribute('stroke-linecap', 'butt');
      p.setAttribute('stroke', i < current ? 'var(--brass)' : i === current ? 'var(--c-accent)' : 'var(--c-line)');
      ring.appendChild(p);
    }
    const label = (y, txt, cls) => {
      const t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('x', 110); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', cls === 'big' ? 'var(--c-ink)' : 'var(--c-muted)');
      t.setAttribute('style', cls === 'big' ? 'font: 400 44px var(--serif)' : 'font: 12px var(--mono)');
      t.textContent = txt; ring.appendChild(t);
    };
    label(112, String(n), 'big');
    label(134, n === 1 ? 'cycle / hawl' : 'cycles / hawl');
    $('#ring-note').textContent = `${n} cycles of ${len} Hijri months make one hawl. Brass: locked, green: this cycle (month ${hijriMonth}), grey: still to come.`;
  }
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    drawRing(+b.dataset.len);
  }));
  drawRing(3);

  }

  /* ---------- 02 french touch ---------- */
  if ($('#queue')) {
  const queueEl = $('#queue');
  const MENU = [
    ['Classique', 600], ['Crispy', 600], ['Tacos', 650], ['Pizza', 700], ['Poutine', 550], ['Frites', 200], ['Boisson', 100],
  ];
  const fmtDA = (n) => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  let ticketNo = 23, served = 0, cash = 0;
  const now = () => Date.now();
  const tickets = [];
  function makeOrder(status, ageMin) {
    const count = 1 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: count }, () => MENU[Math.floor(Math.random() * MENU.length)]);
    const total = items.reduce((s, [, p]) => s + p, 0);
    const takeaway = Math.random() < 0.3;
    tickets.push({
      no: ticketNo++, status, items, total,
      where: takeaway ? 'À emporter' : `Table ${1 + Math.floor(Math.random() * 12)}`,
      created: now() - ageMin * 1000,
    });
  }
  function renderQueue() {
    $$('.queue__col', queueEl).forEach((col) => {
      const st = +col.dataset.status;
      const list = tickets.filter((t) => t.status === st);
      const h = $('h4', col);
      h.innerHTML = `${h.textContent.replace(/\d+$/, '').trim()} <span>${list.length}</span>`;
      const ul = $('ul', col);
      ul.innerHTML = '';
      list.forEach((t) => {
        const li = document.createElement('li');
        const mins = Math.floor((now() - t.created) / 1000);
        li.innerHTML = `<button class="ticket${mins >= 15 ? ' is-late' : ''}" type="button" aria-label="Commande ${t.no}, avancer">
          <b>#${t.no}</b><span class="t-where">${t.where}</span><span class="t-time">${mins} min</span>
          <span class="t-items">${t.items.map(([n]) => n).join(' · ')} — ${fmtDA(t.total)}</span></button>`;
        $('button', li).addEventListener('click', () => advance(t));
        ul.appendChild(li);
      });
    });
    $('#queue-stats').textContent = `Servies : ${served} · Encaissé : ${fmtDA(cash)}`;
  }
  function advance(t) {
    t.status++;
    if (t.status > 2) {
      tickets.splice(tickets.indexOf(t), 1);
      served++; cash += t.total;
    }
    renderQueue();
  }
  // seed a believable lunch rush the first time the queue is on screen, so timers start then
  const seed = () => { makeOrder(0, 2); makeOrder(0, 0); makeOrder(1, 9); makeOrder(1, 13); makeOrder(2, 7); };
  seed();
  renderQueue();
  $('#new-order').addEventListener('click', () => { makeOrder(0, 0); renderQueue(); });
  let queueVisible = false;
  let seenQueue = false;
  new IntersectionObserver(([e]) => {
    queueVisible = e.isIntersecting;
    if (queueVisible && !seenQueue) {
      seenQueue = true;
      tickets.length = 0; ticketNo = 23; seed(); renderQueue();
    }
  }).observe(queueEl);
  setInterval(() => { if (queueVisible) renderQueue(); }, 1000);
  setInterval(() => {
    if (queueVisible && tickets.filter((t) => t.status === 0).length < 3) { makeOrder(0, 0); renderQueue(); }
  }, 14000);

  }

  /* ---------- 03 optica ---------- */
  if ($('#w-sph')) {
  const fmtD = (q) => (q > 0 ? '+' : q < 0 ? '−' : '') + (Math.abs(q) / 4).toFixed(2);
  const sel = { sph: -9, cyl: -2, type: 'HMC 1.56' };
  const lines = [];
  function buildWheel(ul, key, from, to) {
    for (let q = from; q <= to; q++) {
      const li = document.createElement('li');
      li.textContent = fmtD(q); li.dataset.q = q;
      li.addEventListener('click', () => scrollWheelTo(ul, q - from, true));
      ul.appendChild(li);
    }
    const items = $$('li', ul);
    const ITEM = 48;
    const update = () => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(ul.scrollTop / ITEM)));
      items.forEach((li, j) => li.classList.toggle('is-on', j === i));
      sel[key] = from + i;
      renderEnc();
    };
    let raf;
    ul.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    ul.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      scrollWheelTo(ul, sel[key] - from + (e.key === 'ArrowDown' ? 1 : -1), true);
    });
    scrollWheelTo(ul, sel[key] - from, false);
    update();
  }
  function scrollWheelTo(ul, i, smooth) {
    ul.scrollTo({ top: i * 48, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }
  function renderEnc() {
    $('#enc').innerHTML = `SPH <b>${fmtD(sel.sph)}</b> = ${sel.sph} × 0.25 &nbsp;·&nbsp; CYL <b>${fmtD(sel.cyl)}</b> = ${sel.cyl} × 0.25`;
  }
  function renderLines() {
    const ul = $('#lines');
    if (!lines.length) { ul.innerHTML = '<li class="empty">Nothing yet.</li>'; return; }
    ul.innerHTML = '';
    lines.forEach((l) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="qty${l.bump ? ' bump' : ''}">×${l.qty}</span><span class="name">${l.type}</span><span class="rx">SPH ${fmtD(l.sph)} · CYL ${fmtD(l.cyl)}</span>`;
      l.bump = false;
      ul.appendChild(li);
    });
    const lenses = lines.reduce((s, l) => s + l.qty, 0);
    $('#lines-sum').textContent = `${lenses} lens${lenses === 1 ? '' : 'es'} · ${lines.length} line${lines.length === 1 ? '' : 's'}`;
  }
  buildWheel($('#w-sph'), 'sph', -24, 24);
  buildWheel($('#w-cyl'), 'cyl', -16, 0);
  $$('#lens-types button').forEach((b) => b.addEventListener('click', () => {
    $$('#lens-types button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    sel.type = b.textContent;
  }));
  $('#add-lens').addEventListener('click', () => {
    const same = lines.find((l) => l.type === sel.type && l.sph === sel.sph && l.cyl === sel.cyl);
    if (same) { same.qty++; same.bump = true; }
    else lines.push({ type: sel.type, sph: sel.sph, cyl: sel.cyl, qty: 1 });
    renderLines();
  });
  $('#float-proof').textContent = String(0.1 + 0.2);
  }
})();
