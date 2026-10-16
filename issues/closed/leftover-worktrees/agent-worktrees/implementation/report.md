# Implementation report: agent-worktrees

Mode: serial-solo (single unit, single wave). Base `c7c4ef8`, head `3c5cebc`; refresh ran, branch already current.

## Changed files

- `src/admission.ts` — exported `liveStartTime` (the /proc field-22 reader) unchanged, per design.
- `src/reconcile.ts` — `endedAgentWorktree` inside `reconcile()`: identity (`<root>/.claude/worktrees/agent-<id>` + matching `claude agent` lock + dead owner), eligibility (non-default branch, no merges in `refs/remotes/<target>..HEAD`, `git cherry` clean), pane vetoes, then `removeWorktree` with the lock text and `git update-ref -d` bound to `row.head`. `removeWorktree` gained an `unlock` param: unlock after vetoes/cleanliness, best-effort re-lock on post-unlock remove failure. `reconcileNeedsPanes` returns true when `.claude/worktrees/agent-*` exists. Non-candidates fall through to `unmanaged worktree` unchanged.
- `tests/reconcile.test.ts` — six planned cases plus helpers (`agentWorktree`, `agentLockText`, `removedReport`, `procStartTime`, `deadAgentLock`).
- `README.md`, `src/AREA.md` — one clause each naming the new removal rule.

## Corrections during implement

- Planned-test fixes committed as `3c5cebc` with `Test-Change` trailer: `agentWorktree` defaulted to a bare lock (the `--reason` arg was only passed when explicit — bare `locked` line fails the lock regex); landing commits via `git update-ref refs/remotes/origin/main` was wrong because `next` fetches first and resets the tracking ref — tests now `git push origin HEAD:main`.
- Forbidden-word check (`run-permit.test.ts`) flagged `cheap` in a reconcile comment; reworded.

## Commands and proofs (head 3c5cebc)

- `bun test tests/reconcile.test.ts` → `check impl-reconcile-tests: 0 .../check-impl-reconcile-tests-1792134174229-3147360.log` (45 pass; covers C1–C6: removal+branch+record, live/recycled owner, 8-case keep matrix, pane/proc vetoes, ignored files, bound-delete error + unlock-failure paths).
- Deliberate break (liveness check disabled) → `check impl-deliberate-break: 1 .../check-impl-deliberate-break-1792133784150-2038648.log` — the live-owner test went red.
- `akrogon verify` → green on `3c5cebc`; `verify test: 0 .../check-test-1792134337149-3171679.log`, `verify typecheck: 0 .../check-typecheck-1792134341749-3171679.log` (993 tests, ~157s — wall time minutes).
- Synthesis red runs of the planned tests are recorded in plan.md (`plan-t1` … `plan-t6` logs under `implementation/`).

## Criterion map

| C | Proof | Result |
|---|---|---|
| 1 | `ended claude agent worktree is removed and its landed branch deleted` | green |
| 2 | `agent worktree with a live lock owner stays, recycled pid releases` | green |
| 3 | `agent worktrees failing one check stay locked as unmanaged` + `eligible agent worktree stays while a pane or process sits inside` | green |
| 4 | bound `update-ref -d` + `stuck agent branch ref reports the delete error; failed unlock leaves the lock` | green; mid-pass move race not injectable in-process (plan.md limitation) |
| 5 | `ignored files do not block agent worktree removal` | green |
| 6 | full `tests/reconcile.test.ts` green; non-candidates fall through to `unmanaged worktree` | green |

## Limitations

- A branch moved between the `git worktree list` proof and `update-ref -d` is reachable only via mid-pass concurrency; covered by the bound delete (readiness proof: wrong-old refuses) and the stale-ref-lock error path.
- `removeWorktree` re-lock is a no-op when `git worktree remove` unregisters before failing; the leftover directory then surfaces under the unregistered-entry rules — recorded as the design's failure path.
- `reconcileNeedsPanes` fires on any `agent-*` entry under `.claude/worktrees`, registered or not — one extra pane fetch in passes that only hold strays there.

## check.fix repairs (head 76e84b0, base c7c4ef8 unchanged)

- F1 (locked-decision): resolved in plan.md `## Implementation notes` — re-lock is best-effort; a remove that unregisters before failing leaves the directory unregistered, unlocked, recorded with the removal error. Proven by the new `agent-partial` case in the stuck-branch test.
- F2 (deliberate break on final head): `released` check disabled → `check fix-break-owner: 1 .../check-fix-break-owner-1792134823395-4186338.log` (live-owner test red); restored.
- A-F1 (missing case): `agent-mismatch` row added to the keep matrix; id check disabled → `check fix-break-id: 1 .../check-fix-break-id-1792134823705-4186765.log` (red); restored.
- Green reruns: `check fix-t3-t6: 0 .../check-fix-t3-t6-1792134809096-4172046.log`, `check fix-reconcile-tests: 0 .../check-fix-reconcile-tests-1792134840971-3592.log` (45 pass), `akrogon verify` green on `76e84b0` (993 tests ~153s).

## Blocker (check.fix round 2): locked decision F1

- **Decision needing change:** design.md binding avoidance — "on removal failure re-lock with the original reason so the worktree is left as found."
- **Attempted operation:** restore a Claude agent worktree after `git worktree remove` failed post-unlock (probe repo `/tmp/rep-probe`, operator uid 1000, git 2.56.0).
- **Error/observation:** the remove deletes the worktree's files including its `.git` pointer and unregisters it before failing on the parent dir; `git worktree repair` exits 1 (`.git` broken), `git worktree lock` exits 128 (not a working tree), and `git worktree add --lock` re-registers but checks out HEAD — untracked/ignored content the failed remove deleted is unrecoverable. No git mechanism restores the worktree "as found."
- **Owner:** operator.
- **Next action:** revise the binding-avoidance decision in `issues/chart/leftover-worktrees/forks/auto-remove.md` (the locked design source): either accept best-effort leave-as-found (current behavior — failure after unregistration leaves the recorded directory, kept entry naming the remove error) or prescribe a different removal protocol (e.g. pre-remove snapshot and restore), then re-dispatch the leaf.

## F1 resolution (check.fix round 2)

The operator revised design.md binding avoidance to: re-lock with the original reason while git still registers the worktree; once unregistered, record the remove error as a kept entry — the shipped behavior. `src/AREA.md` wording updated to match. The `agent-partial` case asserts the unregistered-directory outcome and its kept remove error, satisfying the revised contract.

- Proof on repair head `4088a91`: `check fix2-reconcile: 0 .../check-fix2-reconcile-1792137612967-1903122.log` (45 pass); `akrogon verify` green (`check-test-1792137772477-1928857.log`, `check-typecheck-1792137774653-1928857.log`, 993 tests ~153s).
