import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { command, type Result } from '../src/shell';

export const entry: string = resolve(import.meta.dir, '../src/akrogon.ts');
export type Fixture = { home: string; root: string; clean: () => void };
export function yaml(path: string, data: object): void {
  writeFileSync(path, Bun.YAML.stringify(data));
}
export async function fixture(): Promise<Fixture> {
  const home: string = mkdtempSync(resolve(tmpdir(), 'akrogon-'));
  const root: string = resolve(home, 'repo');
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  writeFileSync(resolve(root, 'file'), 'initial\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'initial'], root);
  await command(['git', 'update-ref', 'refs/remotes/origin/main', 'HEAD'], root);
  yaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' } });
  yaml(resolve(home, 'config.yaml'), {
    slots: {
      a: { harness: 'fake', model: 'strong-a', effort: 'high' },
      b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
    },
    harnesses: { fake: 'fake --model {model} --effort {effort}' },
    repos: { repo: root },
  });
  return { home, root, clean: () => rmSync(home, { recursive: true, force: true }) };
}
export async function cli(
  f: Fixture,
  args: string[],
  cwd: string = f.root,
  env: NodeJS.ProcessEnv = {},
): Promise<Result> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, entry, ...args], {
    cwd,
    env: { ...process.env, AKROGON_HOME: f.home, HERDR_PANE_ID: '', ...env },
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}
export function leaf(f: Fixture, slug: string, phase: string, extra: object = {}, container: string = 'issue'): string {
  const path: string = resolve(f.root, 'issues/open', container, slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    priority: 'n',
    repo: 'repo',
    debate: 'no',
    'blocked-by': [],
    ...extra,
  });
  return path;
}

export type GhFixture = { db: string; env: NodeJS.ProcessEnv };
export function fakeGh(f: Fixture): GhFixture {
  const bin: string = resolve(f.home, 'gh-bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-gh.ts'), resolve(bin, 'gh'));
  const db: string = resolve(f.home, 'gh.json');
  writeFileSync(db, '[]');
  return { db, env: { PATH: `${bin}:${process.env.PATH}`, FAKE_GH: db } };
}
