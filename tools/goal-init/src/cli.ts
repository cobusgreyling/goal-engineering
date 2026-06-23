#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const MONOREPO_STARTERS = path.resolve(PACKAGE_ROOT, '../../starters');
const MONOREPO_TEMPLATES = path.resolve(PACKAGE_ROOT, '../../templates');
const MONOREPO_SKILLS = path.resolve(PACKAGE_ROOT, '../../skills');

type Pattern =
  | 'minimal-goal'
  | 'tests-green'
  | 'fix-bug'
  | 'migrate-module'
  | 'implement-feature'
  | 'refactor-safely'
  | 'coverage-target';

type Tool = 'grok' | 'claude' | 'codex';
type Lang = 'node' | 'python' | 'go';

const PATTERN_STARTERS: Record<Pattern, string> = {
  'minimal-goal': 'minimal-goal',
  'tests-green': 'tests-green',
  'fix-bug': 'fix-bug',
  'migrate-module': 'migrate-module',
  'implement-feature': 'implement-feature',
  'refactor-safely': 'refactor-safely',
  'coverage-target': 'coverage-target',
};

const AGENTS_BY_LANG: Record<Lang, string> = {
  node: `# AGENTS.md

## Test commands
npm test

## Coverage (coverage-target pattern)
npm test -- --coverage

## Goal discipline
- Mirror active /goal in GOAL.md
- goal-verifier before update_goal(completed: true)
- One active goal per session
`,
  python: `# AGENTS.md

## Test commands
pytest

## Coverage (coverage-target pattern)
pytest --cov=src --cov-report=term-missing

## Goal discipline
- Mirror active /goal in GOAL.md
- goal-verifier before update_goal(completed: true)
- One active goal per session
`,
  go: `# AGENTS.md

## Test commands
go test ./...

## Coverage (coverage-target pattern)
go test ./... -coverprofile=coverage.out && go tool cover -func=coverage.out

## Goal discipline
- Mirror active /goal in GOAL.md
- goal-verifier before update_goal(completed: true)
- One active goal per session
`,
};

const GOAL_COMMANDS: Record<Pattern, string> = {
  'minimal-goal':
    '/goal Read GOAL.md. Work the active objective. update_goal for milestones. goal-verifier before completed: true.',
  'tests-green':
    '/goal Read GOAL.md. Fix all failing tests. Done when full suite passes and goal-verifier PASS.',
  'fix-bug':
    '/goal Fix bug per GOAL.md repro steps. Done when repro fails, regression test added, goal-verifier PASS.',
  'migrate-module':
    '/goal Migrate module per GOAL.md. Done when tests pass, zero legacy imports, goal-verifier PASS.',
  'implement-feature':
    '/goal Implement feature per GOAL.md acceptance criteria. goal-verifier before completed: true.',
  'refactor-safely':
    '/goal Refactor per GOAL.md. Behavior-preserving; full test suite green; goal-verifier PASS.',
  'coverage-target':
    '/goal Raise coverage to GOAL.md threshold. goal-verifier confirms coverage report.',
};

const GOAL_SNIPPETS: Record<Pattern, string> = {
  'minimal-goal': `## Active Objective\n\n[Your one-sentence objective]\n\n## Done Condition\n- [ ] Objective met\n- [ ] goal-verifier PASS\n`,
  'tests-green': `## Active Objective\n\nGet CI / local test suite green.\n\n## Done Condition\n- [ ] Full test suite exits 0\n- [ ] No new skipped tests without reason\n- [ ] goal-verifier PASS\n\n## Failing Tests (start)\n- \n`,
  'fix-bug': `## Active Objective\n\nFix bug described below.\n\n## Done Condition\n- [ ] Repro steps no longer trigger bug\n- [ ] Regression test committed\n- [ ] Full suite green\n- [ ] goal-verifier PASS\n\n## Repro Steps\n1. \n`,
  'migrate-module': `## Active Objective\n\nMigrate legacy module to new path/API.\n\n## Done Condition\n- [ ] New module tests pass\n- [ ] Zero legacy import paths remain\n- [ ] goal-verifier PASS\n`,
  'implement-feature': `## Active Objective\n\nImplement scoped feature.\n\n## Done Condition\n- [ ] Acceptance criteria met\n- [ ] Tests for new behavior\n- [ ] goal-verifier PASS\n`,
  'refactor-safely': `## Active Objective\n\nRefactor without behavior change.\n\n## Done Condition\n- [ ] Full test suite green\n- [ ] No public API breakage\n- [ ] goal-verifier PASS\n`,
  'coverage-target': `## Active Objective\n\nRaise test coverage to target threshold.\n\n## Done Condition\n- [ ] Coverage ≥ target in GOAL.md\n- [ ] No hollow tests\n- [ ] goal-verifier PASS\n`,
};

