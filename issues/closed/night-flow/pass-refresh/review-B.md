# Review B: pass-refresh

Date: 2026-10-11
Phase: check.review, initial blind review
Base: 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192
Reviewed head: 0ca50b92ba1e55ace67e974d398449cbd4f347ec
Verdict: fix

## Fixes

### F1 — Prose assertions contradict the binding proof rules

Location: `tests/skill-refresh.test.ts:31-160`; `plan.md` Done-criteria → proof.

Real source: the repository's configured blocking `checks.test` and `checks.test_changed` run this newly added file. The implementation logs `implementation/check-test-1791715457349-3755501.log` and `implementation/check-test_changed-1791715461661-3993457.log` show all ten tests running in those real checks.

Consequence today: the blocking proof judges human instructions by exact prose rather than meaning. For example, lines 33-46 and 49-52 require literal phrases such as “keeping both true sides” and “never proceeds on an old tip”; lines 61-72 locate prose phrases to judge order. These are neither executable commands nor numbers nor fixed references. The regex sweep at lines 128-160 likewise cannot establish the required by-meaning judgment. The leaf has introduced 161 lines of maintenance and a mandatory wording gate for a text-only change, contrary to its specified proof contract.

Contract hit: design.md explicitly says “skill text only, so there is no code test” and “Proof is the report's quoted edited lines and the by-meaning sweep.” The check-issue test-proof rule explicitly rejects akrogon tests of prose/output wording except commands, numbers or fixed references that execute literally. The supplied AGENTS instructions reserve quality judgment for a thinking agent and mechanical validation for function. This is an explicit contract conflict, rather than a speculative wording-coupling Nit.

Required repair: A corrects the plan's proof instructions to match the locked design, removes the prose-test file with a Test-Change trailer citing this design conflict, and records quoted edited lines plus the meaning-based sweep in implementation/report.md. Preserve the refresh behavior. No replacement prose test or live model run is needed. This requires a plan correction and deletion of existing expectations, so the check.repair seat must hand it to A.

## Verification

Read brief.md, design.md, plan.md, implementation/report.md, standing-design.md, ponytail.md, affected skills/docs, worker-protocol.md, merge-issue's solo rule, src/compare.ts and src/config.ts. Debate is disabled, so positions-B.md/rebuttal-B.md are absent as expected. No peer review was read.

The instruction changes satisfy the four requested outcomes by inspection:

- implement-issue:40 requires fetch, rebase, base refresh, commit-first, conflict resolution in the active rebase, plan correction, failed-refresh report/no phase move/resume, fresh comparison records, and refresh SHA records.
- implement-issue:55 and :76 invoke refresh before implementation/repair; :65 and :86 sequence commit → refresh → proof. The implementation handoff waits for all worker worktrees to be removed, and the worker protocol removes workers after landing their work.
- implement-issue:80 preserves recorded-command replay, green replay, base-run handling, verbatim replay and replay evidence while referring to the shared refresh.
- check-issue:67 specifies the recorded-SHA range-diff and limits repair review to added/changed commits including conflict resolution, excluding main's commits.

Opened docs/guide/phases.md and the unchanged merge/idea/state/setup guide pages. The two edited documentation lines describe the new refresh. A candidate sweep across skills/ and docs/ found no merge-only main-meeting or merge-origin-only rebase claim. Existing merge_checks-only-at-merge language describes check scheduling, and solo/stack rebase language describes merge behavior without claiming exclusivity.

Existing check logs provide complete terminal results: format unchanged, typecheck clean, test 826 pass/0 fail, test_changed 10 pass/0 fail. The report records the planned targeted command with 10 pass/0 fail and seven failures before edits. No planned command was filtered, skipped or disabled. No check rerun was needed for this text-only review with complete saved check evidence. Passing prose assertions do not resolve F1.

AREA path listing (one shell invocation, from repository root): all named skills files, src/routing.ts and docs/reference-index.md exist. `scripts/observe.ts` and `scripts/log-tail.ts` are missing at the root. These two pointers are unchanged from the reviewed base, belong to the watch workflow, and are unrelated to this leaf's changed refresh description, so no repair is requested here. skills/AREA.md remains 33 lines with the existing four sections.

## Test-Change trailers

None in base..HEAD. The only test path is newly added in planning commit f3bc349faff9085000fa5c94c6243e84db7007c7 and unchanged by subsequent implementation commits. No existing expectation was changed or deleted in this reviewed range.

## Operator actions

None.

## Nits

None.

## 2026-10-11 check.repair

