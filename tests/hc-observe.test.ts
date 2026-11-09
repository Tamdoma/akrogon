// Criterion 1 (watcher-on-hc): `skills/watch-issues/scripts/observe.ts` on a real throwaway core with
// stand-in seats of recorded leaves keeps its line format: hc status per recorded seat, `unknown` for a
// terminal that reports no status, `-` for an absent, finished or keep-shell seat, a log path from the
// transcript resolver and `log<seat>=-` when none resolves. It replaces the fake-herdr cases of
// skills/watch-issues/scripts/observe.test.ts and observe-log-tail.test.ts.
import { test, expect } from 'bun:test';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { entry, fixture, leaf, type Fixture } from './helpers';
import { hcCore, recordedDoc, type HcCore, type Terminal } from './hc-fixture';
import { spawnCaptured, type SpawnResult } from '../src/shell';

const scripts: string = resolve(import.meta.dir, '../skills/watch-issues/scripts');
const working: string[] = ['sh', '-c', 'printf "\\033]7501;state=working\\007"; exec sleep 600'];

function akrogonShim(f: Fixture, name: string, body: string): string {
  const path: string = resolve(f.home, name);
  writeFileSync(path, body);
  chmodSync(path, 0o755);
  return path;
}

function observe(f: Fixture, core: HcCore, extra: Record<string, string> = {}): Promise<SpawnResult> {
  const akrogon: string = akrogonShim(f, 'akrogon-observe', `#!/bin/sh\nexec '${process.execPath}' '${entry}' "$@"\n`);
  return spawnCaptured([process.execPath, resolve(scripts, 'observe.ts'), f.root], {
    cwd: f.root,
    env: { ...process.env, ...core.env, AKROGON_HOME: f.home, OBSERVE_AKROGON: akrogon, ...extra },
  });
}

function lines(stdout: string): string[] {
  return stdout.trim() === '' ? [] : stdout.trim().split('\n');
}

async function seat(
  core: HcCore,
  labels: Record<string, string>,
  argv: string[],
  keep: boolean = false,
): Promise<string> {
  const run: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    ...(keep ? ['--keep'] : []),
    ...Object.entries(labels).flatMap(([k, v]) => ['--label', `${k}=${v}`]),
    '--',
    ...argv,
  ]);
  if (run.code !== 0) throw new Error(`hc run failed: ${JSON.stringify(run)}`);
  return z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
}

function seatLabels(f: Fixture, slug: string, letter: 'a' | 'b'): Record<string, string> {
  return { akrogon: '1', 'akrogon.repo': f.repo, 'akrogon.leaf': slug, 'akrogon.seat': letter };
}

// hc ends a terminal's own event stream at loss and announces the keep shell on the session stream.
function restarted(core: HcCore, address: string, ms: number = 15_000): { ready: Promise<void>; done: Promise<void> } {
  const child = Bun.spawn(['hc', 'events', '--json'], {
    env: { ...process.env, ...core.env, HC_SESSION: core.session },
    stdout: 'pipe',
    stderr: 'ignore',
  });
  const timer = setTimeout(() => child.kill(), ms);
  let snapshot: () => void = () => {};
  const ready: Promise<void> = new Promise<void>((done) => (snapshot = done));
  const done: Promise<void> = (async (): Promise<void> => {
    let buffer: string = '';
    try {
      for await (const chunk of child.stdout) {
        buffer += new TextDecoder().decode(chunk);
        const parts: string[] = buffer.split('\n');
        buffer = parts.pop() ?? '';
        for (const line of parts.filter((l: string) => l.trim() !== '')) {
          const message = z
            .object({
              terminals: z.array(z.unknown()).optional(),
              params: z.object({ type: z.string(), terminal: z.string().optional() }).optional(),
            })
            .parse(JSON.parse(line));
          if (message.terminals !== undefined) snapshot();
          if (message.params?.type === 'restarted' && message.params.terminal === address) return;
        }
      }
      throw new Error(`no restarted event for ${address} in ${ms} ms`);
    } finally {
      clearTimeout(timer);
      child.kill();
    }
  })();
  return { ready, done };
}

