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
let fontSize = 13;
const t = { background: '#101010', foreground: '#eeeeee', muted: '#777777', dim: '#888888', ansi1: '#ff0000', hover: '#222222', border: '#333333', selected: '#2a2a2a', ansi3: '#aa8800', working: '#ffff00' };
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
  nextCommand: () => new Promise(() => {}), props: () => null, settings: () => ({ font_size: fontSize }),
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
function leaf(repoName, slug) { return env.repos.find(r => r.name === repoName).leaves.find(l => l.slug === slug); }
function mk(repoName, slug, extra) {
  const repo = env.repos.find(r => r.name === repoName);
  const copy = JSON.parse(JSON.stringify(repo.leaves[0]));
  copy.slug = slug; Object.assign(copy, extra);
  repo.leaves.push(copy);
  return copy;
}
`;

test('sections render in order with dim labels and a red Needs you label; merged and empty sections draw nothing', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
mk('akrogon', 'failed-leaf', { phase: 'failed', attention: ['failed: x'], red: true, busy_since: { a: null, b: null } });
mk('akrogon', 'stopped-leaf', { stopped: true, phase: 'implement' });
view.rebuild();
const tree = view.render(cx);
const labels = nodes(tree).filter(n => n.attrs.id && n.attrs.id.startsWith('section-')).map(n => n.attrs.id.slice(8));
assert.deepEqual(labels, ['Needs you', 'Working', 'Waiting', 'Paused']);
const needs = nodes(tree).find(n => n.attrs.id === 'section-Needs you');
assert.equal(needs.nodes[0].attrs.text_color, t.ansi1);
const working = nodes(tree).find(n => n.attrs.id === 'section-Working');
assert.equal(working.nodes[0].attrs.text_color, t.dim);
const all = text(tree).join(' ');
assert(!all.includes('status-json'));
assert(!all.includes('tasks-board'));
`,
    ],
    root,
  );
});

test('the header shows the envelope problem count in red only when above zero', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
env.red = 3;
view.rebuild();
let tree = view.render(cx);
assert(nodes(tree).some(n => n.attrs.text_color === t.ansi1 && text(n).join('').includes('3 problems')));
env.red = 0;
view.rebuild();
tree = view.render(cx);
assert(!text(tree).join(' ').includes('problems'));
`,
    ],
    root,
  );
});

test('scan failures draw a red machine line: first load Tasks unavailable, later refresh failed with the snapshot age', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
view.stamp = Date.now() - 7 * 60000;
view.error = 'akrogon status --json: exit 1';
let all = text(view.render(cx)).join(' ');
assert(all.includes('refresh failed'));
assert(all.includes('rows from 7m ago'));
view.env = null; view.model = null;
all = text(view.render(cx)).join(' ');
assert(all.includes('Tasks unavailable'));
assert(all.includes('akrogon status --json: exit 1'));
`,
    ],
    root,
  );
});

test('the run waiting line is dim and reveals its full text on click', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
env.run = 'full test waiting behind run abc-extra';
view.rebuild();
let tree = view.render(cx);
const line = nodes(tree).find(n => n.handlers.click && text(n).join(' ').includes('run waiting'));
assert(line, 'a clickable run waiting line');
assert(!text(tree).join(' ').includes('abc-extra'));
line.handlers.click({}, cx);
tree = view.render(cx);
assert(text(tree).join(' ').includes('abc-extra'));
`,
    ],
    root,
  );
});

test('a row shows seats as one-color program icons and a muted spinner; a click pins the leaf folder to Files', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
view.render(cx);
const busy = leafRows(view.model).find(r => r.slug === 'fixture-weave-recorder');
assert(nodes(view.row(busy, t)).some(n => n.source === 'mods/workspace-chrome/spinner.svg' && n.attrs.text_color === t.muted));
leaf('akrogon', 'tasks-mod').busy_since = { a: null, b: null };
view.rebuild();
const row = leafRows(view.model).find(r => r.slug === 'tasks-mod');
const rendered = view.row(row, t);
assert(nodes(rendered).some(n => n.source === 'pi.svg' && n.attrs.text_color === '#ffffffb3'));
assert(nodes(rendered).some(n => n.kind === 'image' && n.source === 'mono/codex.png'));
assert(nodes(rendered).every(n => n.attrs.font_semibold === undefined));
rendered.handlers.click({}, cx);
const target = leaf('akrogon', 'tasks-mod').plan.replace(/\\/[^/]+$/, '');
assert.equal(sharedState.get('worktree.pin').space.folder, target);
assert.equal(sharedState.get('panel.request').view, 'files');
assert.deepEqual([...sharedState.keys()].sort(), ['panel.request', 'worktree.pin']);
`,
    ],
    root,
  );
});

