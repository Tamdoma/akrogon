# Review B: close-verb

Blind review; peer review not read. `debate: no`, so no positions/rebuttal artifacts expected.

Base: `20926c68f7664015b23ea0224147f69059d5b881`
Reviewed head: `e445fd49a98e74257d4ce78d0594d2bef3491892`
Worktree clean at review; diff is 8 files, +152/-8, no `issues/` paths.

## Verdict: ready

## Criteria check

1. Dispatch and validation: `src/akrogon.ts` adds the `close` options branch, `case 'close'` with `z.tuple([z.string().regex(sourcePattern)])` plus `z.string().trim().min(1)` for `--by`, and `close` in usage. Negatives throw before any `gh` spawn; `strict: true` rejects unknown flags. Tests assert five negatives exit nonzero with no `.calls` file.
2. Reuse: `closeSource(repo, source, comment)` takes the full comment; `closeSources` passes `` `merged ${commit}` `` (byte-identical); `closeCommand` passes `` `delivered by ${by}` ``. View parse, CLOSED early return, two-attempt retry with warning, and full-text comment-existence check are untouched. No worktree lookup in the new path.
3. Resolution and errors: `closeCommand` uses `requireRepo(readGlobal(), process.cwd())` like `phaseCommand`; tests assert `gh` cwd equals the repo root. Failures propagate the existing `SourceError`/`CommandError`; live probe below confirms the warning and final error carry source, argv, cwd, and response.
4. Test matrix: `tests/close.test.ts` covers exact-comment close, CLOSED no-close, retry dedup without a second comment, and blank/missing/invalid/extra negatives with no spawn. Real CLI plus stateful fake `gh` at the PATH boundary; no mocks of the unit under test; wording asserted only for the literal stdout contract.
5. Reference: `contracts` gains the `close` entry, README gains the matching row, usage lists `close`; `tests/command-reference.test.ts` passes.
6. Docs: skill Open prose sits immediately after the dedup sentence and covers naming, offering, and running for delivered/duplicate records with the delivering reference; `docs/guide/chart.md` gains the one sentence; `src/AREA.md` gains the Commands line (31 lines, exactly the four required sections).
7. Exclusions and checks: no new field, format, or config key; `pullRepo`, `closeSources` output, `completeOwner`, `phase`, `next`, `status` untouched. Full suite 291 pass per the report; targeted reruns below corroborate.

## Verification evidence

- `bun test tests/close.test.ts tests/command-reference.test.ts tests/docs-links.test.ts`: 11 pass, 0 fail.
- `bun test tests/phase.test.ts`: 31 pass, 0 fail (no `closeSources`/`completeOwner` regression).
- Live probe `--by '  spaced out  '`: exit 0, posts and prints `delivered by spaced out` (trim rule holds).
- Live probe exhausted `gh` failure: exit 1, warning line carries source/argv/cwd/result, final `CommandError` carries argv/cwd/code/stdout/stderr.
- One-command `src/AREA.md` path check: every named path exists; no missing paths.
- Changed behavior traced to its doc pages (README Command table, chart skill Open, chart guide); `docs/guide/cheat.md` lists only common commands (no `phase`/`park` either), so omitting `close` there is consistent, not stale. No other documented behavior changed.
- Checked: the new `sourcePattern` import pulls the pre-existing `state`/`park` import cycle into the entry point. Benign: all cross-imports are used at call time, and every real-CLI test spawn passes. No action.

## Findings

No Fix findings. No Nits.
