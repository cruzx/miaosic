import * as THREE from "three";
import "./styles.css";
import { createAudioEngine } from "./game/audio-engine.js";
import { createSoundIslandGame } from "./game/sound-island-game.js";
import { createAppShell } from "./ui/app-shell.js";

document.title = "Miaosic 音乐岛";
document.documentElement.dataset.app = "miaosic";
document.documentElement.dataset.experience = "sound-island";

const app = document.getElementById("app");
const shell = createAppShell(app);
const audio = createAudioEngine();

let game;

try {
  game = createSoundIslandGame({
    THREE,
    host: shell.scene,
    audio,
    onState: shell.render,
    onLabels: shell.setCatLabels,
    onTip: shell.showTip
  });

  shell.bindActions({
    start: game.start,
    listen: game.listen,
    next: game.next,
    setStage: game.setStage
  });

  window.miaosicDebug = {
    getState: game.getState,
    getActiveCats: game.getActiveCats,
    getScreenTargets: game.getScreenTargets,
    playTarget: game.listen,
    sampleCat: game.sampleCat,
    submitCat: game.submitCat,
    nextRound: game.next,
    setStage: game.setStage,
    resetProgress: game.resetProgress,
    destroy() {
      game.destroy();
      shell.destroy();
    }
  };
} catch (error) {
  console.error(error);
  app.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#b7ecff;color:#17364a;font-family:system-ui,sans-serif">
      <section style="max-width:420px;padding:22px;border:3px solid currentColor;border-radius:24px;background:#fff;box-shadow:0 8px 0 rgba(23,54,74,.18)">
        <strong style="display:block;font-size:24px">音乐岛暂时无法启动</strong>
        <p style="line-height:1.5">${error?.message || "请刷新页面后重试。"}</p>
      </section>
    </main>
  `;
}
