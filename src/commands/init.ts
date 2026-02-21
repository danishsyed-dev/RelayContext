import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { isGitRepo, getRepoRoot } from "../utils/git.js";
import { initRelayDir, isInitialized } from "../utils/storage.js";
import {
    printBanner,
    printSuccess,
    printWarning,
    printInfo,
    printBox,
    spin,
    validateGitRepo,
} from "../utils/ui.js";

export async function initCommand(): Promise<void> {
    printBanner();

    // Check if inside a Git repository
    const spinner = spin("Checking Git repository...");
    const isRepo = await isGitRepo();
    if (!isRepo) {
        spinner.fail(chalk.red("Not a Git repository"));
        printInfo('Run `git init` first to create a repository.');
        process.exit(1);
    }
    spinner.succeed("Git repository detected");

    // Check if already initialized
    if (await isInitialized()) {
        printWarning("RelayContext is already initialized in this repo.");
        return;
    }

    // Ask about .gitignore preference
    console.log();
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
    const initSpinner = spin("Creating .relayctx/ directory...");
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
            initSpinner.succeed("Initialized (added .relayctx/ to .gitignore)");
        } else {
            initSpinner.succeed("Initialized");
        }
    } else {
        initSpinner.succeed("Initialized");
    }

    console.log();
    printSuccess(`RelayContext initialized at ${relayDir}`);
    console.log();

    // Quick-start tips
    printBox(
        [
            chalk.bold("Quick Start:"),
            "",
            `  ${chalk.cyan("$")} ${chalk.white("relayctx save")}         Save your reasoning context`,
            `  ${chalk.cyan("$")} ${chalk.white("relayctx resume")}       Generate AI continuation prompt`,
            `  ${chalk.cyan("$")} ${chalk.white("relayctx log")}          View context history`,
            "",
            chalk.dim("  Tip: Run `relayctx save` before switching AI tools!"),
        ].join("\n"),
        "🚀 Getting Started"
    );
    console.log();
}
