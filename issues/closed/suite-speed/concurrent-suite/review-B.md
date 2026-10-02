# Review B: concurrent-suite

Verdict: ready
Base: `22c447039b192f4caae6cad4d5b56092941d1bed`
Reviewed head: `66f85ef367c336a579f88429343658645a3222d3`

## Scope and findings

No Fixes or Nits. Reviewed the whole initial diff against the amended design, plan D1–D6, implementation report and live test contracts. Debate is off, so no positions or rebuttal artifacts apply.

- F1: The final bunfig retains `root = "tests"` and adds only the concurrent glob. No preload or setup file remains. The live `akrogon config` resolves both test checks with `--timeout=30000`, confirming the operator's D2 amendment outside this branch.
- F2: The only test changes are the two planned `test.serial` marks, covering three generated cases. These cases share the `console.warn` spy. The other tests in that file do not use that spy, and fixture helpers isolate repositories, environment and fake integrations in temporary directories or subprocesses.
- F3: The affected behavior documentation is `tests/AREA.md`, reached through `docs/reference-index.md`. It records concurrency and the configured timeout. One repository-root listing checked every named path: `bunfig.toml`, `tests/`, `tests/phase.test.ts`, `tests/helpers.ts`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`, `issues/config.yaml`, `src/shell.ts`, and `docs/reference-index.md` all exist. The timeout lesson's history matches the report's multi-file probe and the amended mechanism. No new lesson was found.

## Verification

Filled the latest report's missing direct-command evidence by running plain `bun test` on the reviewed head with Bun 1.4.2: exit 0, 353 pass, 0 fail, 15 files, 11.20 seconds. Log: `/var/tmp/akrogon-1000/concurrent-suite-5f2bdeaea53a/tmp.cxP0liZgnc`.

Inspected the existing Pass 2 logs under `/var/tmp/akrogon-1000/concurrent-suite-5f2bdeaea53a/claude-1000/-home-ivan-Work-infra-akrogon-issues-worktrees-concurrent-suite/3c994dd2-4fd2-4966-bda0-65712ea94e00/scratchpad/`: `v2seq1.log` through `v2seq3.log` each show 353 pass, 0 fail in 11.46, 11.21 and 11.22 seconds. `v2par1.log` through `v2par4.log` each show 353 pass, 0 fail in 36.92–37.06 seconds. These support the amended timeout-under-load proof without repeating completed checks.

The report records all configured checks passing on this unchanged head, including format, typecheck, the full suite and changed tests. Installed Bun types document `test.serial` as forcing serial execution even under concurrency. The worktree remained clean after review.

The accepted limitation remains: configured test checks allow a hung test 30 seconds, while direct `bun test` uses Bun's default timeout.

## Merge verification (2026-10-02)

Rebased without conflicts from reviewed head `66f85ef367c336a579f88429343658645a3222d3` onto `origin/main` at `0462fd52ab9e6d02b62c58346d8dd8ecbfaeedd6`. Rebased head: `802987abd0c7166bd350877d9576be5f3215e7c3`. Refreshed `AKROGON_BASE` through `akrogon config`: `0462fd52ab9e6d02b62c58346d8dd8ecbfaeedd6`.

Every configured check passed on the rebased head:
- `bun run format`: exit 0, no working-tree changes.
- `bun test --timeout=30000`: exit 0, 353 pass, 0 fail, 10.61 seconds.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 12 pass, 0 fail, 346 ms.

Logs: `/var/tmp/akrogon-1000/concurrent-suite-5f2bdeaea53a/tmp.p2twi6EAvX/{format,test,typecheck,test_changed}.log`. No merge checks or advisory commands are configured. No outstanding B Nit requires a lesson. Gathered the completion owner's `suite-speed/ISSUE.md` and its only leaf brief before completion can move the folder.

Fast-forward push succeeded: `origin/main` advanced from `0462fd5` to `802987a` with `git push origin HEAD:main` (exit 0).
