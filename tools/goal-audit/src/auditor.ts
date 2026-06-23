import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export interface GoalSignals {
  goalFile: { present: boolean; path?: string };
  goalConfig: { present: boolean };
  doneConditions: { present: boolean };
  skills: { count: number; goalSkills: string[]; grokNative: boolean };
  verifier: { present: boolean };
  scoper: { present: boolean };
  agentsMd: { present: boolean; mentionsGoal: boolean };
  patterns: { documented: boolean };
  safety: { safetyDocPresent: boolean; budgetDoc: boolean };
  tests: { present: boolean };
  ci: { present: boolean };
  runLog: { present: boolean; recentActivity: boolean };
}

export interface Finding {
  level: 'ok' | 'warn' | 'fail';
  message: string;
}

export interface AuditResult {
  target: string;
  score: number;
  level: 'G0' | 'G1' | 'G2' | 'G3';
  assessment: string;
  signals: GoalSignals;
  findings: Finding[];
  recommendations: string[];
}

const GOAL_FILES = ['GOAL.md', 'goal.md', 'docs/GOAL.md'];
const GOAL_SKILL_NAMES = [
  'goal-verifier',
  'goal-scoper',
  'goal-completion-check',
];
const SAFETY_FILES = ['docs/safety.md', 'SECURITY.md', 'safety.md'];
const BUDGET_FILES = ['goal-budget.md', 'docs/goal-budget.md'];
const RUN_LOG_FILES = ['goal-run-log.md', 'docs/goal-run-log.md'];

async function fileExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function findSkills(root: string): Promise<{ names: string[]; grokNative: boolean }> {
  const dirs = [
    { path: path.join(root, '.grok', 'skills'), grokNative: true },
    { path: path.join(root, '.claude', 'skills'), grokNative: false },
    { path: path.join(root, '.codex', 'skills'), grokNative: false },
    { path: path.join(root, 'skills'), grokNative: false },
  ];
  const found = new Set<string>();
  let grokNative = false;
  for (const { path: dir, grokNative: isGrok } of dirs) {
    if (!(await fileExists(dir))) continue;
    if (isGrok) grokNative = true;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) found.add(e.name);
    }
  }
  return { names: [...found].sort(), grokNative };
}

async function goalHasDoneConditions(root: string, goalPaths: string[]): Promise<boolean> {
  for (const rel of goalPaths) {
    try {
      const content = await readFile(path.join(root, rel), 'utf8');
      if (/- \[[ xX]\]/.test(content) || /done condition/i.test(content)) return true;
    } catch {
      /* skip */
    }
  }
  return false;
}

const RUN_LOG_MAX_AGE_DAYS = 90;

async function runLogRecentlyUpdated(root: string): Promise<boolean> {
  for (const f of RUN_LOG_FILES) {
    const full = path.join(root, f);
    try {
      const [content, st] = await Promise.all([readFile(full, 'utf8'), stat(full)]);
      const ageDays = (Date.now() - st.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays > RUN_LOG_MAX_AGE_DAYS) continue;
      const currentYear = new Date().getFullYear();
      const hasYear = new RegExp(String(currentYear)).test(content);
      const hasOutcome = /\|\s*(completed|blocked|in progress)\s*\|/i.test(content);
      if (hasYear && hasOutcome) return true;
    } catch {
      /* skip */
    }
  }
  return false;
}

async function detectTests(root: string): Promise<boolean> {
  const hints = [
    'package.json',
    'pyproject.toml',
    'go.mod',
    'Cargo.toml',
    'vitest.config.ts',
    'jest.config.js',
    'pytest.ini',
  ];
  for (const h of hints) {
    if (await fileExists(path.join(root, h))) return true;
  }
  const testDirs = ['tests', 'test', '__tests__'];
  for (const d of testDirs) {
    if (await fileExists(path.join(root, d))) return true;
  }
  return false;
}

async function detectCi(root: string): Promise<boolean> {
  const ciPaths = [
    '.github/workflows',
    '.gitlab-ci.yml',
    'Jenkinsfile',
  ];
  for (const p of ciPaths) {
    if (await fileExists(path.join(root, p))) return true;
  }
  return false;
}

