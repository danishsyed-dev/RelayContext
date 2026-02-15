import chalk from "chalk";
import { isGitRepo } from "../utils/git.js";
import { isInitialized, getRelayDir } from "../utils/storage.js";
import { stageDirectory } from "../utils/git.js";

export async function shareCommand(): Promise<void> {
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

    const relayDir = await getRelayDir();

    try {
        await stageDirectory(relayDir);
        console.log(
            chalk.green("✅ .relayctx/ staged for Git commit.")
        );
        console.log(
            chalk.dim(
                '  Now run: git commit -m "relay: update context" && git push'
            )
        );
    } catch (err: any) {
        console.log(
            chalk.red(`✖ Failed to stage .relayctx/: ${err.message}`)
        );
        process.exit(1);
    }
}
