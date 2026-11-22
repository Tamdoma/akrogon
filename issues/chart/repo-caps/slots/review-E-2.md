# Slot E re-check, round 2

Verdict `fix`.

Chart base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior reviewed head `98b1c107d759574439912cc6243a0b42fb0bca98`. Reviewed repair head `c8912617cefdf0c73e74217b7e96c16ddb48bc39`.

## Open fixes

- **F2. The default `seat` capacity refusal still leaves the leaf out of refill.** With one live leaf and a machine cap of 1, `akrogon seat waiter A` without `--task` reports the cap refusal. After `stop running` and `next --wake`, the refused leaf still has no capacity wait row or tab. `src/next.ts:1255-1260` still throws before recording a wait. The edit to `docs/use/run-work.md:54` documents the exclusion. INTAKE's taken decision covers leaves refused for capacity and records no `seat` exception. This remains open unless the operator narrows the queue to `next` refusals. Preserve the direct command's slot and task semantics if it queues.
- **F5. Unpause can give the machine slot to a newer waiter.** In two repos with machine cap 1, start a leaf in repo X, queue the older waiter in Y, and queue the younger waiter in X. Pause X, stop its running leaf, and unpause X before the listener processes the exit. Both waiters fit at that point. The CLI reproduction recorded Y's wait 207 ms before X's. Unpause started X's waiter, and a subsequent wake left Y idle. `unpausePass` passes only the local repo to `resumeRepos` at `src/next.ts:1543`, and that list limits the refill candidates at `src/next.ts:852`. This new path breaks the taken cross-repo oldest-waiter rule and report criterion 2. Exercise the unpause path with two eligible repos.

## Confirmed repairs

- **F1.** The initial resume sweep skips capacity waiters. The restarted leaf with a closed seat now queues behind the older waiter in the CLI reproduction added to `tests/pause-next.test.ts`.
- **F3.** Unpause fills the freed slot in the original single-repo case. F5 covers the new interaction with another repo.
- **F4.** The new wake test makes both repos eligible and starts the older waiter in the later-visited repo. The original test still checks skipping an ineligible repo.

## Verification

- `check slot-e-round2: 0 direct/check-slot-e-round2-1795365423188-2098924.log`. All six focused feature tests passed on the repair head.
- `check slot-e-round2-boundaries: 1 direct/check-slot-e-round2-boundaries-1795365467440-2161851.log`. Both CLI reproductions reached their refill assertions and failed as described above. The scratch tests used the existing repo fixtures and were removed after the run.
- `git diff --check 98b1c107..c8912617` passed. No `AREA.md` changed. The resume docs now describe the capacity sweep. The repair's `Test-Change:` trailer maps the three added cases to F1, F3 and F4 with no changed prior assertions. The report records prior-head failures for F1 and F3 and a deliberate sort break for F4. `direct/plan.md` remains absent. Slot A owns the full suite and direct verification.
