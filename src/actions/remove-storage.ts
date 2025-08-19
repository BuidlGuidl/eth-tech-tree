import fs from "fs";
import path from "path";
import { getConfigPath } from "../utils/state-manager";

export function removeStorage() {
    console.log("Resetting storage...");
    
    const configPath = getConfigPath();
    let removedNew = false;
    if (fs.existsSync(configPath)) {
        fs.rmSync(configPath, { recursive: true });
        removedNew = true;
    }
    
    // Remove legacy storage location
    const legacyPath = path.join(process.cwd(), "storage");
    let removedLegacy = false;
    if (fs.existsSync(legacyPath)) {
        fs.rmSync(legacyPath, { recursive: true });
        removedLegacy = true;
    }
    
    if (!removedNew && !removedLegacy) {
        console.log("Storage does not exist. Nothing to reset.");
        return;
    }
    
    console.log("Storage reset successfully.");
}