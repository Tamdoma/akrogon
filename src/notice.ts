import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appHome } from './hc';

export type Notice = { title: string; body: string; attention: boolean };

export function noticeFolder(session: string): string {
  return resolve(appHome(session), 'akrogon-notices');
}

export function noticeId(repo: string, ...parts: string[]): string {
  return [repo, ...parts].join('.');
}

export function noticePath(folder: string, id: string): string {
  return resolve(folder, id + '.json');
}

// herdr-setup reads every `*.json` in the folder as a whole notice, so the file is written under a
// temporary name in the same folder and renamed into place.
export function writeNotice(folder: string, id: string, notice: Notice): void {
  mkdirSync(folder, { recursive: true });
  const temporary: string = resolve(folder, `.${id}.${process.pid}.tmp`);
  writeFileSync(temporary, JSON.stringify({ title: notice.title, body: notice.body, attention: notice.attention }));
  renameSync(temporary, noticePath(folder, id));
}

export function noticeState(folder: string, id: string): 'pending' | 'shown' {
  return existsSync(noticePath(folder, id)) ? 'pending' : 'shown';
}

export function removeNotice(folder: string, id: string): void {
  rmSync(noticePath(folder, id), { force: true });
}
