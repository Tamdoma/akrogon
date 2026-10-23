# Review B

Date: 2026-10-22. Phase: `check.review` (initial, blind).
Base: `92dddada7b2d0a1b37fcb3b1bce9993d535bb62b`.
Reviewed head: `bd996a7ad22225d35328088e7a7d1a1bc0c95d89`.
Verdict: **ready**. No Fixes, Nits, or operator actions.

## Scope and findings

Read brief, design, plan, implementation report, readiness contract, reference index, affected guide pages, source/test areas and the complete six-file diff. Debate is off, so positions-B/rebuttal-B are absent as expected. No changed AREA files or lesson removals.

- **F1:** `runUnitArgv` places `--expand-environment=no` before `--`, preserving the caller's argv at the shared systemd boundary. The nested admission path still spawns argv directly. The new real-unit test compares all four requested literals in outer and nested commands, checks their shared real scope and confirms no units remain.
- **F2:** `constructedEnv` defaults LANG before declared env/pass_env copies. Declared values override the default, LANG/LC_ALL remain unreserved, and the test checks UTF-8 character counting plus the caller LANG override. The only old expectation change adds LANG to the environment allowlist, as criterion 2 requires.
- **F3:** Install prerequisites now name systemd 254. Setup documents the existing session-bus cut's keyring consequence and both permitted gh token sources. These edits satisfy criterion 3 without changing containment or adding credential handling. Affected guide links pass.

## Verification evidence

Read the following kept logs through `akrogon log`; paths below are relative to this leaf's `implementation/`.

| Evidence | Kept result |
| --- | --- |
| Criterion 1 before product fix | `check argv-literal: 1 check-argv-literal-1792695291269-1831453.log`: outer output loses `${base}`, `${file.key}` and collapses `$${x}` |
| Criterion 1 after fix | `check argv-literal: 0 check-argv-literal-1792695471760-1840975.log`: 1 pass, 7 assertions, real outer/nested scope |
| Criterion 2 before product fix | `check lang-default: 1 check-lang-default-1792695289446-1831199.log`: empty LANG and character count 2 |
| Criterion 2 after fix | `check lang-checks: 0 check-lang-checks-1792695473714-1841244.log`: locale and allowlist cases both pass |
| Criterion 3 text proof | `check guide-env: 0 check-guide-env-1792695482292-1841881.log`: both required guide statements present |
| Guide links | `check docs-links: 0 check-docs-links-1792695475946-1841597.log`: 7 pass |
| Required format | `check format: 0 check-format-1792695485450-1841988.log` |
| Required tests | `check test: 0 check-test-1792695635327-1841988.log`: 1107 pass, 0 fail, including both new behavior tests |
| Required typecheck | `check typecheck: 0 check-typecheck-1792695637411-1841988.log` |

Receipt `c8079246-fd6d-43d1-8eab-31c4aabfb3b1` is complete for the reviewed head/tree `a95eb477250c68eec7e413b3261210473422b20e`, setup 0 and every configured check 0. No required command is skipped or disabled. No test/helper/fixture/runner changes occurred after planning's test commit, and the green full check ran on the final head. The targeted LANG run changes the label and broadens the planned `LANG` filter to `LANG|allowlisted`, retaining the entire planned scenario and adding the existing allowlist check. This preserves its proof boundary and assertions. Existing evidence is sufficient, so no checks were rerun.

Review traces:

- `check review-B-artifacts: 0 implementation/check-review-B-artifacts-1792695680334-2308954.log`
- `check review-B-diff: 0 implementation/check-review-B-diff-1792695686659-2309487.log`
- `check review-B-context: 0 implementation/check-review-B-context-1792695692518-2310403.log`
- `check review-B-receipt: 0 implementation/check-review-B-receipt-1792695703473-2312551.log`
- `check review-B-final-state: 0 implementation/check-review-B-final-state-1792695716217-2314817.log`: unchanged head and clean code worktree.

No live paid/API operations or new fixtures were needed for this review. No grants were exercised. No reusable Nits remain to record.

## Test-Change trailers

Range `92dddada7b2d0a1b37fcb3b1bce9993d535bb62b..HEAD`, commit `37537ba37997ad8af9a589342bf99c83f0589384`:

```text
Test-Change: tests/run-units.test.ts adds the literal-argv case; no existing expectation changed
Test-Change: tests/run-check.test.ts brief criterion 2: LANG joins the allowlisted names and the new case asserts it; no other expectation changed
```

Both paths match `src/test-files.ts`. The first adds the criterion 1 regression without changing existing expectations. The second cites the brief outcome that requires the sole existing expectation update. Both are justified by the diff and cited sources.
