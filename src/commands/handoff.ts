import chalk from "chalk";
import inquirer from "inquirer";
import {
    getCurrentBranch,
    getCurrentCommit,
} from "../utils/git.js";
import {
    getLatestEntry,
    writeEntry,
    generateEntryId,
    sanitizeBranchName,
    type ContextEntry,
} from "../utils/storage.js";
import {
    printBanner,
    printSuccess,
    printSection,
    printDim,
    printBox,
    spin,
    ensureRepoReady,
} from "../utils/ui.js";

export async function handoffCommand(user: string): Promise<void> {
    printBanner();

    // Validate environment
    await ensureRepoReady();

    // Clean the @prefix if present
    const assignedTo = user.replace(/^@/, "");
    if (!assignedTo) {
        const userSpinner = spin("Validating user...");
        userSpinner.fail(chalk.red("No user specified"));
        printDim("Usage: relayctx handoff @username");
        process.exit(1);
    }

    const branch = await getCurrentBranch();
    const commit = await getCurrentCommit();
    const prevEntry = await getLatestEntry(branch);

    printSection(`🤝 Handoff to @${assignedTo}`);
    console.log();

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

    const saveSpinner = spin("Saving handoff...");
    await writeEntry(entry);
    saveSpinner.succeed("Handoff saved");

    // Styled handoff card
    console.log();
    const cardLines = [
        `${chalk.bold("Assigned to:")}   ${chalk.magenta(`@${assignedTo}`)}`,
        `${chalk.bold("Branch:")}        ${chalk.cyan(branch)}`,
        `${chalk.bold("Summary:")}       ${answers.summary}`,
    ];
    if (openIssues.length > 0) {
        cardLines.push(`${chalk.bold("Open Issues:")}`);
        openIssues.forEach((issue: string) => {
            cardLines.push(`  ${chalk.dim("•")} ${issue}`);
        });
    }

    printBox(cardLines.join("\n"), "📤 Handoff Card");
    console.log();

    const safeBranch = sanitizeBranchName(branch);
    printSuccess(`Handoff → .relayctx/branches/${safeBranch}/entries/${entryId}.json`);
    console.log();
    printDim(
        `@${assignedTo} can run \`relayctx resume\` on branch "${branch}" to continue.`
    );
    console.log();
}
