# Territory map B: #42

Independent inspection. No slot A work read. No locks supplied. The intake already settles the outcome: standalone issues broadcast on completion; epic members stay silent until the whole epic completes, then one update covers the epic.

## Material fork

**Q1. What signal should authorize the final epic broadcast?**

- **O1 (recommended):** Keep `issue complete <name>` as the existing trigger, emit it only after `complete` is true, and use `basename(owner)`. Standalone output stays unchanged; an epic emits its own name once. Clarify in the skills and guide that this signal identifies the completed top-level issue or epic. This is the smallest contract change.
- **O2:** Emit `issue complete` for standalone issues and `epic complete` for epics. Clearer labels, but requires teaching every consumer both triggers.
- **O3:** Preserve intermediate issue messages and add a separate broadcast signal. Adds another event contract without a requested use for intermediate messages.

Evidence: `src/phase.ts:144-146` already calculates the correct owner and completion condition; `src/phase.ts:169-172` emits the wrong name before checking completion. `skills/merge-issue/SKILL.md:47` and `skills/broadcast-issue/SKILL.md:10` consume the existing token. Repository search found no other production consumer.

## Practitioner questions

- **Q2. Will the final merge seat have the entire epic's context?** It must gather every constituent issue's briefs before the owner folder moves, then supply that context to the broadcaster. Gathering only the final issue would produce an incomplete update. Evidence: `skills/merge-issue/SKILL.md:47`, `skills/broadcast-issue/SKILL.md:14,23`, `src/phase.ts:172`.
- **Q3. Does suppressing broadcasts also postpone private GitHub source closure?** It should not. Keep source closure before the incomplete-owner return. Evidence: `src/phase.ts:149-167`; `tests/phase.test.ts:608-613,644-649` explicitly verify early private closure and final epic closure.
- **Q4. What proves the changed boundary?** Adapt the existing concurrent epic completion test: no trigger for the first finished issue, one trigger naming the epic after its final leaf, no replay, unchanged standalone trigger. Preserve source-closure assertions while changing their output expectations. Evidence: `tests/phase.test.ts:169-191,610,646`; standalone integration coverage: `tests/next.test.ts:844,1007`.

## Pitfalls

- **R1:** Moving only the print below the completion guard still names the final child issue. Use the owner name (`src/phase.ts:144,169`).
- **R2:** Moving the completion guard above source closure breaks existing private-source timing (`src/phase.ts:162-170`).
- **R3:** Removing `justMerged` replays announcements during recovery. Only the merge transition passes true; phase retry and dispatch pass false (`src/phase.ts:126,282`, `src/next.ts:521`).

## Off route and fog

Discord transport, delivery records, retry policy, cleanup, folder layout and GitHub closure redesign are outside this fix. Recovery already suppresses announcements after closure failures (`tests/phase.test.ts:690-717`); reliable eventual delivery would be separate work. One logical update can already span multiple Discord posts (`skills/broadcast-issue/SKILL.md:23`).

No mechanism fog remains. Q1 is a narrow signal-contract choice, with O1 recommended. Q2 is required by the intake's whole-epic scope, not another product choice. This remains a small code/test change plus the directly affected skill and guide wording (`skills/merge-issue/SKILL.md:3,47`, `skills/broadcast-issue/SKILL.md:3-14`, `docs/guide/merge.md:19-36,69`).
