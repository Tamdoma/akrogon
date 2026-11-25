// Criteria 1, 2 and 4: a committed phase move kills every tool cgroup of the leaf's seat scopes
// except those with an akrogon call in flight, those defer to one helper each, everything else
// survives, and failures warn without blocking the move.
import { afterAll, test, expect } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { cli, entry, fixture, leaf, yaml, WAIT_MS, type Fixture } from './helpers';
import { leafSlice, sliceCgroup } from '../src/scope';
import { withLock, readState } from '../src/state';

const uid: number = process.getuid!();
const SYSTEMD_RUN: string = Bun.which('systemd-run') ?? '/usr/bin/systemd-run';
const userBus: NodeJS.ProcessEnv = {
  XDG_RUNTIME_DIR: `/run/user/${uid}`,
  DBUS_SESSION_BUS_ADDRESS: `unix:path=/run/user/${uid}/bus`,
};

// One throwaway leaf slice per file; every scope of every test nests under it so stopping
// the slice reaps all of them, live or not.
const slices: string[] = [];
function testSlice(f: Fixture, slug: string): string {
  const slice: string = leafSlice({ name: f.repo }, slug, f.home);
  if (!slices.includes(slice)) slices.push(slice);
  return slice;
}

afterAll(async () => {
  for (const slice of slices) {
    await Bun.spawn(
      ['env', ...Object.entries(userBus).map(([k, v]) => `${k}=${v}`), 'systemctl', '--user', 'stop', slice],
      {
        stdout: 'ignore',
        stderr: 'ignore',
      },
    ).exited;
  }
});

type Cap = {
  proc: Bun.Subprocess;
  exited: Promise<number>;
  stderr: Promise<string>;
  stdout: Promise<string>;
};

function cap(argv: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): Cap {
  const proc: Bun.Subprocess = Bun.spawn(argv, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    proc,
    exited: proc.exited,
    stdout: new Response(proc.stdout).text(),
    stderr: new Response(proc.stderr).text(),
  };
}

