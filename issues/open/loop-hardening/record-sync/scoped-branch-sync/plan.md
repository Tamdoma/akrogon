# Plan: scoped-branch-sync

Synthesis by slot B. Debate is disabled, so this uses the brief, locked design and live code directly. The operator approved autostash on 2026-09-11, resolving D5 and overriding the locked architecture’s unchanged-pull requirement.

## Read first

- `issues/open/loop-hardening/record-sync/scoped-branch-sync/brief.md` and `design.md` in the registered repository.
- `REFERENCE.md` and `learnings/LESSONS.md`.
- `docs/files.html` and `docs/limits.html`: current sync documentation describes whole-checkout staging. Updating it belongs to command-reference.
- `src/sync.ts` and `tests/sync.test.ts`: current implementation and bare-remote integration scenario.
- `src/config.ts`: `requireRepo`, `globalHome`, `expandPath`, `within` and configured paths.
- `src/state.ts`: `withLock` and `withRepoLock`.
- `src/phase.ts` and `src/park.ts`: existing lock order and park's global lock.
- `src/shell.ts`, `tests/helpers.ts`, `tests/park.test.ts`: command errors, real CLI fixtures and park scenarios.

## Decisions and interfaces

### D1: Keep ownership narrow

Change only `src/sync.ts` and `tests/sync.test.ts`. Retain `syncCommand(cwd: string): Promise<void>`, existing config keys, command helpers and lock interfaces. Test helpers needed only here stay in the sync test module. No init, documentation, shared lock implementation or lifecycle changes. No implementation dependency requires another leaf to finish first.

### D2: Serialize the entire sync operation

Resolve the registered repository using existing configuration code, then acquire `withLock(resolve(globalHome(), '.lock'), ...)` followed by `withRepoLock(repo, ...)`. Hold both from branch/index validation through staging, commit, rebase and push, including failures. Existing wrappers release locks. Git operations target `repo.root`, matching the current registered-checkout behavior.

### D3: Refuse an unsafe branch or index before Git mutations

Use `git symbolic-ref --quiet --short HEAD` in `repo.root`. Exit 1 identifies detached HEAD. Propagate other command failures with the existing command error context. Reject detached HEAD or a branch unequal to `repo.config.default_branch`, identifying both actual state and required branch.

Inspect staged paths with NUL-delimited Git output, disabling rename detection so both sides of a rename are validated. Preserve whitespace in names. Refuse with all offending paths before staging, commit, fetch, rebase or push. Eligible paths are under `issues/`, excluding `issues/seeds`, any file whose basename is `.lock`, and the configured worktree root when it is inside the repository. Apply this restriction to already-staged excluded paths too, otherwise an ordinary commit would include them despite scoped staging. Refusal leaves the index and working files intact. Lock acquisition can create lock files, which are excluded from commits.

Before staging, reject either active coordination lock path when tracked in this checkout. After branch/index preflight, fetch and reject the resolved incoming tree if it tracks either active lock path inside the repository. Reject local commits to be replayed that touch these paths too. This protects the held lock inodes from Git replacement. Diagnose the path and preserve local files/index. Rebase the validated commit ID rather than fetching again. The ordinary nested record lock exclusions remain unchanged.

### D4: Stage only eligible issue records

Resolve `worktree_root` with the existing path expansion rules and use `within` plus a repo-relative path for an internal root. Omit its exclusion when outside the repository. Use literal, top-anchored Git pathspecs for issue/seeds/worktree paths, and an explicit recursive `.lock` exclusion, so configured spaces and Git glob characters do not broaden staging. Cover a root equal to the repository by staging no eligible paths.

Use `git add -A` with these pathspecs, preserving eligible additions, modifications and deletions. Do not reset, clean or stage unrelated files. Keep the existing cached-diff exit handling and commit message `sync issues`. An empty eligible diff produces no new commit. Retain the configured remote and `HEAD:<default_branch>` push destination.

### D5: Use Git autostash during pull

Fetch the configured remote/default branch, resolve `FETCH_HEAD` to a commit, then run `git rebase --autostash <fetched-commit>` under both locks. Splitting pull into its fetch and rebase steps allows validating the exact incoming tree before Git can replace a coordination lock. The operator explicitly selected autostash on 2026-09-11. This supersedes only the design's unchanged-pull requirement and permits Git to temporarily stash tracked edits and restore them afterward. Do not persist Git configuration or introduce a separate stash workflow.

