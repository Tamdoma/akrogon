# fork test-facts notes: slot B

Read 2026-11-25. Sources: akrogon src/ (verify.ts, verify-pass.ts, run-check.ts, flaky.ts, attempts.ts, land.ts, timing.ts, config.ts, state.ts), framework issues/verify-runs.jsonl (3666 rows, 2,705,139 bytes, first row 2026-10-14), issues/merge-attempts.jsonl (1268 rows), surviving merge verify logs under issues/open/ (framework), akrogon issues/chart/worktree-cleanup/leftovers-verify/check-test-*.log, framework issues/chart/merge-suite-truth/slots/map-A.md, verify-load-flakes and unnamed-verify-reds chart slots quoting Bun timeout lines.

## Measured facts the picks rest on

- Bun test lines in the framework merge log (bun >=1.3.4 per package.json, observed in logs 2026-11): pass `(pass) <chain> > <title> [<ms>ms]`, fail `(fail) <title> [<ms>ms]` with ms even at 134 s (`[134184.35ms]`), timeout annotation as the next line of the same stream `  ^ this test timed out after <n>ms.`. End-of-run summary repeats each fail line after a ` N tests failed:` header, annotation included — observed verbatim duplication at lines 26323/26621 of one log. Nested output is stream-prefixed `lane | script | <bun line>`.
- One framework merge verify command holds ~6,849 unique tests (12,038 title occurrences in one log; average title 90 chars, max 345). Compact `{name,ms,outcome}` JSON for all of them is ~870 KB per row. K slowest: top-5 ≈ 624 bytes, top-20 ≈ 2.4 KB. Tests ≥1 s in that run: 425 (≈57 KB with outcome).
- verify-runs.jsonl is rewritten whole inside the receipt lock on every completion (`verify.ts` runOnce finally block: read all rows, write temp, rename). Completed runs/day in framework: 15–218 over the last 10 days (median ~140). File is 2.7 MB after 42 days. Current rewrite traffic is already roughly completions × file size ≈ 150 × 2.5 MB ≈ 375 MB/day.
- Readers that parse the whole file per pass: `readVerifyRuns` in reconcile.ts (each reconcile pass), land.ts (redRunId + taken8Trigger per red attempt), status.ts, flaky.ts, verify.ts itself (the completion rewrite). Cost is proportional to total file bytes.
- Median row 688 B; merge head rows median 712 B, max 14.4 KB (a rerun row with failure names). Merge head rows/day in framework: 34–92 on busy days.
- One merge run = one command row in framework (merge_checks: verify only; cheap is merge_covers). akrogon's own repo runs 3 commands (format/test/typecheck), test alone 872 tests.
- Timeout annotation never implies the printed ms equals the limit: observed `[5100.17ms]` vs limit 5000, `[30660.12ms]` vs limit 30000, `[134184.35ms]` vs limit 120000 — overshoot of 60–14000 ms.
- The verify pass caller already carries `attempt` end to end: land.ts passes `--attempt`, verify() → verifyCaller finds the leaf by `state.batch.attempt`, leafFields adds `attempt` to the LeafTarget, passOnce writes it into the PassRecord caller (`caller.attempt` in verify-pass.ts schema). runOnce builds the VerifyRun receipt fresh and drops it — the only break in the chain. Confirmed: zero rows in verify-runs.jsonl carry `attempt`.
- Join feasibility today: joining attempt rows to verify rows by holder+time window leaves 93 of 1268 attempts unjoined, 21 of them red (measured over the full framework files). Some are structurally unjoinable (gate refusals, conflicts, push errors produce no fresh verify row), but a red-verify repair exit always has `exit.run` in state.yaml's merge_exit — a field that dies with the leaf.
- merge-attempts.jsonl is append-only (appendAttempt); verify-runs.jsonl is whole-file-rewrite. The attempt row is written once at attempt end, including crashed-end paths — but not at all when the land service itself dies.
- A rerun row stores the first run in `rerun` and the rerun's outcome at top level (verify.ts commandRow comment). Failures already differ per leg.

## Q1 — which per-test durations the row keeps

Pick: 1a — the K slowest named tests per command as `{name, ms}`, failures always included regardless of rank, K fixed in code.

