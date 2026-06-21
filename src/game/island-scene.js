import {
  CAT_POSITIONS,
  createBowl,
  createCatMesh,
  createCloud,
  createHouse,
  createIsland,
  createTree,
  findCatId
} from "./scene-parts.js";

export function createIslandScene({
  THREE,
  host,
  getState,
  onSample,
  onLabels,
  onTip
}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xffffff, 0);
  renderer.domElement.setAttribute("aria-label", "可旋转的 3D 音乐岛");
  renderer.domElement.tabIndex = 0;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9edff4, 11, 21);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);

  scene.add(new THREE.HemisphereLight(0xf6fdff, 0x4c9c67, 1.5));
  const sun = new THREE.DirectionalLight(0xfff7e5, 1.95);
  sun.position.set(-4.5, 8, 5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x77c9ff, 0.58);
  fill.position.set(5, 3, -4);
  scene.add(fill);

  const islandGroup = createIsland(THREE);
  islandGroup.rotation.y = 0.18;
  scene.add(islandGroup);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 5.8, 0.08, 72),
    new THREE.MeshBasicMaterial({ color: 0x2f9ec5, transparent: true, opacity: 0.58, depthWrite: false })
  );
  water.position.y = -0.78;
  scene.add(water);

  const waterRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.65, 0.1, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xe2fbff, transparent: true, opacity: 0.52, depthWrite: false })
  );
  waterRing.rotation.x = Math.PI / 2;
  waterRing.position.y = -0.67;
  scene.add(waterRing);

  [[-2.75, -2, 0.82], [-2.05, 2.1, 0.9], [2.7, -1.6, 0.88], [2.45, 2.15, 0.72], [0.65, -2.75, 0.62]]
    .forEach(([x, z, scale]) => islandGroup.add(createTree(THREE, x, z, scale)));
  islandGroup.add(createHouse(THREE, 0, -0.7, 0xfff1bd, 0xffb848, 1.04));
  islandGroup.add(createHouse(THREE, -2.75, 1.05, 0xd7efff, 0x4dafe8, 0.72));
  islandGroup.add(createHouse(THREE, 2.72, 1.1, 0xffdec1, 0xf08a4b, 0.72));

  const clouds = [
    createCloud(THREE, -5.5, 4.2, -2.5, 1.2),
    createCloud(THREE, 5.3, 3.3, -3.5, 1.45),
    createCloud(THREE, -4, 2.1, 2.2, 0.88),
    createCloud(THREE, 4.4, 5, 0.5, 0.75)
  ];
  clouds.forEach((cloud, index) => {
    cloud.userData.seed = index * 1.7;
    scene.add(cloud);
  });

  const bowl = createBowl(THREE);
  scene.add(bowl);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hitMeshes = [];
  const catEntries = new Map();
  const particles = [];
  const clock = new THREE.Clock();
  const temp = new THREE.Vector3();
  const bowlScreen = new THREE.Vector2();
  const pointerState = {
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startRotation: 0,
    catId: null,
    moved: false
  };

  let animationFrame = 0;
  let destroyed = false;
  let bowlPulseUntil = 0;
  let celebrateUntil = 0;
  let feeding = null;
  let userRotatedAt = 0;

  const clearCats = () => {
    catEntries.forEach((entry) => {
      if (entry.group.parent) entry.group.parent.remove(entry.group);
    });
    catEntries.clear();
    hitMeshes.splice(0, hitMeshes.length);
  };

  const rebuildCats = (cats) => {
    clearCats();
    cats.forEach((cat, index) => {
      const group = createCatMesh(THREE, cat, hitMeshes);
      const [x, y, z] = CAT_POSITIONS[index] || [Math.cos(index) * 2.2, 0.62, Math.sin(index) * 2.2];
      group.position.set(x, y, z);
      group.rotation.y = Math.atan2(-x, -z) * 0.32;
      group.scale.setScalar(1.08);
      group.userData.homePosition = group.position.clone();
      group.userData.homeRotation = group.rotation.clone();
      group.userData.homeScale = 1.08;
      group.userData.seed = index * 1.3 + cat.id.length;
      group.userData.rejectUntil = 0;
      islandGroup.add(group);
      catEntries.set(cat.id, { cat, group });
    });
  };

  const updatePointer = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  };

  const pickCat = (event) => {
    updatePointer(event);
    const hit = raycaster.intersectObjects(hitMeshes, false)[0];
    return hit ? findCatId(hit.object) : null;
  };

  const getBowlScreen = () => {
    bowl.getWorldPosition(temp);
    temp.y += 0.45;
    temp.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    bowlScreen.set(
      rect.left + (temp.x * 0.5 + 0.5) * rect.width,
      rect.top + (-temp.y * 0.5 + 0.5) * rect.height
    );
    return bowlScreen;
  };

  const burst = (origin, color, count = 28) => {
    for (let index = 0; index < count; index += 1) {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.055 + Math.random() * 0.035, 0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false })
      );
      mesh.position.copy(origin);
      mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 2.8, 1.1 + Math.random() * 2.2, (Math.random() - 0.5) * 2.8);
      mesh.userData.life = 0.8 + Math.random() * 0.55;
      scene.add(mesh);
      particles.push(mesh);
    }
  };

  const clearPointer = () => {
    pointerState.active = false;
    pointerState.pointerId = -1;
    pointerState.catId = null;
    pointerState.moved = false;
  };

  const onPointerDown = (event) => {
    const state = getState();
    if ((event.button !== undefined && event.button !== 0) || !state.started || state.phase === "reward" || state.phase === "feeding") return;
    pointerState.active = true;
    pointerState.pointerId = event.pointerId;
    pointerState.startX = event.clientX;
    pointerState.startY = event.clientY;
    pointerState.startRotation = islandGroup.rotation.y;
    pointerState.catId = pickCat(event);
    pointerState.moved = false;
    renderer.domElement.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!pointerState.active || pointerState.pointerId !== event.pointerId) return;
    const dx = event.clientX - pointerState.startX;
    const dy = event.clientY - pointerState.startY;
    const distance = Math.hypot(dx, dy);
    if (distance <= 7) return;
    pointerState.moved = true;
    userRotatedAt = performance.now();
    islandGroup.rotation.y = pointerState.startRotation + dx * 0.0095;
    islandGroup.rotation.x = THREE.MathUtils.clamp(-dy * 0.0014, -0.065, 0.065);
  };

  const onPointerUp = async (event) => {
    if (!pointerState.active || pointerState.pointerId !== event.pointerId) return;
    try { renderer.domElement.releasePointerCapture?.(event.pointerId); } catch {}
    const catId = pointerState.catId;
    const shouldSample = Boolean(catId && !pointerState.moved);
    clearPointer();
    if (shouldSample) await onSample(catId);
  };

  const onPointerCancel = () => clearPointer();

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const portrait = camera.aspect < 0.78;
    camera.fov = portrait ? 43 : 38;
    camera.position.set(0, portrait ? 6.65 : 5.55, portrait ? 11.55 : 9.45);
    camera.lookAt(0, portrait ? 0.38 : 0.45, 0);
    camera.updateProjectionMatrix();
    islandGroup.scale.setScalar(portrait ? 0.96 : 1.08);
    islandGroup.position.y = portrait ? 0.28 : 0.1;
    bowl.position.set(0, portrait ? 0.1 : 0.18, portrait ? 3.1 : 3.2);
    bowl.scale.setScalar(portrait ? 0.9 : 0.94);
  };

  const updateLabels = () => {
    const rect = renderer.domElement.getBoundingClientRect();
    const state = getState();
    const labels = [];
    catEntries.forEach((entry, id) => {
      if (!entry.group.visible || feeding?.entry === entry) return;
      entry.group.getWorldPosition(temp);
      const front = temp.z > -1.45;
      temp.y += 1.42;
      temp.project(camera);
      const visible = front && temp.z > -1 && temp.z < 1 && Math.abs(temp.x) < 1.12 && temp.y > -1.12 && temp.y < 1.14;
      labels.push({
        id,
        name: entry.cat.name,
        x: (temp.x * 0.5 + 0.5) * rect.width,
        y: (-temp.y * 0.5 + 0.5) * rect.height,
        depth: temp.z,
        visible,
        sampled: state.sampledIds.includes(id),
        selected: state.selectedCatId === id
      });
    });
    onLabels(labels);
  };

  const animateParticles = (delta) => {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.userData.life -= delta;
      particle.userData.velocity.y -= delta * 3.4;
      particle.position.addScaledVector(particle.userData.velocity, delta);
      particle.rotation.x += delta * 5;
      particle.rotation.y += delta * 4;
      particle.material.opacity = Math.max(0, particle.userData.life);
      if (particle.userData.life <= 0) {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        particles.splice(index, 1);
      }
    }
  };

  const updateFeeding = (now) => {
    if (!feeding) return;
    const t = THREE.MathUtils.clamp((now - feeding.start) / feeding.duration, 0, 1);
    feeding.entry.group.position.lerpVectors(feeding.from, feeding.to, t);
    feeding.entry.group.position.y += Math.sin(Math.PI * t) * 1.45;
    feeding.entry.group.rotation.y += 0.18;
    feeding.entry.group.rotation.z = Math.sin(Math.PI * t) * -0.24;
    feeding.entry.group.scale.setScalar(THREE.MathUtils.lerp(feeding.startScale, 0.62, t));
    if (t < 1) return;
    const { entry, resolve, color } = feeding;
    entry.group.visible = false;
    bowl.getWorldPosition(temp);
    burst(temp.add(new THREE.Vector3(0, 0.75, 0)), color, 38);
    celebrateUntil = now + 1400;
    feeding = null;
    resolve(true);
  };

  const animate = () => {
    if (destroyed) return;
    const delta = Math.min(0.04, clock.getDelta());
    const now = performance.now();
    const state = getState();

    if (!pointerState.active && !feeding && now - userRotatedAt > 1600) {
      islandGroup.rotation.y += delta * 0.012;
      islandGroup.rotation.x *= 0.94;
    }

    catEntries.forEach((entry) => {
      const group = entry.group;
      if (!group.visible || feeding?.entry === entry) return;
      const seed = group.userData.seed;
      const jumpLeft = Math.max(0, (group.userData.jumpUntil - now) / 520);
      const rejectLeft = Math.max(0, (group.userData.rejectUntil - now) / 620);
      const shake = rejectLeft ? Math.sin((1 - rejectLeft) * Math.PI * 9) * rejectLeft * 0.13 : 0;
      group.position.x = group.userData.homePosition.x + shake;
      group.position.y = group.userData.homePosition.y + Math.sin(now / 620 + seed) * 0.035 + Math.sin(jumpLeft * Math.PI) * 0.26;
      group.position.z = group.userData.homePosition.z;
      group.scale.setScalar(group.userData.homeScale * (1 + Math.sin(jumpLeft * Math.PI) * 0.08));
      group.userData.head.rotation.z = Math.sin(now / 900 + seed) * 0.035;
      group.userData.tail.rotation.y = Math.sin(now / 420 + seed) * 0.16;
      const sampledLeft = Math.max(0, (group.userData.sampledUntil - now) / 1200);
      const selected = state.selectedCatId === entry.cat.id;
      group.userData.ring.material.opacity = selected ? 0.68 + Math.sin(now / 180) * 0.12 : sampledLeft * 0.34;
      group.userData.ring.scale.setScalar(1 + (selected ? Math.sin(now / 210) * 0.08 : (1 - sampledLeft) * 0.18));
    });

    updateFeeding(now);

    const bowlLeft = Math.max(0, (bowlPulseUntil - now) / 1450);
    bowl.userData.pulse.material.opacity = bowlLeft * (0.44 + Math.sin(now / 120) * 0.12);
    bowl.userData.pulse.scale.setScalar(1 + (1 - bowlLeft) * 1.2);
    bowl.userData.food.position.y = 0.49 + Math.sin(now / 320) * 0.012 + bowlLeft * 0.05;

    const celebrate = Math.max(0, (celebrateUntil - now) / 1400);
    const baseScale = camera.aspect < 0.78 ? 0.9 : 0.94;
    if (celebrate) {
      bowl.rotation.y += delta * 0.9;
      bowl.scale.setScalar(baseScale * (1 + Math.sin(celebrate * Math.PI) * 0.1));
    } else {
      bowl.rotation.y *= 0.9;
      bowl.scale.lerp(temp.set(baseScale, baseScale, baseScale), 0.12);
    }

    waterRing.rotation.z += delta * 0.025;
    waterRing.material.opacity = 0.45 + Math.sin(now / 1000) * 0.08;
    clouds.forEach((cloud) => {
      cloud.position.x += Math.sin(now / 2200 + cloud.userData.seed) * delta * 0.055;
      cloud.position.y += Math.cos(now / 1800 + cloud.userData.seed) * delta * 0.025;
    });

    animateParticles(delta);
    updateLabels();
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("resize", resize);
  resize();
  animationFrame = requestAnimationFrame(animate);

  return {
    rebuildCats,
    restoreCats() {
      feeding = null;
      catEntries.forEach((entry) => {
        if (entry.group.parent !== islandGroup) islandGroup.attach(entry.group);
        entry.group.position.copy(entry.group.userData.homePosition);
        entry.group.rotation.copy(entry.group.userData.homeRotation);
        entry.group.scale.setScalar(entry.group.userData.homeScale);
        entry.group.visible = true;
      });
    },
    pulseBowl() {
      bowlPulseUntil = performance.now() + 1450;
    },
    selectCat(catId) {
      const entry = catEntries.get(catId);
      if (!entry) return;
      const now = performance.now();
      entry.group.userData.jumpUntil = now + 520;
      entry.group.userData.sampledUntil = now + 1200;
      entry.group.userData.ring.material.color.set(0xffc947);
    },
    rejectCat(catId) {
      const entry = catEntries.get(catId);
      if (!entry) return;
      entry.group.userData.rejectUntil = performance.now() + 620;
      entry.group.userData.ring.material.color.set(0xff5c62);
      entry.group.userData.ring.material.opacity = 0.72;
    },
    feedCat(catId, color) {
      const entry = catEntries.get(catId);
      if (!entry || feeding) return Promise.resolve(false);
      entry.group.getWorldPosition(temp);
      const from = temp.clone();
      scene.attach(entry.group);
      bowl.getWorldPosition(temp);
      const to = temp.clone().add(new THREE.Vector3(0, 0.65, 0));
      return new Promise((resolve) => {
        feeding = {
          entry,
          from,
          to,
          start: performance.now(),
          duration: 680,
          startScale: entry.group.scale.x,
          color,
          resolve
        };
      });
    },
    getScreenTargets() {
      const rect = renderer.domElement.getBoundingClientRect();
      const targets = {};
      catEntries.forEach((entry, id) => {
        entry.group.getWorldPosition(temp);
        temp.y += 0.8;
        temp.project(camera);
        targets[id] = {
          x: rect.left + (temp.x * 0.5 + 0.5) * rect.width,
          y: rect.top + (-temp.y * 0.5 + 0.5) * rect.height
        };
      });
      const target = getBowlScreen();
      targets.bowl = { x: target.x, y: target.y };
      return targets;
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerCancel);
      renderer.dispose();
      particles.forEach((particle) => {
        particle.geometry.dispose();
        particle.material.dispose();
      });
      host.innerHTML = "";
      onLabels([]);
    }
  };
}
