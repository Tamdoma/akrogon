#!/usr/bin/env bun

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';
import * as yaml from 'js-yaml';

export const ISSUE_PHASES = [
  'P-draft',
  'P-synth',
  'I-draft',
  'I-synth',
  'I-ready',
  'C-ready',
  'C-fix',
  'D-merge'
] as const;

export type IssuePhase = (typeof ISSUE_PHASES)[number];

export interface IssueRootName {
  state: IssuePhase;
  slug: string;
}

export interface IssueState {
  slug: string;
  phase: IssuePhase;
  // First tracked introduction of the current representative path, not issue conception.
  created: string;
  seed_path?: string;
}

export interface SeriesLeafState {
  phase: IssuePhase;
  // First tracked introduction of the current representative path, not issue conception.
  created: string;
}

export interface SeriesState {
  series: string;
  created: string;
  seed_path?: string;
  leaves: Record<string, SeriesLeafState>;
}

export interface IssuePhaseRead {
  target: 'issue';
  slug: string;
  phase: IssuePhase;
  stateFilePath: string;
}

export interface SeriesLeafPhaseRead {
  target: 'series';
  series: string;
  leaf: string;
  phase: IssuePhase;
  stateFilePath: string;
}

export type IssueArtifactOwnership =
  | {
      kind: 'standalone';
      slug: string;
      artifactRoot: string;
      sharedArtifactPaths: readonly [];
    }
  | {
      kind: 'series-leaf';
      slug: string;
      series: string;
      seriesRoot: string;
      artifactRoot: string;
      sharedArtifactPaths: readonly [string, string];
    };

export interface IssuesConfig {
  issues_root: string;
  scripts_dir: string;
  worktree_root: string;
  branch_prefix: string;
  grounding: IssuesGrounding;
  broadcast?: IssuesBroadcast;
}

export interface IssuesBroadcast {
  discord: IssuesBroadcastDiscord;
}

export interface IssuesBroadcastDiscord {
  webhook_env: string[];
}

export type IssuesGrounding = 'none' | IssuesGroundingPaths;

export interface IssuesGroundingPaths {
  index?: string;
  indexed_scopes?: string[];
  docs?: string[];
  surfaces?: string[];
}

type YamlScalar = string | number | boolean | null;
type YamlNode = YamlScalar | YamlNode[] | { [key: string]: YamlNode };
type YamlMap = { [key: string]: YamlNode };

export const allowedTransitions: Record<IssuePhase, IssuePhase[]> = {
  'P-draft': ['P-synth'],
  'P-synth': ['I-draft'],
  'I-draft': ['I-synth'],
  'I-synth': ['I-ready'],
  'I-ready': ['C-ready'],
  'C-ready': ['C-fix', 'D-merge'],
  'C-fix': ['C-ready', 'D-merge'],
  'D-merge': []
};

export function isAllowedTransition(from: IssuePhase, to: IssuePhase): boolean {
  return allowedTransitions[from].includes(to);
}

export function parseIssueRootName(name: string): IssueRootName | null {
  const trimmed = name.replace(/\.md$/, '');
  for (const prefix of ISSUE_PHASES) {
    if (trimmed.startsWith(`${prefix}-`)) {
      return { state: prefix, slug: trimmed.slice(prefix.length + 1) };
    }
  }
  return null;
}

export function branchForSlug(slug: string, config: Pick<IssuesConfig, 'branch_prefix'>): string {
  return `${config.branch_prefix}${slug}`;
}

export function createdFor(repoPath: string, root: string): string {
  const normalizedPath = normalizeRepoPath(repoPath);
  const logArgs = fs.statSync(path.join(root, normalizedPath)).isDirectory()
    ? ['log', '--diff-filter=A', '--format=%aI', '--', `${normalizedPath}/`]
    : ['log', '--diff-filter=A', '--follow', '--format=%aI', '--', normalizedPath];
  const output = execFileSync('git', ['-C', root, ...logArgs], { encoding: 'utf8' }).trim();
  const entries = output.split(/\r?\n/).filter((line) => line.length > 0);
  if (entries.length === 0) {
    throw new Error(`Unable to derive created timestamp for ${repoPath}`);
  }
  return entries[entries.length - 1];
}

function loadYamlMap(raw: string, filePath: string): YamlMap {
  return asMap(yaml.load(raw) as YamlNode, filePath);
}

function asMap(value: YamlNode, field: string): YamlMap {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value;
  throw new Error(`Expected ${field} to be a mapping`);
}

function asString(value: YamlNode, field: string): string {
  if (typeof value === 'string') return value;
  throw new Error(`Expected ${field} to be a string`);
}

function asStringArray(value: YamlNode, field: string): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value;
  throw new Error(`Expected ${field} to be a string array`);
}

function asIssuePhase(value: YamlNode, field: string): IssuePhase {
  const raw = asString(value, field);
  if (isIssuePhase(raw)) return raw;
  throw new Error(`Expected ${field} to be one of ${ISSUE_PHASES.join(', ')}`);
}

function isIssuePhase(value: string): value is IssuePhase {
  return ISSUE_PHASES.includes(value as IssuePhase);
}

function parseSeriesLeaf(value: YamlNode, field: string): SeriesLeafState {
  const record = asMap(value, field);
  return {
    phase: asIssuePhase(record.phase, `${field}.phase`),
    created: asString(record.created, `${field}.created`)
  };
}

export function parseIssueState(raw: string, filePath = 'state.yaml'): IssueState {
  const record = loadYamlMap(raw, filePath);
  return {
    slug: asString(record.slug, `${filePath}.slug`),
    phase: asIssuePhase(record.phase, `${filePath}.phase`),
    created: asString(record.created, `${filePath}.created`),
    ...(record.seed_path === undefined ? {} : { seed_path: asString(record.seed_path, `${filePath}.seed_path`) })
  };
}

function parseGrounding(value: YamlNode, field: string): IssuesGrounding {
  if (value === 'none') return value;
  const record = asMap(value, field);
  const index = record.index === undefined ? undefined : asString(record.index, `${field}.index`);
  const indexedScopes = record.indexed_scopes === undefined ? undefined : asStringArray(record.indexed_scopes, `${field}.indexed_scopes`);
  const docs = record.docs === undefined ? undefined : asStringArray(record.docs, `${field}.docs`);
  const surfaces = record.surfaces === undefined ? undefined : asStringArray(record.surfaces, `${field}.surfaces`);
  if (index === undefined && indexedScopes === undefined && docs === undefined && surfaces === undefined) {
    throw new Error(`Expected ${field} to be none or contain index, indexed_scopes, docs, or surfaces`);
  }
  if (indexedScopes !== undefined && index === undefined) {
    throw new Error(`Expected ${field}.indexed_scopes to require ${field}.index`);
  }
  if (indexedScopes !== undefined && indexedScopes.length === 0) {
    throw new Error(`Expected ${field}.indexed_scopes to contain at least one path`);
  }
  if (docs !== undefined && docs.length === 0) {
    throw new Error(`Expected ${field}.docs to contain at least one path`);
  }
  if (surfaces !== undefined && surfaces.length === 0) {
    throw new Error(`Expected ${field}.surfaces to contain at least one path`);
  }
  return { index, indexed_scopes: indexedScopes, docs, surfaces };
}

function parseBroadcast(value: YamlNode, field: string): IssuesBroadcast {
  const record = asMap(value, field);
  const discord = asMap(record.discord, `${field}.discord`);
  const webhookEnv = asStringArray(discord.webhook_env, `${field}.discord.webhook_env`);
  if (webhookEnv.length === 0) {
    throw new Error(`Expected ${field}.discord.webhook_env to contain at least one environment variable name`);
  }
  return { discord: { webhook_env: webhookEnv } };
}

export function parseSeriesState(raw: string, filePath = 'state.yaml'): SeriesState {
  const record = loadYamlMap(raw, filePath);
  const leaves = asMap(record.leaves, `${filePath}.leaves`);
  return {
    series: asString(record.series, `${filePath}.series`),
    created: asString(record.created, `${filePath}.created`),
    ...(record.seed_path === undefined ? {} : { seed_path: asString(record.seed_path, `${filePath}.seed_path`) }),
    leaves: Object.fromEntries(
      Object.entries(leaves).map(([slug, leaf]) => [slug, parseSeriesLeaf(leaf, `${filePath}.leaves.${slug}`)])
    )
  };
}

export function parseIssuesConfig(raw: string, filePath = 'config.yaml'): IssuesConfig {
  const record = loadYamlMap(raw, filePath);
  return {
    issues_root: asString(record.issues_root, `${filePath}.issues_root`),
    scripts_dir: asString(record.scripts_dir, `${filePath}.scripts_dir`),
    worktree_root: asString(record.worktree_root, `${filePath}.worktree_root`),
    branch_prefix: asString(record.branch_prefix, `${filePath}.branch_prefix`),
    grounding: parseGrounding(record.grounding, `${filePath}.grounding`),
    ...(record.broadcast === undefined ? {} : { broadcast: parseBroadcast(record.broadcast, `${filePath}.broadcast`) })
  };
}

interface SeriesRow {
  leaf: string;
  artifact: string;
  cells: string[];
  lineIndex: number;
}

