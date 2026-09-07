#!/usr/bin/env bun

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { activeIssuesRoot, branchForSlug, discoverSeriesStates, isSeriesContainerRetirementEligible, parseIssueRootName, readConfig, seriesDir, type IssuePhase, type IssuesConfig, type SeriesState } from './lifecycle';

export type RootVerdict = 'merged' | 'pending' | 'unknown';

export interface RootClassification {
  path: string;
  slug: string;
  verdict: RootVerdict;
  signals: string[];
}

export interface IssueRootSignals {
  path: string;
  slug: string;
  branchPresent: boolean;
  branchIsAncestorOfHead: boolean;
  liveWorktreePresent: boolean;
  worktreeAheadCount: number;
  deliverableProof: DeliverableProof;
}

export type DeliverableProof =
  | { kind: 'declared-present'; paths: string[] }
  | { kind: 'declared-absent'; paths: string[]; missingPaths: string[] }
  | { kind: 'undeclared'; reason: 'missing-plan' | 'missing-heading' | 'no-parseable-paths' };

export interface RootSeedSignals {
  path: string;
  slug: string;
  seriesParent?: boolean;
  anyLeafNonTerminal?: boolean;
  anyLeafWorktreeLive?: boolean;
  workPresentInHead: boolean;
  folderPresent: boolean;
  liveWorktreePresent: boolean;
}

export interface SeriesContainerSignals {
  path: string;
  series: string;
  anyLeafNonTerminal: boolean;
  anyLeafWorktreeLive: boolean;
  anyLeafBranchPresentNotAncestor: boolean;
  allLeafBranchesGoneOrAncestor: boolean;
}

interface SeriesLeafArtifact {
  leaf: string;
  repoPath: string;
}

export type IssueRootEntryDecision =
  | { kind: 'root-seed'; slug: string }
  | { kind: 'series-candidate' }
  | { kind: 'ignore' };

export interface IssueRootEntryInput {
  name: string;
  isDirectory: boolean;
  hasStateYaml: boolean;
}

const DELIVERABLE_PATH_PATTERN = /`([A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+)`/g;

function normalizeRepoPath(value: string): string {
  return value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

function sectionByHeading(content: string, headingText: string): string | null {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line.trim());
    return match !== null && match[2].toLowerCase() === headingText.toLowerCase();
  });
  if (start < 0) return null;
  const startLevel = /^(#{1,6})\s+/.exec(lines[start].trim())![1].length;
  const end = lines.findIndex((line, index) => {
    if (index <= start) return false;
    const match = /^(#{1,6})\s+/.exec(line.trim());
    return match !== null && match[1].length <= startLevel;
  });
  return lines.slice(start + 1, end < 0 ? lines.length : end).join('\n');
}

export function parseDeliverablePaths(planContent: string): string[] {
  const section = sectionByHeading(planContent, 'Deliverables') ?? '';
  const paths = new Set<string>();
  const pattern = new RegExp(DELIVERABLE_PATH_PATTERN);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(section)) !== null) {
    paths.add(normalizeRepoPath(match[1]));
  }
  return Array.from(paths).sort((left, right) => left.localeCompare(right));
}

export function issuePlanCandidates(rootPath: string): string[] {
  const issueRootPath = rootPath.endsWith('.md') ? normalizeRepoPath(path.dirname(rootPath)) : rootPath;
  return [
    `${issueRootPath}/implementation/plan.md`,
    `${issueRootPath}/implementation/agreement.md`
  ];
}

function issueRootSignalLabels(input: IssueRootSignals): string[] {
  return [
    input.branchPresent ? 'branch-present' : 'branch-absent',
    input.branchIsAncestorOfHead ? 'branch-ancestor-of-head' : 'branch-not-ancestor',
    input.liveWorktreePresent ? 'worktree-present' : 'worktree-absent',
    `worktree-ahead:${input.worktreeAheadCount}`,
    ...(input.deliverableProof.kind === 'declared-present'
      ? ['deliverables-in-head']
      : input.deliverableProof.kind === 'declared-absent'
        ? ['deliverables-not-in-head', ...input.deliverableProof.missingPaths.map((repoPath) => `missing-deliverable:${repoPath}`)]
        : ['deliverables-undeclared', `deliverables-undeclared:${input.deliverableProof.reason}`])
  ];
}

