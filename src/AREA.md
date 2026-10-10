# src area

## Commands

- `bun src/akrogon.ts close <owner/repo#n> --by <text>` closes one unowned GitHub issue.
- `bun src/akrogon.ts config` prints effective settings and the worktree base.
- `bun src/akrogon.ts run-check -- <argv>...` runs a command under the constructed check environment.
- `bun run typecheck` checks the TypeScript command and tests.
- `bun test tests/phase.test.ts` exercises lifecycle transitions and guards.

## Key files

- `src/akrogon.ts` validates CLI arguments and dispatches commands.
- `src/preflight.ts` verifies the configured base remote branch and local tracking ref.
- `src/config.ts` defines config schemas, resolves registered repositories and merges per-repo seat overrides (`seats`).
- `src/init.ts` initializes repositories and refuses a declared index that is not a readable non-empty file.
- `src/phase.ts` aggregates slot completion and enforces handoff guards.
- `src/shell.ts` wraps subprocesses, retries, YAML writes and Herdr responses.
- `src/readiness.ts` owns the readiness contract schema and gap computation.

## Non-obvious patterns

- Repository identity comes from registration and the shared Git directory.
- A phase move can be committed even when later log collection fails.
- Phase moves reject a dirty worktree and branch changes under `issues/`; a stop into `failed` skips both, a `cause: blocked` restart skips only the dirty check, and the empty-branch refusal applies only at review handoff.
- External command retries warn once, then preserve the last failure context.
- Foreign leaves are summarized once per repo and excluded from capacity and dispatch.
- Prompt delivery is one attempt per pass per seat; a timeout settles against the seat session file on the next pass.
- Init refuses a declared grounding index that is not a readable non-empty file without changing files.
- `akrogon config` composes a repo's `setup` key into every printed `checks`, `merge_checks` and `advisory` command as a `flock`ed `sh -c <setup> && sh -c <command>`.
- A main-red merge ends in a repo hold (`held.yaml`) that `mergeTurn` checks after fetch and inside the batch lock; the hold's `fix` field names one leaf that takes the merge turn solo while the hold stands.
- A leaf worktree's `.env` is a symlink to the registered checkout's file; dispatch refuses a real file, tracked path, foreign link or missing ignore rule.
- `buildStack` removes resurrected retired lesson lines as a fixup commit on the stack top, and `merged --check` refuses a pushed range still holding one.
- The `plan.synthesis` to `implement` move records each branch-changed path's blob id in state `frozen`; a later move refuses a recorded path changed or gone, or an added test-file-matched path outside the record, until the last commit touching it or a later one carries a `Test-Change` trailer naming it, and a path no commit touches needs a later trailer-only commit new since the record, not a replayed planning-era trailer.

## See also

- `docs/reference-index.md` links the other repository areas.
- `tests/helpers.ts` builds isolated registered repositories for command tests.
