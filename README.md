<div align="center">

# 🔄 RelayContext

**Git tracks code. RelayContext tracks thinking.**

Persist and restore structured AI coding context across sessions, IDEs, devices, and team members.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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
📎 Auto-detected from Git:

? Task: [Payment refactor]                    ← from branch name
? Goal: [Improve scalability]                 ← from previous save
? Current state: [3 files changed]            ← from git log + diff
? Next steps: [Fix replay, Add idempotency]   ← from previous save

✅ Context saved
```

### Resume

When you run `relayctx resume`, it generates a structured prompt:

```
You are continuing work on this repository.

Task:
Refactor payment service to use event sourcing

Goal:
Improve scalability and handle concurrent mutations

Previous Attempts:
- CRUD refactor (failed — race conditions)
- Hybrid model (partial)

Key Decisions:
- Adopt event sourcing
- Use Kafka for event bus

Current State:
Replay logic partially implemented

Next Steps:
- Fix replay logic
- Add idempotency keys

Constraints:
- Do not repeat failed approaches.
- Maintain consistency with above decisions.
```

Paste this into **any** AI tool. It works with ChatGPT, Cursor, Claude, Copilot, Windsurf — anything that accepts text.

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

---

## Tech Stack

| Component | Technology |
|---|---|
| Language | TypeScript |
| CLI Framework | Commander |
| Interactive Prompts | Inquirer |
| Git Operations | simple-git |
| Clipboard | clipboardy (with fallback) |
| Styling | chalk |
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
