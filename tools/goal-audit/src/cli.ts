#!/usr/bin/env node
import { auditProject } from './auditor.js';
import { formatHuman, formatJson, formatMarkdown } from './reporter.js';

const LEVEL_ORDER = { G0: 0, G1: 1, G2: 2, G3: 3 } as const;
type GoalLevel = keyof typeof LEVEL_ORDER;

function parseMinLevel(argv: string[]): GoalLevel | null {
  const idx = argv.findIndex((a) => a === '--min-level');
  if (idx === -1) return null;
  const raw = argv[idx + 1]?.toUpperCase() as GoalLevel | undefined;
  if (!raw || !(raw in LEVEL_ORDER)) {
    console.error('goal-audit: --min-level requires G0, G1, G2, or G3');
    process.exit(1);
  }
  return raw;
}

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('-')) || '.';
const json = args.includes('--json');
const md = args.includes('--md');
const suggest = args.includes('--suggest') || args.includes('--fix');
const help = args.includes('--help') || args.includes('-h');
const minLevel = parseMinLevel(args);

if (help) {
  console.log(`goal-audit — Goal Readiness Score CLI (G0–G3)

Usage:
  goal-audit [path] [options]

Options:
  --json              JSON output (for CI / scripting)
  --md                Markdown report
  --suggest           Show copy-from-template commands
  --min-level <G0-G3> Fail if score level is below threshold (CI gate)
  --help, -h          This help

Scores goal readiness for Grok Build /goal:
  GOAL.md, verifier skills, AGENTS.md, tests, CI, budget docs

Exit codes:
  0  meets --min-level (or score >= 40 when omitted)
  2  below threshold
  1  error

Examples:
  goal-audit .
  goal-audit . --suggest
  npx @cobusgreyling/goal-audit . --json --min-level G2
`);
  process.exit(0);
}

try {
  const result = await auditProject(target);
  if (json) console.log(formatJson(result));
  else if (md) console.log(formatMarkdown(result));
  else console.log(formatHuman(result));

  if (suggest) {
    console.log('\n=== Suggested actions ===');
    console.log('');
    console.log('  npx @cobusgreyling/goal-init . --pattern tests-green --tool grok');
    console.log('  npx @cobusgreyling/goal-audit . --suggest');
    console.log('');
    console.log('  # Then in Grok Build:');
    console.log('  /goal Read GOAL.md. Work the objective. goal-verifier before completed: true.');
    console.log('');
    console.log('  Docs: https://github.com/cobusgreyling/goal-engineering');
  }

  const threshold = minLevel ? LEVEL_ORDER[minLevel] : 1;
  const passed = LEVEL_ORDER[result.level] >= threshold;
  process.exit(passed ? 0 : 2);
} catch (err) {
  console.error('goal-audit error:', err instanceof Error ? err.message : err);
  process.exit(1);
}