document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const reveal = target => target?.setAttribute('data-reveal', '');
  document.querySelectorAll('.feature-copy, .feature-flow, .index-intro, .index-table, .now h2, .active-blocks').forEach(reveal);

  const primary = document.querySelector('.system-primary');
  const primaryHeading = primary?.querySelector('h3');
  const primarySummary = primary?.querySelector(':scope > p');
  if (primary && primaryHeading && primarySummary) {
    const primaryCopy = document.createElement('div');
    primaryCopy.className = 'system-primary-copy';
    primaryCopy.setAttribute('data-reveal', '');
    primary.insertBefore(primaryCopy, primaryHeading);
    primaryCopy.append(primaryHeading, primarySummary);
  }
  reveal(primary?.querySelector('.terminal-visual'));
  reveal(document.querySelector('.systems-stack'));
  document.querySelectorAll('.feature-flow li').forEach((step, index) => step.style.setProperty('--step', index));

  document.body.classList.add('motion-ready');
  requestAnimationFrame(() => document.body.classList.add('motion-enter'));

  const revealTargets = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(target => target.classList.add('is-revealed'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    revealTargets.forEach(target => observer.observe(target));
  }

  const hero = document.querySelector('.hero');
  const ghostAdrian = document.querySelector('.ghost-adrian');
  let parallaxFrame;
  const updateParallax = () => {
    parallaxFrame = undefined;
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
    ghostAdrian?.style.setProperty('--ghost-shift', `${-16 * progress}px`);
  };
  const queueParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
  };
  updateParallax();
  window.addEventListener('scroll', queueParallax, { passive: true });
  window.addEventListener('resize', queueParallax, { passive: true });

  if (window.innerWidth <= 760 || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const signalLink = document.querySelector('.signal-link');
  if (!signalLink) return;
  const resetSignal = () => {
    signalLink.style.setProperty('--magnetic-x', '0px');
    signalLink.style.setProperty('--magnetic-y', '0px');
  };
  signalLink.addEventListener('pointermove', event => {
    const bounds = signalLink.getBoundingClientRect();
    const x = Math.max(-7, Math.min(7, ((event.clientX - (bounds.left + bounds.width / 2)) / bounds.width) * 14));
    const y = Math.max(-7, Math.min(7, ((event.clientY - (bounds.top + bounds.height / 2)) / bounds.height) * 14));
    signalLink.style.setProperty('--magnetic-x', `${x}px`);
    signalLink.style.setProperty('--magnetic-y', `${y}px`);
  });
  signalLink.addEventListener('pointerleave', resetSignal);
  signalLink.addEventListener('blur', resetSignal);
});
