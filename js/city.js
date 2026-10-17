// ============================================================
//  Hero scene: a rainy neon "data city" at night.
//  Buildings are instanced boxes with procedural window textures,
//  plus neon signs for every city I've lived in, blinking roof lights,
//  rain and a paper plane.
// ============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { makePaperPlane, makeTrail } from "./plane.js";

const PALETTE = {
  fog: 0x0b1c24,
  teal: 0x7cc7cd,
  yellow: 0xd9c48f,
  magenta: 0x9d9be0,
};

// seeded random so the skyline is the same on every visit
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(528);

function windowTexture(tint) {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#020405";
  g.fillRect(0, 0, 64, 128);
  const warm = ["#ffd27a", "#ffe9b0", "#fff4d6"];
  for (let y = 2; y < 128; y += 4) {
    for (let x = 2; x < 64; x += 4) {
      const r = rand();
      if (r < 0.2) {
        g.fillStyle = r < 0.05 ? tint : warm[(r * 100 | 0) % 3];
        g.globalAlpha = 0.25 + rand() * 0.6;
        g.fillRect(x, y, 2, 2);
      }
    }
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SIGN_FONT = "'Silkscreen', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
function signTexture(text, color, vertical = false, sub = "") {
  const c = document.createElement("canvas");
  const W = vertical ? 128 : 512, H = vertical ? 512 : 160;
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(0,0,0,0.85)";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = color; g.lineWidth = 6;
  g.strokeRect(6, 6, W - 12, H - 12);
  g.fillStyle = color;
  g.textAlign = "center"; g.textBaseline = "middle";
  if (vertical) {
    g.font = `bold 72px ${SIGN_FONT}`;
    const chars = [...text];
    const step = (H - 40) / chars.length;
    chars.forEach((ch, i) => g.fillText(ch, W / 2, 20 + step * (i + 0.5)));
  } else {
    g.font = `bold 60px ${SIGN_FONT}`;
    g.fillText(text, W / 2, sub ? H / 2 - 18 : H / 2 + 4);
    if (sub) {
      g.globalAlpha = 0.75;
      g.font = `600 28px 'JetBrains Mono', ${SIGN_FONT}`;
      g.fillText(sub, W / 2, H / 2 + 38);
      g.globalAlpha = 1;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initCity(canvas) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = innerWidth < 760;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.fog);
  scene.fog = new THREE.FogExp2(PALETTE.fog, 0.0085);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 600);

  scene.add(new THREE.HemisphereLight(0x3a7c86, 0x050608, 0.6));
  const moon = new THREE.DirectionalLight(0x8fd8ff, 0.5);
  moon.position.set(-40, 80, -60);
  scene.add(moon);

  // ---- wet ground ----
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x050a0d, roughness: 0.18, metalness: 0.85 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(800, 160, PALETTE.teal, PALETTE.teal);
  grid.material.transparent = true;
  grid.material.opacity = 0.07;
  grid.position.y = 0.02;
  scene.add(grid);

  // ---- buildings: 3 instanced meshes with different window tints ----
  const tints = ["#7cc7cd", "#9d9be0", "#d9c48f"];
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const AVENUE = 14;         // half-width of the empty street the camera flies down
  const ROWS = isSmall ? 34 : 52;
  const COLS = isSmall ? 10 : 14;
  const spots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const side = c < COLS / 2 ? -1 : 1;
      const ci = c % (COLS / 2);
      const x = side * (AVENUE + 3 + ci * 7 + rand() * 2);
      const z = 40 - r * 7 + rand() * 2;
      // taller toward the back and away from the avenue: reads like a skyline chart
      const base = 6 + ci * 3.5 + rand() ** 2 * 38;
      const h = rand() < 0.08 ? base + 40 + rand() * 30 : base;
      spots.push({ x, z, w: 3 + rand() * 3, d: 3 + rand() * 3, h });
    }
  }
  const buckets = [[], [], []];
  spots.forEach((s, i) => buckets[i % 3].push(s));
  const rooftops = [];
  const dummy = new THREE.Object3D();
  buckets.forEach((list, k) => {
    const tex = windowTexture(tints[k]);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x060b0e, roughness: 0.6, metalness: 0.3,
      emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.0,
    });
    // stretch windows with building size via per-instance UV scale is costly;
    // instead use world-ish repeat so windows stay small
    tex.repeat.set(1, 3);
    const mesh = new THREE.InstancedMesh(box, mat, list.length);
    list.forEach((s, i) => {
      dummy.position.set(s.x, 0, s.z);
      dummy.scale.set(s.w, s.h, s.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (s.h > 30) rooftops.push(new THREE.Vector3(s.x, s.h + 0.6, s.z));
    });
    scene.add(mesh);
  });

  // ---- blinking red aircraft lights on tall roofs ----
  const lightGeo = new THREE.BufferGeometry().setFromPoints(rooftops);
  const lightMat = new THREE.PointsMaterial({ color: 0xff2a2a, size: 1.1, sizeAttenuation: true, transparent: true });
  scene.add(new THREE.Points(lightGeo, lightMat));

  // ---- neon signs: my footprints, in the order the camera passes them ----
  const Y = "#d9c48f", T = "#7cc7cd", M = "#9d9be0";
  const signs = [
    { text: "FRANK.DB", sub: "SELECT * FROM life", color: Y, left: true, y: 15, z: 18 },
    { text: "彰化", color: M, left: false, y: 26, z: -6, vertical: true },
    { text: "CHANGHUA", sub: "TW · born", color: M, left: true, y: 11, z: -18 },
    { text: "宁波", color: T, left: false, y: 30, z: -38, vertical: true },
    { text: "NINGBO", sub: "CN · age 3 → 18", color: T, left: true, y: 20, z: -48 },
    { text: "SEATTLE", sub: "US · 2020 → 2024", color: Y, left: false, y: 14, z: -70 },
    { text: "BERKELEY", sub: "SF BAY · 2024 → 2025", color: T, left: true, y: 24, z: -92 },
    { text: "NEW YORK", sub: "NYC · 2025 → 26", color: M, left: false, y: 17, z: -114 },
    { text: "上海", color: Y, left: true, y: 30, z: -126, vertical: true },
    { text: "SHANGHAI", sub: "CN · from Oct 2026", color: Y, left: false, y: 21, z: -138 },
  ];
  const signMeshes = [];
  signs.forEach((s) => {
    const side = s.left ? 1 : -1;
    const w = s.vertical ? 3 : 10, h = s.vertical ? 12 : 3.1;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: signTexture(s.text, s.color, s.vertical, s.sub), toneMapped: false, side: THREE.DoubleSide })
    );
    // blade signs sticking out from the building faces, angled toward the camera
    m.position.set(side * -(AVENUE - (s.vertical ? 0.4 : 3.5)), s.y, s.z);
    m.rotation.y = side * (s.vertical ? Math.PI / 2 : 0.6);
    m.userData.phase = rand() * 10;
    scene.add(m);
    signMeshes.push(m);
    const pl = new THREE.PointLight(new THREE.Color(s.color), 16, 26, 2);
    pl.position.set(m.position.x + side * 3, s.y - 2, s.z);
    scene.add(pl);
  });

  // ---- rain ----
  const RAIN = isSmall ? 2500 : 6000;
  const rainPos = new Float32Array(RAIN * 6);
  const rainSpeed = new Float32Array(RAIN);
  for (let i = 0; i < RAIN; i++) {
    const x = (rand() - 0.5) * 120, y = rand() * 80, z = 30 - rand() * 160;
    rainPos.set([x, y, z, x + 0.05, y - 1.2, z], i * 6);
    rainSpeed[i] = 0.9 + rand() * 0.8;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xb9d6dc, transparent: true, opacity: 0.14 }));
  scene.add(rain);

  // ---- the traveller: a glowing paper plane weaving down the avenue ----
  const plane = makePaperPlane(0x7fe8e2);
  plane.scale.setScalar(1.6);
  const planeLight = new THREE.PointLight(0x9ff3ee, 12, 18, 2);
  plane.add(planeLight);
  scene.add(plane);
  const trail = makeTrail(60, 0x58d3cf);
  scene.add(trail);
  const prevPos = new THREE.Vector3();

  // ---- bloom (kept gentle) ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.5, 0.35);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / innerWidth - 0.5;
    mouse.ty = e.clientY / innerHeight - 0.5;
  });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  const clock = new THREE.Clock();
  const LOOP = 150;
  let lastTravel = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    const travel = reduceMotion ? 0 : (t * 3.2) % LOOP;
    const looped = travel < lastTravel;
    lastTravel = travel;
    camera.position.set(mouse.x * 6, 16 + Math.sin(t * 0.3) * 0.8 - mouse.y * 3, 46 - travel);
    camera.lookAt(mouse.x * 14, 18 - mouse.y * 6, camera.position.z - 70);
    const camZ = camera.position.z;

    const p = rainGeo.attributes.position.array;
    for (let i = 0; i < RAIN; i++) {
      const o = i * 6;
      const dy = rainSpeed[i] * dt * 45;
      p[o + 1] -= dy; p[o + 4] -= dy;
      if (p[o + 4] < 0) { p[o + 1] += 80; p[o + 4] += 80; }
      if (p[o + 2] > camZ + 10) { p[o + 2] -= 160; p[o + 5] -= 160; }
      else if (p[o + 2] < camZ - 150) { p[o + 2] += 160; p[o + 5] += 160; }
    }
    rainGeo.attributes.position.needsUpdate = true;

    lightMat.opacity = Math.sin(t * 2.4) > 0.2 ? 0.9 : 0.15;

    // gentle neon flicker
    signMeshes.forEach((m) => {
      const f = Math.sin(t * 13 + m.userData.phase) + Math.sin(t * 3.1 + m.userData.phase * 2);
      m.material.color.setScalar(f > 1.9 ? 0.55 : 0.92);
    });

    // paper plane drifts ahead of the camera on a lazy figure-eight
    prevPos.copy(plane.position);
    plane.position.set(
      Math.sin(t * 0.35) * 9,
      21 + Math.sin(t * 0.7) * 2.5,
      camZ - 32 + Math.sin(t * 0.35 * 2) * 5
    );
    if (looped) { trail.userData.reset(); prevPos.copy(plane.position).add(new THREE.Vector3(0, 0, 1)); }
    plane.lookAt(prevPos);                       // +Z faces backwards, so the nose (-Z) faces forward
    plane.rotateZ(-Math.cos(t * 0.35) * 0.45);    // bank into the turns
    trail.userData.push(plane.position);

    composer.render();
  }

  renderer.setAnimationLoop(() => { if (visible) frame(); });
  // repaint signs once web fonts are ready
  document.fonts?.ready.then(() => signMeshes.forEach((m, i) => {
    const s = signs[i];
    m.material.map = signTexture(s.text, s.color, s.vertical, s.sub);
    m.material.needsUpdate = true;
  }));
}
