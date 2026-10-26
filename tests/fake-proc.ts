import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SHELL_START: string = '4242';
export const OUTSIDE_CGROUP: string = '0::/user.slice/user-1000.slice/user@1000.service/app.slice/herdr.scope';

export function shellPid(paneId: string): number {
  return 10000 + (parseInt(new Bun.CryptoHasher('sha256').update(paneId).digest('hex').slice(0, 6), 16) % 50000);
}

export function procDir(root: string, pid: number): string {
  return resolve(root, String(pid));
}

export function seedShell(root: string, paneId: string, cgroup: string): void {
  const pid: number = shellPid(paneId);
  const dir: string = procDir(root, pid);
  mkdirSync(dir, { recursive: true });
  // Fields 3..21 are filler; field 22 is the start time, as in /proc/<pid>/stat.
  const fields: string[] = ['S', '1', ...Array.from({ length: 17 }, () => '0'), SHELL_START, '0'];
  writeFileSync(resolve(dir, 'stat'), `${pid} (ba sh) ${fields.join(' ')}\n`);
  writeFileSync(resolve(dir, 'cgroup'), cgroup + '\n');
}

export function expectedSlice(repoName: string, slug: string): string {
  return `akrogon-l${new Bun.CryptoHasher('sha256').update(`${repoName}/${slug}`).digest('hex').slice(0, 12)}.slice`;
}

export function expectedScope(slice: string, paneId: string): string {
  return `${slice.replace(/\.slice$/, '')}-p${paneId.replace(/[^A-Za-z0-9]/g, '')}-${shellPid(paneId)}-${SHELL_START}.scope`;
}

export function boxedCgroup(slice: string, scope: string): string {
  return `0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/${slice}/${scope}`;
}
