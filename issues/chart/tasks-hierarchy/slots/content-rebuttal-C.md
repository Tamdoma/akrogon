# Content rebuttal C on content-merged.md

- K1 "stopped (A,C)": I withdraw C's tag. A stopped leaf is an operator-set hold in the global `stopped.yaml` (`src/stop.ts` stopFile, stopSchema keyed repo/slug), so B is right that it is not a problem. It belongs with K5 (paused or parked) as a row fact, grey pill as now (`model.js` leafRow).

- N7 "short plan path ... (A,C)" and "last 3 moves": C's position is that the plan and worktree paths leave the board as text entirely, since the Files and Changes buttons are the action (content-C, section 2 "Never"), and that the history stays on demand at its current depth. Tag the short-path and last-3 options (A).

- Pitfall "no 'needs me' from an idle seat or a phase (A,B,C)" is phrased too wide. "Between seats" (K4) is itself derived from an idle required seat plus the phase: akrogon's own watch rule defines Waiting as "at least one required unfinished seat is idle or absent" with the required-seats-by-phase table (`skills/watch-issues/SKILL.md` Judge). What cannot be derived is whether a dispatcher will come, which is N3's fork. Narrow the pitfall to: K4 may be derived from `busy_since` and the phase's required seats; "needs me" for K4 needs the producer's dispatch time (N3 O3) or the operator's answer.

- K6 "stays out, Last merges was removed (A,B)" conflates two things. Last merges was the envelope `merges` list (last five merged across repos). Merged leaves still under `issues/open` are in `repo.leaves` and are rows on the board today, muted slug, no pill (`model.js` leafRow, tests 'pill maps stage words to ANSI slots and merged to none' and 'paused repository rows use grey pills and merged rows retain no pill'). Dropping them is a new removal the operator did not ask for, and it hides an epic's progress (three of five merged). C's one dim line per repo keeps that fact in one row.

- N1 B's "category sections split siblings and move rows": the Agents list beside Tasks moves rows between Needs you, Working, Done and Idle on every status change (`mods/agents/main.js` SECTION, status()), and the operator accepted that there. Siblings under one epic already differ by state and by pill; the row key is repo/slug (`main.js` row, `key`), so expand and pin survive a move (test 'same slugs in different repositories expand and pin independently').

- N8 "current repo only (A option)": the panel-bar dot counts `envelope.red` across every repo (`panel-bar/routine.js` redDot; `status.ts` envelope `red`). A current-repo-only board shows a red dot with no red row to find. The option breaks the count-equals-dot rule the merged map lists under Missing.

- Missing item dropped from C: which seat the phase waits on. The pill says "check" for both check.review (A and B) and check.repair (B only) (watch-issues Judge, required seats by phase). B's "exact subphase" item covers the phase word; the seat the operator would look at is the other half, and the envelope carries it (`seats`, `busy_since`).
