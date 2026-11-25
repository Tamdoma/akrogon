// Criterion 3: the entry places every harness-spawned bash tool shell exactly once when the
// shell is execed at the seat scope's root, never anywhere else, never changes the command's
// output or exit status, the seat argv carries Delegate=yes and the per-kind wiring, and
// startSeat creates the scope's tools/, akrogon/ and helpers/ — a bootstrap failure ends the start.
import { test, expect, afterAll } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync, readdirSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { hcCore, setSeat, stopCoresAfterFile, type HcCore } from './hc-fixture';
import { leafSlice, sliceCgroup } from '../src/scope';
import { spawnCaptured } from '../src/shell';

stopCoresAfterFile();

const uid: number = process.getuid!();
const SYSTEMD_RUN: string = Bun.which('systemd-run') ?? '/usr/bin/systemd-run';
const userBus: NodeJS.ProcessEnv = {
  XDG_RUNTIME_DIR: `/run/user/${uid}`,
  DBUS_SESSION_BUS_ADDRESS: `unix:path=/run/user/${uid}/bus`,
};

const slices: string[] = [];
afterAll(async () => {
  for (const slice of slices) {
    await Bun.spawn(
      ['env', ...Object.entries(userBus).map(([k, v]) => `${k}=${v}`), 'systemctl', '--user', 'stop', slice],
      { stdout: 'ignore', stderr: 'ignore' },
    ).exited;
  }
});

const CMD: string = 'cat /proc/$$/cgroup > "$OUT/$N.cg"; echo "out-$N"; echo "err-$N" >&2; exit 3';

// Case bodies run inside one real delegated scope: the script writes the scope root, then runs
// each wiring shape with the command above and records where the command's shell sat.
function scopeScript(): string {
  return [
    "root=/sys/fs/cgroup$(sed -n 's/^0:://p' /proc/self/cgroup)",
    'echo "$root" > "$OUT/root"',
    'export AKROGON_SEAT_CGROUP="$root"',
    // f first: the deterministic placement failure — max.depth 1 bars tools/t-* creation.
    // The command still runs, unplaced, with its output and exit code unchanged.
    'mkdir "$root/tools" 2>/dev/null',
    'echo 1 > "$root/cgroup.max.depth" 2>/dev/null',
    'BASH_ENV="$ENTRY/bash-env" OUT="$OUT" N=f bash -c \'eval "$CMD"\' > "$OUT/f.out" 2> "$OUT/f.err"; echo $? > "$OUT/f.code"',
    'echo 32 > "$root/cgroup.max.depth" 2>/dev/null',
    // a: the pi/codex wiring shape.
    'BASH_ENV="$ENTRY/bash-env" OUT="$OUT" N=a bash -c \'eval "$CMD"\' > "$OUT/a.out" 2> "$OUT/a.err"; echo $? > "$OUT/a.code"',
    // b: the claude wiring shape — the wrapper is the shell.
    'OUT="$OUT" N=b "$ENTRY/bash" -c \'eval "$CMD"\' > "$OUT/b.out" 2> "$OUT/b.err"; echo $? > "$OUT/b.code"',
    // c: the agy wiring shape — the wrapper is first on PATH.
    'PATH="$ENTRY:$PATH" OUT="$OUT" N=c bash -c \'eval "$CMD"\' > "$OUT/c.out" 2> "$OUT/c.err"; echo $? > "$OUT/c.code"',
    // r: the reference run with no wiring at all.
    'OUT="$OUT" N=r bash -c \'eval "$CMD"\' > "$OUT/r.out" 2> "$OUT/r.err"; echo $? > "$OUT/r.code"',
    // d: a nested shell inside a placed shell keeps the outer placement.
    'BASH_ENV="$ENTRY/bash-env" OUT="$OUT" bash -c \'cat /proc/$$/cgroup > "$OUT/d-outer.cg"; N=d bash -c "eval \\"$CMD\\"" > "$OUT/d.out" 2> "$OUT/d.err"; echo $? > "$OUT/d.code"\'',
    // g: /bin/sh never sources BASH_ENV — unplaced, output unchanged.
    'BASH_ENV="$ENTRY/bash-env" OUT="$OUT" N=g sh -c \'eval "$CMD"\' > "$OUT/g.out" 2> "$OUT/g.err"; echo $? > "$OUT/g.code"',
    'echo done > "$OUT/done"',
    'exit 0',
  ].join('\n');
}

