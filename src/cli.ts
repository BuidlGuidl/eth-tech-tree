import { promptForMissingUserState } from "./tasks/prompt-for-missing-user-state";
import { renderIntroMessage } from "./tasks/render-intro-message";
import type { Args, IUser } from "./types";
import { loadUserState, saveChallenges } from "./utils/state-manager";
import { fetchChallenges } from "./modules/api";
import { parseCommandArgumentsAndOptions, promptForMissingCommandArgs } from "./tasks/parse-command-arguments-and-options";
import { handleCommand } from "./tasks/handle-command";
import { TechTree } from ".";



export async function cli(args: Args) {
  try {
    const commands = await parseCommandArgumentsAndOptions(args);
    const userState = loadUserState();
    if (commands.command || commands.help) {
      const parsedCommands = await promptForMissingCommandArgs(commands, userState);
      await handleCommand(parsedCommands);
    } else {
      await renderIntroMessage();
      await init(userState);
      // Navigate tree
      const techTree = new TechTree();

      await techTree.start();
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      // Because canceling the promise (e.g. ctrl+c) can cause the inquirer prompt to throw we need to silence this error
    } else {
      throw error;
    }
  }
}

async function init(userState: IUser) {
  // Use local user state or prompt to retrieve user from server
  await promptForMissingUserState(userState);

  // Get Challenges
  const challenges = await fetchChallenges();
  await saveChallenges(challenges);
}
