import chalk from "chalk";
import { isGitRepo, getDiff, getDiffStat, getCurrentBranch } from "../utils/git.js";
import { isInitialized, getLatestEntry } from "../utils/storage.js";
import {
    printBanner,
    printWarning,
    printBox,
    printDim,
    spin,
    timeAgo,
} from "../utils/ui.js";

export async function diffCommand(): Promise<void> {
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
    const loadSpinner = spin("Loading last save...");
    const latestEntry = await getLatestEntry(branch);

    if (!latestEntry) {
        loadSpinner.warn(chalk.yellow("No saved context found"));
        console.log();
        printWarning(
            `No saved context for branch "${branch}". Run \`relayctx save\` first.`
        );
        console.log();
        return;
    }

    const commitHash = latestEntry.commit;
    if (!commitHash || commitHash === "unknown") {
        loadSpinner.warn(chalk.yellow("No valid commit hash"));
        console.log();
        printWarning("Last saved entry has no valid commit hash.");
        console.log();
        return;
    }

    loadSpinner.succeed(
        `Last save: ${chalk.dim(timeAgo(latestEntry.timestamp))} (${chalk.dim(commitHash)})`
    );

    // Get diff stat summary
    const diffStatSpinner = spin("Computing diff...");
    const stat = await getDiffStat(commitHash);
    const diff = await getDiff(commitHash);

    if (!diff) {
        diffStatSpinner.succeed("No changes since last save");
        console.log();
        printDim("Working tree is clean since last context save.");
        console.log();
        return;
    }

    diffStatSpinner.succeed("Diff computed");

    // Show stat summary
    if (stat) {
        console.log();
        printBox(chalk.dim(stat), "📊 Summary");
    }

    // Show diff with colorized output
    console.log();
    const lines = diff.split("\n");
    for (const line of lines) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
            console.log(chalk.green(`  ${line}`));
        } else if (line.startsWith("-") && !line.startsWith("---")) {
            console.log(chalk.red(`  ${line}`));
        } else if (line.startsWith("@@")) {
            console.log(chalk.cyan(`  ${line}`));
        } else if (line.startsWith("diff")) {
            console.log(chalk.bold(`  ${line}`));
        } else {
            console.log(`  ${line}`);
        }
    }

    console.log();
    printDim(`Last save: ${latestEntry.timestamp} (${latestEntry.id})`);
    console.log();
}
