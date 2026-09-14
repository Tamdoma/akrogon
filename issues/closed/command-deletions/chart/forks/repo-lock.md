# Does the per-repo lock go?

## Question
Q4 · Delete `withRepoLock` and `issues/.lock` entirely, with `pull` running unlocked, or keep it as Astra 6 recommended?

### Carries
- Lock: the merged `audit-fixes` leaf deleted the leaf locks (F16). This fork is the repo lock only; the global lock stays.

## Findings
- Holders: src/phase.ts:179-180, src/sync.ts:9-10, src/next.ts:481 take it inside the global lock, where it excludes nothing. src/pull.ts:43 takes it alone.
- pull writes only `issues/seeds/*.md` (pull.ts:71-76). No command reads seeds. sync excludes them from staging (sync.ts:110) and refuses them staged (:29). The lock serializes pull against no reader.
- Cost: one `flock` process per leaf per dispatch, and at herdr startup `next.sh --all` waits for `pull.sh --all` GitHub pagination before the first dispatch.
- Astra 6 kept it because pull holds it without the global lock. Concurrent pulls write identical bytes.
- Diff: state.ts:136-138, four callers, sync.ts:36 `lockPaths` (the global lock path stays when it lies inside the synced repo), init.ts:41 `.lock` ignore line stays for the global lock, tests: sync.test.ts (7 sites), phase.test.ts (4), next.test.ts (4), fetch-deadline-harness.ts:87. Largest item in the leaf.
- Existing untracked `issues/.lock` files in the three repos are inert afterwards; deleting them is optional.
- Operator round 1 (2026-09-14), verbatim: "4a - I don't want the functionality change. Everything has to be as it is right now. So only delete it if it doesn't have any function. Or the function is so minor that it doesn't matter." Condition checked: the lock's only function is serializing two `pull` runs against each other. Without it, two pulls that overlap can both try to delete the same stale seed and the second crashes with ENOENT at pull.ts:76; the seeds on disk are correct either way. Overlap needs `akrogon pull` (chart open) during the herdr startup pull. Every other holder runs inside the global lock. Confirmation asked in round 2.

## Taken
Operator answer (2026-09-14): `4a`, under the round 1 condition that nothing functional changes unless the function is too minor to matter. `withRepoLock` and `issues/.lock` are deleted and `pull` runs unlocked. The one function lost is serializing two overlapping pulls, whose worst case is a file-not-found error on one of them with correct seeds on disk. Foreclosed: keeping the lock.
