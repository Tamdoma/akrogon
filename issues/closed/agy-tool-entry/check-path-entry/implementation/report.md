# Report: check-path-entry

Base 562611bd (origin/main, unchanged at refresh). Head 42e487ea.

## Changed files
- tests/run-check.test.ts (661b285f): case "run-check drops the seat tool-entry folder from PATH and keeps the other entries in order". Caller PATH `<home>/tool-entry:/opt/one:<home>/tool-entry/:<real PATH>`; expects `<unitbin>:/opt/one:<real PATH>`.
- src/tool-cgroup.ts (42e487ea): `isToolEntryDir(dir, home)` extracted from realBash's filter; realBash calls it.
- src/run-check.ts (42e487ea): constructedEnv filters PATH through `isToolEntryDir(dir, homePath())`; empty segments and order kept.

## Proofs
- C1: new case red on 661b285f before the fix (stdout kept `<home>/tool-entry` and `<home>/tool-entry/`); green on 42e487ea (`bun test tests/run-check.test.ts tests/tool-entry.test.ts tests/tool-entry-tracing.test.ts`: 43 pass, 0 fail).
- C2: one matcher; realBash and constructedEnv both call isToolEntryDir (git diff src/tool-cgroup.ts src/run-check.ts).
- C3: worktree entry, 42e487ea: `PATH="$HOME/.akrogon/tool-entry:$PATH" bun src/akrogon.ts run-check --name e2e-agy-path -- sh -c 'bun test tests/tool-entry.test.ts'` -> `check e2e-agy-path: 0` (implementation/check-e2e-agy-path-1795775008741-945080.log), 2 s. Installed release 562611bd, same PATH: `check e2e-base-release: 1` (implementation/check-e2e-base-release-1795775016291-946365.log).
- C4: `akrogon verify` on 42e487ea: `verify leaf 42e487ea78b2ce3f532b5982aafb8f405ba56c0d: green`, wall 129 s (implementation/check-test-1795775145786-947497.log).

## Limits
- Direct `bun test` from a seat shell with the entry dir or BASH_ENV is out of scope (seeded separately per fix-place).
- Agy-seated leaves go green only after this lands and the release is installed.

## check.fix 1 (review-B.md F1)

Prior reviewed base 562611bd, head 42e487ea. Handed-off base 562611bd (refresh moved nothing), head 5d425ea8.
- 82aaf90a: the C1 case also sets `pass_env: [PATH]` and expects the same filtered PATH. Red on 42e487ea (declared PATH kept `<home>/tool-entry`).
- 5d425ea8: constructedEnv filters PATH after merging `env`/`pass_env`. `bun test tests/run-check.test.ts tests/tool-entry.test.ts`: 42 pass, 0 fail.
- C3 on 5d425ea8: `check e2e-agy-path-fix: 0` (implementation/check-e2e-agy-path-fix-1795775353223-1641982.log).
- C4: `verify leaf 5d425ea8381036e9ae0fa87ef91d7da9d0254a06: green`, wall 126 s (implementation/check-test-1795775479149-1643730.log).
