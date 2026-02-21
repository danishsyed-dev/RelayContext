import chalk from "chalk";
import { isGitRepo } from "../utils/git.js";
import { isInitialized, getRelayDir } from "../utils/storage.js";
import { stageDirectory } from "../utils/git.js";
import {
    printBanner,
    printSuccess,
    printBox,
    printDim,
    spin,
} from "../utils/ui.js";

export async function shareCommand(): Promise<void> {
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

    const relayDir = await getRelayDir();

    const stageSpinner = spin("Staging .relayctx/ for Git commit...");

    try {
        await stageDirectory(relayDir);
        stageSpinner.succeed("Staged .relayctx/");

        console.log();
        printSuccess(".relayctx/ staged for Git commit");
        console.log();

        printBox(
            [
                chalk.bold("Next steps:"),
                "",
                `  ${chalk.cyan("$")} ${chalk.white('git commit -m "relay: update context"')}`,
                `  ${chalk.cyan("$")} ${chalk.white("git push")}`,
            ].join("\n"),
            "📤 Ready to Share"
        );
        console.log();
    } catch (err: any) {
        stageSpinner.fail("Failed to stage .relayctx/");
        console.log();
        printDim(err.message);
        console.log();
        process.exit(1);
    }
}
