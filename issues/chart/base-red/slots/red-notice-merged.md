# red-notice merged notes

Tags name the slot whose own notes hold the line. Notes: red-notice-A.md (written after B and C returned), -B.md, -C.md.

## Q1 notice
- One herdr notification per incident with stored delivery. No GitHub issue, no repair leaf. (A,B,C)
- Incident identity is scope + command + failing unit (B adds equivalent material configuration). Tree and base sha are evidence, not identity, since main's tree changes with every landing while known reds pass. (A,B,C)
- Store delivery on the verify receipt the taken policy already writes, no new file. (A,C) B accepts the receipt store if it fits the no-red-record-file boundary. (B)
- Resolve only on completed, comparable passing evidence on landed main, including the same revision after an environment repair, with a generation check so an older base never clears a newer incident. (B) A candidate run counts once that exact tested revision lands. (B) Base-side or default-tip runs resolve, a leaf head run does not. (A,C)
- Fire on any completed fresh base run that finds an uncovered red unit, not only when the head-side pair passes, so a leaf blocked on its own extra red still surfaces the base red. (A; C raised this as Q-b)
- One notification per run carrying count, first unit names and receipt id; repeats join silently. (A,B,C)
- Decide the sender under the verify-runs lock. (A,B,C) Accept an occasional duplicate after a crash between send and record. (A,B) C's retry keys on the recorded delivery and leaves that case open. (C)
- A failed send never fails verify: record reason or `error`, print it, retry at the next relevant verify. (A,C) A failed send must not invalidate comparison evidence or mark the leaf failed, and how the error is surfaced must be contracted so it is not read as a red check. (B) No timer. (A,B,C) No side effect in status reads. (A,B)
- Sound: lower urgency than a failed leaf. (A; C raised this as Q-c) Prove the exact call before handoff, since the 10-10 proof used `--sound none` and the failure path uses `--sound request`. (B)
- `shown` is herdr's acceptance, not that the operator saw it. (A,B,C) A derived `akrogon status` line would make a missed notice recoverable; out of this fork unless chosen. (C asks, A defers)

## Q2 prevention
- One test-proof rule line: an expectation over a clock- or date-derived value injects the time or computes the expected value from the time observed in the same run; a fixed bound on such a value is a test defect. Placed once where plan-issue and check-issue reference test-proof rules. (A,C) Too broad as worded: an elapsed-time requirement can deliberately impose a fixed maximum, so any rule covers only expectations that expire because calendar time advances. (B)
- No new prevention in this issue; the one seen case is fixed (tests/timing-report.test.ts:511-539) and a rule reminds but does not prevent. (B)
- No clock seam in src and no lint: real time is right for elapsed-time and deadline uses (tests/sync.test.ts:253), and a lint cannot tell a fixed bound from a relative one. (A,B,C)
- No audit of the existing suite now. (A; C raised this as Q-d)

## Evidence
- Operator 10-10: issues/chart/red-base-wait/forks/red-record.md Taken (per-unit identity, joins silent, resolve on observed green landed main, no auto seed, no owner). (A,B,C)
- src/phase.ts:83-104 notice and delivery pattern; src/verify.ts:130-196 receipts and lock. (A,B,C)
- Google SRE, Monitoring Distributed Systems (Ewaschuk): low-noise actionable interruption. (B) Bazel Test Encyclopedia, Time and date. (B)

## Where slots differ
1. Q2: one rule line (A,C) vs none (B).
2. Q1 trigger: any fresh base red (A) vs only a passing pair (C as written, with Q-b open).

## Rebuttal corrections applied
B's rebuttal F1-F3 (red-notice-rebuttal-B.md) and C's D1-D2 (red-notice-rebuttal-C.md) applied above.
