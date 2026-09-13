# Chart: loop-hardening

## Destination
Epic `loop-hardening`: sync commits only issue records from the default branch, dispatch continues past one bad record and warns about stalled seats and failures once, completion closes GitHub sources per owning issue before any folder moves, invalid trees and key mismatches fail early with named paths, reviewers cannot deadlock, dead state fields are gone, and the README lists every verb and the intake routing.

Issues and leaves (all parallel unless noted):
1. `record-sync` (#7): `scoped-branch-sync`, `worktree-root-ignore`
2. `dispatch-progress` (#6, #9, #11): `isolated-dispatch-errors`, `fetch-deadline`, `seat-guards`, `failure-signals`
3. `recoverable-completion` (#5, #13): `resumable-source-closure`, `discord-chunk-report`
4. `lifecycle-records` (#8): `tree-preflight`, `repo-identity`, `dead-fields`
5. `command-outcomes`: `argument-and-response-errors`, `command-reference` (blocked by `scoped-branch-sync`)
6. `review-protocol` (#12): `blind-initial-review`

Epic owns #10 and #14; each issue owns the sources listed.

## Forks taken
- [How are the ten reports grouped?](forks/split-epic.md): epic with six issues.
- [Sync branch and scope](forks/sync-branch-scope.md): refuse off default branch, commit only issue records, global then repo lock, ignore configured worktree root.
- [Dispatch error report](forks/dispatch-error-report.md): per-scope stderr JSON, nonzero aggregate, unreadable occupancy counts as active.
- [Stall signal](forks/stall-signal.md): notify and show duration after 60 minutes busy, no interruption.
- [Failed notice once](forks/failed-notice-once.md): delivery recorded in state per failure episode.
- [Source owner closure](forks/source-owner-closure.md): close issue-owned sources at issue completion, before any rename, completion sweep before cleanup.
- [Repo field](forks/repo-field.md): key stays enforced, clearer mismatch and relocation messages.
- [Blind review](forks/blind-review.md): no peer questions in check.review.
- [Discord chunk stop](forks/discord-chunk-stop.md): keep stopping, report counts.
- [Tree preflight](forks/tree-preflight.md): reject bad depth at read, refuse closed-name reuse at handoff, name parked in Missing leaf.
- [Extra panes](forks/extra-panes.md): ignored, seats stay recorded.
- [Dead fields delete](forks/dead-fields-delete.md): remove priority and slot everywhere with a migration pass.
- [Pull origin](forks/pull-origin.md): keep origin, document remote and issues_repo routing.

## Forks open
None.

## Fog
None.

## Off route
- Pi and codex skill folders: settled and closed in `install-prune-dead-links`.
- shapes.md state template: consistent as written.
- `logMove` after commit: intentional and tested; leaf `argument-and-response-errors` only makes the committed move distinguishable in the error.
- Missing-seat guard in `dispatchSlot`: unreachable without hand-edited state.
- Priority scheduling: fields are deleted instead.
- Switching intake to the configured remote.
- A rename or relocation command for repos and worktrees.
- Durable Discord delivery ledger.

Handed off 2026-09-11 into `../../open/loop-hardening/`.
