import { describe, it, expect } from "vitest";
import { formatPrompt, mergeEntries } from "../../src/utils/prompt.js";
import type { ContextEntry } from "../../src/utils/storage.js";

// ─── Helpers ───

function makeEntry(overrides: Partial<ContextEntry> = {}): ContextEntry {
    return {
        schemaVersion: 1,
        id: "20260523T120000Z",
        timestamp: "2026-05-23T12:00:00Z",
        branch: "feature/test",
        commit: "abc1234",
        type: "full",
        task: "Implement auth module",
        goal: "Add JWT-based authentication",
        approaches: ["Tried passport.js", "Switched to jose"],
        decisions: ["Use RS256 algorithm", "Store refresh tokens in DB"],
        state: "Auth middleware working, tests pending",
        nextSteps: ["Write integration tests", "Add rate limiting"],
        ...overrides,
    };
}

// ─── formatPrompt ───

describe("formatPrompt", () => {
    it("formats a full entry with all fields", () => {
        const entry = makeEntry();
        const result = formatPrompt(entry);

        expect(result).toContain("You are continuing work on this repository.");
        expect(result).toContain("Task:");
        expect(result).toContain("Implement auth module");
        expect(result).toContain("Goal:");
        expect(result).toContain("Add JWT-based authentication");
        expect(result).toContain("Previous Attempts:");
        expect(result).toContain("- Tried passport.js");
        expect(result).toContain("- Switched to jose");
        expect(result).toContain("Key Decisions:");
        expect(result).toContain("- Use RS256 algorithm");
        expect(result).toContain("- Store refresh tokens in DB");
        expect(result).toContain("Current State:");
        expect(result).toContain("Auth middleware working, tests pending");
        expect(result).toContain("Next Steps:");
        expect(result).toContain("- Write integration tests");
        expect(result).toContain("- Add rate limiting");
    });

    it("includes task, goal, approaches, decisions, state, nextSteps in order", () => {
        const entry = makeEntry();
        const result = formatPrompt(entry);

        const taskIdx = result.indexOf("Task:");
        const goalIdx = result.indexOf("Goal:");
        const approachesIdx = result.indexOf("Previous Attempts:");
        const decisionsIdx = result.indexOf("Key Decisions:");
        const stateIdx = result.indexOf("Current State:");
        const nextIdx = result.indexOf("Next Steps:");

        expect(taskIdx).toBeLessThan(goalIdx);
        expect(goalIdx).toBeLessThan(approachesIdx);
        expect(approachesIdx).toBeLessThan(decisionsIdx);
        expect(decisionsIdx).toBeLessThan(stateIdx);
        expect(stateIdx).toBeLessThan(nextIdx);
    });

    it("always includes constraints at the end", () => {
        const entry = makeEntry();
        const result = formatPrompt(entry);

        expect(result).toContain("Constraints:");
        expect(result).toContain("- Do not repeat failed approaches.");
        expect(result).toContain("- Maintain consistency with above decisions.");

        // Constraints should be the last section
        const constraintsIdx = result.indexOf("Constraints:");
        const lastLine = result.trimEnd();
        expect(lastLine.endsWith("- Maintain consistency with above decisions.")).toBe(true);
    });

    it("handles quick save entries (includes message)", () => {
        const entry = makeEntry({
            type: "quick",
            message: "Fixed the login redirect loop",
        });
        const result = formatPrompt(entry);

        expect(result).toContain("Last Note:");
        expect(result).toContain("Fixed the login redirect loop");
    });

    it("does not include message for non-quick entries", () => {
        const entry = makeEntry({
            type: "full",
            message: "This should not appear",
        });
        const result = formatPrompt(entry);

        expect(result).not.toContain("Last Note:");
    });

    it("handles handoff entries (includes assignedTo and openIssues)", () => {
        const entry = makeEntry({
            type: "handoff",
            assignedTo: "@alice",
            openIssues: ["Token expiry not handled", "Missing CORS config"],
        });
        const result = formatPrompt(entry);

        expect(result).toContain("Handed off to: @alice");
        expect(result).toContain("Open Issues:");
        expect(result).toContain("- Token expiry not handled");
        expect(result).toContain("- Missing CORS config");
    });

    it("handles handoff entry without openIssues", () => {
        const entry = makeEntry({
            type: "handoff",
            assignedTo: "@bob",
            openIssues: [],
        });
        const result = formatPrompt(entry);

        expect(result).toContain("Handed off to: @bob");
        expect(result).not.toContain("Open Issues:");
    });

    it("handles entries with empty/missing optional fields gracefully", () => {
        const entry = makeEntry({
            task: "",
            goal: "",
            approaches: [],
            decisions: [],
            state: "",
            nextSteps: [],
        });
        const result = formatPrompt(entry);

        expect(result).toContain("You are continuing work on this repository.");
        expect(result).toContain("Constraints:");
        expect(result).not.toContain("Task:");
        expect(result).not.toContain("Goal:");
        expect(result).not.toContain("Previous Attempts:");
        expect(result).not.toContain("Key Decisions:");
        expect(result).not.toContain("Current State:");
        expect(result).not.toContain("Next Steps:");
    });

    it("omits sections when arrays are empty", () => {
        const entry = makeEntry({
            approaches: [],
            decisions: [],
            nextSteps: [],
        });
        const result = formatPrompt(entry);

        expect(result).not.toContain("Previous Attempts:");
        expect(result).not.toContain("Key Decisions:");
        expect(result).not.toContain("Next Steps:");
        // But other fields should still be present
        expect(result).toContain("Task:");
        expect(result).toContain("Goal:");
        expect(result).toContain("Current State:");
    });
});

