/* Valentina Cabrera · @latinwatxa — interacciones */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => innerWidth > 1100;

  /* Testimonios: agregar acá cuando las marcas compartan sus palabras.
     { quote: '…', author: 'Nombre — Marca' } */
  const TESTIMONIALS = [];

  /* ---------- split de texto (títulos letra por letra, párrafos palabra por palabra) ---------- */
  function splitChars(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            [...word].forEach((ch) => {
              const m = document.createElement('span');
              m.className = 'm';
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              c.style.setProperty('--i', i++);
              m.appendChild(c);
              w.appendChild(m);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  }

  function splitWords(el) {
    let i = 0;
    [...el.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return; // conserva los <br>
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.style.setProperty('--i', i++);
        s.textContent = word;
        frag.appendChild(s);
      });
      n.replaceWith(frag);
    });
    el.style.setProperty('--n', i);
  }

  $$('[data-split]').forEach(splitChars);
  const wordBlocks = $$('[data-words]');
  wordBlocks.forEach(splitWords);

  // hero: "MediaKit" letra por letra
  const heroWord = $('[data-hero-word]');
  if (heroWord) {
    const txt = heroWord.textContent;
    heroWord.textContent = '';
    [...txt].forEach((ch, i) => {
      const m = document.createElement('span'); m.className = 'm';
      const c = document.createElement('span'); c.className = 'c';
      c.textContent = ch; c.style.setProperty('--i', i);
      m.appendChild(c); heroWord.appendChild(m);
    });
  }

  // índices de stagger
  $$('.kpis li, .service, .phones .phone, .features li, .contact__list li, .menu__inner a').forEach((el) => {
    el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
  });
  $$('.tabs i').forEach((el, i) => el.style.setProperty('--i', i % 4));

  /* ---------- intro ---------- */
  const ready = () => requestAnimationFrame(() => root.classList.add('is-ready'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(ready);
  } else ready();

  /* ---------- reveals ---------- */
  // un elemento recortado por completo con clip-path nunca "intersecta",
  // así que para esos se observa el contenedor padre
  const proxies = new Map();
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (proxies.get(e.target) || [e.target]).forEach((el) => {
        el.classList.add('is-in');
        if (el.hasAttribute('data-count')) countUp(el);
        $$('[data-count]', el).forEach(countUp);
      });
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  const observeReveal = (el) => {
    if (/^(clip|rise)$/.test(el.dataset.reveal || '')) {
      const host = el.parentElement;
      if (!proxies.has(host)) { proxies.set(host, []); revealIO.observe(host); }
      proxies.get(host).push(el);
    } else revealIO.observe(el);
  };
  $$('[data-reveal], [data-split], .tabs').forEach(observeReveal);

  /* ---------- contadores ---------- */
  const fmt = (v, dec) => v.toLocaleString('es-UY', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const to = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = pre + fmt(to, dec) + suf; return; }
    const dur = 1600 + Math.min(900, Math.log10(to + 1) * 180);
    const t0 = performance.now();
    const tick = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + fmt(dec ? to * e : Math.round(to * e), dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- smooth scroll (solo desktop con mouse/trackpad) ---------- */
  let lenis = null;
  if (!reduced && finePointer && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: 1 });
  }

  // anclas
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const id = a.getAttribute('href');
      const target = id === '#inicio' ? document.body : $(id);
      if (!target) return;
      ev.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(id === '#inicio' ? 0 : target, { duration: 1.6, offset: 0 });
      else if (id === '#inicio') scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- nav, progreso, parallax: un solo loop ---------- */
  const nav = $('[data-nav]');
  const heroInner = $('[data-hero]');
  const progress = $('.progress span');
  const cursor = $('.cursor');
  const themed = $$('.sheet [data-theme]');
  const hero = $('.hero');
  const linkMap = new Map($$('.nav__links a').map((a) => [a.dataset.link, a]));
  const spies = $$('#sobre-mi, #estadisticas, #servicios, #trabajos, #videos, #contacto');
  const parallax = $$('[data-speed]');
  const spinners = $$('[data-spin]');

  let lastY = scrollY;
  let ticking = false;
  let mouseY = -1;

  function themeAt(y) {
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return s.dataset.theme;
    }
    return hero ? hero.dataset.theme : 'cream';
  }

  function frame() {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    // progreso
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // nav: color según sección, estado scrolled, ocultar al bajar
    const navTheme = themeAt(28);
    nav.classList.toggle('on-cream', navTheme === 'cream');
    nav.classList.toggle('on-magenta', navTheme === 'magenta');
    document.body.classList.toggle('nav-magenta', navTheme === 'magenta');
    nav.classList.toggle('is-scrolled', y > 40);
    if (!root.classList.contains('menu-open')) {
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > vh * 0.6) nav.classList.add('is-hidden');
      else if (goingUp || y < vh * 0.6) nav.classList.remove('is-hidden');
    }
    lastY = y;

    // link activo
    let active = null;
    for (const s of spies) {
      const r = s.getBoundingClientRect();
      if (r.top <= vh * 0.45) active = s.id;
    }
    linkMap.forEach((a, id) => a.classList.toggle('is-active', id === active));

    // hero se achica mientras la hoja crema sube
    if (heroInner && !reduced) {
      const p = clamp(y / vh, 0, 1);
      if (p < 1) {
        heroInner.style.transform = `translate3d(0, ${p * -6}%, 0) scale(${1 - p * 0.07})`;
        heroInner.style.opacity = String(1 - p * 0.55);
      }
    }

    // párrafos que se "encienden" con el scroll
    if (!reduced) {
      wordBlocks.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.42), 0, 1);
        el.style.setProperty('--p', p.toFixed(3));
      });
    }

    // parallax suave (solo desktop)
    if (!reduced && isDesktop()) {
      parallax.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const c = (r.top + r.height / 2 - vh / 2);
        el.style.transform = `translate3d(0, ${c * parseFloat(el.dataset.speed)}px, 0) scale(1.1)`;
      });
      spinners.forEach((el) => { el.style.transform = `rotate(${y * 0.12}deg)`; });
    }

    // color del cursor según fondo
    if (cursor && mouseY >= 0) cursor.classList.toggle('on-magenta', themeAt(mouseY) === 'magenta');
  }

  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (lenis) {
    lenis.on('scroll', requestFrame);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    addEventListener('scroll', requestFrame, { passive: true });
  }
  addEventListener('resize', requestFrame);
  frame();

  /* ---------- menú mobile ---------- */
  const burger = $('.nav__burger');
  const menu = $('#menu');
  function openMenu() {
    root.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => (root.classList.contains('menu-open') ? closeMenu() : openMenu()));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

  /* ---------- rails horizontales (mobile): barra de progreso ---------- */
  $$('[data-rail]').forEach((rail) => {
    const bar = document.createElement('div');
    bar.className = 'rail-bar';
    bar.innerHTML = '<span></span>';
    rail.after(bar);
    const fill = bar.firstChild;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      bar.hidden = max < 8;
      const vis = rail.clientWidth / rail.scrollWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      fill.style.transform = `translateX(${p * (1 - vis) * 100 / vis}%) scaleX(1)`;
      fill.style.width = `${vis * 100}%`;
    };
    rail.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    new ResizeObserver(update).observe(rail);
    update();
  });

  /* ---------- reels de Instagram ---------- */
  const reelsRoot = $('[data-reels]');
  let embedLoading = null;
  function loadEmbedScript() {
    if (window.instgrm) return Promise.resolve();
    if (embedLoading) return embedLoading;
    embedLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    });
    return embedLoading;
  }

  const ASTERISK = '<svg aria-hidden="true"><use href="#asterisk"/></svg>';
  $$('.reel').forEach((el) => {
    el.innerHTML = `<a class="reel__skeleton" href="${el.dataset.reel}" target="_blank" rel="noopener">${ASTERISK}<span>Cargando reel…</span></a>`;
  });

  function mountPanel(panel) {
    if (!panel || panel.dataset.mounted) return;
    panel.dataset.mounted = '1';
    $$('.reel', panel).forEach((el) => {
      const url = el.dataset.reel;
      const bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', `${url}?utm_source=ig_embed&utm_campaign=loading`);
      bq.setAttribute('data-instgrm-version', '14');
      bq.innerHTML = `<a href="${url}" target="_blank" rel="noopener" class="reel__skeleton">${ASTERISK}<span>Ver este reel en Instagram</span></a>`;
      el.innerHTML = '';
      el.appendChild(bq);
    });
    loadEmbedScript().then(() => { if (window.instgrm) window.instgrm.Embeds.process(); });
  }

  if (reelsRoot) {
    const tabs = $$('[role="tab"]', reelsRoot);
    const panels = $$('[role="tabpanel"]', reelsRoot);
    let inView = false;

    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        if (on && p.hidden) { p.hidden = false; p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering'); }
        else if (!on) p.hidden = true;
        if (on && inView) mountPanel(p);
      });
      if (focus) tab.focus();
      if (lenis) lenis.resize();
      updateArrows();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      });
    });

    // flechas para desplazar los reels en desktop
    const arrowSets = [];
    panels.forEach((p) => {
      const list = $('.reels__list', p);
      if (list.children.length < 2) return;
      const wrap = document.createElement('div');
      wrap.className = 'reels__arrows';
      wrap.innerHTML = '<button type="button" aria-label="Reel anterior">←</button><button type="button" aria-label="Reel siguiente">→</button>';
      $('.reels__info', p).appendChild(wrap);
      const [prev, next] = wrap.children;
      const step = () => (list.firstElementChild.getBoundingClientRect().width + 24);
      prev.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: 'smooth' }));
      const upd = () => {
        const max = list.scrollWidth - list.clientWidth;
        wrap.hidden = max < 8;
        prev.disabled = list.scrollLeft < 8;
        next.disabled = list.scrollLeft > max - 8;
      };
      list.addEventListener('scroll', upd, { passive: true });
      new ResizeObserver(upd).observe(list);
      arrowSets.push(upd);
    });
    function updateArrows() { arrowSets.forEach((f) => f()); }

    // cargar Instagram sólo cuando la sección se acerca
    new IntersectionObserver((entries, io) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      inView = true;
      mountPanel(panels.find((p) => !p.hidden));
      // precargar el resto en momentos ociosos
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1800));
      idle(() => panels.forEach(mountPanel), { timeout: 4000 });
      io.disconnect();
    }, { rootMargin: '600px 0px' }).observe(reelsRoot);

    // los embeds cambian de alto al cargar: avisar a Lenis
    if (lenis) new ResizeObserver(() => lenis.resize()).observe(reelsRoot);
  }

  /* ---------- testimonios ---------- */
  if (TESTIMONIALS.length) {
    const box = $('[data-testimonials]');
    box.innerHTML = TESTIMONIALS.map((t) => `<blockquote data-reveal>“${t.quote}”<cite>${t.author}</cite></blockquote>`).join('');
    box.hidden = false;
    $('[data-testimonials-sub]').hidden = false;
    $$('[data-reveal]', box).forEach(observeReveal);
  }

  /* ---------- marquee: duplicar para loop continuo ---------- */
  $$('[data-marquee]').forEach((row) => {
    const items = [...row.children];
    const reps = Math.max(2, Math.ceil((innerWidth * 1.2) / Math.max(1, row.scrollWidth)));
    for (let r = 1; r < reps * 2; r++) items.forEach((it) => {
      const c = it.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      row.appendChild(c);
    });
  });

  /* ---------- copiar mail ---------- */
  const toast = $('.toast');
  let toastT;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      showToast('Mail copiado :)');
    } catch {
      showToast(b.dataset.copy);
    }
  }));

  /* ---------- cursor (sólo mouse) ---------- */
  if (cursor && finePointer && !reduced) {
    let x = -100, y = -100, cx = -100, cy = -100, running = false;
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) requestAnimationFrame(loop);
      else running = false;
    };
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY; mouseY = y;
      cursor.classList.add('is-on');
      if (!running) { running = true; requestAnimationFrame(loop); }
      requestFrame();
    }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) cursor.classList.remove('is-on'); });
    document.addEventListener('mouseover', (e) => {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .phone, .shot, [role="tab"]'));
    });
    addEventListener('blur', () => cursor.classList.remove('is-on'));
  }
})();
