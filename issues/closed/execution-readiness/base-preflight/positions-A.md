# Position A: base-preflight

## Recommendation

Implement exactly the locked design: a read-only `akrogon preflight` verb backed by two single-purpose probes in a new `src/preflight.ts`, a dispatch gate in `allocate` before `ensureWorktree`, and fully-qualified tracking refs at the two consumers the design names (`git worktree add` start revision and `base()` merge-base). Verified live: `git rev-parse origin/main` resolves `refs/heads/origin/main` before `refs/remotes/origin/main`, and `git worktree add <path> origin/main` silently branches from the hijacking local branch, so the `target()` → `trackingRef()` change at both consumers is required, not cosmetic.

## Concrete changes

### src/preflight.ts (new module)

- `export class PreflightError extends Error` carrying `code: 'C1' | 'C2' | 'C3' | 'unproven'`, the git argv, cwd, exit status and stderr; `message` is plain text naming the case and the remediation (for unproven, the failed command context instead of remediation).
- `trackingRef(repo: Repo): string` → `refs/remotes/${repo.config.remote}/${repo.config.default_branch}`.
- `localBase(repo: Repo): Promise<void>` — `run(['git', 'rev-parse', '--verify', '--quiet', `${trackingRef(repo)}^{commit}`], repo.root)`; code 0 returns, code 1 throws `PreflightError('C3')` with the `git fetch <remote> <branch>` remediation, any other code throws `CommandError`.
- `remoteBase(repo: Repo): Promise<void>` — first `git remote get-url <remote>`; any non-zero exits as `PreflightError('C1')` naming the remote (verified: exit 2, `error: No such remote 'origin'`). Then `git ls-remote --exit-code <remote> refs/heads/<branch>`: code 0 returns, code 2 throws `PreflightError('C2')` (make and push a first commit), any other code throws `PreflightError('unproven')` carrying command, status and stderr (verified: unreachable remote exits 128, not 2).
- `checkBase(repo: Repo, remoteRequired: boolean): Promise<void>` — always runs `localBase`. On local success, runs `remoteBase` only when `remoteRequired`. On a C3 local failure, runs `remoteBase` to reclassify: its C1/C2/unproven error wins, otherwise re-throws the C3. One function, no mode-flag branching inside the probes; the flag only decides whether the remote probe gates a local pass.
- `preflightCommand(cwd: string): Promise<void>` — `requireRepo(readGlobal(), cwd)` then `checkBase(repo, true)`; silent on success, error propagates to the CLI's non-zero exit. No writes.

### src/config.ts

- `base()` resolves `${trackingRef(repo)}` instead of `target(repo)` so `AKROGON_BASE` (src/next.ts:311) and `effectiveConfig` (src/config.ts:144) never resolve a shadowing local branch or tag. `target()` itself stays for `phase.ts` and the usage messages.

### src/next.ts

- Gate at the top of `ensureWorktree` (src/next.ts:230), before the `existsSync(path)` branch: compute `remoteRequired = !existsSync(path)` — the branch where `git worktree add` runs — then `await checkBase(repo, remoteRequired)`. Gating inside `ensureWorktree` rather than in `allocate` keeps the worktree-path-mismatch check first and guarantees the check precedes every `state.worktree` write and every worktree creation, once per leaf per invocation. Leaf-level refusal already surfaces through `dispatchLeaf`'s catch → `report()` → `skipped` → `process.exitCode = 1` (src/next.ts:503-507), giving the one-shot refusal with remediation in the JSON error field.
- `git worktree add -b <slug> <path> ${trackingRef(repo)}` (src/next.ts:255) replaces `target(repo)` as the start revision.

### src/akrogon.ts

- `case 'preflight':` with `z.tuple([])` positionals, lazy `import('./preflight')`, and `preflight` added to the usage string (src/akrogon.ts:87).

### README.md, tests/command-reference.test.ts

- One table row `| \`akrogon preflight\` | Verify the configured base remote branch and local tracking ref. |` and `preflight: ''` in `contracts`.

### skills/chart-issues/assets/shapes.md

- In `## Preflight and validation` (line ~164), first paragraph gains one sentence: before any handoff write, run `akrogon preflight` at the registered root and refuse the handoff on non-zero exit, handing the printed remediation to the operator.

### tests/helpers.ts — required fixture repair

