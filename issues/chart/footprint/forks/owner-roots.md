# Fork: owner roots

## Question
How does each event-named store get removed by the call that ends its owner? (slots/owner-brief.md)

## Taken
A under autopilot, 2026-11-22, merging slots/owner-B.md and slots/owner-C.md:
- O1 consults (B): a `close` verb in skills/watch-issues/scripts/consults.ts runs non-forced `git worktree remove` on every registered worktree under the case, under withConsultantLock, then trims the case to case.md, signature.json, status and turn files and writes `closed`. Git's refusal keeps the case open. SKILL.md names `close` as the only way to end a case. Keep `<anchor>-<seq>` (B: one folder per anchor would re-consult repeats). C's per-anchor folder: not taken.
- O2 workers (B,C): `transition` refuses a move out of a non-failed phase while a registered `<slug>-u<N>` exists, naming the paths. Outside moveGuards so a land's move to merged never goes red. Akrogon removes nothing (B). C's reconcile tightening: not taken (the seat knows whether a worker still runs).
- O3 locks (B,C): delete the per-slice lock file; stopSlice takes the home admission.lock exclusive; withAdmissionLock loses its slice argument. Keep `line-<repo>` (B; bounded at one per repo). One-time removal: widen the retired-lock rule to every runs/locks entry not starting with `line-`, keeping files a process holds open.
- O4 direct worktrees (B,C): skills/chart-issues/assets/direct-route.md step 1 creates sparse like createSparseWorktree (no issues/), drops --lock/--reason and the unlock steps. No reconcile rule.
