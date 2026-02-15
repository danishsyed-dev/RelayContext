import chalk from "chalk";

/**
 * Copy text to the system clipboard.
 * Falls back gracefully if clipboard access is unavailable.
 * Returns true if copy was successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // Dynamic import to handle environments where clipboardy fails
        const { default: clipboardy } = await import("clipboardy");
        await clipboardy.write(text);
        return true;
    } catch {
        // Clipboard not available (headless, WSL, SSH, etc.)
        return false;
    }
}

/**
 * Copy text and print status message.
 */
export async function copyAndNotify(text: string): Promise<void> {
    const copied = await copyToClipboard(text);
    if (copied) {
        console.log(chalk.green("✅ Copied to clipboard!"));
    } else {
        console.log(
            chalk.yellow("⚠️  Clipboard not available — use the prompt printed above.")
        );
    }
}
