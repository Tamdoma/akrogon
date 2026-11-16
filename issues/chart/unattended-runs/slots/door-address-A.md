# door-address, slot A notes (blind)

Q1 pick: `$HC_TERMINAL_ID`, read at each use. One sentence in SKILL.md `## Open`: the door's address in every rule (column helper, restart helper, report step, mode and seat entries) is `$HC_TERMINAL_ID` as read at that moment; a recorded address (summary, seats.yaml, mode record) is history and is never used as the door's address. Rejected: check a recorded value against the env (two sources where one suffices). Evidence: better-than-training, skills/chart-issues/SKILL.md `## Open` uses `HC_TERMINAL_ID` only to detect hc; report #138. Pitfall: a brief written before compaction holds the old address; removed because a new exchange always gets a new brief (questions.md rule) written with the live value.

Q2 pick: no change. With the live address, a "door not in a tab" exit can only mean a live tabless door, so the dead-address case is gone. Rejected: make the helper tell dead from tabless (another repo, signpost 2a).
