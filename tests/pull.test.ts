import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fixture, cli, yaml, fakeGh, type Fixture, type GhFixture } from './helpers';
import { command, quote, type Result } from '../src/shell';
import { globalSchema, type GlobalConfig } from '../src/config';
import type { GhStep } from './fake-gh';

type Issue = { number: number; title: string; body: string | null; html_url: string; pull_request?: object };
function issue(number: number, title: string, body: string | null = 'body'): Issue {
  return { number, title, body, html_url: `https://github.com/acme/project/issues/${number}` };
}
function script(gh: GhFixture, steps: GhStep[]): void {
  writeFileSync(gh.db, JSON.stringify(steps));
}
function snapshot(f: Fixture): Record<string, string> {
  const path: string = resolve(f.root, 'issues/seeds');
  return Object.fromEntries(
    readdirSync(path)
      .sort()
      .map((name) => [name, readFileSync(resolve(path, name), 'utf8')]),
  );
}
function calls(gh: GhFixture): { args: string[]; cwd: string }[] {
  return readFileSync(gh.db + '.calls', 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.object({ args: z.array(z.string()), cwd: z.string() }).parse(JSON.parse(line)));
}
const listingArgs: string[] = [
  'api',
  '--hostname',
  'github.com',
  'repos/acme/project/issues?state=open&per_page=100',
  '--paginate',
  '--slurp',
];

test('pull reconciles every page by number, preserves bodies, excludes PRs, and handles empty listings', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'add', 'origin', 'https://github.com/acme/project.git'], f.root);
    mkdirSync(resolve(f.root, 'issues/seeds'));
    writeFileSync(resolve(f.root, 'issues/seeds/1-old.md'), 'old');
    writeFileSync(resolve(f.root, 'issues/seeds/1-duplicate.md'), 'duplicate');
    writeFileSync(resolve(f.root, 'issues/seeds/900-closed.md'), 'closed');
    writeFileSync(resolve(f.root, 'issues/seeds/notes.md'), 'keep');
    const body: string = '  original\n\n# Body\n```ts\nx\n```\n  ';
    const pages: Issue[][] = [
      Array.from({ length: 100 }, (_, i) => issue(i + 1, `Title ${i + 1}`)),
      [
        issue(101, '!!! 日本語', null),
        issue(102, 'X'.repeat(150)),
        { ...issue(103, 'a pull request'), pull_request: {} },
      ],
    ];
    pages[0][0] = issue(1, 'Renamed ../ title', body);
    script(gh, [{ stdout: JSON.stringify(pages), args: listingArgs }]);
    const pulled: Result = await cli(f, ['pull'], f.root, gh.env);
    expect(pulled.code).toBe(0);
    const files: Record<string, string> = snapshot(f);
    expect(Object.keys(files)).toHaveLength(103);
    expect(files['1-renamed-title.md']).toContain('# Renamed ../ title');
    expect(files['1-renamed-title.md']).toContain('acme/project#1');
    expect(files['1-renamed-title.md']).toContain('https://github.com/acme/project/issues/1');
    expect(files['1-renamed-title.md']).toContain(body);
    expect(files['101-issue.md']).not.toContain('null');
    expect(files[`102-${'x'.repeat(40)}.md`]).toBeDefined();
    expect(files['notes.md']).toBe('keep');
    expect(
      Object.keys(files)
        .filter((name) => name !== 'notes.md')
        .every((name) => /^\d+-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name)),
    ).toBe(true);
    script(gh, [{ stdout: JSON.stringify(pages) }]);
    expect((await cli(f, ['pull'], f.root, gh.env)).code).toBe(0);
    expect(snapshot(f)).toEqual(files);
    script(gh, [{ stdout: '[[]]' }]);
    expect((await cli(f, ['pull'], f.root, gh.env)).code).toBe(0);
    expect(snapshot(f)).toEqual({ 'notes.md': 'keep' });
  } finally {
    f.clean();
  }
});

