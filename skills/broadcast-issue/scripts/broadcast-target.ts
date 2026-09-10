import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ArtifactTarget } from '../../../issues/.scripts/lifecycle/artifact-registry-model';

export class BroadcastTargetError extends Error {}

export function findControlRoot(startDir: string): string {
  let currentDir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(currentDir, 'issues', 'config.yaml'))) return currentDir;
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir)
      throw new BroadcastTargetError('Broadcast target validation requires issues/config.yaml');
    currentDir = parentDir;
  }
}

function boundary(controlRoot: string): typeof import('../../../issues/.scripts/lifecycle/broadcast-boundary') {
  return require(path.join(controlRoot, 'issues', '.scripts', 'lifecycle', 'broadcast-boundary.ts'));
}

export function targetFromToken(token: string | undefined): ArtifactTarget {
  return boundary(findControlRoot(process.cwd())).parseLifecycleBroadcastTarget(token);
}

export function assertBroadcastTargetAllowed(request: {
  readonly cwd: string;
  readonly target: string | undefined;
}): ArtifactTarget {
  const controlRoot = findControlRoot(request.cwd);
  return boundary(controlRoot).assertLifecycleBroadcastTargetAllowed(controlRoot, request.target);
}
