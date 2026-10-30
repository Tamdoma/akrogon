# Merged notes: close-or-message (pull-gh-path)

Sources: blind opening maps by A and B (2026-10-29), sections `## pull-gh-path`, used as this fork's independent notes.

Question: is the destination met by the environment fix (`~/.local/bin/gh` -> mise shim), so the chart closes with no code, or must akrogon add a concise missing-tool message?

## Options

- 1a close, no code (A,B). Reason: stable shim removes the cause for every long-lived parent; the missing-tool error already names gh. Cost: no portability promise for a caller with neither `~/.local/bin` nor the shims dir.
- 1b ENOENT wrap in `spawnFiles` with a one-line message (A rejected option; B O9). Rejected (A,B): one error kind in a CLI where all errors print traces; would not have prevented 2026-10-24.
- 1c top-level CLI error formatter (A). Rejected (A): unrequested cross-cutting change.
- 1d akrogon runs mise or rebuilds PATH (B O10). Rejected (A,B): host dependency, can change tool versions.

## Evidence

- `~/.local/bin/gh -> ~/.local/share/mise/shims/gh`, mtime 2026-10-24T16:03Z; `~/.local/bin` on PATH in the door and all herdr servers. (A,B)
- A, 2026-10-29T07:48Z: door PATH lists the deleted `gh_2.103.0_linux_amd64/bin`; `command -v gh` = `~/.local/bin/gh`; `akrogon pull` -> `akrogon: 0 open issues pulled`, exit 0. (A)
- B: child with PATH `gh_2.102.1.../bin:/usr/bin:~/.local/bin` ran gh 2.103.3 and the exact pull listing call. (B)
- PATH `/usr/bin` only: first line `error: Executable not found in $PATH: "gh"`, then Bun stack. (A,B)
- gh is the only mise tool akrogon spawns directly; pull.sh and land.ts add no PATH policy. (A,B)
- mise Shims and Troubleshooting docs recommend shims for long-lived processes. (B)

## Pitfalls

- R1 the link is removed later and the failure returns. Removed by: nothing in akrogon; recorded under Off route as the operator's environment. The error still names gh. (A,B)
- R2 turning the incident into a generic subprocess-error project. Removed by: picking 1a. (B)

## Open questions

- B Q8: who keeps the gh shim link in place. A: the operator's environment, Off route.

## Where slots differ

Only B Q8 above.

## A's pick

1a.
