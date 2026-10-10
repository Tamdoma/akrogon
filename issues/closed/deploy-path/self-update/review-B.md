# Review B: self-update

Date: 2026-10-10
Phase: check.review (initial, blind)
Base: 9e2dfbebcfd98e647d34bed995741410ce95c2e4
Reviewed head: 64545bc2b050b0432b0a74431d35176393e237ee
Verdict: fix

## Fixes

F1. Failure output drops the actual Bun error.

Location: src/self-update.ts:9-10 and :63.
Source: the failed frozen install explicitly covered by done-criterion 4, using the same corrupt bun.lock scenario as the existing retry test. Bun 1.4.2 emits a source excerpt before its parse error. A real bare-remote/clone fixture with bun.lock containing `garbage\n`, passed through real selfUpdate and real bun install, exits successfully with this sole line:

```text
install failed: 1 | garbage; 0 behind origin/main; retried at the next trigger
```

Raw Bun stderr in the same scenario starts:

```text
1 | garbage
    ^
error: Unexpected garbage
    at bun.lock:1:1
ParserError: failed to parse lockfile: 'bun.lock'
```

Consequence today: the operator gets lockfile content rather than the Bun error or its file location. Selecting the first stderr line discards the diagnostic. This violates the binding design's failure-line contract (failing step, git/bun error, lag and remedy), also documented in docs/guide/install.md. Preserve the diagnostic in the single output line, for example by flattening the captured diagnostic instead of truncating to its first line. Cover meaningful error content in the real failed-install boundary test. Its current assertions check only install/failed/lag and therefore miss this defect.

## Verification

- Read brief, plan, design, readiness, implementation/report.md and worker-u4-report.md before inspecting behavior. Debate is disabled, so no positions-B.md or rebuttal-B.md are expected.
- Reviewed all eight changed files and traced phaseCommand -> CLI finally -> mergeWake, the next selection/update/global-lock order, shared install reconciliation, realpath identity and lock ordering.
- `bun test tests/install.test.ts -t self-update --timeout=30000`: 10 pass, 0 fail, 88 assertions.
- `bun test tests/next.test.ts -t 'self-update|registered or selected repos' --timeout=30000`: 4 pass, 0 fail, 26 assertions.
- Specific F1 probe: real local bare remote and clone, actual selfUpdate, actual offline Bun install, fixture home and AKROGON_HOME. Exit 0 and output reproduced above. Separate direct Bun invocation confirmed exit 1 and the discarded stderr diagnostic. Temporary directories and probe scripts were removed by TemporaryDirectory cleanup. No real home links or external resources were modified.
- Reused report evidence at this exact head for configured format, typecheck, full tests (687 pass), changed tests (273 pass), docs-links and deliberate-break proof. No code changed during review. Narrow reruns address the concrete diagnostic concern and wiring, so no full-suite repetition was needed.
- No changed AREA.md files. Followed docs/reference-index.md to affected command/test areas and read the live install guide. Its updated trigger/remedy description matches the intended behavior, but F1 contradicts its promised git/Bun error output.
- Readiness has no required inputs or grants, and status has no Missing lines. No operator-only action.
- Worktree remains clean. No code commits were made.

## Test-Change trailers

- 8f14874: `Test-Change: tests/install.test.ts added self-update cases; no existing expectation changed`.
- 04953b9: `Test-Change: tests/next.test.ts added self-update wiring cases; no existing expectation changed`.
- 64545bc: `Test-Change: tests/next.test.ts formatting only, no expectation changed`.

Checked against src/test-files.ts and the diff: both paths match the test path rule, the first two commits append new tests without changing old expectations, and the last formats the new wiring tests. No existing assertion, fixture or recorded output was changed or deleted without a source.

## Nits

None.

## Operator actions

None.

## 2026-10-10 check.repair

Repair base: 64545bc2b050b0432b0a74431d35176393e237ee
Repair head: 5674b7a
All Fixes from both initial reviews repaired. No Handed to A items or operator actions remain.

### B F1: retained failure diagnostics

