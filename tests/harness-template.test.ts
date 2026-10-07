import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { parse } from 'shell-quote';
import { z } from 'zod';
import { readGlobal } from '../src/config';
import { quote } from '../src/shell';

function claudeTemplate(): string {
  const home: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = resolve(import.meta.dir, '..');
  try {
    return readGlobal().harnesses.claude;
  } finally {
    if (home === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = home;
  }
}

function settingsWord(argv: string[]): string {
  return argv[argv.indexOf('--settings') + 1];
}

test('claude template carries no literal subagent model inside --settings', () => {
  const argv: string[] = z.array(z.string()).min(1).parse(parse(claudeTemplate()));
  const settings: string = settingsWord(argv);
  for (const model of ['sonnet', 'opus', 'haiku']) expect(settings).not.toContain(model);
});

for (const model of ['opus', 'claude-opus-5-5']) {
  test(`claude template substitutes ${model} into the subagent model env`, () => {
    const line: string = claudeTemplate()
      .replaceAll('{model}', quote(model))
      .replaceAll('{effort}', quote('low'));
    const argv: string[] = z.array(z.string()).min(1).parse(parse(line));
    const settings: { env: Record<string, string> } = JSON.parse(settingsWord(argv));
    expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL).toBe(model);
    expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL_FORCE).toBe('1');
  });
}
