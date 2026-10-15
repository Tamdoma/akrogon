# Implementation report: log-reader

Base: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb` (origin/main after refresh; leaf rebased from `f3557d8` — prior base `f3557d8`, prior head `5c98dfc`, new base `0a80ab9`, new head `8d0364b`).
Head: `8d0364b39275703726e65b30898816b4530fc19d`.

## Changed files and reasons

- `src/evidence.ts` (new, D1–D3): `LogError` (`nomatch|ambiguous|archive|member`), `locate` (checkout-root strip via `git worktree list` + boundary cut at `issues/{open,closed,parked}` and `issues/chart/<chart>/direct`, full member suffix), `readMember` (zstd-19 `evidence.tar.zst` via `Bun.Archive`), `readLog` (plain file in open→closed→parked order, then first existing owner's archive), `readLogAcross` (every registered repo, `ambiguous` naming matches).
- `src/akrogon.ts` (D4): `case 'log'` — `readLog` inside a repo, `readLogAcross` outside; `process.stdout.write(bytes)`; verb added to usage line.
- `src/flaky.ts` (D5): `failedTests`/`flips`/`flakyLines` take `repo` and go async through `readLog`; `nomatch` → `(log gone)`; all other errors re-throw; `for..of` accumulator keeps red/green bookkeeping order.
- `README.md` (C5): `akrogon log <path>` row between `flaky` and `run-check`.
- `skills/learn-issues/SKILL.md`, `skills/merge-issue/SKILL.md` (D6): reader lines name `akrogon log <path>`.
- `src/AREA.md`, `tests/AREA.md`: module and test-file lines.
- `tests/log-reader.test.ts` (new): C1/C2/C3 + docs/skills cases.
- `tests/flaky.test.ts`: awaited `flakyLines(repo, runs)`, real `issues/<state>/<issue>/<leaf>` paths, packed/gone/broken case (C4).
- `tests/command-reference.test.ts`: `log: '<path>'` contract.

## Worker waves

- Wave 1, U1 (`src/evidence.ts`): worker commit `d50a162` → cherry-picked `597ad1c`. Returned a mismatch: planned test paths used `issues/<state>/<leaf>` while the real layout is `issues/<state>/<issue>/<leaf>` (evidence `implementation/u1-mismatch-evidence.md`). A judged the test expectation wrong (real `verify-runs.jsonl` shows `<issue>/<leaf>`) and corrected the planned tests in `b5dcb18`; resolver code stands as built.
- Wave 2, U2 (verb+README) `bf2543e` → `4b59d29`; U3 (flaky) `75e8863` → `dd52d0b`. U2 found `fakeAkrogon` non-idempotent (EEXIST on second shim call); A fixed in-test via per-fixture shim cache (`1ae47f5`, evidence `implementation/u2-evidence.log`).
- Wave 3, U4 (skill/AREA docs) `639c081` → `b4e9e49`.
- `8d0364b` prettier-formats the two worker-written source files.

## Commands run and results

- `akrogon run-check --name log-reader -- sh -c 'bun test tests/log-reader.test.ts tests/flaky.test.ts tests/command-reference.test.ts'` on `8d0364b`: 12 pass / 0 fail / 1311 expects — all five done-criteria green (`implementation/check-log-reader-1792098581241-4127210.log`).
- `akrogon verify` on `8d0364b`: format 0, test 855 pass / 0 fail, typecheck 0 → `verify leaf 8d0364b: green` (`implementation/check-format-*.log`, `check-test-*.log`, `check-typecheck-*.log`).

## Done-criterion proof

- C1: `log prints plain log bytes from any checkout path form` — green on `8d0364b` (bytes 0,13,255; absolute from root and worktree, relative, member containing `issues/`).
- C2: `log reads the member of evidence.tar.zst for closed, parked and chart owners` — green on `8d0364b`.
- C3: `log resolves against every registered repo outside one and names matches or the path` — green on `8d0364b` (single match, ambiguous naming both repos, nomatch naming path, corrupt archive naming owner).
- C4: `flaky lists failed test names from plain and packed red logs and fails on broken archives` — green on `8d0364b` (names identical plain/packed; `(log gone)` only when no owner folder; broken archive and missing member throw naming the archive).
- C5: `docs and skills name akrogon log for recorded check and verify logs` + `command-reference` suite — green on `8d0364b`.

## Known limitations / unverified criteria

- None unverified. Design-accepted limits stand: whole-owner archive held in memory on read (148 MB worst case today); a recorded path under no known checkout root and no `issues/` boundary is `nomatch`.
