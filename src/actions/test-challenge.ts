import fs from "fs";
import { execa } from "execa";

export async function testChallenge(name: string) {
    console.log("Running tests on challenge...");
    const targetDir = `challenges/${name}`;
    // Check if challenge exists
    if (!fs.existsSync(targetDir)) {
        console.log("Challenge does not exist. Please setup the challenge first.");
        return;
    }
    // Install dependencies and run tests
    const { failed: installFailed } = await execa("yarn", ["install"], { cwd: targetDir });
    if (installFailed) {
        console.log("Failed to install dependencies.");
        return;
    }

    try {
        await execa("yarn", ["run", "foundry:test"], { cwd: targetDir, all: true }).pipeAll!(process.stdout);
    } catch (error) {
        console.log("");
        console.log("Challenge does not pass tests. Examine the output above and try again when you have fixed the issues.");
        return;
    }
    console.log("");
    console.log("Challenge passed the tests! Great work! Now deploy your contract.");
}