# src area

## Commands

- `bun src/akrogon.ts config` prints effective settings and the worktree base.
- `bun run typecheck` checks the TypeScript command and tests.
- `bun test tests/phase.test.ts` exercises lifecycle transitions and guards.

## Key files

- `src/akrogon.ts` validates CLI arguments and dispatches commands.
- `src/config.ts` defines config schemas and resolves registered repositories.
- `src/phase.ts` aggregates slot completion and enforces handoff guards.
- `src/shell.ts` wraps subprocesses, retries, YAML writes and Herdr responses.

## Non-obvious patterns

- Repository identity comes from registration and the shared Git directory.
- A phase move can be committed even when later log collection fails.
- Every phase move rejects a dirty worktree and branch changes under `issues/`; the empty-branch refusal applies only at review handoff.
- External command retries warn once, then preserve the last failure context.
- Foreign leaves are summarized once per repo and excluded from capacity and dispatch.

## See also

- `docs/reference-index.md` links the other repository areas.
- `tests/helpers.ts` builds isolated registered repositories for command tests.
