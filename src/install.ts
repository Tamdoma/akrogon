import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { expandPath, globalHome, readGlobal, toolRoot, within, type GlobalConfig } from './config';
import { currentLink, ensureCurrent, releasesDir } from './release';
import { command, quote } from './shell';

export type Link = { source: string; destination: string; repoint?: boolean };

export function planSkillLinks(
  home: string,
  sourceRoot: string,
  ownedRoots: string[],
): { links: Link[]; conflicts: Link[] } {
  const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];
  const skills: string[] = readdirSync(resolve(sourceRoot, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const planned: Link[] = [
    { source: resolve(sourceRoot, 'src/akrogon.ts'), destination: resolve(home, '.local/bin/akrogon') },
    {
      source: resolve(sourceRoot, 'systemd/akrogon.slice'),
      destination: resolve(home, '.config/systemd/user/akrogon.slice'),
    },
    ...roots.flatMap((root) =>
      skills.map((skill) => ({
        source: resolve(sourceRoot, 'skills', skill),
        destination: resolve(home, root, skill),
      })),
    ),
  ];
  const releases: string = releasesDir();
  const skillRoots: string[] = ownedRoots.map((root) => resolve(root, 'skills'));
  for (const root of roots) {
    const directory: string = resolve(home, root);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory)) {
      const path: string = resolve(directory, entry);
      if (!lstatSync(path).isSymbolicLink()) continue;
      const target: string = resolve(dirname(path), readlinkSync(path));
      if (within(target, releases) || (!existsSync(target) && skillRoots.some((root) => within(target, root))))
        unlinkSync(path);
    }
  }
  const links: Link[] = [];
  const conflicts: Link[] = [];
  for (const link of planned) {
    const info = lstatSync(link.destination, { throwIfNoEntry: false });
    if (info === undefined) {
      links.push(link);
      continue;
    }
    if (!info.isSymbolicLink()) {
      conflicts.push(link);
      continue;
    }
    const target: string = resolve(dirname(link.destination), readlinkSync(link.destination));
    if (ownedRoots.some((root) => within(target, root))) {
      // realpath comparison keeps links that already resolve to the source file
      // (relative links, workspace paths aliasing current) instead of rewriting
      // equivalent targets.
      const same: boolean =
        existsSync(link.destination) && realpathSync(link.destination) === realpathSync(link.source);
      links.push(same ? link : { ...link, repoint: true });
    } else if (target === link.source) {
      links.push(link);
    } else {
      conflicts.push(link);
    }
  }
  return { links, conflicts };
}

export function applySkillLinks(links: Link[]): void {
  for (const link of links) {
    mkdirSync(dirname(link.destination), { recursive: true });
    if (lstatSync(link.destination, { throwIfNoEntry: false }) === undefined) {
      symlinkSync(link.source, link.destination);
    } else if (link.repoint === true) {
      unlinkSync(link.destination);
      symlinkSync(link.source, link.destination);
    }
  }
}

export async function install(): Promise<void> {
  const global: GlobalConfig = readGlobal();
  ensureCurrent();
  const ownedRoots: string[] = [currentLink(), releasesDir(), toolRoot];
  const akrogonRoot: string | undefined = global.repos['akrogon'];
  if (akrogonRoot !== undefined) {
    const expanded: string = expandPath(akrogonRoot, globalHome());
    if (existsSync(expanded)) ownedRoots.push(realpathSync(expanded));
  }
  const { links, conflicts }: { links: Link[]; conflicts: Link[] } = planSkillLinks(
    homedir(),
    currentLink(),
    ownedRoots,
  );
  if (conflicts.length > 0) {
    for (const link of conflicts) console.error(`rm -r -- ${quote(link.destination)}`);
    throw new Error('Install destinations conflict. Remove the listed paths before installing.');
  }
  applySkillLinks(links);
  await command(['systemctl', '--user', 'daemon-reload']);
  for (const kind of Object.keys(global.harnesses)) await command(['herdr', 'integration', 'install', kind]);
  await command(['herdr', 'plugin', 'link', resolve(currentLink(), 'plugin')]);
}
