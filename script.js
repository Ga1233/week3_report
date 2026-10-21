/* ==========================================================
   TrailNest - script.js (plain JavaScript, no libraries)
   1 Helpers | 2 Theme toggle | 3 Mobile menu | 4 Trail filter + search
   5 FAQ accordion | 6 Form validation | 7 Counters | 8 Scroll reveal
   9 Back to top | 10 Rotating hero word
   ========================================================== */
(function () {
  'use strict';

  /* 1. Helpers --------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Safe localStorage (can throw in private mode or blocked storage)
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };

  // Tells the CSS that JavaScript is running (progressive enhancement)
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTheme();
    initMenu();
    initTrailFilter();
    initFaq();
    initForm();
    initCounters();
    initReveal();
    initBackToTop();
    initHeroWord();
  }

  /* 2. Dark / light theme ---------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const btn = $('#theme-toggle');
    if (!btn) return;

    const saved = store.get('trailnest-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved || (prefersDark ? 'dark' : 'light'));

    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      store.set('trailnest-theme', next);
    });

    function apply(theme) {
      root.dataset.theme = theme;
      btn.firstElementChild.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /* 3. Mobile menu ----------------------------------------- */
  function initMenu() {
    const btn = $('#menu-btn');
    const nav = $('#main-nav');
    if (!btn || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    // Reset when growing to desktop width
    window.matchMedia('(min-width: 768px)').addEventListener('change', () => setOpen(false));
  }

  /* 4. Trail filter + live search -------------------------- */
  function initTrailFilter() {
    const chips = $$('.chip');
    const cards = $$('#trail-grid .card');
    const search = $('#trail-search');
    const count = $('#result-count');
    const empty = $('#empty-msg');
    if (!cards.length) return;

    let activeFilter = 'all';

    function update() {
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const matchesFilter = activeFilter === 'all' || card.dataset.difficulty === activeFilter;
        const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
        const visible = matchesFilter && matchesQuery;
        card.hidden = !visible;
        if (visible) { shown++; card.classList.add('visible'); }
      });
      count.textContent = `Showing ${shown} of ${cards.length} trails`;
      empty.hidden = shown !== 0;
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        update();
      });
    });
    search.addEventListener('input', update);
    update();
  }

  /* 5. FAQ accordion (one open at a time) ------------------ */
  function initFaq() {
    const buttons = $$('.faq-q');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const opening = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((b) => {
          b.setAttribute('aria-expanded', 'false');
          document.getElementById(b.getAttribute('aria-controls')).hidden = true;
        });
        if (opening) {
          btn.setAttribute('aria-expanded', 'true');
          document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
        }
      });
    });
  }

  /* 6. Form validation ------------------------------------- */
  function initForm() {
    const form = $('#signup-form');
    if (!form) return;

    const name = $('#name');
    const email = $('#email');
    const message = $('#message');
    const counter = $('#msg-counter');
    const success = $('#form-success');

    const rules = {
      name: (v) => v.length < 2 ? 'Please enter at least 2 characters.'
                 : !/^[\p{L}][\p{L} .'-]*$/u.test(v) ? 'Names can only contain letters and spaces.' : '',
      email: (v) => !v ? 'Email is required.'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Please enter a valid email address.' : ''
    };

    function validate(field) {
      const msg = rules[field.id](field.value.trim());
      $('#' + field.id + '-error').textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      field.dataset.valid = msg ? 'false' : 'true';
      return !msg;
    }

    [name, email].forEach((field) => {
      field.addEventListener('blur', () => validate(field));
      // After the first error, re-check while typing so the message clears quickly
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validate(field);
        success.hidden = true;
      });
    });

    message.addEventListener('input', () => {
      counter.textContent = `${message.value.length} / ${message.maxLength}`;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();                       // stay on the page
      const okName = validate(name);
      const okEmail = validate(email);
      if (!okName || !okEmail) {
        (okName ? email : name).focus();        // move focus to the first problem
        success.hidden = true;
        return;
      }
      success.textContent = `Thanks, ${name.value.trim().split(' ')[0]}! We will email trail updates to ${email.value.trim()}.`;
      success.hidden = false;
      form.reset();
      counter.textContent = `0 / ${message.maxLength}`;
      [name, email].forEach((f) => { f.removeAttribute('aria-invalid'); delete f.dataset.valid; });
    });
  }

  /* 7. Animated counters ----------------------------------- */
  function initCounters() {
    const items = $$('[data-count]');
    if (!items.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      if (reducedMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
      const duration = 1400;
      const start = performance.now();
      (function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);           // ease-out
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      })(start);
    };

    if (!('IntersectionObserver' in window)) { items.forEach(animate); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    items.forEach((el) => io.observe(el));
  }

  /* 8. Scroll reveal --------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('visible')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  }

  /* 9. Back-to-top button ---------------------------------- */
  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;                              // throttle with rAF
      ticking = true;
      requestAnimationFrame(() => { btn.hidden = window.scrollY < 500; ticking = false; });
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  }

  /* 10. Rotating hero word --------------------------------- */
  function initHeroWord() {
    const el = $('#typed-word');
    if (!el || reducedMotion) return;
    const words = ['your way.', 'on any screen.', 'with a guide.', 'at your pace.'];
    let i = 0;
    setInterval(() => {
      el.style.opacity = 0;
      setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.style.opacity = 1; }, 300);
    }, 3000);
    el.style.transition = 'opacity .3s';
  }
})();
