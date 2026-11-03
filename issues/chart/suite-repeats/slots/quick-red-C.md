# quick-red: seat C blind notes

Tiers: T1 = measured from live data by me 2026-11-01, T2 = code, skill or git history read 2026-11-01, T3 = inference.

## Q1. Skip the slow test when a quick check is red, and by which rule?

### Pick

Skip, by the `full` rule: run every non-`full` check, and if any is red (or setup failed), record each `full` check as `blocked` without running it. Implement by reusing the existing sequential-to-member blocker (`src/verify.ts:567-575`): treat the checks named in `full` as the blocked tail, the way `merge_checks` already are at `src/verify.ts:765`. `full` already names the expensive checks, is validated against configured names (`src/config.ts:99-101`), and already drives the admission line (`src/run-check.ts:309`, `src/admission.ts:227-253`), so no new declaration or heuristic appears. Repos that declare no `full` (framework) skip nothing. Cost: test failures that coexist with a quick red are discovered one pass later, on the fixed tree. Saving is about 70 to 140 seconds on each quick-red pass, 4 such passes in the four days since 2026-10-26.

### Rejected

- Stop the sequential stage at the first red, after reordering config to format, typecheck, test. It hides the second quick failure, breaking the intake rule that every quick check still runs, and it buys nothing over the `full` partition: quick checks cost about 2 seconds each, so running the remaining quicks is nearly free. Current config order is format, test, typecheck, so a stop-at-first-red rule without the partition still runs test before typecheck.
- Keep running everything (the 2026-10-24 answer). Its stated reason was that a same-tree rerun reuses the green member, so post-red work is wasted only when the fix changes the tree. Measured: zero entries from quick-red runs were ever reused later (see Evidence). Quick-red fixes (reformat, type fix) change the tree by definition, so the post-red test run was wasted in effectively every real case. This fork is the re-measure the operator asked for, and the data reopens it.
- Skip by the literal name `test`, or by a measured-duration threshold. A name hardcodes one repo's config into shared code; a threshold adds a timing rule that can drift. `full` already encodes "this is the slow one" per repo.
- Remove format from `checks` instead (run it as a write-step before commit). It would kill 48 of the 51 quick-red passes at the source, but it changes what the gate proves and is outside this fork's question. With the skip landed, a format red costs about 4 seconds plus setup, so the pressure for it mostly disappears.

### Evidence

- T1, `issues/verify-runs.jsonl` joined to `issues/timings.jsonl` by log filename, read 2026-11-01: 51 completed head runs had format or typecheck red while test executed; their test executions sum 124.6 minutes, median 137s. Since 2026-10-26: 4 runs, 6.7 minutes, median 79s. Format-only red 48, both red 2, typecheck-only red 1. Of the 51, test was also red in 13.
- T1, same join: entries later reused from those 51 quick-red runs: 0.
- T2, verify-waste `forks/receipts.md`, `## Taken` and `## Refined at draft review`: Q2 was not taken on the operator lock "a failing run shows every failure", with the reuse-repays reason and a re-measure after member receipts land. Under my pick every quick failure still shows; only the slow check's result on a tree that must change is deferred.
- T2, blocked entries are already safe everywhere they are read: gate green needs exit 0 (`src/verify.ts:172-174`), known-red skips blocked head and base entries (`src/verify.ts:227`, `src/verify.ts:234`), flaky skips blocked (`src/flaky.ts:31`), the slow alarm excludes blocked from its normal (`src/verify.ts:184-190`). Framework data has 0 blocked entries today because its member runs alone, so this path is exercised only by tests so far.
- T2, quick reds in akrogon can never be known-red-covered anyway: name extraction needs `(fail)` lines (`src/flaky.ts:18-21`), which prettier and tsc output do not produce, and `src/verify.ts:228-229` then refuses coverage. So skipping test on a quick red destroys no known-red route.
- T2, `skills/implement-issue/SKILL.md`, `## Shared context` proof order: seats already must run every checks command before the first slow run by hand. Verify's internal order (test before typecheck) is the odd one out.

### Pitfalls