function seriesContainerSignalLabels(input: SeriesContainerSignals): string[] {
  return [
    input.anyLeafNonTerminal ? 'leaves-non-terminal' : 'leaves-all-terminal',
    input.anyLeafWorktreeLive ? 'leaf-worktree-present' : 'leaf-worktree-absent',
    input.anyLeafBranchPresentNotAncestor ? 'leaf-branch-present-not-ancestor-without-worktree' : 'leaf-branch-unproven-without-worktree-absent',
    input.allLeafBranchesGoneOrAncestor ? 'all-leaf-branches-gone-or-ancestor' : 'some-leaf-branch-not-ancestor'
  ];
}

export function classifyIssueRoot(input: IssueRootSignals): RootClassification {
  const branchMergedOrGone = !input.branchPresent || input.branchIsAncestorOfHead;
  const liveAheadWorktree = input.liveWorktreePresent && input.worktreeAheadCount > 0;
  const signals = issueRootSignalLabels(input);

  if (liveAheadWorktree) {
    return { path: input.path, slug: input.slug, verdict: 'pending', signals };
  }
  if (!branchMergedOrGone) {
    return { path: input.path, slug: input.slug, verdict: 'unknown', signals };
  }
  if (input.deliverableProof.kind === 'declared-absent') {
    return { path: input.path, slug: input.slug, verdict: 'pending', signals };
  }
  return { path: input.path, slug: input.slug, verdict: 'merged', signals };
}

export function classifyRootSeed(input: RootSeedSignals): RootClassification {
  if (input.seriesParent) {
    return {
      path: input.path,
      slug: input.slug,
      verdict: input.anyLeafNonTerminal || input.anyLeafWorktreeLive || input.liveWorktreePresent ? 'pending' : 'merged',
      signals: [
        'series-parent-seed',
        input.anyLeafNonTerminal ? 'leaves-non-terminal' : 'leaves-all-terminal',
        input.anyLeafWorktreeLive ? 'leaf-worktree-present' : 'leaf-worktree-absent',
        input.workPresentInHead ? 'work-in-head' : 'work-absent',
        input.folderPresent ? 'folder-present' : 'folder-absent',
        input.liveWorktreePresent ? 'worktree-present' : 'worktree-absent'
      ]
    };
  }

  const orphanMerged = input.workPresentInHead && !input.folderPresent && !input.liveWorktreePresent;
  return {
    path: input.path,
    slug: input.slug,
    verdict: orphanMerged ? 'merged' : 'pending',
    signals: [
      'standalone-seed',
      input.workPresentInHead ? 'work-in-head' : 'work-absent',
      input.folderPresent ? 'folder-present' : 'folder-absent',
      input.liveWorktreePresent ? 'worktree-present' : 'worktree-absent'
    ]
  };
}

export function classifySeriesContainer(input: SeriesContainerSignals): RootClassification {
  const signals = seriesContainerSignalLabels(input);
  if (input.anyLeafNonTerminal || input.anyLeafWorktreeLive) {
    return { path: input.path, slug: input.series, verdict: 'pending', signals };
  }
  if (input.anyLeafBranchPresentNotAncestor) {
    return { path: input.path, slug: input.series, verdict: 'unknown', signals };
  }
  return { path: input.path, slug: input.series, verdict: 'merged', signals };
}

export function classifyIssueRootEntry(input: IssueRootEntryInput): IssueRootEntryDecision {
  if (input.isDirectory && parseIssueRootName(input.name) !== null && !input.hasStateYaml) {
    throw new Error(`Stranded prefixed migration input issues/${input.name}`);
  }
  if (!input.isDirectory && input.name.endsWith('.md')) {
    return { kind: 'root-seed', slug: path.basename(input.name, '.md') };
  }
  return input.isDirectory ? { kind: 'series-candidate' } : { kind: 'ignore' };
}