test('pull caps slugs at word boundaries and hard cuts oversized first words', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'add', 'origin', 'https://github.com/acme/project.git'], f.root);
    const issues: Issue[] = [
      issue(104, 'alpha bravo charlie delta echo foxtrot golf hotel'),
      issue(105, 'X'.repeat(41)),
      issue(106, `${'X'.repeat(41)} tail`),
      issue(107, 'X'.repeat(40)),
      issue(108, `alpha ${'X'.repeat(34)}`),
      issue(109, `alpha ${'X'.repeat(34)} tail`),
      issue(110, `${'X'.repeat(39)} tail`),
    ];
    script(gh, [{ stdout: JSON.stringify([issues]), args: listingArgs }]);
    expect((await cli(f, ['pull'], f.root, gh.env)).code).toBe(0);
    const names: string[] = Object.keys(snapshot(f));
    expect(names).toEqual([
      '104-alpha-bravo-charlie-delta-echo-foxtrot.md',
      `105-${'x'.repeat(40)}.md`,
      `106-${'x'.repeat(40)}.md`,
      `107-${'x'.repeat(40)}.md`,
      `108-alpha-${'x'.repeat(34)}.md`,
      `109-alpha-${'x'.repeat(34)}.md`,
      `110-${'x'.repeat(39)}.md`,
    ]);
    for (const name of names) {
      const slug: string = name.slice(name.indexOf('-') + 1, -3);
      expect(slug.length).toBeLessThanOrEqual(40);
      expect(slug.endsWith('-')).toBe(false);
    }
  } finally {
    f.clean();
  }
});

test('failed, malformed, and invalid listings leave seed bytes unchanged and command failures retry once', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'add', 'origin', 'git@github.com:acme/project.git'], f.root);
    mkdirSync(resolve(f.root, 'issues/seeds'));
    writeFileSync(resolve(f.root, 'issues/seeds/1-existing.md'), 'do not touch\n');
    const before: Record<string, string> = snapshot(f);
    script(gh, [
      { stdout: '[[', code: 1, stderr: 'page two failed' },
      { stdout: '[[', code: 2, stderr: 'page two failed again' },
    ]);
    const failed: Result = await cli(f, ['pull'], f.root, gh.env);
    expect(failed.code).not.toBe(0);
    expect(JSON.parse(failed.stderr.split('\n')[0])).toMatchObject({
      warning: expect.any(String),
      code: 1,
      stderr: 'page two failed',
    });
    expect(failed.stderr).toContain('page two failed again');
    expect(calls(gh)).toHaveLength(2);
    expect(snapshot(f)).toEqual(before);
    for (const output of [
      'malformed json',
      JSON.stringify([[issue(0, 'invalid')]]),
      JSON.stringify([[{ ...issue(2, 'invalid'), body: 42 }]]),
    ]) {
      script(gh, [{ stdout: output }]);
      const result: Result = await cli(f, ['pull'], f.root, gh.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(JSON.stringify(output).slice(1, -1));
      expect(snapshot(f)).toEqual(before);
    }
    script(gh, [{ stdout: '', code: 1 }, { stdout: JSON.stringify([[issue(2, 'recovered')]]) }]);
    const recovered: Result = await cli(f, ['pull'], f.root, gh.env);
    expect(recovered.code).toBe(0);
    expect(JSON.parse(recovered.stderr)).toMatchObject({ warning: expect.any(String), code: 1 });
    expect(Object.keys(snapshot(f))).toEqual(['2-recovered.md']);
  } finally {
    f.clean();
  }
});

test('pull resolves supported origins, ignores merge remote, and targets the registered checkout from worktrees', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    yaml(resolve(f.root, 'issues/config.yaml'), { remote: 'upstream' });
    await command(['git', 'remote', 'add', 'upstream', 'https://github.com/other/merge.git'], f.root);
    await command(['git', 'remote', 'add', 'origin', 'https://github.com/acme/project'], f.root);
    const worktree: string = resolve(f.home, 'worktree');
    await command(['git', 'worktree', 'add', '-b', 'work', worktree], f.root);
    for (const origin of [
      'https://github.com/acme/project',
      'git@github.com:acme/project.git',
      'ssh://git@github.com/acme/project.git',
    ]) {
      await command(['git', 'remote', 'set-url', 'origin', origin], f.root);
      script(gh, [{ stdout: JSON.stringify([[issue(4, 'Target')]]), args: listingArgs }]);
      expect(
        (await cli(f, ['pull'], worktree, { ...gh.env, GH_REPO: 'other/wrong', GH_HOST: 'elsewhere.invalid' })).code,
      ).toBe(0);
      expect(snapshot(f)['4-target.md']).toContain('acme/project#4');
      expect(existsSync(resolve(worktree, 'issues/seeds'))).toBe(false);
    }
    expect(calls(gh).every((call) => call.cwd === f.root)).toBe(true);
    for (const args of [
      ['pull', 'extra'],
      ['pull', '--all', 'extra'],
      ['pull', '--bad'],
    ])
      expect((await cli(f, args, f.root, gh.env)).code).not.toBe(0);
  } finally {
    f.clean();
  }
});

