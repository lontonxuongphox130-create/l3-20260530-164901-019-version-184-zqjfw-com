(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
            toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
        });
    }

    function setupSearchForms() {
        qsa('form.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                var action = form.getAttribute('action') || 'search.html';
                window.location.href = action + '?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupHero() {
        qsa('[data-hero-slider]').forEach(function (slider) {
            var slides = qsa('[data-hero-slide]', slider);
            var dots = qsa('[data-hero-dot]', slider);
            var prev = qs('[data-hero-prev]', slider);
            var next = qs('[data-hero-next]', slider);
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot') || 0));
                    start();
                });
            });
            slider.addEventListener('mouseenter', stop);
            slider.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function setupRails() {
        qsa('.rail-shell').forEach(function (shell) {
            var rail = qs('[data-scroll-rail]', shell);
            var left = qs('[data-scroll-left]', shell);
            var right = qs('[data-scroll-right]', shell);
            if (!rail) {
                return;
            }
            if (left) {
                left.addEventListener('click', function () {
                    rail.scrollBy({ left: -420, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    rail.scrollBy({ left: 420, behavior: 'smooth' });
                });
            }
        });
    }

    function setupPageFilters() {
        var input = qs('[data-page-filter]');
        var select = qs('[data-year-filter]');
        var cards = qsa('[data-filter-card]');
        if (!cards.length) {
            return;
        }
        function matchYear(card, value) {
            if (!value) {
                return true;
            }
            var year = Number(card.getAttribute('data-year') || 0);
            if (value === '2020') {
                return year <= 2020;
            }
            return year === Number(value);
        }
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = select ? select.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchYear(card, yearValue);
                card.style.display = visible ? '' : 'none';
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
    }

    function setupPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video', box);
            var button = qs('[data-play-button]', box);
            var source = video ? video.getAttribute('data-src') : '';
            var attached = false;
            var hls = null;

            if (!video || !source) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function play() {
                attach();
                if (button) {
                    button.classList.add('hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
            video.addEventListener('click', function () {
                attach();
            });
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupRails();
        setupPageFilters();
        setupPlayers();
    });
})();
