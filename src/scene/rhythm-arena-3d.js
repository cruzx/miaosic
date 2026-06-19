import * as THREE from "three";

const STYLE_ID = "miaosic-rhythm-arena-3d-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miao-rhythm-3d {
      position: absolute;
      inset: 0;
      z-index: 63;
      pointer-events: none;
      opacity: 0;
      transform: scale(1.02);
      transition: opacity 180ms ease, transform 220ms ease;
    }
    .page.brawl-play .miao-rhythm-3d { opacity: 1; transform: scale(1); }
    .miao-rhythm-3d canvas { width: 100% !important; height: 100% !important; display: block; }
  `;
  document.head.appendChild(style);
}

function makeMat(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.52,
    metalness: options.metalness ?? 0.03,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1
  });
}

function makeBox(width, height, depth, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 2, 1, 2), makeMat(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeDisc(radius, color, opacity = 1) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function createFighter({ color, x, z }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const shadow = makeDisc(38, 0x4aa6b8, 0.18);
  shadow.position.y = 2;
  shadow.scale.set(1.2, 0.62, 1);
  group.add(shadow);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(24, 34, 8, 18), makeMat(color, { roughness: 0.42 }));
  body.position.y = 42;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(28, 24, 18), makeMat(color, { roughness: 0.42 }));
  head.position.y = 82;
  head.scale.set(1.05, 0.92, 1);
  head.castShadow = true;
  group.add(head);

  const face = new THREE.Mesh(new THREE.BoxGeometry(22, 6, 6), makeMat(0x17334a));
  face.position.set(0, 83, 24);
  group.add(face);

  const weapon = new THREE.Mesh(new THREE.BoxGeometry(78, 12, 13), makeMat(0xb78cff, { emissive: 0x8a6cff, emissiveIntensity: 0.16 }));
  weapon.position.set(18, 50, 30);
  weapon.rotation.set(0, 0.2, -0.48);
  weapon.castShadow = true;
  group.add(weapon);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(48, 3.5, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x7ed957, transparent: true, opacity: 0.72 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 6;
  group.add(ring);

  return group;
}

function createLane(index, color) {
  const group = new THREE.Group();
  const x = (index - 1.5) * 92;

  const lane = new THREE.Mesh(
    new THREE.BoxGeometry(72, 4, 720),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.02,
      emissive: color,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.78
    })
  );
  lane.position.set(x, 5, 30);
  lane.receiveShadow = true;
  group.add(lane);

  const railMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 });
  const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 720), railMat);
  sideLeft.position.set(x - 38, 11, 30);
  group.add(sideLeft);

  const sideRight = sideLeft.clone();
  sideRight.position.x = x + 38;
  group.add(sideRight);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(36, 42, 14, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.03, emissive: color, emissiveIntensity: 0.16 })
  );
  pad.position.set(x, 16, 260);
  pad.castShadow = true;
  pad.receiveShadow = true;
  group.add(pad);

  const padRing = new THREE.Mesh(new THREE.TorusGeometry(44, 4, 8, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 }));
  padRing.rotation.x = Math.PI / 2;
  padRing.position.set(x, 25, 260);
  group.add(padRing);

  group.userData = { x, color, pad, padRing };
  return group;
}

function createFlyingNote(lane, color, seed) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(22, 1),
    new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.04, emissive: color, emissiveIntensity: 0.22 })
  );
  core.castShadow = true;
  group.add(core);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(30, 3.4, 8, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.64 }));
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.userData = { lane, color, seed, speed: 0.8 + (seed % 5) * 0.08 };
  return group;
}

function makeShockwave(color) {
  const wave = new THREE.Mesh(
    new THREE.TorusGeometry(32, 4, 8, 96),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88, depthWrite: false })
  );
  wave.rotation.x = Math.PI / 2;
  wave.userData.life = 1;
  return wave;
}

export function mountRhythmArena3D() {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = document.createElement("div");
  root.className = "miao-rhythm-3d";
  page.appendChild(root);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 2600);
  camera.position.set(0, 560, 650);
  camera.lookAt(0, 0, 60);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbe7c5, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 3.6);
  key.position.set(-240, 560, 360);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -480;
  key.shadow.camera.right = 480;
  key.shadow.camera.top = 520;
  key.shadow.camera.bottom = -520;
  scene.add(key);

  const arena = new THREE.Group();
  scene.add(arena);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(920, 24, 820),
    makeMat(0xdff7ff, { roughness: 0.58 })
  );
  floor.position.y = -12;
  floor.receiveShadow = true;
  arena.add(floor);

  const lawn = new THREE.Mesh(
    new THREE.BoxGeometry(980, 10, 880),
    makeMat(0xeafbd6, { roughness: 0.72 })
  );
  lawn.position.y = -24;
  lawn.receiveShadow = true;
  arena.add(lawn);

  const gridMat = new THREE.MeshBasicMaterial({ color: 0x49b8ff, transparent: true, opacity: 0.16 });
  for (let i = -5; i <= 5; i += 1) {
    const lineX = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 820), gridMat);
    lineX.position.set(i * 84, 2, 0);
    arena.add(lineX);
    const lineZ = new THREE.Mesh(new THREE.BoxGeometry(920, 2, 4), gridMat);
    lineZ.position.set(0, 3, i * 76);
    arena.add(lineZ);
  }

  const laneColors = [0x49b8ff, 0x7ed957, 0xffd447, 0xb78cff];
  const lanes = laneColors.map((color, index) => {
    const lane = createLane(index, color);
    arena.add(lane);
    return lane;
  });

  const walls = [
    [-290, -210], [-214, -210], [214, -210], [290, -210],
    [-290, 80], [290, 80], [-72, -40], [72, -40],
    [-370, 210], [370, 210]
  ].map(([x, z], index) => {
    const wall = makeBox(66, 62, 66, index % 2 ? 0xffffff : 0xfff0a6);
    wall.position.set(x, 26, z);
    arena.add(wall);
    return wall;
  });

  const bushes = [
    [-360, -120], [-320, -96], [340, -116], [300, -88], [-160, 170], [180, 168]
  ].map(([x, z]) => {
    const bush = new THREE.Mesh(
      new THREE.DodecahedronGeometry(42, 0),
      makeMat(0x7ed957, { roughness: 0.84 })
    );
    bush.position.set(x, 32, z);
    bush.scale.set(1.2, 0.68, 1.05);
    bush.castShadow = true;
    arena.add(bush);
    return bush;
  });

  const centerPool = new THREE.Mesh(
    new THREE.CylinderGeometry(78, 92, 10, 48),
    makeMat(0x49b8ff, { roughness: 0.28, metalness: 0.02, emissive: 0x49b8ff, emissiveIntensity: 0.18 })
  );
  centerPool.position.set(0, 8, 24);
  centerPool.receiveShadow = true;
  arena.add(centerPool);

  const noteSign = new THREE.Mesh(
    new THREE.TorusGeometry(112, 4, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.76 })
  );
  noteSign.rotation.x = Math.PI / 2;
  noteSign.position.set(0, 18, 24);
  arena.add(noteSign);

  const fighters = [
    createFighter({ color: 0xffb45c, x: 0, z: 154 }),
    createFighter({ color: 0xbfefff, x: -250, z: -60 }),
    createFighter({ color: 0xffffff, x: 230, z: -84 }),
    createFighter({ color: 0xb78cff, x: 330, z: 120 })
  ];
  fighters.forEach((fighter) => arena.add(fighter));

  const notes = [];
  for (let i = 0; i < 18; i += 1) {
    const lane = i % 4;
    const note = createFlyingNote(lane, laneColors[lane], i);
    note.position.set(lanes[lane].userData.x, 54, -420 - i * 85);
    arena.add(note);
    notes.push(note);
  }

  const shockwaves = [];
  let shake = 0;

  const onJudge = (event) => {
    const { result = "good", lane = 1 } = event.detail || {};
    const laneIndex = Math.max(0, Math.min(3, Number(lane) || 0));
    const color = result === "miss" || result === "bad" ? 0xff6d7a : result === "super" ? 0xffd447 : laneColors[laneIndex];
    const wave = makeShockwave(color);
    wave.position.set(lanes[laneIndex].userData.x, 29, 260);
    arena.add(wave);
    shockwaves.push(wave);
    shake = result === "perfect" ? 1.2 : result === "super" ? 3.2 : 0.55;

    const pad = lanes[laneIndex].userData.pad;
    pad.scale.set(1.18, 0.82, 1.18);
    window.setTimeout(() => pad.scale.set(1, 1, 1), 120);
  };
  window.addEventListener("miaosic:rhythm-judge", onJudge);

  const resize = () => {
    const rect = root.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize);
  resize();

  let rafId = 0;
  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, clock.getDelta());
    const active = page.classList.contains("brawl-play");

    arena.rotation.y = Math.sin(t * 0.24) * 0.018;
    centerPool.rotation.y += dt * 0.65;
    centerPool.scale.setScalar(1 + Math.sin(t * 2.4) * 0.035);
    noteSign.rotation.z += dt * 0.9;

    fighters.forEach((fighter, index) => {
      fighter.position.y = Math.sin(t * 3.2 + index) * 3;
      fighter.rotation.y = Math.sin(t * 1.1 + index) * 0.12;
    });

    notes.forEach((note) => {
      const speed = active ? 182 * note.userData.speed : 64;
      note.position.z += dt * speed;
      note.rotation.x += dt * 2.4;
      note.rotation.y += dt * 3.2;
      note.position.y = 58 + Math.sin(t * 4 + note.userData.seed) * 7;
      if (note.position.z > 310) note.position.z = -520 - note.userData.seed * 55;
    });

    shockwaves.forEach((wave, index) => {
      wave.userData.life -= dt * 1.9;
      const progress = 1 - Math.max(0, wave.userData.life);
      wave.scale.setScalar(1 + progress * 4.2);
      wave.material.opacity = Math.max(0, wave.userData.life);
      if (wave.userData.life <= 0) {
        arena.remove(wave);
        wave.geometry.dispose();
        wave.material.dispose();
        shockwaves.splice(index, 1);
      }
    });

    if (shake > 0) {
      shake *= Math.pow(0.04, dt);
      camera.position.x = Math.sin(t * 74) * shake;
      camera.position.y = 560 + Math.cos(t * 67) * shake;
    } else {
      camera.position.x *= 0.86;
      camera.position.y += (560 - camera.position.y) * 0.12;
    }
    camera.lookAt(0, 0, 60);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  };
  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("miaosic:rhythm-judge", onJudge);
    root.remove();
    renderer.dispose();
  };
}
