function icon(name, className = "") {
  const paths = {
    map: '<path d="M4 5.5 9 3l6 2.5L20 3v15.5L15 21l-6-2.5L4 21V5.5Z"/><path d="M9 3v15.5M15 5.5V21"/>',
    album: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 7h6M9 11h6M9 15h4"/><path d="M5 7H3M5 12H3M5 17H3"/>',
    speaker: '<path d="M5 10h4l5-4v12l-5-4H5v-4Z"/><path d="M17 9c1.4 1.5 1.4 4.5 0 6M19.5 6.5c3 3 3 8 0 11"/>',
    bowl: '<path d="M4 10h16l-2.2 7.2A3 3 0 0 1 15 19H9a3 3 0 0 1-2.8-1.8L4 10Z"/><path d="M3 10c0-2 4-3 9-3s9 1 9 3-4 3-9 3-9-1-9-3Z"/>',
    cat: '<path d="m6 8-1-5 4 2a8 8 0 0 1 6 0l4-2-1 5a7 7 0 1 1-12 0Z"/><path d="M9 12h.01M15 12h.01M10 15c1.2 1 2.8 1 4 0M12 13v2"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    spark: '<path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/>'
  };
  return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.spark}</svg>`;
}

function colorHex(value) {
  if (typeof value === "string") return value;
  return `#${Number(value || 0).toString(16).padStart(6, "0")}`;
}

function catPortrait(cat, locked = false) {
  const body = locked ? "#eef3f5" : colorHex(cat?.body);
  const accent = locked ? "#bcc6ca" : colorHex(cat?.accent);
  const line = locked ? "#aab5ba" : colorHex(cat?.dark || 0x294353);
  return `
    <svg class="cat-portrait${locked ? " is-locked" : ""}" viewBox="0 0 120 112" role="img" aria-label="${locked ? "尚未遇见的猫" : cat?.name || "猫"}">
      <path d="M29 38 23 10l25 14c8-4 16-4 24 0l25-14-6 28" fill="${accent}" stroke="${line}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M28 39c4-15 17-24 32-24s28 9 32 24c9 28-4 58-32 58S19 67 28 39Z" fill="${body}" stroke="${line}" stroke-width="6"/>
      <path d="m32 25-3-10 11 7M88 25l3-10-11 7" fill="none" stroke="${line}" stroke-width="4" stroke-linecap="round"/>
      <path d="M42 53h.1M78 53h.1" stroke="${line}" stroke-width="7" stroke-linecap="round"/>
      <path d="m55 63 5 4 5-4M60 67v8M49 75c7 7 15 7 22 0" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 66 18 61M40 73 16 75M80 66l22-5M80 73l24 2" fill="none" stroke="${line}" stroke-width="3.5" stroke-linecap="round"/>
      ${locked ? '<path d="M44 44h32M44 54h32M44 64h32" stroke="#c8d0d3" stroke-width="4" opacity=".7"/>' : ""}
    </svg>
  `;
}

