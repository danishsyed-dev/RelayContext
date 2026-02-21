import chalk from "chalk";
import boxen from "boxen";
import ora, { type Ora } from "ora";
import gradient from "gradient-string";
import figures from "figures";

// ─── Quiet Mode ───
let quietMode = false;

export function setQuietMode(enabled: boolean): void {
    quietMode = enabled;
}

export function isQuiet(): boolean {
    return quietMode;
}

// ─── Branding ───

const BRAND_GRADIENT = gradient(["#4facfe", "#00f2fe"]);
const VERSION = "1.0.0";

const TAGLINE = "Git tracks code. RelayContext tracks thinking.";

export function printBanner(): void {
    if (quietMode) return;

    const title = BRAND_GRADIENT("🔄 RelayContext");
    const ver = chalk.dim(`v${VERSION}`);
    const tag = chalk.dim.italic(TAGLINE);

    console.log();
    console.log(`  ${title}  ${ver}`);
    console.log(`  ${tag}`);
    console.log();
}

export function printBannerBox(): void {
    if (quietMode) return;

    const title = BRAND_GRADIENT("🔄 RelayContext");
    const ver = chalk.dim(`v${VERSION}`);
    const tag = chalk.dim.italic(TAGLINE);

    const content = `${title}  ${ver}\n${tag}`;

    console.log(
        boxen(content, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "cyan",
            dimBorder: true,
        })
    );
}

// ─── Status Bar ───

export function printStatusBar(branch: string, entryCount: number, lastSaveAgo?: string): void {
    if (quietMode) return;

    const branchInfo = `${chalk.cyan(figures.pointer)} ${chalk.bold("Branch:")}  ${chalk.white(branch)}`;
    const saveInfo = `${chalk.cyan(figures.bullet)} ${chalk.bold("Saves:")}   ${chalk.white(String(entryCount))} entries`;
    const lastInfo = lastSaveAgo
        ? `${chalk.cyan(figures.bullet)} ${chalk.bold("Last:")}    ${chalk.white(lastSaveAgo)}`
        : `${chalk.cyan(figures.bullet)} ${chalk.bold("Last:")}    ${chalk.dim("no saves yet")}`;

    const lines = [branchInfo, saveInfo, lastInfo].join("\n");

    console.log(
        boxen(lines, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "gray",
            dimBorder: true,
        })
    );
    console.log();
}

// ─── Messages ───

export function printSuccess(msg: string): void {
    if (quietMode) {
        console.log(msg);
        return;
    }
    console.log(
        boxen(chalk.green(`${figures.tick} ${msg}`), {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "green",
            dimBorder: true,
        })
    );
}

export function printError(msg: string, hint?: string): void {
    const lines = [chalk.red(`${figures.cross} ${msg}`)];
    if (hint) {
        lines.push(chalk.dim(`  ${figures.arrowRight} ${hint}`));
    }

    console.log(
        boxen(lines.join("\n"), {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "red",
            dimBorder: true,
        })
    );
}

export function printWarning(msg: string): void {
    if (quietMode) {
        console.log(msg);
        return;
    }
    console.log(`  ${chalk.yellow(figures.warning)} ${chalk.yellow(msg)}`);
}

export function printInfo(msg: string): void {
    if (quietMode) return;
    console.log(`  ${chalk.cyan(figures.info)} ${chalk.dim(msg)}`);
}

export function printDim(msg: string): void {
    if (quietMode) return;
    console.log(chalk.dim(`  ${msg}`));
}

// ─── Box Output ───

export function printBox(content: string, title?: string): void {
    if (quietMode) {
        console.log(content);
        return;
    }

    console.log(
        boxen(content, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "cyan",
            dimBorder: true,
            title: title ? chalk.cyan.bold(` ${title} `) : undefined,
            titleAlignment: "left",
        })
    );
}

// ─── Dividers ───

export function printDivider(width: number = 50): void {
    if (quietMode) return;
    console.log(chalk.dim(`  ${"─".repeat(width)}`));
}

export function printSection(title: string): void {
    if (quietMode) return;
    console.log();
    console.log(`  ${chalk.bold.cyan(title)}`);
    console.log(chalk.dim(`  ${"─".repeat(title.length + 4)}`));
}

// ─── Spinners ───

export function spin(message: string): Ora {
    if (quietMode) {
        // Return a dummy spinner
        return ora({ text: message, isSilent: true });
    }
    return ora({
        text: message,
        spinner: "dots",
        color: "cyan",
        indent: 2,
    }).start();
}

// ─── Relative Time ───

