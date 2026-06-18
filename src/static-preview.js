import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { createGameScene } from "./scene/world.js";
import { mountGameShell } from "./ui/game-shell.js";

const runtime = createGameScene({ THREE });
mountGameShell(runtime);
