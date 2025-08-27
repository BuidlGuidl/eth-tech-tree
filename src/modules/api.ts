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
export const submitChallengeToServer = async (userAddress: string, challengeName: string, contractAddress: string, signature: string) => {
  try {
    const response = await fetch(`${API_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengeName, contractAddress, userAddress, signature }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

/**
 * Get address from ENS name
 */
export const getEnsAddress = async (ensName: string) => {
  try {
    const response = await fetch(`${API_URL}/ens/${ensName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { valid: false, error: 'Network error' };
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

/**
 * Get Authentication Message
 */
export const getAuthMessage = async (userAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/message/${userAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error fetching auth message:', error);
    throw error;
  }
};
