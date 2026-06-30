# Goal vs Loop

Goals and loops solve different problems. Using the wrong primitive creates either endless chat or endless cron noise.

## Summary

| Dimension | Goal (`/goal`) | Loop (`/loop`) |
|-----------|----------------|----------------|
| **Unit of work** | One bounded objective | Recurring discovery + action |
| **Stop condition** | Verifiable completion | Human cancels or task expires |
| **Cadence** | Continuous until done | Interval (5m, 1d, …) |
| **Primary state** | `GOAL.md` | `STATE.md`, `LOOP.md` |
| **Agent telemetry** | `update_goal` | State file append + optional run log |
| **Best metaphor** | Sprint to finish line | Heartbeat / watchman |

## Decision Tree

```
Do you know what "done" looks like?
├─ No  → Plan mode or exploratory session first
└─ Yes → Is the work recurring on a schedule?
         ├─ Yes → Loop (/loop or scheduler_create)
         └─ No  → Goal (/goal)
```

## Combined Pattern (Recommended)

Production setups often use **both**. [Loop Engineering v1.5.0](https://github.com/cobusgreyling/loop-engineering/releases/tag/v1.5.0) ships the discovery layer (`loop-sync`, `loop-constraints`, MCP server); this repo ships the finish layer (`/goal`, `goal-verifier`). Full day rhythm: [stack-cookbook.md](stack-cookbook.md).

```bash
# Morning: loop triage (loop-engineering)
npx @cobusgreyling/loop-init . --pattern daily-triage --tool grok

# Afternoon: finish top item (goal-engineering)
npx @cobusgreyling/goal init . --pattern fix-bug --tool grok
```

1. **Loop** runs daily triage → writes priorities to `STATE.md`
2. Human or loop picks top item → **`/goal`** for run-until-done execution
3. Goal completes → loop's next run picks the next item

Example handoff prompt:

```
/goal Read STATE.md top priority item #1241. Fix the flaky auth test.
Done when CI is green on main and GOAL.md records the fix. Use goal-verifier before completed: true.
```

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|--------------|--------------|-----|
| `/goal` with no done condition | Agent declares victory early | Add tests, checklist, or verifier skill |
| `/loop` for one-off migration | Wastes schedule slots; partial work each run | Use `/goal` until migration completes |
| Goal without external state | Context compaction loses progress | Maintain `GOAL.md` |
| Loop without state spine | Same triage every run, no memory | `STATE.md` + skills |

## Cross-reference

- Loop engineering: [github.com/cobusgreyling/loop-engineering](https://github.com/cobusgreyling/loop-engineering)
- Primitives matrix (Grok vs Claude vs Codex): [primitives-matrix.md](./primitives-matrix.md)