import { describe, it, expect, vi, afterEach } from "vitest";
import { sanitizeBranchName, generateEntryId } from "../../src/utils/storage.js";

// ─── sanitizeBranchName ───

describe("sanitizeBranchName", () => {
    it("replaces '/' with '--'", () => {
        expect(sanitizeBranchName("feature/auth")).toBe("feature--auth");
    });

    it("handles multiple slashes", () => {
        expect(sanitizeBranchName("feat/scope/thing")).toBe("feat--scope--thing");
    });

    it("returns unchanged string with no slashes", () => {
        expect(sanitizeBranchName("main")).toBe("main");
        expect(sanitizeBranchName("my-branch")).toBe("my-branch");
    });
});

// ─── generateEntryId ───

describe("generateEntryId", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns a string matching the pattern YYYYMMDDTHHMMSSz", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-05-23T14:30:45Z"));

        const id = generateEntryId();

        // Pattern: YYYYMMDDTHHMMSSz  (e.g. 20260523T143045Z)
        expect(id).toMatch(/^\d{8}T\d{6}Z$/);
        expect(id).toBe("20260523T143045Z");
    });

    it("returns different IDs when called at different times", () => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date("2026-05-23T10:00:00Z"));
        const id1 = generateEntryId();

        vi.setSystemTime(new Date("2026-05-23T10:00:01Z"));
        const id2 = generateEntryId();

        expect(id1).not.toBe(id2);
    });

    it("zero-pads single-digit months, days, hours, minutes, seconds", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-05T03:07:09Z"));

        const id = generateEntryId();
        expect(id).toBe("20260105T030709Z");
    });
});
