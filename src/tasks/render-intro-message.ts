import chalk from "chalk";
import { wait } from "../utils/helpers";

export async function renderIntroMessage() {
  console.clear();
  console.log(TITLE_TEXT);
  await wait(1500);
  console.clear();
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