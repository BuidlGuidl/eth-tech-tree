const api_url = process.env.API_URL || "http://localhost:3000" ||"https://eth-tech-tree-backend-production.up.railway.app";

/**
 * Fetch Challenges
 */
export const fetchChallenges = async () => {
  try {
    const response = await fetch(`${api_url}/challenges`);
    const data = await response.json();
    return data.challenges;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Create User
 */
export const createUser = async (userData: { address?: string, ens?: string }) => {
  try {
    const response = await fetch(`${api_url}/user`, {
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
export const submitChallengeToServer = async (userAddress: string, network: string, challengeName: string, contractAddress: string) => {
  try {
    const response = await fetch(`${api_url}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengeName, contractAddress, network, userAddress }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};