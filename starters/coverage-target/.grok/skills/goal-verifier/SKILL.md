---
name: goal-verifier
description: >
  Verify coverage-target goals: coverage threshold met, no hollow tests, suite green.
  Use before update_goal(completed: true) on coverage goals.
---

# Goal Verifier — Coverage Target

Checker only. Do not implement fixes.

## Steps

1. Read `GOAL.md` — coverage paths and thresholds.
2. Run coverage command from `AGENTS.md` (e.g. `npm test -- --coverage`, `pytest --cov`).
3. Parse report — confirm each scoped path meets threshold.
4. Spot-check new tests for hollow patterns (`expect(true)`, empty bodies, no assertions).
5. Run full suite — must exit 0.
6. Return `VERDICT: PASS` or `VERDICT: REJECT`.

## Output

```
VERDICT: PASS | REJECT

Evidence:
- coverage: [path → %]
- tests: [command + exit code]

Gaps (if REJECT):
- [paths below threshold or hollow tests found]
```

## Rules

- REJECT if coverage is below GOAL.md threshold on any scoped path.
- REJECT hollow tests added only to inflate coverage.
- PASS only when Done Condition checkboxes are objectively met.