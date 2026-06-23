# FAQ & Troubleshooting

## `/goal` does not appear in my session

**Cause:** Goal mode is not enabled or `update_goal` is not in the toolset.

**Fix:**
1. Confirm you are on Grok Build CLI with goal feature enabled.
2. Check session tools include `update_goal`.
3. Fallback: use [GOAL-only discipline](../examples/no-slash-command/GOAL-only.md) with `GOAL.md` + verifier skill.

## Agent called `update_goal(completed: true)` without running tests

**Cause:** Self-grading (anti-pattern #1).

**Fix:**
1. `/goal pause` immediately.
2. Add `goal-verifier` skill: `npx @cobusgreyling/goal-init . --pattern minimal-goal --tool grok`
3. Add to `AGENTS.md`: "Never `completed: true` without verifier PASS."
4. Re-run goal from last known good state.

## Goal objective lost after compaction

**Cause:** Objective only lived in chat, not `GOAL.md`.

**Fix:**
1. `/goal clear`
2. Write objective + done conditions to `GOAL.md`
3. `/goal Read GOAL.md. Continue the Active Objective.`

## Score stuck at G2, cannot reach G3

**Common caps:**
- No test harness → add `npm test` / `pytest` / `go test`
- `goal-run-log.md` missing recent outcome → log last goal run with date and outcome
- No CI → add `.github/workflows` (even a test workflow)

Run: `npx @cobusgreyling/goal-audit . --suggest`

## Too many turns / runaway budget

**Fix:**
1. `/goal pause`
2. Check `goal-budget.md` — was max turns set?
3. Run `goal-scoper` — objective may be a mega-goal ([anti-patterns](anti-patterns.md))
4. Split into sequential goals

## Verifier always REJECTs

**Check:**
- Are done conditions objective? ("code is clean" fails; "npm test exits 0" passes)
- Did implementer check boxes without evidence?
- Pattern-specific verifier rules (import scan, coverage %) — see [patterns/](../patterns/)

## `npx @cobusgreyling/goal-init` returns 404

**Cause:** Package not published or typo.

**Fix:** Use individual packages or clone repo:
```bash
npx @cobusgreyling/goal-init@latest .
# or unified:
npx @cobusgreyling/goal init .
```

## Goal vs loop — which do I use?

| Situation | Use |
|-----------|-----|
| Finish one bounded task | `/goal` |
| Daily triage / discovery | `/loop` |
| Loop found a fixable item | Hand off to `/goal` |

See [goal-vs-loop.md](goal-vs-loop.md) and [stack-cookbook.md](stack-cookbook.md).

## CI gate with goal-audit

```yaml
- uses: cobusgreyling/goal-engineering/.github/actions/goal-audit@main
  with:
    path: .
    min-level: G2
```

Or: `npx @cobusgreyling/goal-audit . --json --min-level G2`