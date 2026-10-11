# Review A: guard-at-creation

Base: `c53f619` · Reviewed head: `500d215` · Range: `c53f619..500d215` (3 commits)

## Evidence

- Diff inspected end to end: `src/config.ts` (2-line prefix drop), `src/AREA.md` (1 clause), three skill temp-file sentences (identical wording), test updates in `tests/config.test.ts`, `tests/guard.test.ts`, `tests/batch.test.ts`.
- Independent rerun at review: `bun test tests/config.test.ts tests/guard.test.ts tests/batch.test.ts tests/worktree-store.test.ts` → 51 pass, 0 fail.
- Report's claimed full-suite green (793 pass) consistent with targeted rerun; report run order and artifacts match plan.md proof commands.
- Deliberate-break evidence in report verified plausible: re-adding the prefix turns criteria 1–2 tests red.
- `src/AREA.md` path listing: all 13 named paths exist; file at 40 lines, within contract.
- Residual `guard ancestors` grep: only `src/base-run.ts` (design exclusion, its scratch root is clean) and `tests/guard.test.ts` (the `guard` command's own tests). No doc or skill still claims composed checks run ancestors.

## Judgment vs criteria

- C1: both `inner` forms proven by `config composes setup…`, `config reports merge_checks…`, plus real-run tests (`installs into a fresh worktree`, `runs all of setup inside the install lock`). Caught by deliberate break.
- C2: inverted test proves completion under a dirty parent for both config forms; unchanged `printed check refuses naming missing own node_modules` keeps the refusal leg. Worktree seeds its own `node_modules` so only the removed guard could refuse — the right isolation.
- C3: leaf refusal already covered by `dispatch refuses a store path…` (unchanged); new `buildStack refuses a store path…` covers the batch creation path at the real boundary (direct `buildStack` call, real worktree machinery). `checkLocation` unit test retained.
- C4: three sentences verbatim per plan D4; sweep hits triaged, all out-of-scope listed in report.
- Test-quality bar: no expectation deleted without a cited brief outcome (trailers cite criteria 1 and 2); new batch test asserts behavior (throw naming the ancestor, nothing created), not prose; smallest boundary used throughout.
- `Test-Change` trailers present on the test commit for all three files with correct citations.

## Findings

None. No Fixes, no Nits worth recording: the `base-run` prefix retention is a locked design exclusion, and the unchanged `printed check refuses naming missing own node_modules` test is under a clean parent, which criterion 2 permits since the ancestor check no longer exists to be distinguished from.

Doc surface: no documented behavior changed beyond `src/AREA.md`, which the diff updates correctly; `README.md:148` describes the `guard` command itself and stays accurate.

## Verdict

`ready`

`akrogon phase guard-at-creation merge --slot A --verdict ready`