export function timeAgo(isoTimestamp: string): string {
    const now = Date.now();
    const then = new Date(isoTimestamp).getTime();
    const diffMs = now - then;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// ─── Custom Help Renderer ───

export function printCustomHelp(): void {
    printBannerBox();

    console.log();
    console.log(chalk.bold("  Commands:"));
    console.log();

    // Context
    console.log(chalk.dim("    Context"));
    console.log(`      ${chalk.cyan("save")} ${chalk.dim("[msg]")}          Save reasoning context`);
    console.log(`      ${chalk.cyan("resume")}                Generate AI continuation prompt`);
    console.log(`      ${chalk.cyan("log")}                   View context history`);
    console.log();

    // Git Integration
    console.log(chalk.dim("    Git Integration"));
    console.log(`      ${chalk.cyan("diff")}                  Changes since last save`);
    console.log(`      ${chalk.cyan("share")}                 Stage .relayctx/ for commit`);
    console.log();

    // Team
    console.log(chalk.dim("    Team"));
    console.log(`      ${chalk.cyan("handoff")} ${chalk.dim("<user>")}       Hand off work to teammate`);
    console.log();

    // Setup
    console.log(chalk.dim("    Setup"));
    console.log(`      ${chalk.cyan("init")}                  Initialize in current repo`);
    console.log();

    printDivider(44);
    console.log();

    // Examples
    console.log(chalk.bold("  Examples:"));
    console.log();
    console.log(chalk.dim(`    $ ${chalk.white("relayctx save")}                    Smart save`));
    console.log(chalk.dim(`    $ ${chalk.white('relayctx save "fixed auth bug"')}   Quick save`));
    console.log(chalk.dim(`    $ ${chalk.white("relayctx resume --depth 3")}        Rich resume`));
    console.log(chalk.dim(`    $ ${chalk.white("relayctx handoff @alice")}           Team handoff`));
    console.log();

    printDivider(44);
    console.log();
    console.log(chalk.dim(`    relayctx ${chalk.white("--help")}       Show this help`));
    console.log(chalk.dim(`    relayctx ${chalk.white("--version")}    Show version`));
    console.log();
}

// ─── Custom Version Renderer ───

export function printCustomVersion(): void {
    printBannerBox();
}

// ─── Validation Helpers ───

export function validateGitRepo(isRepo: boolean): boolean {
    if (!isRepo) {
        printError("Not a Git repository", "Run `git init` first to create a repository.");
        process.exit(1);
    }
    return true;
}

export function validateInitialized(initialized: boolean): boolean {
    if (!initialized) {
        printError("RelayContext not initialized", "Run `relayctx init` to set up this project.");
        process.exit(1);
    }
    return true;
}

// ─── Entry Preview ───

export function printEntryPreview(entry: {
    task?: string;
    goal?: string;
    approaches?: string[];
    decisions?: string[];
    state?: string;
    nextSteps?: string[];
    message?: string;
    type?: string;
}): void {
    if (quietMode) return;

    const lines: string[] = [];

    if (entry.task) {
        lines.push(`${chalk.bold("Task:")}        ${entry.task}`);
    }
    if (entry.goal) {
        lines.push(`${chalk.bold("Goal:")}        ${entry.goal}`);
    }
    if (entry.approaches && entry.approaches.length > 0) {
        lines.push(`${chalk.bold("Approaches:")}  ${entry.approaches.join(", ")}`);
    }
    if (entry.decisions && entry.decisions.length > 0) {
        lines.push(`${chalk.bold("Decisions:")}   ${entry.decisions.join(", ")}`);
    }
    if (entry.state) {
        lines.push(`${chalk.bold("State:")}       ${entry.state}`);
    }
    if (entry.nextSteps && entry.nextSteps.length > 0) {
        lines.push(`${chalk.bold("Next Steps:")}  ${entry.nextSteps.join(", ")}`);
    }
    if (entry.message) {
        lines.push(`${chalk.bold("Message:")}     ${entry.message}`);
    }

    console.log(
        boxen(lines.join("\n"), {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderStyle: "round",
            borderColor: "yellow",
            dimBorder: true,
            title: chalk.yellow.bold(" 📋 Preview "),
            titleAlignment: "left",
        })
    );
}

// ─── Clipboard Badge ───

export function printClipboardBadge(copied: boolean): void {
    if (quietMode) return;

    if (copied) {
        console.log(`  ${chalk.green(`${figures.tick} Copied to clipboard!`)}`);
    } else {
        console.log(`  ${chalk.yellow(`${figures.warning} Clipboard not available — use the prompt above.`)}`);
    }
}
