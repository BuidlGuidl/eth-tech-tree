import inquirer from "inquirer";
import os from "os";
import fs from "fs";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pressEnterToContinue(customMessage?: string) {
    await inquirer.prompt({
        name: 'continue',
        type: 'input',
        message: customMessage || 'Press Enter to continue...',
      });
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