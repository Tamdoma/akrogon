#!/usr/bin/env bun

import { execFileSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const PAYLOAD_FILES: string[] = [
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

interface SyncTarget {
  label: string;
  scriptsDir: string;
}

function originDir(): string {
  return path.resolve(__dirname, '..', 'payload', 'issues', '.scripts');
}

function parseIntoTargets(argv: string[]): SyncTarget[] {
  const targets: SyncTarget[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--into') {
      throw new Error(`Unknown argument: ${argv[index]} (expected --into <repo-root>)`);
    }
    const repoRoot = argv[index + 1];
    if (repoRoot === undefined) {
      throw new Error('Expected a repository root after --into');
    }
    const resolvedRoot = path.resolve(repoRoot);
    if (!fs.existsSync(path.join(resolvedRoot, 'issues', 'config.yaml'))) {
      throw new Error(`--into target is not an initialized issue-lifecycle repo (missing issues/config.yaml): ${resolvedRoot}`);
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

function copyPayload(origin: string, target: SyncTarget): void {
  fs.mkdirSync(target.scriptsDir, { recursive: true });
  for (const fileName of PAYLOAD_FILES) {
    const originFile = path.join(origin, fileName);
    const targetFile = path.join(target.scriptsDir, fileName);
    fs.copyFileSync(originFile, targetFile);
    assertByteIdentity(originFile, targetFile);
  }
}

function runSelfTests(scriptsDir: string): void {
  for (const fileName of SELF_TEST_FILES) {
    execFileSync('bun', [path.join(scriptsDir, fileName), '--self-test'], { stdio: 'inherit' });
  }
}

function main(): void {
  const origin = originDir();
  for (const fileName of PAYLOAD_FILES) {
    const originFile = path.join(origin, fileName);
    if (!fs.existsSync(originFile)) {
      throw new Error(`Missing payload origin file: ${originFile}`);
    }
  }
  runSelfTests(origin);

  const codexMirror: SyncTarget = {
    label: 'codex',
    scriptsDir: path.join(os.homedir(), '.codex', 'skills', 'init-issues', 'payload', 'issues', '.scripts')
  };
  const targets = [codexMirror, ...parseIntoTargets(process.argv.slice(2))];

  for (const target of targets) {
    copyPayload(origin, target);
    runSelfTests(target.scriptsDir);
    console.log(`sync-payload: synced ${target.label} at ${target.scriptsDir}`);
  }
}

main();
