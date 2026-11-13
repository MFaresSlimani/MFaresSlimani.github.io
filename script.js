(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- theme ---------- */
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const syncThemeColor = () => {
    const m = $('meta[name="theme-color"]');
    if (m) m.content = isDark() ? '#131210' : '#F4F1EA';
  };
  const themeBtn = $('.theme');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
    syncThemeColor();
    dispatchEvent(new Event('themechange'));
  });
  syncThemeColor();

  /* ---------- header ---------- */
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = top.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    $$('.top__nav a').forEach((a) => a.addEventListener('click', () => {
      top.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // highlight the section in view (home page anchors only)
  const anchorLinks = $$('.top__nav a[href^="#"]');
  if (anchorLinks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        anchorLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    anchorLinks.forEach((a) => { const el = $(a.getAttribute('href')); if (el) io.observe(el); });
  }

  /* ---------- MRZ id card (ICAO 9303, TD3) ---------- */
  const mrzEl = $('#mrz');
  if (mrzEl) {
    const W = [7, 3, 1];
    const val = (c) => (c === '<' ? 0 : /\d/.test(c) ? +c : c.charCodeAt(0) - 55);
    const check = (s) => String([...s].reduce((sum, c, i) => sum + val(c) * W[i % 3], 0) % 10);
    const pad = (s, n) => (s + '<'.repeat(n)).slice(0, n);

    const surname = 'SLIMANI', given = 'MOHAMED<FARES';
    const doc = pad('TSUKI', 9), nat = 'DZA', dob = '<<<<<<', sex = 'M', exp = '<<<<<<';
    const opt = pad('FLUTTER<PHD<AI', 14);
    const l1 = pad('P<' + nat + surname + '<<' + given, 44);
    const cDoc = check(doc), cDob = check(dob), cExp = check(exp), cOpt = check(opt);
    const composite = check(doc + cDoc + dob + cDob + exp + cExp + opt + cOpt);
    const l2 = doc + cDoc + nat + dob + cDob + sex + exp + cExp + opt + cOpt + composite;

    const lineEls = $$('.mrz__line', mrzEl);
    lineEls[0].textContent = l1;
    lineEls[1].textContent = l2;

    // parse the lines back, the way a scanner would
    const parse = (a, b) => {
      const names = a.slice(5).split('<<');
      const ok = (field, digit) => check(field) === digit;
      return [
        ['Type', a[0] === 'P' ? 'Passport (TD3)' : a[0]],
        ['Surname', names[0].replace(/</g, ' ').trim()],
        ['Given names', (names[1] || '').replace(/</g, ' ').trim()],
        ['Nationality', b.slice(10, 13)],
        ['Document no.', b.slice(0, 9).replace(/</g, ''), ok(b.slice(0, 9), b[9])],
        ['Date of birth', 'not on the internet', ok(b.slice(13, 19), b[19])],
        ['Expiry', 'open-ended', ok(b.slice(21, 27), b[27])],
        ['Personal data', b.slice(28, 42).replace(/</g, ' ').trim(), ok(b.slice(28, 42), b[42])],
        ['Composite', 'check digit ' + b[43], check(b.slice(0, 10) + b.slice(13, 20) + b.slice(21, 43)) === b[43]],
      ];
    };

    const scanBtn = $('#scan');
    const out = $('#mrz-out');
    const card = $('.idcard');
    scanBtn.addEventListener('click', () => {
      if (card.classList.contains('is-scanning')) return;
      out.innerHTML = '';
      card.classList.remove('is-scanned');
      card.classList.add('is-scanning');
      scanBtn.textContent = 'Reading MRZ…';
      const rows = parse(lineEls[0].textContent, lineEls[1].textContent);
      const delay = reduceMotion ? 0 : 900;
      setTimeout(() => {
        card.classList.remove('is-scanning');
        card.classList.add('is-scanned');
        rows.forEach(([k, v, ok], i) => {
          const dt = document.createElement('dt'); dt.textContent = k;
          const dd = document.createElement('dd'); dd.textContent = v;
          if (ok !== undefined) {
            const s = document.createElement('span');
            s.className = ok ? 'ok' : 'bad';
            s.textContent = ok ? '✓' : '✗';
            s.title = ok ? 'Check digit valid' : 'Check digit invalid';
            dd.append(' ', s);
          }
          dt.style.animationDelay = dd.style.animationDelay = (reduceMotion ? 0 : i * 60) + 'ms';
          out.append(dt, dd);
        });
        scanBtn.textContent = 'Scan again';
      }, delay);
    });
  }

  /* ---------- draggable stickers ---------- */
  const stickers = $$('.sticker');
  if (stickers.length && matchMedia('(pointer: fine)').matches) {
    let z = 10;
    stickers.forEach((el) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
      const rot = parseFloat(el.dataset.rot || 0);
      el.style.setProperty('--r', rot + 'deg');
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-drag');
        el.style.zIndex = ++z;
        sx = e.clientX; sy = e.clientY;
        ox = parseFloat(el.dataset.x || 0); oy = parseFloat(el.dataset.y || 0);
        moved = false;
      });
      el.addEventListener('pointermove', (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        el.dataset.x = ox + dx; el.dataset.y = oy + dy;
        el.style.translate = `${ox + dx}px ${oy + dy}px`;
        el.style.setProperty('--r', (rot + Math.max(-12, Math.min(12, dx / 14))) + 'deg');
      });
      const end = (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('is-drag');
        el.style.setProperty('--r', rot + 'deg');
        if (!moved) el.dispatchEvent(new CustomEvent('tap'));
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
  }

  /* ---------- Tsuki ---------- */
  const tsuki = $('#tsuki');
  if (tsuki) {
    const bubble = $('.tsuki__bubble', tsuki);
    const lines = ['Meow.', 'Purrr…', 'You found Tsuki.', 'He ships on Fridays. Brave.', 'Sehr gut!', 'Flutter > everything', 'I ate all the bugs.', 'Hire him, he feeds me.'];
    let i = -1, timer;
    const speak = () => {
      i = (i + 1) % lines.length;
      bubble.textContent = lines[i];
      tsuki.classList.add('is-talking');
      clearTimeout(timer);
      timer = setTimeout(() => tsuki.classList.remove('is-talking'), 2200);
    };
    tsuki.addEventListener('tap', speak);
    tsuki.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speak(); } });
    if (!matchMedia('(pointer: fine)').matches) tsuki.addEventListener('click', speak);
  }

  /* ---------- work filter ---------- */
  const filters = $$('.filters button');
  if (filters.length) {
    filters.forEach((b) => b.addEventListener('click', () => {
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      $$('.proj').forEach((p) => { p.hidden = f !== 'all' && !p.dataset.tags.split(' ').includes(f); });
    }));
  }

  /* ---------- copy ---------- */
  $$('.copy').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'copied'; }
    catch (e) { b.textContent = 'press ctrl+c'; }
    setTimeout(() => { b.textContent = 'copy'; }, 1800);
  }));
})();
