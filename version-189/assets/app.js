(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function applyFilters() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var activeFilter = document.querySelector('[data-filter-type].active');
    var emptyState = document.querySelector('[data-empty-state]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var filterType = activeFilter ? activeFilter.getAttribute('data-filter-type') : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var type = card.getAttribute('data-type') || '';
      var matchText = !query || haystack.indexOf(query) !== -1;
      var matchType = filterType === 'all' || type === filterType;
      var shouldShow = matchText && matchType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0 && cards.length > 0);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyFilters();
    });
  });

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || prepared) {
        return;
      }

      var streamUrl = video.getAttribute('data-video');
      if (!streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      prepared = true;
    }

    function startVideo() {
      prepareVideo();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared || video.paused) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