interface PhysicalArtifact {
  leaf: string;
  repoPath: string;
  markerSlug: string;
}

export interface ManagedWorktree {
  name: string;
  path: string;
  branch: string;
}

export interface WorktreePorcelainEntry {
  path: string;
  branch: string;
}

function defaultRoot(): string {
  return path.resolve(__dirname, '../..');
}

export function readConfig(execRoot: string): IssuesConfig {
  const configPath = path.join(execRoot, 'issues', 'config.yaml');
  return parseIssuesConfig(fs.readFileSync(configPath, 'utf8'), 'issues/config.yaml');
}

export function activeIssuesRoot(config: IssuesConfig): string {
  return path.join(config.issues_root, 'open');
}

export function issueDir(config: IssuesConfig, slug: string): string {
  return path.join(activeIssuesRoot(config), slug);
}

export function seriesDir(config: IssuesConfig, series: string): string {
  return path.join(activeIssuesRoot(config), series);
}

function formatYaml(value: YamlMap): string {
  return yaml.dump(value, { lineWidth: -1, noRefs: true }).replace(/\r\n/g, '\n');
}

function writeYaml(filePath: string, value: YamlMap): void {
  fs.writeFileSync(filePath, formatYaml(value), 'utf8');
}

function seriesStateToYamlMap(seriesState: SeriesState): YamlMap {
  return {
    series: seriesState.series,
    created: seriesState.created,
    ...(seriesState.seed_path === undefined ? {} : { seed_path: seriesState.seed_path }),
    leaves: Object.fromEntries(
      Object.entries(seriesState.leaves).map(([leaf, leafState]) => [leaf, { phase: leafState.phase, created: leafState.created }])
    )
  };
}

export function normalizeRepoPath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

export function normalizeAbsolutePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/\/$/, '');
}

function markerSlugToLeaf(slug: string): string {
  const match = /^(\d{2})([ps])-(.+)$/.exec(slug);
  if (match === null) throw new Error(`Expected marker slug, got ${slug}`);
  return match[3];
}

function artifactMarkerSlug(name: string): string | null {
  const trimmed = name.replace(/\.md$/, '');
  return /^(\d{2})([ps])-.+$/.test(trimmed) ? trimmed : null;
}

function parseSeriesRows(markdown: string, filePath: string): SeriesRow[] {
  const rows: SeriesRow[] = [];
  const lines = markdown.split(/\r?\n/);
  for (const [lineIndex, line] of lines.entries()) {
    if (!line.trim().startsWith('|') || line.includes('---')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells[0] === 'Order') continue;
    if (cells.length === 5 && isIssuePhase(cells[2])) {
      throw new Error(`Expected state-free SERIES.md row in ${filePath}; re-materialize state-free: ${line}`);
    }
    if (cells.length === 4 && isIssuePhase(cells[1])) {
      throw new Error(`Expected state-free SERIES.md row in ${filePath}; re-materialize state-free: ${line}`);
    }
    if (cells.length !== 4) continue;
    const artifactMatch = /`(.+?)`/.exec(cells[3]);
    if (artifactMatch === null) throw new Error(`Expected artifact path in ${filePath}: ${line}`);
    rows.push({
      leaf: cells[2],
      artifact: artifactMatch[1].replace(/\/$/, ''),
      cells,
      lineIndex
    });
  }
  return rows;
}

function collectPhysicalArtifacts(execRoot: string, relDir: string, results: PhysicalArtifact[]): void {
  const absoluteDir = path.join(execRoot, relDir);
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const repoPath = normalizeRepoPath(path.join(relDir, entry.name));
    if (entry.isDirectory() && parseIssueRootName(entry.name) !== null) {
      throw new Error(`Stray prefixed migration artifact ${repoPath}`);
    }
    const markerSlug = artifactMarkerSlug(entry.name);
    if (markerSlug !== null) {
      results.push({ leaf: markerSlugToLeaf(markerSlug), repoPath, markerSlug });
    }
    if (entry.isDirectory() && markerSlug === null) {
      // Series-rooted recursion must not discover nested managed worktree state.
      collectPhysicalArtifacts(execRoot, repoPath, results);
    }
  }
}

function resolvePhysicalArtifact(artifacts: PhysicalArtifact[], seriesRoot: string, leaf: string): PhysicalArtifact {
  const matchingArtifacts = artifacts.filter((artifact) => artifact.leaf === leaf);
  if (matchingArtifacts.length !== 1) {
    throw new Error(`Expected exactly one physical artifact for ${seriesRoot}:${leaf}, got ${matchingArtifacts.length}`);
  }
  return matchingArtifacts[0];
}

