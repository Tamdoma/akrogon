// Criteria 3 and 8: `akrogon listen` on a real hc core. An `akrogon` shim on the listener's PATH
// records each pass it starts (and can hold one open on a FIFO), so the order, the filter and the
// single flight are read from what the listener ran.
import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { entry, fixture, killTree, unitBin, type Fixture } from './helpers';
import { hcCore, type HcCore, type Terminal } from './hc-fixture';
import { deployFixture, deployRecord, pushSeed, type DeployFixture } from './deploy-fixture';

type Shim = { log: string; holds: string; bin: string };

// Each pass appends `start <argv>` and `end <argv>`; a held kind waits on holds/<kind> (a FIFO)
// until the test opens it; an overlapping pass writes OVERLAP.
function akrogonShim(f: Fixture, forward: string | null = null): Shim {
  const bin: string = resolve(f.home, 'listener-bin');
  const holds: string = resolve(f.home, 'holds');
  const log: string = resolve(f.home, 'passes.log');
  mkdirSync(bin, { recursive: true });
  mkdirSync(holds, { recursive: true });
  writeFileSync(log, '');
  const lock: string = resolve(f.home, 'pass.lock');
  writeFileSync(
    resolve(bin, 'akrogon'),
    `#!/bin/sh
kind="$1-$2"
mkdir '${lock}' 2>/dev/null || echo OVERLAP >> '${log}'
echo "start $*" >> '${log}'
[ -p '${holds}'/"$kind" ] && cat '${holds}'/"$kind" > /dev/null && rm -f '${holds}'/"$kind"
code=0
${forward === null ? '' : `[ "$1" = '${forward}' ] && { '${process.execPath}' '${entry}' "$@"; code=$?; }`}
echo "end $*" >> '${log}'
rmdir '${lock}'
exit $code
`,
  );
  chmodSync(resolve(bin, 'akrogon'), 0o755);
  return { log, holds, bin };
}

function hold(shim: Shim, kind: string): string {
  const fifo: string = resolve(shim.holds, kind);
  Bun.spawnSync(['mkfifo', fifo]);
  return fifo;
}

function passes(shim: Shim): string[] {
  return readFileSync(shim.log, 'utf8').split('\n').filter(Boolean);
}

// Waits on file changes (fs.watch), never a timed re-read; the timer only bounds the wait.
// Bun can drop the event of an append that follows another within about a millisecond, so each event
// also re-checks shortly after it, and once right after the watch starts.
function until(path: string, check: () => boolean, ms: number = 15_000): Promise<void> {
  return new Promise<void>((done, fail) => {
    if (check()) return done();
    let finished: boolean = false;
    const settle = (): void => {
      if (finished || !check()) return;
      finished = true;
      clearTimeout(timer);
      watcher.close();
      done();
    };
    const watcher = watch(path, () => {
      settle();
      setTimeout(settle, 20);
    });
    const timer = setTimeout(() => {
      finished = true;
      watcher.close();
      fail(new Error(`timed out waiting on ${path}: ${readFileSync(path, 'utf8')}`));
    }, ms);
    settle();
  });
}

function listen(f: Fixture, env: NodeJS.ProcessEnv): Bun.Subprocess {
  return Bun.spawn([process.execPath, entry, 'listen'], {
    cwd: f.home,
    env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home, ...env },
    stdout: 'ignore',
    stderr: 'pipe',
  });
}

function count(shim: Shim, line: string): number {
  return passes(shim).filter((entry: string) => entry === line).length;
}

async function standIn(core: HcCore, labels: string[], mode: string = 'work'): Promise<string> {
  const run = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    ...labels.flatMap((label: string) => ['--label', label]),
    '--',
    'fake',
    '--model',
    mode,
  ]);
  if (run.code !== 0) throw new Error(`hc run failed: ${run.stderr}`);
  return z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
}

const labelled: string[] = ['akrogon=1', 'akrogon.repo=repo', 'akrogon.leaf=hl-x', 'akrogon.seat=a'];

test('startup pulls and resumes before handling a wake received while another session subscribes', async () => {
  const f: Fixture = await fixture();
  const first: HcCore = await hcCore(f);
  const second: HcCore = await hcCore(f, { repo: 'second' });
  first.link(second);
  const shim: Shim = akrogonShim(f);
  const bin: string = resolve(f.home, 'subscription-bin');
  const snapshot: string = resolve(f.home, 'snapshot.log');
  const processed: string = resolve(f.home, 'processed.log');
  const gate: string = resolve(f.home, 'second.fifo');
  mkdirSync(bin);
  writeFileSync(snapshot, '');
  writeFileSync(processed, '');
  expect(Bun.spawnSync(['mkfifo', gate]).exitCode).toBe(0);
  writeFileSync(
    resolve(bin, 'hc'),
    `#!/bin/bash
if [ "$1" = connect ]; then printf 'connect\\n' >> '${processed}'; fi
if [ "$1" = events ]; then
  if [ "$HC_SESSION" = '${second.session}' ]; then cat '${gate}' >/dev/null; fi
  if [ "$HC_SESSION" = '${first.session}' ]; then
    '${first.env.HC_SHIM_REAL}' "$@" | tee '${snapshot}'
    exit "\${PIPESTATUS[0]}"
  fi
fi
exec '${first.env.HC_SHIM_REAL}' "$@"
`,
  );
  chmodSync(resolve(bin, 'hc'), 0o755);
  const listener: Bun.Subprocess = listen(f, { ...first.env, PATH: `${bin}:${shim.bin}:${first.env.PATH}` });
  try {
    await until(snapshot, () => readFileSync(snapshot, 'utf8').includes('"terminals"'));
    await standIn(first, labelled, 'exit');
    // The watcher's discovery runs after the finished event's dispatch callback.
    await until(processed, () => readFileSync(processed, 'utf8').includes('connect'));
    writeFileSync(gate, 'go\n');
    await until(shim.log, () => passes(shim).includes('end next --resume'));
    await until(shim.log, () => passes(shim).includes('end next --wake'));
    expect(passes(shim).slice(0, 4)).toEqual([
      'start pull --all',
      'end pull --all',
      'start next --resume',
      'end next --resume',
    ]);
    expect(count(shim, 'start next --wake')).toBe(1);
    expect(passes(shim)).not.toContain('OVERLAP');
  } finally {
    killTree(listener);
    await first.stop();
    await second.stop();
    f.clean();
  }
});

