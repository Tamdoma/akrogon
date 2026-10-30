# Slowdown alarm

## Question

Q1. Which merge runs set the recent normal, and which are checked against it?
Q2. How long does a detected slowdown stay flagged?
Q3. Which leaf does the alarm name?
Q4. Where does the alarm show?

### Carries

- Operator D3 (framework `issues/chart/verify-time-tradeoffs/forks/tradeoffs.md`, quoted in #123 Expected behavior): compare each merge verify's wall time with the recent normal for that repo and scope, flag a large jump, name the leaf whose merge first showed it, where the operator and merge slots see it; never fail merges on a wall-clock cap.
- Operator lock 2026-09-18 (`../../seat-stall-detection/forks/no-akrogon-detector.md`): no clocks, polls or watchdogs. A comparison run once at verify end uses an existing event.

## Findings

Merged notes: [slots/slowdown-merged.md](../slots/slowdown-merged.md); rebuttal [slots/slowdown-rebuttal-B.md](../slots/slowdown-rebuttal-B.md); maps [A](../slots/map-A.md), [B](../slots/map-B.md).

- Research Q1: better-than-training, `src/verify.ts` `runOnce`/`reuseSource` read 2026-10-28: a partly reused or blocked run still spends wall time, so the normal set and the checked set differ (B rebuttal F1).
- Research Q2: model-knowledge with direct calculation over framework history (20 runs near 6 min then 11 near 21 min): a rolling median absorbs a lasting jump and clears the flag with no recovery (B rebuttal F2).
- Research Q3: better-than-training, framework `issues/verify-runs.jsonl`: first slow merge run 52382dbb `renderer-package-cutover`, red, 15.95 min (B map F3).
- Research Q4: better-than-training, `src/land.ts`, `src/next.ts` `broadcastPass`: a green command-owned land has no seat watching its output (B map F6); `sendMainRedNotice`/`noticeCovers` already retry an undelivered notice on the next run (B rebuttal F3).
- Off route: per-command timing (B O3); Discord broadcast of slowdowns (B O11).

## Taken

2026-10-28, A's pick under autopilot (not operator words): `1a 2a 3a 4a`.

- Q1 1a: the normal is the median wall time (`end - start`) of the last 20 eligible merge-scope runs before the one checked, eligible meaning completed (`end` set), setup 0, no `compares`, no `reused` or `blocked` entry; at least 5 eligible runs are needed or no check runs. Every completed merge-scope head run (no `compares`) is checked, partial ones included. A run is flagged when its wall time is more than 1.5x the normal and at least 2 minutes more. Command text is not part of eligibility, so a config change that adds cost still alarms. Reason: partial runs spend real time (B F1), reused runs would make the normal cheap. Rejected 1b: hides partial slow runs.
- Q2 2a: a flagged run opens an episode that keeps its pre-jump normal; later checked runs compare with that normal; the episode closes when a fresh eligible run is back under the threshold (recovered) or when every one of the last 20 eligible runs lies inside the episode (accepted as the new normal); derived from the ledger with a `slow` field per checked run, no new file. Reason: rolling-only clears falsely (B F2). Rejected 2b.
- Q3 3a: name the episode's first flagged run (red attempts included) with its leaf, run id, measured and normal minutes, worded "first seen at", never "caused by". Reason: framework history shows the first slow run was a red attempt.
- Q4 4a: one herdr notification `<repo> merge slow` per episode, reserved under the receipt lock and sent outside it like `main red`, an undelivered or failed send retried by the next completed merge run of the same episode; an `akrogon status` line while an episode is open, and a `verify slow:` stdout line naming an accepted close; a `verify slow:` stdout line on each flagged run. Merge exit status and receipt eligibility never change. Rejected 4b (broadcast): delayed to owner completion, misses attempts that never land.
- Standing dissent (B rebuttal F4): no step makes a merge seat read the status line; accepted, a green land has no seat and the operator and watcher read status. (B F5) false alarms from host load cost attention; accepted, the message shows minutes and says "first seen at".

## Proof

- 2026-10-28T12:45:47Z, `herdr --session infra notification show "akrogon charting proof: merge-slow-alarm" --body "Test of the merge slow notice call. No action needed." --sound none`, identity: operator's local herdr session infra (no credential), herdr 0.9.1: exit 0, `{"reason":"shown","shown":true}`. Cleanup: none, no stored state. Limits: does not prove the operator saw it, delivery outside herdr, or behavior when herdr is absent.
