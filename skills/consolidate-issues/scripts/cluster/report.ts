import type { ClusterReport, FixerClusterReport, OpenWorkItem, PathlessExclusion, WorkCluster } from './model.ts';
import { gatherFixerSeeds, gatherOpenWork } from './gather.ts';
import { clusterItems, overlapEdges } from './overlap.ts';

function eligibleClusters(
  items: Parameters<typeof clusterItems>[0],
  edges: Parameters<typeof clusterItems>[1]
): { readonly clusters: readonly WorkCluster[]; readonly unclustered: readonly string[] } {
  const clustered = clusterItems(items, edges);
  const clusters: readonly WorkCluster[] = clustered.clusters.filter(
    (cluster: WorkCluster): boolean => cluster.members.length >= 3
  );
  const consolidatedKeys: ReadonlySet<string> = new Set(clusters.flatMap((cluster: WorkCluster) => cluster.members));
  return {
    clusters,
    unclustered: items.filter((item): boolean => !consolidatedKeys.has(item.key)).map((item): string => item.key)
  };
}

function pathlessExclusion(items: readonly OpenWorkItem[]): PathlessExclusion {
  const keys: readonly string[] = items
    .filter((item: OpenWorkItem): boolean => item.paths.length === 0)
    .map((item: OpenWorkItem): string => item.key);
  return { count: keys.length, keys };
}

export function buildClusterReport(repoRoot: string): ClusterReport {
  const items = gatherOpenWork(repoRoot);
  const edges = overlapEdges(items);
  const { clusters, unclustered } = eligibleClusters(items, edges);
  return {
    protocol: 'consolidate-clusters/v1',
    repoRoot,
    items,
    clusters,
    unclustered,
    pathless: pathlessExclusion(items)
  };
}

export function buildFixerClusterReport(
  repoRoot: string,
  excludedFiles: ReadonlySet<string> = new Set()
): FixerClusterReport {
  const items = gatherFixerSeeds(repoRoot, excludedFiles);
  const edges = overlapEdges(items);
  const { clusters, unclustered } = eligibleClusters(items, edges);
  return {
    protocol: 'fixer-consolidate-clusters/v1',
    repoRoot,
    items,
    clusters,
    unclustered,
    pathless: pathlessExclusion(items)
  };
}
