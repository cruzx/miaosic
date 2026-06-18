import { STAGES } from "../config/stages.js";

const SHELL_STYLE_ID = "meow-royale-shell-style";

function ensureShellStyle() {
  if (document.getElementById(SHELL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SHELL_STYLE_ID;
  style.textContent = `
    .page.royale-shell {
      background:
        radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.42), transparent 22%),
        radial-gradient(circle at 86% 12%, rgba(255, 214, 120, 0.28), transparent 20%),
        linear-gradient(180deg, #9ae6ff 0%, #6cc7ff 24%, #6cc0ef 50%, #7fe19e 100%);
    }

    .page.royale-shell::before {
      opacity: 0.96;
      background:
        radial-gradient(circle at 15% 12%, rgba(255,255,255,0.4), transparent 26%),
        radial-gradient(circle at 78% 14%, rgba(255,242,181,0.24), transparent 18%),
        linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 34%, rgba(18,48,63,0.12) 100%);
    }

    .phone.royale-phone {
      border-color: rgba(22, 35, 42, 0.88);
      box-shadow:
        0 34px 90px rgba(7, 15, 23, 0.42),
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 0 0 12px rgba(255,255,255,0.035);
    }

    .royale-topbar {
      position: absolute;
      left: 18px;
      right: 140px;
      top: 18px;
      z-index: 41;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }

    .royale-crest {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 10px 12px;
      border: 2px solid rgba(24, 35, 42, 0.18);
      border-radius: 22px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.75), rgba(232,247,255,0.52));
      box-shadow:
        0 10px 30px rgba(18, 47, 63, 0.14),
        inset 0 1px 0 rgba(255,255,255,0.78);
      backdrop-filter: blur(12px);
    }

    .royale-emblem {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background:
        radial-gradient(circle at 30% 28%, rgba(255,255,255,0.82), transparent 34%),
        linear-gradient(180deg, #ffe9a4, #ffcc58);
      border: 2px solid rgba(36, 33, 28, 0.24);
      box-shadow: inset 0 -4px 0 rgba(34, 32, 29, 0.08);
      font-size: 22px;
    }

    .royale-crest-copy {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .royale-kicker {
      color: rgba(34, 32, 29, 0.56);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .royale-title {
      color: #16232a;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.02;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .royale-subtitle {
      color: rgba(22, 35, 42, 0.72);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .royale-pips {
      display: flex;
      gap: 5px;
      margin-left: auto;
    }

    .royale-pip {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 2px solid rgba(23, 34, 41, 0.28);
      background: rgba(255,255,255,0.5);
      box-shadow: inset 0 -2px 0 rgba(20, 30, 36, 0.08);
    }

    .royale-pip.active {
      background: linear-gradient(180deg, #fff7c7, #ffcd56);
      transform: scale(1.08);
    }

    .royale-sidebar {
      position: absolute;
      right: 18px;
      top: 102px;
      width: 250px;
      z-index: 39;
      display: grid;
      gap: 10px;
      pointer-events: none;
    }

    .royale-card {
      pointer-events: auto;
      padding: 14px 14px 15px;
      border-radius: 24px;
      border: 2px solid rgba(21, 34, 41, 0.16);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.86), rgba(231,246,255,0.62));
      box-shadow:
        0 12px 30px rgba(17, 40, 53, 0.14),
        inset 0 1px 0 rgba(255,255,255,0.8);
      backdrop-filter: blur(16px);
    }

    .royale-card-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(19, 32, 39, 0.58);
      margin-bottom: 7px;
    }

    .royale-card-title {
      margin: 0;
      color: #16232a;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.05;
    }

    .royale-card-copy {
      margin: 7px 0 0;
      color: rgba(22, 35, 42, 0.78);
      font-size: 12px;
      line-height: 1.45;
    }

    .royale-track {
      margin-top: 10px;
      height: 14px;
      padding: 2px;
      border-radius: 999px;
      background: rgba(26, 42, 51, 0.08);
      overflow: hidden;
    }

    .royale-track-fill {
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, #62da8b, #ffe07a 68%, #ff9f84);
      transition: width 240ms ease;
    }

    .royale-statline {
      margin-top: 9px;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 11px;
      font-weight: 800;
      color: rgba(20, 31, 38, 0.64);
    }

    .royale-list {
      margin: 10px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 7px;
    }

    .royale-list-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 9px;
      border-radius: 16px;
      background: rgba(255,255,255,0.58);
      border: 1px solid rgba(25, 39, 47, 0.08);
      color: rgba(22, 35, 42, 0.84);
      font-size: 11px;
      font-weight: 700;
      line-height: 1.35;
    }

    .royale-list-item strong {
      display: grid;
      place-items: center;
      width: 18px;
      height: 18px;
      flex: 0 0 18px;
      border-radius: 999px;
      background: linear-gradient(180deg, #ffeaa6, #ffd26c);
      color: #46340e;
      font-size: 10px;
    }

    .royale-bottom {
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: 16px;
      z-index: 38;
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .royale-dock {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: min(640px, calc(100% - 8px));
      max-width: 840px;
      padding: 12px;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(18, 35, 43, 0.88), rgba(10, 22, 28, 0.82));
      box-shadow:
        0 18px 45px rgba(4, 12, 18, 0.28),
        inset 0 1px 0 rgba(255,255,255,0.08);
      pointer-events: auto;
    }

    .royale-dock-card {
      flex: 1;
      min-width: 0;
      padding: 10px 12px;
      border-radius: 20px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.08);
      color: #f3fbff;
    }

    .royale-dock-label {
      display: block;
      margin-bottom: 4px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.58);
    }

    .royale-dock-value {
      display: block;
      font-size: 15px;
      font-weight: 900;
      line-height: 1.1;
      color: #fffdf4;
    }

    .royale-dock-note {
      display: block;
      margin-top: 4px;
      color: rgba(241, 248, 252, 0.7);
      font-size: 11px;
      font-weight: 700;
    }

    .royale-lore {
      position: absolute;
      left: 20px;
      top: 105px;
      width: 210px;
      z-index: 34;
      padding: 14px 14px 15px;
      border-radius: 24px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,248,227,0.54));
      border: 2px solid rgba(26, 41, 49, 0.14);
      box-shadow: 0 12px 30px rgba(20, 46, 62, 0.12);
      pointer-events: none;
    }

    .royale-lore strong {
      display: block;
      font-size: 10px;
      color: rgba(21, 34, 40, 0.56);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .royale-lore h3 {
      margin: 0;
      color: #16232a;
      font-size: 18px;
      line-height: 1.06;
    }

    .royale-lore p {
      margin: 7px 0 0;
      color: rgba(22, 35, 42, 0.78);
      font-size: 11px;
      line-height: 1.45;
    }

    .royale-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 10px;
    }

    .royale-chip {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 5px 9px;
      border-radius: 999px;
      background: rgba(255,255,255,0.54);
      border: 1px solid rgba(20, 34, 41, 0.08);
      color: rgba(22, 35, 42, 0.82);
      font-size: 10px;
      font-weight: 800;
    }

    .page.royale-shell .feedback {
      right: 20px;
      bottom: 116px;
      width: 264px;
      padding-left: 36px;
      background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(232,247,255,0.66));
      border-color: rgba(21, 34, 41, 0.18);
      box-shadow: 0 14px 34px rgba(14, 35, 46, 0.18);
    }

    .page.royale-shell .controls button {
      bottom: 94px;
      min-width: 158px;
      min-height: 62px;
      border-radius: 24px;
      box-shadow:
        0 12px 28px rgba(14, 35, 46, 0.22),
        inset 0 -5px 0 rgba(24, 19, 10, 0.18);
    }

    .page.royale-shell #listenBtn {
      left: 50%;
      transform: translateX(-172px);
    }

    .page.royale-shell #nextBtn {
      right: 50%;
      transform: translateX(174px);
      top: auto;
      bottom: 94px;
    }

    .page.royale-shell .tabs {
      top: 88px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 28px;
      padding: 6px;
      background: rgba(255,255,255,0.24);
      box-shadow: 0 12px 28px rgba(17, 45, 59, 0.14);
    }

    .page.royale-shell .tabs button {
      min-width: 112px;
      padding-left: 34px;
      padding-right: 14px;
      border-radius: 20px;
    }

    .page.royale-shell .coach,
    .page.royale-shell .learned,
    .page.royale-shell .mission {
      display: none;
    }

    .page.royale-shell .rotate-tip {
      top: auto;
      bottom: 168px;
      left: 50%;
      transform: translateX(-50%);
      padding: 9px 14px;
      font-size: 12px;
      background: rgba(18, 34, 43, 0.72);
      color: rgba(255,255,255,0.84);
      border-radius: 999px;
      backdrop-filter: blur(10px);
    }

    @media (max-width: 1120px) {
      .royale-sidebar {
        width: 220px;
        top: 94px;
      }

      .royale-lore {
        width: 188px;
      }

      .page.royale-shell .controls button {
        min-width: 144px;
      }
    }

    @media (max-width: 920px), (max-height: 760px) {
      .royale-topbar {
        right: 118px;
      }

      .royale-sidebar {
        right: 12px;
        top: 90px;
        width: 204px;
      }

      .royale-lore {
        left: 12px;
        top: 92px;
        width: 170px;
      }

      .royale-dock {
        min-width: min(560px, calc(100% - 8px));
      }

      .page.royale-shell .feedback {
        width: 220px;
        right: 12px;
      }
    }

    @media (max-width: 760px), (orientation: portrait) {
      body {
        padding: 0;
        background: linear-gradient(180deg, #071219, #112837 40%, #153242 100%);
      }

      .phone.royale-phone {
        width: 100vw;
        max-height: none;
        aspect-ratio: auto;
        min-height: 100vh;
        border-radius: 0;
        border-width: 0;
        box-shadow: none;
      }

      .royale-topbar {
        left: 12px;
        right: 12px;
        top: calc(env(safe-area-inset-top, 0px) + 10px);
        gap: 8px;
      }

      .royale-crest {
        padding: 10px 11px;
      }

      .royale-title {
        font-size: 15px;
      }

      .royale-subtitle {
        font-size: 10px;
      }

      .royale-pips {
        display: none;
      }

      .page.royale-shell .tabs {
        top: calc(env(safe-area-inset-top, 0px) + 78px);
        left: 12px;
        right: 12px;
        transform: none;
        overflow-x: auto;
        justify-content: flex-start;
      }

      .page.royale-shell .tabs button {
        min-width: 102px;
      }

      .royale-lore {
        left: 12px;
        right: 12px;
        top: auto;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 220px);
        width: auto;
        display: none;
      }

      .royale-sidebar {
        left: 12px;
        right: 12px;
        top: auto;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 120px);
        width: auto;
        grid-template-columns: 1fr;
      }

      .royale-card:last-child {
        display: none;
      }

      .page.royale-shell .feedback {
        left: 12px;
        right: 12px;
        width: auto;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 164px);
      }

      .royale-bottom {
        left: 10px;
        right: 10px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
      }

      .royale-dock {
        width: 100%;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 10px;
        border-radius: 24px;
      }

      .royale-dock-card:first-child {
        grid-column: 1 / -1;
      }

      .page.royale-shell .controls {
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      .page.royale-shell .controls button {
        position: fixed;
        min-width: 0;
        width: calc(50vw - 18px);
        max-width: 176px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
        padding-left: 36px;
        z-index: 45;
      }

      .page.royale-shell #listenBtn {
        left: 12px;
        transform: none;
      }

      .page.royale-shell #nextBtn {
        right: 12px;
        transform: none;
      }

      .page.royale-shell .rotate-tip {
        bottom: calc(env(safe-area-inset-bottom, 0px) + 248px);
      }
    }
  `;
  document.head.appendChild(style);
}

function createShellMarkup() {
  const wrapper = document.createElement("div");
  wrapper.className = "royale-shell-root";
  wrapper.innerHTML = `
    <section class="royale-topbar" aria-hidden="true">
      <div class="royale-crest">
        <div class="royale-emblem">♕</div>
        <div class="royale-crest-copy">
          <span class="royale-kicker">Music Kingdom</span>
          <strong class="royale-title" data-shell-title>皇家音感远征</strong>
          <span class="royale-subtitle" data-shell-subtitle>世界级音乐策略练耳</span>
        </div>
      </div>
      <div class="royale-pips" data-shell-pips></div>
    </section>
    <aside class="royale-lore" aria-live="polite">
      <strong>战场设定</strong>
      <h3 data-lore-title>把声音养成记忆</h3>
      <p data-lore-copy>你不是在背题，而是在像职业玩家一样建立声音地图。</p>
      <div class="royale-chip-row" data-lore-chips></div>
    </aside>
    <aside class="royale-sidebar" aria-live="polite">
      <section class="royale-card">
        <span class="royale-card-eyebrow">Academy Progress</span>
        <h3 class="royale-card-title" data-academy-title>本章掌握度</h3>
        <p class="royale-card-copy" data-academy-copy>每收集一张音卡，都在把抽象乐理变成直觉。</p>
        <div class="royale-track"><div class="royale-track-fill" data-academy-progress></div></div>
        <div class="royale-statline">
          <span data-academy-left>0 / 0</span>
          <span data-academy-rank>新手练耳</span>
        </div>
      </section>
      <section class="royale-card">
        <span class="royale-card-eyebrow">Lesson Intel</span>
        <h3 class="royale-card-title" data-intel-title>本关学习重点</h3>
        <p class="royale-card-copy" data-intel-copy>先让耳朵知道该听什么，再让手去完成操作。</p>
        <ul class="royale-list" data-intel-list></ul>
      </section>
    </aside>
    <section class="royale-bottom">
      <div class="royale-dock">
        <div class="royale-dock-card">
          <span class="royale-dock-label">Battle Objective</span>
          <strong class="royale-dock-value" data-dock-objective>先听目标，再抓正确的猫</strong>
          <span class="royale-dock-note" data-dock-note>建立耳朵里的“声音地图”。</span>
        </div>
        <div class="royale-dock-card">
          <span class="royale-dock-label">Mastery</span>
          <strong class="royale-dock-value" data-dock-mastery>0%</strong>
          <span class="royale-dock-note" data-dock-mastery-note>本章刚开始</span>
        </div>
        <div class="royale-dock-card">
          <span class="royale-dock-label">Streak</span>
          <strong class="royale-dock-value" data-dock-streak>combo 0</strong>
          <span class="royale-dock-note" data-dock-streak-note>稳住节奏，别急着猜</span>
        </div>
      </div>
    </section>
  `;
  return wrapper;
}

function getRank(progress) {
  if (progress >= 1) return "皇家乐感大师";
  if (progress >= 0.7) return "精英训练官";
  if (progress >= 0.4) return "旋律猎人";
  return "新手练耳";
}

function fillPips(host, total, current) {
  if (!host) return;
  host.innerHTML = "";
  for (let index = 0; index < total; index += 1) {
    const pip = document.createElement("span");
    pip.className = `royale-pip${index < current ? " active" : ""}`;
    host.appendChild(pip);
  }
}

function renderChecklist(host, items) {
  if (!host) return;
  host.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "royale-list-item";
    li.innerHTML = `<strong>${index + 1}</strong><span>${item}</span>`;
    host.appendChild(li);
  });
}

