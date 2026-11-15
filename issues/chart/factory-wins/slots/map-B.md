# Territory map, slot B

Independent position, read and measured 2026-11-10 against `6352653739fcd32727c809c42a0955811071d98d`. No other seat's map was read. No agent, paid run, test run, product edit or live mutation was started. Only this return file was written.

Method: the operator's `issues/chart/sources/systems-thinking-field-manual.txt`, chapter 15, supplies the sequence: observed behavior, stocks and flows, loops, delays, constraint, traps and leverage. The candidate mechanisms below are my inferences from the inspected factory.

My strongest structural candidate is one authoritative lifecycle safety policy. My strongest concrete quick fix is the verify-survival test's false assumption that a completed receipt means its checkout has already been removed. Keep all protected steps. The measurements do not justify another scheduler, weaker checks or fewer reviews.

## Evidence and system boundary

- F1: The local phase log contains 253 distinct merged slugs, 121 of which visited check.fix or check.repair. There are 277 closed state files. These populations differ because the log does not cover all historical closures. Command: parse `issues/log.jsonl`, group by slug and destination; count `issues/closed/**/state.yaml`. Do not divide one population by the other.
- F2: Since 2026-11-01, `issues/verify-runs.jsonl` contains 84 completed rows, 35 with a genuinely executed red command. Their summed elapsed time is 7,270.41 seconds, including 3,240.88 seconds on red rows. This is accumulated run time, not elapsed project delay or avoidable waste. The timing log has 84 completed commands named `test`, 30 red, totaling 6,717.19 seconds. Command: filter starts/timestamps at the cutoff and sum end minus start or `duration_ms`, respectively.
- F3: Current `akrogon flaky` prints 129 rows, with 163 total flip counts. Twenty-four rows have their latest flip since November 1. The newest is November 9. This replaces the opening snapshot's 30 rows/newest October 24. It proves observed same-tree instability, not that every listed mechanism remains unfixed.
- F4: The four lifecycle SKILL.md files contain 14,311 words today, measured with `wc -w skills/{plan-issue,implement-issue,check-issue,merge-issue}/SKILL.md`. A's checked G1 separately records growth of all skills Markdown from 9,327 to 38,728 words between September 12 and November 9. Growth alone does not establish waste.
- F5: The timing record has 709 prompt events referencing 184 distinct non-null transcript paths. Eighty-six paths currently exist, totaling 161,145,693 bytes, median 1,493,849 bytes and maximum 9,117,037 bytes. Command: deduplicate `kind=prompt` session paths from `issues/timings.jsonl`, then `stat` them. Missing paths are unavailable evidence, not zero usage.

The boundary is akrogon's command, skills and tests. Consumer workload determines demand and some service time, but a consumer's suite configuration is outside the authorized change surface.

## Stocks, flows, loops and delays

| Stock | Inflow | Outflow | Relevant observation |
| --- | --- | --- | --- |
| Proposed work and settled-but-unbuilt work | Findings, charts and approved forks | Landed leaves or explicit disposition | Count selected work separately from every historical chart folder. |
| Work awaiting review, repair or merge | Implemented changes and failed checks | Accepted proof and integration | F1 shows substantial repair traffic. It does not classify repairs as waste. |
| Process obligations and context | New rules, references, captured output | Consolidation and justified retirement | F4 measures the growing stock. |
| Proof records and historical evidence | Every checked run and phase move | Packing and retention decisions | 15,051 timing rows occupy 4,179,032 bytes. These are retained evidence, not disposable noise. |
| Unresolved intermittent failures | New nondeterminism and environmental changes | Root-cause fixes | F3 is cumulative history, not an active-defect count. |

- R1, hypothesized reinforcement: incident leads to another prose rule, which increases reading and maintenance, which can increase misunderstanding and repair, which invites more prose. F1 and F4 show the stocks coexist. They do not prove those causal links. M1, M2 and M6 test the proposed intervention without removing controls.
- R2, observed mechanism with partly inferred amplification: a flaky red provokes retry and diagnosis, consuming execution and attention. Concurrent retries can add contention and more reds. F2 measures red-run cost; the specific contention contribution is unmeasured. M3 and M7 remove named failure mechanisms rather than weakening the red gate.
- B1, protected quality feedback: criteria and clean-checkout checks expose a gap, independent review judges it, repair closes it. The operator retains the approvals and decision record. Reduce false signals and repeated reading around this loop, not its sensors or independent judgment.
- B2, incomplete economic feedback: chart usage has per-seat accounting, while lifecycle timings record activity without token/cost fields. High spend can therefore produce another optimization proposal without a comparable leaf baseline. M9 repairs the information gap only if its upkeep is justified.

