# Review B: suite-refusal

Date: 2026-10-24. Phase: check.review. Verdict: **fix**.

Base: `68f1b19db6651c29a7e3a9e488a190ffcf4ea8db`.
Reviewed head: `a47dbdbcfc520d7c30f454d80d7e9be8858c7d06`.

Read brief, locked design, plan, implementation report, standing design, ponytail, affected docs and reference index. Debate is disabled, so positions-B/rebuttal-B are absent as expected. Review was blind. No code edits or commits.

## Fixes

### F1: Joining argv refuses commands outside the three exact forms

`src/run-check.ts:159` adds `argv.join(' ') === t` beyond D2 and the locked exact-equality design. Joining loses argument boundaries. With merge entry `printf %s a b`, `akrogon run-check --holder evidence -- printf %s 'a b'` exits 1 with the merge refusal. Its argv is `["printf","%s","a b"]`, unlike the configured words `["printf","%s","a","b"]`. The direct command prints `a b`, while the configured command prints `ab`.

This is criterion 2's named “any other command” outcome, reproduced at the real CLI boundary with the standing design's temporary registered repo. The consequence is refusal of an allowed command with different behavior. This finding relies on that named criterion, not a claim of an observed production invocation. Remove the joined-text match and use the three exact forms. The planned refusal test currently uses `text.split(' ')` on a command containing shell quotes, so it supplies literal quote characters instead of the required shell-parsed words. Correct that expectation/input through A's test-correction route rather than retaining a product workaround for it.

Evidence: `check review-b-exact-argv: 0 implementation/check-review-b-exact-argv-1792877837604-2713009.log`, read through `akrogon log`. The diagnostic exits 0 after recording the nested CLI's refusal code 1 and direct output. The temporary fixture was cleaned in `finally`.

### F2: The new skill test enforces prose wording

`tests/docs-links.test.ts:170-177` tests `/run-check[^\n]*refus|refus[^\n]*run-check/i` and `/narrowest[^\n]*command|narrower[^\n]*command/i`. The repository's configured `bun test --timeout=30000` runs this new test on every verification. These assertions mechanically enforce prose vocabulary and line placement, contrary to the explicit review rule rejecting tests of prose/output wording except literal commands, numbers and fixed references. They also pass the conflicting instructions in F3, so they do not establish criterion 4's meaning.

Remove the prose assertions and correct the planned criterion-4 proof to a semantic review of the three specified skill sites, retaining only executable command/fixed-reference checks if needed. This corrects planning's test expectation and proof, so it belongs to A under the repair exceptions. Criterion 4 remains required.

Evidence: added test in `check review-b-inspect: 0 implementation/check-review-b-inspect-1792877804941-2703785.log`; its current green run is `check crit4: 0 implementation/check-crit4-1792877485366-2019899.log`. Both read back with `akrogon log`.

### F3: check.fix still directs a whole-suite fallback

`skills/implement-issue/SKILL.md:82` retains “else the whole recorded command” and “When the whole recorded command is green” immediately before/after the new prohibition on running the whole merge suite. A check.fix seat repairing a red merge and unable to reproduce with failing test files is still explicitly directed to run the whole recorded merge command through run-check. The new guard refuses that command, leaving the documented repair flow contradictory and unable to reach its stated green condition.

This is the real merge-red-to-check.fix instruction path and violates criterion 4 and the operator amendment. Replace the whole-command fallback and green condition with a consistent narrow reproduction flow. Review the nearby implement-end/check.fix-end exceptions (“unless a done-criterion needs a whole run”) against the same merge-only rule while making this correction, without changing unrelated receipt/fresh-base instructions.

Evidence: `check review-b-context: 0 implementation/check-review-b-context-1792877818159-2707545.log`, read back with `akrogon log`, includes the current full check.fix paragraph. The source is the seat instruction itself, not a hypothetical model run.

## Verification and documentation

Existing evidence is current after the latest test change, the whitespace-only `a47dbdb` commit. No configured check was skipped, filtered or disabled by the diff. No fresh full suite was needed for this review.

