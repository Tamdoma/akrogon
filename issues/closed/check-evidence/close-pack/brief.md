# Brief: close-pack

## What
When an issue or epic completes, completeOwner packs every `*.log` under the owner into `<owner>/evidence.tar.zst`, verifies each member through the log-reader resolver, deletes the plain logs, and only then moves the owner to `issues/closed/`. A `.closing` marker guards the window. `akrogon run-check` refuses to write into a closed or closing owner. `akrogon init` adds ignore lines so plain logs of open, parked and chart-direct folders are never committed. The pack is one exported function that folder-pack's `akrogon pack` reuses.

This leaf consumes from [log-reader](../log-reader/brief.md) the resolver's `locate` (recorded path to owner folder and member) and `readMember` (one member from `evidence.tar.zst`); the read-back before each delete goes through them.

## Why
Every check run today adds its full log to git; framework holds 944.9 MiB of tracked logs. One archive per closed owner at zstd level 19 cuts that to about 23 MiB while every recorded path stays readable through `akrogon log`.

## Done-criteria
1. After the last leaf of an owner moves to `merged`, the folder under `issues/closed/` holds `evidence.tar.zst` containing every `*.log` that was under the owner on disk (nested folders and dotfiles included), with member names relative to the owner folder, and no plain `*.log`; `akrogon log` on each original recorded path prints the original bytes. An owner with no logs gets no archive.
2. A completion that stopped after the archive was written and some plain logs were deleted, then retried through `akrogon next <slug>` (B,C), ends with one archive holding the union of archived members and remaining plain logs and no plain logs, every original byte readable through `akrogon log`.
3. A symlinked `*.log` under a completing owner stops the completion with an error naming the link; the owner stays under `issues/open/` with its logs unchanged.
4. While completion runs, the owner holds `.closing`; it is present through the move and absent once the owner sits under `issues/closed/`.
5. `akrogon run-check` whose target is under `issues/closed/` or under an owner holding `.closing` exits non-zero before running the command; when the owner starts closing, or has already moved to `issues/closed/`, while the command runs, it exits non-zero naming the captured `out.log`, recreates no folder under `issues/open/`, and that run folder still exists after the next `akrogon next` reconcile, reported as kept (B). A `--holder` under `issues/chart/` is still accepted.
6. When a plain log's bytes differ from the same member already in `evidence.tar.zst`, the pack stops with an error naming the member, and the plain file and the archive are both unchanged (C).
7. With a stranded `.closing` and an `evidence.tar.zst.tmp` inside an open owner, `akrogon sync` commits neither file while still committing other eligible `issues/` changes (C).
8. `akrogon init` on an initialized repo adds `issues/open/**/*.log`, `issues/parked/**/*.log` and `issues/chart/*/direct/**/*.log` to `.gitignore` once, and afterwards `akrogon sync` stages no new plain log in those folders.