Repair input: both initial reviews of 0ca50b92ba1e55ace67e974d398449cbd4f347ec. Finding IDs below are qualified by seat because both reviews used F1.

Repaired review-A F1 in commit d954eedd6f6c3d8ec5adc875e1118809e4ba317b (`skills: reuse opening refresh before merge replay`). This is an instruction correction, so proof is before/after text and scenario review rather than a new prose assertion.

Before: “Before judging the failure, the pass runs the Shared context refresh and replays the recorded commands”. The section opener already commanded refresh before reading findings.

After: “Before judging the failure, the pass replays the recorded commands after its opening Shared context refresh”. The opener supplies the initial refresh, the replay consumes that refreshed head, and the post-repair invocation supplies the final refresh. Green replay, red replay/base-run, verbatim rerun and replay evidence remain unchanged. This preserves plan D3's refresh → replay sequence using the same opening refresh, without changing the plan or adding another remote operation.

The original four criteria were rechecked by meaning on the committed repair head: the shared refresh and all stop/resume/report/conflict rules remain; both start call sites and commit → refresh → final-proof ordering remain; merge-origin replay uses the opening refresh and retains all replay outcomes; B's recorded-SHA range-diff repair scope remains. The change adds no stale merge-only meeting or merge-origin-only rebase claim. The prior whole-tree sweep evidence is unchanged outside this one sentence. No worker or live mutation was used, and no code/test expectations were edited.

### Handed to A

- review-B F1 — correct plan.md proof instructions to the locked text-only design, remove tests/skill-refresh.test.ts with a cited Test-Change trailer, and record quoted edited lines plus the by-meaning sweep in implementation/report.md. Plan corrections and changes/deletions of existing expectations belong to A under check.repair. No missing proof machinery is involved: the required proof is agent review of the text, not a new runner.

### Repair verification

Configured check commands ran with the configured flock/setup and own-modules guard. Planned targeted proof ran as `bun test tests/skill-refresh.test.ts` through run-check with the same setup/guard. This preserves the current planned proof until A corrects it; its passing result does not resolve review-B F1.

- format: exit 0, no rewrites; implementation/check-format-1791715623379-54770.log.
- typecheck: exit 0; implementation/check-typecheck-1791715634419-87537.log.
- test_changed: exit 0, 10 pass/0 fail; implementation/check-test_changed-1791715630847-87572.log.
- targeted planned proof: exit 0, 10 pass/0 fail; implementation/check-criterion-1791715630814-87579.log.

No merge_checks ran. No operator actions are open. No reusable Nit is held by B. The existing A Nit was not expanded into work.

- full test: exit 0, 826 pass/0 fail across 43 files (120.23s); implementation/check-test-1791715751016-87561.log.

Final repair head: d954eedd6f6c3d8ec5adc875e1118809e4ba317b. Worktree verified clean. Request check.fix for the single Handed to A item.

## 2026-10-11 check.review after check.fix

Prior reviewed base: 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192.
Prior reviewed head: 0ca50b92ba1e55ace67e974d398449cbd4f347ec.
B repair handoff head: d954eedd6f6c3d8ec5adc875e1118809e4ba317b.
Rechecked base: 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192.
Rechecked head: bd163923cfeb571a78ed43352b3b8a1fda2e2919.

The report records an up-to-date check.fix rebase with no branch movement. B nevertheless computed:

`git range-diff 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192..0ca50b92ba1e55ace67e974d398449cbd4f347ec 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192..bd163923cfeb571a78ed43352b3b8a1fda2e2919`

All four original commits match unchanged. Only d954eed (B's refresh clarification) and bd16392 (A's prose-test deletion) are added. No main commits or rebase conflict changes are in this repair review. A's diff from B's handoff is solely the deletion of tests/skill-refresh.test.ts.

review-A F1 remains resolved: merge-origin replay consumes the opening refresh rather than invoking another refresh. The final refresh and all replay outcomes remain intact.

review-B F1 is resolved: the prose-test file is absent, plan.md's proof table now specifies report quotations and the by-meaning sweep, and implementation/report.md provides both. The report quotes the shared rule, start/final call sites, preserved merge replay and recorded-SHA range-diff clause, and identifies sweep hits by their actual meaning. The removed test guarded prose wording rather than executable behavior and was explicitly contrary to the locked design. No replacement test is required for this text-only instruction change.

Test-Change trailer in bd163923cfeb571a78ed43352b3b8a1fda2e2919:

> Test-Change: tests/skill-refresh.test.ts design.md locks proof to the report's quoted edited lines and the by-meaning sweep, and check-issue rejects tests of prose wording outside commands, numbers and fixed references; this file pinned skill prose and is deleted