function scoreLevel(score: number): AuditResult['level'] {
  if (score >= 80) return 'G3';
  if (score >= 60) return 'G2';
  if (score >= 40) return 'G1';
  return 'G0';
}

function assessmentFor(level: AuditResult['level']): string {
  switch (level) {
    case 'G3':
      return 'production-ready goal workflows';
    case 'G2':
      return 'verified goals with checker split';
    case 'G1':
      return 'assisted goals — add verifier for G2';
    default:
      return 'ad hoc — scaffold GOAL.md and skills';
  }
}

export async function auditProject(target: string): Promise<AuditResult> {
  const root = path.resolve(target);
  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let score = 0;

  const goalPaths: string[] = [];
  for (const f of GOAL_FILES) {
    if (await fileExists(path.join(root, f))) goalPaths.push(f);
  }
  const goalFilePresent = goalPaths.length > 0;
  if (goalFilePresent) {
    score += 15;
    findings.push({ level: 'ok', message: `GOAL file present (${goalPaths.join(', ')})` });
  } else {
    findings.push({ level: 'fail', message: 'No GOAL.md — goals will not survive compaction' });
    recommendations.push('cp templates/GOAL.md.template GOAL.md');
  }

  const goalConfigPresent = await fileExists(path.join(root, 'GOAL.md'));
  if (goalConfigPresent) score += 5;

  const { names: allSkills, grokNative } = await findSkills(root);
  const goalSkills = allSkills.filter((s) => GOAL_SKILL_NAMES.includes(s));
  if (goalSkills.length > 0) {
    score += 10 + Math.min(goalSkills.length * 5, 15);
    findings.push({ level: 'ok', message: `Goal skills: ${goalSkills.join(', ')}` });
  } else {
    findings.push({ level: 'warn', message: 'No goal-verifier / goal-scoper skills found' });
    recommendations.push('npx @cobusgreyling/goal-init . --pattern minimal-goal --tool grok');
  }

  if (grokNative) {
    score += 5;
    findings.push({ level: 'ok', message: 'Skills in .grok/skills/ (Grok-native layout)' });
  } else if (goalSkills.length > 0) {
    findings.push({ level: 'warn', message: 'Skills not under .grok/skills/ — copy for Grok Build' });
    recommendations.push('cp -r skills/goal-verifier .grok/skills/');
  }

  const doneConditions = goalFilePresent
    ? await goalHasDoneConditions(root, goalPaths)
    : false;
  if (doneConditions) {
    score += 5;
    findings.push({ level: 'ok', message: 'GOAL.md has verifiable done conditions' });
  } else if (goalFilePresent) {
    findings.push({ level: 'warn', message: 'GOAL.md missing checkbox done conditions' });
    recommendations.push('Add `- [ ]` checklist under Done Condition in GOAL.md');
  }

  const verifierPresent = goalSkills.includes('goal-verifier') || allSkills.some((s) => s.includes('verifier'));
  if (verifierPresent) {
    score += 20;
    findings.push({ level: 'ok', message: 'Verifier skill or agent present' });
  } else {
    findings.push({ level: 'fail', message: 'No verifier — implementer may self-grade' });
    recommendations.push('Add goal-verifier skill from skills/goal-verifier/');
  }

  const scoperPresent = goalSkills.includes('goal-scoper');
  if (scoperPresent) score += 5;

  const agentsPath = path.join(root, 'AGENTS.md');
  const agentsPresent = await fileExists(agentsPath);
  let mentionsGoal = false;
  if (agentsPresent) {
    const content = await readFile(agentsPath, 'utf8');
    mentionsGoal = /goal|update_goal|GOAL\.md/i.test(content);
    score += mentionsGoal ? 10 : 5;
    findings.push({
      level: mentionsGoal ? 'ok' : 'warn',
      message: mentionsGoal ? 'AGENTS.md mentions goal discipline' : 'AGENTS.md present but no goal rules',
    });
    if (!mentionsGoal) {
      recommendations.push('Add goal rules to AGENTS.md: verifier before completed: true');
    }
  } else {
    findings.push({ level: 'warn', message: 'No AGENTS.md' });
    recommendations.push('gbs scaffold agents-md --write (from grok-build-showcase) or write AGENTS.md');
  }

  const patternsPresent =
    (await fileExists(path.join(root, 'patterns'))) ||
    (await fileExists(path.join(root, 'docs', 'api-reference.md')));
  if (patternsPresent) {
    score += 5;
    findings.push({ level: 'ok', message: 'Goal patterns or API docs present' });
  }

  let safetyDocPresent = false;
  for (const f of SAFETY_FILES) {
    if (await fileExists(path.join(root, f))) {
      safetyDocPresent = true;
      break;
    }
  }
  let budgetDoc = false;
  for (const f of BUDGET_FILES) {
    if (await fileExists(path.join(root, f))) {
      budgetDoc = true;
      break;
    }
  }
  if (safetyDocPresent) score += 5;
  if (budgetDoc) {
    score += 10;
    findings.push({ level: 'ok', message: 'Goal budget documented' });
  } else {
    recommendations.push('cp templates/goal-budget.md.template goal-budget.md');
  }

  const testsPresent = await detectTests(root);
  if (testsPresent) {
    score += 15;
    findings.push({ level: 'ok', message: 'Test harness detected' });
  } else {
    findings.push({ level: 'warn', message: 'No test harness — done conditions are subjective' });
  }

  const ciPresent = await detectCi(root);
  if (ciPresent) {
    score += 10;
    findings.push({ level: 'ok', message: 'CI configuration present' });
  }

  let runLog = false;
  for (const f of RUN_LOG_FILES) {
    if (await fileExists(path.join(root, f))) {
      runLog = true;
      break;
    }
  }
  const runLogRecent = runLog ? await runLogRecentlyUpdated(root) : false;
  if (runLog) {
    score += 5;
    findings.push({
      level: runLogRecent ? 'ok' : 'warn',
      message: runLogRecent ? 'Goal run log present with recent entries' : 'Goal run log present (no recent entries)',
    });
  } else {
    recommendations.push('cp templates/goal-run-log.md.template goal-run-log.md');
  }

  score = Math.min(100, score);
  if (!testsPresent && score > 79) {
    score = 79;
    findings.push({
      level: 'warn',
      message: 'Score capped at G2 — add test harness for G3 (objective gates need npm test / pytest)',
    });
    recommendations.push('Document test command in AGENTS.md and package.json scripts.test');
  }
  if (score >= 80 && runLog && !runLogRecent) {
    score = 79;
    findings.push({
      level: 'warn',
      message: 'Score capped at G2 — goal-run-log.md needs a recent outcome entry for G3',
    });
    recommendations.push('Log the latest goal run in goal-run-log.md (date, outcome, turns)');
  }
  const level = scoreLevel(score);

  if (level === 'G0') {
    recommendations.push('Read docs/goal-design-checklist.md and starters/minimal-goal/');
  }
  if (level === 'G1' && !verifierPresent) {
    recommendations.push('Graduate to G2: add goal-verifier before unattended goals');
  }

  return {
    target: root,
    score,
    level,
    assessment: assessmentFor(level),
    signals: {
      goalFile: { present: goalFilePresent, path: goalPaths[0] },
      goalConfig: { present: goalConfigPresent },
      doneConditions: { present: doneConditions },
      skills: { count: allSkills.length, goalSkills, grokNative },
      verifier: { present: verifierPresent },
      scoper: { present: scoperPresent },
      agentsMd: { present: agentsPresent, mentionsGoal },
      patterns: { documented: patternsPresent },
      safety: { safetyDocPresent, budgetDoc },
      tests: { present: testsPresent },
      ci: { present: ciPresent },
      runLog: { present: runLog, recentActivity: runLogRecent },
    },
    findings,
    recommendations: [...new Set(recommendations)],
  };
}