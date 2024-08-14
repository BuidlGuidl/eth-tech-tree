import { promptForMissingUserState } from "./utils/prompt-for-missing-user-state";
import { renderIntroMessage } from "./utils/render-intro-message";
import type { Args } from "./types";
import { startVisualization } from "./utils/tree";
import { loadUserState, saveChallenges } from "./utils/stateManager";
import { fetchChallenges } from "./modules/api";

export async function cli(args: Args) {
  renderIntroMessage();
  await init();
  // Navigate tree
  await startVisualization();
}

async function init() {
  const userState = loadUserState();
  // Use local user state or prompt to retrieve user from server
  await promptForMissingUserState(userState);

  // Get Challenges
  const challenges = await fetchChallenges();
  saveChallenges(challenges);
}
