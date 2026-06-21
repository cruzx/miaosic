import { playSoundToken, playSuccess } from "../audio/sound-engine.js";

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function playToken(token, options = {}) {
  const frequencies = token.frequencies || [token.frequency || 261.63];
  await Promise.all(
    frequencies.map((frequency, index) =>
      playSoundToken(
        {
          frequency,
          waveform: options.waveform || (token.kind === "chord" ? "triangle" : "sine")
        },
        {
          duration: options.duration || 0.64,
          volume: frequencies.length > 1 ? 0.075 : options.volume || 0.2,
          bend: options.bend || 1.01,
          filter: options.filter || 1800 + index * 120
        }
      )
    )
  );
}

export function makeSoundPlayer() {
  return {
    async resume() {
      await playSoundToken(
        { frequency: 220, waveform: "sine" },
        { duration: 0.02, volume: 0.0001, filter: 500 }
      );
      return true;
    },
    async playTarget(token) {
      await playToken(token, { duration: 0.58, volume: 0.22, filter: 2400 });
      await wait(430);
      await playToken(token, { duration: 0.65, volume: 0.16, waveform: "triangle", bend: 0.985, filter: 1350 });
      return 1120;
    },
    async playCat(token) {
      await playToken(token, { duration: 0.66, volume: 0.17, waveform: "triangle", bend: 0.985, filter: 1450 });
      return 680;
    },
    async playSuccess() {
      await playSuccess();
      return 620;
    },
    async playWrong(direction = 0) {
      const base = direction > 0 ? 210 : 178;
      await playSoundToken(
        { frequency: base, waveform: "triangle" },
        { duration: 0.34, volume: 0.1, bend: 0.68, filter: 760 }
      );
      return 380;
    },
    async playTap() {
      await playSoundToken(
        { frequency: 880, waveform: "sine" },
        { duration: 0.12, volume: 0.05, filter: 2600 }
      );
    }
  };
}
