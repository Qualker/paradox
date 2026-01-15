// Simple Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero--entrance');
    if (!hero) return;

    // Marca a hero como pronta (para revelar as fotos)
    requestAnimationFrame(() => hero.classList.add('is-ready'));

    // Sequência
    const titleDelay = 150;      // aparece quase imediatamente
    const taglineDelay = 1400;   // 1.4s depois (ajusta para 1000-2000ms)
    const enterDelay = 2400;     // mais 1s depois

    setTimeout(() => hero.classList.add('is-title'), titleDelay);
    setTimeout(() => hero.classList.add('is-tagline'), taglineDelay);
    setTimeout(() => hero.classList.add('is-enter'), enterDelay);

    // Scroll suave no Enter (se o browser não suportar, cai no normal)
    const enterBtn = hero.querySelector('.entrance-btn');
    enterBtn?.addEventListener('click', (e) => {
        const target = document.querySelector('#space');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.space-slide'));
    const dotsWrap = carousel.querySelector('[data-dots]');
    const prevBtn = carousel.querySelector('[data-prev]');
    const nextBtn = carousel.querySelector('[data-next]');

    if (!slides.length || !dotsWrap) return;

    // Create dots
    const dots = slides.map((_, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'space-dot' + (idx === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', `Go to photo ${idx + 1}`);
        b.addEventListener('click', () => goTo(idx));
        dotsWrap.appendChild(b);
        return b;
    });

    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = 3800; // suave, “luxury pacing”
    let timer = null;
    let isPaused = false;

    function setActive(i){
        slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
        dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
        index = i;
    }

    function goTo(i){
        const nextIndex = (i + slides.length) % slides.length;
        setActive(nextIndex);
        restart();
    }

    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Auto-play (only if not reduced motion)
    function start(){
        if (prefersReduced) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            if (!isPaused) next();
        }, intervalMs);
    }

    function stop(){
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restart(){
        stop();
        start();
    }

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', () => { isPaused = true; });
    carousel.addEventListener('mouseleave', () => { isPaused = false; });
    carousel.addEventListener('focusin', () => { isPaused = true; });
    carousel.addEventListener('focusout', () => { isPaused = false; });

    // Start only when visible (clean + performance)
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) start();
            else stop();
        });
    }, { threshold: 0.25 });

    io.observe(carousel);
});

document.addEventListener('DOMContentLoaded', () => {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.item-more').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.menu-item');
            if (!item) return;
            const open = item.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.textContent = open ? 'Less' : 'More';
        });
    });
});
