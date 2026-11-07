(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const themeToggle = document.querySelector('.theme-toggle');
  const progress = document.querySelector('.scroll-progress span');
  const backToTop = document.querySelector('.back-to-top');
  const toast = document.querySelector('.toast');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('dm-portfolio-theme', theme); } catch { /* storage can be unavailable */ }
    themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08090c' : '#f4f1f2');
  };

  try {
    const savedTheme = localStorage.getItem('dm-portfolio-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    else setTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch { setTheme('dark'); }

  themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const closeMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    nav?.classList.remove('is-open');
  };
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
    backToTop?.classList.toggle('is-visible', window.scrollY > 520);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);
  updateScrollUI();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  document.getElementById('currentYear')?.replaceChildren(String(new Date().getFullYear()));
  window.addEventListener('load', () => window.setTimeout(() => body.classList.add('is-ready'), prefersReducedMotion ? 0 : 550), { once: true });
  window.setTimeout(() => body.classList.add('is-ready'), 1800);

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      revealObserver.observe(item);
    });
  } else revealItems.forEach((item) => item.classList.add('is-visible'));

  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = document.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-36% 0px -56% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const countUp = (element) => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = prefersReducedMotion ? 0 : 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const stats = document.querySelector('.stats-grid');
  if (stats && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      stats.querySelectorAll('[data-count]').forEach(countUp);
      observer.disconnect();
    }, { threshold: 0.25 });
    statsObserver.observe(stats);
  } else document.querySelectorAll('[data-count]').forEach(countUp);

  const projectCards = [...document.querySelectorAll('.project-card')];
  const emptyState = document.querySelector('.projects-empty');
  const projectSearch = document.querySelector('#project-search');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  let activeFilter = filterButtons.find((button) => button.classList.contains('is-active'))?.dataset.filter || 'all';

  const applyProjectFilters = () => {
    const query = (projectSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    projectCards.forEach((card) => {
      const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const visible = matchesCategory && name.includes(query);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) {
      emptyState.textContent = query ? 'No projects match your search.' : 'No projects in this category yet';
      emptyState.hidden = visibleCount > 0;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyProjectFilters();
    });
  });
  projectSearch?.addEventListener('input', applyProjectFilters);
  applyProjectFilters();

  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  };

  document.getElementById('contactForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Portfolio inquiry — ${data.get('service')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Topic: ${data.get('service')}`,
      '',
      'Message:',
      data.get('details')
    ].join('\n');
    const mailto = `mailto:hoducminh10@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('Opening your email app…');
    window.location.href = mailto;
  });
})();
