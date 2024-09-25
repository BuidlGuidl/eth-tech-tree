import inquirer from "inquirer";

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

export const isValidAddress = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value)
  };
  
export const isValidAddressOrENS = (value: string): boolean => {
    return /^(0x[a-fA-F0-9]{40}|.+\.eth)$/.test(value);
  };