import { API_URL } from "../config";

/**
 * Fetch Challenges
 */
export const fetchChallenges = async () => {
  try {
    const response = await fetch(`${API_URL}/challenges`);
    const data = await response.json();
    return data.challenges;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Get User
 */
export const getUser = async (identifier: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${identifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

/**
 * Create User
 */
export const upsertUser = async (userData: { address?: string, ens?: string, deviceInstallLocation: { [device: string]: string } }) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

/**
 * Submit Challenge
 */
export const submitChallengeToServer = async (userAddress: string, challengeName: string, contractAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengeName, contractAddress, userAddress }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

/**
 * Fetch Leaderboard
 */
export const fetchLeaderboard = async () => {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    const data = await response.json();
    return data.leaderboard;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};
