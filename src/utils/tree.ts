import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import { getUserState } from "./user-state";
import { setupChallenge, submitChallenge } from "./actions";

type Action = {
    label: string;
    action: () => Promise<void>;
}

type Challenge = {
    label: string;
    name: string;
    tags: string[];
    level: number;
    type: "challenge" | "reference" | "personal-challenge";
    completed?: boolean;
    actions: Action[];
    childrenNames?: string[];
    parentName?: string;
    repo?: string;
    message?: string;
    testHash?: string;
    testFileName?: string;
}

type TreeNode = {
    label: string;
    name: string;
    children: TreeNode[];
    type: "header" | "challenge" | "reference" | "personal-challenge";
    completed?: boolean;
    level?: number;
    actions?: Action[];
    repo?: string;
    message?: string;
    recursive?: boolean;
}

function visualizeNode(node: TreeNode, depth: number = 0): void {
    console.log(getNodeLabel(node, depth));
}

function getNodeLabel(node: TreeNode, depth: number = 0): string {
    const parent = findParent(tree, node);
    const { label, level, type, completed } = node;
    const isHeader = type === "header";
    const isChallenge = type === "challenge";
    const isReference = type === "reference";
    const isPersonalChallenge = type === "personal-challenge";
    const depthString = "           ".repeat(depth);

    const treeSymbol = parent && parent.type === "header" ? "" : "﹂";
  
    if (isHeader) {
        return `${depthString} ${treeSymbol}${chalk.blue(label)}`;
    } else if (isChallenge) {
        return `${depthString} ${treeSymbol}${label} ♟️ - LVL ${level}`;
    } else if (isReference) {
        return `${depthString} ${treeSymbol}${label} 📖 - LVL ${level}`;
    } else if (isPersonalChallenge) {
        return`${depthString} ${treeSymbol}${label} 🏆 - LVL ${level}`;
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
  
    // IF: type === challenge
    // Show description of challenge
    // Show menu for the following options:
    // download repository - Use create-eth to download repository using extensions
    //  - Show instructions for completing the challenge including a simple command to test their code
    // submit project, check if project passes tests then send proof of completion to the BG server, if it passes, mark the challenge as completed
    if (node.type === "challenge") {
        console.log("This is a challenge");
        const actionPrompt = {
            type: "list",
            name: "selectedAction",
            message: "What would you like to do?",
            choices: node.actions?.map(action => action.label)
        };
        const { selectedAction } = await inquirer.prompt([actionPrompt]);
        const selectedActionIndex = node.actions?.findIndex(action => action.label === selectedAction);
        if (selectedActionIndex !== undefined && selectedActionIndex >= 0) {
            await node.actions?.[selectedActionIndex].action();
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

    function getChoicesAndActions(node: TreeNode): { choices: string[], actions: TreeNode[] } {
        const choices: string[] = [];
        const actions: TreeNode[] = [];

        if (!node.recursive) {
            choices.push(...node.children.map(child => getNodeLabel(child, 0)));
            actions.push(...node.children);
            return { choices, actions };
        }

        const getChoicesAndActionsRecursive = (node: TreeNode, depth: number) => {
            if (node.actions) {
                choices.push(getNodeLabel(node, depth));
                actions.push(node);
                depth ++;
            } 
            node.children.forEach(child => getChoicesAndActionsRecursive(child, depth));
        };

        getChoicesAndActionsRecursive(node, 0);

        return { choices, actions };
    }

    const { choices, actions } = getChoicesAndActions(currentNode);
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
    // visualizeTree(selectedNode);
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

// Matryoshka Magic - Recursive function to build nested tree structure
function matryoshkaMagic(challenges: any[], parentName: string | undefined = undefined): TreeNode[] {
    const tree: TreeNode[] = [];
    for (let challenge of challenges) {
        if (challenge.parentName === parentName) {
            // Recursively call matryoshkaMagic for each child
            challenge.children = matryoshkaMagic(challenges, challenge.name);
            tree.push(challenge);
        }
    }
    return tree;
}

export function buildTree(): TreeNode {
    const { installLocation } = getUserState();
    const tree: TreeNode[] = [];
    const challenges: Challenge[] = JSON.parse(fs.readFileSync("challenges.json", "utf-8"));
    const tags = challenges.reduce((acc: string[], challenge: any) => {
        return Array.from(new Set(acc.concat(challenge.tags)));
    }, []);
    for (let tag of tags) {
            const filteredChallenges = challenges.filter((challenge: Challenge) => challenge.tags.includes(tag));
            const transformedChallenges = filteredChallenges.map((challenge: Challenge) => {
                const { label, name, level, type, completed, repo, message, testHash, testFileName, childrenNames} = challenge;
                const parentName = challenges.find((c: any) => c.childrenNames?.includes(name))?.name;

                // Build selection actions
                const actions: Action[] = [];
                if (type === "challenge") {
                    actions.push({
                        label: "Setup Challenge Repository",
                        action: async () => {
                            await setupChallenge(repo as string, name, installLocation);
                        }
                    });
                    actions.push({
                        label: "Submit Completed Challenge",
                        action: async () => {
                            await submitChallenge(name, testFileName as string, testHash as string);
                        }
                    });
                } else if (type === "reference") {
                    actions.push({
                        label: "Mark as Read",
                        action: async () => {
                            console.log("Marking as read...");
                        }
                    });
                } else if (type === "personal-challenge") {
                    actions.push({
                        label: "Submit Project",
                        action: async () => {
                            console.log("Submitting project...");
                        }
                    });
                }
                return { label, name, level, type, completed, actions, childrenNames, parentName };
            });
            const matryoshkaChallenges = matryoshkaMagic(transformedChallenges);
        tree.push({
            type: "header",
            label: `${tag}`,
            name: `${tag.toLowerCase()}`,
            children: matryoshkaChallenges,
            recursive: true
        });
    }
    const mainMenu: TreeNode = {
        label: "Main Menu",
        name: "main-menu",
        type: "header",
        children: tree,
    };
    
    return mainMenu;
}