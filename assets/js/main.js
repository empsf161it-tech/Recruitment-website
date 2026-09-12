/* ============================================================
   TalentForge — Main JavaScript
   Nav, Theme, RTL, GSAP Animations, Forms, Carousel
   ============================================================ */

'use strict';

// ── GSAP Registration ──────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ════════════════════════════════════════════════════════════
// THEME MANAGER
// ════════════════════════════════════════════════════════════
const ThemeManager = {
  STORAGE_KEY: 'talentforge-theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = saved || system;
    this.apply(theme, false);

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });
  },

  apply(theme, persist = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  updateIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const sunIcon = btn.querySelector('.icon-sun');
      const moonIcon = btn.querySelector('.icon-moon');
      if (sunIcon) sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
      if (moonIcon) moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
    });
  }
};

// ════════════════════════════════════════════════════════════
// RTL MANAGER
// ════════════════════════════════════════════════════════════
const RTLManager = {
  STORAGE_KEY: 'talentforge-dir',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'ltr';
    this.apply(saved, false);

    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },

  apply(dir, persist = true) {
    document.documentElement.setAttribute('dir', dir);
    if (persist) localStorage.setItem(this.STORAGE_KEY, dir);
  },

  toggle() {
    const current = document.documentElement.getAttribute('dir');
    this.apply(current === 'rtl' ? 'ltr' : 'rtl');
  }
};

// ════════════════════════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════════════════════════
const Navbar = {
  init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Scroll behavior
    const handleScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Brand logo & Nav links click handler for smooth scroll when re-clicking current page
    document.querySelectorAll('.nav-link, .nav-logo, .drawer-link').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href) return;
        const cleanHref = href.split('#')[0];
        const isCurrentPage = cleanHref === currentPage || 
          (currentPage === 'index.html' && (cleanHref === '' || cleanHref === '#' || cleanHref === './'));
        
        if (isCurrentPage && !href.includes('#')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // GSAP nav entrance
    gsap.from(navbar, {
      y: -80,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.2,
      clearProps: 'all'
    });
  }
};

// ════════════════════════════════════════════════════════════
// DRAWER MANAGER
// ════════════════════════════════════════════════════════════
const DrawerManager = {
  init() {
    const hamburgers = document.querySelectorAll('.hamburger, #sidebar-toggle, .dash-sidebar-toggle');
    const drawers = document.querySelectorAll('.drawer, #dash-sidebar, .dash-sidebar');
    const overlay = document.querySelector('.drawer-overlay');
    const drawerCloseButtons = document.querySelectorAll('.drawer-close');

    if (!hamburgers.length && !drawers.length) return;

    const toggleDrawer = (e) => {
      if (e) e.stopPropagation();
      const firstDrawer = drawers[0];
      const isOpen = firstDrawer?.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };

    const openDrawer = () => {
      hamburgers.forEach(h => h.classList.add('open'));
      drawers.forEach(d => d.classList.add('open'));
      overlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      hamburgers.forEach(h => h.classList.remove('open'));
      drawers.forEach(d => d.classList.remove('open'));
      overlay?.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburgers.forEach(h => {
      h.addEventListener('click', toggleDrawer);
    });

    drawerCloseButtons.forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });

    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    document.querySelectorAll('.drawer-link, .dash-nav-item').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) closeDrawer();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }
};

// ════════════════════════════════════════════════════════════
// TYPEWRITER EFFECT
// ════════════════════════════════════════════════════════════
const Typewriter = {
  init(selector, words, options = {}) {
    const el = document.querySelector(selector);
    if (!el) return;

    const {
      typeSpeed = 80,
      deleteSpeed = 40,
      pauseTime = 2200,
      cursorClass = 'typewriter-cursor'
    } = options;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const cursor = document.createElement('span');
    cursor.className = cursorClass;
    cursor.setAttribute('aria-hidden', 'true');

    const textNode = document.createTextNode('');
    el.appendChild(textNode);
    el.appendChild(cursor);

    const type = () => {
      const currentWord = words[wordIndex % words.length];

      if (!isDeleting) {
        textNode.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(type, pauseTime);
          return;
        }
      } else {
        textNode.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex++;
        }
      }

      setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    };

    setTimeout(type, 800);
  }
};

