#!/usr/bin/env bun

import { execFileSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const MANAGED_SKILLS: string[] = [
  'init-issues',
  'seed-issue',
  'consult-issue',
  'implement-issue',
  'check-issue',
  'merge-issue',
  'explain-issue',
  'broadcast-issue'
];

const PAYLOAD_FILES: string[] = [
  'package.json',
  'bun.lock',
  'lifecycle.ts',
  'resolve-worktree.ts',
  'merge-branch.ts',
  'auto-commit-if-dirty.ts',
  'create-worktree.ts',
  'prune-worktree.ts',
  'classify-merged-issue-roots.ts',
  'audit-reference-index-drift.ts'
];

const SELF_TEST_FILES: string[] = [
  'lifecycle.ts',
  'classify-merged-issue-roots.ts',
  'audit-reference-index-drift.ts'
];

const EXCLUDED_NAMES: ReadonlySet<string> = new Set(['.env', 'node_modules']);

interface SyncTarget {
  label: string;
  scriptsDir: string;
}

interface DeployTarget {
  label: string;
  installRoot: string;
  skillsRoot: string;
  slot: 'a' | 'b';
}

type Manifest = Map<string, string>;

interface ManifestWalkContext {
  root: string;
  source: boolean;
  manifest: Manifest;
}

type ManifestDifference =
  | { kind: 'missing'; relativePath: string; expectedHash: string }
  | { kind: 'extra'; relativePath: string; actualHash: string }
  | { kind: 'hash-mismatch'; relativePath: string; expectedHash: string; actualHash: string };

interface MarkerDifference {
  kind: 'marker';
  relativePath: string;
  expectedValue: string;
  actualValue: string;
}

type DestinationDifference = ManifestDifference | MarkerDifference;

interface FileSnapshot {
  hash: string;
  modifiedMs: number;
}

function originDir(): string {
  return path.resolve(__dirname, '..', 'payload', 'issues', '.scripts');
}

function repoSkillsRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

function deployTargets(homeDir: string): DeployTarget[] {
  return [
    {
      label: 'claude',
      installRoot: path.join(homeDir, '.claude'),
      skillsRoot: path.join(homeDir, '.claude', 'skills'),
      slot: 'a'
    },
    {
      label: 'codex',
      installRoot: path.join(homeDir, '.codex'),
      skillsRoot: path.join(homeDir, '.codex', 'skills'),
      slot: 'b'
    },
    {
      label: 'pi',
      installRoot: path.join(homeDir, '.pi'),
      skillsRoot: path.join(homeDir, '.pi', 'agent', 'skills'),
      slot: 'b'
    }
  ];
}

function parseIntoTargets(argv: string[]): SyncTarget[] {
  const targets: SyncTarget[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--into') {
      throw new Error(`Unknown payload-sync argument: ${argv[index]} (expected --into <repo-root>)`);
    }
    const repoRoot = argv[index + 1];
    if (repoRoot === undefined) {
      throw new Error('Expected a repository root after payload-sync --into');
    }
    const resolvedRoot = path.resolve(repoRoot);
    if (!fs.existsSync(path.join(resolvedRoot, 'issues', 'config.yaml'))) {
      throw new Error(`payload-sync target is not an initialized issue-lifecycle repo (missing issues/config.yaml): ${resolvedRoot}`);
    }
    targets.push({ label: `repo:${resolvedRoot}`, scriptsDir: path.join(resolvedRoot, 'issues', '.scripts') });
    index += 1;
  }
  return targets;
}

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function assertByteIdentity(originFile: string, targetFile: string): void {
  const originHash = sha256(originFile);
  const targetHash = sha256(targetFile);
  if (originHash !== targetHash) {
    throw new Error(`Payload drift after copy: ${targetFile} (${targetHash}) differs from ${originFile} (${originHash})`);
  }
}

function copyFileAtomic(sourceFile: string, targetFile: string): void {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const temporaryFile = `${targetFile}.sync-${process.pid}`;
  fs.copyFileSync(sourceFile, temporaryFile);
  fs.renameSync(temporaryFile, targetFile);
}

function writeFileAtomic(targetFile: string, content: string): void {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const temporaryFile = `${targetFile}.sync-${process.pid}`;
  fs.writeFileSync(temporaryFile, content, 'utf8');
  fs.renameSync(temporaryFile, targetFile);
}

