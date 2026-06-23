# Goal Engineering: Run Until Verifiably Done

*The canonical essay — why one-shot prompts fail and what goals fix.*

---

## The gap

Most agent sessions end when the model **sounds** done. Tests might fail. Migration might be half-finished. The chat moved on.

That gap — between "looks done" and **actually done** — is where agent productivity goes to die. You re-prompt. You re-explain context. You trust a summary you cannot verify.

**Goal engineering** closes the gap with four ideas:

1. **One bounded objective** with a verifiable stop condition
2. **External state** (`GOAL.md`) that survives compaction
3. **A verifier** that does not implement (maker/checker split)
4. **A budget** so runaway turns get killed

## Prompt, loop, goal

```
Prompt  = one turn, one answer
Loop    = recurring discovery on a cadence
Goal    = run until done (or blocked / paused)
```

Prompts are fine for spikes. Loops are fine for triage. Goals are for **finish**.

[Loop engineering](https://github.com/cobusgreyling/loop-engineering) discovers work; goals complete it.

## The Grok Build surface

Humans set intent:

```
/goal Migrate auth to v2. Done when tests pass and no legacy imports.
```

Agents report without spamming chat:

```
update_goal(message: "12/18 auth tests passing")
update_goal(completed: true, message: "Verifier PASS")
```

The objective persists across turns until completed, blocked, or cleared.

## Readiness levels (G0→G3)

Not every repo should run unattended goals on day one.

| Level | Posture |
|-------|---------|
| G0 | Ad hoc prompts |
| G1 | Human approves milestones |
| G2 | Verifier gates completion |
| G3 | Unattended with budget + run log |

Measure yours:

```bash
npx @cobusgreyling/goal-audit . --suggest
```

## Patterns beat hero prompts

Six production patterns cover most finish work: tests green, migrate module, implement feature, fix bug, refactor safely, coverage target.

Each ships an example `/goal` line, verifier strategy, and `GOAL.md` fields.

The most common failure is not bad code — it is a **mega-goal**. See [mega-goal-failure](../stories/mega-goal-failure.md). Split with `goal-scoper` before `/goal`.

## The stack

| Layer | Question |
|-------|----------|
| Context engineering | What does the model see? |
| Harness engineering | How does one run execute safely? |
| **Goal engineering** | How do we run until verifiably done? |
| Loop engineering | What keeps work discovered? |
| Fleet engineering | How do many agents coordinate? |

## Start in ten minutes

```bash
npx @cobusgreyling/goal init . --pattern tests-green --tool grok
npx @cobusgreyling/goal doctor . --suggest
```

Then in Grok Build:

```
/goal Read GOAL.md. Fix failing tests. goal-verifier before completed: true.
```

Walk through a full replay: [golden path](../examples/golden-path/SESSION.md).

---

**Goal engineering is replacing one-shot prompts with verifiable, run-until-done objectives.** This repo is the canonical reference for Grok Build `/goal` — patterns, skills, CLIs, and honest stories.

[GitHub](https://github.com/cobusgreyling/goal-engineering) · [Showcase](https://cobusgreyling.github.io/goal-engineering/) · [FAQ](faq.md)