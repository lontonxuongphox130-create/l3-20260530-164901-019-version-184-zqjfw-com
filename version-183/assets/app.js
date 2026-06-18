(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initializeMobileNavigation() {
    const button = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initializeHeroSlider() {
    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      const track = slider.querySelector('[data-hero-track]');
      const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
      const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
      const previous = slider.querySelector('[data-hero-prev]');
      const next = slider.querySelector('[data-hero-next]');
      let index = 0;
      let timer = null;

      if (!track || slides.length === 0) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
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

      if (previous) {
        previous.addEventListener('click', function () {
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initializeRails() {
    document.querySelectorAll('[data-rail-wrap]').forEach(function (wrap) {
      const rail = wrap.querySelector('[data-rail]');
      const previous = wrap.querySelector('[data-rail-prev]');
      const next = wrap.querySelector('[data-rail-next]');

      if (!rail) {
        return;
      }

      function move(direction) {
        const offset = direction === 'next' ? 460 : -460;
        rail.scrollBy({ left: offset, behavior: 'smooth' });
      }

      if (previous) {
        previous.addEventListener('click', function () {
          move('prev');
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          move('next');
        });
      }
    });
  }

  function initializeSearchPage() {
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const counter = document.querySelector('[data-search-count]');

    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function render(query) {
      const words = normalize(query).split(/\s+/).filter(Boolean);
      const data = window.MOVIE_SEARCH_INDEX;
      let matches = data;

      if (words.length > 0) {
        matches = data.filter(function (item) {
          const haystack = normalize([
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.tags,
            item.oneLine
          ].join(' '));

          return words.every(function (word) {
            return haystack.includes(word);
          });
        });
      }

      const limited = matches.slice(0, 96);
      if (counter) {
        counter.textContent = '找到 ' + matches.length + ' 条结果，当前显示 ' + limited.length + ' 条';
      }

      results.innerHTML = limited.map(function (item) {
        return [
          '<a class="movie-card" href="' + item.url + '">',
          '  <div class="movie-thumb">',
          '    <img src="' + item.poster + '" alt="' + escapeHtml(item.title) + '">',
          '    <span class="card-badge">' + escapeHtml(item.region) + '</span>',
          '    <span class="card-badge year-badge">' + escapeHtml(item.year) + '</span>',
          '  </div>',
          '  <div class="movie-body">',
          '    <h3 class="movie-title">' + escapeHtml(item.title) + '</h3>',
          '    <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
          '    <p class="movie-meta">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>',
          '  </div>',
          '</a>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function initializeHlsPlayers() {
    document.querySelectorAll('.js-hls-player').forEach(function (video) {
      const source = video.getAttribute('data-src');
      const note = video.closest('.video-box')?.querySelector('[data-player-note]');

      if (!source) {
        if (note) {
          note.textContent = '当前影片未配置播放源。';
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (note) {
            note.textContent = '播放源已加载，可点击视频区域开始播放。';
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!note) {
            return;
          }
          if (data && data.fatal) {
            note.textContent = '播放器遇到错误，可刷新页面后重试。';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        if (note) {
          note.textContent = '已使用浏览器原生 HLS 能力加载播放源。';
        }
      } else if (note) {
        note.textContent = '当前浏览器不支持 HLS 播放，建议使用新版 Chrome、Edge、Safari 或移动端浏览器。';
      }
    });
  }

  ready(function () {
    initializeMobileNavigation();
    initializeHeroSlider();
    initializeRails();
    initializeSearchPage();
    initializeHlsPlayers();
  });
})();
