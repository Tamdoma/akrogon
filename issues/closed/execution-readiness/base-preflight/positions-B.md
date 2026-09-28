# Positions B: base-preflight

## Recommendation

Add `src/preflight.ts` with two single-purpose checks plus a typed error, wire a read-only `akrogon preflight` verb to it, gate `next` dispatch before any worktree or tab side effect, and switch base resolution plus worktree creation to the fully qualified tracking ref.

Preflight and dispatch share the same functions. No fetch, commit, push, or status change.

## Concrete changes

### F1: new `src/preflight.ts` (owner of the rule)

- `trackingRef(repo): string` returns `refs/remotes/<remote>/<branch>`.
- `verifyLocalRef(repo, cwd): Promise<string>` runs `git rev-parse --verify <tracking>^{commit}` in `repo.root`, returns the commit SHA. Throws an internal local-missing signal, not yet a C-case.
- `verifyRemoteBranch(repo, cwd): Promise<void>` runs `git ls-remote --exit-code <remote> refs/heads/<branch>` in `repo.root`. Exit 0 passes. Exit 2 throws C2. Any other non-zero throws unproven with command, exit status, and stderr. Never prints C2 remediation on this path.
- `ensureRemote(repo, cwd): Promise<void>` runs `git remote get-url <remote>`. Failure throws C1 naming the remote and telling the operator to add it or fix `remote` in `issues/config.yaml`.
- `PreflightError extends Error` carries `case: C1 | C2 | C3 | unproven`, `command`, `exit`, `stderr`, and a `remediation` string. Message is `case + remediation`.
- `preflight(repo): Promise<string>` composes: `ensureRemote`, then `verifyLocalRef`; on local failure calls `verifyRemoteBranch` to classify (remote present means C3 with `git fetch <remote> <branch>`, else propagate C2 or unproven); on local success still calls `verifyRemoteBranch` because handoff requires both proofs. Returns the tracking commit.

All git runs use `run()` from `src/shell.ts`, not `command()`, so exit codes and stderr are classified instead of thrown as `CommandError`.

### F2: `src/akrogon.ts` — new verb

- Add `case 'preflight'` with zero positionals, zero options. Resolve root via `requireRepo(readGlobal(), process.cwd())`, call `preflight(repo)`, print the tracking commit plus base (`<remote>/<branch> <sha>`) on success. On `PreflightError`, print `message` to stderr and exit 1 without a stack. Unregistered caller refuses via the existing `requireRepo` throw, no writes.
- Extend the usage line with `preflight`.
- Update `tests/command-reference.test.ts` contracts with `preflight: ''`.

### F3: `src/next.ts` — gate before allocation side effects

- In `dispatchLeaf`, after `seats(global, repo)` and before `allocate()`, compute `mustCreate = !existsSync(resolve(repo.root, repo.config.worktree_root, slug))` and call a small `gateBase(repo, mustCreate)`:
  - Always `ensureRemote` then `verifyLocalRef`.
  - After a local failure, call `verifyRemoteBranch` to classify (C2, C3, or unproven) and throw.
  - After a local success with `mustCreate === true`, call `verifyRemoteBranch` (covers new worktree and reuse of an existing leaf branch). With an existing worktree path plus valid local ref, make no remote query.
- Let the throw flow into the existing `dispatchLeaf` try/catch so `report()` prints one JSON line per leaf per invocation and the pass returns `skipped` without creating a worktree, tab, or `state.worktree`. No new dedupe logic.
- Change worktree creation at `src/next.ts:255` from `target(repo)` to `trackingRef(repo)` so `git worktree add -b <slug> <path> <tracking>` never resolves a same-named local branch or tag.

### F4: `src/config.ts` — base uses the tracking ref

- `base()` at `src/config.ts:129-131` changes from `git merge-base HEAD <target()>` to `git merge-base HEAD <trackingRef(repo)>`. Keep `target()` unchanged for `src/phase.ts` diff guards per the locked design. `src/log.ts` and `effectiveConfig` inherit the fix through `base()`.

### F5: docs

- `README.md` command table: add `` `akrogon preflight` `` row with effect `Check the configured git base without writes.`
- `skills/chart-issues/assets/shapes.md` Preflight section: add one paragraph naming `akrogon preflight` run at the registered root before any handoff write, refusing the handoff on non-zero exit.

### F6: tests (real git, temp repos, no vanity tests)

