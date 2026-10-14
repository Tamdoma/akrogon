import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-ask.ts');
const paneB: string = 'w8:pB';
const paneC: string = 'w8:pC';

type RunResult = { code: number; stdout: string; stderr: string };
type ScriptEntry = { code?: string; append?: string };
type Setup = {
  fileB: string;
  fileC: string;
  calls: () => string[][];
  herdrCalled: () => boolean;
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

function setup(promptScript: ScriptEntry[], waitScript: (fileB: string) => ScriptEntry[]): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-ask-')));
  const fileB: string = resolve(dir, 'return-B.md');
  const fileC: string = resolve(dir, 'return-C.md');
  const bin: string = resolve(dir, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: [paneB, paneC].map((pane_id: string) => ({
        pane_id,
        tab_id: 'w8:t1',
        cwd: '/tmp',
        agent: 'fake',
        agent_status: 'idle',
      })),
      tabs: [],
      serial: 0,
      promptScript,
      waitScript: waitScript(fileB),
    }),
  );
  return {
    fileB,
    fileC,
    calls: (): string[][] =>
      readFileSync(`${db}.calls`, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line) as string[]),
    herdrCalled: (): boolean => existsSync(`${db}.calls`),
    run: async (...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db },
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function verbs(calls: string[][]): string[] {
  return calls.map((args: string[]): string => `${args[0]} ${args[1]} ${args[2] ?? ''}`.trim());
}

test('prompts, then waits for the answer in the same call', async (): Promise<void> => {
  const s: Setup = setup([{}], (fileB: string): ScriptEntry[] => [{ append: fileB }]);
  try {
    const result: RunResult = await s.run('10', paneB, s.fileB, 'read the brief');
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ outcome: 'done', pane: paneB, file: s.fileB, status: null });
    const order: string[] = verbs(s.calls());
    expect(order[0]).toBe(`agent prompt ${paneB}`);
    expect(order).toContain(`agent wait ${paneB}`);
  } finally {
    s.clean();
  }
});

test('a failed prompt skips that wait, still waits on the others and exits non-zero', async (): Promise<void> => {
  const s: Setup = setup([{}, { code: 'agent_blocked' }], (fileB: string): ScriptEntry[] => [{ append: fileB }]);
  try {
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, s.fileC, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`herdr agent prompt ${paneC} failed`);
    expect(result.stderr).toContain('agent_blocked');
    expect(JSON.parse(result.stdout)).toEqual({ outcome: 'done', pane: paneB, file: s.fileB, status: null });
    expect(verbs(s.calls())).not.toContain(`agent wait ${paneC}`);
  } finally {
    s.clean();
  }
});

test('refuses a reused return file before prompting anyone', async (): Promise<void> => {
  const s: Setup = setup([], (): ScriptEntry[] => []);
  try {
    writeFileSync(s.fileC, 'old answer\n');
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, s.fileC, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(s.fileC);
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});

test('rejects missing args and a bad budget before prompting', async (): Promise<void> => {
  const s: Setup = setup([], (): ScriptEntry[] => []);
  try {
    for (const args of [
      ['10', paneB, s.fileB],
      ['abc', paneB, s.fileB, 'brief'],
      ['0', paneB, s.fileB, 'brief'],
    ]) {
      const result: RunResult = await s.run(...args);
      expect(result.code).toBe(1);
      expect(result.stderr).not.toBe('');
      expect(result.stdout).toBe('');
    }
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});

test('refuses two peers sharing one return file before prompting anyone', async (): Promise<void> => {
  const s: Setup = setup([], (): ScriptEntry[] => []);
  try {
    const same: string = s.fileB.replace(/return-B\.md$/, './return-B.md');
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, same, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('own return file');
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});
