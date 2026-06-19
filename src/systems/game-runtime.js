export function createGameRuntime() {
  return {
    state: {
      stage: "note3",
      learned: [],
      combo: 0,
      round: 0,
      heardTarget: false,
      score: 0
    },
    playTarget() {
      this.state.heardTarget = true;
    },
    nextRound() {
      this.state.round += 1;
    }
  };
}
