#!/usr/bin/env bun

import * as path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  linkSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync
} from 'node:fs';
import type { FixerSeedItem, OverlapEdge, WorkCluster } from './cluster/model.ts';
import { buildFixerClusterReport } from './cluster/report.ts';

const SERIES_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+){0,2}$/u;
const USAGE =
  'Usage: materialize-fixer-series.ts [--root <repo-root>] --series <one-to-three-word-slug> --member <seed-file> --member <seed-file> --member <seed-file> [...]';

export type MaterializeFixerSeriesRequest = {
  readonly repoRoot: string;
  readonly seriesSlug: string;
  readonly sourceFiles: readonly string[];
};

export type MaterializedFixerSeries = {
  readonly seriesPath: string;
  readonly priority: 'normal' | 'urgent';
  readonly members: readonly string[];
};

type PartialArguments = {
  readonly repoRoot: string;
  readonly seriesSlug?: string;
  readonly sourceFiles: readonly string[];
};

function parseArguments(
  argv: readonly string[],
  current: PartialArguments = { repoRoot: process.cwd(), sourceFiles: [] }
): PartialArguments | { readonly message: string } {
  if (argv.length === 0) return current;
  const [name, value, ...remaining] = argv;
  if (value === undefined) return { message: USAGE };
  if (name === '--root' && current.repoRoot === process.cwd())
    return parseArguments(remaining, { ...current, repoRoot: value });
  if (name === '--series' && current.seriesSlug === undefined)
    return parseArguments(remaining, { ...current, seriesSlug: value });
  if (name === '--member')
    return parseArguments(remaining, { ...current, sourceFiles: [...current.sourceFiles, value] });
  return { message: USAGE };
}

function sameMembers(cluster: WorkCluster, keys: ReadonlySet<string>): boolean {
  return cluster.members.length === keys.size && cluster.members.every((key: string): boolean => keys.has(key));
}

function selectedCluster(request: MaterializeFixerSeriesRequest): {
  readonly items: readonly FixerSeedItem[];
  readonly cluster: WorkCluster;
} {
  if (!SERIES_SLUG_PATTERN.test(request.seriesSlug))
    throw new Error('FIXER series slug must contain one to three lowercase hyphen-separated words');
  if (request.sourceFiles.length < 3) throw new Error('FIXER automatic consolidation requires at least three seeds');
  if (new Set(request.sourceFiles).size !== request.sourceFiles.length)
    throw new Error('FIXER series members must be unique');
  const report = buildFixerClusterReport(request.repoRoot);
  const sourceFiles: ReadonlySet<string> = new Set(request.sourceFiles);
  const items: readonly FixerSeedItem[] = report.items.filter((item: FixerSeedItem): boolean =>
    sourceFiles.has(item.sourceFile)
  );
  if (items.length !== sourceFiles.size) throw new Error('Every FIXER series member must be a pending FIXER seed');
  const keys: ReadonlySet<string> = new Set(items.map((item: FixerSeedItem): string => item.key));
  const matches: readonly WorkCluster[] = report.clusters.filter((cluster: WorkCluster): boolean =>
    sameMembers(cluster, keys)
  );
  if (matches.length !== 1) throw new Error('FIXER series members must match one evidence-backed overlap cluster');
  const cluster: WorkCluster | undefined = matches[0];
  if (cluster === undefined) throw new Error('FIXER overlap cluster disappeared before materialization');
  return { items, cluster };
}

function edgeDescription(edge: OverlapEdge, itemsByKey: ReadonlyMap<string, FixerSeedItem>): string {
  const left: FixerSeedItem | undefined = itemsByKey.get(edge.a);
  const right: FixerSeedItem | undefined = itemsByKey.get(edge.b);
  if (left === undefined || right === undefined) throw new Error('FIXER cluster edge names an absent member');
  const evidence: readonly string[] = [
    ...edge.sharedFiles.map((file: string): string => `file ${file}`),
    ...edge.sharedDirectories.map((directory: string): string => `directory ${directory}`)
  ];
  return `- \`${left.sourceFile}\` ↔ \`${right.sourceFile}\`: ${evidence.join(', ')}`;
}

function dependencyDescription(
  item: FixerSeedItem,
  priorKeys: ReadonlySet<string>,
  cluster: WorkCluster,
  itemsByKey: ReadonlyMap<string, FixerSeedItem>
): string {
  const dependencies: readonly string[] = cluster.edges.flatMap((edge: OverlapEdge): readonly string[] => {
    const other: string | undefined = edge.a === item.key ? edge.b : edge.b === item.key ? edge.a : undefined;
    if (other === undefined || !priorKeys.has(other)) return [];
    const dependency: FixerSeedItem | undefined = itemsByKey.get(other);
    if (dependency === undefined) throw new Error('FIXER dependency names an absent member');
    return [dependency.sourceFile];
  });
  return dependencies.length === 0 ? 'none' : dependencies.map((file: string): string => `\`${file}\``).join(', ');
}

