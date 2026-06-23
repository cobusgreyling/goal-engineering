# Release playbook — goal-audit

| Package | Directory | Release tag |
|---------|-----------|-------------|
| `@cobusgreyling/goal-audit` | `tools/goal-audit` | `goal-audit-v*` |

## One-time setup

**npm publishes from [loop-engineering](https://github.com/cobusgreyling/loop-engineering)** (`tools/goal-audit` mirror + `release-goal-audit.yml`), same pattern as `loop-audit`. Source of truth remains this repo.

1. On [npmjs.com](https://www.npmjs.com/) → `@cobusgreyling/goal-audit` → **Trusted Publisher** (optional):
   - Repository: `cobusgreyling/loop-engineering`
   - Workflow: `release-goal-audit.yml`

2. GitHub Pages — see [GITHUB_PAGES.md](./GITHUB_PAGES.md) (enabled at `/docs`).

## Publish

```bash
# bump version in tools/goal-audit/package.json, commit, then:
git tag goal-audit-v1.0.0
git push origin goal-audit-v1.0.0
```

## First publish (one-time manual step)

CI tests pass; automated publish returns npm 404 until the package exists on npm. From a machine with `npm login` as `cobusgreyling`:

```bash
git clone https://github.com/cobusgreyling/goal-engineering.git
cd goal-engineering/tools/goal-audit
npm ci && npm run build && npm test
npm publish --access public
```

Then add **Trusted Publisher** on npm for `@cobusgreyling/goal-audit` → `cobusgreyling/loop-engineering` / `release-goal-audit.yml`. Future releases: `git tag goal-audit-v1.0.3 && git push origin goal-audit-v1.0.3` from loop-engineering.

## Verify

```bash
npx @cobusgreyling/goal-audit --help
npx @cobusgreyling/goal-audit . --suggest
```