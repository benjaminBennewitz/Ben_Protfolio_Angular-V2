(() => {
  'use strict';

  const root = document.documentElement;
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealElements = [...document.querySelectorAll('[data-reveal]')];
  if (!motionReduced && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const slides = [...slider.querySelectorAll('[data-slide]')];
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    const category = slider.querySelector('[data-slider-category]');
    const meta = slider.querySelector('[data-slider-meta]');
    const indexLabel = slider.querySelector('[data-slider-index]');
    let activeIndex = 0;
    let autoplayId = 0;

    const renderSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeIndex));
      const active = slides[activeIndex];
      category.textContent = active.dataset.category || '';
      meta.textContent = active.dataset.meta || '';
      indexLabel.textContent = active.dataset.index || '';
    };

    const stopAutoplay = () => {
      if (autoplayId) window.clearInterval(autoplayId);
      autoplayId = 0;
    };

    const startAutoplay = () => {
      if (motionReduced) return;
      stopAutoplay();
      autoplayId = window.setInterval(() => renderSlide(activeIndex + 1), 6200);
    };

    prev?.addEventListener('click', () => { renderSlide(activeIndex - 1); startAutoplay(); });
    next?.addEventListener('click', () => { renderSlide(activeIndex + 1); startAutoplay(); });
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);
    startAutoplay();
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menü öffnen');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
      return;
    }
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Menü schließen');
    mobileMenu?.classList.add('is-open');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
  });

  const mobileMenuLinks = [...(mobileMenu?.querySelectorAll('a[href^="#"]') || [])];
  mobileMenuLinks.forEach((link) => link.addEventListener('click', closeMenu));

  const setActiveMenuLink = (id) => {
    mobileMenuLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window && mobileMenuLinks.length) {
    const menuTargets = mobileMenuLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const menuObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveMenuLink(visible.target.id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4, 0.7] });

    menuTargets.forEach((target) => menuObserver.observe(target));
    setActiveMenuLink('top');
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const scrollTopButton = document.querySelector('[data-scroll-top]');
  const syncScrollButton = () => {
    scrollTopButton?.classList.toggle('is-visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', syncScrollButton, { passive: true });
  syncScrollButton();
  scrollTopButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motionReduced ? 'auto' : 'smooth' }));

  document.querySelectorAll('[data-placeholder-link]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
})();
