# Map A: Tamdoma/akrogon#42

Destination: one issue, one leaf in akrogon. Broadcast fires for a standalone issue on completion, for an epic only once when every epic leaf is merged.

## Forks
1. Completion line. `src/phase.ts:170` prints `issue complete <issue>` before the `if (!complete) return` at :171.
   - 1a (rec) Standalone prints `issue complete <issue>` unchanged. Inner issue prints nothing. Completing epic prints `epic complete <epic>`. Terms stay accurate.
   - 1b Move the log after the return and print `issue complete <owner>`. Smallest diff, but calls an epic an issue.
2. Brief gathering. `skills/merge-issue/SKILL.md:47` gathers "the completed issue's briefs" before the folder may move. For an epic the broadcast needs every epic leaf's briefs.
   - 2a (rec) Gather the completion owner's briefs (epic if any, else issue) before `merged`. All are in `issues/open/<owner>/` at the registered root.
   - 2b Read from `issues/closed/<owner>/` after the move. Changes an existing ordering rule for no gain.

## Settled by intake
- One broadcast covering the epic (seed Expected behavior).
- Standalone behavior unchanged.

## Pitfalls
- Tests `tests/phase.test.ts:179,181,610,646` and `tests/next.test.ts:844,1007` assert `issue complete <inner-issue>` for epic fixtures. They must flip to the new rule, not be deleted.
- Race test at :178 (two concurrent merges) must still produce exactly one completion line.
- Wording sweep: `skills/merge-issue/SKILL.md:3,47`, `skills/broadcast-issue/SKILL.md:3,10,14`, `docs/guide/merge.md:20-23,36,69`, `docs/guide/limits.md:38`, `docs/guide/cheat.md:125`, `docs/guide/idea.md:89`, `README.md:188`.
- Recovery callers (`src/phase.ts:282`, `src/next.ts:521`) pass `justMerged=false` and must keep printing nothing.

## Off route
- GitHub source closing per issue inside an epic (`closeSources` at :160) is unchanged. The seed is about broadcast only.
- Discord sender script untouched.

## Fog
None. No external operation changes, so no operation proof needed.
