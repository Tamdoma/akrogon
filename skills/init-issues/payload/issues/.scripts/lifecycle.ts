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
  orchestrator?: IssuesOrchestrator;
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

export type OrchestratorRebuttalRounds = 1 | 2 | 'auto';
export type OrchestratorParkAfterScaffoldGate = 'operator';
export type OrchestratorPlanningSynthGate = 'operator';
export type OrchestratorImplementationSynthGate = 'operator' | 'auto';
export type OrchestratorMergeGate = 'operator-release' | 'auto-drain';

export interface IssuesOrchestratorGates {
  park_after_scaffold?: OrchestratorParkAfterScaffoldGate;
  planning_synth?: OrchestratorPlanningSynthGate;
  implementation_synth?: OrchestratorImplementationSynthGate;
  merge?: OrchestratorMergeGate;
}

export interface IssuesOrchestratorGrammar {
  invocation: string;
  clear_command: string;
}

export interface IssuesOrchestrator {
  enabled?: boolean;
  rebuttal_rounds?: OrchestratorRebuttalRounds;
  gates?: IssuesOrchestratorGates;
  prompts?: Record<string, string>;
  grammar?: Record<string, IssuesOrchestratorGrammar>;
  context_ceiling?: Record<string, number | 'auto'>;
  c_fix_loop_cap?: number;
}

export const RUN_STATUS_TOKENS = [
  'park.hold',
  'park.release',
  'operator.answers.wait',
  'planning.position.a',
  'planning.position.b',
  'planning.rebuttal.round1.a',
  'planning.rebuttal.round1.b',
  'planning.rebuttal.round2.classify',
  'planning.rebuttal.round2.a',
  'planning.rebuttal.round2.b',
  'planning.synthesize',
  'planning.approve',
  'implementation.position.a',
  'implementation.position.b',
  'implementation.rebuttal.round1.a',
  'implementation.rebuttal.round1.b',
  'implementation.rebuttal.round2.classify',
  'implementation.rebuttal.round2.a',
  'implementation.rebuttal.round2.b',
  'implementation.synthesize',
  'implementation.approve',
  'fidelity.audit',
  'fidelity.repair',
  'fidelity.operator-direction',
  'implementation.execute',
  'check.review',
  'repair.execute',
  'merge.approve',
  'merge.execute',
  'merge.shared-logic-hold'
] as const;

export type RunStatusToken = (typeof RUN_STATUS_TOKENS)[number];
export type RunStatusSlot = 'a' | 'b';
export type RunStatusMergeVerdict = 'merge-ready' | 'not-yet-merge-ready';

export interface RunStatusMergeVerdicts {
  a?: RunStatusMergeVerdict;
  b?: RunStatusMergeVerdict;
}

export interface RunStatus {
  next_step: RunStatusToken;
  merge_verdicts?: RunStatusMergeVerdicts;
}

export interface PresentRunStatusRead {
  slug: string;
  phase: IssuePhase;
  runStatusFilePath: string;
  statusState: 'present';
  status: RunStatus;
  terminalSentence: string;
}

export interface AbsentRunStatusRead {
  slug: string;
  phase: IssuePhase;
  runStatusFilePath: string;
  statusState: 'absent';
  status: null;
  terminalSentence: null;
}

export type RunStatusRead = PresentRunStatusRead | AbsentRunStatusRead;

const RUN_STATUS_ALLOWED_SENTENCES = [
  'Next step: Run consult-issue in slot A to write its independent planning position.',
  'Next step: Run consult-issue in slot B to write its independent planning position.',
  'Next step: Run consult-issue in slot A to write its planning rebuttal.',
  'Next step: Run consult-issue in slot B to write its planning rebuttal.',
  'Next step: Run consult-issue to synthesize the planning phase.',
  'Next step: Approve the planning synthesis to begin implementation planning.',
  'Next step: Run consult-issue in slot A to write its independent implementation position.',
  'Next step: Run consult-issue in slot B to write its independent implementation position.',
  'Next step: Run consult-issue in slot A to write its implementation rebuttal.',
  'Next step: Run consult-issue in slot B to write its implementation rebuttal.',
  'Next step: Run consult-issue to synthesize the implementation phase.',
  'Next step: Run consult-issue to audit implementation-plan fidelity.',
  'Next step: Approve the implementation synthesis to make the issue execution-ready.',
  'Next step: Run implement-issue to execute the implementation plan.',
  'Next step: Run check-issue to review the implementation.',
  'Next step: Run merge-issue to merge and clean up the issue.',
  'Next step: Approve D-merge to finish the issue, or rerun implement-issue first to fix the advisory quality items.',
  'Next step: None.'
] as const;

const RUN_STATUS_SENTENCES: Record<RunStatusToken, string> = {
  'park.hold': 'Next step: None.',
  'park.release': 'Next step: None.',
  'operator.answers.wait': 'Next step: None.',
  'planning.position.a': 'Next step: Run consult-issue in slot A to write its independent planning position.',
  'planning.position.b': 'Next step: Run consult-issue in slot B to write its independent planning position.',
  'planning.rebuttal.round1.a': 'Next step: Run consult-issue in slot A to write its planning rebuttal.',
  'planning.rebuttal.round1.b': 'Next step: Run consult-issue in slot B to write its planning rebuttal.',
  'planning.rebuttal.round2.classify': 'Next step: Run consult-issue to synthesize the planning phase.',
  'planning.rebuttal.round2.a': 'Next step: Run consult-issue in slot A to write its planning rebuttal.',
  'planning.rebuttal.round2.b': 'Next step: Run consult-issue in slot B to write its planning rebuttal.',
  'planning.synthesize': 'Next step: Run consult-issue to synthesize the planning phase.',
  'planning.approve': 'Next step: Approve the planning synthesis to begin implementation planning.',
  'implementation.position.a': 'Next step: Run consult-issue in slot A to write its independent implementation position.',
  'implementation.position.b': 'Next step: Run consult-issue in slot B to write its independent implementation position.',
  'implementation.rebuttal.round1.a': 'Next step: Run consult-issue in slot A to write its implementation rebuttal.',
  'implementation.rebuttal.round1.b': 'Next step: Run consult-issue in slot B to write its implementation rebuttal.',
  'implementation.rebuttal.round2.classify': 'Next step: Run consult-issue to synthesize the implementation phase.',
  'implementation.rebuttal.round2.a': 'Next step: Run consult-issue in slot A to write its implementation rebuttal.',
  'implementation.rebuttal.round2.b': 'Next step: Run consult-issue in slot B to write its implementation rebuttal.',
  'implementation.synthesize': 'Next step: Run consult-issue to synthesize the implementation phase.',
  'implementation.approve': 'Next step: Approve the implementation synthesis to make the issue execution-ready.',
  'fidelity.audit': 'Next step: Run consult-issue to audit implementation-plan fidelity.',
  'fidelity.repair': 'Next step: Run consult-issue to synthesize the implementation phase.',
  'fidelity.operator-direction': 'Next step: None.',
  'implementation.execute': 'Next step: Run implement-issue to execute the implementation plan.',
  'check.review': 'Next step: Run check-issue to review the implementation.',
  'repair.execute': 'Next step: Run implement-issue to execute the implementation plan.',
  'merge.approve': 'Next step: None.',
  'merge.execute': 'Next step: Run merge-issue to merge and clean up the issue.',
  'merge.shared-logic-hold': 'Next step: None.'
};

export const legalRunStatusSuccessors: Record<IssuePhase, readonly RunStatusToken[]> = {
  'P-draft': [
    'park.hold',
    'park.release',
    'operator.answers.wait',
    'planning.position.a',
    'planning.position.b',
    'planning.rebuttal.round1.a',
    'planning.rebuttal.round1.b',
    'planning.rebuttal.round2.classify',
    'planning.rebuttal.round2.a',
    'planning.rebuttal.round2.b',
    'planning.synthesize',
    'planning.approve'
  ],
  'P-synth': ['operator.answers.wait', 'planning.approve', 'implementation.position.a', 'implementation.position.b'],
  'I-draft': [
    'operator.answers.wait',
    'implementation.position.a',
    'implementation.position.b',
    'implementation.rebuttal.round1.a',
    'implementation.rebuttal.round1.b',
    'implementation.rebuttal.round2.classify',
    'implementation.rebuttal.round2.a',
    'implementation.rebuttal.round2.b',
    'implementation.synthesize',
    'implementation.approve',
    'fidelity.audit'
  ],
  'I-synth': ['operator.answers.wait', 'implementation.synthesize', 'implementation.approve', 'fidelity.audit', 'fidelity.repair', 'fidelity.operator-direction', 'implementation.execute'],
  'I-ready': ['operator.answers.wait', 'implementation.execute', 'check.review'],
  'C-ready': ['operator.answers.wait', 'check.review', 'repair.execute', 'merge.approve', 'merge.execute'],
  'C-fix': ['operator.answers.wait', 'check.review', 'repair.execute', 'merge.approve', 'merge.execute'],
  'D-merge': ['operator.answers.wait', 'merge.execute', 'merge.shared-logic-hold']
};

