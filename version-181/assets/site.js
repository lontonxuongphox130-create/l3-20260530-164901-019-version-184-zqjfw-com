
(function () {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function norm(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[\s\-_·•/\\()（）【】\[\]{}，,。.！!？?：:；;|]+/g, "");
  }

  function safeText(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateNavToggle() {
    const btn = qs(".nav-toggle");
    const nav = qs("[data-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  function bindSearchForms() {
    qsa(".js-site-search-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const q = input ? input.value.trim() : "";
        const target = form.getAttribute("action") || "search.html";
        const url = new URL(target, window.location.href);
        if (q) url.searchParams.set("q", q);
        window.location.href = url.toString();
      });
    });
  }

  function initHeroSlider() {
    const slider = qs("[data-hero-slider]");
    if (!slider) return;
    const slides = qsa(".hero-slide", slider);
    const dotsWrap = qs("[data-hero-dots]", slider);
    const prevBtn = qs("[data-hero-prev]", slider);
    const nextBtn = qs("[data-hero-next]", slider);
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));
    if (index < 0) index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle("active", idx === index);
      });
      if (dotsWrap) {
        qsa(".hero-dot", dotsWrap).forEach((dot, idx) => {
          dot.classList.toggle("active", idx === index);
        });
      }
    }

    function next() {
      show(index + 1);
    }

    if (dotsWrap && !dotsWrap.children.length) {
      slides.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-dot" + (idx === index ? " active" : "");
        dot.setAttribute("aria-label", "切换第 " + (idx + 1) + " 张");
        dot.addEventListener("click", () => {
          show(idx);
          reset();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => { show(index - 1); reset(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { show(index + 1); reset(); });

    function reset() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(next, 5000);
    }

    show(index);
    reset();

    slider.addEventListener("mouseenter", () => { if (timer) window.clearInterval(timer); });
    slider.addEventListener("mouseleave", reset);
  }

  function applyCardFilter(container, term) {
    const cards = qsa("[data-card]", container);
    const q = norm(term);
    let shown = 0;
    cards.forEach((card) => {
      const hay = norm(
        [
          card.getAttribute("data-keywords"),
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
        ].join(" ")
      );
      const visible = !q || hay.includes(q);
      card.classList.toggle("hidden", !visible);
      if (visible) shown += 1;
    });
    return shown;
  }

  function initFilterPanels() {
    qsa("[data-filter-panel]").forEach((panel) => {
      const input = qs("[data-filter-input]", panel);
      const list = qs("[data-filter-list]", panel);
      const countEl = qs("[data-filter-count]", panel);
      const chips = qsa("[data-filter-chip]", panel);
      if (!input || !list) return;

      let activeChip = "";
      function refresh() {
        const term = input.value.trim();
        const cards = qsa("[data-card]", list);
        const q = norm(term);
        let shown = 0;
        cards.forEach((card) => {
          const chip = card.getAttribute("data-category") || "";
          const hay = norm(
            [
              card.getAttribute("data-keywords"),
              card.getAttribute("data-title"),
              card.getAttribute("data-genre"),
              card.getAttribute("data-region"),
              card.getAttribute("data-tags"),
              card.getAttribute("data-year"),
              card.getAttribute("data-type"),
            ].join(" ")
          );
          const categoryOk = !activeChip || activeChip === "全部" || chip === activeChip;
          const visible = categoryOk && (!q || hay.includes(q));
          card.classList.toggle("hidden", !visible);
          if (visible) shown += 1;
        });
        if (countEl) countEl.textContent = String(shown);
      }

      input.addEventListener("input", refresh);
      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          activeChip = chip.getAttribute("data-filter-chip") || "";
          chips.forEach((c) => c.classList.toggle("active", c === chip));
          refresh();
        });
      });
      refresh();
    });
  }

  function initDetailPlayer() {
    const wrap = qs("[data-player]");
    if (!wrap) return;
    const video = qs("video", wrap);
    const playBtn = qs("[data-play-button]", wrap);
    if (!video) return;

    const mp4 = video.getAttribute("data-mp4");
    const hls = video.getAttribute("data-hls");
    const poster = video.getAttribute("poster");

    if (mp4 && !video.querySelector("source")) {
      const source = document.createElement("source");
      source.src = mp4;
      source.type = "video/mp4";
      video.appendChild(source);
    }

    function startPlayback() {
      const tryPlay = () => video.play().catch(() => {});
      tryPlay();
      if (playBtn) playBtn.style.display = "none";
    }

    if (window.Hls && hls && window.Hls.isSupported()) {
      try {
        const hlsPlayer = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true,
        });
        hlsPlayer.loadSource(hls);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
      } catch (err) {
        console.warn("HLS init failed", err);
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl") && hls) {
      video.src = hls;
      video.addEventListener("loadedmetadata", startPlayback, { once: true });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        startPlayback();
      });
    }

    video.addEventListener("play", () => {
      if (playBtn) playBtn.style.display = "none";
    });
    video.addEventListener("pause", () => {
      if (playBtn) playBtn.style.display = "";
    });

    if (poster && !video.getAttribute("poster")) {
      video.setAttribute("poster", poster);
    }
  }

  function cardTemplate(item, prefix, small = false) {
    const poster = prefix + item.poster;
    const href = prefix + "movie/" + String(item.id).padStart(4, "0") + ".html";
    const tags = (item.tags || []).slice(0, 3).join(" / ");
    const genre = (item.genres || []).slice(0, 2).join(" / ");
    return (
      '<a class="movie-card ' + (small ? "small-card" : "") + '" data-card href="' + href + '"' +
      ' data-title="' + safeText(item.title) + '"' +
      ' data-genre="' + safeText(genre) + '"' +
      ' data-region="' + safeText(item.region) + '"' +
      ' data-year="' + safeText(item.year) + '"' +
      ' data-type="' + safeText(item.type) + '"' +
      ' data-tags="' + safeText(tags) + '"' +
      ' data-category="' + safeText(item.category) + '"' +
      ' data-keywords="' + safeText([item.title, item.region, item.type, item.category, genre, tags, item.year].join(" ")) + '">' +
      '<div class="movie-poster">' +
      '<img loading="lazy" src="' + poster + '" alt="' + safeText(item.title) + '">' +
      '<span class="movie-badge">' + safeText(item.year) + '</span>' +
      '</div>' +
      '<div class="movie-body">' +
      '<h3 class="movie-title">' + safeText(item.title) + '</h3>' +
      '<div class="movie-meta"><span>' + safeText(item.category) + '</span><span>' + safeText(item.type) + '</span><span>' + safeText(item.region) + '</span></div>' +
      (small ? "" : '<p class="movie-desc">' + safeText(item.one_line || item.summary || item.review || "") + '</p>') +
      '<div class="link-row"><span>进入详情</span><span>播放预览</span></div>' +
      '</div>' +
      '</a>'
    );
  }

  function initSearchPage() {
    const root = qs("#searchApp");
    if (!root || !window.MOVIES_DATA) return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    const prefix = root.getAttribute("data-prefix") || "./";

    const html = `
      <div class="search-panel">
        <div class="search-hero">
          <div class="search-result-top">
            <div>
              <h1 class="section-title" style="margin:0;">站内搜索</h1>
              <p class="section-subtitle">输入片名、类型、标签、地区或年份，快速检索 2000 部影片。</p>
            </div>
            <div class="badge">共 <strong data-search-total>0</strong> 部匹配</div>
          </div>
          <div class="filters">
            <div class="filter-input" style="flex:1 1 420px">
              <input class="input" data-search-input type="search" placeholder="例如：悬疑、2024、周星驰、武侠…" value="${safeText(initial)}">
            </div>
            <button class="btn btn-primary" type="button" data-search-clear>清空</button>
          </div>
        </div>
        <div class="section" style="padding-top:0;">
          <div class="movie-grid" data-search-results></div>
          <div class="empty-state hidden" data-search-empty>没有找到匹配结果，请换个关键词试试。</div>
        </div>
      </div>
    `;
    root.innerHTML = html;
    const input = qs("[data-search-input]", root);
    const results = qs("[data-search-results]", root);
    const total = qs("[data-search-total]", root);
    const empty = qs("[data-search-empty]", root);
    const clearBtn = qs("[data-search-clear]", root);

    function render(term) {
      const q = norm(term);
      const list = window.MOVIES_DATA.filter((item) => {
        const hay = norm([
          item.title,
          item.region,
          item.type,
          item.category,
          (item.genres || []).join(" "),
          (item.tags || []).join(" "),
          item.year
        ].join(" "));
        return !q || hay.includes(q);
      });

      total.textContent = String(list.length);
      results.innerHTML = list
        .slice(0, 180)
        .map((item) => cardTemplate(item, prefix, false))
        .join("");

      empty.classList.toggle("hidden", list.length !== 0);

      const url = new URL(window.location.href);
      if (term.trim()) url.searchParams.set("q", term.trim());
      else url.searchParams.delete("q");
      history.replaceState({}, "", url.toString());
    }

    input.addEventListener("input", () => render(input.value));
    clearBtn.addEventListener("click", () => {
      input.value = "";
      render("");
      input.focus();
    });

    render(initial);
  }

  function initAutoFilters() {
    // generic filtering panels
    initFilterPanels();
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateNavToggle();
    bindSearchForms();
    initHeroSlider();
    initAutoFilters();
    initDetailPlayer();
    initSearchPage();
  });
})();
