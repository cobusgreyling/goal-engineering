# @cobusgreyling/goal

Unified CLI for goal engineering.

```bash
npx @cobusgreyling/goal doctor . --suggest
npx @cobusgreyling/goal init . --pattern tests-green --tool grok
npx @cobusgreyling/goal estimate --pattern fix-bug --level G2
```

| Command | Delegates to |
|---------|----------------|
| `doctor` / `audit` | `@cobusgreyling/goal-audit` |
| `init` / `scaffold` | `@cobusgreyling/goal-init` |
| `estimate` / `cost` | `@cobusgreyling/goal-cost` |