`fixture()` (line 30) plants `refs/remotes/origin/main` via `update-ref` without any configured `origin` remote. Under the new gate every worktree-creating dispatch in the suite hits C1 and every leaf fails. Fix the fixture to be honest: `git init --bare` a `remote.git` under `f.home`, `git remote add origin <remote.git>`, `git push origin HEAD:main` (push creates the tracking ref; drop the `update-ref` line). Collisions to adapt: thirteen `['git', 'remote', 'add', ...]` sites become `set-url` or are deleted as redundant — next.test.ts:746, 871, 928, 1623, 1677, 2232; pull.test.ts:44, 92, 128, 172-173, 209, 217; sync.test.ts:12, 51. pull.test.ts's missing-origin case (`expect(missing.stderr).toContain('origin')`, ~line 207) needs `git remote remove origin` first. This is the largest blast radius of the leaf and belongs in the plan, not discovered mid-implementation.

## Risks

- R1 Ambiguous `target()` remains in `phase.ts` (`git diff origin/main...HEAD`, src/phase.ts:259,266-267) and `log.ts:11`. Design explicitly scopes full qualification to worktree creation and `AKROGON_BASE`; a same-named local branch can still skew `next`'s diff guards. Record as a known limitation, not expanded scope.
- R2 The gate runs per allocation; a `--all` sweep with many new-worktree leaves pays one `ls-remote` per leaf. Accepted by Q3-A; `next` already tolerates slow git under the flock.
- R3 `ls-remote` to a hanging remote has no timeout today (`run` supports `deadlineMs`, design does not ask for one). Do not add one; a stalled remote simply stalls that allocation the same way `git worktree add` would.
- R4 C1 detection relies on `git remote get-url` rather than `ls-remote` stderr matching, because ls-remote exits 128 for both missing and unreachable remotes (verified) — stderr strings like "does not appear to be a git repository" are not a stable classifier.
- R5 Refusal text rides inside `report()`'s JSON `error` field on stderr, not a dedicated plain-text line. Consistent with all other per-leaf dispatch errors; criterion 5 is met by exit 1 plus the remediation in that field.

## Simpler alternative

A single `checkBase(repo)` that always queries the remote, with the existing-worktree path skipping only the remote proof — same shape, minus the `remoteRequired` parameter. Rejected: it either violates criterion 6's "no remote query with an existing worktree" or smuggles the same flag inside. A three-function design (probes + per-callsite orchestration) duplicates the local-failure→remote-classify sequence at two callsites; the flag keeps it in one place while the probes stay single-purpose.

## Acceptance evidence

1. Temp repo per case via CLI: `akrogon preflight` exits non-zero printing C1 remediation (no remote), C2 (bare remote, branch absent), C3 (pushed branch, `git update-ref -d refs/remotes/origin/main`), and exits 0 when both resolve. Case names and remediation strings asserted in stderr.
2. `refs/heads/origin/main` and `refs/tags/origin/main` fixtures: `preflight` still fails C3 when the tracking ref is absent; when the tracking ref exists, the worktree's `merge-base` equals the tracking commit, not the shadow.
3. `remote set-url origin /nonexistent`: exit non-zero, stderr carries git's command, 128 and stderr; C2 remediation absent.
4. `akrogon preflight` from `$TMPDIR` (not a repo) and from an unregistered repo: non-zero, no files written; run inside a registered repo with zero `issues/open` leaves: exits 0.
5. `akrogon next <slug>` with tracking ref deleted: exit 1, stderr JSON names the case remediation, `state.worktree` absent, no worktree directory, zero herdr calls. Reused-leaf-branch case: leaf branch exists, remote branch deleted → refusal before `worktree add`. Existing-worktree case: tracking ref deleted → refusal naming C3/C2 as classified.
6. `akrogon config` in a leaf worktree prints `AKROGON_BASE` equal to `git merge-base HEAD refs/remotes/origin/main` even with a divergent `refs/heads/origin/main` present.
7. `bun run typecheck`, `bun test`, `bun run format` green; `command-reference.test.ts` passes with the new row.

## Read-first paths

- src/next.ts:230-260 (ensureWorktree gate site, worktree add), :290-315 (allocate, AKROGON_BASE)
- src/config.ts:119-131 (requireRepo, target, base)
- src/shell.ts (run/command/CommandError shapes)
- src/akrogon.ts (verb dispatch, usage)
- tests/helpers.ts:11-40 (fixture) and tests/next.test.ts dispatch-fixture patterns
- skills/chart-issues/assets/shapes.md `## Preflight and validation`
- issues/chart/execution-readiness/forks/git-base.md Taken block; slots/git-base-merged.md measured case table
