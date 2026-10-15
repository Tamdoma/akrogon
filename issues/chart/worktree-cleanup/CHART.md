# Chart: worktree-cleanup

## Destination
After a leaf merges, reconcile removes the worktrees it left behind (verify, merge-build, worker and the leaf's own), anything it keeps is visible with its reason, and akrogon's folders and outputs stay clean of junk and leftovers. Registered repo: akrogon.

Route: lifecycle (debate no)

## Forks taken
- [Scratch copy removal](forks/scratch-copy-removal.md): force-remove dead verify and build copies (2a); force-remove worker copies once the owner merged, failed keeps the guard (3a). Correction: build copies protected by an owner record written before the copy (Round 2, 1a).
- [After-merge remainder](forks/after-merge-remainder.md): stacked members closed at once (2a); dirty merged leaf worktree kept and shown (3a); plain status shows kept entries (4a); unregistered folders deleted, mechanism in store-hygiene (5).
- [Store hygiene](forks/store-hygiene.md): clean all akrogon places, stop a finished leaf's leftover processes from reconcile once its tab is gone, fix leaking tests (1a); ownership proves safety, live pane or process blocks (2a); runs in every reconcile pass, unprovable items kept and shown, never aged out (3a).

## Open forks
none

## Fog
none

## Off route
- The framework test "SIGKILL of the direct browser owner" killing its verify parent: framework-side cause of the verify leftovers, reported separately on operator request.
- Dead verify records without `end`: `greenRun` ignores them (src/verify.ts:63-77).

## Pending steps
- After store-sweep, finished-leaf-processes and test-isolation merge: run `akrogon next --all` from outside any registered repo, then check that each path in [store-hygiene F1](forks/store-hygiene.md) is gone or shown with a reason in plain `akrogon status`, and that no `akrogon-l*.slice` of a finished leaf is loaded. Owner: the door. Proof: the listing before and after, recorded in this chart.

Done 2026-10-16 by the door (A on operator autopilot): ran `akrogon next --all` inside akrogon and inside framework rather than from outside every repo, because from outside it would also have started blepsis `headless-default`, which the operator has not started. Plain status no longer shows kept items (fb60ccd), so `akrogon leftovers` is the reason surface. Before:
```
PRESENT /var/tmp/akr-1000/6855/58898f27/run-RewR23
PRESENT /var/tmp/akr-1000/6855/f8-base2.log
PRESENT /var/tmp/akr-1000/6855/f8-rerun.log
gone /tmp/akr-1000
PRESENT /home/ivan/Work/infra/tamdoma/framework/.temp
gone /home/ivan/.akrogon/run.lock
gone /home/ivan/.akrogon/framework-tests.lock
gone /home/ivan/Work/infra/akrogon/runs/last-start
gone /home/ivan/Work/infra/akrogon/.git/akrogon-base-runs.lock
PRESENT /home/ivan/Work/infra/tamdoma/framework/.git/akrogon-base-runs.lock
PRESENT /home/ivan/Work/infra/tamdoma/framework/issues/.lock
empty repo dirs in /var/tmp/akr-1000: 0 of 4
worktrees/repo dirs: akrogon framework 
dangling symlinks: akrogon 0, framework 5
finished-leaf slices loaded: 5
failed run units: 0
```
After:
```
PRESENT /var/tmp/akr-1000/6855/58898f27/run-RewR23
PRESENT /var/tmp/akr-1000/6855/f8-base2.log
PRESENT /var/tmp/akr-1000/6855/f8-rerun.log
gone /tmp/akr-1000
PRESENT /home/ivan/Work/infra/tamdoma/framework/.temp
gone /home/ivan/.akrogon/run.lock
gone /home/ivan/.akrogon/framework-tests.lock
gone /home/ivan/Work/infra/akrogon/runs/last-start
gone /home/ivan/Work/infra/akrogon/.git/akrogon-base-runs.lock
gone /home/ivan/Work/infra/tamdoma/framework/.git/akrogon-base-runs.lock
gone /home/ivan/Work/infra/tamdoma/framework/issues/.lock
empty repo dirs in /var/tmp/akr-1000: 0 of 4
worktrees/repo dirs: akrogon framework 
dangling symlinks: akrogon 0, framework 0
finished-leaf slices loaded: 5
failed run units: 0
```
`akrogon leftovers`: framework `unowned entry` for `.dcf16a3f00401334-1.node-gyp`, `.temp`, `run-RewR23`, `77861a00`, `f8-base2.log`, `f8-rerun.log` (unowned items wait until no framework leaf is running, store-hygiene Q2); akrogon `unowned entry` `/var/tmp/akr-1000/5d20/07a5c53f` and one unmanaged Claude Code worktree. The 5 loaded `akrogon-l*.slice` units are the 5 running leaves (akrogon peer-wait-signal, state-home, release-any-phase; framework upload-deploy-config, upload-scope-guards); no finished leaf's slice is loaded.

Handed off 2026-10-15
