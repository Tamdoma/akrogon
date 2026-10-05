import { type GlobalConfig } from './config';
import { type LogRecord } from './log';
import { type Gap, gaps, readReadiness, type Readiness } from './readiness';
import { type Leaf } from './state';

export type Block = { kind: 'hand-built' } | { kind: 'deps' } | { kind: 'inputs'; missing: Gap[] };

export function eligibility(global: GlobalConfig, leaf: Leaf, leaves: Leaf[]): Block | null {
  if (leaf.state.hand_built === true) return { kind: 'hand-built' };
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

export function mergeQueue(global: GlobalConfig, leaves: Leaf[], log: LogRecord[]): QueueEntry[] {
  const stamp: Map<string, string> = new Map();
  for (const entry of log) if (entry.record.to === 'merge') stamp.set(entry.record.slug, entry.record.ts);
  return leaves
    .filter((leaf) => leaf.state.phase === 'merge' && eligibility(global, leaf, leaves) === null)
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
