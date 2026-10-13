# Fix order: loop first or leaves-as-chunks

## Question
Should we fix the testing and merge loop first, and decide leaves-as-chunks later?

### Carries
Intake operator note. No locks.

## Findings
Research: better-than-training, framework and akrogon `issues/log.jsonl`, `merge-attempts.jsonl`, seat transcripts, framework config history, read 2026-10-12. Practitioner (cited by B and C, not re-read by A): DORA small batches, dora.dev/capabilities/working-in-small-batches, small changes flow faster only when per-change overhead is low.

- (A,B,C) Hours are lost after implement (90 to 190 min median Oct 2 to 12), not in units (about 12 min per median leaf).
- (A,B,C) Leaves-as-chunks today adds plan, two-seat review and a merge turn per former chunk, at least 45 min each.
- (B) 245 h pre-prompt merge waiting is observed, not proven queue time. No break-even calculated.
- (C) Gated small-leaf floor is about 39 min plus 4 to 9 min plan. A better selector addresses at most a third of ejections.

## Taken
Operator 2026-10-12: `1a`

Fix the loop first: remove duplicate checks, keep #87, cut merge-time failures that are not the leaf's fault, log when passes start. One agent builds the whole leaf only where its chunks must run one after another. Measure 20 leaves, then decide leaves-as-chunks with real numbers.

Reason: logs put the lost hours after implement, and leaves-as-chunks would multiply per-leaf overhead while it is high.

Foreclosed: 1b leaves-as-chunks now. 1c removing chunks only.
