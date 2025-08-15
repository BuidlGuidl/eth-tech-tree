import fs from "fs";
import { getConfigPath } from "../utils/state-manager";

export function removeStorage() {
    console.log("Resetting storage...");
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
        console.log("Storage does not exist. Nothing to reset.");
        return;
    }
    fs.rmSync(configPath, { recursive: true });
    console.log("Storage reset successfully.");
}