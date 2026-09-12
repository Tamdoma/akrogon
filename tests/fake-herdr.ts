#!/usr/bin/env bun
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { z } from 'zod';
import { paneSchema, tabSchema, workspaceSchema, type Pane, type Tab } from '../src/shell';

const databaseSchema = z.object({
  panes: z.array(paneSchema),
  tabs: z.array(tabSchema),
  workspaces: z.array(workspaceSchema).default([
    { workspace_id: 'w1', label: 'repo' },
    { workspace_id: 'w3', label: 'other' },
  ]),
  serial: z.number(),
  paneListStdout: z.string().optional(),
  failPrompts: z.boolean().default(false),
  blockOnStart: z.boolean().default(false),
  failSplitOnce: z.boolean().default(false),
  failNotification: z.boolean().default(false),
  prompts: z.array(z.object({ pane: z.string(), text: z.string() })).default([]),
  starts: z.array(z.array(z.string())).default([]),
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
function flag(name: string): string {
  const index: number = args.indexOf(name);
  if (index === -1) throw new Error(`Missing flag ${name}`);
  return args[index + 1];
}
function pane(id: string): Pane {
  const found: Pane | undefined = db.panes.find((p) => p.pane_id === id);
  if (found === undefined) throw new Error(`Missing pane ${id}`);
  return found;
}
if (args[0] === 'notification' && args[1] === 'show') {
  z.tuple([z.literal('notification'), z.literal('show'), z.string().min(1)]).parse(args);
  if (db.failNotification) failure('fixture_notification_failed');
  result({});
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
  const tab: Tab = { tab_id: `${workspace}:t${++db.serial}`, label: flag('--label') };
  const root: Pane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: tab.tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
  };
  db.tabs.push(tab);
  db.panes.push(root);
  result({ tab, root_pane: root });
}
if (args[0] === 'pane' && args[1] === 'split') {
  if (args.includes('--workspace')) failure('unknown option: --workspace');
  if (db.failSplitOnce) {
    db.failSplitOnce = false;
    failure('fixture_split_failed');
  }
  const sibling: Pane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: pane(args[2]).tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
  };
  db.panes.push(sibling);
  result({ pane: sibling });
}
if (args[0] === 'agent' && args[1] === 'start') {
  const target: Pane = pane(flag('--pane'));
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(args[2])) failure('invalid_agent_name');
  if (
    db.starts.some(
      (start) =>
        start[2] === args[2] &&
        db.panes.some((p) => p.pane_id === start[start.indexOf('--pane') + 1] && p.agent !== null),
    )
  )
    failure('agent_name_taken');
  target.agent = flag('--kind');
  target.agent_status = db.blockOnStart ? 'blocked' : 'idle';
  target.agent_session = { value: `session-${++db.serial}` };
  db.starts.push(args);
  result({ agent: target });
}
if (args[0] === 'agent' && args[1] === 'prompt') {
  const target: Pane = pane(args[2]);
  if (!['idle', 'done'].includes(target.agent_status)) throw new Error('Prompt sent to non-idle fixture');
  if (flag('--until') !== 'working' || !args.includes('--wait') || flag('--timeout') !== '5000')
    throw new Error('Wrong prompt wait contract');
  db.prompts.push({ pane: target.pane_id, text: args[3] });
  if (db.failPrompts) failure('agent_prompt_stalled');
  target.agent_status = 'working';
  result({ agent: target });
}
if (args[0] === 'tab' && args[1] === 'close') {
  db.panes = db.panes.filter((p) => p.tab_id !== args[2]);
  db.tabs = db.tabs.filter((t) => t.tab_id !== args[2]);
  result({});
}
throw new Error(`Unexpected fixture invocation: ${JSON.stringify(args)}`);
