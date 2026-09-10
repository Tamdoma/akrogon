import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { base, type Repo } from './config';
import { command, panes, type Pane } from './shell';
import { type State } from './state';
import { type Slot } from './routing';

export async function logMove(repo: Repo, before: State, after: State, slot: Slot | null): Promise<void> {
  const cwd: string = after.worktree ?? repo.root;
  const head: string = await command(['git', 'rev-parse', 'HEAD'], cwd);
  const diff: string = await command(['git', 'diff', '--shortstat', await base(repo, cwd)], cwd);
  const paneId: string | undefined = process.env.HERDR_PANE_ID || (slot === null ? undefined : before.pane[slot]);
  const pane: Pane | undefined = paneId === undefined ? undefined : (await panes()).find(item => item.pane_id === paneId);
  const session: string | null = pane?.agent_session?.value ?? null;
  appendFileSync(resolve(repo.root, 'issues/log.jsonl'), JSON.stringify({ ts: new Date().toISOString(), repo: repo.name, slug: after.slug, from: before.phase, to: after.phase, slot, attempts: before.attempts, fix_rounds: after.fix_rounds, verdict: before.verdict, head, diff, session }) + '\n');
}