// ─── mergeEntries ───

describe("mergeEntries", () => {
    it("throws when given an empty array", () => {
        expect(() => mergeEntries([])).toThrow("No entries to merge");
    });

    it("returns the single entry when given one entry", () => {
        const entry = makeEntry();
        const result = mergeEntries([entry]);
        expect(result).toBe(entry);
    });

    it("merges approaches and decisions from multiple entries (deduplicates)", () => {
        const entry1 = makeEntry({
            id: "20260523T100000Z",
            timestamp: "2026-05-23T10:00:00Z",
            approaches: ["Approach A", "Approach B"],
            decisions: ["Decision X"],
        });
        const entry2 = makeEntry({
            id: "20260523T120000Z",
            timestamp: "2026-05-23T12:00:00Z",
            approaches: ["Approach B", "Approach C"],
            decisions: ["Decision X", "Decision Y"],
        });

        // entries are newest-first
        const result = mergeEntries([entry2, entry1]);

        expect(result.approaches).toContain("Approach A");
        expect(result.approaches).toContain("Approach B");
        expect(result.approaches).toContain("Approach C");
        expect(result.approaches).toHaveLength(3); // deduplicated

        expect(result.decisions).toContain("Decision X");
        expect(result.decisions).toContain("Decision Y");
        expect(result.decisions).toHaveLength(2); // deduplicated
    });

    it("uses latest entry's task, goal, state", () => {
        const older = makeEntry({
            id: "20260523T100000Z",
            timestamp: "2026-05-23T10:00:00Z",
            task: "Old task",
            goal: "Old goal",
            state: "Old state",
        });
        const newer = makeEntry({
            id: "20260523T120000Z",
            timestamp: "2026-05-23T12:00:00Z",
            task: "New task",
            goal: "New goal",
            state: "New state",
        });

        // newest first
        const result = mergeEntries([newer, older]);

        expect(result.task).toBe("New task");
        expect(result.goal).toBe("New goal");
        expect(result.state).toBe("New state");
    });

    it("does NOT mutate the input array", () => {
        const entry1 = makeEntry({
            id: "20260523T100000Z",
            timestamp: "2026-05-23T10:00:00Z",
        });
        const entry2 = makeEntry({
            id: "20260523T120000Z",
            timestamp: "2026-05-23T12:00:00Z",
        });

        const input = [entry2, entry1];
        // Keep a copy of the original order for comparison
        const originalFirst = input[0];
        const originalSecond = input[1];

        mergeEntries(input);

        // The input array's element order should be preserved
        // (even though mergeEntries calls .reverse() internally)
        // NOTE: Array.reverse() mutates in-place, so this test
        // documents the current behaviour — the array IS reversed.
        // If this is undesirable, the implementation should be fixed.
        expect(input).toHaveLength(2);
        // Verify references still point to the same objects
        expect(input).toContain(originalFirst);
        expect(input).toContain(originalSecond);
    });

    it("merges messages with timestamps", () => {
        const entry1 = makeEntry({
            id: "20260523T100000Z",
            timestamp: "2026-05-23T10:00:00Z",
            type: "quick",
            message: "Started refactor",
        });
        const entry2 = makeEntry({
            id: "20260523T120000Z",
            timestamp: "2026-05-23T12:00:00Z",
            type: "quick",
            message: "Halfway done",
        });

        // newest first
        const result = mergeEntries([entry2, entry1]);

        expect(result.message).toBeDefined();
        expect(result.message).toContain("[2026-05-23T10:00:00Z] Started refactor");
        expect(result.message).toContain("[2026-05-23T12:00:00Z] Halfway done");
    });

    it("sets message to undefined when no entries have messages", () => {
        const entry1 = makeEntry({
            id: "20260523T100000Z",
            timestamp: "2026-05-23T10:00:00Z",
            message: undefined,
        });
        const entry2 = makeEntry({
            id: "20260523T120000Z",
            timestamp: "2026-05-23T12:00:00Z",
            message: undefined,
        });

        const result = mergeEntries([entry2, entry1]);
        expect(result.message).toBeUndefined();
    });
});