// ════════════════════════════════════════════════════════════
// HERO ANIMATIONS (GSAP)
// ════════════════════════════════════════════════════════════
const HeroAnimations = {
  init() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-label', { opacity: 1, y: 0, duration: 0.7, delay: 0.5 })
      .to('.hero-title', { opacity: 1, y: 0, duration: 0.9 }, '-=0.3')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('.hero-stats', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3');

    // Parallax on scroll
    gsap.to('.hero-bg-img', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Floating glow
    gsap.to('.hero-glow', {
      y: -40,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  },

  initHome2() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero2-label', { opacity: 0, y: 20, duration: 0.6, delay: 0.5 })
      .from('.hero2-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
      .from('.hero2-subtitle', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero2-actions', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero2-card', { opacity: 0, x: 40, duration: 0.7, stagger: 0.15 }, '-=0.5');
  }
};

// ════════════════════════════════════════════════════════════
// SCROLL ANIMATIONS (GSAP ScrollTrigger)
// ════════════════════════════════════════════════════════════
const ScrollAnimations = {
  init() {
    // Generic reveal
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Stagger cards
    gsap.utils.toArray('.stagger-parent').forEach(parent => {
      const children = parent.querySelectorAll('.stagger-child');
      gsap.fromTo(children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Section titles
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 88%'
          }
        }
      );
    });

    // Counter animation
    gsap.utils.toArray('.count-up').forEach(el => {
      const target = parseFloat(el.getAttribute('data-target') || el.textContent.replace(/[^0-9.]/g, ''));
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo({ val: 0 }, { val: target }, {
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() {
              const v = this.targets()[0].val;
              el.textContent = prefix + (Number.isInteger(target) ? Math.round(v) : v.toFixed(1)) + suffix;
            }
          });
        }
      });
    });

    // Image parallax
    gsap.utils.toArray('.parallax-img').forEach(img => {
      gsap.fromTo(img,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('section') || img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });
  }
};

// ════════════════════════════════════════════════════════════
// TESTIMONIAL CAROUSEL
// ════════════════════════════════════════════════════════════
const Carousel = {
  current: 0,
  total: 0,
  track: null,
  autoplayTimer: null,

  init() {
    this.track = document.querySelector('.testimonial-track');
    if (!this.track) return;

    this.total = this.track.querySelectorAll('.testimonial-slide').length;
    if (this.total === 0) return;

    this.updateDots();
    this.startAutoplay();

    document.querySelector('.carousel-prev')?.addEventListener('click', () => {
      this.go(this.current - 1);
      this.resetAutoplay();
    });

    document.querySelector('.carousel-next')?.addEventListener('click', () => {
      this.go(this.current + 1);
      this.resetAutoplay();
    });

    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => {
        this.go(i);
        this.resetAutoplay();
      });
    });

    // Touch/swipe support
    let startX = 0;
    this.track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    this.track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.go(this.current + (diff > 0 ? 1 : -1));
        this.resetAutoplay();
      }
    });
  },

  go(index) {
    this.current = ((index % this.total) + this.total) % this.total;
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    this.updateDots();
  },

  updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
    });
  },

  startAutoplay() {
    this.autoplayTimer = setInterval(() => this.go(this.current + 1), 5000);
  },

  resetAutoplay() {
    clearInterval(this.autoplayTimer);
    this.startAutoplay();
  }
};

// ════════════════════════════════════════════════════════════
// JOB FILTER
// ════════════════════════════════════════════════════════════
const JobFilter = {
  init() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card[data-category]');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        jobCards.forEach(card => {
          const show = category === 'all' || card.getAttribute('data-category') === category;
          gsap.to(card, {
            opacity: show ? 1 : 0.2,
            scale: show ? 1 : 0.95,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    });
  }
};

// ════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ════════════════════════════════════════════════════════════
const FAQ = {
  init() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      question?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = '0';
        });

        // Open clicked (if was closed)
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
};

// ════════════════════════════════════════════════════════════
// FORM VALIDATION
// ════════════════════════════════════════════════════════════
const FormValidator = {
  rules: {
    required: (val) => val.trim().length > 0,
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    minLength: (val, min) => val.trim().length >= min,
    match: (val, otherVal) => val === otherVal
  },

  showError(input, message) {
    const group = input.closest('.form-group');
    input.classList.add('is-error');
    input.classList.remove('is-valid');
    const errEl = group?.querySelector('.form-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
  },

  showValid(input) {
    const group = input.closest('.form-group');
    input.classList.remove('is-error');
    input.classList.add('is-valid');
    const errEl = group?.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
  },

  clearState(input) {
    input.classList.remove('is-error', 'is-valid');
    const group = input.closest('.form-group');
    const errEl = group?.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
  },

  validateField(input) {
    const type = input.type;
    const val = input.value;
    const name = input.name || input.id;

    if (input.required && !this.rules.required(val)) {
      this.showError(input, 'This field is required.');
      return false;
    }

    if (type === 'email' && val && !this.rules.email(val)) {
      this.showError(input, 'Please enter a valid email address.');
      return false;
    }

    if (type === 'password' && val && !this.rules.minLength(val, 8)) {
      this.showError(input, 'Password must be at least 8 characters.');
      return false;
    }

    if (name === 'confirm_password' || name === 'confirmPassword') {
      const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
      if (passwordInput && val !== passwordInput.value) {
        this.showError(input, 'Passwords do not match.');
        return false;
      }
    }

    if (val) this.showValid(input);
    return true;
  },

  initForm(formSelector, onSuccess) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-error')) {
          this.validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      inputs.forEach(input => {
        if (input.type !== 'submit' && input.type !== 'hidden') {
          if (!this.validateField(input)) isValid = false;
        }
      });

      // Checkbox check
      const termsCheckbox = form.querySelector('.terms-checkbox');
      if (termsCheckbox && !termsCheckbox.checked) {
        this.showError(termsCheckbox, 'You must accept the terms to continue.');
        isValid = false;
      }

      if (isValid && typeof onSuccess === 'function') {
        onSuccess(form);
      }
    });
  }
};