function resolveSeriesLeafArtifact(execRoot: string, config: IssuesConfig, series: string, leaf: string): PhysicalArtifact {
  const seriesRoot = normalizeRepoPath(seriesDir(config, series));
  const seriesPath = path.join(execRoot, seriesRoot, 'SERIES.md');
  const rows = parseSeriesRows(fs.readFileSync(seriesPath, 'utf8'), `${seriesRoot}/SERIES.md`);
  const row = rows.find((candidate) => candidate.leaf === leaf);
  if (row === undefined) throw new Error(`Expected ${series}:${leaf} to appear in SERIES.md`);

  const repoPath = normalizeRepoPath(path.join(seriesRoot, row.artifact));
  const absolutePath = path.join(execRoot, repoPath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Expected ${series}:${leaf} artifact ${repoPath}`);

  const markerSlug = artifactMarkerSlug(path.basename(repoPath));
  if (markerSlug === null) throw new Error(`Expected marker artifact for ${series}:${leaf}, got ${repoPath}`);
  const artifact = { leaf: markerSlugToLeaf(markerSlug), repoPath, markerSlug };
  assert(artifact.leaf === leaf, `Expected ${series}:${leaf} artifact ${repoPath}, got ${artifact.leaf}`);
  return artifact;
}

export function assertSeriesMatchesPhysical(execRoot: string, config: IssuesConfig, seriesState: SeriesState): void {
  const seriesRoot = normalizeRepoPath(seriesDir(config, seriesState.series));
  const seriesPath = path.join(execRoot, seriesRoot, 'SERIES.md');
  const rows = parseSeriesRows(fs.readFileSync(seriesPath, 'utf8'), `${seriesRoot}/SERIES.md`);
  const rowsByLeaf = Object.fromEntries(rows.map((row) => [row.leaf, row]));
  const artifacts: PhysicalArtifact[] = [];
  collectPhysicalArtifacts(execRoot, seriesRoot, artifacts);
  const stateKeys = Object.keys(seriesState.leaves).sort((left, right) => left.localeCompare(right));
  const artifactKeys = artifacts.map((artifact) => artifact.leaf).sort((left, right) => left.localeCompare(right));
  assert(stateKeys.join('\n') === artifactKeys.join('\n'), `Series materialized leaves mismatch for ${seriesState.series}`);

  for (const stateKey of stateKeys) {
    const row = rowsByLeaf[stateKey];
    if (row === undefined) throw new Error(`Expected ${seriesState.series}:${stateKey} to appear in SERIES.md`);
    const artifact = resolvePhysicalArtifact(artifacts, seriesRoot, stateKey);
    const expectedRepoPath = normalizeRepoPath(path.join(seriesRoot, row.artifact));
    assert(artifact.repoPath === expectedRepoPath, `Expected ${seriesRoot}:${row.leaf} artifact ${expectedRepoPath}, got ${artifact.repoPath}`);
    const leafSlug = markerSlugToLeaf(artifact.markerSlug);
    const leafState = seriesState.leaves[row.leaf];
    assert(leafSlug === row.leaf, `Expected ${row.leaf} to match ${artifact.markerSlug}`);
    assert(leafState.created === createdFor(artifact.repoPath, execRoot), `Expected ${seriesState.series}:${row.leaf} created to match ${artifact.repoPath}`);
  }
}

export function isSeriesContainerRetirementEligible(seriesState: SeriesState): boolean {
  return Object.values(seriesState.leaves).every((leafState) => leafState.phase === 'D-merge');
}

export function assertSeriesLeafRetirementAllowed(seriesState: SeriesState, leaf: string): void {
  if (isSeriesContainerRetirementEligible(seriesState)) return;
  const nonTerminalLeaves = Object.entries(seriesState.leaves)
    .filter(([, leafState]) => leafState.phase !== 'D-merge')
    .map(([leafKey]) => leafKey);
  throw new Error(`Series leaf retirement blocked ${JSON.stringify({ series: seriesState.series, leaf, nonTerminalLeaves })}`);
}

export interface SeriesLeafByPhase {
  series: string;
  leaf: string;
  phase: IssuePhase;
  artifactRepoPath: string;
}

export function discoverSeriesStates(execRoot: string, config: IssuesConfig): SeriesState[] {
  const issuesRoot = path.join(execRoot, activeIssuesRoot(config));
  if (!fs.existsSync(issuesRoot)) return [];
  return fs.readdirSync(issuesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    // Only top-level issue roots can provide canonical live series state.
    .map((entry) => path.join(issuesRoot, entry.name, 'state.yaml'))
    .filter((statePath) => fs.existsSync(statePath))
    .filter((statePath) => typeof loadYamlMap(fs.readFileSync(statePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, statePath))).series === 'string')
    .map((statePath) => parseSeriesState(fs.readFileSync(statePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, statePath))));
}

export function findSeriesLeavesByPhase(execRoot: string, config: IssuesConfig, phase: IssuePhase): SeriesLeafByPhase[] {
  return discoverSeriesStates(execRoot, config).flatMap((seriesState) => {
    assertSeriesMatchesPhysical(execRoot, config, seriesState);
    const seriesRoot = normalizeRepoPath(seriesDir(config, seriesState.series));
    const artifacts: PhysicalArtifact[] = [];
    collectPhysicalArtifacts(execRoot, seriesRoot, artifacts);
    return Object.entries(seriesState.leaves)
      .filter(([, leafState]) => leafState.phase === phase)
      .map(([leaf, leafState]) => ({
        series: seriesState.series,
        leaf,
        phase: leafState.phase,
        artifactRepoPath: resolvePhysicalArtifact(artifacts, seriesRoot, leaf).repoPath
      }));
  }).sort((left, right) => left.artifactRepoPath.localeCompare(right.artifactRepoPath));
}

export function writeIssuePhase(execRoot: string, slug: string, to: IssuePhase): void {
  const config = readConfig(execRoot);
  const issueRoot = normalizeRepoPath(issueDir(config, slug));
  const stateFilePath = path.join(execRoot, issueRoot, 'state.yaml');
  const current = parseIssueState(fs.readFileSync(stateFilePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, stateFilePath)));
  if (!isAllowedTransition(current.phase, to)) {
    throw new Error(`Illegal issue transition ${JSON.stringify({ artifactPath: issueRoot, from: current.phase, to, stateFilePath: normalizeRepoPath(path.relative(execRoot, stateFilePath)) })}`);
  }
  writeYaml(stateFilePath, { slug: current.slug, phase: to, created: current.created, ...(current.seed_path === undefined ? {} : { seed_path: current.seed_path }) });
  const written = parseIssueState(fs.readFileSync(stateFilePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, stateFilePath)));
  assert(written.slug === current.slug && written.phase === to && written.created === current.created && written.seed_path === current.seed_path, `Issue state write drifted for ${slug}`);
}

export function createIssueState(execRoot: string, slug: string, created: string, seedPath?: string): void {
  const config = readConfig(execRoot);
  const stateFilePath = path.join(execRoot, issueDir(config, slug), 'state.yaml');
  if (fs.existsSync(stateFilePath)) throw new Error(`Refusing to overwrite existing issue state ${normalizeRepoPath(path.relative(execRoot, stateFilePath))}`);
  fs.mkdirSync(path.dirname(stateFilePath), { recursive: true });
  writeYaml(stateFilePath, { slug, phase: 'P-draft', created, ...(seedPath === undefined ? {} : { seed_path: seedPath }) });
  const written = parseIssueState(fs.readFileSync(stateFilePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, stateFilePath)));
  assert(written.slug === slug && written.phase === 'P-draft' && written.created === created && written.seed_path === seedPath, `Issue state write drifted for ${slug}`);
}

export function createSeriesState(execRoot: string, series: string, leaves: string[], created: string, seedPath?: string): void {
  const config = readConfig(execRoot);
  const seriesRoot = normalizeRepoPath(seriesDir(config, series));
  const stateFilePath = path.join(execRoot, seriesRoot, 'state.yaml');
  if (fs.existsSync(stateFilePath)) throw new Error(`Refusing to overwrite existing series state ${normalizeRepoPath(path.relative(execRoot, stateFilePath))}`);
  fs.mkdirSync(path.dirname(stateFilePath), { recursive: true });
  writeYaml(stateFilePath, seriesStateToYamlMap({
    series,
    created,
    ...(seedPath === undefined ? {} : { seed_path: seedPath }),
    leaves: Object.fromEntries(leaves.map((leaf) => [leaf, { phase: 'P-draft', created }]))
  }));
  const written = parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), normalizeRepoPath(path.relative(execRoot, stateFilePath)));
  assert(written.series === series && written.seed_path === seedPath && Object.keys(written.leaves).join('\n') === leaves.join('\n'), `Series state write drifted for ${series}`);
}

export function readIssuePhase(execRoot: string, slug: string): IssuePhaseRead {
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const controlConfig = readConfig(controlRoot);
  const stateFilePath = path.join(controlRoot, issueDir(controlConfig, slug), 'state.yaml');
  const stateFileRepoPath = normalizeRepoPath(path.relative(controlRoot, stateFilePath));
  if (!fs.existsSync(stateFilePath)) throw new Error(`Expected issue state ${stateFileRepoPath}`);
  const state = parseIssueState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath);
  return { target: 'issue', slug, phase: state.phase, stateFilePath: stateFileRepoPath };
}

export function readSeriesLeafPhase(execRoot: string, series: string, leaf: string): SeriesLeafPhaseRead {
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const controlConfig = readConfig(controlRoot);
  const stateFilePath = path.join(controlRoot, seriesDir(controlConfig, series), 'state.yaml');
  const stateFileRepoPath = normalizeRepoPath(path.relative(controlRoot, stateFilePath));
  if (!fs.existsSync(stateFilePath)) throw new Error(`Expected series state ${stateFileRepoPath}`);
  const state = parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath);
  const current = state.leaves[leaf];
  if (current === undefined) throw new Error(`Expected ${series}:${leaf} in ${stateFileRepoPath}`);
  return { target: 'series', series, leaf, phase: current.phase, stateFilePath: stateFileRepoPath };
}

type SlugCandidate = { target: 'issue'; slug: string } | { target: 'series'; series: string; leaf: string };

export function resolveSlug(execRoot: string, slug: string): IssuePhaseRead | SeriesLeafPhaseRead {
  const inputSlug = slug;
  const lookupSlug = /^\d{2}[ps]-.+$/.test(inputSlug) ? markerSlugToLeaf(inputSlug) : inputSlug;
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const controlConfig = readConfig(controlRoot);
  const standaloneStatePath = path.join(controlRoot, issueDir(controlConfig, lookupSlug), 'state.yaml');
  const candidates: SlugCandidate[] = [
    ...(fs.existsSync(standaloneStatePath) ? [{ target: 'issue', slug: lookupSlug } as const] : []),
    ...discoverSeriesStates(controlRoot, controlConfig)
      .filter((seriesState) => seriesState.leaves[lookupSlug] !== undefined)
      .map((seriesState) => ({ target: 'series', series: seriesState.series, leaf: lookupSlug } as const))
  ];
  const inputNote = inputSlug === lookupSlug ? '' : ` (input ${inputSlug})`;
  if (candidates.length === 0) {
    throw new Error(`Expected ${lookupSlug}${inputNote} at ${normalizeRepoPath(path.relative(controlRoot, standaloneStatePath))} or as a leaf in a series state under ${normalizeRepoPath(activeIssuesRoot(controlConfig))}`);
  }
  if (candidates.length > 1) {
    const retryCommands = candidates
      .map((candidate) => candidate.target === 'issue' ? `phase issue ${candidate.slug}` : `phase series ${candidate.series} ${candidate.leaf}`)
      .join(', ');
    throw new Error(`Expected exactly one candidate for ${lookupSlug}${inputNote}, got ${candidates.length}; retry with ${retryCommands}`);
  }
  const candidate = candidates[0];
  return candidate.target === 'issue'
    ? readIssuePhase(execRoot, candidate.slug)
    : readSeriesLeafPhase(execRoot, candidate.series, candidate.leaf);
}

export function resolveIssueArtifactOwnership(execRoot: string, slug: string): IssueArtifactOwnership {
  const resolved = resolveSlug(execRoot, slug);
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const config = readConfig(controlRoot);
  if (resolved.target === 'issue') {
    return {
      kind: 'standalone',
      slug: resolved.slug,
      artifactRoot: normalizeRepoPath(issueDir(config, resolved.slug)),
      sharedArtifactPaths: []
    };
  }

  const seriesRoot = normalizeRepoPath(seriesDir(config, resolved.series));
  return {
    kind: 'series-leaf',
    slug: resolved.leaf,
    series: resolved.series,
    seriesRoot,
    artifactRoot: resolveSeriesLeafArtifact(controlRoot, config, resolved.series, resolved.leaf).repoPath,
    sharedArtifactPaths: [`${seriesRoot}/state.yaml`, `${seriesRoot}/SERIES.md`]
  };
}

export function isOwnedIssueArtifactPath(ownership: IssueArtifactOwnership, repoPath: string): boolean {
  const normalizedPath = normalizeRepoPath(repoPath);
  return normalizedPath === ownership.artifactRoot
    || normalizedPath.startsWith(`${ownership.artifactRoot}/`)
    || ownership.sharedArtifactPaths.some((sharedPath) => sharedPath === normalizedPath);
}

export function transitionSeriesLeaf(execRoot: string, config: IssuesConfig, series: string, leaf: string, to: IssuePhase): void {
  const seriesRoot = normalizeRepoPath(seriesDir(config, series));
  const stateFilePath = path.join(execRoot, seriesRoot, 'state.yaml');
  const stateFileRepoPath = normalizeRepoPath(path.relative(execRoot, stateFilePath));
  const seriesState = parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath);
  const current = seriesState.leaves[leaf];
  if (current === undefined) throw new Error(`Expected ${series}:${leaf} in ${stateFileRepoPath}`);
  if (!isAllowedTransition(current.phase, to)) {
    throw new Error(`Illegal series transition ${JSON.stringify({ series, leaf, from: current.phase, to, stateFilePath: stateFileRepoPath })}`);
  }

  const nextState: SeriesState = {
    series: seriesState.series,
    created: seriesState.created,
    ...(seriesState.seed_path === undefined ? {} : { seed_path: seriesState.seed_path }),
    leaves: {
      ...seriesState.leaves,
      [leaf]: { phase: to, created: current.created }
    }
  };
  writeYaml(stateFilePath, seriesStateToYamlMap(nextState));
  assertSeriesMatchesPhysical(execRoot, config, parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath));
}

function advanceSeriesLeafForApprovalRoot(execRoot: string, config: IssuesConfig, series: string, leaf: string, to: IssuePhase): void {
  const seriesRoot = normalizeRepoPath(seriesDir(config, series));
  const stateFilePath = path.join(execRoot, seriesRoot, 'state.yaml');
  const stateFileRepoPath = normalizeRepoPath(path.relative(execRoot, stateFilePath));
  const seriesState = parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath);
  const current = seriesState.leaves[leaf];
  if (current === undefined) throw new Error(`Expected ${series}:${leaf} in ${stateFileRepoPath}`);
  resolveSeriesLeafArtifact(execRoot, config, series, leaf);
  if (to !== 'D-merge' || (current.phase !== to && !isAllowedTransition(current.phase, to))) {
    throw new Error(`Illegal series transition ${JSON.stringify({ series, leaf, from: current.phase, to, stateFilePath: stateFileRepoPath })}`);
  }
  if (current.phase === to) return;

  const nextState: SeriesState = {
    series: seriesState.series,
    created: seriesState.created,
    ...(seriesState.seed_path === undefined ? {} : { seed_path: seriesState.seed_path }),
    leaves: {
      ...seriesState.leaves,
      [leaf]: { phase: to, created: current.created }
    }
  };
  writeYaml(stateFilePath, seriesStateToYamlMap(nextState));
  const written = parseSeriesState(fs.readFileSync(stateFilePath, 'utf8'), stateFileRepoPath);
  assert(written.seed_path === seriesState.seed_path && written.leaves[leaf].phase === to && written.leaves[leaf].created === current.created, `Series approval write drifted for ${series}:${leaf}`);
}

export function parseWorktreePorcelain(execRoot: string): WorktreePorcelainEntry[] {
  const raw = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd: execRoot, encoding: 'utf8' });
  const entries: Array<{ path?: string; branch?: string }> = [];
  let current: { path?: string; branch?: string } = {};
  for (const line of raw.split('\n')) {
    if (line.startsWith('worktree ')) {
      current = { path: line.slice('worktree '.length).trim() };
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice('branch '.length).trim();
    } else if (line === '') {
      entries.push(current);
      current = {};
    }
  }
  entries.push(current);

  return entries.filter((entry): entry is WorktreePorcelainEntry => entry.path !== undefined && entry.branch !== undefined);
}

export function listManagedWorktrees(execRoot: string, config: IssuesConfig): ManagedWorktree[] {
  const managedRoot = resolveManagedRoot(execRoot, config);
  return parseWorktreePorcelain(execRoot)
    .filter((entry) => normalizeAbsolutePath(path.resolve(entry.path)).startsWith(`${managedRoot}/`))
    .filter((entry) => entry.branch.replace('refs/heads/', '').startsWith(config.branch_prefix))
    .map((entry) => ({
      name: normalizeAbsolutePath(entry.path).split('/').pop()!,
      path: normalizeRepoPath(path.relative(execRoot, entry.path)),
      branch: entry.branch.replace('refs/heads/', '')
    }));
}

export function resolveControlRoot(execRoot: string, config: IssuesConfig): string {
  const managedRoot = resolveManagedRoot(execRoot, config);
  const candidates = parseWorktreePorcelain(execRoot)
    .filter((entry) => !normalizeAbsolutePath(path.resolve(entry.path)).startsWith(`${managedRoot}/`));
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one lifecycle control root ${JSON.stringify({ worktree_root: config.worktree_root, candidates })}`);
  }
  return path.resolve(candidates[0].path);
}

