# Growth notes, slot A

## Q1 job grows
- Pick: stop and ask. When the door finds the job needs something eligibility 1a refuses (an input, grant, live call),
  a second outcome, or a still-open decision, it stops coding, commits the WIP on the branch, writes `Held <date>` with
  the reason in CHART.md (the existing marker, last marker authoritative), and reports. The operator then picks: reopen
  charting (new fork), or hand off as a normal leaf. On handoff, the leaf starts at plan.synthesis like any leaf; the kept
  branch is named in the brief as a reference only and deleted by the door; the leaf builds from the chart decisions.
  Double execution is impossible because `Held` ends the direct route and a leaf exists only after a normal handoff.
  Reason: no silent route switch; existing markers. Cost: WIP may be redone by the lifecycle.
- Rejected: adopting the branch into a leaf worktree (ensureWorktree reuses a matching branch, src/next.ts:284-288):
  unreviewed partial code would enter the lifecycle as if planned.
- Rejected: door keeps going and widens scope: violates eligibility.

## Q2 repair rounds
- Pick: one round = B returns `fix` and the door repairs. Bound = repo `fix_rounds` (default 3, src/config.ts:43).
  Exhaustion: `Held` with B's open Fixes; operator chooses lifecycle handoff or more rounds. Push rejections count
  separately: 2 non-fast-forward refusals in a row, then `Held` with the branch kept.
  Reason: one existing knob; the same meaning as lifecycle (B-to-A repair handoff, src/phase.ts:301).
- Rejected: a separate direct-only bound key: new config for a hypothetical.
