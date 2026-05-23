import { describe, it, expect } from "vitest";
import { taskFromBranch } from "../../src/utils/git.js";

describe("taskFromBranch", () => {
    it("strips 'feature/' prefix and capitalizes", () => {
        expect(taskFromBranch("feature/payment-refactor")).toBe("Payment refactor");
    });

    it("strips 'fix/' prefix", () => {
        expect(taskFromBranch("fix/login-bug")).toBe("Login bug");
    });

    it("strips 'bugfix/' prefix", () => {
        expect(taskFromBranch("bugfix/crash-on-startup")).toBe("Crash on startup");
    });

    it("strips 'hotfix/' prefix", () => {
        expect(taskFromBranch("hotfix/security-patch")).toBe("Security patch");
    });

    it("strips 'chore/' prefix", () => {
        expect(taskFromBranch("chore/update-deps")).toBe("Update deps");
    });

    it("strips 'refactor/' prefix", () => {
        expect(taskFromBranch("refactor/auth-module")).toBe("Auth module");
    });

    it("strips 'docs/' prefix", () => {
        expect(taskFromBranch("docs/api-reference")).toBe("Api reference");
    });

    it("replaces hyphens with spaces", () => {
        expect(taskFromBranch("feature/my-cool-feature")).toBe("My cool feature");
    });

    it("replaces underscores with spaces", () => {
        expect(taskFromBranch("feature/my_cool_feature")).toBe("My cool feature");
    });

    it("replaces mixed hyphens and underscores with spaces", () => {
        expect(taskFromBranch("fix/some-mixed_separators")).toBe("Some mixed separators");
    });

    it("returns empty string for 'main'", () => {
        expect(taskFromBranch("main")).toBe("");
    });

    it("returns empty string for 'master'", () => {
        expect(taskFromBranch("master")).toBe("");
    });

    it("returns empty string for 'HEAD'", () => {
        expect(taskFromBranch("HEAD")).toBe("");
    });

    it("returns empty string for empty input", () => {
        expect(taskFromBranch("")).toBe("");
    });

    it("handles branch with no prefix", () => {
        expect(taskFromBranch("my-feature")).toBe("My feature");
    });

    it("handles prefix stripping case-insensitively", () => {
        expect(taskFromBranch("Feature/something-cool")).toBe("Something cool");
        expect(taskFromBranch("FIX/big-problem")).toBe("Big problem");
    });
});