function copyPayload(origin: string, target: SyncTarget): void {
  fs.mkdirSync(target.scriptsDir, { recursive: true });
  for (const fileName of PAYLOAD_FILES) {
    const originFile = path.join(origin, fileName);
    const targetFile = path.join(target.scriptsDir, fileName);
    copyFileAtomic(originFile, targetFile);
    assertByteIdentity(originFile, targetFile);
  }
}

function runSelfTests(scriptsDir: string): void {
  for (const fileName of SELF_TEST_FILES) {
    execFileSync('bun', ['--no-install', path.join(scriptsDir, fileName), '--self-test'], { stdio: 'inherit' });
  }
}

function installDependencies(scriptsDir: string): void {
  execFileSync('bun', ['install', '--cwd', scriptsDir, '--frozen-lockfile'], { stdio: 'inherit' });
}

function payloadSyncTargets(repoTargets: SyncTarget[], homeDir: string): SyncTarget[] {
  if (repoTargets.length > 0) return repoTargets;
  return [
    {
      label: 'codex',
      scriptsDir: path.join(homeDir, '.codex', 'skills', 'init-issues', 'payload', 'issues', '.scripts')
    },
    {
      label: 'pi',
      scriptsDir: path.join(homeDir, '.pi', 'agent', 'skills', 'init-issues', 'payload', 'issues', '.scripts')
    }
  ];
}

function runPayloadSync(argv: string[], homeDir: string): void {
  const repoTargets = parseIntoTargets(argv);
  const origin = originDir();
  for (const fileName of PAYLOAD_FILES) {
    const originFile = path.join(origin, fileName);
    if (!fs.existsSync(originFile)) {
      throw new Error(`Missing payload origin file: ${originFile}`);
    }
  }
  installDependencies(origin);
  runSelfTests(origin);

  const targets = payloadSyncTargets(repoTargets, homeDir);

  for (const target of targets) {
    copyPayload(origin, target);
    installDependencies(target.scriptsDir);
    runSelfTests(target.scriptsDir);
    console.log(`sync-payload: synced ${target.label} at ${target.scriptsDir}`);
  }
}

function isExcludedName(name: string): boolean {
  return EXCLUDED_NAMES.has(name);
}

function sortedEntries(directory: string): fs.Dirent[] {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
}

function walkManifest(context: ManifestWalkContext, relativeDirectory: string): void {
  const absoluteDirectory = path.join(context.root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) return;

  for (const entry of sortedEntries(absoluteDirectory)) {
    if (isExcludedName(entry.name)) continue;
    const relativePath = path.posix.join(relativeDirectory.replace(/\\/g, '/'), entry.name);
    const absolutePath = path.join(context.root, relativePath);
    if (entry.isSymbolicLink()) {
      if (context.source) throw new Error(`Managed source contains a symlink: ${absolutePath}`);
      context.manifest.set(relativePath, `symlink:${fs.readlinkSync(absolutePath)}`);
    } else if (entry.isDirectory()) {
      walkManifest(context, relativePath);
    } else if (entry.isFile()) {
      context.manifest.set(relativePath, sha256(absolutePath));
    } else {
      throw new Error(`Unsupported managed filesystem entry: ${absolutePath}`);
    }
  }
}

function buildManifest(skillsRoot: string, source: boolean): Manifest {
  const manifest: Manifest = new Map();
  const context: ManifestWalkContext = { root: skillsRoot, source, manifest };
  for (const skill of MANAGED_SKILLS) {
    const skillRoot = path.join(skillsRoot, skill);
    const rootEntry = fs.lstatSync(skillRoot, { throwIfNoEntry: false });
    if (rootEntry === undefined) {
      if (source) throw new Error(`Missing managed source skill directory: ${skillRoot}`);
      continue;
    }
    const manifestKind = source ? 'source' : 'destination';
    if (rootEntry.isSymbolicLink()) throw new Error(`Managed ${manifestKind} skill root is a symlink or junction: ${skillRoot}`);
    if (!rootEntry.isDirectory()) throw new Error(`Managed ${manifestKind} skill root is not a directory: ${skillRoot}`);
    walkManifest(context, skill);
  }
  return manifest;
}

