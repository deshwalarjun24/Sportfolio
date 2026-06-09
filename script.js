/* ═══════════════════════════════════════════════════
   SAQIB PHOTOGRAPHY — Premium Portfolio JavaScript
   Architecture: Modular, performant, accessible
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITY HELPERS ────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Detect touch/mobile
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. PAGE LOADER ─────────────────────────────── */
const Loader = (() => {
  const loader    = qs('#loader');
  const counter   = qs('#loaderCounter');
  const line      = qs('.loader__line');

  if (!loader) return { init() {} };

  let start = null;
  const DURATION = 150; // ms

  function tick(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const pct = clamp(Math.round((elapsed / DURATION) * 100), 0, 100);

    counter.textContent = pct;

    if (pct < 100) {
      requestAnimationFrame(tick);
    } else {
      finish();
    }
  }

  function finish() {
    loader.classList.add('done');
    document.body.style.overflow = '';

    // Kick off hero entrance after loader exits
    loader.addEventListener('animationend', () => {
      loader.setAttribute('aria-hidden', 'true');
      loader.style.display = 'none';
      HeroBgReel.start();
      ScrollReveal.init();
      CounterAnims.init();
    }, { once: true });
  }

  function init() {
    document.body.style.overflow = 'hidden';
    loader.classList.add('running');
    // Short delay so fonts have loaded
    setTimeout(() => requestAnimationFrame(tick), 120);
  }

  return { init };
})();

/* ─── 2. HERO BACKGROUND REEL ────────────────────── */
const HeroBgReel = (() => {
  const imgs   = qsa('.hero__bg-img');
  let current  = 0;
  let timer    = null;
  const DELAY  = 5000;

  function show(idx) {
    imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
  }

  function next() {
    current = (current + 1) % imgs.length;
    show(current);
  }

  function start() {
    if (!imgs.length) return;
    show(0);
    if (!prefersReducedMotion()) {
      timer = setInterval(next, DELAY);
    }
  }

  return { start };
})();

