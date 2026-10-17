// ============================================================
//  Footprints: the world as a database. A dotted 3D globe with a
//  data pillar on every city I've lived in (height = years stayed),
//  arcs between them in order, and a paper plane flying the route.
// ============================================================
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { makePaperPlane, makeTrail } from "./plane.js";

const R = 5;
const LAND_MAP = "https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-water.png";
const TEAL = 0x7cc7cd, YELLOW = 0xd9c48f, MAGENTA = 0x9d9be0;

function toVec(lat, lng, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function loadLandMask() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 720; c.height = 360;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0, c.width, c.height);
      const data = g.getImageData(0, 0, c.width, c.height).data;
      // in this map water is bright and land is dark
      resolve((lat, lng) => {
        const x = Math.min(c.width - 1, Math.floor(((lng + 180) / 360) * c.width));
        const y = Math.min(c.height - 1, Math.floor(((90 - lat) / 180) * c.height));
        return data[(y * c.width + x) * 4] < 110;
      });
    };
    img.onerror = () => resolve(null);
    img.src = LAND_MAP;
  });
}

// lift arcs off the surface in proportion to the distance travelled
function arcCurve(a, b) {
  const angle = a.angleTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + 0.25 + angle * 2.2);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

export async function initGlobe(canvas, labelsEl, stops, { label, onActive }) {
  const isSmall = innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const startDir = toVec(32, 175, 1);   // open looking at the Pacific: Asia on the left, the US on the right
  camera.position.copy(startDir.multiplyScalar(17));

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.5;
  controls.minDistance = 9;
  controls.maxDistance = 24;
  let lastUser = -1e9;
  controls.addEventListener("start", () => { lastUser = performance.now(); });
  controls.addEventListener("change", () => { if (dragging) lastUser = performance.now(); });
  let dragging = false;
  canvas.addEventListener("pointerdown", () => { dragging = true; });
  addEventListener("pointerup", () => { dragging = false; });

  const world = new THREE.Group();
  scene.add(world);

  // ocean core
  world.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 64, 64), new THREE.MeshBasicMaterial({ color: 0x06141a })));

  // atmosphere glow
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.14, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color(TEAL) } },
      vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * i * 1.4; }",
    })
  );
  scene.add(atmo);

  // graticule: lat/long lines like a table grid wrapped around the planet
  const gridMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.08 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lng = -180; lng <= 180; lng += 4) pts.push(toVec(lat, lng, R * 1.002));
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  for (let lng = -180; lng < 180; lng += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) pts.push(toVec(lat, lng, R * 1.002));
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  // land as a cloud of data points
  const isLand = await loadLandMask();
  if (isLand) {
    const N = isSmall ? 14000 : 26000;
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const lat = Math.asin(y) * (180 / Math.PI);
      const lng = ((((i * golden) * 180) / Math.PI) % 360) - 180;
      if (isLand(lat, lng)) pts.push(toVec(lat, lng, R * 1.004));
    }
    const dots = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.PointsMaterial({ color: 0x8fd0d4, size: 1.8 * Math.min(devicePixelRatio, 2), sizeAttenuation: false, transparent: true, opacity: 0.6 })
    );
    world.add(dots);
  }

  // ---- data pillars ----
  const pins = stops.map((s, i) => {
    const base = toVec(s.lat, s.lng);
    const normal = base.clone().normalize();
    const h = 0.35 + Math.sqrt(s.years) * 0.38;
    const pillarGeo = new THREE.CylinderGeometry(0.045, 0.045, h, 8);
    pillarGeo.translate(0, h / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.85 });
    const pillar = new THREE.Mesh(pillarGeo, mat);
    pillar.position.copy(base);
    pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    world.add(pillar);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: TEAL }));
    cap.position.copy(normal.clone().multiplyScalar(R + h));
    world.add(cap);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.17, 32),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.position.copy(normal.clone().multiplyScalar(R + 0.01));
    ring.lookAt(normal.clone().multiplyScalar(R * 2));
    world.add(ring);

    const el = document.createElement("div");
    el.className = "g-label";
    el.addEventListener("click", () => focus(i));
    labelsEl.appendChild(el);

    // labels of the three close-together East Asia stops fan out so they don't overlap
    const OFFS = { changhua: ["-50%", "70%"], ningbo: ["-112%", "-90%"], shanghai: ["12%", "-140%"] };
    return { base, normal, top: cap.position, mat, cap, ring, el, phase: i * 0.7, off: OFFS[s.id] || ["-50%", "-130%"] };
  });

  // ---- arcs between stops, plus a dashed "back home" link ----
  const route = [];
  for (let i = 0; i < stops.length - 1; i++) route.push({ from: i, to: i + 1, curve: arcCurve(pins[i].base, pins[i + 1].base) });

  route.forEach((seg) => {
    const pts = seg.curve.getPoints(90);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = seg.home
      ? new THREE.Line(geo, new THREE.LineDashedMaterial({ color: MAGENTA, dashSize: 0.15, gapSize: 0.12, transparent: true, opacity: 0.55 }))
      : new THREE.Line(geo, new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.28 }));
    if (seg.home) line.computeLineDistances();
    world.add(line);
    // bright overlay that "draws" as the plane flies
    const glowGeo = geo.clone();
    glowGeo.setDrawRange(0, 0);
    const glow = new THREE.Line(glowGeo, new THREE.LineBasicMaterial({ color: seg.home ? MAGENTA : YELLOW, toneMapped: false }));
    world.add(glow);
    seg.glow = glowGeo;
    seg.count = pts.length;
    seg.duration = 1.6 + seg.curve.getLength() * 0.28;
  });

  // ---- traveller ----
  const plane = makePaperPlane(0x9ff3ee);
  plane.scale.setScalar(0.24);
  scene.add(plane);
  const trail = makeTrail(36, YELLOW);
  scene.add(trail);
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  // tour state: fly a segment, then dwell at its destination
  let seg = 0, u = 0, dwell = 0, active = 0;
  const DWELL = 1.8;
  function setActive(i) {
    active = i;
    pins.forEach((p, k) => {
      const on = k === i;
      p.mat.color.set(on ? YELLOW : TEAL);
      p.cap.material.color.set(on ? YELLOW : TEAL);
      p.ring.material.color.set(on ? YELLOW : TEAL);
      p.el.classList.toggle("active", on);
    });
    onActive?.(i);
  }
  function resetGlows(upto) {
    route.forEach((r, k) => r.glow.setDrawRange(0, k < upto ? r.count : 0));
  }
  function focus(i) {
    // jump the tour so the plane is sitting at stop i
    const k = route.findIndex((r) => r.to === i && !r.home);
    if (k < 0) { seg = 0; u = 0; dwell = DWELL * 2; resetGlows(0); }
    else { seg = k; u = 1; dwell = DWELL * 2.5; resetGlows(k + 1); }
    trail.userData.reset();
    setActive(i);
    focusDir = pins[i].normal.clone();
    lastUser = -1e9;
  }
  let focusDir = null;

  function relabel() {
    pins.forEach((p, i) => { p.el.innerHTML = label(stops[i], i); });
  }
  relabel();
  setActive(0);
  dwell = DWELL;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3(), prev = new THREE.Vector3(), camDir = new THREE.Vector3();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  renderer.setAnimationLoop(() => {
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // advance the tour
    const r = route[seg];
    if (!reduce) {
      if (dwell > 0) {
        dwell -= dt;
        if (dwell <= 0 && u >= 1) { seg = (seg + 1) % route.length; u = 0; if (seg === 0) { resetGlows(0); setActive(0); dwell = DWELL; trail.userData.reset(); } }
      } else {
        u = Math.min(1, u + dt / r.duration);
        r.glow.setDrawRange(0, Math.floor(u * r.count));
        if (u >= 1) { setActive(r.to); dwell = DWELL; }
      }
    }
    const cur = route[seg];
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;  // ease in-out
    const pos = cur.curve.getPoint(e);
    prev.copy(plane.position);
    plane.position.copy(pos);
    plane.up.copy(pos).normalize();
    if (prev.distanceToSquared(pos) > 1e-8) plane.lookAt(prev);
    trail.userData.push(pos);

    // pulse rings
    pins.forEach((p) => {
      const s = 1 + ((t * 0.8 + p.phase) % 1) * 2.2;
      p.ring.scale.setScalar(s);
      p.ring.material.opacity = 1 - (s - 1) / 2.2;
    });

    // camera gently follows the plane unless the visitor is dragging
    if (performance.now() - lastUser > 5000) {
      const target = (focusDir || tmp.copy(pos).normalize()).clone();
      target.y += 0.25;                     // look slightly down on the route
      target.normalize();
      const dist = camera.position.length();
      camDir.copy(camera.position).normalize().lerp(target, focusDir ? 0.05 : 0.012).normalize();
      camera.position.copy(camDir.multiplyScalar(dist));
      if (focusDir && camera.position.clone().normalize().angleTo(target) < 0.02) focusDir = null;
    }
    controls.update();

    // HTML labels follow their pillars and hide on the far side
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const camN = camera.position.clone().normalize();
    pins.forEach((p) => {
      const facing = p.normal.dot(camN);
      tmp.copy(p.top).project(camera);
      p.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(${p.off[0]}, ${p.off[1]})`;
      p.el.classList.toggle("hidden", facing < 0.2);
    });

    renderer.render(scene, camera);
  });

  return { focus, relabel };
}
