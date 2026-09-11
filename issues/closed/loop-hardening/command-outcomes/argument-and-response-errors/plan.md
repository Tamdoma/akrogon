# Plan: argument-and-response-errors

## Basis and read first

This is slot B direct synthesis. Authoritative state has `debate: no`, so positions and rebuttals are not required. The brief and locked design agree on behavior.

Read these paths before implementation:

- Authoritative leaf: `/home/ivan/Work/infra/akrogon/issues/open/loop-hardening/command-outcomes/argument-and-response-errors/{brief.md,design.md}`.
- `REFERENCE.md`, `learnings/LESSONS.md`, `docs/next.html`, `docs/problems.html`.
- `src/next.ts`: `nextCommand`, folder selection and dispatch error reporting.
- `src/shell.ts`: `CommandError`, `command`, `herdr`; `src/config.ts`: `commonDirectory`.
- `src/phase.ts`: `commitMove`; `src/log.ts`: `logMove`; `src/akrogon.ts`: CLI boundary.
- `tests/next.test.ts`, `tests/fake-herdr.ts`, `tests/phase.test.ts`, `tests/shell.test.ts`, `tests/helpers.ts`, `package.json`.

Live-code note for review: the design names a check before `requireRepo`, but `nextCommand` now calls `commonDirectory(selection)` instead. Place the same directory validation before that call, without reverting repository discovery. A real fixture invocation of `next file` reproduced exit 1 with ENOTDIR from spawning Git in the file path. `herdr` currently parses stdout without context, and `commitMove` saves state before calling `logMove` in its finally block.

## Decisions and interfaces

- **D1:** Validate an existing explicit target with `statSync(...).isDirectory()` at folder resolution, before using it as a subprocess cwd. Reject a file, including a symlink resolving to a file, with an argument error naming the supplied path and explaining that a leaf folder, slug or worktree path is expected. Retain absent-path slug lookup, directory selection, and hook behavior. No global filesystem-validation helper is needed.
- **D2:** Keep `herdr<T>(args: string[], schema: z.ZodType<T>): Promise<T>`. Guard only JSON parsing and envelope/result validation. Catch `SyntaxError` and `z.ZodError`, rethrow other errors unchanged, and report the complete argv, cwd, stdout and original parse/validation error. Use a narrowly scoped response error with the existing CommandError-shaped structured message and native `cause`, without changing the public command execution helpers. Keep subprocess execution outside the parse guard so nonzero command failures retain their existing meaning. Preserve the existing stdout normalization performed by `run`. Do not add retries for malformed successful responses or turn them into empty results.
- **D3:** Wrap only `logMove` inside the existing `commitMove` finally block. For an Error from logging, throw an error with its original cause and visible message stating that the move to the destination phase is committed and the log append failed. Rethrow non-Error throws unchanged. Keep save ordering, nonzero failure status, merge completion, and replay behavior. Do not label an ordinary completion failure as a logging failure when logging succeeds.
- **D4:** Verify through the real CLI and isolated filesystem/process fixtures. Extend the existing fake Herdr with one optional schema-validated stdout override for the pane-list response, sufficient for malformed JSON and invalid result payloads. Reuse current fixtures and avoid new dependencies or a general fake-response framework.

## Acceptance criteria

- **C1 (D1):** Relative and absolute existing file targets exit nonzero, name the target, explain the accepted target types, and contain no ENOTDIR. A symlink to a file is rejected the same way. Existing slug, leaf-directory and worktree targeting still work. Invalid targets cause no leaf mutation or Herdr dispatch.
- **C2 (D2):** A real `next` invocation whose fake Herdr exits zero with non-JSON stdout reports the executed command and raw payload plus the parser failure. Valid JSON with an invalid result schema similarly reports the payload and validation failure. The cause is retained on the thrown response error. Valid responses still dispatch, and nonzero Herdr exits remain command failures.
- **C3 (D3):** Extend the existing failed-log phase test to capture the result and assert nonzero exit, a committed move to `implement`, logging failure context and the original filesystem error. Persisted phase remains `implement`, and repeating the transition preserves the existing no-replay assertions. A diagnostic failure inside `logMove` also gets committed-phase context. Existing failed container rename recovery continues to pass.
- **C4 (D4):** Targeted tests and configured format, typecheck and full test commands pass. A retained verification transcript records end-to-end CLI test evidence and command exit status.

## Ordered implementation checklist

1. **A1 — `src/next.ts`, `tests/next.test.ts` (C1):** Add the local directory guard and CLI rejection cases. Use existing targeting coverage for successful paths, adding a missing positive case only if necessary.
2. **A2 — `src/shell.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, optionally `tests/shell.test.ts` (C2):** Add the response error and narrow parse guard, then malformed-JSON and schema-invalid CLI cases. Use a focused shell test for native cause retention if CLI evidence cannot inspect it. Keep command errors outside the wrapper.
3. **A3 — `src/phase.ts`, `tests/phase.test.ts` (C3):** Wrap log failures and extend the existing committed-state test. Exercise diagnostic collection failure using a real fixture failure, such as an invalid configured base ref, and assert that saved state still records the destination.
4. **A4 — verification evidence (C4):** Run the commands below, inspect the diff for unrelated formatting changes, and record outcomes and the artifact path in the implementation completion record. Remove temporary fixture resources through the existing cleanup pattern.

No other leaf must complete first. This order is for implementation clarity, not a cross-leaf dependency. README/command-reference changes, parked hints, hook ownership semantics, and unrelated dispatch recovery are excluded.

## Verification

Run in the worktree. The targeted suites invoke `src/akrogon.ts` through `cli()` with real temporary Git repositories and fake external executables, satisfying the non-browser end-to-end requirement without accessing authentication.

```bash
set -o pipefail
mkdir -p /tmp/argument-and-response-errors-evidence
bun test tests/next.test.ts tests/phase.test.ts tests/shell.test.ts 2>&1 | tee /tmp/argument-and-response-errors-evidence/cli-tests.log
bun run format
bun run typecheck
bun test
```

Retain `/tmp/argument-and-response-errors-evidence/cli-tests.log` and record its path and the targeted command's exit status. Assertions judge behavior and diagnostic content, not entire error wording or stack formatting. Required coverage includes both JSON and schema failures, file/symlink rejection, committed-state persistence, normal dispatch, and existing merge recovery.

## Open limitations

- **R1:** Logging can fail after state persistence, leaving a missing log record. This leaf makes that outcome clear but does not repair or replay the log.
- **R2:** The existing finally block can replace a simultaneous merge-completion error with a logging error. This leaf preserves that precedence and scopes the message to the committed state move and failed logging, without claiming that all merge side effects succeeded. Aggregating simultaneous failures would expand the locked scope.
