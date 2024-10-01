import fs from "fs";
import path from "path";

export function removeStorage() {
    console.log("Resetting storage...");
    const configPath = path.join(process.cwd(), "storage");
    if (!fs.existsSync(configPath)) {
        console.log("Storage does not exist. Nothing to reset.");
        return;
    }
    fs.rmSync(configPath, { recursive: true });
    console.log("Storage reset successfully.");
}