# Review A: close-verb (initial)

Base: 20926c68f7664015b23ea0224147f69059d5b881
Head: e445fd49a98e74257d4ce78d0594d2bef3491892
Debate: no (no positions/rebuttal expected; none read).

## Verdict: ready

No Fix. No Nit. Diff matches plan D1-D7 and brief criteria 1-7.

## Criteria

- A1 dispatch: `src/akrogon.ts` adds `close` options `{ by: string }`, `strict: true` (unknown flag fails), tuple-of-one `sourcePattern` positional plus `z.string().trim().min(1)` for `--by`, both before any `gh` import. Live probe: blank `--by` exits 1 with `too_small`; invalid identity exits 1 with `invalid_format regex`; extra positional exits 1 with `too_big`; `--unknown` exits 1 with `ERR_PARSE_ARGS_UNKNOWN_OPTION`; missing `--by` exits 1 with `invalid_type`. All name the problem.
- A2 reuse: `closeSource(repo, source, comment)` takes full text; `closeSources` passes `` `merged ${commit}` `` (byte-identical); `closeCommand` passes `` `delivered by ${by}` ``. View parse, CLOSED early return, two-attempt retry with warning, and full-text comment-existence check unchanged. `phase.ts` untouched, `closeSources` signature unchanged, so `completeOwner` behavior unchanged.
- A3 resolve/report: `closeCommand` uses `requireRepo(readGlobal(), process.cwd())` like `pullCommand`, `closeSource` runs `gh` with cwd `repo.root`; test asserts every call cwd equals fixture root. `SourceError`/`CommandError` context preserved (no new error type).
- A4 tests: `tests/close.test.ts` uses real CLI plus stateful fake-`gh` for all four cases: exact `delivered by` comment plus 2-call view/close sequence; CLOSED with 1 view call and 0 attempts; retry with 5-call view/close/view/api/close sequence and single comment plus warning JSON; five negatives (blank, missing, two invalid, extra positional) each nonzero exit with no `.calls` file. No mocks of the unit under test. The one exact-stdout assertion covers the defined machine-readable success line, matching the repo's `moved <phase>` contract pattern, not prose.
- A5 reference: `contracts` gains `close: '<owner/repo#n> --by <text>'`, README row matches, usage string lists `close`. Report evidence: `command-reference` plus `docs-links` 7 pass, 978 expects.
- A6 docs: SKILL.md Open prose sits immediately after the dedup sentence and covers naming skipped open identities, offering the verb, and running it for delivered/duplicate with leaf-plus-commit or other identity. `docs/guide/chart.md` carries the one sentence. `src/AREA.md` Commands list has the `close` line; four required sections intact.
- A7 exclusions/checks: diff touches 8 files, none under `issues/` (`git diff --name-only -- issues` empty), no new field/format/config, no `pullRepo`/`phase`/`next`/`status` change. Report evidence: `typecheck` exit 0, full `bun test` 291 pass / 0 fail, `format` touched only the new test, `phase.test.ts` regression 31 pass.

## Required checks

- AREA.md paths (one command, from repo root): `src/akrogon.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `docs/reference-index.md`, `tests/helpers.ts` all exist. No missing path.
- Unchanged doc page: no unchanged page describes close behavior (`merged`/closure/`delivered by` absent from docs and guide outside this diff), so no stale claim; the changed pages (README, chart guide, skill, AREA.md) state the new behavior correctly.
- Ponytail: reuses `closeSource` via one comment parameter instead of a sibling duplicate; no new dependency, abstraction, or helper; minimal diff.
- Report: base/head match, red/green/changed-set/regression/reference/full-suite evidence present, R1/R2 restated. No material gap.

## Evidence

- Diff stat: 8 files, README/docs/skill/AREA/akrogon/pull/close-test/command-reference only.
- Live probes from worktree: blank `--by`, invalid identity, extra positional, unknown flag, missing `--by` all exit 1 with naming errors (see A1).
- No `bun test`/`typecheck`/`format` rerun at review time: no code change, no missing evidence, no specific concern.

## Merge (2026-09-21)

- Worktree clean, no outstanding changes to commit.
- Fetched `origin`; `origin/main` = base `20926c68`; rebase no-op, head unchanged `e445fd49`.
- `AKROGON_BASE` refreshed after rebase: `20926c68f7664015b23ea0224147f69059d5b881`.
- Checks in worktree, all green: `bun run format` exit 0 (no changes); `bun run typecheck` exit 0; `bun test` 291 pass / 0 fail / 3468 expects across 14 files; `bun test --changed` 8 pass / 0 fail / 1003 expects across 2 files. No advisory checks configured.
- First push rejected non-fast-forward: `origin/main` had moved to `045dd11` (merged-siblings-rule). Fetched, rebased cleanly (no conflicts) to `2f5b69f`; `AKROGON_BASE` refreshed to `045dd11d7e23a60b0333ad3c6e1bc08e5b167c80`. Reran all checks green: format exit 0, typecheck exit 0, `bun test` 291/0/3468, `bun test --changed` 8/0/1003.
