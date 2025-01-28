import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import semver, { Range } from 'semver';

type RequiredDependency = "node" | "git" | "yarn" | "foundryup";

export const setupChallenge = async (name: string, installLocation: string) => {
    checkUserDependencies();

    const challengeRepo = process.env.CHALLENGE_REPO || "BuidlGuidl/eth-tech-tree-challenges";

    // Create install location if it doesn't exist
    fs.mkdirSync(installLocation, { recursive: true });

    const extensionName = `${challengeRepo}:${name}-extension`;
    const challengeDir = `${installLocation}/${name}`;
    try {
        await execa("create-eth", ["-e", extensionName, challengeDir], { stdio: "inherit" });
        console.clear();
        console.log(chalk.green("Challenge setup completed successfully.\n"));
        console.log(chalk.cyan(`Now open this repository in your favorite code editor and look at the readme for instructions:\n${challengeDir}`));
    } catch (e) {
        console.error(`Failed to create challenge: ${name}, \n${e}`);
    }    
}

const checkDependencyInstalled = async (name: RequiredDependency) => {
    try {
        await execa(name, ["--help"]);
    } catch(_) {
        throw new Error(`${name} is required. Please install to continue.`);
    }
}

const checkDependencyVersion = async (name: RequiredDependency, requiredVersion: string | Range) => {
    try {
        const userVersion = (await execa(name, ["--version"])).stdout;
        if (!semver.satisfies(userVersion, requiredVersion)) {
            throw new Error(`${name} version requirement of ${requiredVersion} not met. Please update to continue.`);
        }
    } catch(_) {
        throw new Error(`${name} ${requiredVersion} is required. Please install to continue.`);
    }
}

export const checkUserDependencies = async () => {
    await Promise.all([
        checkDependencyVersion("node", ">=18.17.0"),
        checkDependencyInstalled("git"),
        checkDependencyInstalled("yarn"),
        checkDependencyInstalled("foundryup"),
    ])
}


