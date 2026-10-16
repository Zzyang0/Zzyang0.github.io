// ============================================================
//  A glowing origami paper plane: the traveller in both scenes.
// ============================================================
import * as THREE from "three";

export function makePaperPlane(color = 0x9ff3ee) {
  // nose points toward -Z
  const nose = [0, 0, -1], tl = [-0.62, 0.06, 0.55], tr = [0.62, 0.06, 0.55], c = [0, 0, 0.55], k = [0, -0.26, 0.55];
  const tris = [nose, tl, c, nose, c, tr, nose, c, k, nose, k, c].flat();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
  geo.computeVertexNormals();

  const group = new THREE.Group();
  const paper = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xe8f4f2, emissive: color, emissiveIntensity: 0.35, roughness: 0.6, side: THREE.DoubleSide, flatShading: true,
  }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, toneMapped: false }));
  group.add(paper, edges);
  return group;
}

// a fading line that follows a moving object
export function makeTrail(length = 40, color = 0x4fd6d2) {
  const pos = new Float32Array(length * 3);
  const col = new Float32Array(length * 3);
  const base = new THREE.Color(color);
  for (let i = 0; i < length; i++) {
    const f = 1 - i / length;
    col.set([base.r * f, base.g * f, base.b * f], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, toneMapped: false }));
  line.frustumCulled = false;
  let filled = false;
  line.userData.push = (v) => {
    if (!filled) { for (let i = 0; i < length; i++) pos.set([v.x, v.y, v.z], i * 3); filled = true; }
    pos.copyWithin(3, 0, (length - 1) * 3);
    pos.set([v.x, v.y, v.z], 0);
    geo.attributes.position.needsUpdate = true;
  };
  line.userData.reset = () => { filled = false; };
  return line;
}