function progressTotal(state) {
  return Object.values(state?.progress?.mastery || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function createAppShell(app) {
  if (!app) throw new Error("找不到 #app 容器。");

  app.innerHTML = `
    <main class="game-shell" data-game-shell>
      <section class="scene-wrap" aria-label="3D 音乐岛游戏区">
        <div class="scene-sky" aria-hidden="true"></div>
        <div class="scene-host" data-scene></div>
        <div class="cat-label-layer" data-cat-labels aria-hidden="true"></div>
      </section>
      <header class="hud-top">
        <div class="brand-card"><span class="brand-kicker">MIAOSIC</span><strong data-region-name>音乐岛</strong><span data-stage-name>初声草坡</span></div>
        <div class="round-progress" data-round-progress aria-label="回合进度"></div>
        <div class="hud-actions">
          <button class="icon-button" type="button" data-open="map" aria-label="打开区域地图">${icon("map")}</button>
          <button class="icon-button" type="button" data-open="album" aria-label="打开猫咪音册">${icon("album")}</button>
        </div>
        <div class="score-card"><span>得分</span><strong data-score>0</strong><small>连击 <b data-combo>0</b></small></div>
      </header>
      <div class="scene-tip" data-scene-tip hidden></div>
      <footer class="mission-dock" data-mission-dock>
        <div class="mission-copy">
          <span class="mission-kicker" data-mission-kicker>准备登岛</span>
          <strong data-mission-title>听一声，找到那只猫</strong>
          <p data-mission-copy>听猫粮的声音，再去岛上寻找叫声一样的猫。</p>
          <div class="mission-meta"><span data-sampled>已试听 0 / 3</span><span data-errors>本轮失误 0</span></div>
        </div>
        <button class="primary-action" type="button" data-action="listen">${icon("speaker")}<span data-listen-label>听猫粮</span></button>
      </footer>
      <div class="modal-layer" data-modal-layer hidden>
        <button class="modal-scrim" type="button" data-close-panel aria-label="关闭弹窗"></button>
        <section class="modal-card" data-modal-card role="dialog" aria-modal="true"></section>
      </div>
    </main>
  `;

  const refs = {
    shell: app.querySelector("[data-game-shell]"), scene: app.querySelector("[data-scene]"), labels: app.querySelector("[data-cat-labels]"),
    regionName: app.querySelector("[data-region-name]"), stageName: app.querySelector("[data-stage-name]"), progress: app.querySelector("[data-round-progress]"),
    score: app.querySelector("[data-score]"), combo: app.querySelector("[data-combo]"), missionKicker: app.querySelector("[data-mission-kicker]"),
    missionTitle: app.querySelector("[data-mission-title]"), missionCopy: app.querySelector("[data-mission-copy]"), sampled: app.querySelector("[data-sampled]"),
    errors: app.querySelector("[data-errors]"), listen: app.querySelector('[data-action="listen"]'), listenLabel: app.querySelector("[data-listen-label]"),
    tip: app.querySelector("[data-scene-tip]"), modalLayer: app.querySelector("[data-modal-layer]"), modalCard: app.querySelector("[data-modal-card]")
  };

  let latestState = null;
  let actions = {};
  let panel = "intro";
  let tipTimer = 0;
  const labelNodes = new Map();

  const closePanel = () => {
    if (panel === "map" || panel === "album") { panel = null; renderModal(); }
  };

  const introMarkup = () => `
    <div class="intro-card-content">
      <span class="modal-chip">找声音玩法</span>
      <h1>听一声，找到那只猫</h1>
      <p class="modal-lead">猫粮会发出目标声音。转动音乐岛，点猫试听，再把同声猫拖进碗里。</p>
      <div class="how-grid">
        <div class="how-step"><span>${icon("speaker")}</span><strong>听猫粮</strong><small>记住目标声音</small></div>
        <div class="how-step"><span>${icon("cat")}</span><strong>试听猫</strong><small>比较谁最接近</small></div>
        <div class="how-step"><span>${icon("bowl")}</span><strong>拖去投喂</strong><small>同声就成功</small></div>
      </div>
      <button class="modal-primary" type="button" data-modal-action="start">开始找声音 ${icon("arrow")}</button>
    </div>`;

  const rewardMarkup = (state) => {
    const reward = state.reward || {};
    const cat = reward.cat || state.targetCat;
    const token = reward.token || state.targetToken;
    return `<div class="reward-content">
      <span class="modal-chip">找到同声猫</span><div class="reward-portrait">${catPortrait(cat)}</div>
      <h2>${cat?.name || "新朋友"}加入音册</h2><span class="sound-badge">${token?.solfege || "声音"} · ${token?.label || ""}</span>
      <p>${token?.memory || "你把声音和角色连在了一起。"}</p><strong class="reward-score">本轮 +${reward.points || 100}</strong>
      <button class="modal-primary" type="button" data-modal-action="next">继续找下一只 ${icon("arrow")}</button>
    </div>`;
  };

  const mapMarkup = (state) => {
    const total = progressTotal(state);
    return `<div class="panel-head"><div><span class="panel-kicker">MUSIC ISLAND</span><h2>区域地图</h2></div><button class="panel-close" type="button" data-close-panel aria-label="关闭">${icon("close")}</button></div>
      <div class="panel-scroll stage-list">
        ${state.stages.map((stage, index) => {
          const unlocked = state.unlockedStageIds.includes(stage.id);
          const current = state.stage.id === stage.id;
          const mastery = state.progress.mastery[stage.id] || 0;
          return `<button class="stage-card${current ? " is-current" : ""}${unlocked ? "" : " is-locked"}" type="button" data-stage="${stage.id}" ${unlocked ? "" : "disabled"}>
            <span class="stage-index">${String(index + 1).padStart(2, "0")}</span><span class="stage-card-copy"><strong>${stage.name}</strong><small>${stage.shortName}</small><p>${stage.description}</p><b>${unlocked ? `${mastery}/${stage.rounds}` : `${icon("lock")} 累计完成 ${stage.unlockAt} 次后开放`}</b></span>
          </button>`;
        }).join("")}
        <p class="panel-footnote">当前累计完成 ${total} 次同声投喂。</p>
      </div>`;
  };

  const albumMarkup = (state) => {
    const collected = new Set(state.progress.collected || []);
    return `<div class="panel-head"><div><span class="panel-kicker">SOUND COLLECTION</span><h2>猫咪音册</h2></div><button class="panel-close" type="button" data-close-panel aria-label="关闭">${icon("close")}</button></div>
      <div class="panel-scroll"><div class="album-summary"><strong>${collected.size} / ${state.roster.length}</strong><span>每次成功投喂，都会把对应声音留进猫咪音册。</span></div>
      <div class="album-grid">${state.roster.map((cat) => {
        const unlocked = collected.has(cat.id);
        const token = state.tokens[cat.token];
        return `<article class="album-card${unlocked ? "" : " is-locked"}">${catPortrait(cat, !unlocked)}<strong>${unlocked ? cat.name : "尚未遇见"}</strong><span>${unlocked ? `${token.solfege} · ${token.label}` : "继续在音乐岛找声音"}</span><small>${unlocked ? token.memory : "完成对应声音后解锁"}</small></article>`;
      }).join("")}</div></div>`;
  };

  const renderModal = () => {
    if (!latestState) return;
    if (!latestState.started) panel = "intro";
    if (latestState.phase === "reward") panel = "reward";
    if (latestState.started && latestState.phase !== "reward" && (panel === "intro" || panel === "reward")) panel = null;
    if (!panel) { refs.modalLayer.hidden = true; refs.modalCard.innerHTML = ""; refs.shell.classList.remove("has-modal"); return; }
    refs.modalLayer.hidden = false;
    refs.shell.classList.add("has-modal");
    refs.modalCard.className = `modal-card modal-${panel}`;
    if (panel === "intro") refs.modalCard.innerHTML = introMarkup();
    if (panel === "reward") refs.modalCard.innerHTML = rewardMarkup(latestState);
    if (panel === "map") refs.modalCard.innerHTML = mapMarkup(latestState);
    if (panel === "album") refs.modalCard.innerHTML = albumMarkup(latestState);
  };

  const missionText = (state) => {
    if (!state.started) return ["准备登岛", "听一声，找到那只猫", "听猫粮的声音，再去岛上寻找叫声一样的猫。"];
    if (state.phase === "listen") return ["先听目标", "点一下猫粮，记住它的声音", "声音不会显示答案。先让耳朵记住，再开始找猫。"];
    if (state.phase === "search") {
      if (state.selectedCatId === state.targetCat.id) return ["已经锁定", "把这只猫拖进碗里", `你听到的是 ${state.targetCat.name}。按住它，拖到屏幕下方的猫粮碗。`];
      if (state.sampledIds.length) return ["正在比较", "继续试听，找到最像的猫", state.feedback || "拖动空地旋转音乐岛，点不同的猫比较声音。"];
      return ["开始寻找", "旋转音乐岛，点猫试听", "点猫只会试听，不会直接判错。听到匹配后，再把它拖进碗里。"];
    }
    if (state.phase === "drag") return ["投喂中", "把猫放进猫粮碗", "松手前对准碗口。同声会成功，不同声可以继续找。"];
    if (state.phase === "reward") return ["声音已收集", `${state.targetCat.name}加入猫咪音册`, state.targetToken.memory];
    return ["音乐岛", "继续找声音", "听清楚再行动。"];
  };

  const render = (state) => {
    latestState = state;
    refs.shell.dataset.phase = state.phase;
    refs.regionName.textContent = "音乐岛";
    refs.stageName.textContent = state.stage.name;
    refs.score.textContent = String(state.progress.score || 0);
    refs.combo.textContent = String(state.progress.combo || 0);
    refs.progress.innerHTML = Array.from({ length: state.stage.rounds }, (_, index) => {
      const complete = index < state.round - 1;
      const current = index === state.round - 1;
      return `<span class="round-dot${complete ? " is-complete" : ""}${current ? " is-current" : ""}">${complete ? icon("check") : ""}</span>`;
    }).join("");
    const [kicker, title, copy] = missionText(state);
    refs.missionKicker.textContent = kicker;
    refs.missionTitle.textContent = title;
    refs.missionCopy.textContent = copy;
    refs.sampled.textContent = `已试听 ${state.sampledIds.length} / ${state.activeCats.length}`;
    refs.errors.textContent = `本轮失误 ${state.roundErrors}`;
    refs.listenLabel.textContent = state.heardTarget ? "重听" : "听猫粮";
    refs.listen.disabled = state.phase === "reward" || state.phase === "drag";
    renderModal();
  };

  const setCatLabels = (labels = []) => {
    const liveIds = new Set();
    labels.forEach((label) => {
      liveIds.add(label.id);
      let node = labelNodes.get(label.id);
      if (!node) { node = document.createElement("div"); node.className = "cat-label"; node.innerHTML = `<strong></strong><small></small>`; refs.labels.appendChild(node); labelNodes.set(label.id, node); }
      node.style.transform = `translate3d(${Math.round(label.x)}px, ${Math.round(label.y)}px, 0) translate(-50%, -100%)`;
      node.style.opacity = label.visible ? "1" : "0";
      node.style.zIndex = String(Math.round(1000 - label.depth * 100));
      node.classList.toggle("is-sampled", Boolean(label.sampled));
      node.classList.toggle("is-selected", Boolean(label.selected));
      node.querySelector("strong").textContent = label.name;
      node.querySelector("small").textContent = label.selected ? "拖进碗里" : label.sampled ? "已试听" : "点猫试听";
    });
    labelNodes.forEach((node, id) => { if (!liveIds.has(id)) { node.remove(); labelNodes.delete(id); } });
  };

  const showTip = (message, tone = "info") => {
    window.clearTimeout(tipTimer);
    refs.tip.hidden = false;
    refs.tip.dataset.tone = tone;
    refs.tip.textContent = message;
    requestAnimationFrame(() => refs.tip.classList.add("show"));
    tipTimer = window.setTimeout(() => { refs.tip.classList.remove("show"); window.setTimeout(() => { refs.tip.hidden = true; }, 180); }, 1800);
  };

  const onClick = (event) => {
    const open = event.target.closest("[data-open]");
    if (open) { panel = open.dataset.open; renderModal(); return; }
    if (event.target.closest("[data-close-panel]")) { closePanel(); return; }
    const modalAction = event.target.closest("[data-modal-action]");
    if (modalAction?.dataset.modalAction === "start") actions.start?.();
    if (modalAction?.dataset.modalAction === "next") actions.next?.();
    const stageButton = event.target.closest("[data-stage]");
    if (stageButton && !stageButton.disabled) { actions.setStage?.(stageButton.dataset.stage); panel = null; renderModal(); }
    if (event.target.closest('[data-action="listen"]')) actions.listen?.();
  };

  refs.shell.addEventListener("click", onClick);
  return {
    scene: refs.scene, render, setCatLabels, showTip,
    bindActions(nextActions) { actions = { ...actions, ...nextActions }; },
    destroy() { window.clearTimeout(tipTimer); refs.shell.removeEventListener("click", onClick); app.innerHTML = ""; }
  };
}