function resolveManagedRoot(execRoot: string, config: IssuesConfig): string {
  const execPath = normalizeAbsolutePath(path.resolve(execRoot));
  const worktreeRoot = normalizeRepoPath(config.worktree_root);
  const worktreeMarker = `/${worktreeRoot}/`;
  const markerIndex = `${execPath}/`.lastIndexOf(worktreeMarker);
  if (markerIndex === -1) return normalizeAbsolutePath(path.resolve(execRoot, config.worktree_root));
  return execPath.slice(0, markerIndex + worktreeMarker.length - 1);
}

export function resolveManagedWorktree(execRoot: string, config: IssuesConfig, name: string): ManagedWorktree | undefined {
  return listManagedWorktrees(execRoot, config).find((candidate) => candidate.name === name);
}

export function advanceSeriesLeafForApproval(execRoot: string, config: IssuesConfig, series: string, leaf: string, to: IssuePhase): void {
  const controlRoot = resolveControlRoot(execRoot, config);
  advanceSeriesLeafForApprovalRoot(controlRoot, readConfig(controlRoot), series, leaf, to);
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function execGit(root: string, args: string[], env: NodeJS.ProcessEnv = process.env): void {
  execFileSync('git', ['-C', root, ...args], { stdio: 'ignore', env });
}

function execGitText(root: string, args: string[], env: NodeJS.ProcessEnv = process.env): string {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', env }).trim();
}

function commitCheckpoint(controlRoot: string, repoPaths: string[], message: string): void {
  execGit(controlRoot, ['add', '--', ...repoPaths]);
  execGit(controlRoot, ['commit', '-m', message, '--', ...repoPaths]);
}

function writeFixtureFile(root: string, repoPath: string, content: string): void {
  const absolutePath = path.join(root, repoPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
}

function addUntrackedSeriesSibling(root: string, created: string): void {
  const approvalStatePath = path.join(root, 'issues', 'open', 'series', 'state.yaml');
  const approvalState = parseSeriesState(fs.readFileSync(approvalStatePath, 'utf8'), 'issues/open/series/state.yaml');
  writeYaml(approvalStatePath, seriesStateToYamlMap({
    series: approvalState.series,
    created: approvalState.created,
    leaves: {
      ...approvalState.leaves,
      untracked: { phase: 'P-draft', created }
    }
  }));
  fs.appendFileSync(
    path.join(root, 'issues', 'open', 'series', 'SERIES.md'),
    '| 03    | s    | untracked | `03-untracked/03s-untracked.md` |\n',
    'utf8'
  );
  writeFixtureFile(root, 'issues/open/series/03-untracked/03s-untracked.md', '# Untracked\n');
}

const fixtureConfigYaml = [
  'issues_root: issues',
  'scripts_dir: issues/.scripts',
  'worktree_root: issues/worktrees',
  'branch_prefix: worktree-',
  'broadcast:',
  '  discord:',
  '    webhook_env:',
  '      - DISCORD_WEBHOOK_URL',
  'grounding:',
  '  index: .claude/docs/reference-index.md',
  '  docs:',
  '    - .claude/docs/llm-context.md',
  '    - .claude/docs/project-overview.md',
  '  surfaces:',
  '    - issues/.scripts/lifecycle.ts',
  '    - issues/config.yaml',
  ''
].join('\n');

function createFixtureRepo(): { root: string; config: IssuesConfig; created: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issues-lifecycle-'));
  const created = '2026-05-31T08:17:17+02:00';
  const config = parseIssuesConfig(fixtureConfigYaml, 'fixture-config.yaml');
  writeFixtureFile(root, 'issues/config.yaml', fixtureConfigYaml);
  writeFixtureFile(root, 'issues/open/sample/state.yaml', `slug: sample\nphase: I-ready\ncreated: '${created}'\n`);
  writeFixtureFile(root, 'issues/open/series/state.yaml', `series: series\ncreated: '${created}'\nleaves:\n  sample: { phase: I-ready, created: '${created}' }\n  folder: { phase: P-draft, created: '${created}' }\n`);
  writeFixtureFile(root, 'issues/open/series/SERIES.md', [
    '# series - Series Index',
    '',
    '| Order | Mode | Leaf   | File                         |',
    '|-------|------|--------|------------------------------|',
    '| 01    | s    | sample | `01-sample/01s-sample.md` |',
    '| 02    | p    | folder | `02-folder/02p-folder/` |',
    ''
  ].join('\n'));
  writeFixtureFile(root, 'issues/open/series/01-sample/01s-sample.md', '# Sample\n');
  writeFixtureFile(root, 'issues/open/series/02-folder/02p-folder/planning/plan.md', '# Folder\n');
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
  execGit(root, ['config', 'user.name', 'Fixture']);
  execGit(root, ['config', 'user.email', 'fixture@example.com']);
  execGit(root, ['add', '.']);
  execGit(root, ['commit', '-m', 'fixture'], {
    ...process.env,
    GIT_AUTHOR_NAME: 'Fixture',
    GIT_AUTHOR_EMAIL: 'fixture@example.com',
    GIT_COMMITTER_NAME: 'Fixture',
    GIT_COMMITTER_EMAIL: 'fixture@example.com',
    GIT_AUTHOR_DATE: created,
    GIT_COMMITTER_DATE: created
  });
  return { root, config, created };
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

export function auditLiveSeries(execRoot: string): void {
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const liveConfig = readConfig(controlRoot);
  for (const liveState of discoverSeriesStates(controlRoot, liveConfig)) {
    assertSeriesMatchesPhysical(controlRoot, liveConfig, liveState);
  }
}

function runParsingSelfTests(): void {
  const parsed = parseIssueRootName('D-merge-01p-foo');
  assert(parsed !== null && parsed.state === 'D-merge' && parsed.slug === '01p-foo', 'expected D-merge prefix stripped to marker slug');
  assert(parseIssueRootName('pr-blueprint-phasing') === null, 'expected non-prefixed name to parse to null');
  const parsedMarkdown = parseIssueRootName('P-draft-02s-read-cutover.md');
  assert(parsedMarkdown !== null && parsedMarkdown.slug === '02s-read-cutover', 'expected .md suffix stripped before parsing');

  assert(isAllowedTransition('P-draft', 'P-synth'), 'expected P-draft to advance to P-synth');
  assert(isAllowedTransition('C-ready', 'C-fix'), 'expected C-ready repair transition to C-fix');
  assert(isAllowedTransition('C-fix', 'C-ready'), 'expected C-fix to return to C-ready');
  assert(isAllowedTransition('C-fix', 'D-merge'), 'expected C-fix to advance to D-merge on approval');
  assert(isAllowedTransition('C-ready', 'D-merge'), 'expected C-ready to stay mergeable');
  assert(!isAllowedTransition('P-draft', 'I-ready'), 'expected P-draft to reject skipped transition');
  assert(!isAllowedTransition('I-ready', 'D-merge'), 'expected I-ready to reject skipped merge');
  const config = parseIssuesConfig(fixtureConfigYaml, 'fixture-config.yaml');
  assert(branchForSlug('state-foundation', config) === 'worktree-state-foundation', 'expected branch derivation from slug');
  assert(config.grounding !== 'none' && config.grounding.index === '.claude/docs/reference-index.md', 'expected grounding config round-trip');
  assert(config.grounding !== 'none' && config.grounding.surfaces?.join('|') === 'issues/.scripts/lifecycle.ts|issues/config.yaml', 'expected grounding surfaces round-trip');
  assert(config.broadcast?.discord.webhook_env.join('|') === 'DISCORD_WEBHOOK_URL', 'expected broadcast webhook env round-trip');
  assert(parseWorktreePorcelain(process.cwd()).length >= 1, 'expected porcelain parser to return at least one worktree for current checkout');
  const docsOnlyConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  docs:\n    - .claude/docs/llm-context.md\n', 'docs-only-config.yaml');
  assert(docsOnlyConfig.grounding !== 'none' && docsOnlyConfig.grounding.docs?.join('|') === '.claude/docs/llm-context.md', 'expected grounding docs-only config to parse');
  assert(parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  surfaces:\n    - issues/.scripts/lifecycle.ts\n', 'surfaces-config.yaml').grounding !== 'none', 'expected grounding surfaces-only config to parse');
  const indexedScopesConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  index: docs/reference-index.md\n  indexed_scopes:\n    - docs/\n    - scripts/\n', 'indexed-scopes-config.yaml');
  assert(indexedScopesConfig.grounding !== 'none' && indexedScopesConfig.grounding.indexed_scopes?.join('|') === 'docs/|scripts/', 'expected grounding indexed_scopes config to parse');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  indexed_scopes:\n    - docs/\n', 'indexed-scopes-without-index-config.yaml'), 'indexed-scopes-without-index-config.yaml.grounding.indexed_scopes');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  index: docs/reference-index.md\n  indexed_scopes: []\n', 'empty-indexed-scopes-config.yaml'), 'empty-indexed-scopes-config.yaml.grounding.indexed_scopes');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding:\n  surfaces: []\n', 'empty-surfaces-config.yaml'), 'empty-surfaces-config.yaml.grounding.surfaces');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: {}\n', 'empty-grounding-config.yaml'), 'empty-grounding-config.yaml.grounding');
  assert(parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\n', 'none-config.yaml').grounding === 'none', 'expected grounding none to parse');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\n', 'missing-config.yaml'), 'missing-config.yaml.grounding');
  assert(parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\n', 'no-broadcast-config.yaml').broadcast === undefined, 'expected absent broadcast to parse as undefined');
  const multiWebhookConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env:\n      - DISCORD_WEBHOOK_URL_1\n      - DISCORD_WEBHOOK_URL_2\n', 'multi-webhook-config.yaml');
  assert(multiWebhookConfig.broadcast?.discord.webhook_env.join('|') === 'DISCORD_WEBHOOK_URL_1|DISCORD_WEBHOOK_URL_2', 'expected multi-webhook broadcast config to parse in order');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast: {}\n', 'missing-discord-config.yaml'), 'missing-discord-config.yaml.broadcast.discord');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env: []\n', 'empty-webhook-env-config.yaml'), 'empty-webhook-env-config.yaml.broadcast.discord.webhook_env');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env: DISCORD_WEBHOOK_URL\n', 'scalar-webhook-env-config.yaml'), 'scalar-webhook-env-config.yaml.broadcast.discord.webhook_env');
  assert(config.branch_prefix === 'worktree-', 'expected config round-trip');
}

