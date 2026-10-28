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
            document.body.classList.toggle('nav-open', open);
        });

        nav.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
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

    /* ---------- Sección activa en la nav ----------
       El <header> es sticky: su rect queda siempre pegado arriba y nunca entra
       en la banda de un IntersectionObserver, por eso #inicio no se activaba.
       Se resuelve con un scroll-spy: la línea de decisión es el punto donde
       aterriza una sección al navegar por anclas y la sección activa es la
       última que la ha rebasado. Para INICIO la referencia es el Hero
       (la sección real de inicio). */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));

    function spyTarget(link) {
        var id = link.getAttribute('href').slice(1);
        if (!id) { return null; }
        if (id === 'inicio') {
            return document.querySelector('.hero') || document.getElementById(id);
        }
        return document.getElementById(id);
    }

    var spyTargets = navLinks.map(spyTarget).filter(Boolean);

    function setActive(target) {
        navLinks.forEach(function (a) {
            var isActive = spyTarget(a) === target;
            a.classList.toggle('is-active', isActive);
            if (isActive) {
                a.setAttribute('aria-current', 'true');
            } else {
                a.removeAttribute('aria-current');
            }
        });
    }

    function updateActive() {
        if (!spyTargets.length) { return; }
        /* La línea de decisión coincide con el punto donde aterriza una sección
           al navegar por anclas (scroll-padding-top), de modo que la sección
           visible es siempre la activa. */
        var pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        var line = window.pageYOffset + pad + 1;
        var current = spyTargets[0];

        for (var i = 0; i < spyTargets.length; i++) {
            var top = spyTargets[i].getBoundingClientRect().top + window.pageYOffset;
            if (top <= line) {
                current = spyTargets[i];
            } else {
                break;
            }
        }
        setActive(current);
    }

    var scrollPending = false;
    window.addEventListener('scroll', function () {
        if (scrollPending) { return; }
        scrollPending = true;
        window.requestAnimationFrame(function () {
            scrollPending = false;
            updateActive();
        });
    }, { passive: true });

    window.addEventListener('resize', updateActive);
    window.addEventListener('load', updateActive);
    updateActive();

    /* ---------- Contador / cuenta atrás del hero ---------- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var countdown = document.querySelector('[data-countdown]');
    if (countdown) {
        var initialCountdown = parseInt(countdown.getAttribute('data-countdown'), 10) || 240;
        var remaining = initialCountdown;

        var renderCountdown = function () {
            var m = Math.floor(remaining / 60);
            var s = remaining % 60;
            countdown.textContent = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        };
        renderCountdown();

        if (!reduceMotion) {
            var countdownTimer = setInterval(function () {
                remaining = remaining > 0 ? remaining - 1 : initialCountdown;
                renderCountdown();
            }, 1000);

            window.addEventListener('pagehide', function () { clearInterval(countdownTimer); });
        }
    }

    /* ---------- Animación del cronómetro de vuelta ---------- */
    var timer = document.querySelector('.hero__timer-value');
    if (timer && !reduceMotion) {
        var targetLap = 150.250; // 2:30.250
        var startLap = 148.410; // 2:28.410
        var lapValue = startLap;
        var timerStart = window.performance ? performance.now() : Date.now();
        var timerDuration = 2200;

        function formatLap(value) {
            var totalSeconds = Math.max(0, value);
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = Math.floor(totalSeconds % 60);
            var ms = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
            return minutes + ':' + ('0' + seconds).slice(-2) + '.' + ('00' + ms).slice(-3);
        }

        function renderLap(value) {
            timer.textContent = formatLap(value);
        }

        renderLap(lapValue);

        var lapTick = setInterval(function () {
            var now = window.performance ? performance.now() : Date.now();
            var progress = Math.min((now - timerStart) / timerDuration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            lapValue = startLap + (targetLap - startLap) * eased;
            renderLap(lapValue);

            if (progress >= 1) {
                clearInterval(lapTick);
                lapValue = targetLap;
                renderLap(lapValue);
                timer.classList.add('is-finished');
                timer.closest('.hero__timer').classList.add('hero__timer--finished');
                setTimeout(function () {
                    timer.classList.remove('is-finished');
                    timer.closest('.hero__timer').classList.remove('hero__timer--finished');
                }, 2200);
            }
        }, 30);

        window.addEventListener('pagehide', function () { clearInterval(lapTick); });
    }
})();
