# Brief: base-preflight

## What
A new read-only `akrogon preflight` checks the registered repo's configured base (`<remote>/<default_branch>`) and exits non-zero with remediation that names the case. `akrogon next` runs the same check for a leaf before `ensureWorktree`, so a missing base refuses once with remediation instead of failing inside `git worktree add`. The chart-issues handoff runs `akrogon preflight` at the registered root before any handoff write.

Cases and remediation:
- C1 no configured remote: name the remote and tell the operator to add it or correct `remote`.
- C2 remote branch absent (`git ls-remote --exit-code <remote> refs/heads/<branch>` exits 2): make and push a first commit on `<branch>`.
- C3 remote branch present, local ref `refs/remotes/<remote>/<branch>^{commit}` absent: `git fetch <remote> <branch>`.
- Network or auth failure from ls-remote: reported as unproven with git's command, exit status and stderr, never as "branch absent".

## Why
On a fresh repo with an empty origin, the first `akrogon next` failed every eligible leaf with `fatal: invalid reference: origin/main`, and nothing in handoff or status warned (Tamdoma/akrogon#20 item 1). C2 and C3 print the identical git error but need different fixes.

## Credentials
No new credentials are required to implement or test this leaf. Temporary local remotes test behavior without secrets. Runtime remote probes use the consumer checkout's existing Git authentication and report authentication failures as unproven.

## Done-criteria
1. In temporary repos, `akrogon preflight` exits non-zero and prints the matching remediation for C1, C2 and C3, and exits 0 for a repo whose remote branch and tracking ref both resolve.
2. A same-named local branch or tag does not satisfy the check: only `refs/remotes/<remote>/<branch>` resolving to a commit passes.
3. An ls-remote transport failure (for example an unreachable remote URL) exits non-zero with git's command, exit status and stderr, and does not print the C2 remediation.
4. `akrogon preflight` resolves the registered root through `requireRepo`, refuses an unregistered or non-repository caller without writes, works in a registered repo with zero open leaves, and writes no file.
5. For a new leaf, an existing leaf branch without a worktree, and an existing worktree, a missing tracking commit refuses before worktree creation or saving `state.worktree`, reporting C1, C2, C3 or an unproven transport/auth result as applicable, once per leaf per invocation.
6. Every allocation verifies the local tracking commit. Remote-branch proof is required when the worktree must be created, including reuse of an existing leaf branch. With an existing worktree and a valid local ref, no remote query is made. After a local-ref failure, the remote is queried to classify the remediation. Each path has a test.
7. With both a valid tracking ref and a conflicting same-named local branch or tag, and with a missing tracking ref plus a same-named local branch or tag, worktree creation and `AKROGON_BASE` use the tracking base or refuse; they never resolve the local branch or tag.
8. The README command table lists `akrogon preflight` and `tests/command-reference.test.ts` passes.
9. skills/chart-issues/assets/shapes.md Preflight names `akrogon preflight` run at the registered root before any handoff write, refusing the handoff on non-zero exit.
10. The configured `checks` commands pass.