const RUN_STATUS_FILE_NAME = 'run-status.yaml';
const RUN_STATUS_SLOTS: readonly RunStatusSlot[] = ['a', 'b'];
const RUN_STATUS_MERGE_VERDICTS: readonly RunStatusMergeVerdict[] = ['merge-ready', 'not-yet-merge-ready'];

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

function assertExactKeys(record: YamlMap, allowedKeys: readonly string[], field: string): void {
  const unexpectedKey = Object.keys(record).find((key) => !allowedKeys.includes(key));
  if (unexpectedKey !== undefined) throw new Error(`Unexpected field ${field}.${unexpectedKey}`);
}

function asString(value: YamlNode, field: string): string {
  if (typeof value === 'string') return value;
  throw new Error(`Expected ${field} to be a string`);
}

function asBoolean(value: YamlNode, field: string): boolean {
  if (typeof value === 'boolean') return value;
  throw new Error(`Expected ${field} to be a boolean`);
}

function asPositiveInteger(value: YamlNode, field: string): number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  throw new Error(`Expected ${field} to be a positive integer`);
}

function asClosedString<T extends string>(value: YamlNode, field: string, allowedValues: readonly T[]): T {
  const raw = asString(value, field);
  if ((allowedValues as readonly string[]).includes(raw)) return raw as T;
  throw new Error(`Expected ${field} to be one of ${allowedValues.join(', ')}`);
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

function parseOrchestratorGates(value: YamlNode, field: string): IssuesOrchestratorGates {
  const record = asMap(value, field);
  assertExactKeys(record, ['park_after_scaffold', 'planning_synth', 'implementation_synth', 'merge'], field);
  return {
    ...(record.park_after_scaffold === undefined ? {} : {
      park_after_scaffold: asClosedString(record.park_after_scaffold, `${field}.park_after_scaffold`, ['operator'] as const)
    }),
    ...(record.planning_synth === undefined ? {} : {
      planning_synth: asClosedString(record.planning_synth, `${field}.planning_synth`, ['operator'] as const)
    }),
    ...(record.implementation_synth === undefined ? {} : {
      implementation_synth: asClosedString(record.implementation_synth, `${field}.implementation_synth`, ['operator', 'auto'] as const)
    }),
    ...(record.merge === undefined ? {} : {
      merge: asClosedString(record.merge, `${field}.merge`, ['operator-release', 'auto-drain'] as const)
    })
  };
}

function parseStringRecord(value: YamlNode, field: string): Record<string, string> {
  const record = asMap(value, field);
  return Object.fromEntries(Object.entries(record).map(([key, entry]) => [key, asString(entry, `${field}.${key}`)]));
}

function parseOrchestratorGrammar(value: YamlNode, field: string): Record<string, IssuesOrchestratorGrammar> {
  const record = asMap(value, field);
  return Object.fromEntries(Object.entries(record).map(([runtime, entry]) => {
    const grammar = asMap(entry, `${field}.${runtime}`);
    assertExactKeys(grammar, ['invocation', 'clear_command'], `${field}.${runtime}`);
    return [runtime, {
      invocation: asString(grammar.invocation, `${field}.${runtime}.invocation`),
      clear_command: asString(grammar.clear_command, `${field}.${runtime}.clear_command`)
    }];
  }));
}

function parseContextCeiling(value: YamlNode, field: string): Record<string, number | 'auto'> {
  const record = asMap(value, field);
  return Object.fromEntries(Object.entries(record).map(([runtime, ceiling]) => [
    runtime,
    ceiling === 'auto' ? ('auto' as const) : asPositiveInteger(ceiling, `${field}.${runtime}`)
  ]));
}

function parseRebuttalRounds(value: YamlNode, field: string): OrchestratorRebuttalRounds {
  if (value === 1 || value === 2 || value === 'auto') return value;
  throw new Error(`Expected ${field} to be one of 1, 2, auto`);
}

function parseOrchestrator(value: YamlNode, field = 'orchestrator'): IssuesOrchestrator {
  const record = asMap(value, field);
  assertExactKeys(record, ['enabled', 'rebuttal_rounds', 'gates', 'prompts', 'grammar', 'context_ceiling', 'c_fix_loop_cap'], field);
  return {
    ...(record.enabled === undefined ? {} : { enabled: asBoolean(record.enabled, `${field}.enabled`) }),
    ...(record.rebuttal_rounds === undefined ? {} : { rebuttal_rounds: parseRebuttalRounds(record.rebuttal_rounds, `${field}.rebuttal_rounds`) }),
    ...(record.gates === undefined ? {} : { gates: parseOrchestratorGates(record.gates, `${field}.gates`) }),
    ...(record.prompts === undefined ? {} : { prompts: parseStringRecord(record.prompts, `${field}.prompts`) }),
    ...(record.grammar === undefined ? {} : { grammar: parseOrchestratorGrammar(record.grammar, `${field}.grammar`) }),
    ...(record.context_ceiling === undefined ? {} : { context_ceiling: parseContextCeiling(record.context_ceiling, `${field}.context_ceiling`) }),
    ...(record.c_fix_loop_cap === undefined ? {} : { c_fix_loop_cap: asPositiveInteger(record.c_fix_loop_cap, `${field}.c_fix_loop_cap`) })
  };
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
    ...(record.broadcast === undefined ? {} : { broadcast: parseBroadcast(record.broadcast, `${filePath}.broadcast`) }),
    ...(record.orchestrator === undefined ? {} : { orchestrator: parseOrchestrator(record.orchestrator, `${filePath}.orchestrator`) })
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
  return process.env.LIFECYCLE_EXEC_ROOT === undefined
    ? path.resolve(__dirname, '../..')
    : path.resolve(process.env.LIFECYCLE_EXEC_ROOT);
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

type RunStatusLocator =
  | { target: 'shorthand'; slug: string }
  | { target: 'issue'; slug: string }
  | { target: 'series'; series: string; leaf: string };

interface RunStatusTargetRequest {
  execRoot: string;
  locator: RunStatusLocator;
}

interface RunStatusMutationRequest {
  target: RunStatusTarget;
  requireExisting: boolean;
  mutate: (current: RunStatus | undefined) => RunStatus;
}

interface RunStatusNextStepWriteRequest extends RunStatusTargetRequest {
  nextStep: RunStatusToken;
}

interface RunStatusMergeVerdictWriteRequest extends RunStatusTargetRequest {
  slot: RunStatusSlot;
  verdict: RunStatusMergeVerdict;
}

const RUN_STATUS_LOCK_TIMEOUT_MS = 5_000;
const RUN_STATUS_LOCK_RETRY_MS = 25;
const RUN_STATUS_HOOK_DIR_ENV = 'LIFECYCLE_RUN_STATUS_HOOK_DIR';
const RUN_STATUS_HOOK_TAG_ENV = 'LIFECYCLE_RUN_STATUS_HOOK_TAG';
const RUN_STATUS_HOOK_STAGE_ENV = 'LIFECYCLE_RUN_STATUS_HOOK_STAGE';

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

function resolveRunStatusPhase(execRoot: string, locator: RunStatusLocator): IssuePhaseRead | SeriesLeafPhaseRead {
  if (locator.target === 'shorthand') return resolveSlug(execRoot, locator.slug);
  return locator.target === 'issue'
    ? readIssuePhase(execRoot, locator.slug)
    : readSeriesLeafPhase(execRoot, locator.series, locator.leaf);
}

function asRunStatusToken(value: YamlNode, field: string): RunStatusToken {
  return asClosedString(value, field, RUN_STATUS_TOKENS);
}

function asRunStatusSlot(value: string, field: string): RunStatusSlot {
  if ((RUN_STATUS_SLOTS as readonly string[]).includes(value)) return value as RunStatusSlot;
  throw new Error(`Expected ${field} to be one of ${RUN_STATUS_SLOTS.join(', ')}`);
}

function asRunStatusMergeVerdict(value: YamlNode, field: string): RunStatusMergeVerdict {
  return asClosedString(value, field, RUN_STATUS_MERGE_VERDICTS);
}

function parseRunStatusMergeVerdicts(value: YamlNode, field: string): RunStatusMergeVerdicts {
  const record = asMap(value, field);
  assertExactKeys(record, RUN_STATUS_SLOTS, field);
  return {
    ...(record.a === undefined ? {} : { a: asRunStatusMergeVerdict(record.a, `${field}.a`) }),
    ...(record.b === undefined ? {} : { b: asRunStatusMergeVerdict(record.b, `${field}.b`) })
  };
}

export function parseRunStatus(raw: string, filePath = RUN_STATUS_FILE_NAME): RunStatus {
  const record = loadYamlMap(raw, filePath);
  assertExactKeys(record, ['next_step', 'merge_verdicts'], filePath);
  return {
    next_step: asRunStatusToken(record.next_step, `${filePath}.next_step`),
    ...(record.merge_verdicts === undefined ? {} : {
      merge_verdicts: parseRunStatusMergeVerdicts(record.merge_verdicts, `${filePath}.merge_verdicts`)
    })
  };
}

function assertLegalRunStatusSuccessor(phase: IssuePhase, nextStep: RunStatusToken, field: string): void {
  if (legalRunStatusSuccessors[phase].includes(nextStep)) return;
  throw new Error(`Illegal run-status successor ${JSON.stringify({ field, phase, next_step: nextStep })}`);
}

interface RunStatusTarget {
  controlRoot: string;
  slug: string;
  phase: IssuePhase;
  filePath: string;
  repoPath: string;
  resolved: IssuePhaseRead | SeriesLeafPhaseRead;
}

function runStatusTerminalSentence(token: RunStatusToken): string {
  return RUN_STATUS_SENTENCES[token];
}

function absentRunStatusRead(target: RunStatusTarget): AbsentRunStatusRead {
  return {
    slug: target.slug,
    phase: target.phase,
    runStatusFilePath: target.repoPath,
    statusState: 'absent',
    status: null,
    terminalSentence: null
  };
}

function presentRunStatusRead(target: RunStatusTarget, status: RunStatus): PresentRunStatusRead {
  return {
    slug: target.slug,
    phase: target.phase,
    runStatusFilePath: target.repoPath,
    statusState: 'present',
    status,
    terminalSentence: runStatusTerminalSentence(status.next_step)
  };
}

function artifactRootRepoPath(controlRoot: string, artifactRepoPath: string): string {
  return fs.statSync(path.join(controlRoot, artifactRepoPath)).isDirectory()
    ? artifactRepoPath
    : normalizeRepoPath(path.dirname(artifactRepoPath));
}

function resolveRunStatusArtifactRoot(execRoot: string, resolved: IssuePhaseRead | SeriesLeafPhaseRead): string {
  const controlRoot = resolveControlRoot(execRoot, readConfig(execRoot));
  const config = readConfig(controlRoot);
  return resolved.target === 'issue'
    ? normalizeRepoPath(issueDir(config, resolved.slug))
    : resolveSeriesLeafArtifact(controlRoot, config, resolved.series, resolved.leaf).repoPath;
}

function resolveRunStatusTarget(request: RunStatusTargetRequest): RunStatusTarget {
  const resolved = resolveRunStatusPhase(request.execRoot, request.locator);
  const controlRoot = resolveControlRoot(request.execRoot, readConfig(request.execRoot));
  const artifactRoot = artifactRootRepoPath(controlRoot, resolveRunStatusArtifactRoot(request.execRoot, resolved));
  const repoPath = normalizeRepoPath(path.join(artifactRoot, RUN_STATUS_FILE_NAME));
  return {
    controlRoot,
    slug: resolved.target === 'issue' ? resolved.slug : resolved.leaf,
    phase: resolved.phase,
    filePath: path.join(controlRoot, repoPath),
    repoPath,
    resolved
  };
}

function readExistingRunStatusTarget(target: RunStatusTarget): PresentRunStatusRead {
  const status = parseRunStatus(fs.readFileSync(target.filePath, 'utf8'), target.repoPath);
  assertLegalRunStatusSuccessor(target.phase, status.next_step, `${target.repoPath}.next_step`);
  return presentRunStatusRead(target, status);
}

function readRunStatusTarget(target: RunStatusTarget, allowAbsent: boolean): RunStatusRead {
  if (!fs.existsSync(target.filePath)) {
    if (allowAbsent) return absentRunStatusRead(target);
    throw new Error(`Expected run status ${target.repoPath}`);
  }
  return readExistingRunStatusTarget(target);
}

function readRunStatusByTargetRequest(request: RunStatusTargetRequest, allowAbsent: boolean): RunStatusRead {
  return readRunStatusTarget(resolveRunStatusTarget(request), allowAbsent);
}

export function readRunStatus(execRoot: string, slug: string): RunStatusRead {
  return readRunStatusByTargetRequest({ execRoot, locator: { target: 'shorthand', slug } }, true);
}

function runStatusToYamlMap(status: RunStatus): YamlMap {
  return {
    next_step: status.next_step,
    ...(status.merge_verdicts === undefined ? {} : {
      merge_verdicts: {
        ...(status.merge_verdicts.a === undefined ? {} : { a: status.merge_verdicts.a }),
        ...(status.merge_verdicts.b === undefined ? {} : { b: status.merge_verdicts.b })
      }
    })
  };
}

function writeRunStatusAtomic(filePath: string, status: RunStatus): void {
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporaryPath, formatYaml(runStatusToYamlMap(status)), 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function sleepMs(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function pauseForRunStatusHook(stage: string): void {
  if (process.env[RUN_STATUS_HOOK_STAGE_ENV] !== stage) return;
  const hookDir = process.env[RUN_STATUS_HOOK_DIR_ENV];
  const hookTag = process.env[RUN_STATUS_HOOK_TAG_ENV];
  if (hookDir === undefined || hookTag === undefined) return;
  const readyPath = path.join(hookDir, `${hookTag}.ready`);
  const releasePath = path.join(hookDir, `${hookTag}.release`);
  fs.writeFileSync(readyPath, stage, 'utf8');
  while (!fs.existsSync(releasePath)) sleepMs(RUN_STATUS_LOCK_RETRY_MS);
}

function withRunStatusLock<T>(target: RunStatusTarget, callback: () => T): T {
  const lockPath = `${target.filePath}.lock`;
  const startedAt = Date.now();
  while (true) {
    try {
      fs.mkdirSync(lockPath);
      break;
    } catch (error) {
      const lockError = error as NodeJS.ErrnoException;
      if (lockError.code !== 'EEXIST') throw error;
      if (Date.now() - startedAt >= RUN_STATUS_LOCK_TIMEOUT_MS) {
        throw new Error(`Timed out acquiring run-status lock ${JSON.stringify({ repoPath: target.repoPath, lockPath: normalizeRepoPath(lockPath), waitMs: Date.now() - startedAt })}`);
      }
      sleepMs(RUN_STATUS_LOCK_RETRY_MS);
    }
  }
  try {
    return callback();
  } finally {
    fs.rmdirSync(lockPath);
  }
}

function mutateRunStatus(request: RunStatusMutationRequest): PresentRunStatusRead {
  return withRunStatusLock(request.target, () => {
    const current = fs.existsSync(request.target.filePath)
      ? readExistingRunStatusTarget(request.target).status
      : undefined;
    if (request.requireExisting && current === undefined) {
      throw new Error(`Expected run status ${request.target.repoPath}`);
    }
    pauseForRunStatusHook('after-read');
    writeRunStatusAtomic(request.target.filePath, request.mutate(current));
    return readExistingRunStatusTarget(request.target);
  });
}

export function writeRunStatusNextStep(request: RunStatusNextStepWriteRequest): PresentRunStatusRead {
  const target = resolveRunStatusTarget(request);
  return mutateRunStatus({
    target,
    requireExisting: false,
    mutate: (current) => {
      assertLegalRunStatusSuccessor(target.phase, request.nextStep, `${target.repoPath}.next_step`);
      const freshCheckCycle = request.nextStep === 'check.review'
        && (current?.next_step === 'repair.execute' || current?.next_step === 'implementation.execute');
      return {
        next_step: request.nextStep,
        ...(current?.merge_verdicts === undefined || freshCheckCycle ? {} : { merge_verdicts: current.merge_verdicts })
      };
    }
  });
}

function isDualMergeReady(verdicts: RunStatusMergeVerdicts): boolean {
  return verdicts.a === 'merge-ready' && verdicts.b === 'merge-ready';
}

function advanceDualMergeReadyPhase(target: RunStatusTarget): void {
  // Idempotency guard for concurrent verdict writers racing past the pre-lock phase read.
  if (target.resolved.target === 'issue') {
    if (readIssuePhase(target.controlRoot, target.resolved.slug).phase === 'D-merge') return;
    writeIssuePhase(target.controlRoot, target.resolved.slug, 'D-merge');
    return;
  }
  if (readSeriesLeafPhase(target.controlRoot, target.resolved.series, target.resolved.leaf).phase === 'D-merge') return;
  transitionSeriesLeaf(target.controlRoot, readConfig(target.controlRoot), target.resolved.series, target.resolved.leaf, 'D-merge');
}

export function writeRunStatusMergeVerdict(request: RunStatusMergeVerdictWriteRequest): PresentRunStatusRead {
  const target = resolveRunStatusTarget(request);
  const written = mutateRunStatus({
    target,
    requireExisting: true,
    mutate: (current) => {
      if (current === undefined) throw new Error(`Expected run status ${target.repoPath}`);
      if (target.phase !== 'C-ready' && target.phase !== 'C-fix') {
        throw new Error(`Illegal run-status merge verdict ${JSON.stringify({ phase: target.phase, slot: request.slot, verdict: request.verdict })}`);
      }
      const mergeVerdicts: RunStatusMergeVerdicts = { ...current.merge_verdicts, [request.slot]: request.verdict };
      return {
        next_step: isDualMergeReady(mergeVerdicts) ? 'merge.execute' : current.next_step,
        merge_verdicts: mergeVerdicts
      };
    }
  });
  const mergeVerdicts = written.status.merge_verdicts;
  if (mergeVerdicts === undefined || !isDualMergeReady(mergeVerdicts)) return written;
  advanceDualMergeReadyPhase(target);
  return readExistingRunStatusTarget(resolveRunStatusTarget(request));
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
  'orchestrator:',
  '  enabled: true',
  '  rebuttal_rounds: auto',
  '  gates:',
  '    park_after_scaffold: operator',
  '    planning_synth: operator',
  '    implementation_synth: auto',
  '    merge: operator-release',
  '  prompts:',
  '    planning_position: "{skill} {phase_folder}"',
  '  grammar:',
  '    claude:',
  '      invocation: "/{skill}"',
  '      clear_command: "/clear"',
  '    pi:',
  '      invocation: "skill:{skill}"',
  '      clear_command: "/new"',
  '  context_ceiling:',
  '    claude: 200000',
  '    pi: 200000',
  '  c_fix_loop_cap: 3',
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

function runIssueParsingCoreSelfTests(): void {
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
}

function runConfigRoundTripSelfTests(): void {
  const config = parseIssuesConfig(fixtureConfigYaml, 'fixture-config.yaml');
  assert(config.grounding !== 'none' && config.grounding.index === '.claude/docs/reference-index.md', 'expected grounding config round-trip');
  assert(config.grounding !== 'none' && config.grounding.surfaces?.join('|') === 'issues/.scripts/lifecycle.ts|issues/config.yaml', 'expected grounding surfaces round-trip');
  assert(config.broadcast?.discord.webhook_env.join('|') === 'DISCORD_WEBHOOK_URL', 'expected broadcast webhook env round-trip');
  assert(config.orchestrator?.enabled === true && config.orchestrator.rebuttal_rounds === 'auto', 'expected orchestrator scalar config round-trip');
  assert(config.orchestrator?.gates?.park_after_scaffold === 'operator' && config.orchestrator.gates.merge === 'operator-release', 'expected all orchestrator gates to parse');
  assert(config.orchestrator?.prompts?.planning_position === '{skill} {phase_folder}', 'expected orchestrator prompts to parse');
  assert(config.orchestrator?.grammar?.claude.invocation === '/{skill}' && config.orchestrator.grammar.pi.clear_command === '/new', 'expected runtime grammar to parse');
  assert(config.orchestrator?.context_ceiling?.claude === 200000 && config.orchestrator.c_fix_loop_cap === 3, 'expected orchestrator limits to parse');
  const autoCeilingConfig = parseIssuesConfig(fixtureConfigYaml.replace('claude: 200000', 'claude: auto'), 'auto-ceiling-config.yaml');
  assert(autoCeilingConfig.orchestrator?.context_ceiling?.claude === 'auto' && autoCeilingConfig.orchestrator.context_ceiling.pi === 200000, 'expected an auto context ceiling to parse alongside numeric ones');
  const partialOrchestratorConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  enabled: false\n', 'partial-orchestrator-config.yaml');
  assert(partialOrchestratorConfig.orchestrator?.enabled === false && partialOrchestratorConfig.orchestrator.gates === undefined, 'expected partial orchestrator config to parse');
  const alternateOrchestratorConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  rebuttal_rounds: 2\n  gates:\n    implementation_synth: operator\n    merge: auto-drain\n', 'alternate-orchestrator-config.yaml');
  assert(alternateOrchestratorConfig.orchestrator?.rebuttal_rounds === 2 && alternateOrchestratorConfig.orchestrator.gates?.implementation_synth === 'operator' && alternateOrchestratorConfig.orchestrator.gates.merge === 'auto-drain', 'expected alternate orchestrator enum values to parse');
  assert(parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nunrelated_top_level: tolerated\n', 'unknown-top-level-config.yaml').orchestrator === undefined, 'expected unrelated top-level config keys to remain tolerated');
  assert(config.branch_prefix === 'worktree-', 'expected config round-trip');
}

function runConfigValidationSelfTests(): void {
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  misspelled_gate: operator\n', 'unknown-orchestrator-config.yaml'), 'unknown-orchestrator-config.yaml.orchestrator.misspelled_gate');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  gates:\n    planning_syth: operator\n', 'unknown-gate-config.yaml'), 'unknown-gate-config.yaml.orchestrator.gates.planning_syth');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  gates:\n    merge: immediate\n', 'bad-gate-enum-config.yaml'), 'bad-gate-enum-config.yaml.orchestrator.gates.merge');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\norchestrator:\n  rebuttal_rounds: 3\n', 'bad-rebuttal-enum-config.yaml'), 'bad-rebuttal-enum-config.yaml.orchestrator.rebuttal_rounds');
  assert(parseWorktreePorcelain(process.cwd()).length >= 1, 'expected porcelain parser to return at least one worktree for current checkout');
}

function runGroundingAndBroadcastParsingSelfTests(): void {
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
  assert(parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\n', 'no-orchestrator-config.yaml').orchestrator === undefined, 'expected absent orchestrator config to parse as undefined');
  const multiWebhookConfig = parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env:\n      - DISCORD_WEBHOOK_URL_1\n      - DISCORD_WEBHOOK_URL_2\n', 'multi-webhook-config.yaml');
  assert(multiWebhookConfig.broadcast?.discord.webhook_env.join('|') === 'DISCORD_WEBHOOK_URL_1|DISCORD_WEBHOOK_URL_2', 'expected multi-webhook broadcast config to parse in order');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast: {}\n', 'missing-discord-config.yaml'), 'missing-discord-config.yaml.broadcast.discord');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env: []\n', 'empty-webhook-env-config.yaml'), 'empty-webhook-env-config.yaml.broadcast.discord.webhook_env');
  assertThrows(() => parseIssuesConfig('issues_root: issues\nscripts_dir: issues/.scripts\nworktree_root: issues/worktrees\nbranch_prefix: worktree-\ngrounding: none\nbroadcast:\n  discord:\n    webhook_env: DISCORD_WEBHOOK_URL\n', 'scalar-webhook-env-config.yaml'), 'scalar-webhook-env-config.yaml.broadcast.discord.webhook_env');
}

function runParsingSelfTests(): void {
  runIssueParsingCoreSelfTests();
  runConfigRoundTripSelfTests();
  runConfigValidationSelfTests();
  runGroundingAndBroadcastParsingSelfTests();
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

function runRunStatusSentenceSelfTests(): void {
  assert(Object.keys(RUN_STATUS_SENTENCES).sort().join('|') === [...RUN_STATUS_TOKENS].sort().join('|'), 'expected every run-status token to have one sentence mapping');
  assert(Object.values(RUN_STATUS_SENTENCES).every((sentence) => (RUN_STATUS_ALLOWED_SENTENCES as readonly string[]).includes(sentence)), 'expected every run-status sentence to reuse an existing exact skill sentence');
  assert(Object.values(RUN_STATUS_SENTENCES).every((sentence) => sentence.startsWith('Next step: ')), 'expected every run-status sentence to use terminal Next step syntax');
  assert(new Set(Object.values(legalRunStatusSuccessors).flat()).size === RUN_STATUS_TOKENS.length, 'expected every run-status token to be legal in at least one macro phase');
  assert(legalRunStatusSuccessors['I-draft'].includes('implementation.approve'), 'expected I-draft to allow implementation approval');
  assert(legalRunStatusSuccessors['I-synth'].includes('implementation.approve'), 'expected I-synth to allow implementation approval');
  assert(runStatusTerminalSentence('implementation.approve') === 'Next step: Approve the implementation synthesis to make the issue execution-ready.', 'expected implementation approval to reuse the exact implementation approval sentence');
}

function runRunStatusPathSelfTests(): void {
  const fixture = createFixtureRepo();
  createIssueState(fixture.root, 'status-standalone', fixture.created);
  createIssueState(fixture.root, 'missing-status-root', fixture.created);
  const standaloneStatus = writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'status-standalone' }, nextStep: 'planning.position.a' });
  const seriesStatus = writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'folder' }, nextStep: 'planning.position.b' });
  assert(standaloneStatus.statusState === 'present' && standaloneStatus.runStatusFilePath === 'issues/open/status-standalone/run-status.yaml', 'expected standalone run status inside the issue artifact root');
  assert(seriesStatus.statusState === 'present' && seriesStatus.runStatusFilePath === 'issues/open/series/02-folder/02p-folder/run-status.yaml', 'expected series run status inside the leaf artifact root');
  assert(standaloneStatus.terminalSentence === RUN_STATUS_SENTENCES['planning.position.a'], 'expected status read to expose the mapped sentence');
  const writtenStatusMap = loadYamlMap(fs.readFileSync(path.join(fixture.root, standaloneStatus.runStatusFilePath), 'utf8'), standaloneStatus.runStatusFilePath);
  assert(writtenStatusMap.version === undefined && writtenStatusMap.schema_version === undefined, 'expected run status to carry no schema version field');
  assert(fs.readdirSync(path.dirname(path.join(fixture.root, standaloneStatus.runStatusFilePath))).every((name) => !name.includes('.tmp-')), 'expected atomic writer to leave no sibling temporary file');
  assert(JSON.stringify(readRunStatus(fixture.root, 'missing-status-root')) === JSON.stringify({ slug: 'missing-status-root', phase: 'P-draft', runStatusFilePath: 'issues/open/missing-status-root/run-status.yaml', statusState: 'absent', status: null, terminalSentence: null }), 'expected absent status-read to return a structured absent result');
}

