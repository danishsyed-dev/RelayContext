# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-02-21

### Added
- 🎉 Initial public release on npm
- 7 commands: `init`, `save`, `resume`, `log`, `diff`, `handoff`, `share`
- Smart save UX with Git auto-detection and previous context carry-forward
- Continuation prompt generation with clipboard copy
- Branch-scoped context storage (`.relayctx/`)
- Branded CLI with gradient banner, spinners, boxed output, and styled tables
- `--quiet` mode for scripting (`-q`)
- Unknown command handler with "Did you mean?" suggestions
- `cli-table3` styled log output with relative timestamps
- Save preview panel with confirmation before writing
