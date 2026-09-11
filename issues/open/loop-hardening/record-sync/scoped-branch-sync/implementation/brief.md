## 1. Goal

Implement scoped, default-branch-only sync with global then repo locking and approved autostash, plan D1–D5.

## 2. Numbered acceptance criteria

1. Commit only eligible issue paths, including deletions. Exclude seeds, all .lock files and configured internal worktree root, including pre-staged exclusions. Unrelated pre-staged paths cause refusal without index or HEAD mutation.
2. Reject non-default registered checkout branch and detached HEAD before Git mutations, identifying actual and required branch.
3. Successful autostash pull preserves unrelated tracked and untracked edits unstaged, both with unchanged and advancing remote. Autostash restoration conflicts must fail before push, preserving Git recovery state and useful diagnostics.
4. Hold global then repo locks throughout validation through push. Reject Git-tracked active coordination locks before staging, including the global lock if its home is inside this repo. Fetch after branch/index preflight, resolve FETCH_HEAD, refuse incoming trees tracking active locks or local replay commits touching them, then rebase the validated commit with --autostash. This replaces pull only to validate the exact incoming commit before Git can replace a held lock inode. Prove concurrent real park waits and both locks remain held during push. Prove global lock is held while waiting for repo lock and release on failure/success.
5. Preserve existing rebase, push and no-op behavior. Cover plan V1–V6 with real isolated Git/CLI tests and demonstrate red then green.

## 3. Read-first list

Read authoritative ../plan.md, ../brief.md and ../design.md. Worktree docs/files.html and docs/limits.html provide current documentation. Read src/sync.ts, tests/sync.test.ts, src/config.ts, src/state.ts, src/phase.ts, src/park.ts, src/shell.ts, tests/helpers.ts and tests/park.test.ts. Copy existing phase lock nesting and fixture/CLI patterns. Read /home/ivan/.codex/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Only src/sync.ts and tests/sync.test.ts. Preserve syncCommand(cwd: string): Promise<void>. Reuse withLock, withRepoLock, globalHome, expandPath, within, command/run/CommandError. Tests may have local helpers. No shared helper edits required.

## 5. Do-not, reasons and exceptions

Do not change init or documentation: separate leaves own them. Do not change shared interfaces or config, introduce fallback/recovery workflows, reset operator files or persist Git settings. Revision from B: fetch plus rebase of the validated FETCH_HEAD commit replaces pull, and tracked active coordination locks now require refusal instead of successful preservation. This corrects the reproduced lock-inode replacement mismatch without changing the shared lock mechanism. Return a mismatch with concrete evidence instead of widening scope or changing an interface. Only a revised brief from B authorizes scope/interface changes. These exclusions keep ownership narrow and preserve work; the revised-brief exception is the only scope exception.

## 6. Ordered steps

Derive tests in tests/sync.test.ts from criteria first. Run changed tests to demonstrate failure of the current implementation. Implement src/sync.ts, then run changed tests and repair within scope. Cover internal/external/repo-root worktree paths, literal glob characters, pre-staged rename crossing boundary, tracked excluded edits/deletions and eligible deletion. Record red/green command results and fill section 8. About two files, one implementation unit. Report material mismatch instead of weakening acceptance. Do not commit: B reviews and commits after full checks.

## 7. Commands

AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041

Only run this resolved changed-test command. B owns full suite, formatting/typecheck and separate CLI artifact.

## 8. Done-when, evidence and report

Criteria 1–5 pass with fail-first evidence. Use temporary repos and real files/processes. Do not access live Herdr panes, real remotes or credentials. B will run a separate CLI artifact scenario and save implementation/cli-artifact.log. Fill report here before returning, including failures and limitations explicitly.

Changed files and reasons: src/sync.ts implements scoped literal staging, branch/index refusal, global then repo locking, active coordination-lock validation, fetch followed by rebase --autostash of the exact validated commit, and post-rebase conflict refusal. tests/sync.test.ts covers real Git/CLI acceptance and lock concurrency, with tracked active lock refusal for local, incoming, and replayed changes at both repo and internal global lock paths. No commit made.
Tests run: AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041. Original fail-first: 1 pass, 18 fail. Initial implementation: 19 pass, 0 fail. Additional tracked-lock concurrency test reproduced inode replacement (original inode 40667778, during push 40667867, flock -n exit 0), resulting in 19 pass, 1 fail and B's brief revision. Revised lock-refusal acceptance fail-first: 19 pass, 6 fail. Final revised implementation: 25 pass, 0 fail, 198 assertions, exit 0. Full checks and separate CLI artifact remain B-owned.
Known limitations: plan R1–R3. Active coordination locks tracked locally, in the exact incoming tree, or touched by local replay history now cause refusal. Fetch may update remote-tracking refs before incoming/replay refusal, but HEAD, index and operator bytes remain unchanged. Git-owned rebase conflict recovery remains manual. No shared interfaces or dependencies changed.
Unverified criteria: none in the bounded changed-test unit. B must still perform full checks and separate CLI artifact. Ordinary excluded tracked-file modifications/deletions remain successful, with only active coordination locks receiving the revised refusal behavior. Gate cleanup releases and awaits started sync/park operations on assertion failure.


### B revision: tracked coordination lock mismatch

Evidence: changed tests initially reached 19/0, then tracked issues/.lock during push changed inode from 40667778 to 40667867 and flock -n returned 0. Keep this a regression test, but its required outcome is refusal before Git mutation. Add incoming-lock and internal-global-lock refusal tests, and replay-history coverage. Keep untracked lock concurrency tests and normal autostash success tests. Use Git ls-files/ls-tree/log with exact literal pathspecs for active lock paths; only active lock paths inside repo need Git validation. Capture fetched commit once and rebase that commit, with the existing post-autostash unmerged check. No new dependencies or shared changes. Tests must preserve local HEAD/index/files on preflight refusal and never push. Update section 8 with repaired outcomes. Run only the section 7 changed-test command.
