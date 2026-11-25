import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  cli,
  entry,
  fakeAkrogon,
  fixture,
  leaf,
  leafTempRoot,
  storeDir,
  unitBin,
  yaml,
  WAIT_MS,
  type Fixture,
} from './helpers';
import { command, finishCaptured, spawnFiles } from '../src/shell';
import { readRepo } from '../src/config';
import { createSparseWorktree } from '../src/next';
import { readTimings, type TimingEvent } from '../src/timing';
import { readVerifyRuns } from '../src/verify';
import { writeYaml } from '../src/shell';

// A leaf folder whose state.yaml carries the direct-leaf shape: written through leaf() first,
// then rewritten with direct: true, a full-ISO creation time, empty frozen records and the
// door/reviewer seat refs the create verb records. At base the strictObject schema rejects
// the direct key, so every read of this state fails — the honest red at planning.
function directLeaf(f: Fixture, slug: string, phase: string, created: string, extra: object = {}): string {
  const path: string = leaf(f, slug, phase, { created, frozen: {}, frozen_cited: [], ...extra });
  const file: string = resolve(path, 'state.yaml');
  const written: object = Bun.YAML.parse(readFileSync(file, 'utf8')) as object;
  writeYaml(file, {
    ...written,
    direct: true,
    created,
    seat: {
      A: { session: 'dr-session', address: 'w1:a-door' },
      B: { session: 'dr-session', address: 'w1:b-reviewer' },
    },
  });
  return path;
}

// The direct leaf's real sparse worktree on its own branch, built with the product helper.
async function directWorktree(f: Fixture, slug: string): Promise<{ leafPath: string; worktree: string }> {
  const at: string = resolve(storeDir(f), slug);
  await createSparseWorktree(readRepo(f.repo, f.root), at, 'origin/main', { branch: slug });
  const worktree: string = realpathSync(at);
  const leafPath: string = directLeaf(f, slug, 'implement', new Date().toISOString(), { worktree });
  return { leafPath, worktree };
}

// The env run-check tests construct for raw spawns, mirroring cli() (tests/run-check.test.ts).
function runEnv(f: Fixture): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
    AKROGON_RUN: '',
    PATH: `${unitBin(f)}:${process.env.PATH}`,
  };
}

async function waitForFile(path: string, ms: number = WAIT_MS): Promise<void> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(20);
  }
}

function checkRows(f: Fixture, slug: string): TimingEvent[] {
  return readTimings(f.root).filter(
    (event) => (event.kind === 'check_start' || event.kind === 'check_end') && event.slug === slug,
  );
}

const admissionSchema = z.looseObject({
  repo: z.string(),
  leaf: z.string(),
  check: z.string(),
  state: z.string(),
});

test('run-check from the direct leaf worktree attributes the run, the timings rows and the log to the leaf', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await directWorktree(f, 'dc-run');
    const result = await cli(f, ['run-check', '--name', 'dcrun', '--', 'sh', '-c', 'true'], worktree);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stderr).toContain('check dcrun: 0');
    const rows: TimingEvent[] = checkRows(f, 'dc-run');
    expect(rows.some((event) => event.kind === 'check_start' && event.name === 'dcrun')).toBe(true);
    expect(
      rows.some((event) => event.kind === 'check_end' && event.name === 'dcrun' && event.exit === 0),
    ).toBe(true);
    const logs: string[] = readdirSync(resolve(leafPath, 'implementation')).filter((name) =>
      /^check-dcrun-.+\.log$/.test(name),
    );
    expect(logs).toHaveLength(1);

    // The admission record of a live run carries the leaf slug: hold one open and read it.
    const dir: string = resolve(f.home, 'gate');
    mkdirSync(dir);
    const held: string = resolve(dir, 'held');
    const release: string = resolve(dir, 'release');
    const spawned = spawnFiles(
      [
        process.execPath,
        entry,
        'run-check',
        '--name',
        'dcblock',
        '--',
        'sh',
        '-c',
        `touch ${held}; while [ ! -e ${release} ]; do sleep 0.05; done`,
      ],
      { cwd: worktree, env: runEnv(f) },
    );
    try {
      await waitForFile(held);
      const runsDir: string = resolve(f.home, 'runs');
      const names: string[] = readdirSync(runsDir).filter((name) => name.endsWith('.yaml'));
      expect(names).toHaveLength(1);
      const record: z.infer<typeof admissionSchema> = admissionSchema.parse(
        Bun.YAML.parse(readFileSync(resolve(runsDir, names[0]), 'utf8')),
      );
      expect(record.leaf).toBe('dc-run');
      expect(record.repo).toBe(f.repo);
      expect(record.check).toBe('dcblock');
      expect(record.state).toBe('live');
    } finally {
      writeFileSync(release, '');
    }
    const blocked = await finishCaptured(spawned.child, spawned.captured);
    expect(blocked.code).toBe(0);
    expect(
      readTimings(f.root).some(
        (event) => event.kind === 'check_end' && event.slug === 'dc-run' && event.name === 'dcblock' && event.exit === 0,
      ),
    ).toBe(true);
  } finally {
    f.clean();
  }
});

test('verify from the direct leaf worktree records the leaf slug and publishes logs under its implementation folder', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { ok: 'true' }, grounding: 'none' });
    const { leafPath, worktree } = await directWorktree(f, 'dc-verify');
    const result = await cli(f, ['verify'], worktree, fakeAkrogon(f).env);
    expect(result.code, result.stderr).toBe(0);
    const records = readVerifyRuns(readRepo(f.repo, f.root));
    expect(records.length).toBeGreaterThan(0);
    const record = records.at(-1)!;
    expect(record.leaf).toBe('dc-verify');
    expect(record.scope).toBe('leaf');
    expect(record.sha).toBe(await command(['git', 'rev-parse', 'HEAD'], worktree));
    expect(record.commands.map((item) => [item.name, item.exit])).toEqual([['ok', 0]]);
    expect(record.commands[0].log.startsWith(resolve(leafPath, 'implementation') + '/check-')).toBe(true);
    expect(
      readTimings(f.root).some(
        (event) => event.kind === 'check_end' && event.slug === 'dc-verify' && event.name === 'ok' && event.exit === 0,
      ),
    ).toBe(true);
  } finally {
    f.clean();
  }
});

test('the same run from the repo root attributes no leaf', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath } = await directWorktree(f, 'dc-ctl');
    const refused = await cli(f, ['run-check', '--name', 'ctlrun', '--', 'sh', '-c', 'true'], f.root);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('--holder');
    const holder: string = resolve(f.home, 'holder');
    mkdirSync(holder);
    const held = await cli(f, ['run-check', '--name', 'ctlrun', '--holder', holder, '--', 'sh', '-c', 'true'], f.root);
    expect(held.code, held.stderr).toBe(0);
    const rows: Extract<TimingEvent, { kind: 'check_start' | 'check_end' }>[] = readTimings(f.root).filter(
      (event): event is Extract<TimingEvent, { kind: 'check_start' | 'check_end' }> =>
        (event.kind === 'check_start' || event.kind === 'check_end') && event.name === 'ctlrun',
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const event of rows) expect(event.slug).toBe('checkout');
    expect(readdirSync(holder).filter((name) => /^check-ctlrun-.+\.log$/.test(name))).toHaveLength(1);
    expect(existsSync(resolve(leafPath, 'implementation'))).toBe(false);
  } finally {
    f.clean();
  }
});
