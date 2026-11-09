// Criterion 1: the chart door's exchange wiring on a real hc core with stand-in consultants. The door
// is a terminal that, like a door agent, starts its consultants through the start verb, then runs
// `hc wait --children any` from its own terminal (re-armed after a wake, plan D4) and reads the `<hc>`
// reports typed into it.
import { test, expect } from 'bun:test';
import { chmodSync, existsSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, type Fixture } from './helpers';
import { hcCore, type HcCore, type Terminal } from './hc-fixture';
import { spawnCaptured, type SpawnResult } from '../src/shell';

// Each consultant's task names a key; its hook holds on the fifo go-<key> until the test opens it,
// then does the scripted thing. `hold-<key>` is never written, so a holding consultant keeps working.
const HOOK: string = `#!/bin/sh
dir=$(dirname "$0")
key=\${2##* }
hold() { [ -p "$dir/hold-$key" ] || mkfifo "$dir/hold-$key"; read _ < "$dir/hold-$key"; }
read _ < "$dir/go-$key"
case "$2" in
report*) printf 'notes\\n' > "$dir/return-$key"; door=\${2#report }; hc send "\${door% *}" "done $key: $dir/return-$key"; hold ;;
block*) printf '\\033]7501;state=blocked:kind=permission:msg=Allow?\\007'; hold ;;
error*) printf '\\033]7501;state=error\\007'; hold ;;
exit*) kill -9 "$PPID" ;;
hold*) hold ;;
stop*) : ;;
esac
`;

type Door = { address: string; dir: string };

async function setup(): Promise<{ f: Fixture; core: HcCore }> {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  writeFileSync(resolve(core.standin, 'hook'), HOOK);
  chmodSync(resolve(core.standin, 'hook'), 0o755);
  return { f, core };
}

// The door reports agent status like a door agent (hc wraps a message to an agent as `<hc from=...>`),
// waits for `go`, runs the exchange wait `waits` times in its own turn (wait.json, wait2.json, ...),
// then keeps the first line typed into it.
async function startDoor(core: HcCore, f: Fixture, name: string, waits: number): Promise<Door> {
  const dir: string = resolve(f.home, name);
  await spawnCaptured(['mkdir', '-p', dir]);
  const wait = (n: number): string => {
    const tag: string = n === 1 ? 'wait' : `wait${n}`;
    return `hc wait --children any --json --timeout 20 > ${dir}/${tag}.json 2> ${dir}/${tag}.err; echo $? > ${dir}/${tag}.code; `;
  };
  const script: string = `set -m; printf '\\033]7501;state=idle\\007'; read go; printf '\\033]7501;state=working\\007'; ${Array.from({ length: waits }, (_: unknown, i: number) => wait(i + 1)).join('')}IFS= read -r line; printf '%s\\n' "$line" > ${dir}/inbox; exec cat`;
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--name',
    name,
    '--cwd',
    f.root,
    '--',
    'bash',
    '-c',
    script,
  ]);
  expect(started.code).toBe(0);
  return { address: z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address, dir };
}

async function consult(f: Fixture, core: HcCore, door: Door, letter: string, task: string): Promise<Terminal> {
  const key: string = task.split(' ').at(-1) ?? task;
  const fifo: string = resolve(core.standin, `go-${key}`);
  expect((await spawnCaptured(['mkfifo', fifo])).code).toBe(0);
  const started = await cli(
    f,
    ['seat', '--slot', letter, '--harness', 'fake', '--model', 'work', '--effort', 'low', '--task', task],
    f.root,
    { ...core.env, HC_TERMINAL_ID: door.address },
  );
  expect(started.code).toBe(0);
  const child: Terminal = (await core.terminals({ akrogon: '1' })).filter(
    (t: Terminal) => t.name === `${f.prefix}-slot-${letter}`,
  )[0];
  expect(child.parent).toBe(door.address);
  expect(child.labels['akrogon.seat']).toBe(letter);
  return child;
}

// Follows the door's foreground program on hc events (snapshot first) until `until` holds for its argv;
// the timer only bounds the follow.
async function foreground(core: HcCore, door: Door, until: (argv: string[] | null) => boolean): Promise<void> {
  const child = Bun.spawn(['hc', 'events', '--json', '--terminal', door.address], {
    env: { ...process.env, ...core.env, HC_SESSION: core.session },
    stdout: 'pipe',
    stderr: 'ignore',
  });
  const timer = setTimeout(() => child.kill(), 15_000);
  const fg = z.object({ argv: z.array(z.string()) }).nullable();
  let buffer: string = '';
  let reached: boolean = false;
  for await (const chunk of child.stdout) {
    buffer += new TextDecoder().decode(chunk);
    const lines: string[] = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines.filter((l: string) => l.trim() !== '')) {
      const message = z
        .object({
          terminals: z.array(z.object({ foreground: fg.optional() })).optional(),
          params: z.object({ type: z.string(), data: z.unknown() }).optional(),
        })
        .parse(JSON.parse(line));
      const argv: string[] | null | undefined =
        message.terminals !== undefined
          ? (message.terminals[0]?.foreground?.argv ?? null)
          : message.params?.type === 'foreground'
            ? (fg.parse(message.params.data)?.argv ?? null)
            : undefined;
      if (argv !== undefined && until(argv)) reached = true;
    }
    if (reached) break;
  }
  clearTimeout(timer);
  child.kill();
  expect(reached).toBe(true);
}