function seriesMarkdown(input: {
  readonly request: MaterializeFixerSeriesRequest;
  readonly items: readonly FixerSeedItem[];
  readonly cluster: WorkCluster;
  readonly priority: 'normal' | 'urgent';
  readonly arrival: string;
}): string {
  const { request, items, cluster, priority, arrival } = input;
  const itemsByKey: ReadonlyMap<string, FixerSeedItem> = new Map(
    items.map((item: FixerSeedItem): readonly [string, FixerSeedItem] => [item.key, item])
  );
  const memberRows: readonly string[] = items.map(
    (item: FixerSeedItem, index: number): string =>
      `| ${index + 1} | ${item.priority} | \`${item.sourceFile}\` | \`seeds/${item.sourceFile}\` |`
  );
  const dependencyRows: readonly string[] = items.map((item: FixerSeedItem, index: number): string => {
    const priorKeys: ReadonlySet<string> = new Set(
      items.slice(0, index).map((prior: FixerSeedItem): string => prior.key)
    );
    return `- ${index + 1}. \`${item.sourceFile}\` depends on ${dependencyDescription(item, priorKeys, cluster, itemsByKey)}.`;
  });
  return [
    `# ${request.seriesSlug} FIXER Series`,
    '',
    `Priority: ${priority}`,
    `Arrival: ${arrival}`,
    '',
    '## Members',
    '',
    '| Order | Priority | Source | Preserved Seed |',
    '| --- | --- | --- | --- |',
    ...memberRows,
    '',
    '## Overlap Evidence',
    '',
    ...cluster.edges.map((edge: OverlapEdge): string => edgeDescription(edge, itemsByKey)),
    '',
    '## Ordering And Dependencies',
    '',
    ...dependencyRows,
    '',
    'FIXER executes one member chunk at a time. Members without listed dependencies may be reordered.',
    '',
    '## Source Mapping',
    '',
    ...items.map((item: FixerSeedItem): string => `- \`${item.sourceFile}\` → \`seeds/${item.sourceFile}\``),
    ''
  ].join('\n');
}

function cleanupStaging(stagingRoot: string): void {
  const seedsRoot: string = path.join(stagingRoot, 'seeds');
  if (existsSync(seedsRoot)) {
    for (const fileName of readdirSync(seedsRoot)) unlinkSync(path.join(seedsRoot, fileName));
    rmdirSync(seedsRoot);
  }
  const seriesFile: string = path.join(stagingRoot, 'SERIES.md');
  if (existsSync(seriesFile)) unlinkSync(seriesFile);
  rmdirSync(stagingRoot);
}

export function materializeFixerSeries(request: MaterializeFixerSeriesRequest): MaterializedFixerSeries {
  const selection = selectedCluster(request);
  const priority: 'normal' | 'urgent' = selection.items.some(
    (item: FixerSeedItem): boolean => item.priority === 'urgent'
  )
    ? 'urgent'
    : 'normal';
  const arrival: string | undefined = selection.items.map((item: FixerSeedItem): string => item.arrival).sort()[0];
  if (arrival === undefined) throw new Error('FIXER overlap cluster has no arrival timestamp');
  const fixerRoot: string = path.join(request.repoRoot, 'issues', 'open', 'fixer');
  const seriesPath: string = path.join(fixerRoot, `series--${arrival}--${request.seriesSlug}`);
  if (existsSync(seriesPath)) throw new Error(`FIXER series destination already exists: ${seriesPath}`);
  const stagingRoot: string = path.join(fixerRoot, `.staging-series-${randomBytes(12).toString('hex')}`);
  const stagingSeeds: string = path.join(stagingRoot, 'seeds');
  mkdirSync(stagingSeeds, { recursive: true });
  let published = false;
  try {
    for (const item of selection.items) {
      linkSync(path.join(fixerRoot, item.sourceFile), path.join(stagingSeeds, item.sourceFile));
    }
    writeFileSync(
      path.join(stagingRoot, 'SERIES.md'),
      seriesMarkdown({ request, items: selection.items, cluster: selection.cluster, priority, arrival })
    );
    renameSync(stagingRoot, seriesPath);
    published = true;
  } finally {
    if (!published && existsSync(stagingRoot)) cleanupStaging(stagingRoot);
  }
  for (const item of selection.items) {
    const sourcePath: string = path.join(fixerRoot, item.sourceFile);
    try {
      unlinkSync(sourcePath);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(
        `FIXER series publication succeeded at ${seriesPath}, but source cleanup failed at ${sourcePath}: ${error.message}`,
        { cause: error }
      );
    }
  }
  return { seriesPath, priority, members: selection.items.map((item: FixerSeedItem): string => item.sourceFile) };
}

function runCli(argv: readonly string[]): number {
  const parsed = parseArguments(argv);
  if ('message' in parsed || parsed.seriesSlug === undefined) {
    console.error(`materialize-fixer-series: ${'message' in parsed ? parsed.message : USAGE}`);
    return 1;
  }
  try {
    console.log(
      JSON.stringify(
        materializeFixerSeries({
          repoRoot: parsed.repoRoot,
          seriesSlug: parsed.seriesSlug,
          sourceFiles: parsed.sourceFiles
        })
      )
    );
    return 0;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    console.error(error.stack ?? error.message);
    return 1;
  }
}

if (import.meta.main) process.exitCode = runCli(process.argv.slice(2));
