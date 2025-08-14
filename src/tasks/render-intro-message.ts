import chalk from "chalk";
import { wait } from "../utils/helpers";
import { version } from "../../package.json";

const MAX_VIEW_HEIGHT = 20; // Match the max height from index.ts

export async function renderIntroMessage() {
  await checkTerminalSize();
  console.clear();
  const trimmedText = getTrimmedTitleText(version);
  console.log(trimmedText);
  await wait(1500);
  console.clear();
}

function getTrimmedTitleText(currVersion: string): string {
  const stripAnsi = (s: string) => s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  const lines = TITLE_TEXT.split('\n').filter(line => line.length > 0);
  const { columns } = process.stdout;

  const maxLineWidth = Math.max(...lines.map(line => stripAnsi(line).length));

  const horizontalPadding = Math.max(0, Math.floor((columns - maxLineWidth) / 2));

  // Space for extra subtitle + version lines
  const totalLines = lines.length + 2;
  const verticalPadding = Math.max(0, Math.floor((MAX_VIEW_HEIGHT - totalLines) / 2));

  const centeredLines = lines.map(line => ' '.repeat(horizontalPadding) + line);

  const subtitleStyled = chalk.dim.bold('Build • Learn • Level Up');
  const subtitleInnerPad = Math.max(0, Math.floor((maxLineWidth - stripAnsi(subtitleStyled).length) / 2));
  const subtitleLine = ' '.repeat(horizontalPadding + subtitleInnerPad) + subtitleStyled;

  const versionStyled = chalk.gray.bold(`v${currVersion}`);
  const versionInnerPad = Math.max(0, Math.floor((maxLineWidth - stripAnsi(versionStyled).length) / 2));
  const versionLine = ' '.repeat(horizontalPadding + versionInnerPad) + versionStyled;

  const verticallyPaddedLines = [
    ...Array(verticalPadding).fill(''),
    ...centeredLines,
    '',
    subtitleLine,
    versionLine,
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

export const TITLE_TEXT = `${chalk.hex('#00ffd1')('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.hex('#00ffd1')('║')}${chalk.hex('#00c2ff').bold(' ▗▄▄▄▖▗▄▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖ ')}${chalk.hex('#00ffd1')('║')}
${chalk.hex('#00ffd1')('║')}${chalk.hex('#9b5cff').bold(' ▐▌     █  ▐▌ ▐▌     █  ▐▌   ▐▌   ▐▌ ▐▌     █  ▐▌ ▐▌▐▌   ▐▌    ')}${chalk.hex('#00ffd1')('║')}
${chalk.hex('#00ffd1')('║')}${chalk.hex('#ff6ec7').bold(' ▐▛▀▀▘  █  ▐▛▀▜▌     █  ▐▛▀▀▘▐▌   ▐▛▀▜▌     █  ▐▛▀▚▖▐▛▀▀▘▐▛▀▀▘ ')}${chalk.hex('#00ffd1')('║')}
${chalk.hex('#00ffd1')('║')}${chalk.hex('#00ff85').bold(' ▐▙▄▄▖  █  ▐▌ ▐▌     █  ▐▙▄▄▖▝▚▄▄▖▐▌ ▐▌     █  ▐▌ ▐▌▐▙▄▄▖▐▙▄▄▖ ')}${chalk.hex('#00ffd1')('║')}
${chalk.hex('#00ffd1')('╚═══════════════════════════════════════════════════════════════╝')}`;
