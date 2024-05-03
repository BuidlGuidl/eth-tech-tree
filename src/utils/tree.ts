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
    parent?: string;
    children: TreeNode[];
    type: "header" | "challenge" | "reference" | "personal-challenge";
    completed?: boolean;
    action?: () => void;
}

function visualizeNode(node: TreeNode, depth: number = 0): void {
    const hasParent = !!findParent(tree, node);
    const isHeader = node.type === "header";
    const isChallenge = node.type === "challenge";
    const isReference = node.type === "reference";
    const isPersonalChallenge = node.type === "personal-challenge";
    const depthString = "   ".repeat(depth);
    const label = node.label;
    
    if (isHeader) {
        console.log(`${depthString} ${hasParent ? "﹂" : ""}${chalk.blue(label)}`);
    } else if (isChallenge) {
        console.log(`${depthString} ﹂${label}`);
    } else if (isReference) {
        console.log(`${depthString} ﹂${label}`);
    } else if (isPersonalChallenge) {
        console.log(`${depthString} ﹂${label}`);
    } else {
        console.log(`${depthString}${label}`);
    }
}

function visualizeTree(node: TreeNode, depth: number = 0): void {
    visualizeNode(node, depth);

    node.children.forEach(child => visualizeTree(child, depth + 1));
}

function selectNode(node: TreeNode): void {
    console.log(`You selected node: ${node.label}`);
    // Implement your logic here for what to do with the selected node

    // IF: type === challenge
    // Show description of challenge
    // Show menu for the following options:
    // download repository - Use create-eth to download repository using extensions
    //  - Show instructions for completing the challenge including a simple command to test their code
    // submit project, check if project passes tests then send proof of completion to the BG server, if it passes, mark the challenge as completed
    
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
    visualizeTree(currentNode);
    const choices = currentNode.children.map(child => child.label);
    const actions = [...currentNode.children];
    const parent = findParent(tree, currentNode) as TreeNode;
    let defaultChoice = 0;
    // Add a back option if not at the root
    if (parent) {
        choices.unshift("⮢");
        actions.unshift(parent);
        defaultChoice = 1;
    }
    const directionsPrompt = {
        type: "list",
        name: "selectedNodeIndex",
        message: "Which direction would you like to go?",
        choices,
        default: defaultChoice
    };
    const answers = await inquirer.prompt([directionsPrompt]);
    const selectedIndex = choices.indexOf(answers.selectedNodeIndex);
    const selectedNode = actions[selectedIndex];
    selectNode(selectedNode);
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
            if (transformedChallenges.length > 0) {
                tagLevels.push({
                    type: "header",
                    label: `${tag} - Level ${level}`,
                    value: `${tag.toLowerCase()}-level-${level}`,
                    children: transformedChallenges
                });
            }
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