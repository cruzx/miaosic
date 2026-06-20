const STYLE_ID = "miaosic-music-island-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      overflow: hidden;
      background: #dff8ff;
      font-family: Inter, ui-rounded, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    }
    #app, .phone, .page { min-height: 100vh; }
    .phone {
      width: min(100vw, 460px);
      min-height: 100vh;
      margin: 0 auto;
      background: #eafcff;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(36, 97, 126, .16);
    }
    .page {
      position: relative;
      overflow: hidden;
      border-radius: 0;
      background:
        radial-gradient(circle at 22% 18%, rgba(255,255,255,.95), transparent 26%),
        radial-gradient(circle at 82% 8%, rgba(183,140,255,.32), transparent 30%),
        linear-gradient(180deg, #dff8ff 0%, #f8fff0 58%, #ffeec6 100%);
    }
    #scene { display: none; }
    .music-island {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-rows: auto 1fr auto;
      color: #17334a;
      isolation: isolate;
    }
    .music-island__sky {
      position: absolute;
      inset: 0;
      z-index: -2;
      background:
        radial-gradient(circle at 18% 20%, rgba(73,184,255,.26), transparent 16%),
        radial-gradient(circle at 80% 22%, rgba(255,212,71,.26), transparent 18%);
      animation: miaoFloatSky 8s ease-in-out infinite alternate;
    }
    .music-island__water {
      position: absolute;
      left: -18%;
      right: -18%;
      bottom: -7%;
      height: 38%;
      border-radius: 50% 50% 0 0;
      background: linear-gradient(180deg, rgba(73,184,255,.26), rgba(73,184,255,.58));
      z-index: -1;
      filter: blur(.2px);
    }
    .music-island__topbar {
      padding: calc(env(safe-area-inset-top, 0px) + 18px) 18px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .music-island__brand small,
    .music-island__score small,
    .find-sound__panel small {
      display: block;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .08em;
      color: rgba(23,51,74,.55);
      text-transform: uppercase;
    }
    .music-island__brand h1 {
      margin: 5px 0 0;
      font-size: 28px;
      line-height: .95;
      letter-spacing: -.05em;
    }
    .music-island__score {
      min-width: 116px;
      padding: 10px 12px;
      border: 3px solid #17334a;
      border-radius: 18px;
      background: rgba(255,255,255,.74);
      box-shadow: 0 6px 0 rgba(23,51,74,.16);
      text-align: right;
      backdrop-filter: blur(14px);
    }
    .music-island__score strong { font-size: 24px; line-height: 1; }
    .music-island__map {
      position: relative;
      display: grid;
      place-items: center;
      padding: 24px 18px 8px;
    }
    .music-island__land {
      width: min(88vw, 390px);
      aspect-ratio: 1.05;
      position: relative;
      border-radius: 48% 52% 44% 56%;
      background:
        radial-gradient(circle at 50% 46%, rgba(255,255,255,.92), transparent 20%),
        linear-gradient(145deg, #bff0a4, #7ed957 58%, #56b955);
      border: 5px solid #17334a;
      box-shadow: 0 14px 0 rgba(23,51,74,.18), 0 28px 54px rgba(47,117,92,.2);
      transform: rotate(-3deg);
    }
    .music-island__land::before {
      content: "";
      position: absolute;
      inset: 13%;
      border-radius: inherit;
      border: 3px dashed rgba(23,51,74,.18);
    }
    .music-island__center {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 120px;
      height: 120px;
      transform: translate(-50%, -50%) rotate(3deg);
      border-radius: 35px;
      border: 4px solid #17334a;
      background:
        radial-gradient(circle at 28% 24%, rgba(255,255,255,.96), transparent 32%),
        linear-gradient(180deg, #ffffff, #dff8ff);
      display: grid;
      place-items: center;
      box-shadow: 0 9px 0 rgba(23,51,74,.18);
      font-size: 46px;
    }
    .sound-node {
      position: absolute;
      width: 86px;
      min-height: 86px;
      border: 4px solid #17334a;
      border-radius: 28px;
      background: rgba(255,255,255,.88);
      box-shadow: 0 8px 0 rgba(23,51,74,.16);
      display: grid;
      place-items: center;
      gap: 2px;
      padding: 8px;
      transform: translate(-50%, -50%) rotate(3deg);
      color: #17334a;
    }
    .sound-node b { font-size: 30px; line-height: 1; }
    .sound-node span { font-size: 11px; font-weight: 950; text-align: center; }
    .sound-node.is-active {
      outline: 5px solid var(--sound-color);
      animation: miaoPulse 900ms ease-in-out infinite alternate;
    }
    .sound-node:nth-child(2) { left: 28%; top: 28%; }
    .sound-node:nth-child(3) { left: 73%; top: 32%; }
    .sound-node:nth-child(4) { left: 26%; top: 72%; }
    .sound-node:nth-child(5) { left: 74%; top: 70%; }
    .music-island__dock {
      padding: 0 18px calc(env(safe-area-inset-bottom, 0px) + 18px);
    }
    .music-island__card {
      border: 4px solid #17334a;
      border-radius: 26px;
      background: rgba(255,255,255,.82);
      box-shadow: 0 9px 0 rgba(23,51,74,.18);
      backdrop-filter: blur(18px);
      padding: 14px;
    }
    .music-island__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    .music-island__stat {
      border-radius: 16px;
      background: rgba(73,184,255,.12);
      padding: 9px 10px;
      font-size: 12px;
      font-weight: 900;
    }
    .music-island__stat strong { display: block; font-size: 18px; }
    @keyframes miaoPulse { from { transform: translate(-50%, -50%) rotate(3deg) scale(1); } to { transform: translate(-50%, -50%) rotate(3deg) scale(1.06); } }
    @keyframes miaoFloatSky { from { transform: translateY(-8px); } to { transform: translateY(8px); } }
  `;
  document.head.appendChild(style);
}

function nodeTemplate(sound, isActive) {
  return `
    <div class="sound-node ${isActive ? "is-active" : ""}" style="--sound-color:${sound.color}">
      <b>${sound.emoji}</b>
      <span>${sound.role}</span>
    </div>
  `;
}

export function mountMusicIsland(runtime) {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  page.innerHTML = "";
  const root = document.createElement("main");
  root.className = "music-island";
  page.appendChild(root);

  const render = () => {
    const { state } = runtime;
    const target = runtime.getSound(state.round.targetId);
    root.innerHTML = `
      <div class="music-island__sky"></div>
      <div class="music-island__water"></div>
      <header class="music-island__topbar">
        <div class="music-island__brand">
          <small>Sound Island Prototype</small>
          <h1>${state.islandName}</h1>
        </div>
        <div class="music-island__score">
          <small>Score</small>
          <strong>${state.score}</strong>
        </div>
      </header>
      <section class="music-island__map" aria-label="音乐岛地图">
        <div class="music-island__land">
          <div class="music-island__center">🎧</div>
          ${state.sounds.map((sound) => nodeTemplate(sound, sound.id === target.id)).join("")}
        </div>
      </section>
      <footer class="music-island__dock">
        <div class="music-island__card">
          <strong>当前任务：找到「${target.name}」</strong>
          <div class="music-island__stats">
            <div class="music-island__stat">能量<strong>${state.energy}%</strong></div>
            <div class="music-island__stat">连击<strong>${state.combo}</strong></div>
            <div class="music-island__stat">已发现<strong>${state.discovered.length}/${state.sounds.length}</strong></div>
          </div>
        </div>
      </footer>
    `;
  };

  const unsubscribe = runtime.subscribe(render);
  render();

  return () => {
    unsubscribe();
    root.remove();
  };
}
