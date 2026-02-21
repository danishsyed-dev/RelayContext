<div align="center">

# 🔄 RelayContext

**Like a relay race — pass the baton, not the whole playbook.**

Persist and restore structured AI coding context across sessions, IDEs, devices, and team members.

[![npm version](https://img.shields.io/npm/v/relayctx?color=cb3837&logo=npm)](https://www.npmjs.com/package/relayctx)
[![npm downloads](https://img.shields.io/npm/dm/relayctx?color=cb3837&logo=npm)](https://www.npmjs.com/package/relayctx)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Git tracks code. RelayContext tracks thinking.**

</div>

---

## The Problem

AI coding tools (Cursor, Claude, ChatGPT, Copilot, Windsurf) **don't remember your reasoning** across:

- Sessions (closed the tab? context gone)
- IDE switches (Cursor → VS Code → ChatGPT)
- Usage limit resets (hit the daily cap, switch tools)
- Team handoffs (teammate picks up your work)
- Devices (laptop → desktop)

Every time you switch, you waste **10–20 minutes** re-explaining architecture decisions, failed approaches, and current state.

## The Solution

RelayContext captures your **reasoning state** in structured JSON tied to Git branches, and generates a **ready-to-paste continuation prompt** for any AI tool.

```bash
# Save your context before stopping
relayctx save

# Resume in any AI tool — prompt is auto-copied to clipboard
relayctx resume
# → Ctrl+V into ChatGPT / Cursor / Claude / Copilot
```

---

## Quick Start

### Install

```bash
npm install -g relayctx
```

### Setup (once per project)

```bash
cd your-project
relayctx init
```

### Daily Workflow

```bash
# 1. Save context (smart mode — auto-fills from Git)
relayctx save

# 2. Switch tools or resume next day
relayctx resume    # → copied to clipboard

# 3. Paste into any AI assistant
# Ctrl+V — the AI instantly knows where you left off
```

---

## CLI Interface

RelayContext features a polished, branded CLI experience:

```
╭────────────────────────────────────────────────╮
│ 🔄 RelayContext  v1.0.0                        │
│ Git tracks code. RelayContext tracks thinking. │
╰────────────────────────────────────────────────╯

  Commands:

    Context
      save [msg]          Save reasoning context
      resume              Generate AI continuation prompt
      log                 View context history

    Git Integration
      diff                Changes since last save
      share               Stage .relayctx/ for commit

    Team
      handoff <user>      Hand off work to teammate

    Setup
      init                Initialize in current repo
```

### Features

- 🎨 **Branded output** — gradient-colored banner, boxed panels, and styled tables
- ⏳ **Progress spinners** — elegant `ora` spinners for all async operations
- 📋 **Save preview** — review your context before saving with a boxed preview panel
- 📊 **Styled log table** — color-coded entry types with relative timestamps ("2h ago")
- 📦 **Boxed prompts** — continuation prompts rendered in framed panels
- 🔇 **Quiet mode** — `-q` flag suppresses all visual chrome for scripting
- 💡 **Smart suggestions** — unknown commands show "Did you mean?" hints

---

## Commands

| Command | Description |
|---|---|
| `relayctx init` | Initialize RelayContext in a Git repo |
| `relayctx save` | Smart save — auto-populates from Git, you confirm |
| `relayctx save "msg"` | Quick save — checkpoint with a short note |
| `relayctx save --manual` | Manual save — blank prompts to fill from scratch |
| `relayctx resume` | Generate continuation prompt & copy to clipboard |
| `relayctx resume --depth 3` | Richer prompt from the last 3 saves |
| `relayctx log` | View context history for current branch |
| `relayctx diff` | See code changes since last save |
| `relayctx handoff @user` | Hand off work to a teammate |
| `relayctx share` | Stage `.relayctx/` for Git commit |

---

## How It Works

### Save

When you run `relayctx save`, it auto-reads Git data and pre-fills a structured form:

```
  ✔ Repository verified
  ✔ Branch: feature/auth  Commit: a1b2c3d

  📎 Git Context
  ──────────────────
    Previous approaches:
      • CRUD refactor (failed)
    Previous decisions:
      • Use event sourcing

  ✏️  Your Input
  ──────────────────

? Task: Payment refactor
? Goal: Improve scalability
? Current state: 3 files changed
? Next steps: Fix replay, Add idempotency

╭ 📋 Preview ──────────────────────────────────╮
│ Task:        Payment refactor                │
│ Goal:        Improve scalability             │
│ State:       3 files changed                 │
│ Next Steps:  Fix replay, Add idempotency     │
╰──────────────────────────────────────────────╯

? Save this context? (Y/n)

╭──────────────────────────────────────────────╮
│ ✔ Context saved → .relayctx/branches/...     │
╰──────────────────────────────────────────────╯
```

### Resume

When you run `relayctx resume`, it generates a structured prompt inside a styled box:

```
  ✔ Repository verified
  ✔ Loaded 1 entry(ies) from "feature/auth"

╭ 📋 Continuation Prompt ─────────────────────╮
│ You are continuing work on this repository.  │
│                                              │
│ Task:                                        │
│ Refactor payment service                     │
│                                              │
│ Goal:                                        │
│ Improve scalability                          │
│                                              │
│ Previous Attempts:                           │
│ - CRUD refactor (failed — race conditions)   │
│                                              │
│ Key Decisions:                               │
│ - Adopt event sourcing                       │
│ - Use Kafka for event bus                    │
│                                              │
│ Constraints:                                 │
│ - Do not repeat failed approaches.           │
│ - Maintain consistency with above decisions. │
╰──────────────────────────────────────────────╯

  ✔ Copied to clipboard!
```

Paste this into **any** AI tool. It works with ChatGPT, Cursor, Claude, Copilot, Windsurf — anything that accepts text.

### Log

View context history with a styled table:

```
  ✔ Found 3 entries on "main"

┌──────────────────────┬──────────────┬──────────┬──────────────────────────┐
│ ID                   │ When         │ Type     │ Task / Message           │
├──────────────────────┼──────────────┼──────────┼──────────────────────────┤
│ 20260215T102300Z     │ 2h ago       │ full     │ Payment refactor         │
│ 20260215T090000Z     │ 5h ago       │ quick    │ Fixed auth bug           │
│ 20260214T180000Z     │ yesterday    │ handoff  │ Handed off to @alice     │
└──────────────────────┴──────────────┴──────────┴──────────────────────────┘
```

---

## Data Architecture

Context is stored **locally** in your repo, scoped per branch:

```
your-project/
└── .relayctx/
    ├── config.json
    └── branches/
        ├── main/
        │   └── entries/
        │       ├── 20260215T102300Z.json
        │       └── 20260215T143000Z.json
        └── feature--auth/
            └── entries/
                └── 20260216T091000Z.json
```

- **Branch isolation** — switching branches automatically switches context
- **Timestamp IDs** — collision-free, naturally sortable
- **Schema versioned** — future-proof with `schemaVersion: 1`
- **Corrupt-safe** — bad JSON files are skipped, not crashed on

---

## Design Principles

- 🔒 **Local-first** — no servers, no accounts, no API keys required
- 🔧 **Tool-agnostic** — works with any AI assistant
- ⚡ **Fast** — all commands < 200ms
- 🌿 **Git-native** — context follows branches
- 📋 **Zero friction** — smart defaults mean fewer keystrokes
- 🎨 **Beautiful CLI** — polished output with spinners, boxes, tables, and color

---

## Tech Stack

| Component | Technology |
|---|---|
| Language | TypeScript |
| CLI Framework | Commander |
| Interactive Prompts | Inquirer |
| Git Operations | simple-git |
| Clipboard | clipboardy (with fallback) |
| Terminal Styling | chalk, boxen, gradient-string |
| Spinners | ora |
| Tables | cli-table3 |
| Bundler | tsup |

---

## Contributing

```bash
git clone https://github.com/danishsyed-dev/RelayContext.git
cd RelayContext
npm install
npm run build
npm link    # makes 'relayctx' available globally
```

---

## License

MIT © [Syed Danish Ali](https://github.com/danishsyed-dev)
