import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { IChallenge, UserState } from '../types';

export function saveUserState(state: UserState) {
  const configPath = path.join(process.cwd(), "storage");
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }
  const filePath = path.join(configPath, "user.json");
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function loadUserState(): UserState {
  try {
    const configPath = path.join(process.cwd(), "storage", `user.json`);
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data) as UserState;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {} as UserState; // Return empty object if file doesn't exist
    }
    throw error;
  }
}

export async function saveChallenges(challenges: IChallenge[]) {
  const configPath = path.join(process.cwd(), "storage");

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }
  const filePath = path.join(configPath, "challenges.json");
  await fsPromises.writeFile(filePath, JSON.stringify(challenges, null, 2));
}

export function loadChallenges(): IChallenge[] {
  try {
    const configPath = path.join(process.cwd(), "storage", `challenges.json`);
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}
