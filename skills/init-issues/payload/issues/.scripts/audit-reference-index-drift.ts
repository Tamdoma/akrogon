#!/usr/bin/env bun

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { branchForSlug, parseIssuesConfig, readConfig, type IssuesConfig } from './lifecycle';

export type ChangeKind = 'added' | 'modified' | 'deleted' | 'renamed';
export type ScriptableVerdict = 'inline-repair-eligible' | 'route-back-required' | 'ambiguous';

export interface DiffEntry {
  changeKind: ChangeKind;
  path: string;
  oldPath: string | null;
}

interface IndexRow {
  path: string;
  raw: string;
}

export interface DriftRow {
  change_kind: ChangeKind;
  path: string;
  sibling_precedent_row: string | null;
  scriptable_verdict: ScriptableVerdict;
}

export interface ReferenceIndexDriftReport {
  base_ref: string;
  head_ref: string;
  rows: DriftRow[];
  unscriptable_reasons: string[];
}

function defaultRoot(): string {
  return path.resolve(__dirname, '../..');
}

function normalizeRepoPath(value: string): string {
  return value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

function normalizeScope(value: string): string {
  const normalized = normalizeRepoPath(value);
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim();
  const withoutLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const withoutTrailing = withoutLeading.endsWith('|') ? withoutLeading.slice(0, -1) : withoutLeading;
  return withoutTrailing.split('|').map((cell) => cell.trim());
}

function stripCellMarkup(value: string): string {
  return value.trim().replace(/^`|`$/g, '');
}

function parseReferenceIndexRows(content: string): IndexRow[] {
  return content.split(/\r?\n/)
    .filter((line) => line.trim().startsWith('| `'))
    .map((line) => {
      const cells = splitMarkdownRow(line);
      return {
        path: normalizeRepoPath(stripCellMarkup(cells[0] || '')),
        raw: line.trim()
      };
    })
    .filter((row) => row.path !== '');
}

function parentPath(value: string): string {
  const normalized = normalizeRepoPath(value).replace(/\/$/, '');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash < 0 ? '' : `${normalized.slice(0, lastSlash)}/`;
}

function findSiblingPrecedent(rows: IndexRow[], targetPath: string): IndexRow | null {
  const targetParent = parentPath(targetPath);
  const sameParentRow = rows.find((row) => row.path !== targetPath && parentPath(row.path) === targetParent);
  if (sameParentRow) return sameParentRow;
  const parentDirectoryRow = rows.find((row) => row.path === targetParent);
  return parentDirectoryRow || null;
}

function findCoveringDirectoryRow(rows: IndexRow[], targetPath: string): IndexRow | null {
  const targetParent = parentPath(targetPath);
  const coveringRows = rows
    .filter((row) => row.path.endsWith('/') && targetPath.startsWith(row.path))
    .sort((left, right) => right.path.length - left.path.length);
  const hasSameParentFileRows = rows.some((row) => !row.path.endsWith('/') && parentPath(row.path) === targetParent);
  return hasSameParentFileRows ? null : coveringRows[0] || null;
}

function pathMatchesScope(value: string, scopes: string[]): boolean {
  return scopes.some((scope) => value.startsWith(scope));
}

function isInScope(entry: DiffEntry, scopes: string[]): boolean {
  return pathMatchesScope(entry.path, scopes)
    || (entry.oldPath !== null && pathMatchesScope(entry.oldPath, scopes));
}

function rowForChange(entry: DiffEntry, rowsByPath: Map<string, IndexRow>, indexRows: IndexRow[], scopes: string[]): DriftRow | null {
  const currentRow = rowsByPath.get(entry.path);
  const oldRow = entry.oldPath === null ? undefined : rowsByPath.get(entry.oldPath);
  const sibling = findSiblingPrecedent(indexRows, entry.path);
  const currentPathInScope = pathMatchesScope(entry.path, scopes);
  const oldPathInScope = entry.oldPath !== null && pathMatchesScope(entry.oldPath, scopes);

  if (entry.changeKind === 'added') {
    if (currentRow || findCoveringDirectoryRow(indexRows, entry.path)) return null;
    return {
      change_kind: entry.changeKind,
      path: entry.path,
      sibling_precedent_row: sibling?.raw || null,
      scriptable_verdict: sibling ? 'inline-repair-eligible' : 'route-back-required'
    };
  }

  if (entry.changeKind === 'deleted') {
    if (!currentRow) return null;
    return {
      change_kind: entry.changeKind,
      path: entry.path,
      sibling_precedent_row: null,
      scriptable_verdict: 'inline-repair-eligible'
    };
  }

  if (entry.changeKind === 'renamed') {
    if (oldPathInScope && !currentPathInScope) {
      if (!oldRow) return null;
      return {
        change_kind: entry.changeKind,
        path: entry.oldPath || entry.path,
        sibling_precedent_row: null,
        scriptable_verdict: 'inline-repair-eligible'
      };
    }
    if (oldRow && currentRow) {
      return {
        change_kind: entry.changeKind,
        path: entry.oldPath || entry.path,
        sibling_precedent_row: currentRow.raw,
        scriptable_verdict: 'inline-repair-eligible'
      };
    }
    if (oldRow && sibling) {
      return {
        change_kind: entry.changeKind,
        path: entry.path,
        sibling_precedent_row: sibling.raw,
        scriptable_verdict: 'inline-repair-eligible'
      };
    }
    if (oldRow) {
      return {
        change_kind: entry.changeKind,
        path: entry.path,
        sibling_precedent_row: null,
        scriptable_verdict: 'route-back-required'
      };
    }
    if (currentRow) return null;
    return {
      change_kind: entry.changeKind,
      path: entry.path,
      sibling_precedent_row: sibling?.raw || null,
      scriptable_verdict: 'ambiguous'
    };
  }

  return null;
}

export function auditReferenceIndexDriftFromInputs(
  baseRef: string,
  headRef: string,
  referenceIndexContent: string,
  diffEntries: DiffEntry[],
  scopes: string[]
): ReferenceIndexDriftReport {
  const normalizedScopes = scopes.map(normalizeScope);
  const indexRows = parseReferenceIndexRows(referenceIndexContent);
  const rowsByPath = new Map(indexRows.map((row) => [row.path, row]));
  const rows = diffEntries
    .map((entry) => ({
      changeKind: entry.changeKind,
      path: normalizeRepoPath(entry.path),
      oldPath: entry.oldPath === null ? null : normalizeRepoPath(entry.oldPath)
    }))
    .filter((entry) => isInScope(entry, normalizedScopes))
    .map((entry) => rowForChange(entry, rowsByPath, indexRows, normalizedScopes))
    .filter((row): row is DriftRow => row !== null)
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    base_ref: baseRef,
    head_ref: headRef,
    rows,
    unscriptable_reasons: rows
      .filter((row) => row.scriptable_verdict === 'ambiguous')
      .map((row) => `${row.path}: changed indexed path lacks an exact index row and a scriptable source-row relationship`)
  };
}

