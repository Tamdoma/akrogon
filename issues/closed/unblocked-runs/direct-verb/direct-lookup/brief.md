# Brief: direct-lookup

## What

`akrogon direct` resolves seat A (`HC_TERMINAL_ID`) and seat B (`--reviewer`) in the caller's own hc session, read from `HC_SESSION`, and no longer scans other live sessions; `probeExactlyOne` is deleted. Its slug lookup (`slugLeafFolders`) walks owner folders only, so plain files under `issues/open` and `issues/closed` no longer crash it. Delivers Tamdoma/akrogon#162 and Tamdoma/akrogon#163.

## Why

hc addresses are per session. With three herdr sessions open, the door's address `t11` existed in all three and `akrogon direct` refused with "the terminal resolves in 3 live sessions" although the door's environment named its session (#162). In pi-extensions, legacy plain `.md` files under `issues/closed/` made `slugLeafFolders` throw ENOTDIR (#163). Either one blocks the direct route entirely, before any write.

## Done-criteria

1. When the caller's address and the reviewer's address are each live in the caller's `HC_SESSION` and the same addresses are also live in a second session, `akrogon direct <slug> --reviewer <address>` creates the leaf, and its `state.yaml` records `seat.A` and `seat.B` with `session` equal to the caller's `HC_SESSION`. A rerun on that existing direct leaf rewrites both seats the same way. Proof: own test at the CLI boundary with two hc fixture cores, run by the `test` check.
2. `akrogon direct` refuses before any write (no state, worktree or branch) when `HC_SESSION` is blank or unset, when the caller's address is not live in `HC_SESSION`, and when the reviewer's address is not live in `HC_SESSION`, each refusal naming what is missing, including when another live session holds that address live. Proof: own tests, run by the `test` check.
3. In a repo whose `issues/open` and `issues/closed` each hold a plain file beside owner folders, `akrogon direct` creates a drafted open direct leaf, and a rerun on a merged direct leaf under `issues/closed` rewrites its seats. Proof: own test, run by the `test` check.
4. `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md` describe direct's seat resolution as the caller's `HC_SESSION`, with no remaining "exactly one live session" claim, and the reference index no longer says every hc call pins the repo session. Proof: the reviewing seat reads all three. (A,C)
