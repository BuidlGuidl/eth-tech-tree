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