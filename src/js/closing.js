import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * When the contact/closing section is in view, force model opacity to 0
 * every frame so it doesn't bleed through from the assembly section.
 */
export function initClosing({ pivot, camera, renderer }) {
  const section = document.getElementById('closing');

  let inView = false;

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter:      () => { inView = true; },
    onLeave:      () => { inView = false; },
    onEnterBack:  () => { inView = true; },
    onLeaveBack:  () => { inView = false; },
  });

  function frameUpdate() {
    if (!inView) return;
    pivot.traverse((o) => {
      if (o.isMesh && o.material && o.material.opacity !== 0) {
        o.material.opacity = 0;
      }
    });
  }

  return { frameUpdate };
}
