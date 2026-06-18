document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.querySelector(".large-search input[name='q']");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");

  if (input) {
    input.value = query;
  }

  if (!query) {
    return;
  }

  var list = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
  var normalized = query.toLowerCase();
  var matched = list.filter(function (movie) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      (movie.tags || []).join(" "),
      movie.summary
    ].join(" ").toLowerCase();
    return text.indexOf(normalized) !== -1;
  });

  if (status) {
    status.textContent = "找到 " + matched.length + " 条相关内容：" + query;
  }

  if (results) {
    results.innerHTML = matched.slice(0, 120).map(renderCard).join("");
  }
});

function renderCard(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");

  return [
    "<article class=\"movie-card\">",
    "  <a class=\"movie-poster\" href=\"" + escapeAttr(movie.url) + "\">",
    "    <img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + " 海报\" loading=\"lazy\">",
    "    <span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>",
    "    <span class=\"poster-score\">" + escapeHtml(movie.rating) + "</span>",
    "  </a>",
    "  <div class=\"movie-card-body\">",
    "    <div class=\"movie-meta-line\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
    "    <h3><a href=\"" + escapeAttr(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
    "    <p>" + escapeHtml(movie.summary) + "</p>",
    "    <div class=\"tag-row\">" + tags + "</div>",
    "  </div>",
    "</article>"
  ].join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
