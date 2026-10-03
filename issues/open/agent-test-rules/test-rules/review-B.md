# Review B: test-rules

Date: 2026-10-03
Phase: check.review (initial, blind)
Base: a97d4a11eae4bbc4f1d460eb5fa6a343ef895552
Reviewed head: b39642f97bb8bfa7971b8e892cc27da8c45b9d1b
Verdict: ready

## Findings

No Fixes, Nits or operator actions. Reviewed all seven changed files against the brief, locked design, plan and implementation report. No debate artifacts exist because debate is disabled. No peer review was read.

## Verification

- V1: Read the live shapes template and implementer audit at lines 134 and 252. Both require observable results and refuse test-file/assertion/count criteria. Existing merge_checks and ownership restrictions remain. plan-issue line 61 still maps criteria to chosen proofs; that file has no diff. Brief criterion 1 satisfied.
- V2: Read check-issue lines 39, 51, 55 and 59. Review includes the brief outcomes, requires a source contradicting the old expectation for changes/deletions, and blocks on outcomes rather than named tests. Boundary order, deletion safeguards and break proof are present. Wrong expectations proven red on base route to B repair without a review commit. Brief criterion 2 satisfied.
- V3: Read implement, worker template, check.repair, merge and standing-design rules. Existing expectations require the cited independent source, new tests need no citation, and all requested test-worth surfaces carry boundary order, deletion safeguards and fail-before/pass-after or deliberate-break proof. Wording variations preserve the rule's function. Brief criterion 3 satisfied.
- V4: Traced the wrong-base-test case through implement/check.fix, blind review/repair and merge prose. Implement fixes the expectation in its own reasoned lane commit, including outside owned test paths, never in a worker. Review records the Fix for B. Merge fixes a wrong expectation exposed by rebase and requires green checks before push. These specific wrong-expectation cases are exceptions to the retained general red-check/base-stop rules. The original base-run logging, terminal-result, cleanup and incomplete-run requirements remain. The guide at lines 92, 94 and 102 describes the same outcomes and exceptions. Brief criterion 4 satisfied.
- V5: Re-ran the plan's text/read proofs with rg and inspected the complete base-to-head diff. git diff --check passed. git status --porcelain was empty. No code, tests, AREA.md, index, dependencies or excluded interfaces changed. Read docs/reference-index.md, skills/AREA.md and the affected phases guide. The guide documents the changed test policies.
- V6: Reused implementation/report.md evidence at this head: format passed unchanged, typecheck passed, bun test --timeout=30000 reported 408 pass / 0 fail, and changed tests selected zero tests. No code change, missing check evidence or executable concern justifies rerunning those commands. No live credentials, grants or fixtures are needed for this prose-only leaf.

No lesson claim required verification and no reusable new lesson was identified.

## Merge: 2026-10-03

Fetched origin and rebased onto origin/main at a97d4a11eae4bbc4f1d460eb5fa6a343ef895552. Already up to date, no conflicts, reviewed head remains b39642f97bb8bfa7971b8e892cc27da8c45b9d1b. Refreshed config confirms the same AKROGON_BASE.

All blocking checks completed with exit 0: bun run format (all unchanged), bun run typecheck, bun test --timeout=30000 (408 pass, 0 fail, 4430 assertions, 19 files, 15.79s), and changed tests against the full base SHA (0 selected, 0 fail). No merge_checks or advisory commands configured. Worktree clean after checks. Gathered the completion owner's two briefs, test-rules and test-change-check, and read ISSUE.md before any completion move.

Push confirmed: git push origin HEAD:main exited 0, advancing origin/main from a97d4a1 to b39642f. No force push or retry was needed.
