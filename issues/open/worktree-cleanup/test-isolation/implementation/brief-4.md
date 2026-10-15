# Sub-brief 4: explicit leaf-temp env in install.test.ts + config leafTemp guard

## 1. Goal

Two small env fixes. Plan decisions D3 (config.test.ts must not create the real `/var/tmp` path) and D5/D4 (install.test.ts's self-update fixture sets `AKROGON_LEAF_TEMP_ROOT` explicitly like self-update.test.ts does, instead of relying on the ambient preload). Unit 1's preload is on the leaf HEAD you branch from.

## 2. Numbered acceptance criteria

1. `tests/install.test.ts` `selfUpdateFixture`/`withHome` sets `process.env.AKROGON_LEAF_TEMP_ROOT` to a path under the fixture home (matching `tests/self-update.test.ts`'s pattern: `leafTempRoot({home, root: clone, ...})`), saved and restored in `clean`/`finally`.
2. `tests/config.test.ts` `leafTemp`-default test asserts the path string only — add `expect(existsSync(path)).toBe(false)` (or equivalent) so a future regression creating the real `/var/tmp/akr-<uid>` dir is caught; it must not call `ensureLeafTemp` on the unset-override path.
3. `bun test --timeout=30000 tests/install.test.ts` and `bun test --timeout=30000 tests/config.test.ts` are green.

## 3. Read-first list

- `tests/install.test.ts` `describe('self-update')` (~line 265 onward): `selfUpdateFixture`, `withHome`, `captured`.
- `tests/self-update.test.ts` `selfUpdateFixture` (~lines 60-85) — the pattern to copy for `AKROGON_LEAF_TEMP_ROOT`/`leafTempRoot`.
- `tests/config.test.ts` `leafTemp`/`ensureLeafTemp` tests (~lines 827-855).
- `tests/helpers.ts` `leafTempRoot(f)` signature.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `tests/install.test.ts`: in `selfUpdateFixture`, mirror `tests/self-update.test.ts`: import `leafTempRoot` (already imported? check — if not, add to the helpers import), compute `const scratchRoot = leafTempRoot({home, root: clone, clean: () => undefined})`, save `process.env.AKROGON_LEAF_TEMP_ROOT` and set it to `scratchRoot`, restore in `clean`.
- `tests/config.test.ts`: in the `leafTemp defaults to a per-user /var/tmp root...` test, after `const path = leafTemp(repo, 'long-slug')` add `expect(existsSync(path)).toBe(false)` and confirm `dirname(leafTemp(repo,'other'))` line stays; add `existsSync` to the fs import if absent. Do not add `ensureLeafTemp` calls to the unset-override path.
- Owned paths: `tests/install.test.ts`, `tests/config.test.ts`.
- Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do NOT touch `tests/isolation.ts`, `helpers.ts`, `run-permit`, `pause-next`, `run-units`, `self-update.test.ts` — disjoint ownership. No exception.
- Do NOT change `leafTemp`'s contract or the `/var/tmp/akr-<uid>` default value — it is the product contract the config test asserts. Exception: none.
- Do NOT add `ensureLeafTemp` or any mkdir on the default path — that is the leak this leaf removes. No exception.
- Reasons: the criterion is no write to the real root; install.test.ts's leak is a missing env var, config.test.ts's guard proves no dir is created.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit `tests/install.test.ts` per §4 (criterion 1).
3. Edit `tests/config.test.ts` per §4 (criterion 2).
4. Run `bun test --timeout=30000 tests/install.test.ts` and `bun test --timeout=30000 tests/config.test.ts` — all green (criterion 3).
5. Commit both files. Each changed existing test file needs a `Test-Change:` trailer — `Test-Change: tests/install.test.ts explicit AKROGON_LEAF_TEMP_ROOT in self-update fixture, no expectation changed` and `Test-Change: tests/config.test.ts added existsSync guard, no expectation changed`.

Advisory size: 2 files, under 10 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bun test --timeout=30000 tests/install.test.ts`
- `bun test --timeout=30000 tests/config.test.ts`

No other test command.

## 8. Done-when, evidence and report

Both test files green; commit ID returned; report the `AKROGON_LEAF_TEMP_ROOT` value shape you used (path under fixture home).

Report format:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
