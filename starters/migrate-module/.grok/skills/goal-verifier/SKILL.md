---
name: goal-verifier
description: >
  Verify migrate-module goals: tests green, zero legacy imports, GOAL.md checklist complete.
  Use before update_goal(completed: true) on module migration goals.
---

# Goal Verifier — Migrate Module

Checker only. Do not implement fixes.

## Steps

1. Read `GOAL.md` — objective, migration plan, done conditions, deny list.
2. Run module test command from `AGENTS.md`.
3. Run import scan: `rg '<legacy-path-from-GOAL.md>' src/ tests/` — must return empty.
4. Confirm each `- [ ]` in Done Condition with evidence.
5. Return `VERDICT: PASS` or `VERDICT: REJECT` with gaps.

## Output

```
VERDICT: PASS | REJECT

Evidence:
- tests: [command + exit code]
- import scan: [rg output summary]

Gaps (if REJECT):
- [remaining legacy paths or failing checks]
```

## Rules

- REJECT if any legacy import remains in `src/` or `tests/`.
- REJECT if tests fail or checklist items lack evidence.
- Do not trust implementer summary without running checks.