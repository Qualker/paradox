// Main interactions (mobile-first, suave e com respeito por prefers-reduced-motion)
document.addEventListener('DOMContentLoaded', () => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    // 1) Scroll reveal (fade-in-up)
    initScrollReveal({ prefersReduced });

    // 2) Hero entrance sequence + smooth scroll no botão "Enter"
    initHeroEntrance({ prefersReduced });

    // 3) Carousel do espaço (auto-play suave, pausa quando não está visível)
    initSpaceCarousel({ prefersReduced });

    // 4) Ano no footer
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    // 5) Menu "More/Less" (opcional; só ativa se existir)
    document.querySelectorAll('.item-more').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.menu-item');
            if (!item) return;
            const open = item.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.textContent = open ? 'Less' : 'More';
        });
    });
});

function initScrollReveal({ prefersReduced }){
    const targets = document.querySelectorAll('.fade-in-up');
    if (!targets.length) return;

    // Se o utilizador prefere menos animação, revela tudo imediatamente
    if (prefersReduced || !('IntersectionObserver' in window)){
        targets.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
}

function initHeroEntrance({ prefersReduced }){
    const hero = document.querySelector('.hero--entrance');
    if (!hero) return;

    // Marca a hero como pronta (revela as fotos/elementos dependentes)
    requestAnimationFrame(() => hero.classList.add('is-ready'));

    if (prefersReduced){
        hero.classList.add('is-title', 'is-tagline', 'is-enter');
    } else {
        // Sequência (luxury pacing)
        window.setTimeout(() => hero.classList.add('is-title'), 150);
        window.setTimeout(() => hero.classList.add('is-tagline'), 1400);
        window.setTimeout(() => hero.classList.add('is-enter'), 2400);
    }

    // Scroll suave no Enter
    const enterBtn = hero.querySelector('.entrance-btn');
    if (!enterBtn) return;

    enterBtn.addEventListener('click', (e) => {
        const target = document.querySelector('#space');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }, { passive: false });
}

function initSpaceCarousel({ prefersReduced }){
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.space-slide'));
    const prevBtn = carousel.querySelector('[data-prev]');
    const nextBtn = carousel.querySelector('[data-next]');
    const dotsWrap = carousel.querySelector('.space-dots');

    if (!slides.length || !dotsWrap) return;

    // Dots
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

    const intervalMs = 3800; // suave
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

    // Mobile: pausa enquanto o utilizador interage
    const pause = () => { isPaused = true; };
    const resume = () => { isPaused = false; };

    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', resume);
    carousel.addEventListener('pointerdown', pause, { passive: true });
    carousel.addEventListener('pointerup', resume, { passive: true });
    carousel.addEventListener('pointercancel', resume, { passive: true });

    function start(){
        if (timer || prefersReduced) return; // em reduced motion, não faz autoplay
        timer = window.setInterval(() => {
            if (!isPaused) setActive((index + 1) % slides.length);
        }, intervalMs);
    }

    function stop(){
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
    }

    function restart(){
        stop();
        start();
    }

    // Start/stop com visibilidade (performance + bateria em mobile)
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) start();
            else stop();
        });
    }, { threshold: 0.25 });

    io.observe(carousel);

    // Se o tab estiver em background, pára
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });

    // Estado inicial
    setActive(index);
}