test('the listener subscribes before its catch-up, wakes on turn end, blocked and exit of labelled terminals only, and folds queued wakes', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const shim: Shim = akrogonShim(f);
  const resume: string = hold(shim, 'next---resume');
  const listener: Bun.Subprocess = listen(f, { ...core.env, PATH: `${shim.bin}:${core.env.PATH}` });
  try {
    await until(shim.log, () => passes(shim).includes('start next --resume'));
    expect(passes(shim).slice(0, 3)).toEqual(['start pull --all', 'end pull --all', 'start next --resume']);
    // C3.1: a turn end during the held catch-up is caught by the subscription made before it.
    const early: string = await standIn(core, labelled);
    await core.waitFor(early, (t: Terminal) => t.status?.state === 'idle');
    expect((await core.hc(['send', '--json', early, 'task'])).code).toBe(0);
    await core.waitFor(early, (t: Terminal) => t.turn >= 1);
    writeFileSync(resume, 'go\n');
    await until(shim.log, () => count(shim, 'end next --wake') >= 1);
    // An unlabelled terminal's turn end wakes nothing; the labelled one after it wakes once.
    const before: number = count(shim, 'start next --wake');
    const plain: string = await standIn(core, []);
    expect((await core.hc(['send', '--json', plain, 'task'])).code).toBe(0);
    await core.waitFor(plain, (t: Terminal) => t.turn >= 1);
    expect((await core.hc(['send', '--json', early, 'again'])).code).toBe(0);
    await until(shim.log, () => count(shim, 'end next --wake') >= before + 1);
    expect(count(shim, 'start next --wake')).toBe(before + 1);
    // Blocked and exit each wake.
    const blocked: string = await standIn(core, labelled, 'trust');
    await core.waitFor(blocked, (t: Terminal) => t.status?.state === 'blocked');
    await until(shim.log, () => count(shim, 'end next --wake') >= before + 2);
    await standIn(core, labelled, 'exit');
    await until(shim.log, () => count(shim, 'end next --wake') >= before + 3);
    // C3.2: three turn ends during a held pass fold into one following pass, never overlapping.
    const wake: string = hold(shim, 'next---wake');
    expect((await core.hc(['send', '--json', early, 'one'])).code).toBe(0);
    await until(shim.log, () => existsSync(wake) && count(shim, 'start next --wake') === before + 4);
    for (const task of ['two', 'three', 'four']) {
      const turn: number = (await core.get(early)).turn;
      expect((await core.hc(['send', '--json', early, task])).code).toBe(0);
      await core.waitFor(early, (t: Terminal) => t.turn > turn && t.status?.state === 'idle');
    }
    writeFileSync(wake, 'go\n');
    await until(shim.log, () => count(shim, 'end next --wake') >= before + 5);
    expect(count(shim, 'start next --wake')).toBe(before + 5);
    expect(passes(shim)).not.toContain('OVERLAP');
    // A stream end (core restart) catches up again.
    const resumes: number = count(shim, 'start next --resume');
    expect((await core.hc(['server', 'restart'])).code).toBe(0);
    await until(shim.log, () => count(shim, 'end next --resume') >= resumes + 1);
  } finally {
    killTree(listener);
    await core.stop();
    f.clean();
  }
});

test('a self-update run by the listener deploys, writes its record, and only then restarts the listener', async () => {
  const d: DeployFixture = await deployFixture();
  const shim: Shim = akrogonShim(d.f, 'next');
  const runtime: string = resolve(d.home, 'rt');
  mkdirSync(resolve(runtime, 'herdr-core'), { recursive: true });
  try {
    const sha: string = await pushSeed(d, () => {
      rmSync(resolve(d.seed, 'plugin'), { recursive: true, force: true });
      writeFileSync(resolve(d.seed, 'systemd/akrogon-listener.service'), '[Service]\n');
    });
    const log: string = resolve(d.home, 'systemctl.calls');
    writeFileSync(log, '');
    const listener: Bun.Subprocess = listen(d.f, {
      ...d.env,
      PATH: `${shim.bin}:${unitBin(d.f)}:${z.string().parse(d.env.PATH)}`,
      XDG_RUNTIME_DIR: runtime,
      FAKE_SYSTEMCTL_LOG: log,
      FAKE_DEPLOY_RECORD: resolve(d.home, 'deploy.yaml'),
    });
    try {
      await until(log, () => readFileSync(log, 'utf8').includes('restart --no-block akrogon-listener.service'), 30_000);
      expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
      const calls: string[] = readFileSync(log, 'utf8').split('\n').filter(Boolean);
      const restart: string = z.string().parse(calls.find((line: string) => line.includes('restart --no-block')));
      expect(restart).toContain('record=yes');
      expect(calls.indexOf(restart)).toBeGreaterThan(calls.findIndex((line: string) => line.includes('daemon-reload')));
    } finally {
      killTree(listener);
    }
  } finally {
    rmSync(runtime, { recursive: true, force: true });
    d.f.clean();
  }
});
