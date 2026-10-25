# Report: suite-refusal

## Changed files and reasons

- `c6837e5e` tests first (plan.synthesis): refusal + still-runs cases in tests/run-check.test.ts, merge_checks print expectations in tests/config.test.ts, skill-wording test in tests/docs-links.test.ts.
- `67ca7c2d` worker u1: src/run-check.ts refusal in `runCheck` after `requireRepo`, before `leafTarget` — argv equals a merge_checks entry as shell words (shell-quote `parse`, plus `argv.join(' ')` plain-text equality for the split form), `sh -c '<text>'`, or `sh -c '<setupCommand(config,text)>'` → stderr names `akrogon verify --attempt <id>` and the narrower-command reproduction, exit 1, no process started. src/config.ts `withSetup` prints `akrogon verify --attempt <id>` for each merge_checks entry. src/AREA.md updated.
- `e02257c1` worker u2: implement-issue (:67, :82, :88), check-issue (:69, :93), merge-issue (:79) SKILL.md name the refusal and the narrowest-failing-command reproduction; docs/reference/checks.md, config.md, commands.md describe the refusal and printed route.
- `a47dbdb` prettier reformat of src/run-check.ts and the committed test (whitespace only).

Base: 68f1b19d. Head: a47dbdb.

## check.fix round 1 (2026-10-24)

Prior reviewed base/head: 68f1b19d / a47dbdb. Handed-off base/head after refresh: 50c91f47 / f89afbff.

B repaired F3 in 0c5af803 (implement-issue whole-suite fallback removed). Handed to A: F1, F2.

- F1: `abeb59ee` corrected the criterion-1 test input (unquoted marker path so `split(' ')` is real shell words) and added the `['printf','%s','a b']` argument-boundary case to the still-runs test; `78af5abb` removed `argv.join(' ') === t` — a red run on the join bug (`check crit1: 1`, `check-crit1-1792878619620-4134034.log`), green after (`check crit1: 0`, `check-crit1-1792878641604-4149207.log`). `f89afbff` corrected the same input a second time after a missed edit.
- F2: `abeb59ee` deleted the docs-links prose-wording test. Criterion 4's proof command is corrected under the plan.synthesis proof-command rule: old `bun test tests/docs-links.test.ts -t 'run-check refusal'` → none; the criterion is proven by the skill lines themselves, cited below (the deleted test enforced prose wording, rejected by the review rule — a non-equivalent proof, replaced with semantic evidence). `plan.md` updated. Semantic proof observed at f89afbff (`check crit4-review: 0`, `check-crit4-review-1792878671357-4177764.log`): implement-issue :67/:82/:88, check-issue :69/:93 and merge-issue :79 each name `akrogon run-check` refusing configured `merge_checks` and the narrowest-failing-command reproduction; merge-issue :45 names `akrogon verify --attempt <id>` as the merge-check runner; docs/reference/checks.md and config.md carry the same facts.
- Refresh: branch rebased 68f1b19d → 50c91f47 before repairs.
- Post-repair: format `check format: 0` (`check-format-1792878668423-4170846.log`), typecheck `check typecheck: 0` (`check-typecheck-1792878668345-4170844.log`); `akrogon verify` on f89afbff → `verify leaf f89afbff…: green`, test log 1146 pass 0 fail (`check-test-1792878908783-4180856.log`, `check-typecheck-1792878911210-4180856.log`).

## Proof results (all on a47dbdb)

- C1/C2 — `akrogon run-check --name crit1 -- bun test --timeout=30000 tests/run-check.test.ts -t refuses` → `check crit1: 0` (log `implementation/check-crit1-1792877485665-2019893.log`); the still-runs allowlist case passes in the same file and full suite.
- C3 — `akrogon run-check --name crit3 -- bun test --timeout=30000 tests/config.test.ts -t merge` → `check crit3: 0` (`implementation/check-crit3-1792877485546-2019897.log`).
- C4 — `akrogon run-check --name crit4 -- bun test --timeout=30000 tests/docs-links.test.ts -t 'run-check refusal'` → `check crit4: 0` (`implementation/check-crit4-1792877485366-2019899.log`).
- checks: format `check format: 0` (`implementation/check-format-1792877135153-1279230.log`); test `check test: 0`, 1138 pass (`implementation/check-test-1792877426615-1335556.log`); typecheck `check typecheck: 0` (`implementation/check-typecheck-1792877004000-1256912.log`).
- `akrogon verify` on HEAD: `verify leaf a47dbdb…: green` (`implementation/check-test-1792877759712-2026853.log`, `check-typecheck-1792877762864-2026853.log`).

## Worker returns

- u1 (Sam): src changes + AREA.md, all targeted tests green, typecheck clean. Noted deviation: added `argv.join(' ') === t` beside the parse-token compare, a superset covering the plain-words form; accepted.
- u2 (Legolas): six doc/skill files edited, docs-links test green.

## Known limitations

- Live repo config has no `merge_checks` entries; refusal proven only through fixture tests (the standing design's named boundary).
- `argv.join(' ') === t` can match an argv whose tokens differ in internal spacing/quotes from `t`; inherent to the plain-words form.

## Unverified criteria

None.
