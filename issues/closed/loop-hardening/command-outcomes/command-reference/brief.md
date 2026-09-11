# Brief: command-reference

## What
The README command table lists `sync`, `park` and `unpark` with one-line descriptions matching `src/akrogon.ts`; a paragraph states that `issues/parked/` is committed, what sync commits and refuses, that `pull` reads the repo's GitHub origin while `remote` is where code integrates, and that a consumer project routes reports with a root `akrogon.yaml` `issues_repo`.

## Why
Three verbs and the intake routing are undocumented (#10).

## Done-criteria
1. Every verb in `src/akrogon.ts` appears in the README table with its argument shape, checked by a test in `tests/` that parses the table and the CLI dispatch list (or an existing docs test extended).
2. The sync paragraph matches the behaviour delivered by `scoped-branch-sync`.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
