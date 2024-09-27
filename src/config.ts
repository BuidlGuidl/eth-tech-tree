import dotenv from 'dotenv';
dotenv.config();

export const API_URL = process.env.API_URL || "https://ethdevtechtree.buidlguidl.com";
export const BASE_REPO = process.env.BASE_REPO || "https://github.com/scaffold-eth/scaffold-eth-2.git";
export const BASE_BRANCH = process.env.BASE_BRANCH || "foundry";
export const BASE_COMMIT = process.env.BASE_COMMIT || "a6c259339b2d0930230c0d73009c15a2268f2aea";