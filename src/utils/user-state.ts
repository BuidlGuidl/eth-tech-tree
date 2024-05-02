import fs from "fs";

export function getUserState() {
    const exists = fs.existsSync('.state');
    if (!exists) {
        return {};
    }
    
    return JSON.parse(fs.readFileSync('.state', 'utf8'));
}

export function setUserState(state: any) {
    fs.writeFileSync('.state', JSON.stringify(state), 'utf8');
}