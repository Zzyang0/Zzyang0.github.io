// ============================================================
//  Profile: a draggable 3D "access badge" for frank.db
// ============================================================
import * as THREE from "three";

function loadImage(src) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

// draw an image into a box with object-fit: cover
function cover(g, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height);
  const sw = w / r, sh = h / r;
  g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function frontTexture(profile, img) {
  const W = 600, H = 900;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");

  g.fillStyle = "#081015"; g.fillRect(0, 0, W, H);
  // grid backdrop
  g.strokeStyle = "rgba(62,230,224,0.08)"; g.lineWidth = 1;
  for (let x = 0; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

  // header band
  g.fillStyle = "#f4e04d"; g.fillRect(0, 0, W, 86);
  g.fillStyle = "#000"; g.font = "bold 40px Silkscreen, monospace"; g.textBaseline = "middle";
  g.fillText("FRANK.DB", 34, 46);
  g.font = "600 18px 'JetBrains Mono', monospace"; g.textAlign = "right";
  g.fillText("ACCESS // L5", W - 34, 46);
  g.textAlign = "left";

  // photo
  const px = 34, py = 116, pw = W - 68, ph = 450;
  if (img) {
    cover(g, img, px, py, pw, ph);
    // teal duotone wash
    g.globalCompositeOperation = "multiply";
    g.fillStyle = "rgba(90,200,210,0.35)"; g.fillRect(px, py, pw, ph);
    g.globalCompositeOperation = "source-over";
  }
  g.strokeStyle = "#3ee6e0"; g.lineWidth = 3; g.strokeRect(px, py, pw, ph);
  // corner ticks
  g.fillStyle = "#ff3d8b";
  [[px, py], [px + pw - 24, py], [px, py + ph - 6], [px + pw - 24, py + ph - 6]].forEach(([x, y]) => g.fillRect(x, y, 24, 6));

  // name block
  g.fillStyle = "#ffffff"; g.font = "bold 50px Silkscreen, monospace";
  g.fillText(profile.name.toUpperCase(), 34, 618);
  g.fillStyle = "#f4e04d"; g.font = "600 26px 'JetBrains Mono', monospace";
  g.fillText(`AKA ${profile.aka.toUpperCase()}  ·  ${profile.name_zh}`, 34, 668);
  g.fillStyle = "#3ee6e0"; g.font = "400 22px 'JetBrains Mono', monospace";
  g.fillText(profile.role.toUpperCase() + "  //  " + profile.based_in.toUpperCase(), 34, 710);

  // fields
  g.fillStyle = "#6f8a93"; g.font = "400 17px 'JetBrains Mono', monospace";
  g.fillText("UID 0x0528    CLEARANCE: SELECT, INSERT", 34, 752);

  // barcode
  let x = 34;
  let seed = 528;
  while (x < W - 34) {
    seed = (seed * 9301 + 49297) % 233280;
    const w = 2 + (seed % 5);
    g.fillStyle = seed % 3 ? "#cfe0e6" : "transparent";
    g.fillRect(x, 790, w, 70);
    x += w + 2;
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function backTexture(profile) {
  const W = 600, H = 900;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#0a0f12"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#ff3d8b"; g.fillRect(0, 0, W, 10);

  g.fillStyle = "#3ee6e0"; g.font = "400 22px 'JetBrains Mono', monospace";
  const lines = [
    "-- schema: human",
    "CREATE TABLE frank (",
    "  likes      TEXT[] = {",
    "    'new tech',",
    "    'cooking',",
    "    'R&B',",
    "    'travel'",
    "  },",
    "  believes   TEXT =",
    "    'data earns its value",
    "     by serving people',",
    "  status     TEXT = 'open'",
    ");",
  ];
  lines.forEach((l, i) => {
    g.fillStyle = l.startsWith("--") ? "#6f8a93" : i === 1 || i === 12 ? "#ff3d8b" : "#cfe0e6";
    g.fillText(l, 40, 90 + i * 40);
  });

  // pseudo QR block
  let s = 7;
  const size = 14, ox = 40, oy = 650;
  for (let yy = 0; yy < 14; yy++) for (let xx = 0; xx < 14; xx++) {
    s = (s * 16807) % 2147483647;
    if (s % 2) { g.fillStyle = "#f4e04d"; g.fillRect(ox + xx * size, oy + yy * size, size - 1, size - 1); }
  }
  g.fillStyle = "#6f8a93"; g.font = "400 18px 'JetBrains Mono', monospace";
  g.fillText("scan me? nah,", 280, 700);
  g.fillText("just scroll down ↓", 280, 730);
  g.fillText(profile.name_zh + " · 2026", 280, 820);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function initBadge(canvas, profile) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 3 / 4, 0.1, 100);
  camera.position.set(0, 0, 9.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.PointLight(0x3ee6e0, 30, 30); key.position.set(-4, 3, 5); scene.add(key);
  const rim = new THREE.PointLight(0xff3d8b, 30, 30); rim.position.set(4, -3, 3); scene.add(rim);

  await document.fonts?.ready;
  const img = await loadImage(profile.photo);

  const edge = new THREE.MeshStandardMaterial({ color: 0x1a2a30, metalness: 0.8, roughness: 0.3 });
  const front = new THREE.MeshStandardMaterial({ map: frontTexture(profile, img), roughness: 0.35, metalness: 0.1 });
  const back = new THREE.MeshStandardMaterial({ map: backTexture(profile), roughness: 0.4 });
  const card = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.1, 0.06), [edge, edge, edge, edge, front, back]);
  scene.add(card);

  // holographic sheen strip that sweeps across the front
  const sc = document.createElement("canvas");
  sc.width = 256; sc.height = 256;
  const sg = sc.getContext("2d");
  const grad = sg.createLinearGradient(0, 256, 256, 0);
  grad.addColorStop(0.42, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, "rgba(180,255,250,0.22)");
  grad.addColorStop(0.58, "rgba(255,255,255,0)");
  sg.fillStyle = grad; sg.fillRect(0, 0, 256, 256);
  const sheenTex = new THREE.CanvasTexture(sc);
  sheenTex.wrapS = THREE.RepeatWrapping;
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 5.1),
    new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sheen.position.z = 0.032;
  card.add(sheen);

  // drag-to-rotate with inertia
  let dragging = false, lastX = 0, lastY = 0, vx = 0, vy = 0;
  let rotY = -0.25, rotX = 0.05;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    vx = (e.clientX - lastX) * 0.012; vy = (e.clientY - lastY) * 0.008;
    rotY += vx; rotX += vy;
    lastX = e.clientX; lastY = e.clientY;
  });
  const end = () => { dragging = false; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;   // hidden (page view on another page)
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!dragging) {
      vx *= 0.94; vy *= 0.94;
      rotY += vx; rotX += vy;
      // ease back toward a gentle idle sway
      rotX += (0.05 + Math.sin(t * 0.8) * 0.05 - rotX) * 0.03;
      if (Math.abs(vx) < 0.002) {
        const target = Math.round(rotY / Math.PI) * Math.PI + Math.sin(t * 0.6) * 0.25;
        rotY += (target - rotY) * 0.03;
      }
    }
    card.rotation.set(rotX, rotY, 0);
    card.position.y = Math.sin(t * 1.2) * 0.06;
    sheenTex.offset.x = -(t * 0.25) % 1;
    renderer.render(scene, camera);
  });
}