const BUDGET_TURNS: Record<Pattern, number> = {
  'minimal-goal': 30,
  'tests-green': 30,
  'fix-bug': 25,
  'migrate-module': 40,
  'implement-feature': 35,
  'refactor-safely': 30,
  'coverage-target': 35,
};

async function detectLang(targetDir: string): Promise<Lang> {
  if (await exists(path.join(targetDir, 'pyproject.toml')) || await exists(path.join(targetDir, 'pytest.ini'))) {
    return 'python';
  }
  if (await exists(path.join(targetDir, 'go.mod'))) return 'go';
  return 'node';
}

function parseArgs(argv: string[]) {
  let pattern: Pattern = 'minimal-goal';
  let tool: Tool = 'grok';
  let lang: Lang | 'auto' = 'auto';
  let target = '.';
  let dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pattern' || a === '-p') pattern = argv[++i] as Pattern;
    else if (a === '--tool' || a === '-t') tool = argv[++i] as Tool;
    else if (a === '--lang' || a === '-l') lang = argv[++i] as Lang | 'auto';
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--help' || a === '-h') return { help: true as const, pattern, tool, lang, target, dryRun };
    else if (!a.startsWith('-')) target = a;
  }

  return { help: false as const, pattern, tool, lang, target, dryRun };
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolveBundledOrMonorepo(name: 'starters' | 'templates'): Promise<string> {
  const bundled = path.join(PACKAGE_ROOT, name);
  if (await exists(bundled)) return bundled;
  return name === 'starters' ? MONOREPO_STARTERS : MONOREPO_TEMPLATES;
}

async function copyDir(src: string, dest: string, dryRun: boolean) {
  if (!(await exists(src))) return false;
  if (dryRun) {
    console.log(`  would copy: ${src} → ${dest}`);
    return true;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true });
  console.log(`  copied: ${src} → ${dest}`);
  return true;
}

async function copyFile(src: string, dest: string, dryRun: boolean) {
  if (!(await exists(src))) return false;
  if (dryRun) {
    console.log(`  would copy: ${src} → ${dest}`);
    return true;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest);
  console.log(`  copied: ${src} → ${dest}`);
  return true;
}

