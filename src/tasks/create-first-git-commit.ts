import { execa } from "execa";
import path from "path";

const foundryLibraries = ["foundry-rs/forge-std", "OpenZeppelin/openzeppelin-contracts", "gnsps/solidity-bytes-utils"];

export async function createFirstGitCommit(targetDir: string) {
  let errorLog = "";
  try {
    const foundryWorkSpacePath = path.resolve(targetDir, "packages", "foundry");

    errorLog = "Removing lib directory";
    // remove lib directory since it doesn't like directories to exist when installing
    await execa("rm",["-rf", "lib"], { cwd: foundryWorkSpacePath });

    errorLog = "Installing forge dependencies";
    // forge install foundry libraries
    await execa("forge", ["install", ...foundryLibraries, "--no-git"], { cwd: foundryWorkSpacePath });

    errorLog = "git add -A";
    // Add and commit all changes
    await execa("git", ["add", "-A"], { cwd: targetDir });

    errorLog = "git commit  -m 'Initial commit with 🏗️ Scaffold-ETH 2'";
    await execa("git", ["commit", "-m", "Initial commit with 🏗️ Scaffold-ETH 2", "--no-verify"], { cwd: targetDir });
    
    errorLog = "git remote remove origin";
    // Remove remote
    await execa("git", ["remote", "remove", "origin"], { cwd: targetDir });
  } catch (e: any) {
    // cast error as ExecaError to get stderr
    throw new Error(`Failed to initialize git repository after step: ${errorLog}`, {
      cause: e?.stderr ?? e,
    });
  }
}