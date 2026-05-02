import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createScene(canvas) {
  // renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = false;

  // scene
  const scene = new THREE.Scene();
  scene.background = null;

  // environment (neutral, slightly warm) — drives PBR material shading
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  // camera
  const camera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.05,
    100
  );
  camera.position.set(0, 0.25, 3.2);

  // lights — studio setup optimised for a dark industrial panel device
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-2.0, 3.5, 3.0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdce8f5, 1.2);
  fill.position.set(3.0, 0.8, 2.0);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd5a8, 1.1);
  rim.position.set(0.6, -1.2, -2.0);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xb0b8c8, 0.6);
  scene.add(hemi);

  // Front-facing area light to illuminate the LCD face
  const rectArea = new THREE.RectAreaLight(0xffffff, 3.5, 3.5, 3.5);
  rectArea.position.set(0, 0.5, 3.0);
  rectArea.lookAt(0, 0, 0);
  scene.add(rectArea);

  // resize
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera, pmrem, dispose() { pmrem.dispose(); envTexture.dispose(); window.removeEventListener('resize', onResize); } };
}
