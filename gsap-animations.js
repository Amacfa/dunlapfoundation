document.addEventListener('DOMContentLoaded', function() {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768; // Basic mobile check
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- Helper Function for Simple Reveals ---
    // Creates a fade-in + slide-up animation for given elements triggered by scroll
    function revealElement(elements, triggerElement, start = "top 85%", stagger = 0.1, y = 30) {
        if (!hasGsap || reduceMotion) return;
        gsap.from(elements, {
            opacity: 0,
            y: y,
            duration: 0.8,
            ease: "power3.out",
            stagger: stagger,
            scrollTrigger: {
                trigger: triggerElement || elements, // Use element itself or a parent
                start: start,
                end: "bottom top", // Animate fully in view
                toggleActions: "play none none none", // Play once on enter
                // markers: true // DEBUG
            }
        });
    }

    function primeInlineAutoplay(video) {
        if (!video) return;
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        video.setAttribute('preload', 'auto');
        video.load();
    }

    // --- Hero Video Reliability ---
    function initHeroVideoPlayback() {
        const hero = document.querySelector('.hero');
        const video = hero ? hero.querySelector('.hero-video') : null;
        if (!hero || !video) return;

        primeInlineAutoplay(video);

        const markPlaying = () => {
            hero.classList.add('video-playing');
        };

        const markPaused = () => {
            hero.classList.remove('video-playing');
        };

        const attemptPlay = () => {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(markPlaying).catch(markPaused);
            } else {
                window.setTimeout(() => {
                    if (video.paused) {
                        markPaused();
                    } else {
                        markPlaying();
                    }
                }, 350);
            }
        };

        video.addEventListener('playing', markPlaying);
        video.addEventListener('pause', markPaused);
        video.addEventListener('ended', markPaused);
        video.addEventListener('error', markPaused);

        attemptPlay();
        if (video.readyState < 2) {
            video.addEventListener('canplay', attemptPlay, { once: true });
        }

        const retryOnShow = () => {
            if (document.visibilityState !== 'visible') return;
            attemptPlay();
        };
        document.addEventListener('visibilitychange', retryOnShow);
        window.addEventListener('pageshow', retryOnShow);
        document.addEventListener('page:ready', attemptPlay, { once: true });
    }

    function initAmbientVideoPlayback() {
        const videos = Array.from(document.querySelectorAll('.soiree-video'));
        if (!videos.length) return;

        const attempt = (video) => {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(() => {});
            }
        };

        videos.forEach((video) => {
            primeInlineAutoplay(video);
            attempt(video);
            if (video.readyState < 2) {
                video.addEventListener('canplay', () => attempt(video), { once: true });
            }
        });

        const retryAll = () => {
            if (document.visibilityState !== 'visible') return;
            videos.forEach(attempt);
        };

        document.addEventListener('visibilitychange', retryAll);
        window.addEventListener('pageshow', retryAll);
        document.addEventListener('page:ready', retryAll, { once: true });
    }

    // --- 1. Hero Section Animations ---
    function initHeroAnimations() {
        if (!hasGsap) return;

        const hero = document.querySelector('.hero');
        if (!hero) return;

        const heroTargets = ".hero-subtitle, .hero-title, .hero-description";
        gsap.set(heroTargets, { opacity: 0, y: 30, filter: "blur(10px)" });
        gsap.set(".hero-buttons .btn", { opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" });
        gsap.set(".hero-scroll", { opacity: 0, y: 12 });

        if (reduceMotion) {
            gsap.set(heroTargets, { opacity: 1, y: 0, filter: "blur(0px)" });
            gsap.set(".hero-buttons .btn", { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
            gsap.set(".hero-scroll", { opacity: 1, y: 0 });
            return;
        }

        const heroTl = gsap.timeline({ paused: true });
        heroTl
            .to(".hero-subtitle", { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" })
            .to(".hero-title", { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "power3.out" }, "-=0.5")
            .to(".hero-description", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }, "-=0.7")
            .to(".hero-buttons .btn", { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.15 }, "-=0.6")
            .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

        const startHero = () => heroTl.play(0);
        if (document.body.classList.contains('is-loaded')) {
            startHero();
        } else {
            document.addEventListener('page:ready', startHero, { once: true });
        }

        if (!isMobile) {
            const heroScrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=80%",
                    scrub: true,
                    pin: true,
                    anticipatePin: 1
                }
            });

            heroScrollTl
                .to(".hero-video", {
                    scale: 1.08,
                    filter: "brightness(0.35) saturate(0.9) contrast(1.1)",
                    transformOrigin: "center center"
                }, 0)
                .to(".hero-overlay", { opacity: 0.98 }, 0)
                .to(".hero-content", { yPercent: -10, opacity: 0.65 }, 0)
                .to(".hero-decorative-element", { opacity: 0.2, scale: 1.08 }, 0)
                .to(".hero-scroll", { opacity: 0 }, 0.1);
        } else {
            const mobileHeroTl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

            mobileHeroTl
                .to(".hero-video", { scale: 1.04, transformOrigin: "center center" }, 0)
                .to(".hero-overlay", { opacity: 0.98 }, 0)
                .to(".hero-content", { y: -18, opacity: 0.85 }, 0)
                .to(".hero-decorative-element", { opacity: 0.25, scale: 1.04 }, 0)
                .to(".hero-scroll", { opacity: 0 }, 0.1);

            gsap.to(".hero-decorative-element.blue-glow", {
                y: -16,
                x: 10,
                duration: 10,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });

            gsap.to(".hero-decorative-element.pink-glow", {
                y: 14,
                x: -8,
                duration: 12,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        }
    }
 
    // --- 2. About Section Animations ---
    // Reserved for future section-specific motion if needed.

     // --- 3. Generic Section Title Reveal ---
     function initSectionHeaders() {
         if (!hasGsap || reduceMotion) return;
         gsap.utils.toArray('.section-title-container').forEach(container => {
             const subtitle = container.querySelector('.section-subtitle');
             const title = container.querySelector('.section-title');
             const decoration = container.querySelector('.section-title-decoration');
             const description = container.querySelector('.section-description');

             const tl = gsap.timeline({
                 scrollTrigger: {
                     trigger: container,
                     start: "top 85%",
                     end: "bottom top",
                     toggleActions: "play none none none",
                     // markers: true // DEBUG
                 }
             });

             // Initial hidden states handled implicitly by .from()
             if (subtitle) tl.from(subtitle, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
             if (title) tl.from(title, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, "-=0.3");
             if (decoration) tl.from(decoration, { scaleX: 0, duration: 0.7, ease: 'power3.out' }, "-=0.4");
             if (description) tl.from(description, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, "-=0.5");
         });
     }


     // --- 4. Staggered Card/Grid Reveals ---
     function initGridAnimations(gridSelector, itemSelector, triggerStart = "top 85%", stagger = 0.1) {
         if (!hasGsap || reduceMotion) return;
         const items = gsap.utils.toArray(itemSelector);
         if (items.length === 0) return; // Exit if no items found

         gsap.from(items, {
             opacity: 0,
             y: 50,
             scale: 0.95,
             duration: 0.6,
             stagger: stagger,
             ease: "power2.out",
             scrollTrigger: {
                 trigger: gridSelector, // Trigger based on the grid container
                 start: triggerStart,
                 toggleActions: "play none none none",
                 // markers: true // DEBUG
             }
         });
     }

     // --- 5. Parallax for Decorative Glows ---
     function initGlobalAnimations() {
         if (!hasGsap || reduceMotion || isMobile) return;
         gsap.utils.toArray('.decorative-element, .hero-decorative-element').forEach(el => {
             gsap.to(el, {
                 yPercent: gsap.utils.random(-50, 50), // Random slight vertical movement
                 xPercent: gsap.utils.random(-30, 30), // Random slight horizontal movement
                 ease: "none",
                 scrollTrigger: {
                     trigger: "body", // Linked to overall page scroll
                     start: "top top",
                     end: "bottom bottom",
                     scrub: 1.5 + Math.random() * 2, // Slightly different scrub speeds
                 }
             });
         });

         // Optional: Smooth header transition with GSAP (Alternative to CSS class toggle)
         // This provides more control over easing but adds complexity
         // Comment out the JS scroll listener for adding/removing 'scrolled' class if using this
        /*
         ScrollTrigger.create({
             trigger: "body",
             start: "top -100", // Start changing after scrolling 100px
             end: 99999, // Keep checking
             toggleClass: { targets: "header", className: "scrolled" }, // Simple toggle still often best
             // Or use direct animation:
             // onEnter: () => gsap.to("header", { backgroundColor: "rgba(10, 12, 21, 0.9)", backdropFilter: "blur(10px)", padding: "1rem 0", borderBottom: "1px solid var(--separator)", duration: 0.3, ease: "power1.out" }),
             // onLeaveBack: () => gsap.to("header", { backgroundColor: "transparent", backdropFilter: "blur(0px)", padding: "1.5rem 0", borderBottom: "1px solid transparent", duration: 0.3, ease: "power1.out" }),
             // markers: true // DEBUG
         });
         */
     }

     // --- 6. Impact Counters ---
     function initImpactCounters() {
         if (!hasGsap) return;

         const counters = document.querySelectorAll('.impact-number');
         if (!counters.length) return;

         const items = [];
         counters.forEach(el => {
             const raw = el.textContent.trim();
             const match = raw.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
             if (!match) return;

             const value = parseFloat(match[2].replace(/,/g, ''));
             if (Number.isNaN(value)) return;

             items.push({
                 el,
                 raw,
                 prefix: match[1],
                 suffix: match[3],
                 value,
                 decimals: match[2].includes('.') ? 1 : 0
             });
         });

         if (!items.length) return;

         if (reduceMotion) {
             items.forEach(item => {
                 item.el.textContent = item.raw;
             });
             return;
         }

         const trigger = document.querySelector('.impact-stats');
         if (!trigger) return;

         const formatValue = (num, decimals) => num.toLocaleString(undefined, {
             minimumFractionDigits: decimals,
             maximumFractionDigits: decimals
         });

         ScrollTrigger.create({
             trigger,
             start: "top 80%",
             once: true,
             onEnter: () => {
                 items.forEach(item => {
                     const counter = { value: 0 };
                     const snapValue = item.decimals ? Math.pow(10, -item.decimals) : 1;

                     gsap.to(counter, {
                         value: item.value,
                         duration: 1.6,
                         ease: "power2.out",
                         snap: { value: snapValue },
                         onUpdate: () => {
                             item.el.textContent = `${item.prefix}${formatValue(counter.value, item.decimals)}${item.suffix}`;
                         },
                         onComplete: () => {
                             item.el.textContent = item.raw;
                         }
                     });
                 });
             }
         });
     }

     // --- 7. Pointer Spotlight for Buttons ---
     function initButtonSpotlight() {
         if (!canHover || reduceMotion) return;

         document.querySelectorAll('.btn, .payment-button').forEach(el => {
             el.addEventListener('mousemove', (e) => {
                 const r = el.getBoundingClientRect();
                 const x = ((e.clientX - r.left) / r.width) * 100;
                 const y = ((e.clientY - r.top) / r.height) * 100;
                 el.style.setProperty('--mx', `${x.toFixed(2)}%`);
                 el.style.setProperty('--my', `${y.toFixed(2)}%`);
             });

             el.addEventListener('mouseleave', () => {
                 el.style.setProperty('--mx', '50%');
                 el.style.setProperty('--my', '50%');
             });
         });
     }

     // --- 8. Scroll Progress ---
     function initScrollProgress() {
         const bar = document.querySelector('.scroll-progress-bar');
         if (!bar) return;

         const update = () => {
             const doc = document.documentElement;
             const total = doc.scrollHeight - window.innerHeight;
             const progress = total > 0 ? (window.scrollY / total) : 0;
             bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
         };

         let ticking = false;
         const onScroll = () => {
             if (ticking) return;
             ticking = true;
             requestAnimationFrame(() => {
                 update();
                 ticking = false;
             });
         };

         update();
         window.addEventListener('scroll', onScroll, { passive: true });
         window.addEventListener('resize', update);
     }

     // --- 9. Scroll Spy for Navigation ---
     function initScrollSpy() {
         const sections = Array.from(document.querySelectorAll('section[id]'));
         if (!sections.length) return;

         const navLinks = Array.from(document.querySelectorAll('.nav-link'));
         const mobileLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));

         const setActive = (id) => {
             navLinks.forEach(link => {
                 const isActive = link.getAttribute('href') === `#${id}`;
                 const parent = link.closest('.nav-item');
                 if (parent) parent.classList.toggle('active', isActive);
                 if (isActive) {
                     document.dispatchEvent(new CustomEvent('nav:active', { detail: { link } }));
                 }
             });

             mobileLinks.forEach(link => {
                 link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
             });
         };

         if (hasGsap) {
             sections.forEach(section => {
                 ScrollTrigger.create({
                     trigger: section,
                     start: "top 45%",
                     end: "bottom 45%",
                     onEnter: () => setActive(section.id),
                     onEnterBack: () => setActive(section.id)
                 });
             });
         } else {
             const observer = new IntersectionObserver((entries) => {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                         setActive(entry.target.id);
                     }
                 });
             }, { threshold: 0.5 });

             sections.forEach(section => observer.observe(section));
         }

         if (sections[0]) {
             setActive(sections[0].id);
         }
     }

    // --- Run Initializations ---
    initHeroVideoPlayback();
    initAmbientVideoPlayback();
    initHeroAnimations();
    initSectionHeaders(); // Apply standard reveal to all section headers

    // Apply grid animations to specific sections
    initGridAnimations(".scholarship-options", ".scholarship-info, .scholarship-form", "top 75%", 0.2);
    initGridAnimations(".donation-methods", ".donation-method", "top 85%");
    initGridAnimations(".venue-options", ".venue-option", "top 85%", 0.15);
    initGridAnimations(".contact-wrapper", ".contact-info, .contact-form-container", "top 80%", 0.2);

    // Apply parallax glows
    initGlobalAnimations();
    initImpactCounters();
    initButtonSpotlight();
    initScrollProgress();
    initScrollSpy();

    if (hasGsap) {
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
    }


    // --- Add specific reveals for elements not covered by helpers if needed ---
    revealElement(".elegance-quote", ".elegance-quote", "top 90%");

    // --- Hero Scroll-Down Button Functionality ---
    const heroScrollBtn = document.querySelector('.hero-scroll');
    if (heroScrollBtn) {
        heroScrollBtn.addEventListener('click', () => {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        // Add cursor pointer to make it clear it's clickable
        heroScrollBtn.style.cursor = 'pointer';
    }

    // --- Pause Autoplay Videos When Offscreen (Performance) ---
    const videos = document.querySelectorAll('video[autoplay]');
    if (videos.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) {
                    target.play().catch(() => {});
                } else {
                    target.pause();
                }
            });
        }, { threshold: 0.2 });

        videos.forEach(video => videoObserver.observe(video));
    }

    // --- UNIFIED MOTION SYSTEM ---
    if (!reduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                const el = entry.target;
                el.classList.add('is-visible');

                // Stagger immediate children if requested
                if (el.hasAttribute('data-animate-stagger')) {
                    const step = Number(el.dataset.stagger || 90);
                    [...el.children].forEach((child, i) => {
                        child.style.setProperty('--d', `${i * step}ms`);
                    });
                }

                revealObserver.unobserve(el);
            }
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('[data-animate], [data-animate-stagger]').forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Skip animations for users who prefer reduced motion
        document.querySelectorAll('[data-animate], [data-animate-stagger]').forEach(el => {
            el.classList.add('is-visible');
        });
    }

    // --- 3D TILT + SPOTLIGHT EFFECT ---
    if (canHover && !reduceMotion) {
        document.querySelectorAll('.partner-card, .glass-card').forEach(card => {
            card.classList.add('tilt-card');

            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;

                card.style.transform =
                    `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;

                card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(2)}%`);
                card.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(2)}%`);
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // --- NAV INDICATOR (Gliding Underline) ---
    const nav = document.querySelector('.navbar');
    const navList = document.querySelector('.nav-list');

    if (nav && navList && !reduceMotion) {
        // Create indicator element
        const indicator = document.createElement('span');
        indicator.className = 'nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        nav.appendChild(indicator);

        function moveIndicator(link) {
            const r = link.getBoundingClientRect();
            const nr = nav.getBoundingClientRect();
            indicator.style.width = `${r.width}px`;
            indicator.style.transform = `translateX(${r.left - nr.left}px)`;
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => moveIndicator(link));
            link.addEventListener('focus', () => moveIndicator(link));
        });

        document.addEventListener('nav:active', (event) => {
            const link = event.detail && event.detail.link ? event.detail.link : null;
            if (link) moveIndicator(link);
        });

        const activeLink = nav.querySelector('.nav-item.active .nav-link');
        if (activeLink) {
            moveIndicator(activeLink);
        }

        window.addEventListener('resize', () => {
            const currentActive = nav.querySelector('.nav-item.active .nav-link');
            if (currentActive) moveIndicator(currentActive);
        });

        // Hide indicator when leaving nav
        nav.addEventListener('mouseleave', () => {
            const currentActive = nav.querySelector('.nav-item.active .nav-link');
            if (currentActive) {
                moveIndicator(currentActive);
            } else {
                indicator.style.width = '0';
            }
        });
    }

    // ========== Glass Card Luxury Reveals ==========
    function initCardReveals() {
        if (!hasGsap || reduceMotion) return;

        gsap.utils.toArray('.glass-card, .scholarship-card, .donation-card').forEach((card, i) => {
            gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.97,
                    filter: "blur(12px) brightness(0.8)"
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0) brightness(1)",
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }

    initCardReveals();

}); // End DOMContentLoaded
