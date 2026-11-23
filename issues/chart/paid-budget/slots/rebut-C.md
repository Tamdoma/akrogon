# Rebuttal C: paid-budget (`forks/design.md`)

No objection to deleting `src/budget.ts`, `budget.jsonl`, `budget.lock`, and `--sessions` in favor of `env AKROGON_SESSIONS=<n> AKROGON_SESSION_MINUTES=<m>` plus `issues/timings.jsonl` (Items 1–6, 8). Two concrete breaks in the final shape:

1. **Item 1 + Item 7 brick the host on auto-deploy (`src/config.ts:24,31-40`, `src/next.ts:1223,1472`, `src/self-update.ts:274,284`, `src/budget.ts:57`).**
   - `globalSchema` (`src/config.ts:24`) is `z.strictObject`, and this host's `~/.akrogon/config.yaml` currently carries `paid_budget`.
   - On the lifecycle route (`skills/chart-issues/assets/autopilot.md:15`), landing the leaf triggers `selfUpdate` → `deployStage` (`src/next.ts:1223,1472`, `src/self-update.ts:274,284`), which flips `~/.akrogon/current` and restarts `akrogon-listen.service` automatically with no door A in the loop.
   - **Consequence:** Either order fails in a single-release drop:
     - Deleting `paid_budget` from `config.yaml` *after* merge crashes `akrogon-listen.service` and every `akrogon` command (`status`, `next`, `land`, `verify`, `run-check`) with `Unrecognized key: "paid_budget"` the instant `selfUpdate` flips `current` (and bricks any other upgrading host carrying `paid_budget`).
     - Deleting `paid_budget` from `config.yaml` *before* merge breaks any live leaf calling `akrogon run-check --sessions` on the old build (`Missing paid_budget` at `src/budget.ts:57`).
   - **Fix:** Accept-and-ignore `paid_budget: z.unknown().optional()` in `src/config.ts:31` (omitting it from `effectiveConfig` at `src/config.ts:535`) for this release, remove the stanza from `~/.akrogon/config.yaml` after deploy, and drop the ignored key in a follow-up (same two-step pattern used for `run_root` in `c4cf74a7`).

2. **Item 1 misses `src/state-home.ts:17` (`copiedEntries` still lists `'budget.jsonl'`).**
   - Minor leftover, not a crash (`existsSync` guards the copy at `:73`), but state-home migration and its test should drop `'budget.jsonl'` alongside deleting `src/budget.ts`.
   - Also ensure `skills/watch-issues/consultant-brief.md:27` removes both the `paid_budget ceiling` clause and `spend past a recorded grant` (Item 5 names only the second).
