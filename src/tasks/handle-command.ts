import { CommandOptions } from "./parse-command-arguments-and-options";
import { removeStorage, setupChallenge, submitChallenge } from "../actions";
import { version } from '../../package.json'

function renderGlobalHelp() {
    const text = [
        "Usage:",
        "  eth-tech-tree                            Launch interactive UI",
        "  eth-tech-tree [command] [options]",
        "  eth-tech-tree help [command]",
        "",
        "Commands:",
        "  setup <challenge> <installLocation>   Set up a challenge locally",
        "  submit <challenge> <contractAddress>  Submit your deployed contract address",
        "  reset                                  Clear local CLI state",
        "  version                                Show CLI version",
        "  help                                   Show help (add a command for details)",
        "",
        "Interactive mode:",
        "  Running without a command opens a graphical menu to browse challenges,",
        "  set them up, submit completions, and view the leaderboard.",
        "",
        "Options:",
        "  -h, --help                             Show help for a command",
        "  --dev                                  Developer mode",
        "",
        "Examples:",
        "  eth-tech-tree                        # interactive UI",
        "  eth-tech-tree setup multisend ./challenges",
        "  eth-tech-tree submit multisend 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        "  eth-tech-tree reset",
        "  eth-tech-tree version",
        "  eth-tech-tree help setup",
    ].join('\n');
    console.log(text);
}

function renderCommandHelp(command: string) {
    switch (command) {
        case 'setup': {
            console.log([
                "Usage:",
                "  eth-tech-tree setup <challenge> <installLocation>",
                "",
                "Description:",
                "  Downloads and prepares the selected challenge in the given directory.",
                "",
                "Arguments:",
                "  <challenge>         Challenge identifier (use interactive UI if omitted in normal mode)",
                "  <installLocation>   Directory path where challenges should be installed",
                "",
                "Examples:",
                "  eth-tech-tree setup multisend ./challenges",
            ].join('\n'));
            return;
        }
        case 'submit': {
            console.log([
                "Usage:",
                "  eth-tech-tree submit <challenge> <contractAddress>",
                "",
                "Description:",
                "  Submits your deployed contract address for validation.",
                "",
                "Arguments:",
                "  <challenge>         Challenge identifier",
                "  <contractAddress>   EVM contract address (0x...)",
                "",
                "Examples:",
                "  eth-tech-tree submit multisend 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
            ].join('\n'));
            return;
        }
        case 'reset': {
            console.log([
                "Usage:",
                "  eth-tech-tree reset",
                "",
                "Description:",
                "  Clears local CLI state and cached data.",
            ].join('\n'));
            return;
        }
        case 'version': {
            console.log("Usage:\n  eth-tech-tree version\n\nDescription:\n  Prints the CLI version.");
            return;
        }
        default: {
            renderGlobalHelp();
            return;
        }
    }
}

export async function handleCommand(commands: CommandOptions) {
    const { command, installLocation, challenge, contractAddress, dev, help } = commands;
    if (help) {
        if (!command) {
            renderGlobalHelp();
            return;
        }
        renderCommandHelp(command);
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
