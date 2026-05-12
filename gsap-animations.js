document.addEventListener('DOMContentLoaded', function() {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768; // Basic mobile check
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- Helper Function for Simple Reveals ---
    // Creates an elegant blur-fade + slide-up animation for given elements triggered by scroll
    function revealElement(elements, triggerElement, start = "top 88%", stagger = 0.12, y = 24) {
        if (!hasGsap || reduceMotion) return;
        gsap.from(elements, {
            opacity: 0,
            y: y,
            duration: 0.95,
            ease: "expo.out",
            stagger: stagger,
            scrollTrigger: {
                trigger: triggerElement || elements,
                start: start,
                end: "bottom top",
                toggleActions: "play none none none",
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
        video.setAttribute('preload', 'metadata');
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

        gsap.set(".hero-subtitle", { opacity: 0, y: 18 });
        gsap.set(".hero-title", { opacity: 0, y: 28, scale: 0.985, transformOrigin: "center center" });
        gsap.set(".hero-description", { opacity: 0, y: 20 });
        gsap.set(".hero-buttons .btn", { opacity: 0, y: 18, scale: 0.985 });
        gsap.set(".hero-scroll", { opacity: 0, y: 10 });

        if (reduceMotion) {
            gsap.set(".hero-subtitle, .hero-title, .hero-description", { opacity: 1, y: 0 });
            gsap.set(".hero-buttons .btn", { opacity: 1, y: 0, scale: 1 });
            gsap.set(".hero-scroll", { opacity: 1, y: 0 });
            return;
        }

        // Refined cinematic ease — sophisticated, gentle, intentional
        const heroEase = "expo.out";
        const heroTl = gsap.timeline({
            paused: true,
            defaults: { ease: heroEase }
        });
        heroTl
            .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1.05 })
            .to(".hero-title", { opacity: 1, y: 0, scale: 1, duration: 1.55 }, "-=0.72")
            .to(".hero-description", { opacity: 1, y: 0, duration: 1.1 }, "-=0.92")
            .to(".hero-buttons .btn", { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.12 }, "-=0.82")
            .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.95, ease: "power2.out" }, "-=0.55");

        const startHero = () => heroTl.play(0);
        if (document.body.classList.contains('is-loaded')) {
            startHero();
        } else {
            document.addEventListener('page:ready', startHero, { once: true });
        }

        // Lightweight non-pinned hero parallax — replaces the previous
        // pin+scrub timeline that animated 9 properties per scroll tick
        // and forced layout/repaint on backdrop-filter layers (the chief
        // cause of Safari scroll judder). Two transform-only tracks =
        // the GPU happily composites them with zero layout cost.
        if (!reduceMotion) {
            gsap.to(".hero-video", {
                yPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                }
            });

            gsap.to(".hero-content", {
                yPercent: -8,
                opacity: 0.55,
                ease: "none",
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.6,
                }
            });
        }
    }

    // --- 1b. Hero Depth Parallax (Pointer) ---
    function initHeroParallax() {
        if (!hasGsap || reduceMotion || !canHover) return;
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const layers = Array.from(hero.querySelectorAll('[data-hero-depth]'));
        if (!layers.length) return;

        const maxShift = 38;
        const movers = layers.map((layer) => {
            const depth = parseFloat(layer.getAttribute('data-hero-depth')) || 0.05;
            return {
                depth,
                setX: gsap.quickTo(layer, "x", { duration: 1.8, ease: "power3.out" }),
                setY: gsap.quickTo(layer, "y", { duration: 1.8, ease: "power3.out" })
            };
        });

        let rect = hero.getBoundingClientRect();
        const updateRect = () => { rect = hero.getBoundingClientRect(); };

        // rAF-throttled — fires at most once per frame (60fps cap)
        let parallaxTicking = false;
        let lastEvent = null;
        const applyMove = () => {
            parallaxTicking = false;
            if (!lastEvent || !rect.width || !rect.height) return;
            const relX = (lastEvent.clientX - rect.left) / rect.width - 0.5;
            const relY = (lastEvent.clientY - rect.top) / rect.height - 0.5;
            movers.forEach(({ depth, setX, setY }) => {
                setX(relX * maxShift * depth);
                setY(relY * maxShift * depth);
            });
        };

        const handleMove = (event) => {
            lastEvent = event;
            if (parallaxTicking) return;
            parallaxTicking = true;
            requestAnimationFrame(applyMove);
        };

        const reset = () => {
            lastEvent = null;
            movers.forEach(({ setX, setY }) => {
                setX(0);
                setY(0);
            });
        };

        hero.addEventListener('mouseenter', updateRect);
        hero.addEventListener('mousemove', handleMove, { passive: true });
        hero.addEventListener('mouseleave', reset);
        window.addEventListener('resize', updateRect);
    }
 
    // --- 2. About Section Animations ---
    // Reserved for future section-specific motion if needed.

     // --- 3. Generic Section Title Reveal ---
     function initSectionHeaders() {
         if (!hasGsap || reduceMotion) return;
         const canClip = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('clip-path: inset(0 0 0 0)');
         gsap.utils.toArray('.section-title-container').forEach(container => {
             const subtitle = container.querySelector('.section-subtitle');
             const title = container.querySelector('.section-title');
             const decoration = container.querySelector('.section-title-decoration');
             const description = container.querySelector('.section-description');

             const tl = gsap.timeline({
                 scrollTrigger: {
                     trigger: container,
                     start: "top 88%",
                     end: "bottom top",
                     toggleActions: "play none none none",
                 }
             });

             if (subtitle) tl.from(subtitle, { opacity: 0, y: 14, duration: 0.7, ease: 'expo.out' });
             if (title && canClip) {
                 tl.fromTo(title,
                     { opacity: 0, y: 16, clipPath: "inset(0 0 100% 0)" },
                     { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: 'expo.out' },
                     "-=0.45"
                 );
             } else if (title) {
                 tl.from(title, { opacity: 0, y: 16, duration: 0.85, ease: 'expo.out' }, "-=0.45");
             }
             if (decoration) tl.from(decoration, { scaleX: 0, opacity: 0, duration: 0.9, ease: 'expo.out' }, "-=0.55");
             if (description) tl.from(description, { opacity: 0, y: 14, duration: 0.85, ease: 'expo.out' }, "-=0.7");
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

     // --- 7. Pointer Spotlight for Buttons (rAF-throttled) ---
     function initButtonSpotlight() {
         // Intentionally disabled in the final editorial pass.
         // Static, subtle hover states perform better and feel less templated.
     }

     // --- 8. Scroll Progress ---
     function initScrollProgress() {
         const bar = document.querySelector('.scroll-progress-bar');
         if (!bar) return;

         const update = () => {
             const doc = document.documentElement;
             const total = doc.scrollHeight - window.innerHeight;
             const progress = total > 0 ? (window.scrollY / total) : 0;
             const clamped = Math.min(1, Math.max(0, progress));
             bar.style.transform = `scaleX(${clamped})`;
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
         if (document.querySelector('[data-section-indicator]')) return;

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

    // --- 7. Pause Off-Screen Decorative Blobs ---
    function initDecorativePause() {
        if (!('IntersectionObserver' in window)) return;
        const blobs = document.querySelectorAll('.decorative-element');
        if (!blobs.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('is-paused', !entry.isIntersecting);
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });

        blobs.forEach((blob) => observer.observe(blob));
    }

    // --- Run Initializations ---
    initHeroVideoPlayback();
    initAmbientVideoPlayback();
    initHeroAnimations();
    initHeroParallax();
    initSectionHeaders(); // Apply standard reveal to all section headers

    // Apply grid animations to specific sections
    initGridAnimations(".scholarship-options", ".scholarship-info, .scholarship-form", "top 75%", 0.2);
    initGridAnimations(".donation-methods", ".donation-method", "top 85%");
    initGridAnimations(".venue-options", ".venue-option", "top 85%", 0.15);
    initGridAnimations(".contact-wrapper", ".contact-info, .contact-form-container", "top 80%", 0.2);

    // Apply parallax glows
    initGlobalAnimations();
    initImpactCounters();
    initDecorativePause();
    initButtonSpotlight();
    initScrollProgress();
    initScrollSpy();

    if (hasGsap) {
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
    }


    // --- Hero Scroll-Down Button Functionality ---
    const heroScrollBtn = document.querySelector('.hero-scroll');
    if (heroScrollBtn) {
        heroScrollBtn.addEventListener('click', () => {
            const targetSelector = heroScrollBtn.getAttribute('data-scroll-target');
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            const heroSection = document.querySelector('.hero');
            const nextSection = heroSection ? heroSection.nextElementSibling : null;
            if (nextSection && nextSection.scrollIntoView) {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Card tilt and pointer spotlight are intentionally disabled.

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
                    y: 36,
                    scale: 0.985
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.05,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }

    initCardReveals();

    // ========== Donation Widget (Amounts + Tabs) ==========
    function initDonationWidgets() {
        const widgets = document.querySelectorAll('[data-donation-widget]');
        if (!widgets.length) return;

        widgets.forEach(widget => {
            const tabs = Array.from(widget.querySelectorAll('.donation-tab[data-tab]'));
            const panels = Array.from(widget.querySelectorAll('.donation-panel[data-panel]'));
            const tablist = widget.querySelector('.donation-tablist');

            const activateTab = (tabId) => {
                if (tablist) {
                    tablist.dataset.active = tabId;
                }
                tabs.forEach(tab => {
                    const isActive = tab.dataset.tab === tabId;
                    tab.classList.toggle('is-active', isActive);
                    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                panels.forEach(panel => {
                    const isActive = panel.dataset.panel === tabId;
                    panel.classList.toggle('is-active', isActive);
                    panel.hidden = !isActive;
                });
            };

            const initialTab = tabs.find(tab => tab.classList.contains('is-active')) || tabs[0];
            if (initialTab) {
                activateTab(initialTab.dataset.tab);
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', () => activateTab(tab.dataset.tab));
            });
        });
    }

    initDonationWidgets();

    // ========== Donation Banner Close Functionality ==========
    const donationBanner = document.getElementById('donationBanner');
    const closeBannerBtn = document.getElementById('closeDonationBanner');
    const bannerBodyClass = 'banner-collapsed';

    if (!donationBanner) {
        document.body.classList.add(bannerBodyClass);
    }

    const updateBannerCollapsedState = () => {
        if (!donationBanner) {
            return;
        }
        const isCollapsed = donationBanner.classList.contains('hidden') ||
            donationBanner.classList.contains('scroll-hidden');
        document.body.classList.toggle(bannerBodyClass, isCollapsed);
    };

    if (closeBannerBtn && donationBanner) {
        closeBannerBtn.addEventListener('click', () => {
            donationBanner.classList.add('hidden');
            // Store in localStorage so it stays closed
            localStorage.setItem('donationBannerClosed', 'true');
            updateBannerCollapsedState();
        });
    }

    // Check if banner was previously closed
    if (donationBanner && localStorage.getItem('donationBannerClosed') === 'true') {
        donationBanner.classList.add('hidden');
        updateBannerCollapsedState();
    }

    // ========== Smart Scroll Behavior for Donation Banner ==========
    if (donationBanner && localStorage.getItem('donationBannerClosed') !== 'true') {
        let lastScrollTop = 0;
        const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show
        let bannerTicking = false;

        const handleBannerScroll = () => {
            if (bannerTicking) return;
            bannerTicking = true;
            requestAnimationFrame(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Only react after scrolling past threshold
                if (scrollTop > scrollThreshold) {
                    if (scrollTop > lastScrollTop) {
                        // Scrolling down - hide banner
                        donationBanner.classList.add('scroll-hidden');
                    } else {
                        // Scrolling up - show banner
                        donationBanner.classList.remove('scroll-hidden');
                    }
                } else {
                    // At top of page - always show banner
                    donationBanner.classList.remove('scroll-hidden');
                }

                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                updateBannerCollapsedState();
                bannerTicking = false;
            });
        };

        window.addEventListener('scroll', handleBannerScroll, { passive: true });
    }

}); // End DOMContentLoaded
