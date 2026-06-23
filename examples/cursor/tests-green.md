# Cursor — Tests Green Goal (no `/goal` slash command)

Cursor does not expose Grok's `/goal` API. Use explicit prompt + `GOAL.md` state + Review mode as verifier.

## Setup

```bash
npx @cobusgreyling/goal-init . --pattern tests-green --tool grok
# Skills land in .grok/skills/ — copy goal-verifier to .cursor/skills/ if needed
mkdir -p .cursor/skills && cp -r .grok/skills/goal-verifier .cursor/skills/
```

## Prompt (Composer / Agent)

```
You are in GOAL MODE until I say clear.

Objective: Read GOAL.md. Fix all failing tests listed there.
Done when: npm test exits 0 AND you run the goal-verifier skill checklist.

Rules:
- Log milestones in GOAL.md Progress Log (not long chat summaries)
- Do NOT claim done until verifier evidence is in GOAL.md
- If stuck after 3 attempts on same test, stop and list blockers
```

## Verifier

Use **Review** on the diff, or spawn a second agent with `goal-verifier` skill only (read-only).

## Audit

```bash
npx @cobusgreyling/goal-audit . --suggest
```