import chalk from "chalk";
import { isGitRepo, getCurrentBranch } from "../utils/git.js";
import { isInitialized, getEntries } from "../utils/storage.js";

export async function logCommand(): Promise<void> {
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
    const entries = await getEntries(branch);

    if (entries.length === 0) {
        console.log(
            chalk.yellow(
                `⚠️  No saved context for branch "${branch}". Run \`relayctx save\` first.`
            )
        );
        return;
    }

    console.log(chalk.cyan(`\n📋 Context history for branch "${branch}":\n`));

    // Table header
    const idCol = "ID".padEnd(22);
    const timeCol = "Timestamp".padEnd(26);
    const typeCol = "Type".padEnd(10);
    const taskCol = "Task";
    console.log(chalk.bold(`  ${idCol}${timeCol}${typeCol}${taskCol}`));
    console.log(chalk.dim(`  ${"─".repeat(80)}`));

    // Table rows
    for (const entry of entries) {
        const id = entry.id.padEnd(22);
        const time = entry.timestamp.padEnd(26);
        const type = entry.type.padEnd(10);
        const task =
            entry.type === "quick"
                ? entry.message || "(quick save)"
                : entry.task || "(no task)";

        // Truncate task if too long
        const maxTaskLen = 40;
        const truncatedTask =
            task.length > maxTaskLen ? task.slice(0, maxTaskLen - 3) + "..." : task;

        console.log(`  ${chalk.white(id)}${chalk.dim(time)}${chalk.blue(type)}${truncatedTask}`);
    }

    console.log(chalk.dim(`\n  Total: ${entries.length} entries\n`));
}
