document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.style.opacity = "0";
    });
  });

  bindHeroSlider();
  bindCardFilters();
});

function bindHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));

  if (!slider || dots.length === 0) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
  var current = 0;

  function show(index) {
    current = index;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
    });
  });

  window.setInterval(function () {
    show((current + 1) % slides.length);
  }, 5200);
}

function bindCardFilters() {
  var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

  toolbars.forEach(function (toolbar) {
    var grid = document.querySelector("[data-filter-grid]");
    var input = toolbar.querySelector("input");
    var select = toolbar.querySelector("select");

    if (!grid || !input) {
      return;
    }

    var originalCards = Array.prototype.slice.call(grid.children);

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var cards = originalCards.slice();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
      });

      if (select) {
        var mode = select.value;
        cards.sort(function (a, b) {
          var yearA = Number(a.getAttribute("data-year") || 0);
          var yearB = Number(b.getAttribute("data-year") || 0);
          var titleA = a.getAttribute("data-title") || "";
          var titleB = b.getAttribute("data-title") || "";

          if (mode === "year-desc") {
            return yearB - yearA;
          }

          if (mode === "year-asc") {
            return yearA - yearB;
          }

          if (mode === "title") {
            return titleA.localeCompare(titleB, "zh-Hans-CN");
          }

          return 0;
        });

        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    input.addEventListener("input", apply);
    if (select) {
      select.addEventListener("change", apply);
    }
  });
}
