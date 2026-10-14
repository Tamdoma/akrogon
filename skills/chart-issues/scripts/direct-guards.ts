#!/usr/bin/env bun
import { z } from 'zod';
import { readGlobal, readRepo, type GlobalConfig, type Repo } from '../../../src/config';
import { requireClean, requireNoIssueFiles, requireNonEmpty, requireTestChangeCitations } from '../../../src/phase';
import { command } from '../../../src/shell';
import { requireGreenReceipt } from '../../../src/verify';

const [worktree, key, chartFolder]: [string, string, string] = z
  .tuple([z.string(), z.string(), z.string()])
  .parse(process.argv.slice(2));
const global: GlobalConfig = readGlobal();
const path: string | undefined = global.repos[key];
if (path === undefined) throw new Error(`Unknown repo key: ${key}`);
const repo: Repo = readRepo(key, path);

await requireClean(worktree);
await requireNoIssueFiles(repo, worktree, chartFolder);
await requireTestChangeCitations(repo, worktree);
await requireNonEmpty(repo, worktree);
await requireGreenReceipt(repo, await command(['git', 'rev-parse', 'HEAD'], worktree), 'merge');
console.log('direct guards passed');