function runRunStatusValidationSelfTests(): void {
  const fixture = createFixtureRepo();
  createIssueState(fixture.root, 'status-standalone', fixture.created);
  const standaloneStatus = writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'status-standalone' }, nextStep: 'planning.position.a' });
  assertThrows(() => writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'status-standalone' }, nextStep: 'merge.execute' }), 'Illegal run-status successor');
  writeFixtureFile(fixture.root, standaloneStatus.runStatusFilePath, 'next_step: 7\n');
  assertThrows(() => readRunStatus(fixture.root, 'status-standalone'), `${standaloneStatus.runStatusFilePath}.next_step`);
  createIssueState(fixture.root, 'stale-status', fixture.created);
  writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'stale-status' }, nextStep: 'planning.position.a' });
  writeIssuePhase(fixture.root, 'stale-status', 'P-synth');
  assertThrows(() => readRunStatus(fixture.root, 'stale-status'), 'Illegal run-status successor');
  assertThrows(() => writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'stale-status' }, nextStep: 'planning.approve' }), 'Illegal run-status successor');
}

function runRunStatusVerdictSelfTests(): void {
  const fixture = createFixtureRepo();
  writeFixtureFile(fixture.root, 'issues/open/verdict/state.yaml', `slug: verdict\nphase: I-ready\ncreated: '${fixture.created}'\n`);
  writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'verdict' }, nextStep: 'check.review' });
  writeIssuePhase(fixture.root, 'verdict', 'C-ready');
  writeRunStatusMergeVerdict({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'verdict' }, slot: 'a', verdict: 'merge-ready' });
  runCli(['status-verdict', 'verdict', 'b', 'not-yet-merge-ready'], fixture.root, () => undefined);
  let verdictOutput = '';
  runCli(['status-verdict', 'verdict', 'a', 'not-yet-merge-ready'], fixture.root, (message) => { verdictOutput = message; });
  const verdictStatus = readRunStatus(fixture.root, 'verdict');
  assert(verdictStatus.statusState === 'present' && verdictStatus.status.merge_verdicts?.a === 'not-yet-merge-ready' && verdictStatus.status.merge_verdicts.b === 'not-yet-merge-ready', 'expected slot verdict write to preserve the peer verdict');
  assert(verdictOutput === JSON.stringify(verdictStatus), 'expected status-verdict CLI to emit structured JSON with the mapped sentence');
  writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'verdict' }, nextStep: 'repair.execute' });
  const midCycle = readRunStatus(fixture.root, 'verdict');
  assert(midCycle.statusState === 'present' && midCycle.status.merge_verdicts?.a === 'not-yet-merge-ready', 'expected repair checkpoint to preserve recorded verdicts');
  writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'verdict' }, nextStep: 'check.review' });
  const freshCycle = readRunStatus(fixture.root, 'verdict');
  assert(freshCycle.statusState === 'present' && freshCycle.status.merge_verdicts === undefined, 'expected a fresh check cycle over a settled repair to clear recorded merge verdicts');
  writeFixtureFile(fixture.root, 'issues/open/dual-ready/state.yaml', `slug: dual-ready\nphase: I-ready\ncreated: '${fixture.created}'\n`);
  writeRunStatusNextStep({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'dual-ready' }, nextStep: 'check.review' });
  writeIssuePhase(fixture.root, 'dual-ready', 'C-ready');
  writeRunStatusMergeVerdict({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'dual-ready' }, slot: 'a', verdict: 'merge-ready' });
  const singleReady = readRunStatus(fixture.root, 'dual-ready');
  assert(singleReady.statusState === 'present' && singleReady.phase === 'C-ready' && singleReady.status.next_step === 'check.review', 'expected a single merge-ready verdict to leave phase and next step unchanged');
  let dualOutput = '';
  runCli(['status-verdict', 'dual-ready', 'b', 'merge-ready'], fixture.root, (message) => { dualOutput = message; });
  const dualStatus = readRunStatus(fixture.root, 'dual-ready');
  assert(dualStatus.statusState === 'present' && dualStatus.phase === 'D-merge' && dualStatus.status.next_step === 'merge.execute' && dualStatus.terminalSentence === RUN_STATUS_SENTENCES['merge.execute'], 'expected the completing merge-ready verdict to advance the issue to D-merge with merge.execute');
  assert(dualOutput === JSON.stringify(dualStatus), 'expected the completing status-verdict CLI output to carry the advanced phase');
  assertThrows(() => writeRunStatusMergeVerdict({ execRoot: fixture.root, locator: { target: 'shorthand', slug: 'dual-ready' }, slot: 'a', verdict: 'merge-ready' }), 'Illegal run-status merge verdict');
  createSeriesFixture({ root: fixture.root, series: 'dual-series', leaf: 'ready', created: fixture.created });
  execGit(fixture.root, ['add', '.']);
  execGit(fixture.root, ['commit', '-m', 'add dual-series fixture'], { ...process.env, GIT_AUTHOR_DATE: fixture.created, GIT_COMMITTER_DATE: fixture.created });
  advanceSeriesLeafToReady({ root: fixture.root, config: fixture.config, series: 'dual-series', leaf: 'ready' });
  runCli(['status-write', 'series', 'dual-series', 'ready', 'check.review'], fixture.root, () => undefined);
  transitionSeriesLeaf(fixture.root, fixture.config, 'dual-series', 'ready', 'C-ready');
  runCli(['status-verdict', 'series', 'dual-series', 'ready', 'b', 'merge-ready'], fixture.root, () => undefined);
  runCli(['status-verdict', 'series', 'dual-series', 'ready', 'a', 'merge-ready'], fixture.root, () => undefined);
  assert(readSeriesLeafPhase(fixture.root, 'dual-series', 'ready').phase === 'D-merge', 'expected the completing series verdict to advance the leaf to D-merge');
  const seriesDual = readRunStatusByTargetRequest({ execRoot: fixture.root, locator: { target: 'series', series: 'dual-series', leaf: 'ready' } }, false);
  assert(seriesDual.statusState === 'present' && seriesDual.status.next_step === 'merge.execute', 'expected the completing series verdict to set merge.execute');
}