- Test commit: 8c481fd. Added assertions to the existing real failed-install/retry scenario for the Bun error marker, bun.lock context and a single output line. The cited source is the binding failure-line contract and the real Bun stderr recorded in F1. Existing assertions remain intact. Test-Change trailer records that source.
- Before fix: `bun test tests/install.test.ts -t 'reports a failed install' --timeout=30000` exited 1, 0 pass / 1 fail. Expected output to contain `error:`, received `install failed: 1 | garbage; 0 behind origin/main; retried at the next trigger`.
- Fix commit: d457294. Renamed firstLine to errorLine and flattened the complete captured diagnostic onto one line. The shared helper preserves diagnostics for install, fetch, refused fast-forward and thrown command errors.
- After fix: identical command exited 0, 1 pass / 0 fail, 10 assertions. This proves the reported Bun error and bun.lock context survive, output stays one line, and the restored lockfile retries successfully.

### A Fix 1: README install instructions

- Docs commit: 5674b7a.
- Before: README.md instructed `The links use this checkout. Update it with:` followed by `git pull`.
- After: README.md describes merge landing and manual/all/resume next triggers, fetch/fast-forward/install/links, retry and branch/divergence/overlapping-edit remedies, with a link to the install guide.
- Read both live pages after the change. `rg -n 'git pull|Landed work deploys|Follow the reported remedy' README.md docs/guide/install.md` finds the self-update description and remedies, with no git pull instruction. Full-suite docs-links tests pass.

### Required verification on repair head

- `bun run format`: exit 0. Repair files unchanged. It reformatted only the known pre-existing drift in src/status.ts and skills/chart-issues/scripts/peer-wait.ts, and those review-created unrelated changes were restored. The worktree was clean before formatting and is clean after restoration.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 687 pass / 0 fail, 7312 assertions, 34 files, 70.85 seconds.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4: exit 0, 273 pass / 0 fail, 2727 assertions, 3 files, 28.42 seconds.
- Criteria 1-6: real git/Bun self-update tests passed in both runs (unrelated edit retained, overlap refusal, branch/detached/ahead/diverged refusal, install retry, consumer no-op, skill addition/pruning/conflicts). F1's new assertions prove the failed-install diagnostic contract.
- Criteria 7-8: phase/next wiring and failure-isolation tests passed, with real unit skip tests proving the behind-line content.
- Criterion 9: live README/install guide review above and full-suite docs-links coverage passed.
- Reused the original deliberate-break evidence for unchanged fast-forward behavior from worker-u4-report.md. F1 additionally has fail-before/pass-after evidence above.
- No merge_checks are configured or run. No dependencies added, no external fixtures, no temporary helper files retained, no code changes outside the three repair files.
- No reusable Nit is held by B. A's nonblocking concerns do not become additional repair requirements.

Disposition: request merge. The command owns the actual phase movement.

## 2026-10-10 merge

Attempt: ea838216-7958-4360-91a8-c2763798133c
Tested base: f169ac92caf11d56cdccb705632ec0fbc4d35188
Tested top: cd9b9ce8e4908fcfacf4a990ac04c6e88233c0c5
Carried members: none.

The applied stack matches the supplied top and batch record. Range-diff from the prior reviewed/repaired range (9e2dfbe..5674b7a) to f169ac9..cd9b9ce shows all ten commits unchanged. No fetch, rebase or commits by this merge seat.

Required checks, with refreshed AKROGON_BASE=f169ac92caf11d56cdccb705632ec0fbc4d35188:

- `bun run format`: exit 0. Only the two previously documented unrelated formatting drifts were rewritten (src/status.ts and skills/chart-issues/scripts/peer-wait.ts), and restored from the clean starting worktree. No change to the tested stack.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 691 pass / 0 fail, 7352 assertions, 34 files, 71.34 seconds. Log: implementation/merge-test.log.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 277 pass / 0 fail, 2767 assertions, 3 files, 27.15 seconds. Log: implementation/merge-changed.log.
- merge_covers, merge_checks and advisory are empty.

The worktree is clean and HEAD still equals the recorded top. Completion owner deploy-path has one leaf, self-update. Read its ISSUE.md and the self-update brief for completion context. Broadcast sender dependencies installed with the skill-local frozen lockfile. Proceeding to command-owned check and push.

Merge result: `merged --check` exited 0 with `ok`. The command-owned `merged` call exited 0 with `moved merged` and `issue complete deploy-path`. origin/main now equals cd9b9ce8e4908fcfacf4a990ac04c6e88233c0c5; the completed owner moved to issues/closed/deploy-path. Worktree remains clean.
