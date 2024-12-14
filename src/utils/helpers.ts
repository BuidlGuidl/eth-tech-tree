import os from "os";
import fs from "fs";
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

export const isValidAddress = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value)
};
  
export const isValidAddressOrENS = (value: string): boolean => {
    return /^(0x[a-fA-F0-9]{40}|.+\.eth)$/.test(value);
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