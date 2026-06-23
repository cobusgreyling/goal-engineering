# Adopters

Projects using goal engineering patterns. PRs welcome.

| Project | Pattern | G-level | Notes |
|---------|---------|---------|-------|
| [goal-engineering](https://github.com/cobusgreyling/goal-engineering) | Reference repo | G3 | Dogfoods audit, init, cost, run log |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | Handoff to `/goal` | G2 | Loops triage; goals finish bounded items |
| [golden-path sample](../examples/golden-path/sample-app) | tests-green | G2 | Tutorial fixture — 2 failing tests |

## Add your project

Open a PR adding a row:

| Field | Example |
|-------|---------|
| Project link | `https://github.com/you/app` |
| Pattern | `fix-bug`, `tests-green`, etc. |
| G-level | `G1`–`G3` from `goal-audit` |
| Notes | One line — honest failures welcome |

Template:

```markdown
| [your-repo](https://github.com/you/your-repo) | tests-green | G2 | CI goals with goal-audit in PRs |
```

See [stories/](../stories/) for narrative submissions.