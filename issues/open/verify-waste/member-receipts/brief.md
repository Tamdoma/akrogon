# Brief: member-receipts

## What

`akrogon verify` treats each configured command as its own unit of evidence. In merge scope, the `checks` commands run first, one after another as today, then every `merge_checks` command runs at the same time in the same worktree after the one setup. A command that already has a green result on this tree, under the same name and command text, in a completed run, is reused and not run again; this holds for `checks` and `merge_checks` entries alike (A,D). The receipt lists every expected command in config order, whatever order they finish in, with its exit and log, and a reused entry names the run it came from (D). `requireGreenReceipt` passes when every expected command is green on this tree across completed runs, or the per-command known-red rule covers it (B,D). The `--known-red` base run uses the same per-command reuse, so a base command green on the base tree is read, not rerun. Skill lines that promise a fresh base run say the base reuses green results (B,D).

## Why

The framework suite is 56% of host CPU in run scopes. About half of merge runs are red, mostly one or two flaky members, and today a same-tree rerun repays all 14 members and the base run repays the whole suite again (verify-waste map, 2026-10-14..24 journal). Reuse at command grain repays only what has no verdict yet. The framework leaf that splits `framework:verify` into `merge_checks` members consumes this behavior and owns the root-state guard over those members.

## Done-criteria

1. A merge-scope verify with two `merge_checks` commands runs them concurrently: both start before either ends.
2. A red `merge_checks` command does not stop its siblings: every sibling finishes and is recorded with its own exit and log. (B)
3. When a `checks` command is red in merge scope, no `merge_checks` command starts, and each is recorded as not run, never green. This keeps framework's cheap-first stage (FW .claude/hooks/scripts/run-verify-stages.ts:112-115). (A)
4. If one member's execution throws, the run is not recorded as completed and the shared worktree is not removed until every sibling has ended. (B)
5. After a merge-scope run on a tree where one command was red and the others green, a second verify on the same tree runs only the red command, and its receipt lists the others as reused from the first run. This holds for a sequential `checks` entry and for `merge_checks` entries. (A,D)
6. A command result from a run that did not complete (no end, or setup not 0) is never reused and never counts green.
7. Changing a command's text in config makes its earlier results on that tree not reusable, while other commands' results stay reusable.
8. Existing ledger lines without the new reuse field still parse for every ledger reader. (D)
9. `requireGreenReceipt` passes on a tree whose commands turned green in different runs, and refuses while any command has no green result and no known-red cover.
10. Known-red pass: head command X red in one run and the other commands green in other runs, base X run fresh with the same failing test names, gives `akrogon verify --known-red` exit 0 and `requireGreenReceipt` passes. (B,D)
11. Known-red refusal: exit 1 and the gate refuses when a red head command has no base result with the same failing names, when its names cannot be extracted, or when either run is incomplete. (B)
12. A head command red while the merge-base tree holds a green result for the same command: `akrogon verify --known-red` reuses that base result, its base receipt entry names the source run, and the exit is 1, even when the reused log contains a fail line. (B,D)
13. `akrogon flaky` records no red-to-green flip from a reused entry, and a real later green run of the same command still records the flip. (B,D)
14. docs and the skill lines in merge-issue, check-issue, implement-issue and chart-issues SKILL.md that promise a fresh base run describe concurrent `merge_checks`, per-command reuse and the base side reading the same receipts. (B,D)
