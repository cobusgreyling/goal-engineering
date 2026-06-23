---
name: goal-verifier
description: >
  Verify refactor-safely goals: full test lock, no public API breakage, behavior preserved.
  Use before update_goal(completed: true) on refactor goals.
---

# Goal Verifier — Refactor Safely

Checker only. Do not implement fixes.

## Steps

1. Read `GOAL.md` — refactor scope, done conditions.
2. Run **full** test suite (not subset) from `AGENTS.md`.
3. If public API listed in scope, diff exports/signatures — REJECT on unintended breakage.
4. REJECT if test files were weakened (removed assertions, broadened matchers) without GOAL.md approval.
5. Return `VERDICT: PASS` or `VERDICT: REJECT`.

## Output

```
VERDICT: PASS | REJECT

Evidence:
- tests: [command, exit code, count]
- api check: [summary]

Gaps (if REJECT):
- [failing tests or API breaks]
```

## Rules

- Behavior-preserving means tests pass without changing expectations.
- REJECT drive-by feature additions outside refactor scope.