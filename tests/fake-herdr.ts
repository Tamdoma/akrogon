#!/usr/bin/env bun
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { paneSchema, tabSchema, workspaceSchema } from '../src/shell';
import { OUTSIDE_CGROUP, boxedCgroup, expectedScope, expectedSlice, procDir, seedShell, shellPid } from './fake-proc';

const rectSchema = z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() });
type Rect = z.infer<typeof rectSchema>;
const ROOT_RECT: Rect = { x: 0, y: 0, width: 120, height: 40 };
const fakePaneSchema = paneSchema.extend({
  rect: rectSchema.optional(),
  focused: z.boolean().optional(),
  screen_detection_skipped: z.boolean().nullable().optional(),
  agent_name: z.string().optional(),
  foreground_process_group_id: z.number().optional(),
  agent_pid: z.number().optional(),
  exiting: z.boolean().optional(),
  foreground_processes: z.array(z.looseObject({ pid: z.number(), argv: z.array(z.string()) })).optional(),
  agent_session: z
    .object({
      kind: z.enum(['id', 'path']),
      value: z.string(),
      source: z.string().optional(),
      agent: z.string().optional(),
    })
    .nullable()
    .optional(),
});
type FakePane = z.infer<typeof fakePaneSchema>;
const fakeTabSchema = tabSchema.extend({
  focused: z.boolean().optional(),
  workspace_id: z.string().optional(),
});

const scriptEntrySchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  stderr: z.string().optional(),
  append: z.string().optional(),
  appendTo: z.string().optional(),
});
const promptEntrySchema = scriptEntrySchema.extend({
  session: z.string().optional(),
  status: paneSchema.shape.agent_status.optional(),
});
const waitEntrySchema = scriptEntrySchema.extend({
  status: paneSchema.shape.agent_status.optional(),
  sleepMs: z.number().optional(),
  session: z.string().nullable().optional(),
  kind: z.string().optional(),
  dropAgent: z.boolean().optional(),
  screenSkipped: z.boolean().nullable().optional(),
});
const databaseSchema = z.object({
  panes: z.array(fakePaneSchema),
  tabs: z.array(fakeTabSchema),
  workspaces: z.array(workspaceSchema).default([
    { workspace_id: 'w1', label: 'repo' },
    { workspace_id: 'w3', label: 'other' },
  ]),
  serial: z.number(),
  paneListStdout: z.string().optional(),
  failPrompts: z.boolean().default(false),
  blockOnStart: z.boolean().default(false),
  failSplitOnce: z.boolean().default(false),
  failSwapOnce: z.boolean().default(false),
  failNotification: z.boolean().default(false),
  failNotificationOnce: z.boolean().default(false),
  failRename: z.boolean().default(false),
  prompts: z.array(z.object({ pane: z.string(), text: z.string() })).default([]),
  starts: z.array(z.array(z.string())).default([]),
  startCgroups: z.array(z.object({ pane: z.string(), cgroup: z.string() })).default([]),
  startScript: z.array(scriptEntrySchema).default([]),
  promptScript: z.array(promptEntrySchema).default([]),
  renameScript: z.array(scriptEntrySchema).default([]),
  closeScript: z.array(scriptEntrySchema).default([]),
  waitScript: z.array(waitEntrySchema).default([]),
});
export type Database = z.infer<typeof databaseSchema>;
const path: string = z.string().parse(process.env.FAKE_HERDR);
const db: Database = databaseSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
const args: string[] = process.argv.slice(2);
appendFileSync(path + '.calls', JSON.stringify(args) + '\n');
function save(): void {
  writeFileSync(path, JSON.stringify(db));
}
function result(value: object): never {
  save();
  console.log(JSON.stringify({ result: value }));
  process.exit(0);
}
function failure(code: string): never {
  save();
  console.error(JSON.stringify({ error: { code, message: 'fixture failure' } }));
  process.exit(1);
}
function scriptedFailure(entry: z.infer<typeof scriptEntrySchema> | undefined): void {
  if (entry?.stderr !== undefined) {
    save();
    console.error(entry.stderr);
    process.exit(1);
  }
  if (entry?.code !== undefined) {
    save();
    console.error(JSON.stringify({ error: { code: entry.code, message: entry.message ?? '' } }));
    process.exit(1);
  }
}
function flag(name: string): string {
  const index: number = args.indexOf(name);
  if (index === -1) throw new Error(`Missing flag ${name}`);
  return args[index + 1];
}
function pane(id: string): FakePane {
  const found: FakePane | undefined = db.panes.find((p) => p.pane_id === id);
  if (found === undefined) throw new Error(`Missing pane ${id}`);
  return found;
}
function procRoot(): string {
  return z.string().parse(process.env.AKROGON_PROC_ROOT);
}
// A pane seeded straight into the db stands for a shell an earlier pass already boxed.
function ownCgroup(target: FakePane): string {
  const tab = db.tabs.find((t) => t.tab_id === target.tab_id);
  const workspace = db.workspaces.find((w) => w.workspace_id === (tab?.workspace_id ?? 'w1'));
  if (tab === undefined || workspace === undefined) return OUTSIDE_CGROUP;
  const slice: string = expectedSlice(workspace.label, tab.label);
  return boxedCgroup(slice, expectedScope(slice, target.pane_id));
}
if (args[0] === 'notification' && args[1] === 'show') {
  z.string().min(1).parse(args[2]);
  if (args.includes('--body') || args.includes('--sound')) {
    flag('--body');
    flag('--sound');
  }
  if (db.failNotificationOnce) {
    db.failNotificationOnce = false;
    failure('timeout');
  }
  if (db.failNotification) failure('fixture_notification_failed');
  result({ shown: true, reason: 'shown' });
}
if (args[0] === 'integration' && args[1] === 'install') {
  z.tuple([z.literal('integration'), z.literal('install'), z.string().min(1)]).parse(args);
  result({});
}
if (args[0] === 'plugin' && args[1] === 'link') {
  z.tuple([z.literal('plugin'), z.literal('link'), z.string().min(1)]).parse(args);
  result({});
}
if (args[0] === 'pane' && args[1] === 'list') {
  if (db.paneListStdout !== undefined) {
    console.log(db.paneListStdout);
    process.exit(0);
  }
  result({ panes: db.panes });
}
if (args[0] === 'pane' && args[1] === 'get') result({ pane: pane(args[2]) });
if (args[0] === 'tab' && args[1] === 'list') result({ tabs: db.tabs });
if (args[0] === 'workspace' && args[1] === 'list') result({ workspaces: db.workspaces });
if (args[0] === 'tab' && args[1] === 'create') {
  const workspace: string = args.includes('--workspace') ? flag('--workspace') : 'w1';
  const focused: boolean = db.tabs.every((t) => !t.focused) || !args.includes('--no-focus');
  if (focused) for (const t of db.tabs) t.focused = false;
  const tab = { tab_id: `${workspace}:t${++db.serial}`, label: flag('--label'), workspace_id: workspace, focused };
  const root: FakePane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: tab.tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
    rect: { ...ROOT_RECT },
    focused: true,
  };
  db.tabs.push(tab);
  db.panes.push(root);
  seedShell(procRoot(), root.pane_id, OUTSIDE_CGROUP);
  result({ tab, root_pane: root });
}
if (args[0] === 'pane' && args[1] === 'split') {
  if (args.includes('--workspace')) failure('unknown option: --workspace');
  if (db.failSplitOnce) {
    db.failSplitOnce = false;
    failure('fixture_split_failed');
  }
  const source: FakePane = pane(args[2]);
  const parent: Rect = source.rect ?? { ...ROOT_RECT };
  const left: number = Math.floor(parent.width / 2);
  source.rect = { ...parent, width: left };
  const sibling: FakePane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: source.tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
    rect: { x: parent.x + left, y: parent.y, width: parent.width - left, height: parent.height },
    focused: false,
  };
  db.panes.push(sibling);
  seedShell(procRoot(), sibling.pane_id, OUTSIDE_CGROUP);
  result({ pane: sibling });
}
if (args[0] === 'pane' && args[1] === 'swap') {
  if (db.failSwapOnce) {
    db.failSwapOnce = false;
    failure('fixture_swap_failed');
  }
  const source: FakePane = pane(flag('--source-pane'));
  const target: FakePane = pane(flag('--target-pane'));
  const rect: Rect | undefined = source.rect;
  source.rect = target.rect;
  target.rect = rect;
  for (const p of db.panes) if (p.tab_id === source.tab_id) p.focused = p.pane_id === source.pane_id;
  for (const t of db.tabs) t.focused = t.tab_id === source.tab_id;
  result({ changed: true });
}
if (args[0] === 'pane' && args[1] === 'layout') {
  const current: FakePane = pane(flag('--pane'));
  const members: FakePane[] = db.panes.filter((p) => p.tab_id === current.tab_id);
  const focusedPane: FakePane = members.find((p) => p.focused) ?? members[0];
  result({
    layout: {
      tab_id: current.tab_id,
      focused_pane_id: focusedPane.pane_id,
      panes: members.map((p) => ({
        pane_id: p.pane_id,
        rect: p.rect ?? { ...ROOT_RECT },
        focused: p.focused ?? false,
      })),
    },
  });
}
if (args[0] === 'agent' && args[1] === 'start') {
  const target: FakePane = pane(flag('--pane'));
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(args[2])) failure('invalid_agent_name');
  if (
    db.starts.some(
      (start) =>
        start[2] === args[2] &&
        db.panes.some((p) => p.pane_id === start[start.indexOf('--pane') + 1] && p.agent !== null),
    )
  )
    failure('agent_name_taken');
  scriptedFailure(db.startScript.shift());
  target.agent = flag('--kind');
  target.agent_pid = undefined;
  target.agent_status = db.blockOnStart ? 'blocked' : 'idle';
  target.agent_session = { kind: 'id', value: `session-${++db.serial}` };
  db.starts.push(args);
  const cgroupPath: string = resolve(procDir(procRoot(), shellPid(target.pane_id)), 'cgroup');
  db.startCgroups.push({
    pane: target.pane_id,
    cgroup: existsSync(cgroupPath) ? readFileSync(cgroupPath, 'utf8').trim() : '',
  });
  result({ agent: target });
}
if (args[0] === 'agent' && args[1] === 'prompt') {
  const target: FakePane = pane(args[2]);
  if (!['idle', 'done'].includes(target.agent_status)) throw new Error('Prompt sent to non-idle fixture');
  if (args.includes('--wait') && (flag('--until') !== 'working' || flag('--timeout') !== '5000'))
    throw new Error('Wrong prompt wait contract');
  const scripted = db.promptScript.shift();
  if (scripted?.session !== undefined)
    target.agent_session = {
      kind: target.agent_session?.kind ?? 'id',
      value: scripted.session,
      source: target.agent_session?.source,
    };
  if (scripted?.append !== undefined) {
    const target_path: string | undefined =
      scripted.appendTo ?? (target.agent_session?.kind === 'path' ? target.agent_session.value : undefined);
    if (target_path !== undefined) appendFileSync(target_path, scripted.append);
  }
  scriptedFailure(scripted);
  db.prompts.push({ pane: target.pane_id, text: args[3] });
  if (db.failPrompts) failure('agent_prompt_stalled');
  target.agent_status = 'working';
  if (scripted?.status !== undefined) target.agent_status = scripted.status;
  result({ agent: target });
}
if (args[0] === 'agent' && args[1] === 'wait') {
  const target: FakePane = pane(args[2]);
  if (Number.isNaN(Number(flag('--timeout')))) failure('invalid_timeout');
  const entry: z.infer<typeof waitEntrySchema> | undefined = db.waitScript.shift();
  const sleepMs: number =
    entry?.sleepMs ?? (entry === undefined && target.agent_status === 'working' ? Number(flag('--timeout')) : 0);
  if (sleepMs > 0) Bun.sleepSync(sleepMs);
  if (entry?.append !== undefined) appendFileSync(entry.appendTo ?? entry.append, `${target.pane_id}\n`);
  if (entry !== undefined) {
    if (entry.status !== undefined) target.agent_status = entry.status;
    if (entry.kind !== undefined) target.agent = entry.kind;
    if (entry.session !== undefined)
      target.agent_session =
        entry.session === null ? null : { kind: 'id', value: entry.session, source: target.agent_session?.source };
    if (entry.screenSkipped !== undefined) target.screen_detection_skipped = entry.screenSkipped;
    if (entry.dropAgent === true) {
      target.agent = null;
      target.agent_session = null;
      target.agent_status = 'unknown';
    }
  }
  scriptedFailure(entry);
  if (entry?.status !== undefined) result({ agent: { ...target, agent_status: entry.status } });
  const untils: string[] = args.flatMap((a, i) => (a === '--until' ? [args[i + 1]] : []));
  if (untils.length > 0 && !untils.includes(target.agent_status)) {
    save();
    console.error('{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}');
    process.exit(1);
  }
  if (untils.length === 0 && target.agent_status === 'working') {
    save();
    console.error('{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}');
    process.exit(1);
  }
  result({ agent: target });
}
// A pane seeded with `agent_pid` keeps its agent only while that real process runs; like herdr,
// the first list after the exit still shows the row without `agent`, holding its name.
function exited(pid: number): boolean {
  const stat: string = `/proc/${pid}/stat`;
  return !existsSync(stat) || readFileSync(stat, 'utf8').split(') ')[1].startsWith('Z');
}
if (args[0] === 'agent' && args[1] === 'list') {
  const exiting: FakePane[] = db.panes.filter(
    (p) => p.agent_pid !== undefined && exited(p.agent_pid) && p.exiting !== true,
  );
  for (const p of db.panes)
    if (p.exiting === true) {
      p.agent = null;
      p.agent_session = null;
      p.agent_status = 'unknown';
      p.agent_pid = undefined;
      p.exiting = undefined;
    }
  for (const p of exiting) p.exiting = true;
  result({
    agents: [
      ...exiting.map((p) => ({
        pane_id: p.pane_id,
        agent_status: p.agent_status,
        ...(p.agent_name !== undefined ? { name: p.agent_name } : {}),
      })),
      ...db.panes
        .filter((p) => p.exiting !== true)
        .flatMap((p) =>
          p.agent === null
            ? []
            : [
                {
                  pane_id: p.pane_id,
                  agent: p.agent,
                  agent_status: p.agent_status,
                  ...(p.agent_session ? { agent_session: p.agent_session } : {}),
                  ...(p.agent_name !== undefined ? { name: p.agent_name } : {}),
                  ...(p.screen_detection_skipped !== undefined
                    ? { screen_detection_skipped: p.screen_detection_skipped }
                    : {}),
                },
              ],
        ),
    ],
  });
}
if (args[0] === 'pane' && args[1] === 'process-info') {
  const target: FakePane = pane(flag('--pane'));
  const pid: number = shellPid(target.pane_id);
  if (!existsSync(procDir(procRoot(), pid))) seedShell(procRoot(), target.pane_id, ownCgroup(target));
  result({
    process_info: {
      pane_id: target.pane_id,
      shell_pid: pid,
      foreground_process_group_id: target.foreground_process_group_id ?? pid,
      foreground_processes: target.foreground_processes ?? [],
    },
    type: 'pane_process_info',
  });
}
if (args[0] === 'pane' && args[1] === 'close') {
  const target: FakePane = pane(args[2]);
  scriptedFailure(db.closeScript.shift());
  db.panes = db.panes.filter((p) => p.pane_id !== target.pane_id);
  if (!db.panes.some((p) => p.tab_id === target.tab_id)) db.tabs = db.tabs.filter((t) => t.tab_id !== target.tab_id);
  result({});
}
if (args[0] === 'tab' && args[1] === 'close') {
  db.panes = db.panes.filter((p) => p.tab_id !== args[2]);
  db.tabs = db.tabs.filter((t) => t.tab_id !== args[2]);
  result({});
}
if (args[0] === 'tab' && args[1] === 'rename') {
  const found = db.tabs.find((t) => t.tab_id === args[2]);
  if (found === undefined) failure('tab_not_found');
  scriptedFailure(db.renameScript.shift());
  if (db.failRename) failure('timeout');
  found.label = args[3];
  result({ tab: found });
}
if (args[0] === 'tab' && args[1] === 'focus') {
  const found = db.tabs.find((t) => t.tab_id === args[2]);
  if (found === undefined) failure('tab_not_found');
  for (const t of db.tabs) t.focused = t.tab_id === args[2];
  result({ tab: found });
}
throw new Error(`Unexpected fixture invocation: ${JSON.stringify(args)}`);
