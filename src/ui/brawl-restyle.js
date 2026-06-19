import { STAGES } from "../config/stages.js";

const STYLE_ID = "miaosic-brawl-restyle-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --miao-black: #10131f;
      --miao-ink: #ffffff;
      --miao-blue: #0878ff;
      --miao-deep-blue: #0736a5;
      --miao-yellow: #ffd21f;
      --miao-orange: #ff8b1f;
      --miao-purple: #9b35ff;
      --miao-green: #20dc5b;
      --miao-red: #f23a4a;
      --miao-panel: #202844;
      --miao-stroke: #070914;
    }

    body {
      background: #070914 !important;
      font-family: Impact, "Arial Black", "Trebuchet MS", system-ui, sans-serif !important;
    }

    .phone.royale-phone,
    .phone {
      border: 0 !important;
      border-radius: 0 !important;
      background: #0878ff !important;
      box-shadow: none !important;
    }

    .page.royale-shell,
    .page {
      background:
        radial-gradient(circle at 50% 34%, rgba(76, 211, 255, .95), transparent 22%),
        radial-gradient(circle at 50% 38%, #118aff 0%, #0568df 42%, #063aa8 100%) !important;
    }

    .page::before {
      background-image:
        radial-gradient(circle at 18% 18%, rgba(255,255,255,.12) 0 8px, transparent 9px),
        radial-gradient(circle at 62% 28%, rgba(255,255,255,.1) 0 7px, transparent 8px),
        radial-gradient(circle at 84% 62%, rgba(255,255,255,.09) 0 9px, transparent 10px) !important;
      opacity: .9 !important;
    }

    .page::after {
      background:
        linear-gradient(90deg, rgba(0,0,0,.18), transparent 22%, transparent 78%, rgba(0,0,0,.24)),
        radial-gradient(circle at 50% 54%, transparent 0 34%, rgba(0,0,0,.28) 86%) !important;
      mix-blend-mode: multiply !important;
    }

    .royale-topbar,
    .royale-sidebar,
    .royale-lore,
    .royale-bottom,
    .feedback,
    .learned,
    .coach,
    .mission,
    .hint,
    .lesson-bar,
    .quest-ribbon,
    .rotate-tip,
    .gesture-guide,
    .reward-card,
    .combo-burst,
    header {
      display: none !important;
    }

    #scene {
      inset: 0 !important;
      filter: saturate(1.28) contrast(1.08) drop-shadow(0 18px 18px rgba(0,0,0,.24));
      transform: scale(.92) translateY(24px);
      transform-origin: center;
    }

    .page.brawl-play .miao-lobby-root {
      opacity: 0;
      transform: translateY(-20px) scale(.98);
      pointer-events: none;
    }

    .page.brawl-play #scene {
      transform: scale(1.06) translateY(0);
      filter: saturate(1.42) contrast(1.18);
    }

    .page.brawl-play .miao-arena-root {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .miao-brawl-root {
      position: absolute;
      inset: 0;
      z-index: 60;
      pointer-events: none;
      color: #fff;
      text-shadow: 0 3px 0 var(--miao-stroke), 2px 0 0 var(--miao-stroke), -2px 0 0 var(--miao-stroke), 0 -2px 0 var(--miao-stroke);
      font-family: Impact, "Arial Black", "Trebuchet MS", system-ui, sans-serif;
      user-select: none;
    }

    .miao-brawl-root button {
      font: inherit;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }

    .miao-logo {
      position: absolute;
      left: calc(env(safe-area-inset-left, 0px) + 18px);
      top: calc(env(safe-area-inset-top, 0px) + 12px);
      z-index: 4;
      font-size: clamp(34px, 6vw, 72px);
      line-height: .78;
      letter-spacing: -3px;
      transform: rotate(-2deg);
    }

    .miao-logo span {
      display: block;
      color: var(--miao-yellow);
      font-size: .34em;
      letter-spacing: 0;
      transform: translateX(52px) rotate(1deg);
    }

    .miao-top-currencies {
      position: absolute;
      right: calc(env(safe-area-inset-right, 0px) + 18px);
      top: calc(env(safe-area-inset-top, 0px) + 14px);
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 5;
    }

    .miao-currency {
      min-width: 86px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 10px;
      border: 3px solid var(--miao-stroke);
      border-radius: 8px;
      background: linear-gradient(180deg, #222943, #111727);
      box-shadow: 0 4px 0 #050711;
      font-size: 17px;
      font-weight: 1000;
    }

    .miao-currency i { font-style: normal; text-shadow: none; }

    .miao-menu {
      width: 52px;
      height: 42px;
      display: grid;
      place-items: center;
      border: 3px solid var(--miao-stroke);
      border-radius: 8px;
      background: linear-gradient(180deg, #4d5879, #1a2237);
      box-shadow: 0 4px 0 #050711;
      color: #fff;
      font-size: 24px;
    }

    .miao-side {
      position: absolute;
      top: 118px;
      z-index: 5;
      display: grid;
      gap: 9px;
    }

    .miao-side.left { left: calc(env(safe-area-inset-left, 0px) + 16px); }
    .miao-side.right { right: calc(env(safe-area-inset-right, 0px) + 16px); }

    .miao-side-btn {
      width: 108px;
      height: 55px;
      position: relative;
      padding: 7px 8px 7px 42px;
      border: 3px solid var(--miao-stroke);
      border-radius: 9px;
      background: linear-gradient(180deg, #4c5878, #1a2137);
      color: #fff;
      box-shadow: 0 5px 0 #050711;
      text-align: left;
      font-size: 15px;
      font-weight: 1000;
    }

    .miao-side-btn i {
      position: absolute;
      left: 7px;
      top: 50%;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--miao-yellow);
      border: 2px solid var(--miao-stroke);
      transform: translateY(-50%);
      text-shadow: none;
      font-style: normal;
    }

    .miao-badge {
      position: absolute;
      right: -8px;
      top: -9px;
      min-width: 25px;
      height: 25px;
      display: grid;
      place-items: center;
      padding: 0 6px;
      border-radius: 999px;
      border: 3px solid var(--miao-stroke);
      background: var(--miao-green);
      color: #fff;
      font-size: 13px;
    }

    .miao-hero-card {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(420px, 40vw);
      height: min(470px, 55vh);
      z-index: 3;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .miao-hero-glow {
      position: absolute;
      inset: 12% 6% 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 255, 255, .7), rgba(23, 91, 255, .18) 46%, transparent 70%);
      filter: blur(4px);
    }

    .miao-hero-stage {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 80%;
      height: 18%;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(0,0,0,.34), transparent 68%);
      transform: translateX(-50%);
    }

    .miao-hero {
      position: absolute;
      left: 50%;
      bottom: 8%;
      width: min(300px, 30vw);
      height: min(360px, 48vh);
      transform: translateX(-50%);
      animation: miaoHeroIdle 1700ms ease-in-out infinite;
    }

    @keyframes miaoHeroIdle {
      0%, 100% { translate: 0 0; rotate: -1deg; }
      50% { translate: 0 -8px; rotate: 1deg; }
    }

    .miao-cat-body {
      position: absolute;
      left: 50%;
      bottom: 13%;
      width: 46%;
      height: 42%;
      border: 6px solid var(--miao-stroke);
      border-radius: 42% 42% 36% 36%;
      background: linear-gradient(180deg, #ff9a2a, #d65b18);
      transform: translateX(-50%);
      box-shadow: inset -14px -20px 0 rgba(0,0,0,.16);
    }

    .miao-cat-head {
      position: absolute;
      left: 50%;
      top: 8%;
      width: 62%;
      height: 48%;
      border: 6px solid var(--miao-stroke);
      border-radius: 48% 48% 42% 42%;
      background: linear-gradient(180deg, #ffb244, #f0771c);
      transform: translateX(-50%);
      box-shadow: inset -16px -20px 0 rgba(0,0,0,.13);
    }

    .miao-cat-head::before,
    .miao-cat-head::after {
      content: "";
      position: absolute;
      top: -26px;
      width: 34%;
      height: 46%;
      border: 6px solid var(--miao-stroke);
      background: #ff9a2a;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }

    .miao-cat-head::before { left: 0; transform: rotate(-22deg); }
    .miao-cat-head::after { right: 0; transform: rotate(22deg); }

    .miao-shades {
      position: absolute;
      left: 50%;
      top: 28%;
      width: 68%;
      height: 18%;
      transform: translateX(-50%) rotate(-4deg);
      display: flex;
      gap: 6%;
      z-index: 2;
    }

    .miao-shades span {
      flex: 1;
      border: 4px solid var(--miao-stroke);
      border-radius: 10px 10px 16px 16px;
      background: linear-gradient(180deg, #15192a, #02030a);
    }

    .miao-mouth {
      position: absolute;
      left: 50%;
      top: 60%;
      width: 20%;
      height: 10%;
      border-radius: 0 0 999px 999px;
      background: #fff;
      border: 4px solid var(--miao-stroke);
      transform: translateX(-50%);
    }

    .miao-guitar {
      position: absolute;
      left: 18%;
      top: 52%;
      width: 72%;
      height: 18%;
      z-index: 4;
      transform: rotate(-21deg);
    }

    .miao-guitar::before {
      content: "";
      position: absolute;
      left: 0;
      top: 12%;
      width: 42%;
      height: 92%;
      border: 6px solid var(--miao-stroke);
      border-radius: 45% 54% 46% 55%;
      background: linear-gradient(180deg, #a63bff, #6222d9);
      box-shadow: inset -8px -10px 0 rgba(0,0,0,.18);
    }

    .miao-guitar::after {
      content: "";
      position: absolute;
      left: 34%;
      top: 40%;
      width: 62%;
      height: 18%;
      border: 5px solid var(--miao-stroke);
      border-radius: 999px;
      background: #7b45ff;
    }

    .miao-name-tag {
      position: absolute;
      left: 50%;
      top: 17%;
      z-index: 6;
      min-width: 126px;
      padding: 7px 12px;
      border: 3px solid var(--miao-stroke);
      border-radius: 6px;
      background: #fff;
      color: #111827;
      text-align: center;
      font-size: 17px;
      transform: translateX(116px) rotate(-1deg);
      text-shadow: none;
    }

    .miao-name-tag::before {
      content: "在线";
      position: absolute;
      left: 12px;
      top: -20px;
      padding: 2px 9px;
      border: 3px solid var(--miao-stroke);
      border-bottom: 0;
      border-radius: 6px 6px 0 0;
      background: var(--miao-green);
      color: #fff;
      font-size: 12px;
      text-shadow: 0 2px 0 var(--miao-stroke);
    }

    .miao-plus-friend {
      position: absolute;
      left: 50%;
      top: 28%;
      width: 56px;
      height: 56px;
      border: 4px solid rgba(255,255,255,.88);
      border-radius: 8px;
      background: rgba(255,255,255,.14);
      color: #fff;
      font-size: 38px;
      transform: translateX(154px);
      box-shadow: inset 0 -5px 0 rgba(0,0,0,.14);
    }

    .miao-bottom {
      position: absolute;
      left: calc(env(safe-area-inset-left, 0px) + 18px);
      right: calc(env(safe-area-inset-right, 0px) + 18px);
      bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
      z-index: 7;
      display: grid;
      grid-template-columns: 165px 175px 1fr 300px;
      gap: 14px;
      align-items: end;
    }

    .miao-chest,
    .miao-event {
      min-height: 78px;
      position: relative;
      border: 4px solid var(--miao-stroke);
      border-radius: 10px;
      background: linear-gradient(180deg, #343d5e, #151b2e);
      box-shadow: 0 6px 0 #050711;
      padding: 10px 12px;
      overflow: hidden;
    }

    .miao-chest::before {
      content: attr(data-icon);
      display: block;
      font-size: 34px;
      text-shadow: none;
    }

    .miao-chest strong,
    .miao-event strong {
      display: block;
      font-size: 16px;
    }

    .miao-chest span,
    .miao-event span {
      display: block;
      color: #cfe4ff;
      font-family: "Arial Black", system-ui;
      font-size: 12px;
      text-shadow: none;
    }

    .miao-event {
      min-height: 82px;
      padding-left: 78px;
    }

    .miao-event::before {
      content: "💎";
      position: absolute;
      left: 16px;
      top: 50%;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border: 3px solid var(--miao-stroke);
      border-radius: 8px;
      background: var(--miao-purple);
      transform: translateY(-50%);
      text-shadow: none;
    }

    .miao-play {
      height: 92px;
      border: 5px solid var(--miao-stroke);
      border-radius: 11px;
      background: linear-gradient(180deg, #ffe33b, #ffb000);
      color: #fff;
      box-shadow: 0 8px 0 #7a3b00;
      font-size: clamp(34px, 5vw, 56px);
      font-weight: 1000;
      letter-spacing: -1px;
    }

    .miao-play:active,
    .miao-side-btn:active,
    .miao-chest:active,
    .miao-menu:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 #050711;
    }

    .miao-arena-root {
      position: absolute;
      inset: 0;
      z-index: 66;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: opacity 220ms ease, transform 220ms ease;
    }

    .miao-arena-top {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(env(safe-area-inset-top, 0px) + 8px);
      z-index: 3;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: start;
      gap: 20px;
      padding: 0 18px;
    }

    .miao-team-bar {
      height: 42px;
      border: 4px solid var(--miao-stroke);
      border-radius: 6px;
      background: #14a8ff;
      box-shadow: 0 4px 0 #050711;
    }

    .miao-team-bar.red { background: #bf0034; }

    .miao-timer {
      min-width: 96px;
      height: 54px;
      display: grid;
      place-items: center;
      border: 4px solid var(--miao-stroke);
      border-radius: 16px;
      background: #10c7b3;
      box-shadow: 0 5px 0 #050711;
      font-size: 26px;
    }

    .miao-arena-map {
      position: absolute;
      inset: 64px 0 0;
      background:
        linear-gradient(90deg, rgba(0,0,0,.18), transparent 10%, transparent 90%, rgba(0,0,0,.18)),
        repeating-linear-gradient(0deg, rgba(0,0,0,.09) 0 2px, transparent 2px 88px),
        repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 88px),
        linear-gradient(180deg, #a96539, #7e4a2e);
      overflow: hidden;
    }

    .miao-arena-map::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 22% 28%, rgba(255,99,117,.88) 0 7%, transparent 7.2%),
        radial-gradient(circle at 78% 26%, rgba(255,99,117,.88) 0 7%, transparent 7.2%),
        radial-gradient(circle at 50% 70%, rgba(255,99,117,.78) 0 9%, transparent 9.2%),
        radial-gradient(circle at 50% 45%, rgba(19,205,184,.95) 0 5%, transparent 5.2%);
      filter: contrast(1.2);
    }

    .miao-wall {
      position: absolute;
      width: 76px;
      height: 76px;
      border: 4px solid #7b5a32;
      border-radius: 6px;
      background: linear-gradient(180deg, #ffcc65, #c98222);
      box-shadow: inset -8px -8px 0 rgba(0,0,0,.18), 0 6px 0 rgba(0,0,0,.18);
    }

    .miao-wall:nth-child(1) { left: 18%; top: 20%; }
    .miao-wall:nth-child(2) { left: 26%; top: 20%; }
    .miao-wall:nth-child(3) { left: 66%; top: 20%; }
    .miao-wall:nth-child(4) { left: 74%; top: 20%; }
    .miao-wall:nth-child(5) { left: 18%; top: 58%; }
    .miao-wall:nth-child(6) { left: 66%; top: 58%; }
    .miao-wall:nth-child(7) { left: 44%; top: 38%; }
    .miao-wall:nth-child(8) { left: 52%; top: 38%; }

    .miao-fighter {
      position: absolute;
      width: 82px;
      height: 82px;
      z-index: 2;
      transform: translate(-50%, -50%);
    }

    .miao-fighter::before {
      content: "";
      position: absolute;
      inset: 5px;
      border: 5px solid var(--miao-stroke);
      border-radius: 45% 45% 38% 38%;
      background: var(--fighter-color, #ff922b);
      box-shadow: inset -10px -12px 0 rgba(0,0,0,.16), 0 10px 18px rgba(0,0,0,.28);
    }

    .miao-fighter::after {
      content: attr(data-name);
      position: absolute;
      left: 50%;
      top: -28px;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 14px;
      color: #fff;
    }

    .miao-hp {
      position: absolute;
      left: 50%;
      top: -9px;
      width: 70px;
      height: 9px;
      border: 2px solid var(--miao-stroke);
      border-radius: 999px;
      background: #172034;
      transform: translateX(-50%);
      overflow: hidden;
    }

    .miao-hp span {
      display: block;
      width: var(--hp, 80%);
      height: 100%;
      background: var(--miao-green);
    }

    .miao-shot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 120px;
      height: 28px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(255,255,255,.9), rgba(194,54,255,.9), transparent);
      transform: translate(-10%, -50%) rotate(22deg);
      filter: drop-shadow(0 0 12px #c33cff);
      opacity: .9;
    }

    .miao-arena-controls {
      position: absolute;
      inset: auto 0 calc(env(safe-area-inset-bottom, 0px) + 18px) 0;
      z-index: 4;
      pointer-events: none;
    }

    .miao-stick {
      position: absolute;
      left: 38px;
      bottom: 0;
      width: 112px;
      height: 112px;
      border-radius: 50%;
      border: 4px solid rgba(255,255,255,.34);
      background: rgba(8,16,35,.24);
      pointer-events: auto;
    }

    .miao-stick::before {
      content: "";
      position: absolute;
      inset: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,.34);
      border: 3px solid rgba(0,0,0,.35);
    }

    .miao-skill {
      position: absolute;
      right: 36px;
      bottom: 0;
      width: 96px;
      height: 96px;
      display: grid;
      place-items: center;
      border: 5px solid var(--miao-stroke);
      border-radius: 50%;
      background: linear-gradient(180deg, #ffe13b, #ff9c00);
      box-shadow: 0 6px 0 #703800;
      color: #fff;
      font-size: 42px;
      pointer-events: auto;
    }

    .miao-skill.secondary {
      right: 150px;
      bottom: 18px;
      width: 76px;
      height: 76px;
      background: linear-gradient(180deg, #b63cff, #5d20d8);
      font-size: 34px;
    }

    .miao-exit {
      position: absolute;
      left: 50%;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
      z-index: 6;
      padding: 7px 16px;
      border: 3px solid rgba(255,255,255,.75);
      border-radius: 6px;
      background: rgba(0,0,0,.18);
      color: #fff;
      transform: translateX(-50%);
      pointer-events: auto;
      font-size: 16px;
    }

    @media (max-width: 760px), (orientation: portrait) {
      #scene { opacity: .65; transform: scale(.88) translateY(18px); }

      .miao-logo {
        font-size: 36px;
        letter-spacing: -2px;
      }

      .miao-logo span { transform: translateX(28px); }

      .miao-top-currencies {
        gap: 5px;
        right: 8px;
      }

      .miao-currency {
        min-width: auto;
        height: 32px;
        padding: 0 7px;
        font-size: 12px;
      }

      .miao-menu { width: 40px; height: 34px; font-size: 19px; }

      .miao-side {
        top: 88px;
        gap: 6px;
      }

      .miao-side.left { left: 8px; }
      .miao-side.right { right: 8px; }

      .miao-side-btn {
        width: 66px;
        height: 46px;
        padding: 4px;
        font-size: 0;
      }

      .miao-side-btn i {
        left: 50%;
        width: 30px;
        height: 30px;
        transform: translate(-50%, -50%);
      }

      .miao-hero-card {
        width: 72vw;
        height: 48vh;
        top: 45%;
      }

      .miao-hero { width: 58vw; height: 42vh; }

      .miao-name-tag,
      .miao-plus-friend { display: none; }

      .miao-bottom {
        left: 8px;
        right: 8px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .miao-event {
        grid-column: 1 / -1;
        min-height: 72px;
        order: -1;
      }

      .miao-play {
        grid-column: 1 / -1;
        height: 78px;
        font-size: 38px;
      }

      .miao-chest { min-height: 68px; }

      .miao-arena-map { inset-top: 56px; }
      .miao-team-bar { height: 30px; }
      .miao-timer { min-width: 72px; height: 42px; font-size: 20px; }
      .miao-wall { width: 54px; height: 54px; }
      .miao-fighter { width: 64px; height: 64px; }
      .miao-stick { width: 92px; height: 92px; left: 20px; }
      .miao-skill { width: 82px; height: 82px; right: 20px; }
      .miao-skill.secondary { right: 116px; width: 62px; height: 62px; }
    }
  `;
  document.head.appendChild(style);
}

function createLobbyMarkup() {
  const root = document.createElement("div");
  root.className = "miao-brawl-root";
  root.innerHTML = `
    <section class="miao-lobby-root">
      <div class="miao-logo">MIAOSIC<span>音乐竞技场</span></div>
      <div class="miao-top-currencies">
        <div class="miao-currency"><i>⚡</i><b>120/120</b></div>
        <div class="miao-currency"><i>🪙</i><b>23980</b></div>
        <div class="miao-currency"><i>💎</i><b>1975</b></div>
        <button class="miao-menu" type="button">☰</button>
      </div>
      <nav class="miao-side left">
        <button class="miao-side-btn" type="button"><i>🛒</i>商店<span class="miao-badge">新</span></button>
        <button class="miao-side-btn" type="button"><i>🎭</i>英雄<span class="miao-badge">12</span></button>
        <button class="miao-side-btn" type="button"><i>🎵</i>音符之路<span class="miao-badge">38</span></button>
        <button class="miao-side-btn" type="button"><i>☠️</i>活动</button>
      </nav>
      <nav class="miao-side right">
        <button class="miao-side-btn" type="button"><i>👥</i>好友<span class="miao-badge">20</span></button>
        <button class="miao-side-btn" type="button"><i>🛡️</i>战队</button>
        <button class="miao-side-btn" type="button"><i>🏆</i>排行榜</button>
        <button class="miao-side-btn" type="button"><i>📋</i>任务<span class="miao-badge">新</span></button>
      </nav>
      <section class="miao-hero-card" aria-label="RockCat hero">
        <div class="miao-hero-glow"></div>
        <div class="miao-hero-stage"></div>
        <div class="miao-hero">
          <div class="miao-cat-body"></div>
          <div class="miao-cat-head"><div class="miao-shades"><span></span><span></span></div><div class="miao-mouth"></div></div>
          <div class="miao-guitar"></div>
        </div>
        <div class="miao-name-tag">RockCat</div>
        <button class="miao-plus-friend" type="button">+</button>
      </section>
      <section class="miao-bottom">
        <button class="miao-chest" data-icon="🎹" type="button"><strong>试听宝箱</strong><span>12 / 100</span></button>
        <button class="miao-chest" data-icon="📻" type="button"><strong>音乐宝箱</strong><span>80 / 100</span></button>
        <button class="miao-event" type="button"><strong>宝石争霸</strong><span>和弦广场 · 活动刷新 2小时36分</span></button>
        <button class="miao-play" type="button" data-brawl-play>对战</button>
      </section>
    </section>
    <section class="miao-arena-root" aria-label="Music arena preview">
      <div class="miao-arena-map">
        <div class="miao-wall"></div><div class="miao-wall"></div><div class="miao-wall"></div><div class="miao-wall"></div>
        <div class="miao-wall"></div><div class="miao-wall"></div><div class="miao-wall"></div><div class="miao-wall"></div>
        <div class="miao-shot"></div>
        <div class="miao-fighter" data-name="PianoMew" style="left:28%;top:35%;--fighter-color:#8fd3ff;--hp:86%"><div class="miao-hp"><span></span></div></div>
        <div class="miao-fighter" data-name="RockCat" style="left:49%;top:52%;--fighter-color:#ff922b;--hp:100%"><div class="miao-hp"><span></span></div></div>
        <div class="miao-fighter" data-name="DJ Panda" style="left:62%;top:34%;--fighter-color:#f0f0f0;--hp:72%"><div class="miao-hp"><span></span></div></div>
        <div class="miao-fighter" data-name="ViolinGirl" style="left:79%;top:58%;--fighter-color:#9b35ff;--hp:68%"><div class="miao-hp"><span></span></div></div>
      </div>
      <div class="miao-arena-top">
        <div class="miao-team-bar"></div>
        <div class="miao-timer">2:15</div>
        <div class="miao-team-bar red"></div>
      </div>
      <div class="miao-arena-controls">
        <div class="miao-stick"></div>
        <button class="miao-skill secondary" type="button">♪</button>
        <button class="miao-skill" type="button">☠</button>
      </div>
      <button class="miao-exit" type="button" data-brawl-exit>退出</button>
    </section>
  `;
  return root;
}

export function mountBrawlRestyle(runtime) {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = createLobbyMarkup();
  page.appendChild(root);

  const sync = () => {
    const stage = STAGES[runtime.state.stage] || STAGES.note3;
    const event = root.querySelector(".miao-event span");
    if (event) event.textContent = `${stage.prompt} · ${stage.rewardName} · ${stage.badge}`;
  };

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-brawl-play]")) {
      page.classList.add("brawl-play");
    }
    if (event.target.closest("[data-brawl-exit]")) {
      page.classList.remove("brawl-play");
    }
  });

  let rafId = 0;
  let lastStage = "";
  const update = () => {
    if (runtime.state.stage !== lastStage) {
      lastStage = runtime.state.stage;
      sync();
    }
    rafId = requestAnimationFrame(update);
  };
  rafId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(rafId);
    root.remove();
  };
}