- New `tests/preflight.test.ts` using `tests/helpers.ts` `fixture()` plus a bare remote in `home`:
  - C1: remove/never-add the configured remote, expect non-zero plus C1 remediation naming the remote.
  - C2: bare remote with zero branches, expect non-zero plus first-commit remediation.
  - C3: push branch to bare remote, delete local `refs/remotes/<remote>/<branch>` (`git update-ref -d`), expect non-zero plus `git fetch` remediation.
  - Pass: remote branch plus tracking ref resolve, expect exit 0.
  - Same-named conflict: create local branch and tag literally named `<remote>/<branch>`, expect they never satisfy the check (delete tracking ref still refuses; with tracking ref present the printed SHA equals the tracking commit, not the local impostor).
  - Transport: point remote at an unreachable URL, expect non-zero with git command, exit status, stderr, and no C2 text.
  - Zero leaves, unregistered cwd, non-repo cwd: preflight works with zero leaves, refuses the other two without writes; assert `git status --porcelain` empty and no new files.
- Extend dispatch coverage (new `tests/next-preflight.test.ts` or additions to `tests/next.test.ts` with `fakeHerdr`):
  - New leaf, existing leaf branch without worktree, existing worktree, each with missing tracking commit, refuses before `state.worktree` is saved, one JSON skip line per leaf.
  - Valid local plus existing worktree makes zero `ls-remote` calls (assert via a wrapper or by pointing remote at an unreachable URL and still dispatching).
  - Valid local plus `mustCreate` proves the remote (unreachable URL now refuses).
  - Conflicting local branch/tag in both tracking-present and tracking-absent cases uses the tracking base or refuses, never the impostor; assert `AKROGON_BASE` equals the tracking commit.

Concrete scenario verified against live code: fresh repo with empty origin hits `ensureWorktree` at `src/next.ts:230-256` today and dies in `git worktree add` with `invalid reference`. After F3 the same leaf throws C2 in `dispatchLeaf` before `allocate()`, so no `issues/worktrees/<slug>` directory and no `state.worktree` write.

## Risks

- R1: `ls-remote` exit-2 contract. Git uses exit 2 for no matching refs with `--exit-code`, but auth and network failures also exit non-zero with different codes and stderr. Mitigation: match exactly `code === 2` for C2, treat everything else as unproven, and pin the transport test to an unreachable URL asserting command plus exit plus stderr appear.
- R2: C1 versus transport confusion. A missing remote and a broken remote URL both fail, but C1 must name configuration while transport must report git output. Mitigation: `ensureRemote` via `git remote get-url` runs first; only a configured remote reaches `ls-remote`.
- R3: abbreviated ref leaks. Any remaining `target()` use on the base path reintroduces the local-branch ambiguity. Mitigation: `trackingRef()` is the only input to `base()` and `worktree add`; add the same-named branch/tag test on both paths and keep `phase.ts` on `target()` only because the design locks it there.
- R4: dispatch error shape. `next` callers parse stderr JSON skip lines. A raw throw with a stack would break that. Mitigation: reuse the existing `report()` path in `dispatchLeaf`; assert one parseable line per leaf in tests.
- R5: remote latency on every new worktree. Handoff and creation now pay one `ls-remote`. Mitigation: required by Q3-A; existing-worktree dispatch stays local-only, and the zero-`ls-remote` test pins that.

## Simpler alternative considered

O1: gate inside `ensureWorktree` only, no `preflight` verb, no handoff check. Dispatch would still refuse before `git worktree add`, with less code. Rejected: the #20 case reaches dispatch with leaves already written to a repo that cannot run them. Q2-A locks the handoff-side check, and Q4-A locks it as a read-only verb sharing dispatch code rather than skill-prose git commands or a `status` gate. O1 also leaves zero-leaf repos with no way to prove the base.

## Acceptance evidence

- A1 (criteria 1-3): `tests/preflight.test.ts` drives C1, C2, C3, pass, and transport cases through the real `akrogon preflight` CLI in temp repos with a bare remote and an unreachable URL.
- A2 (criterion 4): preflight from registered root with zero leaves exits 0 when the base resolves; from unregistered and non-repo cwd exits non-zero without writes; test asserts no filesystem change.
- A3 (criteria 5-7): dispatch tests cover new leaf, existing branch without worktree, and existing worktree; local-always plus remote-on-create plus remote-after-local-failure; conflicting branch/tag never wins; `AKROGON_BASE` equals the tracking commit.
- A4 (criterion 8): README row plus `bun test tests/command-reference.test.ts` passes.
- A5 (criterion 9): `shapes.md` Preflight names the verb and the refuse-before-write rule.
- A6 (criterion 10): `bun run format`, `bun test`, `bun run typecheck` pass; CLI verification output is retained outside tracked `issues/` paths with its path in the implementation report.
