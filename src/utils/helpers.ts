import fs from "fs";
import os from "os";
import { fetchChallenges, getEnsAddress } from "../modules/api";
import { Choice } from "../tasks/parse-command-arguments-and-options";
import { IChallenge } from "../types";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const checkValidPathOrCreate = async (path: string) => {
  try {
    const exists = fs.lstatSync(path).isDirectory();
    if (!exists) {
      console.log('That path is not a directory');
      return false;
    }
    return true;
  } catch (error) {
    // Try to create the directory
    try {
      fs.mkdirSync(path);
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  }
};

export const isValidEns = async (name: string): Promise<boolean> => {
  try {
    const result = await getEnsAddress(name);
    return result.address !== null;
  } catch (error) {
    console.error('Error validating ENS:', error);
    return false;
  }
};

export const isValidAddress = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value)
};
  
export const isValidAddressOrENS = async (value: string): Promise<string | boolean> => {
  if (value.endsWith('.eth')) {
    return await isValidEns(value) ? true : "Invalid ENS name";
  } else {
    return isValidAddress(value) ? true : "Invalid address";
  }
};

export const getDevice = (): string => {
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  return `${hostname}(${platform}:${arch})`;
}

export const stripAnsi = (text: string): string => {
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

export const calculatePoints = (completedChallenges: Array<{ challenge: IChallenge | undefined, completion: any }>): number => {
  const pointsPerLevel = [100, 150, 225, 300, 400, 500];
  return completedChallenges
      .filter(c => c.challenge)
      .reduce((total, { challenge }) => {
          const points = pointsPerLevel[challenge!.level - 1] || 100;
          return total + points;
      }, 0);
}

export const calculateTotalGasUsed = (completedChallenges: Array<{ challenge: IChallenge | undefined, completion?: { gasReport?: Array<{ functionName: string, gasUsed: number }> } }>): number => {
  return completedChallenges
    .reduce((total, challengeItem) => {
      const gasReport = challengeItem.completion?.gasReport;
      const challengeGasUsed = gasReport?.reduce((challengeTotal: number, report: { functionName: string, gasUsed: number }) => challengeTotal + report.gasUsed, 0) || 0;
      return total + challengeGasUsed;
    }, 0);
}

export const searchChallenges = async (term: string = "") => {
  const challenges = (await fetchChallenges()).filter((challenge: IChallenge) => challenge.enabled);
  const choices = challenges.map((challenge: IChallenge) => ({
      value: challenge.name,
      name: challenge.label,
      description: ""
  }));
  return choices.filter((choice: Choice<string>) => choice.name?.toLowerCase().includes(term.toLowerCase()));
}