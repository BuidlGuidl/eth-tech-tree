import { promptForMissingUserState } from "./tasks/prompt-for-missing-user-state";
import { renderIntroMessage } from "./tasks/render-intro-message";
import type { Args, UserState } from "./types";
import { startVisualization } from "./utils/tree";
import { loadUserState, saveChallenges } from "./utils/stateManager";
import { fetchChallenges } from "./modules/api";
import dotenv from "dotenv";
import { parseCommandArgumentsAndOptions, promptForMissingCommandArgs } from "./tasks/parse-command-arguments-and-options";
import { handleCommand } from "./tasks/handle-command";

dotenv.config();

export async function cli(args: Args) {
  const commands = await parseCommandArgumentsAndOptions(args);
  const userState = loadUserState();
  if (commands.command || commands.help) {
    const parsedCommands = await promptForMissingCommandArgs(commands, userState);
    await handleCommand(parsedCommands);
  } else {
    await renderIntroMessage();
    await init(userState);
    // Navigate tree
    await startVisualization();
  }
}

async function init(userState: UserState) {
  // Use local user state or prompt to retrieve user from server
  await promptForMissingUserState(userState);

  // Get Challenges
  const challenges = await fetchChallenges();
  saveChallenges(challenges);
}
