import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import { IChallenge, IUser } from '../types';

const writeFile = promisify(fs.writeFile);

export function getConfigPath(): string {
  return path.join(os.homedir(), '.eth-tech-tree', 'config');
}

function ensureConfigExists(): void {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }
}

export async function saveUserState(state: IUser) {
  ensureConfigExists();
  const filePath = path.join(getConfigPath(), "user.json");
  await writeFile(filePath, JSON.stringify(state, null, 2));
}

export function loadUserState(): IUser {
  try {
    const filePath = path.join(getConfigPath(), "user.json");
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as IUser;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {} as IUser; // Return empty object if file doesn't exist
    }
    throw error;
  }
}

export async function saveChallenges(challenges: IChallenge[]) {
  ensureConfigExists();
  const filePath = path.join(getConfigPath(), "challenges.json");
  await writeFile(filePath, JSON.stringify(challenges, null, 2));
}

export function loadChallenges(): IChallenge[] {
  try {
    const filePath = path.join(getConfigPath(), "challenges.json");
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}
