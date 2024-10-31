import { execa } from "execa";
import ncp from "ncp";
import path from "path";
import fs from "fs";
import { createFirstGitCommit } from "../tasks/create-first-git-commit";
import { fetchChallenges } from "../modules/api";
import { loadChallenges } from "../utils/stateManager";
import { IChallenge } from "../types";
import { BASE_REPO, BASE_BRANCH, BASE_COMMIT } from "../config";
import { DefaultRenderer, Listr, ListrTaskWrapper, SimpleRenderer } from "listr2";
import chalk from "chalk";

// Sidestep for ncp issue https://github.com/AvianFlu/ncp/issues/127
const copy = (source: string, destination: string, options?: ncp.Options) => new Promise((resolve, reject) => {
    ncp(source, destination, options || {}, (err) => {
        if (err) {
            reject(err);
        } else {
            setTimeout(resolve, 100);
        }
    });
});

const filesToRemove = [
    "packages/foundry/contracts/YourContract.sol",
    "packages/foundry/script/DeployYourContract.s.sol",
    "packages/foundry/test/YourContract.t.sol"
];

export const setupChallenge = async (name: string, installLocation: string) => {
    let challengeRepo = loadChallenges().find(challenge => challenge.name === name)?.repo;
    if (!challengeRepo) {
        // Fetch challenges from server if not locally available
        const challenges = await fetchChallenges();
        challengeRepo = challenges.find((challenge: IChallenge) => challenge.name === name)?.repo;
    }

    // Check if challenge repository was found
    if (!challengeRepo) {
        console.log("A challenge repository was not found with that name.");
        return;
    }

    // Use environment variable as override if provided
    challengeRepo = process.env.CHALLENGE_REPO || challengeRepo;

    const targetDir = path.join(`${installLocation}/${name}`);
    // Make sure the install location exists
    if (!fs.existsSync(installLocation)) {
        fs.mkdirSync(installLocation);
    }
    // Check for existing repository
    const repoExists = fs.existsSync(targetDir);
    if (repoExists) {
        console.log("Repository already exists, skipping download.");
        return;
    }

    const tasks = new Listr([
        {
            title: 'Setting up base repository',
            task: () => setupBaseRepo(targetDir)
        },
        {
            title: 'Merging challenge files',
            task: () => mergeChallenge(challengeRepo as string, name, targetDir)
        },
        {
            title: 'Installing dependencies',
            task: (_, task) => installPackages(targetDir, task),
            rendererOptions: {
                outputBar: 8,
                persistentOutput: false,
            },
        },
        {
            title: 'Initializing Git repository',
            task: () => createFirstGitCommit(targetDir)
        }
    ]);

    try {
        await tasks.run();
        console.log(chalk.green("Challenge setup completed successfully."));
        console.log("");
        console.log(chalk.cyan(`Now open this repository in your favorite code editor and look at the readme for instructions: ${targetDir}`));
    } catch (error) {
        console.error(chalk.red("An error occurred during challenge setup:"), error);
    }
}

const setupBaseRepo = async (targetDir: string): Promise<void> => {
    await execa("git", ["clone", "--branch", BASE_BRANCH, "--single-branch", BASE_REPO, targetDir]);
    await execa("git", ["checkout", BASE_COMMIT], { cwd: targetDir });
    for (const file of filesToRemove) {
        await execa("rm", [path.join(targetDir, file)]);
    }
}

const mergeChallenge = async (challengeRepo: string, name: string, targetDir: string): Promise<void> => {
    const tempDir = path.join("temp_" + Math.random().toString(36).substring(2));
    await execa("git", ["clone", "--branch", name, "--single-branch", challengeRepo, tempDir]);
    await copy(tempDir, targetDir);
    await execa("rm", ["-rf", tempDir]);
    const readmePath = path.join(targetDir, "README.md");
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const modifiedReadme = readmeContent
        .replace("@@TOP_CONTENT@@", README_CONTENT.TOP_CONTENT)
        .replace("@@BOTTOM_CONTENT@@", README_CONTENT.BOTTOM_CONTENT);
    fs.writeFileSync(readmePath, modifiedReadme);
}

