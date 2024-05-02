import config from "../config";
import fs from "fs";
import {
  UserState
} from "../types";
import inquirer, { Answers } from "inquirer";
import { setUserState } from "./user-state";

// default values for unspecified args
const defaultOptions: Partial<UserState> = {
  installLocation: process.cwd() + '/challenges',
};

export async function promptForMissingUserState(
  userState: UserState
): Promise<UserState> {
  const cliAnswers = Object.fromEntries(
    Object.entries(userState).filter(([key, value]) => value !== null)
  );
  const questions = [];

  if (!userState.address) {
    questions.push({
      type: "input",
      name: "address",
      message: "Your wallet address:",
      validate: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
    });
  }
  
  if (!userState.installLocation) {
    questions.push({
      type: "input",
      name: "installLocation",
      message: "To which directory would you like to download the challenges?",
      default: defaultOptions.installLocation,
      validate: (value: string) => fs.lstatSync(value).isDirectory() 
      ,
    });
  }

  const answers = await inquirer.prompt(questions, cliAnswers);

  if (JSON.stringify(userState) !== JSON.stringify(answers)) {
    // Save the new state
    setUserState(answers);
  }

  return answers;
}
