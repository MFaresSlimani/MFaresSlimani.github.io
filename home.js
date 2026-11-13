(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Algiers clock ---------- */
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });
  const tick = () => {
    const now = new Date();
    const t = fmt.format(now);
    $('#clock').textContent = t;
    $('#clock').dateTime = now.toISOString();
    $('#clock-big').textContent = t;
  };
  tick();
  setInterval(tick, 15000);

  /* ---------- wallpaper: a retinal vessel tree, drawn once ---------- */
  const canvas = $('#vessels');
  const draw = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth, h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vessel');
    ctx.lineCap = 'round';
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const branch = (x, y, angle, len, width, depth) => {
      if (depth === 0 || width < 0.4) return;
      const steps = 6;
      let cx = x, cy = y, a = angle;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let i = 0; i < steps; i++) {
        a += (rand() - 0.5) * 0.35;
        cx += Math.cos(a) * len / steps;
        cy += Math.sin(a) * len / steps;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      const spread = 0.35 + rand() * 0.35;
      branch(cx, cy, a - spread, len * (0.72 + rand() * 0.12), width * 0.72, depth - 1);
      branch(cx, cy, a + spread, len * (0.62 + rand() * 0.12), width * 0.62, depth - 1);
    };
    // optic disc sits off the lower-left edge, vessels fan across the screen
    const ox = -w * 0.04, oy = h * 0.82;
    const base = Math.max(w, h) * 0.22;
    [-1.15, -0.65, -0.2, 0.2].forEach((ang) => branch(ox, oy, ang, base, 7, 8));
  };
  draw();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 150); });

  /* ---------- app windows ---------- */
  const apps = new Map($$('dialog.app').map((d) => [d.id.replace('app-', ''), d]));
  const legacy = { work: 'projects', projects: 'projects', contact: 'contact', about: 'about', experience: 'experience', research: 'research', skills: 'skills', community: 'life', education: 'about' };
  let opener = null;

  const open = (id, from, push = true) => {
    const dlg = apps.get(id);
    if (!dlg || dlg.open) return;
    opener = from || null;
    dlg.showModal();
    if (from && !reduceMotion) {
      const a = from.getBoundingClientRect();
      const b = dlg.getBoundingClientRect();
      dlg.style.transformOrigin = `${a.left + a.width / 2 - b.left}px ${a.top + a.height / 2 - b.top}px`;
      dlg.classList.add('is-opening');
      dlg.addEventListener('animationend', () => dlg.classList.remove('is-opening'), { once: true });
    }
    $('.app__body', dlg).scrollTop = 0;
    if (push) history.pushState({ app: id }, '', '#' + id);
  };

  const close = (dlg, fromHistory = false) => {
    if (!dlg.open) return;
    const finish = () => {
      dlg.classList.remove('is-closing');
      dlg.close();
      if (opener && document.contains(opener)) opener.focus();
    };
    if (reduceMotion || !dlg.style.transformOrigin) finish();
    else {
      dlg.classList.add('is-closing');
      dlg.addEventListener('animationend', finish, { once: true });
    }
    if (!fromHistory && location.hash) history.back();
  };

  $$('[data-open]').forEach((el) => el.addEventListener('click', () => {
    const current = [...apps.values()].find((d) => d.open);
    if (current) { current.close(); history.replaceState(null, '', location.pathname); }
    open(el.dataset.open, el);
  }));
  apps.forEach((dlg) => {
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => close(dlg)));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(dlg); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(dlg); });
  });

  const fromHash = () => {
    const key = decodeURIComponent(location.hash.slice(1));
    const id = apps.has(key) ? key : legacy[key];
    const current = [...apps.values()].find((d) => d.open);
    if (current && current.id !== 'app-' + id) close(current, true);
    if (id) open(id, $(`[data-open="${id}"]`), false);
  };
  addEventListener('popstate', fromHash);
  if (location.hash) {
    const key = location.hash.slice(1);
    if (apps.has(key) || legacy[key]) {
      // make "back" from a deep link land on the home screen
      const target = location.hash;
      history.replaceState(null, '', location.pathname);
      history.pushState(null, '', target);
      fromHash();
    }
  }

  /* ---------- project filters ---------- */
  const chips = $$('#app-projects .chip');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    $$('#app-projects .proj').forEach((p) => { p.hidden = f !== 'all' && !p.dataset.tags.split(' ').includes(f); });
  }));

  /* ---------- copy email ---------- */
  const copy = $('#copy-email');
  copy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('faresslimani0@gmail.com');
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Copy failed, select it instead';
    }
    setTimeout(() => (copy.textContent = 'Copy email'), 2000);
  });

  /* ---------- MRZ with ICAO 9303 check digits ---------- */
  const val = (c) => (c === '<' ? 0 : /\d/.test(c) ? +c : c.charCodeAt(0) - 55);
  const check = (s) => [...s].reduce((sum, c, i) => sum + val(c) * [7, 3, 1][i % 3], 0) % 10;
  const field = (s, n) => (s.toUpperCase().replace(/[^A-Z0-9]/g, '<') + '<'.repeat(n)).slice(0, n);
  const esc = (s) => s.replace(/</g, '&lt;');
  const line1 = ('P<DZASLIMANI<<MOHAMED<FARES' + '<'.repeat(44)).slice(0, 44);
  const renderMrz = () => {
    const f = $('#mrz-form');
    if (!f) return;
    const doc = field(f.doc.value, 9);
    const opt = field(f.opt.value, 14);
    const dob = '<<<<<<', exp = '<<<<<<';
    const cDoc = check(doc), cDob = check(dob), cExp = check(exp), cOpt = check(opt);
    const composite = check(doc + cDoc + dob + cDob + exp + cExp + opt + cOpt);
    const ck = (d) => `<span class="ck">${d}</span>`;
    $('#mrz-1').textContent = line1;
    $('#mrz-2').innerHTML = `${esc(doc)}${ck(cDoc)}DZA${esc(dob)}${ck(cDob)}M${esc(exp)}${ck(cExp)}${esc(opt)}${ck(cOpt)}${ck(composite)}`;
    $('#mrz-checks').innerHTML = [
      ['Document number', doc, cDoc],
      ['Optional data', opt, cOpt],
      ['Composite of the whole line', 'all fields', composite],
    ].map(([k, v, d]) => `<li><span class="rows__main">${k}: <code>${esc(v)}</code></span><span class="rows__side">check digit <span class="ok">${d}</span></span></li>`).join('');
  };
  $('#mrz-form')?.addEventListener('input', renderMrz);
  $('#mrz-form')?.addEventListener('submit', (e) => e.preventDefault());
  renderMrz();

  /* ---------- Tsuki ---------- */
  const tsuki = $('#tsuki');
  if (tsuki) {
    const bubble = $('.tsuki__bubble', tsuki);
    const lines = ['Meow.', 'Mrrp?', 'He ships on Fridays.', 'Hire him, I need treats.', 'Prrrr.'];
    let i = 0, timer;
    tsuki.addEventListener('click', () => {
      bubble.textContent = lines[i++ % lines.length];
      tsuki.classList.add('is-talking');
      clearTimeout(timer);
      timer = setTimeout(() => tsuki.classList.remove('is-talking'), 2200);
    });
  }
})();
