import { loadUserState } from "../utils/state-manager";
import { submitChallengeToServer } from "../modules/api";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { isValidAddress } from "../utils/helpers";

export async function submitChallenge(name: string, contractAddress?: string) {
    const { address: userAddress } = loadUserState();
    if (!contractAddress) {
        // Prompt the user for the contract address
        const question = {
            message: "What is the contract address of your completed challenge?:",
            validate: (value: string) => isValidAddress(value) ? true : "Please enter a valid contract address",
        };
        const answer = await input(question);
        contractAddress = answer;
    }
    
    console.log("Submitting challenge...");
    console.log("");

    // Send the contract address to the server
    const response = await submitChallengeToServer(userAddress as string, name, contractAddress as string);
    if (response.result) {
        const { passed, failingTests, error } = response.result;
        if (passed) {
            console.log("Challenge passed tests! Congratulations!");
        } else {
            if (error) {
                console.log("The testing server encountered an error when running this test:");
                console.log(chalk.red(error));
            }
            console.log("Failing tests:", Object.keys(failingTests).length);
            for (const testName in failingTests) {
                console.log(chalk.blueBright(testName), chalk.red(failingTests[testName].reason));
            }
            console.log("");
            console.log("Challenge failed tests. See output above for details.");
        }
    } else {
        console.log(response.error);
    }
}
