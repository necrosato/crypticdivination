(function () {
  const PAGE_SELECTOR = 'main';
  const INTERNAL_PAGE_PATTERN = /\.(html)?($|[?#])/i;

  function isInternalPageLink(anchor) {
    if (!anchor || !anchor.href) return false;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.hash && url.pathname === window.location.pathname && !url.search) return false;
    if (url.pathname.endsWith('/shows.html') || url.pathname === '/shows.html') return false;
    return INTERNAL_PAGE_PATTERN.test(url.pathname);
  }

  function getSharedPlayer() {
    const player = document.querySelector('.audio-player');
    if (!player) return null;
    const title = player.querySelector('.track-title');
    const audio = player.querySelector('audio');
    if (!title || !audio) return null;
    return { player, title, audio };
  }

  function loadTrack(trackName, trackSrc, shouldAutoplay) {
    const shared = getSharedPlayer();
    if (!shared || !trackName || !trackSrc) return;

    const activeSource = shared.audio.querySelector('source');
    if (activeSource && activeSource.src === new URL(trackSrc, window.location.href).href && !shared.audio.paused) {
      return;
    }

    shared.title.textContent = trackName;
    if (activeSource) {
      activeSource.src = trackSrc;
    } else {
      shared.audio.src = trackSrc;
    }
    shared.audio.load();

    if (shouldAutoplay) {
      shared.audio.play().catch(function () {
        // Playback may be blocked by browser autoplay policy.
      });
    }
  }

  function wireMusicTrackButtons(root) {
    const buttons = root.querySelectorAll('[data-track-src][data-track-name]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        loadTrack(button.dataset.trackName, button.dataset.trackSrc, true);
      });
    });
  }

  async function loadPage(url, pushState) {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'spa-nav' } });
    if (!response.ok) throw new Error('Navigation fetch failed');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nextMain = doc.querySelector(PAGE_SELECTOR);
    const currentMain = document.querySelector(PAGE_SELECTOR);
    if (!nextMain || !currentMain) {
      window.location.href = url;
      return;
    }

    currentMain.replaceWith(nextMain);
    document.title = doc.title;
    if (doc.body && doc.body.className !== undefined) {
      document.body.className = doc.body.className;
    }

    wireMusicTrackButtons(document);

    if (pushState) {
      history.pushState({ path: url }, '', url);
    }

    if (typeof window.initializeShowsPage === 'function') {
      window.initializeShowsPage();
    }
  }

  document.addEventListener('click', function (event) {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;
    if (!isInternalPageLink(anchor)) return;

    event.preventDefault();
    loadPage(anchor.href, true).catch(function () {
      window.location.href = anchor.href;
    });
  });

  window.addEventListener('popstate', function () {
    loadPage(window.location.href, false).catch(function () {
      window.location.reload();
    });
  });

  wireMusicTrackButtons(document);
})();
