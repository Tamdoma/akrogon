# Review B: seat-exit-rules

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`.
Reviewed head: `708f85e2492eda4ac38f2d5d07f2b1f7d87fd607`.
Verdict: `ready`. No Fixes or Nits.

## Verification

- C1: Read the complete skill and diff. Shared context covers implement and check.fix, uses the exact failed command and criterion/cause reason, and forbids pre-existing/base-red/modulo handoff. The check.fix sentence refers back to that rule. Concrete scenario: a full-suite failure outside owned surfaces after permitted repairs ends failed rather than proceeding to review.
- C2: Read the complete worker protocol and diff against D2-D3. Provider recognition excludes quota, billing and context overflow. Relaunch waits for the old worker to end, uses the retained worktree as cwd, and supplies the original brief with the exact added line covering commits, files and external effects. A second provider death of the same unit stops the leaf with provider/error/both transcripts; standalone reports those contents. Budget/output stops retain remainder-only delegation. Concrete scenario: a failed 503 result permits one relaunch, and a second 503 for that unit ends failed.
- C3: Reused implementation/report.md evidence at the unchanged reviewed head: full suite 339 pass/0 fail, typecheck exit 0, format exit 0, changed-tests 0 affected tests/0 fail. No code changed, evidence is complete, and no specific concern requires rerunning successful checks.

## Live contracts and documentation

Worktree is clean. The complete base-to-head diff changes only the two owned skill files. Missing debate artifacts are expected for this debate:no leaf.

Read docs/guide/phases.md, docs/reference-index.md and skills/AREA.md. The human phase guide remains accurate. Agent behavior changed only in the two edited documents; rg over docs/, skills/ and src/ found no stale copy of the replaced rules. No AREA.md changed.

Inspected src/routing.ts and src/phase.ts: implement and check.fix permit failed, A is the required seat, and failed accepts --reason and records/announces the stop. Read chart evidence slots/probe-pi-retry.md: V2 confirms a same-repository worktree cwd is accepted; V3 confirms a terminal failed child result carries the 503 text and an existing transcript path. These are the existing interfaces the prose reuses, not new runtime behavior.

No new wording tests are required under the plan and standing design. The known error-classification limitation is explicit and does not contradict an acceptance criterion. No reusable lesson was identified.

## Merge verification, 2026-10-01

Fetched origin and rebased without conflicts onto origin/main `646fa457d2160461b389b4c6b605bb643d61924a`. Prior reviewed head: `708f85e2492eda4ac38f2d5d07f2b1f7d87fd607`. Rebased head: `61e8a156dc872ffd1ec01cc48a1894903271e575`. Refreshed config gives AKROGON_BASE equal to the rebase target. Range-diff reports the single patch unchanged (`708f85e = 61e8a15`). No outstanding changes or B-held reusable Nit.

Blocking checks at the rebased head:

```text
$ bun run format
$ prettier --write src tests
all files unchanged, exit 0

$ bun run typecheck
$ tsc --noEmit
exit 0

$ AKROGON_BASE=646fa457d2160461b389b4c6b605bb643d61924a bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
--changed: 2 changed files, but no test files are affected
0 pass, 0 fail, Ran 0 tests across 0 files. [8.00ms]
exit 0

$ bun test
339 pass, 0 fail, 3937 expect() calls
Ran 339 tests across 15 files. [74.67s]
exit 0
```

Full-suite wall time: 74.67 seconds. No advisory commands configured. Gathered all three completion-owner leaf briefs under leaf-run-stalls before the completion call.

Push confirmed: `git push origin HEAD:main` exited 0 and reported `646fa45..61e8a15 HEAD -> main`.
