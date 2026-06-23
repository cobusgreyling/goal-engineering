#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

type Subcommand = 'doctor' | 'init' | 'estimate';

const ALIASES: Record<string, Subcommand> = {
  doctor: 'doctor',
  audit: 'doctor',
  init: 'init',
  scaffold: 'init',
  estimate: 'estimate',
  cost: 'estimate',
};

function resolveBin(pkg: string, binName: string): string {
  const pkgJson = require.resolve(`${pkg}/package.json`);
  const root = path.dirname(pkgJson);
  const manifest = require(pkgJson) as { bin?: Record<string, string> };
  const rel = manifest.bin?.[binName];
  if (!rel) throw new Error(`bin ${binName} not found in ${pkg}`);
  return path.join(root, rel);
}

function run(bin: string, args: string[]): number {
  const result = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit' });
  if (result.error) {
    console.error('goal:', result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function printHelp() {
  console.log(`@cobusgreyling/goal — unified goal engineering CLI

Usage:
  goal <command> [args...]

Commands:
  doctor    Run goal-audit (readiness score G0–G3)
  init      Scaffold patterns via goal-init
  estimate  Token/turn estimates via goal-cost

Aliases:
  audit → doctor    cost → estimate    scaffold → init

Examples:
  npx @cobusgreyling/goal doctor . --suggest
  npx @cobusgreyling/goal init . --pattern tests-green --tool grok
  npx @cobusgreyling/goal estimate --pattern fix-bug --level G2

Docs: https://github.com/cobusgreyling/goal-engineering
`);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const cmd = ALIASES[argv[0]];
  if (!cmd) {
    console.error(`Unknown command: ${argv[0]}\nRun: goal --help`);
    process.exit(1);
  }

  const rest = argv.slice(1);
  let bin: string;
  let binName: string;

  switch (cmd) {
    case 'doctor':
      binName = 'goal-audit';
      bin = resolveBin('@cobusgreyling/goal-audit', binName);
      break;
    case 'init':
      binName = 'goal-init';
      bin = resolveBin('@cobusgreyling/goal-init', binName);
      break;
    case 'estimate':
      binName = 'goal-cost';
      bin = resolveBin('@cobusgreyling/goal-cost', binName);
      break;
  }

  process.exit(run(bin, rest));
}

main();