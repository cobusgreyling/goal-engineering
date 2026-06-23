import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditProject } from '../dist/auditor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(__dirname, 'fixtures');

test('good-goal-project fixture scores G2+', async () => {
  const target = path.join(fixturesRoot, 'good-goal-project');
  const result = await auditProject(target);
  assert.ok(result.score >= 60, `expected G2+, got ${result.score} (${result.level})`);
  assert.equal(result.signals.verifier.present, true);
  assert.equal(result.signals.goalFile.present, true);
});

test('empty temp dir scores low', async () => {
  const tmp = path.join(fixturesRoot, 'fixtures-empty');
  const result = await auditProject(tmp);
  assert.ok(result.score < 40);
  assert.equal(result.level, 'G0');
});

test('partial GOAL.md without verifier scores G0-G1', async () => {
  const target = path.join(fixturesRoot, 'partial-goal-project');
  const result = await auditProject(target);
  assert.ok(result.score < 60);
  assert.equal(result.signals.verifier.present, false);
});

test('python fixture detects pytest harness', async () => {
  const target = path.join(fixturesRoot, 'python-project');
  const result = await auditProject(target);
  assert.equal(result.signals.tests.present, true);
  assert.equal(result.signals.verifier.present, true);
});

test('--json output shape from CLI', async () => {
  const { spawnSync } = await import('node:child_process');
  const cli = path.join(__dirname, '../dist/cli.js');
  const target = path.join(fixturesRoot, 'good-goal-project');
  const r = spawnSync(process.execPath, [cli, target, '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  const json = JSON.parse(r.stdout);
  assert.ok(json.score >= 0 && json.score <= 100);
  assert.match(json.level, /^G[0-3]$/);
  assert.ok(Array.isArray(json.findings));
  assert.ok(Array.isArray(json.recommendations));
});

test('CLI --min-level G3 fails on partial project', async () => {
  const { spawnSync } = await import('node:child_process');
  const cli = path.join(__dirname, '../dist/cli.js');
  const target = path.join(fixturesRoot, 'partial-goal-project');
  const r = spawnSync(process.execPath, [cli, target, '--min-level', 'G3']);
  assert.equal(r.status, 2);
});