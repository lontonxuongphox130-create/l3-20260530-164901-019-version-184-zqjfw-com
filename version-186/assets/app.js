(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get('q') || '';
  var pageSearch = document.querySelector('[data-page-search]');

  if (pageSearch && query) {
    pageSearch.value = query;
  }

  if (query) {
    var firstCardSearch = document.querySelector('[data-card-search]');

    if (firstCardSearch) {
      firstCardSearch.value = query;
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(panel) {
    var root = panel.parentNode;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-title]'));
    var textInput = panel.querySelector('[data-card-search], [data-page-search]');
    var regionSelect = panel.querySelector('[data-region-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var noResults = root.querySelector('[data-no-results]');
    var term = normalize(textInput && textInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var visible = (!term || haystack.indexOf(term) !== -1) && (!region || cardRegion.indexOf(region) !== -1) && (!year || cardYear === year);

      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', shown === 0);
    }
  }

  panels.forEach(function (panel) {
    var inputs = Array.prototype.slice.call(panel.querySelectorAll('input, select'));

    inputs.forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilter(panel);
      });
      field.addEventListener('change', function () {
        applyFilter(panel);
      });
    });

    if (panel.querySelector('[data-page-search]') && query) {
      applyFilter(panel);
    }
  });

  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('play-overlay');
  var configNode = document.getElementById('video-config');

  if (video && overlay && configNode) {
    var config = {};
    var attached = false;

    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }

    function attach() {
      if (attached || !config.src) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(config.src);
        hls.attachMedia(video);
      } else {
        video.src = config.src;
      }

      attached = true;
    }

    function start() {
      attach();
      video.setAttribute('controls', 'controls');
      overlay.classList.add('is-hidden');
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
})();
