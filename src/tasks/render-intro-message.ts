import chalk from "chalk";
import { wait } from "../utils/helpers";

export async function renderIntroMessage() {
  await checkTerminalSize();
  console.clear();
  const trimmedText = getTrimmedTitleText();
  console.log(trimmedText);
  await wait(1500);
  console.clear();
}

function getTrimmedTitleText(): string {
  const lines = TITLE_TEXT.split('\n');
  const { rows } = process.stdout;
  
  // Account for padding and other UI elements
  const availableRows = rows;
  
  if (availableRows >= lines.length) {
    return TITLE_TEXT;
  }

  // Calculate how many lines to remove from top and bottom
  const linesToRemove = lines.length - availableRows;
  const removeFromEachEnd = Math.floor(linesToRemove / 2);
  
  // Trim equal amounts from top and bottom
  const trimmedLines = lines.slice(removeFromEachEnd, lines.length - removeFromEachEnd);
  
  return trimmedLines.join('\n');
}

async function checkTerminalSize(): Promise<void> {
  const minRows = 16;
  const minCols = 80;
  const { rows, columns } = process.stdout;
  
  if (rows < minRows || columns < minCols) {
      console.clear();
      console.error(`Terminal window too small. Minimum size required: ${minCols}x${minRows}`);
      console.error(`Current size: ${columns}x${rows}`);
      console.log("Please resize your terminal window and try again.");
      await wait(5000);
      process.exit(1);
  }
}

export const TITLE_TEXT = `
${chalk.green(`●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●──┬──●`)}
${chalk.green(`   │     │     │     │     │     │     └──●  │     │     │     │     └──●`)}
${chalk.green(`   │     │     │     │     │     │           │     │     │     │`)}
${chalk.green(`   │     │     │     │     │     └──●──┬──●  │     │     │     └──●──┬──●`)}
${chalk.green(`   │     │     │     │     │           └──●  │     │     │           │`)}
${chalk.green(`   │     │     │     │     │                 │     │     │           └──●`)}
${chalk.green(`   │     │     │     │     └──●──┬──●──┬──●  │     │     └──●──┬──●──┬──●`)}
${chalk.green(`   │     │     │     │           │     └──●  │     └──●──┬──●  │     └──●`)}
${chalk.green(`   │     │     │     │           └──●        │           └──●  └──●`)}
${chalk.green(`   │${chalk.blue("▗▄▄▄▖▗▄▄▄▖▗▖ ▗▖")}  │ ${chalk.blue("▗▄▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖ ▗▖")}  │ ${chalk.blue("▗▄▄▄▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖")}──┬──●`)}
${chalk.green(`   │${chalk.blue("▐▌     █  ▐▌ ▐▌")}  │ ${chalk.blue("  █  ▐▌   ▐▌   ▐▌ ▐▌")}  │ ${chalk.blue("  █  ▐▌ ▐▌▐▌   ▐▌   ")}  └──●`)}
${chalk.green(`   │${chalk.blue("▐▛▀▀▘  █  ▐▛▀▜▌")}  │ ${chalk.blue("  █  ▐▛▀▀▘▐▌   ▐▛▀▜▌")}  │ ${chalk.blue("  █  ▐▛▀▚▖▐▛▀▀▘▐▛▀▀▘")}──┬──●`)}
${chalk.green(`   │${chalk.blue("▐▙▄▄▖  █  ▐▌ ▐▌")}  │ ${chalk.blue("  █  ▐▙▄▄▖▝▚▄▄▖▐▌ ▐▌")}  │ ${chalk.blue("  █  ▐▌ ▐▌▐▙▄▄▖▐▙▄▄▖")}  └──●`)}
${chalk.green(`   │     │     │     └──●                    │`)}
${chalk.green(`   │     │     └──●──┬──●──┬──●──┬──●──┬──●  └───●─┬──●──┬──●──┬──●──┬──●`)}
${chalk.green(`   │     └──●──┬──●  └──●  │     │     │           │     │     │     └──●`)}
${chalk.green(`   │           └──●──┬──●  │     │     │           │     │     └──●`)}
${chalk.green(`   │                 │     │     │     └──●──┬──●  │     └──●──┬──●`)}
${chalk.green(`   └──●──┬──●──┬──●  └──●  │     │           │     │           └──●──┬──●`)}
${chalk.green(`         │     │           │     │           └──●  │                 │`)}
${chalk.green(`         └──●  └──●        │     │                 └──●──┬──●──┬──●  └──●`)}
${chalk.green(`                           │     │                       │     └──●`)}
`;