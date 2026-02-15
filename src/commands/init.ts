import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { isGitRepo, getRepoRoot } from "../utils/git.js";
import { initRelayDir, isInitialized } from "../utils/storage.js";

export async function initCommand(): Promise<void> {
    // Check if inside a Git repository
    if (!(await isGitRepo())) {
        console.log(
            chalk.red("✖ Not a Git repository. Run `git init` first.")
        );
        process.exit(1);
    }

    // Check if already initialized
    if (await isInitialized()) {
        console.log(
            chalk.yellow("⚠️  RelayContext is already initialized in this repo.")
        );
        return;
    }

    // Ask about .gitignore preference
    const { commitToGit } = await inquirer.prompt([
        {
            type: "confirm",
            name: "commitToGit",
            message:
                "Should .relayctx/ be committed to Git? (yes for team use, no for personal)",
            default: true,
        },
    ]);

    // Initialize directory structure
    const relayDir = await initRelayDir(commitToGit);

    // If not committing, add to .gitignore
    if (!commitToGit) {
        const repoRoot = await getRepoRoot();
        const gitignorePath = path.join(repoRoot, ".gitignore");

        let gitignoreContent = "";
        if (await fs.pathExists(gitignorePath)) {
            gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
        }

        if (!gitignoreContent.includes(".relayctx/")) {
            const newLine = gitignoreContent.endsWith("\n") ? "" : "\n";
            await fs.appendFile(gitignorePath, `${newLine}.relayctx/\n`);
            console.log(chalk.dim("  Added .relayctx/ to .gitignore"));
        }
    }

    console.log(chalk.green(`✅ RelayContext initialized at ${relayDir}`));
    console.log(chalk.dim("  Run `relayctx save` to capture your first context."));
}
