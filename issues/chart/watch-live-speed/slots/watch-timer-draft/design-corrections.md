
## Corrections, 2026-11-20 (chart issues/chart/watch-live-speed)

Binding: issues/chart/watch-live-speed/forks/disposition.md `## Taken` items 1-8 with Probes P1-P3 and Corrections 1-3, A under autopilot; Correction 3 item 1 replaces Correction 2 item 1. Cause of the shell failures: tests/e2e/watch-tier.ts set `worktree_root` to the leaf temp holding the tier's runtime, so `akrogon unpause` deleted the hc socket (disposition Findings F2).

Restart steps for seat A on `akrogon start watch-timer`, in order:
1. Clear the abandoned capture pairs under implement-issue's rule.
2. Clean up what the spent grant left, under grants[0]'s cleanup steps and absence check: the `akr-e2e` trust entries in ~/.claude.json, ~/.codex/config.toml and ~/.gemini/antigravity-cli/settings.json, /tmp/akr-e2e and /tmp/watch-timer.log.
3. Write the uncommitted diff to `implementation/superseded-2026-11-20.diff`, then discard it (the 17:51 timer.ts readiness change and the test debug edits are unproven).
4. Take `akrogon phase watch-timer failed --slot A --reason "re-plan: issues/chart/watch-live-speed corrections; operator runs akrogon phase watch-timer plan.synthesis"`.

Plan rules:
- The plan seat rewrites the tests on the current branch, so each defect test runs red against the committed product code. Every commit that changes a path in the current `frozen` record, and every new test file, carries its `Test-Change:` trailer citing these Corrections, and each dropped frozen path gets an empty-commit trailer (src/phase.ts `requireFrozenCitations`; the old record stays until the next plan-to-implement move). The next freeze covers the product files too, so each implement commit fixing a product file carries a `Test-Change:` trailer for that path citing this section.
- Red-first proof is free: no paid launch at plan.
- Live order: free preflight (typecheck of the test files, config parse, tier start and teardown, criterion 13's skill check), then the stand-in runs of both shapes through the tier, then one paid cell, then the rest one at a time. After a paid red, no further paid cell runs until a free reproduction passes after its repair. A live-only diagnostic launch must name an observation no earlier run produced, and stops the operation when it repeats the known failure without it. A rerun repeats the failed cell and every cell whose inputs a shared fix changed. A failed cell records the watcher screen and the timer's printed reason, or, when it fails before any terminal exists, the failing operation and its error. Assertions are exact on observable effects per due and never count the model's commands or match its wording.
- Writes: only under `$TMPDIR` and the leaf folder. No fixed `/tmp` path, no operator-home skill link or other home file beyond the harness trust and session records the grant names. A needed home change is the operator-blocker stop.
- Preflight launches send no prompt, run under grants[1] and do not count against its paid bound.
- Grant: the new grant in readiness.yaml (grants[1]); grants[0] is spent (at least 25 implement launches and 1 plan launch, issues/chart/watch-live-speed/forks/disposition.md Findings).

Stated limits added: a timer exit reason in a paid cell is not readable after `--rm` removes the screen.

Superseded in this design: `## Binding decisions` "What only a real harness shows" and `## Leaf architecture` "Live run shape" (the full per-harness matrix, live second start, restart, old cron tick, paused start and unpause, and `pi --skill` without `--no-skills`) are replaced by criterion 11 as corrected: the paused receipt order and paused checks are proven on the stand-in through the real tier, and the `akrogon next` act in the root cell's unpaused tick; the Standing design line "use only existing machinery" stands, and the tier fix of criterion 12 edits that existing machinery.

Owned surfaces added: tests/e2e/watch-tier.ts (criterion 12), tests/e2e/watch-live.e2e.ts, tests/watch-timer.test.ts, skills/watch-issues/SKILL.md (criterion 15).
