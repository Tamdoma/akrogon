# Slot B: measure-and-revisit

AK = `/home/ivan/Work/infra/akrogon`. FW = `/home/ivan/Work/infra/tamdoma/framework`.

## Q1. Record waiting and execution

**Pick, reason, cost.** Add one append-only measurement ledger and one read-only timing command. Keep existing transition history intact. Record initial phase opening, confirmed seat delivery, individual seat completion, observed waiting-reason changes, and configured check start/end. Correlate by repo, leaf, phase visit, seat/pass, session, check/run, base/head, effective config revision and merge attempt. Merge records name carried leaves, excluded candidates and the observed reason for exclusion. Checks record command name/arguments, exit, log path and elapsed runtime, including installation/lock time.

Separate **waiting**, **assigned-pass elapsed**, and **check runtime**. Prompt delivery does not prove continuous work. The timing command reports per-leaf rows and cohort median/p90, sample counts, retries, ejections and missing evidence. Keep ordinary status concise. Cost: instrument dispatch/completion/check boundaries and maintain their correlations. No dashboard, transcript parser, recurring job or CPU profiler.

**Rejected options.** Only copying `prompted_at` into phase-exit rows loses initial planning, earlier deliveries and the first reviewer’s completion. Transcript reconstruction is harness-specific and misses nested/background runs. Status-only measurement cannot reconstruct history. Calling all post-prompt time “working” mislabels worker waits, interrupted seats and idle sessions.

**Evidence.** Tier `better-than-training`, read October 12, 2026: AK `src/state.ts:99` stores `prompted_at`; `src/next.ts:dispatchSlot` records it after confirmed delivery, including timeout delivery recovery. `src/phase.ts:commitMove` clears it. `transition` saves the first paired-seat completion and returns “recorded” without `logMove`. `src/log.ts` records phase moves only. `src/status.ts:cells` exposes current phase age/turn, not their history. `src/run-check.ts` preserves completed output but no durable start/duration record. `next.ts:dispatchLeaf` distinguishes dependency/input/merge waiting, while `allocate` handles capacity. These are existing decision points, not classifications agents should invent afterward.

Tier `better-than-training`: FW `issues/log.jsonl` plus referenced sessions previously yielded 245 hours before merge prompts, but could not establish the waiting cause. FW `issues/merge-attempts.jsonl` records attempt start/end, which includes orchestration rather than just tests.

**Pitfalls and removal.** Preserve first-seat completion before state reset. Give each delivery a pass identity so retries remain separate. Count overlapping review seats by wall-clock union, not summed seat-hours. Record waiting causes when observed, retaining unobserved gaps as unknown. Record check start before spawning so crashes remain unfinished runs. Attribute a shared batch check once to the batch, with covered leaves, rather than multiplying its runtime. Define a validation round as one pass’s configured gate set, and report individual command retries separately.

**Missing question.** Does “working” mean assigned elapsed time or actual activity? Pick the former with honest labels. Also settle whether required criterion proofs must use the same check recorder. Otherwise “all test rounds” remains incomplete.

## Q2. Reopen leaves-as-chunks

**Pick, reason, cost.** Honor `1a`: the chart door prepares the decision after the next **20 framework leaves**, and the operator decides. Start the cohort after all chosen loop fixes and measurement land, recording their revisions. Take consecutive first-started leaves, include failed/stalled leaves, and report unfinished time rather than selecting only successes. Show size strata using first implementation-handoff diff, plus shared-hook versus isolated-area work. Cost: the first readout may remain inconclusive for small leaves.

Provisional criteria for opening a controlled leaves-as-chunks pilot: post-implement median **≤35 minutes**, p90 **≤60 minutes**, observed ejections **≤2/20**, and full-verify invocations **≤1.25 per delivered leaf**. These are proposed improvement targets, not established break-even numbers. Review after 20 regardless of whether targets pass. If they pass, compare equal-scope, similar dependency-chain deliveries against whole-leaf execution before adopting smaller leaves.

**Rejected options.** The four post-#87 leaves are not the new cohort. A universal 45-minute cutoff lacks a measured saving calculation. Averaging all sizes hides small-leaf costs. Automatic migration after a threshold replaces the operator’s decision. Waiting for perfect statistics would also evade the agreed 20-leaf review.

**Evidence.** Tier `operator`: `forks/fix-order.md`, October 12, answer `1a`. Tier `better-than-training`, FW `issues/log.jsonl`, recomputed October 12: since October 10, 30 delivered leaves have 8 merge exits. The 17 leaves below 600 final-diff lines have post-implement median/p90 **42.69/289.95 minutes**. Four post-12:54:43 deliveries have **32.96/37.27**, zero exits, and five timestamped full verifies. None is below 200 final-diff lines. Post-implement means first entry into check.review through merged, including intervening failed time. FW config commit `92b9f3131` removed duplicates at **21:07:03 UTC**, after all four deliveries. There are **zero logged deliveries after that boundary**. Historical size uses final diff because a uniform initial handoff is unavailable.

**Pitfalls and removal.** Twenty leaves support a descriptive review, not a reliable tail or low failure-rate claim. With zero affected leaves, the one-sided 95% upper bound is **13.9% at n=20**, **9.5% at n=30**, using `1−0.05^(1/n)` under independent comparable observations. Prefer at least **60 comparable leaves per assessed stratum** for a tail trend: p90 then has six observations above it, versus two at n=20. Clustered sibling leaves weaken confidence. Publish denominators and stalled cases. Keep targets distinct from proof that splitting saves time.

**Missing question.** What equal-scope pilot outcome would justify the extra planning, review and merge boundaries? Require lower critical-path delivery time and fewer validation rounds without increased integration defects. Current logs do not establish that tradeoff.
