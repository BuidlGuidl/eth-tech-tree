import fs from "fs";
import { createUser } from "../modules/api";
import {
  UserState
} from "../types";
import inquirer from "inquirer";
import { saveUserState } from "../utils/stateManager";
import { isValidAddress, isValidAddressOrENS } from "../utils/helpers";

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
      message: "Your wallet address (or ENS):",
      validate: isValidAddressOrENS,
    });
  }
  
  if (!userState.installLocation) {
    questions.push({
      type: "input",
      name: "installLocation",
      message: "Where would you like to download the challenges?",
      default: defaultOptions.installLocation,
      validate: (value: string) => fs.lstatSync(value).isDirectory() 
      ,
    });
  }

  const answers = await inquirer.prompt(questions, cliAnswers);

  // Fetch the user data from the server (create a new user if it doesn't exist) - also handles ens resolution
  const user = await fetchUser(answers.address);
  const newState = { ...answers, ...user };
  if (JSON.stringify(userState) !== JSON.stringify(newState)) {
    // Save the new state locally
    saveUserState(newState);
  }

  return newState;
}

export async function fetchUser(userResponse: string): Promise<UserState> {
  const body: { address?: string, ens?: string } = {};
  if (isValidAddress(userResponse)) {
    body["address"] = userResponse;
  } else {
    body["ens"] = userResponse;
  }
  // TODO: handle no returned data (no connection or error)
  const user = await createUser(body);

  return user;
};