function runStateSelfTests(): void {
  const issueState = parseIssueState('slug: sample\nphase: I-ready\ncreated: "2026-05-31T08:17:17+02:00"\n', 'fixture-state.yaml');
  assert(issueState.slug === 'sample' && issueState.phase === 'I-ready' && issueState.seed_path === undefined, 'expected issue state round-trip');
  const seededIssueState = parseIssueState('slug: sample\nphase: I-ready\ncreated: "2026-05-31T08:17:17+02:00"\nseed_path: issues/open/sample.md\n', 'seeded-fixture-state.yaml');
  assert(seededIssueState.seed_path === 'issues/open/sample.md', 'expected issue seed path round-trip');

  const seriesState = parseSeriesState('series: sample-series\ncreated: "2026-05-31T08:17:17+02:00"\nleaves:\n  sample: { phase: P-draft, created: "2026-05-31T08:17:17+02:00" }\n', 'fixture-series.yaml');
  assert(seriesState.series === 'sample-series' && seriesState.leaves.sample.phase === 'P-draft' && seriesState.seed_path === undefined, 'expected series state round-trip');
  const seededSeriesState = parseSeriesState('series: sample-series\ncreated: "2026-05-31T08:17:17+02:00"\nseed_path: issues/open/sample-series.md\nleaves:\n  sample: { phase: P-draft, created: "2026-05-31T08:17:17+02:00" }\n', 'seeded-fixture-series.yaml');
  assert(seededSeriesState.seed_path === 'issues/open/sample-series.md', 'expected series seed path round-trip');
  const terminalSeriesState = parseSeriesState('series: terminal-series\ncreated: "2026-05-31T08:17:17+02:00"\nleaves:\n  sample: { phase: D-merge, created: "2026-05-31T08:17:17+02:00" }\n  folder: { phase: D-merge, created: "2026-05-31T08:17:17+02:00" }\n', 'terminal-fixture-series.yaml');
  assert(isSeriesContainerRetirementEligible(terminalSeriesState), 'expected all-terminal series to be retirement eligible');
  assert(!isSeriesContainerRetirementEligible(seriesState), 'expected mixed series to be retirement ineligible');
  assertSeriesLeafRetirementAllowed(terminalSeriesState, 'sample');
  assertThrows(() => assertSeriesLeafRetirementAllowed(seriesState, 'sample'), 'Series leaf retirement blocked');

  assertThrows(
    () => parseSeriesRows('| Order | Mode | State | Leaf | File |\n|---|---|---|---|---|\n| 01 | s | P-draft | sample | `P-draft-01s-sample.md` |\n', 'stateful-series.md'),
    're-materialize state-free'
  );
  assertThrows(
    () => parseSeriesRows('| Order | State | Leaf | File |\n|---|---|---|---|\n| 01 | P-draft | sample | `P-draft-01s-sample.md` |\n', 'stateful-series.md'),
    're-materialize state-free'
  );
}

