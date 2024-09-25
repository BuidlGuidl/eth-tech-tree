import dotenv from 'dotenv';
dotenv.config();

export const API_URL = process.env.API_URL || "https://ethdevtechtree.buidlguidl.com";
export const BASE_REPO = process.env.BASE_REPO || "https://github.com/scaffold-eth/scaffold-eth-2.git";
export const BASE_BRANCH = process.env.BASE_BRANCH || "foundry";
export const BASE_COMMIT = process.env.BASE_COMMIT || "f079ac706b29d18740c79ff0c78f82c3bd7cd385";