There is no demonstrated current akrogon merge queue to optimize. A's checked framework cohort had 11 of 19 merged leaves spending over 60% of non-implementation elapsed time waiting for a merge turn. That is a consumer observation. It does not identify an akrogon-owned fix, and it does not justify speculative testing against the existing deferral.

## Ranked candidates

The order follows fewer parts, operator time, clock time, then tokens. Implementation scheduling still follows the operator's small-first answer. Each number is today's measured stock or an explicitly dated recorded cost, not promised savings.

### M1: One lifecycle safety authority. Big.

**System:** Remove multiple maintained expressions of the same obligations from the process-text stock. This targets R1's maintenance input rather than shortening an operator round.

**Cost:** Four independently written environment-access paragraphs total 281 words. Four grants paragraphs total 1,074 words. They contain common rules plus local differences. The full lifecycle text is F4. Measurement: split each lifecycle SKILL.md into paragraphs and count those containing the environment prohibition or `reuses grants[]`, read November 10. Only 80 words duplicate exactly across whole paragraphs, so a string-deduplication claim would be false.

**Change:** Put genuinely shared invariants in one required policy reference and replace their copies with links. Keep phase-specific actions, report destinations, retry commands and review-versus-repair permissions local. Do not build a rule compiler or invent a generic workflow language.

**Lifetime risk:** An over-broad extraction can erase a meaningful difference or make a critical rule harder to find. Review the actual obligations across all four consumers and retain direct references at their points of use. Net deleted policy text and fewer maintenance sites are the initial benefit. Token savings need separate proof.

