import inquirer from "inquirer";
import chalk from "chalk";
import { loadChallenges, loadUserState } from "./stateManager";
import { setupChallenge, testChallenge } from "./actions";
import { IChallenge } from "../types";

type Action = {
    label: string;
    action: () => Promise<void>;
}

type TreeNode = {
    label: string;
    name: string;
    children: TreeNode[];
    type: "header" | "challenge" | "quiz" | "capstone-project";
    completed?: boolean;
    level?: number;
    actions?: Action[];
    repo?: string;
    message?: string;
    recursive?: boolean;
}

function getNodeLabel(node: TreeNode, depth: string = ""): string {
    const { label, level, type, completed } = node;
    const isHeader = type === "header";
    const isChallenge = type === "challenge";
    const isQuiz = type === "quiz";
    const isCapstoneProject = type === "capstone-project";
  
    if (isHeader) {
        return `${depth} ${chalk.blue(label)}`;
    } else if (isChallenge) {
        return `${depth} ${label} ♟️ - LVL ${level}`;
    } else if (isQuiz) {
        return `${depth} ${label} 📖 - LVL ${level}`;
    } else if (isCapstoneProject) {
        return`${depth} ${label} 🏆 - LVL ${level}`;
    } else {
        return `${depth} ${label}`;
    }
}

async function selectNode(node: TreeNode): Promise<void> {
    console.clear();
    
    const header = findHeader(globalTree, node) as TreeNode;
    // IF: type === challenge
    // Show description of challenge
    // Show menu for the following options:
    // download repository - Use create-eth to download repository using extensions
    //  - Show instructions for completing the challenge including a simple command to test their code
    // submit project, check if project passes tests then send proof of completion to the BG server, if it passes, mark the challenge as completed
    if (node.type === "challenge") {
        const backAction: Action = {
            label: " ⮢",
            action: async () => { await startVisualization(header) }
        }
        const actions = [backAction].concat((node.actions as Action[]).map(action => action));
        const choices = actions.map(action => action.label);
        console.log("This is a challenge");
        const actionPrompt = {
            type: "list",
            name: "selectedAction",
            message: "What would you like to do?",
            choices,
            default: 1
        };
        const { selectedAction } = await inquirer.prompt([actionPrompt]);
        const selectedActionIndex = actions.findIndex(action => action.label === selectedAction);
        if (selectedActionIndex !== undefined && selectedActionIndex >= 0) {
            await actions[selectedActionIndex].action();
        }
    }

    // IF: type === reference
    // Show link to reference material
    // Provide option to mark as completed

    // IF: type === personal-challenge
    // Show description of challenge
    

}

const globalTree = buildTree();

export async function startVisualization(currentNode?: TreeNode): Promise<void> {
    if (!currentNode) {
        currentNode = Object.assign({}, globalTree);
    }

    function getChoicesAndActions(node: TreeNode): { choices: string[], actions: TreeNode[] } {
        const choices: string[] = [];
        const actions: TreeNode[] = [];

        if (!node.recursive) {
            choices.push(...node.children.map(child => getNodeLabel(child)));
            actions.push(...node.children);
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
                choices.push(getNodeLabel(node, depth));
                actions.push(node);
                // Replace characters in the continuing pattern
                if (depth.length) {
                    depth = depth.replace(/├─/g, "│ ");
                    depth = depth.replace(/└─/g, "  ");
                }
                // Add spaces so that the labels are spaced out
                depth += Array(Math.floor(node.label.length/2)).fill(" ").join("");
            node.children.forEach((child, i, siblings) => getChoicesAndActionsRecursive(child, i === siblings.length - 1, depth));
        };

        getChoicesAndActionsRecursive(node);

        return { choices, actions };
    }

    const { choices, actions } = getChoicesAndActions(currentNode);
    const parent = findParent(globalTree, currentNode) as TreeNode;
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
    if (selectedNode.type === "header") {
        await startVisualization(selectedNode);
    }
}

function findParent(allNodes: TreeNode, targetNode: TreeNode): TreeNode | undefined {
    if (allNodes.children.includes(targetNode)) {
        return allNodes;
    } else {
        for (const childNode of allNodes.children) {
            const parent = findParent(childNode, targetNode);
            if (parent) return parent;
        }
        return undefined;
    }
}

function findHeader(allNodes: TreeNode, targetNode: TreeNode): TreeNode | undefined {
        let parent = findParent(allNodes, targetNode);
        while (true) {
            if (!parent) {
                return allNodes;
            }
            if (parent?.type === "header") {
                return parent;
            }
            parent = findParent(allNodes, parent);
        }    
}

// Nesting Magic - Recursive function to build nested tree structure
function NestingMagic(challenges: any[], parentName: string | undefined = undefined): TreeNode[] {
    const tree: TreeNode[] = [];
    for (let challenge of challenges) {
        if (challenge.parentName === parentName) {
            // Recursively call NestingMagic for each child
            challenge.children = NestingMagic(challenges, challenge.name);
            tree.push(challenge);
        }
    }
    return tree;
}

export function buildTree(): TreeNode {
    const { installLocation } = loadUserState();
    const tree: TreeNode[] = [];
    const challenges = loadChallenges();
    const tags = challenges.reduce((acc: string[], challenge: any) => {
        return Array.from(new Set(acc.concat(challenge.tags)));
    }, []);
    for (let tag of tags) {
            const filteredChallenges = challenges.filter((challenge: IChallenge) => challenge.tags.includes(tag) && challenge.enabled);
            const transformedChallenges = filteredChallenges.map((challenge: IChallenge) => {
                const { label, name, level, type, repo, testFileName, childrenNames} = challenge;
                const parentName = challenges.find((c: any) => c.childrenNames?.includes(name))?.name;

                // Build selection actions
                const actions: Action[] = [];
                if (type === "challenge") {
                    actions.push({
                        label: "Setup Challenge Repository",
                        action: async () => {
                            await setupChallenge(repo as string, name, installLocation);
                            // Return to top?
                            await startVisualization(globalTree);
                        }
                    });
                    actions.push({
                        label: "Test Challenge",
                        action: async () => {
                            await testChallenge(name, testFileName);
                            // Return to top?
                            await startVisualization(globalTree);
                        }
                    });
                    actions.push({
                        label: "Deploy Completed Contract",
                        action: async () => {
                            console.log("Testing contract before attempting to deploy...")
                            await testChallenge(name, testFileName);
                            console.log("TODO: NEED TO IMPLEMENT DEPLOYING CONTRACT");
                            // Return to top?
                            await startVisualization(globalTree);
                        }
                    });
                } else if (type === "quiz") {
                    actions.push({
                        label: "Mark as Read",
                        action: async () => {
                            console.log("Marking as read...");
                        }
                    });
                } else if (type === "capstone-project") {
                    actions.push({
                        label: "Submit Project",
                        action: async () => {
                            console.log("Submitting project...");
                        }
                    });
                }

                return { label, name, level, type, actions, childrenNames, parentName };
            });
            const NestingChallenges = NestingMagic(transformedChallenges);
        tree.push({
            type: "header",
            label: `${tag}`,
            name: `${tag.toLowerCase()}`,
            children: NestingChallenges,
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