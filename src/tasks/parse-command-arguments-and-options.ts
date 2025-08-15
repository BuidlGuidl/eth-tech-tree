import arg from "arg";
import { IUser } from "../types";
import fs from "fs";
import { search, input } from "@inquirer/prompts";
import { isValidAddress, searchChallenges } from "../utils/helpers";
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

export type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
};

type SearchOptions = {
  type: "search";
  name: string;
  message: string;
  source: (term: string | undefined) => Promise<Choice<string>[]>;
}

type InputOptions = {
  type: "input";
  name: string;
  message: string;
  validate: (value: string) => string | true;
}

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
        "--version": Boolean,
        "-v": "--version"
      },
      {
        argv: args,
      },
    );
  
    const dev = parsedArgs["--dev"] ?? false; // info: use false avoid asking user
  
    const help = parsedArgs["--help"] ?? parsedArgs._[0] === 'help' ?? false;

    const version = parsedArgs["--version"] ?? parsedArgs._[0] === 'version' ?? false;

    // Determine command, supporting patterns like:
    // - "setup --help" -> help=true, command="setup"
    // - "help setup" -> help=true, command="setup"
    // - "version" or "-v/--version" -> command="version"
    let command: string | null = null;
    if (version) {
      command = 'version';
    } else if (help && parsedArgs._[0] === 'help') {
      command = parsedArgs._[1] ?? null;
    } else {
      command = parsedArgs._[0] ?? null;
    }

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
  const questions = [];

  const { command, challenge, contractAddress } = commands;
  let { installLocation } = commands;
  if (!installLocation) {
    installLocation = userState.installLocation;
  }

  if (command === "setup") {
    if (!challenge) {
      questions.push({
        type: "search",
        name: "challenge",
        message: "Which challenge would you like to setup?",
        source: searchChallenges
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
    await promptForMissingUserState(userState, true);

    if (!challenge) {
      questions.push({
        type: "search",
        name: "challenge",
        message: "Which challenge would you like to submit?",
        source: searchChallenges
      });
    }
    if (!contractAddress) {
      questions.push({
        type: "input",
        name: "contractAddress",
        message: "What is the contract address of your completed challenge?",
        validate: (value: string) => isValidAddress(value) ? true : "Please enter a valid contract address",
      });
    }
  }
  const answers: Record<string, string> = {};
  for (const question of questions) {
    if (question.type === "search") {
      const answer = await search(question as unknown as SearchOptions);
      answers[question.name] = answer;
    } else if (question.type === "input") {
      const answer = await input(question as InputOptions);
      answers[question.name] = answer;
    }
  }

  return {
    ...commands,
    ...{ installLocation },
    ...answers,
  };
}