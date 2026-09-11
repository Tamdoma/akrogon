# Design: resumable-source-closure

## Binding decisions, verbatim

# When do GitHub sources close and what does the broadcast mean?

## Question
Inside an epic, does a source close when its issue completes or when the epic moves?

### Carries
shapes.md:163 permits issue or epic ownership. `src/phase.ts:64-76` prints `issue complete` per issue but closes sources only at the epic move. Operator direction: no complication.

## Findings
(both) `issue complete` prints before the owner check and before closure can fail; merge-issue keys its broadcast on that printed line. (B) per-issue broadcast is intentional and tested. (A) with epic-only closure, #7 stays open on GitHub until all six issues merge.

## Resolution
Operator 2026-09-11: `6a` after asking for the reason despite new code. Reason accepted: sources should not stay open for days after their fix ships. Rule: when every leaf of an issue is merged, close the sources that appear in every leaf of that issue and in no sibling issue of the same epic; the remaining sources close when the epic moves. Sources close before any folder rename, so a failed closure leaves the owner in open with merged leaves and the next sweep retries; the completion sweep runs before merged-worktree cleanup so the merge commit is still available. `issue complete` prints only after that issue's own closures succeed. Broadcast means shipped work of that issue. Foreclosed: one epic-level closure and broadcast.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): discord-chunk-stop (discord-chunk-report); dispatch-error-report (isolated-dispatch-errors)

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

### Current interpretation

Chunk terminology above refers to this leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands (`bun run format`, `bun test`, `bun run typecheck`). Known human-only prerequisites are named and completed before opening a leaf; none exists for this leaf. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

## Leaf architecture

Owned surfaces: `completeOwner` in `src/phase.ts`, `closeSources` signature in `src/pull.ts` (takes the explicit set of sources to close plus the worktree for the commit), the `--all` branch order in `nextCommand` and `cleanupMerged` skip rule in `src/next.ts`, tests. Ownership derivation: for an issue folder, `own = sources present in every leaf of the issue` minus `sources present in any leaf of a sibling issue`; for an epic, everything remaining once every issue is merged. No stored owner metadata. Order inside `completeOwner`: derive, close, print `issue complete`, then rename issue-or-epic as today, then move the chart. A merged leaf whose issue is complete but whose sources failed stays in place; the sweep retries because `dispatchLeaf` calls `completeOwner` for merged leaves.

Exclusions: error isolation around the sweep belongs to `isolated-dispatch-errors`; Discord chunk reporting to `discord-chunk-report`; the merge-issue skill text is unchanged because it already keys on the printed `issue complete` line.
