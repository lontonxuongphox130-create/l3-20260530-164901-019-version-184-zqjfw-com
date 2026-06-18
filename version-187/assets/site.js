(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        resetTimer();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        resetTimer();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        resetTimer();
      });
    }

    startTimer();
  }

  const localSearch = document.querySelector(".local-search");

  if (localSearch) {
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    localSearch.addEventListener("input", function () {
      const query = localSearch.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.meta].join(" ").toLowerCase();
        card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchState = document.getElementById("searchState");

  if (searchInput && searchResults && searchState && Array.isArray(window.MOVIE_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("q") || "";
    searchInput.value = current;

    function createResult(movie) {
      const tags = movie.tags.slice(0, 2).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-meta=\"" + escapeHtml(movie.search) + "\">" +
        "<a href=\"" + movie.file + "\" class=\"movie-card__media\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"movie-card__shade\"></span>" +
        "<span class=\"movie-card__play\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8 5v14l11-7L8 5Z\"></path></svg></span>" +
        "<span class=\"movie-card__type\">" + escapeHtml(movie.type) + "</span>" +
        "<span class=\"movie-card__duration\">" + escapeHtml(movie.duration) + "</span>" +
        "</a>" +
        "<div class=\"movie-card__body\">" +
        "<a href=\"" + movie.file + "\" class=\"movie-card__title\">" + escapeHtml(movie.title) + "</a>" +
        "<p>" + escapeHtml(movie.one_line) + "</p>" +
        "<div class=\"movie-card__meta\"><span>★" + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
        "<div class=\"movie-card__tags\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function runSearch() {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        searchState.textContent = "请输入关键词开始搜索。";
        searchResults.innerHTML = "";
        return;
      }

      const words = query.split(/\s+/).filter(Boolean);
      const matches = window.MOVIE_INDEX.filter(function (movie) {
        const text = movie.search.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      searchState.textContent = matches.length ? "已为你找到匹配影片：" : "没有找到匹配影片。";
      searchResults.innerHTML = matches.map(createResult).join("");
    }

    searchInput.addEventListener("input", runSearch);
    runSearch();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
