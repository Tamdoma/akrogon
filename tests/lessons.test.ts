import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, entry, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { mergeBase, removeRetiredLessons, retiredLessonsPresent } from '../src/lessons';

test('solo cleanup command retires a union-resurrected lesson in a consumer repository', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
    writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
    const alpha: string = '- alpha. 2026-10-10. history/alpha.md\n';
    const beta: string = '- beta. 2026-10-10. [beta](history/beta.md)\n';
    const gamma: string = '- gamma. 2026-10-10. history/gamma.md\n';
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + beta);
    writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'lessons'], f.root);
    await command(['git', 'checkout', '-b', 'guard'], f.root);
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), beta);
    writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\nApplied 2026-10-10 by guard.ts:1: guard\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'retire alpha'], f.root);
    await command(['git', 'checkout', 'main'], f.root);
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + gamma + beta);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'new lesson'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'checkout', 'guard'], f.root);
    await command(['git', 'rebase', 'origin/main'], f.root);
    const leafRanges: { base: string; head: string }[] = [
      { base: await mergeBase(f.root, 'origin/main', 'ORIG_HEAD'), head: 'ORIG_HEAD' },
    ];
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual(['history/alpha']);
    expect(existsSync(resolve(f.root, 'src/lessons.ts'))).toBe(false);

    const bin: string = resolve(f.home, 'bin');
    mkdirSync(bin);
    symlinkSync(entry, resolve(bin, 'akrogon'));
    const invocation: string = readFileSync(resolve(import.meta.dir, '../skills/merge-issue/SKILL.md'), 'utf8')
      .split('\n')
      .find((line) => line.startsWith('bun -e '))!
      .replaceAll('<remote>/<default_branch>', 'origin/main');
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(['bash', '-c', invocation], {
      cwd: f.root,
      env: { ...process.env, PATH: bin + ':' + process.env.PATH },
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const [stdout, stderr, code]: [string, string, number] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    const result: Result = { stdout: stdout.trim(), stderr: stderr.trim(), code };
    expect(result).toEqual({ stdout: 'history/alpha', stderr: '', code: 0 });
    expect(readFileSync(resolve(f.root, 'learnings/LESSONS.md'), 'utf8')).toBe(gamma + beta);
    await command(['git', 'add', 'learnings/LESSONS.md'], f.root);
    await command(['git', 'commit', '-m', 'lessons: retire applied lines'], f.root);
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual([]);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    expect(await command(['git', 'show', 'origin/main:learnings/LESSONS.md'], f.root)).toBe((gamma + beta).trim());
  } finally {
    f.clean();
  }
});

async function retiredFixture(mainEdit: (root: string) => Promise<void>): Promise<Fixture> {
  const f: Fixture = await fixture();
  mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
  writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
  writeFileSync(
    resolve(f.root, 'learnings/LESSONS.md'),
    '- original case. 2026-10-09. history/alpha.md\n- beta. 2026-10-09. history/beta.md\n',
  );
  writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'lessons'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  await command(['git', 'checkout', '-b', 'guard'], f.root);
  writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), '- beta. 2026-10-09. history/beta.md\n');
  writeFileSync(
    resolve(f.root, 'learnings/history/alpha.md'),
    '# alpha\n\nApplied 2026-10-10 by tests/lessons.test.ts: retired fixture\n',
  );
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'retire alpha'], f.root);
  await command(['git', 'checkout', 'main'], f.root);
  await mainEdit(f.root);
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'main advance'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  await command(['git', 'checkout', 'guard'], f.root);
  await command(['git', 'rebase', 'origin/main'], f.root);
  return f;
}

test('re-removal keeps a same-stem lesson line main added while the retiring leaf was in flight', async () => {
  const recurrence: string = '- new recurrence. 2026-10-10. history/alpha.md\n';
  const f: Fixture = await retiredFixture(async (root) => {
    writeFileSync(
      resolve(root, 'learnings/LESSONS.md'),
      '- original case. 2026-10-09. history/alpha.md\n' + recurrence + '- beta. 2026-10-09. history/beta.md\n',
    );
  });
  try {
    const leafRanges: { base: string; head: string }[] = [
      { base: await mergeBase(f.root, 'origin/main', 'ORIG_HEAD'), head: 'ORIG_HEAD' },
    ];
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual(['history/alpha']);
    const removed: string[] = await removeRetiredLessons(f.root, 'origin/main', 'HEAD', leafRanges);
    expect(removed).toEqual(['history/alpha']);
    expect(readFileSync(resolve(f.root, 'learnings/LESSONS.md'), 'utf8')).toBe(
      recurrence + '- beta. 2026-10-09. history/beta.md\n',
    );
  } finally {
    f.clean();
  }
});

test('re-removal keeps a new main lesson line whose stem is a superstring of the retired one', async () => {
  const f: Fixture = await retiredFixture(async (root) => {
    writeFileSync(
      resolve(root, 'learnings/LESSONS.md'),
      '- original case. 2026-10-09. history/alpha.md\n- alpha x. 2026-10-10. history/alpha-x.md\n- beta. 2026-10-09. history/beta.md\n',
    );
  });
  try {
    const leafRanges: { base: string; head: string }[] = [
      { base: await mergeBase(f.root, 'origin/main', 'ORIG_HEAD'), head: 'ORIG_HEAD' },
    ];
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual(['history/alpha']);
    const removed: string[] = await removeRetiredLessons(f.root, 'origin/main', 'HEAD', leafRanges);
    expect(removed).toEqual(['history/alpha']);
    expect(readFileSync(resolve(f.root, 'learnings/LESSONS.md'), 'utf8')).toBe(
      '- alpha x. 2026-10-10. history/alpha-x.md\n- beta. 2026-10-09. history/beta.md\n',
    );
  } finally {
    f.clean();
  }
});

test('retiredLessonsPresent flags a half-retired lesson while removal leaves it alone', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
    writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
    const alpha: string = '- alpha. 2026-10-09. history/alpha.md\n';
    const beta: string = '- beta. 2026-10-09. history/beta.md\n';
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + beta);
    writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'lessons'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'checkout', '-b', 'guard'], f.root);
    writeFileSync(
      resolve(f.root, 'learnings/history/alpha.md'),
      '# alpha\n\nApplied 2026-10-10 by tests/lessons.test.ts: half-retired\n',
    );
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'apply alpha without removing its lesson'], f.root);
    await command(['git', 'checkout', 'main'], f.root);
    writeFileSync(resolve(f.root, 'file-main'), 'm\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'main advance'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'checkout', 'guard'], f.root);
    await command(['git', 'rebase', 'origin/main'], f.root);
    const leafRanges: { base: string; head: string }[] = [
      { base: await mergeBase(f.root, 'origin/main', 'ORIG_HEAD'), head: 'ORIG_HEAD' },
    ];
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual(['history/alpha']);
    expect(await removeRetiredLessons(f.root, 'origin/main', 'HEAD', leafRanges)).toEqual([]);
    expect(readFileSync(resolve(f.root, 'learnings/LESSONS.md'), 'utf8')).toBe(alpha + beta);
  } finally {
    f.clean();
  }
});
