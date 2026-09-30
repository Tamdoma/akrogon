# Review B: realistic-review-bar

Base: `14e045cf44daf5edf3413ba681fd5b66410b62ba`.
Reviewed head: `f47f5254b50cb48c3a1eb4c9cd1f18338b30f595`.
Phase: initial `check.review`. Verdict: `fix`.

Reviewed under the installed check-issue rules in force at review start, without reading the peer review. Debate artifacts are absent as expected for `debate: no`.

## Findings

### F1. Fix: apply the new bar to the remaining CSV review example

Location: `docs/guide/phases.md:101`.
Done criterion: C6. Plan D8 and checklist step 9 require updating other guide lines that state the old rule by meaning, not merely replacing the main blocking-finding paragraph.

The live guide still says: “If that violates the contract, the reviewer records the case and requests a fix.” Its example supplies a CSV field containing a newline, but neither a realistic input source nor a done-criterion explicitly naming that scenario. With a broad contract such as correct CSV quoting, a handcrafted newline example therefore still directs a reader to request repair based on the contract violation alone. That is the old rule the preceding paragraph replaces. The new rule requires a realistic source for a newly invented counterexample to a broad promise, while preserving the exception for explicitly named criterion scenarios.

The source is the current operator guide's review example, and the consequence today is conflicting instructions on when to open repair. This is a documented-behavior defect and a direct C6 failure, not a hypothetical future maintenance concern.

Change this example in place to establish either real user content as its source or an explicitly named newline criterion, or make the repair conditional on the new bar. No new test or broader rewrite is needed.

## Verification evidence

- Read the authoritative brief, design, plan and implementation report, the installed check-issue skill and ponytail reference, and the worktree's reference index and skills area.
- Inspected the full base-to-head diff. Exactly six prose files changed, with no code, test, AREA or index changes. Worktree is clean and `git diff --check 14e045cf44daf5edf3413ba681fd5b66410b62ba` passes.
- Read the changed skills and guides in context, the unchanged plan skill and ponytail, the merge lesson rule, and the overview pages. Expanded the report's sweep with a meaning review of contract, test, repair, negative-case and blocking language. F1 is the remaining old contract-only repair instruction. The overview shorthands in `files.md` and `idea.md` do not define a blocking bar.
- C1-C3: the check skill applies the source/consequence bar, the three test-blocking cases and the three-part Nit record. Failed checks and explicitly named criterion scenarios remain exceptions to source proof. The removed independent test-gap triggers agree with D2's locked three-case test bar.
- C4-C5: implementation and brief instructions require the smallest proving set, before/after bug proof, consequence-driven extra cases, existing-test extension, report linkage and Fixes-only repair. Standing design conditions end-to-end proof and retains the Playwright and chain-trigger rules. Verified `skills/check-issue/ponytail.md` remains a symlink to `../implement-issue/ponytail.md`.
- C7: inspected `/tmp/akrogon-realistic-review-bar-c7-bundle.md` and the final fresh-agent transcript at `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-realistic-review-bar--/2026-09-30T16-58-05-002Z_01a0f340-7d4a-74df-bdf4-b3490857b205.jsonl`. That agent read the final check skill and evidence bundle, then returned Nit, Nit, Nit, Fix, Fix with the recorded reasons. The report identifies the run and the preceding text revisions.
- C8: accepted the report's successful `bun run format`, `bun run typecheck`, and `bun test` evidence (339 pass, 0 fail, 3937 assertions). No code changed, no check evidence is missing, and F1 is a prose contract failure, so no configured check rerun is warranted.

Documented review, test and repair behavior changed. The updated guide has the conflicting example recorded in F1.

No additional Nit or reusable lesson recorded. Repair scope is F1 only.

## Repair round 1 re-check

Prior reviewed head: `f47f5254b50cb48c3a1eb4c9cd1f18338b30f595`.
Repaired reviewed head: `c8162fcdbbfbaa157dcb9a729c808c50c9355ca3`.
Verdict: `ready`.

Inspected only the repair diff and its immediate guide context, plus the appended implementation report. The diff changes one line in `docs/guide/phases.md:101`. F1 is resolved: the example now names the user spreadsheet as the realistic input source, an extra row as the consequence, and the broken import criterion as the required outcome. It explicitly requires recording source, consequence and criterion before requesting repair. This satisfies the previously failed C6 requirement.

No defect introduced by the repair. Worktree is clean and `git diff --check f47f5254b50cb48c3a1eb4c9cd1f18338b30f595` passes. Accepted the reported changed-test results (0 pass, 0 fail for prose only) and retained the prior full-check evidence. No code or check-issue text changed, so neither configured checks nor the C7 classification gate needs a review rerun.

## Merge verification

Rebase target and refreshed `AKROGON_BASE`: `87fe90f7c99d8c77304a6c7d919fb665796ceea9` (`origin/main`).
Prior reviewed head: `c8162fcdbbfbaa157dcb9a729c808c50c9355ca3`.
Rebased head: `242a2af5ac2c768f8a892305bff49bdebabeca5e`.

Fetched origin and rebased without conflicts. `git range-diff 14e045cf44daf5edf3413ba681fd5b66410b62ba..c8162fcdbbfbaa157dcb9a729c808c50c9355ca3 87fe90f7c99d8c77304a6c7d919fb665796ceea9..242a2af5ac2c768f8a892305bff49bdebabeca5e` reports all five commits unchanged (`=`).

All configured checks passed at the rebased head:
- `bun run format`: exit 0, all files unchanged, 0.73 s.
- `bun run typecheck`: exit 0, 1.16 s.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with the refreshed base: exit 0, 6 changed prose files, no affected tests, 0 pass / 0 fail.
- `bun test`: exit 0, 339 pass / 0 fail, 3937 assertions, 80.88 s.

No advisory checks configured. Worktree clean and `git diff --check origin/main` passed. Gathered the completion owner's only leaf brief before completion.

Push confirmed: `git push origin HEAD:main` exited 0, fast-forwarding `87fe90f` to `242a2af`. Ready to record completion.
