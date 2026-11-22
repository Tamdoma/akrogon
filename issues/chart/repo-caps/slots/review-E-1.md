# Slot E review

Verdict `fix`.

Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Reviewed head `98b1c107d759574439912cc6243a0b42fb0bca98`.

## Fixes

- **F1. A newer capacity waiter can take the slot ahead of an older one.** With repo cap 1, run and stop `younger`, run `running`, and use `next older` to queue a new leaf. Run `start younger` to clear its stop and queue it behind `older`. Stop `running` and run `next --wake`. Both capacity waits are recorded, with `older` 352 ms ahead. The only live leaf after wake was `younger`. The existing-worktree sweep in `src/next.ts:1486-1498` reaches it before the sorted refill. This breaks the oldest eligible waiter requirement in INTAKE and report criteria 2 and 3. Cover a restart with a closed seat alongside a new waiter.
- **F2. A capacity refusal from `akrogon seat <leaf> A` never enters the queue.** With repo cap 1, start one leaf, then try `seat waiter A` on a new leaf. It prints the repo cap refusal. Stop the running leaf and run `next --wake`. The refused leaf still has no tab or capacity timing row. The refusal throws at `src/next.ts:1230-1234`, while refill requires the wait row at `src/next.ts:834-838`. This breaks INTAKE's automatic start for a capacity-refused leaf and the documented refusal behavior in `docs/use/run-work.md:54`. Preserve the direct seat command's slot and task contract when resolving how its refusals are queued.
- **F3. Unpausing can leave a capacity waiter idle with room available.** With repo cap 1, start a leaf and queue another with `next`. Pause, stop the running leaf, let `next --wake` run during the pause, then unpause. The capacity waiter stays without a tab even though all those commands exit successfully. `unpausePass` at `src/next.ts:1525-1539` sweeps seated and merged leaves and omits refill. This misses the documented unpause dispatch pass (`docs/reference/commands.md:32`) and can leave the slot empty until another event triggers a wake.
- **F4. The proof misses the choice between two eligible repositories.** The cross-repo case in `tests/pause-next.test.ts:613-644` fills the older waiter's repo to its cap. Sorting by repo first and wait time only within each repo would still pass all three new cases. Report criterion 2 needs a case where both repos fit and the older waiter is in the repo visited later. The companion case with a capped repo exercises skipping.

## Verification

- `check slot-e-caps: 0 direct/check-slot-e-caps-1795365036281-1195419.log`. All three added CLI tests passed on the reviewed head.
- `check slot-e-refill-cases: 1 direct/check-slot-e-refill-cases-1795365185106-1524241.log`. Three targeted CLI reproductions failed at the refill assertions above. The scratch tests used the repo's hc and systemctl fixtures and were removed after the run.
- `git diff --check` passed. No `AREA.md` changed. The config reference and limit docs match the cap configuration. `docs/use/run-work.md:40` and `docs/reference/commands.md:18` still describe only the seated or merged resume path, while the new code starts tabless capacity waiters too.
- Both `Test-Change:` trailers checked. The three new cases match the intake and report, subject to F4. Changing the invalid repo `max_active` fixture from 2 to 0 follows the new positive-integer contract and preserves the rejection assertion.
- `direct/plan.md` was absent. The report maps test names to criteria and claims base-red and isolated retry results, without the commands or log references. Slot A owns the full suite and direct verification. The independent checks here cover the named feature tests and the three reproduced defects.
