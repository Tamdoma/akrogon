# Final check: leftover-worktree, slot B

Two defects. Everything else in the shape checked out sound; the sound parts are not listed per the brief.

## X1. A worktree whose slug branch has been deleted falls through the gate and is adopted broken or stale

The gate's premise is "the slug branch exists". When the store path exists but `refs/heads/<slug>` does not, the gate never applies, and the shape falls back to today's path-exists adoption — which validates only that the path is a worktree root of the same repo (`src/next.ts:ensureWorktree`). In that state the worktree's HEAD symref still points at the now-missing branch, so the branch is unborn: `git log` fails with "your current branch '<slug>' does not have any commits yet" while the files sit on disk intact, and `git status --porcelain` reports every tracked file as a staged addition against the empty tree. The leaf is adopted into a worktree where its base computation (`git merge-base HEAD <trackingRef>`, `src/config.ts:base`) cannot even resolve HEAD. This reproduces the chart's own failure class — a first allocation adopting a leftover that never gets reset to the tracking ref — through a door the shape leaves open.

Reachability: the state is not producible through akrogon's own cleanup (reconcile removes the worktree before deleting the branch, `src/reconcile.ts:removeMergedWorktree`), but it is one manual `git update-ref -d` or `git branch -D` away, and `update-ref -d` deletes a branch checked out in a live worktree without any guard (probe evidence below), so the mistake is easy to make by hand. Severity: narrow but real, and the failure surfaces as confusing downstream git errors inside a started seat rather than a clean allocation refusal.

Evidence:
- Probe (practitioner, /tmp/wt-probe4, 2026-11-25, git 2.56.1): `git update-ref -d refs/heads/slugprobe` exit 0 while the branch was checked out in a linked worktree; afterwards `git symbolic-ref HEAD` still reads `refs/heads/slugprobe`, `git log` reports the branch has no commits, and porcelain lists all files as `A`.
- `src/next.ts:ensureWorktree` (practitioner, code read 2026-11-25): the path-exists branch performs no HEAD or branch-existence validation; creation from the tracking ref happens only when the path is absent.
- Fork file section "## Taken" (the shape under test): gate conditions all start from the branch existing.

Smallest fix: extend the HEAD rule by one clause — when the store path exists and its HEAD is `refs/heads/<slug>` but the branch ref is missing, refuse loudly exactly like the other HEAD anomalies (never remove, never adopt). One extra condition in the same check, no new machinery. (Recreation would also heal the nothing-to-lose case, but orphaned committed work can hide in the index and reflog of an unborn worktree, so the shape's own conservative stance on anomalies is the coherent choice.)

## X2. The shape assumes git refuses to move a checked-out branch, but the sha-bound primitive does not — the two requirements have no enforcing mechanism as written

The Taken text pairs "reset the branch to the tracking ref, bound to the sha the gate proved" with "never move or delete a branch that another worktree has checked out (today's loud checkout refusal stays)". The parenthetical is wrong about git: the binding is only available through `git update-ref <ref> <new> <old>` or `git branch -f` variants, and `update-ref` has no checkout guard at all — it moves and even deletes a branch that is checked out in another worktree, exit 0. The checkout refusal the shape relies on exists only in `git branch -f` and `git worktree add -B`, both of which are unbound (G4 in the fork's own "## Charting proofs" shows the unbound `-B` overwriting a moved ref). So the shape as written specifies two properties and no command or composition that delivers both; a plan implementing it naively either drops the sha binding (reintroducing the silent-overwrite race G4 demonstrated) or drops the checkout guard (violating the stated rule).

Severity: small — this is a spec gap, not a data-loss path, because the one legitimate checkout location (the store path itself) is removed before the reset. But "the exact git calls are open for the plan" plus a wrong assumption about what git enforces is exactly how the binding or the guard gets lost in implementation.

Evidence:
- Probe (practitioner, /tmp/wt-probe4, 2026-11-25, git 2.56.1): `git update-ref refs/heads/slugprobe <new> <old>` exit 0 while the branch was checked out in a linked worktree — moved under a live checkout; `git update-ref -d` likewise exit 0.
- Fork file section "## Charting proofs" G3/G4 (practitioner, 2026-11-25): unbound `-B` overwrote a moved ref, stranding the new commit; `git branch -f`/`worktree add -B` carry the checkout guard but no binding.
- Fork file section "## Taken" (the shape under test): the quoted pairing.

Smallest fix: name the composition in the shape — check `git worktree list` for the branch (the parse already exists as `src/reconcile.ts:registeredWorktrees`) and then run the sha-bound `git update-ref`, both under `worktreeLock(repo.root)` which the shape already mandates. The residual race (a human checking out the branch in the same second) is acceptable and worth one clause acknowledging it, since git offers no atomic guard-plus-bind operation.

## Verified sound while checking (not defects, one line each as context for the two above)

- The refusal's operator step works: `git worktree remove --force` succeeds on a worktree with an initialized submodule (probe, /tmp/wt-probe3, 2026-11-25, exit 0) where the plain removal refuses, so the message's named step is correct for every refusal case the shape lists.
- The unreachable-commits check inside `worktreeRemovable` is vacuous inside the gate (HEAD is reachable by the gate's own premise) — harmless, not a defect.
- Reusing `worktreeRemovable` is buildable as written (it is a module-level function in `src/reconcile.ts` taking `(repo, path)`).
- The growth-stop handoff (branch with own commits) is untouched by every branch of the shape.
