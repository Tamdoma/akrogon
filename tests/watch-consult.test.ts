// Brief criteria 3-4: `akrogon seat --watch-consultant --task <text>` on a real hc core with the
// stand-in harness starts the machine recipe named <prefix>-watch-consult, parented to the caller
// with outlive: false and the watch labels; every refused form exits non-zero naming the conflict
// or the missing slots.consultant key and starts nothing.
import { test, expect } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, type Fixture } from './helpers';
import { hcCore, type HcCore, type Terminal } from './hc-fixture';
import type { Result } from '../src/shell';

// Writes or removes the machine slots.consultant recipe; the stand-in harness template for the
// chosen harness name is kept in harnesses so the recipe resolves.
function setConsultant(f: Fixture, recipe: { harness: string; model: string; effort?: string } | undefined): void {
  const path: string = resolve(f.home, 'config.yaml');
  const global = z
    .object({ slots: z.record(z.string(), z.unknown()), harnesses: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  const { consultant: _old, ...slots } = global.slots;
  writeFileSync(
    path,
    Bun.YAML.stringify({
      ...global,
      slots:
        recipe === undefined
          ? slots
          : {
              ...slots,
              consultant: { harness: recipe.harness, model: recipe.model, effort: recipe.effort ?? 'low' },
            },
      harnesses:
        recipe === undefined
          ? global.harnesses
          : { ...global.harnesses, [recipe.harness]: `${recipe.harness} --model {model} --effort {effort}` },
    }),
  );
}

// The calling watcher terminal: a plain foreground program is enough; the consultant only needs a
// live parent address.
async function startWatcher(core: HcCore, f: Fixture): Promise<string> {
  const started = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--name',
    `${f.prefix}-wc-door`,
    '--cwd',
    f.root,
    '--',
    'bash',
    '-c',
    'exec cat',
  ]);
  expect(started.code).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

async function watchConsult(core: HcCore, f: Fixture): Promise<Terminal> {
  const found: Terminal[] = (await core.terminals({ akrogon: '1' })).filter(
    (t: Terminal) => t.name === `${f.prefix}-watch-consult`,
  );
  expect(found.map((t: Terminal) => t.state)).toEqual(['live']);
  return found[0];
}

test('seat --watch-consultant starts the recipe harness named <prefix>-watch-consult with the task in argv', async () => {
  const f: Fixture = await fixture();
  setConsultant(f, { harness: 'fake', model: 'work', effort: 'high' });
  const core: HcCore = await hcCore(f);
  try {
    const caller: string = await startWatcher(core, f);
    const task: string = 'watch-consults <repo> consults/wc-one/brief.md';
    const started: Result = await cli(f, ['seat', '--watch-consultant', '--task', task], f.root, {
      ...core.env,
      HC_TERMINAL_ID: caller,
    });
    // A confirmed start prints the bare address; `started, not confirmed <address>` also exits 0
    // but must not satisfy this success case.
    expect(started.code).toBe(0);
    const child: Terminal = await watchConsult(core, f);
    expect(started.stdout).toBe(child.address);
    expect(child.parent).toBe(caller);
    expect(child.labels).toMatchObject({
      akrogon: '1',
      'akrogon.repo': f.repo,
      'akrogon.watch-consult': f.repo,
    });
    expect(child.labels['akrogon.leaf']).toBeUndefined();
    expect(child.labels['akrogon.seat']).toBeUndefined();
    // outlive: false — the hc run line parents to the caller without --outlive-parent.
    const runLine: string = z.string().parse(
      readFileSync(core.shimLog, 'utf8')
        .split('\n')
        .find((line: string) => line.startsWith('run\t') && line.includes(`${f.prefix}-watch-consult`)),
    );
    expect(runLine).toContain(`--parent\t${caller}`);
    expect(runLine).not.toContain('--outlive-parent');
    // The launch argv carries the recipe's own model and effort, not the caller's seat slots.
    const argv: string[] = runLine.split('\t');
    expect(argv[argv.indexOf('--model') + 1]).toBe('work');
    expect(argv[argv.indexOf('--effort') + 1]).toBe('high');
    expect(core.tasks(child.address)).toEqual([task]);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('a recipe harness that exits fails the start with the address on the output', async () => {
  const f: Fixture = await fixture();
  setConsultant(f, { harness: 'fake', model: 'exit' });
  const core: HcCore = await hcCore(f);
  try {
    const caller: string = await startWatcher(core, f);
    const started: Result = await cli(f, ['seat', '--watch-consultant', '--task', 'x'], f.root, {
      ...core.env,
      HC_TERMINAL_ID: caller,
    });
    expect(started.code).not.toBe(0);
    const children: Terminal[] = (await core.terminals({ akrogon: '1' })).filter(
      (t: Terminal) => t.name === `${f.prefix}-watch-consult`,
    );
    expect(children).toHaveLength(1);
    expect(`${started.stdout}\n${started.stderr}`).toContain('start failed');
    expect(`${started.stdout}\n${started.stderr}`).toContain(children[0].address);
    expect(children[0].parent).toBe(caller);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('seat --watch-consultant with an agy recipe answers the trust dialog then sends the task', async () => {
  const f: Fixture = await fixture();
  setConsultant(f, { harness: 'agy', model: 'trust' });
  const core: HcCore = await hcCore(f);
  try {
    const caller: string = await startWatcher(core, f);
    const task: string = 'watch-consults <repo> consults/wc-agy/brief.md';
    const started: Result = await cli(f, ['seat', '--watch-consultant', '--task', task], f.root, {
      ...core.env,
      HC_TERMINAL_ID: caller,
    });
    expect(started.code).toBe(0);
    const child: Terminal = await watchConsult(core, f);
    expect(started.stdout).toBe(child.address);
    expect(child.parent).toBe(caller);
    // agy takes no task in argv: ENTER answered the trust dialog, then the task went over hc send.
    expect(core.tasks(child.address)).toEqual(['ENTER', task]);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('seat --watch-consultant without slots.consultant exits non-zero naming the key and starts nothing', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const caller: string = await startWatcher(core, f);
    const refused: Result = await cli(f, ['seat', '--watch-consultant', '--task', 'x'], f.root, {
      ...core.env,
      HC_TERMINAL_ID: caller,
    });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('slots.consultant');
    expect(refused.stderr).toContain('config.yaml');
    // The bare form criterion 4 names is refused the same way.
    const bare: Result = await cli(f, ['seat', '--watch-consultant'], f.root, {
      ...core.env,
      HC_TERMINAL_ID: caller,
    });
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('slots.consultant');
    expect(bare.stderr).toContain('config.yaml');
    expect(await core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await core.stop();
    f.clean();
  }
});

test.each([
  { name: 'the positional <slug> <A|B> form', extra: ['some-leaf', 'A'], needle: 'some-leaf' },
  { name: '--slot', extra: ['--slot', 'b'], needle: '--slot' },
  { name: '--harness', extra: ['--harness', 'fake'], needle: '--harness' },
  { name: '--model', extra: ['--model', 'x'], needle: '--model' },
  { name: '--effort', extra: ['--effort', 'low'], needle: '--effort' },
])(
  'seat --watch-consultant combined with $name exits non-zero naming the conflict and starts nothing',
  async ({ extra, needle }) => {
    const f: Fixture = await fixture();
    setConsultant(f, { harness: 'fake', model: 'work' });
    const core: HcCore = await hcCore(f);
    try {
      const caller: string = await startWatcher(core, f);
      const refused: Result = await cli(f, ['seat', '--watch-consultant', '--task', 'x', ...extra], f.root, {
        ...core.env,
        HC_TERMINAL_ID: caller,
      });
      expect(refused.code).not.toBe(0);
      // The refusal names the conflicting flag, not a generic unknown-option rejection — the
      // parser knows --watch-consultant, so a parse error here means the conflict check fell
      // through.
      expect(refused.stderr).toContain('--watch-consultant');
      expect(refused.stderr).toContain(needle);
      expect(refused.stderr).not.toContain('unknown flag');
      expect(refused.stderr).not.toContain('ZodError');
      expect(await core.terminals({ akrogon: '1' })).toEqual([]);
    } finally {
      await core.stop();
      f.clean();
    }
  },
);

test('seat --watch-consultant outside an hc terminal exits non-zero naming the conflict and starts nothing', async () => {
  const f: Fixture = await fixture();
  setConsultant(f, { harness: 'fake', model: 'work' });
  const core: HcCore = await hcCore(f);
  try {
    const refused: Result = await cli(f, ['seat', '--watch-consultant', '--task', 'x'], f.root, {
      ...core.env,
      HC_TERMINAL_ID: '',
    });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('--watch-consultant');
    expect(refused.stderr).toContain('HC_TERMINAL_ID');
    expect(refused.stderr).not.toContain('unknown flag');
    expect(await core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await core.stop();
    f.clean();
  }
});
