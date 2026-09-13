# When do GitHub sources close and what does the broadcast mean?

## Question
Inside an epic, does a source close when its issue completes or when the epic moves?

### Carries
shapes.md:163 permits issue or epic ownership. `src/phase.ts:64-76` prints `issue complete` per issue but closes sources only at the epic move. Operator direction: no complication.

## Findings
(both) `issue complete` prints before the owner check and before closure can fail; merge-issue keys its broadcast on that printed line. (B) per-issue broadcast is intentional and tested. (A) with epic-only closure, #7 stays open on GitHub until all six issues merge.

## Taken
Operator 2026-09-11: `6a` after asking for the reason despite new code. Reason accepted: sources should not stay open for days after their fix ships. Rule: when every leaf of an issue is merged, close the sources that appear in every leaf of that issue and in no sibling issue of the same epic; the remaining sources close when the epic moves. Sources close before any folder rename, so a failed closure leaves the owner in open with merged leaves and the next sweep retries; the completion sweep runs before merged-worktree cleanup so the merge commit is still available. `issue complete` prints only after that issue's own closures succeed. Broadcast means shipped work of that issue. Foreclosed: one epic-level closure and broadcast.