/* ─── 4. NAVIGATION ──────────────────────────────── */
const Nav = (() => {
  const nav       = qs('#nav');
  const toggle    = qs('#navToggle');
  const links     = qs('#navLinks');
  let menuOpen    = false;
  let lastScroll  = 0;

  function setScrolled() {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
  }

  function openMenu() {
    menuOpen = true;
    links.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function init() {
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();

    toggle?.addEventListener('click', () => {
      menuOpen ? closeMenu() : openMenu();
    });

    // Close on nav link click (mobile)
    qsa('.nav__link', links).forEach(link => {
      link.addEventListener('click', () => {
        if (isMobile()) closeMenu();
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (menuOpen && !nav.contains(e.target)) closeMenu();
    });

    // Active link on scroll
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav__link');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));
  }

  return { init };
})();

/* ─── 5. SMOOTH SCROLL ───────────────────────────── */
const SmoothScroll = (() => {
  function init() {
    qsa('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const id  = anchor.getAttribute('href');
        const target = qs(id);
        if (!target) return;
        e.preventDefault();

        const navH = qs('#nav')?.offsetHeight || 80;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  return { init };
})();

/* ─── 6. SCROLL REVEAL ───────────────────────────── */
const ScrollReveal = (() => {
  let observer = null;

  function init() {
    if (prefersReducedMotion()) {
      qsa('.reveal-text').forEach(el => el.classList.add('visible'));
      return;
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings by small delay
          const siblings = qsa('.reveal-text', entry.target.parentElement);
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.08}s`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    qsa('.reveal-text').forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ─── 7. HERO COUNTER ANIMATION ──────────────────── */
const CounterAnims = (() => {
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const DURATION = 1800;
    let start = null;

    const ease = t => 1 - Math.pow(1 - t, 3); // ease-out-cubic

    function step(ts) {
      if (!start) start = ts;
      const pct  = clamp((ts - start) / DURATION, 0, 1);
      el.textContent = Math.round(ease(pct) * target);
      if (pct < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    const counters = qsa('.hero__stat-num[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  return { init };
})();

/* ─── 8. GALLERY FILTER ──────────────────────────── */
const Gallery = (() => {
  const filterBtns = qsa('.filter-btn');
  const items      = qsa('.gallery__item');
  let activeFilter = 'all';

  function applyFilter(filter) {
    activeFilter = filter;

    items.forEach((item, i) => {
      const cat = item.dataset.category;
      const show = filter === 'all' || cat === filter;

      if (show) {
        item.classList.remove('hidden');
        // Stagger reveal
        item.style.transitionDelay = `${(i % 6) * 0.05}s`;
      } else {
        item.classList.add('hidden');
        item.style.transitionDelay = '0s';
      }
    });
  }

  function initScrollReveal() {
    if (prefersReducedMotion()) {
      items.forEach(i => i.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(item => observer.observe(item));
  }

  function init() {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFilter(btn.dataset.filter);
      });
    });

    initScrollReveal();
  }

  return { init };
})();

/* ─── 9. LIGHTBOX ────────────────────────────────── */
const Lightbox = (() => {
  // Create lightbox DOM
  const lb = document.createElement('div');
  lb.className  = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = `
    <img class="lightbox__img" src="" alt="" />
    <button class="lightbox__close" aria-label="Close viewer">&times;</button>
  `;
  document.body.appendChild(lb);

  const lbImg   = lb.querySelector('.lightbox__img');
  const lbClose = lb.querySelector('.lightbox__close');
  let lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
    lastFocused?.focus();
    // Clear src after transition
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  function init() {
    // Open on gallery item click
    qsa('.gallery__item').forEach(item => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      const action = () => {
        const img = item.querySelector('img');
        if (!img) return;
        // Use a higher-res version if possible
        const src = img.src.replace(/w=800/, 'w=1600').replace(/q=80/, 'q=90');
        open(src, img.alt);
      };

      item.addEventListener('click', action);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
      });
    });

    lbClose.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('active')) close();
    });
  }

  return { init };
})();

/* ─── 10. MAGNETIC BUTTONS ───────────────────────── */
const MagneticButtons = (() => {
  const STRENGTH = 0.35;

  function bindEl(el) {
    function onMove(e) {
      if (isMobile() || prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function onLeave() {
      el.style.transform = '';
    }

    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
  }

  function init() {
    qsa('.magnetic').forEach(bindEl);
  }

  return { init };
})();

/* ─── 12. PARALLAX EFFECTS ───────────────────────── */
const Parallax = (() => {
  const HERO_OVERLAY = qs('.hero__overlay');
  const ABOUT_IMG    = qs('.about__img');
  const FLOAT_STAT   = qs('.about__float-stat');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;

      // Hero overlay depth shift
      if (HERO_OVERLAY) {
        const shift = sy * 0.15;
        HERO_OVERLAY.style.transform = `translateY(${shift}px)`;
      }

      // About image gentle parallax
      if (ABOUT_IMG) {
        const rect = ABOUT_IMG.closest('.about__visual')?.getBoundingClientRect();
        if (rect) {
          const center = window.innerHeight / 2;
          const offset = (rect.top + rect.height / 2 - center) * 0.08;
          ABOUT_IMG.style.transform = `translateY(${offset}px) scale(1.04)`;
        }
      }

      // Float stat counter-parallax
      if (FLOAT_STAT) {
        const rect = FLOAT_STAT.getBoundingClientRect();
        if (rect) {
          const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.05;
          FLOAT_STAT.style.transform = `translateY(${offset}px)`;
        }
      }

      ticking = false;
    });
  }

  function init() {
    if (prefersReducedMotion() || isMobile()) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return { init };
})();

/* ─── 13. CONTACT FORM ───────────────────────────── */
const ContactForm = (() => {
  const form    = qs('#contactForm');
  const success = qs('#formSuccess');
  const submitBtn = form?.querySelector('button[type="submit"]');

  function validateField(input) {
    const isEmpty = !input.value.trim();
    const isEmail = input.type === 'email';

    if (isEmpty && input.required) {
      input.style.borderBottomColor = 'rgba(255,80,80,0.6)';
      return false;
    }

    if (isEmail && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.style.borderBottomColor = 'rgba(255,80,80,0.6)';
      return false;
    }

    input.style.borderBottomColor = '';
    return true;
  }

  function init() {
    if (!form) return;

    // Real-time validation
    qsa('.form-input', form).forEach(input => {
      input.addEventListener('blur', () => {
        if (input.required || input.value) validateField(input);
      });
      input.addEventListener('input', () => {
        input.style.borderBottomColor = '';
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const fields = qsa('.form-input[required]', form);
      let valid = true;
      fields.forEach(f => { if (!validateField(f)) valid = false; });

      if (!valid) {
        // Shake animation
        form.style.animation = 'none';
        form.offsetHeight; // reflow
        submitBtn.style.animation = 'shake 0.4s ease';
        setTimeout(() => { submitBtn.style.animation = ''; }, 400);
        return;
      }

      // Simulate submission
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.reset();

        // Show success
        success.setAttribute('aria-hidden', 'false');
        success.classList.add('visible');

        setTimeout(() => {
          success.classList.remove('visible');
          setTimeout(() => success.setAttribute('aria-hidden', 'true'), 500);
        }, 5000);
      }, 1800);
    });
  }

  return { init };
})();

/* ─── 14. FLOATING PARTICLES ─────────────────────── */
const Particles = (() => {
  const COUNT = 18;
  const container = document.body;

  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';

    const left     = Math.random() * 100;
    const duration = 8 + Math.random() * 12;
    const delay    = Math.random() * 6;
    const size     = 1 + Math.random() * 2;

    p.style.cssText = `
      left: ${left}vw;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(p);
    // Remove after animation completes
    p.addEventListener('animationend', () => p.remove());
  }

  function init() {
    if (prefersReducedMotion() || isMobile()) return;
    // Initial batch
    for (let i = 0; i < COUNT; i++) spawnParticle();
    // Replenish
    setInterval(() => { if (document.querySelectorAll('.particle').length < COUNT) spawnParticle(); }, 1200);
  }

  return { init };
})();

/* ─── 15. TEXT SCRAMBLE EFFECT (Hero Name) ───────── */
const TextScramble = (() => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234';

  function scramble(el, finalText, delay = 0) {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const FRAMES = 14;

    setTimeout(() => {
      const interval = setInterval(() => {
        el.textContent = frame < FRAMES
          ? CHARS[Math.floor(Math.random() * CHARS.length)]
          : finalText;
        frame++;
        if (frame > FRAMES) clearInterval(interval);
      }, 50);
    }, delay);
  }

  function init() {
    // Scramble hero chars on hover of the name
    const nameEl = qs('.hero__name');
    if (!nameEl) return;

    const chars = qsa('.hero__char', nameEl);
    const originals = chars.map(c => c.textContent);

    nameEl.addEventListener('mouseenter', () => {
      chars.forEach((c, i) => scramble(c, originals[i], i * 60));
    });
  }

  return { init };
})();

/* ─── 16. SECTION ENTRANCE ANIMATIONS ───────────── */
const SectionAnimations = (() => {

  // Service items hover enhancement
  function initServices() {
    qsa('.service-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.paddingLeft = 'var(--space-sm)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.paddingLeft = '';
      });
    });
  }

  // About section — animate signature path on reveal
  function initAbout() {
    const sigPaths = qsa('.about__sig-svg path');
    if (!sigPaths.length) return;

    sigPaths.forEach(path => {
      const length = path.getTotalLength?.() || 200;
      path.style.strokeDasharray  = length;
      path.style.strokeDashoffset = length;
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1) 0.3s';
    });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sigPaths.forEach(p => { p.style.strokeDashoffset = '0'; });
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const sig = qs('.about__signature');
    if (sig) obs.observe(sig);
  }

  // Film frame corners — animate on load
  function initHeroFrame() {
    const corners = qsa('.hero__frame-corner');
    corners.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transition = `opacity 0.6s ease ${1.8 + i * 0.15}s`;
      // Use rAF to ensure transition fires
      requestAnimationFrame(() => { c.style.opacity = '1'; });
    });
  }

  function init() {
    initServices();
    initAbout();
    initHeroFrame();
  }

  return { init };
})();

