import { CommandOptions } from "./parse-command-arguments-and-options";
import { removeStorage, setupChallenge, submitChallenge } from "../actions";
import { version } from '../../package.json'

export async function handleCommand(commands: CommandOptions) {
    const { command, installLocation, challenge, contractAddress, dev, help } = commands;
    if (help) {
        // TODO: Show help menu based on command
        console.log("Help menu not implemented yet 🙃");
        return;
    }
    
    if (command === 'version') {
        console.log(version)
        return
    }

    if (command === "setup") {
        await setupChallenge(challenge as string, installLocation as string);
    }

    if (command === "submit") {
        await submitChallenge(challenge as string, contractAddress as string);
    }

    if (command === "reset") {
        // Delete the storage files
        removeStorage();
    }

}