test('missing and invalid origins fail visibly, and all continues after invalid registrations and origins', async () => {
  const f: Fixture = await fixture();
  const bad: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const missing: Result = await cli(f, ['pull'], f.root, gh.env);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('origin');
    await command(['git', 'remote', 'add', 'origin', 'https://gitlab.com/acme/project'], f.root);
    const invalid: Result = await cli(f, ['pull'], f.root, gh.env);
    expect(invalid.code).not.toBe(0);
    const invalidContext: string = /^error: (\{.*\})$/m.exec(invalid.stderr)![1];
    expect(JSON.parse(invalidContext)).toMatchObject({ repo: 'repo', origin: 'https://gitlab.com/acme/project' });
    await command(['git', 'remote', 'set-url', 'origin', 'https://github.com/acme'], f.root);
    expect((await cli(f, ['pull'], f.root, gh.env)).code).not.toBe(0);
    await command(['git', 'remote', 'set-url', 'origin', 'https://github.com/acme/project.git'], f.root);
    await command(['git', 'remote', 'add', 'origin', 'https://gitlab.com/acme/project'], bad.root);
    const global: GlobalConfig = globalSchema.parse(
      Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')),
    );
    yaml(resolve(f.home, 'config.yaml'), {
      ...global,
      repos: { missing: resolve(f.home, 'missing'), bad: bad.root, repo: f.root },
    });
    script(gh, [{ stdout: JSON.stringify([[issue(5, 'Healthy')]]) }]);
    const all: Result = await cli(f, ['pull', '--all'], f.home, gh.env);
    expect(all.code).not.toBe(0);
    expect(all.stderr).toContain('missing');
    expect(all.stderr).toContain('bad');
    expect(all.stderr).toContain('gitlab.com');
    expect(snapshot(f)['5-healthy.md']).toBeDefined();
  } finally {
    f.clean();
    bad.clean();
  }
});

test('concurrent pulls serialize listing and reconciliation', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'add', 'origin', 'https://github.com/acme/project'], f.root);
    script(gh, [
      { stdout: JSON.stringify([[issue(1, 'Old')]]), delayMs: 200 },
      { stdout: JSON.stringify([[issue(1, 'New')]]) },
    ]);
    const first: Promise<Result> = cli(f, ['pull'], f.root, gh.env);
    for (let attempt: number = 0; attempt < 100 && !existsSync(gh.db + '.calls'); attempt++) await Bun.sleep(10);
    expect(existsSync(gh.db + '.calls')).toBe(true);
    const results: Result[] = await Promise.all([first, cli(f, ['pull'], f.root, gh.env)]);
    expect(results.map((result) => result.code)).toEqual([0, 0]);
    expect(readFileSync(gh.db + '.events', 'utf8')).toBe('start\nend\nstart\nend\n');
    expect(Object.keys(snapshot(f))).toEqual(['1-new.md']);
  } finally {
    f.clean();
  }
});

test('startup runs pull all before next all and wrappers forward arguments', async () => {
  const plugin: string = resolve(import.meta.dir, '../plugin');
  const manifest = z
    .object({ startup: z.array(z.object({ command: z.array(z.string()) })) })
    .parse(Bun.TOML.parse(readFileSync(resolve(plugin, 'herdr-plugin.toml'), 'utf8')));
  expect(manifest.startup.map((item) => item.command)).toEqual([
    ['sh', 'pull.sh', '--all'],
    ['sh', 'next.sh', '--all'],
  ]);
  const f: Fixture = await fixture();
  try {
    const bin: string = resolve(f.home, 'bin');
    mkdirSync(bin);
    const output: string = resolve(f.home, 'wrapper-output');
    writeFileSync(resolve(bin, 'akrogon'), `#!/bin/sh\nprintf '%s\\n' "$@" > ${quote(output)}\n`, { mode: 0o755 });
    for (const wrapper of ['pull', 'next']) {
      await command(['env', `PATH=${bin}:${process.env.PATH}`, 'sh', resolve(plugin, `${wrapper}.sh`), '--all']);
      expect(readFileSync(output, 'utf8')).toBe(`${wrapper}\n--all\n`);
    }
  } finally {
    f.clean();
  }
});
