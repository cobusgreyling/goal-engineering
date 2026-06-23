# Story: Implement Feature — Verifier Caught Scope Creep

**Pattern:** [implement-feature.md](../patterns/implement-feature.md)  
**Maturity:** G2

## Objective

```
/goal Implement CSV export per GOAL.md acceptance criteria. goal-verifier before completed: true.
```

## What worked

- Acceptance criteria as checkboxes kept agent focused on three user-visible behaviors
- Verifier REJECT when agent also refactored unrelated `billing/` module
- Scoped goal completed in 14 turns after revert of out-of-scope diff

## Outcome

Feature shipped with tests. One verifier REJECT for scope creep — saved a risky drive-by refactor.