import chalk from "chalk";
import { wait } from "../utils/helpers";
import { version } from "../../package.json";

const MAX_VIEW_HEIGHT = 20; // Match the max height from index.ts

export async function renderIntroMessage() {
  await checkTerminalSize();
  console.clear();
  const trimmedText = getTrimmedTitleText(version);
  await animateLineReveal(trimmedText, 100);
  await animateShineDiagonal(trimmedText, { bandWidth: 1, slope: 0.5, frameDelayMs: 12 });
  await wait(100);
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

async function animateLineReveal(text: string, totalDurationMs = 900): Promise<void> {
  const lines = text.split('\n');
  const steps = lines.length;
  const perStepDelay = Math.max(24, Math.min(120, Math.floor(totalDurationMs / Math.max(steps, 1))));

  for (let i = 0; i < steps; i++) {
    const frameLines = lines.map((line, idx) => {
      if (idx < i) return line;
      if (idx === i) return chalk.dim(line);
      return '';
    });
    console.clear();
    console.log(frameLines.join('\n'));
    await wait(perStepDelay);
  }

  console.clear();
  console.log(text);
}

function stripAnsiCodes(s: string): string {
  return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

type AnsiToken = { type: 'ansi' | 'text'; value: string };

function splitAnsiTokens(line: string): AnsiToken[] {
  const tokens: AnsiToken[] = [];
  const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ansiRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: line.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'ansi', value: match[0] });
    lastIndex = ansiRegex.lastIndex;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: 'text', value: line.slice(lastIndex) });
  }
  return tokens;
}

function applyStyleToVisibleRange(line: string, startInclusive: number, endExclusive: number, style: (s: string) => string): string {
  const tokens = splitAnsiTokens(line);
  let visibleIndex = 0;
  let result = '';
  let activeColorCode = '';
  let activeBoldCode = '';

  for (const token of tokens) {
    if (token.type === 'ansi') {
      const ansi = token.value;
      // Track active SGR so we can restore original styling after our highlight resets it
      if (/\x1b\[0m/.test(ansi)) {
        activeColorCode = '';
        activeBoldCode = '';
      } else if (/\x1b\[39m/.test(ansi)) {
        activeColorCode = '';
      } else if (/\x1b\[22m/.test(ansi)) {
        activeBoldCode = '';
      } else if (/\x1b\[(?:38;[^m]*|3[0-7]|9[0-7])m/.test(ansi)) {
        activeColorCode = ansi;
      } else if (/\x1b\[1m/.test(ansi)) {
        activeBoldCode = ansi;
      }
      result += ansi;
      continue;
    }
    for (let i = 0; i < token.value.length; i++) {
      const ch = token.value[i];
      const inRange = visibleIndex >= startInclusive && visibleIndex < endExclusive;
      if (inRange) {
        // Apply shine style to the character, then re-apply the original active SGR so following chars keep their color
        result += style(ch) + activeColorCode + activeBoldCode;
      } else {
        result += ch;
      }
      visibleIndex += 1;
    }
  }
  return result;
}

async function animateShineDiagonal(
  text: string,
  opts: { bandWidth?: number; slope?: number; frameDelayMs?: number } = {}
): Promise<void> {
  const bandWidth = Math.max(2, Math.floor(opts.bandWidth ?? 6));
  const slope = opts.slope ?? 0.5;
  const frameDelayMs = opts.frameDelayMs || 12;

  const lines = text.split('\n');
  const isTitleLine = (line: string) => line.includes('╔') || line.includes('╚') || line.includes('║');
  const titleLineIndices = lines
    .map((line, idx) => (isTitleLine(line) ? idx : -1))
    .filter(idx => idx !== -1);

  const maxWidth = Math.max(...titleLineIndices.map(i => stripAnsiCodes(lines[i]).length));
  const totalFrames = maxWidth + bandWidth * 2;

  for (let frame = -bandWidth; frame < totalFrames - bandWidth; frame++) {
    const rendered = lines.map((line, idx) => {
      if (!titleLineIndices.includes(idx)) return line;
      const lineOffset = titleLineIndices.indexOf(idx);
      const center = frame + Math.floor(lineOffset * slope);
      const start = center - Math.floor(bandWidth / 2);
      const end = center + Math.ceil(bandWidth / 2);
      return applyStyleToVisibleRange(line, start, end, s => chalk.whiteBright.bold(s));
    });
    console.clear();
    console.log(rendered.join('\n'));
    await wait(frameDelayMs);
  }

  console.clear();
  console.log(text);
}

export const TITLE_TEXT = `${chalk.hex('#00a3a3')('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.hex('#00a3a3')('║')}${chalk.hex('#008bd6').bold(' ▗▄▄▄▖▗▄▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖ ▗▖   ▗▄▄▄▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖ ')}${chalk.hex('#00a3a3')('║')}
${chalk.hex('#00a3a3')('║')}${chalk.hex('#6b4cff').bold(' ▐▌     █  ▐▌ ▐▌     █  ▐▌   ▐▌   ▐▌ ▐▌     █  ▐▌ ▐▌▐▌   ▐▌    ')}${chalk.hex('#00a3a3')('║')}
${chalk.hex('#00a3a3')('║')}${chalk.hex('#d64aa9').bold(' ▐▛▀▀▘  █  ▐▛▀▜▌     █  ▐▛▀▀▘▐▌   ▐▛▀▜▌     █  ▐▛▀▚▖▐▛▀▀▘▐▛▀▀▘ ')}${chalk.hex('#00a3a3')('║')}
${chalk.hex('#00a3a3')('║')}${chalk.hex('#00a85a').bold(' ▐▙▄▄▖  █  ▐▌ ▐▌     █  ▐▙▄▄▖▝▚▄▄▖▐▌ ▐▌     █  ▐▌ ▐▌▐▙▄▄▖▐▙▄▄▖ ')}${chalk.hex('#00a3a3')('║')}
${chalk.hex('#00a3a3')('╚═══════════════════════════════════════════════════════════════╝')}`;
