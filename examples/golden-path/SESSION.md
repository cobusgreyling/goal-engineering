# Golden Path — Replayable Goal Session

Walk through a full goal run on the sample app: empty project → scaffold → `/goal` → verifier REJECT → fix → PASS.

**Screencast:** Record a 3-minute demo following this script and link from [docs/index.html](../../docs/index.html) hero (placeholder: `assets/visuals/golden-path-demo.mp4`).

## Setup

```bash
cd examples/golden-path/sample-app
npx @cobusgreyling/goal-audit . --suggest    # G0 — see before-audit.txt
npx @cobusgreyling/goal-init . --pattern tests-green --tool grok
npx @cobusgreyling/goal-audit . --suggest    # G2 — see after-init.txt
```

## Turn-by-turn (Grok Build)

| Turn | Actor | Action |
|------|-------|--------|
| 1 | Human | `/goal Read GOAL.md. Fix all failing tests. goal-verifier before completed: true.` |
| 2 | Agent | Reads GOAL.md; runs `npm test`; lists 2 failures in `update_goal(message: ...)` |
| 3 | Agent | Fixes `subtract` implementation |
| 4 | Agent | Runs tests — 1 still failing |
| 5 | Agent | Fixes `add` negative case |
| 6 | Agent | Invokes `goal-verifier` skill |
| 7 | Verifier | **REJECT** — implementer skipped updating GOAL.md checkboxes |
| 8 | Agent | Checks off Done Condition items; re-runs verifier |
| 9 | Verifier | **PASS** — `npm test` exits 0 |
| 10 | Agent | `update_goal(completed: true, message: "Verifier PASS — 3/3 tests green")` |

## Expected verifier lesson

The deliberate REJECT on turn 7 teaches the maker/checker split: green tests alone are not enough without checklist evidence.

## Artifacts

- [before-audit.txt](before-audit.txt) — baseline audit output
- [after-init.txt](after-init.txt) — post-`goal-init` audit output