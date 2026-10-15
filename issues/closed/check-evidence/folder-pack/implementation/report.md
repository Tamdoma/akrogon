# Implementation report: folder-pack

Serial-solo run (plan holds 2 waves × 1 unit; `implement: subagents` config → A implemented directly, no workers).

## Base and head

- Refresh: fetched origin, rebased `folder-pack` onto `origin/main` `fb60ccdceba56e8c0b28fd9c2d7eae74f2387307` (prior base `870fbe5`, prior test-commit head replayed cleanly to `37465ac`; no conflicts). `AKROGON_BASE: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307`.
- Committed head at proof time: `311f32b3e504cebaf5ccaa4a9ffe6c918ff8f515`; handoff head `d938256` (trailer-only commit adding `Test-Change: tests/AREA.md`, which `src/test-files.ts` matches as a test path).
- Commits: `37465ac` criterion tests (red), `74fe27a` product, `311f32b` test-expectation corrections, `d938256` trailer-only.

## Changed files and reasons

- `src/pack-command.ts` (new): `packCommand(repo, args, cwd)` — `realpathSync` entry check against `issues/closed/<owner>` / `issues/chart/<chart>` (single-chart `issues/chart` accepted); closed-owner tracked check (`git ls-files -z [--modified|--deleted|-s]`, missing logs accepted only by indexed blob-oid equality over archive member bytes, never decoded); `.closing` on the argument folder before `packFolder`, removed on success, kept and named on failure; per-folder `packed/tracked/untracked/deleted` output; non-zero exit naming every failed folder.
- `src/akrogon.ts`: `case 'pack'` dispatch + usage verb.
- `src/status.ts`: `lastStage` extracted from `chartRow` (shared by the scan); `chartFolders` extracted (order preserved); `unpackedLines` prints `Unpacked:` for closed owners and ended charts holding plain logs or `.closing` (`akrogon pack <folder>`) and open owners holding `.closing` (`akrogon next <slug>`, merged leaf first).
- `skills/chart-issues/SKILL.md`: `akrogon pack <chart>` step before `Closed`/`Held`/`Handed off` appends at :85, :114 (landing step 9), :121 (abandon).
- `README.md`: `akrogon pack <folder>...` command row. `docs/guide/files.md`: pack/status clause. `src/AREA.md`, `tests/AREA.md`: existing bullets extended.
- Tests: `tests/folder-pack.test.ts` (new, C1–C4), `tests/status.test.ts` (C5), `tests/docs-links.test.ts` (C6), `tests/command-reference.test.ts` (`pack` contract).

## Commands run with results

- `akrogon run-check --leaf <leaf> --name criterion-1 -- bun test tests/folder-pack.test.ts -t 'chart'` → `check criterion-1: 0 .../check-criterion-1-1792102832346-2554092.log` (16 expects, 0 fail) on `311f32b`.
- `--name criterion-2 -- ... -t 'closed owner'` → `check criterion-2: 0 .../check-criterion-2-1792102834349-2556166.log`.
- `--name criterion-3 -- ... -t 'a tracked log'` → `check criterion-3: 0 .../check-criterion-3-1792102834611-2556353.log`.
- `--name criterion-4 -- ... -t 'unaccepted'` → `check criterion-4: 0 .../check-criterion-4-1792102836279-2559487.log`.
- `--name criterion-5 -- bun test tests/status.test.ts -t 'unpacked'` → `check criterion-5: 0 .../check-criterion-5-1792102836524-2559664.log`.
- `--name criterion-6 -- bun test tests/docs-links.test.ts -t 'akrogon pack'` → `check criterion-6: 0 .../check-criterion-6-1792102836603-2559924.log`.
- `akrogon verify` → `verify leaf 311f32b3e504cebaf5ccaa4a9ffe6c918ff8f515: green`; `verify test: 0`, `verify typecheck: 0`, 897 pass / 0 fail across 54 files (~122 s suite). Wall time: ~4 minutes.

## Test-expectation corrections (commit `311f32b`, Test-Change trailers)

