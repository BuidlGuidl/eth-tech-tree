import { Transform } from "stream";
import { select } from "@inquirer/prompts";
import { IUser, IChallenge, TreeNode } from "../types";
import chalk from "chalk";

export class ProgressView {
    private stdIn: Transform;
    private promptCancel: AbortController | undefined;

    constructor(
        private userState: IUser,
        private challenges: IChallenge[],
        stdIn: Transform
    ) {
        this.stdIn = stdIn;
    }

    async show(): Promise<void> {
        while (true) {
            console.clear();
            this.printStats();
            
            const completedChallenges = this.userState.challenges
                .filter(c => c.status === "success")
                .map(c => {
                    const fullChallenge = this.challenges.find(ch => ch.name === c.challengeName);
                    return {
                        challenge: fullChallenge,
                        completion: c
                    };
                })
                .filter(c => c.challenge); // Filter out any challenges that don't exist anymore

            const choices = [
                ...completedChallenges.map(c => ({
                    name: chalk.green(`✓ ${c.challenge!.label}`),
                    value: c.challenge!.name,
                })),
                { name: "Return to Main Menu", value: "back" }
            ];

            this.promptCancel = new AbortController();
            const selected = await select({
                message: "Select a challenge to view details",
                choices,
                loop: false,
                theme: {
                    helpMode: "always" as "never" | "always" | "auto" | undefined,
                    prefix: ""
                }
            }, {
                input: this.stdIn,
                signal: this.promptCancel?.signal,
                
            });

            if (selected === "back") break;

            // Show challenge completion details
            const selectedChallenge = completedChallenges.find(c => c.challenge!.name === selected);
            if (selectedChallenge) {
                console.clear();
                await this.showChallengeDetails(selectedChallenge.challenge!, selectedChallenge.completion);
            }
        }
    }

    private calculatePoints(completedChallenges: Array<{ challenge: IChallenge | undefined, completion: any }>): number {
        const pointsPerLevel = [100, 150, 225, 300, 400, 500]
        return completedChallenges
            .filter(c => c.challenge) // Only count challenges that still exist
            .reduce((total, { challenge }) => {
                const points = pointsPerLevel[challenge!.level - 1] || 100;
                return total + points;
            }, 0);
    }

    private printStats(): void {
        const totalChallenges = this.challenges.filter(c => c.enabled).length;
        const completedChallenges = this.userState.challenges
            .filter(c => c.status === "success")
            .map(c => ({
                challenge: this.challenges.find(ch => ch.name === c.challengeName),
                completion: c
            }))
            .filter(c => c.challenge);
        
        const completionRate = (completedChallenges.length / totalChallenges * 100).toFixed(1);
        const points = this.calculatePoints(completedChallenges);

        // Print user info
        console.log(chalk.bold("\nUser Profile"));
        console.log(`Address: ${chalk.blue(this.userState.ens || this.userState.address)}`);
        console.log(chalk.yellow(`Points Earned: ${points.toLocaleString()}`));

        // Print challenge stats
        console.log(chalk.bold("\nChallenge Progress"));
        console.log(`Total Challenges: ${chalk.blue(totalChallenges)}`);
        console.log(`Completed: ${chalk.blue(`${completedChallenges.length} (${completionRate}%)\n`)}`);
    }

    private async showChallengeDetails(challenge: IChallenge, completion: any): Promise<void> {
        while (true) {
            console.clear();
            console.log(chalk.bold(`\n${challenge.label} Details\n`));
            console.log(`Description: ${challenge.description}`);
            console.log(`\nCompletion Date: ${chalk.blue(new Date(completion.timestamp).toLocaleString())}`);
            if (completion.contractAddress) {
                console.log(`Contract Address: ${chalk.blue(completion.contractAddress)}`);
                console.log(`Network: ${chalk.blue(completion.network)}`);
            }

            const choices = [
                { name: "Return to Challenge List", value: "back" }
            ];

            if (completion.gasReport && completion.gasReport.length > 0) {
                choices.unshift({ 
                    name: "View Gas Report", 
                    value: "gas",
                });
            }

            const action = await select({
                message: "Select an option",
                choices,
                loop: false,
                theme: {
                    helpMode: "always" as "never" | "always" | "auto" | undefined,
                    prefix: ""
                }
            }, {
                input: this.stdIn
            });

            if (action === "back") break;
            if (action === "gas") {
                await this.showGasTable(completion.gasReport);
            }
        }
    }

    private async showGasTable(gasReport: Array<{ functionName: string; gasUsed: number }>): Promise<void> {
        const gasInfo = gasReport
            .sort((a, b) => b.gasUsed - a.gasUsed); // Sort by gas usage, highest first

        let currentPage = 0;
        const headerRows = 6;
        const footerRows = 2;
        const tableHeaderRows = 3;
        
        while (true) {
            console.log(chalk.bold('\nGas Consumption Report:\n'));

            // Calculate column widths
            const methodWidth = Math.max(...gasInfo.map(g => g.functionName.length), 'Function Name'.length);
            const gasWidth = Math.max(...gasInfo.map(g => g.gasUsed.toString().length), 'Gas Used'.length);

            // Print header
            console.log(
                '┌' + '─'.repeat(methodWidth + 2) + 
                '┬' + '─'.repeat(gasWidth + 2) + '┐'
            );
            console.log(
                '│ ' + 'Function Name'.padEnd(methodWidth) + 
                ' │ ' + 'Gas Used'.padEnd(gasWidth) + ' │'
            );
            console.log(
                '├' + '─'.repeat(methodWidth + 2) + 
                '┼' + '─'.repeat(gasWidth + 2) + '┤'
            );

            // Calculate available rows and page info
            const availableRows = process.stdout.rows - headerRows - footerRows - tableHeaderRows;
            const totalPages = Math.ceil(gasInfo.length / availableRows);
            const startIdx = currentPage * availableRows;
            const endIdx = Math.min(startIdx + availableRows, gasInfo.length);
            
            // Print table body
            for (let i = startIdx; i < endIdx; i++) {
                const { functionName, gasUsed } = gasInfo[i];
                console.log(
                    '│ ' + functionName.padEnd(methodWidth) + 
                    ' │ ' + gasUsed.toString().padStart(gasWidth) + ' │'
                );
            }

            // Print footer
            console.log(
                '└' + '─'.repeat(methodWidth + 2) + 
                '┴' + '─'.repeat(gasWidth + 2) + '┘'
            );

            // Show total gas used
            const totalGas = gasInfo.reduce((sum, g) => sum + g.gasUsed, 0);
            console.log(chalk.bold(`\nTotal Gas Used: ${totalGas.toLocaleString()}`));

            // Show navigation info if multiple pages
            if (totalPages > 1) {
                console.log(chalk.dim(`\nPage ${currentPage + 1}/${totalPages} (Use ↑/↓ to scroll, Enter to return)`));
            }

            // Handle navigation
            const choices = [{ name: "Return to Challenge Details", value: "return" }];
            if (currentPage > 0) {
                choices.unshift({ name: "Previous Page", value: "prev" });
            }
            if (currentPage < totalPages - 1) {
                choices.unshift({ name: "Next Page", value: "next" });
            }

            const action = await select({
                message: "Navigation",
                choices,
                loop: false,
                theme: {
                    helpMode: "always" as "never" | "always" | "auto" | undefined,
                    prefix: ""
                }
            }, {
                input: this.stdIn
            });

            if (action === "return") break;
            if (action === "prev") currentPage--;
            if (action === "next") currentPage++;
        }
    }
} 