export interface WorktreeEntry {
  slug: string;
  path: string;
}

export interface WorktreeAuditPlan {
  headRef: string;
  mergeBaseArgs: string[];
}

export function buildWorktreeAuditPlan(slug: string, config: IssuesConfig): WorktreeAuditPlan {
  const headRef = branchForSlug(slug, config);
  return {
    headRef,
    mergeBaseArgs: ['merge-base', 'main', headRef]
  };
}

export function parseWorktreeList(porcelain: string, config: IssuesConfig): WorktreeEntry[] {
  const entries: WorktreeEntry[] = [];
  let currentPath: string | null = null;
  for (const line of porcelain.split(/\r?\n/)) {
    if (line.startsWith('worktree ')) {
      currentPath = line.slice('worktree '.length).trim();
    } else if (line.trim() === '') {
      currentPath = null;
    } else if (line.startsWith('branch ') && currentPath !== null) {
      const branch = line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
      if (branch.startsWith(config.branch_prefix)) {
        entries.push({ slug: branch.slice(config.branch_prefix.length), path: currentPath });
      }
    }
  }
  return entries;
}

export function selectWorktreeRoot(entries: WorktreeEntry[], slug: string, config: IssuesConfig): string {
  const matches = entries.filter((entry) => entry.slug === slug);
  if (matches.length === 0) {
    throw new Error(`No managed worktree found for slug "${slug}" (expected branch ${branchForSlug(slug, config)})`);
  }
  if (matches.length > 1) {
    throw new Error(`Multiple managed worktrees match slug "${slug}": ${matches.map((entry) => entry.path).join(', ')}`);
  }
  return matches[0].path;
}

function gitDiffEntries(repoRoot: string, baseRef: string, headRef: string, scopes: string[]): DiffEntry[] {
  const args = [
    '-C',
    repoRoot,
    'diff',
    '--name-status',
    '--find-renames',
    baseRef,
    headRef,
    '--',
    ...scopes
  ];
  const output = execFileSync('git', args, { encoding: 'utf8' });
  return output.split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line): DiffEntry => {
      const parts = line.split('\t');
      const status = parts[0];
      if (status.startsWith('R')) {
        return {
          changeKind: 'renamed',
          oldPath: normalizeRepoPath(parts[1]),
          path: normalizeRepoPath(parts[2])
        };
      }
      if (status === 'A') return { changeKind: 'added', oldPath: null, path: normalizeRepoPath(parts[1]) };
      if (status === 'D') return { changeKind: 'deleted', oldPath: null, path: normalizeRepoPath(parts[1]) };
      return { changeKind: 'modified', oldPath: null, path: normalizeRepoPath(parts[1]) };
    });
}

