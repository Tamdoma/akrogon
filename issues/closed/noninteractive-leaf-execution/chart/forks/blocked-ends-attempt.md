# How a blocked seat ends its attempt

## Question

### Q1 · Who ends the attempt when a seat is blocked: akrogon on the `blocked` event, the seat by declaring the blocker, or both?
### Q2 · Does the ended attempt reuse `failed` with a recorded reason, or get a new state such as `needs-operator`?
### Q3 · What must the stop preserve: worktree and partial commits, the interrupted phase, the blocker text, and who authorizes the next attempt?

### Carries
- Lock 2026-09-18: no hidden watchdogs, clocks or polling (`../../seat-stall-detection/`).
- Lock 2026-09-18: the 60-minute busy notice stays (`../../stall-notifier-removal/`).
- Operator 2026-09-19 verbatim: "it shouldn't be asking me questions anyways. No questions after chart-issues".
- Related: `ask-tool-availability.md`, `push-notification.md`.

## Findings
- (both) `blocked` is busy (src/next.ts:169-173). The blocked status event reaches dispatch (src/next.ts:604-607) and dispatch waits.
- (B) `implement -> failed` is illegal (src/routing.ts:26-38, src/phase.ts:106-108). Only the three-attempt cap produces failed (src/next.ts:383-385), and dispatchSlot returns for a blocked pane before reaching it. A skill cannot end its own attempt today.
- (B) tests/next.test.ts:1565-1596 keeps a blocked inactive peer from failing the current pass. The rule must apply to the required seat of the current phase only.
- (A) `failed` already routes back to every phase (src/routing.ts:35-38) and status shows it distinctly. A reason field on failed is the smallest addition. (B) agrees if the reason, interrupted phase and safe resumption are retained without new counters.
- (both) The stop must not run requireClean or delete the worktree; a failed leaf keeps pane/tab/worktree for cleanup (src/next.ts:509-515).
- (B) `unknown` must not be treated as human-blocked.

## Taken
2026-09-19 operator: "1a | 2a | 3a".
- Q1: both entries, one operation. `akrogon phase <slug> failed --reason <text>` becomes legal from every active phase; akrogon runs the same move when the required unfinished seat of the current phase reports `blocked`. Foreclosed: event-only (hidden retry loop up to the attempts cap), a new stop command.
- Q2: reuse `failed` with a typed cause (`blocked` | `attempts`), interrupted phase, seat and text; status shows the cause; stop and merge clear live busy fields (busy_since, busy_notified, prompted, prompted_at) and keep pane, tab, worktree. Foreclosed: a `needs-operator` state.
- Q3: the stop keeps files, uncommitted changes, commits, worktree, phase, seat and blocker text; skips requireClean; never commits, cleans or answers. Restart is explicit `akrogon phase <slug> <phase>` by the operator. Foreclosed: automatic restart on idle. If the event carries no explanation the record says so.

## Taken (correction 2026-09-19)
Operator, after Tamdoma/akrogon#21 (herdr `blocked` also fires when a subagent child asks its parent): "1a" on O1, drop the event-driven entry. Verbatim: "Seed that problem into pi-extensions. The herdr blocked cannot work like this. The child asking the parent is not a blocking event." Q1 now: the seat-declared stop is the only entry; akrogon never reads `blocked` to end an attempt. Foreclosed: the blocked-seat-stop leaf. Seeded as Tamdoma/pi-extensions#1.