function runRunStatusWorktreeCliSelfTests(): void {
  const fixture = createFixtureRepo();
  execGit(fixture.root, ['worktree', 'add', '-b', 'worktree-status', 'issues/worktrees/status', 'HEAD']);
  const worktreeRoot = path.join(fixture.root, 'issues', 'worktrees', 'status');
  createIssueState(fixture.root, 'absent-status', fixture.created);
  let absentOutput = '';
  runCli(['status-read', 'issue', 'absent-status'], worktreeRoot, (message) => { absentOutput = message; });
  assert(absentOutput === JSON.stringify({ slug: 'absent-status', phase: 'P-draft', runStatusFilePath: 'issues/open/absent-status/run-status.yaml', statusState: 'absent', status: null, terminalSentence: null }), 'expected status-read CLI to emit a structured absent result');
  let writeOutput = '';
  runCli(['status-write', 'folder', 'planning.position.a'], worktreeRoot, (message) => { writeOutput = message; });
  const controlStatusRepoPath = 'issues/open/series/02-folder/02p-folder/run-status.yaml';
  assert(writeOutput === JSON.stringify({ slug: 'folder', phase: 'P-draft', runStatusFilePath: controlStatusRepoPath, statusState: 'present', status: { next_step: 'planning.position.a' }, terminalSentence: RUN_STATUS_SENTENCES['planning.position.a'] }), 'expected status-write CLI to emit structured JSON');
  assert(fs.existsSync(path.join(fixture.root, controlStatusRepoPath)), 'expected worktree status write to land in the control root');
  assert(!fs.existsSync(path.join(worktreeRoot, controlStatusRepoPath)), 'expected worktree status write to leave the worktree copy untouched');
  let readOutput = '';
  runCli(['status-read', 'folder'], worktreeRoot, (message) => { readOutput = message; });
  assert(readOutput === writeOutput, 'expected status-read CLI to emit the current structured JSON');
}

