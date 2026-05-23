import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { timeAgo } from "../../src/utils/ui.js";

describe("timeAgo", () => {
    const NOW = new Date("2026-05-23T12:00:00Z");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns 'just now' for timestamps less than 60 seconds ago", () => {
        // 30 seconds ago
        const ts = new Date(NOW.getTime() - 30 * 1000).toISOString();
        expect(timeAgo(ts)).toBe("just now");
    });

    it("returns 'just now' for a timestamp 0 seconds ago", () => {
        expect(timeAgo(NOW.toISOString())).toBe("just now");
    });

    it("returns 'just now' for a timestamp 59 seconds ago", () => {
        const ts = new Date(NOW.getTime() - 59 * 1000).toISOString();
        expect(timeAgo(ts)).toBe("just now");
    });

    it("returns 'Xm ago' for timestamps less than 60 minutes ago", () => {
        // 5 minutes ago
        const ts5 = new Date(NOW.getTime() - 5 * 60 * 1000).toISOString();
        expect(timeAgo(ts5)).toBe("5m ago");

        // 1 minute ago (exactly 60 seconds)
        const ts1 = new Date(NOW.getTime() - 60 * 1000).toISOString();
        expect(timeAgo(ts1)).toBe("1m ago");

        // 59 minutes ago
        const ts59 = new Date(NOW.getTime() - 59 * 60 * 1000).toISOString();
        expect(timeAgo(ts59)).toBe("59m ago");
    });

    it("returns 'Xh ago' for timestamps less than 24 hours ago", () => {
        // 1 hour ago
        const ts1 = new Date(NOW.getTime() - 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts1)).toBe("1h ago");

        // 5 hours ago
        const ts5 = new Date(NOW.getTime() - 5 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts5)).toBe("5h ago");

        // 23 hours ago
        const ts23 = new Date(NOW.getTime() - 23 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts23)).toBe("23h ago");
    });

    it("returns 'yesterday' for timestamps 1 day ago", () => {
        // Exactly 24 hours ago
        const ts = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts)).toBe("yesterday");

        // 36 hours ago (still 1 day in floor)
        const ts36 = new Date(NOW.getTime() - 36 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts36)).toBe("yesterday");
    });

    it("returns 'Xd ago' for timestamps 2-6 days ago", () => {
        // 2 days ago
        const ts2 = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts2)).toBe("2d ago");

        // 6 days ago
        const ts6 = new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts6)).toBe("6d ago");
    });

    it("returns 'Xw ago' for timestamps 7-29 days ago", () => {
        // 7 days ago → 1w ago
        const ts7 = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts7)).toBe("1w ago");

        // 14 days ago → 2w ago
        const ts14 = new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts14)).toBe("2w ago");

        // 29 days ago → 4w ago
        const ts29 = new Date(NOW.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts29)).toBe("4w ago");
    });

    it("returns 'Xmo ago' for timestamps 30+ days ago", () => {
        // 30 days ago → 1mo ago
        const ts30 = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts30)).toBe("1mo ago");

        // 60 days ago → 2mo ago
        const ts60 = new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts60)).toBe("2mo ago");

        // 365 days ago → 12mo ago
        const ts365 = new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(timeAgo(ts365)).toBe("12mo ago");
    });
});
