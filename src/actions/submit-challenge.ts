import inquirer from "inquirer";
import { loadUserState } from "../utils/stateManager";
import { submitChallengeToServer } from "../modules/api";

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
    // Send the contract address to the server
    const response = await submitChallengeToServer(userAddress as string, "sepolia", name, contractAddress as string);
    if (response.passed) {
        console.log("Challenge submitted successfully!");
    } else {
        console.log(response.error);
    }
}