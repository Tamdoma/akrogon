import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, symlinkSync, unlinkSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { readGlobal, toolRoot, type GlobalConfig } from './config';
import { command, quote } from './shell';

type Link = { source: string; destination: string };

export async function install(): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];
  const skills: string[] = readdirSync(resolve(toolRoot, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const links: Link[] = [
    { source: resolve(toolRoot, 'src/akrogon.ts'), destination: resolve(homedir(), '.local/bin/akrogon') },
    ...roots.flatMap((root) =>
      skills.map((skill) => ({
        source: resolve(toolRoot, 'skills', skill),
        destination: resolve(homedir(), root, skill),
      })),
    ),
  ];
  const ownedPrefix: string = resolve(toolRoot, 'skills') + sep;
  for (const root of roots) {
    const directory: string = resolve(homedir(), root);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory)) {
      const path: string = resolve(directory, entry);
      if (!lstatSync(path).isSymbolicLink()) continue;
      const target: string = resolve(dirname(path), readlinkSync(path));
      if (target.startsWith(ownedPrefix) && !existsSync(target)) unlinkSync(path);
    }
  }
  const conflicts: Link[] = links.filter((link) => {
    const info = lstatSync(link.destination, { throwIfNoEntry: false });
    return (
      info !== undefined &&
      (!info.isSymbolicLink() || resolve(dirname(link.destination), readlinkSync(link.destination)) !== link.source)
    );
  });
  if (conflicts.length > 0) {
    for (const link of conflicts) console.error(`rm -r -- ${quote(link.destination)}`);
    throw new Error('Install destinations conflict. Remove the listed paths before installing.');
  }
  for (const link of links) {
    mkdirSync(dirname(link.destination), { recursive: true });
    if (lstatSync(link.destination, { throwIfNoEntry: false }) === undefined)
      symlinkSync(link.source, link.destination);
  }
  for (const kind of Object.keys(global.harnesses)) await command(['herdr', 'integration', 'install', kind]);
  await command(['herdr', 'plugin', 'link', resolve(toolRoot, 'plugin')]);
}
