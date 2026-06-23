# Release playbook — goal-audit

| Package | Directory | Release tag |
|---------|-----------|-------------|
| `@cobusgreyling/goal-audit` | `tools/goal-audit` | `goal-audit-v*` |

## One-time setup

1. Add repo secret `NPM_TOKEN` (copy from [loop-engineering](https://github.com/cobusgreyling/loop-engineering) settings) **or** configure [npm Trusted Publisher](https://docs.npmjs.com/trusted-publishers) for `@cobusgreyling/goal-audit`:
   - Repository: `cobusgreyling/goal-engineering`
   - Workflow: `release-goal-audit.yml`

2. Enable GitHub Pages — see [GITHUB_PAGES.md](./GITHUB_PAGES.md).

## Publish

```bash
# bump version in tools/goal-audit/package.json, commit, then:
git tag goal-audit-v1.0.0
git push origin goal-audit-v1.0.0
```

## Verify

```bash
npx @cobusgreyling/goal-audit --help
npx @cobusgreyling/goal-audit . --suggest
```