- Deferred test discovery: 13 of 51 quick-red passes also had a red test; those seats now fix the quick check, rerun verify, and only then see the test red. Removed by nothing, and total test executions still do not rise: the deferred run replaces the wasted one. Worth one line in `skills/merge-issue/SKILL.md`, `### Shared endings`, so B does not read a blocked test entry as a test result; the receipt already names the blocker.
- Partitioning reorders execution: `full` checks move after all non-`full` checks regardless of config order. If a future quick check consumes a `full` check's output, it breaks silently. Removed by nothing in code; the trigger to name is any new check that reads another check's artifacts. No such pair exists in either repo's config today.
- A future slow check added without a `full` entry always runs, recreating the waste. Removed only by habit: `full` already has an independent reason to be declared (the admission line), so a slow undeclared check also misbehaves there and gets noticed.
- Old rows keep order format, test, typecheck; if the implementation reorders `verifyCommands` output, `sameCommands` (`src/verify.ts:127-133`) stops matching every old receipt once. That is a one-time rerun cost, and both the fast path and the gate refuse together, so no disagreement opens.

### Extra question

Should `issues/config.yaml` also list typecheck before test, so seats running the printed `checks` commands by hand meet cheap-first order without relying on verify's internal partition?

## Q2. Per-command reuse (`reuseSource`): stay or delete?

### Pick

Delete the producer: `reuseSource` (`src/verify.ts:203-210`) and its two call sites (`src/verify.ts:549`, `src/verify.ts:578`), so `runOnce` executes every command it records. Keep the `reused` field in the receipt schema and keep every consumer guard that skips reused entries (flaky, slow alarm, newRedUnits), because `issues/verify-runs.jsonl` already contains reused entries and the schema is strict (`src/verify.ts:60-99`); removing the field or the guards would break parsing or let old reused rows enter the slow normal. Reason: reuse has repaid almost nothing. Cost: same-tree reruns re-execute green commands, typically 4 seconds (format plus typecheck); the expensive case, reusing a green test entry, has never fired in either repo's data.

### Rejected

- Keep it because it is already built and tested. The carrying cost is not the function; it is that every consumer of a receipt row must reason about entries that did not run in that pass. The merge-reuse fork just spent rounds on exactly that (slow eligibility, flaky skips, known-red base rules). Code that fires six times in its life should not tax every verify change.
- Keep it for framework's planned member split (verify-waste `## Pending steps`). Framework's live receipts are single-command rows, where per-command reuse cannot fire at all because whole-row reuse answers first; 0 reused entries in 1,681 completed head runs. When the split lands, reuse can return with its own criterion tests; fbac86c6 and 6a054950 preserve the design in history. Building for a step that has sat pending since 2026-10-24 is the complexity the operator keeps asking to remove.
- Keep it only for known-red base passes. Measured compares-run reuse in akrogon is 2 entries, both 2-second commands. A scope-limited reuse is more rule, not less.
- Delete the schema field and all guards too. Breaks on existing rows, per above; the honest deletion is producer-only, with the field becoming legacy parse surface.

### Evidence

- T1, `issues/verify-runs.jsonl`, read 2026-11-01: completed head runs hold 6 reused entries ever (format 3, typecheck 3; all since 2026-10-26, when the test command text changed and only siblings could reuse). Test: 0. Including compares runs: 8 total (format 4, typecheck 4).
- T1, framework `issues/verify-runs.jsonl`: 1,752 runs, rows are only `(cheap)` or `(verify)`; reused entries 0, blocked 0.
- T2, `git show fbac86c6` (2026-10-25) added reuse under verify-waste Q1, and `git show 6a054950` (2026-10-25) already had to fix it once, dropping the log-exists guard so a reused entry can point at a log that evidence packing moved. A mechanism that needed a same-day pointer fix and then fired 6 times is not carrying weight.
- T2, at least seven tests exist mainly to pin reuse behavior (`tests/verify.test.ts:1084`, `:1122`, `:1170`, `:1216`, `:1243`, `:1392`, `:1462` by title), including the one expensive scenario (sibling reuse after a command-text change, `:1216`) that live data shows firing only for 2-second commands. Deleting reuse deletes most of these.
- T2, the taken merge-reuse one-row rule does not need reuse to hold: a fresh pass executing every command writes the same whole row, just slower by the greens' runtime.

### Pitfalls

