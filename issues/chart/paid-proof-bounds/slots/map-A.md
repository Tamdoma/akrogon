# Map A (written before reading B and C)

## #102 strict state parse
Confirmed. `stateSchema` is `z.strictObject` (src/state.ts stateSchema); `readState` drops four legacy keys by hand; `allLeaves`/`leavesUnder` parse every leaf, so one bad leaf throws for every command.
Root: two jobs share one parse. The inventory (all leaves) and the leaf being acted on use the same strict parse. Also any seat can write state.yaml.
Removal candidate: switch to a stripping `z.object` and delete the hand-made skip list. Cost: saveState then silently deletes unknown keys (user rule: never silently ignore) and typos in command-owned keys stop being caught.
Alternative: keep strict, make the failure local (inventory names the bad leaf and skips it, commands on that leaf refuse). Adds code.
Forks: F-102a strip vs strict-local; F-102b whether seats must be stopped from writing state.yaml (guard or prompt text).

## #103 sourced completion needs a worktree
Confirmed. `closeSources` (src/pull.ts) reads the commit with `git rev-parse HEAD` in `leaf.state.worktree`; `removeMergedWorktree` (src/reconcile.ts) clears `worktree`. `completeOwner` (src/phase.ts) is re-run on every pass for merged leaves (src/next.ts merged branch, src/phase.ts phaseCommand) and, in an epic where one issue is fully merged but the epic is not, re-closes `privateSources` every pass. With the worktree gone it throws.
Deeper: the commit is read from a mutable checkout instead of being a recorded fact, and completion re-closes already-closed sources each pass. In an epic the `remaining` close uses whichever leaf triggered completion, so the cited commit is arbitrary.
Removal candidate: drop the commit read from the worktree. Use what the merge already recorded, or close with the default-branch tip. Forks: which commit identity (recorded merged SHA in state vs merge-attempts record vs main tip); whether completion stops retrying sources already closed.

## #104 merge stacks almost never land
Confirmed by data in the seed (31/32 red). `pickMembers` (src/batch.ts) takes every waiting leaf; no culprit; red heads excluded only on same built_on.
Removal candidate: delete merge stacking entirely (src/batch.ts 188 lines, ~106 batch references across next/phase/reconcile/status, state.batch, attempts members). Solo merges already carry the queue (139 of 143 merges). Alternatives: cap stack size, bisect, exclude recent reds. All add code on top of a feature with a 3% hit rate.
Forks: delete vs cap; what the merge-attempts/timing records keep; check earlier charts (merge-throughput, merge-green-rate, merge-covers) whose Taken answers created stacking.

## #105 done-criterion command red at base
Partly a charting failure: shapes.md already forbids criteria naming a test file; the framework criterion named three test files. check-issue's known-red step covers only `checks`, so a red criterion command sends A to the operator.
Removal candidate: none in code. Options: extend the existing known-red step to a criterion's own command (reuse `akrogon verify --known-red`), or have the door run each literal criterion command on base before handoff (adds a proof step).
Fork: where the class is closed (charting audit vs check-issue known-red vs both).

## #106 sync refuses identical ignored files
Confirmed. src/sync.ts `integrate` marks every ignored path inside the incoming tree as a collision with no content check.
Fix: a content-equal file is not a collision (compare blob id via `git hash-object` against `git ls-tree` of incoming). Small addition, no removal available, because git checkout overwrites ignored files silently, so the guard is needed.
Fork: none material. Direct-route candidate.

## Shared mechanism
#102 and #103 share one root: state.yaml is the only record and a single bad or missing field makes repo-wide passes throw. #104 is independent. #105 is skill-only. #106 is independent and small.

## Split
1. state-parse-isolation (#102)
2. sourced-completion (#103)
3. merge-stack-removal (#104)
4. criterion-known-red (#105)
5. sync-identical-ignored (#106), direct route
