#!/usr/bin/env bun
import { appendFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { procDir } from './fake-proc';

export type BusctlCall = {
  scope: string;
  mode: string;
  pid: number;
  slice: string;
  timeoutStopUSec: string;
  sendSIGHUP: string;
  bus: string | null;
};

const home: string = z.string().parse(process.env.FAKE_BUSCTL_HOME);
const procRoot: string = z.string().parse(process.env.AKROGON_PROC_ROOT);
const args: string[] = process.argv.slice(2);
const head: string[] = [
  '--user',
  'call',
  'org.freedesktop.systemd1',
  '/org/freedesktop/systemd1',
  'org.freedesktop.systemd1.Manager',
  'StartTransientUnit',
  'ssa(sv)a(sa(sv))',
];
if (head.some((word, i) => args[i] !== word)) throw new Error(`Unexpected busctl call: ${JSON.stringify(args)}`);
const [scope, mode, count, ...rest] = args.slice(head.length);
const properties: Map<string, string[]> = new Map();
let i: number = 0;
for (let n: number = 0; n < Number(count); n += 1) {
  const name: string = rest[i];
  const signature: string = rest[i + 1];
  const width: number = signature === 'au' ? 2 + Number(rest[i + 2]) : 1;
  properties.set(name, [signature, ...rest.slice(i + 2, i + 2 + width)]);
  i += 2 + width;
}
if (rest.slice(i).join(' ') !== '0') throw new Error(`Unexpected busctl tail: ${JSON.stringify(args)}`);
const pids: string[] = z.array(z.string()).parse(properties.get('PIDs'));
const call: BusctlCall = {
  scope,
  mode,
  pid: Number(pids[2]),
  slice: z.array(z.string()).parse(properties.get('Slice'))[1],
  timeoutStopUSec: (properties.get('TimeoutStopUSec') ?? []).join(' '),
  sendSIGHUP: (properties.get('SendSIGHUP') ?? []).join(' '),
  bus: process.env.DBUS_SESSION_BUS_ADDRESS ?? null,
};
appendFileSync(resolve(home, 'busctl.calls'), JSON.stringify(call) + '\n');
if (existsSync(resolve(home, 'busctl.fail'))) {
  console.error('Failed to start transient scope unit: fixture refused');
  process.exit(1);
}
const placed: string = existsSync(resolve(home, 'busctl.misplace')) ? `other-${scope}` : scope;
writeFileSync(
  resolve(procDir(procRoot, call.pid), 'cgroup'),
  `0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/${call.slice}/${placed}\n`,
);
console.log('o "/org/freedesktop/systemd1/job/1"');
