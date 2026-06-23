# Goal Engineering

<p align="center">
  <a href="https://cobusgreyling.github.io/goal-engineering/">
    <img src="https://img.shields.io/badge/✨_Explore_the_Showcase-Run_until_done_with_Grok_Build-0d1117?style=for-the-badge&labelColor=111a28&color=f59e0b" alt="Explore the Showcase" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/cobusgreyling/goal-engineering/stargazers"><img src="https://img.shields.io/github/stars/cobusgreyling/goal-engineering?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/cobusgreyling/goal-engineering/actions/workflows/audit.yml"><img src="https://img.shields.io/github/actions/workflow/status/cobusgreyling/goal-engineering/audit.yml?label=goal-audit%20dogfood" alt="goal-audit dogfood"></a>
  <a href="https://www.npmjs.com/package/@cobusgreyling/goal-audit"><img src="https://img.shields.io/npm/v/@cobusgreyling/goal-audit?label=goal-audit" alt="goal-audit npm"></a>
  <a href="https://github.com/cobusgreyling/goal-engineering/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT"></a>
  <a href="https://cobusgreyling.github.io/goal-engineering/"><img src="https://img.shields.io/badge/GitHub_Pages-live%20%7C%20interactive-f59e0b" alt="Pages"></a>
</p>

**Goal engineering is replacing one-shot prompts with verifiable, run-until-done objectives.** You define what "done" means, Grok Build works across turns until the condition holds — and reports progress via `/goal` and `update_goal`.

