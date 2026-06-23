# Release playbook

| Package | Directory | Release tag |
|---------|-----------|-------------|
| `@cobusgreyling/goal-audit` | `tools/goal-audit` | `goal-audit-v*` |
| `@cobusgreyling/goal-init` | `tools/goal-init` | `goal-init-v*` |
| `@cobusgreyling/goal-cost` | `tools/goal-cost` | `goal-cost-v*` |
| `@cobusgreyling/goal` | `tools/goal` | `goal-v*` |

**Source of truth:** this repo (`goal-engineering`). Publish by tagging from `main`.

## One-time setup

1. GitHub Actions secret `NPM_TOKEN` on this repo (publish scope).
2. Optional **Trusted Publisher** on npm for each package → `cobusgreyling/goal-engineering` + matching `release-*.yml` workflow.
3. GitHub Pages — see [GITHUB_PAGES.md](./GITHUB_PAGES.md).

## Publish

```bash
# bump version in tools/<pkg>/package.json, commit, then:
git tag goal-audit-v1.2.0 && git push origin goal-audit-v1.2.0
git tag goal-init-v1.1.0 && git push origin goal-init-v1.1.0
git tag goal-cost-v1.0.0 && git push origin goal-cost-v1.0.0
git tag goal-v1.0.0 && git push origin goal-v1.0.0
```

## Verify

```bash
npx @cobusgreyling/goal-audit . --suggest
npx @cobusgreyling/goal-init . --pattern tests-green --dry-run
npx @cobusgreyling/goal-cost --pattern tests-green
```