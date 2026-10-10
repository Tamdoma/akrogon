import { existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { command } from './shell';

function offendingAncestor(target: string): string | null {
  for (let literal: string = dirname(target); ; literal = dirname(literal)) {
    if (!existsSync(literal)) {
      if (literal === dirname(literal)) return null;
      continue;
    }
    const canonical: string = realpathSync(literal);
    if (existsSync(join(canonical, 'node_modules')) || existsSync(join(canonical, 'package.json'))) return canonical;
    if (canonical === dirname(canonical)) return null;
    literal = canonical;
  }
}

export function checkLocation(targetPath: string): void {
  const offender: string | null = offendingAncestor(targetPath);
  if (offender !== null)
    throw new Error(`Refusing location: canonical ancestor ${offender} holds node_modules or package.json`);
}

export async function guard(cwd: string, positionals: string[]): Promise<number> {
  const verb: string | undefined = positionals.length === 1 ? positionals[0] : undefined;
  if (verb !== 'ancestors' && verb !== 'own-modules') throw new Error('Usage: akrogon guard <ancestors|own-modules>');
  const top: string = realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], cwd));
  if (verb === 'ancestors') {
    const offender: string | null = offendingAncestor(top);
    if (offender !== null) {
      console.error(`ancestor ${offender} holds node_modules or package.json`);
      return 1;
    }
    return 0;
  }
  const own: string = join(top, 'node_modules');
  if (!existsSync(own)) {
    console.error(`missing own node_modules: ${own}`);
    return 1;
  }
  return 0;
}
