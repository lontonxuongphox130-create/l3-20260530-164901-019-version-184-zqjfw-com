function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function setupMenu() {
  var button = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.mobile-nav');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function setupHeroSlider() {
  var slider = document.querySelector('[data-slider]');
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }
  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      stop();
      show(Number(dot.getAttribute('data-slide')) || 0);
      start();
    });
  });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupCardFilters() {
  var search = document.querySelector('.js-card-search');
  var genre = document.querySelector('.js-genre-filter');
  var sort = document.querySelector('.js-year-sort');
  var grid = document.querySelector('.movie-grid');
  if (!grid) {
    return;
  }
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
  if (!cards.length) {
    return;
  }
  var empty = document.createElement('div');
  empty.className = 'empty-result';
  empty.textContent = '没有找到匹配影片';
  function applyQueryFromUrl() {
    if (!search) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      search.value = q;
    }
  }
  function filter() {
    var term = normalizeText(search ? search.value : '');
    var genreValue = normalizeText(genre ? genre.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region')
      ].join(' '));
      var ok = (!term || haystack.indexOf(term) !== -1) && (!genreValue || haystack.indexOf(genreValue) !== -1);
      card.classList.toggle('hidden-card', !ok);
      if (ok) {
        visible += 1;
      }
    });
    if (visible === 0 && !empty.parentNode) {
      grid.appendChild(empty);
    }
    if (visible > 0 && empty.parentNode) {
      empty.parentNode.removeChild(empty);
    }
  }
  function reorder() {
    if (!sort) {
      return;
    }
    var value = sort.value;
    if (value === 'default') {
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      filter();
      return;
    }
    var sorted = cards.slice().sort(function (a, b) {
      var ya = Number(a.getAttribute('data-year')) || 0;
      var yb = Number(b.getAttribute('data-year')) || 0;
      return value === 'year-desc' ? yb - ya : ya - yb;
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
    filter();
  }
  applyQueryFromUrl();
  if (search) {
    search.addEventListener('input', filter);
  }
  if (genre) {
    genre.addEventListener('change', filter);
  }
  if (sort) {
    sort.addEventListener('change', reorder);
  }
  filter();
}

ready(function () {
  setupMenu();
  setupHeroSlider();
  setupCardFilters();
});
