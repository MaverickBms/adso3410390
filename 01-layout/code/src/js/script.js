/* =========================================================
   PIT STOP CAFÉ BAR — script.js
   Interacciones: nav móvil, scroll reveal, sección activa,
   contador de cuenta atrás y contadores numéricos.
   ========================================================= */
(function () {
    'use strict';

    /* ---------- Menú móvil ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-active', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        });

        nav.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealTargets = [
        '.hero__panel > *',
        '.section__head',
        '.menu-feature',
        '.menu-item',
        '.menu-combo',
        '.event-main',
        '.event-card',
        '.timing-strip',
        '.editorial__words',
        '.editorial__media',
        '.location__media',
        '.location__info',
        '.social-card',
        '.footer__top'
    ];

    var revealEls = document.querySelectorAll(revealTargets.join(','));
    revealEls.forEach(function (el) { el.classList.add('reveal'); });

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        revealEls.forEach(function (el, i) {
            el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
            revealObserver.observe(el);
        });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Sección activa en la nav ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var sections = navLinks
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        var activeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    navLinks.forEach(function (a) {
                        a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px' });

        sections.forEach(function (s) { activeObserver.observe(s); });
    }

    /* ---------- Contador / cuenta atrás del hero ---------- */
    var countdown = document.querySelector('[data-countdown]');
    if (countdown) {
        var remaining = parseInt(countdown.getAttribute('data-countdown'), 10) || 240;

        var render = function () {
            var m = Math.floor(remaining / 60);
            var s = remaining % 60;
            countdown.textContent = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        };
        render();

        setInterval(function () {
            remaining = remaining > 0 ? remaining - 1 : 240;
            render();
        }, 1000);
    }

    /* ---------- Animación del cronómetro de vuelta ---------- */
    var timer = document.querySelector('.hero__timer-value');
    if (timer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var base = 148.410; // 2:28.410
        var tick = setInterval(function () {
            base += 0.017;
            if (base > 200) { base = 148.410; }
            var m = Math.floor(base / 60);
            var s = (base % 60).toFixed(3);
            timer.textContent = m + ':' + (s < 10 ? '0' + s : s);
        }, 60);

        window.addEventListener('pagehide', function () { clearInterval(tick); });
    }
})();
