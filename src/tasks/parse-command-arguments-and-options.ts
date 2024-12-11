import arg from "arg";
import { IUser } from "../types";
import fs from "fs";
import { select, input } from "@inquirer/prompts";
import { isValidAddress } from "../utils/helpers";
import { promptForMissingUserState } from "./prompt-for-missing-user-state";

type Commands = {
  setup: SetupCommand;
  submit: SubmitCommand;
}

type BaseOptions = {
  dev: boolean;
  help: boolean;
};

type SetupCommand = {
  challenge: string | null,
  installLocation: string | null;
}

type SubmitCommand = {
  challenge: string | null;
  contractAddress: string | null;
}

export type CommandOptions = BaseOptions & { command: string | null } & SetupCommand & SubmitCommand;

const commandArguments = {
  setup: {
    1: "challenge",
    2: "installLocation"
  },
  submit: {
    1: "challenge",
    2: "contractAddress"
  }
};

export async function parseCommandArgumentsAndOptions(
    rawArgs: string[],
  ): Promise<CommandOptions> {
    const args = rawArgs.slice(2).map(a => a.toLowerCase());
    const parsedArgs = arg(
      {
        "--dev": Boolean,
        "--help": Boolean,
        "-h": "--help",
      },
      {
        argv: args,
      },
    );
  
    const dev = parsedArgs["--dev"] ?? false; // info: use false avoid asking user
  
    const help = parsedArgs["--help"] ?? parsedArgs._[0] === 'help' ?? false;

    const command = parsedArgs._[0] ?? null;

    const argumentObject: Partial<CommandOptions> = {
      dev,
      help,
      command,
    };

    if (Object.keys(commandArguments).includes(command)) {
      const commandArgs = commandArguments[command as keyof Commands];
      for (const key in commandArgs) {
        const argName: string = commandArgs[Number(key) as keyof typeof commandArgs];
        argumentObject[argName as keyof Partial<SetupCommand & SubmitCommand>] = parsedArgs._[Number(key)] ?? null;
      }
    }
    return argumentObject as CommandOptions;
}

export async function promptForMissingCommandArgs(commands: CommandOptions, userState: IUser): Promise<CommandOptions> {
  const cliAnswers = Object.fromEntries(
    Object.entries(commands).filter(([key, value]) => value !== null)
  );
  const questions = [];

  const { command, challenge, contractAddress } = commands;
  let { installLocation } = commands;
  if (!installLocation) {
    installLocation = userState.installLocation;
  }

  if (command === "setup") {
    if (!challenge) {
      questions.push({
        type: "input",
        name: "challenge",
        message: "Which challenge would you like to setup?",
      });
    }
    if (!installLocation) {
      questions.push({
        type: "input",
        name: "installLocation",
        message: "Where would you like to download the challenges?",
        default: process.cwd() + '/challenges',
        validate: (value: string) => fs.lstatSync(value).isDirectory(),
      });
    }
  }

  if (command === "submit") {
    // Need user state so direct to promptForMissingUserState
    await promptForMissingUserState(userState);

    if (!challenge) {
      questions.push({
        type: "input",
        name: "challenge",
        message: "Which challenge would you like to submit?",
      });
    }
    if (!contractAddress) {
      questions.push({
        type: "input",
        name: "contractAddress",
        message: "What is the deployed contract address?",
        validate: isValidAddress,
      });
    }
  }
  const answers = [];
  for (const question of questions) {
    const answer = await input(question);
    answers.push(answer);
  }

  return {
    ...commands,
    ...{ installLocation },
    ...answers,
  };
}