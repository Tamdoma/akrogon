# Review A: docs-reference-records

Base `0680fda60062a72354f09c08a6c8f5ebe3fd00bd`. Reviewed head `6bb7a45803eaabc52ddcf4649bb4db8a53488082`. Diff: four new files under `docs/reference/`, nothing else (`git diff --stat` 4 files, +~360). No `AREA.md` in the diff. No test file changed.

## Verification

- `akrogon verify` on this head: green (format, test 1115 pass 0 fail, typecheck), logs in `implementation/report.md`.
- Criterion proofs on this head (from report): c1-pages 0, c2-pictures 0, c3-no-dates 0, c3-retired 0 (6 pass), links-all 0. Each was red at synthesis where planned.
- Code spot checks against the pages, by reading source at this head:
  - Phase table matches `src/routing.ts` `routing`/`requiredSlots`. The receipt gates on check.review and on check.repair to merge match `src/phase.ts:350-355`. `--check` prints `ok` (`src/phase.ts:359`). The cleared fields and `fix_rounds`/`merge_stamp` rules match `commitMove` (`src/phase.ts:137-153`).
  - `failure.cause`: the only writer is `cause: 'blocked'` (`src/phase.ts:340`), and the page documents only that.
  - Releases: every quoted message exists in `src/self-update.ts` (`deploy held`, `checkout pending`, `self-update skipped`, `switched from checkout to release`, `retried at the next trigger`, `self-update failed`), the fetch/push failure form is at `src/self-update.ts:332-333`, the status line is in `src/status.ts`, and the 24h prune is at `src/release.ts:150`.
  - Files: the timing wait reasons match `src/timing.ts:22` and `src/timing-report.ts:26`. The flaky filter (completed runs, setup 0) matches `src/flaky.ts:24-27`. The evidence pack matches `src/pack.ts:6,14`. The `worktree_root` refusal matches `src/config.ts:275-284`.
  - Limits: the commands named (`pause`, `unpause`, `stop`, `start`, `park`, `unpark`) exist in `src/akrogon.ts`. Lesson lines are left for the operator to commit (`skills/check-issue/SKILL.md:67,97`).
- Brief criterion 2: the three pictures are embedded with descriptive alt text, and limits.md has no picture, as the page map says.
- Brief criterion 3: the date grep is clean. `tests/hold-retired.test.ts` sweeps `docs/` and passes. I found no mention of a retired command or setting.
- Link rule (design): the pages link only to this leaf's pages, the three pictures, `skills/*/SKILL.md` and `src/*.ts`. No `docs/guide` links.

Documented behavior: no product behavior changed. The pages are the docs.

## Findings

No Fix.

### Nit 1: files.md sync note describes an unreachable case

`docs/reference/files.md` says `akrogon sync` skips "the worktree store if it sits inside the checkout". The final section of the same page says such a store is refused. The clause mirrors `eligibleRecord` in `src/sync.ts:14`, but `worktreeStore` (`src/config.ts:279-282`) throws before sync can reach it. Both statements are true of the code, so no reader is misled into a wrong action today.

- Deferred because there is no realistic source of harm.
- It would become a Fix with a config that reaches sync with an in-checkout store.

### Nit 2: limits.md "a leaf that never ran starts only when you run `akrogon next`"

The Herdr hooks run `akrogon next --resume` and plain `akrogon next` (`plugin/herdr-plugin.toml`). watch-issues runs `akrogon next --all`, which can start new leaves, but only while the operator keeps watch running. The page's wording is accurate for automatic passes.

- Deferred because there is no concrete wrong action.
- It would become a Fix with a hook-driven pass that starts an untouched leaf.

## Verdict

nits
