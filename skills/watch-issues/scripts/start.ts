// watch-issues start: run the repo's timer terminal unless one is already verified or held.
// One outcome line (stdout) + exit code: `refused <reason>` exit 1 when the caller is not a live
// descendant of the watcher terminal it names; `conflict <details>` exit 2 on multiple labelled
// timers or an unverified holder of the watch name; `running <address>` when a verified timer is
// already up; `started <address>` once hc run places it.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { terminals, type Seen } from '../../../src/hc';
import { transcriptFor } from '../../../src/transcript';
import { getTerm, hcCall, isVerifiedTimer, type HcReply, type Term } from './hc';
import { isAncestor, procStart } from './proc';
import { watchTarget, type WatchTarget } from './repo';

// The pinned foreground's claude session record. transcriptFor keys the session record on the
// terminal's own pid, but a foreground program (agent REPL or script running inside it) keeps its
// record under its own pid, so start looks there too. Same record shape as src/transcript.ts:
// <config>/sessions/<pid>.json verified by proc stat field 22, then the matching
// <config>/projects/*/<sessionId>.jsonl.
function pinClaudeTranscript(pid: number): string | null {
  const home: string | undefined = process.env.HOME;
  const config: string | undefined =
    process.env.CLAUDE_CONFIG_DIR ?? (home === undefined ? undefined : resolve(home, '.claude'));
  if (config === undefined) return null;
  let record: { sessionId?: unknown; procStart?: unknown };
  try {
    record = JSON.parse(readFileSync(resolve(config, 'sessions', `${pid}.json`), 'utf8'));
  } catch {
    return null;
  }
  if (typeof record.sessionId !== 'string' || record.procStart !== procStart(pid)) return null;
  let matches: string[];
  try {
    matches = readdirSync(resolve(config, 'projects'))
      .map((dir: string) => resolve(config, 'projects', dir, `${record.sessionId}.jsonl`))
      .filter((path: string) => existsSync(path));
  } catch {
    return null;
  }
  return matches.length === 1 ? matches[0] : null;
}

const TIMER_LABEL: string = 'akrogon.watch-timer';

function out(line: string, code: number): never {
  console.log(line);
  process.exit(code);
}

function bail(error: unknown): never {
  out(`refused ${error instanceof Error ? error.message : String(error)}`, 1);
}

async function main(): Promise<void> {
  const root: string | undefined = process.argv[2];
  if (root === undefined || process.argv.length !== 3) bail('usage: start.ts <root>');
  const self: string | undefined = process.env.HC_TERMINAL_ID;
  if (self === undefined || self.trim() === '') bail('no HC_TERMINAL_ID');

  const target: WatchTarget = await watchTarget(root);
  // The caller terminal reports foreground null while its program is still spawning; give it a
  // short window to appear before calling the pin unset.
  let pinPid: number | null = null;
  let watcherKind: string | null = null;
  for (let attempt: number = 0; attempt < 50; attempt += 1) {
    const reply: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
      target.session,
      self,
    );
    if (!reply.ok) {
      watcherKind = reply.kind;
      break;
    }
    if (reply.term.state === 'live' && reply.term.foreground !== null) {
      pinPid = reply.term.foreground.pid;
      break;
    }
    if (reply.term.state !== 'live') {
      watcherKind = reply.term.state;
      break;
    }
    await Bun.sleep(100);
  }
  if (pinPid === null) bail(`watcher ${self} has no program${watcherKind === null ? '' : `: ${watcherKind}`}`);
  if (!isAncestor(pinPid, process.pid)) bail(`foreground ${pinPid} is not an ancestor`);
  const pinStart: string | null = procStart(pinPid);
  if (pinStart === null) bail(`foreground ${pinPid} is gone`);
  const transcript: string | null =
    (await transcriptFor({ session: target.session, address: self })) ?? pinClaudeTranscript(pinPid);

  const watchName: string = `${target.prefix}-watch`;
  const labelled: Seen[] = (await terminals(target.session, { [TIMER_LABEL]: target.repo })).filter(
    (t: Seen) => t.state === 'live',
  );
  if (labelled.length > 1) {
    out(`conflict labelled ${labelled.map((t: Seen) => t.address).join(',')}`, 2);
  }
  if (labelled.length === 1) {
    const holder: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
      target.session,
      labelled[0].address,
    );
    if (holder.ok && isVerifiedTimer(target.prefix, holder.term)) out(`running ${holder.term.address}`, 0);
    out(
      `conflict labelled ${labelled[0].address}${holder.ok ? '' : ` unreadable ${holder.kind}`}`,
      2,
    );
  }
  const named: Seen[] = (await terminals(target.session, {})).filter(
    (t: Seen) => t.name === watchName,
  );
  if (named.length > 0) {
    out(`conflict named ${named.map((t: Seen) => t.address).join(',')}`, 2);
  }

  const script: string = resolve(import.meta.dir, 'timer.ts');
  const envs: string[] = ['XDG_RUNTIME_DIR', 'HOME', 'PATH'].flatMap((name: string) => {
    const value: string | undefined = process.env[name];
    return value === undefined ? [] : [`${name}=${value}`];
  });
  const reply: HcReply = await hcCall(target.session, [
    'run',
    '--bg',
    '--json',
    '--no-notify',
    '--rm',
    '--cwd',
    root,
    '--name',
    watchName,
    '--label',
    `${TIMER_LABEL}=${target.repo}`,
    '--',
    '/usr/bin/env',
    ...envs,
    `WATCH_TICK_SECONDS=${process.env.WATCH_TICK_SECONDS ?? ''}`,
    'bun',
    script,
    '--session',
    target.session,
    '--watcher',
    self,
    '--root',
    root,
    '--repo',
    target.repo,
    '--pin-pid',
    String(pinPid),
    '--pin-start',
    pinStart,
    ...(transcript === null ? [] : ['--transcript', transcript]),
  ]);
  if (reply.ok) {
    const address: string = z.string().parse(JSON.parse(reply.stdout).address);
    out(`started ${address}`, 0);
  }
  if (reply.kind !== 'name_taken') bail(`hc run: ${reply.kind}`);
  const holders: Seen[] = (await terminals(target.session, {})).filter(
    (t: Seen) => t.name === watchName,
  );
  if (holders.length === 1) {
    const holder: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
      target.session,
      holders[0].address,
    );
    if (holder.ok && isVerifiedTimer(target.prefix, holder.term)) out(`running ${holder.term.address}`, 0);
  }
  out(`conflict name_taken ${holders.map((t: Seen) => t.address).join(',') || watchName}`, 2);
}

try {
  await main();
} catch (error) {
  bail(error);
}