- `tests/status.test.ts`: `.closing` was written at `issues/open/` instead of the owner dir — real output listed no open-owner line; corrected to `issues/open/<owner>/.closing` and count to 5.
- `tests/docs-links.test.ts`: ordering check compared against any marker mention; the criterion requires pack before the append instruction — anchored to `append \`...\`` / `then \`...<date>\`` sites.

## Criterion coverage

- C1 chart pack + `.closing` lifecycle + merge: folder-pack.test.ts 'akrogon pack packs a chart direct folder…' (criterion-1).
- C2 closed-owner counts: 'reports packed, tracked, untracked and deleted counts' (criterion-2).
- C3 tracked modified/missing refusal incl. non-UTF-8 and newline logs: 'a tracked log modified on disk refuses…' (criterion-3).
- C4 refused forms + independent multi-folder exit: 'unaccepted folders are refused…' (criterion-4).
- C5 `Unpacked:` listing and clean-after: status.test.ts 'unpacked folders are listed…' (criterion-5).
- C6 SKILL.md pack-before-marker: docs-links.test.ts 'chart-issues skill runs akrogon pack…' (criterion-6).

## check.fix pass (2026-10-16)

Reviewed base `fb60ccd`, reviewed head `d938256`. Handed off on base `310c23c` (fetched, rebased; `skills/chart-issues/SKILL.md` conflict resolved keeping both main's `worktree unlock` steps and the leaf's pack steps, recorded via rebase rerere), head `88216a7`.

B repaired A-F1 itself (`dbe1a0f` reproduction + `f1a8da2` fix). A repaired the three Handed-to-A items:

- B-F1 (plan correction, `c5aaa4f`): D1's single-chart `issues/chart` acceptance contradicted the locked design — `locate` resolves only `issues/chart/<chart>/direct/*`, so `packFolder` verification can never pass for `issues/chart/direct/*` (B's concrete red log `check review-B-single-chart: 1`). Resolver is an excluded surface, so `classify` now accepts `issues/chart/<chart>` only and `unpackedLines` skips the single-chart root; status never advertises an unsatisfiable command. Plan.md D1 + Implementation notes record this.
- B-F2 (`494e590`, Test-Change): added the missing tracked log with an archive member holding wrong bytes — newline and non-UTF-8 variants — refusing the owner with no `.closing`. Deliberate break: dropping the oid comparison while keeping member-presence turns the new case red (`check fix-BF2-red: 1 .../check-fix-BF2-red-1792103609934-743446.log`); restored product green (`check fix-BF2-green: 0 .../check-fix-BF2-green-1792103612189-744722.log`).
- B-F3 (`88216a7`, Test-Change): C6 test now checks the literal `akrogon pack <chart>` contract (≥3 sites) and marker literals, dropping the append/then/paragraph prose gate.

Criterion proofs rerun on `88216a7` after the refresh and repair commits (all `check criterion-N: 0`): c1 …-3655942-773363, c2 …-3656100-773674, c3 …-3656388-773901, c4 …-3659633-775744, c5 …-3659858-775951, c6 …-3659936-776188.

`akrogon verify` on `88216a7589f22f7d5fcd4d7c167b59c687cee126`: green — format 0, test 0 (901 pass / 0 fail, ~108 s), typecheck 0; `verify test`/`typecheck` logs `check-test-1792103770912-776815.log`, `check-typecheck-1792103772872-776815.log`. Wall time ~4 min.

New known limitation: a repo using the single-chart layout (`issues/chart/CHART.md`) gets no `Unpacked:` line and `akrogon pack issues/chart` is refused — the shared resolver (log-reader leaf) cannot map `issues/chart/direct/*`, the same limit `akrogon log` already has there.

## Known limitations / unverified

- Migration run (sync → init ignores → pack listed folders → flaky diff → 9 slots-scrap deletions → sync) is the chart door's step on main after merge, per design item 7; not run here.
- `issues/parked/<owner>` `.closing` stays unlisted (no writer produces it); `issues/open/<owner>` `.closing` with no leaves lists nothing.
- `run` decodes `git ls-files` paths as UTF-8; non-UTF-8 log *paths* under `issues/` are not representable safely (log bytes are never decoded).
