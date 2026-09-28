# Missing configured git base

## Question

### Q1 · On a repo whose configured base (`<remote>/<default_branch>`) does not exist, does akrogon refuse with remediation, or create the first commit and push?
### Q2 · Where is it checked: at chart handoff and again at dispatch, or at dispatch only?
### Q3 · Does the check contact the remote (ls-remote), and on which dispatches?
### Q4 · Where does the shared rule live so the handoff can run it with zero leaves?

### Carries
- Related: `write-proof.md`.

## Findings
- 2026-09-28 re-research against d5b2735 (A,B): see `../slots/git-base-merged.md` and `../slots/git-base-rebuttal-B.md`. Earlier bullets below are the 2026-09-19 pass.
- (both) ensureWorktree runs `git worktree add -b <slug> <path> target(repo)` with no check (src/next.ts:241-250, src/config.ts:111-116); every eligible leaf fails with git's message.
- (B) A missing local tracking ref is not proof the remote has no branch; separate absent fetch state from an empty remote in the remediation text. Chart drafting itself needs no base; only handoff and dispatch do.
- (A) The handoff preflight already runs `akrogon status`; one check function shared by status and next keeps one source of truth.

## Taken
2026-09-28, operator: "go with all recommendations" (1-A 2-A 3-A 4-A)
- Q1-A: refuse with remediation that names the case: C1 no configured remote (configure it or fix `remote`), C2 remote branch absent (operator makes and pushes a first commit), C3 branch on remote but tracking ref absent (`git fetch <remote> <branch>`). Network or auth failure is reported as unproven, never as "branch absent". Reason: bootstrap would choose commit content and push for the operator, and cannot fix C1 or C3. Foreclosed: automatic first commit and push (B).
- Q2-A: one rule, run before any handoff write and again at dispatch before `ensureWorktree`, for new and reused worktrees alike. Reason: dispatch-only lets leaves reach a repo that cannot run, the #20 case. Foreclosed: dispatch only (B).
- Q3-A: every dispatch verifies the local ref `refs/remotes/<remote>/<branch>^{commit}` with no network. The remote branch (`git ls-remote --exit-code <remote> refs/heads/<branch>`) is also required at handoff and when a new worktree is created, and is queried after a local failure to pick the remediation. Reason: `next` runs on hook events, and a network call there adds latency and turns an auth hiccup into a dispatch stop; the server branch matters only when a branch is cut. Foreclosed: remote on every allocation (B, slot B's position), local only everywhere (C).
- Q4-A: a new read-only `akrogon preflight` backed by the same function dispatch calls, working with zero leaves; the chart-issues handoff runs it before any write. Reason: one rule, and no existing verb runs with zero leaves without becoming a gate on inspection. Foreclosed: check inside `status` (B), git commands in skill prose (C).
