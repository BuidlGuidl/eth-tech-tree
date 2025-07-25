import { existsSync, rmSync } from "fs";
import { confirm, input } from "@inquirer/prompts";
import { IUserChallenge, IChallenge, TreeNode, IUser, Actions } from "./types";
import chalk from "chalk";
import { loadChallenges, loadUserState, saveUserState } from "./utils/state-manager";
import { getUser } from "./modules/api";
import { setupChallenge, submitChallenge } from "./actions";
import select from './utils/global-context-select-list';
import { ProgressView } from "./utils/progress-view";
import { calculatePoints, stripAnsi } from "./utils/helpers";
import { LeaderboardView } from "./utils/leaderboard-view";
import { fetchLeaderboard } from "./modules/api";

// Set to true for a flat tree with all challenges at the top level
const FLAT_TREE_MODE = true;

type GlobalChoice = {
    value: string;
    key: string;
}

export class TechTree {
    private globalTree: TreeNode;
    private userState: IUser;
    private challenges: IChallenge[];
    private history: { node: TreeNode, selection: string }[] = [];
    private globalChoices: GlobalChoice[];
    private nodeLabel: string = "Main Menu";

    constructor() {
        this.userState = loadUserState();
        this.challenges = loadChallenges();
        this.globalTree = this.buildTree();
        this.globalChoices = [
            { value: 'quit', key: 'q' },
            { value: 'help', key: 'h' },
            { value: 'progress', key: 'p' },
            { value: 'leaderboard', key: 'l' },
            { value: 'back', key: 'escape' },
            { value: 'back', key: 'backspace' },
        ];
    
        this.listenForQuit();
    }

