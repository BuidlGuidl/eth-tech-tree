import { promptForMissingUserState } from "./tasks/prompt-for-missing-user-state";
import { renderIntroMessage } from "./tasks/render-intro-message";
import type { Args } from "./types";
import { startVisualization } from "./utils/tree";
import { loadUserState, saveChallenges } from "./utils/stateManager";
import { fetchChallenges } from "./modules/api";
import dotenv from "dotenv";

dotenv.config();

export async function cli(args: Args) {
  await renderIntroMessage();
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
