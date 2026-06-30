# Stack Cookbook — Loop → Goal → Fleet

One narrative for combining [loop-engineering](https://github.com/cobusgreyling/loop-engineering) ([v1.5.0](https://github.com/cobusgreyling/loop-engineering/releases/tag/v1.5.0) — `loop-sync`, `loop-constraints`, MCP server), **goal-engineering**, and [fleet-engineering](https://github.com/cobusgreyling/fleet-engineering).

## Daily rhythm

```
06:00  /loop 1d — triage open issues, CI, deps
       └─ writes STATE.md priorities

09:00  Human picks top item → /goal fix-bug per patterns/fix-bug.md
       └─ runs until verifier PASS or blocked

17:00  Log outcome in goal-run-log.md
       └─ loop picks up next item tomorrow
```

## Handoff contract

**Loop writes** (discovery):

```markdown
## STATE.md
### Priority 1
- Bug: auth token refresh timeout (#1234)
- Pattern: fix-bug
- Repro: login, wait 15m, refresh → 500
```

**Goal reads** (finish):

```
/goal Read STATE.md priority 1. Apply patterns/fix-bug.md.
Done when repro fails, regression test added, goal-verifier PASS.
Update GOAL.md.
```

**Goal writes** (completion):

```markdown
## goal-run-log.md
| 2026-06-23 | Fix #1234 token refresh | completed | 18 | verifier caught skipped test |
```

## When loop should pause

If an active `/goal` touches the same files as the loop, **pause the loop** until the goal completes or blocks. See [multi-goal.md](multi-goal.md).

## Fleet layer (many agents)

When multiple repos or agents run goals:

| Fleet concern | Goal engineering answer |
|---------------|-------------------------|
| Who may set goals? | Fleet policy + deny lists in `GOAL.md` |
| Budget at scale | `goal-cost` estimates per pattern |
| Audit compliance | `goal-audit` in CI (`min-level: G2`) |
| Evidence | `goal-run-log.md` per repo |

Fleet engineering governs populations; goals finish bounded units of work inside each agent.

## Example: CI red morning

1. **Loop** (overnight): detects CI red on `main`, files Priority 1 in `STATE.md`
2. **Human**: `/goal Read STATE.md. Tests green per patterns/tests-green.md`
3. **Agent**: fixes tests over 20 turns; `update_goal` milestones
4. **Verifier**: REJECT on undocumented skip → agent fixes → PASS
5. **Human**: `/goal clear`; loop resumes triage

Replay: [ci-red-to-green](../stories/ci-red-to-green.md)

## Tooling cheat sheet

```bash
npx @cobusgreyling/goal doctor . --min-level G2    # readiness
npx @cobusgreyling/goal init . -p tests-green      # scaffold
npx @cobusgreyling/goal estimate -p fix-bug        # budget planning
```

## Further reading

- [when-not-to-use-goals.md](when-not-to-use-goals.md)
- [goal-vs-loop.md](goal-vs-loop.md)
- [canonical-essay.md](canonical-essay.md)