async function readDirNames(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

function skillDest(targetDir: string, tool: Tool, skillName: string): string {
  const roots: Record<Tool, string> = {
    grok: path.join(targetDir, '.grok', 'skills', skillName, 'SKILL.md'),
    claude: path.join(targetDir, '.claude', 'skills', skillName, 'SKILL.md'),
    codex: path.join(targetDir, '.codex', 'skills', skillName, 'SKILL.md'),
  };
  return roots[tool];
}

async function copyGoalSkills(targetDir: string, tool: Tool, starterRoot: string, dryRun: boolean) {
  const skillRoots = [
    path.join(starterRoot, '.grok', 'skills'),
    path.join(starterRoot, '.claude', 'skills'),
    path.join(starterRoot, '.codex', 'skills'),
  ];

  let copied = false;
  for (const skillsDir of skillRoots) {
    if (!(await exists(skillsDir))) continue;
    const toolPrefix = skillsDir.includes('.grok')
      ? '.grok/skills'
      : skillsDir.includes('.claude')
        ? '.claude/skills'
        : '.codex/skills';
    for (const entry of await readDirNames(skillsDir)) {
      await copyDir(path.join(skillsDir, entry), path.join(targetDir, toolPrefix, entry), dryRun);
      copied = true;
    }
  }

  if (!copied) {
    const monorepoSkills = MONOREPO_SKILLS;
    const bundledSkills = path.join(PACKAGE_ROOT, '../../skills');
    const skillsRoot = (await exists(bundledSkills)) ? bundledSkills : monorepoSkills;
    for (const name of ['goal-verifier', 'goal-scoper', 'goal-completion-check']) {
      const src = path.join(skillsRoot, name, 'SKILL.md');
      const dest = skillDest(targetDir, tool, name);
      if (!(await exists(dest))) await copyFile(src, dest, dryRun);
    }
  }
}

function buildGoalMd(pattern: Pattern): string {
  return `# GOAL.md

## Status
ACTIVE

${GOAL_SNIPPETS[pattern]}
## Deny List
- .env, credentials, production infra

## Progress Log

## Blockers

## Backlog
`;
}

function buildBudgetMd(pattern: Pattern): string {
  const turns = BUDGET_TURNS[pattern];
  return `# Goal Budget — YOUR_PROJECT

| Limit | Value |
|-------|-------|
| Max agent turns per goal | ${turns} |
| Kill switch | \`/goal pause\` |

Escalate to human for npm publish, IAM changes, or deny-listed paths.

Estimate spend: \`npx @cobusgreyling/goal-cost --pattern ${pattern}\`
`;
}

async function scaffoldFiles(
  pattern: Pattern,
  targetDir: string,
  templatesRoot: string,
  dryRun: boolean,
) {
  const goalPath = path.join(targetDir, 'GOAL.md');
  if (!(await exists(goalPath))) {
    const content = buildGoalMd(pattern);
    if (dryRun) console.log(`  would write: ${goalPath}`);
    else {
      await writeFile(goalPath, content);
      console.log('  created: GOAL.md');
    }
  }

  const budgetPath = path.join(targetDir, 'goal-budget.md');
  if (!(await exists(budgetPath))) {
    const content = buildBudgetMd(pattern);
    if (dryRun) console.log(`  would write: ${budgetPath}`);
    else {
      await writeFile(budgetPath, content);
      console.log('  created: goal-budget.md');
    }
  }

  const runLogPath = path.join(targetDir, 'goal-run-log.md');
  if (!(await exists(runLogPath))) {
    const template = path.join(templatesRoot, 'goal-run-log.md.template');
    await copyFile(template, runLogPath, dryRun);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`goal-init — scaffold goal engineering starters

Usage:
  goal-init [target-dir] --pattern <name> --tool <grok|claude|codex>

Patterns:
  minimal-goal (default)
  tests-green
  fix-bug
  migrate-module
  implement-feature
  refactor-safely
  coverage-target

Options:
  -p, --pattern   Pattern to scaffold
  -t, --tool      Tool target (default: grok)
  -l, --lang      node | python | go | auto (default: auto-detect)
  --dry-run       Print actions without copying
  -h, --help      This help

Examples:
  npx @cobusgreyling/goal-init . --pattern tests-green --tool grok
  npx @cobusgreyling/goal-init . -p fix-bug -t claude --lang python
  npx @cobusgreyling/goal-init . -p migrate-module -l go
`);
    process.exit(0);
  }

  const { pattern, tool, lang: langArg, target, dryRun } = args;
  const targetDir = path.resolve(target);
  const lang: Lang = langArg === 'auto' ? await detectLang(targetDir) : langArg;
  const starterName = PATTERN_STARTERS[pattern];
  const startersRoot = await resolveBundledOrMonorepo('starters');
  const templatesRoot = await resolveBundledOrMonorepo('templates');
  const starterRoot = path.join(startersRoot, starterName);

  if (!(await exists(starterRoot))) {
    console.error(`Starter not found: ${starterRoot}`);
    process.exit(1);
  }

  console.log(`\ngoal-init: ${pattern} → ${targetDir} (${tool}, ${lang})${dryRun ? ' [dry-run]' : ''}\n`);

  await copyGoalSkills(targetDir, tool, starterRoot, dryRun);
  await scaffoldFiles(pattern, targetDir, templatesRoot, dryRun);

  const goalExample = path.join(starterRoot, 'GOAL.md.example');
  if (pattern === 'minimal-goal' && (await exists(goalExample))) {
    const goalPath = path.join(targetDir, 'GOAL.md');
    if (!(await exists(goalPath))) {
      await copyFile(goalExample, goalPath, dryRun);
    }
  }

  if (!dryRun && !(await exists(path.join(targetDir, 'AGENTS.md')))) {
    await writeFile(path.join(targetDir, 'AGENTS.md'), AGENTS_BY_LANG[lang]);
    console.log(`  created: AGENTS.md (${lang} template)`);
  }

  console.log('\n=== Next steps ===');
  console.log(`  npx @cobusgreyling/goal-audit ${target === '.' ? '.' : target} --suggest`);
  console.log(`  npx @cobusgreyling/goal-cost --pattern ${pattern}`);
  console.log(`  First goal command (${tool}):\n  ${GOAL_COMMANDS[pattern]}\n`);
}

main().catch((err) => {
  console.error('goal-init failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});