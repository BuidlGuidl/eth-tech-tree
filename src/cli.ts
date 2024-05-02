import { promptForMissingUserState } from "./utils/prompt-for-missing-user-state";
import { renderIntroMessage } from "./utils/render-intro-message";
import type { Args } from "./types";
import { getUserState } from "./utils/user-state";
import { startVisualization } from "./utils/tree";

export async function cli(args: Args) {
  renderIntroMessage();

  let userState = await getUserState();
  userState = await promptForMissingUserState(userState);

  // Navigate tree
  await startVisualization();
  console.log(userState);
}
