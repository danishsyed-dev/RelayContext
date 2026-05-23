import simpleGit, { SimpleGit } from "simple-git";
import path from "path";

function getGit(): SimpleGit {
    return simpleGit(process.cwd());
}

/**
 * Check if the current directory is inside a Git repository.
 */
export async function isGitRepo(): Promise<boolean> {
    try {
        const git = getGit();
        return await git.checkIsRepo();
    } catch {
        return false;
    }
}

/**
 * Get the root directory of the Git repository.
 */
export async function getRepoRoot(): Promise<string> {
    const git = getGit();
    const root = await git.revparse(["--show-toplevel"]);
    return root.trim();
}

/**
 * Get the current Git branch name.
 * Returns "HEAD" if in detached HEAD state.
 */
export async function getCurrentBranch(): Promise<string> {
    const git = getGit();
    try {
        const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
        return branch.trim();
    } catch {
        return "HEAD";
    }
}

/**
 * Get the short hash of the current HEAD commit.
 */
export async function getCurrentCommit(): Promise<string> {
    const git = getGit();
    try {
        const hash = await git.revparse(["--short", "HEAD"]);
        return hash.trim();
    } catch {
        return "unknown";
    }
}

/**
 * Get the diff between a given commit and HEAD.
 */
export async function getDiff(fromCommit: string): Promise<string> {
    const git = getGit();
    try {
        const diff = await git.diff([fromCommit, "HEAD"]);
        return diff;
    } catch {
        return "";
    }
}

/**
 * Get diff stat summary (files changed, insertions, deletions).
 */
export async function getDiffStat(fromCommit?: string): Promise<string> {
    const git = getGit();
    try {
        const args = fromCommit ? [fromCommit, "HEAD", "--stat"] : ["--stat"];
        const stat = await git.diff(args);
        return stat.trim();
    } catch {
        return "";
    }
}

/**
 * Get recent commit messages (up to N).
 */
export async function getRecentCommits(count: number = 5): Promise<string[]> {
    const git = getGit();
    try {
        const log = await git.log({ maxCount: count });
        return log.all.map((c) => c.message);
    } catch {
        return [];
    }
}

/**
 * Get the diff stat summary as a short string.
 * e.g. "3 files changed, last commit: fix replay handler"
 */
export async function getStateSummary(): Promise<string> {
    const commits = await getRecentCommits(1);
    const git = getGit();

    let filesChanged = 0;
    try {
        const diffSummary = await git.diffSummary(["HEAD~1", "HEAD"]);
        filesChanged = diffSummary.changed;
    } catch {
        // If there's only one commit or diff fails, that's okay
    }

    const lastCommit = commits.length > 0 ? commits[0] : "initial commit";
    if (filesChanged > 0) {
        return `${filesChanged} file(s) changed — last commit: "${lastCommit}"`;
    }
    return `Last commit: "${lastCommit}"`;
}

/**
 * Stage a directory for Git commit.
 */
export async function stageDirectory(dirPath: string): Promise<void> {
    const git = getGit();
    await git.add(dirPath);
}

/**
 * Derive a human-readable task name from a branch name.
 * e.g. "feature/payment-refactor" → "Payment refactor"
 */
export function taskFromBranch(branch: string): string {
    // Remove common prefixes
    const cleaned = branch
        .replace(/^(feature|fix|bugfix|hotfix|chore|refactor|docs)\//i, "")
        .replace(/[-_]/g, " ")
        .trim();

    if (!cleaned || cleaned === "main" || cleaned === "master" || cleaned === "HEAD") {
        return "";
    }

    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
