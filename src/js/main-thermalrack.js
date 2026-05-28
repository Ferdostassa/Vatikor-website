/**
 * main-thermalrack.js
 * Boot script for thermalrack.html, no Three.js / no loader
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { renderNav, renderFeatures, renderAudience } from './content.js';
import { initAudience } from './audience.js';

gsap.registerPlugin(ScrollTrigger);

/* ── ThermRack content ──────────────────────────────────────── */
const thermalrackContent = {
  product_name: 'ThermRack™',
  vendor: 'Vatikor',
  vendor_location: 'Ontario, Canada',
  contact: 'Sales@vatikor.ca',

  nav: [
    { label: 'Home',       href: './index.html',  type: 'page', home: true },
    { id: 'why-thermalrack', label: 'Why ThermRack', type: 'anchor' },
    { id: 'system',          label: 'System',        type: 'anchor' },
    { id: 'insights',        label: 'Insights',      type: 'anchor' },
    { id: 'features',        label: 'Features',      type: 'anchor' },
    { label: 'EHT',      href: './eht.html',    type: 'page' },
    { label: 'MotIQ',    href: './motiq.html',  type: 'page' },
    { label: 'Contact',  href: './contact.html', type: 'page' },
  ],
  nav_cta: {
    label: 'Contact Us',
    href: './contact.html',
  },

  /* Core features, rendered into #feature-grid by renderFeatures() */
  core_features: [
    {
      title: 'Easy Installation',
      short_description: 'Magnetic mount, install in minutes without tools or downtime. No cabling beyond a single PoE connection per camera.',
    },
    {
      title: 'Power over Ethernet',
      short_description: 'One cable delivers both power and data. Clean, simple, and compatible with any standard PoE switch infrastructure.',
    },
    {
      title: 'Secure by Design',
      short_description: 'All data stays inside your network. No cloud connection required. No external data transfer, ever.',
    },
    {
      title: 'Local Data Storage',
      short_description: 'Full thermal history stored on-premise on the edge computer. Your data, your control, no third-party retention.',
    },
    {
      title: 'BMS Integration',
      short_description: 'Seamless BACnet TCP/IP integration delivers actionable thermal insights directly to your existing Building Management System.',
    },
    {
      title: 'Wireless Camera Network',
      short_description: 'Multiple thermal cameras connect wirelessly to a single gateway, scalable from a single server room to a full multi-row data center.',
    },
  ],

  /* Sections, used by renderFeatures, renderAudience */
  sections: [
    {
      id: 'features',
      headline: 'Built for the Data Center. Designed for Operators.',
      body_long: 'ThermRack combines wireless thermal imaging, on-premise edge intelligence, and seamless BMS integration into a system that deploys in minutes and requires zero ongoing maintenance.',
    },
    {
      id: 'audience',
      headline: 'Where ThermRack Is Deployed',
      body_long: 'From single server rooms to enterprise-scale multi-row data centers, ThermRack scales to any rack environment.',
    },
  ],

  /* Use cases, rendered into #audience-stage by renderAudience() */
  use_cases: [
    {
      sector: 'Enterprise Data Centers',
      detail: 'Multi-row deployments where cooling optimization across hundreds of racks translates directly into measurable energy savings and improved PUE.',
    },
    {
      sector: 'Colocation Facilities',
      detail: 'Per-rack thermal visibility lets colo operators demonstrate compliance, document SLA adherence, and detect tenant-side hotspots before they trigger service events.',
    },
    {
      sector: 'Edge & Server Rooms',
      detail: 'Compact deployments in IT closets and branch server rooms where rack cooling is managed manually, ThermRack makes thermal anomalies visible before equipment fails.',
    },
    {
      sector: 'Healthcare & Critical Infrastructure',
      detail: 'Environments where equipment reliability is non-negotiable. ThermRack provides continuous thermal assurance with full audit-trail logging for compliance.',
    },
  ],
};

/* ── Boot ───────────────────────────────────────────────────── */
async function boot() {
  // Render nav and data-driven sections
  renderNav(thermalrackContent);
  renderFeatures(thermalrackContent);
  renderAudience(thermalrackContent);

  // Smooth scroll, Lenis
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
      return arguments.length
        ? lenis.scrollTo(value, { immediate: true })
        : window.scrollY;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  // Nav, ThermRack has no loader, show nav immediately
  const nav = document.getElementById('nav');
  if (nav) {
    nav.classList.add('is-visible');
    ScrollTrigger.create({
      start: 'top -60px',
      onEnter: () => nav.classList.add('is-solid'),
      onLeaveBack: () => nav.classList.remove('is-solid'),
    });
  }

  // Feature rotator
  initFeatureRotator();

  // Audience cycling
  initAudience();

  // Scroll reveals, fade-up for .tr-reveal elements
  gsap.utils.toArray('.tr-reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // Smooth anchor scroll for in-page links
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

  // Feature card expand toggle (click to show long description)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.feature-card');
    if (!card) return;
    const wasOpen = card.classList.contains('is-open');
    document.querySelectorAll('.feature-card.is-open').forEach((c) => c.classList.remove('is-open'));
    if (!wasOpen) card.classList.add('is-open');
  });

  // Resize handler
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => ScrollTrigger.refresh(), 150);
  });

  ScrollTrigger.refresh();
}

/* ── Feature Rotator ────────────────────────────────────────── */
function initFeatureRotator() {
  const rotator = document.getElementById('thermalrack-rotator');
  if (!rotator) return;

  const slides  = [...rotator.querySelectorAll('.eht-rotator__slide')];
  const dots    = [...rotator.querySelectorAll('.eht-rotator__dot')];
  const fill    = document.getElementById('thermalrack-rotator-progress');
  const INTERVAL = 4500; // ms per slide
  const TICK     = 50;   // progress-bar update cadence

  let current = 0;
  let elapsed = 0;
  let timer   = null;

  function goTo(idx) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    current = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    elapsed = 0;
    if (fill) fill.style.width = '0%';
  }

  function advance() {
    goTo(current + 1);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      elapsed += TICK;
      if (fill) fill.style.width = `${Math.min(100, (elapsed / INTERVAL) * 100)}%`;
      if (elapsed >= INTERVAL) advance();
    }, TICK);
  }

  // Dot clicks
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.idx));
      startTimer();
    });
  });

  // Arrow buttons
  const prevBtn = document.getElementById('thermalrack-rotator-prev');
  const nextBtn = document.getElementById('thermalrack-rotator-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

  // Pause on hover
  rotator.addEventListener('mouseenter', () => clearInterval(timer));
  rotator.addEventListener('mouseleave', () => startTimer());

  // Start
  startTimer();
}

boot().catch(console.error);
