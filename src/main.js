import * as THREE from "three";
import "./styles.css";
import { createSoundIslandGame } from "./game/sound-island-game.js";
import { createAppShell } from "./ui/app-shell.js";

document.title = "Miaosic 音乐岛";
document.documentElement.dataset.app = "miaosic";
document.documentElement.dataset.experience = "sound-island";

const app = document.getElementById("app");
const shell = createAppShell(app);
const game = createSoundIslandGame({
  THREE,
  host: shell.scene,
  onState: shell.render,
  onLabels: shell.setCatLabels,
  onTip: shell.showTip
});

shell.bindActions({
  start: game.start,
  listen: game.listen,
  submit: game.submitSelected,
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
  submitSelected: game.submitSelected,
  nextRound: game.next,
  setStage: game.setStage,
  resetProgress: game.resetProgress,
  destroy() {
    game.destroy();
    shell.destroy();
  }
};
