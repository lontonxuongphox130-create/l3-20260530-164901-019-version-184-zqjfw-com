(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function esc(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function card(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
        var genre = movie.genre ? movie.genre.split(/[，,、/\s]+/)[0] : movie.type;
        return '<a class="movie-card" href="' + esc(movie.href) + '">' +
            '<div class="poster-wrap">' +
            '<img src="' + esc(movie.cover) + '" alt="' + esc(movie.title) + '" loading="lazy">' +
            '<span class="corner-badge left">' + esc(genre) + '</span>' +
            '<span class="corner-badge right">' + esc(movie.year) + '</span>' +
            '</div>' +
            '<div class="card-body">' +
            '<h3>' + esc(movie.title) + '</h3>' +
            '<p class="card-meta">' + esc(movie.region) + ' · ' + esc(movie.type) + '</p>' +
            '<p class="card-desc">' + esc(movie.oneLine || tags) + '</p>' +
            '</div>' +
            '</a>';
    }

    function matchYear(movie, value) {
        if (!value) {
            return true;
        }
        if (value === '2020') {
            return Number(movie.year) <= 2020;
        }
        return Number(movie.year) === Number(value);
    }

    function render() {
        var input = qs('[data-search-input]');
        var region = qs('[data-search-region]');
        var year = qs('[data-search-year]');
        var results = qs('[data-search-results]');
        var status = qs('[data-search-status]');
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var movies = window.MOVIE_INDEX || [];

        if (!results) {
            return;
        }

        var filtered = movies.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.category,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okRegion = !regionValue || movie.category === regionValue;
            return okKeyword && okRegion && matchYear(movie, yearValue);
        }).slice(0, 120);

        results.innerHTML = filtered.map(card).join('');
        if (status) {
            status.textContent = filtered.length ? '已匹配到相关影片，点击卡片进入详情页。' : '没有匹配影片。';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var query = params().get('q') || '';
        var input = qs('[data-search-input]');
        var form = qs('[data-search-page-form]');
        var region = qs('[data-search-region]');
        var year = qs('[data-search-year]');
        if (input) {
            input.value = query;
            input.addEventListener('input', render);
        }
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (input && input.value.trim()) {
                    history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(input.value.trim()));
                }
                render();
            });
        }
        if (region) {
            region.addEventListener('change', render);
        }
        if (year) {
            year.addEventListener('change', render);
        }
        render();
    });
})();
