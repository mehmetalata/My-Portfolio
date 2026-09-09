/**
 * Mehmet Alata — Portfolio Script
 * Hamburger menu, navbar scroll effect, scroll-reveal animations
 */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ────────────────────────────────────────
     1. NAVBAR — scroll effect
  ──────────────────────────────────────── */
  const navbar = $('#navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  /* ────────────────────────────────────────
     2. HAMBURGER MENU
  ──────────────────────────────────────── */
  const hamburgerBtn = $('#hamburger-btn');
  const navMobile    = $('#nav-mobile');

  function closeMobileNav() {
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    navMobile.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  if (hamburgerBtn && navMobile) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMobile.classList.contains('open');
      isOpen ? closeMobileNav() : openMobileNav();
    });

    // Close on mobile link click
    navMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        navMobile.classList.contains('open') &&
        !navMobile.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        closeMobileNav();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        closeMobileNav();
        hamburgerBtn.focus();
      }
    });
  }

  /* ────────────────────────────────────────
     3. SMOOTH SCROLL for anchor links
  ──────────────────────────────────────── */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 72; // navbar height
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ────────────────────────────────────────
     4. SCROLL-REVEAL (IntersectionObserver)
  ──────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // fire only once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Stagger children of bento / grid containers
  function staggerChildren(containerSel, childSel, delayStep = 80) {
    const container = $(containerSel);
    if (!container) return;
    container.querySelectorAll(childSel).forEach((el, i) => {
      el.style.transitionDelay = `${i * delayStep}ms`;
    });
  }

  staggerChildren('.skills-bento', '.skill-card');
  staggerChildren('.projects-grid', '.project-card', 100);

  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ────────────────────────────────────────
     5. ACTIVE NAV LINK on scroll
  ──────────────────────────────────────── */
  const sections  = $$('section[id]');
  const navALinks = $$('#navbar .nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navALinks.forEach((a) => {
            a.classList.toggle(
              'active',
              a.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ────────────────────────────────────────
     6. IMAGE SLIDER — Apartman Projesi
  ──────────────────────────────────────── */
  class AptSlider {
    constructor(options) {
      this.slider   = document.getElementById(options.sliderId);
      this.track    = document.getElementById(options.trackId);
      this.prevBtn  = document.getElementById(options.prevId);
      this.nextBtn  = document.getElementById(options.nextId);
      this.dotsWrap = document.getElementById(options.dotsId);

      if (!this.slider || !this.track) return;

      this.slides    = this.track.querySelectorAll('.slide');
      this.dots      = this.dotsWrap ? this.dotsWrap.querySelectorAll('.slider-dot') : [];
      this.current   = 0;
      this.total     = this.slides.length;
      this.isDragging = false;
      this.startX    = 0;
      this.dragDelta = 0;
      this.autoId    = null;

      this._bind();
      this._updateUI();
    }

    _goTo(index) {
      // Wrap around
      this.current = (index + this.total) % this.total;
      this._updateUI();
    }

    _updateUI() {
      this.track.style.transform = `translateX(-${this.current * 100}%)`;

      this.slides.forEach((s, i) => {
        s.setAttribute('aria-hidden', i !== this.current);
      });

      this.dots.forEach((d, i) => {
        const active = i === this.current;
        d.classList.toggle('active', active);
        d.setAttribute('aria-selected', active);
      });
    }

    _bind() {
      // Isolate all slider events from card-level clicks
      const stopProp = (e) => e.stopPropagation();
      this.slider.addEventListener('click',      stopProp);
      this.slider.addEventListener('mousedown',  stopProp);
      this.slider.addEventListener('touchstart', stopProp, { passive: true });

      // Arrow buttons
      this.prevBtn && this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._goTo(this.current - 1);
      });
      this.nextBtn && this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._goTo(this.current + 1);
      });

      // Dot clicks
      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this._goTo(i);
        });
      });

      // Keyboard (when slider is focused)
      this.slider.setAttribute('tabindex', '0');
      this.slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); this._goTo(this.current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); this._goTo(this.current + 1); }
      });

      // Mouse drag
      this.slider.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startX = e.clientX;
        this.track.style.transition = 'none';
      });
      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.dragDelta = e.clientX - this.startX;
      });
      window.addEventListener('mouseup', () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.transition = '';
        if (Math.abs(this.dragDelta) > 50) {
          this._goTo(this.dragDelta < 0 ? this.current + 1 : this.current - 1);
        } else {
          this._updateUI(); // snap back
        }
        this.dragDelta = 0;
      });

      // Touch swipe
      let touchStartX = 0;
      this.slider.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        this.track.style.transition = 'none';
      }, { passive: true });

      this.slider.addEventListener('touchend', (e) => {
        this.track.style.transition = '';
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          this._goTo(diff > 0 ? this.current + 1 : this.current - 1);
        } else {
          this._updateUI();
        }
      }, { passive: true });
    }
  }

  // Initialize the apartment project slider
  new AptSlider({
    sliderId: 'apt-slider',
    trackId:  'apt-slider-track',
    prevId:   'apt-prev',
    nextId:   'apt-next',
    dotsId:   'apt-dots',
  });

})();