- C1: `check crit1: 0 implementation/check-crit1-1792877485665-2019893.log`, read back. The filter runs refusal cases, not the still-runs case.
- C2: independently confirmed in the final verify test log, `implementation/check-test-1792877759712-2026853.log`: the still-runs test passes. F1 exposes an uncovered named criterion-2 outcome.
- C3: `check crit3: 0 implementation/check-crit3-1792877485546-2019897.log`, read back, seven passing cases.
- C4: current green wording test read back as above, but rejected under F2 and semantically incomplete under F3.
- Configured checks: format log `implementation/check-format-1792877135153-1279230.log` is green. Final verify test log has 1138 pass, 0 fail. Final verify typecheck log `implementation/check-typecheck-1792877762864-2026853.log` contains successful `tsc --noEmit`. No red checks, retries or known-red disposition needed.
- Planned red logs for C1/C2, C3 and C4 were read through `akrogon log`. They show the missing refusal, old config output and missing prose vocabulary respectively. The C1 raw split input defect is covered by F1.

Changed documented behavior was reviewed in `docs/reference/checks.md`, `config.md`, `commands.md`, the three skills and `src/AREA.md`. The product docs describe the intended refusal and config print. F3 identifies the contradictory skill contract.

AREA path listing: `check review-b-area: 0 implementation/check-review-b-area-1792877825197-2709823.log`, read back. All listed source/test/doc paths exist. The absent `issues/chart/`, `issues/closed/`, `issues/timings.jsonl` and `issues/verify-runs.jsonl` are runtime state paths outside this sparse code worktree, not dead source pointers. No dead-pointer Fix.

## Test-Change trailers

- `c6837e5e`: `tests/run-check.test.ts` added criterion-1/2 cases without changing old expectations. Source is brief criteria 1-2. The quoted-word input needs correction under F1.
- `c6837e5e`: `tests/config.test.ts` changes merge_checks output to `akrogon verify --attempt <id>`, citing brief criterion 3. Valid expectation change.
- `c6837e5e`: `tests/docs-links.test.ts` adds three-skill assertions, citing criterion 4. The addition is declared, but its prose assertions fail the review rule under F2.
- `a47dbdb`: `tests/run-check.test.ts` whitespace-only prettier change. Diff confirms no expectation change, and final proof runs follow it.

No operator actions. No Nits held. Requested destination: check.repair.

## 2026-10-24 check.repair

Starting head: `a47dbdbcfc520d7c30f454d80d7e9be8858c7d06`. Repair head: `4f1ce29e233ecbfd675c8a25ee35355244fbadd0`. Read both initial reviews. A has no blocking findings. No operator actions or new Nits.

F3 repaired in commit `4f1ce29`: removed the whole-recorded-command fallback, made the green condition refer to the narrow reproducing command, and removed both exceptions permitting whole merge runs outside merge. No other file changed.

Before: “else the whole recorded command”, “When the whole recorded command is green”, and both “unless a done-criterion needs a whole run” exceptions. After: failing test files remain the narrow example, “When the narrow reproducing command is green”, and merge checks run only at merge. This resolves the conflicting instructions without changing receipt or refresh rules. Evidence: `check repair-b-f3-diff: 0 implementation/check-repair-b-f3-diff-1792878133643-3444187.log`, read back through `akrogon log`.

Planned proof not written by B rerun on the repair head: `akrogon run-check --name repair-b-crit4 -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && bun test --timeout=30000 tests/docs-links.test.ts -t '\''run-check refusal'\'''`. Result: `check repair-b-crit4: 0 implementation/check-repair-b-crit4-1792878133941-3444469.log`, read back. Its green result is accompanied by the semantic before/after review above and does not resolve F2. C1-C3 inputs are unchanged, so their previous green evidence is retained. No tests added or edited by B.

### Handed to A

- F1: correction of a planned test expectation/input is reserved to A. Correct the quoted shell-word input in `tests/run-check.test.ts`, add the missing criterion-2 argument-boundary case using existing `bun test`, `fixture`, `cli` and cleanup helpers, then remove `argv.join(' ') === t`. Keep the regression red-before/green-after and rerun C1/C2. The product repair and its invalid planned input must be corrected together.
- F2: correction/removal of planned prose assertions and the criterion-4 proof is reserved to A. Correct `tests/docs-links.test.ts` and `plan.md` without weakening criterion 4, record the reason and proof correction in `implementation/report.md`, and preserve the required Test-Change citation. Verify the meaning of all three specified skill sites.

### Repair verification

`akrogon verify` on committed repair head `4f1ce29e233ecbfd675c8a25ee35355244fbadd0` exited 0: `verify leaf 4f1ce29e233ecbfd675c8a25ee35355244fbadd0: green`. Wall time approximately 196 seconds. Format, test and typecheck all passed. Test log records 1138 pass, 0 fail, 191.08 seconds. Logs read back with `akrogon log`:

