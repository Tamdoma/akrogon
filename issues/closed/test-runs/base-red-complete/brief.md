# Brief: base-red-complete

## What
Rewrite the base-run paragraph in `skills/implement-issue/SKILL.md` (line 38, implement end and check.fix, slot A) and in `skills/check-issue/SKILL.md` (line 59, check.review, reviewing slot) so a seat stops a leaf as "red on base" only on evidence that holds up:
- Red on base requires both the leaf run and the base run to have completed: the checked command's own exit status and terminal result, kept before any reporting pipeline such as `echo`, `grep` or `head`. Both runs use the same command, args, scope, dependency install and material conditions. The seat records why the base failure explains the leaf failure. Failing test names need not match. Only then does the existing `failed --reason "<command> red on base <sha>"` stop apply.
- A completed base result that does not establish that comparison sends the leaf failure to the existing repair path.
- A run killed, interrupted or crashed before its terminal result is incomplete. The seat keeps its logs and termination cause and stops with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <slot>`. It does not rerun it automatically and does not claim a base defect.
- The base run uses the active harness's longest run mode, and a run still killed before its terminal result is incomplete.

Everything else in both paragraphs stays: the single base run, the detached `mktemp -d` worktree, dependency install, log redirection, worktree removal before either outcome, the report or review artifact fields, and "a stop, never a handoff".

## Why
On 2026-10-02 the framework leaf emdash-fleet-backup stopped as `bun run test:cf-workers-deploy red on base ab700d4cc` from a base run its own seat killed with a 25-minute background timeout before the run finished, and its leaf run was reported "exit 0" from a trailing `grep | head` while one test had failed (Tamdoma/akrogon#53, chart issues/chart/test-runs). Later completed runs on leaf and base failed on different tests from one shared capture defect, so name matching alone would have missed it.

## Done-criteria
1. `skills/implement-issue/SKILL.md`'s base-run paragraph states each rule in What once: completed runs with the command's own exit status kept before any pipeline, comparable conditions, a recorded shared-cause judgment with names not required to match, the repair path otherwise, the incomplete-run stop with its exact command and reason shape for `--slot A`, no automatic rerun, and the longest harness run mode.
2. `skills/check-issue/SKILL.md`'s base-run paragraph states the same rules once, using the reviewing slot `--slot <A|B>` and `review-<slot>.md` as today.
3. `implementation/report.md` walks both edited paragraphs through the #53 evidence (framework `issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md:175-215`): the first base run (killed at its 25-minute launcher limit, no final counts) reaches the incomplete-run stop, and the later completed whole-file pair (leaf fixture 07, base fixture 13, both 238 pass / 1 fail, same capture code) reaches red on base.
4. `git diff "$AKROGON_BASE"...HEAD --stat` lists only `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md`.