function runFixtureLifecycleSelfTests(): ReturnType<typeof createFixtureRepo> {
  const fixture = createFixtureRepo();
  assertSeriesMatchesPhysical(fixture.root, fixture.config, parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml'));
  assert(createdFor('issues/open/series/02-folder/02p-folder', fixture.root) === fixture.created, 'expected marker-only folder created to follow a tracked representative file');
  assert(createdFor('issues/open/series/01-sample/01s-sample.md', fixture.root) === fixture.created, 'expected createdFor to read deterministic git first-add');
  const laterCommitDate = '2026-06-30T09:00:00+02:00';
  writeFixtureFile(fixture.root, 'issues/open/series/02-folder/02p-folder/implementation/plan.md', '# Folder Implementation\n');
  execGit(fixture.root, ['add', '.']);
  execGit(fixture.root, ['commit', '-m', 'later artifact'], { ...process.env, GIT_AUTHOR_DATE: laterCommitDate, GIT_COMMITTER_DATE: laterCommitDate });
  assert(createdFor('issues/open/series/02-folder/02p-folder', fixture.root) === fixture.created, 'expected directory created to stay stable when a later tracked file sorts before the scaffold');
  assert(createdFor('issues/open/series/01-sample/01s-sample.md', fixture.root) === fixture.created, 'expected file created derivation to survive later sibling commits');
  assertSeriesMatchesPhysical(fixture.root, fixture.config, parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml'));
  const strayPrefixedArtifact = path.join(fixture.root, 'issues', 'open', 'series', '03-stray', 'P-draft-03s-stray');
  fs.mkdirSync(strayPrefixedArtifact, { recursive: true });
  assertThrows(
    () => assertSeriesMatchesPhysical(fixture.root, fixture.config, parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml')),
    'Stray prefixed migration artifact'
  );
  fs.rmSync(path.join(fixture.root, 'issues', 'open', 'series', '03-stray'), { recursive: true, force: true });
  const issueRoot = path.join(fixture.root, 'issues', 'open', 'sample');
  writeIssuePhase(fixture.root, 'sample', 'C-ready');
  const writtenIssue = parseIssueState(fs.readFileSync(path.join(issueRoot, 'state.yaml'), 'utf8'), 'issues/open/sample/state.yaml');
  assert(writtenIssue.phase === 'C-ready' && writtenIssue.created === fixture.created, 'expected issue writer to preserve created while changing phase');

  createIssueState(fixture.root, 'new-issue', fixture.created);
  const createdIssue = parseIssueState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'new-issue', 'state.yaml'), 'utf8'), 'issues/open/new-issue/state.yaml');
  assert(createdIssue.phase === 'P-draft' && createdIssue.created === fixture.created && createdIssue.seed_path === undefined, 'expected createIssueState to write initial state');
  assert(loadYamlMap(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'new-issue', 'state.yaml'), 'utf8'), 'issues/open/new-issue/state.yaml').seed_path === undefined, 'expected createIssueState to omit absent seed_path');
  assert(JSON.stringify(readIssuePhase(fixture.root, 'new-issue')) === JSON.stringify({ target: 'issue', slug: 'new-issue', phase: 'P-draft', stateFilePath: 'issues/open/new-issue/state.yaml' }), 'expected issue phase read shape');
  assertThrows(() => createIssueState(fixture.root, 'new-issue', fixture.created), 'Refusing to overwrite existing issue state');
  createIssueState(fixture.root, 'seeded-issue', fixture.created, 'issues/open/seeded-issue.md');
  writeIssuePhase(fixture.root, 'seeded-issue', 'P-synth');
  const seededCreatedIssue = parseIssueState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'seeded-issue', 'state.yaml'), 'utf8'), 'issues/open/seeded-issue/state.yaml');
  assert(seededCreatedIssue.seed_path === 'issues/open/seeded-issue.md' && seededCreatedIssue.phase === 'P-synth', 'expected issue seed_path to survive phase write');

  const seededFixtureSeriesPath = path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml');
  const fixtureSeriesState = parseSeriesState(fs.readFileSync(seededFixtureSeriesPath, 'utf8'), 'issues/open/series/state.yaml');
  writeYaml(seededFixtureSeriesPath, seriesStateToYamlMap({ ...fixtureSeriesState, seed_path: 'issues/open/series.md' }));
  transitionSeriesLeaf(fixture.root, fixture.config, 'series', 'sample', 'C-ready');
  const writtenSeries = parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml');
  assert(writtenSeries.leaves.sample.phase === 'C-ready' && writtenSeries.leaves.sample.created === fixture.created && writtenSeries.seed_path === 'issues/open/series.md', 'expected series writer to preserve created while changing phase');
  const reparsedCreated = loadYamlMap(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml').leaves;
  assert(parseSeriesLeaf(asMap(reparsedCreated, 'leaves').sample, 'sample').created === fixture.created, 'expected created to re-read as a string');
  writeFixtureFile(fixture.root, 'issues/worktrees/phantom/state.yaml', `series: phantom\ncreated: '${fixture.created}'\nleaves:\n  nested: { phase: C-ready, created: '${fixture.created}' }\n`);
  const leaves = findSeriesLeavesByPhase(fixture.root, fixture.config, 'C-ready');
  assert(leaves.length === 1 && leaves[0].artifactRepoPath === 'issues/open/series/01-sample/01s-sample.md', 'expected discovery helper to return the physical artifact path');
  assertThrows(() => transitionSeriesLeaf(fixture.root, fixture.config, 'series', 'folder', 'D-merge'), 'Illegal series transition');
  assert(JSON.stringify(readSeriesLeafPhase(fixture.root, 'series', 'folder')) === JSON.stringify({ target: 'series', series: 'series', leaf: 'folder', phase: 'P-draft', stateFilePath: 'issues/open/series/state.yaml' }), 'expected series leaf phase read shape');
  assertThrows(() => readSeriesLeafPhase(fixture.root, 'series', 'missing'), 'Expected series:missing in issues/open/series/state.yaml');
  return fixture;
}

