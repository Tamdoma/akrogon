# Measure and revisit

## Question
Q1. What should akrogon record so each leaf's time splits into waiting and working (for example plan start, each seat prompt, each check run with its duration, each merge prompt), and how does the operator read it (status, a readout command, a report)?

Q2. What rule reopens leaves-as-chunks: which leaves are measured, which number, which threshold, and who runs the decision?

### Carries
- [fix-order](fix-order.md) taken 1a: fix the loop first, measure 20 leaves, then decide leaves-as-chunks with real numbers.
- Live: `state.yaml` already holds `prompted_at` per slot (`src/state.ts:99`, set in `src/next.ts:548`) but it is not written to `issues/log.jsonl` and is reset on phase moves (`src/phase.ts:152`).
- Fog: 245 h of framework merge-phase time sits before the first merge prompt, cause not traced.

## Findings
Merged notes: [slots/measure-and-revisit-merged.md](../slots/measure-and-revisit-merged.md). Peer notes and rebuttals in the same folder.

Research: better-than-training, akrogon `src/log.ts:9-63`, `src/next.ts:542-551`, `src/phase.ts:151-162`, `src/run-check.ts:90-126`, `src/status.ts:348-366`, framework `issues/log.jsonl`, read 2026-10-12. No practitioner source searched for this mechanism question.

- Q1 (A,B,C): separate append-only timing record plus a read-only timing command. `log.jsonl` stays phase moves. Copying `prompted_at` into log rows (A's first view) loses the first plan prompt and the first reviewer's completion.
- Q2 (A,B,C): predeclared 20-leaf framework cohort after fixes land, failed and stalled leaves included, A prepares the readout, operator decides a trial. Gate form: C's quantile count over B's p90 (p90 at n=20 rests on two leaves).
- Rebuttals: F starts at the first plan prompt, because no akrogon writer sets `created` (C). F is residual elapsed time, not proven repeatable cost (B). A censor rule is needed or one stalled leaf holds the cohort open (B,C). A failed timing append leaves no trace, so coverage needs an expected-event check (B). Merge check events need the attempt id (C). Current F baseline is a proxy, 42.7 (B, n=17) or 50.2 (C, n=18) min post-implement plus 4 to 9 min plan (C).

Operator replies 2026-10-12, verbatim:
1. "Why a stopwatch? I don't want to revisiti leaves-as-chunks if it has no merit."
2. "But you did record it we're losing about 60 minutes per leaf. Look at the uestions and answers above this answer of yours. I would still like to create stopwatches and I would like to start testing it for the future."

Q1 answered 1a (reply 2). Design additions from rebuttals and final check: expected-event inventory so a failed append shows as missing coverage (B), merge check events carry the attempt id (C), F starts at first plan prompt (C), waiting-reason events (pause, prerequisite, operator hold) so waiting is split by kind (B map, C final check).
Q2 was open after replies 1 and 2: reply 1 is conditional and reply 2's "it" is ambiguous. B and C final checks (`slots/measure-final-check-*.md`) reject recording a permanent drop. The 12 min cap and 55 to 60 min fixed cost are proxies, not proven marginal costs (B,C).

## Taken

Operator 2026-10-12, Q1: `1a` (via reply 2 above, "I would still like to create stopwatches"). Operator 2026-10-12, reshaped Q2: `1a |`.

Q1: separate append-only timing record and read-only `akrogon timing` command. Records prompt delivered/failed per slot and phase visit, first-seat completion, check start and finish (name, exit, duration, log path, install/lock time, merge attempt id), merge batch members, waiting-reason changes (pause, prerequisite, operator hold). Expected-event inventory flags missing records. Reader splits each phase into waiting by kind, prompted time and check time. Reason: the only option that measures the estimated 55 to 60 min fixed cost. Foreclosed: copying `prompted_at` into `log.jsonl`, mixed events in `log.jsonl`, transcript reconstruction.

Q2: the timing record is also the merit test for leaves-as-chunks. Cohort: first 20 framework leaves whose first plan prompt follows the marker (timing record landed, loop fixes active), first-implement-exit diff at most 600 lines, failed and stuck leaves included, a leaf not merged 24 h after its first plan prompt counts over 45 min. Fixed cost F = first plan prompt to merged minus implement prompted time. Pass: median F <= 35 min, at least 15 of 20 at F <= 45 min, at most 2 merge ejections, at least 18 of 20 merged. Fail keeps leaves-as-chunks closed without a further report. Pass: A presents the numbers and the operator decides a small trial. Reason: the bar is fixed before results. Foreclosed: B's p90 gate (rests on two leaves), no gate, permanent close now.

