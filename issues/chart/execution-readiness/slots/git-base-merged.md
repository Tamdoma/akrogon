# git-base merged, 2026-09-28 (A merged; tags (A) (B) (A,B))

## Findings
- (A,B) Base is `<remote>/<default_branch>` (src/config.ts:125-127). New worktrees start from it with no readiness check (src/next.ts:251-256). Per-leaf errors are caught, reported and exit 1 (src/next.ts:547-551, :763). Nothing commits or pushes.
- (B) The check must precede ensureWorktree: a reused branch/worktree saves `state.worktree` before `base()` runs `merge-base HEAD <target>` for AKROGON_BASE (src/next.ts:259-260, :303-311, src/config.ts:128-131). So a missing tracking ref breaks existing leaves too, not only new ones.
- (A,B) `next` never fetches. Only `akrogon sync` fetches (src/sync.ts:46). `status` runs no git (src/status.ts:46-80). No doctor verb (src/akrogon.ts:32-87).
- (A,B) Handoff preflight is skill prose and runs `akrogon status` only after writes (shapes.md:166-170). Adding the check there alone is too late.
- (A,B) Four cases, measured (A: scratch repos; B: live checkout, command-scoped remote alias):
  - C1 no configured remote: `git remote get-url <r>` exits 2.
  - C2 remote with zero commits: `ls-remote --exit-code <r> refs/heads/<b>` exits 2; `worktree add` fails `invalid reference`; fetch fails `couldn't find remote ref`.
  - C3 branch on remote, never fetched: ls-remote exits 0, `rev-parse --verify refs/remotes/<r>/<b>^{commit}` fails, `worktree add` fails with the same `invalid reference` as C2.
  - C4 both resolve: base passes.
  C2 and C3 print the identical #20 error but need different fixes (first commit and push vs fetch).
- (B) Verify `refs/remotes/<r>/<b>^{commit}` in full so a same-named local branch or tag cannot pass. Without `--exit-code`, ls-remote with zero matches exits 0.
- (B) Exit 2 from ls-remote means that branch is absent, not that the remote has zero commits. Keep transport/auth failures separate from "branch absent".

## Recommendations
- Q1 (A,B) Refuse with remediation that names the case. Bootstrap would choose commit content and push for the operator, and cannot fix C1 or C3.
- Q2 (A,B) Before any handoff write and again at dispatch before ensureWorktree, one rule shared by both.

## Disagreement carried to operator
- Does dispatch contact the remote? (A) Local tracking ref only; ls-remote runs only after a failure, to pick the remediation. Reason: `next` runs from herdr hooks on pane events (src/next.ts:730-760), so a network call per dispatch adds latency and turns an auth hiccup into a dispatch stop. (B) Require remote branch existence too, so a stale ref for a deleted server branch cannot pass.
- (A) New: where the shared rule lives for handoff with zero leaves. Candidates: `akrogon status` gains the local check and the handoff preflight runs it before writes too, or the skill runs git itself (duplicates the rule), or a new verb.
