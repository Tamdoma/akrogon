// Criteria 1+2: akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...
// creates a direct leaf (state.yaml with direct: true, seat refs, worktree, .env, no tab),
// refuses the bad shapes writing nothing, and a rerun rewrites only seats.
import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, storeDir, type Fixture } from './helpers';
import { adopt, hcFixture, stopCoresAfterFile, type HcFixture } from './hc-fixture';
import { command, type Result } from '../src/shell';

stopCoresAfterFile();

type Raw = Record<string, unknown>;

// The state.yaml the verb wrote, read as raw yaml: the product schema has no direct field yet, so
// readState cannot read a direct leaf, and the assertions must see unvalidated keys like tab.
function readRaw(path: string): Raw {
  return z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8')));
}

// A raw write through rename, like the product's own writeYaml, so a read-only state.yaml is replaced.
function writeRaw(path: string, data: Raw): void {
  const file: string = resolve(path, 'state.yaml');
  const temp: string = resolve(path, 'state.yaml.write.tmp');
  writeFileSync(temp, Bun.YAML.stringify(data));
  renameSync(temp, file);
}

// The door files of a direct leaf (plan criterion 1): ISSUE.md, brief.md and design.md in the leaf
// folder, no state.yaml; the owner folder carries its own ISSUE.md, moved with it by direct-drop.
function doorFiles(f: Fixture, owner: string, slug: string): string {
  const ownerPath: string = resolve(f.root, 'issues/open', owner);
  const leafPath: string = resolve(ownerPath, slug);
  mkdirSync(leafPath, { recursive: true });
  writeFileSync(resolve(ownerPath, 'ISSUE.md'), '# ' + owner + '\n');
  writeFileSync(resolve(leafPath, 'ISSUE.md'), '# ' + owner + '\n');
  writeFileSync(resolve(leafPath, 'brief.md'), '# Brief: ' + slug + '\n');
  writeFileSync(resolve(leafPath, 'design.md'), '# Design: ' + slug + '\n');
  return leafPath;
}

// A plain terminal in the fixture core, labelled and adopted the way a charting terminal is:
// the door and the reviewer are ordinary terminals the command must probe by address.
async function standin(f: HcFixture, name: string): Promise<string> {
  const started = await f.core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--name',
    name,
    '--cwd',
    f.root,
    '--label',
    'akrogon=1',
    '--label',
    'herdr.space=sp-' + f.core.session,
    '--label',
    'herdr.tab=' + name,
    '--',
    'cat',
  ]);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

async function direct(f: HcFixture, slug: string, flags: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['direct', slug, ...flags], f.root, { ...f.env, ...env });
}

// One env var in the fixture repo config, so env_names and the worktree .env have observable content.
function configEnv(f: Fixture): void {
  writeFileSync(resolve(f.root, '.env'), 'AKROGON_DIRECT_TEST=alpha\n');
  writeFileSync(
    resolve(f.root, 'issues/config.yaml'),
    Bun.YAML.stringify({ checks: { test: 'bun test' }, grounding: 'none', env: ['AKROGON_DIRECT_TEST'] }),
  );
}

async function worktreeBranch(worktree: string): Promise<string> {
  return command(['git', '-C', worktree, 'rev-parse', '--abbrev-ref', 'HEAD'], worktree);
}

async function worktreeHead(worktree: string): Promise<string> {
  return command(['git', '-C', worktree, 'rev-parse', 'HEAD'], worktree);
}

async function base(f: Fixture): Promise<string> {
  return command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
}

async function branchExists(f: Fixture, slug: string): Promise<boolean> {
  const listing: string = await command(['git', 'branch', '--list', slug], f.root);
  return listing.trim() !== '';
}

// The porcelain stanza of one worktree path, for the lock assertion.
async function worktreeStanza(f: Fixture, worktree: string): Promise<string> {
  const output: string = await command(['git', 'worktree', 'list', '--porcelain'], f.root);
  const real: string = realpathSync(worktree);
  const stanza: string | undefined = output
    .split('\n\n')
    .find(
      (block) => block.startsWith('worktree ') && realpathSync(block.split('\n')[0].slice('worktree '.length)) === real,
    );
  expect(stanza, 'no worktree stanza for ' + worktree + ' in: ' + output).toBeDefined();
  return z.string().parse(stanza);
}

function leafRow(f: HcFixture, stdout: string, slug: string): Raw | undefined {
  const envelope = z
    .object({
      repos: z.array(z.object({ name: z.string(), leaves: z.array(z.object({ slug: z.string() }).loose()) })),
    })
    .parse(JSON.parse(stdout));
  const repo = envelope.repos.find((r) => r.name === f.repo);
  return repo?.leaves.find((row) => row.slug === slug);
}

// What a refusal must not have produced: no worktree in the store, no leaf branch.
async function expectNothingCreated(f: HcFixture, slug: string): Promise<void> {
  expect(existsSync(resolve(storeDir(f), slug))).toBe(false);
  expect(await branchExists(f, slug)).toBe(false);
}