function compareManifests(expected: Manifest, actual: Manifest): ManifestDifference[] {
  const differences: ManifestDifference[] = [];
  for (const [relativePath, expectedHash] of expected) {
    const actualHash = actual.get(relativePath);
    if (actualHash === undefined) {
      differences.push({ kind: 'missing', relativePath, expectedHash });
    } else if (actualHash !== expectedHash) {
      differences.push({ kind: 'hash-mismatch', relativePath, expectedHash, actualHash });
    }
  }
  for (const [relativePath, actualHash] of actual) {
    if (!expected.has(relativePath)) {
      differences.push({ kind: 'extra', relativePath, actualHash });
    }
  }
  return differences.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function markerDifference(target: DeployTarget): MarkerDifference[] {
  const markerPath = path.join(target.installRoot, 'slot-default');
  if (!fs.existsSync(markerPath)) {
    return [{ kind: 'marker', relativePath: markerPath, expectedValue: `${target.slot}\n`, actualValue: '<missing>' }];
  }
  const actualValue = fs.readFileSync(markerPath, 'utf8');
  return actualValue === `${target.slot}\n`
    ? []
    : [{ kind: 'marker', relativePath: markerPath, expectedValue: `${target.slot}\n`, actualValue }];
}

function compareDestination(sourceManifest: Manifest, target: DeployTarget): DestinationDifference[] {
  return [
    ...compareManifests(sourceManifest, buildManifest(target.skillsRoot, false)),
    ...markerDifference(target)
  ];
}

function renderDifference(target: DeployTarget, difference: DestinationDifference): string {
  if (difference.kind === 'marker') {
    return `${target.label}:${difference.relativePath} marker expected=${JSON.stringify(difference.expectedValue)} actual=${JSON.stringify(difference.actualValue)}`;
  }
  if (difference.kind === 'missing') {
    return `${target.label}:${difference.relativePath} expected=${difference.expectedHash} actual=<missing>`;
  }
  if (difference.kind === 'extra') {
    return `${target.label}:${difference.relativePath} expected=<missing> actual=${difference.actualHash}`;
  }
  return `${target.label}:${difference.relativePath} expected=${difference.expectedHash} actual=${difference.actualHash}`;
}

function deleteExtraFiles(target: DeployTarget, differences: DestinationDifference[]): void {
  for (const difference of differences) {
    if (difference.kind !== 'extra') continue;
    const targetPath = path.resolve(target.skillsRoot, difference.relativePath);
    const managedRoot = path.resolve(target.skillsRoot, difference.relativePath.split('/')[0]);
    if (targetPath !== managedRoot && !targetPath.startsWith(`${managedRoot}${path.sep}`)) {
      throw new Error(`Refusing stale-file deletion outside managed skill directory: ${targetPath}`);
    }
    fs.unlinkSync(targetPath);
  }
}

function copyManagedSource(sourceSkillsRoot: string, target: DeployTarget, sourceManifest: Manifest): void {
  for (const relativePath of sourceManifest.keys()) {
    copyFileAtomic(path.join(sourceSkillsRoot, relativePath), path.join(target.skillsRoot, relativePath));
  }
}

function deployManagedSkills(sourceSkillsRoot: string, targets: DeployTarget[], sourceManifest: Manifest): void {
  const preflightDifferences = targets.map((target): { target: DeployTarget; differences: DestinationDifference[] } => ({
    target,
    differences: compareDestination(sourceManifest, target),
  }));
  for (const { target, differences } of preflightDifferences) {
    copyManagedSource(sourceSkillsRoot, target, sourceManifest);
    deleteExtraFiles(target, differences);
    writeFileAtomic(path.join(target.installRoot, 'slot-default'), `${target.slot}\n`);
  }
  for (const target of targets) {
    const remaining = compareDestination(sourceManifest, target);
    if (remaining.length > 0) {
      throw new Error(`Deploy drift after copy:\n${remaining.map((difference) => renderDifference(target, difference)).join('\n')}`);
    }
  }
}

function runCheck(sourceSkillsRoot: string, targets: DeployTarget[]): number {
  const sourceManifest = buildManifest(sourceSkillsRoot, true);
  const differences = targets.flatMap((target) => compareDestination(sourceManifest, target)
    .map((difference) => renderDifference(target, difference)));
  if (differences.length === 0) {
    console.log('sync-payload: check ok');
    return 0;
  }
  console.error(`sync-payload: check found ${differences.length} difference(s)`);
  for (const difference of differences) console.error(difference);
  return 1;
}

function runDeploy(sourceSkillsRoot: string, targets: DeployTarget[]): void {
  const sourceManifest = buildManifest(sourceSkillsRoot, true);
  for (const target of targets) compareDestination(sourceManifest, target);
  deployManagedSkills(sourceSkillsRoot, targets, sourceManifest);
  console.log(`sync-payload: deployed ${MANAGED_SKILLS.length} skills to ${targets.length} install roots`);
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertThrows(action: () => void, expected: string): void {
  let message = '';
  try {
    action();
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message.includes(expected), `Expected error containing ${JSON.stringify(expected)}, got ${JSON.stringify(message)}`);
}

function writeFixtureFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function snapshotFiles(root: string): Map<string, FileSnapshot> {
  const snapshots = new Map<string, FileSnapshot>();
  function visit(directory: string): void {
    if (!fs.existsSync(directory)) return;
    for (const entry of sortedEntries(directory)) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(root, absolutePath).replace(/\\/g, '/');
        snapshots.set(relativePath, { hash: sha256(absolutePath), modifiedMs: fs.statSync(absolutePath).mtimeMs });
      }
    }
  }
  visit(root);
  return snapshots;
}

