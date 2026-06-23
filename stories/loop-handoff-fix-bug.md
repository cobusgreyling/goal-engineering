# Story: Loop Handoff → Fix Bug Goal

**Pattern:** [fix-bug.md](../patterns/fix-bug.md)  
**Maturity:** G2  
**Companion:** [loop-engineering](https://github.com/cobusgreyling/loop-engineering)

## Flow

1. Daily `/loop 1d` triage wrote Priority 1 to `STATE.md` — flaky webhook test
2. Human paused loop (same `src/webhooks/` files)
3. `/goal Read STATE.md priority 1. Apply patterns/fix-bug.md.`
4. Agent added repro steps to `GOAL.md`, fixed race, added regression test
5. Verifier PASS in 9 turns; logged in `goal-run-log.md`
6. Resumed loop

## Lesson

Loop discovers; goal finishes. Pause loop when file overlap would cause collision.