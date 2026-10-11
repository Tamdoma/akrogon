# Issue: night-flow

- [plan-not-cap](plan-not-cap/brief.md): the fix-round cap no longer fails a leaf; a repeated problem goes back to A as a plan correction
- [guard-at-creation](guard-at-creation/brief.md): the ancestor guard runs only at worktree creation, and base copies are made only through `akrogon base-run`
- [seat-retry](seat-retry/brief.md): seat start and prompt faults retry on the next pass instead of failing the leaf
- [locked-setting-proof](locked-setting-proof/brief.md): a locked third-party setting is proven in its exact locked form at charting
- [records-sync](records-sync/brief.md): every registered checkout pushes its committed issue-record history and follows main without touching uncommitted edits
- [watch-steady](watch-steady/brief.md): the watch never deletes itself and skips paused repos
- [pass-refresh](pass-refresh/brief.md): every A pass rebases onto current main at its start and before its final proof, so a sibling's change is fixed before review
- [cheap-check-placement](cheap-check-placement/brief.md): every repo's cheap checks run in the leaf's own check before review, never only at merge
