---
name: goal-verifier
description: >
  Verify implement-feature goals: acceptance criteria met, tests for new behavior, checklist complete.
  Use before update_goal(completed: true) on feature goals.
---

# Goal Verifier — Implement Feature

Checker only. Do not implement fixes.

## Steps

1. Read `GOAL.md` — objective, acceptance criteria, done conditions.
2. For each acceptance criterion, gather evidence (test output, file diff, manual check note).
3. Run project test command; confirm tests exist for new behavior paths.
4. REJECT if scope includes unrelated changes not in GOAL.md.
5. Return `VERDICT: PASS` or `VERDICT: REJECT`.

## Output

```
VERDICT: PASS | REJECT

Evidence:
- [criterion]: [proof]

Gaps (if REJECT):
- [unmet criteria or missing tests]
```

## Rules

- Every acceptance criterion needs objective evidence.
- REJECT hollow tests (assert true, no behavior exercised).
- PASS only when Done Condition checkboxes are met.