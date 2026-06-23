import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '..', 'dist', 'cli.js');

function runCli(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI, ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.on('error', reject);
  });
}

test('goal-init scaffolds migrate-module with pattern verifier', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'goal-init-migrate-'));
  try {
    const { code, stdout } = await runCli(['--pattern', 'migrate-module', '--tool', 'grok', tmp], tmp);
    assert.equal(code, 0, stdout);
    const skill = await readFile(path.join(tmp, '.grok', 'skills', 'goal-verifier', 'SKILL.md'), 'utf8');
    assert.match(skill, /import scan|legacy/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('goal-init --lang python writes pytest AGENTS.md', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'goal-init-py-'));
  try {
    const { code } = await runCli(['--pattern', 'minimal-goal', '--lang', 'python', tmp], tmp);
    assert.equal(code, 0);
    const agents = await readFile(path.join(tmp, 'AGENTS.md'), 'utf8');
    assert.match(agents, /pytest/);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('goal-init scaffolds tests-green pattern', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'goal-init-'));
  try {
    const { code, stdout } = await runCli(['--pattern', 'tests-green', '--tool', 'grok', tmp], tmp);
    assert.equal(code, 0, stdout);
    assert.match(stdout, /goal-init: tests-green/);

    await access(path.join(tmp, 'GOAL.md'));
    await access(path.join(tmp, 'goal-budget.md'));
    await access(path.join(tmp, 'goal-run-log.md'));
    await access(path.join(tmp, '.grok', 'skills', 'goal-verifier', 'SKILL.md'));

    const goal = await readFile(path.join(tmp, 'GOAL.md'), 'utf8');
    assert.match(goal, /test suite green/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});