test('direct creates the leaf: state, seats, worktree, env file and status visibility', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    configEnv(f);
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const created: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(created.code, created.stderr).toBe(0);
    // The verb's two stdout lines name the leaf folder and the worktree (plan Interfaces);
    // paths print canonical, the form readRepo resolves them in.
    expect(created.stdout).toContain(realpathSync(leafPath));
    expect(created.stdout).toContain(realpathSync(resolve(storeDir(f), 'fix-alpha')));
    const state: Raw = readRaw(leafPath);
    expect(state.direct).toBe(true);
    expect(state.phase).toBe('implement');
    expect(state.frozen).toEqual({});
    expect(state.sources ?? []).toEqual([]);
    expect(Object.hasOwn(state, 'tab')).toBe(false);
    const createdAt: string = z.string().parse(state.created);
    expect(createdAt).toContain('T');
    expect(Number.isNaN(Date.parse(createdAt))).toBe(false);
    const seat = z
      .object({
        A: z.object({ session: z.string(), address: z.string() }),
        B: z.object({ session: z.string(), address: z.string() }),
      })
      .parse(state.seat);
    expect(seat.A).toEqual({ session: f.core.session, address: door });
    expect(seat.B).toEqual({ session: f.core.session, address: reviewer });
    expect(state.env_names).toEqual(['AKROGON_DIRECT_TEST']);
    const worktree: string = z.string().parse(state.worktree);
    expect(realpathSync(worktree)).toBe(realpathSync(resolve(storeDir(f), 'fix-alpha')));
    expect(existsSync(worktree)).toBe(true);
    expect(await worktreeBranch(worktree)).toBe('fix-alpha');
    expect(await worktreeHead(worktree)).toBe(await base(f));
    expect(await worktreeStanza(f, worktree)).not.toContain('\nlocked');
    expect(readFileSync(resolve(worktree, '.env'), 'utf8')).toBe('AKROGON_DIRECT_TEST=alpha\n');
    const status: Result = await cli(f, ['status', '--json'], f.root, f.env);
    expect(status.code, status.stderr).toBe(0);
    expect(leafRow(f, status.stdout, 'fix-alpha')?.phase).toBe('implement');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct preserves the order of repeated --source flags', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const created: Result = await direct(
      f,
      'fix-alpha',
      ['--reviewer', reviewer, '--source', 'team-one/project#11', '--source', 'team-two/project#22'],
      { HC_TERMINAL_ID: door },
    );
    expect(created.code, created.stderr).toBe(0);
    expect(readRaw(leafPath).sources).toEqual(['team-one/project#11', 'team-two/project#22']);
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses outside hc: no HC_TERMINAL_ID, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const reviewer: string = await standin(f, 'reviewer');
    // f.env carries HC_TERMINAL_ID as the empty string, which is not a live terminal.
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer]);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(refused.stderr).toContain('HC_TERMINAL_ID');
    expect(existsSync(resolve(leafPath, 'state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses a dead HC_TERMINAL_ID, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const reviewer: string = await standin(f, 'reviewer');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: 'deadbeef' });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(leafPath, 'state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses when no open folder holds the slug, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses when two owner folders hold the slug, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    doorFiles(f, 'chart-x', 'fix-alpha');
    doorFiles(f, 'chart-y', 'fix-alpha');
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(f.root, 'issues/open/chart-x/fix-alpha/state.yaml'))).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/open/chart-y/fix-alpha/state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses a folder whose state.yaml is not a direct leaf, unchanged', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    writeRaw(leafPath, {
      slug: 'fix-alpha',
      phase: 'implement',
      created: '2026-09-10',
      repo: f.repo,
      'blocked-by': [],
    });
    const before: string = readFileSync(resolve(leafPath, 'state.yaml'), 'utf8');
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(refused.stderr).toContain('is not a direct leaf');
    expect(readFileSync(resolve(leafPath, 'state.yaml'), 'utf8')).toBe(before);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses when the owner folder holds a sibling leaf with state.yaml, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const sibling: string = resolve(f.root, 'issues/open/chart-x/sibling-leaf');
    mkdirSync(sibling, { recursive: true });
    writeRaw(sibling, {
      slug: 'sibling-leaf',
      phase: 'implement',
      created: '2026-09-10',
      repo: f.repo,
      'blocked-by': [],
    });
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(leafPath, 'state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses a reviewer address dead in every live session, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const door: string = await standin(f, 'door');
    await standin(f, 'bystander');
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', 'deadbeef'], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(leafPath, 'state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct refuses a reviewer two live sessions resolve, nothing written', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const leafPath: string = doorFiles(f, 'chart-x', 'fix-alpha');
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    // A second socket name for the same core: sessions() lists both names as live and the reviewer
    // address resolves under each of them.
    symlinkSync(f.core.socket, resolve(f.core.runtime, 'herdr-core', 'aktduplicate.sock'));
    const refused: Result = await direct(f, 'fix-alpha', ['--reviewer', reviewer], { HC_TERMINAL_ID: door });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(leafPath, 'state.yaml'))).toBe(false);
    await expectNothingCreated(f, 'fix-alpha');
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('a rerun rewrites seats only: delivery_error of the changed slot clears, sources and prompted survive verbatim', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    doorFiles(f, 'chart-x', 'fix-alpha');
    const leafPath: string = resolve(f.root, 'issues/open/chart-x/fix-alpha');
    const door: string = await standin(f, 'door');
    const firstReviewer: string = await standin(f, 'reviewer-one');
    const secondReviewer: string = await standin(f, 'reviewer-two');
    const created: Result = await direct(
      f,
      'fix-alpha',
      ['--reviewer', firstReviewer, '--source', 'team-one/project#11'],
      { HC_TERMINAL_ID: door },
    );
    expect(created.code, created.stderr).toBe(0);
    const worktree: string = z.string().parse(readRaw(leafPath).worktree);
    const at: string = new Date().toISOString();
    writeRaw(leafPath, {
      ...readRaw(leafPath),
      delivery_error: {
        A: { code: 'not_started', address: door, turn: 0, at },
        B: { code: 'not_started', address: firstReviewer, turn: 0, at },
      },
      prompted: { B: { turn: 2, address: firstReviewer } },
    });
    const before: Raw = readRaw(leafPath);
    // An untracked sentinel in the worktree: a rerun that removed and recreated the
    // worktree would lose it, however identical the branch head looked.
    writeFileSync(resolve(worktree, 'rerun-sentinel'), 'kept\n');
    const rerun: Result = await direct(f, 'fix-alpha', ['--reviewer', secondReviewer], { HC_TERMINAL_ID: door });
    expect(rerun.code, rerun.stderr).toBe(0);
    const after: Raw = readRaw(leafPath);
    const seat = z
      .object({
        A: z.object({ session: z.string(), address: z.string() }),
        B: z.object({ session: z.string(), address: z.string() }),
      })
      .parse(after.seat);
    expect(seat.A).toEqual({ session: f.core.session, address: door });
    expect(seat.B).toEqual({ session: f.core.session, address: secondReviewer });
    const errors = z.object({ A: z.unknown().optional(), B: z.unknown().optional() }).parse(after.delivery_error);
    expect(errors.A).toEqual((before.delivery_error as Raw).A);
    expect(errors.B).toBeUndefined();
    const strip = (state: Raw): Raw => {
      const { seat: _seat, delivery_error: _errors, ...rest } = state;
      return rest;
    };
    expect(strip(after)).toEqual(strip(before));
    expect(after.sources).toEqual(['team-one/project#11']);
    expect(after.prompted).toEqual({ B: { turn: 2, address: firstReviewer } });
    // The rerun creates nothing: the same worktree, untouched, same branch head.
    expect(existsSync(resolve(worktree, 'rerun-sentinel'))).toBe(true);
    expect(await worktreeBranch(worktree)).toBe('fix-alpha');
    expect(await worktreeHead(worktree)).toBe(await base(f));
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('a rerun on a merged leaf in issues/closed rewrites seats and recreates no worktree or branch', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    doorFiles(f, 'chart-x', 'fix-alpha');
    const leafPath: string = resolve(f.root, 'issues/open/chart-x/fix-alpha');
    const door: string = await standin(f, 'door');
    const firstReviewer: string = await standin(f, 'reviewer-one');
    const secondReviewer: string = await standin(f, 'reviewer-two');
    const created: Result = await direct(f, 'fix-alpha', ['--reviewer', firstReviewer], { HC_TERMINAL_ID: door });
    expect(created.code, created.stderr).toBe(0);
    const worktree: string = z.string().parse(readRaw(leafPath).worktree);
    // The merged end state: worktree and branch already gone, owner moved to issues/closed.
    await command(['git', 'worktree', 'remove', '--force', worktree], f.root);
    await command(['git', 'update-ref', '-d', 'refs/heads/fix-alpha'], f.root);
    writeRaw(leafPath, { ...readRaw(leafPath), phase: 'merged' });
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/chart-x'), resolve(f.root, 'issues/closed/chart-x'));
    const closedLeaf: string = resolve(f.root, 'issues/closed/chart-x/fix-alpha');
    const before: Raw = readRaw(closedLeaf);
    const rerun: Result = await direct(f, 'fix-alpha', ['--reviewer', secondReviewer], { HC_TERMINAL_ID: door });
    expect(rerun.code, rerun.stderr).toBe(0);
    const after: Raw = readRaw(closedLeaf);
    expect(after.phase).toBe('merged');
    const seat = z
      .object({
        A: z.object({ session: z.string(), address: z.string() }),
        B: z.object({ session: z.string(), address: z.string() }),
      })
      .parse(after.seat);
    expect(seat.A).toEqual({ session: f.core.session, address: door });
    expect(seat.B).toEqual({ session: f.core.session, address: secondReviewer });
    const strip = (state: Raw): Raw => {
      const { seat: _seat, delivery_error: _errors, ...rest } = state;
      return rest;
    };
    expect(strip(after)).toEqual(strip(before));
    expect(existsSync(resolve(storeDir(f), 'fix-alpha'))).toBe(false);
    expect(await branchExists(f, 'fix-alpha')).toBe(false);
  } finally {
    stopAdopt();
    await f.clean();
  }
});
