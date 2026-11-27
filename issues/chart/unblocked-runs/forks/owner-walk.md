# Plain files beside owner folders (#163)

## Question

How does `slugLeafFolders` skip plain files under `issues/open` and `issues/closed`?

### Carries

Signposts 2a, 5a. Related: forks/direct-session.md (same leaf).

## Findings

Merged notes `slots/forks-merged.md` § Fork owner-walk (A,B,C agree; no rebuttal). Every other owner walk already skips files (`readInventory`, `leafFolders`, `isParked`, `src/status.ts`); `slugLeafFolders` is the only one that does not (B's audit, C's audit). C ran an inline Bun check: `statSync('README.md/unused', {throwIfNoEntry:false})` throws ENOTDIR.

## Taken

A's pick (full autopilot), 2026-11-25: `slugLeafFolders` iterates owners through the existing `issueFolders` (`src/park.ts`, already imported by `src/state.ts`), keeping its open-draft and closed-with-state rules. Reason: signpost 2a, reuse the helper every neighbour uses. Rejected: catching ENOTDIR (still walks files, can hide a bad area root); the full inventory (needs draft support). No standing dissent. Accepted cost: symlinked owner folders are no longer followed, the same as every neighbouring walk.
