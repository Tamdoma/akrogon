#!/usr/bin/env bun

// Advisory clustering for a consolidation pass: gathers unimported seeds and parked in-flight
// issues, computes footprint/text overlap edges, and prints candidate clusters with evidence as
// JSON. It proposes only — series authoring, operator approval, and materialization stay with the
// consolidate-issues pass and consult-issue.
//
// Usage: bun --no-install skills/consolidate-issues/scripts/cluster-open-work.ts [--root <repo-root>] [--fixer [--exclude <file>]...] | --self-test

import { buildClusterReport, buildFixerClusterReport } from './cluster/report.ts';
import { runSelfTest } from './cluster/self-test.ts';

const USAGE = 'Usage: cluster-open-work.ts [--root <repo-root>] [--fixer [--exclude <file>]...] | --self-test';

type ClusterArguments = {
  readonly root: string;
  readonly fixer: boolean;
  readonly excludedFiles: readonly string[];
};

function parseClusterArguments(
  argv: readonly string[],
  current: ClusterArguments = { root: process.cwd(), fixer: false, excludedFiles: [] }
): ClusterArguments | { readonly message: string } {
  if (argv.length === 0) return current;
  const [name, value, ...remaining] = argv;
  if (name === '--fixer' && !current.fixer) return parseClusterArguments(argv.slice(1), { ...current, fixer: true });
  if (name === '--root' && value !== undefined && current.root === process.cwd())
    return parseClusterArguments(remaining, { ...current, root: value });
  if (name === '--exclude' && value !== undefined)
    return parseClusterArguments(remaining, { ...current, excludedFiles: [...current.excludedFiles, value] });
  return { message: USAGE };
}

function runCli(argv: readonly string[]): number {
  if (argv[0] === '--self-test' && argv.length === 1) {
    runSelfTest();
    return 0;
  }
  const options = parseClusterArguments(argv);
  if ('message' in options) {
    console.error(`cluster-open-work: ${options.message}`);
    return 1;
  }
  const report = options.fixer
    ? buildFixerClusterReport(options.root, new Set(options.excludedFiles))
    : buildClusterReport(options.root);
  console.log(JSON.stringify(report, null, 2));
  return 0;
}

if (import.meta.main) {
  process.exitCode = runCli(process.argv.slice(2));
}
