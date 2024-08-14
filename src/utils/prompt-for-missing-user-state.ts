import fs from "fs";
import { createUser } from "../modules/api";
import {
  UserState
} from "../types";
import inquirer from "inquirer";
import { saveUserState } from "./stateManager";

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
  const body: { address?: string, ens?: string } = {};
  if (isValidAddress(answers.address)) {
    body["address"] = answers.address;
  } else {
    body["ens"] = answers.address;
  }
  // TODO: handle no returned data (no connection or error)
  const user = await createUser(body);
  const newState = { ...answers, ...user };
  if (JSON.stringify(userState) !== JSON.stringify(newState)) {
    // Save the new state locally
    saveUserState(newState);
  }

  return newState;
}

const isValidAddress = (value: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
};

const isValidAddressOrENS = (value: string): boolean => {
  return /^(0x[a-fA-F0-9]{40}|.+\.eth)$/.test(value);
};
