import chalk from "chalk";

export function renderIntroMessage() {
  console.log(TITLE_TEXT);
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