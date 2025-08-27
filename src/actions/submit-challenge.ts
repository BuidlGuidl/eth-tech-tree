import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { getAuthMessage, submitChallengeToServer } from "../modules/api";
import { isValidAddress } from "../utils/helpers";
import { requestSignature } from "../utils/request-signature";
import { loadUserState } from "../utils/state-manager";

async function requestSignatureWithRetry(authMessage: string): Promise<string> {
    console.log("Requesting signature...");
    
    let signature: string | undefined;
    let err: string | undefined;
    
    do {
        if (err) {
            
            console.log(chalk.red(`User rejected request. Signature is required to submit.`));
            const tryAgain = await confirm({
                message: "Would you like to try signing again?",
                default: true
            });
            
            if (!tryAgain) {
                console.log("Signature request cancelled.");
                throw new Error("Signature request cancelled by user");
            }
            
            process.stdout.write("\x1b[2A\x1b[0J");
        }
        
        const { data, error } = await requestSignature(authMessage);
        signature = data;
        err = error;
    } while (err);
    
    if (!signature) {
        throw new Error("Failed to get signature after all attempts.");
    }
    
    console.log("✅ Signature received!");
    return signature;
}

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

    const authMessage = await getAuthMessage(userAddress as string);
    const signature = await requestSignatureWithRetry(authMessage);

    console.log("Submitting challenge...");
    console.log("");

    // Send the contract address to the server
    const response = await submitChallengeToServer(userAddress as string, name, contractAddress as string, signature);
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
