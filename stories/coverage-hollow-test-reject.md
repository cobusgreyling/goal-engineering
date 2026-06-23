# Story: Coverage Target — Hollow Test REJECT

**Pattern:** [coverage-target.md](../patterns/coverage-target.md)  
**Maturity:** G2

## Objective

```
/goal Raise src/auth/ coverage to 80%. goal-verifier confirms coverage report.
```

## What went wrong (first attempt)

Agent added `expect(true).toBe(true)` tests to hit 81% line coverage.

## Verifier

Pattern-specific verifier REJECT: "hollow tests in auth/coverage.test.ts — no behavior exercised."

## Recovery

Agent replaced hollow tests with real token-expiry cases. Coverage settled at 80.4%. PASS on second verifier run.

## Lesson

Coverage goals need pattern-specific verifiers, not just a percentage gate.