function runApprovalSelfTests(): void {
  const rootApprovalFixture = createFixtureRepo();
  transitionSeriesLeaf(rootApprovalFixture.root, rootApprovalFixture.config, 'series', 'sample', 'C-ready');
  addUntrackedSeriesSibling(rootApprovalFixture.root, rootApprovalFixture.created);
  advanceSeriesLeafForApprovalRoot(rootApprovalFixture.root, rootApprovalFixture.config, 'series', 'sample', 'D-merge');
  advanceSeriesLeafForApprovalRoot(rootApprovalFixture.root, rootApprovalFixture.config, 'series', 'sample', 'D-merge');
  const rootApprovalStatePath = path.join(rootApprovalFixture.root, 'issues', 'open', 'series', 'state.yaml');
  const approvalWritten = parseSeriesState(fs.readFileSync(rootApprovalStatePath, 'utf8'), 'issues/open/series/state.yaml');
  assert(approvalWritten.leaves.sample.phase === 'D-merge', 'expected approved advance to write D-merge');
  assertThrows(() => advanceSeriesLeafForApprovalRoot(rootApprovalFixture.root, rootApprovalFixture.config, 'series', 'folder', 'D-merge'), 'Illegal series transition');
  assertThrows(() => advanceSeriesLeafForApprovalRoot(rootApprovalFixture.root, rootApprovalFixture.config, 'series', 'sample', 'C-ready'), 'Illegal series transition');

  const publicApprovalFixture = createFixtureRepo();
  execGit(publicApprovalFixture.root, ['worktree', 'add', '-b', 'worktree-sample', 'issues/worktrees/sample', 'HEAD']);
  assert(normalizeAbsolutePath(resolveControlRoot(publicApprovalFixture.root, publicApprovalFixture.config)) === normalizeAbsolutePath(publicApprovalFixture.root), 'expected control root to resolve from primary checkout');
  const publicApprovalWorktree = resolveManagedWorktree(publicApprovalFixture.root, publicApprovalFixture.config, 'sample');
  if (publicApprovalWorktree === undefined) throw new Error('expected managed worktree resolution');
  assert(publicApprovalWorktree.branch === 'worktree-sample', 'expected managed worktree branch');
  const publicApprovalWorktreeRoot = path.join(publicApprovalFixture.root, publicApprovalWorktree.path);
  assert(normalizeAbsolutePath(resolveControlRoot(publicApprovalWorktreeRoot, readConfig(publicApprovalWorktreeRoot))) === normalizeAbsolutePath(publicApprovalFixture.root), 'expected control root to resolve from managed worktree');
  transitionSeriesLeaf(publicApprovalFixture.root, publicApprovalFixture.config, 'series', 'sample', 'C-ready');
  transitionSeriesLeaf(publicApprovalWorktreeRoot, readConfig(publicApprovalWorktreeRoot), 'series', 'sample', 'C-ready');
  addUntrackedSeriesSibling(publicApprovalFixture.root, publicApprovalFixture.created);
  addUntrackedSeriesSibling(publicApprovalWorktreeRoot, publicApprovalFixture.created);
  const publicApprovalInitialCommit = execGitText(publicApprovalFixture.root, ['rev-parse', 'HEAD']);
  runCli(['advance', 'series', 'sample', 'D-merge'], publicApprovalFixture.root, () => undefined);
  runCli(['advance', 'series', 'sample', 'D-merge'], publicApprovalFixture.root, () => undefined);
  assert(execGitText(publicApprovalFixture.root, ['rev-list', '--count', `${publicApprovalInitialCommit}..HEAD`]) === '0', 'expected advance to remain write-only');
  const publicMainState = parseSeriesState(fs.readFileSync(path.join(publicApprovalFixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml');
  const publicWorktreeState = parseSeriesState(fs.readFileSync(path.join(publicApprovalWorktreeRoot, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml');
  assert(publicMainState.leaves.sample.phase === 'D-merge', 'expected public approved advance to write main root');
  assert(publicWorktreeState.leaves.sample.phase === 'C-ready', 'expected single-ledger advance to leave the worktree copy untouched');
  assertThrows(() => runCli(['advance', 'series', 'folder', 'D-merge'], publicApprovalFixture.root), 'Illegal series transition');
  assert(execGitText(publicApprovalFixture.root, ['status', '--short', '--', 'issues/open/series/02-folder/02p-folder']).length === 0, 'expected illegal approval target not to write folder artifact');
}

function runAuditAndTransitionSelfTests(): void {
  const auditWorktreeFixture = createFixtureRepo();
  execGit(auditWorktreeFixture.root, ['worktree', 'add', '-b', 'worktree-audit', 'issues/worktrees/audit', 'HEAD']);
  const auditWorktreeRoot = path.join(auditWorktreeFixture.root, 'issues', 'worktrees', 'audit');
  const auditWorktreeStatePath = path.join(auditWorktreeRoot, 'issues', 'open', 'series', 'state.yaml');
  const auditWorktreeState = parseSeriesState(fs.readFileSync(auditWorktreeStatePath, 'utf8'), 'issues/open/series/state.yaml');
  writeYaml(auditWorktreeStatePath, seriesStateToYamlMap({
    ...auditWorktreeState,
    leaves: {
      ...auditWorktreeState.leaves,
      sample: { ...auditWorktreeState.leaves.sample, created: '1999-01-01T00:00:00+00:00' }
    }
  }));
  auditLiveSeries(auditWorktreeRoot);

  const transitionFixture = createFixtureRepo();
  execGit(transitionFixture.root, ['worktree', 'add', '-b', 'worktree-transition', 'issues/worktrees/transition', 'HEAD']);
  const transitionWorktreeRoot = path.join(transitionFixture.root, 'issues', 'worktrees', 'transition');
  const transitionInitialCommit = execGitText(transitionFixture.root, ['rev-parse', 'HEAD']);
  writeFixtureFile(transitionFixture.root, 'unrelated.txt', 'unrelated\n');
  execGit(transitionFixture.root, ['add', 'unrelated.txt']);
  writeFixtureFile(transitionFixture.root, 'issues/open/sample/planning/plan.md', '# Plan\n');
  runCli(['transition', 'issue', 'sample', 'C-ready', '--message', 'transition issue sample'], transitionWorktreeRoot, () => undefined);
  const transitionIssueState = parseIssueState(fs.readFileSync(path.join(transitionFixture.root, 'issues', 'open', 'sample', 'state.yaml'), 'utf8'), 'issues/open/sample/state.yaml');
  const transitionWorktreeIssueState = parseIssueState(fs.readFileSync(path.join(transitionWorktreeRoot, 'issues', 'open', 'sample', 'state.yaml'), 'utf8'), 'issues/open/sample/state.yaml');
  assert(transitionIssueState.phase === 'C-ready', 'expected transition issue to write control root');
  assert(transitionWorktreeIssueState.phase === 'I-ready', 'expected transition issue to leave stale worktree copy untouched');
  assert(JSON.stringify(readIssuePhase(transitionWorktreeRoot, 'sample')) === JSON.stringify({ target: 'issue', slug: 'sample', phase: 'C-ready', stateFilePath: 'issues/open/sample/state.yaml' }), 'expected issue phase helper to read control-root state from worktree');
  let transitionPhaseOutput = '';
  runCli(['phase', 'issue', 'sample'], transitionWorktreeRoot, (message) => { transitionPhaseOutput = message; });
  assert(transitionPhaseOutput === JSON.stringify({ target: 'issue', slug: 'sample', phase: 'C-ready', stateFilePath: 'issues/open/sample/state.yaml' }), 'expected phase CLI to read control-root state from worktree');
  assert(execGitText(transitionFixture.root, ['rev-list', '--count', `${transitionInitialCommit}..HEAD`]) === '1', 'expected transition issue to add one control-root commit');
  assert(execGitText(transitionFixture.root, ['show', '--name-only', '--format=', 'HEAD']).split('\n').filter((line) => line.length > 0).sort().join(',') === 'issues/open/sample/planning/plan.md,issues/open/sample/state.yaml', 'expected transition issue commit to checkpoint the dirty issue artifact alongside state.yaml');
  assert(execGitText(transitionFixture.root, ['status', '--short', '--', 'unrelated.txt']) === 'A  unrelated.txt', 'expected transition issue to leave unrelated staged changes uncommitted');
  assertThrows(() => runCli(['phase', 'issue'], transitionWorktreeRoot), 'Usage: lifecycle.ts phase issue <slug>');
  assertThrows(() => runCli(['transition', 'issue', 'sample', 'D-merge'], transitionWorktreeRoot), 'Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message>');

  const transitionSeriesFixture = createFixtureRepo();
  execGit(transitionSeriesFixture.root, ['worktree', 'add', '-b', 'worktree-transition-series', 'issues/worktrees/transition-series', 'HEAD']);
  const transitionSeriesWorktreeRoot = path.join(transitionSeriesFixture.root, 'issues', 'worktrees', 'transition-series');
  const transitionSeriesInitialCommit = execGitText(transitionSeriesFixture.root, ['rev-parse', 'HEAD']);
  writeFixtureFile(transitionSeriesFixture.root, 'issues/open/series/01-sample/01s-sample.md', '# Sample edited\n');
  writeFixtureFile(transitionSeriesFixture.root, 'issues/open/series/02-folder/02p-folder/planning/plan.md', '# Folder edited\n');
  runCli(['transition', 'series', 'series', 'sample', 'C-ready', '--message', 'transition series sample'], transitionSeriesWorktreeRoot, () => undefined);
  const transitionSeriesState = parseSeriesState(fs.readFileSync(path.join(transitionSeriesFixture.root, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml');
  const transitionSeriesWorktreeState = parseSeriesState(fs.readFileSync(path.join(transitionSeriesWorktreeRoot, 'issues', 'open', 'series', 'state.yaml'), 'utf8'), 'issues/open/series/state.yaml');
  assert(transitionSeriesState.leaves.sample.phase === 'C-ready', 'expected transition series to write control root');
  assert(transitionSeriesWorktreeState.leaves.sample.phase === 'I-ready', 'expected transition series to leave stale worktree copy untouched');
  assert(execGitText(transitionSeriesFixture.root, ['rev-list', '--count', `${transitionSeriesInitialCommit}..HEAD`]) === '1', 'expected transition series to add one control-root commit');
  assert(execGitText(transitionSeriesFixture.root, ['show', '--name-only', '--format=', 'HEAD']).split('\n').filter((line) => line.length > 0).sort().join(',') === 'issues/open/series/01-sample/01s-sample.md,issues/open/series/state.yaml', 'expected transition series commit to checkpoint the leaf artifact and series state.yaml only');
  assert(execGitText(transitionSeriesFixture.root, ['status', '--short', '--', 'issues/open/series/02-folder/02p-folder/planning/plan.md']).length > 0, 'expected transition series to leave the sibling leaf uncommitted');
}

function runResolverSelfTests(fixture: ReturnType<typeof createFixtureRepo>): void {
  createSeriesState(fixture.root, 'new-series', ['alpha', 'beta'], fixture.created);
  const createdSeries = parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'new-series', 'state.yaml'), 'utf8'), 'issues/open/new-series/state.yaml');
  assert(createdSeries.leaves.alpha.phase === 'P-draft' && createdSeries.leaves.beta.created === fixture.created && createdSeries.seed_path === undefined, 'expected createSeriesState to write initial leaves');
  assert(loadYamlMap(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'new-series', 'state.yaml'), 'utf8'), 'issues/open/new-series/state.yaml').seed_path === undefined, 'expected createSeriesState to omit absent seed_path');
  assertThrows(() => createSeriesState(fixture.root, 'new-series', ['alpha'], fixture.created), 'Refusing to overwrite existing series state');
  createSeriesState(fixture.root, 'seeded-series', ['alpha'], fixture.created, 'issues/open/seeded-series.md');
  const createdSeededSeries = parseSeriesState(fs.readFileSync(path.join(fixture.root, 'issues', 'open', 'seeded-series', 'state.yaml'), 'utf8'), 'issues/open/seeded-series/state.yaml');
  assert(createdSeededSeries.seed_path === 'issues/open/seeded-series.md', 'expected createSeriesState to write seed_path');

  const resolveFixture = createFixtureRepo();
  assert(JSON.stringify(resolveSlug(resolveFixture.root, 'folder')) === JSON.stringify(readSeriesLeafPhase(resolveFixture.root, 'series', 'folder')), 'expected resolve to match explicit series leaf read');
  assert(JSON.stringify(resolveSlug(resolveFixture.root, 'folder')) === JSON.stringify({ target: 'series', series: 'series', leaf: 'folder', phase: 'P-draft', stateFilePath: 'issues/open/series/state.yaml' }), 'expected resolve series leaf read shape');
  assert(JSON.stringify(resolveSlug(resolveFixture.root, '02p-folder')) === JSON.stringify(resolveSlug(resolveFixture.root, 'folder')), 'expected marker-form resolve to match plain-form resolve');
  createIssueState(resolveFixture.root, 'resolver-standalone', resolveFixture.created);
  const standaloneOwnership = resolveIssueArtifactOwnership(resolveFixture.root, 'resolver-standalone');
  assert(standaloneOwnership.kind === 'standalone' && standaloneOwnership.artifactRoot === 'issues/open/resolver-standalone' && standaloneOwnership.sharedArtifactPaths.length === 0, 'expected standalone issue artifact ownership');
  assert(isOwnedIssueArtifactPath(standaloneOwnership, 'issues\\open\\resolver-standalone\\implementation\\plan.md'), 'expected normalized standalone descendant ownership');
  assert(!isOwnedIssueArtifactPath(standaloneOwnership, 'issues/open/resolver-standalone-extra/state.yaml'), 'expected standalone prefix collision rejection');
  const leafOwnership = resolveIssueArtifactOwnership(resolveFixture.root, 'folder');
  assert(leafOwnership.kind === 'series-leaf' && leafOwnership.seriesRoot === 'issues/open/series' && leafOwnership.artifactRoot === 'issues/open/series/02-folder/02p-folder', 'expected series leaf artifact ownership');
  assert(leafOwnership.sharedArtifactPaths.join('|') === 'issues/open/series/state.yaml|issues/open/series/SERIES.md', 'expected exact series shared artifact ownership');
  assert(isOwnedIssueArtifactPath(leafOwnership, 'issues/open/series/02-folder/02p-folder/implementation/plan.md'), 'expected series leaf descendant ownership');
  assert(isOwnedIssueArtifactPath(leafOwnership, 'issues/open/series/state.yaml') && isOwnedIssueArtifactPath(leafOwnership, 'issues/open/series/SERIES.md'), 'expected exact shared file ownership');
  assert(!isOwnedIssueArtifactPath(leafOwnership, 'issues/open/series/01-sample/01s-sample.md'), 'expected sibling leaf rejection');
  assert(!isOwnedIssueArtifactPath(leafOwnership, 'issues/open/series/02-folder/02p-folder-extra/state.yaml'), 'expected series leaf prefix collision rejection');
  assert(JSON.stringify(resolveIssueArtifactOwnership(resolveFixture.root, '02p-folder')) === JSON.stringify(leafOwnership), 'expected marker-form ownership to match plain-form ownership');
  assert(JSON.stringify(resolveSlug(resolveFixture.root, 'resolver-standalone')) === JSON.stringify(readIssuePhase(resolveFixture.root, 'resolver-standalone')), 'expected resolve to match explicit issue read');
  assertThrows(() => resolveSlug(resolveFixture.root, 'sample'), 'phase issue sample');
  assertThrows(() => resolveSlug(resolveFixture.root, 'sample'), 'phase series series sample');
  writeFixtureFile(resolveFixture.root, 'issues/open/second-series/state.yaml', `series: second-series\ncreated: '${resolveFixture.created}'\nleaves:\n  folder: { phase: P-draft, created: '${resolveFixture.created}' }\n`);
  assertThrows(() => resolveSlug(resolveFixture.root, 'folder'), 'got 2');
  assertThrows(() => resolveSlug(resolveFixture.root, 'folder'), 'phase series series folder');
  assertThrows(() => resolveSlug(resolveFixture.root, 'folder'), 'phase series second-series folder');
  assertThrows(() => resolveIssueArtifactOwnership(resolveFixture.root, 'folder'), 'got 2');
  assertThrows(() => resolveSlug(resolveFixture.root, 'missing-slug'), 'Expected missing-slug at issues/open/missing-slug/state.yaml or as a leaf in a series state under issues/open');
  assertThrows(() => resolveSlug(resolveFixture.root, '01s-missing-slug'), 'Expected missing-slug (input 01s-missing-slug) at issues/open/missing-slug/state.yaml');
  assertThrows(() => runCli(['resolve'], resolveFixture.root), 'Usage: lifecycle.ts resolve <slug>');
  assertThrows(() => runCli(['resolve', 'a', 'b'], resolveFixture.root), 'Usage: lifecycle.ts resolve <slug>');
  assertThrows(() => readIssuePhase(resolveFixture.root, 'never-created'), 'Expected issue state issues/open/never-created/state.yaml');
  assertThrows(() => readSeriesLeafPhase(resolveFixture.root, 'never-series', 'leaf'), 'Expected series state issues/open/never-series/state.yaml');
  const malformedSeriesFixture = createFixtureRepo();
  writeFixtureFile(malformedSeriesFixture.root, 'issues/open/series/SERIES.md', '# series\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 02 | p | folder | missing-backticks |\n');
  assertThrows(() => resolveIssueArtifactOwnership(malformedSeriesFixture.root, 'folder'), 'Expected artifact path in issues/open/series/SERIES.md');
  let resolveCliOutput = '';
  runCli(['resolve', 'resolver-standalone'], resolveFixture.root, (message) => { resolveCliOutput = message; });
  assert(resolveCliOutput === JSON.stringify({ target: 'issue', slug: 'resolver-standalone', phase: 'P-draft', stateFilePath: 'issues/open/resolver-standalone/state.yaml' }), 'expected resolve CLI to emit the issue phase read JSON');
}

function runSelfTest(): void {
  runParsingSelfTests();
  runStateSelfTests();
  const fixture = runFixtureLifecycleSelfTests();
  runApprovalSelfTests();
  runAuditAndTransitionSelfTests();
  runResolverSelfTests(fixture);
  console.log('issues lifecycle: self-test ok');
}

function runCli(args = process.argv.slice(2), execRoot = defaultRoot(), log: (message: string) => void = console.log): void {
  if (args.includes('--self-test')) {
    runSelfTest();
    return;
  }
  if (args.includes('--audit-bridge')) {
    auditLiveSeries(execRoot);
    log('issues lifecycle: audit-bridge ok');
    return;
  }
  if (args[0] === 'phase') {
    const [, target] = args;
    if (target === 'issue') {
      const [, , slug, extra] = args;
      if (slug === undefined || extra !== undefined) {
        throw new Error('Usage: lifecycle.ts phase issue <slug>');
      }
      log(JSON.stringify(readIssuePhase(execRoot, slug)));
      return;
    }
    if (target === 'series') {
      const [, , series, leaf, extra] = args;
      if (series === undefined || leaf === undefined || extra !== undefined) {
        throw new Error('Usage: lifecycle.ts phase series <series> <leaf>');
      }
      log(JSON.stringify(readSeriesLeafPhase(execRoot, series, leaf)));
      return;
    }
    throw new Error('Usage: lifecycle.ts phase issue <slug> OR lifecycle.ts phase series <series> <leaf>');
  }
  if (args[0] === 'resolve') {
    const [, slug, extra] = args;
    if (slug === undefined || extra !== undefined) {
      throw new Error('Usage: lifecycle.ts resolve <slug>');
    }
    log(JSON.stringify(resolveSlug(execRoot, slug)));
    return;
  }
  if (args[0] === 'advance') {
    const [, series, leaf, toRaw] = args;
    if (series === undefined || leaf === undefined || toRaw === undefined || !isIssuePhase(toRaw)) {
      throw new Error('Usage: lifecycle.ts advance <series> <leaf> <to-phase>');
    }
    advanceSeriesLeafForApproval(execRoot, readConfig(execRoot), series, leaf, toRaw);
    log(`issues lifecycle: approved advance ${series}:${leaf} -> ${toRaw}`);
    return;
  }
  if (args[0] === 'transition') {
    const [, target] = args;
    const config = readConfig(execRoot);
    const controlRoot = resolveControlRoot(execRoot, config);
    const controlConfig = readConfig(controlRoot);
    if (target === 'issue') {
      const [, , slug, toRaw] = args;
      const message = parseMessage(args, 'Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message>');
      if (slug === undefined || toRaw === undefined || !isIssuePhase(toRaw)) {
        throw new Error('Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message>');
      }
      writeIssuePhase(controlRoot, slug, toRaw);
      const issueRepoDir = normalizeRepoPath(issueDir(controlConfig, slug));
      commitCheckpoint(controlRoot, [issueRepoDir], message);
      log(`issues lifecycle: transitioned issue ${slug} -> ${toRaw}`);
      return;
    }
    if (target === 'series') {
      const [, , series, leaf, toRaw] = args;
      const message = parseMessage(args, 'Usage: lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
      if (series === undefined || leaf === undefined || toRaw === undefined || !isIssuePhase(toRaw)) {
        throw new Error('Usage: lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
      }
      transitionSeriesLeaf(controlRoot, controlConfig, series, leaf, toRaw);
      const seriesStateRepoPath = normalizeRepoPath(path.join(seriesDir(controlConfig, series), 'state.yaml'));
      const leafArtifactRepoPath = resolveSeriesLeafArtifact(controlRoot, controlConfig, series, leaf).repoPath;
      commitCheckpoint(controlRoot, [leafArtifactRepoPath, seriesStateRepoPath], message);
      log(`issues lifecycle: transitioned series ${series}:${leaf} -> ${toRaw}`);
      return;
    }
    throw new Error('Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message> OR lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
  }
  log('issues lifecycle module is inert; run with --self-test, --audit-bridge, phase, resolve, transition, or advance <series> <leaf> <to-phase>');
}

function parseMessage(args: string[], usage: string): string {
  const messageIndex = args.indexOf('--message');
  if (messageIndex === -1 || messageIndex + 1 >= args.length || messageIndex + 2 !== args.length) {
    throw new Error(usage);
  }
  return args[messageIndex + 1];
}

if (require.main === module) {
  runCli();
}