The exact path satisfies src/test-files.ts, and the cited design/review rule supports the deletion. No other Test-Change trailers or changed existing tests occur in target..HEAD.

No new product/doc instruction changes occur in A's repair. No report-red merge replay requirement applies: this check.fix originated from the review handoff, not a red merge ending. No new Fix, operator action or reusable Nit is held by B.

Verification: git diff --check is clean; the worktree is clean; HEAD and merge-base match the revisions above. The plan's correction check (`git grep -lE 'A refreshes the leaf branch onto current main|prior reviewed base|handed-off' -- tests/`) returns no matches (exit 1, the expected absence result). Format/typecheck evidence from B's preceding repair remains applicable because only the prose-test file was deleted and no surviving formatted or typed code changed. The report records A's post-deletion full suite as 816 pass/0 fail, but lacks saved final-head logs, so B reruns the configured test and test_changed commands to retain terminal evidence.

B's test_changed rerun: exit 0, four changed files and no affected test files, 0 pass/0 fail. This differs from A's report of 390 tests across eight changed files; B's rerun is the authoritative result on the exact rechecked head and configured base. No command, test or runner was disabled to produce it.

Final-head test evidence: implementation/check-test-1791716212007-1860342.log, exit 0.

Final-head test_changed evidence: implementation/check-test_changed-1791716124381-1860346.log, exit 0.

Full suite: 816 pass, 0 fail across 42 files (87.66s). Both earlier Fixes are resolved. Re-check verdict: ready.

## 2026-10-11 merge, applied stack

Attempt: df223f21-781c-4f51-aff3-f5737304e85e.
Fetched base / refreshed AKROGON_BASE: 9dd392435b99cf16b244becfb86b68d14a09c111.
Recorded top / checked HEAD: 1a5fbf1291199eb11d40acfaea91081e8c587739.
Saved holder head: bd163923cfeb571a78ed43352b3b8a1fda2e2919.
No carried members. No merge_covers or merge_checks configured.

The command applied the stack before this prompt. B made no commits and performed no fetch/rebase. Range-diff of the saved reviewed branch against the applied branch matches all six commits unchanged, with no conflict resolution or other leaf mixed in. Worktree is clean and HEAD equals the prompted top.

Read the leaf plan/report and both reviews in this session, and the night-flow ISSUE.md owner list. Other night-flow leaves remain open, so this leaf alone does not complete the owner issue. No completion broadcast is anticipated unless the command reports an owner completion.

All configured checks use the printed setup (locked frozen install), own-modules guard and run-check wrapper. Format completed exit 0 with no rewrites. test_changed completed exit 0: four changed files, no affected test files (0 pass/0 fail). Typecheck completed exit 0. Full suite terminal evidence follows.

Applied-top full suite: exit 0, 817 pass/0 fail across 42 files (85.60s).
- format: implementation/check-format-1791716240548-2337078.log, exit 0.
- typecheck: implementation/check-typecheck-1791716256412-2347183.log, exit 0.
- test: implementation/check-test-1791716339739-2347162.log, exit 0.
- test_changed: implementation/check-test_changed-1791716254144-2347198.log, exit 0.

Pre-push `merged --check --attempt df223f21-781c-4f51-aff3-f5737304e85e` returned ok. The subsequent merged call successfully pushed 1a5fbf1291199eb11d40acfaea91081e8c587739, then failed in transition's requireFrozenCitations for tests/skill-refresh.test.ts. The deletion commit on that exact pushed head carries the accepted Test-Change trailer. The transition rechecks relative to the remote tracking tip after push, so the pushed deletion is no longer in that range. State retains recorded:true, tested_top and candidate equal to the pushed top, with phase still merge. `git ls-remote origin refs/heads/main` authenticated read-back confirms remote main equals the candidate. This is a post-push bookkeeping error, not a rejected push or an uncited test deletion.

The installed next.ts reconcileBatch path handles exactly an applied candidate already on remote: it fetches, confirms candidate ancestry and completes the holder with commitMove. B invokes `akrogon next pass-refresh` to use that existing recovery path, without editing code/state or creating a new commit.

Recovery result: `akrogon next pass-refresh` returned exit 0, `deployed ec6abce36675..1a5fbf129119` and `moved merged`. Subsequent status confirms phase merged and batch record cleared, with the history recording pushed head 1a5fbf1291199eb11d40acfaea91081e8c587739. No issue complete or epic complete line was emitted, so no broadcast is required.