/* ─── 17. MARQUEE HOVER PAUSE ────────────────────── */
const Marquee = (() => {
  function init() {
    const track = qs('.marquee__track');
    if (!track) return;

    const marqueeEl = track.closest('.marquee');

    marqueeEl?.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    marqueeEl?.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }

  return { init };
})();

/* ─── 18. SCROLL PROGRESS INDICATOR ─────────────── */
const ScrollProgress = (() => {
  function init() {
    if (prefersReducedMotion()) return;

    const bar = document.createElement('div');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Reading progress');
    bar.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 0%; height: 2px;
      background: linear-gradient(to right, var(--c-gold), var(--c-gold-light));
      z-index: 600;
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: true });
  }

  return { init };
})();

/* ─── 19. TILT EFFECT ON GALLERY ITEMS ───────────── */
const TiltEffect = (() => {
  const MAX_TILT = 6; // degrees

  function bindEl(el) {
    el.addEventListener('mousemove', e => {
      if (isMobile() || prefersReducedMotion()) return;
      const r  = el.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      const rx =  y * MAX_TILT * -1;
      const ry =  x * MAX_TILT;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }

  function init() {
    if (prefersReducedMotion()) return;
    qsa('.gallery__item').forEach(bindEl);
  }

  return { init };
})();

/* ─── 20. DYNAMIC PAGE TITLE ─────────────────────── */
const PageTitle = (() => {
  const ORIGINAL = document.title;
  const AWAY_MSG = '📸 Come Back — Saqib';

  function init() {
    document.addEventListener('visibilitychange', () => {
      document.title = document.hidden ? AWAY_MSG : ORIGINAL;
    });
  }

  return { init };
})();

/* ─── 21. KEYBOARD NAVIGATION ENHANCEMENTS ────────── */
const KeyboardNav = (() => {
  function init() {
    // Tab trap for mobile menu
    const nav   = qs('#nav');
    const links = qs('#navLinks');
    const toggle = qs('#navToggle');

    document.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (!links?.classList.contains('open')) return;

      const focusable = qsa('a, button', links);
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        toggle?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    });
  }

  return { init };
})();

