// The advisory clustering surface: what a consolidation pass reads about open work and what it
// proposes back. Items and edges are evidence; judgment about whether a cluster deserves a series
// stays with the pass and the operator.

export type OpenWorkKind = 'seed' | 'parked-issue' | 'fixer-seed';

export type PathEvidenceSource = 'footprint' | 'text';

export interface OpenWorkItem {
  readonly key: string;
  readonly kind: OpenWorkKind;
  readonly slug: string;
  readonly paths: readonly string[];
  readonly pathSource: PathEvidenceSource;
  readonly parkedReason?: string;
}

export interface OverlapEdge {
  readonly a: string;
  readonly b: string;
  readonly sharedFiles: readonly string[];
  readonly sharedDirectories: readonly string[];
}

export interface WorkCluster {
  readonly members: readonly string[];
  readonly edges: readonly OverlapEdge[];
}

// Items carrying no extractable path have no admissible evidence, since topical similarity may never
// be the sole basis for a cluster. A pass must be able to state what it could not consider.
export interface PathlessExclusion {
  readonly count: number;
  readonly keys: readonly string[];
}

export interface ClusterReport {
  readonly protocol: 'consolidate-clusters/v1';
  readonly repoRoot: string;
  readonly items: readonly OpenWorkItem[];
  readonly clusters: readonly WorkCluster[];
  readonly unclustered: readonly string[];
  readonly pathless: PathlessExclusion;
}

export interface FixerSeedItem extends OpenWorkItem {
  readonly kind: 'fixer-seed';
  readonly priority: 'normal' | 'urgent';
  readonly arrival: string;
  readonly sourceFile: string;
}

export interface FixerClusterReport {
  readonly protocol: 'fixer-consolidate-clusters/v1';
  readonly repoRoot: string;
  readonly items: readonly FixerSeedItem[];
  readonly clusters: readonly WorkCluster[];
  readonly unclustered: readonly string[];
  readonly pathless: PathlessExclusion;
}

export function seedKey(slug: string): string {
  return `seed:${slug}`;
}

export function issueKey(slug: string): string {
  return `issue:${slug}`;
}

export function fixerSeedKey(sourceFile: string): string {
  return `fixer-seed:${sourceFile}`;
}
