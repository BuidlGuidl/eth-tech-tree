import inquirer from "inquirer";
import { loadUserState } from "../utils/stateManager";
import { submitChallengeToServer } from "../modules/api";
import chalk from "chalk";

export async function submitChallenge(name: string, contractAddress?: string) {
    const { address: userAddress } = loadUserState();
    if (!contractAddress) {
        // Prompt the user for the contract address
        const questions = [
            {
                type: "input",
                name: "address",
                message: "Completed challenge contract address on Sepolia:",
                validate: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
            },
        ];
        const answers = await inquirer.prompt(questions);
        const { address } = answers;
        contractAddress = address;
    }
    
    console.log("Submitting challenge...");
    console.log("");

    // Send the contract address to the server
    const response = await submitChallengeToServer(userAddress as string, "sepolia", name, contractAddress as string);
    if (response.result) {
        const { passed, failingTests } = response.result;
        if (passed) {
            console.log("Challenge passed tests! Congratulations!");
            // TODO: Update user state and reflect in tree
        } else {
            console.log("Failing tests:", Object.keys(failingTests).length);
            for (const testName in failingTests) {
                console.log(chalk.blue(testName), chalk.red(failingTests[testName].reason));
            }
            console.log("");
            console.log("Challenge failed tests. See output above for details.");
        }
    } else {
        console.log(response.error);
    }
}