async function waitFor(check: () => boolean, what: string, ms: number = WAIT_MS): Promise<void> {
  const begun: number = Date.now();
  while (!check()) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${what}`);
    await Bun.sleep(50);
  }
}

async function waitGone(path: string, ms: number = WAIT_MS): Promise<boolean> {
  const begun: number = Date.now();
  while (existsSync(path)) {
    if (Date.now() - begun > ms) return false;
    await Bun.sleep(50);
  }
  return true;
}

const pidAlive = (pid: number): boolean => existsSync(`/proc/${pid}`);

function rows(f: Fixture, kind: string): Record<string, unknown>[] {
  const file: string = resolve(f.root, 'issues/timings.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line: string) => line.startsWith('{'))
    .map((line: string) => JSON.parse(line) as Record<string, unknown>)
    .filter((row) => row.kind === kind);
}

function shimBin(f: Fixture): string {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin, { recursive: true });
  symlinkSync(entry, resolve(bin, 'akrogon'));
  return bin;
}

// The shells stand in for harness-launched tool shells: a harness-direct child at the scope
// root, a self-minted tools/t-<pid>-<starttime> holding the shell, and an akrogon phase child.
function callerScript(out: string, cg: string, tag: string): string {
  return [
    `mkdir -p "${out}"`,
    `sleep 600 & echo $! > "${out}/rootpid-${tag}"`,
    'st=$(cat /proc/$$/stat); st=${st##*) }; set -- $st',
    `d="${cg}/tools/t-$$-\${20}"`,
    'mkdir -p "$d" 2>/dev/null && echo $$ > "$d/cgroup.procs" 2>/dev/null',
    'export AKROGON_TOOL_CGROUP="$d"',
    `( akrogon phase tk implement --slot A > "${out}/${tag}.out" 2> "${out}/${tag}.err"; echo $? > "${out}/${tag}.code" ) &`,
    'sleep 600 &',
    'wait',
  ].join('\n');
}

// The looping tool shell: places itself and loops in the foreground, starting children forever.
function loopScript(cg: string): string {
  return [
    'st=$(cat /proc/$$/stat); st=${st##*) }; set -- $st',
    `d="${cg}/tools/t-$$-\${20}"`,
    'mkdir -p "$d" 2>/dev/null && echo $$ > "$d/cgroup.procs" 2>/dev/null',
    'while true; do sleep 5 & sleep 0.3; done',
  ].join('\n');
}

// The exited tool shell: places itself, disowns a setsid orphan into its t- and exits.
function exitLaunchScript(out: string, cg: string): string {
  return [
    'st=$(cat /proc/$$/stat); st=${st##*) }; set -- $st',
    `d="${cg}/tools/t-$$-\${20}"`,
    'mkdir -p "$d" 2>/dev/null && echo $$ > "$d/cgroup.procs" 2>/dev/null',
    `setsid sh -c 'echo $$ > "${out}/orphan.pid"; exec sleep 600' &`,
    `touch "${out}/sh3.ready"`,
    'exit 0',
  ].join('\n');
}

// Scope s3's payload runs both shapes side by side and idles at the root like a harness.
function s3Payload(loopPath: string, exitPath: string): string {
  return [`bash "${loopPath}" &`, `bash "${exitPath}" &`, 'wait'].join('\n');
}

// systemd-run --scope supervises the payload for the unit's whole life, so readiness is the
// scope's cgroup appearing; the handle is kept for teardown.
async function spawnScope(
  slice: string,
  unit: string,
  scriptPath: string,
  env: NodeJS.ProcessEnv,
  cwd: string,
): Promise<Cap> {
  const launched: Cap = cap(
    [
      SYSTEMD_RUN,
      '--user',
      '--scope',
      '--quiet',
      `--slice=${slice}`,
      `--unit=${unit}`,
      '-p',
      'Delegate=yes',
      '--',
      'bash',
      scriptPath,
    ],
    { env: { ...userBus, ...env }, cwd },
  );
  const deadline: number = Date.now() + WAIT_MS;
  while (!existsSync(`${sliceCgroup(slice)}/${unit}`)) {
    if (launched.proc.exitCode !== null) throw new Error(`systemd-run ${unit} exited early: ${await launched.stderr}`);
    if (Date.now() > deadline) throw new Error(`no cgroup for ${unit}`);
    await Bun.sleep(50);
  }
  return launched;
}

async function stopSliceNow(slice: string): Promise<void> {
  await Bun.spawn(
    ['env', ...Object.entries(userBus).map(([k, v]) => `${k}=${v}`), 'systemctl', '--user', 'stop', slice],
    { stdout: 'ignore', stderr: 'ignore' },
  ).exited;
}

function scopeEnv(f: Fixture): NodeJS.ProcessEnv {
  return {
    AKROGON_HOME: f.home,
    AKROGON_RUN: '',
    HERDR_PANE_ID: '',
    HOME: f.home,
    PATH: `${shimBin(f)}:${process.env.PATH}`,
  };
}

test.serial(
  'a committed phase move kills every tool cgroup of the leaf scopes, defers in-flight akrogon shells, and the rest survives',
  async () => {
    const f: Fixture = await fixture();
    try {
      yaml(resolve(f.root, 'issues/config.yaml'), { checks: {}, grounding: 'none' });
      const leafPath: string = leaf(f, 'tk', 'plan.synthesis');
      leaf(f, 'tk-none', 'plan.synthesis');
      const slice: string = testSlice(f, 'tk');
      const sliceDir: string = sliceCgroup(slice);
      const out: string = resolve(f.home, 'tk-out');
      mkdirSync(out, { recursive: true });

      const cg1: string = `${sliceDir}/tk-s1.scope`;
      const cg2: string = `${sliceDir}/tk-s2.scope`;
      const cg3: string = `${sliceDir}/tk-s3.scope`;
      const cg4: string = `${sliceDir}/tk-s4.scope`;

      // The lock is held before the akrogon children start so both are blocked on it when
      // the test releases: one winner commits while the loser waits, both in flight.
      let releaseLock: () => void = () => {};
      const lockHeld: Promise<void> = new Promise((done) => {
        void withLock(resolve(f.home, '.lock'), async () => {
          done();
          await new Promise<void>((release) => {
            releaseLock = release;
          });
        }).catch(() => {});
      });
      await lockHeld;

      const script1: string = resolve(f.home, 'shell1.sh');
      const script2: string = resolve(f.home, 'shell2.sh');
      const script3: string = resolve(f.home, 'shell3.sh');
      const script4: string = resolve(f.home, 'shell4.sh');
      writeFileSync(script1, callerScript(out, cg1, 'caller'));
      writeFileSync(script2, callerScript(out, cg2, 'sibling'));
      const loopSh: string = resolve(f.home, 'loop.sh');
      const exitSh: string = resolve(f.home, 'exitlaunch.sh');
      writeFileSync(loopSh, loopScript(cg3));
      writeFileSync(exitSh, exitLaunchScript(out, cg3));
      writeFileSync(script3, s3Payload(loopSh, exitSh));
      // s4 carries an empty tools/ only: a scope root bash that idles.
      writeFileSync(script4, `mkdir "${cg4}/tools" 2>/dev/null; touch "${out}/sh4.ready"; sleep 600 & wait\n`);

      const env: NodeJS.ProcessEnv = scopeEnv(f);
      const caps: Cap[] = [];
      try {
        caps.push(await spawnScope(slice, 'tk-s1.scope', script1, env, f.root));
        caps.push(await spawnScope(slice, 'tk-s2.scope', script2, env, f.root));
        caps.push(await spawnScope(slice, 'tk-s3.scope', script3, env, f.root));
        caps.push(await spawnScope(slice, 'tk-s4.scope', script4, env, f.root));

        await waitFor(
          () => existsSync(resolve(out, 'sh3.ready')) && existsSync(resolve(out, 'sh4.ready')),
          'scope shells ready',
        );
        await waitFor(() => existsSync(`${cg3}/tools`) && existsSync(`${cg4}/tools`), 'tools dirs');
        await waitFor(
          () =>
            existsSync(`${cg3}/tools`) && readdirSync(`${cg3}/tools`).filter((n) => n.startsWith('t-')).length === 2,
          'both s3 tool shells placed',
        );

        // Wait for both akrogon processes to relocate out of their t- cgroups into
        // akrogon/<t>. On the base they never relocate, so this times out and the test
        // fails downstream without killing anything itself.
        const deadline: number = Date.now() + 10_000;
        let relocated: number = 0;
        while (Date.now() < deadline) {
          relocated = [cg1, cg2].filter((cg) => {
            const akdir: string = `${cg}/akrogon`;
            if (!existsSync(akdir)) return false;
            return readdirSync(akdir).some((name: string) => {
              const events: string = `${akdir}/${name}/cgroup.events`;
              return existsSync(events) && readFileSync(events, 'utf8').includes('populated 1');
            });
          }).length;
          if (relocated === 2) break;
          await Bun.sleep(50);
        }

        const tdirsBefore = (cg: string): string[] =>
          existsSync(`${cg}/tools`) ? readdirSync(`${cg}/tools`).filter((n) => n.startsWith('t-')) : [];
        const t1: string[] = tdirsBefore(cg1);
        const t2: string[] = tdirsBefore(cg2);
        const t3: string[] = tdirsBefore(cg3);
        expect(t1).toHaveLength(1);
        expect(t2).toHaveLength(1);
        expect(t3).toHaveLength(2);

        const orphanPid: number = Number((await waitForFile(resolve(out, 'orphan.pid'))).trim());
        expect(pidAlive(orphanPid)).toBe(true);

        releaseLock();

        // Both akrogon calls finish: the winner commits, the loser refuses on the same move.
        const callerCode: string = (await waitForFile(resolve(out, 'caller.code'))).trim();
        const siblingCode: string = (await waitForFile(resolve(out, 'sibling.code'))).trim();
        const codes: string[] = [callerCode, siblingCode].sort();
        expect(codes[0]).toBe('0');
        expect(Number(codes[1])).toBeGreaterThan(0);
        expect(codes).not.toContain('137');
        const winnerOut: string =
          callerCode === '0'
            ? readFileSync(resolve(out, 'caller.out'), 'utf8')
            : readFileSync(resolve(out, 'sibling.out'), 'utf8');
        expect(winnerOut).toContain('moved implement');
        expect(readState(leafPath).phase).toBe('implement');

        // The sweep ran at all: one row per enumerated scope carrying tools/.
        expect(
          rows(f, 'tool_kill').filter((row) => row.slug === 'tk').length,
          'tool_kill rows exist for the committed move',
        ).toBe(3);

        // Sweep kills: t-loop and t-orphan contents die — the loop's latest child and the
        // disowned orphan — while neither shell was in flight.
        const t3dirs: string[] = t3.map((n) => `${cg3}/tools/${n}`);
        await waitFor(() => !pidAlive(orphanPid), 'orphan killed');
        for (const dir of t3dirs) {
          const events: string = `${dir}/cgroup.events`;
          if (existsSync(events)) {
            await waitFor(() => readFileSync(events, 'utf8').includes('populated 0'), `${dir} empty`);
          }
        }

        // Harness-direct scope-root processes are never killed.
        for (const tag of ['caller', 'sibling']) {
          const rootPid: number = Number(readFileSync(resolve(out, `rootpid-${tag}`), 'utf8').trim());
          expect(pidAlive(rootPid), `scope-root harness child of ${tag} alive`).toBe(true);
        }

        // Deferred shells stay live past the commit and past the loser's exit: the helper
        // waits for the tool shell, not for the akrogon process.
        for (const [cg, names] of [
          [cg1, t1],
          [cg2, t2],
        ] as const) {
          for (const name of names) {
            expect(existsSync(`${cg}/tools/${name}`), `${name} deferred, not killed at commit`).toBe(true);
          }
        }

        // After the loser's akrogon is gone the sibling t- still stands: the deferral keys on
        // the tool shell, not on the akrogon call.
        expect(existsSync(`${cg2}/tools/${t2[0]}`)).toBe(true);

        // Kill both tool shells: each detached helper fires and removes exactly its own t-,
        // shell children included.
        for (const [cg, names] of [
          [cg1, t1],
          [cg2, t2],
        ] as const) {
          for (const name of names) {
            const procs: string = `${cg}/tools/${name}/cgroup.procs`;
            const shellPid: number = Number(readFileSync(procs, 'utf8').trim().split('\n')[0]);
            process.kill(shellPid, 'SIGKILL');
            expect(await waitGone(`${cg}/tools/${name}`), `${name} removed after its shell died`).toBe(true);
          }
        }

        // One tool_kill row per enumerated scope carrying tools/, none for the absent slice.
        const kills = rows(f, 'tool_kill').filter((row) => row.slug === 'tk');
        const byUnit: Map<string, Record<string, unknown>> = new Map(kills.map((row) => [row.unit as string, row]));
        expect(byUnit.get('tk-s1.scope')?.seen).toBe(1);
        expect(byUnit.get('tk-s2.scope')?.seen).toBe(1);
        expect(byUnit.get('tk-s3.scope')?.seen).toBe(t3.length);
        expect(byUnit.get('tk-s1.scope')?.deferred).toEqual(t1);
        expect(byUnit.get('tk-s2.scope')?.deferred).toEqual(t2);
        expect(byUnit.get('tk-s1.scope')?.errors).toBe(0);
        expect(byUnit.get('tk-s3.scope')?.errors).toBe(0);
        expect(rows(f, 'tool_kill').some((row) => row.slug === 'tk-none')).toBe(false);

        // The detached helpers report their kills after the shells die.
        await waitFor(
          () => rows(f, 'tool_kill_deferred').filter((row) => row.slug === 'tk').length >= 2,
          'deferred rows',
        );
        const deferredRows = rows(f, 'tool_kill_deferred').filter((row) => row.slug === 'tk');
        expect(deferredRows.map((row) => row.t).sort()).toEqual([...t1, ...t2].sort());
        for (const row of deferredRows) expect(row.outcome).toBe('written');

        // A committed move on a leaf whose slice directory never existed: no warning, no rows.
        const none = await cli(f, ['phase', 'tk-none', 'implement', '--slot', 'A'], f.root);
        expect(none.code, `stdout: ${none.stdout} stderr: ${none.stderr}`).toBe(0);
        expect(none.stderr).not.toContain('tk-none');
        expect(rows(f, 'tool_kill').some((row) => row.slug === 'tk-none')).toBe(false);

        // Scope s4 carried an empty tools/: a row with seen 0 and no warning.
        const s4row = rows(f, 'tool_kill').find((row) => row.unit === 'tk-s4.scope');
        expect(s4row?.seen).toBe(0);
        const winnerErr: string =
          callerCode === '0'
            ? readFileSync(resolve(out, 'caller.err'), 'utf8')
            : readFileSync(resolve(out, 'sibling.err'), 'utf8');
        expect(winnerErr).not.toContain('tk-s4.scope');
      } finally {
        releaseLock();
        await stopSliceNow(slice);
        for (const c of caps) {
          if (c.proc.exitCode === null) c.proc.kill('SIGKILL');
          void c.stderr;
          void c.stdout;
        }
      }
    } finally {
      f.clean();
    }
  },
);

async function waitForFile(path: string, ms: number = WAIT_MS): Promise<string> {
  await waitFor(() => existsSync(path), path, ms);
  const begun: number = Date.now();
  for (;;) {
    const text: string = readFileSync(path, 'utf8');
    if (text.trim() !== '') return text;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for content in ${path}`);
    await Bun.sleep(50);
  }
}