Reason: it is the only option whose cost is bounded per row (~0.6–2.4 KB for K=5–20 against the framework's real test population) while still answering the seed's actual questions. The merge-suite-truth reading (which reds were timeouts, how long replay-consumer tests run at merge) is a slow-test question: the tests it names run 88–169 s at merge, deep inside any top-K. What the option cannot answer is "how long did a fast test run" — but that question has no consumer in the seed; absence from the list after the load fixes land is itself the proof the chart planned to read (a test that dropped from 169 s to under the K cutoff no longer costs merge time). Cost: the fast-failure duration hole — a failure that is neither slow nor a timeout keeps only its name, as today; and a name-only `{name, ms}` collides when two lanes run the same title (observed: the same title repeats across lane streams in one framework log). The entry should qualify the title with its innermost stream token the way `failureNames` qualifies `(unnamed)`, or accept the collision with a max-wins merge; either way it is a parser decision, not a schema one.

Rejected:

- 1b (every test `{name, ms, outcome}`): the cost kills the mechanism, not the budget. ~870 KB per framework merge row, ~50 merge completions/day → +45 MB/day into a file that is rewritten in full on every completion of any scope. Within weeks the file is hundreds of MB and the rewrite traffic (already ~375 MB/day) grows by two orders of magnitude, and every reconcile/land/status/flaky read parses that. The fix would recreate the deleted-log problem inside the ledger. Even the framework's leaf rows (2075 of 3666) would grow this under 4a.
- 1c (per-file totals, or a duration floor): per-file totals answer the wrong question — the seed's example is a per-test median (`capture-review.test.ts` 88–169 s), and file totals mix dozens of tests, so no test's duration survives. The floor variant is K with a worse failure mode: volume is unbounded exactly when the suite degrades (425 tests ≥1 s in one real run ≈ 57 KB, and a load regression inflates rows precisely when rows are being written most), and a fixed floor can't know future test populations. The map's pitfall (a threshold hides a test once it gets fast) applies to floor and K alike; K caps cost, floor caps nothing.
- 1d (keep the merge verify log): ~4 MB per merge run of uncompressed text kept past leaf close, against the footprint chart's outcome; every reader must parse raw logs again for every question (the regression b9fe5027 removed); and it answers with grep what the row should answer with a field. The footprint chart and this chart both close satisfied only if the needed facts move into the row before deletion — the seed's own framing.

Evidence:
- better-than-training: sizes measured from framework issues/open/satellite-batch-state/.../check-verify-1795566622096-2368929.log (4.0 MB, 2026-11-24/25) — test counts, title lengths, K/floor costs above. Read 2026-11-25.
- better-than-training: verify.ts rewrite-in-lock, readVerifyRuns readers, commandRow rerun shape; framework verify-runs.jsonl row counts and byte sizes measured 2026-11-25.
- better-than-training: merge-suite-truth/slots/replay-cost-A.md and map-A.md — the planned reading is per-test medians at merge for named slow tests. Read 2026-11-25.
- model-knowledge: nothing stronger needed; all load-bearing numbers are measured.

Pitfalls and what removes them:
- Summary duplication double-counts a fail (same line twice). Removed by the same dedup failureNames already applies (Set semantics), taking the max ms per qualified name.
- Bun prints script-level wrappers (`PASS explore-freely (pass)`, `Exited with code 1`) that are not bun test lines. Removed by parsing only the exact `(pass|fail) ... [Nms]` grammar failureNames already pins — the duration scan reuses that match, it does not invent a new one.
- Tests in crashed or filtered streams print no lines, so their absence is silent. Accepted: absence reads as "no evidence", same as today's failureNames `(no test name)` class; no mechanism needed because no decision consumes it.
- K fixed in code invites repos to want it tuned. Signpost 3a/1a answer: one constant, no config surface.

Question the fork does not ask: whether durations belong on the verify row at all, given verify-runs.jsonl is whole-file-rewrite while merge-attempts.jsonl is append-only. Under 1a the volume is small enough that the verify row (where failures already live) is the right home; but if a later round ever reopens 1b-scale capture, the row choice becomes the cost driver and merge-attempts or a third ledger should carry it instead.

## Q2 — how a timeout is recorded

Pick: 2a — optional `timeouts: string[]`, subset of `failures`, split inside `rerun` the same way.

Reason: the timeout fact is already printed explicitly per stream (`  ^ this test timed out after <n>ms.` on the line after the `(fail)` line), so recording it is a parse of fact, not inference. Keeping it as a string subset of `failures` preserves verdict neutrality exactly: `failures` stays byte-identical, every existing consumer (flaky pairing, known-red cover, taken8) is untouched, and old rows keep parsing with no migration (signpost 6a) because the field is optional. The rerun split is required by the existing shape: the rerun's own log holds only the rerun's names, so first-leg timeouts live in `rerun.timeouts` beside `rerun.failures` and second-leg timeouts at top level — anything else misattributes which leg timed out. Cost: the timeout limit `<n>` is not recorded, so once the log is gone the configured limit is unrecoverable per test; nothing in the seed asks for it, and if a chart does, it is one more integer, not a redesign.

Rejected:

- 2b (failures become objects `{test, ms, timed_out}`): rewrites the identity field every verdict consumer depends on. failures entries are compared by string equality in `covered`, `resolvedOnMain`, `newRedUnits`, flaky pairing, and taken8Trigger; changing the type touches all of them, and old rows with plain strings force a union type or a migration — violating signpost 6a for zero added information, since the same fact fits in a parallel optional array. It also entangles Q2 with Q1 (ms on failure entries) so the two questions can no longer be decided independently.
- 2c (infer from duration ≥ timeout): the evidence directly falsifies it. Observed overshoots: 5100 ms against a 5000 limit, 30660 against 30000, 134184 against 120000 — the printed ms is wall time including teardown, so no threshold separates timeouts from slow assertion failures, and per-test timeouts vary (5000/30000/70000/120000 all present in framework package.json). Inference manufactures false timeouts exactly in the population the seed wants to measure (slow tests under load). The explicit annotation exists; inference is strictly worse than reading it.

Evidence:
- better-than-training: timeout line format and duplication observed in framework merge logs (lines quoted in unnamed-verify-reds/slots/map-B.md, verify-load-flakes/slots/map-C.md) and directly in check-verify-1795566622096-2368929.log, 2026-11-25.
- better-than-training: flaky.ts failureNames regex and stream-qualification logic; verify.ts commandRow rerun semantics. Read 2026-11-25.
- better-than-training: overshoot measurements in verify-load-flakes/slots/map-A.md (T2: 5119 ms against 5000). Read 2026-11-25.

Pitfalls and what removes them:
- The annotation line repeats in the end-of-run summary with the fail line, so a naive scan double-counts. Removed by Set semantics on the names, same as failureNames.
- Stream interleaving could in principle separate the `(fail)` line from its `^` line. Observed never in the real logs (the pair is atomic per stream in every quoted instance); the parser pairs an annotation only with the immediately preceding fail line of the same stream, so a separated annotation simply records nothing — a miss, never a false positive. A miss reads as "not a timeout", which is the safe direction for the merge-suite-truth measurement because false timeouts are the corrupting case.
- `(unnamed)` and `(script)` failures can time out too. Removed by applying the same stream qualification failureNames uses, so the timeout name is byte-identical to the failure name whatever its class.

Question the fork does not ask: none material beyond the limit-integer noted as the pick's cost.

## Q3 — how a land attempt joins to its verify runs

Pick: 3a — optional `attempt` on the verify-runs row, written from the pass caller.

Reason: the attempt id already travels the whole chain — land passes it to verify, verifyCaller resolves the leaf by it, leafFields puts it on the caller, passOnce writes it into the pass record — and exactly one copy is missing: runOnce doesn't carry `record.caller.attempt` into the receipt. The fix is one field copied at the point the row is born, the smallest possible change (signpost 3a), no new record kinds. It is also strictly more informative than the reverse direction: a verify row self-labels its attempt even when the attempt row is never written (land service killed mid-attempt), and even for rows a later attempt reuses, the row truthfully names the attempt that produced it. Cost: a pass joined by a second caller keeps only the launching attempt's id, and a reused green row names its original attempt, not the reusing one — both are truthful statements about production, and the seed's red-attempt join (the 7-of-73 hole) is unaffected because a red verify is always a fresh run.

Rejected:

- 3b (run id list on the merge-attempts row): the writer doesn't have the value. appendAttempt runs at exit time in repairExit/keepPlace/commandFailed, and while repairExit's MergeExit often carries `run`, the code-2 path computes it by re-scanning (redRunId) and the gate/conflict/dirty exits have no run at all — so the field would be present exactly in the cases that need it least and absent in the ambiguous ones. Threading run ids through every exit path multiplies the touch surface across land.ts instead of one copy in runOnce, and a base comparison run (compares) belongs to the attempt too but is never named in any exit. It also inverts durability: the verify rows are the evidence of record, and rows from crashed attempts stay unlabeled forever.
- 3c (both): the redundant second copy buys nothing the verify-row field doesn't already answer — the join from an attempt to its runs is a filter over verify-runs either way, since merge-attempts is only ever read whole (timing-report.ts). Two writers of the same fact invite skew (an exit path that writes one and not the other), and the smaller one already covers the crashed-attempt case the bigger one cannot.

Evidence:
- better-than-training: verify.ts verifyCaller/passOnce/runOnce chain and verify-pass.ts passRecordSchema (`caller.attempt` present in the record), land.ts exit paths, attempts.ts appendAttempt. Read 2026-11-25.
- better-than-training: zero `attempt` keys in 3666 framework verify rows; 93/1268 attempts unjoinable by holder+time window, 21 of them red — measured 2026-11-25 against the seed's 7-of-73 consultant count (same order; the difference is window and method, mine covers all rows since 2026-10-10).
- better-than-training: merge_exit schema in state.ts (`run` present on red exits). Read 2026-11-25.

Pitfalls and what removes them:
- Two rows per attempt (head and base) is not ambiguity but completeness; consumers group by attempt. No mechanism needed.
- Rows written before the change carry no attempt: historical joins stay heuristic. Accepted — the seed's need is forward-looking measurement.
- The pass join key (`samePass` in verify.ts) compares caller target/slug/unit/scope but NOT `attempt` or `phase`, so a fresh attempt of the same leaf can join a still-running pass its dead predecessor launched (crash-restart window). The resulting row then names the old attempt while answering the new one's verify. This window is small — the land admission serializes attempts per leaf, so it needs a service crash mid-pass — it affects 3b identically, and shrinking it (attempt in the join key) would break legitimate pass sharing. Stated as the pick's residual cost; a consumer that needs certainty joins rows whose start falls inside the attempt row's start–end window as well.

Question the fork does not ask: whether `tested_top` on the attempt row should be matched by anything on the verify row for crash reconstruction — answer is already yes via sha/tree fields; no new field needed, noted only so the door doesn't add one.

## Q4 — which runs keep durations

Pick: 4b — merge-scope runs only.

Reason: the seed's need is scoped — "how long did this test run at merge" — and leaf-scope duration capture would multiply ledger volume for a question nobody asks. Leaf rows outnumber merge rows in the framework ledger (2075 leaf vs 1498 merge head), and leaf logs die at the same leaf close, but nothing downstream reads per-test durations at leaf scope: the merge-suite-truth measurement is medians at merge, and red leaf tests are re-run at merge anyway. Under 1a the per-row cost is small either way, so this is a pure signal-vs-noise decision — and capture at leaf scope would train readers to treat noise as signal (leaf timings run on different parallelism than the merge suite and are not comparable). Cost: a leaf-only performance regression (a test slow at leaf scope but never reaching merge because the leaf never merges) leaves no duration record; acceptable because that class has no consumer and the leaf's own log exists until close for any live investigation. "Merge scope" includes the base comparison runs (compares set): they run the merge command set on the base tree and their durations are the natural baseline for head-vs-base comparisons, at the same per-row cost.

Rejected:

- 4a (every command row, any scope): cost without a consumer. It roughly triples the rows carrying duration lists, inflating the rewritten file for data the seed never reads — leaf-scope answers are discarded at merge time because the merge suite is the measurement that matters (different load, different parallelism). If a future chart wants leaf-scope durations, the field is scope-independent and extending capture is a one-line scope test — but YAGNI applies now.

Evidence:
- better-than-training: scope counts measured from framework verify-runs.jsonl 2026-11-25 (2075 leaf head, 1498 merge head, 69 merge compares); verify.ts verifyCommands scope filtering and framework issues/config.yaml (leaf scope runs `cheap` only, merge runs `verify`).
- better-than-training: seed text — "how long did this test run at merge", and merge-suite-truth's planned reading is over merges.

Pitfalls and what removes them:
- "Merge scope" must not be read as head-only: compares rows are the base measuring instrument. Removed by writing the capture as a scope test (`scope === 'merge'`) with no compares exclusion, stated in the leaf contract.
- Blocked or reused command rows hold foreign bytes (the blocker's log, the reused receipt) — capturing durations from them misattributes. Removed by the same rule failureNames-adjacent code already uses: no capture on rows with `blocked` or `reused`, matching slowEligible's treatment.

Question the fork does not ask: whether leaf-scope rows in repos whose merge suite is the same command set as the leaf suite (merge_covers empty, e.g. akrogon itself) should capture at both scopes because the merge row may be a reuse of identical work. Worth one line in the round: reuse copies no durations backwards, and akrogon's own merge rows are fresh runs (test is `full`), so capture at merge scope still lands where the seed reads it. No change to the pick.

## Signpost conformance check

- 1a fix in the mechanism that fails: the facts move into the row at capture time, where failureNames already parses the same bytes — no log retention patch.
- 2a free tests at the real boundary: parsing is derivable from the existing failureNames grammar and testable against recorded framework log fixtures; no paid launch needed.
- 3a smallest field on existing records: three optional arrays/strings on the command row (`durations`/K-list, `timeouts`, `rerun.timeouts`) and one optional `attempt` on the run row; zero new record kinds.
- 6a old records parse with no migration: every addition optional; `failures` untouched.
