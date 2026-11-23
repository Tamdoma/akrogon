# Slot D review of paid-budget

**Verdict `fix`**

Base `814a2387`  
Head `b1d7942e4f641fd73a1fb3d394c9291e692203f5`

## Findings

- **F1 · `src/state-home.ts:75`.** The old-state migration can install a config the new build refuses. With a valid legacy `paid_budget` stanza in the tool checkout and an empty state home, `akrogon config` copied the stanza into `~/.akrogon/config.yaml`, then exited `1` on the unrecognized key. The next invocation failed on the migrated copy too. Omit the retired key in the legacy copy before writing the destination. The planned deletion from this host's current config covers a different path.
- **F2 · `tests/e2e/watch-consults.e2e.ts:276`, `skills/lifecycle-rules.md:7`.** A minute-budget stop can look like a product red. With a fake watcher and `AKROGON_SESSION_MINUTES=0.08`, the kept output showed `watcher never idle` after the budget-clamped ready wait. That assertion runs before `requireTime()`, so the output lacks the explicit deadline error. Conversely, a below-plan session count clearly prints the required count before setup. Check the minute deadline before reporting the ready failure and record the last completed stage so retries can be compared. The rule should also say how to treat the first minute stop when there is no previous attempt. The no-progress red applies once there is an attempt to compare.
- **F3 · `tests/e2e/watch-consults.e2e.ts:265` and `:443`.** Raising the minute budget above 13 minutes cannot extend the whole test. The watcher kill uses `remaining(780_000)` and the enclosing test has its own fixed `780_000` ms timeout. A seat raising 13 minutes to 26 therefore gets the same total test ceiling. Tie the total deadline to the supplied minute budget, with time for teardown, and give any independent health timeout its own diagnostic.

## Verification

- All 174 tests passed across `run-check`, `config`, `state-home`, `command-reference` and `verify` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The suites cover nested non-inheritance, both reserved repo environment names, and the `run-check` command contract.
- The old flag is rejected. A malformed old ledger and an old lock in an otherwise valid state home did not affect `akrogon config`. I found no live reader of the deleted cap, ledger or lock in the branch.
- The chart door records its budget and reason, and review uses kept session evidence. The standing grant and watch changes remove monetary approval stops while preserving account, target and outside-effect authorization. The deadline replay used fake harnesses in a private Herdr session and incurred no paid calls.
