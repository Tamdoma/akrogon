# Merged notes: sections (A, B, C)

Sources: sections-A.md, sections-B.md, sections-C.md.

## Options with tags

Sections and order
- Needs attention / Working / Waiting / Paused, empty hidden (A,B,C); C adds Done last and names the top section "Needs you" (the Agents list's word); B keeps "Needs attention" because no field records a human question.
- One section per row, first match in order; spinner and hold facts stay visible inside the row (A,B,C). B's order: attention → clean merged out → hold → activity → waiting; a hold classified before activity because stop does not clear `busy_since` (B).

Needs attention facts
- Failed phase, recorded missing artifact, delivery error on a seat with no busy timestamp (`leafRed` today) (A,B,C).
- Dependency labelled missing or unreadable (A,B,C).
- Dependency labelled parked (A,C). B: a parked owner is an intentional hold; dependents stay Waiting naming it.
- Merge whose land unit is dead (C; A in the 3a explanation). B: command exit before reconciliation is not proof of a failed landing; Waiting.
- Added in the producer's `leafRed`, not the mod, so CLI, dot and board agree (A,B,C).
- A failed or parked readable owner's dependents are not promoted; the owner shows once (B).

Between seats
- Waiting, never red on age alone (A,B,C).
- Reason names the seat: "next: B" from a producer field `waits_on` (A,C); the real table is `src/routing.ts` requiredSlots, not the watch prose (B, C cited the prose); B would show a generic "Next step pending" with no seat.

Stopped, paused, parked
- One Paused/Held section with the word "stopped", "paused" or "parked" (A,B,C). An attention fact beats a hold (B). Parked entries are folder names only: no seats, worktree or Files target (B,C).

Merged leaves under an open epic
- Done section, one line per owner, "3 merged, 2 open" (A,C).
- Hide clean merged leaves; keep one with `broadcast_pending` in Waiting as "broadcast dispatch pending" (B).

Header count
- `env.red`, red when above zero, equal to the panel-bar dot by construction (A,C).
- Task-only "N need attention"; the dot keeps its wider scope; zero tasks with a lit dot is valid when a machine problem is shown (B).

Machine problems
- A fixed block above the sections, red lines only; slow merge and run line off the board until the producer gives fields (C). Machine lines settled in their own fork (A).

## Evidence

- `src/status.ts` leafRed, undelivered, blockedBy (labels merged, parked, missing, unreadable), envelope `red` (A,B,C).
- `src/routing.ts` requiredSlots: check.review A+B, after a fix B only (B).
- `src/stop.ts` stop does not clear `busy_since`; `src/next.ts` dispatch skips holds (B,C).
- `src/state.ts` broadcastPending ends when B is prompted (B).
- Panel-bar redDot `envelope.red > 0` (A,B,C). Agents list sections (A,B,C).

## Pitfalls

- Stale busy timestamp on a stopped leaf: hold before activity (B).
- `blocked_by` includes merged dependencies: only non-merged labels obstruct (B).
- Seat table copied into the mod drifts: producer field (A,C) or no seat named (B).
- A machine problem counted with no row: machine block always drawn when present (A,B,C).
- One owner problem floods Needs attention: dependents of readable failed owners stay Waiting (B).
- Blank board when nothing is open: accepted, the empty line is locked removed (C).

## Open questions

- Section word: "Needs you" or "Needs attention" (C, B).
- Track broadcast work to completion or only pending dispatch (B).

## Where slots differ

- Parked dependency: attention (A,C) vs Waiting (B).
- Dead land: attention (A,C) vs Waiting (B).
- Merged leaves: Done line (A,C) vs hidden with broadcast exception (B).
- Header count: all problems = dot (A,C) vs task-only (B).
- Seat in the waiting reason: producer `waits_on` (A,C) vs generic (B).
