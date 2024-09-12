import { execa } from "execa";
import ncp from "ncp";
import path from "path";
import fs from "fs";

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
    console.log("Dependencies installed successfully.");
    console.log("");
    console.log(`Now open this repository in your favorite code editor and look at the readme for instructions: ${targetDir}`);
}

const setupBaseRepo = async (targetDir: string) => {
    console.log("Cloning base repository...");
    const { failed: cloneFailed } = await execa("git", ["clone", "--branch", branch, "--single-branch", "--recurse-submodules", "-j8", repo, targetDir]);
    if (cloneFailed) {
        console.log("Failed to clone base repository.");
        return;
    }
    console.log("Base repository cloned successfully.");
    console.log("Checking out commit...");
    const { failed: checkoutFailed } = await execa("git", ["checkout", commit], { cwd: targetDir });
    if (checkoutFailed) {
        console.log("Failed to checkout commit.");
        return;
    }
    // Remove any files that are not needed
    for (const file of filesToRemove) {
        await execa("rm", [path.join(targetDir, file)]);
    }
    // // Update the package.json file to install forge deps on postinstall
    // const packageJson = fs.readFileSync(path.join(targetDir, "package.json"), "utf8");
    // const updatedPackageJson = packageJson.replace("husky install", "husky install && forge install --root packages/foundry");
    // fs.writeFileSync(path.join(targetDir, "package.json"), updatedPackageJson);

    console.log("Base repository is ready for merging challenge");
}

const mergeChallenge = async (challengeRepo: string, name: string, targetDir: string) => {
    console.log("Downloading challenge repository...");
    // Copy challenge files to temporary directory
    const tempDir = path.join("temp_" + Math.random().toString(36).substring(2));
    const { failed: copyFailed } = await execa("git", ["clone", "--branch", name, "--single-branch", challengeRepo, tempDir]);
    if (copyFailed) {
        console.log("Failed to copy challenge repository.");
        return;
    }
    console.log("Challenge repository downloaded successfully.");
    console.log("Merging challenge files...");
    // Merge challenge files
    await copy(tempDir, targetDir);
    // Delete temporary directory
    await execa("rm", ["-rf", tempDir]);
    console.log("Challenge files merged successfully.");
}