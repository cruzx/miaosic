export const CAT_POSITIONS = [
  [-2.35, 0.62, 0.35],
  [0.05, 0.68, -1.9],
  [2.35, 0.62, 0.3],
  [-1.65, 0.64, 1.85],
  [1.72, 0.64, 1.7]
];

export function makeMaterial(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.58,
    metalness: options.metalness ?? 0.02,
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

export function createCatMesh(THREE, cat, hitMeshes) {
  const group = new THREE.Group();
  group.name = `cat-${cat.id}`;
  group.userData.catId = cat.id;

  const bodyMaterial = makeMaterial(THREE, cat.body, { roughness: 0.7 });
  const accentMaterial = makeMaterial(THREE, cat.accent, { roughness: 0.62 });
  const darkMaterial = makeMaterial(THREE, cat.dark, { roughness: 0.56 });
  const creamMaterial = makeMaterial(THREE, 0xfff5db, { roughness: 0.72 });

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshBasicMaterial({ color: 0x214b59, transparent: true, opacity: 0.16, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.2, 0.62, 1);
  shadow.position.y = 0.015;
  group.add(shadow);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 18), bodyMaterial);
  body.scale.set(0.9, 1.16, 0.82);
  body.position.y = 0.43;
  group.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14), creamMaterial);
  chest.scale.set(0.78, 1.2, 0.42);
  chest.position.set(0, 0.43, 0.3);
  group.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.39, 26, 20), bodyMaterial);
  head.scale.set(1.02, 0.92, 0.94);
  head.position.y = 0.95;
  group.add(head);

  const earGeometry = new THREE.ConeGeometry(0.18, 0.34, 3);
  const leftEar = new THREE.Mesh(earGeometry, accentMaterial);
  leftEar.position.set(-0.23, 1.28, 0.01);
  leftEar.rotation.set(0.04, 0, -0.12);
  group.add(leftEar);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.23;
  rightEar.rotation.z = 0.12;
  group.add(rightEar);

  const muzzleLeft = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), creamMaterial);
  muzzleLeft.scale.set(1, 0.72, 0.62);
  muzzleLeft.position.set(-0.075, 0.87, 0.34);
  group.add(muzzleLeft);
  const muzzleRight = muzzleLeft.clone();
  muzzleRight.position.x = 0.075;
  group.add(muzzleRight);

  const eyeGeometry = new THREE.SphereGeometry(0.035, 10, 8);
  const leftEye = new THREE.Mesh(eyeGeometry, darkMaterial);
  leftEye.position.set(-0.13, 1.02, 0.35);
  group.add(leftEye);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.13;
  group.add(rightEye);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.065, 3), darkMaterial);
  nose.position.set(0, 0.88, 0.42);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  const footGeometry = new THREE.SphereGeometry(0.14, 14, 10);
  const leftFoot = new THREE.Mesh(footGeometry, bodyMaterial);
  leftFoot.scale.set(1, 0.58, 1.2);
  leftFoot.position.set(-0.2, 0.13, 0.18);
  group.add(leftFoot);
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 0.2;
  group.add(rightFoot);

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.31, 0.35, -0.08),
    new THREE.Vector3(0.58, 0.48, -0.02),
    new THREE.Vector3(0.62, 0.79, 0.04),
    new THREE.Vector3(0.48, 0.93, 0.12)
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 18, 0.07, 8, false), accentMaterial);
  group.add(tail);

  if (cat.pattern === "forehead") {
    [-0.12, 0, 0.12].forEach((x, index) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15 - index * 0.018, 0.025), accentMaterial);
      stripe.position.set(x, 1.16, 0.355);
      stripe.rotation.z = x * 0.8;
      group.add(stripe);
    });
  }

  if (cat.pattern === "cheeks") {
    const cheekGeometry = new THREE.SphereGeometry(0.055, 10, 8);
    const cheekLeft = new THREE.Mesh(cheekGeometry, accentMaterial);
    cheekLeft.scale.set(1.3, 0.65, 0.45);
    cheekLeft.position.set(-0.22, 0.88, 0.35);
    group.add(cheekLeft);
    const cheekRight = cheekLeft.clone();
    cheekRight.position.x = 0.22;
    group.add(cheekRight);
  }

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.028, 8, 48), new THREE.MeshBasicMaterial({ color: cat.accent, transparent: true, opacity: 0, depthWrite: false }));
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
  const side = makeMaterial(THREE, 0x81c36a, { roughness: 0.84 });
  const top = makeMaterial(THREE, 0xcdeeb2, { roughness: 0.9 });
  const bottom = makeMaterial(THREE, 0xb58d5e, { roughness: 0.96 });
  const island = new THREE.Mesh(new THREE.CylinderGeometry(3.72, 4.25, 0.74, 64, 4, false), [side, top, bottom]);
  island.receiveShadow = true;
  island.castShadow = true;
  group.add(island);
  const grassCap = new THREE.Mesh(new THREE.CylinderGeometry(3.67, 3.7, 0.12, 64), top);
  grassCap.position.y = 0.42;
  grassCap.receiveShadow = true;
  group.add(grassCap);
  const path = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.08, 8, 96), new THREE.MeshBasicMaterial({ color: 0xa4d58b, transparent: true, opacity: 0.7 }));
  path.rotation.x = Math.PI / 2;
  path.position.y = 0.5;
  group.add(path);
  const hillMaterial = makeMaterial(THREE, 0xb9e6a2, { roughness: 0.9 });
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
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.48, 10), makeMaterial(THREE, 0x9a7049));
  trunk.position.y = 0.68;
  group.add(trunk);
  const crownMaterial = makeMaterial(THREE, 0x82cf7a, { roughness: 0.9 });
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
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.035), makeMaterial(THREE, 0x84c8f4));
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
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshBasicMaterial({ color: 0x113b52, transparent: true, opacity: 0.22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.25, 0.62, 1);
  group.add(shadow);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.78, 0.48, 40, 1, true), makeMaterial(THREE, 0x17384d, { roughness: 0.48 }));
  bowl.position.y = 0.28;
  group.add(bowl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.09, 12, 48), makeMaterial(THREE, 0x0f3043, { roughness: 0.4 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.51;
  group.add(rim);
  const food = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 40), makeMaterial(THREE, 0xf2c65e, { roughness: 0.78, emissive: 0x7a5512, emissiveIntensity: 0.05 }));
  food.position.y = 0.49;
  group.add(food);
  const pulse = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.035, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffdf79, transparent: true, opacity: 0, depthWrite: false }));
  pulse.rotation.x = Math.PI / 2;
  pulse.position.y = 0.05;
  group.add(pulse);
  group.userData.food = food;
  group.userData.pulse = pulse;
  return group;
}

export function createCloud(THREE, x, y, z, scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, depthWrite: false });
  [[0, 0, 0, 0.46], [-0.42, -0.03, 0.04, 0.32], [0.4, -0.02, 0.03, 0.35], [0.1, 0.18, -0.02, 0.34]].forEach(([cx, cy, cz, radius]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), material);
    puff.position.set(cx, cy, cz);
    group.add(puff);
  });
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  return group;
}