interface WorktreeAuditInputs {
  baseRef: string;
  headRef: string;
  repoRoot: string;
  referenceIndexContent: string;
  scopes: string[];
}

interface AuditConfig {
  referenceIndexPath: string;
  scopes: string[];
}

function resolveAuditConfig(config: IssuesConfig, scopeOverrides: string[]): AuditConfig {
  if (config.grounding === 'none' || config.grounding.index === undefined) {
    throw new Error('Reference index audit requires grounding.index');
  }
  if (scopeOverrides.length > 0) {
    return { referenceIndexPath: config.grounding.index, scopes: scopeOverrides };
  }
  if (config.grounding.indexed_scopes === undefined) {
    throw new Error('Reference index audit requires --scope or grounding.indexed_scopes');
  }
  return { referenceIndexPath: config.grounding.index, scopes: config.grounding.indexed_scopes };
}

function resolveWorktreeAuditInputs(slug: string, execRoot: string, scopeOverrides: string[]): WorktreeAuditInputs {
  const config = readConfig(execRoot);
  const auditConfig = resolveAuditConfig(config, scopeOverrides);
  const plan = buildWorktreeAuditPlan(slug, config);
  const baseRef = execFileSync('git', ['-C', execRoot, ...plan.mergeBaseArgs], { encoding: 'utf8' }).trim();
  const porcelain = execFileSync('git', ['-C', execRoot, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' });
  const repoRoot = selectWorktreeRoot(parseWorktreeList(porcelain, config), slug, config);
  const referenceIndexContent = fs.readFileSync(path.join(repoRoot, auditConfig.referenceIndexPath), 'utf8');
  return { baseRef, headRef: plan.headRef, repoRoot, referenceIndexContent, scopes: auditConfig.scopes };
}

interface CliOptions {
  repoRoot: string;
  baseRef: string;
  headRef: string;
  worktreeSlug: string;
  scopeOverrides: string[];
  selfTest: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    repoRoot: defaultRoot(),
    baseRef: '',
    headRef: '',
    worktreeSlug: '',
    scopeOverrides: [],
    selfTest: false
  };
  const positional: string[] = [];

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--self-test') {
      options.selfTest = true;
    } else if (arg === '--repo') {
      options.repoRoot = path.resolve(argv[index + 1]);
      index++;
    } else if (arg === '--worktree') {
      options.worktreeSlug = argv[index + 1];
      index++;
    } else if (arg === '--scope') {
      options.scopeOverrides.push(argv[index + 1]);
      index++;
    } else {
      positional.push(arg);
    }
  }

  options.baseRef = positional[0] || '';
  options.headRef = positional[1] || '';
  return options;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertThrows(callback: () => void, expectedMessage: string): void {
  try {
    callback();
  } catch (error) {
    assert(error instanceof Error && error.message.includes(expectedMessage), `Expected throw containing ${expectedMessage}`);
    return;
  }
  throw new Error(`Expected throw containing ${expectedMessage}`);
}

