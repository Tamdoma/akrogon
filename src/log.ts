import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { base, type Repo } from './config';
import { command, panes, repoSession, CommandError, type Pane, type SessionResolution } from './shell';
import { type State } from './state';
import { phaseSchema, slotSchema, verdictSchema, type Slot } from './routing';

export const logSchema = z.object({
  ts: z.iso.datetime(),
  repo: z.string(),
  slug: z.string(),
  from: phaseSchema,
  to: phaseSchema,
  slot: slotSchema.nullable(),
  attempts: z.object({ A: z.number().int().nonnegative(), B: z.number().int().nonnegative() }),
  fix_rounds: z.number().int().nonnegative(),
  verdict: z.object({ A: verdictSchema.optional(), B: verdictSchema.optional() }),
  head: z.string(),
  diff: z.string(),
  session: z.string().nullable(),
});
export type LogRecord = { record: z.infer<typeof logSchema>; text: string };

export function readLog(root: string): LogRecord[] {
  const issues: string = resolve(root, 'issues');
  if (!readdirSync(issues).includes('log.jsonl')) return [];
  const content: string = readFileSync(resolve(issues, 'log.jsonl'), 'utf8').replace(/(?:\r?\n)+$/, '');
  return content === '' ? [] : content.split('\n').map((text) => ({ record: logSchema.parse(JSON.parse(text)), text }));
}

export async function logMove(repo: Repo, before: State, after: State, slot: Slot | null): Promise<void> {
  const cwd: string = after.worktree ?? repo.root;
  const head: string = await command(['git', 'rev-parse', 'HEAD'], cwd);
  const diff: string = await command(['git', 'diff', '--shortstat', await base(repo, cwd)], cwd);
  const paneId: string | undefined = slot === null ? undefined : before.pane[slot];
  let pane: Pane | undefined;
  if (paneId !== undefined) {
    // The pane lookup runs in the leaf's resolved session; a refused or
    // stopped session yields no pane, same as an unreachable herdr.
    const resolved: SessionResolution = await repoSession(repo);
    if (resolved.ok)
      try {
        pane = (await panes(resolved.session.name)).find((item) => item.pane_id === paneId);
      } catch (error) {
        // The session field is diagnostic only; an unreachable herdr must not
        // fail a move that already committed.
        if (!(error instanceof CommandError)) throw error;
      }
  }
  const session: string | null = pane?.agent_session?.value ?? null;
  appendFileSync(
    resolve(repo.root, 'issues/log.jsonl'),
    JSON.stringify({
      ts: new Date().toISOString(),
      repo: repo.name,
      slug: after.slug,
      from: before.phase,
      to: after.phase,
      slot,
      attempts: before.attempts,
      fix_rounds: after.fix_rounds,
      verdict: before.verdict,
      head,
      diff,
      session,
      ...(after.failure === undefined ? {} : { failure: after.failure }),
    }) + '\n',
  );
}