export function mountGameShell(runtime) {
  ensureShellStyle();

  const page = document.querySelector(".page");
  const phone = document.querySelector(".phone");
  if (!page || !phone) return () => {};

  page.classList.add("royale-shell");
  phone.classList.add("royale-phone");

  const shell = createShellMarkup();
  page.appendChild(shell);

  const refs = {
    pips: shell.querySelector("[data-shell-pips]"),
    title: shell.querySelector("[data-shell-title]"),
    subtitle: shell.querySelector("[data-shell-subtitle]"),
    loreTitle: shell.querySelector("[data-lore-title]"),
    loreCopy: shell.querySelector("[data-lore-copy]"),
    loreChips: shell.querySelector("[data-lore-chips]"),
    academyTitle: shell.querySelector("[data-academy-title]"),
    academyCopy: shell.querySelector("[data-academy-copy]"),
    academyProgress: shell.querySelector("[data-academy-progress]"),
    academyLeft: shell.querySelector("[data-academy-left]"),
    academyRank: shell.querySelector("[data-academy-rank]"),
    intelTitle: shell.querySelector("[data-intel-title]"),
    intelCopy: shell.querySelector("[data-intel-copy]"),
    intelList: shell.querySelector("[data-intel-list]"),
    dockObjective: shell.querySelector("[data-dock-objective]"),
    dockNote: shell.querySelector("[data-dock-note]"),
    dockMastery: shell.querySelector("[data-dock-mastery]"),
    dockMasteryNote: shell.querySelector("[data-dock-mastery-note]"),
    dockStreak: shell.querySelector("[data-dock-streak]"),
    dockStreakNote: shell.querySelector("[data-dock-streak-note]")
  };

  let rafId = 0;
  let lastSnapshot = "";

  const update = () => {
    const stage = STAGES[runtime.state.stage] || STAGES.note3;
    const learnedCount = runtime.state.learned.length;
    const goal = Math.max(1, stage.masteryGoal || stage.rounds || 1);
    const progress = Math.min(1, learnedCount / goal);
    const masteryPercent = Math.round(progress * 100);
    const snapshot = [
      runtime.state.stage,
      learnedCount,
      runtime.state.combo,
      runtime.state.round,
      runtime.state.score,
      runtime.state.heardTarget,
      runtime.state.solved
    ].join("|");

    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      refs.title.textContent = stage.heroTitle;
      refs.subtitle.textContent = `${stage.badge} · ${stage.rewardName}`;
      refs.loreTitle.textContent = stage.intro;
      refs.loreCopy.textContent = stage.memoryHint;
      refs.academyTitle.textContent = `${stage.rewardName} 收集进度`;
      refs.academyCopy.textContent = `${stage.lesson} 现在的重点是：${stage.prompt}。`;
      refs.academyProgress.style.width = `${masteryPercent}%`;
      refs.academyLeft.textContent = `${learnedCount} / ${goal} 已掌握`;
      refs.academyRank.textContent = getRank(progress);
      refs.intelTitle.textContent = "本关学习重点";
      refs.intelCopy.textContent = runtime.state.heardTarget
        ? "你已经拿到目标声音了，现在让操作去服务听觉判断。"
        : "先听目标音，再开始找猫，别让手速盖过耳朵。";
      refs.dockObjective.textContent = runtime.state.solved
        ? "继续推进下一只，把手感和听感连起来"
        : runtime.state.heardTarget
          ? "锁定声音最像的猫，然后顺滑投喂"
          : "先播放猫粮，建立本回合目标";
      refs.dockNote.textContent = stage.memoryHint;
      refs.dockMastery.textContent = `${masteryPercent}%`;
      refs.dockMasteryNote.textContent = learnedCount
        ? `已经收集 ${learnedCount} 张 ${stage.rewardName}`
        : "这一章还没开始积累";
      refs.dockStreak.textContent = `combo ${runtime.state.combo}`;
      refs.dockStreakNote.textContent = runtime.state.combo > 1
        ? "连对时更要稳，靠辨识不是靠运气"
        : "听清楚再出手，正确率比速度更重要";

      refs.loreChips.innerHTML = "";
      stage.notes.slice(0, 5).forEach((note) => {
        const chip = document.createElement("span");
        chip.className = "royale-chip";
        chip.textContent = stage.kind === "note" ? `${note} 音高` : `${note} 根音`;
        refs.loreChips.appendChild(chip);
      });
      fillPips(refs.pips, goal, Math.min(goal, learnedCount));
      renderChecklist(refs.intelList, stage.syllabus || []);
    }

    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(rafId);
    shell.remove();
  };
}
