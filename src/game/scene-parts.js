export const CAT_POSITIONS = [
  [-2.15, 0.62, 0.92],
  [0.05, 0.68, -1.55],
  [2.18, 0.62, 0.9],
  [-1.78, 0.64, -0.85],
  [1.76, 0.64, -0.82]
];

export function makeMaterial(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.56,
    metalness: options.metalness ?? 0.015,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1
  });
}

export function findCatId(object) {
  let current = object;
  while (current) {
    if (current.userData?.catId) return current.userData.catId;
    current = current.parent;
  }
  return null;
}

function markMeshes(group, catId, hitMeshes) {
  group.traverse((child) => {
    if (!child.isMesh) return;
    child.userData.catId = catId;
    child.castShadow = true;
    child.receiveShadow = true;
    hitMeshes.push(child);
  });
}

function makeEye(THREE, darkMaterial, highlightMaterial, x) {
  const group = new THREE.Group();
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), darkMaterial);
  eye.scale.set(0.82, 1.18, 0.58);
  group.add(eye);
  const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), highlightMaterial);
  highlight.position.set(-0.012, 0.024, 0.042);
  group.add(highlight);
  group.position.set(x, 1.04, 0.405);
  return group;
}

export function createCatMesh(THREE, cat, hitMeshes) {
  const group = new THREE.Group();
  group.name = `cat-${cat.id}`;
  group.userData.catId = cat.id;

  const bodyMaterial = makeMaterial(THREE, cat.body, { roughness: 0.66 });
  const accentMaterial = makeMaterial(THREE, cat.accent, { roughness: 0.54 });
  const darkMaterial = makeMaterial(THREE, cat.dark, { roughness: 0.48 });
  const creamMaterial = makeMaterial(THREE, 0xfff1da, { roughness: 0.72 });
  const whiteMaterial = makeMaterial(THREE, 0xffffff, { roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.08 });
  const blushMaterial = makeMaterial(THREE, 0xff8c9e, { roughness: 0.7 });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.56, 36),
    new THREE.MeshBasicMaterial({ color: 0x123e53, transparent: true, opacity: 0.2, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.28, 0.58, 1);
  shadow.position.y = 0.015;
  group.add(shadow);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), bodyMaterial);
  body.scale.set(0.92, 1.14, 0.84);
  body.position.y = 0.45;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), creamMaterial);
  belly.scale.set(0.8, 1.08, 0.42);
  belly.position.set(0, 0.43, 0.34);
  group.add(belly);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 30, 22), bodyMaterial);
  head.scale.set(1.03, 0.92, 0.95);
  head.position.y = 1.02;
  group.add(head);

  const earGeometry = new THREE.ConeGeometry(0.205, 0.4, 3);
  const leftEar = new THREE.Mesh(earGeometry, accentMaterial);
  leftEar.position.set(-0.27, 1.4, 0.015);
  leftEar.rotation.set(0.04, 0, -0.13);
  group.add(leftEar);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.27;
  rightEar.rotation.z = 0.13;
  group.add(rightEar);

  const innerEarGeometry = new THREE.ConeGeometry(0.105, 0.23, 3);
  const leftInnerEar = new THREE.Mesh(innerEarGeometry, blushMaterial);
  leftInnerEar.position.set(-0.27, 1.39, 0.07);
  leftInnerEar.rotation.set(0.04, 0, -0.13);
  leftInnerEar.scale.set(0.78, 0.78, 0.78);
  group.add(leftInnerEar);
  const rightInnerEar = leftInnerEar.clone();
  rightInnerEar.position.x = 0.27;
  rightInnerEar.rotation.z = 0.13;
  group.add(rightInnerEar);

  const muzzleLeft = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 12), creamMaterial);
  muzzleLeft.scale.set(1.03, 0.72, 0.66);
  muzzleLeft.position.set(-0.082, 0.91, 0.41);
  group.add(muzzleLeft);
  const muzzleRight = muzzleLeft.clone();
  muzzleRight.position.x = 0.082;
  group.add(muzzleRight);

  group.add(makeEye(THREE, darkMaterial, whiteMaterial, -0.145));
  group.add(makeEye(THREE, darkMaterial, whiteMaterial, 0.145));

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.07, 3), darkMaterial);
  nose.position.set(0, 0.91, 0.49);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  const cheekGeometry = new THREE.SphereGeometry(0.052, 12, 8);
  const cheekLeft = new THREE.Mesh(cheekGeometry, blushMaterial);
  cheekLeft.scale.set(1.28, 0.62, 0.45);
  cheekLeft.position.set(-0.23, 0.88, 0.4);
  group.add(cheekLeft);
  const cheekRight = cheekLeft.clone();
  cheekRight.position.x = 0.23;
  group.add(cheekRight);

  const footGeometry = new THREE.SphereGeometry(0.155, 16, 12);
  const leftFoot = new THREE.Mesh(footGeometry, bodyMaterial);
  leftFoot.scale.set(1.08, 0.58, 1.22);
  leftFoot.position.set(-0.22, 0.13, 0.2);
  group.add(leftFoot);
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 0.22;
  group.add(rightFoot);

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.34, 0.34, -0.08),
    new THREE.Vector3(0.62, 0.49, -0.02),
    new THREE.Vector3(0.68, 0.83, 0.04),
    new THREE.Vector3(0.5, 1.02, 0.13)
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.075, 9, false), accentMaterial);
  group.add(tail);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.032, 8, 36), darkMaterial);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.72, 0.02);
  collar.scale.set(1, 0.84, 1);
  group.add(collar);

  const pendant = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), accentMaterial);
  pendant.position.set(0, 0.68, 0.34);
  pendant.rotation.z = Math.PI / 4;
  group.add(pendant);

  if (cat.pattern === "forehead") {
    [-0.12, 0, 0.12].forEach((x, index) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.17 - index * 0.02, 0.026), accentMaterial);
      stripe.position.set(x, 1.23, 0.41);
      stripe.rotation.z = x * 0.8;
      group.add(stripe);
    });
  }

  if (cat.pattern === "cheeks") {
    cheekLeft.scale.set(1.55, 0.75, 0.52);
    cheekRight.scale.copy(cheekLeft.scale);
  }

  if (cat.pattern === "tail") {
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), creamMaterial);
    tailTip.position.set(0.49, 1.01, 0.13);
    group.add(tailTip);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.036, 8, 56),
    new THREE.MeshBasicMaterial({ color: cat.accent, transparent: true, opacity: 0, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  group.userData.body = body;
  group.userData.head = head;
  group.userData.tail = tail;
  group.userData.ring = ring;
  group.userData.jumpUntil = 0;
  group.userData.sampledUntil = 0;

  markMeshes(group, cat.id, hitMeshes);
  shadow.userData.catId = undefined;
  const shadowIndex = hitMeshes.indexOf(shadow);
  if (shadowIndex >= 0) hitMeshes.splice(shadowIndex, 1);
  return group;
}

export function createIsland(THREE) {
  const group = new THREE.Group();
  const side = makeMaterial(THREE, 0x58b84f, { roughness: 0.8 });
  const top = makeMaterial(THREE, 0xbfe98c, { roughness: 0.86 });
  const bottom = makeMaterial(THREE, 0x8b6346, { roughness: 0.96 });
  const island = new THREE.Mesh(new THREE.CylinderGeometry(3.72, 4.25, 0.78, 64, 4, false), [side, top, bottom]);
  island.receiveShadow = true;
  island.castShadow = true;
  group.add(island);
  const grassCap = new THREE.Mesh(new THREE.CylinderGeometry(3.67, 3.7, 0.14, 64), top);
  grassCap.position.y = 0.44;
  grassCap.receiveShadow = true;
  group.add(grassCap);
  const path = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.085, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x6fae66, transparent: true, opacity: 0.64 })
  );
  path.rotation.x = Math.PI / 2;
  path.position.y = 0.53;
  group.add(path);
  const hillMaterial = makeMaterial(THREE, 0x95d773, { roughness: 0.88 });
  [[-2.45, 0.42, -0.8, 0.72], [2.5, 0.42, -0.45, 0.9], [-0.5, 0.42, 2.65, 0.62]].forEach(([x, y, z, scale]) => {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 14), hillMaterial);
    hill.scale.set(scale * 1.45, scale * 0.52, scale);
    hill.position.set(x, y, z);
    hill.receiveShadow = true;
    group.add(hill);
  });
  return group;
}