function snapshotsEqual(left: Map<string, FileSnapshot>, right: Map<string, FileSnapshot>): boolean {
  return JSON.stringify([...left.entries()]) === JSON.stringify([...right.entries()]);
}

function createSourceFixture(root: string): string {
  const skillsRoot = path.join(root, 'skills');
  for (const skill of MANAGED_SKILLS) {
    writeFixtureFile(path.join(skillsRoot, skill, 'SKILL.md'), `# ${skill}\n`);
  }
  writeFixtureFile(path.join(skillsRoot, 'broadcast-issue', '.env'), 'SOURCE_SECRET=excluded\n');
  writeFixtureFile(path.join(skillsRoot, 'init-issues', 'payload', 'node_modules', 'generated.js'), 'excluded\n');
  return skillsRoot;
}

function runLinkedRootSelfTests(root: string, sourceSkillsRoot: string, sourceManifest: Manifest): void {
  const linkedSourceSkillsRoot = createSourceFixture(path.join(root, 'linked-source'));
  const externalSourceRoot = path.join(root, 'external-source');
  writeFixtureFile(path.join(externalSourceRoot, 'SKILL.md'), '# external source\n');
  const linkedSourceRoot = path.join(linkedSourceSkillsRoot, 'consult-issue');
  fs.rmSync(linkedSourceRoot, { recursive: true });
  fs.symlinkSync(externalSourceRoot, linkedSourceRoot, process.platform === 'win32' ? 'junction' : 'dir');
  const externalSourceBefore = snapshotFiles(externalSourceRoot);
  assertThrows(() => buildManifest(linkedSourceSkillsRoot, true), 'Managed source skill root is a symlink or junction');
  assert(snapshotsEqual(externalSourceBefore, snapshotFiles(externalSourceRoot)), 'expected linked source target preservation');

  const linkedTarget = deployTargets(path.join(root, 'linked-home'))[0];
  const externalDestinationRoot = path.join(root, 'external-destination');
  writeFixtureFile(path.join(externalDestinationRoot, 'SKILL.md'), '# external destination\n');
  writeFixtureFile(path.join(externalDestinationRoot, 'sentinel.txt'), 'preserve\n');
  const linkedDestinationRoot = path.join(linkedTarget.skillsRoot, 'consult-issue');
  fs.mkdirSync(path.dirname(linkedDestinationRoot), { recursive: true });
  fs.symlinkSync(externalDestinationRoot, linkedDestinationRoot, process.platform === 'win32' ? 'junction' : 'dir');
  const externalDestinationBefore = snapshotFiles(externalDestinationRoot);
  assertThrows(() => deployManagedSkills(sourceSkillsRoot, [linkedTarget], sourceManifest), 'Managed destination skill root is a symlink or junction');
  assert(snapshotsEqual(externalDestinationBefore, snapshotFiles(externalDestinationRoot)), 'expected linked destination target preservation');
  assert(!fs.existsSync(path.join(linkedTarget.installRoot, 'slot-default')), 'expected linked destination failure before marker write');
}

