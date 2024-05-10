import fs from "fs";
import crypto from "crypto";
import { execa } from "execa";

export async function submitChallenge(name: string, testFileName: string, testHash: string) {
    console.log("Submitting challenge...");
    const targetDir = `challenges/${name}`;
    // Check hash of test cases to make sure tests haven't been adjusted
    const fileBuffer = fs.readFileSync(`${targetDir}/packages/foundry/test/${testFileName}`);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    const hex = hashSum.digest('hex');
    if (hex !== testHash) {
        console.log("It appears that the test cases have been modified, please revert to the original test cases and run again.");
        return;
    }
    await execa("yarn", ["install"], { cwd: targetDir });
    const { failed } = await execa("yarn", ["run", "foundry:test"], { cwd: targetDir, all: true }).pipeAll!(process.stdout);
    if (failed) {
        console.log("Challenge does not pass tests. Examine the output above and try again when you have fixed the issues.");
        return;
    } else {
        console.log("Challenge passed initial tests! Great work! Submitting to BuidlGuidl for verification...");
        // TODO: Implement submission to BG server
    }
}

export async function setupChallenge(repo: string, name: string, installLocation: string) {
    console.log("Downloading repository...");
    // Make sure the install location exists
    if (!fs.existsSync(installLocation)) {
        fs.mkdirSync(installLocation);
    }
    // Check for existing repository
    const repoExists = fs.existsSync(`${installLocation}/${name}`);
    if (repoExists) {
        console.log("Repository already exists, skipping download.");
        return;
    }
    const { failed } = await execa("git", ["clone", "-b", name, repo as string, `${installLocation}/${name}`], { all: true }).pipeAll!(process.stdout);
    if (!failed) {
        console.log(`Now open this repository in your favorite code editor and look at the readme for instructions: ${installLocation}/${name}`);
    }
}