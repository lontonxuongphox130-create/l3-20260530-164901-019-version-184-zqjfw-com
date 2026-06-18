function initMoviePlayer(sourceUrl) {
  var shell = document.querySelector('.js-player');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.player-overlay');
  if (!video || !overlay || !sourceUrl) {
    return;
  }
  var prepared = false;
  var hls = null;
  function prepare() {
    if (prepared) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    prepared = true;
  }
  function play() {
    prepare();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }
  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!prepared || video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
