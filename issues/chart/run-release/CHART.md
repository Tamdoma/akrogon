# Chart: run-release

## Destination
The installed `akrogon` command runs a complete release built from merged main, behind one `current` pointer. A workspace edit never goes live, never blocks a deploy and is never undone into a "revert". Work, charts and records stay in the workspace.

Route: undecided

## Forks taken
- [run-location](forks/run-location.md): release folders behind `current` (O1b).
- [release-shape](forks/release-shape.md): state to `~/.akrogon` first; keep current + previous, delete others 24 h after replaced; failed build keeps current and shows in status; `akrogon rollback` with a hold on the bad commit.

## Open forks
none

## Fog
none

## Off route
- Compiled single binary, read-only files, dirty-root refusal, stash/reset on update: see run-location Foreclosed.

## Pending steps
none
