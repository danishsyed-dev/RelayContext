import fs from "fs-extra";
import path from "path";
import { getRepoRoot, getCurrentBranch } from "./git.js";

const RELAY_DIR = ".relayctx";
const CONFIG_FILE = "config.json";
const BRANCHES_DIR = "branches";
const ENTRIES_DIR = "entries";

export interface RelayConfig {
    schemaVersion: number;
    createdAt: string;
    commitToGit: boolean;
}

export interface ContextEntry {
    schemaVersion: number;
    id: string;
    timestamp: string;
    branch: string;
    commit: string;
    type: "full" | "quick" | "handoff";
    task: string;
    goal: string;
    approaches: string[];
    decisions: string[];
    state: string;
    nextSteps: string[];
    message?: string;
    assignedTo?: string;
    openIssues?: string[];
}

/**
 * Sanitize a Git branch name for use as a folder name.
 * Replaces `/` with `--` to avoid nested directories.
 */
export function sanitizeBranchName(branch: string): string {
    return branch.replace(/\//g, "--");
}

/**
 * Get the absolute path to the .relayctx directory.
 */
export async function getRelayDir(): Promise<string> {
    const root = await getRepoRoot();
    return path.join(root, RELAY_DIR);
}

/**
 * Get the path to the branch-specific entries directory.
 */
export async function getBranchDir(branch?: string): Promise<string> {
    const relayDir = await getRelayDir();
    const branchName = branch || (await getCurrentBranch());
    const safeName = sanitizeBranchName(branchName);
    return path.join(relayDir, BRANCHES_DIR, safeName, ENTRIES_DIR);
}

/**
 * Check if RelayContext has been initialized in this repo.
 */
export async function isInitialized(): Promise<boolean> {
    const relayDir = await getRelayDir();
    return fs.pathExists(relayDir);
}

/**
 * Initialize the .relayctx directory structure.
 */
export async function initRelayDir(commitToGit: boolean): Promise<string> {
    const relayDir = await getRelayDir();
    const branchDir = await getBranchDir();

    // Create directories
    await fs.ensureDir(branchDir);

    // Write config
    const config: RelayConfig = {
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        commitToGit,
    };
    await fs.writeJson(path.join(relayDir, CONFIG_FILE), config, { spaces: 2 });

    return relayDir;
}

/**
 * Read the relay config.
 */
export async function getConfig(): Promise<RelayConfig> {
    const relayDir = await getRelayDir();
    const configPath = path.join(relayDir, CONFIG_FILE);
    return fs.readJson(configPath);
}

/**
 * Generate a timestamp-based entry ID.
 */
export function generateEntryId(): string {
    const now = new Date();
    const pad = (n: number, len = 2) => String(n).padStart(len, "0");
    return (
        `${now.getUTCFullYear()}` +
        `${pad(now.getUTCMonth() + 1)}` +
        `${pad(now.getUTCDate())}T` +
        `${pad(now.getUTCHours())}` +
        `${pad(now.getUTCMinutes())}` +
        `${pad(now.getUTCSeconds())}Z`
    );
}

/**
 * Write a context entry to the branch directory.
 */
export async function writeEntry(entry: ContextEntry): Promise<string> {
    const branchDir = await getBranchDir(entry.branch);
    await fs.ensureDir(branchDir);
    const filePath = path.join(branchDir, `${entry.id}.json`);
    await fs.writeJson(filePath, entry, { spaces: 2 });
    return filePath;
}

/**
 * Get all entries for a given branch, sorted by timestamp (oldest first).
 */
export async function getEntries(branch?: string): Promise<ContextEntry[]> {
    const branchDir = await getBranchDir(branch);

    if (!(await fs.pathExists(branchDir))) {
        return [];
    }

    const files = await fs.readdir(branchDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();

    const entries: ContextEntry[] = [];
    for (const file of jsonFiles) {
        try {
            const entry = await fs.readJson(path.join(branchDir, file));
            entries.push(entry);
        } catch {
            // Corrupt JSON — skip and continue (per PRD error handling)
        }
    }

    return entries;
}

/**
 * Get the latest N entries for a branch (newest first).
 */
export async function getLatestEntries(
    count: number = 1,
    branch?: string
): Promise<ContextEntry[]> {
    const entries = await getEntries(branch);
    return entries.slice(-count).reverse();
}

/**
 * Get the single latest entry for a branch.
 */
export async function getLatestEntry(
    branch?: string
): Promise<ContextEntry | null> {
    const entries = await getLatestEntries(1, branch);
    return entries.length > 0 ? entries[0] : null;
}