test('the chevron toggles expansion without pinning; parked rows have no click target', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
env.repos.find(r => r.name === 'akrogon').parked = ['parked-slug'];
view.rebuild();
const row = leafRows(view.model).find(r => r.slug === 'tasks-mod');
const rendered = view.row(row, t);
const chevron = nodes(rendered).find(n => String(n.attrs.id ?? '').startsWith('chev-'));
assert(chevron && chevron.handlers.click, 'a clickable chevron');
assert(nodes(chevron).some(c => String(c.source ?? '').includes('chevron')));
chevron.handlers.click({}, cx);
assert(view.expanded.has('akrogon/tasks-mod'));
assert.equal(sharedState.get('worktree.pin'), undefined);
const parked = view.model.sections.find(s => s.name === 'Paused').rows.find(r => r.slug === 'parked-slug');
assert(parked);
assert.equal(view.row(parked, t).handlers.click, undefined);
`,
    ],
    root,
  );
});

test('the expansion shows the reason whole, blockers, missing steps, last 3 moves, Files and Changes buttons and kept, and nothing else', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
const target = leaf('akrogon', 'tasks-mod');
target.attention = ['failed: check: a review reason long enough to need the expansion because it never fits'];
target.red = true;
target.missing = [{ kind: 'env', name: 'TOKEN', holder: 'akrogon', steps: 'add TOKEN to config env' }];
target.history = [JSON.stringify({ ts: '2026-11-03T16:35:52.734Z', from: 'check.review', to: 'check.repair', slot: 'B' })];
view.rebuild();
const row = leafRows(view.model).find(r => r.slug === 'tasks-mod');
view.expanded.add('akrogon/tasks-mod');
const rendered = view.row(row, t);
const all = text(rendered).join(' ');
assert(all.includes('a review reason long enough'));
assert(all.includes('status-json merged'));
assert(all.includes('add TOKEN to config env'));
assert(all.includes('ago'));
assert(all.includes('Files') && all.includes('Changes'));
for (const kept of env.repos.find(r => r.name === 'akrogon').kept) assert(all.includes(kept.path));
assert(!all.includes('/home/ivan/.akrogon/config.yaml'));
assert(!all.includes(target.plan));
assert(!all.includes('A:0'));
assert((all.match(/ago {2}/g) ?? []).length <= 3);
assert(nodes(rendered).every(n => n.attrs.bg !== t.selected));
const files = nodes(rendered).find(n => n.handlers.click && text(n).join('') === 'Files');
files.handlers.click({}, cx);
assert.equal(sharedState.get('worktree.pin').space.folder, target.worktree);
`,
    ],
    root,
  );
});

test('a Needs you row keeps a white slug, a red reason and a spinning busy seat', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
mk('akrogon', 'failed-leaf', { phase: 'failed', attention: ['failed: review found defects'], red: true, busy_since: { a: env.generated - 60000, b: null } });
view.rebuild();
const row = leafRows(view.model).find(r => r.slug === 'failed-leaf');
const rendered = view.row(row, t);
const slug = nodes(rendered).find(n => text(n).join('') === 'failed-leaf');
assert.equal(slug.attrs.text_color, t.foreground);
const reason = nodes(rendered).find(n => text(n).join('') === 'failed: review found defects');
assert.equal(reason.attrs.text_color, t.ansi1);
`,
    ],
    root,
  );
});

test('row text and seat icons follow the terminal font size while chrome stays fixed; the list has no width cap', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
fontSize = 26;
const tree = view.render(cx);
const row = leafRows(view.model).find(r => r.slug === 'tasks-mod');
const rendered = view.row(row, t);
const slug = nodes(rendered).find(n => text(n).join('') === 'tasks-mod');
assert.equal(slug.attrs.text_size, 26);
const phase = nodes(rendered).find(n => text(n).join('') === 'plan.synthesis');
assert.equal(phase.attrs.text_size, 22);
assert(nodes(rendered).some(n => n.kind === 'svg' && n.attrs.size === 36));
view.expanded.add('akrogon/tasks-mod');
assert(nodes(view.row(row, t)).some(n => n.attrs.text_size === 22));
const root = nodes(tree).find(n => n.attrs.id === 'tasks');
const header = root.nodes[0];
assert.equal(header.attrs.h, 42);
assert.equal(header.attrs.px, 14);
const title = nodes(header).find(n => n.nodes.length === 1 && n.nodes[0] === 'Tasks');
assert.equal(title.attrs.text_size, 13);
const list = nodes(tree).find(n => n.attrs.id === 'tasks-list');
assert.equal(list.attrs.max_w, undefined);
const inner = list.nodes[0];
assert.equal(inner.attrs.p, 6);
assert.equal(rendered.attrs.px, 8);
const label = nodes(tree).find(n => n.attrs.id === 'section-Waiting');
assert.equal(label.nodes[0].attrs.text_size, 11);
`,
    ],
    root,
  );
});

test('a chevron click redraws at once instead of on the next tick', async () => {
  await command(
    [
      process.execPath,
      '-e',
      host +
        `
let drawn = 0;
const counting = { ...cx, notify() { drawn += 1; } };
const row = leafRows(view.model).find(r => r.slug === 'tasks-mod');
const chevron = nodes(view.row(row, t)).find(n => String(n.attrs.id ?? '').startsWith('chev-'));
chevron.handlers.click({}, counting);
assert.equal(drawn, 1);
assert(view.expanded.has('akrogon/tasks-mod'));
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
const first = env.repos.find(r => r.name === 'akrogon').leaves.find(l => l.slug === 'tasks-mod');
const second = env.repos.find(r => r.name === 'framework').leaves[0];
second.slug = first.slug;
view.rebuild();
const rows = leafRows(view.model).filter(r => r.slug === first.slug);
const firstRow = rows.find(r => r.repo === 'akrogon');
const secondRow = rows.find(r => r.repo === 'framework');
assert.notEqual(view.row(firstRow, t).attrs.id, view.row(secondRow, t).attrs.id);
const secondChevron = nodes(view.row(secondRow, t)).find(n => String(n.attrs.id ?? '').startsWith('chev-'));
secondChevron.handlers.click({}, cx);
assert(!text(view.row(firstRow, t)).join(' ').includes('Files'));
const expanded = view.row(secondRow, t);
const buttons = nodes(expanded).filter(n => n.handlers.click && text(n).join('') === 'Files' || (n.handlers.click && text(n).join('') === 'Changes'));
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