interface SeriesFixtureRequest {
  root: string;
  series: string;
  leaf: string;
  created: string;
}

function createSeriesFixture(request: SeriesFixtureRequest): void {
  writeFixtureFile(request.root, `issues/open/${request.series}/state.yaml`, `series: ${request.series}\ncreated: '${request.created}'\nleaves:\n  ${request.leaf}: { phase: P-draft, created: '${request.created}' }\n`);
  writeFixtureFile(request.root, `issues/open/${request.series}/SERIES.md`, ['# series - Series Index', '', '| Order | Mode | Leaf   | File                         |', '|-------|------|--------|------------------------------|', `| 01    | p    | ${request.leaf} | \`01-${request.leaf}/01p-${request.leaf}/\` |`, ''].join('\n'));
  writeFixtureFile(request.root, `issues/open/${request.series}/01-${request.leaf}/01p-${request.leaf}/planning/plan.md`, '# Fixture\n');
}

function runRunStatusQualifiedTargetSelfTests(): void {
  const fixture = createFixtureRepo();
  createIssueState(fixture.root, 'folder', fixture.created);
  createSeriesFixture({ root: fixture.root, series: 'second-series', leaf: 'folder', created: fixture.created });
  assertThrows(() => runCli(['status-read', 'sample'], fixture.root), 'Expected exactly one candidate for sample');
  assertThrows(() => runCli(['status-write', 'folder', 'planning.position.a'], fixture.root), 'Expected exactly one candidate for folder');
  let issueRead = '';
  let seriesRead = '';
  runCli(['status-read', 'issue', 'sample'], fixture.root, (message) => { issueRead = message; });
  runCli(['status-read', 'series', 'series', 'sample'], fixture.root, (message) => { seriesRead = message; });
  assert(JSON.parse(issueRead).runStatusFilePath === 'issues/open/sample/run-status.yaml' && JSON.parse(seriesRead).runStatusFilePath === 'issues/open/series/01-sample/run-status.yaml', 'expected qualified status-read forms for issue and series targets');
  runCli(['status-write', 'series', 'second-series', 'folder', 'planning.position.a'], fixture.root, () => undefined);
  assert(fs.existsSync(path.join(fixture.root, 'issues/open/second-series/01-folder/01p-folder/run-status.yaml')), 'expected qualified series status-write to resolve a collided leaf');
  runCli(['status-write', 'issue', 'sample', 'check.review'], fixture.root, () => undefined);
  runCli(['status-write', 'series', 'series', 'sample', 'check.review'], fixture.root, () => undefined);
  writeIssuePhase(fixture.root, 'sample', 'C-ready');
  transitionSeriesLeaf(fixture.root, fixture.config, 'series', 'sample', 'C-ready');
  assertThrows(() => runCli(['status-verdict', 'sample', 'a', 'merge-ready'], fixture.root), 'Expected exactly one candidate for sample');
  runCli(['status-verdict', 'issue', 'sample', 'a', 'merge-ready'], fixture.root, () => undefined);
  runCli(['status-verdict', 'series', 'series', 'sample', 'b', 'not-yet-merge-ready'], fixture.root, () => undefined);
  assert(readRunStatusByTargetRequest({ execRoot: fixture.root, locator: { target: 'issue', slug: 'sample' } }, true).statusState === 'present', 'expected qualified issue verdict target to remain readable');
}

