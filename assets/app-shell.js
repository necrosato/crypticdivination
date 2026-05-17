(function () {
  const PAGE_SELECTOR = 'main';
  const INTERNAL_PAGE_PATTERN = /\.(html)?($|[?#])/i;

  function isInternalPageLink(anchor) {
    if (!anchor || !anchor.href) return false;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.hash && url.pathname === window.location.pathname && !url.search) return false;
    return INTERNAL_PAGE_PATTERN.test(url.pathname);
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
})();
