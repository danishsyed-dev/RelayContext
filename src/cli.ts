import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { saveCommand } from "./commands/save.js";
import { resumeCommand } from "./commands/resume.js";
import { logCommand } from "./commands/log.js";
import { diffCommand } from "./commands/diff.js";
import { handoffCommand } from "./commands/handoff.js";
import { shareCommand } from "./commands/share.js";
import { setQuietMode, printCustomHelp, printCustomVersion } from "./utils/ui.js";
import chalk from "chalk";

const program = new Command();

program
    .name("relayctx")
    .description(
        "Persist and restore structured AI coding context across sessions, IDEs, devices, and team members."
    )
    .version("1.0.0", "-v, --version")
    .option("-q, --quiet", "Suppress visual chrome (banners, boxes, spinners)")
    .helpOption("-h, --help", "Show help")
    .addHelpCommand(false);

// Apply quiet mode before any command runs
program.hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.quiet) {
        setQuietMode(true);
    }
});

// Override default help
program.configureHelp({
    formatHelp: () => "",
});

program.on("option:help", () => {
    printCustomHelp();
    process.exit(0);
});

program.on("option:version", () => {
    printCustomVersion();
    process.exit(0);
});

// ─── init ───
program
    .command("init")
    .description("Initialize RelayContext in the current Git repository")
    .action(async () => {
        await initCommand();
    });

// ─── save ───
program
    .command("save [message]")
    .description("Save structured context for the current branch")
    .option("--manual", "Use blank prompts instead of smart defaults")
    .action(async (message?: string, options?: { manual?: boolean }) => {
        if (message) {
            await saveCommand(message);
        } else {
            await saveCommand(options);
        }
    });

// ─── resume ───
program
    .command("resume")
    .description("Generate a structured AI continuation prompt")
    .option(
        "-d, --depth <number>",
        "Number of entries to merge into the prompt",
        "1"
    )
    .action(async (options: { depth?: string }) => {
        await resumeCommand({ depth: parseInt(options.depth || "1", 10) });
    });

// ─── log ───
program
    .command("log")
    .description("Display context history for the current branch")
    .action(async () => {
        await logCommand();
    });

// ─── diff ───
program
    .command("diff")
    .description("Show Git diff since the last context save")
    .action(async () => {
        await diffCommand();
    });

// ─── handoff ───
program
    .command("handoff <user>")
    .description("Create a handoff entry assigning work to a team member")
    .action(async (user: string) => {
        await handoffCommand(user);
    });

// ─── share ───
program
    .command("share")
    .description("Stage .relayctx/ for Git commit")
    .action(async () => {
        await shareCommand();
    });

// ─── Unknown command handler ───
program.on("command:*", (operands: string[]) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    const unknown = operands[0];

    // Simple "did you mean?" using Levenshtein-like check
    const suggestions = availableCommands.filter((cmd) => {
        // Check if first 2 chars match or edit distance is small
        if (cmd.startsWith(unknown.slice(0, 2))) return true;
        if (unknown.startsWith(cmd.slice(0, 2))) return true;
        return false;
    });

    console.log();
    console.log(chalk.red(`  ✖ Unknown command: ${chalk.bold(unknown)}`));
    if (suggestions.length > 0) {
        console.log(
            chalk.dim(`  Did you mean? ${suggestions.map((s) => chalk.cyan(s)).join(", ")}`)
        );
    }
    console.log(chalk.dim(`  Run ${chalk.white("relayctx --help")} to see all commands.`));
    console.log();
    process.exit(1);
});

// Show help when no command is provided
if (process.argv.length <= 2) {
    printCustomHelp();
    process.exit(0);
}

program.parse();