const installPackages = async (targetDir: string, task: ListrTaskWrapper<any, typeof DefaultRenderer, typeof SimpleRenderer>): Promise<void> => {
    const execute = execa("yarn", ["install"], { cwd: targetDir });
    let outputBuffer: string = "";

    const chunkSize = 1024;
    execute?.stdout?.on("data", (data: Buffer) => {
        outputBuffer += data.toString();

        if (outputBuffer.length > chunkSize) {
            outputBuffer = outputBuffer.slice(-1 * chunkSize);
        }

        const visibleOutput =
            outputBuffer
                .match(new RegExp(`.{1,${chunkSize}}`, "g"))
                ?.slice(-1)
                .map(chunk => chunk.trimEnd() + "\n")
                .join("") ?? outputBuffer;

        task.output = visibleOutput;
        if (visibleOutput.includes("Link step")) {
            task.output = chalk.yellow(`starting link step, this might take a little time...`);
        }
    });

    execute?.stderr?.on("data", (data: Buffer) => {
        outputBuffer += data.toString();

        if (outputBuffer.length > chunkSize) {
            outputBuffer = outputBuffer.slice(-1 * chunkSize);
        }

        const visibleOutput =
            outputBuffer
                .match(new RegExp(`.{1,${chunkSize}}`, "g"))
                ?.slice(-1)
                .map(chunk => chunk.trimEnd() + "\n")
                .join("") ?? outputBuffer;

        task.output = visibleOutput;
    });

    await execute;
};

const README_CONTENT = {
    TOP_CONTENT: `## Contents
- [Requirements](#requirements)
- [Start Here](#start-here)
- [Challenge Description](#challenge-description)
- [Testing Your Progress](#testing-your-progress)
- [Solved! (Final Steps)](#solved-final-steps)

## Requirements
Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Foundryup](https://book.getfoundry.sh/getting-started/installation)

__For Windows users we highly recommend using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) or Git Bash as your terminal app.__

## Start Here
Run the following commands in your terminal:
\`\`\`bash
  yarn install
  foundryup
\`\`\``,
    BOTTOM_CONTENT: `## Testing Your Progress
Use your skills to build out the above requirements in whatever way you choose. You are encouraged to run tests periodically to visualize your progress.

Run tests using \`yarn foundry:test\` to run a set of tests against the contract code. Initially you will see build errors but as you complete the requirements you will start to pass tests. If you struggle to understand why some tests are returning errors then you might find it useful to run the command with the extra logging verbosity flag \`-vvvv\` (\`yarn foundry:test -vvvv\`) as this will show you very detailed information about where tests are failing. Learn how to read the traces [here](https://book.getfoundry.sh/forge/traces). You can also use the \`--match-test "TestName"\` flag to only run a single test. Of course you can chain both to include a higher verbosity and only run a specific test by including both flags \`yarn foundry:test -vvvv --match-test "TestName"\`. You will also see we have included an import of \`console2.sol\` which allows you to use \`console.log()\` type functionality inside your contracts to know what a value is at a specific time of execution. You can read more about how to use that at [FoundryBook](https://book.getfoundry.sh/reference/forge-std/console-log).

For a more "hands on" approach you can try testing your contract with the provided front end interface by running the following:
\`\`\`bash
  yarn chain
\`\`\`
in a second terminal deploy your contract:
\`\`\`bash
  yarn deploy
\`\`\`
in a third terminal start the NextJS front end:
\`\`\`bash
  yarn start
\`\`\`

## Solved! (Final Steps)
Once you have a working solution and all the tests are passing your next move is to deploy your lovely contract to the Sepolia testnet.
First you will need to generate an account. **You can skip this step if you have already created a keystore on your machine. Keystores are located in \`~/.foundry/keystores\`**
\`\`\`bash
  yarn account:generate
\`\`\`
You can optionally give your new account a name be passing it in like so: \`yarn account:generate NAME-FOR-ACCOUNT\`. The default is \`scaffold-eth-custom\`.

You will be prompted for a password to encrypt your newly created keystore. Make sure you choose a [good one](https://xkcd.com/936/) if you intend to use your new account for more than testnet funds.

Now you need to update \`packages/foundry/.env\` so that \`ETH_KEYSTORE_ACCOUNT\` = your new account name ("scaffold-eth-custom" if you didn't specify otherwise).

Now you are ready to send some testnet funds to your new account.
Run the following to view your new address and balances across several networks.
\`\`\`bash
  yarn account
\`\`\`
To fund your account with Sepolia ETH simply search for "Sepolia testnet faucet" on Google or ask around in onchain developer groups who are usually more than willing to share. Send the funds to your wallet address and run \`yarn account\` again to verify the funds show in your Sepolia balance.

Once you have confirmed your balance on Sepolia you can run this command to deploy your contract.
\`\`\`bash
  yarn deploy:verify --network sepolia
\`\`\`
This command will deploy your contract and verify it with Sepolia Etherscan.
Copy your deployed contract address from your console and paste it in at [sepolia.etherscan.io](https://sepolia.etherscan.io). You should see a green checkmark on the "Contract" tab showing that the source code has been verified.

Now you can return to the ETH Tech Tree CLI, navigate to this challenge in the tree and submit your deployed contract address. Congratulations!`
}