## 1. Goal

Implement plan D1–D5: actionable identity and worktree mismatch errors, preserved enforcement, and one configuration paragraph. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/repo-identity`. Authoritative leaf: `/home/ivan/Work/infra/akrogon/issues/open/loop-hardening/lifecycle-records/repo-identity`.

## 2. Numbered acceptance criteria

1. C1: Wrong stored key `other` versus registered `repo` fails in status overview/detail, next selection and a valid phase transition, naming leaf path and both labeled keys. Rejected leaf is unchanged and not dispatched.
2. C2: Overview still shows healthy repos, reports the wrong repo in its structured unreadable diagnostic and exits nonzero. Next --all still dispatches healthy leaves and reports the bad one. Preserve duplicate checks.
3. C3: Changed worktree root and moved repo root with recorded worktrees fail with both paths and move-or-restore guidance. No replacement worktree or prompt, no recorded path overwrite.
4. C4: Real directory rename plus updated registered path with same key and no recorded worktree permits status, phase and dispatch at the new root.
5. C5: One README configuration paragraph distinguishes persistent key from movable path and manual worktree reconciliation. Changed tests pass.

## 3. Read-first list

Read authoritative `plan.md`, `brief.md`, `design.md`. Read `/home/ivan/.codex/skills/implement-issue/ponytail.md` and `worker-protocol.md`. In worktree read README configuration text, src/state.ts allLeaves, src/status.ts scanRepo, src/next.ts discover and ensureWorktree, src/config.ts repo resolution, src/phase.ts phase lookup, tests/helpers.ts and relevant tests/status.test.ts, tests/next.test.ts, tests/phase.test.ts. Copy existing CLI fixtures and next skip diagnostic parsing patterns. No lessons read is needed.

## 4. Change list and needed interfaces

Add exported `RepoMismatchError(path: string, stored: string, registered: string)` in src/state.ts. Reuse its diagnostic at the three comparisons in state, status, next. Status handles this specific error in its existing catch. Update ensureWorktree error only. Extend the three relevant test files. Add one README paragraph under Initialize a repository. No other interface changes.

## 5. Do-not, reasons and exceptions

Do not alter identity enforcement, dispatch/discovery policy, state schema, or add rename/relocation behavior. Those are locked out of scope. Do not broaden catches or touch adjacent documentation. Do not commit or invoke lifecycle commands. Keep all issue evidence in the authoritative leaf outside the worktree. Return a mismatch with concrete evidence if scope/interfaces must change. Only B's revised brief authorizes an exception. These exclusions preserve locked scope and clean lifecycle ownership, and only a revised brief permits expansion.

## 6. Ordered steps

Derive tests for C1–C4 first in existing test files. Run changed tests for red evidence, implement scoped src changes, run changed tests for green evidence. Add README paragraph for C5. Fill the report below and return concise evidence. About seven files, one coherent unit. Unexpected wider work returns a mismatch.

## 7. Commands

Workers run only this resolved changed-test command, capturing red and green output under the authoritative implementation directory with pipefail:

```sh
export AKROGON_BASE=352fe91da011147a51561ddbfc295d7d29e00c54
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

B owns focused end-to-end evidence, full suite, formatting, typecheck and commit.

## 8. Done-when, evidence and report

C1–C5 implemented with red/green changed-test evidence. Tests invoke actual CLI processes and real Git in temporary repos with existing fake Herdr boundary only, no real panes or external services. Fill these lines before return. Report unresolved criteria and limitations honestly.

Changed files and reasons: src/state.ts exports RepoMismatchError and uses it in allLeaves; src/status.ts uses and specifically catches it while preserving structured unreadable results; src/next.ts uses it during discovery and reports both worktree paths with move/reconcile-or-restore guidance; tests/status.test.ts, tests/phase.test.ts and tests/next.test.ts add real CLI identity and relocation scenarios with unchanged-state and no-dispatch assertions; README.md adds the requested configuration paragraph. Seven worktree files changed, no commits or lifecycle mutations.
Tests run: AKROGON_BASE=352fe91da011147a51561ddbfc295d7d29e00c54 bun test --changed="$AKROGON_BASE", with pipefail and tee. Red exit 1: 67 pass, 5 fail due to missing key/path diagnostics (implementation/changed-tests-red.log). Green exit 0: 72 pass, 0 fail, 680 assertions (implementation/changed-tests-green.log). Both logs are under this authoritative leaf. Tests invoke actual CLI subprocesses and real Git with the existing fake Herdr boundary.
Known limitations: existing recorded worktrees require manual Git/path/state reconciliation after moving roots
Unverified criteria: C1–C4 verified and C5 paragraph added. B owns final focused evidence, format, typecheck and full-suite checks. No other unresolved criteria.
