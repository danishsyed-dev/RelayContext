import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { saveCommand } from "./commands/save.js";
import { resumeCommand } from "./commands/resume.js";
import { logCommand } from "./commands/log.js";
import { diffCommand } from "./commands/diff.js";
import { handoffCommand } from "./commands/handoff.js";
import { shareCommand } from "./commands/share.js";

const program = new Command();

program
    .name("relayctx")
    .description(
        "Persist and restore structured AI coding context across sessions, IDEs, devices, and team members."
    )
    .version("1.0.0");

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

program.parse();
