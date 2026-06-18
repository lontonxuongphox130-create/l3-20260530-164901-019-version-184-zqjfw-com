(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
        slide.setAttribute("aria-hidden", slideIndex === activeIndex ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5800);
    }

    var searchInput = document.querySelector("[data-search]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-search-empty]");
    var currentFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search-index"));
        var category = card.getAttribute("data-category") || "";
        var matchQuery = !query || searchText.indexOf(query) !== -1;
        var matchFilter = currentFilter === "all" || category === currentFilter;
        var visible = matchQuery && matchFilter;

        card.style.display = visible ? "" : "none";

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "all";

        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        applyFilter();
      });
    });

    applyFilter();
  });
})();
