import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, watch } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { cli, fixture, type Fixture } from './helpers';
import { hcCore, noticeFiles, type HcCore } from './hc-fixture';
import { noticeId, writeNotice } from '../src/notice';
import type { Result } from '../src/shell';

// herdr-setup's handler reads every name ending in `.json` as a whole notice, so a notice is
// written under another name and renamed: the folder never holds a partial `<id>.json`.
test('a notice is published as one complete <id>.json through a temporary name, creating its folder', async () => {
  const root: string = mkdtempSync(resolve(tmpdir(), 'akrogon-notice-'));
  try {
    const folder: string = resolve(root, 'akrogon-notices');
    writeNotice(folder, noticeId('repo', 'first'), { title: 'first', body: '', attention: false });
    expect(readdirSync(folder)).toEqual([`${noticeId('repo', 'first')}.json`]);

    const id: string = noticeId('repo', 'busy', 'leaf', 'A');
    const seen: string[] = [];
    const published: Promise<void> = new Promise<void>((done, fail) => {
      const timer = setTimeout(() => fail(new Error(`no event for ${id}.json; saw ${JSON.stringify(seen)}`)), 5000);
      const watcher = watch(folder, (_event: string, name: string | null) => {
        if (name === null) return;
        seen.push(name);
        if (name !== `${id}.json`) return;
        clearTimeout(timer);
        watcher.close();
        done();
      });
    });
    writeNotice(folder, id, { title: 'Busy leaf: repo/leaf seat A 1h01m', body: 'b', attention: true });
    await published;
    expect(seen.some((name: string) => !name.endsWith('.json'))).toBe(true);
    expect(JSON.parse(readFileSync(resolve(folder, `${id}.json`), 'utf8'))).toEqual({
      title: 'Busy leaf: repo/leaf seat A 1h01m',
      body: 'b',
      attention: true,
    });
    expect(readdirSync(folder).sort()).toEqual([`${noticeId('repo', 'first')}.json`, `${id}.json`].sort());
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ids keep repos and kinds apart in one shared session folder', () => {
  const ids: string[] = [
    noticeId('repo', 'failed', 'a'),
    noticeId('other', 'failed', 'a'),
    noticeId('repo', 'merged', 'a'),
    noticeId('repo', 'busy', 'a', 'A'),
    noticeId('repo', 'busy', 'a', 'B'),
  ];
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) expect(id.endsWith('.json')).toBe(false);
});

// The watcher's needs-you notice goes through this verb (design: Notice verb).
test('akrogon notice writes one notice into the resolved session of the repo of its cwd', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const sub: string = resolve(f.root, 'issues');
    mkdirSync(sub, { recursive: true });
    const loud: Result = await cli(
      f,
      ['notice', '--title', 'repo/leaf needs you', '--body', 'chart a fix leaf', '--attention'],
      sub,
      core.env,
    );
    expect(loud.code).toBe(0);
    const quiet: Result = await cli(f, ['notice', '--title', 'repo quiet', '--body', ''], f.root, core.env);
    expect(quiet.code).toBe(0);
    const files = noticeFiles(core).map(({ title, body, attention }) => ({ title, body, attention }));
    expect(files).toHaveLength(2);
    expect(files).toContainEqual({ title: 'repo/leaf needs you', body: 'chart a fix leaf', attention: true });
    expect(files).toContainEqual({ title: 'repo quiet', body: '', attention: false });

    const blank: Result = await cli(f, ['notice', '--title', '  ', '--body', 'x'], f.root, core.env);
    expect(blank.code).not.toBe(0);
    expect(noticeFiles(core)).toHaveLength(2);
  } finally {
    await core.stop();
    f.clean();
  }
}, 15000);

test('akrogon notice fails, writing nothing, when no running session holds the repo', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    const result: Result = await cli(f, ['notice', '--title', 't', '--body', 'b'], f.root, core.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('no running session holds it');
    expect(existsSync(resolve(core.appHome, 'akrogon-notices'))).toBe(false);
  } finally {
    await core.stop();
    f.clean();
  }
}, 15000);
