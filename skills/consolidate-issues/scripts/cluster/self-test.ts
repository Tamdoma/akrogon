import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { extractPathTokens, footprintPaths, gatherOpenWork, parkedReasonFromRunStatus } from './gather.ts';
import { buildClusterReport, buildFixerClusterReport } from './report.ts';
import { materializeFixerSeries } from '../materialize-fixer-series.ts';

function assertCluster(condition: boolean, message: string): void {
  if (!condition) throw new Error(`consolidate-issues cluster self-test: ${message}`);
}

function write(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const PARKED_RUN_STATUS = [
  'protocol: completion-records/v7',
  'next_step: block.resolve',
  'records:',
  '  blocked:',
  '    events:',
  '      - event: opened',
  '        block_id: 11111111-1111-1111-1111-111111111111',
  '        source_step: implementation.execute',
  '        slot: b',
  "        recorded_at: '2026-08-21T00:00:00.000Z'",
  '        blocking_clause: fixture wall',
  '        evidence: fixture',
  '        route:',
  '          kind: environmental',
  '          wall: fixture wall',
  '          failing_check: exit 1',
  ''
].join('\n');

const RUNNING_RUN_STATUS = [
  'protocol: completion-records/v7',
  'next_step: implementation.execute',
  'records: {}',
  ''
].join('\n');

function createFixtureRepo(root: string): void {
  const open = path.join(root, 'issues', 'open');
  write(
    path.join(open, 'seed-alpha.md'),
    '# Seeded Issue\n\nTouches `scope/quality.ts` and scope/gate/memo.ts today.\n'
  );
  write(
    path.join(open, 'seed-beta.md'),
    '# Seeded Issue\n\nAlso about scope/quality.ts, see https://example.com/a.ts.\n'
  );
  write(path.join(open, 'seed-solo.md'), '# Seeded Issue\n\nOnly docs/reference.md moves.\n');
  write(path.join(open, 'seed-unpathed.md'), '# Seeded Issue\n\nThe wake lane selector and/or its deadman latch.\n');
  write(path.join(open, 'imported-seed.md'), '# Seeded Issue\n\nMentions scope/quality.ts but is already imported.\n');
  write(path.join(open, 'imported-seed', 'run-status.yaml'), RUNNING_RUN_STATUS);
  write(
    path.join(open, 'renamed-seed.md'),
    '# Seeded Issue\n\nConsumed under another slug, touches scope/quality.ts.\n'
  );
  write(path.join(open, 'renamed-issue', 'run-status.yaml'), RUNNING_RUN_STATUS);
  write(
    path.join(open, 'renamed-issue', 'state.yaml'),
    'slug: renamed-issue\nseed_path: issues/open/renamed-seed.md\n'
  );
  write(path.join(open, 'blocked-issue', 'run-status.yaml'), PARKED_RUN_STATUS);
  write(path.join(open, 'blocked-issue', 'planning', 'plan.md'), 'Plan text mentioning unused/ignored.ts only.\n');
  write(
    path.join(root, 'issues', 'run', 'implementation-footprint', 'issue%3Ablocked-issue', 'footprint.json'),
    JSON.stringify({ targetKey: 'issue:blocked-issue', paths: ['scope/gate/memo.ts'] })
  );
  const fixerRoot = path.join(open, 'fixer');
  write(
    path.join(fixerRoot, 'urgent--20260824T010000000Z--w--p--fix-alpha.md'),
    '# Seeded Issue\n\nTouches scope/quality.ts and scope/gate/memo.ts.\n'
  );
  write(
    path.join(fixerRoot, 'normal--20260824T020000000Z--w--p--fix-beta.md'),
    '# Seeded Issue\n\nTouches scope/quality.ts.\n'
  );
  write(
    path.join(fixerRoot, 'normal--20260824T030000000Z--w--p--fix-gamma.md'),
    '# Seeded Issue\n\nTouches scope/gate/memo.ts.\n'
  );
  write(
    path.join(fixerRoot, 'normal--20260824T040000000Z--w--p--pair-one.md'),
    '# Seeded Issue\n\nTouches pair/shared.ts.\n'
  );
  write(
    path.join(fixerRoot, 'normal--20260824T050000000Z--w--p--pair-two.md'),
    '# Seeded Issue\n\nTouches pair/shared.ts.\n'
  );
  write(
    path.join(fixerRoot, 'normal--20260824T060000000Z--w--p--unpathed.md'),
    '# Seeded Issue\n\nThe registration lane and/or the retirement rule, described only in prose.\n'
  );
}

function runExtractionChecks(): void {
  const tokens = extractPathTokens('Edit `a/b.ts`, keep https://x.io/c.ts, skip issues/run/d.ts, and a\\win\\e.ts.');
  assertCluster(tokens.join('|') === 'a/b.ts|a/win/e.ts', `extraction got ${tokens.join('|')}`);
  assertCluster(
    parkedReasonFromRunStatus(PARKED_RUN_STATUS) === 'next_step block.resolve',
    'parked run-status is detected via next_step'
  );
  assertCluster(parkedReasonFromRunStatus(RUNNING_RUN_STATUS) === undefined, 'running run-status is not parked');
}

function runReportChecks(root: string): void {
  assertCluster(footprintPaths(root, 'blocked-issue')?.join('|') === 'scope/gate/memo.ts', 'footprint paths are read');
  const items = gatherOpenWork(root);
  assertCluster(
    items.map((item) => item.key).join('|') ===
      'seed:seed-alpha|seed:seed-beta|seed:seed-solo|seed:seed-unpathed|issue:blocked-issue',
    `gather selected ${items.map((item) => item.key).join('|')}`
  );
  const blocked = items.find((item) => item.key === 'issue:blocked-issue');
  assertCluster(blocked?.pathSource === 'footprint', 'parked issue prefers recorded footprint over plan text');
  const report = buildClusterReport(root);
  assertCluster(report.clusters.length === 1, `expected one cluster, got ${report.clusters.length}`);
  assertCluster(
    [...report.clusters[0].members].sort((a, b) => a.localeCompare(b)).join('|') ===
      'issue:blocked-issue|seed:seed-alpha|seed:seed-beta',
    `cluster members ${report.clusters[0].members.join('|')}`
  );
  assertCluster(report.clusters[0].edges.length >= 2, 'cluster carries its evidence edges');
  assertCluster(
    report.unclustered.join('|') === 'seed:seed-solo|seed:seed-unpathed',
    `unclustered ${report.unclustered.join('|')}`
  );
  assertCluster(
    report.pathless.count === 1 && report.pathless.keys.join('|') === 'seed:seed-unpathed',
    `pathless exclusion ${report.pathless.count} ${report.pathless.keys.join('|')}`
  );
}

function runFixerChecks(root: string): void {
  const report = buildFixerClusterReport(root);
  assertCluster(report.protocol === 'fixer-consolidate-clusters/v1', 'FIXER report uses its protocol');
  assertCluster(report.clusters.length === 1, `expected one eligible FIXER cluster, got ${report.clusters.length}`);
  assertCluster(report.clusters[0].members.length === 3, 'FIXER automatic cluster requires three members');
  assertCluster(report.unclustered.length === 3, 'two-member overlap and the path-less seed remain unconsolidated');
  assertCluster(
    report.pathless.count === 1 &&
      report.pathless.keys.join('|') === 'fixer-seed:normal--20260824T060000000Z--w--p--unpathed.md',
    `FIXER pathless exclusion ${report.pathless.count} ${report.pathless.keys.join('|')}`
  );
  const excluded = buildFixerClusterReport(root, new Set(['normal--20260824T030000000Z--w--p--fix-gamma.md']));
  assertCluster(excluded.clusters.length === 0, 'excluded active seed cannot complete an automatic cluster');

  const sourceFiles = [
    'urgent--20260824T010000000Z--w--p--fix-alpha.md',
    'normal--20260824T020000000Z--w--p--fix-beta.md',
    'normal--20260824T030000000Z--w--p--fix-gamma.md'
  ] as const;
  const fixerRoot = path.join(root, 'issues', 'open', 'fixer');
  const originalBytes: ReadonlyMap<string, Buffer> = new Map(
    sourceFiles.map((sourceFile) => [sourceFile, fs.readFileSync(path.join(fixerRoot, sourceFile))] as const)
  );
  const collisionPath = path.join(fixerRoot, 'series--20260824T010000000Z--collision-test');
  fs.mkdirSync(collisionPath);
  let collisionRefused = false;
  try {
    materializeFixerSeries({ repoRoot: root, seriesSlug: 'collision-test', sourceFiles });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) collisionRefused = true;
  }
  assertCluster(collisionRefused, 'existing FIXER series destination is refused');
  assertCluster(
    sourceFiles.every((sourceFile) => fs.existsSync(path.join(fixerRoot, sourceFile))),
    'destination collision retains every source seed'
  );
  fs.rmdirSync(collisionPath);

  const materialized = materializeFixerSeries({ repoRoot: root, seriesSlug: 'shared-fixer', sourceFiles });
  assertCluster(materialized.priority === 'urgent', 'one urgent member makes the FIXER series urgent');
  assertCluster(
    materialized.seriesPath.endsWith('series--20260824T010000000Z--shared-fixer'),
    `series path ${materialized.seriesPath}`
  );
  for (const sourceFile of materialized.members) {
    const original = originalBytes.get(sourceFile);
    if (original === undefined) throw new Error(`missing original bytes for ${sourceFile}`);
    assertCluster(!fs.existsSync(path.join(fixerRoot, sourceFile)), `source ${sourceFile} was removed`);
    assertCluster(
      fs.existsSync(path.join(materialized.seriesPath, 'seeds', sourceFile)),
      `seed ${sourceFile} retained`
    );
    assertCluster(
      fs.readFileSync(path.join(materialized.seriesPath, 'seeds', sourceFile)).equals(original),
      `seed ${sourceFile} bytes are preserved`
    );
  }
  const series = fs.readFileSync(path.join(materialized.seriesPath, 'SERIES.md'), 'utf8');
  assertCluster(series.includes('## Overlap Evidence'), 'SERIES.md records overlap evidence');
  assertCluster(series.includes('## Ordering And Dependencies'), 'SERIES.md records dependencies');
  assertCluster(series.includes('## Source Mapping'), 'SERIES.md records source mapping');
  assertCluster(
    fs.readdirSync(fixerRoot).every((name) => !name.startsWith('.staging-series-')),
    'materialization leaves no staging directory'
  );
}

export function runSelfTest(): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'consolidate-cluster-'));
  try {
    createFixtureRepo(root);
    runExtractionChecks();
    runReportChecks(root);
    runFixerChecks(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  console.log('consolidate-issues: cluster self-test ok');
}
