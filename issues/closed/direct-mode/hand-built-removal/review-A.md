# Review A: hand-built-removal

Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad. Reviewed head: 2da133d (2 commits ahead, `git status --porcelain` empty).

## Verification

- Diff read in full: `src/state.ts`, `src/turn.ts`, `src/next.ts`, four test files, two skill files, two guide pages. It matches plan D1-D5 and the change list. No `issues/` path on the branch.
- Criterion 1, deliberate break: re-adding `hand_built: z.boolean().optional()` to `stateSchema` makes `bun test tests/status.test.ts -t "removed hand_built"` fail (1 fail). Restoring head makes it pass (0 fail, 4 expects). The test drives the real `akrogon status` CLI against temp repos.
- Criterion 2: `grep -rIn "hand_built\|hand-built"` over the repo, excluding `issues/`, `.git` and `node_modules`, hits only the criterion-1 test and historical `learnings/history/` prose. No code path reads the field. Typecheck passes with the `Block` variant removed, so no consumer switched on it.
- Criterion 3: none of the four files mention `hand_built`. `docs/guide/state.md:46` names `akrogon park <issue>`, and its `next.md` link resolves.
- Criterion 4: the report's read-only grep over every `repos` root printed no files. A re-run in this review also printed nothing.
- Checks: I reused the report's evidence (typecheck rc=0, format rc=0, changed tests 426/0, full 533/0) because the code has not changed since.
- Test changes: each replaced fixture keeps its original purpose. Held siblings use `blocked-by` on an existing failed leaf. A missing slug would throw under `--all` (`src/next.ts:636`). Each changed test file carries a `Test-Change:` trailer citing criterion 1 or 2.
- Documented behavior: `docs/guide/state.md` and `docs/guide/problems.md` describe the changed behavior and are updated. No other guide page described hand_built.

## Findings

None at Fix level.

- Nit N1: design.md says the `tests/status.test.ts:99/:145` fixture "becomes" the unreadable case. The leaf adds a separate test and strips the field from that fixture instead (plan D4). Deferred because the outcome the design asks for is proven, and converting the shared fixture would void its other assertions. It would become a Fix only if the design meant to delete the other `broken` assertions, which it does not say.

## Verdict

ready
