import { execa } from "execa";
import ncp from "ncp";
import path from "path";
import fs from "fs";
import { createFirstGitCommit } from "./create-first-git-commit";

// Sidestep for ncp issue https://github.com/AvianFlu/ncp/issues/127
const copy = (source: string, destination: string, options?: ncp.Options) => new Promise((resolve, reject) => {
    ncp(source, destination, options || {}, (err) => {
        if (err) {
            reject(err);
        } else {
            setTimeout(resolve, 10);
        }
    });
});

const repo = process.env.BASE_REPO || "https://github.com/scaffold-eth/scaffold-eth-2.git";
const branch = process.env.BASE_BRANCH || "foundry";
const commit = process.env.BASE_COMMIT || "f079ac706b29d18740c79ff0c78f82c3bd7cd385";

const filesToRemove = [
    "packages/foundry/contracts/YourContract.sol",
    "packages/foundry/script/00_deploy_your_contract.s.sol",
    "packages/foundry/test/YourContract.t.sol"
];

export const setupChallenge = async (challengeRepo: string, name: string, installLocation: string) => {
    // TEMP: Hardcoded values for testing
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

    console.log("Downloading challenge...");
    // Setup base repository
    await setupBaseRepo(targetDir);

    // Merge challenge files into base repository
    await mergeChallenge(challengeRepo, name, targetDir);

    // Install dependencies
    console.log("Installing dependencies...");
    // Would be better to display loading bar here...
    const { failed: installFailedFailed } = await execa("yarn", ["install"], { cwd: targetDir });
    if (installFailedFailed) {
        console.log("Failed to install dependencies.");
        return;
    }
    await createFirstGitCommit(targetDir);
    console.log("Dependencies installed successfully.");
    console.log("");
    console.log(`Now open this repository in your favorite code editor and look at the readme for instructions: ${targetDir}`);
}

const setupBaseRepo = async (targetDir: string) => {
    // Clone base repository
    const { failed: cloneFailed } = await execa("git", ["clone", "--branch", branch, "--single-branch", /*"--recurse-submodules", "-j8",*/ repo, targetDir]);
    if (cloneFailed) {
        console.log("Failed to clone base repository.");
        return;
    }
    // Checkout specific commit
    const { failed: checkoutFailed } = await execa("git", ["checkout", commit], { cwd: targetDir });
    if (checkoutFailed) {
        console.log("Failed to checkout commit.");
        return;
    }
    // Remove any files that are not needed
    for (const file of filesToRemove) {
        await execa("rm", [path.join(targetDir, file)]);
    }
}

const mergeChallenge = async (challengeRepo: string, name: string, targetDir: string) => {
    // Copy challenge files to temporary directory
    const tempDir = path.join("temp_" + Math.random().toString(36).substring(2));
    const { failed: copyFailed } = await execa("git", ["clone", "--branch", name, "--single-branch", challengeRepo, tempDir]);
    if (copyFailed) {
        console.log("Failed to copy challenge repository.");
        return;
    }
    // Merge challenge files
    await copy(tempDir, targetDir);
    // Delete temporary directory
    await execa("rm", ["-rf", tempDir]);
    // Fill in README
    const readmePath = path.join(targetDir, "README.md");
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const modifiedReadme = readmeContent
        .replace("@@TOP_CONTENT@@", README_CONTENT.TOP_CONTENT)
        .replace("@@BOTTOM_CONTENT@@", README_CONTENT.BOTTOM_CONTENT);
    fs.writeFileSync(readmePath, modifiedReadme);
}

const README_CONTENT = {
    TOP_CONTENT: `## Contents
- [Requirements](#requirements)
- [Start Here](#start-here)
- [Challenge Description](#challenge-description)
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
    BOTTOM_CONTENT: `**Don't change any existing method names** as it will break tests but feel free to add additional methods if it helps you complete the task.

Start by using \`yarn foundry:test\` to run a set of tests against the contract code. You will see several failing tests. As you add functionality to the contract, periodically run the tests so you can see your progress and address blind spots. If you struggle to understand why some are returning errors then you might find it useful to run the command with the extra logging verbosity flag \`-vvvv\` (\`yarn foundry:test -vvvv\`) as this will show you very detailed information about where tests are failing. Learn how to read the traces [here](https://book.getfoundry.sh/forge/traces). You can also use the \`--match-test "TestName"\` flag to only run a single test. Of course you can chain both to include a higher verbosity and only run a specific test by including both flags \`yarn foundry:test -vvvv --match-test "TestName"\`. You will also see we have included an import of \`console2.sol\` which allows you to use \`console.log()\` type functionality inside your contracts to know what a value is at a specific time of execution. You can read more about how to use that at [FoundryBook](https://book.getfoundry.sh/reference/forge-std/console-log).

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