function runManifestSelfTest(root: string): void {
  const sourceSkillsRoot = createSourceFixture(root);
  const targets = deployTargets(path.join(root, 'home'));
  const sourceManifest = buildManifest(sourceSkillsRoot, true);
  assert(sourceManifest.size === MANAGED_SKILLS.length, 'expected one authored fixture file per managed skill');

  const first = targets[0];
  writeFixtureFile(path.join(first.skillsRoot, 'consult-issue', 'stale.md'), 'stale\n');
  writeFixtureFile(path.join(first.skillsRoot, 'broadcast-issue', '.env'), 'LOCAL_SECRET=preserve\n');
  writeFixtureFile(path.join(first.skillsRoot, 'init-issues', 'node_modules', 'generated.js'), 'preserve\n');
  writeFixtureFile(path.join(first.skillsRoot, 'unmanaged-skill', 'keep.md'), 'keep\n');
  writeFixtureFile(path.join(first.installRoot, 'outside.txt'), 'keep\n');

  deployManagedSkills(sourceSkillsRoot, targets, sourceManifest);
  assert(!fs.existsSync(path.join(first.skillsRoot, 'consult-issue', 'stale.md')), 'expected bounded stale file deletion');
  assert(fs.readFileSync(path.join(first.skillsRoot, 'broadcast-issue', '.env'), 'utf8') === 'LOCAL_SECRET=preserve\n', 'expected local .env preservation');
  assert(fs.existsSync(path.join(first.skillsRoot, 'init-issues', 'node_modules', 'generated.js')), 'expected generated dependency preservation');
  assert(fs.existsSync(path.join(first.skillsRoot, 'unmanaged-skill', 'keep.md')), 'expected unmanaged skill preservation');
  assert(fs.existsSync(path.join(first.installRoot, 'outside.txt')), 'expected outside-file preservation');
  assert(targets.every((target) => compareDestination(sourceManifest, target).length === 0), 'expected fixture deployment convergence');

  writeFixtureFile(path.join(first.skillsRoot, 'consult-issue', 'SKILL.md'), '# mutated\n');
  const before = snapshotFiles(path.join(root, 'home'));
  const differences = compareDestination(sourceManifest, first);
  const after = snapshotFiles(path.join(root, 'home'));
  assert(snapshotsEqual(before, after), 'expected check manifest comparison to perform zero writes');
  const rendered = differences.map((difference) => renderDifference(first, difference)).join('\n');
  assert(rendered.includes('consult-issue/SKILL.md') && rendered.includes('expected=') && rendered.includes('actual='), 'expected mutation diff path and hashes');
  runLinkedRootSelfTests(root, sourceSkillsRoot, sourceManifest);
}

function runPayloadCopySelfTest(root: string): void {
  const origin = originDir();
  const repoRoot = path.join(root, 'payload-target');
  writeFixtureFile(path.join(repoRoot, 'issues', 'config.yaml'), 'grounding: none\n');
  const target: SyncTarget = { label: 'fixture', scriptsDir: path.join(repoRoot, 'issues', '.scripts') };
  copyPayload(origin, target);
  for (const fileName of PAYLOAD_FILES) {
    assertByteIdentity(path.join(origin, fileName), path.join(target.scriptsDir, fileName));
  }
}

function runPayloadTargetSelectionSelfTest(root: string): void {
  const repoTarget: SyncTarget = { label: 'fixture', scriptsDir: path.join(root, 'repo', 'issues', '.scripts') };
  assert(payloadSyncTargets([repoTarget], root).map((target) => target.label).join('|') === 'fixture', 'expected explicit --into targets to exclude install mirrors');
  assert(payloadSyncTargets([], root).map((target) => target.label).join('|') === 'codex|pi', 'expected payload-sync without --into to select install mirrors');
}

function runSelfTest(): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-payload-'));
  try {
    runManifestSelfTest(path.join(root, 'manifest'));
    runPayloadCopySelfTest(path.join(root, 'payload'));
    runPayloadTargetSelectionSelfTest(path.join(root, 'target-selection'));
    console.log('sync-payload: self-test ok');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function runCli(argv = process.argv.slice(2)): number {
  if (argv.length === 1 && argv[0] === '--self-test') {
    runSelfTest();
    return 0;
  }
  const [command, ...commandArgs] = argv;
  if (command === 'payload-sync') {
    runPayloadSync(commandArgs, os.homedir());
    return 0;
  }
  if (command === 'deploy') {
    if (commandArgs.length !== 0) throw new Error('Usage: sync-payload.ts deploy');
    runDeploy(repoSkillsRoot(), deployTargets(os.homedir()));
    return 0;
  }
  if (command === 'check') {
    if (commandArgs.length !== 0) throw new Error('Usage: sync-payload.ts check');
    return runCheck(repoSkillsRoot(), deployTargets(os.homedir()));
  }
  throw new Error('Usage: sync-payload.ts <payload-sync|deploy|check>');
}

process.exitCode = runCli();