test.serial('the entry places a bash tool shell exactly once at the scope root and nowhere else', async () => {
  const f: Fixture = await fixture();
  try {
    const home: string = resolve(f.home, 'entryhome');
    mkdirSync(home, { recursive: true });
    const { refreshToolEntry } = await import('../src/tool-cgroup');
    refreshToolEntry(home);
    const entry: string = resolve(home, 'tool-entry');
    expect(existsSync(resolve(entry, 'bash'))).toBe(true);
    expect(existsSync(resolve(entry, 'bash-env'))).toBe(true);

    const out: string = resolve(f.home, 'entry-out');
    mkdirSync(out, { recursive: true });
    const script: string = resolve(f.home, 'entry-scope.sh');
    writeFileSync(script, scopeScript());
    const slice: string = `akrogon-tentry-p${process.pid}.slice`;
    slices.push(slice);
    const env: NodeJS.ProcessEnv = {
      ...userBus,
      ENTRY: entry,
      OUT: out,
    };
    const launched = Bun.spawn(
      [
        SYSTEMD_RUN,
        '--user',
        '--scope',
        '--quiet',
        `--slice=${slice}`,
        '--unit=tentry.scope',
        '-p',
        'Delegate=yes',
        '--setenv=ENTRY',
        '--setenv=OUT',
        '--',
        'bash',
        script,
      ],
      { env: { ...process.env, ...env }, stdout: 'pipe', stderr: 'pipe' },
    );
    expect(await launched.exited, `stderr: ${await new Response(launched.stderr).text()}`).toBe(0);
    const deadline: number = Date.now() + 20_000;
    while (!existsSync(resolve(out, 'done'))) {
      if (Date.now() > deadline) throw new Error('entry scope script did not finish');
      await Bun.sleep(50);
    }

    const read = (name: string): string => readFileSync(resolve(out, name), 'utf8');
    const cgOf = (n: string): string => read(`${n}.cg`).trim();
    const root: string = read('root').trim();

    // Reference shape: unplaced, exact output, exit 3.
    expect(read('r.out')).toBe('out-r\n');
    expect(read('r.err')).toBe('err-r\n');
    expect(read('r.code').trim()).toBe('3');
    expect(cgOf('r')).toBe(`0::${root.replace('/sys/fs/cgroup', '')}\n`.trim());

    for (const n of ['a', 'b', 'c']) {
      expect(read(`${n}.out`), `${n} stdout`).toBe('out-' + n + '\n');
      expect(read(`${n}.err`), `${n} stderr`).toBe('err-' + n + '\n');
      expect(read(`${n}.code`).trim(), `${n} exit code`).toBe('3');
      expect(cgOf(n), `${n} placed in tools/t-`).toMatch(
        new RegExp(`^0::${escapeRe(root)}/tools/t-\\d+-\\d+$`.replace(/^0::/, '0::')),
      );
    }

    // Nested: the inner shell keeps the outer shell's t-, no second placement.
    expect(read('d.out')).toBe('out-d\n');
    expect(read('d.code').trim()).toBe('3');
    expect(cgOf('d')).toBe(read('d-outer.cg').trim());
    expect(cgOf('d')).toContain('/tools/t-');

    // Placement failure: unplaced but unchanged output and exit code.
    expect(read('f.out')).toBe('out-f\n');
    expect(read('f.err')).toBe('err-f\n');
    expect(read('f.code').trim()).toBe('3');
    expect(cgOf('f')).not.toContain('/tools/t-');

    // /bin/sh never sources BASH_ENV: unplaced, unchanged.
    expect(read('g.out')).toBe('out-g\n');
    expect(read('g.code').trim()).toBe('3');
    expect(cgOf('g')).not.toContain('/tools/t-');

    // Outside the scope root entirely: the same env is inert in the test process.
    const outsideOut: string = resolve(out, 'outside.cg');
    const outside = await spawnCaptured(
      [
        'env',
        `BASH_ENV=${resolve(entry, 'bash-env')}`,
        `AKROGON_SEAT_CGROUP=${root}`,
        'bash',
        '-c',
        `cat /proc/$$/cgroup > "${outsideOut}"; echo outside-ok`,
      ],
      { env: { ...process.env } },
    );
    expect(outside.code).toBe(0);
    expect(outside.stdout).toBe('outside-ok\n');
    expect(readFileSync(outsideOut, 'utf8')).not.toContain('/tools/t-');
  } finally {
    f.clean();
  }
});

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The shim joins argv with tabs.
function shimRuns(log: string): string[] {
  return readFileSync(log, 'utf8')
    .split('\n')
    .filter((line) => line.split('\t')[0] === 'run');
}

async function startAndReadArgv(
  f: Fixture,
  core: HcCore,
  kind: string,
  slug: string,
): Promise<{ argv: string; unit: string }> {
  const before: number = shimRuns(core.shimLog).length;
  const started = await cli(f, ['seat', slug, 'A'], f.root, core.env);
  expect(started.code, `stdout: ${started.stdout} stderr: ${started.stderr}`).toBe(0);
  const lines: string[] = shimRuns(core.shimLog);
  expect(lines.length).toBeGreaterThan(before);
  const argv: string = lines[lines.length - 1];
  const unit: string = /--unit=(\S+)/.exec(argv)?.[1] ?? '';
  expect(unit).not.toBe('');
  return { argv, unit };
}

