
/* =========================================================
   PIT STOP CAFÉ BAR — script.js
   ========================================================= */

(function () {
    'use strict';

    var doc = document;
    var win = window;

    var reduceMotionQuery = win.matchMedia
        ? win.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    var reduceMotion = Boolean(
        reduceMotionQuery && reduceMotionQuery.matches
    );


    /* =====================================================
       1. MENÚ MÓVIL
       ===================================================== */

    var toggle = doc.querySelector('.nav-toggle');
    var nav = doc.getElementById('primary-nav');

    var mobileQuery = win.matchMedia
        ? win.matchMedia('(max-width: 700px)')
        : null;

    function isMobileMenuLayout() {
        return mobileQuery
            ? mobileQuery.matches
            : win.innerWidth <= 700;
    }

    function setMenuOpen(open, returnFocus) {
        if (!toggle || !nav) return;

        nav.classList.toggle('is-open', open);
        toggle.classList.toggle('is-active', open);

        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute(
            'aria-label',
            open ? 'Cerrar menú' : 'Abrir menú'
        );

        doc.body.classList.toggle(
            'nav-open',
            open && isMobileMenuLayout()
        );

        if (returnFocus && open === false) {
            toggle.focus();
        }
    }

    if (toggle && nav) {

        toggle.addEventListener('click', function () {
            setMenuOpen(
                toggle.getAttribute('aria-expanded') !== 'true'
            );
        });

        nav.addEventListener('click', function (event) {
            var link = event.target.closest('a');

            if (link) {
                setMenuOpen(false);
            }
        });

        doc.addEventListener('keydown', function (event) {
            if (
                event.key === 'Escape' &&
                toggle.getAttribute('aria-expanded') === 'true'
            ) {
                setMenuOpen(false, true);
            }
        });

        function getMenuFocusableElements() {
            var elements = [];
            var links = nav.querySelectorAll('a[href]');
            for (var i = 0; i < links.length; i += 1) {
                elements.push(links[i]);
            }
            if (toggle) {
                elements.push(toggle);
            }
            return elements;
        }

        function handleTabTrap(event) {
            if (event.key !== 'Tab') {
                return;
            }
            if (
                toggle.getAttribute('aria-expanded') !== 'true'
            ) {
                return;
            }
            var elements = getMenuFocusableElements();
            if (!elements.length) {
                return;
            }
            var firstElement = elements[0];
            var lastElement = elements[elements.length - 1];
            var activeElement = doc.activeElement;
            if (event.shiftKey) {
                if (activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else if (activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        doc.addEventListener('keydown', handleTabTrap);

        doc.addEventListener('click', function (event) {
            if (
                !isMobileMenuLayout() ||
                toggle.getAttribute('aria-expanded') !== 'true'
            ) {
                return;
            }

            if (
                !nav.contains(event.target) &&
                !toggle.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        });

        function handleMenuViewportChange() {
            if (!isMobileMenuLayout()) {
                setMenuOpen(false);
            }
        }

        if (
            mobileQuery &&
            mobileQuery.addEventListener
        ) {
            mobileQuery.addEventListener(
                'change',
                handleMenuViewportChange
            );
        } else {
            win.addEventListener(
                'resize',
                handleMenuViewportChange,
                { passive: true }
            );
        }
    }


    /* =====================================================
       2. ANIMACIONES AL DESPLAZARSE (SCROLL REVEAL)
       ===================================================== */

    var revealSelectors = [
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

    var revealElements = doc.querySelectorAll(
        revealSelectors.join(',')
    );

    if (reduceMotion) {

        revealElements.forEach(function (element) {
            element.classList.add('is-visible');
        });

    } else if ('IntersectionObserver' in win) {

        var revealObserver = new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                root: null,
                rootMargin: '0px 0px -8% 0px',
                threshold: 0.08
            }
        );

        revealElements.forEach(function (element, index) {

            element.classList.add('reveal');

            element.style.transitionDelay =
                (Math.min(index % 6, 5) * 60) + 'ms';

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(function (element) {
            element.classList.add('is-visible');
        });

    }


    /* =====================================================
       3. NAVEGACIÓN ACTIVA (SCROLL SPY)
       ===================================================== */

    var navLinks = Array.prototype.slice.call(
        doc.querySelectorAll('.nav a[href^="#"]')
    );

    function getSpyTarget(link) {

        var href = link.getAttribute('href');

        if (!href || href.length < 2) return null;

        var targetId = href.slice(1);

        if (targetId === 'inicio') {
            return (
                doc.querySelector('.hero') ||
                doc.getElementById(targetId)
            );
        }

        return doc.getElementById(targetId);
    }

    var spyItems = navLinks.map(function (link) {
        return {
            link: link,
            target: getSpyTarget(link)
        };
    }).filter(function (item) {
        return Boolean(item.target);
    });

    function updateActiveNavigation() {

        if (!spyItems.length) return;

        var scrollPadding =
            parseFloat(
                win.getComputedStyle(
                    doc.documentElement
                ).scrollPaddingTop
            ) || 0;

        var decisionLine =
            win.pageYOffset + scrollPadding + 1;

        var currentTarget = spyItems[0].target;

        for (var i = 0; i < spyItems.length; i += 1) {

            var targetTop =
                spyItems[i].target.getBoundingClientRect().top +
                win.pageYOffset;

            if (targetTop <= decisionLine) {
                currentTarget = spyItems[i].target;
            } else {
                break;
            }
        }

        spyItems.forEach(function (item) {

            var active =
                item.target === currentTarget;

            item.link.classList.toggle(
                'is-active',
                active
            );

            if (active) {
                item.link.setAttribute(
                    'aria-current',
                    'page'
                );
            } else {
                item.link.removeAttribute('aria-current');
            }

        });
    }

    var scrollUpdatePending = false;

    win.addEventListener('scroll', function () {

        if (scrollUpdatePending) return;

        scrollUpdatePending = true;

        win.requestAnimationFrame(function () {

            scrollUpdatePending = false;
            updateActiveNavigation();

        });

    }, { passive: true });

    win.addEventListener(
        'resize',
        updateActiveNavigation,
        { passive: true }
    );

    win.addEventListener(
        'load',
        updateActiveNavigation
    );

    updateActiveNavigation();


    /* =====================================================
       4. CUENTA ATRÁS DEL HERO
       ===================================================== */

    var countdown = doc.querySelector('[data-countdown]');
    var countdownTimer = null;

    if (countdown) {

        var initialCountdown = parseInt(
            countdown.getAttribute('data-countdown'),
            10
        );

        if (
            !Number.isFinite(initialCountdown) ||
            initialCountdown < 0
        ) {
            initialCountdown = 240;
        }

        var remainingSeconds = initialCountdown;

        function renderCountdown() {

            var minutes = Math.floor(
                remainingSeconds / 60
            );

            var seconds = remainingSeconds % 60;

            countdown.textContent =
                ('0' + minutes).slice(-2) +
                ':' +
                ('0' + seconds).slice(-2);
        }

        renderCountdown();

        if (!reduceMotion) {

            countdownTimer = win.setInterval(function () {

                remainingSeconds =
                    remainingSeconds > 0
                        ? remainingSeconds - 1
                        : initialCountdown;

                renderCountdown();

            }, 1000);

        }
    }


    /* =====================================================
       5. CRONÓMETRO ANIMADO DEL HERO
       ===================================================== */

    var lapTimerElement = doc.querySelector(
        '.hero__timer-value'
    );

    var lapTimeLiveRegion = doc.getElementById(
        'lap-time-live'
    );

    var lapInterval = null;
    var lapFinishTimeout = null;

    if (lapTimerElement && !reduceMotion) {

        var startLapSeconds = 148.410;
        var targetLapSeconds = 150.250;
        var animationDuration = 2200;

        var animationStart =
            win.performance
                ? win.performance.now()
                : Date.now();

        function formatLapTime(value) {

            var safeValue = Math.max(0, value);

            var minutes = Math.floor(safeValue / 60);
            var wholeSeconds = Math.floor(safeValue % 60);

            var milliseconds = Math.round(
                (
                    safeValue -
                    Math.floor(safeValue)
                ) * 1000
            );

            return (
                minutes +
                ':' +
                ('0' + wholeSeconds).slice(-2) +
                '.' +
                ('00' + milliseconds).slice(-3)
            );
        }

        function renderLapTime(value) {
            lapTimerElement.textContent =
                formatLapTime(value);

            if (lapTimeLiveRegion) {
                lapTimeLiveRegion.textContent =
                    formatLapTime(value);
            }
        }

        renderLapTime(startLapSeconds);

        lapInterval = win.setInterval(function () {

            var now =
                win.performance
                    ? win.performance.now()
                    : Date.now();

            var progress = Math.min(
                (now - animationStart) / animationDuration,
                1
            );

            var easedProgress =
                1 - Math.pow(1 - progress, 3);

            var currentLap =
                startLapSeconds +
                (
                    targetLapSeconds -
                    startLapSeconds
                ) * easedProgress;

            renderLapTime(currentLap);

            if (progress >= 1) {

                win.clearInterval(lapInterval);
                lapInterval = null;

                renderLapTime(targetLapSeconds);

                lapTimerElement.classList.add('is-finished');

                var timerCard =
                    lapTimerElement.closest('.hero__timer');

                if (timerCard) {
                    timerCard.classList.add(
                        'hero__timer--finished'
                    );
                }

                lapFinishTimeout = win.setTimeout(function () {

                    lapTimerElement.classList.remove(
                        'is-finished'
                    );

                    if (timerCard) {
                        timerCard.classList.remove(
                            'hero__timer--finished'
                        );
                    }

                    lapFinishTimeout = null;

                }, 2200);
            }

        }, 30);
    }


    /* =====================================================
       6. LIMPIEZA DE INTERVALOS
       ===================================================== */

    win.addEventListener('pagehide', function () {

        if (countdownTimer !== null) {
            win.clearInterval(countdownTimer);
        }

        if (lapInterval !== null) {
            win.clearInterval(lapInterval);
        }

        if (lapFinishTimeout !== null) {
            win.clearTimeout(lapFinishTimeout);
        }

    });


    /* =====================================================
       7. BARRA DE RECORRIDO / RACE PROGRESS
       ===================================================== */

    var raceProgress = doc.getElementById('race-progress');

    var raceProgressFill = doc.getElementById(
        'race-progress-fill'
    );

    var progressFramePending = false;

    function updateRaceProgress() {

        if (!raceProgress || !raceProgressFill) return;

        var scrollable =
            doc.documentElement.scrollHeight - win.innerHeight;

        var ratio = scrollable > 0
            ? Math.min(
                1,
                Math.max(0, win.scrollY / scrollable)
            )
            : 0;

        var percent = Math.round(ratio * 100);

        raceProgressFill.style.width = percent + '%';

        raceProgress.setAttribute(
            'aria-valuenow',
            String(percent)
        );

        raceProgress.setAttribute(
            'aria-valuetext',
            percent + '% del recorrido'
        );
    }

    function scheduleRaceProgress() {

        if (progressFramePending) return;

        progressFramePending = true;

        win.requestAnimationFrame(function () {

            progressFramePending = false;
            updateRaceProgress();

        });
    }

    if (raceProgress && raceProgressFill) {

        win.addEventListener(
            'scroll',
            scheduleRaceProgress,
            { passive: true }
        );

        win.addEventListener(
            'resize',
            scheduleRaceProgress,
            { passive: true }
        );

        win.addEventListener(
            'load',
            updateRaceProgress
        );

        updateRaceProgress();
    }


    /* =====================================================
       FIN DEL SCRIPT — PIT STOP CAFÉ BAR
       ===================================================== */

}());
