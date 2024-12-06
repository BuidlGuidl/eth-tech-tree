import chalk from "chalk";
import { wait } from "../utils/helpers";

export async function renderIntroMessage() {
  await checkTerminalSize();
  console.clear();
  console.log(TITLE_TEXT);
  await wait(1500);
  console.clear();
}

async function checkTerminalSize(): Promise<void> {
  const minRows = 10;
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