// Criterion 2's writer case: a run-check whose stdout pipe reader is gone mid-run still
// publishes everything and exits with the command's exit code.
test.serial(
  'a run-check writer with a closed stdout pipe publishes its evidence and exits with the run code',
  async () => {
    const f: Fixture = await fixture();
    try {
      yaml(resolve(f.root, 'issues/config.yaml'), { checks: {}, grounding: 'none' });
      const holder: string = resolve(f.home, 'writer-holder');
      mkdirSync(holder);
      const out: string = resolve(f.home, 'writer-out');
      mkdirSync(out);
      const script: string = [
        `echo writer-marker`,
        `touch "${out}/ready"`,
        `while [ ! -e "${out}/release" ]; do sleep 0.05; done`,
        `exit 7`,
      ].join('; ');
      const proc: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
        [process.execPath, entry, 'run-check', '--holder', holder, '--name', 'writer', '--', 'sh', '-c', script],
        {
          cwd: f.root,
          env: {
            ...process.env,
            AKROGON_HOME: f.home,
            HOME: f.home,
            AKROGON_RUN: '',
            HERDR_PANE_ID: '',
          },
          stdin: 'ignore',
          stdout: 'pipe',
          stderr: 'pipe',
        },
      );
      try {
        await waitFor(() => existsSync(resolve(out, 'ready')), 'run-check command started');
        // The reader closes mid-run: the pipe's read end is gone before the writer echoes.
        await proc.stdout.cancel();
        writeFileSync(resolve(out, 'release'), '');
        const code: number = await proc.exited;
        expect(code, 'writer exits with the command code').toBe(7);
        const kept: string[] = readdirSync(holder).filter(
          (name) => name.startsWith('check-writer-') && name.endsWith('.log'),
        );
        expect(kept).toHaveLength(1);
        expect(readFileSync(resolve(holder, kept[0]), 'utf8')).toContain('writer-marker');
        expect(readdirSync(holder).some((name) => name.startsWith('capture-'))).toBe(false);
        const ends = rows(f, 'check_end');
        expect(ends.some((row) => row.name === 'writer' && row.exit === 7)).toBe(true);
      } finally {
        if (proc.exitCode === null) proc.kill('SIGKILL');
        await proc.exited.catch(() => 0);
      }
    } finally {
      f.clean();
    }
  },
);

