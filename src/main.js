import { createGameRuntime } from "./systems/game-runtime.js";
import { mountMusicIsland } from "./scene/music-island.js";
import { mountFindSoundGame } from "./ui/find-sound-game.js";

document.title = "Miaosic · 音乐岛";
document.documentElement.dataset.app = "miaosic";
document.documentElement.dataset.experience = "music-island";

const runtime = createGameRuntime();
const cleanups = [
  mountMusicIsland(runtime),
  mountFindSoundGame(runtime)
];

window.miaosic = {
  runtime,
  reset() {
    runtime.reset();
  },
  destroy() {
    cleanups.forEach((cleanup) => cleanup?.());
  }
};