function runRunStatusSeriesCollisionSelfTests(): void {
  const fixture = createFixtureRepo();
  createSeriesFixture({ root: fixture.root, series: 'second-series', leaf: 'folder', created: fixture.created });
  execGit(fixture.root, ['add', '.']);
  execGit(fixture.root, ['commit', '-m', 'add colliding series fixture'], { ...process.env, GIT_AUTHOR_DATE: fixture.created, GIT_COMMITTER_DATE: fixture.created });
  runCli(['status-write', 'series', 'series', 'folder', 'planning.position.a'], fixture.root, () => undefined);
  runCli(['status-write', 'series', 'second-series', 'folder', 'planning.position.b'], fixture.root, () => undefined);
  assertThrows(() => runCli(['status-read', 'folder'], fixture.root), 'Expected exactly one candidate for folder');
  fs.rmSync(path.join(fixture.root, 'issues/open/series/02-folder/02p-folder/run-status.yaml'));
  fs.rmSync(path.join(fixture.root, 'issues/open/second-series/01-folder/01p-folder/run-status.yaml'));
  advanceSeriesLeafToReady({ root: fixture.root, config: fixture.config, series: 'series', leaf: 'folder' });
  advanceSeriesLeafToReady({ root: fixture.root, config: fixture.config, series: 'second-series', leaf: 'folder' });
  runCli(['status-write', 'series', 'series', 'folder', 'check.review'], fixture.root, () => undefined);
  runCli(['status-write', 'series', 'second-series', 'folder', 'check.review'], fixture.root, () => undefined);
  transitionSeriesLeaf(fixture.root, fixture.config, 'series', 'folder', 'C-ready');
  transitionSeriesLeaf(fixture.root, fixture.config, 'second-series', 'folder', 'C-ready');
  assertThrows(() => runCli(['status-verdict', 'folder', 'a', 'merge-ready'], fixture.root), 'Expected exactly one candidate for folder');
  runCli(['status-verdict', 'series', 'series', 'folder', 'a', 'merge-ready'], fixture.root, () => undefined);
  runCli(['status-verdict', 'series', 'second-series', 'folder', 'b', 'not-yet-merge-ready'], fixture.root, () => undefined);
}

const RUN_STATUS_CONCURRENCY_DRIVER = [
  "const { spawn } = require('child_process');",
  "const fs = require('fs');",
  "const path = require('path');",
  "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
  "const waitForFile = async (filePath, label) => {",
  "  const started = Date.now();",
  "  while (!fs.existsSync(filePath)) {",
  "    if (Date.now() - started > 5000) throw new Error(`timed out waiting for ${label}`);",
  "    await wait(25);",
  "  }",
  "};",
  "const waitForExit = (child, label) => new Promise((resolve, reject) => {",
  "  let stderr = '';",
  "  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });",
  "  child.on('exit', (code) => { code === 0 ? resolve() : reject(new Error(`${label} exited ${code}: ${stderr}`)); });",
  "});",
  "const spawnCli = (tag, args) => spawn(process.execPath, ['--no-install', process.env.LIFECYCLE_CONCURRENCY_SCRIPT_PATH, ...args], {",
  "  cwd: process.env.LIFECYCLE_CONCURRENCY_ROOT,",
  "  env: { ...process.env, LIFECYCLE_EXEC_ROOT: process.env.LIFECYCLE_CONCURRENCY_ROOT, LIFECYCLE_RUN_STATUS_HOOK_DIR: process.env.LIFECYCLE_CONCURRENCY_HOOK_DIR, LIFECYCLE_RUN_STATUS_HOOK_TAG: tag, LIFECYCLE_RUN_STATUS_HOOK_STAGE: 'after-read' },",
  "  stdio: ['ignore', 'ignore', 'pipe']",
  "});",
  "const readyPath = (tag) => path.join(process.env.LIFECYCLE_CONCURRENCY_HOOK_DIR, `${tag}.ready`);",
  "const release = (tag) => fs.writeFileSync(path.join(process.env.LIFECYCLE_CONCURRENCY_HOOK_DIR, `${tag}.release`), 'release', 'utf8');",
  "(async () => {",
  "  const firstTag = process.env.LIFECYCLE_CONCURRENCY_FIRST_TAG;",
  "  const secondTag = process.env.LIFECYCLE_CONCURRENCY_SECOND_TAG;",
  "  const first = spawnCli(firstTag, JSON.parse(process.env.LIFECYCLE_CONCURRENCY_FIRST_ARGS));",
  "  await waitForFile(readyPath(firstTag), 'first ready file');",
  "  const second = spawnCli(secondTag, JSON.parse(process.env.LIFECYCLE_CONCURRENCY_SECOND_ARGS));",
  "  await wait(150);",
  "  if (fs.existsSync(readyPath(secondTag))) throw new Error('expected second command to block on the run-status lock');",
  "  release(firstTag);",
  "  await waitForFile(readyPath(secondTag), 'second ready file');",
  "  release(secondTag);",
  "  await Promise.all([waitForExit(first, 'first'), waitForExit(second, 'second')]);",
  "})().catch((error) => { console.error(error instanceof Error ? error.stack ?? error.message : String(error)); process.exit(1); });"
].join('\n');