- `verify format: 0 implementation/check-format-1792878136224-3444620.log`
- `verify test: 0 implementation/check-test-1792878327419-3444620.log`
- `verify typecheck: 0 implementation/check-typecheck-1792878329738-3444620.log`

No merge checks run. Worktree clean, confirmed by `check repair-b-final-state: 0 implementation/check-repair-b-final-state-1792878140415-3464746.log`, read back. F3 is resolved. F1 and F2 remain open for A. Next requested phase: check.fix.

## 2026-10-24 re-check after check.fix

Verdict: **ready**. Prior reviewed base/head: `68f1b19db6651c29a7e3a9e488a190ffcf4ea8db` / `a47dbdbcfc520d7c30f454d80d7e9be8858c7d06`. Refreshed base/reviewed head: `50c91f47218a1cf55f82fbefcd0c41d799b43be2` / `f89afbffbff1dcd7a87d781c812efd030a605cd0`.

Computed `git range-diff 68f1b19d..a47dbdb 50c91f47..f89afbff` myself. Replayed original commits are unchanged except AREA context from the newer base. Reviewed the added repair commits `0c5af803`, `abeb59ee`, `78af5abb`, `f89afbff` and the changed AREA commit. No repair defect or conflict-resolution defect found. The new session-panes paragraph is present on the new base and is not leaf repair scope. Evidence: `check recheck-b-diff: 0 implementation/check-recheck-b-diff-1792878957306-586872.log` and `check recheck-b-proof-detail: 0 implementation/check-recheck-b-proof-detail-1792878967299-602546.log`, both read back through `akrogon log`. Worktree is clean.

- F1 resolved: `78af5abb` removes joined-string equality. The regression case added by `abeb59ee` covers distinct argument boundaries. `f89afbff` corrects the original quoted marker input, so the simple split supplies the configured shell words. The report incorrectly labels `check-crit1-1792878619620-4134034.log` as the argument-boundary red: that log shows the old quoted-input failure and the still-runs case passing. The actual bug regression red is preserved in `check crit1: 1 implementation/check-crit1-1792878610058-4126221.log`, read back: the still-runs test expects 0 and receives 1 at the printf case. The subsequent `check crit1: 0 implementation/check-crit1-1792878641604-4149207.log` has both cases green. Final-head verification reruns both after the latest input edit. The wrong report citation is nonmaterial because the correct red evidence is present and identified here.
- F2 resolved: the added prose assertions are deleted, with review-B F2 cited in the trailer. Criterion 4 remains unchanged and is now verified semantically. I inspected the live implement-issue :67/:82/:88, check-issue :69/:93 and merge-issue :79 instructions: each names refusal of configured merge checks and the narrow reproduction on run-check. The report records the old command, replacement observation and reason. This is removal of a prohibited prose check, not an equivalent automated runner substitution. The same three skill cases remain reviewed, and the original conflicting whole-command instructions would fail this semantic review. No executable product test or case was lost.
- F3 remains resolved: `0c5af803` is B's rebased docs repair. Whole-command fallback and exceptions remain removed, and the green condition still names the narrow reproducing command. No further documented behavior changed in A's repair.

Verification evidence read through `akrogon log`: final-head `implementation/check-test-1792878908783-4180856.log` has 1146 pass, 0 fail, including the refusal and still-runs tests, after `f89afbff`; `implementation/check-format-1792878678508-4180856.log` is green; `implementation/check-typecheck-1792878911210-4180856.log` records successful `tsc --noEmit`. No current red or known-red disposition. No checks were skipped or disabled. Existing C3 cases also run in final verification. No full-suite rerun needed in review.

AREA paths were listed in one command from the repo root: `check recheck-b-area: 0 implementation/check-recheck-b-area-1792878970917-608692.log`, read back. All source/test/doc pointers exist. Absent issues runtime paths are the same sparse-worktree state paths explained in the initial review, with no dead-pointer consequence.

Repair Test-Change trailers: `abeb59ee` cites F1 for the new argument-boundary case and F2 for deleting the prohibited prose assertions. Its claim that it also unquotes the marker is inaccurate, but `f89afbff` performs that correction and carries its own F1 citation. Both changes match the brief outcomes and review findings. The original planning and formatting trailers replay unchanged, judged above. No undocumented expectation weakening.

No open Fixes, Nits or operator actions. No lessons written because no reusable Nit is held. Requested destination: merge.
