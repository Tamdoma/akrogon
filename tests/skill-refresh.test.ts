import { test, expect, describe } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root: string = resolve(__dirname, '..');
const impl: string = readFileSync(join(root, 'skills/implement-issue/SKILL.md'), 'utf8');
const check: string = readFileSync(join(root, 'skills/check-issue/SKILL.md'), 'utf8');

function section(text: string, heading: string): string {
  const start: number = text.indexOf('\n' + heading);
  if (start === -1) throw new Error('missing heading ' + heading);
  const rest: string = text.slice(start + heading.length + 1);
  const end: number = rest.indexOf('\n## ');
  return end === -1 ? rest : rest.slice(0, end);
}

function paragraph(text: string, marker: string): string {
  const idx: number = text.indexOf(marker);
  if (idx === -1) throw new Error('missing marker ' + marker);
  const before: number = text.lastIndexOf('\n\n', idx);
  const after: number = text.indexOf('\n\n', idx);
  return text.slice(before + 2, after === -1 ? undefined : after);
}

const implFix: string = section(impl, '## check.fix');
const implShared: string = section(impl, '## Shared context');
const implImplement: string = section(impl, '## implement');
const mergeOrigin: string = paragraph(implFix, 'A repair requested from merge');
const recheck: string = paragraph(check, 'On re-check after `check.fix`');

describe('shared refresh rule in implement-issue', () => {
  const required: string[] = [
    'A refreshes the leaf branch onto current main',
    'fetches the configured remote',
    'rebases the leaf branch onto the current `<remote>/<default_branch>`',
    'refreshes `AKROGON_BASE` from `akrogon config`',
    'keeping both true sides',
    'plan-correction',
    'original error',
    'implementation/report.md',
    'no phase move',
    'resumes at the refresh',
    'never proceeds on an old tip',
    'prior and new base',
    'prior and new head',
    'never carried over',
  ];

  test('shared context states the refresh rule and its sub-rules', () => {
    for (const anchor of required) {
      expect(implShared).toContain(anchor);
    }
  });

  test('fetch/rebase wording lives in Shared context only', () => {
    expect(implShared).toContain('fetches the configured remote');
    expect(implImplement).not.toContain('fetches the configured remote');
    expect(implFix).not.toContain('fetches the configured remote');
  });

  test('implement runs the refresh before the first unit', () => {
    const refresh: number = implImplement.indexOf('refresh');
    const unit: number = implImplement.indexOf('Before coding');
    expect(refresh).toBeGreaterThanOrEqual(0);
    expect(refresh).toBeLessThan(unit);
  });

  test('check.fix runs the refresh before reading findings', () => {
    const refresh: number = implFix.indexOf('refresh');
    const findings: number = implFix.indexOf('Read the recorded findings');
    expect(refresh).toBeGreaterThanOrEqual(0);
    expect(refresh).toBeLessThan(findings);
  });

  test('the refresh before final proof sits after the final commit', () => {
    for (const text of [implImplement, implFix]) {
      const proofPara: string = paragraph(text, 'passing proof for every done-criterion');
      const commit: number = proofPara.indexOf('commit');
      const refresh: number = proofPara.indexOf('refresh');
      const proof: number = proofPara.indexOf('passing proof');
      expect(commit).toBeGreaterThanOrEqual(0);
      expect(refresh).toBeGreaterThan(commit);
      expect(proof).toBeGreaterThan(refresh);
    }
  });
});

describe('merge-origin check.fix', () => {
  test('keeps its replay and green-replay rules', () => {
    for (const anchor of [
      'replays the recorded commands',
      'green replay',
      'base-run rule',
      'verbatim',
      'the rejected run',
      'check.review',
    ]) {
      expect(mergeOrigin).toContain(anchor);
    }
  });

  test('uses the shared refresh instead of restating fetch and rebase', () => {
    expect(mergeOrigin).toContain('refresh');
    expect(mergeOrigin).not.toContain('fetches the configured remote');
    expect(mergeOrigin).not.toContain('rebases onto');
    expect(mergeOrigin).not.toContain('rebases the repaired head');
  });
});

describe('check-issue re-check after a refreshed check.fix', () => {
  test('computes the range-diff from recorded SHAs', () => {
    for (const anchor of [
      'git range-diff',
      'prior reviewed base',
      'prior reviewed head',
      'handed-off base',
      'handed-off head',
      'added or changed',
    ]) {
      expect(recheck).toContain(anchor);
    }
  });

  test("main's commits are not reviewed as repair", () => {
    expect(recheck).toMatch(/main('s)? commits? (is |are )?not reviewed as repair/i);
  });
});

describe('no merge-only-main claims outside the refresh rule', () => {
  const forbidden: RegExp[] = [
    /only a merge-origin `check\.fix` rebases/i,
    /meets? (current |the )?main only at merge/i,
    /only at merge(?!_checks| does| checks)/i,
  ];

  function collect(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path: string = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...collect(path));
      else if (entry.name.endsWith('.md')) out.push(path);
    }
    return out;
  }

  const files: string[] = [...collect(join(root, 'skills')), ...collect(join(root, 'docs'))];

  test('skills/ and docs/ carry no stale merge-only wording', () => {
    const hits: string[] = [];
    for (const file of files) {
      const lines: string[] = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line: string, i: number) => {
        if (line.includes('merge_checks')) return;
        for (const re of forbidden) {
          if (re.test(line)) hits.push(`${file.slice(root.length + 1)}:${i + 1}: ${line.trim().slice(0, 80)}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
