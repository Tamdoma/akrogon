# Parallel implement workers share one scratchpad

## Case

Leaf `build-pictures` (2026-11-27) ran implement-issue in delegated mode: two Claude subagent workers in one wave, each in its own worktree (`build-pictures-u1`, `build-pictures-u2`). Both kept helper files (`style.txt`, `build.sh`, `mark.txt`) in the parent session's scratchpad directory, which every subagent of that session inherits. They overwrote each other's `build.sh` and `style.txt`. Worker 1 put its own `.code` and `.frame` style rules back into the shared `style.txt`, and worker 2's build script read that file.

## Evidence

- Worker 2 return: "The scratchpad is shared with the page-09 worker. I overwrote their `style.txt` once".
- Worker 1 return: "Unit 2's worker uses the same scratchpad ... we overwrote each other's `build.sh` and `style.txt`".
- `implementation/report.md` of build-pictures, Known limitations, third item.

## Learning

Separate worktrees do not separate a session's scratchpad or a shared `$TMPDIR`. Parallel workers that keep helper files there can read a sibling's version without noticing. The harm here was only stray CSS classes, but a shared build script or fixture would carry wrong content into a worker commit. A sub-brief for a parallel wave can name a per-unit temp folder (for example `<scratch>/u<N>/`) or tell the worker to keep helpers inside its own worktree, untracked.