function defaultRoot(): string {
  return path.resolve(__dirname, '../..');
}

function gitExitOk(execRoot: string, args: string[]): boolean {
  const result = spawnSync('git', ['-C', execRoot, ...args], { stdio: 'pipe' });
  return result.status === 0;
}

function gitText(execRoot: string, args: string[]): string {
  return execFileSync('git', ['-C', execRoot, ...args], { encoding: 'utf8' }).trim();
}

function fileExistsInHead(execRoot: string, repoPath: string): boolean {
  return gitExitOk(execRoot, ['cat-file', '-e', `HEAD:${repoPath}`]);
}

function worktreeSlugs(execRoot: string, config: IssuesConfig): Set<string> {
  const porcelain = execFileSync('git', ['-C', execRoot, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' });
  const slugs = new Set<string>();
  for (const line of porcelain.split(/\r?\n/)) {
    if (line.startsWith('branch ')) {
      const branch = line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
      if (branch.startsWith(config.branch_prefix)) slugs.add(branch.slice(config.branch_prefix.length));
    }
  }
  return slugs;
}

function resolveDeliverableProof(execRoot: string, planPath: string): DeliverableProof {
  if (!fs.existsSync(planPath)) return { kind: 'undeclared', reason: 'missing-plan' };
  const content = fs.readFileSync(planPath, 'utf8');
  if (sectionByHeading(content, 'Deliverables') === null) return { kind: 'undeclared', reason: 'missing-heading' };
  const paths = parseDeliverablePaths(content);
  if (paths.length === 0) return { kind: 'undeclared', reason: 'no-parseable-paths' };
  const missingPaths = paths.filter((repoPath) => !fileExistsInHead(execRoot, repoPath));
  return missingPaths.length === 0
    ? { kind: 'declared-present', paths }
    : { kind: 'declared-absent', paths, missingPaths };
}

function resolveIssuePlanPath(execRoot: string, rootPath: string): string {
  const candidates = issuePlanCandidates(rootPath);
  for (const candidate of candidates) {
    const absolute = path.join(execRoot, candidate);
    if (fs.existsSync(absolute)) return absolute;
  }
  return path.join(execRoot, candidates[0]);
}

function artifactMarkerSlug(name: string): string | null {
  const trimmed = name.replace(/\.md$/, '');
  return /^(\d{2})([ps])-.+$/.test(trimmed) ? trimmed : null;
}

function markerSlugToLeaf(slug: string): string {
  const match = /^(\d{2})([ps])-(.+)$/.exec(slug);
  if (match === null) throw new Error(`Expected marker slug, got ${slug}`);
  return match[3];
}

function collectSeriesLeafArtifacts(execRoot: string, relDir: string, results: SeriesLeafArtifact[]): void {
  const absoluteDir = path.join(execRoot, relDir);
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const repoPath = normalizeRepoPath(path.join(relDir, entry.name));
    const markerSlug = artifactMarkerSlug(entry.name);
    if (markerSlug !== null) {
      results.push({ leaf: markerSlugToLeaf(markerSlug), repoPath });
    }
    if (entry.isDirectory() && markerSlug === null) {
      collectSeriesLeafArtifacts(execRoot, repoPath, results);
    }
  }
}

function seriesLeafArtifactsByPhase(execRoot: string, config: IssuesConfig, seriesState: SeriesState, phase: IssuePhase): SeriesLeafArtifact[] {
  const artifacts: SeriesLeafArtifact[] = [];
  collectSeriesLeafArtifacts(execRoot, normalizeRepoPath(seriesDir(config, seriesState.series)), artifacts);
  return artifacts.filter((artifact) => {
    const leafState = seriesState.leaves[artifact.leaf];
    return leafState !== undefined && leafState.phase === phase;
  });
}

function gatherIssueRoot(execRoot: string, config: IssuesConfig, rootPath: string, slug: string, liveSlugs: Set<string>): RootClassification {
  const branch = branchForSlug(slug, config);
  const branchPresent = gitExitOk(execRoot, ['rev-parse', '--verify', '--quiet', branch]);
  const branchIsAncestorOfHead = branchPresent && gitExitOk(execRoot, ['merge-base', '--is-ancestor', branch, 'HEAD']);
  const liveWorktreePresent = liveSlugs.has(slug);
  const worktreeAheadCount = branchPresent ? Number(gitText(execRoot, ['rev-list', '--count', `HEAD..${branch}`])) : 0;
  const deliverableProof = resolveDeliverableProof(execRoot, resolveIssuePlanPath(execRoot, rootPath));

  return classifyIssueRoot({
    path: rootPath,
    slug,
    branchPresent,
    branchIsAncestorOfHead,
    liveWorktreePresent,
    worktreeAheadCount,
    deliverableProof
  });
}

function gatherRootSeed(execRoot: string, config: IssuesConfig, seedPath: string, slug: string, liveSlugs: Set<string>, seriesState?: SeriesState): RootClassification {
  const rootDir = path.join(execRoot, seriesDir(config, slug));
  const folderPresent = fs.existsSync(rootDir);
  const seed = resolveDeliverableProof(execRoot, path.join(execRoot, seedPath));

  return classifyRootSeed({
    path: seedPath,
    slug,
    seriesParent: seriesState !== undefined,
    anyLeafNonTerminal: seriesState !== undefined && !isSeriesContainerRetirementEligible(seriesState),
    anyLeafWorktreeLive: seriesState !== undefined && Object.keys(seriesState.leaves).some((leaf) => liveSlugs.has(leaf)),
    workPresentInHead: seed.kind === 'declared-present',
    folderPresent,
    liveWorktreePresent: liveSlugs.has(slug)
  });
}

function gatherSeriesContainer(execRoot: string, config: IssuesConfig, seriesState: SeriesState, liveSlugs: Set<string>): RootClassification {
  const leafSignals = Object.entries(seriesState.leaves).map(([leaf, leafState]) => {
    const branch = branchForSlug(leaf, config);
    const branchPresent = gitExitOk(execRoot, ['rev-parse', '--verify', '--quiet', branch]);
    const branchIsAncestorOfHead = branchPresent && gitExitOk(execRoot, ['merge-base', '--is-ancestor', branch, 'HEAD']);
    const liveWorktreePresent = liveSlugs.has(leaf);
    return { leafState, branchPresent, branchIsAncestorOfHead, liveWorktreePresent };
  });

  return classifySeriesContainer({
    path: normalizeRepoPath(seriesDir(config, seriesState.series)),
    series: seriesState.series,
    anyLeafNonTerminal: !isSeriesContainerRetirementEligible(seriesState),
    anyLeafWorktreeLive: leafSignals.some(({ liveWorktreePresent }) => liveWorktreePresent),
    anyLeafBranchPresentNotAncestor: leafSignals.some(({ branchPresent, branchIsAncestorOfHead, liveWorktreePresent }) => branchPresent && !branchIsAncestorOfHead && !liveWorktreePresent),
    allLeafBranchesGoneOrAncestor: leafSignals.every(({ branchPresent, branchIsAncestorOfHead }) => !branchPresent || branchIsAncestorOfHead)
  });
}

function collectIssueRootSignals(execRoot: string): RootClassification[] {
  const config = readConfig(execRoot);
  const issuesDir = path.join(execRoot, activeIssuesRoot(config));
  if (!fs.existsSync(issuesDir)) return [];
  const liveSlugs = worktreeSlugs(execRoot, config);
  const seriesStates = discoverSeriesStates(execRoot, config);
  const seriesStatesByName = new Map(seriesStates.map((seriesState) => [seriesState.series, seriesState]));
  const results: RootClassification[] = [];

  for (const entry of fs.readdirSync(issuesDir, { withFileTypes: true })) {
    const decision = classifyIssueRootEntry({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      hasStateYaml: entry.isDirectory() && fs.existsSync(path.join(issuesDir, entry.name, 'state.yaml'))
    });
    if (decision.kind === 'root-seed') {
      results.push(gatherRootSeed(execRoot, config, normalizeRepoPath(path.join(activeIssuesRoot(config), entry.name)), decision.slug, liveSlugs, seriesStatesByName.get(decision.slug)));
    }
  }
  for (const seriesState of seriesStates) {
    results.push(gatherSeriesContainer(execRoot, config, seriesState, liveSlugs));
    for (const leaf of seriesLeafArtifactsByPhase(execRoot, config, seriesState, 'D-merge')) {
      results.push(gatherIssueRoot(execRoot, config, leaf.repoPath, leaf.leaf, liveSlugs));
    }
  }

  return results.sort((left, right) => left.path.localeCompare(right.path));
}

interface CliOptions {
  repoRoot: string;
  selfTest: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { repoRoot: defaultRoot(), selfTest: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--self-test') {
      options.selfTest = true;
    } else if (arg === '--repo') {
      options.repoRoot = path.resolve(argv[index + 1]);
      index++;
    }
  }
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

function writeFixtureFile(root: string, repoPath: string, content: string): void {
  const absolutePath = path.join(root, repoPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
}

function execFixtureGit(root: string, args: string[]): void {
  execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' });
}

function createEndToEndFixture(): { root: string; classifications: RootClassification[] } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issues-series-lifecycle-'));
  const created = '2026-05-31T08:17:17+02:00';
  writeFixtureFile(root, 'issues/config.yaml', 'issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\n');
  writeFixtureFile(root, 'issues/open/series/state.yaml', `series: series\ncreated: '${created}'\nleaves:\n  leaf: { phase: D-merge, created: '${created}' }\n  sibling: { phase: D-merge, created: '${created}' }\n`);
  writeFixtureFile(root, 'issues/open/series/SERIES.md', '# series\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 01 | p | leaf | `01-leaf/01p-leaf/` |\n| 02 | p | sibling | `02-sibling/02p-sibling/` |\n');
  writeFixtureFile(root, 'issues/open/series/01-leaf/01p-leaf/implementation/plan.md', '# Leaf\n\n## Deliverables\n\n- `src/feature.txt`\n');
  writeFixtureFile(root, 'issues/open/series/02-sibling/02p-sibling/implementation/plan.md', '# Sibling\n\n## Deliverables\n\n- `src/feature.txt`\n');
  writeFixtureFile(root, 'src/base.txt', 'base\n');
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
  execFixtureGit(root, ['config', 'user.name', 'Fixture']);
  execFixtureGit(root, ['config', 'user.email', 'fixture@example.com']);
  execFixtureGit(root, ['add', '.']);
  execFixtureGit(root, ['commit', '-m', 'fixture']);
  execFixtureGit(root, ['worktree', 'add', '-b', 'worktree-leaf', 'issues/worktrees/leaf', 'HEAD']);

  const worktreeRoot = path.join(root, 'issues', 'worktrees', 'leaf');
  writeFixtureFile(worktreeRoot, 'src/feature.txt', 'feature\n');
  writeFixtureFile(worktreeRoot, 'issues/open/series/01-leaf/01p-leaf/implementation/plan.md', '# Leaf worktree snapshot\n\n## Deliverables\n\n- `src/feature.txt`\n');
  writeFixtureFile(worktreeRoot, 'issues/open/series/state.yaml', `series: series\ncreated: '${created}'\nleaves:\n  leaf: { phase: C-ready, created: '${created}' }\n  sibling: { phase: D-merge, created: '${created}' }\n`);
  writeFixtureFile(worktreeRoot, 'issues/open/series/SERIES.md', '# series worktree snapshot\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 01 | p | leaf | `01-leaf/01p-leaf/` |\n| 02 | p | sibling | `02-sibling/02p-sibling/` |\n');
  execFixtureGit(worktreeRoot, ['add', '.']);
  execFixtureGit(worktreeRoot, ['commit', '-m', 'leaf feature']);

  execFileSync('bun', [path.join(__dirname, 'merge-branch.ts'), 'leaf'], { cwd: root, stdio: 'pipe' });
  writeFixtureFile(worktreeRoot, 'issues/open/series/01-leaf/01p-leaf/implementation/plan.md', '# Dirty leaf snapshot\n');
  execFileSync('bun', [path.join(__dirname, 'prune-worktree.ts'), 'leaf'], { cwd: root, stdio: 'pipe' });
  execFixtureGit(root, ['branch', '-d', 'worktree-leaf']);
  return { root, classifications: collectIssueRootSignals(root) };
}

function runClassificationSelfTests(): void {
  const declaredPresent: DeliverableProof = { kind: 'declared-present', paths: ['src/feature.txt'] };
  const declaredAbsent: DeliverableProof = { kind: 'declared-absent', paths: ['src/feature.txt'], missingPaths: ['src/feature.txt'] };
  const undeclared: DeliverableProof = { kind: 'undeclared', reason: 'missing-plan' };
  const baseSignals: Omit<IssueRootSignals, 'branchPresent' | 'branchIsAncestorOfHead' | 'liveWorktreePresent' | 'worktreeAheadCount' | 'deliverableProof'> = {
    path: 'issues/open/D-merge-foo',
    slug: 'foo'
  };

  const merged = classifyIssueRoot({ ...baseSignals, branchPresent: false, branchIsAncestorOfHead: false, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: declaredPresent });
  assert(merged.verdict === 'merged', `expected branch-gone + deliverables-in-head to be merged, got ${merged.verdict}`);

  const mergedAncestor = classifyIssueRoot({ ...baseSignals, branchPresent: true, branchIsAncestorOfHead: true, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: declaredPresent });
  assert(mergedAncestor.verdict === 'merged', `expected ancestor branch + deliverables to be merged, got ${mergedAncestor.verdict}`);

  const pendingAhead = classifyIssueRoot({ ...baseSignals, branchPresent: true, branchIsAncestorOfHead: false, liveWorktreePresent: true, worktreeAheadCount: 3, deliverableProof: declaredPresent });
  assert(pendingAhead.verdict === 'pending', `expected ahead worktree to be pending, got ${pendingAhead.verdict}`);

  const pendingDeliverablesAbsent = classifyIssueRoot({ ...baseSignals, branchPresent: false, branchIsAncestorOfHead: false, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: declaredAbsent });
  assert(pendingDeliverablesAbsent.verdict === 'pending', `expected absent deliverables to be pending when branch is gone, got ${pendingDeliverablesAbsent.verdict}`);

  const unknown = classifyIssueRoot({ ...baseSignals, branchPresent: true, branchIsAncestorOfHead: false, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: declaredPresent });
  assert(unknown.verdict === 'unknown', `expected present-but-unmerged branch to be unknown, got ${unknown.verdict}`);

  const pendingAheadDeliverablesAbsent = classifyIssueRoot({ ...baseSignals, branchPresent: true, branchIsAncestorOfHead: false, liveWorktreePresent: true, worktreeAheadCount: 3, deliverableProof: declaredAbsent });
  assert(pendingAheadDeliverablesAbsent.verdict === 'pending', `expected ahead worktree with absent deliverables to be pending, got ${pendingAheadDeliverablesAbsent.verdict}`);

  const unknownDeliverablesAbsent = classifyIssueRoot({ ...baseSignals, branchPresent: true, branchIsAncestorOfHead: false, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: declaredAbsent });
  assert(unknownDeliverablesAbsent.verdict === 'unknown', `expected present-but-unmerged branch with absent deliverables to be unknown, got ${unknownDeliverablesAbsent.verdict}`);

  const mergedUndeclared = classifyIssueRoot({ ...baseSignals, branchPresent: false, branchIsAncestorOfHead: false, liveWorktreePresent: false, worktreeAheadCount: 0, deliverableProof: undeclared });
  assert(mergedUndeclared.verdict === 'merged' && mergedUndeclared.signals.includes('deliverables-undeclared') && !mergedUndeclared.signals.includes('deliverables-not-in-head'), 'expected branch-gone undeclared proof to merge with weak evidence visible');

  const seriesKeep = classifySeriesContainer({ path: 'issues/open/bar', series: 'bar', anyLeafNonTerminal: true, anyLeafWorktreeLive: false, anyLeafBranchPresentNotAncestor: false, allLeafBranchesGoneOrAncestor: true });
  assert(seriesKeep.verdict === 'pending', `expected active series parent to be pending, got ${seriesKeep.verdict}`);

  const seriesFinished = classifySeriesContainer({ path: 'issues/open/bar', series: 'bar', anyLeafNonTerminal: false, anyLeafWorktreeLive: false, anyLeafBranchPresentNotAncestor: false, allLeafBranchesGoneOrAncestor: true });
  assert(seriesFinished.verdict === 'merged', `expected finished series container to be merged, got ${seriesFinished.verdict}`);

  const seriesUnknown = classifySeriesContainer({ path: 'issues/open/bar', series: 'bar', anyLeafNonTerminal: false, anyLeafWorktreeLive: false, anyLeafBranchPresentNotAncestor: true, allLeafBranchesGoneOrAncestor: false });
  assert(seriesUnknown.verdict === 'unknown', `expected unproven leaf branch series container to be unknown, got ${seriesUnknown.verdict}`);

  const orphan = classifyRootSeed({ path: 'issues/open/bar.md', slug: 'bar', workPresentInHead: true, folderPresent: false, liveWorktreePresent: false });
  assert(orphan.verdict === 'merged', `expected standalone merged-orphan seed to be merged, got ${orphan.verdict}`);

  const finishedSeriesSeed = classifyRootSeed({ path: 'issues/open/bar.md', slug: 'bar', seriesParent: true, anyLeafNonTerminal: false, workPresentInHead: false, folderPresent: true, liveWorktreePresent: false });
  assert(finishedSeriesSeed.verdict === 'merged', `expected terminal series seed to be merged, got ${finishedSeriesSeed.verdict}`);

  const liveLeafSeriesSeed = classifyRootSeed({ path: 'issues/open/bar.md', slug: 'bar', seriesParent: true, anyLeafNonTerminal: false, anyLeafWorktreeLive: true, workPresentInHead: false, folderPresent: true, liveWorktreePresent: false });
  assert(liveLeafSeriesSeed.verdict === 'pending', `expected terminal series seed with live leaf worktree to be pending, got ${liveLeafSeriesSeed.verdict}`);

  const extracted = parseDeliverablePaths('## Deliverables\n\n1. Hardened `.claude/workflow/scripts/audit-reference-index-drift.ts` and `issues/open/foo/plan.md`.\n');
  assert(extracted.length === 2 && extracted[0] === '.claude/workflow/scripts/audit-reference-index-drift.ts', `expected two deliverable paths, got ${extracted.join(', ')}`);

  const prose = parseDeliverablePaths('## Deliverables\n\n1. Harden the audit script and add a classifier.\n');
  assert(prose.length === 0, `expected prose-only deliverables to parse to no paths, got ${prose.join(', ')}`);

  const planCandidates = issuePlanCandidates('issues/open/D-merge-01p-foo');
  assert(planCandidates[0] === 'issues/open/D-merge-01p-foo/implementation/plan.md', `expected canonical implementation plan first, got ${planCandidates[0]}`);
  assert(!planCandidates.includes('issues/open/D-merge-01p-foo/plan.md'), `expected no bare root plan candidate, got ${planCandidates.join(', ')}`);
  const fileArtifactCandidates = issuePlanCandidates('issues/open/series/02-leaf/D-merge-02s-leaf.md');
  assert(fileArtifactCandidates[0] === 'issues/open/series/02-leaf/implementation/plan.md', `expected series file artifact to resolve parent plan, got ${fileArtifactCandidates[0]}`);

  assert(parseIssueRootName('D-merge-01p-foo')?.slug === '01p-foo', 'expected D-merge prefix stripped to slug');
  assert(parseIssueRootName('pr-blueprint-phasing') === null, 'expected non-prefixed name to parse to null');
  const seedDecision = classifyIssueRootEntry({ name: 'bar.md', isDirectory: false, hasStateYaml: false });
  if (seedDecision.kind !== 'root-seed') throw new Error('expected slug-only seed to be discovered');
  assert(seedDecision.slug === 'bar', 'expected slug-only seed slug from basename');
  assertThrows(() => classifyIssueRootEntry({ name: 'D-merge-stranded', isDirectory: true, hasStateYaml: false }), 'Stranded prefixed migration input');
}

function runEndToEndProofSelfTests(): void {
  const endToEnd = createEndToEndFixture();
  const leafClassification = endToEnd.classifications.find((classification) => classification.slug === 'leaf');
  const containerClassification = endToEnd.classifications.find((classification) => classification.slug === 'series');
  assert(leafClassification?.verdict === 'merged' && leafClassification.signals.includes('deliverables-in-head'), 'expected merged and pruned leaf to classify merged');
  assert(containerClassification?.verdict === 'merged', 'expected fully terminal series container with physical leaf folders to classify merged');
  assert(fs.existsSync(path.join(endToEnd.root, 'issues/open/series/01-leaf/01p-leaf')), 'expected container retirement proof not to require physical leaf removal');

  const missingPlanProof = resolveDeliverableProof(endToEnd.root, path.join(endToEnd.root, 'issues/open/missing/implementation/plan.md'));
  assert(missingPlanProof.kind === 'undeclared' && missingPlanProof.reason === 'missing-plan', 'expected missing plan proof reason');
  writeFixtureFile(endToEnd.root, 'proofs/missing-heading.md', '# Plan\n');
  const missingHeadingProof = resolveDeliverableProof(endToEnd.root, path.join(endToEnd.root, 'proofs/missing-heading.md'));
  assert(missingHeadingProof.kind === 'undeclared' && missingHeadingProof.reason === 'missing-heading', 'expected missing heading proof reason');
  writeFixtureFile(endToEnd.root, 'proofs/prose-only.md', '# Plan\n\n## Deliverables\n\nShip the feature.\n');
  const proseOnlyProof = resolveDeliverableProof(endToEnd.root, path.join(endToEnd.root, 'proofs/prose-only.md'));
  assert(proseOnlyProof.kind === 'undeclared' && proseOnlyProof.reason === 'no-parseable-paths', 'expected prose-only proof reason');
  const presentProof = resolveDeliverableProof(endToEnd.root, path.join(endToEnd.root, 'issues/open/series/01-leaf/01p-leaf/implementation/plan.md'));
  assert(presentProof.kind === 'declared-present' && presentProof.paths.join('|') === 'src/feature.txt', 'expected all declared deliverables present proof');
  writeFixtureFile(endToEnd.root, 'proofs/one-missing.md', '# Plan\n\n## Deliverables\n\n- `src/feature.txt`\n- `src/missing.txt`\n');
  const oneMissingProof = resolveDeliverableProof(endToEnd.root, path.join(endToEnd.root, 'proofs/one-missing.md'));
  assert(oneMissingProof.kind === 'declared-absent' && oneMissingProof.missingPaths.join('|') === 'src/missing.txt', 'expected declared-absent proof to name missing paths');
  fs.rmSync(endToEnd.root, { recursive: true, force: true });
}

function runSelfTest(): void {
  runClassificationSelfTests();
  runEndToEndProofSelfTests();
  console.log('classify-merged-issue-roots: self-test ok');
}

function runCli(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.selfTest) {
    runSelfTest();
    return;
  }
  console.log(JSON.stringify(collectIssueRootSignals(options.repoRoot), null, 2));
}

if (require.main === module) {
  runCli();
}