function runSelfTest(): void {
  const fixtureConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\n', 'fixture-config.yaml');
  const scopedConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  index: docs/reference-index.md\n  indexed_scopes:\n    - workflow/scripts/\n    - shared/\n', 'scoped-config.yaml');
  const resolvedConfig = resolveAuditConfig(scopedConfig, []);
  assert(resolvedConfig.referenceIndexPath === 'docs/reference-index.md', 'expected audit index path sourced from config');
  assert(resolvedConfig.scopes.join('|') === 'workflow/scripts/|shared/', 'expected audit scopes sourced from config');
  const overrideConfig = resolveAuditConfig(scopedConfig, ['hooks/']);
  assert(overrideConfig.scopes.join('|') === 'hooks/', 'expected explicit audit scope override to win');
  assertThrows(() => resolveAuditConfig(fixtureConfig, []), 'Reference index audit requires grounding.index');
  const referenceIndex = [
    '| Path | Purpose | Related Docs |',
    '|---|---|---|',
    '| `workflow/scripts/` | Workflow scripts. | `---` |',
    '| `workflow/scripts/contracts-verify.ts` | Verifies contracts. | `docs/validation.md` |',
    '| `workflow/fixtures/merge-issue/` | Merge fixtures. | `docs/validation.md` |',
    '| `docs/reference-index.md` | Lookup map. | `---` |'
  ].join('\n');

  const inline = auditReferenceIndexDriftFromInputs('base', 'head', referenceIndex, [
    { changeKind: 'added', path: 'workflow/scripts/new-check.ts', oldPath: null }
  ], ['workflow/', 'shared/', 'hooks/']);
  assert(inline.rows[0].scriptable_verdict === 'inline-repair-eligible', 'expected sibling-backed addition to be inline repair eligible');

  const routeBack = auditReferenceIndexDriftFromInputs('base', 'head', referenceIndex, [
    { changeKind: 'added', path: 'shared/new-kind/file.md', oldPath: null }
  ], ['workflow/', 'shared/', 'hooks/']);
  assert(routeBack.rows[0].scriptable_verdict === 'route-back-required', 'expected new area without sibling precedent to route back');

  const indexedDirectoryDescendant = auditReferenceIndexDriftFromInputs('base', 'head', referenceIndex, [
    { changeKind: 'added', path: 'workflow/fixtures/merge-issue/new.transcript.md', oldPath: null }
  ], ['workflow/', 'shared/', 'hooks/']);
  assert(indexedDirectoryDescendant.rows.length === 0, 'expected indexed directory row to cover added descendants');

  const ambiguous = auditReferenceIndexDriftFromInputs('base', 'head', referenceIndex, [
    { changeKind: 'renamed', path: 'hooks/tests/new.ts', oldPath: 'hooks/tests/old.ts' }
  ], ['workflow/', 'shared/', 'hooks/']);
  assert(ambiguous.rows[0].scriptable_verdict === 'ambiguous', 'expected unindexed rename to remain ambiguous');

  const outOfScopeRename = auditReferenceIndexDriftFromInputs('base', 'head', referenceIndex, [
    { changeKind: 'renamed', path: 'archive/contracts-verify.ts', oldPath: 'workflow/scripts/contracts-verify.ts' }
  ], ['workflow/', 'shared/', 'hooks/']);
  assert(outOfScopeRename.rows[0].path === 'workflow/scripts/contracts-verify.ts', 'expected rename out of indexed scope to report the old indexed path');
  assert(outOfScopeRename.rows[0].scriptable_verdict === 'inline-repair-eligible', 'expected rename out of indexed scope to be an inline index-row removal');

  const auditPlan = buildWorktreeAuditPlan('fix-merge-skills', fixtureConfig);
  assert(auditPlan.headRef === 'worktree-fix-merge-skills', 'expected head ref derived from slug');
  assert(auditPlan.mergeBaseArgs.join(' ') === 'merge-base main worktree-fix-merge-skills', 'expected merge-base args derived from slug');

  const worktreeRoot = selectWorktreeRoot(parseWorktreeList([
    'worktree /repo/main',
    'HEAD 1111111111111111111111111111111111111111',
    'branch refs/heads/main',
    '',
    'worktree /repo/issues/worktrees/fix-merge-skills',
    'HEAD 2222222222222222222222222222222222222222',
    'branch refs/heads/worktree-fix-merge-skills',
    ''
  ].join('\n'), fixtureConfig), 'fix-merge-skills', fixtureConfig);
  assert(worktreeRoot === '/repo/issues/worktrees/fix-merge-skills', 'expected repo-root selection to derive the worktree path from the slug');

  console.log('audit-reference-index-drift: self-test ok');
}

function runCli(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.selfTest) {
    runSelfTest();
    return;
  }

  if (options.worktreeSlug !== '') {
    const inputs = resolveWorktreeAuditInputs(options.worktreeSlug, options.repoRoot, options.scopeOverrides);
    const report = auditReferenceIndexDriftFromInputs(
      inputs.baseRef,
      inputs.headRef,
      inputs.referenceIndexContent,
      gitDiffEntries(inputs.repoRoot, inputs.baseRef, inputs.headRef, inputs.scopes),
      inputs.scopes
    );
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (options.baseRef === '' || options.headRef === '') {
    throw new Error('Usage: audit-reference-index-drift.ts (<base-ref> <head-ref> | --worktree <slug>) [--repo <path>] [--scope <repo-prefix>]');
  }

  const auditConfig = resolveAuditConfig(readConfig(options.repoRoot), options.scopeOverrides);
  const referenceIndexContent = fs.readFileSync(path.join(options.repoRoot, auditConfig.referenceIndexPath), 'utf8');
  const report = auditReferenceIndexDriftFromInputs(
    options.baseRef,
    options.headRef,
    referenceIndexContent,
    gitDiffEntries(options.repoRoot, options.baseRef, options.headRef, auditConfig.scopes),
    auditConfig.scopes
  );
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  runCli();
}
