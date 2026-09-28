# Fork: fix-routing

## Question
Q1. When a failed leaf names a defect in another leaf's merged work, who turns it into a fix?
Q2. Is that fix a new leaf, or is the merged leaf reopened?

## Carries
- No time limit and no restart verb (stuck-seat-recovery, restart-hung-seat Q2-A).
- The watch-issues Never list forbids editing `issues/` (`SKILL.md:53`).
- In every option: the watch recognizes this failure class (`SKILL.md:38`) and its Stop rule counts leaves that only wait on it, so the cron stops instead of ticking idle. (A,B,C, rebuttal C)

## Findings
See ../slots/map-merged.md, map-rebuttal-B.md, map-rebuttal-C.md.

## Taken
2026-09-28, operator: "1a | 2a"
- Q1-A: the watch recognizes a failure that names a defect in another leaf's merged work, notifies once with the owner and the next step (chart a fix leaf, then resume the failed leaf at its failure phase), and stops once every remaining leaf is that failure or only waits on it. The operator charts the fix. Reason: the failed seat could not settle the fix itself (`live-replay/implementation/report.md:81`), so a human decides. Foreclosed: a watch repair door for settled fixes (B), and the watch charting unattended (1c).
- Q2-A: a defect in merged work becomes a new fix leaf. Merged stays terminal (`src/phase.ts:186`). Foreclosed: an `akrogon reopen` verb.
