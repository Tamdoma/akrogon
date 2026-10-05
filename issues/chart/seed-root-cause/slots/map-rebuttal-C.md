# Rebuttal C: merged opening map

Disagreements only. Line numbers refer to `slots/map-merged.md`. "Map C" is my blind map.

## Misattribution

- D1. Line 18 tags (B,C) on "Effective Troubleshooting ... test hypotheses against disconfirming evidence, beware coincidental correlation". Map C cited only the Postmortem Culture chapter, for two points: the cause record is written after the event, and it holds "the root cause(s)" plural. I did not read Effective Troubleshooting. The hypothesis-testing and correlation points should be tagged (B). I do not dispute them.

## Misstatement

- D2. Line 35 pairs "noisy related lists" with the guard "search scoped to the routed repo only" and tags (B,C). Map C's pitfall under O8 was different: keyword search misses issues that share a cause but not a symptom. The four #56 symptoms (variants block close, phases close on history, motion CLI false failures, photo-path conflict, `issues/seeds/56-seed-issue-files-symptoms-only-intake.md:11`) share no keywords. Repo scoping does not remove that. The session list is the part that catches the #56 case, so fork 3 should not treat the repo search as the main mechanism.

## Omitted material points

- D3. Compaction loses the session links. The earlier issue URLs exist only in the conversation (`skills/seed-issue/SKILL.md:61` returns each URL). After compaction the skill re-reads only itself and the reporter's supplied context (`:6`). Without a rule change, the same-session half of fork 3 fails in the long sessions where several related failures are most likely. Belongs in fork 3 or the pitfalls.
- D4. Stale hypothesis in the body (Map C R6). Line 41 lists comment mirroring as off route, but the pitfall stays on route: the mirror re-copies the body on every pull (`src/pull.ts:67,72`), and a correction made in a comment never reaches the door (`:57`, body only). If comment mirroring stays off route, the map needs the other guard: corrections edit the body, and the door treats the section as dated.
- D5. Fork 5 has a trigger gap. chart-issues imports mirrored seeds "only when the door opens without an operator note or the note asks for them" (`skills/chart-issues/SKILL.md:31`). A door opened with a note about one symptom never sees the sibling seeds, so grouping by cause would not run. Fork 5 should ask whether a seed's related links pull the linked seeds into the intake.
- D6. No fork asks whether the portability rule returns. Line 8 records it as removed and only says not to restore the script. Map C raised it as Q3: it pushes a report toward the failed pattern without any diagnosis and costs one sentence. It belongs under fork 2 as an option.

## Recommendations

No disagreement with the fork order or the recommended split in fork 1. On fork 2's open point I hold "optional, Not provided legal" against B's "always present": a mandatory field gets filled, and `skills/seed-issue/SKILL.md:28` already forbids inventing missing details.
