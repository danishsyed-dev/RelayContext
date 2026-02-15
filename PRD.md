# RelayContext
## Product Requirements Document (PRD)
Version: 1.0
Status: Build-Ready
Owner: <SYED DANISH ALI>
Date: 2026-02-15

---

# 1. Executive Summary

RelayContext is a CLI tool that persists and restores structured AI coding context across sessions, IDEs, devices, and team members.

It enables seamless baton-passing between AI assistants by capturing reasoning state and generating a standardized continuation prompt.

Core Positioning:

> Git tracks code history. RelayContext tracks reasoning history.

RelayContext is tool-agnostic and works with any AI coding assistant because it manages the universal interface: the prompt.

---

# 2. Problem Statement

AI coding tools (Cursor, Claude Code, ChatGPT, Copilot, Windsurf) do not persist reasoning state across:

- Sessions
- IDEs
- Devices
- Team members
- Usage limit resets

When switching tools or resuming work, developers must re-explain:

- Architecture decisions
- Task goals
- Failed approaches
- Current state
- Next steps

This results in:

- Lost productivity (10–20 min reload time)
- Repeated failed solutions
- Architectural inconsistency
- Team handoff friction

There is no vendor-independent reasoning persistence layer.

---

# 3. Product Vision

RelayContext becomes the memory layer for AI-native development.

It standardizes reasoning capture and restoration tied to Git branches.

---

# 4. Goals

## Primary Goals

- Persist structured AI context locally
- Generate continuation prompts automatically
- Work without AI API keys
- Integrate naturally with Git workflow
- Remain tool-agnostic

## Secondary Goals

- Enable team handoffs
- Enable automation via hooks
- Support optional AI summarization

---

# 5. Non-Goals

- Not an IDE
- Not a Git replacement
- Not an AI model
- Not a project management tool
- Not automatic memory injection into AI tools

---

# 6. Target Users

Primary:
- AI-heavy developers
- Engineers hitting daily usage limits
- Developers switching tools mid-task

Secondary:
- Teams collaborating with AI
- Open-source contributors
- AI-first startups

---

# 7. Core Use Cases

UC1: Switch AI tool mid-task  
UC2: Resume work next day  
UC3: Teammate handoff  
UC4: Branch-specific reasoning  
UC5: Multi-device continuation  

---

# 8. Functional Requirements

## 8.1 relayctx init

### Description
Initializes RelayContext in current repository.

### Behavior
- Verify inside Git repository
- Create `.relayctx/`
- Create config file
- Create branch folder

### Output
Success message
Error if not in Git repo

---

## 8.2 relayctx save

### Description
Interactive structured context capture.

### Required Prompts
- Task
- Goal
- Approaches tried
- Key decisions
- Current state
- Next steps

### Storage
Create JSON entry under:

.relayctx/branches/<branch>/entries/<increment>.json

### Metadata Included
- timestamp (ISO)
- git branch
- git commit hash
- entry ID
- user (optional)

---

## 8.3 relayctx save "message"

Quick save mode.

Stores minimal entry:
- message
- timestamp
- branch
- commit

---

## 8.4 relayctx resume

### Description
Generates structured AI continuation prompt.

### Behavior
- Load latest entry for branch
- Format into structured prompt
- Copy to clipboard
- Print to console

### Output Format

You are continuing work on this repository.

Task:
<value>

Goal:
<value>

Previous Attempts:
<list>

Key Decisions:
<list>

Current State:
<value>

Next Steps:
<list>

Constraints:
- Do not repeat failed approaches.
- Maintain consistency with above decisions.

---

## 8.5 relayctx log

Displays context history for current branch.

Format:
- ID
- Timestamp
- Task summary

---

## 8.6 relayctx diff

Shows Git diff since last context save.

Behavior:
- Get commit hash of last save
- Run git diff <hash> HEAD
- Display result

---

## 8.7 relayctx handoff @user

Adds explicit handoff entry with:

- Assigned user
- Summary
- Open issues

---

## 8.8 relayctx share

Ensures `.relayctx/` is ready for Git commit.
Optional:
- Auto-add to staging

---

## 8.9 relayctx hook install

Installs Git post-commit hook that:
- Detects commit
- Optionally prompts save
- Or auto-saves summary

---

## 8.10 relayctx save --auto

Auto-generates context from:
- Git diff
- Recent commits
- Optional IDE logs

Requires no AI key.

---

# 9. Data Architecture

## Folder Structure

.relayctx/
  config.json
  branches/
    main/
      entries/
        001.json
        002.json
    feature-x/
      entries/

---

## Entry JSON Schema

{
  "id": "001",
  "timestamp": "2026-02-15T10:23:00Z",
  "branch": "feature/payment-refactor",
  "commit": "a81fcd9",
  "task": "Refactor payment service",
  "goal": "Improve scalability",
  "approaches": [
    "CRUD refactor failed",
    "Hybrid model race conditions"
  ],
  "decisions": [
    "Adopt event sourcing",
    "Use Kafka"
  ],
  "state": "Replay logic partially broken",
  "nextSteps": [
    "Fix replay",
    "Add idempotency"
  ]
}

---

# 10. Technical Architecture

## Stack
Node.js CLI (TypeScript preferred)

## Libraries
- commander (CLI parsing)
- fs-extra
- inquirer (interactive prompts)
- simple-git
- clipboardy
- chalk (UI)

---

# 11. Non-Functional Requirements

Performance:
- All commands < 200ms
- No blocking long operations

Security:
- Local-first storage
- No external API required
- No telemetry by default

Reliability:
- Graceful failure handling
- Corruption detection
- Safe JSON parsing

Cross-Platform:
- macOS
- Windows
- Linux

---

# 12. Error Handling

- Not in Git repo → error
- No entries exist → informative message
- Corrupt JSON → skip and warn
- No clipboard access → print prompt only

---

# 13. Edge Cases

- Branch renamed
- Detached HEAD state
- Merge conflicts
- Rebase rewriting commits
- Multiple users on same branch
- Massive JSON growth

Mitigation:
- Always use latest commit hash
- Validate branch existence
- Optional compression feature

---

# 14. AI Layer (Phase 2)

Optional environment variable:

RELAYCTX_AI_KEY

Commands:

relayctx summarize  
relayctx suggest  
relayctx compress  

Must not break offline core.

---

# 15. UX Principles

- Minimal friction
- Git-native feel
- Zero AI dependency
- Fast execution
- Clear output formatting

---

# 16. Acceptance Criteria

MVP is complete when:

- init works
- save interactive works
- resume generates clean prompt
- log works
- diff works
- branch isolation works
- no crashes under normal usage

---

# 17. Implementation Roadmap

Phase 1:
- CLI scaffold
- File structure
- Interactive save
- Resume generator

Phase 2:
- Git diff integration
- Hooks
- Auto-save

Phase 3:
- AI summarization
- Compression
- Team enhancements

---

# 18. Success Metrics

Short Term:
- 100 GitHub stars
- 10+ daily users

Mid Term:
- Team adoption
- HN traction

Long Term:
- Becomes AI workflow standard

---

# 19. Competitive Strategy

Tool-agnostic
Local-first
Open-source
Minimal surface area
Infrastructure positioning

---

# 20. Future Expansion

- Cloud sync
- Web dashboard
- Context analytics
- Reasoning timeline graph
- AI reasoning evaluation

---

# Final Statement

RelayContext enables seamless AI session continuity by persisting structured reasoning tied to Git branches.

Git tracks code.
RelayContext tracks thinking.
