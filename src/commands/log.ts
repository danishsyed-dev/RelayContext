import chalk from "chalk";
import Table from "cli-table3";
import { isGitRepo, getCurrentBranch } from "../utils/git.js";
import { isInitialized, getEntries } from "../utils/storage.js";
import {
    printBanner,
    printWarning,
    printDim,
    spin,
    timeAgo,
} from "../utils/ui.js";

export async function logCommand(): Promise<void> {
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
    const loadSpinner = spin(`Loading context history for "${branch}"...`);
    const entries = await getEntries(branch);

    if (entries.length === 0) {
        loadSpinner.warn(chalk.yellow("No entries found"));
        console.log();
        printWarning(
            `No saved context for branch "${branch}". Run \`relayctx save\` first.`
        );
        console.log();
        return;
    }
    loadSpinner.succeed(`Found ${entries.length} entries on "${chalk.cyan(branch)}"`);

    console.log();

    // Build styled table
    const table = new Table({
        head: [
            chalk.bold.cyan("ID"),
            chalk.bold.cyan("When"),
            chalk.bold.cyan("Type"),
            chalk.bold.cyan("Task / Message"),
        ],
        style: {
            head: [],
            border: ["dim"],
        },
        colWidths: [22, 14, 10, 40],
        wordWrap: true,
    });

    // Type color map
    const typeColor = (type: string): string => {
        switch (type) {
            case "full":
                return chalk.blue(type);
            case "quick":
                return chalk.yellow(type);
            case "handoff":
                return chalk.magenta(type);
            default:
                return chalk.white(type);
        }
    };

    for (const entry of entries) {
        const relative = timeAgo(entry.timestamp);
        const task =
            entry.type === "quick"
                ? entry.message || "(quick save)"
                : entry.task || "(no task)";

        // Truncate task if too long
        const maxTaskLen = 36;
        const truncatedTask =
            task.length > maxTaskLen ? task.slice(0, maxTaskLen - 3) + "..." : task;

        table.push([
            chalk.white(entry.id),
            chalk.dim(relative),
            typeColor(entry.type),
            truncatedTask,
        ]);
    }

    console.log(table.toString());
    console.log();
    printDim(`Total: ${entries.length} entries`);
    console.log();
}
