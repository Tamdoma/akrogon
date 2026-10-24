# Brief: suite-refusal

## What

`akrogon run-check` refuses a configured `merge_checks` command run by hand. A command is refused when its argv is the entry's text as words, `sh -c '<text>'`, or the printed form `sh -c '<setupCommand(config, text)>'` that `akrogon config` builds (src/config.ts:346-361). The refusal exits non-zero before any process starts and prints `akrogon verify --scope merge`. `checks` entries are never refused, because implement and check.fix run them through their printed form (D). `akrogon config` prints `akrogon verify --scope merge` for each `merge_checks` entry in place of a run-check line. `akrogon verify --scope merge` runs merge scope from any leaf phase, so a seat in check.fix after a red merge reruns the merge checks with a receipt. implement-issue, merge-issue and check-issue SKILL.md name these routes in place of hand runs of a merge check. (A,B,D)

## Why

105 run-check scopes over 600 CPU-s cost 50 CPU-h in 11 days, 64 of them in check.fix, with labels such as `merge-verify-rerun7` (verify-waste map). These runs write no receipt, so nothing reuses them. implement-issue forbids them in prose only, and verify picks scope from the phase (src/verify.ts:396), so check.fix has no receipt-writing route to the merge suite.

## Done-criteria

1. `akrogon run-check` with a configured `merge_checks` entry in each of the three forms exits non-zero, starts no process, and prints a line naming `akrogon verify --scope merge`. (D)
2. `akrogon run-check` still runs: the printed form of a `checks` entry, a `merge_checks` entry's text with extra arguments, and any other command. (B,D)
3. `akrogon config` prints `akrogon verify --scope merge` for each `merge_checks` entry. (D)
4. `akrogon verify --scope merge` in a leaf worktree in check.fix runs the merge-scope commands and writes a merge-scope receipt for that tree, under the leaf's slug. A later `merged --check` on the same tree accepts that receipt. (D)
5. `akrogon verify --scope <any other value>` exits non-zero with a usage error. (D)
6. implement-issue, merge-issue and check-issue SKILL.md (including check-issue:69 retry and :93 runner list) name `akrogon verify --scope merge` as the route to rerun a merge check and name the run-check refusal, keeping narrower non-configured reproductions on run-check. (B,D)
