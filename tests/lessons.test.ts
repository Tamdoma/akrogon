import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, entry, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { retiredLessonsPresent } from '../src/lessons';

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
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD')).toEqual(['history/alpha']);
    expect(existsSync(resolve(f.root, 'src/lessons.ts'))).toBe(false);

    const bin: string = resolve(f.home, 'bin');
    mkdirSync(bin);
    symlinkSync(entry, resolve(bin, 'akrogon'));
    const invocation: string = readFileSync(resolve(import.meta.dir, '../skills/merge-issue/SKILL.md'), 'utf8')
      .split('\n')
      .find((line) => line.startsWith('bun -e '))!
      .replace('<remote>/<default_branch>', 'origin/main');
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
    expect(await retiredLessonsPresent(f.root, 'origin/main', 'HEAD')).toEqual([]);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    expect(await command(['git', 'show', 'origin/main:learnings/LESSONS.md'], f.root)).toBe((gamma + beta).trim());
  } finally {
    f.clean();
  }
});