const inWait = (argv: string[] | null): boolean => argv !== null && argv[0] === 'hc' && argv[1] === 'wait';

// Resolves when `path` exists, woken by the folder's change events; the timer only bounds it.
function appears(path: string, ms: number = 15_000): Promise<void> {
  return new Promise<void>((done, fail) => {
    const watcher = watch(resolve(path, '..'), () => {
      if (!existsSync(path)) return;
      clearTimeout(timer);
      watcher.close();
      done();
    });
    const timer = setTimeout(() => {
      watcher.close();
      fail(new Error(`${path} did not appear in ${ms} ms`));
    }, ms);
    if (existsSync(path)) {
      clearTimeout(timer);
      watcher.close();
      done();
    }
  });
}

async function trigger(core: HcCore, key: string): Promise<void> {
  expect((await spawnCaptured(['sh', '-c', `printf 'go\\n' > ${resolve(core.standin, `go-${key}`)}`])).code).toBe(0);
}

async function exchange(
  name: (f: Fixture) => string,
  letters: [string, string],
  tasks: (door: Door) => [string, string],
  triggers: string[],
): Promise<{ f: Fixture; core: HcCore; door: Door; children: Terminal[]; ended: { code: string; json: string } }> {
  const { f, core } = await setup();
  const door: Door = await startDoor(core, f, name(f), 1);
  const [first, second] = tasks(door);
  const children: Terminal[] = [
    await consult(f, core, door, letters[0], first),
    await consult(f, core, door, letters[1], second),
  ];
  expect((await core.hc(['send', door.address, 'go'])).code).toBe(0);
  await foreground(core, door, inWait);
  for (const key of triggers) await trigger(core, key);
  await foreground(core, door, (argv) => !inWait(argv));
  const ended: { code: string; json: string } = {
    code: readFileSync(`${door.dir}/wait.code`, 'utf8').trim(),
    json: readFileSync(`${door.dir}/wait.json`, 'utf8'),
  };
  return { f, core, door, children, ended };
}

test('a consultant report ends the wait at once and arrives as an <hc> message while a sibling still works', async () => {
  const run = await exchange((f) => `${f.prefix}-door-report`, ['b', 'c'], (door) => [`report ${door.address} kb`, 'hold kc'], ['kb']);
  try {
    expect(run.ended.code).toBe('0');
    expect((await run.core.get(run.children[1].address)).status?.state).toBe('working');
    await foreground(run.core, run.door, (argv) => argv !== null && argv[0] === 'cat');
    const inbox: string = readFileSync(`${run.door.dir}/inbox`, 'utf8');
    expect(inbox).toContain(`<hc from=`);
    expect(inbox).toContain(`done kb: ${resolve(run.core.standin, 'return-kb')}`);
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

test.each([
  ['blocked', 'block'],
  ['errored', 'error'],
  ['exited', 'exit'],
])('a %s consultant ends the wait at once while a sibling still works', async (_label: string, action: string) => {
  const run = await exchange((f) => `${f.prefix}-door-${action}`, ['d', 'e'], () => [`${action} k${action}`, `hold h${action}`], [
    `k${action}`,
  ]);
  try {
    expect(run.ended.code).toBe('0');
    expect((await run.core.get(run.children[1].address)).status?.state).toBe('working');
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

test('the wait ends when every consultant stopped working without a report', async () => {
  const run = await exchange((f) => `${f.prefix}-door-stop`, ['f', 'g'], () => ['stop kf', 'stop kg'], ['kf', 'kg']);
  try {
    expect(run.ended.code).toBe('0');
    for (const child of run.children) expect((await run.core.get(child.address)).status?.state).not.toBe('working');
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

// D4: the door re-arms the wait after each wake; news it already saw must not end the next wait.
test('a re-armed wait ignores the report it already woke on and ends on the next consultant news', async () => {
  const { f, core } = await setup();
  try {
    const door: Door = await startDoor(core, f, `${f.prefix}-door-rearm`, 2);
    const reporter: Terminal = await consult(f, core, door, 'h', `report ${door.address} kh`);
    const blocker: Terminal = await consult(f, core, door, 'i', 'block ki');
    expect((await core.hc(['send', door.address, 'go'])).code).toBe(0);
    await foreground(core, door, inWait);
    await trigger(core, 'kh');
    await appears(`${door.dir}/wait.code`);
    expect(readFileSync(`${door.dir}/wait.code`, 'utf8').trim()).toBe('0');
    expect((await core.get(blocker.address)).status?.state).toBe('working');
    await trigger(core, 'ki');
    await foreground(core, door, (argv) => !inWait(argv));
    expect(readFileSync(`${door.dir}/wait2.code`, 'utf8').trim()).toBe('0');
    const woke = z.object({
      reason: z.string(),
      from: z.string().optional(),
      children: z.array(z.object({ terminal: z.string(), status: z.string().nullable() })),
    });
    const first = woke.parse(JSON.parse(readFileSync(`${door.dir}/wait.json`, 'utf8')));
    expect([first.reason, first.from]).toEqual(['message', reporter.address]);
    const second = woke.parse(JSON.parse(readFileSync(`${door.dir}/wait2.json`, 'utf8')));
    expect(second.children.map((c) => [c.terminal, c.status])).toEqual([[blocker.address, 'blocked']]);
  } finally {
    await core.stop();
    f.clean();
  }
});
