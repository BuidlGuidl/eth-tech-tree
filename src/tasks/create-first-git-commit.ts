import { execa } from "execa";
import path from "path";

const foundryLibraries = ["foundry-rs/forge-std", "OpenZeppelin/openzeppelin-contracts", "gnsps/solidity-bytes-utils"];

export async function createFirstGitCommit(targetDir: string) {
  try {
    // Remove remote
    await execa("git", ["remote", "remove", "origin"], { cwd: targetDir });
    // Add and commit all changes
    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa("git", ["commit", "-m", "Initial commit with 🏗️ Scaffold-ETH 2", "--no-verify"], { cwd: targetDir });
    const foundryWorkSpacePath = path.resolve(targetDir, "packages", "foundry");
    // remove lib directory since it doesn't like directories to exist when installing
    await execa("rm",["-rf", "lib"], { cwd: foundryWorkSpacePath });
    // forge install foundry libraries
    await execa("forge", ["install", ...foundryLibraries, "--no-commit"], { cwd: foundryWorkSpacePath });
    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa("git", ["commit", "--amend", "--no-edit"], { cwd: targetDir });
  } catch (e: any) {
    // cast error as ExecaError to get stderr
    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}