    listenForQuit(): void {
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (_, key) => {
            if ((key.ctrl && key.name === 'c')) {
                this.quit();
            }
        });
    }

    async start(): Promise<void> {
        await this.navigate();
    }

    async navigate(node?: TreeNode, selection?: string, heightOffset = 3): Promise<void> {
        if (!node) {
            this.globalTree = this.buildTree();
            node = Object.assign({}, this.globalTree);
        }

        // Handle navigation nodes
        const { choices, actions } = this.getChoicesAndActions(node);

        const directionsPrompt = {
            message: this.getMessage(node),
            globalChoices: this.globalChoices,
            choices,
            loop: false,
            default: selection,
            pageSize: this.getMaxViewHeight() - heightOffset,
            theme: {
                helpMode: "always" as "never" | "always" | "auto" | undefined,
                prefix: ""
            }
        };

        try {
            this.nodeLabel = node.shortname || node.label;
            this.clearView();
            this.printMenu();
            const { answer } = await select(directionsPrompt);
            if (!this.globalChoices.find(choice => choice.value === answer)) {
                const selectedAction = actions[answer];
                // Only save new history if the action is not a global choice
                this.history.push({ node, selection: answer });
                await selectedAction();
            } else {
                const selectedAction = this.getGlobalChoiceAction(answer);
                await selectedAction();
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'ExitPromptError') {
                // Because canceling the promise (e.g. ctrl+c) can cause the inquirer prompt to throw we need to silence this error
              } else {
                throw error;
              }
        }
    }

    getGlobalChoiceAction(selectedActionLabel: string): Function {
        if (selectedActionLabel === 'quit') {
            return () => this.quit();
        } else if (selectedActionLabel === 'back') {
            return () => this.goBack();
        } else if (selectedActionLabel === 'help') {
            return () => this.printHelp();
        } else if (selectedActionLabel === 'progress') {
            return () => this.printProgress();
        } else if (selectedActionLabel === 'leaderboard') {
            return () => this.printLeaderboard();
        }
        throw new Error(`Invalid global choice: ${selectedActionLabel}`);
    }

    async goBack(): Promise<void> {
        if (this.history.length > 0) {
            const { node, selection } = this.history.pop() as { node: TreeNode, selection: string };
           await this.navigate(node, selection);
        } else {
            await this.navigate();
        }
    }

    getMessage(node: TreeNode): string {        
        // Default messages based on node type
        if (node.type === "challenge") {
            return this.getChallengeMessage(node);
        } else if (node.message) {
            return node.message;
        } else if (node.children.find(child => child.type === "challenge")) {
            return "Select a challenge";
        } else {
            return "Select a category";
        }
    }

    getChallengeMessage(node: TreeNode): string {
        const { installLocation } = this.userState;
        return `${node.message}
${node.completed ? `
🏆 Challenge Completed` : node.installed ? `
Open up the challenge in your favorite code editor and follow the instructions in the README:

📂 Challenge Location: ${installLocation}/${node.name}` : ""}
`;
    }

    buildTree(): TreeNode {
        const userChallenges = this.userState?.challenges || [];
        
        if (FLAT_TREE_MODE) {
            // Flat tree mode: all challenges at the top level
            const allChallenges = this.challenges.filter((challenge: IChallenge) => challenge.enabled);
            const transformedChallenges = allChallenges.map((challenge: IChallenge) => {
                const { label, name, level, type, childrenNames, enabled: unlocked, description } = challenge;
                const completed = userChallenges.find((c: IUserChallenge) => c.challengeName === name)?.status === "success";

                return { label, name, level, type: type as "challenge", actions: this.getChallengeActions(challenge as unknown as TreeNode), completed, installed: this.challengeIsInstalled(challenge as unknown as TreeNode), childrenNames, parentName: undefined, unlocked, message: description, children: [] };
            });

            const mainMenu: TreeNode = {
                label: "Main Menu",
                name: "main-menu",
                type: "header",
                children: transformedChallenges,
            };

            return mainMenu;
        }

        // Original hierarchical tree mode
        const tree: TreeNode[] = [];
        const tags = this.challenges.reduce((acc: string[], challenge: IChallenge) => {
            return Array.from(new Set(acc.concat(challenge.tags)));
        }, []);

        for (let tag of tags) {
            const filteredChallenges = this.challenges.filter((challenge: IChallenge) => challenge.tags.includes(tag) && challenge.enabled);
            let completedCount = 0;
            const transformedChallenges = filteredChallenges.map((challenge: IChallenge) => {
                const { label, name, level, type, childrenNames, enabled: unlocked, description } = challenge;
                const parentName = this.challenges.find((c: IChallenge) => c.childrenNames?.includes(name))?.name;
                const completed = userChallenges.find((c: IUserChallenge) => c.challengeName === name)?.status === "success";
                if (completed) {
                    completedCount++;
                }

                return { label, name, level, type, actions: this.getChallengeActions(challenge as unknown as TreeNode), completed, installed: this.challengeIsInstalled(challenge as unknown as TreeNode), childrenNames, parentName, unlocked, message: description };
            });
            const nestedChallenges = this.recursiveNesting(transformedChallenges);

            tree.push({
                type: "header",
                label: `${tag} ${chalk.green(`(${completedCount}/${filteredChallenges.length})`)}`,
                name: `${tag.toLowerCase()}`,
                children: nestedChallenges,
                recursive: true
            });
        }
        // Remove any categories without challenges
        const enabledCategories = tree.filter((category: TreeNode) => category.children.length > 0);
        const mainMenu: TreeNode = {
            label: "Main Menu",
            name: "main-menu",
            type: "header",
            children: enabledCategories,
        };

        return mainMenu;
    }

    getChoicesAndActions(node: TreeNode): { choices: { name: string, value: string }[], actions: Actions } {
        const choices: { name: string, value: string }[] = [];
        let actions: Actions = {};

        if (!node.recursive) {
            if (node.type !== "challenge") {
                choices.push(...node.children.map(child => ({ name: this.getNodeLabel(child), value: child.label })));
                for (const child of node.children) {

                    actions[child.label] = () => this.navigate(child);
                }
                if (node.children.length === 0) {
                    choices.push({ name: "Back", value: "back" });
                    actions["Back"] = () => this.goBack();
                }
            } else {
                actions = node.actions as Actions;
                choices.push(...Object.keys(node.actions as Actions).map(action => ({ name: action, value: action })));
            }
            return { choices, actions };
        }

        const getChoicesAndActionsRecursive = (node: TreeNode, isLast: boolean = false, depth: string = "") => {
            if (node.type !== "header") {
                if (!isLast) {
                    depth += "├─";
                } else {
                    depth += "└─";
                }
            }
            choices.push({ name: this.getNodeLabel(node, depth), value: node.label });
            actions[node.label] = () => this.navigate(node);
            // Replace characters in the continuing pattern
            if (depth.length) {
                depth = depth.replace(/├─/g, "│ ");
                depth = depth.replace(/└─/g, "  ");
            }
            // Add spaces so that the labels are spaced out
            const depthDivisor = node.type === "header" ? 5 : 2;
            depth += Array(Math.floor(node.label.length / depthDivisor)).fill(" ").join("");
            node.children.forEach((child, i, siblings) => getChoicesAndActionsRecursive(child, i === siblings.length - 1, depth));
        };

        node.children.forEach((child, i, siblings) => getChoicesAndActionsRecursive(child, i === siblings.length - 1));

        return { choices, actions };
    }

    getNodeLabel(node: TreeNode, depth: string = ""): string {
        const { label, type, completed, unlocked } = node;
        const isHeader = type === "header";
        const isChallenge = type === "challenge";
        const isQuiz = type === "quiz";
        const isCapstoneProject = type === "capstone-project";


        if (isHeader) {
            return `${depth}${chalk.blueBright(label)}`;
        } else if (!unlocked) {
            return `${depth}${chalk.dim(chalk.dim(label))}`;
        } else if (isChallenge) {
            return `${depth}${label} ${completed ? "🏆" : ""}`;
        } else if (isQuiz) {
            return `${depth}${label} 📜`;
        } else if (isCapstoneProject) {
            return `${depth}${label} 💻`;
        } else {
            return `${depth}${label}`;
        }
    }

    findNode(globalTree: TreeNode, name: string): TreeNode | undefined {
        // Descend the tree until the node is found
        if (globalTree.name === name) {
            return globalTree;
        }
        for (const child of globalTree.children) {
            const node = this.findNode(child, name);
            if (node) {
                return node;
            }
        }
    }

    recursiveNesting(challenges: any[], parentName: string | undefined = undefined): TreeNode[] {
        const tree: TreeNode[] = [];
        for (let challenge of challenges) {
            if (challenge.parentName === parentName) {
                // Recursively call recursiveNesting for each child
                challenge.children = this.recursiveNesting(challenges, challenge.name);
                tree.push(challenge);
            }
        }
        return tree;
    }

    challengeIsInstalled(challenge: TreeNode): boolean {
        const { installLocation } = this.userState;
        const targetDir = `${installLocation}/${challenge.name}`;
        return existsSync(targetDir);
    }

    rebuildHistory():void {
        // Rebuild Global tree
        this.globalTree = this.buildTree();
        // For each node in the current history, find the new node in the newly created tree
        const newHistory = this.history.map(({ node, selection }) => {
            const newNode = this.findNode(this.globalTree, node.name);
            return { node: newNode as TreeNode, selection };
        });
        this.history = newHistory;
    }

    getChallengeActions(challenge: TreeNode): Actions {
        const actions: Actions = {};
        const { address, installLocation } = this.userState;
        const { type, name } = challenge;
        if (!this.challengeIsInstalled(challenge)) {
            actions["Setup Challenge Repository"] = async () => {
                this.clearView();
                await setupChallenge(name, installLocation);
                // Rebuild the tree and history
                this.rebuildHistory();
                // Wait for enter key
                await this.pressEnterToContinue();
                // Return to challenge menu
                await this.goBack();
            };
        } else {
            actions["Reset Challenge"] = async () => {
                this.clearView();
                const confirmReset = await this.yesOrNo("Are you sure you want to reset this challenge? This will remove the challenge from your local machine and re-install it.", false);
                if (!confirmReset) {
                    await this.goBack();
                } else {
                    const targetDir = `${installLocation}/${name}`;
                    console.log(`Removing ${targetDir}...`);
                    rmSync(targetDir, { recursive: true, force: true });
                    console.log(`Installing fresh copy of challenge...`);
                    await setupChallenge(name, installLocation);
                    // Rebuild the tree and history
                    this.rebuildHistory();
                    await this.pressEnterToContinue();
                    // Return to challenge menu
                    await this.goBack();
                }
            };
            actions["Submit Completed Challenge"] = async () => {
                this.clearView();
                // Submit the challenge
                await submitChallenge(name);
                // Fetch users challenge state from the server
                const newUserState = await getUser(address);
                this.userState.challenges = newUserState.challenges;
                // Save the new user state locally
                await saveUserState(this.userState);
                // Rebuild the tree and history
                this.rebuildHistory();
                // Wait for enter key
                await this.pressEnterToContinue();
                // Return to challenge menu
                await this.goBack();
            };
        }
        return actions;
    };

    async yesOrNo(message: string, defaultAnswer: boolean = true) {
        const answer = await confirm({
            message,
            default: defaultAnswer,
            theme: {
                prefix: "",
            }
        });
        return answer;
    }

    async pressEnterToContinue(customMessage?: string) {
        const answer = await input({
            message: typeof customMessage === "string" ? customMessage : 'Press Enter to continue...',
            theme: {
                prefix: "",
            }
        });
        return answer;
    }

    private clearView(): void {
        process.stdout.moveCursor(0, this.getMaxViewHeight());
        console.clear();
    }

    private printMenu(): void {
        const border = chalk.blueBright("─");
        const borderLeft = chalk.blueBright("●─");
        const borderRight = chalk.blueBright("─●");
        const currentViewName = this.nodeLabel || "Main Menu";
        const user = this.userState.ens || this.userState.address;
        const completedChallenges = this.userState.challenges
            .filter(c => c.status === "success")
            .map(c => ({
                challenge: this.challenges.find(ch => ch.name === c.challengeName),
                completion: c
            }))
            .filter(c => c.challenge);
        const points = calculatePoints(completedChallenges);
        

        const width = process.stdout.columns;
        const userInfo = `${chalk.green(user)} ${chalk.yellow(`(${points} points)`)}`;
        const topMenuText = chalk.bold(`${borderLeft}${currentViewName}${new Array(width - (stripAnsi(currentViewName).length + stripAnsi(userInfo).length + 4)).fill(border).join('')}${userInfo}${borderRight}`);
        const bottomMenuText = chalk.bold(`${borderLeft}${chalk.bgGreen(`<q>`)} to quit | ${chalk.bgGreen(`<Esc>`)} to go back | ${chalk.bgGreen(`<p>`)} view progress | ${chalk.bgGreen(`<l>`)} leaderboard${new Array(width - 72).fill(border).join('')}${borderRight}`);
        
        // Save cursor position
        process.stdout.write('\x1B7');

        // Hide cursor while we work
        process.stdout.write('\x1B[?25l');
        
        // Print at top
        process.stdout.cursorTo(0, 0);
        process.stdout.clearLine(0);
        process.stdout.write(topMenuText);

        // Print at bottom
        process.stdout.cursorTo(0, this.getMaxViewHeight());
        process.stdout.clearLine(0);
        process.stdout.write(bottomMenuText);

        // Move cursor to line 1 (just below the top menu)
        process.stdout.cursorTo(0, 1);

        // Show cursor again
        process.stdout.write('\x1B[?25h');
    }

    getMaxViewHeight(): number {
        const maxRows = 20;
        if (process.stdout.rows < maxRows) {
            return process.stdout.rows;
        }
        return maxRows;
    }

    quit(): void {
        this.clearView();
        process.exit(0);
    }

    printHelp(): void {
        this.clearView();
        console.log("Help");
    }

    async printProgress(): Promise<void> {
        const progressView = new ProgressView(this.userState, this.challenges);
        const progressTree = progressView.buildProgressTree();
        await this.navigate(progressTree, undefined, 6);
    }

    async printLeaderboard(): Promise<void> {
        const leaderboardData = await fetchLeaderboard();
        const leaderboardView = new LeaderboardView(leaderboardData, this.userState.address);
        const leaderboardTree = leaderboardView.buildLeaderboardTree();
        await this.navigate(leaderboardTree, undefined, 6);
    }
}
