# Brief: argument-and-response-errors

## What
`akrogon next <file>` fails with an argument error naming the path and saying a leaf folder, slug or worktree path is expected. `herdr()` reports non-JSON or schema-invalid stdout with the command, the raw output and the parse error instead of a bare `SyntaxError`. A failure inside `logMove` after a committed move reports that the move to `<phase>` is committed and only the log append failed.

## Why
Raw `ENOTDIR`, bare `SyntaxError` and a nonzero exit after `moved <phase>` hide what happened (#14).

## Done-criteria
1. `bun test tests/next.test.ts` passes with: `next path/to/file` exits nonzero with the argument message and no ENOTDIR; the fake herdr returning non-JSON stdout on exit 0 produces an error containing the command and the raw output.
2. `bun test tests/phase.test.ts` existing failed-log case is extended to assert the message says the move is committed.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