This is the **canonical public reference** for [Grok Build CLI](https://x.ai)'s `/goal` feature.

<p align="center">
  <strong><a href="https://cobusgreyling.github.io/goal-engineering/">→ Interactive showcase + pattern picker</a></strong>
  <br>
  <strong><a href="https://github.com/cobusgreyling/loop-engineering">→ Companion: Loop Engineering</a></strong> (scheduled cadence) ·
  <strong><a href="https://github.com/cobusgreyling/fleet-engineering">Fleet Engineering</a></strong> (governed populations)
</p>

## The One-Line Definition

A **goal** is a single autonomous objective with a verifiable completion condition. Unlike a loop (which fires on a schedule), a goal **persists across turns** until Grok marks it complete, blocked, or you pause it.

```
Prompt  = one turn, one answer
Loop    = recurring discovery + triage on a cadence
Goal    = run until done (or blocked / paused)
```

## Quick Start (2 minutes)

```bash
# 1. Clone this reference
git clone https://github.com/cobusgreyling/goal-engineering.git
cd goal-engineering

# 2. Audit your project for goal readiness
npx @cobusgreyling/goal-audit . --suggest

# 3. In Grok Build CLI, set a goal
/goal All tests pass and auth module uses the new API
```

Manage the active goal:

```
/goal status    # check progress
/goal pause     # pause without clearing
/goal resume    # continue
/goal clear     # end goal mode
```

## Contents

- [Why Goals Matter](#why-goals-matter)
- [Grok Build API](#grok-build-api)
- [The Four Primitives](#the-four-primitives)
- [Patterns](#patterns)
- [Getting Started](#getting-started-5-minutes)
- [Goal vs Loop](#goal-vs-loop)
- [Operating & Safety](#operating--safety)
- [Tools](#tools)
- [Contributing](#contributing)
- [License](#license)

## Why Goals Matter

Most agent work fails in the gap between "looks done" and **actually done**. Goals close that gap:

1. **Persistence** — the objective survives compaction and new turns
2. **Progress telemetry** — `update_goal` logs status without spamming the chat
3. **Explicit lifecycle** — pause, resume, clear, blocked
4. **Verifiable completion** — you define the stop condition up front

Goals pair naturally with [loop engineering](https://github.com/cobusgreyling/loop-engineering): loops discover work; goals **finish** it.

## Grok Build API

| Surface | Purpose |
|---------|---------|
| `/goal <objective>` | Set a new autonomous goal |
| `/goal status` | Show current goal state |
| `/goal pause` / `resume` | Pause or continue |
| `/goal clear` | Exit goal mode |
| `update_goal` tool | Agent reports progress (`message`), completion (`completed: true`), or blockers (`blocked_reason`) |

Full reference: [docs/api-reference.md](docs/api-reference.md)

**Availability:** `/goal` appears when the goal feature is enabled and `update_goal` is in the session toolset.

## The Four Primitives

| Primitive | Job in a Goal |
|-----------|---------------|
| **Objective** | One sentence + verifiable done condition |
| **Verifier** | Separate check — implementer must not grade its own homework |
| **State** | `GOAL.md` or equivalent external memory |
| **Budget** | Token/turn caps and kill switches |

Detail: [docs/primitives.md](docs/primitives.md) · Cross-tool matrix: [docs/primitives-matrix.md](docs/primitives-matrix.md)

### Anatomy of a Goal

```mermaid
flowchart LR
    A["/goal &lt;objective&gt;"] --> B[Scope + done condition]
    B --> C[(GOAL.md state)]
    C --> D[Implementer turns]
    D --> E[Verifier sub-agent / tests]
    E --> F{Done?}
    F -->|yes| G["update_goal(completed: true)"]
    F -->|blocked| H["update_goal(blocked_reason)"]
    F -->|no| D
    G --> I[/goal clear or new goal/]
```

## Patterns

| Pattern | When to use |
|---------|-------------|
| [Tests Green](patterns/tests-green.md) | CI red → green with verifier gates |
| [Migrate Module](patterns/migrate-module.md) | API/module migration with compatibility checks |
| [Implement Feature](patterns/implement-feature.md) | Scoped feature with acceptance criteria |
| [Fix Bug](patterns/fix-bug.md) | Repro → fix → regression test |
| [Refactor Safely](patterns/refactor-safely.md) | Behavior-preserving refactor with test lock |
| [Coverage Target](patterns/coverage-target.md) | Raise coverage to a threshold |

Unsure? [Pattern Picker](docs/pattern-picker.md) · Full catalog: [patterns/README.md](patterns/README.md)

## Getting Started (5 minutes)

```bash
# Scaffold a minimal goal-ready project
cp -r starters/minimal-goal/.grok/skills/goal-verifier .grok/skills/
cp starters/minimal-goal/GOAL.md.example GOAL.md

# Audit
npx @cobusgreyling/goal-audit . --suggest
```

In Grok Build:

```
/goal Read GOAL.md. Implement the scoped objective. Run tests after each meaningful change.
Use update_goal for progress. Do not mark completed until the verifier skill passes.
```

See [starters/minimal-goal/](starters/minimal-goal/) and [docs/goal-design-checklist.md](docs/goal-design-checklist.md).

## Goal vs Loop

| | Goal | Loop |
|---|------|------|
| **Trigger** | You set an objective | Schedule (`/loop`) or automation |
| **Duration** | Until done / blocked / cleared | Recurring forever (or until cancelled) |
| **Best for** | Finish a bounded task | Discover + triage ongoing work |
| **State file** | `GOAL.md` | `STATE.md`, `LOOP.md` |
| **Grok command** | `/goal` | `/loop` + `scheduler_*` |

When to combine: a daily loop triages; when it finds a fixable item, **hand off to a goal** for run-until-done execution. See [docs/goal-vs-loop.md](docs/goal-vs-loop.md).

## Operating & Safety

- [Operating Goals](docs/operating-goals.md) — day-to-day playbook
- [Safety](docs/safety.md) — deny lists, human gates, kill switches
- [Failure Modes](docs/failure-modes.md) — what goes wrong and how to recover
- [GOAL.md](GOAL.md) — how this reference repo uses goals on itself

## Tools

| Tool | Command |
|------|---------|
| [goal-audit](tools/goal-audit/) | `npx @cobusgreyling/goal-audit . --suggest` |

Scores **Goal Readiness (G0–G3)** from signals: `GOAL.md`, verifier skill, test harness, `AGENTS.md`, done-condition clarity.

## The Stack

| Layer | Unit | Question |
|-------|------|----------|
| Context Engineering | One inference | What does the model see? |
| Harness Engineering | One agent run | How does a single run execute safely? |
| **Goal Engineering** | One bounded objective | How do we run until verifiably done? |
| [Loop Engineering](https://github.com/cobusgreyling/loop-engineering) | Autonomous system over time | What keeps prompting on a cadence? |
| [Fleet Engineering](https://github.com/cobusgreyling/fleet-engineering) | Agent populations | How do many agents coordinate at scale? |

## Contributing

PRs that improve patterns, verifier skills, or goal-audit heuristics are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

---

**Made with Grok Build.** This repo is the go-to reference for `/goal` — link here when you teach, blog, or ship goal-driven agent workflows.