// ════════════════════════════════════════════════════════════
// PASSWORD TOGGLE
// ════════════════════════════════════════════════════════════
const PasswordToggle = {
  init() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.password-group')?.querySelector('input');
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.querySelector('.icon-eye')?.style.setProperty('display', isPassword ? 'none' : 'block');
        btn.querySelector('.icon-eye-off')?.style.setProperty('display', isPassword ? 'block' : 'none');
      });
    });
  }
};

// ════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ════════════════════════════════════════════════════════════
const Countdown = {
  init(targetDate) {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        document.querySelectorAll('.countdown-num').forEach(el => el.textContent = '00');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = n => String(n).padStart(2, '0');
      const [dEl, hEl, mEl, sEl] = document.querySelectorAll('.countdown-num');
      if (dEl) dEl.textContent = pad(days);
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(minutes);
      if (sEl) sEl.textContent = pad(seconds);
    };

    update();
    setInterval(update, 1000);
  }
};

// ════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ════════════════════════════════════════════════════════════
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// ════════════════════════════════════════════════════════════
// DASHBOARD SIDEBAR TOGGLE (mobile)
// ════════════════════════════════════════════════════════════
const DashboardSidebar = {
  init() {
    const toggle = document.querySelector('#sidebar-toggle, .dash-sidebar-toggle, .sidebar-toggle');
    const sidebar = document.querySelector('#dash-sidebar, .dash-sidebar, .sidebar');
    
    // Toggle mobile sidebar
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      document.addEventListener('click', e => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }

    // Sidebar navigation active state switching & smooth scroll targeting
    const navItems = document.querySelectorAll('.dash-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', e => {
        navItems.forEach(nav => {
          nav.classList.remove('active');
          nav.removeAttribute('aria-current');
        });
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');

        // Scroll or focus targeted section
        const id = item.id;
        let targetEl = null;
        if (id === 'dash-nav-overview') targetEl = document.querySelector('#dash-root');
        else if (id === 'dash-nav-jobs') targetEl = document.querySelector('#kpi-placements');
        else if (id === 'dash-nav-candidates') targetEl = document.querySelector('#candidates-table-wrap');
        else if (id === 'dash-nav-messages') targetEl = document.querySelector('#activity-wrap');
        else if (id === 'dash-nav-analytics') targetEl = document.querySelector('#chart-applications-wrap');
        else if (id === 'dash-nav-settings') targetEl = document.querySelector('#dash-sidebar');

        if (targetEl && id !== 'dash-nav-overview') {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (id === 'dash-nav-overview') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }
};

// ════════════════════════════════════════════════════════════
// BACK TO TOP
// ════════════════════════════════════════════════════════════
const BackToTop = {
  init() {
    // 1. Dynamic creation of floating button if not present in HTML
    let floatBtn = document.querySelector('.back-to-top-floating');
    if (!floatBtn) {
      floatBtn = document.createElement('button');
      floatBtn.className = 'back-to-top-btn back-to-top-floating';
      floatBtn.setAttribute('aria-label', 'Back to top');
      floatBtn.setAttribute('title', 'Back to top');
      floatBtn.type = 'button';
      floatBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      document.body.appendChild(floatBtn);
    }

    // 2. Scroll event to toggle visibility
    const handleScroll = () => {
      if (window.scrollY > 250) {
        floatBtn.classList.add('visible');
      } else {
        floatBtn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 3. Smooth scroll handling for all back-to-top triggers
    document.querySelectorAll('.back-to-top-btn, .back-to-top-floating').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
};


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  Navbar.init();
  DrawerManager.init();
  SmoothScroll.init();
  ScrollAnimations.init();
  FAQ.init();
  JobFilter.init();
  Carousel.init();
  PasswordToggle.init();
  DashboardSidebar.init();
  BackToTop.init();

  // Page-specific inits
  if (document.querySelector('.hero')) {
    HeroAnimations.init();
    Typewriter.init('.typewriter-text', [
      'Top Talent',
      'Dream Careers',
      'Perfect Matches',
      'Future Leaders'
    ]);
  }

  if (document.querySelector('.hero2')) {
    HeroAnimations.initHome2();
  }

  if (document.querySelector('.countdown')) {
    Countdown.init('2026-12-31T00:00:00');
  }

  // Contact form
  FormValidator.initForm('#contactForm', (form) => {
    const successMsg = form.querySelector('.success-message');
    if (successMsg) successMsg.classList.add('visible');
    form.reset();
    form.querySelectorAll('.form-input').forEach(input => FormValidator.clearState(input));
    setTimeout(() => successMsg?.classList.remove('visible'), 5000);
  });

  // Newsletter forms
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !FormValidator.rules.email(input.value)) {
        FormValidator.showError(input, 'Please enter a valid email.');
        return;
      }
      FormValidator.showValid(input);
      input.value = '';
    });
  });
});
