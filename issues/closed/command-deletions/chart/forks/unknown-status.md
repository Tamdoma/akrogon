# What does dispatch do with a pane herdr cannot classify?

## Question
Q1 · When a seat's pane reads `unknown`, does dispatch wait as if the seat were busy, or count an attempt and re-prompt the same pane?

### Carries
- Lock: two blind slots. A slot is prompted only in its own pane; `seatFor` and `peerOf` go in every outcome.
- Lock: no watchers or timers. The 60-minute busy notice is the only stall signal.

## Findings
- `busy()` is working or blocked, `idle()` is idle or done (src/next.ts:166-171). `unknown` is neither, so the `!idle` branch in `dispatchSlot` (:390-397) sets attempts to 2 and re-loops into `seatFor`. That branch is the whole stand-in path.
- akrogon `status` and `init-issues` reached A:3 within 144 s and 139 s of entering check.review; only this path is that fast. framework `batch-skills` lines 70 and 71: session d450 recorded B's fix and then A's approval.
- `observeBusy` returns before starting the busy clock when `!busy(pane)` (:186), so an unknown pane today never triggers the notice.
- herdr defines `unknown` as present but unclassifiable, not proof of completion. Re-prompting it injects text into a session that may be mid-turn, which is how one session wrote both blind reviews.
- If `busy()` includes `unknown`, the status enum (idle, done, working, blocked, unknown) leaves the `!idle` branch unreachable, and it is deleted with `seatFor`, `peerOf` and the merge-seat early return at :503-508.
- Operator round 1 (2026-09-14), verbatim: "1 - do you think this is wise, and why?". Not a choice; re-asked in round 2 with A's reasoning: `unknown` is not a failure signal, waiting sends nothing and needs no undo, re-prompting an unclassifiable pane rescues nothing and can land in a mid-turn session, and the only cost is the hour before the busy notice for a pane that stays unknown.

## Taken
Operator answer (2026-09-14): `1a`, after asking for the reasoning in round 1. `busy()` includes `unknown`: the seat waits, the busy clock starts, the 60-minute notice covers a pane that stays unknown. `seatFor`, `peerOf`, the `!idle` branch and the merge-seat early return are deleted. Reason: `unknown` is not a failure signal, waiting sends nothing, and re-prompting cannot rescue an unreadable pane but can corrupt a mid-turn session. Foreclosed: counting `unknown` as an attempt.
