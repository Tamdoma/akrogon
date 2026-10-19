#!/usr/bin/env bun
import { existsSync, readdirSync, type Dirent } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import {
  repoInventory,
  RepoMismatchError,
  type Inventory,
  type Leaf,
  type LeafFailure,
  type State,
} from '../../../src/state';

const agentStatusSchema = z.enum(['idle', 'done', 'working', 'blocked', 'unknown']);

export const herdrListSchema = z.object({
  result: z.object({
    agents: z.array(
      z.object({
        pane_id: z.string(),
        agent_status: agentStatusSchema,
        agent: z.string().nullable().optional(),
        cwd: z.string().nullable().optional(),
        agent_session: z
          .object({ kind: z.enum(['id', 'path']), value: z.string() })
          .nullable()
          .optional(),
      }),
    ),
  }),
});

type AgentEntry = z.infer<typeof herdrListSchema>['result']['agents'][number];

type RunResult = { code: number; stdout: string; stderr: string };

async function run(argv: string[], cwd: string): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function resolveRepoKey(root: string, bin: string): Promise<string> {
  let result: RunResult;
  try {
    result = await run([bin, 'config'], root);
  } catch (error) {
    throw new Error(`akrogon config failed to spawn ${bin}: ${messageOf(error)}`);
  }
  if (result.code !== 0) {
    throw new Error(`akrogon config failed: exit ${result.code} ${result.stderr} ${result.stdout}`.trim());
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(result.stdout);
  } catch (error) {
    throw new Error(`akrogon config returned invalid YAML: ${messageOf(error)}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('akrogon config has no usable repo: expected object with repo field');
  }
  const repo: unknown = (parsed as Record<string, unknown>).repo;
  if (repo === 'none') {
    throw new Error(`akrogon config reports repo "none": no registered repo for ${root}`);
  }
  if (typeof repo !== 'string' || repo.trim() === '') {
    throw new Error('akrogon config has no usable repo: missing or invalid repo field');
  }
  return repo;
}

async function agentStatuses(root: string, bin: string): Promise<Map<string, AgentEntry>> {
  let result: RunResult;
  try {
    result = await run([bin, 'agent', 'list'], root);
  } catch (error) {
    throw new Error(`herdr agent list failed to spawn ${bin}: ${messageOf(error)}`);
  }
  if (result.code !== 0) {
    throw new Error(`herdr agent list failed: exit ${result.code} ${result.stderr} ${result.stdout}`.trim());
  }
  let json: unknown;
  try {
    json = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `herdr agent list returned non-JSON stdout: ${messageOf(error)} stdout=${result.stdout.slice(0, 500)}`,
    );
  }
  const parsed: z.ZodSafeParseResult<z.infer<typeof herdrListSchema>> = herdrListSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`herdr agent list returned invalid response: ${parsed.error.message}`);
  }
  const map: Map<string, AgentEntry> = new Map();
  for (const agent of parsed.data.result.agents) {
    map.set(agent.pane_id, agent);
  }
  return map;
}

function isMissingCode(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code: unknown = (error as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

function codexSessionPaths(root: string, value: string): string[] {
  const suffix: string = `-${value}.jsonl`;
  let dirs: string[] = [root];
  for (let depth = 0; depth < 3; depth++) {
    const next: string[] = [];
    for (const dir of dirs) {
      let entries: Dirent[];
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch (error) {
        if (isMissingCode(error)) continue;
        throw error;
      }
      for (const entry of entries) {
        if (entry.isDirectory()) next.push(join(dir, entry.name));
      }
    }
    dirs = next;
  }
  const matches: string[] = [];
  for (const dir of dirs) {
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch (error) {
      if (isMissingCode(error)) continue;
      throw error;
    }
    for (const file of files) {
      if (file.startsWith('rollout-') && file.endsWith(suffix)) matches.push(join(dir, file));
    }
  }
  return matches;
}

function resolveLog(paneId: string, entry: AgentEntry, home: string): string {
  const session = entry.agent_session;
  if (session === null || session === undefined) return '-';
  let candidate: string;
  if (session.kind === 'path') {
    candidate = session.value;
  } else if (home === '') {
    return '-';
  } else if (entry.agent === 'claude') {
    if (entry.cwd === null || entry.cwd === undefined) return '-';
    candidate = join(
      home,
      '.claude',
      'projects',
      entry.cwd.replaceAll(/[^A-Za-z0-9]/g, '-'),
      `${session.value}.jsonl`,
    );
  } else if (entry.agent === 'codex') {
    const matches: string[] = codexSessionPaths(join(home, '.codex', 'sessions'), session.value);
    if (matches.length === 0) return '-';
    if (matches.length > 1) {
      throw new Error(`Pane ${paneId} matches ${matches.length} codex sessions for id ${session.value}: ${matches.join(', ')}`);
    }
    candidate = matches[0];
  } else {
    return '-';
  }
  return existsSync(candidate) ? candidate : '-';
}

function ageSuffix(value: string | undefined, now: number): string {
  if (value === undefined) return '';
  const parsed: number = Date.parse(value);
  if (Number.isNaN(parsed)) return '';
  let diff: number = now - parsed;
  if (diff < 0) diff = 0;
  const h: number = Math.floor(diff / 3600000);
  const m: number = Math.floor((diff % 3600000) / 60000);
  return ` busy=${h}h${String(m).padStart(2, '0')}m`;
}

function formatLeaf(leaf: Leaf, entries: Map<string, AgentEntry>, logs: Map<string, string>, now: number): string {
  const s: State = leaf.state;
  const paneA: string = s.pane.A ?? '-';
  const paneB: string = s.pane.B ?? '-';
  const statusA: string = paneA === '-' ? '-' : (entries.get(paneA)?.agent_status ?? '-');
  const statusB: string = paneB === '-' ? '-' : (entries.get(paneB)?.agent_status ?? '-');
  const ageA: string = ageSuffix(s.busy_since.A, now);
  const ageB: string = ageSuffix(s.busy_since.B, now);
  const logA: string = statusA === 'working' ? ` logA=${logs.get(paneA) ?? '-'}` : '';
  const logB: string = statusB === 'working' ? ` logB=${logs.get(paneB) ?? '-'}` : '';
  const notified: string = (['A', 'B'] as const).filter((seat) => s.busy_notified[seat] !== undefined).join(',');
  const base: string = `slug=${s.slug} phase=${s.phase} attempts=A${s.attempts.A},B${s.attempts.B} blocked=${s['blocked-by'].join(',')} A=${paneA}/${statusA}${ageA}${logA} B=${paneB}/${statusB}${ageB}${logB} notified=${notified}`;
  if (s.phase !== 'failed') return base;
  if (s.failure === undefined) return `${base} failed=unknown`;
  return `${base} failed=${s.failure.cause}@${s.failure.phase} delivery=${s.failure.delivery ?? '-'} reason="${s.failure.reason}"`;
}

async function main(): Promise<void> {
  const root: string | undefined = process.argv[2];
  if (root === undefined || process.argv.length !== 3) {
    console.error('Usage: observe.ts <root>');
    process.exit(1);
  }
  const akrogonBin: string = process.env.OBSERVE_AKROGON ?? 'akrogon';
  const herdrBin: string = process.env.OBSERVE_HERDR ?? 'herdr';
  const home: string = process.env.HOME ?? '';
  const repoKey: string = await resolveRepoKey(root, akrogonBin);
  const inv: Inventory = repoInventory({ name: repoKey, root }, ['open']);
  const leaves: Leaf[] = inv.leaves;
  const failures: LeafFailure[] = [
    ...inv.unreadable.map(
      (f): LeafFailure => ({ path: resolve(f.path, 'state.yaml'), error: f.error.replaceAll('\n', ' ') }),
    ),
    ...inv.foreign.map(
      (f): LeafFailure => ({
        path: resolve(f.path, 'state.yaml'),
        error: new RepoMismatchError(f.path, f.stored, repoKey).message,
      }),
    ),
    ...inv.unknown.map(
      (f): LeafFailure => ({ path: f.path, error: f.error.replaceAll('\n', ' ') }),
    ),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const reportFailures = (): void => {
    for (const failure of failures) console.log(`unreadable=${failure.path} error=${failure.error}`);
  };
  if (leaves.length === 0) {
    reportFailures();
    return;
  }
  const entries: Map<string, AgentEntry> = await agentStatuses(root, herdrBin);
  const now: number = Date.now();
  const panes: Set<string> = new Set();
  for (const leaf of leaves) {
    if (leaf.state.pane.A !== undefined) panes.add(leaf.state.pane.A);
    if (leaf.state.pane.B !== undefined) panes.add(leaf.state.pane.B);
  }
  const logs: Map<string, string> = new Map();
  for (const paneId of panes) {
    const entry: AgentEntry | undefined = entries.get(paneId);
    if (entry === undefined || entry.agent_status !== 'working') continue;
    logs.set(paneId, resolveLog(paneId, entry, home));
  }
  const sorted: Leaf[] = [...leaves].sort((a, b) => a.state.slug.localeCompare(b.state.slug));
  for (const leaf of sorted) {
    console.log(formatLeaf(leaf, entries, logs, now));
  }
  reportFailures();
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
