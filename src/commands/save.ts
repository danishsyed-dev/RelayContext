import chalk from "chalk";
import inquirer from "inquirer";
import {
    isGitRepo,
    getCurrentBranch,
    getCurrentCommit,
    getStateSummary,
    taskFromBranch,
} from "../utils/git.js";
import {
    isInitialized,
    getLatestEntry,
    writeEntry,
    generateEntryId,
    sanitizeBranchName,
    type ContextEntry,
} from "../utils/storage.js";

export async function saveCommand(
    messageOrOpts?: string | { manual?: boolean }
): Promise<void> {
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
    const commit = await getCurrentCommit();
    const entryId = generateEntryId();

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

        const filePath = await writeEntry(entry);
        console.log(chalk.green(`✅ Quick save → ${filePath}`));
        return;
    }

    // ─── Determine mode: smart (default) vs manual ───
    const isManual =
        typeof messageOrOpts === "object" && messageOrOpts.manual === true;

    // Load previous entry for smart defaults
    const prevEntry = await getLatestEntry(branch);
    const autoTask = taskFromBranch(branch);
    const autoState = await getStateSummary();

    // ─── Smart Save: pre-populate from Git data + previous entry ───
    if (!isManual && (prevEntry || autoTask || autoState)) {
        console.log(chalk.cyan("📎 Auto-detected from Git:\n"));
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

    // Show existing approaches/decisions from previous entry
    if (!isManual && prevEntry) {
        if (prevEntry.approaches.length > 0) {
            console.log(chalk.dim("  Previous approaches:"));
            prevEntry.approaches.forEach((a) =>
                console.log(chalk.dim(`    • ${a}`))
            );
        }
        if (prevEntry.decisions.length > 0) {
            console.log(chalk.dim("  Previous decisions:"));
            prevEntry.decisions.forEach((d) =>
                console.log(chalk.dim(`    • ${d}`))
            );
        }
        if (prevEntry.nextSteps.length > 0) {
            console.log(chalk.dim("  Previous next steps:"));
            prevEntry.nextSteps.forEach((s) =>
                console.log(chalk.dim(`    • ${s}`))
            );
        }
        console.log();
    }

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

    const filePath = await writeEntry(entry);
    const safeBranch = sanitizeBranchName(branch);
    console.log(
        chalk.green(
            `\n✅ Context saved → .relayctx/branches/${safeBranch}/entries/${entryId}.json`
        )
    );
}
