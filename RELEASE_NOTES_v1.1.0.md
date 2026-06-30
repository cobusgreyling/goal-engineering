# v1.1.0 — Stack release (Loop + Goal)

**Loops discover work on a cadence. Goals finish bounded tasks.**

This release cross-links with [Loop Engineering v1.5.0](https://github.com/cobusgreyling/loop-engineering/releases/tag/v1.5.0) — the discovery layer (`loop-sync`, `loop-constraints`, MCP server) pairs with this repo's finish layer (`/goal`, `goal-verifier`, G0→G3).

## Quickstart — the stack

```bash
# Morning: loop triage
npx @cobusgreyling/loop-init . --pattern daily-triage --tool grok
npx @cobusgreyling/loop-audit . --suggest

# Afternoon: finish top item from STATE.md
npx @cobusgreyling/goal init . --pattern fix-bug --tool grok
npx @cobusgreyling/goal doctor . --suggest
```

In Grok Build:

```
/goal Read STATE.md top priority. Done when verifier PASS. goal-verifier before completed: true.
```

## What's in this repo

| Tool | Command |
|------|---------|
| **goal** (meta CLI) | `npx @cobusgreyling/goal doctor . --suggest` |
| goal-audit | `npx @cobusgreyling/goal-audit . --json --min-level G2` |
| goal-init | `npx @cobusgreyling/goal-init . --pattern tests-green --tool grok` |
| goal-cost | `npx @cobusgreyling/goal-cost --pattern fix-bug` |

- 6 patterns: tests-green, fix-bug, implement-feature, migrate-module, refactor-safely, coverage-target
- [Golden path replay](examples/golden-path/SESSION.md) — 10 min end-to-end
- [Stack cookbook](docs/stack-cookbook.md) — full day rhythm with loops
- [Goal vs Loop](docs/goal-vs-loop.md) — when to use which primitive

## Companion repos

- [Loop Engineering v1.5.0](https://github.com/cobusgreyling/loop-engineering/releases/tag/v1.5.0) — scheduled discovery + triage
- [Fleet Engineering](https://github.com/cobusgreyling/fleet-engineering) — governed agent populations