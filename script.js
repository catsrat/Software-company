// 1. Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Update GSAP when Lenis scrolls
let scrollTimeout;
lenis.on('scroll', () => {
    ScrollTrigger.update();
    // Navbar scroll logic
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Custom text splitter for GSAP without SplitText license
function splitTextIntoWords(elementSelector) {
    const elements = document.querySelectorAll(elementSelector);
    elements.forEach(el => {
        const words = (el.textContent || '').trim().split(/\s+/);
        el.innerHTML = '';
        words.forEach(word => {
            const span = document.createElement('span');
            span.innerHTML = word + '&nbsp;';
            span.classList.add('word');
            span.style.display = 'inline-block';
            el.appendChild(span);
        });
    });
}

// Prepare specific texts
splitTextIntoWords('.split-text');
splitTextIntoWords('.word-reveal');

// 2.5 Word-by-Word Scroll Reveal
const revealTexts = document.querySelectorAll('.reveal-text');

revealTexts.forEach(text => {
    // Split text into words using textContent which is safer than innerText
    const rawText = text.textContent || '';
    const words = rawText.trim().split(/\s+/);
    text.innerHTML = '';
    
    words.forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'reveal-word';
        text.appendChild(span);
    });

    // Use fromTo so GSAP explicitly sets the start and end states regardless of refresh position
    gsap.fromTo(text.querySelectorAll('.reveal-word'), 
        {
            color: "rgba(255, 255, 255, 0.2)",
            opacity: 0.2
        },
        {
            scrollTrigger: {
                trigger: text,
                start: "top 85%",
                end: "bottom 50%",
                scrub: 1,
            },
            color: "#ffffff",
            opacity: 1,
            stagger: 0.1
        }
    );
});

// 3. GSAP Animations

// Hero Timeline
const tlHero = gsap.timeline();
tlHero.from(".badge", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out", delay: 0.2 })
      .from(".split-text .word", { y: 40, opacity: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.7)" }, "-=0.4")
      .from(".split-text-fade", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
      .from(".hero-actions", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
      .from(".main-dashboard", { opacity: 0, rotationY: 20, rotationX: -10, y: 50, duration: 1.2, ease: "power3.out" }, "-=0.8");

// Background Marquees connected to Scroll
gsap.to("#marquee-1", {
    xPercent: -20,
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 1 }
});
gsap.to("#marquee-2", {
    xPercent: 20, // Move opposite direction
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 1 }
});
gsap.to("#marquee-3", {
    xPercent: -30,
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: 1 }
});

// Stacking Cards Scroll Animation (Scale down cards slightly as the next one comes up)
const cards = gsap.utils.toArray('.stack-card');
cards.forEach((card, index) => {
    if (index === cards.length - 1) return; // Don't scale the last card
    
    gsap.to(card, {
        scale: 0.95,
        opacity: 0.5,
        scrollTrigger: {
            trigger: card,
            start: "top 12%",
            endTrigger: cards[index + 1],
            end: "top 20%",
            scrub: true,
        }
    });
});

// Kontenta style Word-by-Word Scroll Reveal
const revealParagraphs = document.querySelectorAll('.word-reveal');
revealParagraphs.forEach((paragraph) => {
    const words = paragraph.querySelectorAll('.word');
    gsap.to(words, {
        color: "rgba(255, 255, 255, 1)",
        stagger: 0.1,
        scrollTrigger: {
            trigger: paragraph,
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
        }
    });
});

// Standard general fades
gsap.utils.toArray('.split-text-wrapper .split-text .word').forEach((word, i) => {
    gsap.from(word, {
        scrollTrigger: { trigger: word.closest('.split-text-wrapper'), start: "top 85%" },
        y: 30, opacity: 0, duration: 0.6, delay: i * 0.03, ease: "power2.out"
    });
});

// Process Steps Staggered Activation
gsap.utils.toArray('.process-steps .step').forEach((step, i) => {
    ScrollTrigger.create({
        trigger: step,
        start: "top 80%",
        onEnter: () => step.classList.add('gs-active'),
        onLeaveBack: () => step.classList.remove('gs-active')
    });
});

// Orbital Graphic Parallax
gsap.to('.gs-orbit-wrap', {
    y: 100,
    rotation: 15,
    ease: "none",
    scrollTrigger: {
        trigger: '.process',
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// 4. Custom Magnetic Button Effect
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        // Get bounding rect, but subtract current GSAP transforms to find the "true" static center
        const position = btn.getBoundingClientRect();
        const currentX = gsap.getProperty(btn, "x") || 0;
        const currentY = gsap.getProperty(btn, "y") || 0;
        
        const trueLeft = position.left - currentX;
        const trueTop = position.top - currentY;
        
        // Calculate distance from the true static center
        const x = (e.clientX - (trueLeft + position.width / 2)) * 0.2;
        const y = (e.clientY - (trueTop + position.height / 2)) * 0.2;

        gsap.to(btn, {
            x: x,
            y: y,
            duration: 0.4,
            ease: "power2.out"
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.4)"
        });
    });
});
