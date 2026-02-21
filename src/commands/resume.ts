import chalk from "chalk";
import { isGitRepo, getCurrentBranch } from "../utils/git.js";
import {
    isInitialized,
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
} from "../utils/ui.js";

export async function resumeCommand(options: {
    depth?: number;
}): Promise<void> {
    printBanner();

    // Validate environment
    const spinner = spin("Checking Git repository...");
    const isRepo = await isGitRepo();
    if (!isRepo) {
        spinner.fail(chalk.red("Not a Git repository"));
        process.exit(1);
    }

    const initialized = await isInitialized();
    if (!initialized) {
        spinner.fail(chalk.red("RelayContext not initialized"));
        printDim('Run `relayctx init` to set up this project.');
        process.exit(1);
    }
    spinner.succeed("Repository verified");

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
