# Merged map (A, B)

## Split
- Two independent issues, one leaf each, destination akrogon, no blocked-by (A,B). Debate no (A).
- #54: issue door-peer-turn / leaf peer-turn-wait (A); B named it chart-peer-turn. Scope: full rule in questions.md Blind peer exchange, short references in SKILL.md Drain/Take, footer restriction (A,B). Keep the peer-wait lock unchanged (B).
- #55: issue stale-tab / leaf phase-stale-tab (A); B named it phase-missing-tab. Covers both rename sites, phase.ts:72-83 and :109-120 (A,B). next.ts owns re-allocation, phase does not recreate tabs (A,B).

## Fork 1 (#54): what A does while a prompted peer works
Evidence: transcript 858cdae8 rows 591-609. Background wait, then footer "Next: none, waiting on B", then the notification was queued only after the operator returned (A,B). The loop required file AND idle, against the rule's file OR idle (B).
- 1a (A,B, recommended): A stays in its turn. Foreground bounded `herdr agent wait <pane> --timeout <T>` (T at most 30000 after prompting). After each timeout, check the return file. On idle or a non-empty file, read it and continue to merge, rebuttal or final check. A timeout is a polling interval, not a reason to stop (B). Completion is file OR idle (B). Idle with no file = peer failure (A,B). Each exchange uses a fresh return path (B). Background waits and a footer naming a pending peer are not allowed. A ends its turn only for an operator round, a peer failure or a blocked peer (A,B). Covers maps, rebuttals and final checks (B).
- 1b (B): A may end its turn only after a harness mechanism that resumes A is installed and proven.
- 1c (A): new `akrogon peer-wait` command. A still has to be told to stay in its turn.

## Fork 2 (#55), next round, open disagreement
- A: list live tabs first, rename only a live recorded tab.
- B: rename and treat only a structured `tab_not_found` as an absent tab, with a structured warning. Other herdr, notification and log failures still fail. B notes that list-first has a race (the tab can close between list and rename).
