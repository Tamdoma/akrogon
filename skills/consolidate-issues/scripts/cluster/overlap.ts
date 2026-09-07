import type { OpenWorkItem, OverlapEdge, WorkCluster } from './model.ts';

// Pure clustering over gathered items: no filesystem, no process, no clock. An edge exists on one
// shared file or two shared directories; a cluster is a connected component with two or more
// members. Anything weaker is the pass's topical-tiebreak territory, not this module's.

function shared(left: readonly string[], right: readonly string[]): readonly string[] {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function directories(paths: readonly string[]): readonly string[] {
  const parents = new Set<string>();
  for (const surface of paths) {
    const slash = surface.lastIndexOf('/');
    if (slash > 0) parents.add(surface.slice(0, slash));
  }
  return [...parents].sort((left, right) => left.localeCompare(right));
}

function edgeBetween(left: OpenWorkItem, right: OpenWorkItem): OverlapEdge | undefined {
  const sharedFiles = shared(left.paths, right.paths);
  const sharedDirectories = shared(directories(left.paths), directories(right.paths));
  if (sharedFiles.length === 0 && sharedDirectories.length < 2) return undefined;
  return { a: left.key, b: right.key, sharedFiles, sharedDirectories };
}

export function overlapEdges(items: readonly OpenWorkItem[]): readonly OverlapEdge[] {
  return items.flatMap((left, index) =>
    items.slice(index + 1).flatMap((right) => {
      const edge = edgeBetween(left, right);
      return edge === undefined ? [] : [edge];
    })
  );
}

function componentRoot(parents: Map<string, string>, key: string): string {
  let root = key;
  while (parents.get(root) !== root) root = parents.get(root) ?? root;
  return root;
}

export function clusterItems(
  items: readonly OpenWorkItem[],
  edges: readonly OverlapEdge[]
): { clusters: readonly WorkCluster[]; unclustered: readonly string[] } {
  const parents = new Map<string, string>(items.map((item) => [item.key, item.key]));
  for (const edge of edges) {
    parents.set(componentRoot(parents, edge.a), componentRoot(parents, edge.b));
  }
  const membersByRoot = new Map<string, string[]>();
  for (const item of items) {
    const root = componentRoot(parents, item.key);
    membersByRoot.set(root, [...(membersByRoot.get(root) ?? []), item.key]);
  }
  const components = [...membersByRoot.values()].sort((left, right) => left[0].localeCompare(right[0]));
  const clusters = components
    .filter((members) => members.length > 1)
    .map((members) => ({
      members,
      edges: edges.filter((edge) => members.includes(edge.a) && members.includes(edge.b))
    }));
  const unclustered = components.filter((members) => members.length === 1).map((members) => members[0]);
  return { clusters, unclustered };
}
