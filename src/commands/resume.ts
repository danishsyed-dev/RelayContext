import chalk from "chalk";
import { isGitRepo, getCurrentBranch } from "../utils/git.js";
import {
    isInitialized,
    getLatestEntries,
} from "../utils/storage.js";
import { formatPrompt, mergeEntries } from "../utils/prompt.js";
import { copyAndNotify } from "../utils/clipboard.js";

export async function resumeCommand(options: {
    depth?: number;
}): Promise<void> {
    // Validate environment
    if (!(await isGitRepo())) {
        console.log(chalk.red("✖ Not a Git repository."));
        process.exit(1);
    }
    if (!(await isInitialized())) {
        console.log(
            chalk.red("✖ RelayContext not initialized. Run `relayctx init` first.")
        );
        process.exit(1);
    }

    const branch = await getCurrentBranch();
    const depth = options.depth || 1;
    const entries = await getLatestEntries(depth, branch);

    if (entries.length === 0) {
        console.log(
            chalk.yellow(
                `⚠️  No saved context for branch "${branch}". Run \`relayctx save\` first.`
            )
        );
        return;
    }

    // Merge if multiple entries requested
    const entry = depth > 1 ? mergeEntries(entries) : entries[0];

    // Format the continuation prompt
    const prompt = formatPrompt(entry);

    // Display
    console.log(chalk.cyan("\n─── Continuation Prompt ───\n"));
    console.log(prompt);
    console.log(chalk.cyan("\n───────────────────────────\n"));

    // Copy to clipboard
    await copyAndNotify(prompt);

    console.log(
        chalk.dim(
            `  Source: ${entries.length} entry(ies) from branch "${branch}"`
        )
    );
}
