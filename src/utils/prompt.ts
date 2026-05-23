import type { ContextEntry } from "./storage.js";

/**
 * Format a single context entry into a structured AI continuation prompt.
 */
export function formatPrompt(entry: ContextEntry): string {
    const lines: string[] = [];

    lines.push("You are continuing work on this repository.");
    lines.push("");

    if (entry.task) {
        lines.push("Task:");
        lines.push(entry.task);
        lines.push("");
    }

    if (entry.goal) {
        lines.push("Goal:");
        lines.push(entry.goal);
        lines.push("");
    }

    if (entry.approaches && entry.approaches.length > 0) {
        lines.push("Previous Attempts:");
        for (const a of entry.approaches) {
            lines.push(`- ${a}`);
        }
        lines.push("");
    }

    if (entry.decisions && entry.decisions.length > 0) {
        lines.push("Key Decisions:");
        for (const d of entry.decisions) {
            lines.push(`- ${d}`);
        }
        lines.push("");
    }

    if (entry.state) {
        lines.push("Current State:");
        lines.push(entry.state);
        lines.push("");
    }

    if (entry.nextSteps && entry.nextSteps.length > 0) {
        lines.push("Next Steps:");
        for (const s of entry.nextSteps) {
            lines.push(`- ${s}`);
        }
        lines.push("");
    }

    // Quick save — show the message
    if (entry.type === "quick" && entry.message) {
        lines.push("Last Note:");
        lines.push(entry.message);
        lines.push("");
    }

    // Handoff info
    if (entry.type === "handoff") {
        if (entry.assignedTo) {
            lines.push(`Handed off to: ${entry.assignedTo}`);
            lines.push("");
        }
        if (entry.openIssues && entry.openIssues.length > 0) {
            lines.push("Open Issues:");
            for (const issue of entry.openIssues) {
                lines.push(`- ${issue}`);
            }
            lines.push("");
        }
    }

    lines.push("Constraints:");
    lines.push("- Do not repeat failed approaches.");
    lines.push("- Maintain consistency with above decisions.");

    return lines.join("\n");
}

/**
 * Merge multiple entries into a single richer prompt.
 * Used when `resume --depth N` is specified with N > 1.
 *
 * Strategy: Union all approaches, decisions, nextSteps.
 * Use the latest entry's task, goal, and state.
 */
export function mergeEntries(entries: ContextEntry[]): ContextEntry {
    if (entries.length === 0) {
        throw new Error("No entries to merge");
    }

    if (entries.length === 1) {
        return entries[0];
    }

    // entries are in newest-first order
    const latest = entries[0];

    // Collect unique values from all entries
    const allApproaches = new Set<string>();
    const allDecisions = new Set<string>();
    const allMessages: string[] = [];

    for (const entry of [...entries].reverse()) {
        // oldest first for chronological order
        entry.approaches?.forEach((a) => allApproaches.add(a));
        entry.decisions?.forEach((d) => allDecisions.add(d));
        if (entry.message) {
            allMessages.push(`[${entry.timestamp}] ${entry.message}`);
        }
    }

    return {
        ...latest,
        approaches: Array.from(allApproaches),
        decisions: Array.from(allDecisions),
        message: allMessages.length > 0 ? allMessages.join("\n") : undefined,
    };
}
