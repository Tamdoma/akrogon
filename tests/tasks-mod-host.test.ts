import { test } from 'bun:test';
import { resolve } from 'node:path';
import { command } from '../src/shell';

const root: string = resolve(import.meta.dir, '..');
const host: string = `
import { mock } from 'bun:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const sharedState = new Map();
const tasks = [];
const t = { background: '#101010', foreground: '#eeeeee', muted: '#777777', dim: '#888888', ansi4: '#0000ff', working: '#ffff00' };
function element(kind, source) {
  const node = { kind, source, nodes: [], attrs: {}, handlers: {} };
  const proxy = new Proxy(node, { get(target, name) {
    if (name in target) return target[name];
    return (...args) => {
      if (name === 'child') target.nodes.push(args[0]);
      else if (name === 'children') target.nodes.push(...args[0]);
      else if (name === 'when' && args[0]) args[1](proxy);
      else if (name === 'on_click') target.handlers.click = args[0];
      else if (name !== 'hover') target.attrs[name] = args[0];
      return proxy;
    };
  }});
  return proxy;
}
const cx = { timer: { every() {} }, spawn(task) { tasks.push(task); }, notify() {}, stop_propagation() {} };
mock.module('gpui-kit', () => ({ View: class {}, div: () => element('div'), svg: source => element('svg', source), image: source => element('image', source) }));
mock.module('gpui-base', () => ({ v_flex: () => element('column'), h_flex: () => element('row') }));
mock.module('herdr', () => ({
  exec: async () => { throw new Error('akrogon unavailable'); }, readTextFile: async () => null,
  watchFolder: async () => [], knownAgents: async () => [],
  spaces: () => [{ id: 'space', active: true, name: 'akrogon', folder: '' }],
  theme: () => t, shared: key => sharedState.get(key), setShared: (key, value) => sharedState.set(key, value),
  nextCommand: () => new Promise(() => {}), props: () => null,
}));
const { default: Tasks } = await import('./herdr-app/tasks/main.js');
const { board, leafRows } = await import('./herdr-app/tasks/model.js');
const env = JSON.parse(readFileSync('tests/fixtures/status-envelope.json', 'utf8'));
const view = new Tasks();
view.init(null, cx);
view.env = env;
view.agents = [{ key: 'pi', icon: 'pi.svg', tint: true }, { key: 'codex', icon: 'codex.png', tint: false }];
view.rebuild();
function nodes(node) { return typeof node === 'string' ? [] : [node, ...node.nodes.flatMap(nodes)]; }
function text(node) { return typeof node === 'string' ? [node] : node.nodes.flatMap(text); }
`;

test('seat letters remain visible beside matched logos and working spinners', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
const row = leafRows(view.model).find(row => row.slug === 'tasks-mod');
const rendered = view.row(row, t);
assert(text(rendered).includes('A'));
assert(text(rendered).includes('B'));
`,
    ],
    root,
  );
});

test('stage tint is composited over the pills own opaque theme background', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
const row = leafRows(view.model).find(row => row.slug === 'tasks-mod');
const rendered = view.pillFor(row, t);
assert.equal(rendered.attrs.bg, t.background);
assert(nodes(rendered).some(node => node.attrs.bg === '#0000ff1f'));
`,
    ],
    root,
  );
});

test('expanding a leaf shows the recorded repository kept paths and reasons', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
const row = leafRows(view.model).find(row => row.slug === 'tasks-mod');
view.row(row, t).handlers.click({}, cx);
const rendered = text(view.row(row, t)).join(' ');
for (const kept of env.repos.find(repo => repo.name === row.repo).kept) {
  assert(rendered.includes(kept.path));
  assert(rendered.includes(kept.reason));
}
`,
    ],
    root,
  );
});

test('a click on a row or a fold redraws at once instead of on the next tick', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
let drawn = 0;
const counting = { ...cx, notify() { drawn += 1; } };
const row = leafRows(view.model).find(row => row.slug === 'tasks-mod');
view.row(row, t).handlers.click({}, counting);
assert.equal(drawn, 1);
assert(view.expanded.has(row.repo + '/' + row.slug));
`,
    ],
    root,
  );
});

test('same slugs in different repositories expand and pin independently', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
const first = env.repos.find(repo => repo.name === 'akrogon').leaves.find(leaf => leaf.slug === 'tasks-mod');
const second = env.repos.find(repo => repo.name === 'framework').leaves[0];
second.slug = first.slug;
view.rebuild();
const rows = leafRows(view.model).filter(row => row.slug === first.slug);
const firstRow = view.row(rows[0], t);
const secondRow = view.row(rows[1], t);
assert.notEqual(firstRow.attrs.id, secondRow.attrs.id);
secondRow.handlers.click({}, cx);
assert(!text(view.row(rows[0], t)).includes('Files'));
const expanded = view.row(rows[1], t);
const buttons = nodes(expanded).filter(node => node.handlers.click && text(node).length === 1 && ['Files', 'Changes'].includes(text(node)[0]));
for (const button of buttons) {
  button.handlers.click({}, cx);
  assert.equal(sharedState.get('worktree.pin').space.folder, second.worktree);
}
assert.equal(buttons.length, 2);
`,
    ],
    root,
  );
});

test('panel request sequences advance after remounts and other writers', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
Date.now = () => 1000;
view.init(null, cx);
view.env = env;
view.pin('tasks-mod', 'files');
const first = sharedState.get('panel.request').seq;
view.init(null, cx);
view.env = env;
view.pin('tasks-mod', 'files');
assert(sharedState.get('panel.request').seq > first);
const other = sharedState.get('panel.request').seq + 100;
sharedState.set('panel.request', { op: 'open', view: 'changes', seq: other });
view.pin('tasks-mod', 'files');
assert(sharedState.get('panel.request').seq > other);
`,
    ],
    root,
  );
});

test('a failed initial scan waits for the timer before retrying', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
tasks.length = 0;
view.init(null, cx);
const scan = tasks.pop();
await scan(cx);
assert.equal(view.env, null);
assert(view.error.includes('akrogon unavailable'));
assert.equal(tasks.length, 1);
view.tick(cx);
assert.equal(tasks.length, 2);
assert.equal(view.scanning, true);
`,
    ],
    root,
  );
});