Successful sync must restore unrelated tracked edits, leave unrelated untracked files intact and leave both unstaged. This includes ignored files: before staging or rebasing, refuse incoming or replayed paths that collide with ignored local files, including ancestor file/directory collisions. Noncolliding ignored files must not block sync. Preserve Git command failures with their command, status and output context. After a successful rebase, inspect the index for unmerged paths before pushing: Git can report successful rebase while autostash restoration leaves conflicts. If unmerged paths exist, fail with the affected paths and rebase output, leave Git's recovery state intact and do not push. Do not reset files, drop recovery stashes or attempt automatic conflict resolution.

## Ordered file and acceptance checklist

- [x] A1 — `tests/sync.test.ts`: add acceptance scenarios below using real Git and the real CLI. Establish baselines for local HEAD, remote HEAD, index entries and relevant working-file contents. Keep fixtures isolated from operator repositories and credentials.
- [x] A2 — `src/sync.ts`: implement D2–D5 with existing interfaces. Verify rejection precedes Git mutations and excluded pre-staged paths cannot enter the commit.
- [x] A3 — `tests/sync.test.ts`: verify lock ordering and duration using actual flock synchronization and a controlled Git hook or executable gate. Signal readiness explicitly. While sync is gated during push, prove both locks cannot be acquired nonblocking and a concurrent real `park` cannot move its issue. Release the gate, await successful sync and park, and verify the park move completes. Separately hold the repo lock to show sync waits while owning the global lock. Avoid relying on a sleep alone as evidence.
- [x] A4 — Run focused tests, required checks and the real CLI artifact scenario. Record results in the implementation evidence. Remove temporary fixtures/helpers after use.

## Concrete verification

- V1 — Preserve the existing divergent-remote scenario: sync commits issue records, rebases onto a remote leaf commit and pushes. A repeat without issue changes creates no commit.
- V2 — On the default branch, create an eligible record plus an unrelated tracked edit and an unrelated untracked file. Assert success and compare unrelated bytes and staged state before/after. A successful case must show only eligible issue paths in the pushed sync commit. Exercise both an up-to-date remote and a nonconflicting remote advance. Verify ignored-file collisions from incoming/replayed changes refuse without losing bytes or pushing, including ancestor collisions, and noncolliding ignored files remain untouched during a successful sync. Also create an overlapping remote edit that conflicts when autostash is restored: sync must fail, identify the affected path, preserve recoverable edits and leave the remote unchanged by sync.
- V3 — A side branch and detached HEAD each fail with actual branch/state and configured default branch in diagnostics. Neither local HEAD, remote HEAD nor index changes. Include a configured default branch other than main.
- V4 — Pre-stage an unrelated path, including a name with whitespace, and verify refusal lists it with unchanged index, local HEAD and remote HEAD. Cover a rename crossing the issue boundary and pre-staged seeds, lock files and internal worktree contents.
- V5 — Untracked seeds, root/nested `.lock` files and worktree contents remain unstaged. Exercise default and custom internal worktree roots, a root outside the repository, a repo-root value, and a path containing Git glob characters. Verify exclusions apply to tracked modifications/deletions as well as untracked additions for ordinary excluded files. Active coordination locks are the exception: a tracked active lock, incoming tree tracking one, or replayed commit touching one must cause refusal before staging/rebase. Test the tracked repo lock and a tracked global lock when AKROGON_HOME is inside the checkout. Eligible issue deletions still commit.
- V6 — Prove D2 with A3's concurrent real park scenario and both actual lock paths. Check locks release after success and a branch/index refusal.
- V7 — Run `bun test tests/sync.test.ts`, `bun run format`, `bun run typecheck`, and `bun test`. Review the resulting diff for changes outside the two owned source/test files.
- V8 — Run a separate real CLI invocation against a temporary local bare remote using an isolated `AKROGON_HOME`: `bun <worktree>/src/akrogon.ts sync` from the fixture default checkout. Capture invocation exit status, `git --git-dir=<remote> branch -v`, and `git --git-dir=<remote> show --format=fuller --name-status refs/heads/<default_branch>` after a successful issue-only sync. Save the transcript at the authoritative leaf's `implementation/cli-artifact.log`. Assert exit zero and only eligible issue paths in that commit before recording success. Do not use the project's real remote for this exercise.

## Open limitations

- R1 — Autostash restoration can conflict with incoming changes. That run requires manual Git recovery and is not a successful sync. Git may retain edits in a recovery stash and leave unmerged working files; D5 prevents a subsequent push in that state.
- R2 — These locks coordinate akrogon commands. They do not prevent an operator or unrelated Git process from editing the index or files concurrently.
- R3 — Git remote/rebase errors can leave a local sync commit without a completed push. No rollback, retry policy or conflict recovery is added by this leaf. Existing sync documentation remains stale until its separate owner updates it.
