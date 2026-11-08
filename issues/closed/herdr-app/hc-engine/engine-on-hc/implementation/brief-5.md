# Brief 5: U5 rollback guard and plugin removal (engine-on-hc, wave 1)

## 1. Goal

Plan decisions D22 and D23 (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-engine/engine-on-hc`, `plan.md`): `akrogon rollback` refuses to go back to a release that still ships `plugin/` (it runs on old herdr), and the repo's own `plugin/` folder is deleted.

## 2. Acceptance criteria

1. In `src/rollback.ts`, inside the existing `body()` (so it runs under the install lock `withLock` already takes), after the `record.previous` existence check and before `flip(previous)`: when `resolve(releasesDir(), previous, 'plugin')` exists, throw `Error('Cannot roll back: previous release runs on old herdr; fix forward')`. Nothing else changes (no hold written, `current` untouched).
2. `plugin/` (herdr-plugin.toml, next.sh, pull.sh) is deleted from the repo.
3. `docs/reference-index.md` drops the `[Integration](../plugin/)` line (the `tests/docs-links.test.ts` link check must stay green).
4. Planned tests: in `tests/rollback.test.ts` the case "rollback refuses a previous release that ships plugin/, before flip, and changes nothing" turns green and "an hc-to-hc rollback flips and holds with no herdr on PATH" stays green. The older rollback cases in that file deploy two releases that both ship `plugin/` and will now be refused; A moves those cases onto a plugin-less seed in a separate test commit — not yours.
5. The deployer's plugin conditional and its `herdr integration install` loop in `src/install.ts` stay unchanged.

## 3. Read first

- `src/rollback.ts`, `src/release.ts` (`releasesDir`), `docs/reference-index.md`, `tests/rollback.test.ts` (last two cases), `tests/docs-links.test.ts`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `src/rollback.ts`: one guard (criterion 1).
- Delete `plugin/`.
- `docs/reference-index.md`: remove one line.
- Owned paths: `src/rollback.ts`, `plugin/`, `docs/reference-index.md`. Must land first: nothing. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit any test file (tests are locked after planning; A ports the old rollback cases). A planned test you find wrong is a mismatch returned to A.
- Do not touch `src/install.ts` or `src/self-update.ts` (the sweep leaf removes the conditional later).
- Never stop processes by pattern.
Reasons: locked tests, the sweep owns the conditional, cross-leaf safety. Exception: a revised brief from A.

## 6. Ordered steps

1. Guard in `src/rollback.ts` (criterion 1).
2. `git rm -r plugin` (criterion 2); edit `docs/reference-index.md` (criterion 3).
3. Run the commands below.
Advisory size: 3 files, under 12 turns.

## 7. Commands

Install deps first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
- `akrogon run-check --name u5-rollback-new -- bun test --timeout=30000 tests/rollback.test.ts -t "plugin/|hc-to-hc"` (both green).
- `akrogon run-check --name u5-docs -- bun test --timeout=30000 tests/docs-links.test.ts`.
- `akrogon run-check --name u5-prettier -- bunx prettier --check src/rollback.ts`.

## 8. Done-when, evidence and report

Criteria 1-5 hold; one commit (message `rollback: refuse a previous release on old herdr; delete plugin/`, no co-author line); return the commit id. Keep output only via `akrogon run-check`, citing the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