// Criterion 4: kill and deferral-spawn failures warn on stderr with leaf, unit, t- and error,
// the move stays committed, and the tool_kill rows carry the error count.
test.serial('a failed kill or deferral spawn warns and the committed move stands', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: {}, grounding: 'none' });
    const fakeRoot: string = mkdtempSync('/tmp/akr-fakecg-');
    try {
      const env = { AKROGON_CGROUP_ROOT: fakeRoot };

      // Case one: the cgroup.kill write itself fails (a directory there reads EISDIR).
      const leafA: string = leaf(f, 'tk-warn-a', 'plan.synthesis');
      const sliceA: string = testSlice(f, 'tk-warn-a');
      const scopeA: string = sliceCgroup(sliceA).replace(/^\/sys\/fs\/cgroup/, fakeRoot) + '/wa.scope';
      mkdirSync(resolve(scopeA, 'tools', 't-11-1'), { recursive: true });
      mkdirSync(resolve(scopeA, 'tools', 't-11-1', 'cgroup.kill'));
      const a = await cli(f, ['phase', 'tk-warn-a', 'implement', '--slot', 'A'], f.root, env);
      expect(a.code, `stdout: ${a.stdout} stderr: ${a.stderr}`).toBe(0);
      expect(a.stdout).toContain('moved implement');
      expect(readState(leafA).phase).toBe('implement');
      const warnA = warnings(a.stderr);
      expect(warnA.length).toBeGreaterThanOrEqual(1);
      expect(warnA[0].leaf).toBe('tk-warn-a');
      expect(warnA[0].unit).toBe('wa.scope');
      expect(String(warnA[0].t)).toMatch(/^t-11-1/);
      expect(String(warnA[0].error ?? '')).not.toBe('');
      const rowsA = rows(f, 'tool_kill').filter((row) => row.slug === 'tk-warn-a');
      expect(rowsA).toHaveLength(1);
      expect(Number(rowsA[0].errors)).toBeGreaterThanOrEqual(1);

      // Case two: the deferral helper spawn fails (setsid is present but not executable).
      const leafB: string = leaf(f, 'tk-warn-b', 'plan.synthesis');
      const sliceB: string = testSlice(f, 'tk-warn-b');
      const scopeB: string = sliceCgroup(sliceB).replace(/^\/sys\/fs\/cgroup/, fakeRoot) + '/wb.scope';
      mkdirSync(resolve(scopeB, 'tools', 't-12-1'), { recursive: true });
      mkdirSync(resolve(scopeB, 'akrogon', 't-12-1'), { recursive: true });
      writeFileSync(resolve(scopeB, 'akrogon', 't-12-1', 'cgroup.events'), 'populated 1\n');
      const badBin: string = resolve(f.home, 'bad-bin');
      mkdirSync(badBin);
      writeFileSync(resolve(badBin, 'setsid'), 'not executable\n');
      const b = await cli(f, ['phase', 'tk-warn-b', 'implement', '--slot', 'A'], f.root, {
        ...env,
        PATH: `${badBin}:${process.env.PATH}`,
      });
      expect(b.code, `stdout: ${b.stdout} stderr: ${b.stderr}`).toBe(0);
      expect(b.stdout).toContain('moved implement');
      expect(readState(leafB).phase).toBe('implement');
      const warnB = warnings(b.stderr);
      expect(warnB.length).toBeGreaterThanOrEqual(1);
      expect(warnB[0].leaf).toBe('tk-warn-b');
      expect(warnB[0].unit).toBe('wb.scope');
      expect(warnB[0].t).toBe('t-12-1');
      const rowsB = rows(f, 'tool_kill').filter((row) => row.slug === 'tk-warn-b');
      expect(rowsB).toHaveLength(1);
      expect(rowsB[0].deferred).toEqual(['t-12-1']);
      expect(Number(rowsB[0].errors)).toBeGreaterThanOrEqual(1);
    } finally {
      rmSync(fakeRoot, { recursive: true, force: true });
    }
  } finally {
    f.clean();
  }
});

function warnings(stderr: string): Record<string, unknown>[] {
  return stderr
    .split('\n')
    .filter((line) => line.startsWith('{') && line.includes('"tool_kill"'))
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}
