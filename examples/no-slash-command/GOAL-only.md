# Goal Discipline Without `/goal`

Any agent can run goal engineering with three files and one habit:

| File | Purpose |
|------|---------|
| `GOAL.md` | Objective + checkbox done conditions (survives compaction) |
| `goal-budget.md` | Turn cap + kill switch |
| `goal-verifier` skill | Independent PASS/REJECT |

## Prompt template

```
Read GOAL.md every turn. Work only the Active Objective.

Done when every Done Condition checkbox is objectively met.
Before saying "done", run the goal-verifier skill and obey its verdict.

Progress: update GOAL.md Progress Log, not long chat messages.
Stop if turns exceed goal-budget.md or you hit the Deny List.
```

## When this is enough

- Tool has no `/goal` or `update_goal`
- Single-session bounded task
- Human stays in the loop (G1)

## When to upgrade

- Multi-turn persistence → Grok Build `/goal` + `update_goal`
- Recurring triage → [loop-engineering](https://github.com/cobusgreyling/loop-engineering)