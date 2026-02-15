import chalk from "chalk";
import { isGitRepo, getDiff, getCurrentBranch } from "../utils/git.js";
import { isInitialized, getLatestEntry } from "../utils/storage.js";

export async function diffCommand(): Promise<void> {
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
    const latestEntry = await getLatestEntry(branch);

    if (!latestEntry) {
        console.log(
            chalk.yellow(
                `⚠️  No saved context for branch "${branch}". Run \`relayctx save\` first.`
            )
        );
        return;
    }

    const commitHash = latestEntry.commit;
    if (!commitHash || commitHash === "unknown") {
        console.log(
            chalk.yellow("⚠️  Last saved entry has no valid commit hash.")
        );
        return;
    }

    console.log(
        chalk.cyan(
            `\n📊 Changes since last save (commit ${commitHash}):\n`
        )
    );

    const diff = await getDiff(commitHash);

    if (!diff) {
        console.log(chalk.dim("  No changes since last save."));
    } else {
        // Colorize diff output
        const lines = diff.split("\n");
        for (const line of lines) {
            if (line.startsWith("+") && !line.startsWith("+++")) {
                console.log(chalk.green(line));
            } else if (line.startsWith("-") && !line.startsWith("---")) {
                console.log(chalk.red(line));
            } else if (line.startsWith("@@")) {
                console.log(chalk.cyan(line));
            } else if (line.startsWith("diff")) {
                console.log(chalk.bold(line));
            } else {
                console.log(line);
            }
        }
    }

    console.log(
        chalk.dim(
            `\n  Last save: ${latestEntry.timestamp} (${latestEntry.id})\n`
        )
    );
}
