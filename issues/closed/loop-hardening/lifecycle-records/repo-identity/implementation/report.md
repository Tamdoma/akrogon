# Implementation report

Commit: `cefbf1f` (Explain repository identity and worktree path mismatches).

Changed files and reasons: `src/state.ts`, `src/status.ts`, and `src/next.ts` share a specific repo mismatch error carrying the leaf path, stored key and registered key. Status retains healthy-repository output. Next reports recorded and expected worktree paths with move/reconcile-or-restore guidance. Three existing CLI test files cover rejected state mutations and dispatch, healthy siblings, root changes and a successful stable-key directory rename. README adds one configuration paragraph. No configuration/schema or lifecycle policy changed.

Tests run:
- Changed tests with exported `AKROGON_BASE=352fe91da011147a51561ddbfc295d7d29e00c54`: red exit 1, 67 pass / 5 fail on missing diagnostics, then green exit 0, 72 pass / 0 fail. Evidence: `changed-tests-red.log`, `changed-tests-green.log`.
- `bun test tests/next.test.ts tests/status.test.ts tests/phase.test.ts`: exit 0, 72 pass, 680 assertions. Actual isolated CLI/Git flow evidence: `identity-cli-tests.log`.
- `bun run format`: exit 0, only the intended next import needed formatting.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 146 pass, 1438 assertions. Evidence: `full-tests.log`.
- `git diff --check`: exit 0. After commit, `git status --short` was empty.

All evidence paths above are relative to this report in the authoritative leaf implementation directory. No lifecycle artifacts were added to the implementation branch.

Known limitations: changing roots with recorded worktrees requires manual reconciliation of filesystem location, Git metadata and state.worktree. No automatic relocation or key rename support is provided.

Unverified criteria: none. C1–C5 verified. No advisory checks configured.
