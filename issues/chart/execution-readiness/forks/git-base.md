# Missing configured git base

## Question

### Q1 · On a repo whose configured base (`<remote>/<default_branch>`) does not exist, does akrogon refuse with remediation, or create the first commit and push?
### Q2 · Where is it checked: at chart handoff and again at dispatch, or at dispatch only?

### Carries
- Related: `write-proof.md`.

## Findings
- (both) ensureWorktree runs `git worktree add -b <slug> <path> target(repo)` with no check (src/next.ts:241-250, src/config.ts:111-116); every eligible leaf fails with git's message.
- (B) A missing local tracking ref is not proof the remote has no branch; separate absent fetch state from an empty remote in the remediation text. Chart drafting itself needs no base; only handoff and dispatch do.
- (A) The handoff preflight already runs `akrogon status`; one check function shared by status and next keeps one source of truth.
