# Plan: log-reader

Debate off (`debate: no`): synthesized directly from brief.md and design.md.

## Decisions

- D1: One resolver module `src/evidence.ts` owns recorded-path→bytes mapping, exporting `locate`, `readMember` and `readLog`, plus a `LogError` carrying a `kind` discriminant (`nomatch`, `ambiguous`, `archive`, `member`) and a message naming the path. `nomatch` is the only kind flaky maps to `(log gone)`; `ambiguous` is thrown only by the outside-repo scan. `archive` and `member` are errors everywhere, per design item 6.
- D2: `locate(recorded, cwd, repo)` resolves the input to `{ownerDirs: string[], member: string}` per repo. An absolute path first strips a known checkout root of that repo (registered root or a `git worktree list` line); else it is cut at the first `/issues/open/`, `/issues/closed/`, `/issues/parked/` or `/issues/chart/<chart>/direct/` boundary, keeping the whole member suffix so a member containing `issues/` is never truncated. For state paths the first part after the state folder is the owner; `ownerDirs` is `issues/{open,closed,parked}/<owner>` in that order. For chart paths the owner folder is the `issues/chart/<chart>/direct` prefix itself and `ownerDirs` holds that one path. Relative input resolves against `cwd` first, then the same boundary cut when the resolved path lands outside the checkout.
- D3: `readLog` reads the first plain file `ownerDir/member` that exists across `ownerDirs`, else the member inside `<ownerDir>/evidence.tar.zst` of the first `ownerDir` that exists (decompress with `Bun.zstdDecompressSync`, read with `new Bun.Archive(bytes)`, `archive.files()`). No owner folder existing → `nomatch`. Existing archive that fails to read → `archive` naming the archive path; member absent → `member` naming the archive and member.
- D4: `akrogon log <path>` is a new `log` case in `src/akrogon.ts` writing `process.stdout.write(bytes)` (no text decoding). Repo selection: `currentRepo(readGlobal(), cwd)`; `null` → try every registered repo and write the one match, `0` → `nomatch` naming the path, `>1` → `ambiguous` naming the matching repos. Thrown errors exit non-zero and name the path on stderr.
- D5: `src/flaky.ts` `failedTests` becomes async and calls `readLog(repo, recorded, repo.root)`: `LogError` kind `nomatch` → `['(log gone)']`, other kinds re-throw (exits non-zero, naming the archive/path). `flips`/`flakyLines` take `repo: Repo` and go async; `flakyCommand` passes its resolved repo. `(no test name)` and ordering logic unchanged.
- D6: Skill edits outside check-path-print's item-8 writer list: `skills/learn-issues/SKILL.md` (Sort step reads history evidence, including recorded logs, through `akrogon log <path>`) and `skills/merge-issue/SKILL.md` Shared-endings line about the receipt's per-command `log` (seat reads it with `akrogon log <path>`). Survey answer to the design's "Open for the plan": no further line in `skills/` tells a seat to open a recorded check/verify log — remaining log mentions are live session or lifecycle logs (watch-issues `log-tail`, `issues/log.jsonl`) or live command output, not recorded paths.
- D7: README gains one `akrogon log <path>` row in the Command table; `tests/command-reference.test.ts` gains `log: '<path>'` in `contracts` (the row/case/contract tri-check makes it red until the verb lands).
- D8: No credentials, env vars or live calls; `akrogon status log-reader` shows no `Missing:` lines and the design names none.
- D9: Brief/design agree everywhere; no conflict note needed. Open limitation preserved: a `git worktree list` miss falls back to the boundary cut (design), and 148 MB worst-case whole-owner in-memory read stays accepted.

## Read-first

- `src/evidence.ts` (new), `src/flaky.ts`, `src/akrogon.ts`, `src/config.ts` (`currentRepo`, `readGlobal`, `within`, `Repo`), `src/shell.ts` (`run`, `command`), `src/verify.ts` (`VerifyRun`)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`), `tests/flaky.test.ts`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`
- `README.md` Command table, `src/AREA.md`, `tests/AREA.md`, `skills/learn-issues/SKILL.md`, `skills/merge-issue/SKILL.md`
- `issues/chart/check-evidence/forks/evidence-location.md` (probe: Bun.Archive+zstd level 19 byte-exact, GNU tar readable)
- `learnings/LESSONS.md` (no active lesson hits this surface)

## Interfaces

```ts
// src/evidence.ts
export type LogErrorKind = 'nomatch' | 'ambiguous' | 'archive' | 'member';
export class LogError extends Error { readonly kind: LogErrorKind; constructor(kind, message, cause?) }
export function locate(recorded: string, cwd: string, repo: Repo): Promise<{ ownerDirs: string[]; member: string } | null>
export function readMember(ownerDir: string, member: string): Promise<Uint8Array>
export function readLog(repo: Repo, recorded: string, cwd: string): Promise<Uint8Array>
export function readLogAcross(global: GlobalConfig, recorded: string): Promise<Uint8Array>
// src/akrogon.ts: case 'log' → z.tuple([z.string()]) args; process.stdout.write(readLogAcross/readLog)
// src/flaky.ts: failedTests(repo, recorded) async; flips(repo, runs) async; flakyLines(repo, runs) async; flakyCommand unchanged signature
```

## Units and waves

- U1 (`src/evidence.ts`, new): resolver per D1-D3. Wave 1.
- U2 (`src/akrogon.ts`, `README.md`, `tests/command-reference.test.ts` contracts): `log` verb + docs row. Needs U1. Wave 2.
- U3 (`src/flaky.ts`, `tests/flaky.test.ts`): async resolver consumer + rewired tests. Needs U1. Wave 2.
- U4 (`skills/learn-issues/SKILL.md`, `skills/merge-issue/SKILL.md`, `src/AREA.md`, `tests/AREA.md`): prose reader lines + area docs. Needs U2/U3 landed only because `akrogon log` must exist for the lines to be true. Wave 3.

