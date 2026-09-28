# git-base, slot A, 2026-09-28

## Findings
- Base is `<remote>/<default_branch>` (src/config.ts:125-127). `next` creates each new worktree from it with no prior check (src/next.ts:251-256). Errors are isolated per leaf and reported (src/next.ts:547-551), so a missing base produces one identical git error per eligible leaf and exit 1.
- `next` never fetches. Only `akrogon sync` runs `git fetch <remote> <branch>` (src/sync.ts:46). `worktree add` resolves the local remote-tracking ref only.
- `akrogon status` runs no git command (src/status.ts has no git or target use).
- Handoff preflight is skill prose (shapes.md Preflight) and runs `akrogon status` only after leaf writes, too late for "no leaf state before a usable base".
- Measured 2026-09-28 in a scratch repo (git 2.x):
  1. Remote with zero commits: `git ls-remote --exit-code origin main` exits 2; `worktree add ... origin/main` fails `fatal: invalid reference: origin/main`; `git fetch origin main` fails `couldn't find remote ref main`.
  2. Remote branch exists, never fetched: ls-remote exits 0; `git rev-parse --verify --quiet refs/remotes/origin/main` exits 1; `worktree add` fails with the same `invalid reference`.
  So the #20 error text is identical for two cases with different fixes: first commit and push, or fetch.
- git-ls-remote(1): `--exit-code` exits 2 when no matching refs are found.

## Q1 recommendation
A: refuse with remediation. Bootstrapping means akrogon picks the first commit's content and pushes to a remote, an outward write the operator did not author. Refusal names which case applies: remote branch absent (make and push a first commit) vs tracking ref absent (run `git fetch <remote> <branch>`).

## Q2 recommendation
Both, one check. `next` checks the local tracking ref once per repo before allocating any worktree (the exact ref `worktree add` consumes, no network), and on failure runs `ls-remote --exit-code` to pick the remediation. The chart-issues handoff preflight runs the same check before writing any state.yaml. Dispatch-only lets an operator hand off into a repo that cannot run, the #20 case.

## Pitfalls
- A stale but present tracking ref passes the check. Out of scope: freshness is sync's job.
- Checking in `status` would add network calls to a read-only view. Keep it out unless chosen.
