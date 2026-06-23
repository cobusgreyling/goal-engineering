import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(__dirname, '../dist/cli.js');

test('goal --help exits 0', () => {
  const r = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /doctor/);
});

test('goal doctor runs audit on fixtures', () => {
  const fixture = path.join(__dirname, '../../goal-audit/test/fixtures/good-goal-project');
  const r = spawnSync(process.execPath, [cli, 'doctor', fixture, '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  const json = JSON.parse(r.stdout);
  assert.ok(json.score >= 60);
});