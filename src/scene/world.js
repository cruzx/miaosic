import { DEFAULT_STAGE_ID, CHORDS, NOTE_NAMES, NOTE_TO_SEMITONE, STAGES } from "../config/stages.js";
import { ASSET_MANIFEST } from "../config/assets.js";
import { createGameState } from "../state/game-state.js";
import { attachDebug } from "../debug/attach-debug.js";
import { createFeedbackControls } from "../systems/feedback.js";
import { createInteractionControls } from "../systems/interaction.js";

export function createGameScene({ container = document.getElementById("scene"), THREE, assets = ASSET_MANIFEST, initialStage = DEFAULT_STAGE_ID } = {}) {
  if (!THREE) throw new Error("createGameScene requires a THREE implementation.");
  if (!container) throw new Error("createGameScene could not find #scene container.");

    const CAT_STARTS = [
      { lat: -0.24, lon: -0.96, speed: 0.42 },
      { lat: 0.2, lon: -0.28, speed: 0.36 },
      { lat: -0.1, lon: 0.56, speed: 0.39 },
      { lat: 0.34, lon: 1.24, speed: 0.34 },
      { lat: -0.36, lon: 1.92, speed: 0.37 }
    ];

    const sceneEl = container || document.getElementById("scene");
    const board = document.getElementById("board");
    const pageEl = document.querySelector(".page");
    const promptEl = document.getElementById("prompt");
    const roundEl = document.getElementById("round");
    const scoreEl = document.getElementById("score");
    const comboMini = document.getElementById("comboMini");
    const comboBurst = document.getElementById("comboBurst");
    const feedback = document.getElementById("feedback");
    const lessonBar = document.getElementById("lessonBar");
    const questRibbon = document.getElementById("questRibbon");
    const questTitle = document.getElementById("questTitle");
    const questText = document.getElementById("questText");
    const coach = document.getElementById("coach");
    const learnedTitle = document.querySelector(".learned-title");
    const learnedList = document.getElementById("learnedList");
    const feedTarget = document.getElementById("feedTarget");
    const mission = document.getElementById("mission");
    const missionEyebrow = document.getElementById("missionEyebrow");
    const missionTitle = document.getElementById("missionTitle");
    const missionText = document.getElementById("missionText");
    const startMission = document.getElementById("startMission");
    const gestureGuide = document.getElementById("gestureGuide");
    const gestureTitle = document.getElementById("gestureTitle");
    const gestureText = document.getElementById("gestureText");
    const listenBtn = document.getElementById("listenBtn");
    const nextBtn = document.getElementById("nextBtn");
    const roundBanner = document.getElementById("roundBanner");
    const toast = document.getElementById("toast");
    const rewardCard = document.getElementById("rewardCard");
    const rewardTitle = document.getElementById("rewardTitle");
    const rewardText = document.getElementById("rewardText");
    const rewardMeta = document.getElementById("rewardMeta");
    const tabButtons = Array.from(document.querySelectorAll("[data-stage]"));

    const world = {
      radius: 320,
      walkX: 205,
      walkZ: 185,
      walkRadius: 232,
      bowlLat: -0.36,
      bowlLon: -0.56,
      bowlPos: new THREE.Vector3(-520, 78, 300)
    };
    const BOWL_SCALE = 1.22;

    const state = createGameState({ THREE, initialStage });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x8fd7ff, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    sceneEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x86d4ff);
    scene.fog = new THREE.Fog(0x86d4ff, 1300, 2300);
    const camera = new THREE.OrthographicCamera(
      -470,
      470,
      560,
      -560,
      -1000,
      2000
    );
    camera.position.set(0, 860, 760);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const dragPlanePoint = new THREE.Vector3();
    const dragPlaneNormal = new THREE.Vector3(0, 1, 0);
    const bowlAnchor = new THREE.Vector3();
    const bowlPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -78);
    const bowlRayPointer = new THREE.Vector2();
    const globeGroup = new THREE.Group();
    globeGroup.position.set(92, -28, -10);
    globeGroup.rotation.set(-0.28, -0.22, 0.01);
    scene.add(globeGroup);

    scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x7fb46a, 2.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.9);
    sun.position.set(-260, 620, 360);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.camera.left = -560;
    sun.shadow.camera.right = 560;
    sun.shadow.camera.top = 560;
    sun.shadow.camera.bottom = -560;
    scene.add(sun);

    const skyGroup = makeSkyBackdrop();
    scene.add(skyGroup);

    const ambientMusicLayer = makeAmbientMusicLayer();
    scene.add(ambientMusicLayer);

    const island = makeGlobe3D();
    globeGroup.add(island);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(world.radius + 15, 44, 28),
      new THREE.MeshBasicMaterial({
        color: 0xf2ffd0,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.BackSide
      })
    );
    atmosphere.renderOrder = 2;
    globeGroup.add(atmosphere);

    const listenPulseRings = Array.from({ length: 3 }, (_, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(world.radius + 24 + index * 16, 2.4, 8, 128),
        new THREE.MeshBasicMaterial({
          color: [0xffd86f, 0xffffff, 0x8fd3ff][index],
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        })
      );
      ring.rotation.set(Math.PI / 2 + index * 0.18, 0, -0.18 + index * 0.2);
      ring.renderOrder = 34 + index;
      ring.userData.seed = index * 0.34;
      globeGroup.add(ring);
      return ring;
    });

    const globeFloatShadow = new THREE.Mesh(
      new THREE.CircleGeometry(330, 64),
      new THREE.MeshBasicMaterial({ color: 0x2a4b63, transparent: true, opacity: 0.14, depthWrite: false })
    );
    globeFloatShadow.scale.set(1.65, 0.3, 1);
    globeFloatShadow.position.set(0, -520, 170);
    globeFloatShadow.renderOrder = 1;
    scene.add(globeFloatShadow);

    const stageGlow = makeStageGlow();
    scene.add(stageGlow);

    const playfieldHalo = makePlayfieldHalo();
    scene.add(playfieldHalo);

    const groundHit = new THREE.Mesh(
      new THREE.SphereGeometry(world.radius + 8, 24, 14),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    groundHit.userData.type = "ground";
    globeGroup.add(groundHit);

    const bowl = makeBowl();
    bowl.scale.set(1.08, 1.08, 1.08);
    bowl.userData.type = "bowl";
    bowl.position.copy(world.bowlPos);
    bowl.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.depthTest = false;
        child.renderOrder = 36;
      }
    });
    bowl.renderOrder = 36;
    scene.add(bowl);

    const feedingDock = makeFeedingDock();
    feedingDock.position.copy(world.bowlPos).add(new THREE.Vector3(0, -20, -18));
    scene.add(feedingDock);

    const bowlPulse = new THREE.Mesh(
      new THREE.RingGeometry(76, 106, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false })
    );
    bowlPulse.geometry.rotateX(-Math.PI / 2);
    bowlPulse.position.copy(world.bowlPos).add(new THREE.Vector3(0, -2, 0));
    scene.add(bowlPulse);

    const bowlHalo = new THREE.Mesh(
      new THREE.CircleGeometry(92, 48),
      new THREE.MeshBasicMaterial({ color: 0xfff2a6, transparent: true, opacity: 0.16, depthWrite: false })
    );
    bowlHalo.geometry.rotateX(-Math.PI / 2);
    bowlHalo.position.copy(world.bowlPos).add(new THREE.Vector3(0, -3, 0));
    scene.add(bowlHalo);

    const bowlHit = new THREE.Mesh(
      new THREE.SphereGeometry(92, 18, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    bowlHit.position.copy(world.bowlPos).add(new THREE.Vector3(0, 34, 0));
    bowlHit.userData.type = "bowl";
    scene.add(bowlHit);

    const bowlLabel = makeSceneLabel("拖到这里");
    bowlLabel.scale.set(210, 96, 1);
    bowlLabel.position.copy(world.bowlPos).add(new THREE.Vector3(0, 132, 0));
    scene.add(bowlLabel);

    const listenPromptLabel = makeSceneLabel("点我听");
    listenPromptLabel.scale.set(184, 82, 1);
    listenPromptLabel.position.copy(world.bowlPos).add(new THREE.Vector3(0, 132, 0));
    scene.add(listenPromptLabel);

    const targetHeardLabel = makeSceneLabel("已听");
    targetHeardLabel.scale.set(150, 70, 1);
    targetHeardLabel.position.copy(world.bowlPos).add(new THREE.Vector3(0, 205, 0));
    targetHeardLabel.material.opacity = 0;
    scene.add(targetHeardLabel);

      const autoReplayLabel = makeSceneLabel("再听");
      autoReplayLabel.scale.set(168, 78, 1);
      autoReplayLabel.position.copy(world.bowlPos).add(new THREE.Vector3(0, 262, 0));
      autoReplayLabel.material.opacity = 0;
      scene.add(autoReplayLabel);

    const bowlCharmGroup = new THREE.Group();
    const bowlCharms = ["♪", "★", "♫", "★", "♪"].map((glyph, index) => {
      const charm = makeSpriteGlyph(glyph, index % 2 ? "#ff8fa2" : "#ffd86f", glyph === "★" ? 54 : 58);
      charm.scale.set(24, 24, 1);
      charm.material.depthTest = false;
      charm.material.opacity = 0;
      charm.renderOrder = 60 + index;
      charm.userData.seed = index * 1.17;
      bowlCharmGroup.add(charm);
      return charm;
    });
    scene.add(bowlCharmGroup);

    const feedMagnet = new THREE.Group();
    feedMagnet.visible = false;
    const feedMagnetRings = [0, 1, 2].map((index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(64 + index * 22, 69 + index * 22, 54),
        new THREE.MeshBasicMaterial({
          color: [0x6fd082, 0xffd86f, 0xffffff][index],
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide
        })
      );
      ring.geometry.rotateX(-Math.PI / 2);
      ring.renderOrder = 61 + index;
      ring.userData.seed = index * 0.72;
      feedMagnet.add(ring);
      return ring;
    });
    const feedMagnetPaws = Array.from({ length: 6 }, (_, index) => {
      const paw = makePawSprite(index % 2 ? "#fff7d8" : "#ffffff");
      paw.scale.set(18, 18, 1);
      paw.material.opacity = 0;
      paw.material.depthTest = false;
      paw.renderOrder = 65 + index;
      paw.userData.seed = index * 1.04;
      feedMagnet.add(paw);
      return paw;
    });
    scene.add(feedMagnet);

    const stageClearLabel = makeSceneLabel("完成一组!");
    stageClearLabel.scale.set(300, 130, 1);
    stageClearLabel.position.set(0, 210, 470);
    stageClearLabel.material.opacity = 0;
    scene.add(stageClearLabel);

    const feedGuide = new THREE.Group();
    feedGuide.visible = false;
    const feedGuideLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({
        color: 0xffd86f,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false
      })
    );
    feedGuideLine.renderOrder = 55;
    feedGuide.add(feedGuideLine);
    const feedGuideArrow = new THREE.Mesh(
      new THREE.ConeGeometry(13, 32, 18),
      new THREE.MeshBasicMaterial({
        color: 0xffd86f,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false
      })
    );
    feedGuideArrow.renderOrder = 56;
    feedGuide.add(feedGuideArrow);
    const feedGuideDots = Array.from({ length: 7 }, (_, index) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(10 + (index % 2) * 3, 14, 9),
        new THREE.MeshBasicMaterial({
          color: index % 2 ? 0x6fd082 : 0xffd86f,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false
        })
      );
      dot.renderOrder = 57 + index;
      dot.userData.seed = index * 0.9;
      feedGuide.add(dot);
      return dot;
    });
    scene.add(feedGuide);

    const soundBridge = new THREE.Group();
    soundBridge.visible = false;
    const soundBridgeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({
        color: 0xfff2a6,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false
      })
    );
    soundBridgeLine.renderOrder = 49;
    soundBridge.add(soundBridgeLine);
    const soundBridgeNotes = Array.from({ length: 9 }, (_, index) => {
      const glyph = ["♪", "♫", "Do", "Mi", "So"][index % 5];
      const note = makeSpriteGlyph(glyph, ["#fff3a3", "#ffffff", "#8fd3ff", "#6fd082"][index % 4], glyph.length > 1 ? 32 : 48);
      note.scale.set(glyph.length > 1 ? 28 : 22, 22, 1);
      note.material.depthTest = false;
      note.material.opacity = 0;
      note.renderOrder = 50 + index;
      note.userData.seed = index * 0.71;
      soundBridge.add(note);
      return note;
    });
    scene.add(soundBridge);

    const searchMoteGroup = new THREE.Group();
    const searchOrbitRings = [0, 1, 2].map((index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(world.radius + 34 + index * 19, 2.2, 8, 128),
        new THREE.MeshBasicMaterial({
          color: [0xffd86f, 0xffffff, 0x8fd3ff][index],
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        })
      );
      ring.rotation.set(Math.PI / 2 + index * 0.34, index * 0.18, -0.38 + index * 0.25);
      ring.renderOrder = 39 + index;
      ring.userData.seed = index * 0.78;
      searchMoteGroup.add(ring);
      return ring;
    });
    const searchMotes = Array.from({ length: 18 }, (_, index) => {
      const mote = index % 4 === 0
        ? makeSpriteGlyph(index % 8 === 0 ? "♪" : "✦", index % 8 === 0 ? "#ffd86f" : "#ffffff", 42)
        : new THREE.Mesh(
          new THREE.SphereGeometry(4 + (index % 3), 8, 6),
          new THREE.MeshBasicMaterial({
            color: index % 3 ? 0xffffff : 0xffd86f,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false
          })
        );
      mote.material.opacity = 0;
      mote.renderOrder = 42 + index;
      mote.userData.seed = index * 0.63;
      mote.userData.radius = 292 + (index % 5) * 26;
      mote.userData.height = -138 + (index % 7) * 42;
      searchMoteGroup.add(mote);
      return mote;
    });
    scene.add(searchMoteGroup);

    const pickupAura = new THREE.Group();
    pickupAura.visible = false;
    const pickupAuraRing = new THREE.Mesh(
      new THREE.RingGeometry(58, 76, 52),
      new THREE.MeshBasicMaterial({
        color: 0xffd86f,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    pickupAuraRing.rotation.x = -Math.PI / 2;
    pickupAuraRing.renderOrder = 64;
    pickupAura.add(pickupAuraRing);
    const pickupAuraBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 34, 148, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfff2a6,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    pickupAuraBeam.position.y = 72;
    pickupAuraBeam.renderOrder = 63;
    pickupAura.add(pickupAuraBeam);
    scene.add(pickupAura);

    const catGroup = new THREE.Group();
    globeGroup.add(catGroup);
    const progressPathGroup = new THREE.Group();
    globeGroup.add(progressPathGroup);
    const masteryTokenGroup = new THREE.Group();
    globeGroup.add(masteryTokenGroup);
    const hintGroup = new THREE.Group();
    scene.add(hintGroup);
    const targetCompass = new THREE.Group();
    targetCompass.visible = false;
    const targetCompassRing = new THREE.Mesh(
      new THREE.RingGeometry(54, 68, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffd86f,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide
      })
    );
    targetCompassRing.rotation.x = -Math.PI / 2;
    targetCompassRing.renderOrder = 68;
    targetCompass.add(targetCompassRing);
    const targetCompassNote = makeSpriteGlyph("喂", "#25231f", 48);
    targetCompassNote.scale.set(24, 24, 1);
    targetCompassNote.material.opacity = 0;
    targetCompassNote.material.depthTest = false;
    targetCompassNote.renderOrder = 69;
    targetCompassNote.position.y = 62;
    targetCompass.add(targetCompassNote);
    scene.add(targetCompass);

    function makeGlobe3D() {
      const group = new THREE.Group();
      const grass = new THREE.Mesh(
        new THREE.SphereGeometry(world.radius, 44, 28),
        toonMat(0xaee66f)
      );
      group.add(grass);

      const waterGlow = new THREE.Mesh(
        new THREE.SphereGeometry(world.radius + 1.2, 44, 28),
        new THREE.MeshBasicMaterial({
          color: 0x8fd3ff,
          transparent: true,
          opacity: 0.11,
          depthWrite: false
        })
      );
      group.add(waterGlow);

      addPlanetDepthSkirt(group);

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(world.radius * 1.006, 4.8, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0xf2ffd2, transparent: true, opacity: 0.28 })
      );
      rim.rotation.x = Math.PI / 2;
      group.add(rim);

      const highlight = new THREE.Mesh(
        new THREE.TorusGeometry(world.radius * 0.72, 2.8, 6, 72),
        new THREE.MeshBasicMaterial({ color: 0xf3ffd4, transparent: true, opacity: 0.22 })
      );
      highlight.rotation.x = Math.PI / 2.6;
      highlight.rotation.z = -0.28;
      highlight.position.y = 72;
      group.add(highlight);

      for (let i = 0; i < 28; i += 1) {
        if (i % 4 === 1) continue;
        const ring = i % 7;
        const lat = THREE.MathUtils.lerp(-0.56, 0.58, ring / 6) + Math.sin(i * 1.7) * 0.035;
        const lon = -Math.PI + (i / 28) * Math.PI * 2 + Math.cos(i * 0.9) * 0.08;
        const stone = new THREE.Mesh(
          new THREE.DodecahedronGeometry(8 + (i % 3) * 3, 0),
          new THREE.MeshLambertMaterial({ color: i % 2 ? 0xd9d8c8 : 0xc7c5b4 })
        );
        stone.scale.y = 0.55;
        stone.rotation.set(i * 0.4, i * 0.7, 0.2);
        placeOnGlobe(stone, lat, lon, 7);
        group.add(stone);
      }

      const pathMat = toonMat(0xf4df9c);
      [
        [-0.32, -2.34, 0.18, 0.1, -0.3],
        [0.12, -1.38, 0.22, 0.12, 0.2],
        [-0.08, -0.2, 0.24, 0.14, -0.1],
        [0.3, 0.78, 0.2, 0.11, 0.42],
        [-0.26, 1.74, 0.19, 0.1, -0.22],
        [0.34, 2.72, 0.17, 0.1, 0.18]
      ].forEach(([lat, lon, sx, sz, rot]) => {
        const geometry = new THREE.CircleGeometry(world.radius * sx, 32);
        geometry.rotateX(-Math.PI / 2);
        const patch = new THREE.Mesh(geometry, pathMat);
        patch.scale.z = sz / sx;
        patch.rotation.z = rot;
        placeOnGlobe(patch, lat, lon, 2);
        group.add(patch);
      });

      addPlanetRimDetails(group);
      addPlanetMusicRings(group);
      addGlobeDetails(group);
      addPlayableSurfaceDecor(group);
      addBalancedSurfaceDecor(group);
      addAdventureProps(group);
      addUpperFieldDecor(group);
      addMelodyStations(group);
      addEvenPlanetSprinkles(group);
      addWholePlanetToyDecor(group);
      addEvenIslandStoryDecor(group);
      addVisibleIslandFillDecor(group);
      addTinyWonderlandDetails(group);
      addAroundPlanetLandmarks(group);
      addFrontPlayfieldDecor(group);
      addFloatingPlanetPolish(group);
      addOrbitClouds(group);
      enableSoftShadows(group);
      return group;
    }

    function makeStageGlow() {
      const group = new THREE.Group();
      group.userData.parts = { rings: [], dots: [] };
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(500, 96),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
          depthTest: false
        })
      );
      floor.scale.set(1.28, 0.34, 1);
      floor.renderOrder = 0;
      group.add(floor);

      [0, 1, 2].forEach((index) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(350 + index * 62, 356 + index * 62, 112),
          new THREE.MeshBasicMaterial({
            color: [0xffffff, 0xfff2a6, 0xbfeeff][index],
            transparent: true,
            opacity: 0.18 - index * 0.04,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
          })
        );
        ring.scale.set(1.22, 0.36, 1);
        ring.userData.seed = index * 0.74;
        ring.renderOrder = 1 + index;
        group.userData.parts.rings.push(ring);
        group.add(ring);
      });

      for (let i = 0; i < 18; i += 1) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(4 + (i % 3), 8, 6),
          new THREE.MeshBasicMaterial({
            color: i % 3 ? 0xffffff : 0xffd86f,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
            depthTest: false
          })
        );
        const angle = (i / 18) * Math.PI * 2;
        dot.position.set(Math.cos(angle) * (380 + (i % 4) * 32), Math.sin(angle) * 118, 8);
        dot.userData.angle = angle;
        dot.userData.seed = i * 0.62;
        dot.renderOrder = 5;
        group.userData.parts.dots.push(dot);
        group.add(dot);
      }
      return group;
    }

    function makePlayfieldHalo() {
      const group = new THREE.Group();
      group.userData.parts = { rings: [], motes: [] };
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(410, 96),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
          depthTest: false
        })
      );
      glow.scale.set(1.18, 0.58, 1);
      glow.renderOrder = 2;
      group.add(glow);

      [0, 1, 2].forEach((index) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(350 + index * 32, 354 + index * 32, 96),
          new THREE.MeshBasicMaterial({
            color: [0xffffff, 0xfff2a6, 0x8fd3ff][index],
            transparent: true,
            opacity: 0.12 - index * 0.026,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
          })
        );
        ring.scale.set(1.18, 0.58, 1);
        ring.renderOrder = 3 + index;
        ring.userData.seed = index * 0.86;
        group.userData.parts.rings.push(ring);
        group.add(ring);
      });

      for (let i = 0; i < 16; i += 1) {
        const mote = new THREE.Mesh(
          new THREE.SphereGeometry(4 + (i % 3), 8, 6),
          new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xffffff : 0xfff2a6,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
            depthTest: false
          })
        );
        const angle = (i / 16) * Math.PI * 2;
        mote.position.set(Math.cos(angle) * (328 + (i % 4) * 20), Math.sin(angle) * 168, 0);
        mote.renderOrder = 7;
        mote.userData.seed = i * 0.51;
        mote.userData.angle = angle;
        group.userData.parts.motes.push(mote);
        group.add(mote);
      }
      return group;
    }

    function addPlanetDepthSkirt(group) {
      const cliffMats = [0xd8c5a5, 0xc9b18f, 0xe4d6bb].map((color) => new THREE.MeshLambertMaterial({ color }));
      const mossMat = new THREE.MeshLambertMaterial({ color: 0x8ccf5d });
      for (let i = 0; i < 44; i += 1) {
        const lon = -Math.PI + (i / 44) * Math.PI * 2;
        const lat = -0.72 + Math.sin(i * 1.7) * 0.045;
        const block = new THREE.Group();
        const height = 46 + (i % 5) * 9;
        const width = 24 + (i % 4) * 8;
        const rock = new THREE.Mesh(
          new THREE.CylinderGeometry(width * 0.64, width * 0.9, height, 6),
          cliffMats[i % cliffMats.length]
        );
        rock.position.y = -height * 0.42;
        rock.rotation.y = i * 0.37;
        rock.scale.z = 0.72 + (i % 3) * 0.08;
        block.add(rock);
        if (i % 3 === 0) {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(width * 0.36, 8, 6), mossMat);
          cap.scale.set(1.4, 0.28, 0.9);
          cap.position.y = 4;
          block.add(cap);
        }
        placeOnGlobe(block, lat, lon, -2);
        group.add(block);
      }
    }

    function makeSkyBackdrop() {
      const group = new THREE.Group();
      const sunGlow = new THREE.Mesh(
        new THREE.CircleGeometry(270, 64),
        new THREE.MeshBasicMaterial({ color: 0xfff6b8, transparent: true, opacity: 0.18, depthWrite: false, depthTest: false })
      );
      sunGlow.position.set(-620, 270, -760);
      sunGlow.scale.set(1.35, 0.82, 1);
      sunGlow.renderOrder = -8;
      sunGlow.userData.seed = 8.1;
      group.add(sunGlow);

      const skyWash = new THREE.Mesh(
        new THREE.CircleGeometry(420, 64),
        new THREE.MeshBasicMaterial({ color: 0xd9f5ff, transparent: true, opacity: 0.18, depthWrite: false, depthTest: false })
      );
      skyWash.position.set(420, -180, -780);
      skyWash.scale.set(1.6, 0.62, 1);
      skyWash.renderOrder = -9;
      skyWash.userData.seed = 9.4;
      group.add(skyWash);

      const horizon = new THREE.Mesh(
        new THREE.RingGeometry(520, 545, 96),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false, depthTest: false, side: THREE.DoubleSide })
      );
      horizon.position.set(0, -18, -690);
      horizon.scale.set(1.45, 0.34, 1);
      horizon.rotation.z = -0.06;
      horizon.renderOrder = -7;
      horizon.userData.seed = 10.5;
      horizon.userData.isSkyRing = true;
      group.add(horizon);

      const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82, depthWrite: false });
      const blueMat = new THREE.MeshBasicMaterial({ color: 0xc7f0ff, transparent: true, opacity: 0.24, depthWrite: false });
      [
        [-720, 270, -520, 1.1, 0.4],
        [620, 255, -560, 0.9, 1.8],
        [260, -245, -620, 0.72, 3.1],
        [-560, -230, -580, 0.64, 4.5],
        [-80, 310, -650, 0.58, 5.7],
        [760, -70, -610, 0.52, 6.8]
      ].forEach(([x, y, z, scale, seed]) => {
        const cloud = new THREE.Group();
        for (let i = 0; i < 5; i += 1) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(26 + i * 5, 14, 8), i === 4 ? blueMat : cloudMat);
          puff.position.set(i * 34, Math.sin(i * 1.4) * 9, 0);
          puff.scale.set(1.8, 0.42, 0.78);
          cloud.add(puff);
        }
        cloud.position.set(x, y, z);
        cloud.scale.setScalar(scale);
        cloud.userData.seed = seed;
        group.add(cloud);
      });
      [
        [-360, 10, -420, 0.42, -0.08, 10.2],
        [520, 28, -440, 0.36, 0.12, 11.3],
        [90, 250, -470, 0.34, 0.04, 12.6]
      ].forEach(([x, y, z, scale, rot, seed]) => {
        const mini = new THREE.Group();
        for (let i = 0; i < 4; i += 1) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(18 + i * 4, 10, 8), i === 3 ? blueMat : cloudMat);
          puff.position.set(i * 25, Math.sin(i * 1.2) * 6, 0);
          puff.scale.set(1.72, 0.38, 0.68);
          mini.add(puff);
        }
        mini.position.set(x, y, z);
        mini.rotation.z = rot;
        mini.scale.setScalar(scale);
        mini.userData.seed = seed;
        mini.userData.isForegroundCloud = true;
        group.add(mini);
      });
      ["♪", "Do", "Mi", "♫"].forEach((glyph, index) => {
        const note = makeSpriteGlyph(glyph, index % 2 ? "#ffffff" : "#fff3a3", glyph.length > 1 ? 36 : 48);
        note.position.set(-620 + index * 390, 210 - (index % 2) * 80, -500);
        note.scale.set(glyph.length > 1 ? 30 : 24, 24, 1);
        note.material.opacity = 0.38;
        note.material.depthTest = false;
        note.userData.seed = 13 + index;
        note.userData.isSkyNote = true;
        group.add(note);
      });
      [
        [-520, 150, -690, 1.1, 0.18, 7.4],
        [420, 110, -700, 0.9, -0.12, 8.6],
        [-120, -210, -720, 0.72, 0.1, 9.7]
      ].forEach(([x, y, z, scale, rot, seed]) => {
        const ribbon = new THREE.Group();
        for (let i = 0; i < 7; i += 1) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(22 + i * 2, 12, 8),
            i % 3 === 0 ? blueMat : cloudMat
          );
          puff.position.set(i * 38, Math.sin(i * 0.8) * 10, 0);
          puff.scale.set(2.15, 0.32, 0.68);
          ribbon.add(puff);
        }
        ribbon.position.set(x, y, z);
        ribbon.rotation.z = rot;
        ribbon.scale.setScalar(scale);
        ribbon.userData.seed = seed;
        ribbon.userData.isRibbonCloud = true;
        group.add(ribbon);
      });
      return group;
    }

    function makeAmbientMusicLayer() {
      const group = new THREE.Group();
      const specs = [
        [-720, 110, -230, "♪", "#fff3a3", 0.72],
        [-520, -72, -180, "♫", "#ffffff", 0.56],
        [-260, 214, -260, "Do", "#dff8d6", 0.52],
        [110, 302, -320, "♪", "#ffffff", 0.42],
        [390, 214, -250, "Mi", "#fff3a3", 0.5],
        [690, 42, -220, "♬", "#ffffff", 0.58],
        [600, -152, -180, "So", "#dff8d6", 0.48],
        [-60, -238, -210, "♫", "#fff3a3", 0.44]
      ];
      specs.forEach(([x, y, z, glyph, color, opacity], index) => {
        const note = makeSpriteGlyph(glyph, color, glyph.length > 1 ? 36 : 50);
        note.position.set(x, y, z);
        note.scale.set(glyph.length > 1 ? 34 : 24, 24, 1);
        note.material.opacity = opacity;
        note.material.depthTest = false;
        note.renderOrder = -2 + index;
        note.userData.isAmbientNote = true;
        note.userData.base = new THREE.Vector3(x, y, z);
        note.userData.seed = 20 + index * 1.31;
        note.userData.baseOpacity = opacity;
        group.add(note);
      });

      for (let i = 0; i < 18; i += 1) {
        const sparkle = new THREE.Mesh(
          new THREE.SphereGeometry(3 + (i % 3), 8, 6),
          new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xffffff : 0xfff2a6,
            transparent: true,
            opacity: 0.22 + (i % 4) * 0.04,
            depthWrite: false,
            depthTest: false
          })
        );
        sparkle.position.set(
          -760 + (i / 17) * 1520 + Math.sin(i) * 48,
          -210 + Math.sin(i * 1.8) * 265,
          -260 - (i % 5) * 24
        );
        sparkle.userData.isAmbientSparkle = true;
        sparkle.userData.seed = 33 + i * 0.77;
        sparkle.userData.base = sparkle.position.clone();
        sparkle.userData.baseOpacity = sparkle.material.opacity;
        group.add(sparkle);
      }

      const orbitGlyphs = ["♪", "♫", "Do", "Mi", "So", "♬", "La", "♪"];
      orbitGlyphs.forEach((glyph, index) => {
        const traveler = makeSpriteGlyph(glyph, ["#fff3a3", "#ffffff", "#dff8d6", "#8fd3ff"][index % 4], glyph.length > 1 ? 32 : 48);
        traveler.material.opacity = 0.42;
        traveler.material.depthTest = false;
        traveler.renderOrder = 18 + index;
        traveler.scale.set(glyph.length > 1 ? 30 : 24, 22, 1);
        traveler.userData.isPlanetTraveler = true;
        traveler.userData.angle = index / orbitGlyphs.length * Math.PI * 2;
        traveler.userData.speed = 0.00012 + (index % 3) * 0.000025;
        traveler.userData.radius = 395 + (index % 4) * 18;
        traveler.userData.height = -64 + (index % 5) * 34;
        traveler.userData.seed = 70 + index * 0.91;
        traveler.userData.baseOpacity = 0.42 + (index % 3) * 0.06;
        group.add(traveler);
      });
      return group;
    }

    function enableSoftShadows(group) {
      group.traverse((child) => {
        if (!child.isMesh) return;
        const small = child.geometry?.parameters?.radius && child.geometry.parameters.radius < 12;
        child.castShadow = !small;
        child.receiveShadow = true;
      });
    }

    function surfacePoint(lat, lon, altitude = 0) {
      const radius = world.radius + altitude;
      const cosLat = Math.cos(lat);
      return new THREE.Vector3(
        radius * cosLat * Math.sin(lon),
        radius * Math.sin(lat),
        radius * cosLat * Math.cos(lon)
      );
    }

    function placeOnGlobe(object, lat, lon, altitude = 0) {
      const position = surfacePoint(lat, lon, altitude);
      const normal = position.clone().normalize();
      object.position.copy(position);
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      object.userData.lat = lat;
      object.userData.lon = lon;
      object.userData.altitude = altitude;
      return object;
    }

    function addGlobeDetails(group) {
      [
        [0.5, -2.35, 0.18, 0x9bd765],
        [0.22, -1.65, 0.2, 0x8fd1e8],
        [-0.18, -0.92, 0.2, 0xbfe779],
        [0.48, -0.18, 0.18, 0xf2df9d],
        [0.16, 0.58, 0.22, 0x96cf63],
        [-0.22, 1.26, 0.18, 0xf0db9b],
        [0.56, 2.1, 0.16, 0xc7ed7a],
        [-0.44, 2.68, 0.16, 0x9bd765]
      ].forEach(([lat, lon, size, color], index) => {
        addSurfaceBlob(group, lat, lon, size, index % 2 ? 0.48 : 0.62, color, index * 0.7);
      });

      addSurfaceTrail(group, [
        [-0.34, -2.6], [-0.22, -2.28], [-0.08, -1.92], [0.08, -1.56],
        [0.2, -1.18], [0.12, -0.8], [-0.08, -0.42]
      ]);
      addSurfaceTrail(group, [
        [0.34, -0.22], [0.2, 0.06], [0.04, 0.34], [-0.12, 0.66],
        [-0.26, 0.98], [-0.36, 1.3]
      ]);
      addSurfaceTrail(group, [
        [0.62, 1.1], [0.54, 1.38], [0.48, 1.66], [0.38, 1.94], [0.24, 2.22]
      ]);
      addSurfaceTrail(group, [
        [0.46, 2.72], [0.24, 2.95], [0.04, -3.08], [-0.18, -2.88], [-0.38, -2.58]
      ]);

      const hut = makeMusicHut();
      placeOnGlobe(hut, 0.5, -0.24, 5);
      group.add(hut);

      const treeLats = [-0.38, -0.12, 0.22, 0.44, -0.26, 0.08, 0.36, -0.5, 0.16, 0.54, -0.08, 0.3, -0.32, 0.62];
      const treeLons = [-2.72, -2.26, -1.84, -1.32, -0.82, -0.34, 0.2, 0.66, 1.08, 1.48, 1.92, 2.32, 2.72, -3.02];
      treeLats.forEach((lat, i) => {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 36, 8), new THREE.MeshLambertMaterial({ color: 0xaa7140 }));
        trunk.position.y = 18;
        tree.add(trunk);
        const top = new THREE.Mesh(new THREE.ConeGeometry(36, 72, 10), new THREE.MeshLambertMaterial({ color: i % 2 ? 0x77c863 : 0x42b76a }));
        top.position.y = 66;
        tree.add(top);
        const lower = new THREE.Mesh(new THREE.ConeGeometry(44, 54, 10), new THREE.MeshLambertMaterial({ color: i % 2 ? 0x94d45f : 0x54bd6d }));
        lower.position.y = 48;
        tree.add(lower);
        placeOnGlobe(tree, lat, treeLons[i], 0);
        group.add(tree);
      });

      [[-0.03, -2.44, 22], [0.28, -1.74, 18], [-0.25, -1.1, 20], [0.08, -0.48, 14], [0.32, 0.28, 17], [-0.4, 0.92, 16], [0.58, 1.54, 18], [0.24, 2.18, 15], [-0.18, 2.82, 18], [0.46, -2.96, 16]].forEach(([lat, lon, size]) => {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), new THREE.MeshLambertMaterial({ color: 0xd7d8cd }));
        rock.scale.y = 0.72;
        placeOnGlobe(rock, lat, lon, 7);
        group.add(rock);
      });

      [[-0.26, -2.18], [0.18, -1.0], [-0.02, 0.2], [0.48, 1.26], [-0.34, 2.34], [0.34, 2.92]].forEach(([lat, lon]) => {
        const fence = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0xb7793f });
        [-24, 0, 24].forEach((x) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(11, 38, 11), mat);
          post.position.set(x, 19, 0);
          fence.add(post);
        });
        const rail = new THREE.Mesh(new THREE.BoxGeometry(80, 11, 9), mat);
        rail.position.y = 28;
        fence.add(rail);
        placeOnGlobe(fence, lat, lon, 4);
        group.add(fence);
      });

      const flowerMats = [0xff8fa2, 0xffd86f, 0x8fd3ff, 0xffffff].map((color) => new THREE.MeshLambertMaterial({ color }));
      [
        [-0.2, -2.82], [-0.13, -2.32], [0.16, -1.76], [0.24, -1.22], [-0.31, -0.64],
        [0.04, -0.1], [0.37, 0.42], [-0.42, 0.9], [0.0, 1.38], [0.31, 1.84],
        [0.52, 2.26], [0.48, 2.74], [0.62, -3.04], [0.42, 0.08], [-0.54, 1.94], [-0.08, 2.98]
      ].forEach(([lat, lon], i) => {
        const flower = new THREE.Group();
        for (let petal = 0; petal < 5; petal += 1) {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(3.4, 7, 5), flowerMats[(i + petal) % flowerMats.length]);
          mesh.position.set(Math.cos(petal * 1.26) * 5, 9, Math.sin(petal * 1.26) * 5);
          mesh.scale.set(1, 0.45, 1);
          flower.add(mesh);
        }
        placeOnGlobe(flower, lat, lon, 5);
        group.add(flower);
      });

      addMusicLandmarks(group);
    }

    function addPlanetRimDetails(group) {
      const stoneMats = [0xe4dac4, 0xd2c6ae, 0xf1e4c8].map((color) => new THREE.MeshLambertMaterial({ color }));
      const shrubMats = [0x55bd69, 0x78cc64, 0x3cab68].map((color) => new THREE.MeshLambertMaterial({ color }));
      for (let i = 0; i < 36; i += 1) {
        const lon = -Math.PI + (i / 36) * Math.PI * 2;
        const lat = (i % 2 ? 0.64 : -0.64) + Math.sin(i * 0.9) * 0.05;
        const rock = new THREE.Group();
        const size = 11 + (i % 4) * 3;
        const base = new THREE.Mesh(
          new THREE.DodecahedronGeometry(size, 0),
          stoneMats[i % stoneMats.length]
        );
        base.scale.set(1.25, 0.72, 0.9);
        base.position.y = size * 0.35;
        rock.add(base);
        if (i % 3 === 0) {
          const shrub = new THREE.Mesh(
            new THREE.SphereGeometry(8 + (i % 2) * 3, 9, 7),
            shrubMats[i % shrubMats.length]
          );
          shrub.scale.set(1.12, 0.72, 1);
          shrub.position.set(Math.sin(i) * 12, size + 7, Math.cos(i) * 10);
          rock.add(shrub);
        }
        placeOnGlobe(rock, lat, lon, 8 + (i % 3));
        group.add(rock);
      }
    }

    function addPlanetMusicRings(group) {
      [
        [world.radius + 23, 0xfff2a6, 0.18, 0.42, -0.2],
        [world.radius + 36, 0xffffff, 0.12, -0.28, 0.34]
      ].forEach(([radius, color, opacity, rx, rz], index) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, index ? 1.5 : 2.2, 6, 120),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false
          })
        );
        ring.rotation.set(Math.PI / 2 + rx, 0, rz);
        ring.userData.isMusicRing = true;
        ring.userData.spin = index ? -0.00011 : 0.00016;
        group.add(ring);
      });

      ["♪", "♫", "♬", "Do", "Mi", "So"].forEach((glyph, index) => {
        const note = makeSpriteGlyph(glyph, ["#ffd86f", "#ffffff", "#8fd3ff"][index % 3], glyph.length > 1 ? 42 : 54);
        const lon = -Math.PI + (index / 6) * Math.PI * 2;
        const lat = Math.sin(index * 1.2) * 0.16;
        placeOnGlobe(note, lat, lon, 76);
        note.scale.set(glyph.length > 1 ? 34 : 28, glyph.length > 1 ? 20 : 28, 1);
        note.material.opacity = 0.72;
        note.userData.isOrbitNote = true;
        note.userData.floatSeed = index * 1.3;
        note.userData.baseY = note.position.y;
        group.add(note);
      });
    }

    function addMusicLandmarks(group) {
      [
        [0.12, -2.72, "♪", 0xffd86f],
        [-0.52, -1.54, "Do", 0x8fd3ff],
        [0.58, -0.72, "♫", 0xff8fa2],
        [-0.48, 0.36, "Mi", 0x6fd082],
        [0.42, 1.02, "♬", 0xffd86f],
        [-0.18, 2.1, "So", 0x8fd3ff],
        [0.6, 2.72, "La", 0xff8fa2]
      ].forEach(([lat, lon, label, color], index) => {
        const marker = makeMusicMarker(label, color, index);
        placeOnGlobe(marker, lat, lon, 8);
        group.add(marker);
      });

      [
        [-0.6, -2.42, 0xff8fa2],
        [0.68, -1.98, 0xffd86f],
        [-0.54, -0.28, 0x8fd3ff],
        [0.66, 0.44, 0x6fd082],
        [-0.62, 1.42, 0xffd86f],
        [0.18, 2.58, 0xff8fa2]
      ].forEach(([lat, lon, color], index) => {
        const flag = makeTinyFlag(color, index);
        placeOnGlobe(flag, lat, lon, 5);
        group.add(flag);
      });

      [
        [-0.58, -2.9], [-0.44, -2.06], [0.04, -1.38], [0.5, -0.96],
        [-0.56, -0.02], [0.56, 0.82], [-0.5, 1.08], [0.1, 1.72],
        [0.52, 2.34], [-0.46, 2.92], [0.62, -2.82], [-0.1, 2.54]
      ].forEach(([lat, lon], index) => {
        const tuft = makeGrassTuft(index);
        placeOnGlobe(tuft, lat, lon, 4);
        group.add(tuft);
      });
    }

    function addPlayableSurfaceDecor(group) {
      const shrubMats = [0x4fbd67, 0x79cc67, 0xa7dc6e].map((color) => new THREE.MeshLambertMaterial({ color }));
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0xdedbcc });
      const flowerMats = [0xff8fa2, 0xffd86f, 0x8fd3ff, 0xffffff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const spots = [
        [-0.48, -2.96, "shrub"], [-0.12, -2.58, "flower"], [0.28, -2.24, "stone"],
        [0.58, -1.82, "shrub"], [-0.38, -1.48, "note"], [0.04, -1.12, "flower"],
        [0.42, -0.76, "stone"], [-0.56, -0.34, "shrub"], [0.18, 0.02, "note"],
        [0.6, 0.38, "flower"], [-0.28, 0.76, "stone"], [0.1, 1.1, "shrub"],
        [0.48, 1.48, "note"], [-0.52, 1.84, "flower"], [-0.06, 2.22, "stone"],
        [0.34, 2.58, "shrub"], [0.62, 2.94, "flower"], [-0.34, -3.12, "note"]
      ];

      spots.forEach(([lat, lon, type], index) => {
        if (type === "shrub") {
          const shrub = new THREE.Group();
          for (let i = 0; i < 3; i += 1) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(13 + i * 3, 10, 8), shrubMats[(index + i) % shrubMats.length]);
            leaf.position.set((i - 1) * 13, 12 + i * 4, Math.sin(i + index) * 8);
            leaf.scale.set(1.1, 0.72, 0.95);
            shrub.add(leaf);
          }
          placeOnGlobe(shrub, lat, lon, 7);
          group.add(shrub);
          return;
        }
        if (type === "stone") {
          const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(14 + (index % 3) * 4, 0), stoneMat);
          stone.scale.set(1.12, 0.58, 0.92);
          stone.rotation.set(index * 0.42, index * 0.28, 0.1);
          placeOnGlobe(stone, lat, lon, 8);
          group.add(stone);
          return;
        }
        if (type === "note") {
          const note = makeMusicMarker(index % 2 ? "♪" : "♫", index % 2 ? 0xffd86f : 0x8fd3ff, index);
          note.scale.setScalar(0.82);
          placeOnGlobe(note, lat, lon, 8);
          group.add(note);
          return;
        }
        const flower = new THREE.Group();
        for (let petal = 0; petal < 6; petal += 1) {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(4.8, 8, 6), flowerMats[(index + petal) % flowerMats.length]);
          mesh.position.set(Math.cos(petal * 1.05) * 8, 10, Math.sin(petal * 1.05) * 8);
          mesh.scale.set(1, 0.46, 1);
          flower.add(mesh);
        }
        const center = new THREE.Mesh(new THREE.SphereGeometry(4.2, 8, 6), flowerMats[(index + 1) % flowerMats.length]);
        center.position.y = 12;
        flower.add(center);
        placeOnGlobe(flower, lat, lon, 6);
        group.add(flower);
      });
    }

    function addBalancedSurfaceDecor(group) {
      const treeMats = [0x45b76d, 0x78c967, 0x9ed36a].map((color) => new THREE.MeshLambertMaterial({ color }));
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0xaa7140 });
      const rockMat = new THREE.MeshLambertMaterial({ color: 0xd8d7ca });
      const flowerMats = [0xff8fa2, 0xffd86f, 0x8fd3ff, 0xffffff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < 30; i += 1) {
        const band = i / 29;
        const lat = THREE.MathUtils.lerp(-0.66, 0.66, band) + Math.sin(i * 1.9) * 0.035;
        const lon = normalizeLon(i * golden + Math.sin(i * 0.73) * 0.22);
        const type = i % 5;

        if (type === 0 || type === 3) {
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7, 31, 8), trunkMat);
          trunk.position.y = 15;
          tree.add(trunk);
          const top = new THREE.Mesh(new THREE.ConeGeometry(25 + (i % 3) * 5, 48, 10), treeMats[i % treeMats.length]);
          top.position.y = 47;
          top.rotation.y = i * 0.4;
          tree.add(top);
          const lower = new THREE.Mesh(new THREE.ConeGeometry(32 + (i % 2) * 5, 36, 10), treeMats[(i + 1) % treeMats.length]);
          lower.position.y = 34;
          tree.add(lower);
          placeOnGlobe(tree, lat, lon, 5);
          group.add(tree);
          continue;
        }

        if (type === 1) {
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(12 + (i % 4) * 3, 0), rockMat);
          rock.scale.set(1.18, 0.58, 0.9);
          rock.rotation.set(i * 0.31, i * 0.47, 0.14);
          placeOnGlobe(rock, lat, lon, 8);
          group.add(rock);
          continue;
        }

        if (type === 2) {
          const fence = new THREE.Group();
          const wood = new THREE.MeshLambertMaterial({ color: i % 2 ? 0xb7793f : 0x9e6535 });
          [-18, 18].forEach((x) => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(9, 31, 9), wood);
            post.position.set(x, 16, 0);
            fence.add(post);
          });
          const rail = new THREE.Mesh(new THREE.BoxGeometry(54, 8, 7), wood);
          rail.position.y = 24;
          rail.rotation.z = Math.sin(i) * 0.04;
          fence.add(rail);
          placeOnGlobe(fence, lat, lon, 6);
          group.add(fence);
          continue;
        }

        const flower = new THREE.Group();
        for (let petal = 0; petal < 5; petal += 1) {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(3.8, 8, 6), flowerMats[(i + petal) % flowerMats.length]);
          mesh.position.set(Math.cos(petal * 1.26) * 6, 8, Math.sin(petal * 1.26) * 6);
          mesh.scale.set(1, 0.42, 1);
          flower.add(mesh);
        }
        placeOnGlobe(flower, lat, lon, 6);
        group.add(flower);
      }
    }

    function addAdventureProps(group) {
      const crateMat = new THREE.MeshLambertMaterial({ color: 0xc98542 });
      const strapMat = new THREE.MeshLambertMaterial({ color: 0x7d512c });
      const gemMats = [0xff8fa2, 0x8fd3ff, 0xffd86f, 0x6fd082].map((color) => new THREE.MeshLambertMaterial({ color }));
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfff2a6, transparent: true, opacity: 0.88 });
      const propSpots = [
        [-0.62, -2.78, "crate"], [-0.34, -2.16, "gate"], [0.36, -1.7, "gem"], [0.7, -1.1, "lantern"],
        [-0.68, -0.56, "gate"], [-0.18, -0.02, "crate"], [0.5, 0.44, "gem"], [0.72, 0.98, "lantern"],
        [-0.48, 1.34, "crate"], [0.0, 1.74, "gate"], [0.42, 2.18, "gem"], [-0.7, 2.62, "lantern"],
        [0.66, 2.96, "crate"], [-0.22, -3.06, "gem"], [0.18, -2.56, "lantern"], [-0.08, 2.9, "gate"]
      ];

      propSpots.forEach(([lat, lon, type], index) => {
        const prop = new THREE.Group();
        if (type === "crate") {
          const box = new THREE.Mesh(new THREE.BoxGeometry(24, 22, 22), crateMat);
          box.position.y = 13;
          box.rotation.y = index * 0.35;
          prop.add(box);
          const strapA = new THREE.Mesh(new THREE.BoxGeometry(28, 4, 5), strapMat);
          strapA.position.set(0, 19, 11.5);
          prop.add(strapA);
          const strapB = strapA.clone();
          strapB.rotation.z = Math.PI / 2;
          prop.add(strapB);
        } else if (type === "gate") {
          const wood = new THREE.MeshLambertMaterial({ color: index % 2 ? 0xb7793f : 0x9e6535 });
          [-17, 17].forEach((x) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 44, 8), wood);
            post.position.set(x, 23, 0);
            prop.add(post);
          });
          const arch = new THREE.Mesh(new THREE.TorusGeometry(17, 4, 8, 24, Math.PI), wood);
          arch.position.y = 44;
          arch.rotation.z = Math.PI;
          prop.add(arch);
          const bell = new THREE.Mesh(new THREE.SphereGeometry(5.5, 10, 8), gemMats[index % gemMats.length]);
          bell.position.y = 31;
          prop.add(bell);
        } else if (type === "gem") {
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(13, 0), gemMats[index % gemMats.length]);
          gem.position.y = 20;
          gem.rotation.set(index * 0.2, index * 0.7, 0.1);
          prop.add(gem);
          const base = new THREE.Mesh(new THREE.CylinderGeometry(12, 16, 8, 12), new THREE.MeshLambertMaterial({ color: 0xf7f3df }));
          base.position.y = 5;
          prop.add(base);
        } else {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 44, 8), new THREE.MeshLambertMaterial({ color: 0x8a5b35 }));
          pole.position.y = 23;
          prop.add(pole);
          const glow = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 8), lanternMat);
          glow.position.y = 48;
          glow.scale.set(1, 1.18, 1);
          glow.userData.isLanternGlow = true;
          prop.add(glow);
        }
        prop.rotation.y = index * 0.22;
        placeOnGlobe(prop, lat, lon, type === "lantern" ? 10 : 7);
        group.add(prop);
      });
    }

    function addUpperFieldDecor(group) {
      const treeMats = [0x4fbd67, 0x75ca64, 0x9edb6b].map((color) => new THREE.MeshLambertMaterial({ color }));
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0xa86d3d });
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0xdedbcc });
      const decorTypes = ["tree", "stone", "flower", "note", "flower", "tree", "stone"];
      const upperSpots = Array.from({ length: 34 }, (_, index) => {
        const band = index % 4;
        const latBase = [0.62, 0.34, 0.08, -0.26][band];
        const lon = -Math.PI + (index / 34) * Math.PI * 2 + Math.sin(index * 1.37) * 0.15;
        const lat = THREE.MathUtils.clamp(latBase + Math.cos(index * 1.91) * 0.095, -0.48, 0.74);
        return [lat, lon, decorTypes[index % decorTypes.length]];
      });

      upperSpots.forEach(([lat, lon, type], index) => {
        if (type === "tree") {
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6, 27, 8), trunkMat);
          trunk.position.y = 13;
          tree.add(trunk);
          const crown = new THREE.Mesh(new THREE.SphereGeometry(19 + (index % 3) * 3, 12, 9), treeMats[index % treeMats.length]);
          crown.position.y = 35;
          crown.scale.set(1.05, 0.88, 1);
          tree.add(crown);
          const crownTop = new THREE.Mesh(new THREE.SphereGeometry(14, 10, 8), treeMats[(index + 1) % treeMats.length]);
          crownTop.position.y = 53;
          crownTop.scale.set(0.92, 0.78, 0.92);
          tree.add(crownTop);
          placeOnGlobe(tree, lat, lon, 6);
          group.add(tree);
          return;
        }

        if (type === "stone") {
          const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(10 + (index % 3) * 3, 0), stoneMat);
          stone.scale.set(1.2, 0.54, 0.88);
          stone.rotation.set(index * 0.22, index * 0.51, 0.12);
          placeOnGlobe(stone, lat, lon, 8);
          group.add(stone);
          return;
        }

        if (type === "note") {
          const marker = makeMusicMarker(index % 2 ? "♪" : "♫", index % 2 ? 0xffd86f : 0x8fd3ff, index + 40);
          marker.scale.setScalar(0.74);
          placeOnGlobe(marker, lat, lon, 9);
          group.add(marker);
          return;
        }

        const flower = makeGrassTuft(index + 50);
        flower.scale.setScalar(0.86);
        placeOnGlobe(flower, lat, lon, 6);
        group.add(flower);
      });
    }

    function addMelodyStations(group) {
      const baseMats = [0xffd86f, 0x8fd3ff, 0xff8fa2, 0x6fd082].map((color) => toonMat(color));
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x25231f, transparent: true, opacity: 0.5 });
      const stationSpots = [
        [0.2, -2.04, "Do"], [-0.34, -1.28, "Re"], [0.54, -0.54, "Mi"],
        [-0.18, 0.34, "Fa"], [0.4, 1.12, "So"], [-0.48, 1.92, "La"], [0.08, 2.7, "Ti"]
      ];
      stationSpots.forEach(([lat, lon, label], index) => {
        const station = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(20, 25, 14, 18), baseMats[index % baseMats.length]);
        base.position.y = 7;
        station.add(base);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(21, 2.4, 8, 28), rimMat);
        rim.position.y = 15;
        rim.rotation.x = Math.PI / 2;
        station.add(rim);
        const note = makeSpriteGlyph(label, "#25231f", label.length > 1 ? 34 : 48);
        note.position.y = 36;
        note.scale.set(label.length > 1 ? 30 : 24, 22, 1);
        note.material.depthTest = false;
        note.renderOrder = 28;
        station.add(note);
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(26, 34, 42),
          new THREE.MeshBasicMaterial({
            color: [0xffd86f, 0x8fd3ff, 0xff8fa2, 0x6fd082][index % 4],
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            side: THREE.DoubleSide
          })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 2;
        halo.userData.isStationHalo = true;
        station.add(halo);
        station.userData.isMelodyStation = true;
        station.userData.seed = index * 0.73;
        placeOnGlobe(station, lat, lon, 10);
        group.add(station);
      });
    }

    function addFloatingPlanetPolish(group) {
      const waterMat = new THREE.MeshBasicMaterial({
        color: 0x8fd3ff,
        transparent: true,
        opacity: 0.74,
        depthWrite: false
      });
      const foamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.78,
        depthWrite: false
      });
      [
        [-0.58, -1.82, 58],
        [-0.62, 0.18, 46],
        [-0.54, 2.28, 52]
      ].forEach(([lat, lon, length], index) => {
        const fall = new THREE.Group();
        const stream = new THREE.Mesh(new THREE.CylinderGeometry(8, 12, length, 8), waterMat);
        stream.position.y = -length * 0.38;
        stream.scale.x = 0.62;
        stream.scale.z = 0.34;
        stream.userData.isWaterfall = true;
        stream.userData.seed = index * 0.8;
        fall.add(stream);
        const foam = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 7), foamMat);
        foam.position.y = 4;
        foam.scale.set(1.2, 0.32, 0.7);
        foam.userData.isWaterFoam = true;
        foam.userData.seed = index * 1.1;
        foam.userData.baseScale = foam.scale.clone();
        fall.add(foam);
        const drop = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 7), foamMat);
        drop.position.y = -length * 0.78;
        drop.scale.set(1.4, 0.35, 0.8);
        drop.userData.isWaterFoam = true;
        drop.userData.seed = index * 1.7 + 0.4;
        drop.userData.baseScale = drop.scale.clone();
        fall.add(drop);
        placeOnGlobe(fall, lat, lon, 10);
        fall.userData.isWaterfallGroup = true;
        fall.userData.seed = index;
        group.add(fall);
      });

      const pebbleMats = [0xd8c5a5, 0xc9b18f, 0xe9dbc2, 0xbddc78].map((color) => new THREE.MeshLambertMaterial({ color }));
      for (let i = 0; i < 18; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.78, 0.72, (i % 6) / 5) + Math.sin(i * 1.6) * 0.025;
        const lon = normalizeLon(-Math.PI + (i / 18) * Math.PI * 2 + Math.cos(i * 0.7) * 0.14);
        const pebble = new THREE.Mesh(
          new THREE.DodecahedronGeometry(8 + (i % 4) * 3, 0),
          pebbleMats[i % pebbleMats.length]
        );
        pebble.scale.set(1, 0.68, 0.86);
        pebble.rotation.set(i * 0.33, i * 0.21, 0.2);
        pebble.userData.isFloatingPebble = true;
        pebble.userData.seed = i * 0.57;
        placeOnGlobe(pebble, lat, lon, 38 + (i % 4) * 12);
        pebble.userData.basePosition = pebble.position.clone();
        group.add(pebble);
      }

      const mistMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        depthTest: false
      });
      [-2.55, -0.9, 0.72, 2.42].forEach((lon, index) => {
        const mist = new THREE.Group();
        for (let i = 0; i < 5; i += 1) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(16 + i * 3, 10, 7), mistMat);
          puff.position.set(i * 22, Math.sin(i * 1.3) * 5, Math.cos(i) * 6);
          puff.scale.set(1.72, 0.34, 0.7);
          mist.add(puff);
        }
        mist.userData.isPlanetMist = true;
        mist.userData.seed = index * 1.3;
        placeOnGlobe(mist, -0.5 + Math.sin(index) * 0.12, lon, 62);
        group.add(mist);
      });
    }

    function addEvenPlanetSprinkles(group) {
      const flowerMats = [0xff8fa2, 0xffd86f, 0x8fd3ff, 0xffffff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const leafMats = [0x4fbd67, 0x76ca69, 0x9ed36a].map((color) => new THREE.MeshLambertMaterial({ color }));
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0xdedbcc });
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < 36; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.68, 0.68, ((i * 7) % 36) / 35) + Math.sin(i * 1.31) * 0.035;
        const lon = normalizeLon(i * golden + Math.cos(i * 0.91) * 0.18);
        const kind = i % 6;

        if (kind === 0 || kind === 4) {
          const tuft = makeGrassTuft(i + 90);
          tuft.scale.setScalar(kind === 0 ? 0.64 : 0.82);
          placeOnGlobe(tuft, lat, lon, 6);
          group.add(tuft);
          continue;
        }

        if (kind === 1) {
          const flower = new THREE.Group();
          for (let petal = 0; petal < 5; petal += 1) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(3.7, 8, 6), flowerMats[(i + petal) % flowerMats.length]);
            mesh.position.set(Math.cos(petal * 1.26) * 6, 8, Math.sin(petal * 1.26) * 6);
            mesh.scale.set(1, 0.44, 1);
            flower.add(mesh);
          }
          placeOnGlobe(flower, lat, lon, 6);
          group.add(flower);
          continue;
        }

        if (kind === 2) {
          const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(8 + (i % 3) * 3, 0), stoneMat);
          stone.scale.set(1.12, 0.55, 0.86);
          stone.rotation.set(i * 0.28, i * 0.46, 0.12);
          placeOnGlobe(stone, lat, lon, 7);
          group.add(stone);
          continue;
        }

        if (kind === 3) {
          const leaf = new THREE.Group();
          for (let j = 0; j < 3; j += 1) {
            const blade = new THREE.Mesh(new THREE.ConeGeometry(5, 22 + j * 4, 6), leafMats[(i + j) % leafMats.length]);
            blade.position.set((j - 1) * 8, 12 + j * 3, Math.sin(i + j) * 5);
            blade.rotation.z = (j - 1) * 0.22;
            leaf.add(blade);
          }
          placeOnGlobe(leaf, lat, lon, 6);
          group.add(leaf);
          continue;
        }

        const marker = makeMusicMarker(i % 2 ? "♪" : "♫", i % 2 ? 0xffd86f : 0x8fd3ff, i + 120);
        marker.scale.setScalar(0.52);
        placeOnGlobe(marker, lat, lon, 8);
        group.add(marker);
      }
    }

    function addWholePlanetToyDecor(group) {
      const bushMats = [0x8fd768, 0xa7df68, 0x6bc56b].map((color) => new THREE.MeshLambertMaterial({ color }));
      const rockMat = new THREE.MeshLambertMaterial({ color: 0xded9c8 });
      const flagColors = [0xffd86f, 0x8fd3ff, 0xff8fa2, 0xffffff];
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < 54; i += 1) {
        const band = (i * 13) % 54;
        const lat = THREE.MathUtils.lerp(-0.72, 0.72, band / 53) + Math.sin(i * 0.83) * 0.025;
        const lon = normalizeLon(i * golden + Math.sin(i * 1.19) * 0.16 + 0.42);
        const kind = i % 9;

        if (kind === 0) {
          const tree = makeRoundTree(i);
          tree.scale.setScalar(0.54 + (i % 3) * 0.08);
          placeOnGlobe(tree, lat, lon, 4);
          group.add(tree);
          continue;
        }

        if (kind === 1 || kind === 6) {
          const bush = new THREE.Group();
          for (let j = 0; j < 3; j += 1) {
            const puff = new THREE.Mesh(new THREE.SphereGeometry(13 + j * 2, 10, 7), bushMats[(i + j) % bushMats.length]);
            puff.position.set((j - 1) * 13, 13 + Math.sin(j) * 3, Math.cos(j * 1.7) * 6);
            puff.scale.set(1.15, 0.72, 1);
            bush.add(puff);
          }
          bush.scale.setScalar(0.78 + (i % 2) * 0.12);
          placeOnGlobe(bush, lat, lon, 6);
          group.add(bush);
          continue;
        }

        if (kind === 2) {
          const flag = makeTinyFlag(flagColors[i % flagColors.length], i);
          flag.scale.setScalar(0.72);
          placeOnGlobe(flag, lat, lon, 8);
          group.add(flag);
          continue;
        }

        if (kind === 3 || kind === 7) {
          const grass = makeGrassTuft(i + 300);
          grass.scale.setScalar(0.72 + (i % 2) * 0.16);
          placeOnGlobe(grass, lat, lon, 6);
          group.add(grass);
          continue;
        }

        if (kind === 4) {
          const marker = makeMusicMarker(i % 2 ? "Do" : "♪", i % 2 ? 0xffd86f : 0x8fd3ff, i + 260);
          marker.scale.setScalar(0.5);
          placeOnGlobe(marker, lat, lon, 8);
          group.add(marker);
          continue;
        }

        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(9 + (i % 3) * 3, 0), rockMat);
        rock.scale.set(1.08, 0.58, 0.9);
        rock.rotation.set(i * 0.24, i * 0.42, 0.16);
        placeOnGlobe(rock, lat, lon, 7);
        group.add(rock);
      }
    }

    function addEvenIslandStoryDecor(group) {
      const leafMats = [0x63c96b, 0x94d969, 0xb6e46e].map((color) => new THREE.MeshLambertMaterial({ color }));
      const flowerMats = [0xff8fa2, 0xffd86f, 0x8fd3ff, 0xffffff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0xdedbcc });
      const woodMat = new THREE.MeshLambertMaterial({ color: 0xb7793f });
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < 72; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.76, 0.76, ((i * 17) % 72) / 71) + Math.sin(i * 1.23) * 0.028;
        const lon = normalizeLon(i * golden + Math.cos(i * 0.81) * 0.2 - 0.18);
        const kind = i % 8;
        let item;

        if (kind === 0) {
          item = makeRoundTree(i + 900);
          item.scale.setScalar(0.46 + (i % 3) * 0.07);
        } else if (kind === 1 || kind === 5) {
          item = new THREE.Group();
          for (let j = 0; j < 3; j += 1) {
            const puff = new THREE.Mesh(new THREE.SphereGeometry(10 + j * 2.2, 9, 7), leafMats[(i + j) % leafMats.length]);
            puff.position.set((j - 1) * 11, 11 + j * 3, Math.sin(i + j) * 5);
            puff.scale.set(1.18, 0.68, 0.92);
            item.add(puff);
          }
          item.scale.setScalar(0.78);
        } else if (kind === 2) {
          item = new THREE.Mesh(new THREE.DodecahedronGeometry(8 + (i % 4) * 2.4, 0), stoneMat);
          item.scale.set(1.12, 0.52, 0.88);
          item.rotation.set(i * 0.28, i * 0.43, 0.12);
        } else if (kind === 3) {
          item = new THREE.Group();
          for (let petal = 0; petal < 5; petal += 1) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(3.8, 8, 6), flowerMats[(i + petal) % flowerMats.length]);
            mesh.position.set(Math.cos(petal * 1.26) * 6, 8, Math.sin(petal * 1.26) * 6);
            mesh.scale.set(1, 0.44, 1);
            item.add(mesh);
          }
        } else if (kind === 4) {
          item = makeMusicMarker(i % 2 ? "♪" : "Do", i % 2 ? 0xffd86f : 0x8fd3ff, i + 980);
          item.scale.setScalar(0.42);
        } else if (kind === 6) {
          item = makeGrassTuft(i + 980);
          item.scale.setScalar(0.62);
        } else {
          item = new THREE.Group();
          [-13, 13].forEach((x) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.4, 22, 7), woodMat);
            post.position.set(x, 12, 0);
            item.add(post);
          });
          const rail = new THREE.Mesh(new THREE.BoxGeometry(38, 5, 6), woodMat);
          rail.position.y = 18;
          item.add(rail);
          item.scale.setScalar(0.58);
        }

        item.userData.evenIslandDecor = true;
        item.userData.seed = i * 0.39;
        item.userData.baseScale = item.scale.clone();
        placeOnGlobe(item, lat, lon, kind === 0 || kind === 4 ? 8 : 6);
        group.add(item);
      }
    }

    function addFrontPlayfieldDecor(group) {
      const treeMat = new THREE.MeshLambertMaterial({ color: 0x6fca6c });
      const treeDarkMat = new THREE.MeshLambertMaterial({ color: 0x43a86a });
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0xa86d3e });
      const flowerMats = [0xff8fa2, 0xffd86f, 0xffffff, 0x8fd3ff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const rockMat = new THREE.MeshLambertMaterial({ color: 0xd9d6c6 });
      const signMat = new THREE.MeshLambertMaterial({ color: 0xffe6a6 });
      const inkMat = new THREE.MeshLambertMaterial({ color: 0x5c4631 });
      const spots = [
        [-0.48, -0.92, "tree"], [-0.24, -0.58, "flower"], [0.02, -0.28, "sign"], [0.28, 0.04, "rock"],
        [0.5, 0.36, "tree"], [-0.44, 0.54, "grass"], [-0.18, 0.86, "flower"], [0.12, 1.16, "sign"],
        [0.38, 1.48, "rock"], [-0.52, 1.78, "tree"], [-0.02, 2.08, "flower"], [0.28, 2.42, "grass"],
        [0.56, 2.78, "sign"], [-0.34, -2.42, "rock"], [0.2, -2.04, "flower"], [0.54, -1.52, "tree"],
        [-0.62, -1.28, "grass"], [-0.06, -1.74, "sign"],
        [-0.7, -0.18, "flower"], [-0.64, 0.28, "rock"], [-0.58, 0.98, "tree"], [-0.46, 1.5, "sign"],
        [0.68, -0.68, "grass"], [0.66, -0.08, "flower"], [0.64, 0.78, "rock"], [0.62, 1.88, "tree"],
        [-0.12, -2.92, "flower"], [0.32, -2.72, "sign"], [0.0, 2.88, "grass"], [0.42, 3.06, "rock"]
      ];

      spots.forEach(([lat, lon, kind], index) => {
        let item;
        if (kind === "tree") {
          item = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6, 26, 8), trunkMat);
          trunk.position.y = 13;
          item.add(trunk);
          const top = new THREE.Mesh(new THREE.SphereGeometry(22, 12, 8), index % 2 ? treeMat : treeDarkMat);
          top.scale.set(1.08, 0.78, 1);
          top.position.y = 36;
          item.add(top);
          item.scale.setScalar(0.74);
        } else if (kind === "sign") {
          item = new THREE.Group();
          const post = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 30, 8), trunkMat);
          post.position.y = 15;
          item.add(post);
          const board = new THREE.Mesh(new THREE.BoxGeometry(36, 22, 6), signMat);
          board.position.y = 34;
          item.add(board);
          const note = makeSpriteGlyph(index % 2 ? "♪" : "Do", "#25231f", index % 2 ? 42 : 30);
          note.scale.set(index % 2 ? 16 : 22, 15, 1);
          note.position.set(0, 35, 4);
          note.renderOrder = 18;
          item.add(note);
          item.scale.setScalar(0.72);
        } else if (kind === "rock") {
          item = new THREE.Mesh(new THREE.DodecahedronGeometry(12 + (index % 3) * 3, 0), rockMat);
          item.scale.set(1.12, 0.55, 0.88);
          item.rotation.set(index * 0.31, index * 0.47, 0.12);
        } else if (kind === "grass") {
          item = makeGrassTuft(index + 520);
          item.scale.setScalar(0.76);
        } else {
          item = new THREE.Group();
          for (let petal = 0; petal < 5; petal += 1) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(4.2, 8, 6), flowerMats[(index + petal) % flowerMats.length]);
            mesh.position.set(Math.cos(petal * 1.26) * 7, 8, Math.sin(petal * 1.26) * 7);
            mesh.scale.set(1, 0.44, 1);
            item.add(mesh);
          }
          const center = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 6), inkMat);
          center.position.y = 8;
          item.add(center);
          item.scale.setScalar(0.88);
        }
        item.userData.frontDecor = true;
        item.userData.seed = index * 0.73;
        item.userData.baseScale = item.scale.clone();
        placeOnGlobe(item, lat, lon, kind === "sign" || kind === "tree" ? 8 : 6);
        group.add(item);
      });
    }

    function addVisibleIslandFillDecor(group) {
      const treeMats = [0x65c96d, 0x8fd768, 0xaee477].map((color) => new THREE.MeshLambertMaterial({ color }));
      const rockMat = new THREE.MeshLambertMaterial({ color: 0xdedbcc });
      const flowerMats = [0xff8fa2, 0xffd86f, 0xffffff, 0x8fd3ff].map((color) => new THREE.MeshLambertMaterial({ color }));
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < 46; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.62, 0.62, ((i * 11) % 46) / 45) + Math.sin(i * 1.41) * 0.02;
        const lon = normalizeLon(-1.75 + i * golden + Math.cos(i * 0.73) * 0.12);
        const kind = i % 6;
        let item;

        if (kind === 0) {
          item = makeRoundTree(i + 1240);
          item.scale.setScalar(0.5 + (i % 3) * 0.055);
        } else if (kind === 1 || kind === 4) {
          item = makeGrassTuft(i + 1320);
          item.scale.setScalar(0.62 + (i % 2) * 0.12);
        } else if (kind === 2) {
          item = new THREE.Mesh(new THREE.DodecahedronGeometry(8 + (i % 3) * 2.5, 0), rockMat);
          item.scale.set(1.08, 0.5, 0.86);
          item.rotation.set(i * 0.29, i * 0.43, 0.12);
        } else if (kind === 3) {
          item = new THREE.Group();
          for (let petal = 0; petal < 5; petal += 1) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 6), flowerMats[(i + petal) % flowerMats.length]);
            mesh.position.set(Math.cos(petal * 1.26) * 5.5, 7.5, Math.sin(petal * 1.26) * 5.5);
            mesh.scale.set(1, 0.42, 1);
            item.add(mesh);
          }
        } else {
          item = makeMusicMarker(i % 2 ? "♪" : "Do", i % 2 ? 0xffd86f : 0x8fd3ff, i + 1380);
          item.scale.setScalar(0.4);
        }

        item.userData.visibleFillDecor = true;
        item.userData.seed = i * 0.51;
        item.userData.baseScale = item.scale.clone();
        placeOnGlobe(item, lat, lon, kind === 0 || kind === 5 ? 8 : 6);
        group.add(item);
      }
    }

    function addAroundPlanetLandmarks(group) {
      const woodMat = new THREE.MeshLambertMaterial({ color: 0xb4773f });
      const creamMat = new THREE.MeshLambertMaterial({ color: 0xfff1c7 });
      const redMat = new THREE.MeshLambertMaterial({ color: 0xff8fa2 });
      const blueMat = new THREE.MeshLambertMaterial({ color: 0x8fd3ff });
      const greenMat = new THREE.MeshLambertMaterial({ color: 0x78cf72 });
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0xdcd8c9 });

      const landmarks = [
        [-0.58, -2.78, "pond"], [-0.18, -2.38, "fence"], [0.32, -2.02, "tree"], [0.64, -1.62, "pin"],
        [-0.5, -1.18, "stone"], [0.08, -0.86, "note"], [0.48, -0.42, "pond"], [-0.26, -0.1, "tree"],
        [0.62, 0.28, "fence"], [-0.54, 0.62, "pin"], [0.18, 0.98, "stone"], [0.5, 1.32, "note"],
        [-0.42, 1.72, "pond"], [0.0, 2.08, "tree"], [0.42, 2.44, "fence"], [-0.62, 2.78, "pin"],
        [0.66, 3.04, "stone"], [-0.12, -3.06, "note"]
      ];

      landmarks.forEach(([lat, lon, kind], index) => {
        let item;
        if (kind === "pond") {
          item = new THREE.Group();
          const pond = new THREE.Mesh(
            new THREE.CircleGeometry(25 + (index % 2) * 6, 26),
            new THREE.MeshLambertMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.86 })
          );
          pond.rotation.x = -Math.PI / 2;
          pond.scale.set(1.35, 0.72, 1);
          item.add(pond);
          const shine = new THREE.Mesh(
            new THREE.CircleGeometry(8, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.56, depthWrite: false })
          );
          shine.rotation.x = -Math.PI / 2;
          shine.position.set(-8, 1.5, 4);
          shine.scale.set(1.6, 0.5, 1);
          item.add(shine);
        } else if (kind === "fence") {
          item = new THREE.Group();
          [-24, 0, 24].forEach((x) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 27, 7), woodMat);
            post.position.set(x, 15, 0);
            item.add(post);
          });
          [-7, 8].forEach((y) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(62, 6, 7), creamMat);
            rail.position.set(0, 18 + y, 0);
            rail.rotation.z = Math.sin(index) * 0.06;
            item.add(rail);
          });
          item.scale.setScalar(0.68);
        } else if (kind === "tree") {
          item = makeRoundTree(index + 700);
          item.scale.setScalar(0.68);
        } else if (kind === "pin") {
          item = new THREE.Group();
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.4, 38, 7), woodMat);
          stem.position.y = 20;
          item.add(stem);
          for (let i = 0; i < 4; i += 1) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(6, 26, 3), i % 2 ? blueMat : redMat);
            blade.position.set(Math.cos(i * Math.PI / 2) * 13, 42, Math.sin(i * Math.PI / 2) * 5);
            blade.rotation.z = i * Math.PI / 2 + 0.1;
            item.add(blade);
          }
          item.scale.setScalar(0.62);
        } else if (kind === "note") {
          item = makeMusicMarker(index % 2 ? "Mi" : "♪", index % 2 ? 0x6fd082 : 0xffd86f, index + 820);
          item.scale.setScalar(0.56);
        } else {
          item = new THREE.Mesh(new THREE.DodecahedronGeometry(16 + (index % 3) * 4, 0), index % 2 ? stoneMat : greenMat);
          item.scale.set(1.16, 0.58, 0.9);
          item.rotation.set(index * 0.34, index * 0.5, 0.16);
        }
        item.userData.aroundDecor = true;
        item.userData.seed = index * 0.47;
        item.userData.baseScale = item.scale.clone();
        placeOnGlobe(item, lat, normalizeLon(lon), kind === "pin" || kind === "tree" ? 9 : 7);
        group.add(item);
      });
    }

    function addTinyWonderlandDetails(group) {
      const woodMat = new THREE.MeshLambertMaterial({ color: 0xb98247 });
      const paleMat = new THREE.MeshLambertMaterial({ color: 0xfff3c8 });
      const pinkMat = new THREE.MeshLambertMaterial({ color: 0xffadc0 });
      const blueMat = new THREE.MeshLambertMaterial({ color: 0x8fd3ff });
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff2a6, transparent: true, opacity: 0.64, depthWrite: false });

      [
        [-0.16, -2.12, -0.24],
        [0.28, -0.48, 0.16],
        [-0.42, 1.26, -0.12],
        [0.38, 2.48, 0.22]
      ].forEach(([lat, lon, rot], index) => {
        const bridge = new THREE.Group();
        const deck = new THREE.Mesh(new THREE.BoxGeometry(58, 8, 18), woodMat);
        deck.position.y = 10;
        deck.rotation.z = rot;
        bridge.add(deck);
        [-22, 0, 22].forEach((x) => {
          const plank = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 24), paleMat);
          plank.position.set(x, 14, 0);
          plank.rotation.z = rot * 0.4;
          bridge.add(plank);
        });
        [-34, 34].forEach((x) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 24, 8), woodMat);
          post.position.set(x, 22, -12);
          bridge.add(post);
        });
        bridge.scale.setScalar(0.62);
        bridge.userData.isWonderBridge = true;
        bridge.userData.seed = index * 0.9;
        placeOnGlobe(bridge, lat, lon, 9);
        group.add(bridge);
      });

      [
        [0.56, -1.52, "Do"],
        [-0.52, 0.18, "Mi"],
        [0.18, 1.86, "So"]
      ].forEach(([lat, lon, label], index) => {
        const arch = new THREE.Group();
        const left = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 42, 8), woodMat);
        const right = left.clone();
        left.position.set(-22, 23, 0);
        right.position.set(22, 23, 0);
        arch.add(left, right);
        const top = new THREE.Mesh(new THREE.TorusGeometry(22, 4, 8, 28, Math.PI), woodMat);
        top.position.set(0, 42, 0);
        top.rotation.z = Math.PI;
        arch.add(top);
        const note = makeSpriteGlyph(label, "#25231f", label.length > 1 ? 34 : 46);
        note.position.set(0, 48, 3);
        note.scale.set(label.length > 1 ? 24 : 22, 20, 1);
        note.material.opacity = 0.86;
        note.renderOrder = 22;
        arch.add(note);
        arch.scale.setScalar(0.72);
        arch.userData.isWonderArch = true;
        arch.userData.seed = index * 1.2;
        arch.userData.note = note;
        placeOnGlobe(arch, lat, lon, 10);
        group.add(arch);
      });

      [
        [-0.62, -2.8],
        [0.66, -0.98],
        [-0.18, 0.86],
        [0.62, 2.1],
        [-0.5, 2.74]
      ].forEach(([lat, lon], index) => {
        const pin = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.4, 34, 7), woodMat);
        stem.position.y = 18;
        pin.add(stem);
        const hub = new THREE.Mesh(new THREE.SphereGeometry(5.2, 10, 7), paleMat);
        hub.position.y = 38;
        pin.add(hub);
        for (let i = 0; i < 4; i += 1) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(5, 24, 3), i % 2 ? pinkMat : blueMat);
          blade.position.y = 38;
          blade.rotation.z = i * Math.PI / 2;
          blade.position.x = Math.cos(i * Math.PI / 2) * 12;
          blade.position.z = Math.sin(i * Math.PI / 2) * 4;
          pin.add(blade);
        }
        pin.scale.setScalar(0.66);
        pin.userData.isWonderPinwheel = true;
        pin.userData.seed = index * 0.74;
        placeOnGlobe(pin, lat, lon, 9);
        group.add(pin);
      });

      for (let i = 0; i < 18; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.64, 0.64, ((i * 5) % 18) / 17) + Math.sin(i * 1.2) * 0.035;
        const lon = normalizeLon(-Math.PI + i * 0.74 + Math.sin(i * 0.6) * 0.18);
        const firefly = new THREE.Mesh(new THREE.SphereGeometry(4 + (i % 2), 8, 6), glowMat.clone());
        firefly.userData.isWonderFirefly = true;
        firefly.userData.seed = i * 0.53;
        placeOnGlobe(firefly, lat, lon, 44 + (i % 3) * 9);
        firefly.userData.basePosition = firefly.position.clone();
        group.add(firefly);
      }
    }

    function makeRoundTree(index) {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 6.2, 28, 8),
        new THREE.MeshLambertMaterial({ color: 0xaa7140 })
      );
      trunk.position.y = 14;
      group.add(trunk);
      const colors = [0x7fcb64, 0x9ddd67, 0x6abf69];
      for (let i = 0; i < 4; i += 1) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(20 - i * 1.8, 12, 8),
          new THREE.MeshLambertMaterial({ color: colors[(index + i) % colors.length] })
        );
        leaf.position.set(Math.cos(i * 1.7) * 10, 34 + i * 7, Math.sin(i * 1.7) * 8);
        leaf.scale.set(1.08, 0.78, 1);
        group.add(leaf);
      }
      return group;
    }

    function makeMusicMarker(label, color, index) {
      const group = new THREE.Group();
      const baseMat = new THREE.MeshLambertMaterial({ color: index % 2 ? 0xf9e8b9 : 0xe8e7d6 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(17, 22, 12, 12), baseMat);
      base.position.y = 6;
      group.add(base);

      const note = makeSpriteGlyph(label, `#${color.toString(16).padStart(6, "0")}`, label.length > 1 ? 46 : 58);
      note.position.y = 32;
      note.scale.set(label.length > 1 ? 34 : 28, label.length > 1 ? 22 : 28, 1);
      note.renderOrder = 18;
      group.add(note);
      return group;
    }

    function makeTinyFlag(color, index) {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.8, 38, 7),
        new THREE.MeshLambertMaterial({ color: 0x9a6635 })
      );
      pole.position.y = 20;
      group.add(pole);

      const flag = new THREE.Mesh(
        new THREE.CircleGeometry(14, 3),
        new THREE.MeshLambertMaterial({ color })
      );
      flag.position.set(11, 31, 0);
      flag.rotation.set(0, 0, -Math.PI / 2 + index * 0.12);
      flag.scale.set(1.15, 0.78, 1);
      group.add(flag);
      return group;
    }

    function makeGrassTuft(index) {
      const group = new THREE.Group();
      const colors = [0x4fbd67, 0x76ca69, 0x9ed36a];
      for (let i = 0; i < 5; i += 1) {
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(3.8, 20 + i * 2, 5),
          new THREE.MeshLambertMaterial({ color: colors[(index + i) % colors.length] })
        );
        blade.position.set((i - 2) * 5, 11 + i, Math.sin(i * 1.4) * 4);
        blade.rotation.z = (i - 2) * 0.2;
        blade.rotation.y = index * 0.5 + i;
        group.add(blade);
      }
      return group;
    }

    function addSurfaceBlob(group, lat, lon, size, flatten, color, rot = 0) {
      const geometry = new THREE.CircleGeometry(world.radius * size, 34);
      geometry.rotateX(-Math.PI / 2);
      const blob = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.88 })
      );
      blob.scale.z = flatten;
      blob.rotation.z = rot;
      placeOnGlobe(blob, lat, lon, 2.4);
      group.add(blob);
    }

    function addSurfaceTrail(group, points) {
      const stepMat = new THREE.MeshLambertMaterial({ color: 0xf5df9f });
      points.forEach(([lat, lon], index) => {
        const step = new THREE.Mesh(new THREE.CircleGeometry(18 + (index % 2) * 5, 18), stepMat);
        step.scale.set(1.4, 0.78, 1);
        step.rotation.z = index * 0.33;
        placeOnGlobe(step, lat, lon, 3);
        group.add(step);
      });
    }

    function makeMusicHut() {
      const hut = new THREE.Group();
      const wallMat = new THREE.MeshLambertMaterial({ color: 0xffe6b5 });
      const roofMat = new THREE.MeshLambertMaterial({ color: 0xf08a42 });
      const trimMat = new THREE.MeshLambertMaterial({ color: 0x9a6635 });
      const noteMat = new THREE.MeshBasicMaterial({ color: 0x2a2b2f });

      const body = new THREE.Mesh(new THREE.BoxGeometry(54, 42, 46), wallMat);
      body.position.y = 26;
      hut.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(46, 34, 4), roofMat);
      roof.position.y = 61;
      roof.rotation.y = Math.PI / 4;
      hut.add(roof);

      const door = new THREE.Mesh(new THREE.BoxGeometry(17, 25, 3), trimMat);
      door.position.set(0, 17, 24);
      hut.add(door);

      const noteStem = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 24, 7), noteMat);
      noteStem.position.set(20, 58, 24);
      noteStem.rotation.z = -0.08;
      hut.add(noteStem);

      const noteHead = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), noteMat);
      noteHead.position.set(16, 46, 24);
      noteHead.scale.set(1.1, 0.75, 0.75);
      hut.add(noteHead);

      hut.rotation.y = -0.35;
      return hut;
    }

    function addOrbitClouds(group) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, depthWrite: false });
      [[0.58, 0.82], [0.08, -1.05], [-0.18, 0.95]].forEach(([lat, lon], cloudIndex) => {
        const cloud = new THREE.Group();
        for (let i = 0; i < 4; i += 1) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(12 + i * 3, 10, 8), mat);
          puff.position.set(i * 16, Math.sin(i) * 4, 0);
          puff.scale.set(1.45, 0.48, 0.78);
          cloud.add(puff);
        }
        cloud.userData.floatSeed = cloudIndex * 1.7;
        placeOnGlobe(cloud, lat, lon, 55);
        group.add(cloud);
      });
    }

    function addClouds(group) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      [[-300, -420], [250, -380], [360, 230]].forEach(([x, z], idx) => {
        for (let i = 0; i < 4; i += 1) {
          const cloud = new THREE.Mesh(new THREE.SphereGeometry(34 + i * 6, 12, 8), mat);
          cloud.position.set(x + i * 34, 230 + idx * 20, z + Math.sin(i) * 12);
          cloud.scale.set(1.7, 0.42, 0.8);
          group.add(cloud);
        }
      });
    }

    function addTrees(group) {
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0xaa7140 });
      const leafMats = [0x45b76d, 0x78c967, 0x9ed36a].map((color) => new THREE.MeshLambertMaterial({ color }));
      const spots = [[-315, -210], [-245, 250], [315, -80], [255, 225], [-40, -300], [330, 305], [-345, 70]];
      spots.forEach(([x, z], i) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(9, 12, 52, 8), trunkMat);
        trunk.position.set(x, 32, z);
        group.add(trunk);
        const top = new THREE.Mesh(new THREE.ConeGeometry(42, 88, 9), leafMats[i % leafMats.length]);
        top.position.set(x, 95, z);
        top.rotation.y = i * 0.4;
        group.add(top);
        const lower = new THREE.Mesh(new THREE.ConeGeometry(52, 72, 9), leafMats[(i + 1) % leafMats.length]);
        lower.position.set(x, 66, z);
        lower.rotation.y = i * 0.3;
        group.add(lower);
      });
    }

    function addRocks(group) {
      const mat = new THREE.MeshLambertMaterial({ color: 0xd7d8cd });
      [[-280, -80, 34], [275, -255, 42], [180, 325, 30], [-115, 330, 24], [320, 95, 26], [-340, -290, 28]].forEach(([x, z, size], i) => {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), mat);
        rock.position.set(x, size * 0.42, z);
        rock.rotation.set(i, i * 0.7, 0.2);
        rock.scale.y = 0.72;
        group.add(rock);
      });
    }

    function addFences(group) {
      const mat = new THREE.MeshLambertMaterial({ color: 0xb7793f });
      [[-300, 320, 0.08], [260, -310, 0.08], [340, 10, Math.PI / 2], [-350, -20, Math.PI / 2]].forEach(([x, z, rot]) => {
        for (let i = -1; i <= 1; i += 1) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(18, 58, 18), mat);
          post.position.set(x + Math.cos(rot) * i * 45, 36, z + Math.sin(rot) * i * 45);
          post.rotation.y = rot;
          group.add(post);
        }
        const rail = new THREE.Mesh(new THREE.BoxGeometry(118, 16, 14), mat);
        rail.position.set(x, 48, z);
        rail.rotation.y = rot;
        group.add(rail);
      });
    }

    function addTinyDetails(group) {
      const pebbleMat = new THREE.MeshLambertMaterial({ color: 0xe5e2d3 });
      const grassMat = new THREE.MeshLambertMaterial({ color: 0x3fb963 });
      const mushroomStem = new THREE.MeshLambertMaterial({ color: 0xfff1cf });
      const mushroomCap = new THREE.MeshLambertMaterial({ color: 0xff684f });
      const barrelMat = new THREE.MeshLambertMaterial({ color: 0xb87435 });
      const details = [
        [-210, 35], [-120, 255], [70, 255], [235, 165], [245, -135], [-230, -180],
        [-20, -260], [140, -255], [300, 20], [-310, 110]
      ];

      details.forEach(([x, z], i) => {
        const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(8 + (i % 3) * 3, 0), pebbleMat);
        pebble.position.set(x, 8, z);
        pebble.scale.y = 0.45;
        pebble.rotation.set(i * 0.6, i * 0.3, 0.2);
        group.add(pebble);
      });

      [[-285, -15], [-265, 150], [120, 305], [295, -45], [-80, -310], [335, 135]].forEach(([x, z], i) => {
        for (let blade = 0; blade < 5; blade += 1) {
          const grass = new THREE.Mesh(new THREE.ConeGeometry(5, 28 + blade * 2, 5), grassMat);
          grass.position.set(x + (blade - 2) * 7, 18, z + Math.sin(blade) * 8);
          grass.rotation.z = (blade - 2) * 0.18;
          grass.rotation.y = i + blade;
          group.add(grass);
        }
      });

      [[-155, -235], [265, 70], [42, -195]].forEach(([x, z]) => {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 18, 8), mushroomStem);
        stem.position.set(x, 16, z);
        group.add(stem);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 8), mushroomCap);
        cap.position.set(x, 30, z);
        cap.scale.y = 0.42;
        group.add(cap);
      });

      [[-205, 210], [255, -190]].forEach(([x, z]) => {
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 26, 12), barrelMat);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(x, 18, z);
        group.add(barrel);
      });
    }

    function makeBowl() {
      const group = new THREE.Group();
      group.userData.parts = {};
      const creamMat = toonMat(0xfff0b8);
      const goldMat = toonMat(0xffca63);
      const bowlMat = toonMat(0xffbe58);
      const rimMat = toonMat(0xffe28d);
      const foodMat = toonMat(0xb87531);
      const inkMat = new THREE.MeshBasicMaterial({ color: 0x3d3024, transparent: true, opacity: 0.34, side: THREE.BackSide });
      const addBowlOutline = (mesh, amount = 1.045) => {
        const outline = new THREE.Mesh(mesh.geometry, inkMat);
        outline.scale.setScalar(amount);
        outline.userData.noShadow = true;
        outline.renderOrder = -1;
        mesh.add(outline);
      };

      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(128, 138, 18, 42),
        creamMat
      );
      pad.position.y = -2;
      addBowlOutline(pad, 1.018);
      group.add(pad);

      const padRim = new THREE.Mesh(
        new THREE.TorusGeometry(128, 8, 10, 42),
        goldMat
      );
      padRim.position.y = 9;
      padRim.rotation.x = Math.PI / 2;
      group.add(padRim);

      const padShadow = new THREE.Mesh(
        new THREE.CircleGeometry(166, 42),
        new THREE.MeshBasicMaterial({ color: 0x1d2a25, transparent: true, opacity: 0.22, depthWrite: false })
      );
      padShadow.rotation.x = -Math.PI / 2;
      padShadow.position.y = -14;
      group.add(padShadow);

      const outer = new THREE.Mesh(
        new THREE.CylinderGeometry(90, 114, 54, 42),
        bowlMat
      );
      outer.position.y = 36;
      addBowlOutline(outer, 1.035);
      group.add(outer);

      [-1, 1].forEach((side) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(24, 34, 4), rimMat);
        ear.position.set(side * 66, 72, -8);
        ear.rotation.set(0.08, 0, side * -0.42);
        addBowlOutline(ear, 1.07);
        group.add(ear);
      });

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(91, 13, 12, 44),
        rimMat
      );
      rim.position.y = 66;
      rim.rotation.x = Math.PI / 2;
      group.add(rim);

      const foodMound = new THREE.Mesh(new THREE.SphereGeometry(54, 24, 12), toonMat(0xc78338));
      foodMound.scale.set(1.22, 0.22, 0.82);
      foodMound.position.y = 70;
      group.add(foodMound);

      for (let i = 0; i < 17; i += 1) {
        const kibble = new THREE.Mesh(new THREE.SphereGeometry(9 + (i % 3), 10, 8), foodMat);
        kibble.position.set(Math.cos(i * 1.8) * (18 + (i % 4) * 8), 78 + (i % 2) * 5, Math.sin(i * 1.8) * (16 + (i % 3) * 8));
        kibble.scale.y = 0.55;
        group.add(kibble);
      }

      const noteBadge = makeSpriteGlyph("♪", "#25231f", 56);
      noteBadge.position.set(0, 67, 88);
      noteBadge.scale.set(32, 32, 1);
      noteBadge.material.depthTest = false;
      noteBadge.renderOrder = 57;
      group.add(noteBadge);
      group.userData.parts.noteBadge = noteBadge;

      const faceGroup = new THREE.Group();
      faceGroup.position.set(0, 58, 106);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x25231f });
      const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8fa2, transparent: true, opacity: 0.62 });
      [-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(6.2, 12, 8), eyeMat);
        eye.scale.set(1, 0.72, 0.42);
        eye.position.set(side * 25, 10, 0);
        faceGroup.add(eye);

        const shine = new THREE.Mesh(new THREE.SphereGeometry(1.7, 7, 5), shineMat);
        shine.scale.set(1, 0.8, 0.5);
        shine.position.set(side * 23, 12.4, 2.8);
        faceGroup.add(shine);

        const blush = new THREE.Mesh(new THREE.SphereGeometry(5.8, 10, 6), blushMat);
        blush.scale.set(1.35, 0.42, 0.32);
        blush.position.set(side * 43, -1, 1.2);
        faceGroup.add(blush);
      });
      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(12, 1.5, 7, 24, Math.PI),
        eyeMat
      );
      smile.position.set(0, -1, 1.8);
      smile.rotation.set(0, 0, Math.PI);
      smile.scale.set(1, 0.58, 1);
      faceGroup.add(smile);
      faceGroup.userData.noShadow = true;
      group.add(faceGroup);
      group.userData.parts.faceGroup = faceGroup;
      enableSoftShadows(group);
      return group;
    }

    function makeFeedingDock() {
      const group = new THREE.Group();
      group.userData.parts = { arrows: [], beacons: [], gateDots: [] };
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(180, 52),
        new THREE.MeshBasicMaterial({ color: 0x2f6072, transparent: true, opacity: 0.18, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -20;
      shadow.scale.set(1.35, 0.52, 1);
      group.add(shadow);

      const matCloud = toonMat(0xfff7c7);
      const matRim = toonMat(0xffca63);
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(148, 164, 20, 48), matCloud);
      tray.position.y = -6;
      tray.scale.set(1.08, 1, 0.58);
      group.add(tray);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(142, 8, 10, 48), matRim);
      rim.position.y = 8;
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.08, 0.58, 1);
      group.add(rim);

      const gateRing = new THREE.Mesh(
        new THREE.RingGeometry(166, 176, 72),
        new THREE.MeshBasicMaterial({
          color: 0x6fd082,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide
        })
      );
      gateRing.rotation.x = -Math.PI / 2;
      gateRing.position.y = 12;
      gateRing.scale.set(1.18, 0.56, 1);
      gateRing.renderOrder = 41;
      group.userData.parts.gateRing = gateRing;
      group.add(gateRing);

      for (let i = 0; i < 10; i += 1) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(5 + (i % 2) * 1.5, 8, 6),
          new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xffffff : 0xffd86f,
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            depthTest: false
          })
        );
        dot.position.y = 20;
        dot.renderOrder = 42 + i;
        dot.userData.seed = i * 0.62;
        group.userData.parts.gateDots.push(dot);
        group.add(dot);
      }

      const arrowMat = new THREE.MeshBasicMaterial({
        color: 0x6fd082,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        depthTest: false
      });
      [-46, 0, 46].forEach((x, index) => {
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(12, 28, 3), arrowMat.clone());
        arrow.position.set(x, 20, 74);
        arrow.rotation.set(Math.PI / 2, 0, Math.PI);
        arrow.scale.set(1.05, 0.74, 1);
        arrow.renderOrder = 38 + index;
        arrow.userData.seed = index * 0.8;
        group.userData.parts.arrows.push(arrow);
        group.add(arrow);
      });

      [-88, 88].forEach((x, index) => {
        const beacon = new THREE.Group();
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(4, 5, 52, 10),
          new THREE.MeshBasicMaterial({ color: 0xffca63, transparent: true, opacity: 0.72, depthTest: false })
        );
        pole.position.y = 27;
        beacon.add(pole);
        const note = makeSpriteGlyph(index ? "♫" : "♪", "#25231f", 48);
        note.position.y = 62;
        note.scale.set(24, 24, 1);
        note.material.opacity = 0.72;
        note.renderOrder = 45 + index;
        beacon.add(note);
        beacon.position.set(x, 10, 18);
        beacon.userData.note = note;
        beacon.userData.pole = pole;
        beacon.userData.seed = index * 1.3;
        group.userData.parts.beacons.push(beacon);
        group.add(beacon);
      });

      const pawMat = toonMat(0xbf7a34);
      [-42, 0, 42].forEach((x, index) => {
        const paw = new THREE.Group();
        const pad = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 7), pawMat);
        pad.scale.set(1.15, 0.38, 0.85);
        pad.position.y = 12;
        paw.add(pad);
        [-8, 0, 8].forEach((z, toeIndex) => {
          const toe = new THREE.Mesh(new THREE.SphereGeometry(4.2, 8, 6), pawMat);
          toe.scale.set(1, 0.32, 1);
          toe.position.set(7 + toeIndex * 3, 15, z);
          paw.add(toe);
        });
        paw.position.set(x, 10, -54 + index * 8);
        paw.rotation.y = -0.18 + index * 0.14;
        group.add(paw);
      });

      const sign = makeSpriteGlyph("♪", "#25231f", 50);
      sign.position.set(106, 40, -36);
      sign.scale.set(28, 28, 1);
      sign.material.opacity = 0.72;
      group.add(sign);

      group.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = true;
          if (child.material) {
            child.material.depthTest = false;
            child.renderOrder = child.renderOrder || 32;
          }
        }
      });
      group.userData.sign = sign;
      return group;
    }

    function makeSceneLabel(text) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.strokeStyle = "#25231f";
      ctx.lineWidth = 10;
      roundRect(ctx, 42, 28, 172, 68, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#25231f";
      ctx.font = "bold 42px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(text, 128, 76);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
      label.scale.set(96, 48, 1);
      label.renderOrder = 50;
      return label;
    }

    function makeBubble(text) {
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#25231f";
      ctx.lineWidth = 8;
      roundRect(ctx, 18, 12, 118, 56, 28);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(64, 66);
      ctx.lineTo(52, 86);
      ctx.lineTo(88, 68);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#25231f";
      ctx.font = "bold 34px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(text, 78, 52);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const bubble = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 54),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.05, depthWrite: false, depthTest: false })
      );
      bubble.renderOrder = 40;
      return bubble;
    }

    function makeCatFaceTexture(index, mood = "normal") {
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 156;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.ellipse(112, 80, 86, 54, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 166, 178, 0.9)";
      ctx.beginPath();
      ctx.ellipse(58, 92, 18, 10, -0.12, 0, Math.PI * 2);
      ctx.ellipse(166, 92, 18, 10, 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#20251f";
      const closedEyes = mood === "happy" || mood === "wrong" || index % 3 === 1;
      if (closedEyes) {
        ctx.strokeStyle = "#20251f";
        ctx.lineWidth = mood === "wrong" ? 7 : 9;
        ctx.beginPath();
        if (mood === "wrong") {
          ctx.moveTo(67, 62);
          ctx.lineTo(91, 75);
          ctx.moveTo(91, 62);
          ctx.lineTo(67, 75);
          ctx.moveTo(131, 62);
          ctx.lineTo(155, 75);
          ctx.moveTo(155, 62);
          ctx.lineTo(131, 75);
        } else {
          ctx.arc(80, 66, 15, 0.12 * Math.PI, 0.88 * Math.PI);
          ctx.arc(144, 66, 15, 0.12 * Math.PI, 0.88 * Math.PI);
        }
        ctx.stroke();
      } else {
        ctx.beginPath();
        const eyeWide = mood === "lift" || mood === "listen" ? 1.18 : 1;
        ctx.ellipse(80, 68, 13 * eyeWide, 18 * eyeWide, 0, 0, Math.PI * 2);
        ctx.ellipse(144, 68, 13 * eyeWide, 18 * eyeWide, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(76, 60, 4.6, 5.8, 0, 0, Math.PI * 2);
        ctx.ellipse(140, 60, 4.6, 5.8, 0, 0, Math.PI * 2);
        ctx.ellipse(84, 76, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.ellipse(148, 76, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ff7f92";
      ctx.beginPath();
      ctx.moveTo(112, 82);
      ctx.lineTo(102, 94);
      ctx.lineTo(122, 94);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#20251f";
      ctx.lineWidth = 5.8;
      ctx.beginPath();
      if (mood === "wrong") {
        ctx.moveTo(103, 104);
        ctx.quadraticCurveTo(112, 96, 121, 104);
      } else if (mood === "happy") {
        ctx.moveTo(112, 93);
        ctx.quadraticCurveTo(99, 111, 84, 96);
        ctx.moveTo(112, 93);
        ctx.quadraticCurveTo(125, 111, 140, 96);
      } else {
        ctx.moveTo(112, 93);
        ctx.quadraticCurveTo(101, 106, 88, 98);
        ctx.moveTo(112, 93);
        ctx.quadraticCurveTo(123, 106, 136, 98);
      }
      ctx.stroke();

      if (mood === "listen") {
        ctx.fillStyle = "rgba(255, 216, 111, 0.95)";
        ctx.font = "bold 28px Trebuchet MS";
        ctx.fillText("♪", 178, 46);
      } else if (mood === "lift") {
        ctx.fillStyle = "rgba(143, 211, 255, 0.92)";
        ctx.font = "bold 24px Trebuchet MS";
        ctx.fillText("!", 178, 45);
      }

      ctx.strokeStyle = "rgba(32, 37, 31, 0.9)";
      ctx.lineWidth = 4.8;
      [-1, 1].forEach((side) => {
        for (let i = 0; i < 3; i += 1) {
          const y = 86 + i * 8;
          ctx.beginPath();
          ctx.moveTo(112 + side * 34, y);
          ctx.lineTo(112 + side * (66 + i * 6), y - 10 + i * 5);
          ctx.stroke();
        }
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function makeCatFaceSprite(index) {
      const texture = makeCatFaceTexture(index, "normal");
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      sprite.scale.set(58, 42, 1);
      sprite.renderOrder = 58;
      sprite.userData.textures = {
        normal: texture,
        listen: makeCatFaceTexture(index, "listen"),
        lift: makeCatFaceTexture(index, "lift"),
        happy: makeCatFaceTexture(index, "happy"),
        wrong: makeCatFaceTexture(index, "wrong")
      };
      sprite.userData.mood = "normal";
      return sprite;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }

    function ensureAudio() {
      if (!window.AudioContext && !window.webkitAudioContext) return false;
      if (!state.audio) {
        state.audio = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (state.audio.state === "suspended") state.audio.resume();
      return true;
    }

    function midiToFrequency(offset) {
      return 261.63 * (2 ** (offset / 12));
    }

    function playTone(freq, start, duration, gainValue, type = "triangle") {
      const osc = state.audio.createOscillator();
      const gain = state.audio.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(state.audio.destination);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    }

    function playUiTone(kind = "tap") {
      if (!ensureAudio()) return;
      const now = state.audio.currentTime + 0.01;
      if (kind === "food") {
        playTone(988, now, 0.12, 0.035, "sine");
        playTone(1320, now + 0.045, 0.16, 0.025, "triangle");
        return;
      }
      if (kind === "pickup") {
        playTone(740, now, 0.08, 0.028, "triangle");
        playTone(560, now + 0.035, 0.1, 0.018, "sine");
        return;
      }
      if (kind === "correct") {
        [660, 880, 1175].forEach((freq, index) => {
          playTone(freq, now + index * 0.055, 0.16, 0.032 - index * 0.004, "sine");
        });
        return;
      }
      if (kind === "wrong") {
        playTone(220, now, 0.16, 0.04, "sawtooth");
        playTone(164, now + 0.05, 0.18, 0.026, "triangle");
        return;
      }
      playTone(880, now, 0.08, 0.02, "sine");
    }

    function playFoodCue(item) {
      playUiTone("food");
      window.setTimeout(() => playItem(item), 115);
    }

    function playCatCue(item) {
      playUiTone("pickup");
      window.setTimeout(() => playItem(item), 80);
    }

    function wavDataUrl(frequencies, duration = 0.9) {
      const key = `${frequencies.join("-")}:${duration}`;
      if (state.audioCache.has(key)) return state.audioCache.get(key);
      const sampleRate = 22050;
      const totalSamples = Math.floor(sampleRate * duration);
      const buffer = new ArrayBuffer(44 + totalSamples * 2);
      const view = new DataView(buffer);
      const writeString = (offset, text) => {
        for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
      };
      writeString(0, "RIFF");
      view.setUint32(4, 36 + totalSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, totalSamples * 2, true);
      for (let i = 0; i < totalSamples; i += 1) {
        const t = i / sampleRate;
        const fadeIn = Math.min(1, i / (sampleRate * 0.03));
        const fadeOut = Math.min(1, (totalSamples - i) / (sampleRate * 0.08));
        const env = fadeIn * fadeOut;
        const value = frequencies.reduce((sum, freq, index) => {
          return sum + Math.sin(2 * Math.PI * freq * t) * (index === 0 ? 0.38 : 0.24);
        }, 0) / Math.max(1, frequencies.length);
        view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, value * env)) * 32767, true);
      }
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      const url = `data:audio/wav;base64,${btoa(binary)}`;
      state.audioCache.set(key, url);
      return url;
    }

    function playFallback(frequencies, duration = 0.9) {
      if (typeof Audio === "undefined") return;
      const audio = new Audio(wavDataUrl(frequencies, duration));
      audio.volume = 0.75;
      audio.play().catch(() => {});
    }

    function playItem(item) {
      const canUseAudioContext = ensureAudio();
      if (item.kind === "note") {
        const freqs = [
          midiToFrequency(NOTE_TO_SEMITONE[item.note]),
          midiToFrequency(NOTE_TO_SEMITONE[item.note] + 12)
        ];
        if (!canUseAudioContext) {
          playFallback(freqs, 0.85);
          return;
        }
        const now = state.audio.currentTime + 0.02;
        playTone(freqs[0], now, 0.82, 0.12);
        playTone(freqs[1], now + 0.12, 0.6, 0.04, "sine");
        return;
      }
      const root = NOTE_TO_SEMITONE[item.root];
      const freqs = CHORDS[item.chord].intervals.map((interval) => midiToFrequency(root + interval));
      if (!canUseAudioContext) {
        playFallback(freqs, 1.05);
        return;
      }
      const now = state.audio.currentTime + 0.02;
      CHORDS[item.chord].intervals.forEach((interval, index) => {
        playTone(midiToFrequency(root + interval), now + index * 0.025, 1.1, 0.1 - index * 0.018, index === 0 ? "triangle" : "sine");
      });
    }

    function itemColor(item, hidden = false) {
      if (hidden) return 0xffd86f;
      if (item.kind === "chord") {
        return { major: 0x62d783, minor: 0x7bbcff, dim: 0xff7f92 }[item.chord] || 0xffd86f;
      }
      return { C: 0xffd86f, D: 0x6fd082, E: 0x8fd3ff, F: 0xff8fa2, G: 0xb89cff, A: 0xffb65c, B: 0x72e1d1 }[item.note] || 0xffffff;
    }

    function itemShortLabel(item, hidden = false) {
      if (hidden) return "听";
      if (item.kind === "note") return `${item.note}`;
      return CHORDS[item.chord].label;
    }

    function emitSoundWave(origin, item, options = {}) {
      const hidden = Boolean(options.hidden);
      const compact = Boolean(options.compact);
      const color = itemColor(item, hidden);
      const center = origin.clone();
      for (let i = 0; i < 3; i += 1) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry((compact ? 18 : 24) + i * (compact ? 13 : 18), compact ? 1.9 : 2.4, 8, 48),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: compact ? 0.42 : 0.54, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(center);
        ring.position.y += 44 + i * 9;
        ring.userData = {
          age: -i * 0.08,
          life: compact ? 0.78 : 0.92,
          rise: (compact ? 26 : 36) + i * 10,
          expand: (compact ? 1.08 : 1.45) + i * 0.18
        };
        state.soundWaves.push(ring);
        scene.add(ring);
      }

      const label = makeSpriteGlyph(itemShortLabel(item, hidden), hidden ? "#25231f" : `#${color.toString(16).padStart(6, "0")}`, hidden ? 46 : 52);
      label.position.copy(center);
      label.position.y += compact ? 78 : 92;
      label.scale.set(compact ? 24 : 30, compact ? 24 : 30, 1);
      label.userData = {
        age: 0,
        life: compact ? 0.78 : 0.92,
        rise: compact ? 52 : 72,
        expand: compact ? 0.28 : 0.4,
        isLabel: true
      };
      state.soundWaves.push(label);
      scene.add(label);
    }

    function emitListeningSparkles(origin, item) {
      const color = `#${itemColor(item, true).toString(16).padStart(6, "0")}`;
      const glyphs = item.kind === "note" ? ["♪", "?", "♫", "听"] : ["♫", "?", "♪", "色"];
      for (let i = 0; i < 9; i += 1) {
        const angle = (i / 9) * Math.PI * 2;
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], i % 3 ? color : "#ffffff", glyphs[i % glyphs.length].length > 1 ? 34 : 48);
        mark.position.copy(origin);
        mark.position.x += Math.cos(angle) * (22 + (i % 3) * 8);
        mark.position.y += 62 + Math.sin(angle) * 8;
        mark.position.z += Math.sin(angle) * 18;
        mark.scale.setScalar(10 + (i % 3) * 2);
        mark.material.depthTest = false;
        mark.renderOrder = 66 + i;
        mark.userData = {
          vx: Math.cos(angle) * (42 + Math.random() * 28),
          vy: 52 + Math.random() * 42,
          vz: Math.sin(angle) * (32 + Math.random() * 22),
          age: -i * 0.025,
          life: 0.72 + Math.random() * 0.24,
          rot: (i % 2 ? -1 : 1) * (0.8 + Math.random() * 0.8),
          gravity: 42,
          growth: 0.32
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }
    }

    function emitCatSampleBurst(sprite) {
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const choice = sprite.userData.choice;
      const color = `#${itemColor(choice, true).toString(16).padStart(6, "0")}`;
      const glyphs = choice.kind === "note" ? ["喵", "♪", "?", "♫"] : ["喵", "♫", "?", "色"];
      for (let i = 0; i < 12; i += 1) {
        const angle = (i / 12) * Math.PI * 2;
        const label = glyphs[i % glyphs.length];
        const mark = makeSpriteGlyph(label, i % 3 ? color : "#ffffff", label.length > 1 ? 34 : 52);
        mark.position.copy(base);
        mark.position.x += Math.cos(angle) * (28 + (i % 4) * 7);
        mark.position.y += 76 + Math.sin(angle) * 9;
        mark.position.z += Math.sin(angle) * (22 + (i % 3) * 4);
        mark.scale.setScalar(label === "喵" ? 22 : 13 + (i % 3) * 2);
        mark.material.depthTest = false;
        mark.renderOrder = 72 + i;
        mark.userData = {
          vx: Math.cos(angle) * (28 + Math.random() * 24),
          vy: 58 + Math.random() * 48,
          vz: Math.sin(angle) * (22 + Math.random() * 24),
          age: -i * 0.018,
          life: 0.78 + Math.random() * 0.22,
          rot: (i % 2 ? -1 : 1) * (0.7 + Math.random() * 0.7),
          gravity: 36,
          growth: 0.4
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(52, 3.2, 10, 58),
        new THREE.MeshBasicMaterial({
          color: itemColor(choice, true),
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
          depthTest: false
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(base);
      ring.position.y += 46;
      ring.userData = {
        age: 0,
        life: 0.74,
        rise: 36,
        expand: 1.35
      };
      state.soundWaves.push(ring);
      scene.add(ring);
    }

    function emitSoundTrailToGlobe(item) {
      const base = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 92, 0));
      const color = itemColor(item, true);
      const glyphs = item.kind === "note" ? ["♪", item.note, "♫", "听"] : ["♫", "♪", "听", "?"];
      for (let i = 0; i < 18; i += 1) {
        const lane = i % 6;
        const lat = THREE.MathUtils.lerp(-0.48, 0.58, (lane + 0.35) / 6) + Math.sin(i * 1.7) * 0.05;
        const lon = normalizeLon(-2.45 + lane * 0.82 + Math.sin(i * 0.9) * 0.22);
        const end = globeGroup.localToWorld(surfacePoint(lat, lon, 64 + (i % 3) * 18));
        const mid = base.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 155 + (i % 4) * 18, 0));
        const note = makeSpriteGlyph(glyphs[i % glyphs.length], i % 3 ? `#${color.toString(16).padStart(6, "0")}` : "#ffffff", glyphs[i % glyphs.length].length > 1 ? 34 : 52);
        note.position.copy(base);
        note.scale.setScalar(12 + (i % 4) * 2);
        note.material.opacity = 0;
        note.material.depthTest = false;
        note.renderOrder = 62 + (i % 5);
        note.userData = {
          age: -i * 0.035,
          life: 1.75 + lane * 0.08,
          start: base.clone(),
          mid,
          end,
          spin: (i % 2 ? -1 : 1) * (0.6 + Math.random() * 0.4),
          wobble: Math.random() * Math.PI * 2
        };
        state.soundTrails.push(note);
        scene.add(note);
      }
    }

    function shuffle(values) {
      const copy = [...values];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function makeTarget() {
      const stage = STAGES[state.stage];
      if (stage.kind === "note") {
        const note = stage.notes[Math.floor(Math.random() * stage.notes.length)];
        return { kind: "note", id: note, note, label: `${note} / ${NOTE_NAMES[note]}` };
      }
      const chord = stage.chords[Math.floor(Math.random() * stage.chords.length)];
      const root = stage.notes[Math.floor(Math.random() * stage.notes.length)];
      return { kind: "chord", id: chord, root, chord, label: CHORDS[chord].label };
    }

    function makeChoices(target) {
      const stage = STAGES[state.stage];
      if (target.kind === "note") {
        return shuffle(stage.notes).map((note) => ({ kind: "note", id: note, note, label: "喵" }));
      }
      return shuffle(stage.chords).map((chord) => ({
        kind: "chord",
        id: chord,
        root: target.root,
        chord,
        label: "喵"
      }));
    }

    function renderFeedback(title, text) {
      feedback.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
    }

    function learnedLabel(item) {
      if (item.kind === "note") return `${item.note} ${NOTE_NAMES[item.note]}`;
      return CHORDS[item.chord].label;
    }

    function addLearned(item) {
      const label = learnedLabel(item);
      if (!state.learned.includes(label)) {
        state.learned.push(label);
        state.lastLearned = label;
        window.clearTimeout(addLearned.timer);
        addLearned.timer = window.setTimeout(() => {
          if (state.lastLearned === label) {
            state.lastLearned = "";
            renderLearned();
          }
        }, 820);
      }
      renderLearned();
    }

    function learnedBadgeMeta(label) {
      const note = Object.keys(NOTE_NAMES).find((key) => label.startsWith(`${key} `));
      if (note) {
        const stage = Object.values(STAGES).find((candidate) => candidate.notes?.includes(note));
        const color = stage ? `#${stage.accent.toString(16).padStart(6, "0")}` : "#ffd86f";
        return { kind: "pitch", color };
      }
      if (label.includes("大三")) return { kind: "chord", color: "#ffd86f" };
      if (label.includes("小三")) return { kind: "chord", color: "#8fd3ff" };
      if (label.includes("减三")) return { kind: "chord", color: "#ff8fa2" };
      return { kind: "card", color: "#dff8d6" };
    }

    function renderLearned() {
      learnedTitle.textContent = state.learned.length ? `音乐图鉴 ${state.learned.length}` : "音乐图鉴";
      if (!state.learned.length) {
        learnedList.innerHTML = '<span class="learned-empty">还没有音卡</span>';
        return;
      }
      learnedList.innerHTML = state.learned
        .map((label) => {
          const meta = learnedBadgeMeta(label);
          return `<span class="learned-badge ${label === state.lastLearned ? "new" : ""}" data-kind="${meta.kind}" style="--card-color:${meta.color}">${label}</span>`;
        })
        .join("");
    }

    function renderProgressPath3D() {
      progressPathGroup.clear();
      const stage = STAGES[state.stage];
      const count = stage.rounds;
      const markerSlots = Array.from({ length: count }, (_, index) => {
        const slot = count === 1 ? 0.5 : index / (count - 1);
        return {
          step: index + 1,
          slot,
          lon: normalizeLon(-2.38 + slot * Math.PI * 1.55),
          lat: 0.22 + Math.sin(slot * Math.PI * 1.9 - 0.5) * 0.34
        };
      });
      for (let index = 0; index < markerSlots.length - 1; index += 1) {
        const from = markerSlots[index];
        const to = markerSlots[index + 1];
        const beadCount = 4;
        for (let beadIndex = 1; beadIndex <= beadCount; beadIndex += 1) {
          const t = beadIndex / (beadCount + 1);
          const step = index + 1;
          const done = step < state.round;
          const current = step === state.round;
          const bead = new THREE.Mesh(
            new THREE.SphereGeometry(current ? 5.8 : 4.5, 10, 8),
            toonMat(done ? 0x6fd082 : current ? stage.accent : 0xf7f3df)
          );
          const lat = THREE.MathUtils.lerp(from.lat, to.lat, t) + Math.sin((index + t) * 2.2) * 0.018;
          const lon = normalizeLon(from.lon + shortestLonDelta(from.lon, to.lon) * t);
          placeOnGlobe(bead, lat, lon, current ? 16 : 10);
          bead.userData.isProgressBead = true;
          bead.userData.current = current;
          bead.userData.baseScale = current ? 1.08 : 0.86;
          progressPathGroup.add(bead);
        }
      }
      for (let index = 0; index < count; index += 1) {
        const step = index + 1;
        const isDone = step < state.round;
        const isCurrent = step === state.round;
        const pathSlot = markerSlots[index];
        const marker = new THREE.Group();
        const baseColor = isDone ? 0x6fd082 : isCurrent ? stage.accent : 0xf7f3df;
        if (isCurrent) {
          const glow = new THREE.Mesh(
            new THREE.RingGeometry(24, 34, 48),
            new THREE.MeshBasicMaterial({
              color: stage.accent,
              transparent: true,
              opacity: 0.28,
              depthWrite: false,
              side: THREE.DoubleSide
            })
          );
          glow.rotation.x = -Math.PI / 2;
          glow.position.y = 2.2;
          glow.userData.isProgressGlow = true;
          marker.add(glow);
        }
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(isCurrent ? 14 : 11, isCurrent ? 18 : 14, isCurrent ? 12 : 9, 18),
          toonMat(baseColor)
        );
        base.position.y = 6;
        marker.add(base);
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(isCurrent ? 16 : 12, 2.2, 8, 24),
          new THREE.MeshBasicMaterial({ color: 0x25231f, transparent: true, opacity: isCurrent ? 0.82 : 0.5 })
        );
        rim.position.y = isCurrent ? 13 : 10;
        rim.rotation.x = Math.PI / 2;
        marker.add(rim);
        const note = makeSpriteGlyph(isDone ? "✓" : isCurrent ? "♪" : "·", isDone ? "#25231f" : isCurrent ? "#25231f" : "#8f927f", isCurrent ? 52 : 44);
        note.position.y = isCurrent ? 34 : 26;
        note.scale.set(isCurrent ? 22 : 16, isCurrent ? 22 : 16, 1);
        note.material.depthTest = false;
        marker.add(note);
        if (isCurrent) {
          const flag = makeTinyFlag(stage.accent, index);
          flag.position.y = 34;
          flag.scale.setScalar(0.62);
          marker.add(flag);
        }
        placeOnGlobe(marker, pathSlot.lat, pathSlot.lon, isCurrent ? 18 : 12);
        marker.userData.isProgressMarker = true;
        marker.userData.step = step;
        marker.userData.current = isCurrent;
        marker.userData.baseScale = isCurrent ? 1.1 : 0.88;
        progressPathGroup.add(marker);
      }
    }

    function renderCoach(title, text, tone = "") {
      coach.className = `coach ${tone}`.trim();
      coach.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
    }

    function updateMissionCard() {
      const stage = STAGES[state.stage];
      missionEyebrow.textContent = stage.badge || (stage.kind === "note" ? "音高训练" : "和弦训练");
      missionTitle.textContent = stage.kind === "note" ? "猫粮开饭啦" : "和弦猫出没";
      missionText.textContent = stage.kind === "note"
        ? `${stage.lesson} 本关只练 ${stage.notes.join(" / ")}，先听猫粮，再找叫声一样的猫。`
        : `${stage.lesson} 猫粮会播放一种和弦颜色，去找叫声颜色一样的猫。`;
      mission.classList.toggle("hidden", !state.missionOpen);
      pageEl.classList.toggle("mission-open", state.missionOpen);
    }

    function openMission() {
      state.missionOpen = false;
      updateMissionCard();
    }

    function beginMission() {
      state.missionOpen = false;
      mission.classList.add("hidden");
      pageEl.classList.remove("mission-open");
      playFoodCue(state.target);
      markTargetHeard();
      bowl.userData.bumpUntil = performance.now() + 420;
      emitNoteBurst(8);
      emitSoundWave(bowl.getWorldPosition(new THREE.Vector3()), state.target, { hidden: true, compact: true });
      emitSoundTrailToGlobe(state.target);
      renderFeedback("猫粮已响", "去点猫，对上就抓去投喂。");
      updateCoach();
      updateGestureGuide();
    }

    function updateCoach() {
      if (state.solved) {
        const stage = STAGES[state.stage];
        renderCoach("喂饱啦", state.round >= stage.rounds ? "点完成领取奖励。" : "点下一只继续。", "good");
        return;
      }
      if (state.draggingCat) {
        if (isNearBowl(state.draggingCat)) {
          renderCoach("松手", "投喂判定。", "hot");
          return;
        }
        renderCoach("抓住猫", "拖到左下碗。", "hot");
        return;
      }
      if (state.selectedCat) {
        renderCoach("听过了", "像就抓走。");
        return;
      }
      if (state.heardTarget) {
        renderCoach("点猫", "找同一个声音。");
        return;
      }
      renderCoach("先听", "点猫粮记声音。");
    }

    function updateGestureGuide() {
      const shouldHide = state.missionOpen || state.solved || state.draggingCat || state.groupRewardOpen;
      gestureGuide.classList.toggle("show", !shouldHide && state.heardTarget);
      if (shouldHide || !state.heardTarget) return;
      if (state.selectedCat) {
        gestureTitle.textContent = "抓起猫去投喂";
        gestureText.textContent = "觉得像，就拖到左下猫碗。";
        gestureGuide.querySelector(".gesture-hand").textContent = "↘";
        return;
      }
      gestureTitle.textContent = "点猫听叫声";
      gestureText.textContent = "不会显示答案，要靠耳朵判断。";
      gestureGuide.querySelector(".gesture-hand").textContent = "☝";
    }

    function showToast(message, type) {
      toast.textContent = message;
      toast.className = `toast show ${type}`;
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => {
        toast.className = "toast";
      }, 1400);
    }

    function showRoundBanner(message, tone = "") {
      roundBanner.textContent = message;
      roundBanner.className = `round-banner show ${tone}`.trim();
      window.clearTimeout(showRoundBanner.timer);
      showRoundBanner.timer = window.setTimeout(() => {
        roundBanner.className = "round-banner";
      }, 920);
    }

    function showComboBurst(points, combo, reset = false) {
      comboBurst.innerHTML = reset
        ? `<strong>RESET</strong><span>重新听一次</span>`
        : `<strong>+${points}</strong><span>${combo > 1 ? `combo ${combo}` : "nice catch"}</span>`;
      comboBurst.className = `combo-burst show ${reset ? "reset" : ""}`.trim();
      window.clearTimeout(showComboBurst.timer);
      showComboBurst.timer = window.setTimeout(() => {
        comboBurst.className = "combo-burst";
      }, 980);
    }

    function updateNextButtonLabel() {
      const stage = STAGES[state.stage];
      nextBtn.textContent = state.round >= stage.rounds ? "完成本组" : "继续收集";
      nextBtn.classList.toggle("ready", state.solved);
    }

    function stageProgressCopy() {
      const stage = STAGES[state.stage];
      return `${state.round}/${stage.rounds}`;
    }

    function rewardCopy(item) {
      if (item.kind === "note") {
        return {
          title: `收集 ${item.note} · ${NOTE_NAMES[item.note]}`,
          text: `刚才那只猫的叫声高度就是 ${item.note}。听见相同高度，就能把它收进音乐图鉴。`,
          meta: "点这里喂下一只"
        };
      }
      return {
        title: `收集 ${CHORDS[item.chord].label}`,
        text: `你听出了这种和弦颜色：${CHORDS[item.chord].tip}。结构 ${CHORDS[item.chord].intervals.join(" - ")} 已收进图鉴。`,
        meta: "点这里继续挑战"
      };
    }

    function showRewardCard(item) {
      const copy = rewardCopy(item);
      state.groupRewardOpen = false;
      rewardCard.classList.remove("group-clear");
      rewardTitle.textContent = copy.title;
      rewardText.textContent = copy.text;
      rewardMeta.textContent = state.round >= STAGES[state.stage].rounds ? `音卡 ${stageProgressCopy()} · 完成本组` : `音卡 ${stageProgressCopy()} · ${copy.meta}`;
      rewardCard.classList.add("show");
      pageEl.classList.add("reward-open");
    }

    function showGroupRewardCard(stageKey) {
      const stage = STAGES[stageKey];
      state.groupRewardOpen = true;
      const learned = state.learned.length ? state.learned.join(" / ") : "刚开始建立音感";
      const stars = stage.kind === "note"
        ? (state.learned.length >= Math.min(stage.notes.length, stage.rounds) ? "★★★" : "★★☆")
        : "★★★";
      const nextHint = stageKey === "note3"
        ? "下一组会加入 G / A，地图更热闹。"
        : stageKey === "note5"
          ? "下一组进入和弦颜色，开始听明亮和柔和。"
          : "可以继续刷一组，把和弦颜色听得更稳。";
      rewardTitle.textContent = `${stars} 训练完成`;
      rewardText.textContent = stage.kind === "note"
        ? `${stage.intro}：你练了 ${stage.notes.join(" / ")}，收集音卡 ${learned}。${nextHint}`
        : `${stage.intro}：你听了和弦颜色，收集 ${learned}。${nextHint}`;
      rewardMeta.textContent = "点这里收起结算 · 再刷一组";
      rewardCard.classList.add("group-clear");
      rewardCard.classList.add("show");
      pageEl.classList.add("reward-open");
    }

    function hideRewardCard() {
      state.groupRewardOpen = false;
      rewardCard.classList.remove("group-clear");
      rewardCard.classList.remove("show");
      pageEl.classList.remove("reward-open");
    }

    function currentPromptText(stage) {
      if (state.solved) return "喂对了，领取奖励";
      if (state.draggingCat) return "抓起猫，拖到左下猫碗";
      if (state.selectedCat) return "声音像的话，把猫拖去吃饭";
      if (state.heardTarget) return stage.prompt;
      return "先点猫粮，记住声音";
    }

    function updateQuestRibbon(stage) {
      let mode = "listen";
      let icon = "♪";
      let title = "先听猫粮";
      let text = stage.kind === "note"
        ? `本轮练 ${stage.notes.join(" / ")}，先把目标音高装进耳朵。`
        : "先听一口猫粮的和弦颜色，再去找同色猫。";

      if (state.solved) {
        mode = "feed";
        icon = "★";
        title = "音卡收集成功";
        text = state.round >= stage.rounds ? "这组快完成了，领取结算奖励。" : "点下一张音卡，继续升级耳朵。";
      } else if (state.draggingCat) {
        mode = "feed";
        icon = "↘";
        title = "拖到猫粮碗";
        text = "松手投喂，正确就收集一张音乐卡。";
      } else if (state.selectedCat) {
        mode = "feed";
        icon = "♡";
        title = "像的话就抓走";
        text = "不确定可以再点猫粮，听完再决定。";
      } else if (state.heardTarget) {
        mode = "catch";
        icon = "☝";
        title = "寻找同声猫";
        text = "点击星球上的猫，听听哪只和猫粮一样。";
      }

      questRibbon.className = `quest-ribbon ${mode}`;
      questRibbon.dataset.icon = icon;
      questTitle.textContent = title;
      questText.textContent = text;
    }

    function updateHeader() {
      const stage = STAGES[state.stage];
      scoreEl.textContent = state.score;
      comboMini.textContent = `combo ${state.combo}`;
      comboMini.classList.toggle("hot", state.combo > 1);
      roundEl.textContent = `${state.round} / ${stage.rounds}`;
      promptEl.textContent = `${state.round}. ${currentPromptText(stage)}`;
      pageEl.classList.toggle("hunt-open", state.heardTarget && !state.solved);
      pageEl.classList.toggle("dragging-cat", Boolean(state.draggingCat));
      lessonBar.innerHTML = Array.from({ length: stage.rounds }, (_, index) => {
        const step = index + 1;
        const className = step < state.round ? "done" : step === state.round ? "current" : "";
        return `<span class="${className}"></span>`;
      }).join("");
      renderProgressPath3D();
      updateQuestRibbon(stage);
      updateNextButtonLabel();
      updateGestureGuide();
    }

    function updateListenUi() {
      listenBtn.textContent = state.heardTarget ? "再听一次" : "播放猫粮";
      listenBtn.classList.toggle("heard", state.heardTarget);
    }

    function markTargetHeard() {
      state.heardTarget = true;
      const now = performance.now();
      state.lastBowlChimeAt = now;
      state.listenPulseUntil = now + 1180;
      state.lastWorldSpinAt = now;
      updateListenUi();
      updateHeader();
      updateCoach();
      updateGestureGuide();
    }

    function syncDebugState() {
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();
      const rect = renderer.domElement.getBoundingClientRect();
      const projectToScreen = (object) => {
        const pos = object.getWorldPosition(new THREE.Vector3()).project(camera);
        return {
          x: Math.round((pos.x + 1) * 0.5 * rect.width),
          y: Math.round((1 - pos.y) * 0.5 * rect.height),
          ndcX: Number(pos.x.toFixed(3)),
          ndcY: Number(pos.y.toFixed(3))
        };
      };
      sceneEl.dataset.cats = JSON.stringify(state.cats.map((choice) => {
        const sprite = choice.sprite;
        const projected = sprite ? projectToScreen(sprite) : null;
        return {
          id: choice.id,
          isTarget: choice.id === state.target.id,
          x: sprite ? Math.round(sprite.position.x) : 0,
          y: sprite ? Math.round(sprite.position.y) : 0,
          z: sprite ? Math.round(sprite.position.z) : 0,
          screenX: projected?.x ?? 0,
          screenY: projected?.y ?? 0,
          lift: sprite ? Number((sprite.userData.lift || 0).toFixed(2)) : 0,
          mood: sprite?.userData.parts?.faceSprite?.userData?.mood || "normal",
          visible: sprite ? sprite.visible : false
        };
      }));
      sceneEl.dataset.solved = String(state.solved);
      sceneEl.dataset.lastFrame = String(Math.round(state.lastTime || 0));
      sceneEl.dataset.globe = JSON.stringify({
        x: Math.round(globeGroup.position.x),
        y: Math.round(globeGroup.position.y),
        radius: world.radius,
        rotX: Number(globeGroup.rotation.x.toFixed(3)),
        rotY: Number(globeGroup.rotation.y.toFixed(3)),
        progressMarkers: progressPathGroup.children.length,
        groupRewardOpen: state.groupRewardOpen,
        hints: state.catHints.length,
        learnCards: state.learnCards3d.length,
        knowledgeBadges: state.knowledgeBadges3d.length,
        masteryTokens: state.masteryTokens3d.length,
        travelers: ambientMusicLayer.children.filter((item) => item.userData.isPlanetTraveler).length,
        soundTrails: state.soundTrails.length
      });
      sceneEl.dataset.projection = JSON.stringify({
        globe: projectToScreen(globeGroup),
        bowl: projectToScreen(bowl)
      });
    }

    function resetRound() {
      state.solved = false;
      state.target = makeTarget();
      state.cats = makeChoices(state.target);
      state.selectedCat = null;
      state.draggingCat = null;
      state.heardTarget = false;
      state.sampledCat = false;
      state.soundTrails.forEach((trail) => {
        scene.remove(trail);
        trail.material?.map?.dispose?.();
        trail.material?.dispose?.();
      });
      state.soundTrails = [];
      state.knowledgeBadges3d.forEach((badge) => {
        scene.remove(badge);
        badge.material?.map?.dispose?.();
        badge.material?.dispose?.();
      });
      state.knowledgeBadges3d = [];
      nextBtn.disabled = true;
      hideRewardCard();
      comboBurst.className = "combo-burst";
      catGroup.clear();
      hintGroup.clear();
      state.catHints = [];
      renderCats();
      updateHeader();
      renderLearned();
      renderFeedback(STAGES[state.stage].intro, lessonText());
      updateListenUi();
      updateCoach();
      updateMissionCard();
      syncDebugState();
      if (!state.missionOpen) {
        emitRoundStartBloom();
      }
      if (state.round > 1) {
        state.celebrateUntil = performance.now() + 360;
      }
    }

    function lessonText() {
      const stage = STAGES[state.stage];
      return stage.lesson;
    }

    function renderCats() {
      const starts = makeCatStarts(state.cats.length);
      const now = performance.now();
      state.cats.forEach((choice, index) => {
        const start = starts[index];
        const firstTarget = randomGlobePoint(start.lat, start.lon);
        const sprite = makeBlockCat(index);
        const parts = sprite.userData.parts || {};
        placeOnGlobe(sprite, start.lat, start.lon, 4);
        sprite.userData = {
          type: "cat",
          choice,
          parts,
          speed: start.speed,
          lat: start.lat,
          lon: start.lon,
          homeLat: start.lat,
          homeLon: start.lon,
          targetLat: firstTarget.lat,
          targetLon: firstTarget.lon,
          visualScale: 1.5,
          bobSeed: Math.random() * 10,
          pickedUntil: 0,
          wrongUntil: 0,
          rejectedUntil: 0,
          happyUntil: 0,
          listened: false,
          lift: 0,
          dragging: false,
          fed: false,
          walkHeading: 0,
          idleAction: "listen",
          idleUntil: 0,
          idleStartedAt: 0,
          idleGlyph: index % 2 ? "♪" : "♡",
          listenSeed: Math.random() * Math.PI * 2,
          spawnAt: now + index * 110,
          spawnUntil: now + 760 + index * 110
        };
        choice.sprite = sprite;
        catGroup.add(sprite);
        emitCatSpawn(sprite, index);
        const hint = makeHintBubble("喵");
        const radar = makePawSprite(index % 2 ? "#fff7d8" : "#ffffff");
        radar.scale.set(22, 22, 1);
        radar.material.opacity = 0;
        radar.material.depthTest = false;
        radar.renderOrder = 67;
        radar.visible = false;
        hint.userData.choice = choice;
        hint.userData.radar = radar;
        hintGroup.add(hint);
        hintGroup.add(radar);
        state.catHints.push(hint);
      });
    }

    function makeCatStarts(count) {
      const latitudeLane = [-0.12, 0.08, -0.26, 0.18, -0.02];
      const frontSlots = count <= 3
        ? [-0.78, 0.1, 0.86]
        : [-1.05, -0.48, 0.1, 0.68, 1.12];
      return Array.from({ length: count }, (_, index) => {
        const lane = latitudeLane[index % latitudeLane.length];
        const slotLon = frontSlots[index % frontSlots.length];
        const roundOffset = Math.sin(state.round * 0.77 + index * 1.31) * 0.12;
        const lon = slotLon + roundOffset;
        return {
          lat: THREE.MathUtils.clamp(lane + Math.sin(state.round + index * 1.9) * 0.035, -0.38, 0.24),
          lon: normalizeLon(lon),
          speed: CAT_STARTS[index % CAT_STARTS.length].speed
        };
      });
    }

    function makeBlockCat(index) {
      const styles = [
        { body: 0xfff7e7, patch: 0xf0b35f, collar: 0x5aa7ff },
        { body: 0xffd27d, patch: 0xfffbef, collar: 0x39c778 },
        { body: 0xf9f8f0, patch: 0x30363a, collar: 0xffcf5b },
        { body: 0xe7f2f6, patch: 0x86aeca, collar: 0xff7f9a },
        { body: 0xf6e3c0, patch: 0xc87942, collar: 0x9b7dff }
      ];
      const style = styles[index % styles.length];
      const group = new THREE.Group();
      group.userData.type = "cat";
      group.userData.parts = { feet: [], toeBeans: [], ears: [], eyes: [], eyeShines: [], whiskers: [], blush: [], stripes: [], liftMarks: [], cheeks: [], highlightMarks: [] };
      const bodyMat = toonMat(style.body);
      const patchMat = toonMat(style.patch);
      const collarMat = toonMat(style.collar);
      const faceMat = toonMat(0xfffbec);
      const innerEarMat = toonMat(0xffb7ac);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x20251f });
      const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const noseMat = toonMat(0xff7f92);
      const whiskerMat = new THREE.MeshBasicMaterial({ color: 0x283028 });
      const footMat = toonMat(style.patch);
      const outlineMat = new THREE.MeshBasicMaterial({ color: 0x25231f, side: THREE.BackSide });
      const highlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
        depthTest: false
      });
      const addInkOutline = (mesh, amount = 1.075) => {
        const outline = new THREE.Mesh(mesh.geometry, outlineMat);
        outline.scale.setScalar(amount);
        outline.userData.noShadow = true;
        outline.userData.hitOwner = group;
        mesh.add(outline);
        return outline;
      };

      const hitArea = new THREE.Mesh(
        new THREE.SphereGeometry(92, 14, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hitArea.position.set(8, 42, 0);
      hitArea.userData.hitOwner = group;
      hitArea.userData.noShadow = true;
      group.add(hitArea);

      const body = new THREE.Mesh(new THREE.SphereGeometry(38, 22, 16), bodyMat);
      body.scale.set(1.62, 0.9, 1.16);
      body.position.y = 34;
      body.userData.hitOwner = group;
      body.userData.baseScale = body.scale.clone();
      addInkOutline(body, 1.055);
      group.add(body);
      group.userData.parts.body = body;

      const bodyHighlight = new THREE.Mesh(new THREE.SphereGeometry(18, 14, 8), highlightMat.clone());
      bodyHighlight.scale.set(1.45, 0.15, 0.48);
      bodyHighlight.position.set(6, 63, -18);
      bodyHighlight.rotation.set(0.1, 0.2, -0.18);
      bodyHighlight.userData.hitOwner = group;
      bodyHighlight.userData.noShadow = true;
      bodyHighlight.renderOrder = 57;
      group.add(bodyHighlight);
      group.userData.parts.highlightMarks.push(bodyHighlight);

      const belly = new THREE.Mesh(new THREE.SphereGeometry(19, 16, 10), faceMat);
      belly.scale.set(0.4, 0.74, 1.05);
      belly.position.set(42, 29, 0);
      belly.userData.hitOwner = group;
      group.add(belly);

      const bodySpot = new THREE.Mesh(new THREE.SphereGeometry(21, 14, 9), patchMat);
      bodySpot.scale.set(1.35, 0.2, 0.78);
      bodySpot.position.set(-10, 57, -29);
      bodySpot.rotation.x = 0.15;
      bodySpot.userData.hitOwner = group;
      group.add(bodySpot);

      const softBackPatch = new THREE.Mesh(new THREE.SphereGeometry(17 + (index % 2) * 3, 13, 8), patchMat);
      softBackPatch.scale.set(1.18, 0.16, 0.62);
      softBackPatch.position.set(-30, 54, 22);
      softBackPatch.rotation.set(-0.08, -0.25, 0.12);
      softBackPatch.userData.hitOwner = group;
      group.add(softBackPatch);

      const head = new THREE.Mesh(new THREE.SphereGeometry(31, 22, 16), bodyMat);
      head.scale.set(1.24, 1.08, 1.12);
      head.position.set(51, 55, 0);
      head.userData.hitOwner = group;
      head.userData.baseScale = head.scale.clone();
      addInkOutline(head, 1.07);
      group.add(head);
      group.userData.parts.head = head;

      const foreheadGlow = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 7), highlightMat.clone());
      foreheadGlow.scale.set(0.86, 0.12, 0.42);
      foreheadGlow.position.set(66, 73, -8);
      foreheadGlow.rotation.set(0.05, 0.12, -0.22);
      foreheadGlow.userData.hitOwner = group;
      foreheadGlow.userData.noShadow = true;
      foreheadGlow.renderOrder = 58;
      group.add(foreheadGlow);
      group.userData.parts.highlightMarks.push(foreheadGlow);

      const face = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 10), faceMat);
      face.scale.set(0.42, 0.9, 1.08);
      face.position.set(75, 50, 0);
      face.userData.hitOwner = group;
      group.add(face);

      if (index % 2 === 0) {
        const headPatch = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 8), patchMat);
        headPatch.scale.set(0.72, 0.42, 0.82);
        headPatch.position.set(56, 68, -13);
        headPatch.rotation.x = -0.25;
        headPatch.userData.hitOwner = group;
        group.add(headPatch);
      }

      [-1, 0, 1].forEach((stripeIndex) => {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.6, 14 - Math.abs(stripeIndex) * 2, 3.4), patchMat);
        stripe.position.set(78, 69 - Math.abs(stripeIndex) * 2, stripeIndex * 6.5);
        stripe.rotation.set(0.18, 0, stripeIndex * 0.16);
        stripe.userData.hitOwner = group;
        group.add(stripe);
        group.userData.parts.stripes.push(stripe);
      });

      [[42, -18, -0.14], [42, 18, 0.14]].forEach(([x, z, lean]) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(13.5, 31, 4), bodyMat);
        ear.position.set(x, 85, z);
        ear.rotation.set(0, lean, -0.18);
        ear.userData.baseRotZ = ear.rotation.z;
        ear.userData.hitOwner = group;
        addInkOutline(ear, 1.09);
        group.add(ear);
        group.userData.parts.ears.push(ear);

        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(6.5, 16, 4), innerEarMat);
        innerEar.position.set(x + 3, 80, z);
        innerEar.rotation.copy(ear.rotation);
        innerEar.scale.set(0.72, 0.72, 0.72);
        innerEar.userData.hitOwner = group;
        group.add(innerEar);
      });

      [[79, -8.5], [79, 8.5]].forEach(([x, z]) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(6.2, 14, 9), eyeMat);
        eye.scale.set(0.34, 1.18, 0.78);
        eye.position.set(x, 58, z);
        eye.userData.baseScale = eye.scale.clone();
        eye.userData.hitOwner = group;
        group.add(eye);
        group.userData.parts.eyes.push(eye);

        const shine = new THREE.Mesh(new THREE.SphereGeometry(1.65, 8, 6), shineMat);
        shine.scale.set(0.42, 1.12, 0.86);
        shine.position.set(x + 1.8, 61.2, z - Math.sign(z) * 1.8);
        shine.userData.baseScale = shine.scale.clone();
        shine.userData.hitOwner = group;
        group.add(shine);
        group.userData.parts.eyeShines.push(shine);
      });

      [-1, 1].forEach((side) => {
        const sideEye = new THREE.Mesh(new THREE.SphereGeometry(5.9, 14, 9), eyeMat);
        sideEye.scale.set(0.5, 1.1, 0.78);
        sideEye.position.set(70, 58, side * 23);
        sideEye.userData.baseScale = sideEye.scale.clone();
        sideEye.userData.hitOwner = group;
        group.add(sideEye);
        group.userData.parts.eyes.push(sideEye);

        const sideShine = new THREE.Mesh(new THREE.SphereGeometry(1.65, 8, 6), shineMat);
        sideShine.scale.set(0.46, 1.08, 0.86);
        sideShine.position.set(71.8, 61.4, side * 21.2);
        sideShine.userData.baseScale = sideShine.scale.clone();
        sideShine.userData.hitOwner = group;
        group.add(sideShine);
        group.userData.parts.eyeShines.push(sideShine);
      });

      const nose = new THREE.Mesh(new THREE.SphereGeometry(3.7, 10, 7), noseMat);
      nose.position.set(84, 49, 0);
      nose.scale.set(0.58, 0.75, 1);
      nose.userData.hitOwner = group;
      group.add(nose);

      const mouth = new THREE.Mesh(
        new THREE.TorusGeometry(4.3, 0.55, 5, 12, Math.PI),
        eyeMat
      );
      mouth.position.set(84, 44, 0);
      mouth.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      mouth.userData.hitOwner = group;
      group.add(mouth);

      const faceSprite = makeCatFaceSprite(index);
      faceSprite.position.set(89, 58, 0);
      faceSprite.userData.hitOwner = group;
      faceSprite.userData.noShadow = true;
      group.add(faceSprite);
      group.userData.parts.faceSprite = faceSprite;

      [-1, 1].forEach((side) => {
        const cheek = new THREE.Mesh(new THREE.SphereGeometry(8.5, 12, 8), faceMat);
        cheek.position.set(76, 48, side * 17);
        cheek.scale.set(0.42, 0.62, 0.86);
        cheek.userData.baseScale = cheek.scale.clone();
        cheek.userData.hitOwner = group;
        group.add(cheek);
        group.userData.parts.cheeks.push(cheek);
      });

      const emote = makeSpriteGlyph(index % 2 ? "♪" : "♡", index % 2 ? "#8fd3ff" : "#ff8fa2", 58);
      emote.position.set(58, 96, 0);
      emote.scale.set(26, 26, 1);
      emote.material.opacity = 0;
      emote.material.depthTest = false;
      emote.renderOrder = 62;
      emote.userData.hitOwner = group;
      emote.userData.noShadow = true;
      group.add(emote);
      group.userData.parts.emote = emote;

      ["♪", "♡", "✦"].forEach((glyph, markIndex) => {
        const mark = makeSpriteGlyph(glyph, ["#ffd86f", "#ff8fa2", "#8fd3ff"][markIndex], glyph === "✦" ? 48 : 54);
        mark.position.set(30 + markIndex * 18, 92 + markIndex * 4, (markIndex - 1) * 30);
        mark.scale.set(18, 18, 1);
        mark.material.opacity = 0;
        mark.material.depthTest = false;
        mark.renderOrder = 63 + markIndex;
        mark.userData.hitOwner = group;
        mark.userData.noShadow = true;
        mark.userData.seed = markIndex * 1.4 + index;
        group.add(mark);
        group.userData.parts.liftMarks.push(mark);
      });

      const grabHook = new THREE.Group();
      const hookRing = new THREE.Mesh(
        new THREE.TorusGeometry(18, 2.8, 8, 28),
        new THREE.MeshBasicMaterial({
          color: 0xffd86f,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        })
      );
      hookRing.rotation.x = Math.PI / 2;
      grabHook.add(hookRing);
      const hookLine = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 54, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false
        })
      );
      hookLine.position.y = 34;
      grabHook.add(hookLine);
      grabHook.position.set(48, 91, 0);
      grabHook.userData.noShadow = true;
      grabHook.userData.ring = hookRing;
      grabHook.userData.line = hookLine;
      group.add(grabHook);
      group.userData.parts.grabHook = grabHook;

      const interactRing = new THREE.Mesh(
        new THREE.RingGeometry(38, 49, 48),
        new THREE.MeshBasicMaterial({
          color: 0xffd86f,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide
        })
      );
      interactRing.rotation.x = -Math.PI / 2;
      interactRing.position.set(4, 5, 0);
      interactRing.userData.hitOwner = group;
      interactRing.userData.noShadow = true;
      interactRing.renderOrder = 43;
      group.add(interactRing);
      group.userData.parts.interactRing = interactRing;

      const collar = new THREE.Mesh(new THREE.TorusGeometry(19, 2.8, 8, 24), collarMat);
      collar.position.set(34, 43, 0);
      collar.rotation.set(Math.PI / 2, 0.06, 0);
      collar.scale.set(0.8, 1, 1);
      collar.userData.hitOwner = group;
      group.add(collar);

      const bell = new THREE.Mesh(new THREE.SphereGeometry(4.8, 10, 7), toonMat(0xffd86f));
      bell.position.set(48, 34, 0);
      bell.scale.set(0.75, 1, 1);
      bell.userData.hitOwner = group;
      group.add(bell);

      const accessoryColor = [0xff8fa2, 0x8fd3ff, 0xffd86f, 0x6fd082, 0x9b7dff][index % 5];
      const accessoryMat = toonMat(accessoryColor);
      if (index % 3 === 0) {
        const beret = new THREE.Group();
        const cap = new THREE.Mesh(new THREE.SphereGeometry(15, 14, 8), accessoryMat);
        cap.scale.set(1.34, 0.26, 0.92);
        cap.position.set(49, 76, -2);
        beret.add(cap);
        const nub = new THREE.Mesh(new THREE.SphereGeometry(3.4, 8, 6), accessoryMat);
        nub.position.set(50, 82, -2);
        beret.add(nub);
        beret.userData.noShadow = false;
        group.add(beret);
        group.userData.parts.accessory = beret;
      } else if (index % 3 === 1) {
        const scarf = new THREE.Group();
        const wrap = new THREE.Mesh(new THREE.TorusGeometry(20, 3.4, 8, 26), accessoryMat);
        wrap.position.set(35, 42, 0);
        wrap.rotation.set(Math.PI / 2, 0.05, 0);
        wrap.scale.set(0.82, 1.04, 1);
        scarf.add(wrap);
        const tailA = new THREE.Mesh(new THREE.BoxGeometry(6, 22, 10), accessoryMat);
        tailA.position.set(34, 29, -18);
        tailA.rotation.x = 0.3;
        scarf.add(tailA);
        group.add(scarf);
        group.userData.parts.accessory = scarf;
      } else {
        const pack = new THREE.Group();
        const bag = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 8), accessoryMat);
        bag.scale.set(0.78, 0.62, 1.12);
        bag.position.set(2, 42, -34);
        pack.add(bag);
        const strap = new THREE.Mesh(new THREE.TorusGeometry(18, 1.8, 6, 20), collarMat);
        strap.position.set(9, 43, -19);
        strap.rotation.set(Math.PI / 2, 0.2, 0.42);
        pack.add(strap);
        group.add(pack);
        group.userData.parts.accessory = pack;
      }

      [-1, 1].forEach((side) => {
        for (let i = 0; i < 3; i += 1) {
          const whisker = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.7, 22, 5),
            whiskerMat
          );
          whisker.position.set(82, 44 + i * 3, side * (13 + i * 2));
          whisker.rotation.x = Math.PI / 2 + side * 0.1;
          whisker.rotation.z = (i - 1) * 0.1;
          whisker.userData.baseRotZ = whisker.rotation.z;
          whisker.userData.hitOwner = group;
          group.add(whisker);
          group.userData.parts.whiskers.push(whisker);
        }
      });

      [-1, 1].forEach((side) => {
        const blush = new THREE.Mesh(new THREE.SphereGeometry(3.4, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffa6b2 }));
        blush.position.set(73, 45, side * 18);
        blush.scale.set(0.5, 0.64, 1);
        blush.userData.hitOwner = group;
        group.add(blush);
        group.userData.parts.blush.push(blush);
      });

      [[-16, -17], [18, -17], [-16, 17], [18, 17]].forEach(([x, z]) => {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(8.2, 12, 8), footMat);
        foot.scale.set(1.38, 0.7, 1.08);
        foot.position.set(x * 1.15, 8, z * 1.15);
        foot.userData.baseX = foot.position.x;
        foot.userData.baseY = foot.position.y;
        foot.userData.baseZ = foot.position.z;
        foot.userData.baseScale = foot.scale.clone();
        foot.userData.hitOwner = group;
        addInkOutline(foot, 1.08);
        [-1, 0, 1].forEach((toe, toeIndex) => {
          const bean = new THREE.Mesh(new THREE.SphereGeometry(toeIndex === 1 ? 2.3 : 1.9, 8, 6), noseMat);
          bean.position.set(5.5, 3.2, toe * 4.2);
          bean.scale.set(0.55, 0.5, 0.78);
          bean.userData.hitOwner = group;
          foot.add(bean);
          group.userData.parts.toeBeans.push(bean);
        });
        group.add(foot);
        group.userData.parts.feet.push(foot);
      });

      const tail = new THREE.Mesh(new THREE.TorusGeometry(30, 7.2, 10, 24, Math.PI * 1.35), bodyMat);
      tail.position.set(-48, 48, 4);
      tail.rotation.set(Math.PI / 2, 0.24, -0.46);
      tail.userData.baseRotX = tail.rotation.x;
      tail.userData.baseRotY = tail.rotation.y;
      tail.userData.baseRotZ = tail.rotation.z;
      tail.userData.hitOwner = group;
      addInkOutline(tail, 1.05);
      group.add(tail);
      group.userData.parts.tail = tail;

      const tailTip = new THREE.Mesh(new THREE.SphereGeometry(9.4, 12, 8), patchMat);
      tailTip.position.set(-76, 62, 22);
      tailTip.scale.set(1.08, 0.9, 1.08);
      tailTip.userData.baseX = tailTip.position.x;
      tailTip.userData.baseY = tailTip.position.y;
      tailTip.userData.baseZ = tailTip.position.z;
      tailTip.userData.hitOwner = group;
      addInkOutline(tailTip, 1.08);
      group.add(tailTip);
      group.userData.parts.tailTip = tailTip;

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(42, 24),
        new THREE.MeshBasicMaterial({ color: 0x36563a, transparent: true, opacity: 0.18, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 1;
      shadow.userData.hitOwner = group;
      shadow.userData.noShadow = true;
      group.add(shadow);
      group.userData.parts.shadow = shadow;

      const liftBubble = new THREE.Mesh(
        new THREE.SphereGeometry(76, 30, 18),
        new THREE.MeshBasicMaterial({
          color: 0xfff2a6,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          wireframe: true
        })
      );
      liftBubble.scale.set(1.25, 0.72, 0.92);
      liftBubble.position.set(12, 48, 0);
      liftBubble.renderOrder = 61;
      liftBubble.userData.hitOwner = group;
      liftBubble.userData.noShadow = true;
      group.add(liftBubble);
      group.userData.parts.liftBubble = liftBubble;

      const selectRing = new THREE.Mesh(
        new THREE.RingGeometry(44, 55, 48),
        new THREE.MeshBasicMaterial({
          color: 0xffd86f,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide
        })
      );
      selectRing.rotation.x = -Math.PI / 2;
      selectRing.position.y = 2.4;
      selectRing.renderOrder = 44;
      selectRing.userData.hitOwner = group;
      selectRing.userData.noShadow = true;
      group.add(selectRing);
      group.userData.parts.selectRing = selectRing;

      group.traverse((child) => {
        if (child.userData.noShadow) {
          child.castShadow = false;
          child.receiveShadow = false;
          return;
        }
        if (child.isMesh && child.material?.color) {
          child.userData.baseColor = child.material.color.getHex();
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return group;
    }

    function animateCatParts(sprite, now, moving, lifted, listenPulse = 0) {
      const parts = sprite.userData.parts || {};
      const seed = sprite.userData.bobSeed || 0;
      const walk = moving ? 1 : 0.25;
      const phase = now / 105 + seed;
      const happy = sprite.userData.happyUntil && sprite.userData.happyUntil > now ? 1 : 0;
      const wrong = sprite.userData.wrongUntil && sprite.userData.wrongUntil > now ? 1 : 0;
      const grabPop = Math.max(0, ((sprite.userData.grabPopUntil || 0) - now) / 520);
      const grabBounce = grabPop ? Math.sin((1 - grabPop) * Math.PI) : 0;
      const idleLeft = Math.max(0, (sprite.userData.idleUntil || 0) - now);
      const idleActive = idleLeft > 0 && !sprite.userData.dragging && !sprite.userData.fed && sprite !== state.selectedCat;
      const idleAge = Math.max(0, now - (sprite.userData.idleStartedAt || now));
      const idlePulse = idleActive ? Math.sin(Math.min(1, idleAge / 320) * Math.PI) * (0.72 + Math.sin(now / 180 + seed) * 0.12) : 0;
      const idleAction = sprite.userData.idleAction || "listen";
      const sniff = idleAction === "sniff" ? idlePulse : 0;
      const stretch = idleAction === "stretch" ? idlePulse : 0;
      const hop = idleAction === "hop" ? idlePulse : 0;
      const listenIdle = idleAction === "listen" ? idlePulse : 0;
      if (parts.body?.userData.baseScale) {
        const breathe = Math.sin(now / 340 + seed) * 0.018;
        parts.body.scale.set(
          parts.body.userData.baseScale.x * (1 + breathe + lifted * 0.12 + happy * 0.08 - wrong * 0.05 + grabBounce * 0.16 + stretch * 0.16 + hop * 0.08),
          parts.body.userData.baseScale.y * (1 - breathe * 0.6 + lifted * 0.16 + happy * 0.06 - wrong * 0.08 - grabBounce * 0.05 - stretch * 0.1 + hop * 0.14),
          parts.body.userData.baseScale.z * (1 + breathe + lifted * 0.08 + happy * 0.05 + grabBounce * 0.08 + stretch * 0.08)
        );
        parts.body.rotation.z = Math.sin(now / 220 + seed) * 0.025 * walk - lifted * 0.12 + happy * Math.sin(now / 85 + seed) * 0.08 - wrong * 0.08 + grabBounce * 0.16 + listenPulse * Math.sin(now / 70 + seed) * 0.07 + stretch * 0.12 - sniff * 0.05 + hop * Math.sin(now / 90 + seed) * 0.08;
      }
      parts.feet?.forEach((foot, index) => {
        const alternating = index % 2 ? 1 : -1;
        foot.position.x = foot.userData.baseX + Math.sin(phase + alternating * Math.PI * 0.35) * 3.4 * walk - lifted * alternating * 4;
        foot.position.y = foot.userData.baseY + Math.max(0, Math.sin(phase + index * 1.7)) * 5.2 * walk - lifted * (7 + index % 2 * 4) - grabBounce * 6 + Math.sin(now / 95 + index + seed) * lifted * 2.2;
        foot.position.z = foot.userData.baseZ + Math.cos(phase + index) * 1.8 * walk + lifted * (index < 2 ? -11 : 11);
        if (foot.userData.baseScale) {
          foot.scale.set(
            foot.userData.baseScale.x * (1 - lifted * 0.08),
            foot.userData.baseScale.y * (1 + lifted * 0.34),
            foot.userData.baseScale.z
          );
        }
      });
      if (parts.tail) {
        parts.tail.rotation.z = parts.tail.userData.baseRotZ + Math.sin(now / 170 + seed) * (0.28 + lifted * 0.3 + happy * 0.22 + listenIdle * 0.18) + lifted * 0.42 - wrong * 0.22 + grabBounce * 0.26 + stretch * 0.28;
        parts.tail.rotation.y = parts.tail.userData.baseRotY + Math.cos(now / 210 + seed) * (0.12 + lifted * 0.08);
      }
      if (parts.tailTip) {
        parts.tailTip.position.y = parts.tailTip.userData.baseY + Math.sin(now / 150 + seed) * (5 + lifted * 5) + lifted * 8;
        parts.tailTip.position.z = parts.tailTip.userData.baseZ + Math.cos(now / 160 + seed) * (4 + lifted * 2);
      }
      if (parts.head) {
        const blink = Math.sin(now / 1250 + seed) > 0.965 ? 0.16 : 1;
        const curiousTilt = state.heardTarget && !state.solved ? 0.06 : 0;
        parts.head.rotation.z = Math.sin(now / 220 + seed) * 0.08 + lifted * 0.16 + listenPulse * 0.13 + curiousTilt + listenIdle * 0.18 - sniff * 0.08;
        parts.head.rotation.y = Math.sin(now / 280 + seed) * 0.06 + lifted * 0.08 + happy * Math.sin(now / 90 + seed) * 0.08 - wrong * 0.12 + listenPulse * Math.sin(now / 90 + seed) * 0.18 + sniff * 0.16;
        parts.head.position.y = 55 + lifted * 2 + hop * 7 - sniff * 8 + listenIdle * 2;
        if (parts.head.userData.baseScale) {
          parts.head.scale.set(
            parts.head.userData.baseScale.x * (1 + lifted * 0.05 + sniff * 0.03),
            parts.head.userData.baseScale.y * (1 + lifted * 0.04 + happy * 0.06 - wrong * 0.04 + listenPulse * 0.08 + hop * 0.06),
            parts.head.userData.baseScale.z
          );
        }
        parts.eyes?.forEach((eye, index) => {
          const base = eye.userData.baseScale || new THREE.Vector3(0.34, 1.18, 0.78);
          const wide = 1 + lifted * 0.22 + happy * 0.12 + listenPulse * 0.1;
          eye.scale.set(
            base.x * (1 + lifted * 0.08),
            base.y * blink * wide,
            base.z * (1 + lifted * 0.08)
          );
          eye.position.y = 58 + lifted * 1.6 + listenPulse * Math.sin(now / 80 + seed + index) * 1.1;
        });
        parts.eyeShines?.forEach((shine, index) => {
          const base = shine.userData.baseScale || new THREE.Vector3(0.42, 1.12, 0.86);
          const sparkle = 1 + lifted * 0.34 + happy * 0.24 + Math.max(0, Math.sin(now / 120 + seed + index)) * 0.12;
          shine.scale.set(base.x * sparkle, base.y * sparkle, base.z * sparkle);
          shine.material.opacity = THREE.MathUtils.clamp(0.76 + lifted * 0.2 + happy * 0.12, 0.72, 1);
        });
      }
      if (parts.faceSprite) {
        let mood = "normal";
        if (wrong) mood = "wrong";
        else if (happy) mood = "happy";
        else if (lifted > 0.08) mood = "lift";
        else if (listenPulse > 0.08 || listenIdle > 0.08 || (state.heardTarget && !state.solved && !sprite.userData.fed)) mood = "listen";
        if (parts.faceSprite.userData.mood !== mood && parts.faceSprite.userData.textures?.[mood]) {
          parts.faceSprite.userData.mood = mood;
          parts.faceSprite.material.map = parts.faceSprite.userData.textures[mood];
          parts.faceSprite.material.needsUpdate = true;
        }
        const spriteScale = 1 + Math.sin(now / 320 + seed) * 0.025 + lifted * 0.12 + listenPulse * 0.08;
        parts.faceSprite.scale.set(74 * spriteScale, 52 * spriteScale, 1);
        parts.faceSprite.position.y = 59 + Math.sin(now / 260 + seed) * 1.2 + lifted * 4 + listenPulse * 2 + hop * 7 - sniff * 8 + listenIdle * 2;
      }
      parts.cheeks?.forEach((cheek, index) => {
        const puff = 1 + Math.sin(now / 310 + seed + index) * 0.035 + happy * 0.09 + listenPulse * 0.06;
        if (cheek.userData.baseScale) {
          cheek.scale.set(
            cheek.userData.baseScale.x * puff,
            cheek.userData.baseScale.y * (1 + (puff - 1) * 0.6),
            cheek.userData.baseScale.z * puff
          );
        }
      });
      parts.highlightMarks?.forEach((mark, index) => {
        const glow = 0.24 + Math.sin(now / 620 + seed + index) * 0.05 + happy * 0.16 + listenPulse * 0.14;
        mark.material.opacity = THREE.MathUtils.clamp(glow, 0.16, 0.62);
      });
      if (parts.grabHook) {
        const hookOpacity = lifted > 0.08 ? Math.min(0.92, lifted * 1.2) : 0;
        parts.grabHook.visible = hookOpacity > 0.02;
        parts.grabHook.position.y = 91 + Math.sin(now / 110 + seed) * 3 + lifted * 12;
        parts.grabHook.rotation.z = Math.sin(now / 150 + seed) * 0.12;
        parts.grabHook.userData.ring.material.opacity = hookOpacity;
        parts.grabHook.userData.line.material.opacity = hookOpacity * 0.5;
        const hookScale = 1 + Math.sin(now / 180 + seed) * 0.08;
        parts.grabHook.scale.set(hookScale, hookScale, hookScale);
      }
      parts.liftMarks?.forEach((mark, index) => {
        const sparklePower = Math.max(lifted, happy * 0.9, listenPulse * 0.55);
        mark.visible = sparklePower > 0.02;
        mark.material.opacity = THREE.MathUtils.lerp(mark.material.opacity || 0, sparklePower ? 0.24 + sparklePower * 0.5 : 0, 0.22);
        const angle = now / 330 + index * Math.PI * 0.72 + (mark.userData.seed || 0);
        mark.position.x = 34 + Math.cos(angle) * (30 + lifted * 12);
        mark.position.y = 94 + Math.sin(now / 170 + index) * 7 + lifted * 16 + happy * 7;
        mark.position.z = Math.sin(angle) * (36 + lifted * 10);
        const markScale = 0.76 + sparklePower * 0.42 + Math.sin(now / 180 + index) * 0.06;
        mark.scale.set(20 * markScale, 20 * markScale, 1);
        mark.rotation.z = Math.sin(now / 180 + index) * 0.18;
      });
      if (parts.emote) {
        const selected = sprite === state.selectedCat || sprite.userData.dragging;
        const wrong = sprite.userData.wrongUntil && sprite.userData.wrongUntil > now;
      const targetOpacity = wrong ? 0.92 : selected ? 1 : idleActive ? 0.62 : listenPulse ? 0.46 : sprite.userData.listened ? 0.38 : 0;
      parts.emote.material.opacity = THREE.MathUtils.lerp(parts.emote.material.opacity || 0, targetOpacity, 0.18);
      parts.emote.position.y = 96 + Math.sin(now / 210 + seed) * 6 + lifted * 14 + listenPulse * 12 + idlePulse * 10 + selected * 9;
      const emoteScale = (wrong ? 1.15 : selected ? 1.22 : idleActive ? 0.96 : 0.82 + listenPulse * 0.22) + Math.sin(now / 180 + seed) * 0.06;
      parts.emote.scale.set(26 * emoteScale, 26 * emoteScale, 1);
      }
      if (parts.interactRing) {
        const candidate = state.heardTarget && !state.solved && !sprite.userData.fed && !sprite.userData.dragging;
        const selected = sprite === state.selectedCat;
        const rejected = sprite.userData.rejectedUntil && sprite.userData.rejectedUntil > now;
        const targetOpacity = rejected ? 0.16 : selected ? 0.56 : candidate ? 0.28 : 0;
        parts.interactRing.visible = targetOpacity > 0.02 || (parts.interactRing.material.opacity || 0) > 0.02;
        parts.interactRing.material.opacity = THREE.MathUtils.lerp(parts.interactRing.material.opacity || 0, targetOpacity, 0.18);
        parts.interactRing.material.color.setHex(selected ? 0x6fd082 : rejected ? 0xff8fa2 : 0xffd86f);
        const ringPulse = 1 + Math.sin(now / 240 + seed) * 0.08 + (selected ? 0.18 : 0) + listenPulse * 0.08;
        parts.interactRing.scale.set(ringPulse, ringPulse, ringPulse);
        parts.interactRing.rotation.z += 0.018 + (selected ? 0.016 : 0);
      }
      parts.ears?.forEach((ear, index) => {
        const listenEar = listenPulse * (index ? 0.26 : -0.18);
        const alert = state.heardTarget && !state.solved ? Math.sin(now / 180 + seed + index) * 0.035 : 0;
        ear.rotation.z = ear.userData.baseRotZ + Math.sin(now / 240 + seed + index) * 0.06 + lifted * (index ? 0.12 : -0.02) + happy * (index ? 0.12 : -0.12) - wrong * 0.22 + listenEar + alert + listenIdle * (index ? 0.18 : -0.12) - sniff * 0.08 + hop * 0.12;
      });
      if (parts.accessory) {
        parts.accessory.rotation.z = Math.sin(now / 220 + seed) * (0.03 + happy * 0.1) + lifted * 0.05;
        parts.accessory.position.y = Math.sin(now / 160 + seed) * (happy ? 2.4 : 0.7) + lifted * 2 - wrong * 2;
      }
      parts.whiskers?.forEach((whisker, index) => {
        whisker.rotation.z = whisker.userData.baseRotZ + Math.sin(now / 180 + seed + index) * 0.04 + lifted * 0.05 + listenPulse * 0.04;
      });
      if (parts.shadow) {
        const shadowScale = Math.max(0.45, 1 - lifted * 0.42);
        parts.shadow.scale.set(1.16 + Math.sin(now / 300 + seed) * 0.03 - lifted * 0.14, 0.66 * shadowScale, 1);
        parts.shadow.material.opacity = 0.2 * shadowScale;
      }
      if (parts.liftBubble) {
        const bubblePower = THREE.MathUtils.clamp(lifted * 1.1 + happy * 0.28, 0, 1);
        parts.liftBubble.visible = bubblePower > 0.02 || (parts.liftBubble.material.opacity || 0) > 0.02;
        parts.liftBubble.material.opacity = THREE.MathUtils.lerp(parts.liftBubble.material.opacity || 0, bubblePower ? 0.22 + bubblePower * 0.16 : 0, 0.2);
        const bubblePulse = 1 + Math.sin(now / 180 + seed) * 0.045 + bubblePower * 0.12;
        parts.liftBubble.scale.set(1.25 * bubblePulse, 0.72 * (1 + bubblePower * 0.08), 0.92 * bubblePulse);
        parts.liftBubble.rotation.y += 0.012 + bubblePower * 0.012;
        parts.liftBubble.rotation.z = Math.sin(now / 260 + seed) * 0.08;
      }
      if (parts.selectRing) {
        const selected = sprite === state.selectedCat || sprite.userData.dragging;
        const wrong = sprite.userData.wrongUntil && sprite.userData.wrongUntil > now;
        const listened = sprite.userData.listened || listenPulse > 0.02;
        const readyToTap = state.heardTarget && !state.solved && !state.draggingCat;
        const visible = selected || wrong || listened || readyToTap;
        const targetOpacity = wrong ? 0.8 : selected ? 0.72 : listenPulse ? 0.36 : listened ? 0.28 : readyToTap ? 0.16 : 0;
        parts.selectRing.visible = visible;
        parts.selectRing.material.opacity = THREE.MathUtils.lerp(parts.selectRing.material.opacity || 0, targetOpacity, 0.28);
        parts.selectRing.material.color.setHex(wrong ? 0xff5d7d : selected ? 0xffd86f : 0x8fd3ff);
        const ringPulse = 1 + Math.sin(now / 180 + seed) * (selected ? 0.08 : readyToTap ? 0.055 : 0.03) + lifted * 0.12;
        parts.selectRing.scale.set(ringPulse, ringPulse, ringPulse);
      }
    }

    function randomGlobePoint(currentLat = 0.52, currentLon = 0) {
      const favoriteStops = [
        [0.5, -0.24], [0.2, -2.04], [-0.34, -1.28], [0.54, -0.54],
        [-0.18, 0.34], [0.4, 1.12], [-0.48, 1.92], [0.08, 2.7],
        [-0.16, -2.12], [0.28, -0.48], [-0.42, 1.26], [0.38, 2.48]
      ];
      if (Math.random() < 0.44) {
        const [baseLat, baseLon] = favoriteStops[Math.floor(Math.random() * favoriteStops.length)];
        const lat = THREE.MathUtils.clamp(baseLat + (Math.random() - 0.5) * 0.18, -0.68, 0.68);
        const lon = normalizeLon(baseLon + (Math.random() - 0.5) * 0.24);
        if (
          angularDistance(lat, lon, world.bowlLat, world.bowlLon) > 0.46 &&
          angularDistance(lat, lon, currentLat, currentLon) > 0.3
        ) {
          return { lat, lon };
        }
      }
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const lat = THREE.MathUtils.lerp(-0.62, 0.36, Math.random());
        const lon = THREE.MathUtils.lerp(-Math.PI, Math.PI, Math.random());
        const awayFromBowl = angularDistance(lat, lon, world.bowlLat, world.bowlLon) > 0.46;
        const worthWalking = angularDistance(lat, lon, currentLat, currentLon) > 0.38;
        if (awayFromBowl && worthWalking) return { lat, lon };
      }
      return {
        lat: THREE.MathUtils.lerp(-0.46, 0.28, Math.random()),
        lon: THREE.MathUtils.lerp(-1.4, 1.4, Math.random())
      };
    }

    function angularDistance(latA, lonA, latB, lonB) {
      const sin1 = Math.sin(latA);
      const sin2 = Math.sin(latB);
      const cos1 = Math.cos(latA);
      const cos2 = Math.cos(latB);
      return Math.acos(THREE.MathUtils.clamp(sin1 * sin2 + cos1 * cos2 * Math.cos(lonA - lonB), -1, 1));
    }

    function shortestLonDelta(from, to) {
      let delta = to - from;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      return delta;
    }

    function normalizeLon(lon) {
      let normalized = lon;
      while (normalized > Math.PI) normalized -= Math.PI * 2;
      while (normalized < -Math.PI) normalized += Math.PI * 2;
      return normalized;
    }

    function pointToLatLon(point) {
      const local = globeGroup.worldToLocal(point.clone()).normalize();
      return {
        lat: Math.asin(THREE.MathUtils.clamp(local.y, -1, 1)),
        lon: Math.atan2(local.x, local.z)
      };
    }

    function setCatWorldPosition(cat, position) {
      cat.position.copy(cat.parent.worldToLocal(position.clone()));
    }

    function objectToViewport(object) {
      camera.updateMatrixWorld(true);
      const rect = renderer.domElement.getBoundingClientRect();
      const pos = object.getWorldPosition(new THREE.Vector3()).project(camera);
      return {
        x: rect.left + (pos.x + 1) * 0.5 * rect.width,
        y: rect.top + (1 - pos.y) * 0.5 * rect.height
      };
    }

    function isFacingCamera(object, tolerance = -0.08) {
      const center = new THREE.Vector3(globeGroup.position.x, globeGroup.position.y, globeGroup.position.z);
      const cameraDir = camera.position.clone().sub(center).normalize();
      const objectPos = object.getWorldPosition(new THREE.Vector3());
      const surfaceDir = objectPos.clone().sub(center).normalize();
      return surfaceDir.dot(cameraDir) > tolerance;
    }

    function updateBowlAnchor() {
      camera.updateMatrixWorld(true);
      const rect = renderer.domElement.getBoundingClientRect();
      const safeX = THREE.MathUtils.clamp(rect.width * 0.17, 170, 300);
      const safeY = THREE.MathUtils.clamp(rect.height * 0.7, rect.height - 260, rect.height - 145);
      const x = (safeX / rect.width) * 2 - 1;
      const y = -((safeY / rect.height) * 2 - 1);
      bowlRayPointer.set(x, y);
      raycaster.setFromCamera(bowlRayPointer, camera);
      raycaster.ray.intersectPlane(bowlPlane, bowlAnchor);
      if (!Number.isFinite(bowlAnchor.x) || !Number.isFinite(bowlAnchor.y) || !Number.isFinite(bowlAnchor.z)) {
        bowlAnchor.copy(world.bowlPos);
      }
      return bowlAnchor;
    }

    function screenToWorld(event) {
      camera.updateMatrixWorld(true);
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([groundHit], false);
      return hits[0]?.point || null;
    }

    function screenToDragPlane(event) {
      camera.updateMatrixWorld(true);
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPlanePoint.copy(updateBowlAnchor()).add(new THREE.Vector3(0, 78, 0)));
      return raycaster.ray.intersectPlane(dragPlane, new THREE.Vector3());
    }

    function pointerHitsBowl(event) {
      camera.updateMatrixWorld(true);
      const targetRect = feedTarget.getBoundingClientRect();
      if (
        event.clientX >= targetRect.left &&
        event.clientX <= targetRect.right &&
        event.clientY >= targetRect.top &&
        event.clientY <= targetRect.bottom
      ) {
        return { object: feedTarget };
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects([bowlHit], false)[0] || null;
    }

    function pickCat(event) {
      camera.updateMatrixWorld(true);
      let nearest = null;
      let nearestDistance = Infinity;
      state.cats.forEach((choice) => {
        const sprite = choice.sprite;
        if (!sprite || !sprite.visible || !isFacingCamera(sprite, -0.1)) return;
        const screen = objectToViewport(sprite);
        const distance = Math.hypot(event.clientX - screen.x, event.clientY - screen.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = sprite;
        }
      });
      if (nearestDistance < 88) return nearest;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(catGroup.children, true);
      const hit = hits.find((item) => item.object.userData.hitOwner || item.object.userData.type === "cat");
      if (hit) return hit.object.userData.hitOwner || hit.object;
      return null;
    }

    function setSelectedCat(sprite) {
      if (state.solved) return;
      if (state.selectedCat && state.selectedCat !== sprite) {
        tintCat(state.selectedCat, null);
      }
      state.selectedCat = sprite;
      state.sampledCat = true;
      sprite.userData.listened = true;
      tintCat(sprite, 0xe9fff0);
      sprite.userData.pickedUntil = performance.now() + 1800;
      sprite.userData.grabPopUntil = performance.now() + 520;
      playCatCue(sprite.userData.choice);
      const catListenOrigin = sprite.getWorldPosition(new THREE.Vector3());
      emitSoundWave(catListenOrigin, sprite.userData.choice, { hidden: true, compact: true });
      emitListeningSparkles(catListenOrigin, sprite.userData.choice);
      emitCatSampleBurst(sprite);
      renderFeedback("听猫叫", "一样就拖到碗里。");
      updateHeader();
      updateCoach();
      updateGestureGuide();
    }

    function solve(sprite) {
      state.solved = true;
      state.combo += 1;
      const points = 10 + Math.max(0, state.combo - 1) * 2;
      state.score += points;
      nextBtn.disabled = false;
      updateHeader();
      playUiTone("correct");
      sprite.userData.fed = true;
      sprite.userData.dragging = false;
      sprite.userData.overBowl = false;
      sprite.userData.floatingDrag = false;
      sprite.userData.feedStartAt = performance.now();
      sprite.userData.feedEndAt = sprite.userData.feedStartAt + 980;
      sprite.userData.feedFrom = sprite.getWorldPosition(new THREE.Vector3());
      sprite.userData.feedTo = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 92, 0));
      sprite.userData.feedArc = 172 + Math.min(64, state.combo * 14);
      sprite.userData.feedSpin = (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 0.35);
      sprite.userData.happyUntil = performance.now() + 1200;
      addLearned(state.target);
      if (state.target.kind === "note") {
        renderFeedback(state.combo > 1 ? `连对 ${state.combo}` : "音卡 +1", `收集 ${state.target.note} · ${NOTE_NAMES[state.target.note]}`);
      } else {
        renderFeedback(state.combo > 1 ? `连对 ${state.combo}` : "音卡 +1", `收集 ${state.target.label} · ${CHORDS[state.target.chord].tip}`);
      }
      showToast(state.combo > 1 ? `连对 ${state.combo} 次` : "正确，把猫喂饱了", "good");
      emitSoundWave(bowl.getWorldPosition(new THREE.Vector3()), state.target, { hidden: false });
      emitRewardBurst(sprite, state.combo);
      emitCatJoy(sprite, state.combo);
      emitScorePopup(points, state.combo);
      showComboBurst(points, state.combo);
      emitKnowledgeBadge(state.target, state.combo);
      emitLearnCard(state.target, state.combo);
      emitMasteryToken(state.target, state.combo);
      emitMasteryStamp(state.target, state.combo);
      emitFeastRings(state.combo);
      emitVictorySplash(state.target, state.combo);
      emitPlanetCheer(state.target, state.combo);
      showRewardCard(state.target);
      celebrate(state.combo);
      state.celebrateUntil = performance.now() + 1450;
      state.victoryUntil = performance.now() + 3200;
      bowl.userData.bumpUntil = performance.now() + 620;
      updateCoach();
      syncDebugState();
    }

    function miss(sprite) {
      tintCat(sprite, 0xffdce1);
      const now = performance.now();
      playUiTone("wrong");
      sprite.userData.wrongUntil = now + 620;
      sprite.userData.rejectedUntil = now + 2300;
      sprite.userData.happyUntil = 0;
      sprite.userData.pickedUntil = performance.now() + 500;
      state.boardShakeUntil = now + 240;
      state.selectedCat = null;
      state.combo = 0;
      showComboBurst(0, 0, true);
      state.autoReplayUntil = now + 1450;
      hideRewardCard();
      updateHeader();
      renderFeedback("不一样", "猫粮会自动再响一次，听完再换一只。");
      showToast("再听一遍", "bad");
      emitWrongMark(sprite);
      emitBowlRejectSpark(sprite);
      const replayTarget = state.target;
      window.clearTimeout(miss.replayTimer);
      miss.replayTimer = window.setTimeout(() => {
        if (!state.solved && state.target === replayTarget) {
          playFoodCue(replayTarget);
          markTargetHeard();
          bowl.userData.bumpUntil = performance.now() + 520;
          emitNoteBurst(6);
          emitSoundWave(bowl.getWorldPosition(new THREE.Vector3()), replayTarget, { hidden: true, compact: true });
          renderFeedback("重新听猫粮", "现在换一只猫试试。");
          updateCoach();
        }
      }, 430);
      updateCoach();
      syncDebugState();
    }

    function tintCat(group, color) {
      group.traverse((child) => {
        if (!child.isMesh || !child.material?.color) return;
        const baseColor = child.userData.baseColor ?? 0xffffff;
        if (color === null) {
          child.material.color.setHex(baseColor);
          return;
        }
        child.material.color.setHex(baseColor).lerp(new THREE.Color(color), 0.46);
      });
    }

    function checkFeed(sprite, forced = false) {
      const nearBowl = forced || isNearBowl(sprite);
      if (!nearBowl) return false;
      if (sprite.userData.choice.id === state.target.id) solve(sprite);
      else miss(sprite);
      return true;
    }

    function isNearBowl(sprite) {
      const catScreen = objectToViewport(sprite);
      const targetRect = feedTarget.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      if (Math.hypot(catScreen.x - targetX, catScreen.y - targetY) < 146) return true;
      const catPos = sprite.getWorldPosition(new THREE.Vector3());
      const bowlPos = bowl.getWorldPosition(new THREE.Vector3());
      return catPos.distanceTo(bowlPos) < 205;
    }

    function celebrate(combo = 1) {
      const amount = Math.min(34, 18 + combo * 4);
      for (let i = 0; i < amount; i += 1) {
        const geometry = i % 3 === 0 ? new THREE.CircleGeometry(7, 5) : new THREE.PlaneGeometry(13, 13);
        const material = new THREE.MeshBasicMaterial({
          color: [0xffd86f, 0x6fd082, 0x8fd3ff, 0xff8fa2][i % 4],
          transparent: true
        });
        const piece = new THREE.Mesh(geometry, material);
        piece.position.copy(bowl.getWorldPosition(new THREE.Vector3()));
        piece.userData = {
          vx: (Math.random() - 0.5) * 260,
          vy: 120 + Math.random() * 180 + combo * 16,
          vz: (Math.random() - 0.5) * 180,
          life: 0.9 + Math.min(0.35, combo * 0.05),
          age: 0,
          rot: (Math.random() - 0.5) * 8
        };
        state.confetti.push(piece);
        scene.add(piece);
      }
    }

    function makeSpriteGlyph(text, color, size = 64) {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.font = `bold ${size}px Trebuchet MS`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 48, 50);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
    }

    function makePawSprite(color = "#ffffff") {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(37, 35, 31, 0.42)";
      ctx.lineWidth = 5;
      const toe = (x, y, r) => {
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.82, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };
      toe(34, 32, 10);
      toe(48, 25, 10);
      toe(62, 32, 10);
      ctx.beginPath();
      ctx.ellipse(48, 58, 20, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
    }

    function makeHintBubble(text, fill = "#ffffff") {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = fill;
      ctx.strokeStyle = "#25231f";
      ctx.lineWidth = 8;
      roundRect(ctx, 18, 16, 124, 56, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#25231f";
      ctx.font = "bold 34px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 80, 45);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const bubble = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      bubble.renderOrder = 60;
      bubble.scale.set(58, 35, 1);
      return bubble;
    }

    function emitRewardBurst(sprite, combo = 1) {
      const base = bowl.getWorldPosition(new THREE.Vector3());
      const catSpot = sprite.getWorldPosition(new THREE.Vector3());
      const amount = Math.min(28, 14 + combo * 4);
      for (let i = 0; i < amount; i += 1) {
        const glyphs = ["♪", "★", "♥", "♫", "✦"];
        const colors = ["#ffd85e", "#ff6f91", "#6fd082", "#8fd3ff", "#ffffff"];
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], colors[i % colors.length], 58);
        mark.position.copy(i < 4 ? catSpot : base);
        mark.position.y += 46 + Math.random() * 30;
        mark.scale.setScalar(22 + Math.random() * 14 + Math.min(8, combo * 2));
        mark.userData = {
          vx: (Math.random() - 0.5) * 160,
          vy: 130 + Math.random() * 120 + combo * 10,
          vz: (Math.random() - 0.5) * 120,
          age: 0,
          life: 0.9 + Math.random() * 0.35 + Math.min(0.25, combo * 0.04),
          rot: (Math.random() - 0.5) * 2
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }
    }

    function emitCatJoy(sprite, combo = 1) {
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const glyphs = ["♡", "♪", " paw ", "★"];
      for (let i = 0; i < 10 + Math.min(8, combo * 2); i += 1) {
        const glyph = glyphs[i % glyphs.length].trim() || "♡";
        const mark = makeSpriteGlyph(glyph === "paw" ? "♥" : glyph, glyph === "paw" ? "#ff8fa2" : ["#ffd86f", "#8fd3ff", "#ff8fa2", "#ffffff"][i % 4], glyph === "paw" ? 42 : 54);
        mark.position.copy(base);
        mark.position.y += 70 + Math.random() * 26;
        mark.position.x += (Math.random() - 0.5) * 34;
        mark.position.z += (Math.random() - 0.5) * 26;
        mark.scale.setScalar(14 + Math.random() * 12);
        mark.userData = {
          vx: (Math.random() - 0.5) * 110,
          vy: 105 + Math.random() * 110,
          vz: (Math.random() - 0.5) * 90,
          age: 0,
          life: 0.82 + Math.random() * 0.28,
          rot: (Math.random() - 0.5) * 2.2,
          gravity: 95,
          growth: 0.42
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }
    }

    function emitScorePopup(points, combo = 1) {
      const label = makeSpriteGlyph(`+${points}`, "#25231f", 46);
      label.position.copy(bowl.getWorldPosition(new THREE.Vector3()));
      label.position.y += 138;
      label.position.x += 34;
      label.scale.set(48 + combo * 2, 30 + combo, 1);
      label.userData = {
        vx: 12,
        vy: 96 + combo * 10,
        vz: 0,
        age: 0,
        life: 0.9,
        rot: 0.18,
        gravity: 80,
        growth: 0.56
      };
      state.shockwaves.push(label);
      scene.add(label);
    }

    function emitMasteryStamp(item, combo = 1) {
      const color = itemColor(item, true);
      const label = item.kind === "note"
        ? `学会 ${item.note}`
        : `听出${CHORDS[item.chord].label}`;
      const stamp = makeSpriteGlyph(label, "#25231f", item.kind === "note" ? 36 : 30);
      stamp.position.copy(globeGroup.getWorldPosition(new THREE.Vector3()));
      stamp.position.x -= 28;
      stamp.position.y += 76;
      stamp.position.z += 430;
      stamp.scale.set(96 + combo * 5, 42 + combo * 2, 1);
      stamp.material.depthTest = false;
      stamp.renderOrder = 80;
      stamp.userData = {
        vx: -18,
        vy: 76 + combo * 8,
        vz: 0,
        age: 0,
        life: 1.05,
        rot: -0.16,
        gravity: 70,
        growth: 0.28
      };
      state.shockwaves.push(stamp);
      scene.add(stamp);

      for (let i = 0; i < 2; i += 1) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(76 + i * 22, 82 + i * 22, 64),
          new THREE.MeshBasicMaterial({
            color: i ? 0xffffff : color,
            transparent: true,
            opacity: 0.44,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
          })
        );
        ring.position.copy(stamp.position).add(new THREE.Vector3(0, -8, -8));
        ring.rotation.x = Math.PI / 2;
        ring.userData = {
          vx: 0,
          vy: 34 + i * 8,
          vz: 0,
          age: -i * 0.08,
          life: 0.86,
          rot: i ? -1 : 1,
          gravity: 0,
          growth: 2.8 + i * 0.6
        };
        state.shockwaves.push(ring);
        scene.add(ring);
      }
    }

    function emitVictorySplash(item, combo = 1) {
      const base = bowl.getWorldPosition(new THREE.Vector3());
      const center = globeGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 110, 0));
      const accent = `#${itemColor(item, true).toString(16).padStart(6, "0")}`;
      const glyphs = item.kind === "note"
        ? [item.note, NOTE_NAMES[item.note], "♪", "★", "OK"]
        : [CHORDS[item.chord].label, item.root, "♫", "★", "OK"];
      for (let i = 0; i < 18 + Math.min(12, combo * 3); i += 1) {
        const angle = (i / 18) * Math.PI * 2;
        const fromBowl = i % 3 !== 0;
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], i % 2 ? accent : ["#ffd86f", "#ffffff", "#6fd082"][i % 3], i % 5 === 0 ? 34 : 52);
        mark.position.copy(fromBowl ? base : center);
        mark.position.x += Math.cos(angle) * (fromBowl ? 18 : 46);
        mark.position.y += fromBowl ? 78 + Math.random() * 34 : Math.sin(i) * 18;
        mark.position.z += Math.sin(angle) * (fromBowl ? 18 : 46);
        mark.scale.setScalar(20 + Math.random() * 18 + Math.min(8, combo * 2));
        mark.userData = {
          vx: Math.cos(angle) * (fromBowl ? 130 : 170),
          vy: 140 + Math.random() * 160 + combo * 12,
          vz: Math.sin(angle) * (fromBowl ? 110 : 150),
          age: 0,
          life: 1.1 + Math.random() * 0.35,
          rot: (i % 2 ? -1 : 1) * (0.8 + Math.random() * 1.4),
          gravity: 105,
          growth: 0.5
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }

      for (let i = 0; i < 3; i += 1) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(62 + i * 24, 68 + i * 24, 64),
          new THREE.MeshBasicMaterial({
            color: [itemColor(item, true), 0xffffff, 0xffd86f][i],
            transparent: true,
            opacity: 0.48,
            depthWrite: false,
            depthTest: false
          })
        );
        ring.geometry.rotateX(-Math.PI / 2);
        ring.position.copy(base).add(new THREE.Vector3(0, 40 + i * 10, 0));
        ring.userData = {
          vx: 0,
          vy: 28 + i * 8,
          vz: 0,
          age: -i * 0.08,
          life: 0.8 + i * 0.12,
          rot: (i % 2 ? -1 : 1) * 1.2,
          gravity: 0,
          growth: 3.4 + i * 0.6
        };
        state.shockwaves.push(ring);
        scene.add(ring);
      }
    }

    function emitPlanetCheer(item, combo = 1) {
      const accent = itemColor(item, true);
      const glyphs = item.kind === "note"
        ? [item.note, "♪", "★", NOTE_NAMES[item.note]]
        : [CHORDS[item.chord].label, "♫", "★", item.root];
      const count = 14 + Math.min(10, combo * 3);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i += 1) {
        const lat = THREE.MathUtils.lerp(-0.58, 0.62, ((i * 5) % count) / Math.max(1, count - 1));
        const lon = normalizeLon(i * golden + globeGroup.rotation.y * 0.7);
        const origin = globeGroup.localToWorld(surfacePoint(lat, lon, 38 + (i % 4) * 8));
        const glyph = glyphs[i % glyphs.length];
        const mark = makeSpriteGlyph(
          glyph,
          i % 3 === 0 ? `#${accent.toString(16).padStart(6, "0")}` : ["#ffffff", "#ffd86f", "#8fd3ff"][i % 3],
          glyph.length > 1 ? 34 : 54
        );
        mark.position.copy(origin);
        mark.scale.setScalar(14 + (i % 4) * 4 + Math.min(7, combo * 1.5));
        const normal = origin.clone().sub(globeGroup.getWorldPosition(new THREE.Vector3())).normalize();
        mark.userData = {
          vx: normal.x * (42 + Math.random() * 46) + (Math.random() - 0.5) * 22,
          vy: 78 + Math.random() * 92 + combo * 8,
          vz: normal.z * (42 + Math.random() * 46) + (Math.random() - 0.5) * 22,
          age: -i * 0.025,
          life: 1 + Math.random() * 0.35,
          rot: (i % 2 ? -1 : 1) * (0.8 + Math.random() * 1.1),
          gravity: 74,
          growth: 0.36
        };
        state.shockwaves.push(mark);
        scene.add(mark);

        if (i % 4 === 0) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(18, 23, 36),
            new THREE.MeshBasicMaterial({
              color: i % 2 ? 0xffffff : accent,
              transparent: true,
              opacity: 0.46,
              depthWrite: false,
              depthTest: false,
              side: THREE.DoubleSide
            })
          );
          ring.position.copy(origin);
          ring.lookAt(globeGroup.getWorldPosition(new THREE.Vector3()));
          ring.userData = {
            vx: normal.x * 18,
            vy: 42,
            vz: normal.z * 18,
            age: 0,
            life: 0.76,
            rot: i % 2 ? -1.4 : 1.4,
            gravity: 28,
            growth: 2.8
          };
          state.shockwaves.push(ring);
          scene.add(ring);
        }
      }
    }

    function emitVictoryDrift(origin, accentColor = 0xffd86f) {
      const glyphs = ["♪", "★", "♫"];
      const colors = [`#${accentColor.toString(16).padStart(6, "0")}`, "#ffffff", "#ffd86f"];
      for (let i = 0; i < 3; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], colors[i % colors.length], i === 1 ? 50 : 56);
        mark.position.copy(origin);
        mark.position.x += Math.cos(angle) * (72 + Math.random() * 42);
        mark.position.y += 82 + Math.random() * 44;
        mark.position.z += Math.sin(angle) * 20;
        mark.scale.setScalar(16 + Math.random() * 10);
        mark.userData = {
          vx: Math.cos(angle) * (28 + Math.random() * 36),
          vy: 60 + Math.random() * 70,
          vz: Math.sin(angle) * 28,
          age: 0,
          life: 0.95 + Math.random() * 0.35,
          rot: (Math.random() - 0.5) * 1.8,
          gravity: 50,
          growth: 0.28
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }
    }

    function makeLearnCardSprite(item) {
      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");
      const color = itemColor(item, false);
      const accent = `#${color.toString(16).padStart(6, "0")}`;
      const title = item.kind === "note" ? item.note : CHORDS[item.chord].label;
      const subtitle = item.kind === "note" ? NOTE_NAMES[item.note] : `${item.root} · ${CHORDS[item.chord].intervals.join("-")}`;
      const tip = item.kind === "note" ? "单音音高" : CHORDS[item.chord].tip;
      const formula = item.kind === "note" ? "听高低" : CHORDS[item.chord].intervals.join(" - ");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, 0);
      ctx.fillStyle = accent;
      ctx.strokeStyle = "rgba(37, 35, 31, 0.92)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(82, 50);
      ctx.lineTo(110, 14);
      ctx.lineTo(138, 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(278, 54);
      ctx.lineTo(310, 14);
      ctx.lineTo(338, 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.shadowColor = "rgba(34, 32, 29, 0.18)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = "rgba(255, 253, 247, 0.98)";
      ctx.strokeStyle = "rgba(37, 35, 31, 0.92)";
      ctx.lineWidth = 8;
      roundRect(ctx, 28, 36, 364, 212, 42);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = "transparent";

      ctx.fillStyle = "rgba(143, 211, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(318, 88, 62, 44, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `${accent}44`;
      ctx.beginPath();
      ctx.ellipse(112, 190, 76, 34, 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = accent;
      roundRect(ctx, 50, 58, 106, 42, 21);
      ctx.fill();
      ctx.strokeStyle = "rgba(37, 35, 31, 0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#25231f";
      ctx.font = "900 29px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("音卡", 103, 79);

      ctx.fillStyle = "rgba(37, 35, 31, 0.92)";
      ctx.font = "900 17px Trebuchet MS";
      ctx.textAlign = "left";
      ctx.fillText("MEOW NOTE", 188, 70);
      ctx.fillStyle = "rgba(37, 35, 31, 0.54)";
      ctx.font = "900 14px Trebuchet MS";
      ctx.fillText(formula, 188, 94);

      ctx.fillStyle = "#ffd86f";
      ctx.strokeStyle = "rgba(37, 35, 31, 0.88)";
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(312 + i * 22, 77, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255, 216, 111, 0.72)";
      roundRect(ctx, 70, 208, 280, 28, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(37, 35, 31, 0.74)";
      ctx.textAlign = "center";
      ctx.font = "900 15px Trebuchet MS";
      ctx.fillText(item.kind === "note" ? "记住这只猫的叫声高度" : "记住这个和弦的颜色", 210, 222);

      ctx.fillStyle = "#25231f";
      ctx.textAlign = "center";
      ctx.font = "900 78px Trebuchet MS";
      ctx.fillText(title, 210, 150);
      ctx.font = "900 30px Trebuchet MS";
      ctx.fillStyle = "rgba(34, 32, 29, 0.72)";
      ctx.fillText(subtitle, 210, 188);
      ctx.font = "900 18px Trebuchet MS";
      ctx.fillStyle = "rgba(34, 32, 29, 0.52)";
      ctx.fillText(tip, 210, 207);

      ctx.fillStyle = accent;
      ctx.font = "900 48px Trebuchet MS";
      ctx.fillText("♪", 350, 128);
      ctx.fillStyle = "rgba(37, 35, 31, 0.12)";
      ctx.font = "900 34px Trebuchet MS";
      ctx.fillText("♫", 74, 160);

      ctx.strokeStyle = "rgba(37, 35, 31, 0.55)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(210, 40, 15, 0.12, Math.PI - 0.12);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 143, 162, 0.6)";
      ctx.beginPath();
      ctx.arc(154, 156, 9, 0, Math.PI * 2);
      ctx.arc(266, 156, 9, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const card = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      card.renderOrder = 70;
      card.scale.set(156, 104, 1);
      return card;
    }

    function emitLearnCard(item, combo = 1) {
      const card = makeLearnCardSprite(item);
      const start = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(26, 138, 0));
      const end = new THREE.Vector3(globeGroup.position.x - 540, globeGroup.position.y + 185, globeGroup.position.z + 430);
      card.position.copy(start);
      card.userData = {
        age: 0,
        life: 1.66,
        start,
        end,
        lift: 245 + combo * 12,
        rot: (combo % 2 ? -1 : 1) * 0.54,
        collectPop: combo
      };
      state.learnCards3d.push(card);
      scene.add(card);
    }

    function makeKnowledgeBadgeSprite(item, combo = 1) {
      const canvas = document.createElement("canvas");
      canvas.width = 520;
      canvas.height = 220;
      const ctx = canvas.getContext("2d");
      const color = itemColor(item, false);
      const accent = `#${color.toString(16).padStart(6, "0")}`;
      const isNote = item.kind === "note";
      const title = isNote ? `${item.note}  ${NOTE_NAMES[item.note]}` : CHORDS[item.chord].label;
      const formula = isNote ? "单音 · 记住声音高度" : `结构 ${CHORDS[item.chord].intervals.join(" - ")}`;
      const tip = isNote ? "这就是刚才那只猫的叫声高度" : CHORDS[item.chord].tip;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.shadowColor = "rgba(34, 32, 29, 0.18)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = "rgba(255, 253, 247, 0.96)";
      ctx.strokeStyle = "rgba(37, 35, 31, 0.88)";
      ctx.lineWidth = 8;
      roundRect(ctx, 22, 28, 476, 162, 44);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = "transparent";

      ctx.fillStyle = accent;
      roundRect(ctx, 48, 50, 112, 112, 34);
      ctx.fill();
      ctx.strokeStyle = "rgba(37, 35, 31, 0.86)";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = "#25231f";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${isNote ? 54 : 38}px Trebuchet MS`;
      ctx.fillText(isNote ? item.note : "Chord", 104, 102);
      ctx.font = "900 20px Trebuchet MS";
      ctx.fillText(isNote ? NOTE_NAMES[item.note] : item.root, 104, 138);

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(37, 35, 31, 0.9)";
      ctx.font = "900 34px Trebuchet MS";
      ctx.fillText(title, 190, 76);
      ctx.fillStyle = "rgba(37, 35, 31, 0.58)";
      ctx.font = "900 18px Trebuchet MS";
      ctx.fillText(formula, 192, 108);
      ctx.fillStyle = "rgba(37, 35, 31, 0.72)";
      ctx.font = "900 20px Trebuchet MS";
      ctx.fillText(tip, 192, 142);

      ctx.fillStyle = combo > 1 ? "#ff8fa2" : "#6fd082";
      roundRect(ctx, 398, 44, 72, 34, 17);
      ctx.fill();
      ctx.fillStyle = "#25231f";
      ctx.textAlign = "center";
      ctx.font = "900 17px Trebuchet MS";
      ctx.fillText(combo > 1 ? `x${combo}` : "+1", 434, 62);

      ctx.fillStyle = "rgba(255, 216, 111, 0.45)";
      ctx.beginPath();
      ctx.arc(430, 142, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#25231f";
      ctx.font = "900 40px Trebuchet MS";
      ctx.fillText("♪", 430, 143);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      badge.renderOrder = 86;
      badge.scale.set(198, 84, 1);
      return badge;
    }

    function emitKnowledgeBadge(item, combo = 1) {
      const badge = makeKnowledgeBadgeSprite(item, combo);
      const start = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(122, 154, 22));
      const end = new THREE.Vector3(globeGroup.position.x - 558, globeGroup.position.y + 250, globeGroup.position.z + 430);
      badge.position.copy(start);
      badge.userData = {
        age: 0,
        life: 2.2,
        start,
        end,
        lift: 188 + Math.min(64, combo * 10),
        wobble: Math.random() * Math.PI * 2,
        rot: combo % 2 ? -0.08 : 0.08
      };
      state.knowledgeBadges3d.push(badge);
      scene.add(badge);
    }

    function emitMasteryToken(item, combo = 1) {
      const token = new THREE.Group();
      const color = itemColor(item, false);
      const label = item.kind === "note" ? item.note : item.root;
      const subLabel = item.kind === "note" ? NOTE_NAMES[item.note] : CHORDS[item.chord].label.replace("和弦", "");
      const baseMat = toonMat(color);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x25231f, transparent: true, opacity: 0.72 });
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const glow = new THREE.Mesh(new THREE.RingGeometry(28, 42, 44), glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 1.5;
      token.add(glow);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(22, 27, 13, 24), baseMat);
      base.position.y = 7;
      token.add(base);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(23, 2.8, 8, 28), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 15;
      token.add(rim);

      const title = makeSpriteGlyph(label, "#25231f", item.kind === "note" ? 54 : 38);
      title.position.y = 40;
      title.scale.set(item.kind === "note" ? 26 : 32, 24, 1);
      title.material.depthTest = false;
      title.renderOrder = 34;
      token.add(title);

      const sub = makeSpriteGlyph(subLabel, "#25231f", subLabel.length > 2 ? 28 : 34);
      sub.position.y = 66;
      sub.scale.set(subLabel.length > 2 ? 34 : 26, 16, 1);
      sub.material.opacity = 0.72;
      sub.material.depthTest = false;
      sub.renderOrder = 35;
      token.add(sub);

      const count = state.masteryTokens3d.length;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const lat = THREE.MathUtils.clamp(-0.58 + ((count * 7) % 13) / 12 * 1.16 + Math.sin(count * 1.7) * 0.035, -0.64, 0.64);
      const lon = normalizeLon(-2.9 + count * golden + state.round * 0.14);
      placeOnGlobe(token, lat, lon, 18);
      token.scale.setScalar(0.1);
      token.userData = {
        isMasteryToken: true,
        birth: performance.now(),
        seed: count * 0.83,
        baseScale: 0.72 + Math.min(0.2, combo * 0.03),
        glow,
        title,
        sub
      };
      masteryTokenGroup.add(token);
      state.masteryTokens3d.push(token);

      while (state.masteryTokens3d.length > 18) {
        const old = state.masteryTokens3d.shift();
        masteryTokenGroup.remove(old);
        old.traverse((child) => {
          child.geometry?.dispose?.();
          child.material?.map?.dispose?.();
          child.material?.dispose?.();
        });
      }
    }

    function emitStageClearBurst() {
      const center = globeGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 120, 0));
      const glyphs = ["★", "♪", "♡", "♫", "OK"];
      for (let i = 0; i < 38; i += 1) {
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], ["#ffd86f", "#6fd082", "#8fd3ff", "#ff8fa2", "#ffffff"][i % 5], i % 5 === 4 ? 38 : 58);
        const angle = (i / 38) * Math.PI * 2;
        mark.position.copy(center).add(new THREE.Vector3(Math.cos(angle) * 40, Math.sin(i) * 16, Math.sin(angle) * 40));
        mark.scale.setScalar(20 + (i % 4) * 5);
        mark.userData = {
          vx: Math.cos(angle) * (90 + (i % 5) * 18),
          vy: 120 + Math.random() * 160,
          vz: Math.sin(angle) * (90 + (i % 5) * 18),
          age: 0,
          life: 1.1 + Math.random() * 0.4,
          rot: (i % 2 ? -1 : 1) * (0.8 + Math.random()),
          gravity: 110,
          growth: 0.38
        };
        state.shockwaves.push(mark);
        scene.add(mark);
      }
      for (let i = 0; i < 16; i += 1) {
        const angle = (i / 16) * Math.PI * 2;
        const orbit = makeSpriteGlyph(i % 2 ? "★" : "♪", i % 3 ? "#ffd86f" : "#ffffff", 54);
        orbit.position.copy(center).add(new THREE.Vector3(Math.cos(angle) * 210, 18 + Math.sin(i) * 22, Math.sin(angle) * 70));
        orbit.scale.setScalar(22 + (i % 3) * 3);
        orbit.material.depthTest = false;
        orbit.renderOrder = 72 + i;
        orbit.userData = {
          vx: -Math.sin(angle) * 98,
          vy: 56 + Math.random() * 70,
          vz: Math.cos(angle) * 42,
          age: -i * 0.02,
          life: 1.45 + Math.random() * 0.35,
          rot: (i % 2 ? -1 : 1) * 1.1,
          gravity: 44,
          growth: 0.24
        };
        state.shockwaves.push(orbit);
        scene.add(orbit);
      }
    }

    function emitFeastRings(combo = 1) {
      const base = bowl.getWorldPosition(new THREE.Vector3());
      const count = Math.min(4, 2 + combo);
      for (let i = 0; i < count; i += 1) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(40 + i * 8, 45 + i * 8, 48),
          new THREE.MeshBasicMaterial({
            color: [0xffffff, 0xffd86f, 0x8fd3ff, 0x6fd082][i % 4],
            transparent: true,
            opacity: 0.52,
            depthWrite: false,
            depthTest: false
          })
        );
        ring.geometry.rotateX(-Math.PI / 2);
        ring.position.copy(base).add(new THREE.Vector3(0, 22 + i * 7, 0));
        ring.scale.setScalar(0.72 + i * 0.12);
        ring.renderOrder = 46 + i;
        ring.userData = {
          vx: 0,
          vy: 16 + i * 6,
          vz: 0,
          age: -i * 0.06,
          life: 0.62 + i * 0.08,
          rot: (i % 2 ? -1 : 1) * 1.2,
          gravity: 0,
          growth: 2.9 + i * 0.4
        };
        state.shockwaves.push(ring);
        scene.add(ring);
      }
    }

    function emitCatSpawn(sprite, index = 0) {
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const colors = ["#ffd86f", "#ffffff", "#8fd3ff", "#ff8fa2"];
      for (let i = 0; i < 7; i += 1) {
        const angle = (i / 7) * Math.PI * 2;
        const mark = i % 3 === 0
          ? makeSpriteGlyph("✦", colors[(i + index) % colors.length], 42)
          : new THREE.Mesh(
            new THREE.SphereGeometry(4 + (i % 2) * 2, 8, 6),
            new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffffff : 0xffd86f, transparent: true, opacity: 0.7, depthWrite: false })
          );
        mark.position.copy(base);
        mark.position.y += 18 + Math.random() * 18;
        mark.position.x += Math.cos(angle) * 22;
        mark.position.z += Math.sin(angle) * 18;
        if (mark.isSprite) mark.scale.setScalar(12 + Math.random() * 7);
        mark.userData = {
          vx: Math.cos(angle) * (32 + Math.random() * 34),
          vy: 48 + Math.random() * 48,
          vz: Math.sin(angle) * (28 + Math.random() * 30),
          age: -(index * 0.08),
          life: 0.62 + Math.random() * 0.24,
          rot: (Math.random() - 0.5) * 2.2
        };
        state.dragSparkles.push(mark);
        scene.add(mark);
      }
    }

    function emitWrongMark(sprite) {
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const mark = makeSpriteGlyph("不是", "#ff4f78", 34);
      mark.position.copy(base);
      mark.position.y += 82;
      mark.scale.set(58, 34, 1);
      mark.userData = {
        vx: 0,
        vy: 80,
        vz: 0,
        age: 0,
        life: 0.55,
        rot: -0.4
      };
      state.shockwaves.push(mark);
      scene.add(mark);
    }

    function emitBowlRejectSpark(sprite) {
      const catBase = sprite.getWorldPosition(new THREE.Vector3());
      const bowlBase = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 88, 0));
      [catBase, bowlBase].forEach((base, baseIndex) => {
        for (let i = 0; i < 5; i += 1) {
          const mark = makeSpriteGlyph(i % 2 ? "?" : "×", i % 2 ? "#ff8fa2" : "#ff4f78", i % 2 ? 42 : 54);
          mark.position.copy(base);
          mark.position.y += 28 + Math.random() * 28;
          mark.scale.setScalar(14 + Math.random() * 10);
          mark.material.depthTest = false;
          mark.userData = {
            vx: (Math.random() - 0.5) * (baseIndex ? 120 : 90),
            vy: 70 + Math.random() * 70,
            vz: (Math.random() - 0.5) * 80,
            age: 0,
            life: 0.55 + Math.random() * 0.22,
            rot: (Math.random() - 0.5) * 2.5,
            gravity: 120,
            growth: 0.35
          };
          state.shockwaves.push(mark);
          scene.add(mark);
        }
      });
    }

    function emitPickupSparkle(sprite) {
      const base = sprite.getWorldPosition(new THREE.Vector3());
      for (let i = 0; i < 8; i += 1) {
        const sparkle = makeSpriteGlyph(i % 2 ? "✦" : "♪", i % 2 ? "#ffd85e" : "#8fd3ff", 50);
        sparkle.position.copy(base);
        sparkle.position.y += 48 + Math.random() * 24;
        sparkle.scale.setScalar(14 + Math.random() * 10);
        sparkle.userData = {
          vx: (Math.random() - 0.5) * 130,
          vy: 80 + Math.random() * 80,
          vz: (Math.random() - 0.5) * 90,
          age: 0,
          life: 0.5 + Math.random() * 0.2,
          rot: (Math.random() - 0.5) * 3
        };
        state.dragSparkles.push(sparkle);
        scene.add(sparkle);
      }
    }

    function emitDragSparkle(sprite) {
      if (performance.now() - (sprite.userData.lastTrailAt || 0) < 70) return;
      sprite.userData.lastTrailAt = performance.now();
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(5, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xfff2a6, transparent: true, opacity: 0.72, depthWrite: false })
      );
      dot.position.copy(base);
      dot.position.y += 22;
      dot.userData = {
        vx: (Math.random() - 0.5) * 34,
        vy: 22 + Math.random() * 24,
        vz: (Math.random() - 0.5) * 34,
        age: 0,
        life: 0.42,
        rot: 0
      };
      state.dragSparkles.push(dot);
      scene.add(dot);
    }

    function emitBowlMagnetSpark(base) {
      const glyphs = ["♡", "♪", "✦"];
      for (let i = 0; i < 3; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const mark = makeSpriteGlyph(glyphs[i % glyphs.length], ["#6fd082", "#ffd86f", "#ffffff"][i], i === 2 ? 42 : 54);
        mark.position.copy(base);
        mark.position.x += Math.cos(angle) * (56 + Math.random() * 42);
        mark.position.y += 70 + Math.random() * 28;
        mark.position.z += Math.sin(angle) * 22;
        mark.scale.setScalar(14 + Math.random() * 8);
        mark.material.depthTest = false;
        mark.userData = {
          vx: Math.cos(angle) * (24 + Math.random() * 28),
          vy: 54 + Math.random() * 46,
          vz: Math.sin(angle) * (20 + Math.random() * 22),
          age: 0,
          life: 0.55 + Math.random() * 0.2,
          rot: (Math.random() - 0.5) * 2.2
        };
        state.dragSparkles.push(mark);
        scene.add(mark);
      }
    }

    function emitWalkPuff(sprite) {
      const now = performance.now();
      const cadence = state.heardTarget && !state.solved ? 230 : 310;
      if (now - (sprite.userData.lastStepPuffAt || 0) < cadence) return;
      sprite.userData.lastStepPuffAt = now;
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const isNote = Math.random() > (state.heardTarget && !state.solved ? 0.48 : 0.68);
      const isPaw = !isNote && Math.random() > 0.38;
      const puff = isNote
        ? makeSpriteGlyph(Math.random() > 0.5 ? "♪" : "·", Math.random() > 0.5 ? "#ffffff" : "#ffd86f", 42)
        : isPaw
          ? makePawSprite(Math.random() > 0.5 ? "#fff7d8" : "#ffffff")
          : new THREE.Mesh(
          new THREE.SphereGeometry(5 + Math.random() * 3, 8, 6),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.46, depthWrite: false })
        );
      puff.position.copy(base);
      puff.position.y += 8 + Math.random() * 10;
      puff.position.x += (Math.random() - 0.5) * 36;
      puff.position.z += (Math.random() - 0.5) * 28;
      if (puff.isSprite) {
        puff.scale.setScalar(isPaw ? 13 + Math.random() * 5 : 12 + Math.random() * 7);
        puff.material.opacity = isPaw ? 0.62 : puff.material.opacity;
      } else {
        puff.scale.set(1.4, 0.42, 1);
      }
      puff.userData = {
        vx: (Math.random() - 0.5) * 34,
        vy: isPaw ? 12 + Math.random() * 12 : 18 + Math.random() * 24,
        vz: (Math.random() - 0.5) * 34,
        age: 0,
        life: (isPaw ? 0.72 : 0.55) + Math.random() * 0.22,
        rot: (Math.random() - 0.5) * 1.4
      };
      state.walkPuffs.push(puff);
      scene.add(puff);
    }

    function emitCatIdleGlyph(sprite) {
      if (!isFacingCamera(sprite, -0.12)) return;
      const data = sprite.userData || {};
      const base = sprite.getWorldPosition(new THREE.Vector3());
      const glyph = data.idleGlyph || "♪";
      const mark = makeSpriteGlyph(glyph, glyph === "♡" ? "#ff8fa2" : glyph === "?" ? "#8fd3ff" : "#ffd86f", glyph === "?" ? 46 : 54);
      mark.position.copy(base);
      mark.position.y += 86 + Math.random() * 12;
      mark.position.x += (Math.random() - 0.5) * 24;
      mark.position.z += (Math.random() - 0.5) * 16;
      mark.scale.setScalar(14 + Math.random() * 8);
      mark.material.depthTest = false;
      mark.renderOrder = 70;
      mark.userData = {
        vx: (Math.random() - 0.5) * 38,
        vy: 58 + Math.random() * 42,
        vz: (Math.random() - 0.5) * 24,
        age: 0,
        life: 0.78 + Math.random() * 0.18,
        rot: (Math.random() - 0.5) * 1.6,
        gravity: 42,
        growth: 0.32
      };
      state.shockwaves.push(mark);
      scene.add(mark);
    }

    function emitRoundStartBloom() {
      const center = globeGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 118, 0));
      const accent = STAGES[state.stage].accent || 0xffd86f;
      for (let i = 0; i < 3; i += 1) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(94 + i * 38, 101 + i * 38, 72),
          new THREE.MeshBasicMaterial({
            color: [accent, 0xffffff, 0xffd86f][i],
            transparent: true,
            opacity: 0.34 - i * 0.06,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
          })
        );
        ring.position.copy(center).add(new THREE.Vector3(0, i * 9, 0));
        ring.rotation.x = Math.PI / 2;
        ring.userData = {
          vx: 0,
          vy: 24 + i * 7,
          vz: 0,
          age: -i * 0.08,
          life: 0.84 + i * 0.08,
          rot: i % 2 ? -1.1 : 1.1,
          gravity: 0,
          growth: 3.1 + i * 0.55
        };
        state.shockwaves.push(ring);
        scene.add(ring);
      }

      const label = makeSpriteGlyph(`第 ${state.round} 只`, "#25231f", 32);
      label.position.copy(center).add(new THREE.Vector3(0, 92, 10));
      label.scale.set(80, 34, 1);
      label.material.depthTest = false;
      label.renderOrder = 82;
      label.userData = {
        vx: 0,
        vy: 70,
        vz: 0,
        age: 0,
        life: 0.85,
        rot: -0.08,
        gravity: 54,
        growth: 0.18
      };
      state.shockwaves.push(label);
      scene.add(label);
      emitRoundQuestPlaque();
    }

    function makeRoundQuestPlaque() {
      const stage = STAGES[state.stage];
      const canvas = document.createElement("canvas");
      canvas.width = 520;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      const accent = `#${(stage.accent || 0xffd86f).toString(16).padStart(6, "0")}`;
      const focus = stage.kind === "note"
        ? `听 ${stage.notes.join(" / ")} 的高度`
        : "听和弦的明暗颜色";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowColor = "rgba(34, 32, 29, 0.16)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "rgba(255, 253, 247, 0.95)";
      ctx.strokeStyle = "rgba(37, 35, 31, 0.86)";
      ctx.lineWidth = 7;
      roundRect(ctx, 28, 28, 464, 124, 38);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = accent;
      roundRect(ctx, 48, 50, 98, 54, 27);
      ctx.fill();
      ctx.strokeStyle = "rgba(37, 35, 31, 0.82)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#25231f";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 24px Trebuchet MS";
      ctx.fillText(`${state.round}/${stage.rounds}`, 97, 77);
      ctx.textAlign = "left";
      ctx.font = "900 25px Trebuchet MS";
      ctx.fillText(`第 ${state.round} 张音卡`, 172, 70);
      ctx.fillStyle = "rgba(34, 32, 29, 0.62)";
      ctx.font = "900 18px Trebuchet MS";
      ctx.fillText(focus, 174, 102);
      ctx.fillStyle = "rgba(255, 216, 111, 0.6)";
      ctx.beginPath();
      ctx.arc(432, 78, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#25231f";
      ctx.font = "900 42px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText("♪", 432, 79);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const plaque = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      plaque.renderOrder = 88;
      plaque.scale.set(214, 74, 1);
      return plaque;
    }

    function emitRoundQuestPlaque() {
      const plaque = makeRoundQuestPlaque();
      const center = globeGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 250, 470));
      plaque.position.copy(center);
      plaque.userData = {
        vx: 0,
        vy: 46,
        vz: 0,
        age: 0,
        life: 1.28,
        rot: -0.02,
        gravity: 30,
        growth: 0.1
      };
      state.shockwaves.push(plaque);
      scene.add(plaque);
    }

    function emitNoteBurst(count = 7) {
      const noteShapes = ["♪", "♫", "♬"];
      const base = bowl.getWorldPosition(new THREE.Vector3());
      for (let i = 0; i < count; i += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = ["#255cff", "#23b26b", "#ff9f1c", "#ff5d7d"][i % 4];
        ctx.font = "bold 62px Trebuchet MS";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(noteShapes[i % noteShapes.length], 48, 50);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const note = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        note.position.copy(base);
        note.position.y += 62;
        note.scale.set(32, 32, 1);
        note.userData = {
          vx: (Math.random() - 0.5) * 120,
          vy: 110 + Math.random() * 80,
          vz: (Math.random() - 0.5) * 90,
          age: 0,
          life: 0.95 + Math.random() * 0.35,
          wobble: Math.random() * Math.PI * 2
        };
        state.notes.push(note);
        scene.add(note);
      }
    }

    function updateNotes(dt) {
      state.notes = state.notes.filter((note) => {
        note.userData.age += dt;
        note.position.x += note.userData.vx * dt + Math.sin(note.userData.age * 9 + note.userData.wobble) * 0.8;
        note.position.y += note.userData.vy * dt;
        note.position.z += note.userData.vz * dt;
        note.userData.vy -= 64 * dt;
        note.material.opacity = Math.max(0, 1 - note.userData.age / note.userData.life);
        note.scale.multiplyScalar(1 + dt * 0.24);
        if (note.userData.age > note.userData.life) {
          scene.remove(note);
          note.material.map?.dispose();
          note.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateSoundWaves(dt) {
      state.soundWaves = state.soundWaves.filter((wave) => {
        wave.userData.age += dt;
        if (wave.userData.age < 0) return true;
        wave.position.y += wave.userData.rise * dt;
        if (wave.userData.isLabel) {
          wave.scale.multiplyScalar(1 + dt * wave.userData.expand);
        } else {
          wave.scale.multiplyScalar(1 + dt * wave.userData.expand);
          wave.rotation.z += dt * 0.5;
        }
        const progress = wave.userData.age / wave.userData.life;
        wave.material.opacity = Math.max(0, 1 - progress);
        if (progress >= 1) {
          scene.remove(wave);
          wave.geometry?.dispose?.();
          wave.material.map?.dispose?.();
          wave.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateSoundTrails(dt) {
      state.soundTrails = state.soundTrails.filter((note) => {
        note.userData.age += dt;
        if (note.userData.age < 0) return true;
        const progress = THREE.MathUtils.clamp(note.userData.age / note.userData.life, 0, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const curve = new THREE.QuadraticBezierCurve3(note.userData.start, note.userData.mid, note.userData.end);
        note.position.copy(curve.getPoint(eased));
        note.position.y += Math.sin(progress * Math.PI * 2 + note.userData.wobble) * 10;
        const fadeIn = THREE.MathUtils.clamp(progress / 0.18, 0, 1);
        const fadeOut = THREE.MathUtils.clamp((1 - progress) / 0.22, 0, 1);
        note.material.opacity = fadeIn * fadeOut * 0.88;
        const scale = 18 + Math.sin(progress * Math.PI) * 16;
        note.scale.setScalar(scale);
        note.rotation.z += note.userData.spin * dt;
        if (progress >= 1) {
          scene.remove(note);
          note.material.map?.dispose?.();
          note.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateShockwaves(dt) {
      state.shockwaves = state.shockwaves.filter((mark) => {
        mark.userData.age += dt;
        mark.position.x += mark.userData.vx * dt;
        mark.position.y += mark.userData.vy * dt;
        mark.position.z += mark.userData.vz * dt;
        mark.userData.vy -= (mark.userData.gravity ?? 120) * dt;
        mark.rotation.z += mark.userData.rot * dt;
        mark.material.opacity = Math.max(0, 1 - mark.userData.age / mark.userData.life);
        mark.scale.multiplyScalar(1 + dt * (mark.userData.growth ?? 0.32));
        if (mark.userData.age > mark.userData.life) {
          scene.remove(mark);
          mark.geometry?.dispose?.();
          mark.material.map?.dispose();
          mark.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateLearnCards(dt) {
      state.learnCards3d = state.learnCards3d.filter((card) => {
        card.userData.age += dt;
        const progress = THREE.MathUtils.clamp(card.userData.age / card.userData.life, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const start = card.userData.start;
        const end = card.userData.end;
        const mid = start.clone().lerp(end, 0.52).add(new THREE.Vector3(0, card.userData.lift, 0));
        const pos = new THREE.QuadraticBezierCurve3(start, mid, end).getPoint(eased);
        card.position.copy(pos);
        const pop = progress < 0.18 ? 0.7 + progress / 0.18 * 0.44 : 1.14 - eased * 0.34;
        card.scale.set(124 * pop, 82 * pop, 1);
        card.rotation.z = Math.sin(progress * Math.PI) * card.userData.rot;
        card.material.opacity = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : 1;
        if (progress >= 1) {
          scene.remove(card);
          card.material.map?.dispose?.();
          card.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateKnowledgeBadges(dt) {
      state.knowledgeBadges3d = state.knowledgeBadges3d.filter((badge) => {
        badge.userData.age += dt;
        const progress = THREE.MathUtils.clamp(badge.userData.age / badge.userData.life, 0, 1);
        const hold = progress < 0.28;
        const travel = hold ? 0 : THREE.MathUtils.clamp((progress - 0.28) / 0.72, 0, 1);
        const eased = travel < 0.5
          ? 2 * travel * travel
          : 1 - Math.pow(-2 * travel + 2, 2) / 2;
        const start = badge.userData.start;
        const end = badge.userData.end;
        const mid = start.clone().lerp(end, 0.54).add(new THREE.Vector3(0, badge.userData.lift, 0));
        const point = new THREE.QuadraticBezierCurve3(start, mid, end).getPoint(eased);
        if (hold) {
          point.y += Math.sin(progress / 0.28 * Math.PI) * 18 + Math.sin(badge.userData.age * 8 + badge.userData.wobble) * 3;
        } else {
          point.y += Math.sin(travel * Math.PI) * 12;
        }
        badge.position.copy(point);
        const intro = THREE.MathUtils.clamp(progress / 0.16, 0, 1);
        const pop = hold ? 0.82 + Math.sin(intro * Math.PI) * 0.22 : 1 - eased * 0.36;
        badge.scale.set(198 * pop, 84 * pop, 1);
        badge.rotation.z = Math.sin(progress * Math.PI * 1.2) * badge.userData.rot;
        badge.material.opacity = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : intro;
        if (progress >= 1) {
          scene.remove(badge);
          badge.material.map?.dispose?.();
          badge.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateMasteryTokens(now) {
      const listenLeft = Math.max(0, (state.listenPulseUntil - now) / 1180);
      const listenPulse = listenLeft ? Math.sin((1 - listenLeft) * Math.PI) : 0;
      state.masteryTokens3d.forEach((token, index) => {
        const age = Math.max(0, now - (token.userData.birth || now));
        const intro = THREE.MathUtils.clamp(age / 520, 0, 1);
        const pop = 1 - Math.pow(1 - intro, 3);
        const breathe = 1 + Math.sin(now / 540 + token.userData.seed) * 0.035 + listenPulse * 0.08;
        const scale = (token.userData.baseScale || 0.72) * (0.18 + pop * 0.82) * breathe;
        token.scale.setScalar(scale);
        token.rotation.y += Math.sin(now / 1000 + token.userData.seed) * 0.0008;
        if (token.userData.glow?.material) {
          token.userData.glow.material.opacity = 0.16 + Math.sin(now / 420 + token.userData.seed) * 0.05 + listenPulse * 0.2;
          token.userData.glow.rotation.z += 0.012 + listenPulse * 0.02;
        }
        if (token.userData.title?.material) {
          token.userData.title.quaternion.copy(camera.quaternion);
          token.userData.title.material.opacity = 0.86 + Math.sin(now / 460 + index) * 0.08;
        }
        if (token.userData.sub?.material) {
          token.userData.sub.quaternion.copy(camera.quaternion);
          token.userData.sub.material.opacity = 0.54 + Math.sin(now / 600 + index) * 0.08;
        }
      });
    }

    function updateDragSparkles(dt) {
      state.dragSparkles = state.dragSparkles.filter((sparkle) => {
        sparkle.userData.age += dt;
        sparkle.position.x += sparkle.userData.vx * dt;
        sparkle.position.y += sparkle.userData.vy * dt;
        sparkle.position.z += sparkle.userData.vz * dt;
        sparkle.userData.vy -= 110 * dt;
        sparkle.rotation.z += sparkle.userData.rot * dt;
        sparkle.material.opacity = Math.max(0, 1 - sparkle.userData.age / sparkle.userData.life);
        sparkle.scale.multiplyScalar(1 + dt * 0.18);
        if (sparkle.userData.age > sparkle.userData.life) {
          scene.remove(sparkle);
          sparkle.geometry?.dispose?.();
          sparkle.material.map?.dispose?.();
          sparkle.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updateWalkPuffs(dt) {
      state.walkPuffs = state.walkPuffs.filter((puff) => {
        puff.userData.age += dt;
        puff.position.x += puff.userData.vx * dt;
        puff.position.y += puff.userData.vy * dt;
        puff.position.z += puff.userData.vz * dt;
        puff.userData.vy -= 42 * dt;
        puff.rotation.z += puff.userData.rot * dt;
        const progress = puff.userData.age / puff.userData.life;
        puff.material.opacity = Math.max(0, 0.5 * (1 - progress));
        puff.scale.multiplyScalar(1 + dt * 0.36);
        if (progress >= 1) {
          scene.remove(puff);
          puff.geometry?.dispose?.();
          puff.material.map?.dispose?.();
          puff.material.dispose();
          return false;
        }
        return true;
      });
    }

    function updatePickupAura(now) {
      const cat = state.draggingCat || (state.selectedCat && !state.solved ? state.selectedCat : null);
      const active = Boolean(cat && cat.visible);
      pickupAura.visible = active || (pickupAuraRing.material.opacity || 0) > 0.02;
      const targetOpacity = active ? (state.draggingCat ? 0.66 : 0.28) : 0;
      pickupAuraRing.material.opacity = THREE.MathUtils.lerp(pickupAuraRing.material.opacity || 0, targetOpacity, 0.22);
      pickupAuraBeam.material.opacity = THREE.MathUtils.lerp(pickupAuraBeam.material.opacity || 0, state.draggingCat ? 0.22 : 0, 0.18);
      if (!pickupAura.visible || !cat) return;
      const base = cat.getWorldPosition(new THREE.Vector3());
      pickupAura.position.copy(base);
      pickupAura.position.y -= 7;
      const pulse = 1 + Math.sin(now / 155) * 0.08 + (state.draggingCat ? 0.18 : 0);
      pickupAuraRing.scale.set(pulse, pulse, pulse);
      pickupAuraRing.rotation.z += 0.025;
      pickupAuraBeam.scale.set(1 + Math.sin(now / 180) * 0.06, 1, 1 + Math.cos(now / 180) * 0.06);
      pickupAuraBeam.position.y = 76 + Math.sin(now / 190) * 5;
    }

    function updateFeedGuide(now) {
      const cat = state.draggingCat || state.selectedCat;
      const active = Boolean(cat && cat.visible && !state.solved);
      const nearBowlNow = Boolean(state.draggingCat && isNearBowl(state.draggingCat));
      const targetOpacity = active ? (state.draggingCat ? (nearBowlNow ? 1 : 0.92) : 0.68) : 0;
      feedGuide.visible = active || feedGuideLine.material.opacity > 0.02;
      feedGuideLine.material.opacity = THREE.MathUtils.lerp(feedGuideLine.material.opacity || 0, targetOpacity, 0.18);
      feedGuideArrow.material.opacity = feedGuideLine.material.opacity;
      feedGuideDots.forEach((dot) => {
        dot.material.opacity = feedGuideLine.material.opacity * 0.9;
      });
      if (!feedGuide.visible || !cat) return;

      const start = cat.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 44, 0));
      const end = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 86, 0));
      const mid = start.clone().lerp(end, 0.5);
      mid.y += (nearBowlNow ? 46 : 78) + Math.sin(now / 240) * (nearBowlNow ? 5 : 10);
      const points = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(24);
      feedGuideLine.geometry.setFromPoints(points);
      feedGuideLine.material.color.setHex(nearBowlNow ? 0x6fd082 : 0xffd86f);
      feedGuideArrow.material.color.copy(feedGuideLine.material.color);

      const beforeEnd = points[points.length - 4];
      feedGuideArrow.position.copy(end);
      feedGuideArrow.lookAt(beforeEnd);
      feedGuideArrow.rotateX(Math.PI / 2);
      const pulse = 1 + Math.sin(now / 180) * 0.08;
      feedGuideArrow.scale.setScalar((state.draggingCat ? (nearBowlNow ? 1.58 : 1.24) : 0.98) * pulse);
      feedGuideDots.forEach((dot, index) => {
        const pointIndex = Math.min(points.length - 1, 3 + index * 3);
        const point = points[pointIndex];
        const dotPulse = 1 + Math.sin(now / 150 + dot.userData.seed) * 0.18;
        dot.position.copy(point);
        dot.position.y += Math.sin(now / 180 + dot.userData.seed) * (state.draggingCat ? 4 : 7);
        const travel = ((now / 280 + index * 0.16) % 1);
        const selectedPulse = !state.draggingCat ? 0.82 + Math.sin(travel * Math.PI) * 0.42 : 1;
        dot.scale.setScalar((state.draggingCat ? (nearBowlNow ? 1.76 : 1.32) : 0.82) * dotPulse * selectedPulse);
        dot.material.color.setHex(nearBowlNow ? 0x6fd082 : (index % 2 ? 0x8fd3ff : 0xffd86f));
        dot.material.opacity = feedGuideLine.material.opacity * (state.draggingCat ? (nearBowlNow ? 1 : 0.82) : 0.34 + Math.sin(travel * Math.PI) * 0.34);
      });
    }

    function updateSoundBridge(now) {
      const active = Boolean(state.heardTarget && !state.solved && !state.draggingCat);
      const victoryLeft = Math.max(0, (state.victoryUntil - now) / 3200);
      const targetOpacity = active ? 0.48 : victoryLeft ? 0.64 : 0;
      soundBridge.visible = targetOpacity > 0 || (soundBridgeLine.material.opacity || 0) > 0.02;
      soundBridgeLine.material.opacity = THREE.MathUtils.lerp(soundBridgeLine.material.opacity || 0, targetOpacity * 0.58, 0.15);
      if (!soundBridge.visible) return;

      const start = bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(28, 118, 0));
      const end = globeGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(-150, 168, 315));
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 96 + Math.sin(now / 650) * 14, 20));
      const points = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(42);
      soundBridgeLine.geometry.setFromPoints(points);
      soundBridgeLine.material.color.setHex(victoryLeft ? 0x6fd082 : state.heardTarget ? STAGES[state.stage].accent : 0xfff2a6);

      soundBridgeNotes.forEach((note, index) => {
        const travel = (now / (1650 - index * 36) + index / soundBridgeNotes.length) % 1;
        const point = points[Math.min(points.length - 1, Math.floor(travel * (points.length - 1)))];
        note.position.copy(point);
        note.position.y += Math.sin(now / 210 + note.userData.seed) * 10;
        note.rotation.z = Math.sin(now / 260 + note.userData.seed) * 0.18;
        const pulse = 1 + Math.sin(now / 180 + note.userData.seed) * 0.09 + victoryLeft * 0.3;
        const wide = note.scale.x > note.scale.y;
        note.scale.set((wide ? 28 : 22) * pulse, 22 * pulse, 1);
        note.material.opacity = THREE.MathUtils.lerp(
          note.material.opacity || 0,
          targetOpacity * (0.45 + Math.sin(travel * Math.PI) * 0.52),
          0.18
        );
      });
    }

    function updateSearchMotes(now) {
      const active = Boolean(state.heardTarget && !state.solved && !state.draggingCat);
      const listenLeft = Math.max(0, (state.listenPulseUntil - now) / 1180);
      const listenPulse = listenLeft ? Math.sin((1 - listenLeft) * Math.PI) : 0;
      const center = globeGroup.getWorldPosition(new THREE.Vector3());
      searchMoteGroup.visible = active
        || searchMotes.some((mote) => (mote.material.opacity || 0) > 0.02)
        || searchOrbitRings.some((ring) => (ring.material.opacity || 0) > 0.02);
      if (!searchMoteGroup.visible) return;
      searchMoteGroup.position.copy(center);
      searchOrbitRings.forEach((ring, index) => {
        const targetOpacity = active ? 0.16 - index * 0.035 + listenPulse * 0.24 : 0;
        ring.material.opacity = THREE.MathUtils.lerp(ring.material.opacity || 0, targetOpacity, 0.14);
        ring.rotation.z += 0.0025 * (index % 2 ? -1 : 1);
        ring.rotation.x = Math.PI / 2 + index * 0.34 + Math.sin(now / 1200 + ring.userData.seed) * 0.035;
        ring.scale.setScalar(1 + Math.sin(now / 520 + ring.userData.seed) * 0.018 + listenPulse * 0.08);
      });
      searchMotes.forEach((mote, index) => {
        const seed = mote.userData.seed || 0;
        const angle = now / (2450 + index * 90) + seed + globeGroup.rotation.y * 0.28;
        const radius = mote.userData.radius + Math.sin(now / 780 + seed) * 18;
        mote.position.set(
          Math.cos(angle) * radius,
          mote.userData.height + Math.sin(angle * 1.4 + seed) * 38 + listenPulse * 18,
          285 + Math.sin(angle) * 92
        );
        const targetOpacity = active ? 0.22 + Math.sin(now / 360 + seed) * 0.1 + listenPulse * 0.22 : 0;
        mote.material.opacity = THREE.MathUtils.lerp(mote.material.opacity || 0, targetOpacity, 0.16);
        if (mote.isSprite) {
          const pulse = 1 + Math.sin(now / 230 + seed) * 0.1 + listenPulse * 0.24;
          mote.scale.set(18 * pulse, 18 * pulse, 1);
          mote.rotation.z = Math.sin(now / 320 + seed) * 0.18;
        } else {
          mote.scale.setScalar(1 + Math.sin(now / 260 + seed) * 0.18 + listenPulse * 0.3);
        }
      });
    }

    function updateFeedMagnet(now) {
      const cat = state.draggingCat;
      const near = Boolean(cat && cat.visible && isNearBowl(cat));
      const active = Boolean(cat && cat.visible && !state.solved);
      const targetPower = near ? 1 : active ? 0.72 : 0;
      feedMagnet.visible = targetPower > 0 || feedMagnetRings.some((ring) => ring.material.opacity > 0.02);
      if (!feedMagnet.visible) return;
      const base = bowl.getWorldPosition(new THREE.Vector3());
      feedMagnet.position.copy(base).add(new THREE.Vector3(0, 10, 0));
      feedMagnetRings.forEach((ring, index) => {
        const pulse = 1 + Math.sin(now / (180 + index * 30) + ring.userData.seed) * (near ? 0.1 : 0.05);
        ring.scale.setScalar((near ? 1.54 : active ? 1.22 : 0.96) * pulse);
        ring.rotation.z += (near ? 0.034 : 0.014) * (index % 2 ? -1 : 1);
        const opacityTarget = targetPower * (near ? 0.74 - index * 0.08 : 0.5 - index * 0.07);
        ring.material.opacity = THREE.MathUtils.lerp(ring.material.opacity || 0, opacityTarget, 0.2);
      });
      feedMagnetPaws.forEach((paw, index) => {
        const angle = now / 420 + index * Math.PI / 3;
        const radius = near ? 108 + Math.sin(now / 210 + index) * 10 : 82;
        paw.position.set(
          Math.cos(angle) * radius,
          58 + Math.sin(now / 170 + paw.userData.seed) * (near ? 10 : 4),
          Math.sin(angle) * 34
        );
        const scale = (near ? 1.28 : 0.88) * (1 + Math.sin(now / 190 + index) * 0.08);
        paw.scale.set(18 * scale, 18 * scale, 1);
        paw.rotation.z = angle + Math.sin(now / 260 + index) * 0.2;
        paw.material.opacity = THREE.MathUtils.lerp(paw.material.opacity || 0, targetPower * (near ? 0.84 : 0.36), 0.22);
      });
      if (near && now - (state.lastBowlMagnetSparkAt || 0) > 150) {
        state.lastBowlMagnetSparkAt = now;
        emitBowlMagnetSpark(base);
      }
    }

    function updateCatHints(now) {
      const center = new THREE.Vector3(globeGroup.position.x, globeGroup.position.y, globeGroup.position.z);
      const cameraDir = camera.position.clone().sub(center).normalize();
      let focusSprite = null;
      let focusFacing = false;
      state.catHints.forEach((hint) => {
        const choice = hint.userData.choice;
        const sprite = choice?.sprite;
        const radar = hint.userData.radar;
        if (!sprite || !sprite.visible || state.solved) {
          hint.visible = false;
          if (radar) radar.visible = false;
          return;
        }
        const catPos = sprite.getWorldPosition(new THREE.Vector3());
        const surfaceDir = catPos.clone().sub(center).normalize();
        const facingCamera = surfaceDir.dot(cameraDir) > -0.08;
        const isCandidate = sprite === state.selectedCat || sprite.userData.dragging;
        if (isCandidate) {
          focusSprite = sprite;
          focusFacing = facingCamera;
        }
        const rejected = sprite.userData.rejectedUntil && sprite.userData.rejectedUntil > now;
        const huntPower = state.heardTarget ? 1 : 0.34;
        hint.visible = facingCamera;
        if (radar) radar.visible = !facingCamera && state.heardTarget;
        hint.material.color.setHex(rejected ? 0xffdce1 : 0xffffff);
        hint.material.opacity = rejected ? 0.82 : isCandidate ? 0.98 : 0.36 + huntPower * 0.4;
        if (facingCamera) {
          hint.position.copy(catPos).add(new THREE.Vector3(0, 72 + Math.sin(now / 260 + sprite.userData.bobSeed) * 4 + (isCandidate ? 8 : 0), 0));
          const pulse = isCandidate ? 1 + Math.sin(now / 170) * 0.08 : rejected ? 1 + Math.sin(now / 120) * 0.06 : 1;
          hint.scale.set((isCandidate ? 68 : rejected ? 62 : state.heardTarget ? 56 : 44) * pulse, (isCandidate ? 40 : rejected ? 36 : state.heardTarget ? 33 : 26) * pulse, 1);
          if (radar) radar.material.opacity = THREE.MathUtils.lerp(radar.material.opacity || 0, 0, 0.24);
        } else {
          const side = surfaceDir.x >= 0 ? 1 : -1;
          const pulse = 1 + Math.sin(now / 210 + sprite.userData.bobSeed) * 0.08;
          const edgePos = new THREE.Vector3(
            globeGroup.position.x + side * 402 + Math.sin(now / 260 + sprite.userData.bobSeed) * 8,
            globeGroup.position.y + THREE.MathUtils.clamp(surfaceDir.y * 260, -200, 205),
            globeGroup.position.z + 300
          );
          hint.position.copy(edgePos);
          hint.scale.set((isCandidate ? 78 : 56) * pulse, (isCandidate ? 46 : 34) * pulse, 1);
          hint.material.opacity = 0;
          if (radar) {
            radar.position.copy(edgePos).add(new THREE.Vector3(side * 12, 14 + Math.sin(now / 200 + sprite.userData.bobSeed) * 6, 0));
            radar.scale.setScalar((isCandidate ? 34 : 25) * pulse);
            radar.rotation.z = side > 0 ? -0.65 : 0.65;
            radar.material.opacity = THREE.MathUtils.lerp(radar.material.opacity || 0, isCandidate ? 0.94 : 0.48, 0.22);
          }
        }
      });
      const compassActive = Boolean(focusSprite && !state.solved);
      targetCompass.visible = compassActive;
      const targetOpacity = compassActive ? (focusFacing ? 0.74 : 0.96) : 0;
      targetCompassRing.material.opacity = THREE.MathUtils.lerp(targetCompassRing.material.opacity || 0, targetOpacity, 0.2);
      targetCompassNote.material.opacity = THREE.MathUtils.lerp(targetCompassNote.material.opacity || 0, targetOpacity, 0.2);
      if (compassActive) {
        const targetPos = focusSprite.getWorldPosition(new THREE.Vector3());
        if (focusFacing) {
          targetCompass.position.copy(targetPos).add(new THREE.Vector3(0, 18 + Math.sin(now / 190) * 4, 0));
          targetCompassRing.rotation.x = -Math.PI / 2;
          targetCompassRing.scale.setScalar(1 + Math.sin(now / 180) * 0.1);
          targetCompassNote.position.set(0, 78 + Math.sin(now / 230) * 4, 0);
        } else {
          const surfaceDir = targetPos.clone().sub(center).normalize();
          const side = surfaceDir.x >= 0 ? 1 : -1;
          targetCompass.position.set(
            globeGroup.position.x + side * 430,
            globeGroup.position.y + THREE.MathUtils.clamp(surfaceDir.y * 260, -215, 215),
            globeGroup.position.z + 326
          );
          targetCompassRing.rotation.x = -Math.PI / 2;
          targetCompassRing.scale.setScalar(0.86 + Math.sin(now / 150) * 0.08);
          targetCompassNote.position.set(0, 72, 0);
        }
      }
    }

    function updateConfetti(dt) {
      state.confetti = state.confetti.filter((piece) => {
        piece.userData.age += dt;
        piece.position.x += piece.userData.vx * dt;
        piece.position.y += piece.userData.vy * dt;
        piece.position.z += piece.userData.vz * dt;
        piece.userData.vy -= 380 * dt;
        piece.rotation.z += piece.userData.rot * dt;
        piece.material.opacity = Math.max(0, 1 - piece.userData.age / piece.userData.life);
        if (piece.userData.age > piece.userData.life) {
          scene.remove(piece);
          piece.geometry.dispose();
          piece.material.dispose();
          return false;
        }
        return true;
      });
    }

    function handlePointerDown(event) {
      const cat = pickCat(event);
      sceneEl.dataset.lastPick = cat?.userData?.choice?.id || "";
      state.lastPointerX = event.clientX;
      state.lastPointerY = event.clientY;
      state.dragStartX = event.clientX;
      state.dragStartY = event.clientY;
      state.dragDistance = 0;
      if (!cat || state.solved) {
        state.rotatingWorld = true;
        state.rotateVelocityX = 0;
        state.rotateVelocityY = 0;
        state.lastWorldSpinAt = performance.now();
        sceneEl.classList.add("grabbing");
        return;
      }
      sceneEl.classList.add("grabbing");
      setSelectedCat(cat);
      state.draggingCat = cat;
      cat.userData.dragging = true;
      cat.userData.lift = 1;
      state.suppressClickUntil = performance.now() + 260;
      emitPickupSparkle(cat);
      const worldPoint = screenToWorld(event);
      if (worldPoint) state.dragOffset.copy(cat.position).sub(worldPoint);
      updateHeader();
      updateCoach();
    }

    function handlePointerMove(event) {
      if (state.rotatingWorld && !state.draggingCat) {
        const dx = event.clientX - state.lastPointerX;
        const dy = event.clientY - state.lastPointerY;
        const spinX = THREE.MathUtils.clamp(dx * 0.0032, -0.075, 0.075);
        const spinY = THREE.MathUtils.clamp(dy * 0.0018, -0.038, 0.038);
        globeGroup.rotation.y += spinX;
        globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x + spinY, -0.55, 0.42);
        state.rotateVelocityX = THREE.MathUtils.lerp(state.rotateVelocityX, spinX, 0.55);
        state.rotateVelocityY = THREE.MathUtils.lerp(state.rotateVelocityY, spinY, 0.55);
        state.lastWorldSpinAt = performance.now();
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;
        return;
      }
      if (!state.draggingCat) return;
      state.dragDistance = Math.max(
        state.dragDistance,
        Math.hypot(event.clientX - state.dragStartX, event.clientY - state.dragStartY)
      );
      const bowlHover = pointerHitsBowl(event);
      if (bowlHover && state.dragDistance > 12) {
        const cat = state.draggingCat;
        cat.userData.overBowl = true;
        cat.userData.floatingDrag = false;
        cat.userData.lift = 1;
        setCatWorldPosition(cat, updateBowlAnchor().clone().add(new THREE.Vector3(0, 112, 0)));
        cat.quaternion.identity();
        cat.scale.setScalar(1.34);
        emitDragSparkle(cat);
        updateCoach();
        return;
      }
      const worldPoint = screenToWorld(event);
      const cat = state.draggingCat;
      cat.userData.overBowl = false;
      if (!worldPoint) {
        const dragPoint = screenToDragPlane(event);
        if (!dragPoint) return;
        cat.userData.floatingDrag = true;
        cat.userData.lift = 1;
        setCatWorldPosition(cat, dragPoint);
        cat.quaternion.identity();
        cat.scale.setScalar(1.34);
        emitDragSparkle(cat);
        updateCoach();
        return;
      }
      cat.userData.floatingDrag = false;
      const latLon = pointToLatLon(worldPoint);
      cat.userData.lat = latLon.lat;
      cat.userData.lon = latLon.lon;
      cat.userData.targetLat = latLon.lat;
      cat.userData.targetLon = latLon.lon;
      placeOnGlobe(cat, latLon.lat, latLon.lon, 22 + cat.userData.lift * 40);
      emitDragSparkle(cat);
      updateCoach();
    }

    function handlePointerUp() {
      state.rotatingWorld = false;
      sceneEl.classList.remove("grabbing");
      if (!state.draggingCat) return;
      const cat = state.draggingCat;
      const wasOverBowl = cat.userData.overBowl;
      const wasTap = state.dragDistance < 12;
      cat.userData.dragging = false;
      cat.userData.overBowl = false;
      cat.userData.floatingDrag = false;
      cat.userData.lift = wasTap ? 1 : 0;
      cat.userData.pickedUntil = performance.now() + (wasTap ? 1500 : 500);
      state.suppressClickUntil = performance.now() + 260;
      const intentionalDrop = wasOverBowl || (state.dragDistance > 24 && isNearBowl(cat));
      const dropped = intentionalDrop ? checkFeed(cat, wasOverBowl) : false;
      if (!dropped && !state.solved) {
        cat.userData.targetLat = cat.userData.lat;
        cat.userData.targetLon = cat.userData.lon;
      }
      state.draggingCat = null;
      updateHeader();
      updateCoach();
      updateGestureGuide();
    }

    function handleSceneClick(event) {
      if (performance.now() < state.suppressClickUntil) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hitBowl = Boolean(pointerHitsBowl(event));
      if (hitBowl) {
        if (state.selectedCat && !state.solved) {
          if (state.selectedCat.userData.choice.id === state.target.id) solve(state.selectedCat);
          else miss(state.selectedCat);
        } else {
          playFoodCue(state.target);
          markTargetHeard();
          emitNoteBurst(8);
          emitSoundWave(bowl.getWorldPosition(new THREE.Vector3()), state.target, { hidden: true, compact: true });
          renderFeedback("猫粮已响", "去点猫，对上就抓去投喂。");
          updateCoach();
        }
        return;
      }
      const worldPoint = screenToWorld(event);
      if (!worldPoint) return;
    }

    function setStage(stage) {
      state.stage = stage;
      state.round = 1;
      state.score = 0;
      state.combo = 0;
      state.learned = [];
      state.lastLearned = "";
      state.masteryTokens3d = [];
      masteryTokenGroup.clear();
      state.missionOpen = true;
      tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.stage === stage));
      resetRound();
      showRoundBanner(STAGES[stage].intro, "complete");
      renderFeedback(STAGES[stage].intro, STAGES[stage].lesson);
    }

    function resize() {
      const rect = sceneEl.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      const aspect = rect.width / Math.max(1, rect.height);
      const viewHeight = 1080;
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
    }

    function animate(now) {
      try {
        const dt = Math.min(0.05, (now - state.lastTime) / 1000 || 0.016);
        state.lastTime = now;
        const listenLeft = Math.max(0, (state.listenPulseUntil - now) / 1180);
        const listenPulse = listenLeft ? Math.sin((1 - listenLeft) * Math.PI) : 0;
        if (!state.rotatingWorld && !state.draggingCat) {
          globeGroup.rotation.y += state.rotateVelocityX * Math.min(1.45, dt * 60);
          globeGroup.rotation.x = THREE.MathUtils.clamp(
            globeGroup.rotation.x + state.rotateVelocityY * Math.min(1.45, dt * 60),
            -0.55,
            0.42
          );
          const damping = Math.pow(0.89, dt * 60);
          state.rotateVelocityX *= damping;
          state.rotateVelocityY *= damping;
          if (Math.abs(state.rotateVelocityX) < 0.00008) state.rotateVelocityX = 0;
          if (Math.abs(state.rotateVelocityY) < 0.00004) state.rotateVelocityY = 0;
        }
        state.cats.forEach((choice) => {
        const sprite = choice.sprite;
        if (!sprite || !sprite.visible) return;
        const data = sprite.userData;
        data.isIdling = Boolean(!data.dragging && !data.fed && data.idleUntil > now && data.pickedUntil < now && sprite !== state.selectedCat);
        if (!data.dragging && !data.fed && data.pickedUntil < now && sprite !== state.selectedCat) {
          if (data.isIdling) {
            if (now - (data.lastIdleGlyphAt || 0) > 520) {
              data.lastIdleGlyphAt = now;
              emitCatIdleGlyph(sprite);
            }
          } else {
            const dLat = data.targetLat - data.lat;
            const dLon = shortestLonDelta(data.lon, data.targetLon);
            const distance = Math.hypot(dLat, dLon);
            if (distance < 0.035 || !Number.isFinite(distance)) {
              const next = randomGlobePoint(data.lat, data.lon);
              const actions = ["listen", "sniff", "stretch", "hop"];
              data.idleAction = actions[Math.floor(Math.random() * actions.length)];
              data.idleGlyph = data.idleAction === "listen" ? "♪" : data.idleAction === "sniff" ? "?" : data.idleAction === "stretch" ? "♡" : "!";
              data.idleStartedAt = now;
              data.idleUntil = now + 620 + Math.random() * 620;
              data.targetLat = next.lat;
              data.targetLon = next.lon;
              data.isIdling = true;
            } else {
              const step = Math.min(distance, data.speed * dt);
              data.lat += (dLat / distance) * step;
              data.lon = normalizeLon(data.lon + (dLon / distance) * step);
              data.walkHeading = Math.atan2(dLon, dLat);
            }
          }
          const tooClose = state.cats.some((other) => {
            const otherSprite = other.sprite;
            if (!otherSprite || otherSprite === sprite || !otherSprite.visible || otherSprite.userData.dragging || otherSprite.userData.fed) return false;
            return angularDistance(data.lat, data.lon, otherSprite.userData.lat, otherSprite.userData.lon) < 0.32;
          });
          if (tooClose && now - (data.lastAvoidAt || 0) > 900) {
            const next = randomGlobePoint(data.lat, data.lon);
            data.targetLat = next.lat;
            data.targetLon = next.lon;
            data.lastAvoidAt = now;
          }
        }
        const targetLift = data.dragging || data.pickedUntil > now ? 1 : 0;
        data.lift = THREE.MathUtils.lerp(data.lift || 0, targetLift, 0.22);
        const isLifted = data.lift > 0.03;
        const catListenPulse = listenPulse * (0.82 + Math.sin(data.listenSeed || 0) * 0.16);
        const listenHop = catListenPulse ? Math.sin((1 - listenLeft) * Math.PI * 1.6 + (data.listenSeed || 0) * 0.2) * 12 * catListenPulse : 0;
        const walkBounce = !data.dragging && !data.fed ? Math.max(0, Math.sin(now / 130 + data.bobSeed)) * 4 : 0;
        const grabPop = Math.max(0, ((data.grabPopUntil || 0) - now) / 520);
        const grabBounce = grabPop ? Math.sin((1 - grabPop) * Math.PI) : 0;
        const spawnLeft = Math.max(0, ((data.spawnUntil || 0) - now) / Math.max(1, (data.spawnUntil || 1) - (data.spawnAt || 0)));
        const spawnActive = spawnLeft > 0 && !data.dragging && !data.fed;
        const spawnProgress = spawnActive ? 1 - spawnLeft : 1;
        const spawnEase = spawnActive ? 1 - Math.pow(1 - spawnProgress, 3) : 1;
        const spawnBounce = spawnActive ? Math.sin(spawnProgress * Math.PI) : 0;
        const scale = (data.visualScale || 1) * (0.28 + 0.72 * spawnEase) * (1 + data.lift * 0.38 + grabBounce * 0.16 + catListenPulse * 0.08 + spawnBounce * 0.14);
        sprite.scale.setScalar(scale);
        if (data.fed && data.feedStartAt) {
          const progress = THREE.MathUtils.clamp((now - data.feedStartAt) / Math.max(1, data.feedEndAt - data.feedStartAt), 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const start = data.feedFrom || sprite.getWorldPosition(new THREE.Vector3());
          const end = data.feedTo || bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 92, 0));
          const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, data.feedArc || 156, 0));
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          setCatWorldPosition(sprite, curve.getPoint(eased));
          sprite.quaternion.identity();
          sprite.rotation.set(
            Math.sin(progress * Math.PI) * 0.38,
            data.feedSpin * progress * Math.PI * 1.15,
            -Math.sin(progress * Math.PI) * 0.42
          );
          const popScale = (data.visualScale || 1) * (1.24 - eased * 0.5 + Math.sin(progress * Math.PI) * 0.22);
          sprite.scale.setScalar(Math.max(0.18, popScale));
          data.lift = THREE.MathUtils.lerp(data.lift || 0, 1, 0.26);
          if (progress > 0.16 && progress < 0.86) emitDragSparkle(sprite);
          if (progress >= 1) {
            sprite.visible = false;
            data.feedStartAt = 0;
          }
        } else if (data.overBowl && data.dragging) {
          setCatWorldPosition(sprite, bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 112 + Math.sin(now / 95) * 6, 0)));
          sprite.quaternion.identity();
        } else if (data.floatingDrag && data.dragging) {
          sprite.position.y += Math.sin(now / 95 + data.bobSeed) * 0.35;
          sprite.quaternion.identity();
        } else {
          const spawnLift = spawnActive ? (1 - spawnEase) * 86 + spawnBounce * 28 : 0;
          placeOnGlobe(sprite, data.lat, data.lon, 6 + walkBounce + Math.max(0, listenHop) + spawnLift + data.lift * 126);
          if (!data.fed && !data.dragging && data.pickedUntil < now && isFacingCamera(sprite, -0.18)) {
            emitWalkPuff(sprite);
          }
        }
        animateCatParts(sprite, now, !data.dragging && !data.fed && !data.isIdling, data.lift || 0, !data.fed && !data.dragging ? catListenPulse : 0);
        const heading = Number.isFinite(data.walkHeading) ? data.walkHeading : 0;
        sprite.rotateY(heading + Math.sin(now / 360 + data.bobSeed) * 0.08);
        sprite.rotateX(isLifted ? Math.sin(now / 110 + data.bobSeed) * 0.13 * data.lift : 0);
        sprite.rotateZ(isLifted ? -0.22 * data.lift : Math.sin(now / 180 + data.bobSeed) * 0.025);
        if (data.wrongUntil && data.wrongUntil < now) {
          tintCat(sprite, sprite === state.selectedCat ? 0xe9fff0 : null);
          data.wrongUntil = 0;
        }
      });
      listenPulseRings.forEach((ring, index) => {
        const delayedLeft = Math.max(0, Math.min(1, listenLeft - index * 0.16));
        const ringPulse = delayedLeft ? Math.sin((1 - delayedLeft) * Math.PI) : 0;
        ring.visible = ringPulse > 0.01;
        ring.material.opacity = ringPulse * (0.34 - index * 0.06);
        ring.scale.setScalar(1 + (1 - delayedLeft) * (0.22 + index * 0.08));
        ring.rotation.z += dt * (0.22 + index * 0.05);
      });
      const pulse = 1 + Math.sin(now / 360) * 0.08;
      const bump = bowl.userData.bumpUntil && bowl.userData.bumpUntil > now ? 1.16 : 1;
      const dragNearBowl = state.draggingCat && isNearBowl(state.draggingCat);
      const attract = dragNearBowl ? 1.32 : 1;
      if (state.draggingCat) {
        state.draggingCat.userData.happyUntil = dragNearBowl ? Math.max(state.draggingCat.userData.happyUntil || 0, now + 260) : state.draggingCat.userData.happyUntil;
      }
      const celebrateLeft = Math.max(0, (state.celebrateUntil - now) / 1450);
      const victoryLeft = Math.max(0, (state.victoryUntil - now) / 3200);
      const celebratePop = celebrateLeft ? Math.sin((1 - celebrateLeft) * Math.PI) : 0;
      const victoryPulse = victoryLeft ? 0.5 + Math.sin(now / 190) * 0.5 : 0;
      const bowlFloat = Math.sin(now / 900) * 3;
      const bowlBase = updateBowlAnchor();
      feedingDock.position.copy(bowlBase).add(new THREE.Vector3(0, -20 + bowlFloat * 0.35, -18));
      feedingDock.scale.setScalar((dragNearBowl ? 1.08 : 1) * (1 + celebratePop * 0.08 + victoryPulse * 0.035));
      feedingDock.rotation.y = Math.sin(now / 1100) * 0.025;
      if (feedingDock.userData.sign) {
        feedingDock.userData.sign.material.opacity = 0.62 + Math.sin(now / 420) * 0.12 + (dragNearBowl ? 0.2 : 0);
        feedingDock.userData.sign.scale.setScalar(dragNearBowl ? 34 : 28);
      }
      const dockGuidePower = Math.max(
        state.draggingCat ? 0.82 : 0,
        dragNearBowl ? 1 : 0,
        state.heardTarget && !state.solved ? 0.38 : 0,
        celebratePop * 0.9,
        victoryLeft * 0.72
      );
      feedingDock.userData.parts?.arrows?.forEach((arrow, index) => {
        const wave = 0.5 + Math.sin(now / 190 + arrow.userData.seed) * 0.5;
        arrow.position.z = 74 + wave * 7 + dockGuidePower * 10;
        arrow.position.y = 20 + wave * 4;
        arrow.scale.setScalar((0.9 + wave * 0.18) * (1 + dockGuidePower * 0.24));
        arrow.material.opacity = THREE.MathUtils.lerp(arrow.material.opacity || 0, 0.2 + dockGuidePower * 0.55 + wave * 0.1, 0.18);
        arrow.material.color.setHex(dragNearBowl ? 0x6fd082 : index % 2 ? 0xffd86f : 0x8fd3ff);
      });
      feedingDock.userData.parts?.beacons?.forEach((beacon, index) => {
        const wave = 0.5 + Math.sin(now / 280 + beacon.userData.seed) * 0.5;
        beacon.rotation.y = Math.sin(now / 520 + index) * 0.1;
        beacon.scale.setScalar(1 + dockGuidePower * 0.14 + wave * 0.04);
        if (beacon.userData.note) {
          beacon.userData.note.position.y = 62 + wave * 6 + dockGuidePower * 7;
          beacon.userData.note.material.opacity = THREE.MathUtils.lerp(beacon.userData.note.material.opacity || 0, 0.48 + dockGuidePower * 0.42, 0.16);
        }
        if (beacon.userData.pole?.material) {
          beacon.userData.pole.material.opacity = THREE.MathUtils.lerp(beacon.userData.pole.material.opacity || 0, 0.5 + dockGuidePower * 0.34, 0.16);
        }
      });
      if (feedingDock.userData.parts?.gateRing) {
        const gateRing = feedingDock.userData.parts.gateRing;
        const wave = 1 + Math.sin(now / 230) * 0.04 + dockGuidePower * 0.18;
        gateRing.rotation.z += dt * (0.42 + dockGuidePower * 0.65);
        gateRing.scale.set(1.18 * wave, 0.56 * wave, 1);
        gateRing.material.color.setHex(dragNearBowl ? 0x6fd082 : state.heardTarget ? STAGES[state.stage].accent : 0xffd86f);
        gateRing.material.opacity = THREE.MathUtils.lerp(gateRing.material.opacity || 0, 0.12 + dockGuidePower * 0.46, 0.18);
      }
      feedingDock.userData.parts?.gateDots?.forEach((dot, index) => {
        const angle = now / (520 - index * 8) + index * Math.PI * 0.2;
        const radius = 168 + Math.sin(now / 240 + dot.userData.seed) * (dockGuidePower ? 14 : 6);
        dot.position.set(
          Math.cos(angle) * radius * 1.08,
          20 + Math.sin(now / 180 + dot.userData.seed) * (4 + dockGuidePower * 8),
          Math.sin(angle) * radius * 0.54
        );
        const dotScale = 1 + Math.sin(now / 190 + dot.userData.seed) * 0.16 + dockGuidePower * 0.38;
        dot.scale.setScalar(dotScale);
        dot.material.color.setHex(dragNearBowl ? 0x6fd082 : index % 2 ? 0xffffff : 0xffd86f);
        dot.material.opacity = THREE.MathUtils.lerp(dot.material.opacity || 0, 0.2 + dockGuidePower * 0.55, 0.16);
      });
      bowl.position.copy(bowlBase).add(new THREE.Vector3(0, bowlFloat, 0));
      bowlPulse.position.copy(bowlBase).add(new THREE.Vector3(0, -2 + bowlFloat, 0));
      bowlHalo.position.copy(bowlBase).add(new THREE.Vector3(0, -3 + bowlFloat, 0));
      bowlHit.position.copy(bowlBase).add(new THREE.Vector3(0, 34 + bowlFloat, 0));
      bowlLabel.position.copy(bowlBase).add(new THREE.Vector3(0, 148 + bowlFloat + Math.sin(now / 460) * 3, 0));
      listenPromptLabel.position.copy(bowlBase).add(new THREE.Vector3(0, 148 + bowlFloat + Math.sin(now / 420) * 4, 0));
      targetHeardLabel.position.copy(bowlBase).add(new THREE.Vector3(0, 208 + bowlFloat + Math.sin(now / 390) * 4, 0));
      autoReplayLabel.position.copy(bowlBase).add(new THREE.Vector3(0, 262 + bowlFloat + Math.sin(now / 300) * 5, 0));
      bowl.scale.setScalar(BOWL_SCALE * bump * attract * (1 + celebratePop * 0.1 + victoryPulse * 0.045));
      bowlPulse.scale.setScalar(pulse * bump * attract * (dragNearBowl ? 1.18 : 1) * (1 + celebratePop * 0.24 + victoryLeft * 0.22));
      bowlHalo.scale.setScalar((1.06 + Math.sin(now / 520) * 0.08) * bump * attract * (dragNearBowl ? 1.32 : 1) * (1 + celebratePop * 0.3 + victoryLeft * 0.36));
      const labelScale = (state.selectedCat ? 1.08 : 1) * (dragNearBowl ? 1.18 : 1) * (1 + Math.sin(now / 620) * 0.03);
      bowlLabel.scale.set((dragNearBowl ? 230 : 210) * labelScale, (dragNearBowl ? 104 : 96) * labelScale, 1);
      bowlLabel.material.opacity = THREE.MathUtils.lerp(bowlLabel.material.opacity || 0, state.selectedCat ? 1 : 0, 0.2);
      const listenPromptPower = !state.heardTarget && !state.selectedCat && !state.solved ? 1 : 0;
      listenPromptLabel.scale.set(184 * (1 + Math.sin(now / 360) * 0.06), 82 * (1 + Math.sin(now / 360) * 0.06), 1);
      listenPromptLabel.material.opacity = THREE.MathUtils.lerp(listenPromptLabel.material.opacity || 0, listenPromptPower ? 0.92 : 0, 0.18);
      targetHeardLabel.scale.set(150 * (1 + Math.sin(now / 420) * 0.04), 70 * (1 + Math.sin(now / 420) * 0.04), 1);
      targetHeardLabel.material.opacity = THREE.MathUtils.lerp(targetHeardLabel.material.opacity || 0, state.heardTarget && !state.solved ? 0.92 : 0, 0.18);
      const replayLeft = Math.max(0, (state.autoReplayUntil - now) / 1450);
      const replayPulse = replayLeft ? 1 + Math.sin(now / 110) * 0.08 : 1;
      autoReplayLabel.scale.set(168 * replayPulse, 78 * replayPulse, 1);
      autoReplayLabel.material.opacity = THREE.MathUtils.lerp(autoReplayLabel.material.opacity || 0, replayLeft ? 0.96 : 0, 0.18);
      const clearLeft = Math.max(0, (state.stageClearUntil - now) / 1600);
      const clearPop = clearLeft ? Math.sin((1 - clearLeft) * Math.PI) : 0;
      stageClearLabel.position.set(globeGroup.position.x, globeGroup.position.y + 315 + clearPop * 18, globeGroup.position.z + 480);
      stageClearLabel.scale.set(300 * (0.88 + clearPop * 0.18), 130 * (0.88 + clearPop * 0.18), 1);
      stageClearLabel.material.opacity = THREE.MathUtils.lerp(stageClearLabel.material.opacity || 0, clearLeft ? 0.96 : 0, 0.16);
      const stageAccent = STAGES[state.stage].accent || 0xffd86f;
      bowlPulse.material.color.setHex(state.heardTarget ? stageAccent : 0xffffff);
      bowlHalo.material.color.setHex(state.heardTarget ? 0xfff2a6 : 0xfff2a6);
      bowlPulse.material.opacity = (dragNearBowl ? 0.42 : state.heardTarget ? 0.34 : 0.24) + Math.sin(now / 360) * 0.08 + victoryLeft * 0.22;
      bowlHalo.material.opacity = (dragNearBowl ? 0.36 : state.heardTarget ? 0.2 : 0.11) + Math.sin(now / 520) * 0.05 + victoryLeft * 0.2;
      const bowlCharmPower = Math.max(
        dragNearBowl ? 1 : 0,
        state.heardTarget && !state.solved ? 0.72 : 0,
        Math.max(0, 1 - (now - state.lastBowlChimeAt) / 900),
        celebratePop * 1.1,
        victoryLeft * 0.96
      );
      bowlCharms.forEach((charm, index) => {
        const angle = now / 520 + index * Math.PI * 0.4;
        const orbit = 112 + Math.sin(now / 430 + charm.userData.seed) * 14;
        charm.position.copy(bowlBase).add(new THREE.Vector3(
          Math.cos(angle) * orbit,
          100 + Math.sin(now / 250 + charm.userData.seed) * 16 + bowlFloat,
          Math.sin(angle) * 28
        ));
        const charmScale = (0.7 + bowlCharmPower * 0.55) * (1 + Math.sin(now / 180 + index) * 0.08);
        charm.scale.set(24 * charmScale, 24 * charmScale, 1);
        charm.material.opacity = THREE.MathUtils.lerp(charm.material.opacity || 0, bowlCharmPower ? 0.3 + bowlCharmPower * 0.58 : 0, 0.16);
      });
      playfieldHalo.position.set(
        globeGroup.position.x - 10,
        globeGroup.position.y - 10 + Math.sin(now / 1200) * 4,
        globeGroup.position.z + 32
      );
      playfieldHalo.quaternion.copy(camera.quaternion);
      const haloBoost = Math.max(listenPulse * 0.9, celebratePop * 0.7, victoryLeft * 0.5);
      playfieldHalo.userData.parts?.rings?.forEach((ring, index) => {
        const wave = 0.5 + Math.sin(now / (720 + index * 120) + ring.userData.seed) * 0.5;
        const scan = listenPulse ? Math.sin((1 - listenLeft + index * 0.11) * Math.PI) : 0;
        const baseScale = 1 + wave * 0.015 + haloBoost * (0.045 + index * 0.02) + Math.max(0, scan) * 0.1;
        ring.scale.set(1.18 * baseScale, 0.58 * baseScale, 1);
        ring.rotation.z += dt * (0.045 + index * 0.018) * (index % 2 ? -1 : 1);
        ring.material.opacity = THREE.MathUtils.lerp(
          ring.material.opacity || 0,
          0.08 + wave * 0.035 + haloBoost * (0.16 - index * 0.025),
          0.12
        );
      });
      playfieldHalo.userData.parts?.motes?.forEach((mote, index) => {
        const orbit = 330 + (index % 4) * 20 + Math.sin(now / 620 + mote.userData.seed) * 10;
        const angle = mote.userData.angle + now / (8400 + index * 170);
        mote.position.set(Math.cos(angle) * orbit, Math.sin(angle) * 164, 0);
        const moteScale = 1 + Math.sin(now / 260 + mote.userData.seed) * 0.18 + haloBoost * 0.45;
        mote.scale.setScalar(moteScale);
        mote.material.opacity = 0.18 + Math.sin(now / 420 + mote.userData.seed) * 0.08 + haloBoost * 0.38;
      });
      stageGlow.position.set(
        globeGroup.position.x - 4,
        globeGroup.position.y - 260 + Math.sin(now / 1400) * 3,
        globeGroup.position.z + 210
      );
      stageGlow.quaternion.copy(camera.quaternion);
      const stageGlowBoost = Math.max(haloBoost, state.heardTarget && !state.solved ? 0.34 : 0);
      stageGlow.userData.parts?.rings?.forEach((ring, index) => {
        const wave = 0.5 + Math.sin(now / (820 + index * 110) + ring.userData.seed) * 0.5;
        const base = 1 + wave * 0.02 + stageGlowBoost * (0.05 + index * 0.018);
        ring.rotation.z += dt * (0.028 + index * 0.012) * (index % 2 ? -1 : 1);
        ring.scale.set(1.22 * base, 0.36 * base, 1);
        ring.material.opacity = 0.1 + wave * 0.04 + stageGlowBoost * (0.13 - index * 0.024);
      });
      stageGlow.userData.parts?.dots?.forEach((dot, index) => {
        const orbit = 382 + (index % 4) * 32 + Math.sin(now / 660 + dot.userData.seed) * 10;
        const angle = dot.userData.angle + now / (7800 + index * 160);
        dot.position.set(Math.cos(angle) * orbit, Math.sin(angle) * 118, 8);
        dot.scale.setScalar(0.82 + Math.sin(now / 260 + dot.userData.seed) * 0.16 + stageGlowBoost * 0.32);
        dot.material.opacity = 0.18 + Math.sin(now / 420 + dot.userData.seed) * 0.08 + stageGlowBoost * 0.32;
      });
      if (victoryLeft && now - (state.lastVictorySparkAt || 0) > 260) {
        state.lastVictorySparkAt = now;
        emitVictoryDrift(bowlBase, STAGES[state.stage].accent || 0xffd86f);
      }
      atmosphere.material.opacity = 0.18 + Math.sin(now / 1100) * 0.035;
      island.children.forEach((child) => {
        if (child.userData.isMusicRing) {
          child.rotation.z += child.userData.spin * dt * 1000;
        }
        if (child.userData.isOrbitNote) {
          child.position.y = child.userData.baseY + Math.sin(now / 520 + child.userData.floatSeed) * 7;
          child.material.opacity = 0.58 + Math.sin(now / 700 + child.userData.floatSeed) * 0.14;
        }
      });
      island.traverse((child) => {
        if (child.userData.isLanternGlow) {
          const glow = 1 + Math.sin(now / 360 + child.id) * 0.16;
          child.scale.set(1 * glow, 1.18 * glow, 1 * glow);
          child.material.opacity = 0.74 + Math.sin(now / 480 + child.id) * 0.14;
        }
        if (child.userData.isMelodyStation) {
          const stationPulse = 1 + Math.sin(now / 520 + child.userData.seed) * 0.045 + listenPulse * 0.08;
          child.scale.setScalar(stationPulse);
        }
        if (child.userData.isStationHalo) {
          const haloPulse = 1 + Math.sin(now / 420 + child.id) * 0.16 + listenPulse * 0.2;
          child.scale.set(haloPulse, haloPulse, haloPulse);
          child.material.opacity = 0.14 + Math.sin(now / 550 + child.id) * 0.055 + listenPulse * 0.18;
        }
        if (child.userData.isWaterfall) {
          const flow = 1 + Math.sin(now / 180 + child.userData.seed) * 0.08;
          child.scale.x = 0.62 * flow;
          child.scale.z = 0.34 * (1.08 - (flow - 1));
          child.material.opacity = 0.62 + Math.sin(now / 260 + child.userData.seed) * 0.1;
        }
        if (child.userData.isWaterFoam) {
          const foam = 1 + Math.sin(now / 210 + child.userData.seed) * 0.18;
          const base = child.userData.baseScale || new THREE.Vector3(1, 1, 1);
          child.scale.set(base.x * foam, base.y * (1 + (foam - 1) * 0.35), base.z * (1 + (foam - 1) * 0.2));
          child.material.opacity = 0.58 + Math.sin(now / 300 + child.userData.seed) * 0.16;
        }
        if (child.userData.isFloatingPebble) {
          const bob = Math.sin(now / 520 + child.userData.seed) * 3.4;
          const base = child.userData.basePosition || child.position;
          const normal = base.clone().normalize();
          child.position.copy(base).addScaledVector(normal, bob);
          child.rotation.y += dt * (0.18 + (child.userData.seed % 0.3));
        }
        if (child.userData.isPlanetMist) {
          child.rotation.z += Math.sin(now / 1800 + child.userData.seed) * 0.0005;
          child.scale.setScalar(1 + Math.sin(now / 780 + child.userData.seed) * 0.05);
          child.traverse((puff) => {
            if (puff.material) puff.material.opacity = 0.18 + Math.sin(now / 700 + child.userData.seed + puff.id) * 0.06;
          });
        }
        if (child.userData.isWonderBridge) {
          child.scale.setScalar(0.62 * (1 + Math.sin(now / 900 + child.userData.seed) * 0.025));
        }
        if (child.userData.isWonderArch) {
          child.scale.setScalar(0.72 * (1 + Math.sin(now / 780 + child.userData.seed) * 0.03 + listenPulse * 0.05));
          if (child.userData.note?.material) {
            child.userData.note.material.opacity = 0.72 + Math.sin(now / 420 + child.userData.seed) * 0.14 + listenPulse * 0.12;
          }
        }
        if (child.userData.isWonderPinwheel) {
          child.rotation.y += dt * (0.7 + listenPulse * 1.4);
          child.scale.setScalar(0.66 * (1 + Math.sin(now / 620 + child.userData.seed) * 0.035));
        }
        if (child.userData.isWonderFirefly) {
          const base = child.userData.basePosition || child.position;
          const normal = base.clone().normalize();
          const bob = Math.sin(now / 520 + child.userData.seed) * 7 + listenPulse * 9;
          child.position.copy(base).addScaledVector(normal, bob);
          child.material.opacity = 0.26 + Math.sin(now / 360 + child.userData.seed) * 0.18 + listenPulse * 0.24 + victoryLeft * 0.2;
          child.scale.setScalar(1 + Math.sin(now / 300 + child.userData.seed) * 0.22 + listenPulse * 0.35);
        }
        if (child.userData.frontDecor) {
          const base = child.userData.baseScale || new THREE.Vector3(1, 1, 1);
          const pulse = 1 + Math.sin(now / 780 + child.userData.seed) * 0.025 + listenPulse * 0.045;
          child.scale.set(base.x * pulse, base.y * pulse, base.z * pulse);
          child.rotation.y += dt * Math.sin(now / 980 + child.userData.seed) * 0.04;
        }
      });
      progressPathGroup.children.forEach((marker) => {
        const baseScale = marker.userData.baseScale || 1;
        const beadPulse = marker.userData.isProgressBead ? 0.04 : 0.12;
        const pulse = marker.userData.current ? 1 + Math.sin(now / 220) * beadPulse : 1;
        marker.scale.setScalar(baseScale * pulse);
        marker.children?.forEach((child) => {
          if (!child.userData.isProgressGlow) return;
          const glowPulse = 1 + Math.sin(now / 260) * 0.16;
          child.scale.set(glowPulse, glowPulse, glowPulse);
          child.material.opacity = 0.2 + Math.sin(now / 320) * 0.08;
        });
      });
      globeGroup.scale.setScalar(1 + celebratePop * 0.018);
      globeFloatShadow.position.set(globeGroup.position.x, globeGroup.position.y - 272, globeGroup.position.z + 240);
      globeFloatShadow.scale.set(1.95 + Math.sin(now / 1200) * 0.04, 0.36 + Math.cos(now / 1400) * 0.018, 1);
      globeFloatShadow.material.opacity = 0.12 + Math.sin(now / 1500) * 0.025;
      skyGroup.children.forEach((cloud) => {
        if (cloud.userData.isSkyRing) {
          cloud.rotation.z += dt * 0.008;
          cloud.material.opacity = 0.12 + Math.sin(now / 1800 + cloud.userData.seed) * 0.035;
          return;
        }
        if (cloud.userData.isSkyNote) {
          cloud.position.y += Math.sin(now / 1300 + cloud.userData.seed) * 0.06;
          cloud.rotation.z = Math.sin(now / 900 + cloud.userData.seed) * 0.08;
          cloud.material.opacity = 0.28 + Math.sin(now / 1000 + cloud.userData.seed) * 0.1;
          return;
        }
        const drift = cloud.userData.isRibbonCloud ? 0.08 : cloud.userData.isForegroundCloud ? 0.11 : 0.05;
        cloud.position.x += Math.sin(now / 1900 + cloud.userData.seed) * drift;
        cloud.position.y += Math.cos(now / 2400 + cloud.userData.seed) * (cloud.userData.isRibbonCloud ? 0.028 : cloud.userData.isForegroundCloud ? 0.06 : 0.04);
        if (cloud.userData.isRibbonCloud) {
          cloud.rotation.z += Math.sin(now / 3200 + cloud.userData.seed) * 0.00008;
        }
      });
      ambientMusicLayer.children.forEach((item) => {
        const seed = item.userData.seed || 0;
        const base = item.userData.base;
        const ambientBoost = Math.max(listenPulse * 0.72, victoryLeft * 0.55, celebratePop * 0.4);
        if (item.userData.isPlanetTraveler) {
          item.userData.angle += dt * (0.42 + item.userData.speed * 1000 + ambientBoost * 0.5);
          const angle = item.userData.angle;
          const radius = item.userData.radius + Math.sin(now / 900 + seed) * 12 + ambientBoost * 18;
          item.position.set(
            globeGroup.position.x + Math.cos(angle) * radius,
            globeGroup.position.y + item.userData.height + Math.sin(angle * 1.7 + seed) * 46 + ambientBoost * 22,
            globeGroup.position.z + 318 + Math.sin(angle) * 72
          );
          item.rotation.z = Math.sin(now / 580 + seed) * 0.18 + angle * 0.06;
          item.material.opacity = THREE.MathUtils.clamp((item.userData.baseOpacity || 0.42) + ambientBoost * 0.38 + Math.sin(now / 460 + seed) * 0.08, 0.18, 0.98);
          const travelerScale = 1 + Math.sin(now / 420 + seed) * 0.08 + ambientBoost * 0.28;
          const wide = item.scale.x > item.scale.y;
          item.scale.set((wide ? 30 : 24) * travelerScale, 22 * travelerScale, 1);
          return;
        }
        if (base) {
          item.position.x = base.x + Math.sin(now / 1900 + seed) * (item.userData.isAmbientNote ? 18 : 9);
          item.position.y = base.y + Math.cos(now / 1400 + seed) * (item.userData.isAmbientNote ? 15 : 8) + ambientBoost * 18;
        }
        item.rotation.z = Math.sin(now / 1200 + seed) * (item.userData.isAmbientNote ? 0.14 : 0.04);
        if (item.material) {
          item.material.opacity = THREE.MathUtils.clamp((item.userData.baseOpacity || 0.3) + ambientBoost * 0.38 + Math.sin(now / 900 + seed) * 0.06, 0, 0.96);
        }
        const scalePulse = 1 + Math.sin(now / 820 + seed) * 0.05 + ambientBoost * 0.16;
        if (item.userData.isAmbientNote) {
          const wide = item.scale.x > item.scale.y;
          item.scale.set((wide ? 34 : 24) * scalePulse, 24 * scalePulse, 1);
        } else {
          item.scale.setScalar(scalePulse);
        }
      });
      updateConfetti(dt);
      updateNotes(dt);
      updateSoundWaves(dt);
      updateSoundTrails(dt);
      updateShockwaves(dt);
      updateLearnCards(dt);
      updateKnowledgeBadges(dt);
      updateMasteryTokens(now);
      updateDragSparkles(dt);
      updateWalkPuffs(dt);
      updateSoundBridge(now);
      updateSearchMotes(now);
      updateFeedGuide(now);
      updateFeedMagnet(now);
      updatePickupAura(now);
      updateCatHints(now);
      const shakeLeft = Math.max(0, (state.boardShakeUntil - now) / 240);
      board.style.transform = shakeLeft ? `translateX(${Math.sin(now / 18) * 5 * shakeLeft}px)` : "";
      syncDebugState();
      renderer.render(scene, camera);
      } catch (error) {
        sceneEl.dataset.animError = error?.message || String(error);
      }
      state.animationFrame = requestAnimationFrame(animate);
    }

    listenBtn.addEventListener("click", () => {
      if (state.missionOpen) {
        state.missionOpen = false;
        mission.classList.add("hidden");
        pageEl.classList.remove("mission-open");
      }
      playFoodCue(state.target);
      markTargetHeard();
      bowl.userData.bumpUntil = performance.now() + 420;
      emitNoteBurst(8);
      emitSoundWave(bowl.getWorldPosition(new THREE.Vector3()), state.target, { hidden: true, compact: true });
      emitSoundTrailToGlobe(state.target);
      renderFeedback("猫粮已响", "去点猫，对上就抓去投喂。");
      updateCoach();
    });

    startMission.addEventListener("click", beginMission);

    nextBtn.addEventListener("click", () => {
      const stage = STAGES[state.stage];
      if (!state.solved) return;
      const completedGroup = state.round >= stage.rounds;
      const completedStage = state.stage;
      state.round += 1;
      if (completedGroup) {
        state.round = 1;
        state.combo = 0;
      }
      resetRound();
      if (completedGroup) {
        renderFeedback("训练完成", "你已经收集了一组音卡。可以继续刷一组，或切换更难的阶段。");
        showToast("这一组完成", "good");
        showRoundBanner("训练完成 + 音感", "complete");
        state.stageClearUntil = performance.now() + 1600;
        state.celebrateUntil = performance.now() + 1300;
        state.victoryUntil = performance.now() + 3600;
        celebrate(6);
        emitStageClearBurst();
        showGroupRewardCard(completedStage);
        renderCoach("结算啦", "收起卡片后可继续。", "good");
      } else {
        showRoundBanner(`第 ${state.round} 只`);
      }
    });

    rewardCard.addEventListener("click", () => {
      if (state.groupRewardOpen) {
        hideRewardCard();
        return;
      }
      if (!state.solved || nextBtn.disabled) return;
      nextBtn.click();
    });

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => setStage(button.dataset.stage));
    });

    sceneEl.addEventListener("pointerdown", handlePointerDown);
    sceneEl.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    sceneEl.addEventListener("click", handleSceneClick);
    window.addEventListener("resize", resize);

    resize();
    resetRound();
    const feedbackControls = createFeedbackControls({ beginMission, setStage, resetRound });
    const interactionControls = createInteractionControls({ checkFeed, handlePointerDown, handlePointerMove, handlePointerUp, handleSceneClick });
    const controls = { ...feedbackControls, ...interactionControls };
    attachDebug({ state, scene, camera, renderer, world, globeGroup, bowl, assets, controls });
    state.animationFrame = requestAnimationFrame(animate);

    const destroy = () => {
      if (typeof state.animationFrame === "number") cancelAnimationFrame(state.animationFrame);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", resize);
      sceneEl.removeEventListener("pointerdown", handlePointerDown);
      sceneEl.removeEventListener("pointermove", handlePointerMove);
      sceneEl.removeEventListener("click", handleSceneClick);
      renderer.dispose();
      if (renderer.domElement.parentNode === sceneEl) sceneEl.removeChild(renderer.domElement);
    };

    return { renderer, scene, camera, world, globeGroup, bowl, state, assets, controls, destroy };
}
