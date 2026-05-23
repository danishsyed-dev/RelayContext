import chalk from "chalk";
import { getCurrentBranch } from "../utils/git.js";
import {
    getLatestEntries,
} from "../utils/storage.js";
import { formatPrompt, mergeEntries } from "../utils/prompt.js";
import { copyToClipboard } from "../utils/clipboard.js";
import {
    printBanner,
    printWarning,
    printBox,
    printClipboardBadge,
    printDim,
    spin,
    ensureRepoReady,
} from "../utils/ui.js";

export async function resumeCommand(options: {
    depth?: number;
}): Promise<void> {
    printBanner();

    // Validate environment
    await ensureRepoReady();

    const branch = await getCurrentBranch();
    const depth = options.depth || 1;

    const loadSpinner = spin("Loading branch context...");
    const entries = await getLatestEntries(depth, branch);

    if (entries.length === 0) {
        loadSpinner.warn(chalk.yellow("No saved context found"));
        console.log();
        printWarning(
            `No saved context for branch "${branch}". Run \`relayctx save\` first.`
        );
        console.log();
        return;
    }
    loadSpinner.succeed(`Loaded ${entries.length} entry(ies) from "${chalk.cyan(branch)}"`);

    // Merge if multiple entries requested
    const entry = depth > 1 ? mergeEntries(entries) : entries[0];

    // Format the continuation prompt
    const prompt = formatPrompt(entry);

    // Display in a styled box
    console.log();
    printBox(prompt, "📋 Continuation Prompt");
    console.log();

    // Copy to clipboard
    const copied = await copyToClipboard(prompt);
    printClipboardBadge(copied);

    printDim(
        `Source: ${entries.length} entry(ies) from branch "${branch}"`
    );
    console.log();
}
