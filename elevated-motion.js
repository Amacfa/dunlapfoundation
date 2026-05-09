/* =====================================================================
   ELEVATED MOTION — Award-quality interactions
   - Character-split title reveal
   - Scroll-driven image mask reveals
   - Section eyebrow micro-reveal
   - Vertical section indicator (desktop ≥1100px)
   - Page curtain transitions (between same-origin html files)
   - Impact-monument counter
   - Mobile-safe: skips heavy effects on touch / small screens / reduce-motion
   ===================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  // ---------- 1. Character-split title reveal ----------
  function splitTitle(el) {
    if (!el || el.dataset.split === 'true') return;
    el.dataset.split = 'true';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());

    const fragments = Array.from(el.childNodes);
    el.innerHTML = '';

    const appendText = (node, target) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(' '));
            return;
          }
          const wordSpan = document.createElement('span');
          wordSpan.className = 'split-word';
          [...part].forEach((char) => {
            const charSpan = document.createElement('span');
            charSpan.className = 'split-char';
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
          });
          target.appendChild(wordSpan);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Preserve nested spans (e.g., .text-gradient, .hero-title-soft) and split inside
        const wrapper = node.cloneNode(false);
        Array.from(node.childNodes).forEach((child) => appendText(child, wrapper));
        target.appendChild(wrapper);
      }
    };

    fragments.forEach((node) => {
      appendText(node, el);
    });
  }

  function initHeroTitleReveal() {
    if (!hasGsap) return;
    const title = document.querySelector('.hero-title');
    if (!title) return;

    splitTitle(title);

    const chars = title.querySelectorAll('.split-char');
    if (!chars.length) return;

    window.gsap.set(title, {
      opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
      clearProps: 'transform,filter,opacity',
    });

    if (reduceMotion) {
      window.gsap.set(chars, { opacity: 1, y: 0, filter: 'blur(0)', rotate: 0 });
      return;
    }

    window.gsap.set(chars, {
      opacity: 0,
      y: '0.55em',
      filter: 'blur(2px)',
      rotate: 4,
      willChange: 'transform, opacity, filter',
    });

    const start = () => {
      window.gsap.set(title, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
      window.gsap.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        rotate: 0,
        duration: 1.4,
        ease: 'expo.out',
        stagger: { each: 0.022, from: 'start' },
        delay: 0.25,
        onComplete: () => {
          window.gsap.set(chars, { clearProps: 'willChange,filter,transform' });
        },
      });
    };

    if (document.body.classList.contains('is-loaded')) {
      start();
    } else {
      document.addEventListener('page:ready', start, { once: true });
    }
  }

  // ---------- 2. Scroll-driven image mask reveals ----------
  function initMaskReveals() {
    const targets = [
      '.about-img-wrapper',
      '.partner-img-container',
      '.member-img-container',
    ];

    targets.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.classList.contains('reveal-mask')) el.classList.add('reveal-mask');
      });
    });

    const masks = document.querySelectorAll('.reveal-mask');

    if (reduceMotion || isTouch || isSmallScreen) {
      masks.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      masks.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    masks.forEach((el) => observer.observe(el));
  }

  // ---------- 3. Section eyebrow micro-reveal ----------
  function initEyebrowReveals() {
    if (!hasGsap || !hasScrollTrigger || reduceMotion) return;

    document.querySelectorAll('.section-subtitle, .scholarship-eyebrow, .impact-monument-eyebrow, .about-hangtag').forEach((el) => {
      window.gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    });
  }

  // ---------- 4. Vertical section indicator ----------
  function initSectionIndicator() {
    const indicator = document.querySelector('[data-section-indicator]');
    if (!indicator) return;

    const numEl = indicator.querySelector('.section-indicator-num');
    const nameEl = indicator.querySelector('.section-indicator-name');
    const ruleEl = indicator.querySelector('.section-indicator-rule');

    const sections = Array.from(document.querySelectorAll('section[data-section-num]'));
    if (!sections.length) return;

    let currentSection = null;
    let progressTicking = false;

    const setNavActive = (id) => {
      const selector = `.nav-link[href="#${id}"], .mobile-nav-link[href="#${id}"]`;
      document.querySelectorAll('.nav-link[href^="#"], .mobile-nav-link[href^="#"]').forEach((link) => {
        const isActive = link.matches(selector);
        link.classList.toggle('active', isActive);
        const item = link.closest('.nav-item');
        if (item) item.classList.toggle('active', isActive);
      });

      const activeMainLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeMainLink) {
        document.dispatchEvent(new CustomEvent('nav:active', { detail: { link: activeMainLink } }));
      }
    };

    const setSection = (section) => {
      if (section === currentSection) return;
      currentSection = section;

      const num = section.getAttribute('data-section-num') || '';
      const name = section.getAttribute('data-section-name') || '';
      if (section.id) setNavActive(section.id);

      if (reduceMotion) {
        if (numEl) numEl.textContent = num;
        if (nameEl) nameEl.textContent = name;
        return;
      }

      indicator.classList.add('is-changing');
      window.setTimeout(() => {
        if (numEl) numEl.textContent = num;
        if (nameEl) nameEl.textContent = name;
        indicator.classList.remove('is-changing');
      }, 220);
    };

    const pickSection = () => {
      const header = document.getElementById('header');
      const headerOffset = header ? header.getBoundingClientRect().height : 0;
      const probeY = window.scrollY + headerOffset + window.innerHeight * 0.28;
      let active = sections[0];

      sections.forEach((section) => {
        if (section.offsetTop <= probeY) active = section;
      });

      return active;
    };

    // Per-section scroll progress (rule fill) — rAF gated
    const updateProgress = () => {
      if (!currentSection || !ruleEl) return;
      const rect = currentSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = Math.min(Math.max(vh - rect.top, 0), total);
      const pct = Math.min(100, Math.max(0, (passed / total) * 100));
      ruleEl.style.setProperty('--section-progress', pct + '%');
    };

    const syncSectionState = () => {
      progressTicking = false;
      setSection(pickSection());
      updateProgress();
    };

    const requestSync = () => {
      if (progressTicking) return;
      progressTicking = true;
      requestAnimationFrame(syncSectionState);
    };

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    window.addEventListener('load', requestSync);

    // Initial set
    syncSectionState();
  }

  // ---------- 5. Page curtain transitions ----------
  function initPageTransitions() {
    if (reduceMotion) return;

    const curtain = document.querySelector('.page-curtain');
    if (!curtain) return;

    // ENTER — animate curtain out on page load
    const reveal = () => {
      curtain.classList.add('is-leaving');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          curtain.classList.add('is-revealed');
          window.setTimeout(() => {
            curtain.classList.remove('is-leaving', 'is-revealed');
          }, 950);
        });
      });
    };

    // Only animate the reveal if we arrived via curtain (sessionStorage flag)
    if (sessionStorage.getItem('curtain-pending') === '1') {
      sessionStorage.removeItem('curtain-pending');
      // Pre-position curtain in the "entered" state, then animate out
      curtain.classList.add('is-leaving');
      requestAnimationFrame(() => {
        requestAnimationFrame(reveal);
      });
    }

    // EXIT — intercept same-origin navigation
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a[href]');
      if (!link) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;

      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (_) {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      // Skip PDF / asset links (let browser handle natively)
      if (/\.(pdf|jpg|jpeg|png|webp|svg|gif|mp4|webm|mov)$/i.test(url.pathname)) return;

      e.preventDefault();

      sessionStorage.setItem('curtain-pending', '1');
      curtain.classList.add('is-entering');

      window.setTimeout(() => {
        window.location.href = url.href;
      }, 620);
    });

    // pageshow handles back-button cache restore
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        curtain.classList.remove('is-entering', 'is-leaving', 'is-revealed');
      }
    });
  }

  // ---------- 6. Impact monument counter ----------
  function initMonumentCounter() {
    if (!hasGsap) return;

    const targets = document.querySelectorAll('[data-counter-target]');
    if (!targets.length) return;

    const formatValue = (val, format) => {
      if (format === 'dollar-k') return '$' + Math.round(val) + 'K+';
      return String(Math.round(val));
    };

    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const format = el.getAttribute('data-counter-format') || 'int';
      if (Number.isNaN(target)) return;

      if (reduceMotion || isTouch || isSmallScreen) {
        el.textContent = formatValue(target, format);
        return;
      }

      const obj = { val: 0 };
      window.gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'expo.out',
        onUpdate: () => { el.textContent = formatValue(obj.val, format); },
        onComplete: () => { el.textContent = formatValue(target, format); },
      });
    };

    if (!('IntersectionObserver' in window)) {
      targets.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    targets.forEach((el) => observer.observe(el));
  }

  // ---------- Init sequence ----------
  function init() {
    initHeroTitleReveal();
    initMaskReveals();
    initEyebrowReveals();
    initSectionIndicator();
    initPageTransitions();
    initMonumentCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