Docs: `README.md` (command row), `src/AREA.md` (evidence/log lines), `tests/AREA.md` (new test file line), `skills/learn-issues/SKILL.md`, `skills/merge-issue/SKILL.md` — one line each. No other doc affected.

## Done-criterion proof

Each proof is `bun test <file> -t "<case>"` executed through `akrogon run-check --name log-reader -- sh -c '<command>'` in the leaf worktree. Sizes: seconds. Rerun trigger: any change to `src/evidence.ts`, `src/flaky.ts`, `src/akrogon.ts`, `README.md`, the skills' log lines, or `tests/helpers.ts`.

- C1 (plain bytes, both path forms, nested `issues/` member): `tests/log-reader.test.ts` "log prints plain log bytes from any checkout path form". Fixture builds `issues/open/owner/check-1.log` with bytes 0,13,255; asserts byte-equal stdout for absolute registered-root path, worktree-root path, cwd-relative path, and `issues/open/owner/issues/chart/c/direct/nested/issues/check-x.log`. Fails today: `akrogon log` does not exist (usage error exit ≠0).
- C2 (archive member bytes for closed, parked, chart-direct): same file, "log reads the member of evidence.tar.zst for closed, parked and chart owners". Fixture writes `evidence.tar.zst` via `Bun.Archive`+`Bun.zstdCompressSync` level 19, deletes the plain files, asserts byte-equal stdout for an `issues/open/<owner>/...` path whose owner moved to closed, a `issues/parked/<owner>/...` path and `issues/chart/<chart>/direct/<member>`. Red today: verb missing.
- C3 (outside-repo resolution, ambiguity, no match, broken archive): same file, "log resolves against every registered repo outside one and names matches or the path". Second fixture repo registered; asserts single-match read, non-zero naming both repos on ambiguous path, non-zero naming the path on no match, non-zero naming the path on a corrupt `evidence.tar.zst`. Red today: verb missing.
- C4 (flaky names failed tests plain and packed; gone/broken contract): `tests/flaky.test.ts` "flaky lists failed test names from plain and packed red logs and fails on broken archives". Fixture leaf with red-then-green verify runs over `issues/open/<leaf>/check-test.log`; asserts names plain, identical names after deleting the file and packing, `(log gone)` when the whole owner folder is absent, and non-zero naming the archive when corrupt or lacking the member. Red today: `flakyLines(repo, runs)` signature does not exist and the closed-packed path cannot resolve.
- C5 (skill/doc rows): `tests/log-reader.test.ts` "docs and skills name akrogon log for recorded check and verify logs" asserts `akrogon log` appears in `README.md`, `skills/learn-issues/SKILL.md` and `skills/merge-issue/SKILL.md` (red today: none mention it). `tests/command-reference.test.ts` "README covers every dispatched command and its argument contract" then proves the README row ↔ verb ↔ contract tri-check once U2 lands (it stays green at planning because `contracts` alone is not checked against rows; that is why the README assertion lives in the new file).

## Tests to write (before product code)

- `tests/log-reader.test.ts` (new): the three cases above, plus a tiny `packEvidence(dir, members)` helper using `Bun.Archive` + `Bun.zstdCompressSync` — temporary test setup, not machinery.
- `tests/flaky.test.ts` (existing): adapt the listed case to `await flakyLines(repo, steps.map(run))` with a repo fixture and `issues/open/<leaf>` log path; add the C4 packed/gone/broken case. Test-Change trailer required (src/flaky.ts `flakyLines(repo, runs)` signature and async).
- `tests/command-reference.test.ts` (existing): add `log: '<path>'` to `contracts`. Test-Change trailer required (`akrogon log <path>` verb added).

## Red evidence (recorded after the test commit)

Test commit `399c0df` on `log-reader` (new `tests/log-reader.test.ts`; `Test-Change` trailers for `tests/flaky.test.ts` and `tests/command-reference.test.ts`). Each ran through `akrogon run-check --name log-reader` in the leaf worktree on `f3557d8`:

- C1 `bun test tests/log-reader.test.ts -t "log prints plain log bytes from any checkout path form"`: fail — first `akrogon log` case exits non-zero with the usage error (`tests/log-reader.test.ts:55`).
- C2 `bun test tests/log-reader.test.ts -t "log reads the member of evidence.tar.zst"`: fail — same usage error on the closed-owner path (`tests/log-reader.test.ts:84`).
- C3 `bun test tests/log-reader.test.ts -t "resolves against every registered repo outside"`: fail — usage error on the single-match path (`tests/log-reader.test.ts:115`).
- C4 `bun test tests/flaky.test.ts`: 2 fail — `TypeError: runs.filter is not a function` at `src/flaky.ts:22` because `flakyLines` still takes `(runs)` and never receives `repo` (`tests/flaky.test.ts:61`, plus the packed case).
- C5 `bun test tests/log-reader.test.ts -t "docs and skills name akrogon log"`: fail — `README.md` contains no `akrogon log` (`tests/log-reader.test.ts:137`).
- Companion: `bun test tests/command-reference.test.ts -t "README covers every dispatched command"` passed (expected: a `contracts` entry without a row or case is not checked); it turns red after U2 only if the row or case is missing.

Each criterion names its command above; the failing output is kept in `implementation/check-log-reader-*.log`.
