import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initEhtDashboard(assets) {
  const container = document.getElementById('eht-bms-rows');
  if (!container || !assets) return;

  container.innerHTML = '';

  assets.forEach((asset) => {
    const row = document.createElement('div');
    row.className = `eht-bms__row eht-bms__row--${asset.status}`;
    row.style.opacity = '0';
    row.style.transform = 'translateY(12px)';

    // Alarm column — red if active fault, green if normal
    const alarmClass = asset.alarm === 'Normal' ? 'eht-bms__sig--good' : 'eht-bms__sig--fault';

    // Developing column — amber if developing fault present, grey if none
    const devClass = asset.developing === 'None' ? 'eht-bms__sig--none' : 'eht-bms__sig--developing';

    // Vib vs ISO
    const vibClass = asset.vib_iso === 'OK' ? 'eht-bms__sig--good' : 'eht-bms__sig--warn';

    // Temp
    const tempClass = asset.temp === 'Normal' ? 'eht-bms__sig--good' : 'eht-bms__sig--warn';

    // Comm status
    const commClass = asset.comm === 'OK' ? 'eht-bms__sig--good' : 'eht-bms__sig--fault';

    row.innerHTML = `
      <span class="eht-bms__id mono">${asset.id}</span>
      <span class="eht-bms__name">${asset.name}</span>
      <span class="eht-bms__sig ${alarmClass}">${asset.alarm}</span>
      <span class="eht-bms__developing ${devClass}">${asset.developing}</span>
      <span class="eht-bms__sig ${vibClass}">${asset.vib_iso}</span>
      <span class="eht-bms__sig ${tempClass}">${asset.temp}</span>
      <span class="eht-bms__sig ${commClass}">${asset.comm}</span>
    `;

    container.appendChild(row);
  });

  const rows = container.querySelectorAll('.eht-bms__row');

  ScrollTrigger.create({
    trigger: container,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.08,
        onComplete: () => {
          const warnRow = container.querySelector('.eht-bms__row--warning');
          if (warnRow) {
            gsap.to(warnRow, {
              backgroundColor: 'rgba(200, 106, 60, 0.07)',
              duration: 0.7,
              repeat: 3,
              yoyo: true,
              ease: 'power2.inOut',
            });
          }
        },
      });
    },
  });
}
