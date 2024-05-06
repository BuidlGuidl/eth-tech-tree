import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";

type Challenge = {
    label: string;
    value: string;
    tags: string[];
    level: number;
    type: "challenge" | "reference" | "personal-challenge";
    completed?: boolean;
    action: () => void;
}

type TreeNode = {
    label: string;
    value: string;
    children: TreeNode[];
    type: "header" | "challenge" | "reference" | "personal-challenge";
    completed?: boolean;
    level?: number;
    action?: () => void;
}

function visualizeNode(node: TreeNode, depth: number = 0): void {
    console.log(getNodeLabel(node, depth));
}

function getNodeLabel(node: TreeNode, depth: number = 0, isMenu: boolean = false): string {
    const hasParent = !!findParent(tree, node);
    const isHeader = node.type === "header";
    const isChallenge = node.type === "challenge";
    const isReference = node.type === "reference";
    const isPersonalChallenge = node.type === "personal-challenge";
    const isCompleted = node.completed;
    const depthString = "   ".repeat(depth);
    const label = node.label;
    const level = node.level;
    const treeSymbol = isMenu ? "" : "﹂";

    if (isHeader) {
        return `${depthString} ${hasParent ? treeSymbol : ""}${chalk.blue(label)}`;
    } else if (isChallenge) {
        return `${depthString} ${treeSymbol}${label}♟️ - LVL ${level}`;
    } else if (isReference) {
        return `${depthString} ${treeSymbol}${label}📖 - LVL ${level}`;
    } else if (isPersonalChallenge) {
        return`${depthString} ${treeSymbol}${label}🏆 - LVL ${level}`;
    } else {
        return `${depthString}${label}`;
    }
}

export function visualizeTree(node: TreeNode, depth: number = 0): void {
    visualizeNode(node, depth);

    node.children.forEach(child => visualizeTree(child, depth + 1));
}

async function selectNode(node: TreeNode): Promise<void> {
    console.log(`You selected node: ${node.label}`);
    // Implement your logic here for what to do with the selected node

    // IF: type === header
    // Do nothing

    // IF: type === challenge
    // Show description of challenge
    // Show menu for the following options:
    // download repository - Use create-eth to download repository using extensions
    //  - Show instructions for completing the challenge including a simple command to test their code
    // submit project, check if project passes tests then send proof of completion to the BG server, if it passes, mark the challenge as completed
    if (node.type === "challenge") {
        console.log("This is a challenge");
        const actions = ["Download Repository", "Submit Project"];
        const actionPrompt = {
            type: "list",
            name: "selectedAction",
            message: "What would you like to do?",
            choices: actions
        };
        const { selectedAction } = await inquirer.prompt([actionPrompt]);
        if (selectedAction === "Download Repository") {
            console.log("Downloading repository...");
        } else if (selectedAction === "Submit Project") {
            console.log("Submitting project...");
        }
    }


    // IF: type === reference
    // Show link to reference material
    // Provide option to mark as completed

    // IF: type === personal-challenge
    // Show description of challenge


}

const tree = buildTree();

export async function startVisualization(currentNode?: TreeNode): Promise<void> {
    if (!currentNode) {
        currentNode = tree;
    }
    const choices: string[] = currentNode.children.map(child => getNodeLabel(child, 0, true));
    const actions = [...currentNode.children];
    const parent = findParent(tree, currentNode) as TreeNode;
    let defaultChoice = 0;
    // Add a back option if not at the root
    if (parent) {
        choices.unshift(" ⮢");
        actions.unshift(parent);
        defaultChoice = 1;
    }
    const directionsPrompt = {
        type: "list",
        loop: false,
        name: "selectedNodeIndex",
        message: "Which direction would you like to go?",
        choices,
        default: defaultChoice
    };
    const answers = await inquirer.prompt([directionsPrompt]);
    const selectedIndex = choices.indexOf(answers.selectedNodeIndex);
    const selectedNode = actions[selectedIndex];
    await selectNode(selectedNode);
    await startVisualization(selectedNode);
}

function findParent(parentNode: TreeNode, targetNode: TreeNode): TreeNode | undefined {
    if (parentNode.children.includes(targetNode)) {
        return parentNode;
    } else {
        for (const childNode of parentNode.children) {
            const parent = findParent(childNode, targetNode);
            if (parent) return parent;
        }
        return undefined;
    }
}

export function buildTree(): TreeNode {
    const tree: TreeNode[] = [];
    const challenges = JSON.parse(fs.readFileSync("challenges.json", "utf-8"));
    const tags = challenges.reduce((acc: string[], challenge: any) => {
        return Array.from(new Set(acc.concat(challenge.tags)));
    }, []);
    const levels = [1, 2, 3, 4];
    for (let tag of tags) {
        const tagLevels: TreeNode[] = [];
        for (let level of levels) {
            const filteredChallenges = challenges.filter((challenge: Challenge) => challenge.tags.includes(tag) && challenge.level === level);
            const transformedChallenges = filteredChallenges.map((challenge: Challenge) => {
                return {
                    label: challenge.label,
                    value: challenge.value,
                    level: challenge.level,
                    type: challenge.type,
                    children: []
                };
            }) as TreeNode[];
            tagLevels.push(...transformedChallenges);
        }
        tree.push({
            type: "header",
            label: `${tag}`,
            value: `${tag.toLowerCase()}`,
            children: tagLevels
        });
    }
    const mainMenu: TreeNode = {
        label: "Main Menu",
        value: "main-menu",
        type: "header",
        children: tree,
    };
    
    return mainMenu;
}