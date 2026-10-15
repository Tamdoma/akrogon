# src area

## Commands

- `bun src/akrogon.ts close <owner/repo#n> --by <text>` closes one unowned GitHub issue; `bun src/akrogon.ts config` prints effective settings and the worktree base.
- `bun src/akrogon.ts run-check -- <argv>...` runs a command under the constructed check environment, and `verify [--sha <rev>]` runs the caller's configured check set on a detached fresh checkout in the worktree store; both box each command in a systemd `akrogon-run-<id>` scope and print `run <id>` on admission, and `stop-run [<run-id>]` stops the caller's own runs; `run-check` and `verify` cut the session bus (`DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`).
- `bun src/akrogon.ts guard <ancestors|own-modules>` refuses a checkout under foreign `node_modules`/`package.json` or a worktree with a top-level `package.json` missing its own `node_modules`; composed check commands run `own-modules` while `ancestors` runs at worktree creation through `checkLocation`.
- `bun run typecheck` checks the TypeScript command and tests; `bun test tests/phase.test.ts` exercises lifecycle transitions and guards.
- `bun src/akrogon.ts log <path>` prints a recorded log's bytes from a plain file or the owner's `evidence.tar.zst`, resolving the path against the current or every registered repo.

## Key files

- `src/akrogon.ts` validates CLI arguments and dispatches commands.
- `src/preflight.ts` verifies the configured base remote branch and local tracking ref; `src/config.ts` defines config schemas, resolves registered repositories and merges per-repo seat overrides (`seats`).
- `src/init.ts` initializes repositories and refuses a declared index that is not a readable non-empty file; `src/readiness.ts` owns the readiness contract schema and gap computation.
- `src/phase.ts` and `src/shell.ts` aggregate slot completion and enforce handoff guards; shell wraps subprocesses, retries, YAML writes and Herdr responses.
- `src/timing.ts` defines the timing-event schema and appends to `issues/timings.jsonl` (`readTimings` and `visitOf` feed the readout); `src/timing-report.ts` implements `akrogon timing`: per-visit time decomposition from `timings.jsonl` and `log.jsonl`, plus the 20-leaf cohort gate from `merge-attempts.jsonl` and the `--flow` leaf-carried issue report from per-repository GitHub `state=all` listings.
- `src/verify.ts` checks a commit out detached, runs every command for the caller's scope, logs each into the leaf or holder and records one receipt in `issues/verify-runs.jsonl`; `requireGreenReceipt` is the one gate the `check.review` move, the `check.repair` move into `merge`, `merged --check` stamping and direct-guards call.
- `src/admission.ts` registers each run's record under `<globalHome>/runs/`, sweeps stale records and their run units, and admits at once — a matching `AKROGON_RUN` token of a live run is the nested case that creates nothing; the memory reading and spacing were dropped 2026-10-14.
- `src/scope.ts` names the per-leaf slice (`leafSlice`, used by `src/stop.ts`), pane scopes and `akrogon-run-<id>` run units, moves a pane shell into its scope with busctl `StartTransientUnit`, and checks it read-only through `AKROGON_PROC_ROOT` (default `/proc`) and `AKROGON_CGROUP_ROOT` (default `/sys/fs/cgroup`); `allocate` in `src/next.ts` closes a recorded pane outside its scope and boxes every pane before the seat starts. `src/stop-run.ts` stops the run units live records tie to the caller's scope. `src/stop.ts` keeps the host-local `stopped.yaml` record and runs `stop`/`start`; dispatch, the merge queue and status read it.
- `src/evidence.ts` maps a recorded log path to its bytes (`locate`, `readMember`, `readLog`, `readLogAcross`): plain file first, then the owner's `evidence.tar.zst`; `akrogon log` and `src/flaky.ts` read through it.
- `src/reconcile.ts` removes dead worktrees, scratch and run roots each pass, stops finished-leaf slices and unmatched empty `akrogon-l*` slices, clears failed `akrogon-run-*` units in the host step, and writes the kept reports `status` prints under the ignored `reconcile/` state dir and `reconcile-host.json`.

## Non-obvious patterns

- Repository identity comes from registration and the shared Git directory.
- A phase move can be committed even when later log collection fails.
- Phase moves reject a dirty worktree and branch changes under `issues/`; a stop into `failed` skips both, a `cause: blocked` restart skips only the dirty check, and the empty-branch refusal applies only at review handoff.
- External command retries warn once, then preserve the last failure context.
- Foreign leaves are summarized once per repo and excluded from capacity and dispatch; prompt delivery is one attempt per pass per seat, with a timeout settling against the seat session file on the next pass.
- `verify` appends its receipt before checkout, then rewrites `verify-runs.jsonl` under the same lock with its setup exit, each command's exit and log and its end before removing the checkout; `end` is set only after every command ran, and a receipt matches any commit with its tree under the exact current command set, so `verify` on such a commit prints `reuse receipt <run> tree=<tree>` and runs nothing.
- `akrogon config` composes a repo's `setup` key into every printed `checks`, `merge_checks` and `advisory` command as a `flock`ed `sh -c <setup> && sh -c <command>`.
- A leaf worktree's `.env` is a written file (mode 0600) holding only declared `env:` names copied from the registered checkout; dispatch rewrites it when no tab is live and refuses a tracked path or missing ignore rule.
- `buildStack` rebases the holder onto the remote base first, then each recorded `members` entry onto the tip — a member whose rebase conflicts is skipped and stays in `merge` — and removes resurrected retired lesson lines as a fixup commit on the stack top, which `merged --check` refuses a pushed range still holding.
- The `plan.synthesis` to `implement` move records each branch-changed path's blob id in state `frozen`; a later move refuses a recorded path changed or gone, or an added test-file-matched path outside the record, until the last commit touching it or a later one carries a `Test-Change` trailer naming it, and a path no commit touches needs a later trailer-only commit new since the record, not a replayed planning-era trailer.

## See also

- `docs/reference-index.md` links the other repository areas.
- `tests/helpers.ts` builds isolated registered repositories for command tests.
