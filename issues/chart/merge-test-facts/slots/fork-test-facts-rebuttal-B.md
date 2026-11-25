# Rebuttal: slot B, fork test-facts, 2026-11-25

Disagreements and added evidence only. Points 3 and 4: no disagreement with the majority, no lines.

## Point 1 — K value: I hold 20 over the C/D 50, with one new piece of evidence

The merged file records C's rank measurement (capture-review.test.ts now 6–12 s at merge, median rank #48) as an argument for K=50. It is weaker than it looks, because of what the measurement is for. The seed's planned reading (INTAKE.md, merge-suite-truth's use) is a post-fix verification: after the load removal lands, the watched tests are expected back near their alone-time — replay-cost-A.md measures 3.7 s alone on HEAD. At 3.3–6 s those tests sit below even the K=50 cutoff (~6.5 s median, C's own measurement). So K=50 does not buy the seed's verification series either; it buys only the transition-period band of 6.5–18 s, and once the fixes land the watched tests drop out of any bounded list — exactly as my original notes argued, the absence then carries the proof (a test under the cutoff no longer costs merge time).

Consequence if built with K=50 as merged: a perpetual ~2.4x byte cost over K=20 (5.8 KB vs 2.4 KB per merge row; at framework's ~54 merge rows/day that is +184 KB/day, +5.5 MB/month into a whole-file-rewrite ledger, on top of the parse inflation C benchmarked) in exchange for a duration band that stops containing the watched tests as soon as the chart that motivated it succeeds. K=20's cutoff (~17.9 s) covers the band where merge repairs actually go (the seed's reds-under-load population is 30–170 s). I do not object to 50 as a coin-flip call, but the rank evidence does not support it — it supports the opposite reading once the post-fix target is priced in.

Evidence: better-than-training — replay-cost-A.md (3.7 s alone on HEAD, read 2026-11-25); C's own cutoff and rank figures in the merged file; framework verify-runs.jsonl completion rates measured 2026-11-25.

## Point 2 — failures always in the duration list: added cost evidence for yes

The merged file leaves A against and C asking. The cost arithmetic settles it: a red merge command carries at most a handful of named failures (rerun rows cap at 3; observed red rows in framework's ledger rarely exceed single digits), so unconditional inclusion adds tens of bytes on red rows only, while removing it creates the worst hole in the design — a fast assertion failure (the 0.09–0.25 s class observed in framework logs) or a timeout that is quick because its limit is small (5000 ms is below the K=50 cutoff in a busy suite) leaves no duration anywhere once the log is deleted, and the red population is precisely the one the seed measures. Failures-included also makes `timeouts` self-describing: every timeout name has its ms beside it.

Evidence: better-than-training — observed failure durations 0.09–0.25 s in check-verify-1795545488370-3840724.log and timeout annotation on a 5009.97 ms failure in check-verify-1795566622096-2368929.log, both read 2026-11-25.

## Point 5 — rerun-row placement: put the full-run duration list at top level, never in `rerun`, and give the field one invariant meaning

The merged file leaves this open. My position: `durations` always describes the command's full-suite execution — the only execution when no rerun happened, the first leg when one did — and `rerun` carries no durations at all. Reason: durations have no verdict-identity role, unlike failures/timeouts which must stay leg-split for flaky pairing and rerun logic. The only consumer question is "how long did tests run at merge", and a reader should answer it with one field read, not `row.durations ?? row.rerun?.durations` plus a leg-semantics branch. The rerun leg's own 1–3 test timings are noise — those same tests already appear in the first leg's full list, failures included per point 2 — so nothing is lost. This is one schema rule ("durations = the full run of the command") instead of a two-place leg mirror.

Consequence if built with the leg-mirror placement instead: every duration consumer reimplements the fallback chain, and a consumer that forgets it silently reads nothing for exactly the red-then-rerun rows the seed cares about most.

Evidence: better-than-training — verify.ts commandRow rerun semantics (top level is the rerun leg, `rerun` holds the first) read 2026-11-25; the consumer shape from the seed's planned use (medians over consecutive merges).

## Point 6 — duplicate titles: I withdraw the stream-qualifier option; failureNames' name space with max-wins dedupe is correct

On reflection A/C are right, for a reason none of the merged notes states: the duration entries must join to `failures` entries (point 2 depends on it), and failure names come from failureNames() whose output shape is pinned by verdict consumers (flaky pairing, known-red cover, taken8 — changing it violates the neutrality the whole fork depends on). Stream-qualifying duration names but not failure names splits the name space: a failure entry `X` could no longer be matched to its duration entry when two lanes run a test titled `X`. Dedupe-max inside failureNames' exact naming rule keeps one shared name space at a measured cost of 11 collisions in ~12,000 tests, where the consequence is one lane's smaller ms hidden behind the max — an overestimation of cost in the slow-tail list, which is the harmless direction for this instrument.

Consequence if built with stream qualifiers as merged: the duration list cannot be reliably joined to the failure list it exists to annotate, or failureNames itself must change and takes the verdict logic with it.

Evidence: better-than-training — flaky.ts failureNames consumers in verify.ts/land.ts read 2026-11-25; duplicate count from the merged file's shared evidence (C,D measured).
