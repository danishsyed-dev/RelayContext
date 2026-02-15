import chalk from "chalk";
import inquirer from "inquirer";
import {
    isGitRepo,
    getCurrentBranch,
    getCurrentCommit,
} from "../utils/git.js";
import {
    isInitialized,
    getLatestEntry,
    writeEntry,
    generateEntryId,
    sanitizeBranchName,
    type ContextEntry,
} from "../utils/storage.js";

export async function handoffCommand(user: string): Promise<void> {
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

    // Clean the @prefix if present
    const assignedTo = user.replace(/^@/, "");
    if (!assignedTo) {
        console.log(chalk.red("✖ Please specify a user: relayctx handoff @username"));
        process.exit(1);
    }

    const branch = await getCurrentBranch();
    const commit = await getCurrentCommit();
    const prevEntry = await getLatestEntry(branch);

    // Prompt for handoff details
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "summary",
            message: "Handoff summary:",
            default: prevEntry
                ? `${prevEntry.task} — ${prevEntry.state}`
                : undefined,
        },
        {
            type: "input",
            name: "openIssues",
            message: "Open issues to address? (comma-separated)",
            default: prevEntry ? prevEntry.nextSteps.join(", ") : undefined,
        },
    ]);

    const openIssues = answers.openIssues
        ? answers.openIssues
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    const entryId = generateEntryId();
    const entry: ContextEntry = {
        schemaVersion: 1,
        id: entryId,
        timestamp: new Date().toISOString(),
        branch,
        commit,
        type: "handoff",
        task: prevEntry?.task || answers.summary,
        goal: prevEntry?.goal || "",
        approaches: prevEntry?.approaches || [],
        decisions: prevEntry?.decisions || [],
        state: answers.summary,
        nextSteps: openIssues,
        assignedTo,
        openIssues,
    };

    const filePath = await writeEntry(entry);
    const safeBranch = sanitizeBranchName(branch);
    console.log(
        chalk.green(
            `\n✅ Handoff to @${assignedTo} saved → .relayctx/branches/${safeBranch}/entries/${entryId}.json`
        )
    );
    console.log(
        chalk.dim(
            `  @${assignedTo} can run \`relayctx resume\` on branch "${branch}" to continue.`
        )
    );
}
