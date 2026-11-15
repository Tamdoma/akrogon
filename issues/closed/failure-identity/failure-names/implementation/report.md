# Report: failure-names

Serial-solo run (plan: every wave holds one unit). No workers, no grants, no env.

Base: `97e88038` · Head: `ec988c5c` (check.fix atop `7001a46a`: review F1 removed the seat-text test's prose-wording asserts — the name literals and the 120000 symlink check stay; F2 recorded a real red for criterion 5). Branch refreshed onto `origin/main` at 97e88038 (no movement) before the first unit and after the last commit.

## Changes

- `src/flaky.ts` (dd190d4f): `failedTests` now splits a pure `names(text)` from the log read. Names come only from lines Bun prints: `(fail)` titles, `(unnamed) <script>` for a `(fail) (unnamed)` on a script's stream (`(unnamed)` on none), and `(script) <script>` from `Exited with code <n>` lines with wrapper chains dropped by strict token-tuple prefix and streams that printed `(fail)` suppressed. `Signaled:` and free text never name; `(no test name)`/`(log gone)` unchanged. In the `nomatch` branch only, a recorded path resolving to an existing regular file under `repo.root` is read as a plain file (verify `--holder` logs outside the grammar).
- `tests/*.test.ts` (bbfb0213 at plan; 70cfb4ad correction): planned cases per plan D9 plus two corrections cited in the commit trailers — the notice test seeded its incident on the wrong direction (a `compares` run notices for its own log's names: seeded `test:x`, current main fails `test:y`), the fan-out test's shared-name counts corrected 1→2 (both fixture logs hold every name), a separate wrapped-log path, and a seeded ledger for the `akrogon flaky` CLI assertion.
- `skills/lifecycle-rules.md`, `skills/chart-issues/assets/direct-route.md`, `docs/reference/checks.md`, `docs/reference/files.md`, `src/AREA.md` (7001a46a): seat judgment branch keys on any non-title red name (`(script) ...`, `(unnamed)`, `(unnamed) ...`, `(no test name)`); only all-real-title heads take the named branch; in-run timeouts under a runner summary are the command's own verdict. Docs state the name set and sources; `files.md` prettier reflow reverted to a one-line change.

## Commands run (kept output)

- `check impl-flaky/2/3`: red during development (regex bug, test bugs); superseded by `proof-flaky`.
- `check impl-verify`: 1 fail — notice test seeded wrong direction, corrected in 70cfb4ad.
- `check impl-flaky4: 0`, `impl-verify2: 0`, `impl-docs: 0` — pre-commit greens.
- `check proof-flaky: 0` — `bun test --timeout=30000 tests/flaky.test.ts` on 7001a46a: 7 pass (criteria 1, 2, 3's Signaled/free-text ignore in the fan-out case, 6's flip half).
- `check proof-verify: 0` — `bun test --timeout=120000 tests/verify.test.ts` on 7001a46a: 60 pass (criteria 3 nameless cover, 4 script-vs-script known-red fail + same-script pass, 5 notice dedup, 6's holder known-red pair).
- `check proof-docs: 0` — `bun test --timeout=30000 tests/docs-links.test.ts` on 7001a46a: 12 pass (criteria 7, 8; symlinks asserted 120000 inside the new test).
- `akrogon verify` on committed head 7001a46a: `verify leaf 7001a46a...: green` — format, test (1170 pass), typecheck; receipt in `issues/verify-runs.jsonl`, log `implementation/check-test-1794435557372-4142886.log`.
- check.fix (review `ec988c5c`): `check fix-red-notice: 1` — deliberate break `(script) ${inner}` → `(script)` turned the corrected notice test red at the notice-count assertion (cover still passed, no new notice minted), proving criterion 5 needs script identity; reader restored. `check fix-green-notice: 0` — the same case green after restore. `check proof-docs2: 0` — `bun test --timeout=30000 tests/docs-links.test.ts` on ec988c5c: 12 pass after the prose asserts were dropped. `akrogon verify` on ec988c5c: `verify leaf ec988c5c...: green` (format, typecheck, test 1170 pass; log `implementation/check-test-1794435990528-624229.log`). Criteria 7/8 judged by text review: both seat texts hold the non-title branch, the name list and the runner-verdict clause.

Refresh record: no movement (branch tip already on 97e88038 base both times).

## Done-criteria → proof

1. Script name, wrapper drop, mixed streams, same name under another wrapper: `proof-flaky` green — new test `a failed script names its innermost token...` (plan-red: `plan-red-flaky1b`/`plan-cond-flaky`).
2. `(unnamed) <script>` / bare `(unnamed)` / pipe in title / no `(script)` for that stream or wrapper: `proof-flaky` green — `an unnamed failure takes its stream script...`.
3. Free text/`Signaled:` give no name: `proof-flaky` (`(script)` set in case 1 excludes `t:sig`) and existing nameless-cover cases inside `proof-verify`.
4. known-red `fail` for head script X vs base script Y, `pass` for same script, nameless cover unchanged: `proof-verify` green — `a head red in one script is not covered` (plan-red `plan-red-verify`).
5. New notice for script Y while X stays noticed; repeat not re-reported: `proof-verify` green — `a red main in one script reports new`; check.fix red `fix-red-notice` (deliberate `(script)`-identity loss → no second notice) and green `fix-green-notice`.
6. Outside-grammar regular file read; missing path `(log gone)`; known-red pair judged from both logs: `proof-flaky` (`...outside the issues grammar...`, plan-red `plan-red-flaky4`) and `proof-verify` (`...outside the issues grammar is read...`, plan-red `plan-red-verify3`).
7. Seat texts state the non-title branch, name list and verdict clause; four symlinks stay: `proof-docs` green.
8. checks.md/files.md/AREA.md state the name sources: `proof-docs` green plus paragraph review.

## Limitations

- Kept from design: the same real title failing in two scripts compares equal; two bare hook timeouts in one script share `(unnamed)`; a `Signaled:` death adds no name.
- Lines matching Bun's `Exited with code` shape in non-Bun output are named as scripts (accepted trust basis, per design).
- No unverified criteria; no known-red judgment needed (all reds had causes in the leaf's diff).
