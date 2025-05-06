document.addEventListener('DOMContentLoaded', function() {

    gsap.registerPlugin(ScrollTrigger);

    // --- Configuration ---
    const isMobile = window.innerWidth <= 768; // Basic mobile check

    // --- Helper Function for Simple Reveals ---
    // Creates a fade-in + slide-up animation for given elements triggered by scroll
    function revealElement(elements, triggerElement, start = "top 85%", stagger = 0.1, y = 30) {
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

    // --- 1. Hero Section Animations ---
    function initHeroAnimations() {
        // --- Hero Content Enter Animation ---
        // Set initial state (already hidden is fine, but explicit is clear)
        gsap.set(".hero-subtitle, .hero-title, .hero-description, .hero-buttons .btn", { opacity: 0, y: 30 });

        // Timeline for sequenced entry
        let heroTl = gsap.timeline({ delay: 0.2 }); // Small delay after load
        heroTl.to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
              .to(".hero-title", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4") // Overlap
              .to(".hero-description", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
              .to(".hero-buttons .btn", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.2 }, "-=0.6"); // Stagger buttons

        // --- Hero Title Scaling Effect (Example Scrub) ---
        // Scale down slightly as user scrolls down the first part of the page
         gsap.to(".hero-title", {
            scale: 0.85, // Scale down to 85%
            opacity: 0.8, // Fade slightly
             scrollTrigger: {
                 trigger: ".hero",
                 start: "top top", // Starts when hero top hits viewport top
                 end: "bottom top", // Ends when hero bottom hits viewport top (100vh scroll)
                 scrub: 1, // Smooth scrubbing linked to scroll
                 // markers: true, // DEBUG
             }
         });

         // --- Background Elements Parallax (Example Scrub) ---
         // Make video/overlay move slower than scroll
         gsap.to(".hero-video, .hero-overlay", {
             yPercent: 30, // Move down 30% of its height as hero scrolls 100vh
             ease: "none", // Linear movement
             scrollTrigger: {
                 trigger: ".hero",
                 start: "top top",
                 end: "bottom top",
                 scrub: true, // Link to scroll
                 // markers: true, // DEBUG
             }
         });


        // --- Scroll Prompt Animation ---
        // Initial fade-in (can be simpler now)
         gsap.from(".hero-scroll", {
            opacity:0,
            y: 20,
            delay: 1.5, // Delay significantly after main content
            duration: 1,
            ease: "power1.inOut"
         });
        // Fade out on scroll
        gsap.to(".hero-scroll", {
            opacity: 0,
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "top -200", // Fade out quickly after scrolling down 200px
                scrub: 0.5, // Quick scrub
                // markers: true // DEBUG
            }
        });
    }

    // --- 2. About Section Animations ---
    function initAboutAnimations() {
        // Reveal Text Content
        revealElement(".about-text > *", ".about-text", "top 80%", 0.2); // Stagger children of about-text

        // Reveal Image
        gsap.from(".about-img-wrapper", {
             opacity: 0,
             scale: 0.8,
             duration: 1,
             ease: "power3.out",
             scrollTrigger: {
                 trigger: ".about-image",
                 start: "top 80%",
                 toggleActions: "play none none none",
                 // markers: true // DEBUG
             }
        });
         // Animate decoration slightly later
         gsap.from(".about-img-decoration", {
             opacity: 0,
             x: -30,
             delay: 0.4, // Delay after image starts animating
             duration: 0.8,
             ease: "power3.out",
             scrollTrigger: {
                 trigger: ".about-image",
                 start: "top 80%",
                 toggleActions: "play none none none",
                 // markers: true // DEBUG
             }
         });

        // Reveal Stats (Staggered)
        gsap.from(".stat-item", {
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.15, // Each stat animates 0.15s after the previous one
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".about-stats",
                start: "top 85%", // Trigger when stats container is visible
                toggleActions: "play none none none",
                // markers: true // DEBUG
            }
        });
    }

     // --- 3. Generic Section Title Reveal ---
     function initSectionHeaders() {
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
         gsap.utils.toArray('.decorative-element').forEach(el => {
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


    // --- Run Initializations ---
    initHeroAnimations();
    initAboutAnimations();
    initSectionHeaders(); // Apply standard reveal to all section headers

    // Apply grid animations to specific sections
    initGridAnimations(".scholarship-options", ".scholarship-info, .scholarship-form", "top 75%", 0.2);
    initGridAnimations(".donation-methods", ".donation-method", "top 85%");
    initGridAnimations(".impact-stats", ".impact-stat", "top 85%", 0.15);
    initGridAnimations(".venue-options", ".venue-option", "top 85%", 0.15);
    initGridAnimations(".events-calendar", ".event-card", "top 90%", 0.1); // Trigger later for calendar
    initGridAnimations(".partners-grid", ".partner-card", "top 85%", 0.1);
    initGridAnimations(".team-grid", ".team-member", "top 85%", 0.1);
    initGridAnimations(".contact-wrapper", ".contact-info, .contact-form-container", "top 80%", 0.2);

    // Apply parallax glows
    initGlobalAnimations();


    // --- Add specific reveals for elements not covered by helpers if needed ---
    revealElement(".elegance-quote", ".elegance-quote", "top 90%");


}); // End DOMContentLoaded
