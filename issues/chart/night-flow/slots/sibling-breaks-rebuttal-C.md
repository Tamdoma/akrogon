# Rebuttal, slot C: sibling breaks

Read 2026-10-11. Disagreements only, plus one correction of my own reason.

## D1 Start and end (A,C) versus before handoff only (B)
- RB1 B's shape drops a rebase the skill already requires: a merge-origin `check.fix` fetches and rebases before judging the failure and replays the recorded command, and "a green replay needs no repair" (`skills/implement-issue/SKILL.md:78`). Without the start rebase A repairs against the stale tree, then meets the sibling's change on top of the fresh fix at the end rebase, and the replay can no longer tell A whether the sibling's change alone was the red. The start rebase is what makes the end rebase cheap.

## D2 Merge reds to B's check.repair (B) versus A's check.fix (A,C)
- RB2 Correction of my own reason: "puts the reviewer in the author's seat" was wrong. B already authors repairs in `check.repair` (`skills/check-issue/SKILL.md:81-89`: B commits each Fix, runs proof and every `checks` command, hands the rest to A). The merged notes carry that wrong reason at `:21`; drop it.
- RB3 The rejection stands on the measured cost. The ejected worktree is restored to the pre-restack head (`src/phase.ts:1021-1025`, `restoreHolder` then `transition(... 'check.fix')`), so whichever seat repairs must fetch, rebase, replay and prove, the 9 to 15 minutes in every completed cycle (`framework/issues/log.jsonl:2382-2389,2414-2424`, `akrogon/issues/log.jsonl:751-756`). Moving that work from A to B saves one seat launch and the one-minute re-check and costs a hardcoded route (`src/phase.ts:1025`), `src/routing.ts:35,38`, three skills and a doc. It also sends a plan-level case like check-scratch (`check-scratch/review-B.md:585,589`) through B first and then to A, one hop more than today.

## D3 Naming siblings (B) versus no new rule (A,C)
- RB4 B's rule "the producer's design names the affected leaves" cannot name the case that happened: `dispose` entered main in `ecdc13a6d`, a repair commit answering a B finding (recording-consumers `review-B.md:26-34`), after that leaf's design was written. A naming duty that fires only for the foreseeable half, and is paid on every design, is not holistic.

## Lines that misstate my notes
- RB5 None found. `:8` cycle times match mine to the tenth of a minute; `:11` names recording-consumers as the producer, which my note left unnamed and which its `review-B.md:26-34` supports.
