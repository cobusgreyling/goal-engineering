# Codex — Fix Bug Goal

Codex supports `/goal` and worktree isolation. Pair with `fix-bug` pattern.

## Setup

```bash
npx @cobusgreyling/goal-init . --pattern fix-bug --tool codex
```

Skills install to `.codex/skills/`.

## Goal command

```
/goal Fix bug per GOAL.md repro steps. Done when repro fails, regression test added, goal-verifier PASS.
```

## Worktree tip

For risky fixes, run the goal in an isolated worktree so the verifier can diff against `main` without touching your working tree.

## Handoff from loop

```
/goal Read STATE.md top priority. Apply patterns/fix-bug.md. Update GOAL.md.
```

See [loop-engineering](https://github.com/cobusgreyling/loop-engineering).