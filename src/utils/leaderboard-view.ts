import chalk from "chalk";
import { TreeNode } from "../types";
import { stripAnsi } from "./helpers";

interface LeaderboardEntry {
    address: string;
    ens: string | null;
    challengesCompleted: number;
    points: number;
    totalGasUsed: number;
    rank: number;
}

export class LeaderboardView {
    constructor(private leaderboard: LeaderboardEntry[], private userAddress: string) {
        this.userAddress = userAddress; 
    }

    buildLeaderboardTree(): TreeNode {
        // Create individual entry nodes for each leaderboard position
        const entryNodes: TreeNode[] = this.leaderboard.map(entry => ({
            type: "header",
            label: this.getEntryLabel(entry),
            shortname: entry.ens || entry.address,
            name: `rank-${entry.rank}`,
            children: [],
            message: this.buildEntryMessage(entry)
        }));

        // Create main leaderboard node
        return {
            type: "header",
            label: "Leaderboard",
            name: "leaderboard",
            children: entryNodes,
            message: this.buildLeaderboardMessage()
        };
    }

    private getEntryLabel(entry: LeaderboardEntry): string {
        const identifier = entry.ens || entry.address;
        return chalk.white(`${this.getRankFormatting(entry.rank)}  | ${this.formatSpacing(chalk.yellow(entry.points.toLocaleString()), 8)} | ${this.formatSpacing(chalk.cyan(entry.totalGasUsed.toLocaleString()), 14)} | ${chalk.green(identifier)}`);
    }

    private getRankFormatting(rank: number): string {
        let rankString = rank.toString();
        if (rank === 1) rankString = "🥇 " + rankString;
        if (rank === 2) rankString = "🥈 " + rankString;
        if (rank === 3) rankString = "🥉 " + rankString;
        return chalk.bold(this.formatSpacing(rankString, 5, false));
    }

    private buildEntryMessage(entry: LeaderboardEntry): string {
        return `${chalk.bold(`Rank ${entry.rank}`)}
Points: ${chalk.yellow(entry.points.toLocaleString())}
Challenges Completed: ${chalk.blueBright(entry.challengesCompleted.toString())}
Total Gas Used: ${chalk.green(entry.totalGasUsed.toLocaleString())}
`;
    }

    private formatSpacing(text: string, width: number, center: boolean = true): string {
        const strippedText = stripAnsi(text);
        const textLength = strippedText.length;
        const totalPadding = width - textLength;
        
        if (totalPadding <= 0) return text;

        if (!center) {
            return " ".repeat(totalPadding) + text;
        }

        const leftPadding = Math.ceil(totalPadding / 2);
        const rightPadding = Math.floor(totalPadding / 2);
        
        return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
    }

    private getUserInfo(): LeaderboardEntry | undefined {
        return this.leaderboard.find(entry => entry.address === this.userAddress);
    }

    private buildLeaderboardMessage(): string {
        const userInfo = this.getUserInfo();
        let statement = "Complete challenges to score points and climb the leaderboard!";
        if (userInfo) {
            switch (userInfo.rank) {
                case 1:
                    statement = "You are the TOP DOG!";
                    break;
                case 2:
                    statement = "You are second place!\nKeep challenging yourself and see if you can catch up to the leader!\nTry to improve the gas efficiency of your past solutions.";
                    break;
                case 3:
                    statement = "You are third place!\nKeep challenging yourself and see if you can catch up to the leader!\nTry to improve the gas efficiency of your past solutions.";
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    statement = `You are in the top ten!\nKeep challenging yourself and see if you can climb the leaderboard!\nTry to improve the gas efficiency of your past solutions.`;
                    break;
                default:
                    statement = `You are rank ${userInfo.rank}.\nKeep challenging yourself and see if you can climb the leaderboard!`;
                    break;
            }
        }

        return chalk.bold(`${statement}\n\nTop Players\n${this.formatSpacing("Rank", 7, false)}  | ${this.formatSpacing("Points", 8)} | ${this.formatSpacing("Total Gas Used", 12)} | Player`);
    }
} 