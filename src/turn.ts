import { type GlobalConfig, type Repo } from './config';
import { type LogRecord } from './log';
import { type Gap, gaps, readReadiness, type Readiness } from './readiness';
import { hasLeafFolder, isParked, type Leaf } from './state';

export type Block = { kind: 'deps' } | { kind: 'inputs'; missing: Gap[] };

export type DepDetail = { slug: string; label: string };

export function unmergedDeps(repo: Repo, leaf: Leaf, leaves: Leaf[]): DepDetail[] {
  return leaf.state['blocked-by'].flatMap((slug: string): DepDetail[] => {
    const dependency: Leaf | undefined = leaves.find((item) => item.state.slug === slug);
    if (dependency !== undefined && dependency.state.phase === 'merged') return [];
    if (dependency !== undefined) return [{ slug, label: dependency.state.phase }];
    if (isParked(repo, slug)) return [{ slug, label: 'parked' }];
    if (hasLeafFolder(repo, slug)) return [{ slug, label: 'unreadable' }];
    return [{ slug, label: 'missing' }];
  });
}

export function blockDetail(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  leaves: Leaf[],
): { kind: 'deps'; deps: DepDetail[] } | { kind: 'inputs'; missing: Gap[] } | null {
  const deps: DepDetail[] = unmergedDeps(repo, leaf, leaves);
  if (deps.length > 0) return { kind: 'deps', deps };
  const readiness: Readiness | null = readReadiness(leaf.path);
  if (readiness !== null) {
    const missing: Gap[] = gaps(global, readiness);
    if (missing.length > 0) return { kind: 'inputs', missing };
  }
  return null;
}

export function eligibility(global: GlobalConfig, leaf: Leaf, leaves: Leaf[]): Block | null {
  if (
    leaf.state['blocked-by'].some((slug) => {
      const dependency: Leaf | undefined = leaves.find((leaf) => leaf.state.slug === slug);
      return dependency === undefined || dependency.state.phase !== 'merged';
    })
  )
    return { kind: 'deps' };
  const readiness: Readiness | null = readReadiness(leaf.path);
  if (readiness !== null) {
    const missing: Gap[] = gaps(global, readiness);
    if (missing.length > 0) return { kind: 'inputs', missing };
  }
  return null;
}

export type QueueEntry = { leaf: Leaf; place: number; noRecord: boolean };

export function mergeQueue(global: GlobalConfig, leaves: Leaf[], log: () => LogRecord[]): QueueEntry[] {
  const eligible: Leaf[] = leaves.filter(
    (leaf) => leaf.state.phase === 'merge' && eligibility(global, leaf, leaves) === null,
  );
  const stamp: Map<string, string> = new Map();
  if (eligible.some((leaf) => leaf.state.merge_stamp === undefined))
    for (const entry of log()) if (entry.record.to === 'merge') stamp.set(entry.record.slug, entry.record.ts);
  return eligible
    .map((leaf) => ({ leaf, time: leaf.state.merge_stamp ?? stamp.get(leaf.state.slug) }))
    .sort((a, b) =>
      a.time === undefined && b.time === undefined
        ? a.leaf.state.slug.localeCompare(b.leaf.state.slug)
        : a.time === undefined
          ? 1
          : b.time === undefined
            ? -1
            : a.time.localeCompare(b.time) || a.leaf.state.slug.localeCompare(b.leaf.state.slug),
    )
    .map(({ leaf, time }, index) => ({ leaf, place: index + 1, noRecord: time === undefined }));
}
