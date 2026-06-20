import { playSoundToken } from "../audio/sound-engine.js";

export function makeSound() {
  return {
    target(token) {
      return playSoundToken(token);
    }
  };
}
