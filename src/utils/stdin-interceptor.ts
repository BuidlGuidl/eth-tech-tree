import { emitKeypressEvents, createInterface, Interface, Key } from 'readline';
import { Transform } from 'stream';
import { TechTree } from '../index';

export class StdInInterceptor {
    private rl: Interface;
    private treeRef: TechTree;
    outputStream: Transform;

    constructor(treeRef: TechTree) {
        this.treeRef = treeRef;
        // Create a transform stream to intercept output
        this.outputStream = new Transform({
            transform(chunk, encoding, callback) {
                this.push(chunk);
                callback();
            }
        });

        // Setup readline interface
        this.rl = createInterface({
            input: process.stdin,
            output: this.outputStream,
            terminal: true
        });

        emitKeypressEvents(process.stdin);

        // Enable raw mode for key detection
        process.stdin.setRawMode(true);
        process.stdin.resume();

        // Handle keypress events
        process.stdin.on('keypress', async (str, key) => {
            if (key.ctrl && key.name === 'c') {
                this.cleanExit();
            }
            await this.treeRef.handleKeyPress(key);
        });

        // By default, pipe stdin to output stream
        process.stdin.pipe(this.outputStream);
    }

    private cleanExit(): void {
        // Clear the screen
        console.clear();
        // Move cursor to top
        process.stdout.cursorTo(0, 0);
        // Reset terminal
        process.stdout.write('\x1b[0m');
        // Show cursor
        process.stdout.write('\x1B[?25h');
        // Close streams
        this.close();
        // Exit process
        process.exit(0);
    }

    write(data: Buffer): void {
        this.outputStream.write(data);
    }

    clear(): void {
        console.clear();
    }

    close(): void {
        this.rl.close();
        process.stdin.setRawMode(false);
        this.outputStream.end();
    }
} 