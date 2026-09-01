/* src/assets/scripts/scroll-restoration.js */

/**
 * Verhindert die native Scroll-Wiederherstellung bereits vor dem Angular-Bootstrap.
 * Ohne Fragment bleibt der App-Inhalt bis zum finalen Scroll-Reset verborgen.
 */
(() => {
  const root = document.documentElement;
  const hasFragment = window.location.hash.length > 1;

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  if (hasFragment) {
    root.classList.remove('bp-initial-scroll-reset', 'bp-initial-scroll-pending');
    return;
  }

  window.scrollTo(0, 0);
})();
