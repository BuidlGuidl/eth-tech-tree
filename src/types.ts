export type Args = string[];

export type RawOptions = {
  project: string | null;
  install: boolean | null;
  dev: boolean;
};

export interface IUserChallenge {
  challengeName: string
  status: string;
  lastFeedback: string;
  timestamp: Date;
  contractAddress: string;
  network: string;
  gasReport?: IGasReport[];
}

export interface IGasReport {
  functionName: string;
  gasUsed: number;
}

export interface IChallenge {
  type: string;
  level: number;
  name: string;
  label: string;
  repo: string;
  tags: string[];
  contractName: string;
  testFileName: string;
  childrenNames: string[];
  enabled: boolean;
  description: string;
}

export interface IUser {
  address: string;
  ens: string;
  installLocation: string;
  creationTimestamp: number;
  challenges: IUserChallenge[];
}

export type Actions = {
  [label: string]: () => Promise<any>;
}

export type TreeNode = {
  label: string;
  name: string;
  children: TreeNode[];
  type: "header" | "challenge" | "quiz" | "capstone-project";
  completed?: boolean;
  installed?: boolean;
  level?: number;
  unlocked?: boolean;
  actions?: Actions;
  repo?: string;
  message?: string;
  recursive?: boolean;
}