test.serial('the seat launch argv carries Delegate=yes, the scope env marker and the per-kind wiring', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    // pi and codex join the stand-in names the fixture already links.
    const standinBin: string | undefined = readdirSync(f.home)
      .filter((name) => name.startsWith('standin-bin-'))
      .map((name) => resolve(f.home, name))[0];
    expect(standinBin).toBeDefined();
    for (const name of ['pi', 'codex']) {
      const target: string = resolve(standinBin as string, name);
      if (!existsSync(target)) symlinkSync(resolve(standinBin as string, 'fake'), target);
    }

    for (const [kind, slug] of [
      ['claude', 'te-claude'],
      ['pi', 'te-pi'],
      ['codex', 'te-codex'],
      ['agy', 'te-agy'],
      ['fake', 'te-fake'],
    ] as const) {
      setSeat(f, 'a', kind, 'work');
      leaf(f, slug, 'plan.synthesis');
      const { argv, unit } = await startAndReadArgv(f, core, kind, slug);
      expect(argv, `${kind} Delegate`).toContain('Delegate=yes');
      const slice: string = leafSlice({ name: f.repo }, slug, f.home);
      const expectedCgroup: string = `${sliceCgroup(slice)}/${unit}`;
      expect(argv, `${kind} seat cgroup marker`).toContain(`AKROGON_SEAT_CGROUP=${expectedCgroup}`);
      const entryDir: string = resolve(f.home, 'tool-entry');
      const marker = (name: string): boolean => argv.includes(`${name}=`);
      if (kind === 'claude') {
        expect(argv).toContain(`CLAUDE_CODE_SHELL=${resolve(entryDir, 'bash')}`);
        expect(argv).toContain('CLAUDE_CODE_TOOL_MEMORY_LIMIT=none');
        expect(marker('BASH_ENV')).toBe(false);
      } else if (kind === 'agy') {
        const pathEntry: string | undefined = argv.match(/(?:^|\s)PATH=(\S+)/)?.[1];
        expect(pathEntry, 'agy PATH wiring').toBeDefined();
        expect((pathEntry as string).split(':')[0]).toBe(entryDir);
      } else {
        expect(argv, `${kind} BASH_ENV`).toContain(`BASH_ENV=${resolve(entryDir, 'bash-env')}`);
      }
      // The bootstrap created the scope's three directories.
      expect(existsSync(resolve(expectedCgroup, 'tools')), `${kind} tools/`).toBe(true);
      expect(existsSync(resolve(expectedCgroup, 'akrogon')), `${kind} akrogon/`).toBe(true);
      expect(existsSync(resolve(expectedCgroup, 'helpers')), `${kind} helpers/`).toBe(true);
      // argv[0] of the seat stays systemd-run for the lost-seat boundary.
      expect(argv.split('\t')).toContain('systemd-run');
      expect(argv.split('\t').indexOf('systemd-run')).toBe(argv.split('\t').indexOf('--') + 1);
    }
  } finally {
    await core.stop();
    for (const slug of ['te-claude', 'te-pi', 'te-codex', 'te-agy', 'te-fake']) {
      const slice: string = leafSlice({ name: f.repo }, slug, f.home);
      slices.push(slice);
    }
    f.clean();
  }
});

test.serial('a bootstrap failure fails the seat start and ends the terminal', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    setSeat(f, 'a', 'fake', 'work');
    leaf(f, 'te-bootfail', 'plan.synthesis');
    // The scope path inside the fake cgroup root is blocked by a plain file where user.slice
    // would be a directory: every mkdir of the bootstrap fails regardless of recursion.
    const fakeRoot: string = resolve(f.home, 'fakecg');
    mkdirSync(fakeRoot, { recursive: true });
    writeFileSync(resolve(fakeRoot, 'user.slice'), 'blocked\n');
    chmodSync(resolve(fakeRoot, 'user.slice'), 0o444);
    const started = await cli(f, ['seat', 'te-bootfail', 'A'], f.root, {
      ...core.env,
      AKROGON_CGROUP_ROOT: fakeRoot,
    });
    expect(started.code, `stdout: ${started.stdout} stderr: ${started.stderr}`).not.toBe(0);
    const left: unknown[] = await core.terminals({ akrogon: '1', 'akrogon.leaf': 'te-bootfail' });
    expect(left.filter((t) => (t as { state: string }).state === 'live')).toEqual([]);
  } finally {
    await core.stop();
    const slice: string = leafSlice({ name: f.repo }, 'te-bootfail', f.home);
    slices.push(slice);
    f.clean();
  }
});
