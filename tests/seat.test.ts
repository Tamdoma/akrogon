// Criteria 1 and 2 (brief): the argv harnessArgv builds for each harness kind. Criterion 1's
// equals form and once-before-the-task placement are also proven at the startSeat launch line in
// tests/hc-start.test.ts; harnessArgv takes no task, and startSeat/startConsultant append it after
// harness.argv, so the flag as argv's last element is before the task.
import { test, expect, afterEach } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fixture } from './helpers';
import { readGlobal, type GlobalConfig, type SlotConfig } from '../src/config';
import { harnessArgv } from '../src/seat';

// The four configured harness templates (akrogon config), copied verbatim so the built argv is the
// real one; a template edit the plan did not make shows up as a mismatch here.
const harnesses: Record<string, string> = {
  claude:
    'claude --model {model} --effort {effort} --settings \'{"env":{"CLAUDE_CODE_SUBAGENT_MODEL":"{model}","CLAUDE_CODE_SUBAGENT_MODEL_FORCE":"1"}}\' --dangerously-skip-permissions',
  codex: 'codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access',
  pi: 'pi --model {model} --thinking {effort} -a --exclude-tools request_user_input',
  agy: 'agy --model {model} --effort {effort} --mode auto',
};

const disallowed: string = '--disallowedTools=AskUserQuestion';

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()!();
});

// A GlobalConfig whose harnesses are the four real templates (fake kept for the fixture's slots).
async function globalConfig(): Promise<GlobalConfig> {
  const f = await fixture();
  cleanups.push(f.clean);
  const path: string = resolve(f.home, 'config.yaml');
  const global = z
    .object({ harnesses: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  writeFileSync(path, Bun.YAML.stringify({ ...global, harnesses: { ...global.harnesses, ...harnesses } }));
  const previous: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = f.home;
  try {
    return readGlobal();
  } finally {
    if (previous === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = previous;
  }
}

const slot = (harness: string): SlotConfig => ({ harness, model: 'm1', effort: 'low' });

test("harnessArgv appends --disallowedTools=AskUserQuestion once as argv's last element for a claude harness", async () => {
  const global: GlobalConfig = await globalConfig();
  const harness = harnessArgv(global, slot('claude'));
  expect(harness.kind).toBe('claude');
  expect(harness.argv[0]).toBe('claude');
  const hits: string[] = harness.argv.filter((arg: string) => arg.startsWith('--disallowedTools'));
  expect(hits).toEqual([disallowed]);
  // Last in harnessArgv's argv is before the task both consumers append last.
  expect(harness.argv.at(-1)).toBe(disallowed);
});

test.each(['codex', 'pi', 'agy'])('harnessArgv builds the %s template argv unchanged', async (kind: string) => {
  const global: GlobalConfig = await globalConfig();
  const harness = harnessArgv(global, slot(kind));
  expect(harness.kind).toBe(kind);
  expect(harness.argv.some((arg: string) => arg.startsWith('--disallowedTools'))).toBe(false);
  if (kind === 'pi') {
    expect(harness.argv.at(-2)).toBe('--session-id');
    const id: string = z.string().parse(harness.argv.at(-1));
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  }
  const expected: Record<string, string[]> = {
    codex: [
      'codex',
      '--no-daemon',
      '-m',
      'm1',
      '-c',
      'model_reasoning_effort=low',
      '-a',
      'never',
      '-s',
      'danger-full-access',
    ],
    pi: ['pi', '--model', 'm1', '--thinking', 'low', '-a', '--exclude-tools', 'request_user_input'],
    agy: ['agy', '--model', 'm1', '--effort', 'low', '--mode', 'auto'],
  };
  expect(kind === 'pi' ? harness.argv.slice(0, -2) : harness.argv).toEqual(expected[kind]);
});