- The one real loss: a same-tree rerun where only a quick command's text changed must now re-execute test (about 70s) instead of reusing its green entry. Measured frequency for test in the whole window: never. Removed by nothing; accepted, and it is the trigger to revisit if config command texts start churning.
- Known-red base passes re-execute green base commands. Base passes are rare (known-red is invoked per red leaf, not per leaf) and the measured reuse there was 2 quick entries. Accepted.
- Leaving `reused` in the schema invites a future reader to ask who writes it. Removed by one comment at the schema field naming it legacy, or by the plan noting the field is parse-only; deleting the field becomes possible only if verify-runs history is ever rotated, which nothing does today.
- Interaction with Q1: with reuse gone, a quick-red pass followed by an unchanged-tree rerun (a seat ignoring the red) runs test fresh rather than reusing. That is the desired direction; blocked entries never sourced reuse anyway (`src/verify.ts:172-174` needs exit 0 and blocked entries carry the blocker's nonzero exit).

### Extra question

Does `issues/verify-runs.jsonl` ever get rotated or pruned in either repo? If yes, the `reused` schema field and its consumer guards can be deleted in a later leaf; if no, they are permanent parse surface and the brief should say so.

## Q3. Proof, without going overboard

### Pick

Two test changes plus the normal leaf verify. First, one new verify test with checks `quick-red` (exit 1), `quick-green` (exit 0), and a `full` slow command that writes a marker file: verify exits 1, the row shows `quick-green` executed, the full entry `blocked` by the quick red, the marker absent, and `requireGreenReceipt` refuses. A second pass with the quick red fixed runs the full command and the gate accepts. Second, convert the reuse-pinning tests (`tests/verify.test.ts:1084`, `:1122`, `:1216`, `:1462`) to assert the opposite where cheap (a same-tree rerun re-executes greens and writes no `reused` entries), and delete the ones whose only subject was reuse internals (`:1170`); keep the schema parse test (`:1243`) since old rows must still load. Run `tests/verify.test.ts`, `tests/receipt-gates.test.ts` and `tests/flaky.test.ts`, then the leaf's one `akrogon verify`. After landing, one data check: the next quick-red verify walls in `issues/timings.jsonl` should drop from about 80 to 140 seconds to setup plus about 4 seconds, and blocked test entries should appear in `issues/verify-runs.jsonl`.

### Rejected

- A benchmark harness or timing assertions in tests. Wall assertions flake under host load (the reason several earlier charts exist); the marker-file test proves the skip mechanically, and the savings figure is already measured from live data.
- Live trial leaves in the framework repo. Framework declares no `full`, so the rule cannot fire there; a trial would only re-prove the config. The negative is covered by the unit test's second pass.
- Keeping the reuse tests as documentation of deleted behavior. Tests that pin removed behavior either go red or get skipped; git history (fbac86c6) is the documentation.

### Evidence

- T2, the blocked-entry shape the new test asserts already exists and is already asserted for merge members (`src/verify.ts:567-575` and the member tests behind it), so Q1's proof extends a known shape rather than inventing one.
- T1, the after-landing signal is baselined: 51 quick-red passes with median test execution 137s before 2026-10-26 and 79s since (join above), against format and typecheck medians of about 2s each from the same data.
- T2, `tests/verify.test.ts:1243` ("the receipt schema accepts both old entries and entries carrying a reused source run") is exactly the parse-compat proof the producer deletion needs, already written.

### Pitfalls

- The marker test can ossify the blocked wording or stdout shape. Removed by asserting the row's `blocked` field, the absent marker, the exit code and the gate refusal, not message text.
- Converting reuse tests in place risks a test that passes under both old and new behavior (a rerun that re-executes also turns green). Removed by asserting no `reused` property on the new row's entries and that the quick command's marker or invocation count increments.
- Nobody may notice if the skip quietly stops firing (for example if `full` is emptied from config). Removed by the post-landing data check naming expected blocked entries, not by a permanent monitor.

### Extra question

After the skip lands, should the seat-facing verify output for a blocked full check say what to do next (fix the quick check and rerun), or is the existing `blocked by <name> (<exit>) <log>` line enough for the seats that read it in `skills/check-issue/SKILL.md`, `## check.fix`?

The re-measure the operator asked for on 2026-10-24 is now in: work after a quick red was repaid by reuse zero times and cost 124.6 minutes of test execution on doomed trees, and reuse itself has only ever saved six 2-second commands. Skip `full` checks on a quick red and delete `reuseSource`.
