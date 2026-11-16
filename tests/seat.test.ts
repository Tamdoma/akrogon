// Brief criteria 1-5: for a claude harness line, the argv harnessArgv builds merges
// permissions.denyInsteadOfPrompting: true into its one --settings JSON object or appends the
// pair, keeps every other element unchanged, and refuses a line it cannot merge without
// dropping a setting. The appended --disallowedTools=AskUserQuestion keeps once-before-the-task
// placement, also proven at the startSeat launch line in tests/hc-start.test.ts; harnessArgv
// takes no task, and startSeat/startConsultant append it after harness.argv.
import { test, expect, afterEach } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'shell-quote';
import { z } from 'zod';
import { fixture } from './helpers';
import { readGlobal, type GlobalConfig, type SlotConfig } from '../src/config';
import { harnessArgv } from '../src/seat';
import { quote } from '../src/shell';

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

// A GlobalConfig whose harnesses are the four real templates (fake kept for the fixture's slots);
// overrides replace a template for one case, keyed by harness name.
async function globalConfig(overrides: Record<string, string> = {}): Promise<GlobalConfig> {
  const f = await fixture();
  cleanups.push(f.clean);
  const path: string = resolve(f.home, 'config.yaml');
  const global = z
    .object({ harnesses: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  writeFileSync(
    path,
    Bun.YAML.stringify({ ...global, harnesses: { ...global.harnesses, ...harnesses, ...overrides } }),
  );
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

// The machine line's --settings object and the argv it must parse to after {model} and {effort}
// fill in, mirrored with the same quote the implementation uses. `expect.merge` is the object the
// built argv's --settings value must parse back to; `refused` names the operand the error must
// name.
const claudeTemplate = (settings?: object): string =>
  settings === undefined
    ? 'claude --model {model} --effort {effort} --dangerously-skip-permissions'
    : `claude --model {model} --effort {effort} --settings ${quote(JSON.stringify(settings))} --dangerously-skip-permissions`;
const filled = (line: string): string[] =>
  z
    .array(z.string())
    .min(1)
    .parse(parse(line.replaceAll('{model}', quote('m1')).replaceAll('{effort}', quote('low'))));
const denyOnly: object = { permissions: { denyInsteadOfPrompting: true } };

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

test.each([
  {
    name: 'the real machine line keeps env and adds permissions.denyInsteadOfPrompting: true',
    settings: { env: { CLAUDE_CODE_SUBAGENT_MODEL: 'm1', CLAUDE_CODE_SUBAGENT_MODEL_FORCE: '1' } },
    merge: {
      env: { CLAUDE_CODE_SUBAGENT_MODEL: 'm1', CLAUDE_CODE_SUBAGENT_MODEL_FORCE: '1' },
      ...denyOnly,
    },
  },
  {
    name: 'an explicit denyInsteadOfPrompting false comes out true and a permissions sibling stays',
    settings: { env: { A: 'b' }, permissions: { denyInsteadOfPrompting: false, allowedTools: ['Bash'] } },
    merge: {
      env: { A: 'b' },
      permissions: { denyInsteadOfPrompting: true, allowedTools: ['Bash'] },
    },
  },
  {
    name: 'a top-level key without permissions gains the whole permissions object',
    settings: { env: { A: 'b' }, other: [1, 'x'] },
    merge: { env: { A: 'b' }, other: [1, 'x'], ...denyOnly },
  },
])(
  'for a pair-form --settings line, harnessArgv merges the flag into one --settings element: $name',
  async ({ settings, merge }) => {
    const line: string = claudeTemplate(settings);
    const global: GlobalConfig = await globalConfig({ claude: line });
    const harness = harnessArgv(global, slot('claude'));
    // Exactly one --settings element, in the template's position and pair spelling (criterion 1).
    const templateArgv: string[] = filled(line);
    const flagAt: number = templateArgv.indexOf('--settings');
    expect(harness.argv.filter((arg: string) => arg === '--settings')).toHaveLength(1);
    expect(harness.argv.filter((arg: string) => arg.startsWith('--settings'))).toHaveLength(1);
    expect(harness.argv.indexOf('--settings')).toBe(flagAt);
    // Every element that is not the --settings value stays unchanged and in order (criterion 5).
    expect(harness.argv.filter((_, i: number) => i !== flagAt + 1)).toEqual([
      ...templateArgv.filter((_, i: number) => i !== flagAt + 1),
      disallowed,
    ]);
    // The value parses to the original object with only permissions.denyInsteadOfPrompting set.
    const value: unknown = JSON.parse(z.string().parse(harness.argv[flagAt + 1]));
    expect(value).toEqual(merge);
  },
);

test('for an equals-form --settings line, harnessArgv keeps one equals element and merges the same way', async () => {
  const settings = { env: { A: 'b' }, permissions: { denyInsteadOfPrompting: false } };
  const line: string = `claude --model {model} --settings=${quote(JSON.stringify(settings))} --effort {effort} --dangerously-skip-permissions`;
  const global: GlobalConfig = await globalConfig({ claude: line });
  const harness = harnessArgv(global, slot('claude'));
  const templateArgv: string[] = filled(line);
  const flagAt: number = templateArgv.findIndex((arg: string) => arg === `--settings=${JSON.stringify(settings)}`);
  // One --settings= element at the template's index; non-flag elements unchanged (criteria 2, 5).
  expect(harness.argv.filter((arg: string) => arg.startsWith('--settings'))).toHaveLength(1);
  expect(harness.argv.indexOf(harness.argv.filter((arg: string) => arg.startsWith('--settings'))[0])).toBe(flagAt);
  expect(harness.argv.filter((_, i: number) => i !== flagAt)).toEqual([
    ...templateArgv.filter((_, i: number) => i !== flagAt),
    disallowed,
  ]);
  const element: string = z.string().parse(harness.argv[flagAt]);
  expect(element.startsWith('--settings=')).toBe(true);
  expect(JSON.parse(element.slice('--settings='.length))).toEqual({
    env: { A: 'b' },
    permissions: { denyInsteadOfPrompting: true },
  });
});

test('a claude line without --settings gains the pair after the template and before --disallowedTools', async () => {
  const line: string = claudeTemplate();
  const global: GlobalConfig = await globalConfig({ claude: line });
  const harness = harnessArgv(global, slot('claude'));
  const templateArgv: string[] = filled(line);
  expect(harness.argv.filter((arg: string) => arg.startsWith('--settings'))).toEqual(['--settings']);
  expect(harness.argv.slice(0, templateArgv.length)).toEqual(templateArgv);
  expect(harness.argv[templateArgv.length]).toBe('--settings');
  expect(JSON.parse(z.string().parse(harness.argv[templateArgv.length + 1]))).toEqual(denyOnly);
  expect(harness.argv.at(-1)).toBe(disallowed);
});

test.each([
  {
    name: 'a --settings element with no value',
    line: 'claude --model {model} --effort {effort} --settings',
    operand: '--settings',
  },
  {
    name: 'a --settings file path',
    line: 'claude --model {model} --effort {effort} --settings ./claude.json',
    operand: './claude.json',
  },
  {
    name: 'malformed --settings JSON',
    line: 'claude --model {model} --effort {effort} --settings {broken',
    operand: '{broken',
  },
  {
    name: 'a --settings JSON array',
    line: `claude --model {model} --effort {effort} --settings ${quote('[1,2]')}`,
    operand: '[1,2]',
  },
  {
    name: 'a --settings scalar',
    line: `claude --model {model} --effort {effort} --settings ${quote('42')}`,
    operand: '42',
  },
  {
    name: 'a non-object permissions value',
    line: `claude --model {model} --effort {effort} --settings ${quote('{"permissions":["*"]}')}`,
    operand: '{"permissions":["*"]}',
  },
  {
    name: 'a null permissions value',
    line: `claude --model {model} --effort {effort} --settings ${quote('{"permissions":null}')}`,
    operand: '{"permissions":null}',
  },
  {
    name: 'two --settings flags',
    line: `claude --model {model} --effort {effort} --settings ${quote('{"a":1}')} --settings ${quote('{"b":2}')}`,
    operand: '--settings',
  },
  {
    name: 'two spellings of --settings',
    line: `claude --model {model} --effort {effort} --settings=${quote('{"a":1}')} --settings ${quote('{"b":2}')}`,
    operand: '--settings',
  },
  {
    name: 'a bare -- token',
    line: `claude --model {model} --effort {effort} --settings ${quote('{"a":1}')} -- --verbose`,
    operand: '--',
  },
])('harnessArgv refuses a claude line with $name, naming harness and operand', async ({ line, operand }) => {
  const global: GlobalConfig = await globalConfig({ claude: line });
  let thrown: unknown;
  try {
    harnessArgv(global, slot('claude'));
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(Error);
  const message: string = (thrown as Error).message;
  expect(message).toContain('claude');
  expect(message).toContain(`'${operand}'`);
});