**Earlier decisions:** Preserve `issues/chart/agent-test-rules/forks/test-authority.md`, the current known-red-nameless Taken contract and `issues/chart/system-flow/forks/repair-loop.md`. No ownership rule or known-red judgment changes. Practitioner basis: [Martin Fowler's account of Beck's design rules](https://martinfowler.com/bliki/BeckDesignRules.html) supports removing duplicate knowledge while keeping intent clear. Applying it to instructions is my inference.

### M2: Make conditional implementation references stay conditional. Small.

**System:** Remove unnecessary input from serial implementation passes without changing delegation or any phase.

**Cost:** `brief-template.md` is 931 words and `worker-protocol.md` is 1,104 words, 2,035 combined. Fifty-two of 255 closed plans explicitly mention serial-solo. The implementation skill's opening requires rereading its references at every prompt, while Shared context requires these two only when briefing or delegating. Commands: `wc -w` on those files and a case-insensitive serial-solo census of `issues/closed/**/plan.md`, November 10. The 52 is a lower-bound textual census, not the measured number of unnecessary reads.

**Change:** Resolve that contradiction in the opening instruction. A serial-solo implementation pass reads its applicable instructions and ponytail guidance; delegation templates are read when delegation is actually used. A repair that delegates still reads them.

**Lifetime risk:** A later mode change could omit needed worker rules. Keep the existing conditional read at the delegation point, with no remembered mode flag or new machinery.

**Earlier decisions:** Retain the serial-solo decision in `issues/chart/leaf-speed/forks/fix-order.md` and the parallel-unit contracts. This changes neither. Practitioner basis: [Anthropic Engineering's context guidance](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) favors relevant, deliberately selected context. It does not establish a numerical saving here.

### M3: Wait for verify service completion in its survival test. Small.

**System:** Remove a false failure from B1's sensor and its retry path.

**Cost:** `akrogon flaky` reports five flips for `a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run`, latest November 8. Archived logs read through `akrogon log` show the same failure on November 3, 4 and 8: the receipt has `end`, but `existsSync(receipt.path)` is still true. Example: `issues/chart/tasks-panel/direct/check-test-1793744593130-1258102.log`. Source inspected November 10: `src/verify.ts` publishes the receipt before awaiting `git worktree remove`; `tests/run-units.test.ts` polls only the receipt before asserting removal.

**Change:** Replace that test's receipt-completion polling assumption with its existing `waitInactive` helper for the identified verify service, then read and assert the receipt and removed checkout. Keep the caller-kill scenario and every current assertion.

**Lifetime risk:** Waiting for the wrong service could hide a leak or hang. Use this pass's recorded run ID and the existing bounded helper. Do not move receipt publication or increase test caps.

**Earlier decisions:** This directly follows `issues/chart/verify-lifetime/forks/run-lifetime.md` Taken point 4: service exit includes post-receipt cleanup. It repairs the test's observation, not that contract. Practitioner basis: [John Micco's Google testing account](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html) explains the investigation cost and loss of trust caused by flaky signals.

### M4: Get transcript length from metadata. Small.

**System:** Remove a whole-file read that returns only a byte count during door reset.

**Cost:** `src/transcript.ts` `transcriptEnd` executes `readFileSync(path).byteLength` for JSONL. F5 gives the actual size distribution of available factory transcripts. A recent recorded nameless-base-red transcript is 1,380,587 bytes, another 952,315 bytes. This is bytes read per invocation, not measured accumulated reset cost.

**Change:** Use file-size metadata for the JSONL boundary. Keep the agy database step-index behavior unchanged.

**Lifetime risk:** Byte positions must remain byte positions. Preserve missing-file errors and the existing later input/session rechecks. This introduces no cache.

**Earlier decisions:** Preserve `issues/chart/door-cost/forks/carry-rules.md`'s late-input refusal and reset boundary. Practitioner basis: [Google SRE's simplicity chapter](https://sre.google/sre-book/simplicity/) favors removing accidental work. [Node's file metadata API](https://nodejs.org/api/fs.html#fsstatsyncpath-options) supplies the operation. The local benefit is inferred from the inspected read.

### M5: Read only transcript bytes after the reset boundary. Small.

**System:** Stop growing historical context from increasing an incremental late-input check's I/O.

**Cost:** `transcriptRecords(path, from)` reads the entire JSONL file before slicing at `from`. F5's maximum is 9,117,037 bytes, including bytes the caller explicitly excludes. The door-reset consumer passes its previously recorded boundary. Measurement is the code path plus actual file sizes, not a replay benchmark.

**Change:** Read the suffix from the requested byte position through the existing record parser. Preserve record handling and the agy branch.

**Lifetime risk:** Short reads, concurrent appends and an incomplete final record must not turn a real operator input into absence. Prove the same refusal cases as the existing reset contract. If doing this needs a complicated reader, keep M4 alone.

**Earlier decisions:** Same door-cost contract as M4. Practitioner basis: the same [SRE simplicity guidance](https://sre.google/sre-book/simplicity/) and the [positioned file-read API](https://nodejs.org/api/fs.html#filehandlereadbuffer-offset-length-position). M4 and M5 belong in one leaf because they own the same source and safety boundary.

### M6: Read the current lifecycle phase, not unrelated modes. Big.

**System:** Reduce instruction inflow per phase without resetting seats, removing steps or relying on old context.

**Cost:** Check-issue is 4,373 words, including 910 in check.repair and 175 in Standalone review. Implement-issue is 4,948 words, including 876 in check.fix and 298 in Standalone. Current whole-file read instructions apply to every prompt. Multiplying today's whole-skill sizes by the 143 relevant recorded prompts since November 1 gives **591,857 words, an exposure estimate**, not observed reading or tokens. Commands: count words by named second-level section and group timing prompt events by phase.

**Change:** Require fresh reads of the preamble, Shared context, current phase, footer and specifically followed references. Keep every applicable obligation. Resolve cross-phase references explicitly so a repair still obtains its repair-ownership and proof rules.

**Lifetime risk:** A relevant rule may live outside its apparent section. Do not claim the entire other section is removable input until a contract walk shows that. Preserve fresh on-disk reads after phase changes and compaction. Use the single bounded paid comparison only if recorded evidence cannot settle actual token benefit, and only after N1's cap exists.

**Earlier decisions:** `issues/chart/token-spend/forks/levers.md` scoped selective reading to consultants and deferred a restored-content comparison. This proposal neither reuses retained lifecycle text nor revives that deferred comparison. It reads the selected phase fresh. If tracing finds that it actually requires the deferred mechanism, list it instead of charting it. Practitioner basis: Anthropic's [context engineering account](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents).

### M7: Resolve the current dependent-dispatch flip. Small scope, root not established.

**System:** Repair a second named false or intermittent signal in the delivery loop. It may expose a real product race, so do not assume it is only a test issue.

**Cost:** Current flaky output reports two flips for `merged phase closes tab on typed next and starts the dependent`, latest November 9. Receipt `fe4b306c-f96a-416b-913e-843e24ded7dd` ran red for 64.43 seconds; `28832fb4-7254-47dd-a2b0-dba962a2359c` ran green for 65.09 seconds on the same tree `f0c2ba02f72f12c3adba65ec83887bbfb6e94fdc`. The red log says dependent attempts.A was 0 where 1 was expected, in 4.36 seconds, well before the test's 15-second cap. Read November 10 via `akrogon log` on `issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-test-1794236439927-3239663.log`.

**Change:** Trace the dispatch/observation boundary, then remove the race or invalid test assumption while retaining exactly-once dependent startup. The root-cause trace precedes a locked implementation shape. A timeout raise does not address this observed failure.

**Lifetime risk:** Waiting until attempts becomes 1 could conceal a broken synchronous contract. Establish the actual command contract before changing the assertion. No blanket retries, quarantine or weakened evidence.

**Earlier decisions:** Preserve `issues/chart/merged-batch-cleanup` and the cap/retry restrictions in `issues/chart/suite-time/forks/load-sensitive-tests.md`. Practitioner basis: Micco's [flaky-test account](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html). Unlike the broad historical flaky list, this is a current, inspected failure site.

### M8: Share evidence-location work inside one read-only report. Small, low priority.

**System:** Remove repeated discovery within a fixed read-only analysis, without caching live pane, git-ref or decision state.

**Cost:** Replaying the pure red/green matching over current verify records identifies 24 `failedTests` calls in one `flaky` report. Each calls evidence `readLog`, whose `locate` runs `git worktree list --porcelain` again. Nineteen logs name owned issue folders, with repeated owners including herdr-app five times and herdr-session three times. The entire current command completed in roughly 0.05 seconds in the tool's wall measurement, so the practical clock win is small.

**Change:** Resolve an invocation's evidence roots once and pass that inventory through its read-only batch. Consider shared archive access only if measured decompression cost warrants it. Add no persistent cache, daemon or invalidation scheme.

**Lifetime risk:** Roots cannot be reused by a mutating command across worktree changes. Keep the optimization confined to the read-only batch and preserve archive errors and ambiguous-match refusal.

**Earlier decisions:** Consistent with `issues/chart/git-calls/forks/reuse.md`'s caller-local reuse, not its rejected global cache. Practitioner basis: [Google SRE on eliminating repetitive operational work](https://sre.google/sre-book/eliminating-toil/). This is measured but probably too small to justify its own leaf unless the diff is exceptionally simple.

### M9: Keep lifecycle usage before its evidence disappears. Big, secondary lever.

**System:** Close B2's measurement gap using existing timing identity and existing usage semantics.

**Cost:** F5 has 184 recorded transcript paths, 98 currently absent. Neither `issues/log.jsonl` nor `issues/timings.jsonl` has any token/cost field. That is a measured evidence gap, **not a dollar loss estimate**. The existing chart script explicitly excludes subagent usage, so it cannot silently become whole-leaf accounting.

**Change:** Reuse the existing harness usage interpretation to retain a final leaf/seat usage observation while its transcript exists, tied to its recorded identity. Keep unknowns explicit. Avoid pricing configuration or a second accounting parser. First decide whether this is worth permanent upkeep for the optimization decisions the operator actually makes.

**Lifetime risk:** Retries, compaction, shared sessions, workers and missing files can cause double counting or false totals. Do not sum per-phase cumulative counters or equate output tokens with dollars. Preserve the transcript boundary and session provenance.

**Earlier decisions:** Preserve `issues/chart/usage-windows/forks/window-and-calls.md`'s counting rules and `issues/chart/chart-cost/forks/proof-of-saving.md`'s token/minute versus dollar distinction. This is not the declined fork-close meter. Practitioner basis: [SRE's toil measurement](https://sre.google/sre-book/eliminating-toil/) supports measuring repeat costs. Whether adding this instrumentation pays back is still an inference.

## Remaining angles, one line each

- L1: Operator explanations still needed in at least two distinct November 6–7 herdr-app replies, recorded in containment/config Taken. The existing questions.md already requires concrete context and plain language. Apply that rule, not another overlapping prose rule. This refines earlier W2.
- L2: Framework queue service time deserves its owner's attention, but consumer suite changes are recorded for that repo, outside this chart's destinations. This refines earlier W3.
- L3: Repair classification could distinguish useful defect detection from avoidable proof/report churn. F1 supplies volume, but there is **no current classified number** here. List, do not chart a speculative routing change. This refines earlier W4.
- L4: Current chart token stock is large, but protected consultant/rebuttal/final-check steps remain. There is **no measured removable exchange** established here. Do not cut them or impose the rejected output caps. This refines earlier W5.
- L5: Historical same-tree verification repeats are not a new win: suite-repeats already delivered whole-receipt reuse and removed per-command reuse. The current verify source confirms those completed changes. This map does not propose another receipt-reuse mechanism.

## Questions the candidates do not settle

- Q1: Which costs recur under today's hc-based factory, versus being one-time migration costs? F2's cohort includes the hc transition, so it cannot be treated as a stable future failure rate.
- Q2: How often does the operator actively intervene, and for how long? Operator-wait time in a usage table is not operator effort. No current active-attention total was measured.
- Q3: Which review findings catch real defects, and which become rules without preventing recurrence? The historical repair ratio does not answer that, nor establish that fewer rules would reduce defects.
- Q4: What observable improvement would justify maintaining lifecycle usage accounting? A measurement feature without a recurring decision it changes becomes another stock to carry.
- Q5: Does the ranked portfolio improve verified delivery per unit of operator attention across consumer workloads? None of the byte or word counts alone demonstrates that result.

## Lifetime pitfalls

- P1: Mixing historical and current mechanisms can re-chart completed fixes. Pin implementation evidence to the recorded head and verify the live site before every destination is drafted.
- P2: A lower token total can hide dropped judgment or missing worker usage. Keep the protected-step and finding-quality comparison beside any paid token proof. Its cap is pending, so launch none now.
- P3: Centralizing prose can create a large common document everyone reads unnecessarily. Extract only shared invariants and keep scope-specific behavior visible to its actual reader.
- P4: Improving a non-binding stage may change no delivery time. Report local bytes/words/calls saved as local savings until end-to-end evidence exists.
- P5: Adding measurement, caching or scheduling can cost more maintenance than it saves. M8's measured runtime especially argues for restraint. No new service is justified by this map.

## Destinations and dependencies

- D1: First, one quick chart with M2, M3 and M4/M5. Proposed parallel leaves: conditional reference wording in `skills/implement-issue/SKILL.md`; survival-test observation in `tests/run-units.test.ts`; transcript reads in `src/transcript.ts` and their existing tests. M4 and M5 are one leaf, not parallel owners of the same file. M5 may be omitted if its safe reader is not simple. The three leaves share no logical prerequisite. Their tests must retain isolated fixture resources.
- D2: Then chart M1 as the largest structural simplification. One coherent issue owns the shared policy and its lifecycle consumers. Do not split each skill into a competing leaf that lands a partial authority migration.
- D3: M6 is a separate token/reading destination after M1 if M1 changes instruction locations. That is a real dependency on the final authoritative sections. M2 can land first and reduces M6's baseline accordingly. Use N1's one paid run only after its exact need and cap are settled.
- D4: M7 is an independent narrow reliability issue. Diagnose before promising a mechanism. It can proceed beside M1, but not beside another leaf editing `tests/next.test.ts` or its dispatch fixtures. Its observed failure does not require M9.
- D5: M9 is an independent measurement issue only if the operator values the decision it enables. M8 is a low-value optional addition to the quick chart only when its minimal diff earns it. Neither is a prerequisite for the concrete fixes.

No existing chart needs reopening or closing to deliver these destinations. No consumer-repo edits, credentials or live grants are needed for the recommended quick chart. The only foreseeable new authorization is N1's still-pending cap if M6 needs the bounded paid comparison.
