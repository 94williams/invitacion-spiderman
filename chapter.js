/* Chapter interactions: original event/RSVP code remains in script.js. */
(() => {
  'use strict';
  const reveal = [...document.querySelectorAll('[data-chapter-reveal]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('chapter-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    reveal.forEach(element => observer.observe(element));
  } else reveal.forEach(element => element.classList.add('chapter-visible'));

  const project = document.querySelector('[data-project]');
  if (!project) return;
  const layers = [...project.querySelectorAll('[data-project-layer]')];
  const buttons = [...project.querySelectorAll('[data-project-state]')];
  const stops = [...project.querySelectorAll('[data-project-step]')];
  const label = project.querySelector('#projectStageLabel');
  const controls = project.querySelector('[data-project-controls]');
  const labels = ['01 · Todo comienza con un sueño.', '02 · Un gran equipo lo construye.', '03 · ¡La obra se convierte en fiesta!'];
  let selected = 0;
  let manual = false;
  const select = index => {
    if (!Number.isInteger(index) || index < 0 || index >= layers.length) return;
    layers.forEach((layer, i) => {
      layer.classList.toggle('is-active', i === index);
      layer.setAttribute('aria-hidden', String(i !== index));
    });
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    stops.forEach((stop, i) => stop.classList.toggle('is-current', i === index));
    if (selected !== index) label.textContent = labels[index];
    selected = index;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    manual = true;
    select(Number(button.dataset.projectState));
  }));
  controls.hidden = false;
  select(0);
  // A manual choice remains selected until the visitor scrolls again.
  window.addEventListener('scroll', () => { manual = false; }, { passive: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (manual || !entries.some(entry => entry.isIntersecting)) return;
      const center = window.innerHeight * .65;
      const visible = stops.map(stop => ({ stop, rect: stop.getBoundingClientRect() }))
        .filter(item => item.rect.bottom > window.innerHeight * .35 && item.rect.top < window.innerHeight * .9);
      if (!visible.length) return;
      visible.sort((a, b) => Math.abs(a.rect.top + a.rect.height / 2 - center) - Math.abs(b.rect.top + b.rect.height / 2 - center));
      select(Number(visible[0].stop.dataset.projectStep));
    }, { rootMargin: '-35% 0px -10% 0px', threshold: [0, .25, .5, .75, 1] });
    stops.forEach(stop => observer.observe(stop));
  }
})();