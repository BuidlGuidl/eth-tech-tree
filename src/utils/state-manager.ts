import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import { IChallenge, IUser } from '../types';

const writeFile = promisify(fs.writeFile);

export function getConfigPath(): string {
  return path.join(os.homedir(), '.eth-tech-tree', 'config');
}

function getLegacyConfigPath(): string {
  return path.join(process.cwd(), "storage");
}

function ensureConfigExists(): void {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }
}

function migrateLegacyConfig(): void {
  const legacyPath = getLegacyConfigPath();
  const newPath = getConfigPath();
  
  if (fs.existsSync(legacyPath)) {
    ensureConfigExists();
    
    let migratedAnyFiles = false;
    
    // Migrate user.json if it exists
    const legacyUserFile = path.join(legacyPath, "user.json");
    const newUserFile = path.join(newPath, "user.json");
    if (fs.existsSync(legacyUserFile) && !fs.existsSync(newUserFile)) {
      fs.copyFileSync(legacyUserFile, newUserFile);
      fs.unlinkSync(legacyUserFile);
      console.log("Migrated user config from local storage to home directory");
      migratedAnyFiles = true;
    }
    
    // Migrate challenges.json if it exists
    const legacyChallengesFile = path.join(legacyPath, "challenges.json");
    const newChallengesFile = path.join(newPath, "challenges.json");
    if (fs.existsSync(legacyChallengesFile) && !fs.existsSync(newChallengesFile)) {
      fs.copyFileSync(legacyChallengesFile, newChallengesFile);
      fs.unlinkSync(legacyChallengesFile);
      console.log("Migrated challenges config from local storage to home directory");
      migratedAnyFiles = true;
    }
    
    // Remove the legacy directory if it's empty after migration
    if (migratedAnyFiles) {
      try {
        const remainingFiles = fs.readdirSync(legacyPath);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(legacyPath);
          console.log("Removed legacy storage directory");
        }
      } catch (error) {
        // Ignore errors when trying to remove the directory
        // (it might not be empty or we might not have permissions)
      }
    }
  }
}

function loadConfigWithMigration<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(getConfigPath(), filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      migrateLegacyConfig();

      try {
        const filePath = path.join(getConfigPath(), filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      } catch (migrationError: any) {
        if (migrationError.code === 'ENOENT') {
          return defaultValue; // Return default value if file doesn't exist even after migration
        }
        throw migrationError;
      }
    }
    throw error;
  }
}

export async function saveUserState(state: IUser) {
  ensureConfigExists();
  const filePath = path.join(getConfigPath(), "user.json");
  await writeFile(filePath, JSON.stringify(state, null, 2));
}

export function loadUserState(): IUser {
  return loadConfigWithMigration("user.json", {} as IUser);
}

export async function saveChallenges(challenges: IChallenge[]) {
  ensureConfigExists();
  const filePath = path.join(getConfigPath(), "challenges.json");
  await writeFile(filePath, JSON.stringify(challenges, null, 2));
}

export function loadChallenges(): IChallenge[] {
  return loadConfigWithMigration("challenges.json", []);
}
