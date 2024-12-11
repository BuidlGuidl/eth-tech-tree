import chalk from "chalk";
import { wait } from "../utils/helpers";

const MAX_VIEW_HEIGHT = 20; // Match the max height from index.ts

export async function renderIntroMessage() {
  await checkTerminalSize();
  console.clear();
  const trimmedText = getTrimmedTitleText();
  console.log(trimmedText);
  await wait(1500);
  console.clear();
}

function getTrimmedTitleText(): string {
  const lines = TITLE_TEXT.split('\n').filter(line => line.length > 0);
  const { columns } = process.stdout;
  
  // Calculate the width of the longest line (without ANSI escape codes)
  const maxLineWidth = Math.max(...lines.map(line => 
    line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').length
  ));
  
  // Calculate horizontal padding
  const horizontalPadding = Math.max(0, Math.floor((columns - maxLineWidth) / 2));
  
  // Calculate vertical padding within MAX_VIEW_HEIGHT
  const verticalPadding = Math.max(0, Math.floor((MAX_VIEW_HEIGHT - lines.length) / 2));
  
  // Add horizontal padding to each line
  const centeredLines = lines.map(line => ' '.repeat(horizontalPadding) + line);
  
  // Add vertical padding
  const verticallyPaddedLines = [
    ...Array(verticalPadding).fill(''),
    ...centeredLines,
    ...Array(verticalPadding).fill('')
  ];
  
  return verticallyPaddedLines.join('\n');
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

export const TITLE_TEXT = `${chalk.green('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.green('║')}${chalk.blue(' ▗▄▄▄▖▗▄▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖ ')}${chalk.green('║')}
${chalk.green('║')}${chalk.blue(' ▐▌     █  ▐▌ ▐▌     █  ▐▌   ▐▌   ▐▌ ▐▌     █  ▐▌ ▐▌▐▌   ▐▌    ')}${chalk.green('║')}
${chalk.green('║')}${chalk.blue(' ▐▛▀▀▘  █  ▐▛▀▜▌     █  ▐▛▀▀▘▐▌   ▐▛▀▜▌     █  ▐▛▀▚▖▐▛▀▀▘▐▛▀▀▘ ')}${chalk.green('║')}
${chalk.green('║')}${chalk.blue(' ▐▙▄▄▖  █  ▐▌ ▐▌     █  ▐▙▄▄▖▝▚▄▄▖▐▌ ▐▌     █  ▐▌ ▐▌▐▙▄▄▖▐▙▄▄▖ ')}${chalk.green('║')}
${chalk.green('╚═══════════════════════════════════════════════════════════════╝')}`;