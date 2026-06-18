(function () {
  window.MoviePlayer = {
    init: function (url) {
      var video = document.querySelector('.video-player');
      var cover = document.querySelector('.player-cover');
      var box = document.querySelector('[data-player]');
      var hls = null;
      var ready = false;

      if (!video || !url) {
        return;
      }

      var attach = function () {
        if (ready) {
          return;
        }

        ready = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      };

      var play = function (event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        attach();

        if (cover) {
          cover.classList.add('is-hidden');
        }

        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      };

      if (cover) {
        cover.addEventListener('click', play);
      }

      if (box) {
        box.addEventListener('click', function () {
          if (!ready) {
            play();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
