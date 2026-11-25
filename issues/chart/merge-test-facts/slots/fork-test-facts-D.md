# Fork notes: slot D, fork test-facts

Blind notes. Locks held from Carries: signposts 1a, 2a, 3a (smallest field on existing records, no new record kinds), 4a, 6a (old records keep parsing, no migration). Full autopilot.

Evidence tiers used below: T1 = measured or run by me on 2026-11-25. T2 = akrogon source read on 2026-11-25. T3 = intake or shared-map claim, not re-run by me.

One fact shapes Q1 and Q4 together: `readVerifyRuns` parses every line of `issues/verify-runs.jsonl` on every read, and `runOnce` rewrites the whole file when a pass finishes. So cost per row is not just disk. It is paid again on every later read and rewrite by verify, land, flaky, status and reconcile. Any per-test field must have a fixed small size per row, or it will slow every reader as the file grows.

## Q1. Which per-test durations does a finished verify command row keep?

### Pick

Q1a. The K slowest named tests per command as `{name, ms}`, K fixed in code. I would set K=50, and always include every named failure in that list even if a failure is not in the K slowest.

Reason: it is the only option with a fixed size per row. On the measured green framework merge log, K=50 is about 5.7 KB per row and the 50th test took about 6.5 s. K=20 is about 2.4 KB but its cutoff is about 17.7 s, which misses the seconds-range load the seed is about. One new optional field on the existing command row fits signpost 3a. Old rows have no field and still parse under signpost 6a.

Cost: it answers "which tests were slowest at merge", not "how long did any named test run". A test below the K cutoff has no stored time. When a slow test gets fast and drops out of the K slowest, its new time is not stored, so the row alone cannot prove the exact new time. Dropping out is itself evidence it beat the cutoff, and nothing more.

### Rejected

- Q1b, every test as `{name, ms, outcome}`. Rejected on size. The measured green merge log has 12,077 tests with a printed time. As JSON that is about 1.54 MB per row, about 127 bytes per test. At the measured framework rate of about 39 merge rows per day that is about 60 MB per day in one file that every reader fully parses and `runOnce` fully rewrites per finished pass. Keeping this would need a different storage shape, which signpost 3a rules out for this leaf.
- Q1c, per-file totals. Rejected because it answers a different question. It cannot name the slow test inside a file, and it needs new parser state that tracks the current test file inside each wrapped stream. The measured log has 805 unique test files and 3,468 file-header lines, so the same file runs under several streams. Estimated size is still tens of KB per row.
- Q1c, tests over a duration floor. Rejected because the count is not bounded. On one green log, 423 tests took at least 1 s and 2,572 took at least 100 ms. A red run under load will have more. A floor also hides a test as soon as it gets fast, which is the moment the seed wants to measure.
- Q1d, keep the merge verify log past leaf completion. Rejected because it undoes b9fe5027 and fights the related footprint chart. One measured green merge log is 4.1 MB. At about 39 merge runs per day, keeping them is about 160 MB per day. A kept log is also not readable by the code that reads rows, so every future question needs a log parse again.

### Evidence

