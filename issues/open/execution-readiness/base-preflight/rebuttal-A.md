# Rebuttal A: base-preflight

Both positions land on the same architecture: new `src/preflight.ts`, `git remote get-url` for C1 (stderr from `ls-remote` is not a stable classifier), `ls-remote --exit-code` code 2 for C2 with all other non-zero as unproven, `rev-parse --verify <tracking>^{commit}` for the local ref, one shared composition reused by the verb and the dispatch gate, `trackingRef()` at `worktree add` and `base()`, and `target()` kept for `phase.ts`. The measured case table in `slots/git-base-merged.md` supports all of it.

## Fork resolved: gate placement

This is the only substantive fork. A put the gate inside `ensureWorktree`; B puts it in `dispatchLeaf` after `seats(global, repo)` and before `allocate()`.

Resolved: **adopt B's placement.** Reasons:

- A refusal inside `ensureWorktree` still pays `allocate`'s `panes()` and `tabs()` calls and, when no live tab matches, `activeCount()` — a full pane list plus a `discover()` walk of every registered repo's issue tree. Hook events call `next` repeatedly; a repo with a broken base pays that sweep on every event instead of refusing in three git calls. B's placement refuses before any allocation work.
- Correctness is identical: `ensureWorktree` holds the first state write (`saveState` of `worktree`), and gating in `dispatchLeaf` still precedes it, still runs once per leaf per invocation through the same `report()` → `skipped` → exit-1 funnel, and covers every dispatch path since all of them funnel through `dispatchLeaf`.
- The duplicated decision — `existsSync(resolve(repo.root, repo.config.worktree_root, slug))` for "will this allocate create a worktree" — is one expression keyed to the same path computation `ensureWorktree` already owns. Accepted; document in the plan that the gate and `ensureWorktree` share this predicate.

Conceded cost, recorded honestly: B's ordering reports a broken base before `ensureWorktree`'s recorded-worktree-path mismatch check. A corrupted `state.worktree` combined with a broken base is doubly exceptional; either refusal is correct. Not worth a reorder.

## Adopted details from B

- D1 `verifyLocalRef` returns the commit SHA and `preflight()` returns it; the verb prints `<remote>/<branch> <sha>` on success. Better than A's silent success — a confirmation line names what was proven.
- D2 `ensureRemote` runs before `verifyLocalRef` in both compositions. Cheapest probe first, and the CLI then reports C1 ahead of C3 when both hold. Same case outcomes as A's ordering.
- D3 One composition per caller is right, but unify the shape: `checkBase(repo, remoteRequired: boolean)` — dispatch passes `mustCreate`, the verb passes `true`. Probes stay single-purpose; no duplicated orchestration. This is A's interface with B's probe order.
- D4 Separate `tests/preflight.test.ts` for the CLI cases, additions to `next.test.ts` for dispatch paths — matches repo convention (one file per verb domain).
- D5 "Zero `ls-remote` on existing-worktree dispatch" is proven by pointing the remote at an unreachable URL and asserting dispatch succeeds — no instrumentation needed. Adopt.

## Pushback on B

- P1 "Print `message` to stderr and exit 1 without a stack" — reject the bespoke catch. No existing verb catches and reformats its own errors (`src/akrogon.ts` lets throws propagate); a `PreflightError` uncaught prints its message plus stack, and criteria 1/3 are satisfied because stderr contains the case name and remediation. Adding a catch just to hide a stack is success-shaped error handling the style rules forbid. Tests assert stderr *contains* case and remediation, never its absence of stack lines.
- P2 `verifyRemoteBranch` must never print the C2 remediation on non-2 exits (B states this correctly), but also note `ls-remote` exits 128 — not 2 — for both missing-remotes and unreachable URLs (verified live), which is exactly why `ensureRemote` via `git remote get-url` (exit 2, `error: No such remote`) owns C1. Worth pinning in the plan so an implementer doesn't try to classify C1 from `ls-remote` stderr.

## Carried from A, uncontested by B

- `tests/helpers.ts` `fixture()` must gain a real bare remote (`git init --bare`, `remote add origin`, `push origin HEAD:main`, drop the fake `update-ref`), and the thirteen `['git','remote','add',...]` call sites adapt to `set-url` or deletion; `pull.test.ts`'s missing-origin case needs `git remote remove origin` first. B's test list assumes the fixture works but never names this repair — synthesis must carry it explicitly.
- R1: `phase.ts` keeps ambiguous `target()` per the locked design; record the same-named-branch skew in `git diff origin/main...HEAD` as a known limitation.

## Net

No disagreement survives: one shared `checkBase(repo, remoteRequired)` with `ensureRemote → local → conditional remote`, gate in `dispatchLeaf` before `allocate`, verb prints `<remote>/<branch> <sha>`, fixture repair owned by the plan.
