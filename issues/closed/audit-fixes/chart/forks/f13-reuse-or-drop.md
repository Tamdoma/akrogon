# F13: reuse the pre-lock pane owners or drop the fix

## Question
Q1. Should F13 reuse the pre-lock `paneOwners` result inside the hook branch, or be dropped from the batch?

### Carries
No existing locks. The note's rule at `issues/AKROGON-AUDIT-FIXES.md:5-7`: no fix changes behavior for valid input; a speed fix that cannot be done by removing code is not done.

## Findings
(both) `nextCommand` calls `paneOwners` at `src/next.ts:646` before `withLock` at :652, only when no hook event exists. It calls it again at :691 inside the lock. So the fix is not a simple "keep the first result": with an event the first call never ran, and the second runs under the lock.
(B) Reusing the pre-lock result changes observable outcomes. A bare pane-owned invocation finds leaf X, waits on the global lock while another command parks X. Today the in-lock lookup finds no owner and returns cleanly. With reuse, `dispatchLeaf` reports `Missing or unreadable leaf` at :486 and exits 1. If X stays readable but loses pane ownership, `dispatchLeaf` re-reads by slug without rerunning `ownsPane`, so it acts on the former owner.
(A) Initially argued the routing decision is already stale so reuse is consistent. Withdrawn after B's rebuttal: the routing choice and the owner choice are separate decisions and today only the first is stale.
(both) Option (c), looking up ownership once under the lock, is a routing change. Moving all selection under the lock breaks `tests/next.test.ts:1565` (invalid target rejected before any flock). A narrower design may exist but is outside a deletion batch.

## Taken
Operator answer: `1a`, 2026-09-14. Drop F13. Reason: the note's rule that no fix changes behavior for valid input; B's park-during-lock-wait case shows reuse changes the outcome. Foreclosed: reusing the pre-lock result; a routing redesign that looks ownership up once under the lock.
