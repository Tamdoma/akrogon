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
import { dirname, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { expandPath, globalHome, readGlobal, toolRoot, within, type GlobalConfig } from './config';
import { currentLink, ensureCurrent, releasesDir } from './release';
import { command, quote } from './shell';

export type Link = { source: string; destination: string; repoint?: boolean };

export function planSkillLinks(
  home: string,
  sourceRoot: string,
  ownedRoots: string[],
  listRoot: string = sourceRoot,
): { links: Link[]; conflicts: Link[]; stale: string[] } {
  const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];
  const skills: string[] = readdirSync(resolve(listRoot, 'skills'), { withFileTypes: true })
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
  const sourceSkills: string = resolve(sourceRoot, 'skills');
  // Destinations a planned link will (re)create are not stale: unlinking them
  // after applySkillLinks would delete the link just written.
  const plannedDestinations: Set<string> = new Set(planned.map((link) => link.destination));
  const stale: string[] = [];
  for (const root of roots) {
    const directory: string = resolve(home, root);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory)) {
      const path: string = resolve(directory, entry);
      if (!lstatSync(path).isSymbolicLink()) continue;
      const target: string = resolve(dirname(path), readlinkSync(path));
      // Links into sourceRoot's skills are probed under listRoot so a skill
      // absent from the new tree is unlinked before current flips onto it.
      const probe: string = within(target, sourceSkills)
        ? resolve(listRoot, 'skills', relative(sourceSkills, target))
        : target;
      if (
        (within(target, releases) || (!existsSync(probe) && skillRoots.some((root) => within(target, root)))) &&
        !plannedDestinations.has(path)
      )
        stale.push(path);
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
        existsSync(link.destination) &&
        existsSync(link.source) &&
        realpathSync(link.destination) === realpathSync(link.source);
      links.push(same ? link : { ...link, repoint: true });
    } else if (target === link.source) {
      links.push(link);
    } else {
      conflicts.push(link);
    }
  }
  return { links, conflicts, stale };
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
  const { links, conflicts, stale }: { links: Link[]; conflicts: Link[]; stale: string[] } = planSkillLinks(
    homedir(),
    currentLink(),
    ownedRoots,
  );
  // Pruning stale links is safe before the conflict check: it only removes
  // links, never creates or repoints them. lstatSync, not existsSync: a stale
  // link is usually dangling, and a target-following probe would skip the very
  // links meant for removal.
  for (const path of stale) if (lstatSync(path, { throwIfNoEntry: false }) !== undefined) unlinkSync(path);
  if (conflicts.length > 0) {
    for (const link of conflicts) console.error(`rm -r -- ${quote(link.destination)}`);
    throw new Error('Install destinations conflict. Remove the listed paths before installing.');
  }
  applySkillLinks(links);
  await command(['systemctl', '--user', 'daemon-reload']);
  for (const kind of Object.keys(global.harnesses)) await command(['herdr', 'integration', 'install', kind]);
  await command(['herdr', 'plugin', 'link', resolve(currentLink(), 'plugin')]);
}
