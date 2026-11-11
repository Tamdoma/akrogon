import { test, expect } from 'bun:test';
import { mkdtempSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { cli, entry, fixture, leaf, registerTemp, type Fixture } from './helpers';
import { spawnCaptured, type Result } from '../src/shell';
import { VERB_OPTIONS, verbFlags, USAGE_LINES } from '../src/usage';

const publicVerbs: string[] = Object.keys(VERB_OPTIONS);

async function bareCli(args: string[], home: string): Promise<Result> {
  const result = await spawnCaptured([process.execPath, entry, ...args], {
    cwd: home,
    env: {
      ...process.env,
      HOME: home,
      AKROGON_HOME: home,
      HERDR_PANE_ID: '',
      AKROGON_RUN: '',
      AKROGON_LEAF_TEMP_ROOT: resolve(home, 'leaf-temp'),
    },
  });
  expect(result.signalCode).toBeNull();
  return { code: result.code, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

test('every public verb answers --help with its declared flags on stdout, exit 0 and empty stderr', async () => {
  const f: Fixture = await fixture();
  try {
    for (const verb of publicVerbs) {
      const result: Result = await cli(f, [verb, '--help']);
      expect(result.code, verb).toBe(0);
      expect(result.stderr, verb).toBe('');
      expect(result.stdout, verb).toContain(`akrogon ${verb}`);
      const printed: string[] = result.stdout.match(/(?<=\s)--[a-z-]+/g) ?? [];
      for (const flag of verbFlags(verb)) expect(result.stdout, verb).toContain(flag);
      for (const flag of printed) expect(verbFlags(verb), `${verb} printed ${flag}`).toContain(flag);
      if (USAGE_LINES[verb] !== undefined) expect(result.stdout, verb).toContain(USAGE_LINES[verb]);
    }
    expect(publicVerbs).toContain('guard');
    expect(publicVerbs).toContain('run-check');
    expect(publicVerbs).toContain('pack');
    expect(publicVerbs).toContain('stop');
    expect(publicVerbs).toContain('timing');
  } finally {
    f.clean();
  }
});

test('akrogon --help prints the verb list on stdout with exit 0, while a bare call still errors', async () => {
  const f: Fixture = await fixture();
  try {
    const help: Result = await cli(f, ['--help']);
    expect(help.code).toBe(0);
    expect(help.stderr).toBe('');
    for (const verb of publicVerbs) expect(help.stdout).toContain(verb);
    const bare: Result = await cli(f, []);
    expect(bare.code).toBe(1);
    expect(bare.stdout).toBe('');
    expect(bare.stderr).toContain('Usage: akrogon <install|listen|init|');
  } finally {
    f.clean();
  }
});

test('an unknown flag exits 1 naming the flag and the verb flags, with no frame, even beside --help', async () => {
  const f: Fixture = await fixture();
  try {
    const result: Result = await cli(f, ['seat', '--compare']);
    expect(result.code).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('--compare');
    for (const flag of verbFlags('seat')) expect(result.stderr).toContain(flag);
    expect(result.stderr).not.toContain('TypeError');
    expect(result.stderr).not.toContain('^');
    const both: Result = await cli(f, ['seat', '--help', '--bogus']);
    expect(both.code).toBe(1);
    expect(both.stdout).toBe('');
    expect(both.stderr).toContain('--bogus');
    const short: Result = await cli(f, ['seat', '-h']);
    expect(short.code).toBe(1);
    expect(short.stderr).toContain('-h');
  } finally {
    f.clean();
  }
});

test('a wrong --since form prints the timing usage line, exits 1 and shows no ZodError', async () => {
  const f: Fixture = await fixture();
  try {
    for (const args of [
      ['timing', '--flow', '--since', '2026-10-25T00:00:00Z'],
      ['timing', '--cohort', '--since', '2026-10-25'],
    ]) {
      const result: Result = await cli(f, args);
      expect(result.code, args.join(' ')).toBe(1);
      expect(result.stdout, args.join(' ')).toBe('');
      expect(result.stderr).toContain('Usage: akrogon timing');
      expect(result.stderr).not.toContain('ZodError');
      expect(result.stderr).not.toContain('^');
    }
  } finally {
    f.clean();
  }
});

test('help and the unknown-flag error do no work on an empty home and stop nothing', async () => {
  const home: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-empty-')));
  for (const args of [['seat', '--help'], ['seat', '--compare'], ['timing', '--help'], ['stop', '--help']]) {
    const before: string[] = readdirSync(home).sort();
    const result: Result = await bareCli(args, home);
    if (args[1] === '--help') expect(result.code, args.join(' ')).toBe(0);
    else expect(result.code, args.join(' ')).toBe(1);
    expect(readdirSync(home).sort(), args.join(' ')).toEqual(before);
  }
  const f: Fixture = await fixture();
  try {
    leaf(f, 'x', 'implement');
    const help: Result = await cli(f, ['stop', '--help', 'x']);
    expect(help.code).toBe(0);
    expect(existsSync(resolve(f.home, 'stopped.yaml'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a --help after -- reaches the child command and is not answered by akrogon', async () => {
  const f: Fixture = await fixture();
  try {
    const probe: string = resolve(f.home, 'probe.txt');
    const leafPath: string = leaf(f, 'help-child', 'implement');
    const result: Result = await cli(f, [
      'run-check',
      '--name',
      'help-child',
      '--leaf',
      leafPath,
      '--',
      'sh',
      '-c',
      `printf %s "$1" > ${probe}`,
      'x',
      '--help',
    ]);
    expect(result.code).toBe(0);
    expect(readFileSync(probe, 'utf8')).toBe('--help');
  } finally {
    f.clean();
  }
});

test('errors that are not unknown flags or wrong --since forms report as on the base', async () => {
  const f: Fixture = await fixture();
  try {
    const missing: Result = await cli(f, ['seat', '--slot']);
    expect(missing.code).toBe(1);
    expect(missing.stderr).toContain("TypeError: Option '--slot <value>' argument missing");
    expect(missing.stderr).toContain('^');
    const positional: Result = await cli(f, ['config', 'extra']);
    expect(positional.code).toBe(1);
    expect(positional.stderr).toContain('ZodError');
    const runtime: Result = await cli(f, ['status', 'no-such-leaf']);
    expect(runtime.code).toBe(1);
    expect(runtime.stderr).toContain('Missing leaf: no-such-leaf');
  } finally {
    f.clean();
  }
});
