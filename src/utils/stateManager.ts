import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { IChallenge, IUser } from '../types';

const writeFile = promisify(fs.writeFile);

export async function saveUserState(state: IUser) {
  const configPath = path.join(process.cwd(), "storage");
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }
  const filePath = path.join(configPath, "user.json");
  await writeFile(filePath, JSON.stringify(state, null, 2));
}

export function loadUserState(): IUser {
  try {
    const configPath = path.join(process.cwd(), "storage", `user.json`);
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data) as IUser;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {} as IUser; // Return empty object if file doesn't exist
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
  await writeFile(filePath, JSON.stringify(challenges, null, 2));
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