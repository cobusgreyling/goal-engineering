# Migrate Module Starter

Scaffold with:

```bash
npx @cobusgreyling/goal-init . --pattern migrate-module --tool grok
```

```
/goal Migrate module per GOAL.md. Done when tests pass, zero legacy imports, goal-verifier PASS.
```

Verifier runs import scan (`rg`) plus full test suite.