import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { createScene } from './scene.js';
import { loadEht } from './models.js';
import { ehtContent, renderAll } from './content.js';
import { initHero } from './hero.js';
import { initAssembly } from './assembly.js';
import { initEhtDashboard } from './eht-dashboard.js';
import { initCounters } from './counter.js';
// audience.js removed, content merged into Applications section
import { initClosing } from './closing.js';

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  renderAll(ehtContent);

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);
  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.defaults({ markers: false });
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      return arguments.length ? lenis.scrollTo(value, { immediate: true }) : window.scrollY;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  const canvas = document.getElementById('three-canvas');
  const { renderer, scene, camera } = createScene(canvas);

  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderText = document.getElementById('loader-text');
  const model = await loadEht({
    onProgress: (p) => {
      const pct = Math.round(p * 100);
      loaderFill.style.width = `${pct}%`;
      loaderText.textContent = `Initialising · ${pct}%`;
    },
  });
  loaderText.textContent = 'Ready';
  loaderFill.style.width = '100%';

  scene.add(model.pivot);

  const hero = initHero({ pivot: model.pivot, camera });
  const assembly = initAssembly({
    pivot: model.pivot,
    camera,
    bbox: model.bbox,
    size: model.size,
    renderer,
    callouts: ehtContent.callouts,
  });
  const closing = initClosing({ pivot: model.pivot, camera, renderer });

  initEhtDashboard(ehtContent.bms_assets);
  initCounters();
  initFeatureRotator();

  setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('no-scroll');
    ScrollTrigger.refresh();
  }, 450);

  const drivers = [hero, assembly, closing];
  function frame() {
    drivers.forEach((d) => d.frameUpdate && d.frameUpdate());
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -20, duration: 1.4 });
      }
    });
  });

  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => ScrollTrigger.refresh(), 150);
  });
}

// ── Feature Rotator ─────────────────────────────────────────
function initFeatureRotator() {
  const rotator  = document.getElementById('eht-rotator');
  if (!rotator) return;

  const slides   = [...rotator.querySelectorAll('.eht-rotator__slide')];
  const dots     = [...rotator.querySelectorAll('.eht-rotator__dot')];
  const fill     = document.getElementById('rotator-progress');
  const INTERVAL = 4500;   // ms per slide
  const TICK     = 50;     // progress update cadence

  let current = 0;
  let elapsed = 0;
  let timer   = null;

  function goTo(idx) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    current = idx;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    elapsed = 0;
    if (fill) fill.style.width = '0%';
  }

  function advance() {
    goTo((current + 1) % slides.length);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      elapsed += TICK;
      if (fill) fill.style.width = `${Math.min(100, (elapsed / INTERVAL) * 100)}%`;
      if (elapsed >= INTERVAL) advance();
    }, TICK);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.idx));
      startTimer();
    });
  });

  const prevBtn = document.getElementById('eht-rotator-prev');
  const nextBtn = document.getElementById('eht-rotator-next');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    goTo((current - 1 + slides.length) % slides.length);
    startTimer();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    goTo((current + 1) % slides.length);
    startTimer();
  });

  // Pause on hover
  rotator.addEventListener('mouseenter', () => clearInterval(timer));
  rotator.addEventListener('mouseleave', () => startTimer());

  startTimer();
}

document.body.classList.add('no-scroll');

boot().catch((err) => {
  console.error('EHT boot failure:', err);
  const loaderText = document.getElementById('loader-text');
  if (loaderText) loaderText.textContent = 'Failed to load, check console';
});
