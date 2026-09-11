## 1. Goal
Resolve merge attempt 3's src/next.ts conflict directly as B on the final repair round. Rebase reviewed head 6b6c9ee181c7e64aface49dd0cef3415191ade17 onto 7be71885565323b89f666098748dcb127fdd84bf while preserving upstream file-target rejection and tree-preflight D1–D7.

## 2. Numbered acceptance criteria
1. R3-C1: Upstream rejection of existing non-directory next targets executes in selectLeaves before repo selection, alongside the existing invalid-depth preflight.
2. R3-C2: All original and upstream tests remain, changed tests and blocking checks pass. Parked lookup, hook behavior, error isolation and sweep-before-cleanup remain intact.
3. R3-C3: Rebase completes with a clean branch and no issues/ artifacts, with before/after heads and current CLI evidence recorded.

## 3. Read-first list
../review-A.md Merge attempt 3, ../plan.md, src/next.ts conflict and selection, upstream 7be7188 diff, tests/next.test.ts and tests/cli.test.ts if present, /home/ivan/.codex/skills/implement-issue/ponytail.md. Existing real CLI tests supply acceptance coverage.

## 4. Change list and needed interfaces
Resolve only src/next.ts. Preserve the replayed nextCommand structure and add upstream's two-line file-target validation immediately after folder resolution in selectLeaves. No new interfaces. Other automatically merged files retain both branches' changes.

## 5. Do-not, reasons and exceptions
Do not abort/skip rebase, weaken tests, remove upstream diagnostics or expand scope. Both completed behaviors must survive integration. Only a demonstrated integration failure justifies additional repair within this brief. No delegation on this final round.

## 6. Ordered steps
Capture conflicted changed-test failure, resolve next selection, run changed tests, inspect diff, run format/typecheck/full suite and inventory, stage and finish rebase, record evidence and hand off. No new test needed for an already-covered conflict resolution.

## 7. Commands
AKROGON_BASE=7be71885565323b89f666098748dcb127fdd84bf bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'

## 8. Done-when, evidence and report
Save repair-3-red.txt/green.txt and final blocking-check outputs beside this brief. Tests use real temporary-repo CLI invocations and external process fakes only. Complete rebase and report the clean repaired head before phase handoff.

Changed files and reasons: src/next.ts conflict resolved by moving upstream non-directory validation into preflight selectLeaves. No tests or other code were modified by this repair.
Tests run: red 129 pass/76 fail from conflict parse errors, green and full suite 205 pass/0 fail; format/typecheck pass; all 29 authoritative records load. Evidence is in repair-3-*.txt and report.md.
Known limitations: plan R1–R3 remain.
Unverified criteria: none. Rebase completed at 21c2f3d1f908a3184b836931c9bc946f14394b5b on 7be7188; branch clean with no issue artifacts. R3-C1–R3-C3 verified.
