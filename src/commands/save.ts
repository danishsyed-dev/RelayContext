import chalk from "chalk";
import inquirer from "inquirer";
import {
    getCurrentBranch,
    getCurrentCommit,
    getStateSummary,
    taskFromBranch,
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
    printEntryPreview,
    spin,
    ensureRepoReady,
} from "../utils/ui.js";

export async function saveCommand(
    messageOrOpts?: string | { manual?: boolean }
): Promise<void> {
    printBanner();

    // Validate environment
    await ensureRepoReady();

    const branchSpinner = spin("Reading branch context...");
    const branch = await getCurrentBranch();
    const commit = await getCurrentCommit();
    const entryId = generateEntryId();
    branchSpinner.succeed(`Branch: ${chalk.cyan(branch)}  Commit: ${chalk.dim(commit)}`);

    // ─── Quick Save Mode ───
    if (typeof messageOrOpts === "string") {
        const entry: ContextEntry = {
            schemaVersion: 1,
            id: entryId,
            timestamp: new Date().toISOString(),
            branch,
            commit,
            type: "quick",
            task: "",
            goal: "",
            approaches: [],
            decisions: [],
            state: "",
            nextSteps: [],
            message: messageOrOpts,
        };

        console.log();
        printEntryPreview(entry);

        const saveSpinner = spin("Saving context...");
        await writeEntry(entry);
        saveSpinner.succeed("Saved");

        console.log();
        const safeBranch = sanitizeBranchName(branch);
        printSuccess(`Quick save → .relayctx/branches/${safeBranch}/entries/${entryId}.json`);
        console.log();
        return;
    }

    // ─── Determine mode: smart (default) vs manual ───
    const isManual =
        typeof messageOrOpts === "object" && messageOrOpts.manual === true;

    // Load previous entry for smart defaults
    const prevEntry = await getLatestEntry(branch);
    const autoTask = taskFromBranch(branch);
    const autoState = await getStateSummary();

    // ─── Smart Save: show prior context ───
    if (!isManual && (prevEntry || autoTask || autoState)) {
        printSection("📎 Git Context");
    }

    if (!isManual && prevEntry) {
        if (prevEntry.approaches.length > 0) {
            printDim("Previous approaches:");
            prevEntry.approaches.forEach((a) =>
                printDim(`  • ${a}`)
            );
        }
        if (prevEntry.decisions.length > 0) {
            printDim("Previous decisions:");
            prevEntry.decisions.forEach((d) =>
                printDim(`  • ${d}`)
            );
        }
        if (prevEntry.nextSteps.length > 0) {
            printDim("Previous next steps:");
            prevEntry.nextSteps.forEach((s) =>
                printDim(`  • ${s}`)
            );
        }
    }

    // Build default values
    const defaultTask = prevEntry?.task || autoTask || "";
    const defaultGoal = prevEntry?.goal || "";
    const defaultState = autoState || prevEntry?.state || "";

    // Prompt config — smart mode shows defaults, manual mode shows examples
    const taskPrompt = isManual
        ? 'What task are you working on? (e.g., "Refactor auth service")'
        : "Task:";
    const goalPrompt = isManual
        ? 'What is the goal? (e.g., "Reduce load time by 50%")'
        : "Goal:";
    const statePrompt = isManual
        ? 'What is the current state? (e.g., "Login page done, API pending")'
        : "Current state:";

    printSection("✏️  Your Input");
    console.log();

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "task",
            message: taskPrompt,
            default: defaultTask || undefined,
        },
        {
            type: "input",
            name: "goal",
            message: goalPrompt,
            default: defaultGoal || undefined,
        },
        {
            type: "input",
            name: "newApproaches",
            message: isManual
                ? "What approaches have you tried? (comma-separated)"
                : "Add new approaches? (comma-separated, or Enter to skip)",
            default: "",
        },
        {
            type: "input",
            name: "newDecisions",
            message: isManual
                ? "What key decisions have been made? (comma-separated)"
                : "Add new decisions? (comma-separated, or Enter to skip)",
            default: "",
        },
        {
            type: "input",
            name: "state",
            message: statePrompt,
            default: defaultState || undefined,
        },
        {
            type: "input",
            name: "nextSteps",
            message: isManual
                ? "What are the next steps? (comma-separated)"
                : "Next steps? (comma-separated, or Enter to keep previous)",
            default: !isManual && prevEntry
                ? prevEntry.nextSteps.join(", ")
                : undefined,
        },
    ]);

    // Helper: parse comma-separated input, strip leading bullets (- • *)
    const cleanListInput = (raw: string): string[] =>
        raw
            .split(",")
            .map((s: string) => s.trim().replace(/^[-•*]\s*/, ""))
            .filter(Boolean);

    // Merge approaches: carry forward previous + add new
    const prevApproaches = !isManual && prevEntry ? prevEntry.approaches : [];
    const newApproaches = answers.newApproaches
        ? cleanListInput(answers.newApproaches)
        : [];
    const allApproaches = [...new Set([...prevApproaches, ...newApproaches])];

    // Merge decisions: carry forward previous + add new
    const prevDecisions = !isManual && prevEntry ? prevEntry.decisions : [];
    const newDecisions = answers.newDecisions
        ? cleanListInput(answers.newDecisions)
        : [];
    const allDecisions = [...new Set([...prevDecisions, ...newDecisions])];

    // Parse next steps
    const nextSteps = answers.nextSteps
        ? cleanListInput(answers.nextSteps)
        : [];

    const entry: ContextEntry = {
        schemaVersion: 1,
        id: entryId,
        timestamp: new Date().toISOString(),
        branch,
        commit,
        type: "full",
        task: answers.task,
        goal: answers.goal,
        approaches: allApproaches,
        decisions: allDecisions,
        state: answers.state,
        nextSteps,
    };

    // ─── Preview ───
    console.log();
    printEntryPreview(entry);

    const { confirmSave } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirmSave",
            message: "Save this context?",
            default: true,
        },
    ]);

    if (!confirmSave) {
        console.log();
        printDim("Save cancelled.");
        console.log();
        return;
    }

    const saveSpinner = spin("Saving context...");
    await writeEntry(entry);
    saveSpinner.succeed("Saved");

    console.log();
    const safeBranch = sanitizeBranchName(branch);
    printSuccess(`Context saved → .relayctx/branches/${safeBranch}/entries/${entryId}.json`);
    console.log();
}
