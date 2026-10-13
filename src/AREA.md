# src area

## Commands

- `bun src/akrogon.ts close <owner/repo#n> --by <text>` closes one unowned GitHub issue; `bun src/akrogon.ts config` prints effective settings and the worktree base.
- `bun src/akrogon.ts run-check -- <argv>...` runs a command under the constructed check environment.
- `bun src/akrogon.ts base-run --base <sha> -- <argv>...` runs a command on a detached base checkout in the worktree store.
- `bun src/akrogon.ts guard <ancestors|own-modules>` refuses a checkout under foreign `node_modules`/`package.json` or a worktree missing its own `node_modules`; composed check commands run `own-modules` while `ancestors` runs at worktree creation through `checkLocation`.
- `bun run typecheck` checks the TypeScript command and tests; `bun test tests/phase.test.ts` exercises lifecycle transitions and guards.

## Key files

- `src/akrogon.ts` validates CLI arguments and dispatches commands.
- `src/preflight.ts` verifies the configured base remote branch and local tracking ref; `src/config.ts` defines config schemas, resolves registered repositories and merges per-repo seat overrides (`seats`).
- `src/init.ts` initializes repositories and refuses a declared index that is not a readable non-empty file; `src/readiness.ts` owns the readiness contract schema and gap computation.
- `src/phase.ts` and `src/shell.ts` aggregate slot completion and enforce handoff guards; shell wraps subprocesses, retries, YAML writes and Herdr responses.
- `src/timing.ts` defines the timing-event schema and appends to `issues/timings.jsonl`; `readTimings` and `visitOf` are exported for the timing readout.
- `src/timing-report.ts` implements `akrogon timing`: per-visit time decomposition from `timings.jsonl` and `log.jsonl`, plus the 20-leaf cohort gate from `merge-attempts.jsonl`.
- `src/base-run.ts` checks out a base sha detached, logs the run into the leaf and records it in `issues/base-runs.jsonl`; `src/compare.ts` and `src/red-record.ts` validate comparison records and fold `issues/red-records.jsonl` into active entries.
- `src/reconcile.ts` removes dead worktrees, scratch and run roots each pass and writes the kept report `status` prints under the ignored `reconcile/` state dir.

## Non-obvious patterns

- Repository identity comes from registration and the shared Git directory.
- A phase move can be committed even when later log collection fails.
- Phase moves reject a dirty worktree and branch changes under `issues/`; a stop into `failed` skips both, a `cause: blocked` restart skips only the dirty check, and the empty-branch refusal applies only at review handoff.
- External command retries warn once, then preserve the last failure context.
- Foreign leaves are summarized once per repo and excluded from capacity and dispatch; prompt delivery is one attempt per pass per seat, with a timeout settling against the seat session file on the next pass.
- Init refuses a declared grounding index that is not a readable non-empty file without changing files.
- `base-run` appends its record line before checkout, then rewrites `base-runs.jsonl` under the same lock with end, exit and removal time.
- `phase` validates `--compare` records inside `transition`; red entries fold from `issues/red-records.jsonl`, updates re-read inside the global lock.
- `akrogon config` composes a repo's `setup` key into every printed `checks`, `merge_checks` and `advisory` command as a `flock`ed `sh -c <setup> && sh -c <command>`.
- `merged --check --compare` records bind to the batch's attempt, HEAD and `built_on` through a base-run line newer than `prompted_at`; accepted files persist on `batch.comparisons`, a restack drops them and a `known-red` unit forces `rerun`, and a `green` record resolves only when the landed revision equals its `leaf_revision`.
- A leaf worktree's `.env` is a written file (mode 0600) holding only declared `env:` names copied from the registered checkout; dispatch rewrites it when no tab is live and refuses a tracked path or missing ignore rule.
- `buildStack` removes resurrected retired lesson lines as a fixup commit on the stack top, and `merged --check` refuses a pushed range still holding one.
- The `plan.synthesis` to `implement` move records each branch-changed path's blob id in state `frozen`; a later move refuses a recorded path changed or gone, or an added test-file-matched path outside the record, until the last commit touching it or a later one carries a `Test-Change` trailer naming it, and a path no commit touches needs a later trailer-only commit new since the record, not a replayed planning-era trailer.

## See also

- `docs/reference-index.md` links the other repository areas.
- `tests/helpers.ts` builds isolated registered repositories for command tests.