export function createTree(THREE, x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.48, 10), makeMaterial(THREE, 0x81583b));
  trunk.position.y = 0.68;
  group.add(trunk);
  const crownMaterial = makeMaterial(THREE, 0x43bb63, { roughness: 0.86 });
  [[0, 1.02, 0, 0.31], [-0.16, 0.9, 0.03, 0.25], [0.16, 0.9, -0.02, 0.25]].forEach(([cx, cy, cz, radius]) => {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), crownMaterial);
    crown.position.set(cx, cy, cz);
    group.add(crown);
  });
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  return group;
}

export function createHouse(THREE, x, z, color = 0xfff6dc, roof = 0xffd765, scale = 1) {
  const group = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.43, 0.68, 14), makeMaterial(THREE, color));
  wall.position.y = 0.77;
  group.add(wall);
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.65, 12), makeMaterial(THREE, roof));
  roofMesh.position.y = 1.35;
  group.add(roofMesh);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.035), makeMaterial(THREE, 0x2d8ccc));
  door.position.set(0, 0.63, 0.4);
  group.add(door);
  const windowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.075, 18), new THREE.MeshBasicMaterial({ color: 0x9ee5ff }));
  windowMesh.position.set(0.23, 0.92, 0.355);
  group.add(windowMesh);
  group.position.set(x, 0, z);
  group.rotation.y = Math.atan2(x, z) * -0.35;
  group.scale.setScalar(scale);
  return group;
}

export function createBowl(THREE) {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 40),
    new THREE.MeshBasicMaterial({ color: 0x0e3447, transparent: true, opacity: 0.24, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.25, 0.62, 1);
  group.add(shadow);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.78, 0.48, 40, 1, true), makeMaterial(THREE, 0x12384f, { roughness: 0.44 }));
  bowl.position.y = 0.28;
  group.add(bowl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.09, 12, 48), makeMaterial(THREE, 0x072b3e, { roughness: 0.38 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.51;
  group.add(rim);
  const food = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.58, 0.08, 40),
    makeMaterial(THREE, 0xffd44e, { roughness: 0.72, emissive: 0x7a5512, emissiveIntensity: 0.12 })
  );
  food.position.y = 0.49;
  group.add(food);
  const pulse = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.04, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0xffd44e, transparent: true, opacity: 0, depthWrite: false })
  );
  pulse.rotation.x = Math.PI / 2;
  pulse.position.y = 0.05;
  group.add(pulse);
  group.userData.food = food;
  group.userData.pulse = pulse;
  return group;
}

export function createCloud(THREE, x, y, z, scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false });
  [[0, 0, 0, 0.46], [-0.42, -0.03, 0.04, 0.32], [0.4, -0.02, 0.03, 0.35], [0.1, 0.18, -0.02, 0.34]].forEach(([cx, cy, cz, radius]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), material);
    puff.position.set(cx, cy, cz);
    group.add(puff);
  });
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  return group;
}
