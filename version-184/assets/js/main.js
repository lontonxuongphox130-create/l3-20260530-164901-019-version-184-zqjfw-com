(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (input && input.value.trim() === '') {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function () {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  const panels = document.querySelectorAll('[data-page-filter]');
  panels.forEach(function (panelElement) {
    const scope = panelElement.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const keyword = panelElement.querySelector('[data-filter-keyword]');
    const year = panelElement.querySelector('[data-filter-year]');
    const type = panelElement.querySelector('[data-filter-type]');

    const apply = function () {
      const q = keyword ? keyword.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const t = type ? type.value : '';

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matchText = q === '' || text.indexOf(q) !== -1;
        const matchYear = y === '' || card.getAttribute('data-year') === y;
        const matchType = t === '' || card.getAttribute('data-type') === t;
        card.hidden = !(matchText && matchYear && matchType);
      });
    };

    if (keyword) {
      keyword.addEventListener('input', apply);
    }

    if (year) {
      year.addEventListener('change', apply);
    }

    if (type) {
      type.addEventListener('change', apply);
    }

    scope.querySelectorAll('[data-year-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (year) {
          year.value = chip.getAttribute('data-year-chip') || '';
        }
        apply();
        panelElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (scope.hasAttribute('data-search-page') && keyword) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        keyword.value = q;
      }
    }

    apply();
  });
})();
