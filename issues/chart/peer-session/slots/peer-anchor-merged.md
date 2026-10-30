# Merged notes: peer-anchor (from the 2026-10-29 opening maps)

## Q1 anchor
- (a) verify the inherited env by process ancestry, refuse on mismatch, keep calls on the verified env (A). One check per script start: `herdr pane process-info --pane $HERDR_PANE_ID` over the inherited socket must give a `shell_pid` that is an ancestor of the script. Where a script takes A's pane as an argument (peer-create, peer-restart, door-reset), that argument must equal the verified pane. door-reset's detached child inherits the verified env and does not re-verify. Cost: one helper and one call per script. A door outside any pane is refused.
- (b) explicit herdr session passed everywhere (B O1, recommended by B). Cost: every caller, rerun, prose example and child handoff carries it, and the door still needs a trustworthy source for it first (B Q5).
- (c) discovery of a unique live pane id (B O2, A): rejected by A and B. A sole decoy passes when the intended pane is gone, and ids already collide (B E3).
- (d) anchor on A's harness session id (B O3): needs a trusted identity before the first routed read and must be renewed on reset (B).
- Agreed (A,B): never reuse `repoSession` for peers, since the door and peers can sit outside the repo's workspace session; no fallback to the ambient socket after a failure; no watchdog or polling.
- Pitfalls: R1 a correct prompt beside unrouted seed or wait reads (B). Under (a) every read uses the verified env, so it is covered. R2 door-reset's child outliving A (B). It inherits the verified env and never rediscovers. R3 a partial restart (B). The check runs before the first mutation.

## Q2 co-location
- Co-location in A's session (A; B O4: smallest, matches today, needs an explicit decision). A qualified per-seat address (B O5): more plumbing, justified only if cross-session consultants are wanted.

## Differ
- A (a) vs B (b) on Q1. B has no pick on Q2.

## Open
- B Q6 (a server replaced under the same name): out for both. B Q7 (a refusal under autopilot): an existing rule covers it, since a non-zero script exit does not by itself identify a consultant to drop.
