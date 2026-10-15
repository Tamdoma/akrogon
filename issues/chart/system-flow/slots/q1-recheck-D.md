# Q1 re-check, seat D (9a99be0)

D1, D3, D4 resolved. D2 is resolved as a trigger but its wording opens a new conflict:

- `skills/chart-issues/SKILL.md:47` "waits on an operator action" also describes every presented round (assets/questions.md:31 "wait for the operator's answer") and the attended handoff review (`:69`). Read literally, the door moves to the next chart after presenting each round, which is the mixing the operator's answer rules out. Name the waits: an asynchronous approval or a needs-sheet item (`:59`), a human-only prerequisite (`:59`), a grant awaiting approval (`:61`); a presented round or handoff review is never one.
- Same line: when that wait clears, the parked chart should be next before the earliest-committed open chart, else a chart whose approval just arrived queues behind stale charts (13 of 16 not-ended framework charts, several from 10-01). One clause: "a chart whose wait has cleared comes first".