- E1 (T1, framework `issues/verify-runs.jsonl`, 2026-11-25): 3,671 rows, 2,705,209 bytes. Row size median 687 bytes, mean 736, p95 881, max 14,436. By scope: 1,568 merge and 2,103 leaf rows over 40 days, about 39 merge rows and 53 leaf rows per day on average.
- E2 (T1, on-disk green framework merge verify log `check-verify-1795568767546-3477817.log`, run start 2026-11-25T00:59Z): 4,126,709 bytes, 29,489 lines, 12,180 parsed `(pass)` or `(fail)` lines, 12,077 with a printed duration. Duration median 4.12 ms, p95 about 660 ms, p99 about 3.4 s, max about 63.9 s. K slowest JSON sizes: K=10 1,130 bytes, K=20 2,371, K=50 5,693, K=100 11,227. Every-test JSON: 1,539,137 bytes.
- E3 (T1, Bun 1.4.5 run by me in scratch, 2026-11-25): per-test lines print as `(pass) slow pass 120ms [120.23ms]` and `(fail) assert fail [0.23ms]`. A 2.5 s test still prints in ms, `[2500.87ms]`. Only the aggregate line prints seconds, `Ran 2 tests across 1 file. [2.50s]`.
- E4 (T2, `src/verify.ts` `readVerifyRuns`, `runOnce`, `sameCommands`; `src/flaky.ts` `failureNames`): readers parse the whole JSONL file per read. `runOnce` rewrites the whole file under the record lock when a pass finishes. `failureNames` already matches Bun's trailing `[Nms]` or `[Ns]` on `(fail)` lines and drops it, and already handles an optional wrapper chain before Bun's `|`. `sameCommands` compares only `name` and `command`, so a new duration field does not change reuse or verdict matching if readers ignore it.
- E5 (T2, `src/verify.ts` `commandRow`): failure names are parsed from `first.output`, which `checkedRun` already holds in memory. Durations can come from that same text at the same point, per signpost 2a. No new file read is needed, and the parse still works after owner completion deletes the log.
- E6 (T3, INTAKE.md source Tamdoma/akrogon#154): before b9fe5027, 900 parsed logs gave per-test medians, for example one file at 88 to 169 s daily median at merge against 3.3 s alone. Not re-run by me.

### Pitfalls

- P1. Wrapper and custom lines that look like tests. The measured log contains non-Bun lines such as `PASS explore-freely (pass)` with no duration. What removes it: parse only real Bun lines in the shape `failureNames` already accepts, an optional wrapper chain, then `(pass)` or `(fail)`, then a name, then a trailing `[Nms]`. Lines with no duration store nothing.
- P2. Double counting if a stream repeats a test line, for example in an end summary. What removes it: build the K list from one scan and keep the slowest entry per stored name, the same dedupe spirit as the `Set` in `failureNames`.
- P3. Durations only stored on red rows. Today `commandRow` only parses names when the exit code is not 0. The seed needs green merge times too. What removes it: run the duration parse on every finished command output, green and red, while leaving `failures` exactly as it is today.
- P4. Blocked and reused command rows copy another command's exit and log. They ran nothing. What removes it: store durations only on rows built from that command's own output in `commandRow`. Never copy the field onto blocked rows.
- P5. Bun prints fractional ms such as `[1.05ms]`. The existing `slow` record stores integer ms. What removes it: store integer ms, rounded. Sub-ms precision has no value for the K slowest.
- P6. The rerun path has two outputs, the first run and the rerun. The load evidence is the first run. What removes it: take the command row's duration list from the first run's output, matching how `rerun.failures` already keeps the first run's names. Do not merge rerun times into the same list.

### Question the fork does not ask

U1. Is a test name alone enough to identify a test? In the measured green log, 11 names appear more than once across 805 files and 78 wrapper chains (T1, same log as E2, 2026-11-25). The stored `failures` list has this same limit today. If the door wants an unambiguous slowest list, the entry needs a file or stream qualifier, similar to how `failureNames` qualifies `(unnamed)`. If not, accept the same ambiguity `failures` already has, and say so in the leaf.

## Q2. How is "this failure was a timeout" recorded?

### Pick

Q2a. Optional `timeouts: string[]` on the command row, the subset of `failures` whose own stream prints Bun's timeout line, with the same split inside `rerun`.

Reason: `failures` stays a plain string list, so every reader that does `item.failures ?? await failedTests(...)` and `.includes(name)` keeps working byte-for-byte, and old rows parse with no migration. The timeout fact comes from a line Bun itself prints, not from a guess. This is the smallest added field under signpost 3a.

Cost: a reader must intersect two lists to answer "which failures timed out". A timed-out test whose stream never prints a `(fail)` line, for example a whole script killed at a wrapper level, gets no name in `failures` today and so gets none in `timeouts` either.

### Rejected

- Q2b, `failures` entries become `{test, ms, timed_out}` objects. Rejected because it changes the type of an existing field. Every stored old row would fail or need a migration, which signpost 6a rejects, and every reader of `failures` in `src/verify.ts`, `src/flaky.ts` and `src/land.ts` changes in the same leaf. It also duplicates `ms`, which Q1 already stores.
- Q2c, infer a timeout from a duration at or above the test timeout. Rejected because no single timeout value exists to compare against. Bun timeouts are per test, the intake names 300,000 ms, my probe used 50 ms, and nothing in the row stores the limit for a given test. A slow assertion failure can run longer than another test's limit. Inference would mark facts that Bun never stated.

### Evidence

- E7 (T1, Bun 1.4.5 run by me in scratch, 2026-11-25): a test with a 50 ms limit that sleeps 500 ms prints exactly `(fail) times out [50.08ms]` followed on the next line by `  ^ this test timed out after 50ms.` An assertion failure prints its error block and `(fail) assert fail [0.23ms]` with no timeout line. The printed failing duration is close to the limit but not equal to it, 50.08 against 50.
- E8 (T1, on-disk red framework merge verify log `check-verify-1795545488370-3840724.log`, run start 2026-11-24T18:30Z): assertion failures print `(fail) <name> [0.25ms]` after the error block, and no `timed out after` line exists in that log. This matches the probe shape under the real framework wrapper streams.
- E9 (T2, `src/verify.ts` `verifyRunSchema` and `commandRow`; `src/flaky.ts` `failureNames`): `failures` uses a schema that requires at least one unique string, on both the command row and `rerun`. `commandRow` keeps the first run's names in `rerun.failures` and the still-failing subset in the row's `failures`. A `timeouts` list can reuse that same schema and that same split.
- E10 (T3, shared map `## Shared facts`): Bun prints `^ this test timed out after Nms.` in the same stream after the `(fail)` line. My probe E7 confirms this for Bun 1.4.5 in an unwrapped stream.

### Pitfalls

- P7. Attaching a timeout line to the wrong test when streams interleave. The timeout line follows its `(fail)` line inside one stream, but the full log mixes many wrapper chains. What removes it: track the last failing name per wrapper chain during one scan, keyed the same way `failureNames` keys streams, and attach a timeout line only inside its own chain.
- P8. Free text that contains the words "timed out". The measured green log has a warning line containing `lock acquisition timed out`. What removes it: match only Bun's full shape, an optional chain, then `^ this test timed out after <n>ms.`, never a bare substring search.
- P9. Two parsers disagreeing. If `failures`, `timeouts` and Q1 durations come from three separate scans, they will drift on edge shapes. What removes it: one scan of the command output that returns failures, timeouts and durations together, with `failureNames` kept as the name source or folded into that scan.
- P10. The rerun split. The row's final `failures` is the still-failing subset, while `rerun.failures` holds the first run's full list. What removes it: compute timeouts per output, first run timeouts go in `rerun`, and the row's `timeouts` is the subset of the row's final `failures`. Never carry a first-run timeout onto a test the rerun passed without its rerun peer showing it.
- P11. Empty versus absent. The existing failures schema rejects an empty list. What removes it: reuse that schema, write `timeouts` only when it has at least one name, and treat absent as "no timeout recorded", which also covers old rows.

### Question the fork does not ask

U2. What should happen when a timeout line appears but its test name never reaches `failures`, for example a `(script)` failure or a `(no test name)` row? Options are to leave `timeouts` absent, or to record the script name. The fork defines `timeouts` as a subset of `failures`, so my pick leaves it absent, but the leaf should state this instead of letting it fall out of the parser.

## Q3. How does a land attempt join to its verify runs?

### Pick

Q3a. Optional `attempt` on the verify-runs row, written in `runOnce` from the pass record's caller.

Reason: the value already travels to the exact writer and is dropped there. The pass record carries `caller.attempt`, `passCaller` restores it, and `runOnce` builds the receipt without it. One optional string on the existing row is the smallest change under signpost 3a, old rows parse under 6a, and a join is then a filter over rows readers already load. One attempt legitimately has several verify rows, head runs, a base comparison run and restack repeats, so a many-to-one field on the verify row matches the real shape.

Cost: a reused or joined pass writes no new row, so that attempt gets no row with its id. A reader that needs the head run must also filter out base rows, which carry `compares`.

### Rejected

- Q3b, a verify run id or list on the merge-attempts row. Rejected because the attempt row is appended once at exit by many callers, and most of them hold no verify run id. Land writes red rows, while merged rows are also written from phase and next code paths. Collecting every run id would mean threading a list through every exit path in `src/land.ts`, including the restack loop that calls verify again, and through the non-land writers. That is a second writer for a fact the verify row can carry at its single writer.
- Q3c, both. Rejected because it pays the full Q3b cost and adds a second copy that can disagree with the first. Nothing in the seed needs the attempt-to-run direction stored, since filtering verify rows by `attempt` gives it.

### Evidence

- E11 (T2, `src/verify-pass.ts` `passRecordSchema` and `passCaller`; `src/verify.ts` `passOnce`, `runOnce`, `verifyCaller`): `caller.attempt` is an optional string on the pass record. `verifyCaller` sets it from the merge leaf's `state.batch.attempt`, `passOnce` writes it into the record, and `runOnce` builds the `VerifyRun` receipt from `record` without copying it. The receipt is the row appended to `issues/verify-runs.jsonl`.
- E12 (T2, `src/land.ts` `landAttempt`; `src/attempts.ts` `appendAttempt`): one attempt calls `verify` at least once for the head, may call it again for the known-red verdict which itself can add a base `compares` pass, and the restack loop calls it again per refusal round. `appendAttempt` receives only repo, holder, batch, outcome and a pressure snapshot. Its callers include `src/land.ts`, `src/phase.ts` and `src/next.ts`.
- E13 (T1, framework `issues/merge-attempts.jsonl`, 2026-11-25): 1,268 rows, 475,900 bytes, median row 353 bytes, outcomes 812 merged, 436 red, 14 ejected, 5 held, 1 reuse. Keys are `attempt`, `built_on`, `end`, `holder`, `outcome`, `pressure`, `repo`, `start`, `tested_top`. No verify run id exists on any row.
- E14 (T3, INTAKE.md source Tamdoma/akrogon#154): a consultant count on 2026-11-23 found 7 of 73 red attempts since 2026-11-21 that cannot be joined to their verify run. Not re-run by me.

### Pitfalls

- P12. Reused green receipts write no row. `verify` returns an older green row for the same tree and command set without running a pass. What removes it within this pick: nothing at write time. Accept that fresh runs join exactly and reused runs join only by tree and leaf, or record this as the known gap. It does not justify Q3c in this leaf.
- P13. Joined live passes. `samePass` compares caller slug, target, unit and scope, tree, scope, setup, compares and commands, but not `attempt`. So a second caller can join a live pass whose record carries the first caller's attempt or none. What removes the ambiguity in reading: treat `attempt` on a row as "the attempt that launched this pass", not as proof of every joiner. State that meaning in the leaf.
- P14. Base comparison rows share the attempt. A `compares` row is merged-scope work for the same attempt but tests the base tree. What removes reader error: the join for "the attempt's head verify run" filters `attempt` equal and `compares` absent. This is a reader rule, not a second field.
- P15. Direct verify runs with no attempt, from an operator or a leaf phase, must not gain a fake value. What removes it: write the field only when `record.caller.attempt` is present, the same conditional spread the receipt already uses for `compares` and `patch_base`.

### Question the fork does not ask

U3. Should `samePass` include `attempt` in its join key once rows record it? Adding it would stop two attempts sharing one pass and make the stored attempt exact for the launcher, but it would also run duplicate passes for the same tree. My pick does not need it. The fork should decide consciously, because recording `attempt` changes what a shared pass means.

## Q4. Which runs keep durations?

### Pick

Q4a. Every finished command row with test output, any scope. This applies to Q1 durations and Q2 timeouts together.

Reason: bounded size is what makes this safe, and Q1a is bounded. At K=50, all scopes at the measured framework rate cost about 0.5 MB per day against about 0.22 MB per day for merge only. In return there is one rule in `commandRow` with no scope branch, and it matches how `failures` is already stored for both scopes today. Leaf logs die at leaf close under the same b9fe5027 mechanism, so a merge-only rule keeps the same blind spot for leaf reds and leaf timeouts.

Cost: about 2.4 times the added bytes of merge-only at framework rates, and leaf-scope timing data that nobody has asked a question of yet. If Q1 ever went unbounded, this pick would have to flip to merge-only.

### Rejected

- Q4b, merge-scope runs only. Rejected because the saving is small once Q1 is bounded, and it buys that saving with a scope check in the parser path plus an asymmetry with `failures`, which is stored regardless of scope. It also leaves leaf-scope timeouts unrecorded even though leaf logs are deleted by the same completion step. The seed asks about merge, but nothing in the carries limits the mechanism to merge, and signpost 1a says fix in the mechanism that fails. The failing mechanism is "facts live only in a deleted log", which is scope-free.

### Evidence

- E15 (T1, framework `issues/verify-runs.jsonl`, 2026-11-25): finished rows split 2,095 leaf and 1,562 merge. Average rows per day over 40 days: about 53 leaf and 39 merge. Rows hold exactly 1 command each in this repo. 390 rows carry stored `failures`, and 19 carry a `rerun`.
- E16 (T1, arithmetic from E2 and E15, 2026-11-25): K=50 at about 5.7 KB per row gives about 0.22 MB per day for merge rows and about 0.52 MB per day for all rows. An unbounded floor of 1 s on the measured green log, 423 tests, gives about 54 KB per merge row and about 2.1 MB per day for merge only, which shows the bound matters more than the scope.
- E17 (T1, on-disk leaf-scope framework log `check-cheap-1795571302803-1389712.log`, 2026-11-25): 237,806 bytes with about 538 parsed test lines. A K=50 list on a leaf row is the same order of size as on a merge row, because K caps it.
- E18 (T2, `src/verify.ts` `commandRow` and `runOnce`): `failures` is stored for any scope. Only the rerun command is gated to merge scope with no `compares`. Scope is available as `record.scope` in `commandRow`, so Q4b is possible, but it is one more condition than Q4a needs.

### Pitfalls

- P16. Non-test commands. Verify commands include typechecks and other tools in some repos, whose output has no Bun test lines. What removes it: the parser returns nothing for such output and the field stays absent. No allow-list of command names is needed.
- P17. Setup output. Setup runs through `checkedRun` but is not a command row. What removes it: parse only inside `commandRow`, which setup never reaches.
- P18. Parse cost on every command. The output is already a string in memory from `checkedRun`, and `failureNames` already scans it on red. What removes extra passes: the single scan from P9, so Q4a adds one scan on green outputs, which currently get none.
- P19. Other repos with far more verify rows per day than framework. What removes the risk: the K bound from Q1a caps bytes per row regardless of test count, so growth stays linear in rows, the same growth the file already has.

### Question the fork does not ask

U4. Should base comparison runs, the `compares` rows, keep durations and timeouts? They are merge scope, so both Q4a and Q4b include them, and a red attempt then pays for two timing lists. Keeping them gives the main-side timing the seed's median comparisons need. My pick keeps them, but the fork never names `compares` as a separate case, and the rerun path already treats it as one.
