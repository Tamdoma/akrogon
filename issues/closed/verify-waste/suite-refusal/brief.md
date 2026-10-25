# Brief: suite-refusal

## What

`akrogon run-check` refuses a configured `merge_checks` command run by hand. A command is refused when its argv is the entry's text as words, `sh -c '<text>'`, or the printed form `sh -c '<setupCommand(config, text)>'` that `akrogon config` builds (src/config.ts:346-361). The refusal exits non-zero before any process starts and prints that merge checks run only at the merge turn through `akrogon verify --attempt <id>`, and that a red is reproduced with a narrower command. `checks` entries are never refused, because implement and check.fix run them through their printed form (D). `akrogon config` prints `akrogon verify --attempt <id>` for each `merge_checks` entry in place of a run-check line. implement-issue, merge-issue and check-issue SKILL.md name the refusal, and say check.fix reproduces a red merge with the narrowest failing command, never the whole merge suite. (A, amended 2026-10-24 by the operator)

## Why

105 run-check scopes over 600 CPU-s cost 50 CPU-h in 11 days, 64 of them in check.fix, with labels such as `merge-verify-rerun7` (verify-waste map). These runs write no receipt, so nothing reuses them, and implement-issue forbids them in prose only. A full suite in check.fix is wasted even with a receipt: main moves before the leaf's merge turn, the rebase changes the tree, and the merge turn runs the suite again. While several such suites shared the host, timing tests failed under load and merges took 25-95 min per attempt; with one suite at a time they took 6-8 min (watch-framework, 2026-10-24 16:21-22:40).

## Done-criteria

1. `akrogon run-check` with a configured `merge_checks` entry in each of the three forms exits non-zero, starts no process, and prints a line naming `akrogon verify --attempt` and a narrower reproduction. (D)
2. `akrogon run-check` still runs: the printed form of a `checks` entry, a `merge_checks` entry's text with extra arguments, and any other command. (B,D)
3. `akrogon config` prints `akrogon verify --attempt <id>` for each `merge_checks` entry. (D)
4. implement-issue, merge-issue and check-issue SKILL.md (including check-issue:69 retry and :93 runner list) name the run-check refusal and say check.fix reproduces a red merge check with the narrowest failing command, keeping those reproductions on run-check. (B,D; amended by the operator 2026-10-24)
