# Fork: sections

## Question

With the board grouped by state (list-shape 1a), which states go in which section: what counts as "Needs attention", where does a task between seats go (live phase, no blocker, its next seat not running), where do stopped tasks and merged tasks under a still-open epic go, and what does the header count?

## Carries

- list-shape 1a: sections across repos, grey repo prefix, empty sections hidden, "needs attention" only on a recorded fact.

## Findings

Notes: slots/sections-A.md, sections-B.md, sections-C.md; merged slots/sections-merged.md; rebuttals slots/sections-rebuttal-B.md, sections-rebuttal-C.md.
- better-than-training · `src/status.ts` leafRed (failed, missing, undelivered), blockedBy labels (merged, parked, missing, unreadable), envelope `red` = leaf reds + unreadable + deploy failed, read 2026-11-04 (A,B,C).
- better-than-training · `src/routing.ts` requiredSlots: check.review A+B, after a fix B only (B).
- better-than-training · `src/land.ts` landAlive = `systemctl is-active` on a unit with CollectMode=inactive-or-failed; a finished land reads dead until reconciliation; Handoff records `red`/`refusal` (C). `src/next.ts` reconcileBatch can still find a successful landing (B).
- better-than-training · `src/stop.ts` stop keeps `busy_since` (B). `src/state.ts` broadcastPending ends when B is prompted (B).
- better-than-training · shipped Agents list SECTION uses "Needs you" (C); panel-bar redDot `envelope.red > 0` (A,B,C).
- operator · forks/direction.md (1a 2a 3a 4a 5c 6a; 1b 2b 3a 4c 5a 6c).

## Taken

A's pick under autopilot (2026-11-04), not operator words. Steered by direction 1a, 2a, 3a, 2b, 4c, 6c and the values simplicity, removing over adding.

1. Sections in order: Needs you, Working, Waiting, Paused. Empty ones hidden. No fold controls (2b is met by Needs you on top; removing over adding). Name "Needs you" from the Agents list (6c, direction 2b) (A,B,C after rebuttals).
2. One section per row, first match in this order: Needs you fact; clean merged leaf hidden; hold (Paused); recorded activity (Working); else Waiting. A hold is checked before activity because stop keeps `busy_since`. A spinner and hold word still show inside a Needs you row (B,C).
3. Needs you facts, all set in the producer's `leafRed` so `akrogon status`, the dot and the board agree (direction 3a): failed; recorded missing artifact; delivery error on a seat with no busy timestamp; a dependency labelled parked, missing or unreadable; a merge whose land job stopped with no recorded handoff (not `is-active` alone, so a finished land awaiting reconciliation never flashes red) (C pitfall, B qualification: the row says "merge job stopped", not "push failed"). Dependents of a readable failed owner are not promoted; they wait naming it (B).
4. Waiting reasons: "waiting on <repo/slug>"; "merge queue #N"; "next: A", "next: B" or "next: A+B" from a producer field listing the unfinished required seats that are not busy, computed from `src/routing.ts` beside `leafRed`; the mod never names a phase rule (B R3, A, C).
5. Paused: stopped, paused repo, parked, with that word. An attention fact beats a hold (B). Parked entries carry no seats or Files target (B,C).
6. Merged leaves under an open epic: hidden. A merged leaf with `broadcast_pending` stays in Waiting as "broadcast pending" (B). Rejected: Done section with "3 merged, 2 open" (A,C): an extra surface the problem-spotting board does not need (1a, 2a, removing over adding). Standing dissent: C keeps the Done line, folded.
7. Order inside a section: most direct unmerged dependents first (distinct leaves in the same repo whose unresolved `blocked_by` names this one), ties oldest first, stable (B,C; direction 4c). The row shows "blocks N" only when N > 0. Computed in the mod from `blocked_by`. Overrides the current-repo-first test (Test-Change citation).
8. Header: `env.red` labelled as problems ("2 problems"), red, shown only when above zero, so the dot and the number agree; non-task problems are always drawn in the machine block above Needs you (C; B's labelling condition met). Rejected: task-only count (B): a lit dot beside "0" sends the operator opened on the dot to an empty section (2b). Standing dissent: B prefers the task-only count.

Carries to other forks: the pane or log target for a click (direction 1b) goes into the producer leaf's scope (B R4, C) and is settled in the row fork; the waiting-run warning stays a short line (direction 3a, B R2) and is placed in the machine-lines fork.