/* ─── 22. INTERSECTION-BASED BACKGROUND SHIFTS ──── */
const SectionBg = (() => {
  // Each section can define a subtle bg accent colour
  const map = {
    hero:         'transparent',
    works:        'var(--c-bg)',
    about:        'var(--c-bg)',
    services:     'var(--c-bg)',
    contact:      'var(--c-bg)',
  };

  function init() {
    const sections = qsa('section[id]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const col = map[entry.target.id] || 'var(--c-bg)';
          document.body.style.backgroundColor = col;
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => obs.observe(s));
  }

  return { init };
})();

/* ─── CSS SHAKE KEYFRAME (injected) ─────────────── */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }

    /* Active nav link underline */
    .nav__link.active {
      color: var(--c-white);
    }
    .nav__link.active::after {
      width: 100%;
    }

    /* Lightbox image cursor */
    .lightbox__img { cursor: zoom-out; }

    /* Gallery item cursor override for lightbox */
    .gallery__item[role="button"] { cursor: pointer; }

    /* Form invalid state */
    .form-input.invalid {
      border-bottom-color: rgba(255, 80, 80, 0.6);
    }
  `;
  document.head.appendChild(style);
})();

/* ─── BOOT ───────────────────────────────────────── */
function boot() {
  // Always-on modules
  Nav.init();
  SmoothScroll.init();
  MagneticButtons.init();
  Marquee.init();
  ContactForm.init();
  Particles.init();
  TextScramble.init();
  SectionAnimations.init();
  Parallax.init();
  ScrollProgress.init();
  TiltEffect.init();
  PageTitle.init();
  KeyboardNav.init();
  SectionBg.init();
  Gallery.init();
  Lightbox.init();
  CounterAnims.init();

  // Loader kicks off hero + scroll reveals
  Loader.init();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}