const sha8 = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 8);

test('observe prints each recorded leaf from its hc seats in the repo session', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const s: string = core.session;
    const ref = (address: string, session: string = s) => ({ session, address });
    const now: string = new Date().toISOString();

    // Status words come from hc; a terminal that never reported prints unknown.
    const nullA: string = await seat(core, seatLabels(f, 'ob-null', 'a'), ['sleep', '600']);
    leaf(f, 'ob-null', 'implement', { seat: { A: ref(nullA) } });

    // A working seat whose transcript the resolver knows (label) prints its path; one it cannot
    // resolve prints logB=-.
    const log: string = resolve(f.home, 'pi/sessions/pi-session.jsonl');
    mkdirSync(dirname(log), { recursive: true });
    copyFileSync(resolve(scripts, 'fixtures/pi-session.jsonl'), log);
    const workA: string = await seat(core, seatLabels(f, 'ob-work', 'a'), working);
    const workB: string = await seat(core, seatLabels(f, 'ob-work', 'b'), working);
    expect((await core.hc(['label', workA, `akrogon.transcript=${log}`])).code).toBe(0);
    leaf(f, 'ob-work', 'check.review', {
      attempts: { A: 1, B: 2 },
      seat: { A: ref(workA), B: ref(workB) },
      busy_since: { A: now },
      busy_notified: { A: now },
    });

    // A resolved path whose file is gone is no usable log.
    const goneA: string = await seat(core, seatLabels(f, 'ob-gone', 'a'), working);
    expect((await core.hc(['label', goneA, `akrogon.transcript=${resolve(f.home, 'missing.jsonl')}`])).code).toBe(0);
    leaf(f, 'ob-gone', 'implement', { seat: { A: ref(goneA) } });

    // Only a working seat gets a log field.
    const idleA: string = await seat(core, seatLabels(f, 'ob-idle', 'a'), ['fake', '--model', 'idle']);
    expect((await core.hc(['label', idleA, `akrogon.transcript=${log}`])).code).toBe(0);
    leaf(f, 'ob-idle', 'implement', { seat: { A: ref(idleA) } });

    // An exited seat and a seat replaced by hc's keep shell are absent.
    const exitA: string = await seat(core, seatLabels(f, 'ob-exit', 'a'), ['fake', '--model', 'exit']);
    leaf(f, 'ob-exit', 'implement', { seat: { A: ref(exitA) } });
    const keepA: string = await seat(core, seatLabels(f, 'ob-keep', 'a'), working, true);
    leaf(f, 'ob-keep', 'implement', { seat: { A: ref(keepA) } });

    // A labelled seat whose address state does not record is not the leaf's seat, and a recorded
    // address whose terminal carries no seat labels is absent.
    const strayA: string = await seat(core, seatLabels(f, 'ob-unrec', 'a'), working);
    const plainA: string = await seat(core, {}, working);
    leaf(f, 'ob-unrec', 'implement', { seat: { A: ref(plainA) } });

    // A recorded address hc does not know is absent.
    leaf(f, 'ob-absent', 'implement', { seat: { A: ref('t999') } });

    // A seat recorded in another session is absent here.
    const otherA: string = await seat(core, seatLabels(f, 'ob-elsewhere', 'a'), working);
    leaf(f, 'ob-elsewhere', 'implement', { seat: { A: ref(otherA, 'akt-elsewhere') } });

    // State-only fields keep their format.
    leaf(f, 'ob-blocked', 'implement', { 'blocked-by': ['a', 'b'], busy_notified: { A: now, B: now } });
    leaf(f, 'ob-garbage', 'implement', { busy_since: { A: 'not-a-date' } });
    leaf(f, 'ob-future', 'implement', { busy_since: { A: new Date(Date.now() + 3600000).toISOString() } });
    leaf(f, 'ob-fail-blocked', 'failed', {
      attempts: { A: 1, B: 2 },
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs human', delivery: 'shown' },
    });
    leaf(f, 'ob-fail-attempts', 'failed', {
      failure: { cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'tried 3 times' },
    });
    leaf(f, 'ob-fail-legacy', 'failed');
    leaf(f, 'ob-merged', 'merged', { attempts: { A: 1, B: 1 } });

    // Unreadable entries are reported after the leaf lines.
    const badDir: string = resolve(f.root, 'issues/open/issue/bad-leaf');
    mkdirSync(resolve(badDir, 'state.yaml'), { recursive: true });
    const foreign: string = leaf(f, 'ob-foreign', 'implement', { repo: 'other' });
    const shallow: string = resolve(f.root, 'issues/open/shallow-leaf');
    mkdirSync(shallow, { recursive: true });
    writeFileSync(
      resolve(shallow, 'state.yaml'),
      Bun.YAML.stringify({
        slug: 'shallow-leaf',
        phase: 'implement',
        created: '2026-09-10',
        repo: f.repo,
        'blocked-by': [],
      }),
    );
    leaf(f, 'ob-dup', 'implement', {}, 'owner-a');
    leaf(f, 'ob-dup', 'implement', {}, 'owner-b');

    await core.waitFor(nullA, (t: Terminal) => t.state === 'live');
    for (const t of [workA, workB, goneA, strayA, plainA, otherA])
      await core.waitFor(t, (x: Terminal) => x.status?.state === 'working');
    await core.waitFor(idleA, (t: Terminal) => t.status?.state === 'idle');
    await core.waitFor(exitA, (t: Terminal) => t.state === 'finished');
    // The keep shell: the working program dies by signal and hc puts a shell in its place.
    const before: Terminal = await core.waitFor(keepA, (t: Terminal) => t.status?.state === 'working');
    const shell: { ready: Promise<void>; done: Promise<void> } = restarted(core, keepA);
    await shell.ready;
    process.kill(z.number().parse(before.pid), 'SIGKILL');
    await shell.done;
    const kept = z
      .object({ state: z.string(), keep: z.boolean(), argv: z.array(z.string()) })
      .parse(JSON.parse((await core.hc(['get', '--json', keepA])).stdout));
    expect(kept.state).toBe('live');
    expect(kept.keep).toBe(true);
    expect(kept.argv).not.toEqual(working);

    const seen: SpawnResult = await observe(f, core);
    expect(seen.code, seen.stderr).toBe(0);
    const out: string[] = lines(seen.stdout);
    const rest: string = 'attempts=A0,B0 blocked=';
    expect(out.slice(0, 17)).toEqual([
      `session=${s}`,
      `slug=ob-absent phase=implement ${rest} A=t999/- B=-/- notified=`,
      `slug=ob-blocked phase=implement ${rest}a,b A=-/- B=-/- notified=A,B`,
      `slug=ob-elsewhere phase=implement ${rest} A=${otherA}/- B=-/- notified=`,
      `slug=ob-exit phase=implement ${rest} A=${exitA}/- B=-/- notified=`,
      `slug=ob-fail-attempts phase=failed ${rest} A=-/- B=-/- notified= failed=attempts@check.review delivery=- reason="tried 3 times"`,
      `slug=ob-fail-blocked phase=failed attempts=A1,B2 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=shown reason="needs human"`,
      `slug=ob-fail-legacy phase=failed ${rest} A=-/- B=-/- notified= failed=unknown`,
      `slug=ob-future phase=implement ${rest} A=-/- busy=0h00m B=-/- notified=`,
      `slug=ob-garbage phase=implement ${rest} A=-/- B=-/- notified=`,
      `slug=ob-gone phase=implement ${rest} A=${goneA}/working logA=- B=-/- notified=`,
      `slug=ob-idle phase=implement ${rest} A=${idleA}/idle B=-/- notified=`,
      `slug=ob-keep phase=implement ${rest} A=${keepA}/- B=-/- notified=`,
      `slug=ob-merged phase=merged attempts=A1,B1 blocked= A=-/- B=-/- notified=`,
      `slug=ob-null phase=implement ${rest} A=${nullA}/unknown B=-/- notified=`,
      `slug=ob-unrec phase=implement ${rest} A=${plainA}/- B=-/- notified=`,
      `slug=ob-work phase=check.review attempts=A1,B2 blocked= A=${workA}/working busy=0h00m logA=${log} B=${workB}/working logB=- notified=A`,
    ]);
    // Unreadable, foreign, too-shallow and duplicate-slug leaves print no leaf line, only reports after the leaves.
    const reports: string[] = out.slice(17);
    expect(reports).toHaveLength(5);
    expect(reports.every((line: string) => line.startsWith('unreadable='))).toBe(true);
    expect(reports.join('\n')).toContain(resolve(badDir, 'state.yaml'));
    expect(reports.join('\n')).toContain(resolve(foreign, 'state.yaml'));
    expect(reports.join('\n')).toContain('Invalid leaf depth');
    expect(reports.filter((line: string) => line.includes('Duplicate leaf slug'))).toHaveLength(2);

    // The resolved path feeds log-tail (the watcher's busy rule).
    const tail: SpawnResult = await spawnCaptured([process.execPath, resolve(scripts, 'log-tail.ts'), log]);
    expect(tail.code, tail.stderr).toBe(0);
    expect(lines(tail.stdout)).toEqual([
      '2026-10-02T14:52:01.217Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:03.831Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:06.948Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:08.897Z bash echo done #' + sha8('echo done') + ' -> ok: done',
      '2026-10-02T14:52:10.556Z read note.txt - -> ok: hello',
      '2026-10-02T14:52:13.129Z edit note.txt old#' +
        sha8('hello\n') +
        ' new#' +
        sha8('bye\n') +
        ' -> ok: Successfully replaced 1 block(s) in note.txt.',
    ]);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('observe prints only the session line for an empty inventory and refuses without the repo space', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const empty: SpawnResult = await observe(f, core);
    expect(empty.code, empty.stderr).toBe(0);
    expect(empty.stdout).toBe(`session=${core.session}\n`);

    rmSync(resolve(f.root, 'issues/open'), { recursive: true, force: true });
    const missing: SpawnResult = await observe(f, core);
    expect(missing.code, missing.stderr).toBe(0);
    expect(missing.stdout).toBe(`session=${core.session}\n`);

    leaf(f, 'ob-wait', 'implement');
    const failing: string = akrogonShim(f, 'akrogon-fail', '#!/bin/sh\necho "akrogon boom" >&2\nexit 2\n');
    const configFailed: SpawnResult = await observe(f, core, { OBSERVE_AKROGON: failing });
    expect(configFailed.code).not.toBe(0);
    expect(configFailed.stdout).toBe('');
    expect(configFailed.stderr).toContain('akrogon config');
    const none: string = akrogonShim(f, 'akrogon-none', '#!/bin/sh\necho "repo: none"\n');
    const noRepo: SpawnResult = await observe(f, core, { OBSERVE_AKROGON: none });
    expect(noRepo.code).not.toBe(0);
    expect(noRepo.stdout).toBe('');
    expect(noRepo.stderr).toContain('akrogon config');

    // The session holds no space named after the repo: refusal on stderr, nothing on stdout.
    const doc = z.object({ version: z.number() }).parse(await core.rpc('doc.get', { name: 'herdr-app' }));
    await core.rpc('doc.set', {
      name: 'herdr-app',
      value: recordedDoc(`sp-${core.session}`, 'other', f.root),
      version: doc.version,
    });
    const refused: SpawnResult = await observe(f, core);
    expect(refused.code).not.toBe(0);
    expect(refused.stdout).toBe('');
    expect(refused.stderr).toContain('no running session holds it');
  } finally {
    await core.stop();
    f.clean();
  }
});
