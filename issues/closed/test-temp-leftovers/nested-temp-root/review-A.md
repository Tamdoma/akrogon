# Review A: nested-temp-root

Initial review, slot A, 2026-11-25. Blind of B.

Base: `646819159203d8ba256d0990f85fd17b44c1bd78` (origin/main). Reviewed head: `011d47575accb875bdf898f5b52f67d016a1120f` (two commits: `40e4f50f` red-first test, `011d4757` fix + allowlist expectation).

## Diff judgment

The diff is exactly the locked design and plan D1–D8:

- `src/run-check.ts`: `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` added to `copied` beside `AKROGON_HOME`, with a reason comment in the same shape as the `AKROGON_HOME` entry. Nothing else in the file changed. The copy loop's `value !== undefined` skip means a caller holding neither name sees no change — the brief's production-default statement holds by the mechanism itself.
- `repoSchema`'s reserved `constructed` set untouched (verified in the diff — no `src/config.ts` change), so configs already declaring either name in `env`/`pass_env` still parse, and the copy order (`copied` first, then env/pass_env layering the same caller values) means declared configs receive exactly the caller's value as before. Criterion 2's mechanism is intact.
- `tests/run-check.test.ts`: one new test at the real CLI boundary plus the exact-allowlist expectation gaining the two names. The test drives two real `akrogon run-check` levels through the real entry (the `fakeAkrogon` PATH shim symlinks the entry), reads back the innermost env values and compares exact equality with the caller's, and asserts absence of the fixture-specific computed default-root leaf dir, never scanning the shared root. Correctly fails vacuous nowhere: a nested failure before the innermost `sh` means the `received` file never exists and `readFileSync` throws.
- The test's reimplementation of the hash grammar is the right call — importing `leafTemp` would make the test verify the unit with itself. The duplication concern is already recorded in `plan.md`'s open limitations.

## Criteria and proof check

- Criterion 1: proven. Red-first reproduction on base with `Received: "unset:unset"` (`check nested-roots-base: 1`), and the base run created exactly `/var/tmp/akr-1000/7afc/77a63c18` empty — the production litter mechanism reproduced. Per-name teeth demonstrated at plan time with temporary edits (`nested-roots-leafonly` red on the retired half, `nested-roots-retiredonly` red on the leaf half), both discarded before the test commit as the skill requires. Green after the fix: `check nested-roots-green: 0` on the fix tree, and the same test passes inside the verify `test` leg on the committed head (receipt `b0a1e520`, `test` exit 0, 99.3 s, no reuse). The criterion's "run dir under the caller's leaf temp root" follows necessarily: `leafTemp()` is `resolve(leafTempRoot(), …)` and `leafTempRoot()` is a pure read of the forwarded env — value equality plus default-root absence is the whole inference chain with no gap.
- Criterion 2: proven by the green `test` leg of receipt `b0a1e520`, which runs the whole suite plus the changed-file `--rerun-each=5` leg over `tests/run-check.test.ts`, covering every fixture that declares `AKROGON_LEAF_TEMP_ROOT` in `env`/`pass_env` (`run-check`, `run-permit`, `run-units`, `close-pack`, `timing`, `durable-capture`, `abandoned-capture` tests). `akrogon verify` receipt `b0a1e520` on head `011d4757`: setup 0, format 0, typecheck 0, test 0, completed end row, no reused entries.
- Proof commands match `plan.md` exactly; no skipped or filtered planned test; the green criterion proof postdates the final test content (verify ran it on the committed head after the last change).
- Report (`implementation/report.md`) records commands, commits, durations, receipts and limitations — no material gap.
- `Test-Change:` trailers present on both commits touching the existing test file, citing the brief criterion and the expectation-update reason respectively.

## Docs and AREA check

No `AREA.md` in the diff. The changed behavior (checked-command env gains two caller-copied names) is described generically in `docs/reference/checks.md`: "a few other basics, the names you list in `env` and `pass_env`" — the page never enumerates the copied names (it already omits `AKROGON_HOME`, copied before this leaf) and makes no completeness claim, so no documented behavior changed and no claim turned wrong. One line per the rule: no documented behavior changed.

## Exclusions and scope

`src/reconcile.ts`, the worktree-store clause, the land empty-HOME flag, the preload, `cleanEnv` and the seven fixture crutches all untouched, as the design's exclusions require. No scope growth anywhere in the diff.

## Findings

No Fixes. No Nits — the indirectness of the run-dir observation is closed by the pure env-read inference chain, and the insurance assertion's limits are already the plan's recorded open limitation, not a review finding.

## Verdict

ready.