function runConcurrentRunStatusCliCommands(root: string, firstArgs: string[], secondArgs: string[]): void {
  const hookDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issues-run-status-lock-'));
  try {
    execFileSync('bun', ['-e', RUN_STATUS_CONCURRENCY_DRIVER], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        LIFECYCLE_CONCURRENCY_ROOT: root,
        LIFECYCLE_CONCURRENCY_SCRIPT_PATH: __filename,
        LIFECYCLE_CONCURRENCY_HOOK_DIR: hookDir,
        LIFECYCLE_CONCURRENCY_FIRST_TAG: 'first',
        LIFECYCLE_CONCURRENCY_SECOND_TAG: 'second',
        LIFECYCLE_CONCURRENCY_FIRST_ARGS: JSON.stringify(firstArgs),
        LIFECYCLE_CONCURRENCY_SECOND_ARGS: JSON.stringify(secondArgs)
      }
    });
  } finally {
    fs.rmSync(hookDir, { recursive: true, force: true });
  }
}

function runRunStatusConcurrencySelfTests(): void {
  const verdictFixture = createFixtureRepo();
  createIssueState(verdictFixture.root, 'locked-verdict', verdictFixture.created);
  advanceIssueToReady(verdictFixture.root, 'locked-verdict');
  writeRunStatusNextStep({ execRoot: verdictFixture.root, locator: { target: 'shorthand', slug: 'locked-verdict' }, nextStep: 'check.review' });
  writeIssuePhase(verdictFixture.root, 'locked-verdict', 'C-ready');
  runConcurrentRunStatusCliCommands(verdictFixture.root, ['status-verdict', 'locked-verdict', 'a', 'merge-ready'], ['status-verdict', 'locked-verdict', 'b', 'not-yet-merge-ready']);
  const verdictStatus = readRunStatus(verdictFixture.root, 'locked-verdict');
  assert(verdictStatus.statusState === 'present' && verdictStatus.status.merge_verdicts?.a === 'merge-ready' && verdictStatus.status.merge_verdicts.b === 'not-yet-merge-ready', 'expected concurrent verdict writers to preserve both slots');

  const nextStepFixture = createFixtureRepo();
  createIssueState(nextStepFixture.root, 'locked-next-step', nextStepFixture.created);
  advanceIssueToReady(nextStepFixture.root, 'locked-next-step');
  writeRunStatusNextStep({ execRoot: nextStepFixture.root, locator: { target: 'shorthand', slug: 'locked-next-step' }, nextStep: 'check.review' });
  writeIssuePhase(nextStepFixture.root, 'locked-next-step', 'C-ready');
  runConcurrentRunStatusCliCommands(nextStepFixture.root, ['status-verdict', 'locked-next-step', 'a', 'merge-ready'], ['status-write', 'locked-next-step', 'merge.approve']);
  const nextStepStatus = readRunStatus(nextStepFixture.root, 'locked-next-step');
  assert(nextStepStatus.statusState === 'present' && nextStepStatus.status.next_step === 'merge.approve' && nextStepStatus.status.merge_verdicts?.a === 'merge-ready', 'expected concurrent next-step writes to preserve newer verdict data');
}

function runRunStatusSelfTests(): void {
  runRunStatusSentenceSelfTests();
  runRunStatusPathSelfTests();
  runRunStatusValidationSelfTests();
  runRunStatusVerdictSelfTests();
  runRunStatusWorktreeCliSelfTests();
  runRunStatusQualifiedTargetSelfTests();
  runRunStatusSeriesCollisionSelfTests();
  runRunStatusConcurrencySelfTests();
  assertThrows(() => runCli(['status-read'], createFixtureRepo().root), 'Usage: lifecycle.ts status-read <slug> OR lifecycle.ts status-read issue <slug> OR lifecycle.ts status-read series <series> <leaf>');
  assertThrows(() => runCli(['status-write', 'folder', 'merge.execute'], createFixtureRepo().root), 'Illegal run-status successor');
  assertThrows(() => runCli(['status-verdict', 'folder', 'c', 'merge-ready'], createFixtureRepo().root), 'Usage: lifecycle.ts status-verdict <slug> <a|b> <merge-ready|not-yet-merge-ready> OR lifecycle.ts status-verdict issue <slug> <a|b> <merge-ready|not-yet-merge-ready> OR lifecycle.ts status-verdict series <series> <leaf> <a|b> <merge-ready|not-yet-merge-ready>');
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

function advanceIssueToReady(root: string, slug: string): void {
  writeIssuePhase(root, slug, 'P-synth');
  writeIssuePhase(root, slug, 'I-draft');
  writeIssuePhase(root, slug, 'I-synth');
  writeIssuePhase(root, slug, 'I-ready');
}

interface SeriesAdvanceToReadyRequest {
  root: string;
  config: IssuesConfig;
  series: string;
  leaf: string;
}

function advanceSeriesLeafToReady(request: SeriesAdvanceToReadyRequest): void {
  transitionSeriesLeaf(request.root, request.config, request.series, request.leaf, 'P-synth');
  transitionSeriesLeaf(request.root, request.config, request.series, request.leaf, 'I-draft');
  transitionSeriesLeaf(request.root, request.config, request.series, request.leaf, 'I-synth');
  transitionSeriesLeaf(request.root, request.config, request.series, request.leaf, 'I-ready');
}

function runRunStatusCheckpointSelfTests(): void {
  const issueFixture = createFixtureRepo();
  createIssueState(issueFixture.root, 'checkpoint-status', issueFixture.created);
  advanceIssueToReady(issueFixture.root, 'checkpoint-status');
  writeFixtureFile(issueFixture.root, 'issues/open/checkpoint-status/implementation/plan.md', '# Checkpoint status\n');
  writeRunStatusNextStep({ execRoot: issueFixture.root, locator: { target: 'shorthand', slug: 'checkpoint-status' }, nextStep: 'check.review' });
  const issueInitialCommit = execGitText(issueFixture.root, ['rev-parse', 'HEAD']);
  runCli(['transition', 'issue', 'checkpoint-status', 'C-ready', '--message', 'checkpoint standalone run status'], issueFixture.root, () => undefined);
  assert(execGitText(issueFixture.root, ['rev-list', '--count', `${issueInitialCommit}..HEAD`]) === '1', 'expected standalone run-status transition to add one checkpoint commit');
  assert(execGitText(issueFixture.root, ['show', '--name-only', '--format=', 'HEAD']).split('\n').filter((line) => line.length > 0).sort().join(',') === 'issues/open/checkpoint-status/implementation/plan.md,issues/open/checkpoint-status/run-status.yaml,issues/open/checkpoint-status/state.yaml', 'expected standalone transition checkpoint to capture run-status.yaml');

  const seriesFixture = createFixtureRepo();
  execGit(seriesFixture.root, ['worktree', 'add', '-b', 'worktree-checkpoint-status', 'issues/worktrees/checkpoint-status', 'HEAD']);
  const seriesWorktreeRoot = path.join(seriesFixture.root, 'issues', 'worktrees', 'checkpoint-status');
  fs.rmSync(path.join(seriesFixture.root, 'issues', 'open', 'sample'), { recursive: true });
  writeFixtureFile(seriesFixture.root, 'issues/open/series/02-folder/02p-folder/implementation/plan.md', '# Dirty folder sibling\n');
  runCli(['status-write', 'sample', 'check.review'], seriesWorktreeRoot, () => undefined);
  const singularInitialCommit = execGitText(seriesFixture.root, ['rev-parse', 'HEAD']);
  runCli(['transition', 'series', 'series', 'sample', 'C-ready', '--message', 'checkpoint singular series run status'], seriesWorktreeRoot, () => undefined);
  assert(execGitText(seriesFixture.root, ['rev-list', '--count', `${singularInitialCommit}..HEAD`]) === '1', 'expected singular series run-status transition to add one checkpoint commit');
  assert(execGitText(seriesFixture.root, ['show', '--name-only', '--format=', 'HEAD']).split('\n').filter((line) => line.length > 0).sort().join(',') === 'issues/open/series/01-sample/run-status.yaml,issues/open/series/state.yaml', 'expected singular series transition checkpoint to capture run-status.yaml from the artifact root');
  assert(execGitText(seriesFixture.root, ['status', '--short', '--', 'issues/open/series/02-folder/02p-folder/implementation/plan.md']).length > 0, 'expected singular series run-status checkpoint to leave a folder sibling dirty');

  advanceSeriesLeafToReady({ root: seriesFixture.root, config: seriesFixture.config, series: 'series', leaf: 'folder' });
  advanceSeriesLeafToReady({ root: seriesWorktreeRoot, config: readConfig(seriesWorktreeRoot), series: 'series', leaf: 'folder' });
  writeFixtureFile(seriesFixture.root, 'issues/open/series/02-folder/02p-folder/implementation/plan.md', '# Series checkpoint status\n');
  writeFixtureFile(seriesFixture.root, 'issues/open/series/01-sample/01s-sample.md', '# Dirty sibling\n');
  runCli(['status-write', 'folder', 'check.review'], seriesWorktreeRoot, () => undefined);
  const seriesInitialCommit = execGitText(seriesFixture.root, ['rev-parse', 'HEAD']);
  runCli(['transition', 'series', 'series', 'folder', 'C-ready', '--message', 'checkpoint series run status'], seriesWorktreeRoot, () => undefined);
  assert(execGitText(seriesFixture.root, ['rev-list', '--count', `${seriesInitialCommit}..HEAD`]) === '1', 'expected series run-status transition to add one checkpoint commit');
  assert(execGitText(seriesFixture.root, ['show', '--name-only', '--format=', 'HEAD']).split('\n').filter((line) => line.length > 0).sort().join(',') === 'issues/open/series/02-folder/02p-folder/implementation/plan.md,issues/open/series/02-folder/02p-folder/run-status.yaml,issues/open/series/state.yaml', 'expected series transition checkpoint to capture run-status.yaml');
  assert(execGitText(seriesFixture.root, ['status', '--short', '--', 'issues/open/series/01-sample/01s-sample.md']).length > 0, 'expected series run-status checkpoint to leave a sibling leaf dirty');
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
  runRunStatusSelfTests();
  const fixture = runFixtureLifecycleSelfTests();
  runApprovalSelfTests();
  runAuditAndTransitionSelfTests();
  runRunStatusCheckpointSelfTests();
  runResolverSelfTests(fixture);
  console.log('issues lifecycle: self-test ok');
}

interface CliContext {
  execRoot: string;
  log: (message: string) => void;
}

interface TransitionCliContext {
  context: CliContext;
  controlRoot: string;
  controlConfig: IssuesConfig;
}

const STATUS_READ_USAGE = 'Usage: lifecycle.ts status-read <slug> OR lifecycle.ts status-read issue <slug> OR lifecycle.ts status-read series <series> <leaf>';
const STATUS_WRITE_USAGE = 'Usage: lifecycle.ts status-write <slug> <next-step> OR lifecycle.ts status-write issue <slug> <next-step> OR lifecycle.ts status-write series <series> <leaf> <next-step>';
const STATUS_VERDICT_USAGE = 'Usage: lifecycle.ts status-verdict <slug> <a|b> <merge-ready|not-yet-merge-ready> OR lifecycle.ts status-verdict issue <slug> <a|b> <merge-ready|not-yet-merge-ready> OR lifecycle.ts status-verdict series <series> <leaf> <a|b> <merge-ready|not-yet-merge-ready>';

function parseRunStatusLocatorWithTail(args: string[], tailLength: number, usage: string): { locator: RunStatusLocator; tail: string[] } {
  if (args[0] === 'issue' && args.length === tailLength + 2) return { locator: { target: 'issue', slug: args[1] }, tail: args.slice(2) };
  if (args[0] === 'series' && args.length === tailLength + 3) return { locator: { target: 'series', series: args[1], leaf: args[2] }, tail: args.slice(3) };
  if (args.length === tailLength + 1) return { locator: { target: 'shorthand', slug: args[0] }, tail: args.slice(1) };
  throw new Error(usage);
}

function runPhaseCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'phase') return false;
  if (args[1] === 'issue') {
    if (args.length !== 3) throw new Error('Usage: lifecycle.ts phase issue <slug>');
    context.log(JSON.stringify(readIssuePhase(context.execRoot, args[2])));
    return true;
  }
  if (args[1] === 'series') {
    if (args.length !== 4) throw new Error('Usage: lifecycle.ts phase series <series> <leaf>');
    context.log(JSON.stringify(readSeriesLeafPhase(context.execRoot, args[2], args[3])));
    return true;
  }
  throw new Error('Usage: lifecycle.ts phase issue <slug> OR lifecycle.ts phase series <series> <leaf>');
}

function runResolveCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'resolve') return false;
  if (args.length !== 2) throw new Error('Usage: lifecycle.ts resolve <slug>');
  context.log(JSON.stringify(resolveSlug(context.execRoot, args[1])));
  return true;
}

function runStatusReadCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'status-read') return false;
  const { locator } = parseRunStatusLocatorWithTail(args.slice(1), 0, STATUS_READ_USAGE);
  context.log(JSON.stringify(readRunStatusByTargetRequest({ execRoot: context.execRoot, locator }, true)));
  return true;
}

function runStatusWriteCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'status-write') return false;
  const { locator, tail: [nextStepRaw] } = parseRunStatusLocatorWithTail(args.slice(1), 1, STATUS_WRITE_USAGE);
  context.log(JSON.stringify(writeRunStatusNextStep({ execRoot: context.execRoot, locator, nextStep: asRunStatusToken(nextStepRaw, 'next-step') })));
  return true;
}

function runStatusVerdictCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'status-verdict') return false;
  const { locator, tail: [slotRaw, verdictRaw] } = parseRunStatusLocatorWithTail(args.slice(1), 2, STATUS_VERDICT_USAGE);
  if (!(RUN_STATUS_SLOTS as readonly string[]).includes(slotRaw)) throw new Error(STATUS_VERDICT_USAGE);
  context.log(JSON.stringify(writeRunStatusMergeVerdict({ execRoot: context.execRoot, locator, slot: asRunStatusSlot(slotRaw, 'slot'), verdict: asRunStatusMergeVerdict(verdictRaw, 'verdict') })));
  return true;
}

function runStatusCli(args: string[], context: CliContext): boolean {
  return runStatusReadCli(args, context) || runStatusWriteCli(args, context) || runStatusVerdictCli(args, context);
}

function runAdvanceCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'advance') return false;
  if (args.length !== 4 || !isIssuePhase(args[3])) throw new Error('Usage: lifecycle.ts advance <series> <leaf> <to-phase>');
  advanceSeriesLeafForApproval(context.execRoot, readConfig(context.execRoot), args[1], args[2], args[3]);
  context.log(`issues lifecycle: approved advance ${args[1]}:${args[2]} -> ${args[3]}`);
  return true;
}

function runTransitionCli(args: string[], context: CliContext): boolean {
  if (args[0] !== 'transition') return false;
  const config = readConfig(context.execRoot);
  const controlRoot = resolveControlRoot(context.execRoot, config);
  const controlConfig = readConfig(controlRoot);
  const transitionContext: TransitionCliContext = { context, controlRoot, controlConfig };
  if (args[1] === 'issue') return runIssueTransitionCli(args, transitionContext);
  if (args[1] === 'series') return runSeriesTransitionCli(args, transitionContext);
  throw new Error('Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message> OR lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
}

function runIssueTransitionCli(args: string[], transition: TransitionCliContext): boolean {
  const message = parseMessage(args, 'Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message>');
  if (args.length !== 6 || args[1] !== 'issue' || !isIssuePhase(args[3])) throw new Error('Usage: lifecycle.ts transition issue <slug> <to-phase> --message <message>');
  writeIssuePhase(transition.controlRoot, args[2], args[3]);
  commitCheckpoint(transition.controlRoot, [normalizeRepoPath(issueDir(transition.controlConfig, args[2]))], message);
  transition.context.log(`issues lifecycle: transitioned issue ${args[2]} -> ${args[3]}`);
  return true;
}

function runSeriesTransitionCli(args: string[], transition: TransitionCliContext): boolean {
  const message = parseMessage(args, 'Usage: lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
  if (args.length !== 7 || args[1] !== 'series' || !isIssuePhase(args[4])) throw new Error('Usage: lifecycle.ts transition series <series> <leaf> <to-phase> --message <message>');
  transitionSeriesLeaf(transition.controlRoot, transition.controlConfig, args[2], args[3], args[4]);
  const seriesStateRepoPath = normalizeRepoPath(path.join(seriesDir(transition.controlConfig, args[2]), 'state.yaml'));
  const leafArtifactRepoPath = resolveSeriesLeafArtifact(transition.controlRoot, transition.controlConfig, args[2], args[3]).repoPath;
  commitCheckpoint(transition.controlRoot, [artifactRootRepoPath(transition.controlRoot, leafArtifactRepoPath), seriesStateRepoPath], message);
  transition.context.log(`issues lifecycle: transitioned series ${args[2]}:${args[3]} -> ${args[4]}`);
  return true;
}

function runCli(args = process.argv.slice(2), execRoot = defaultRoot(), log: (message: string) => void = console.log): void {
  if (args.includes('--self-test')) return runSelfTest();
  if (args.includes('--audit-bridge')) return auditLiveSeries(execRoot), log('issues lifecycle: audit-bridge ok');
  const context: CliContext = { execRoot, log };
  if (runPhaseCli(args, context) || runResolveCli(args, context) || runStatusCli(args, context) || runAdvanceCli(args, context) || runTransitionCli(args, context)) return;
  log('issues lifecycle module is inert; run with --self-test, --audit-bridge, phase, resolve, status-read, status-write, status-verdict, transition, or advance <series> <leaf> <to-phase>');
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
