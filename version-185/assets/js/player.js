function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var cover = document.getElementById(config.coverId);
  var message = document.getElementById(config.messageId);
  var hls = null;
  var prepared = false;

  if (!video || !cover || !config.source) {
    return;
  }

  function showMessage(text) {
    if (message) {
      message.textContent = text;
      message.hidden = false;
    }
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("视频加载失败，请稍后再试。");
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
      return;
    }

    showMessage("当前浏览器暂时无法播放该视频。");
  }

  function start() {
    cover.hidden = true;
    prepare();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        cover.hidden = false;
      });
    }
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
