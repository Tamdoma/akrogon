# Report: close-pack

## Changed files and reasons

- `src/pack.ts` (new): `packFolder(repo, folder, cwd?)` — glob `**/*.log` with `dot: true, onlyFiles: false`, symlink refusal naming the link, archive merge with byte-conflict refusal, temp-write + read-back + rename, per-member `locate`/`readMember` verification, then plain deletes (worker u1, D1).
- `src/phase.ts`: `completeOwner` writes `<owner>/.closing`, packs, renames to `issues/closed/`, removes the marker (u1, D2).
- `src/run-check.ts`: `PublishRefusedError` + `ownerRefusal` via `evidence.locate`; early refusal before the run root, late refusal before publish keeping `out.log` via `refusal.json` and a `refused` flag (u2, D3). A aligned the refusal to owner scope after the worker's leaf-scoped deviation.
- `src/reconcile.ts`: run roots holding `refusal.json` are kept as `publish refused: <reason>` (u2, D4).
- `src/sync.ts`: `eligibleRecord` excludes `.closing` and `*.tar.zst.tmp` (u3, D5).
- `src/init.ts`: three log ignore lines in `additions` (u3, D6).
- `tests/close-pack.test.ts` (new): the eight criterion proofs, committed red in `bb1fcde` then corrected in `5b5f1ce`/`035c34f`.
- `tests/init.test.ts`: `.gitignore` expectations gain the three lines (`bb1fcde`).
- `tests/leaf-slices.test.ts`: the admission race vehicle moved from a closed leaf to a merge-phase leaf under `issues/open`, because criterion 5 now refuses closed targets (`f2bd0e7`).
- `src/AREA.md`, `tests/AREA.md`, `docs/guide/files.md`, `docs/guide/merge.md`, `docs/guide/setup.md`: doc lines per plan (u3 + rebase resolution kept main's reconcile/scope lines).

## Worker returns

- u1 `015687c` (pack + completeOwner): landed; returned two test mismatches (notes.txt path, glob `onlyFiles` on symlinks) and one justified deviation (`onlyFiles: false` is required on Bun 1.4.3 to see symlinks).
- u2 `bc6c111` (refusal + reconcile keep): landed after owner-scoped alignment; returned two mismatches (owner collision in the race test, kept-report home) fixed in the test file.
- u3 `6ccdd84`, `720af28` (sync/init + docs): landed clean, all targeted tests green.

## Commands and results

- Criterion proof: `akrogon run-check --name close-pack-proof -- bun test tests/close-pack.test.ts` → `check close-pack-proof: 0` (8 pass) on `330f37f`; rerun after rebase+alignment in `post-rebase-suites` → `check post-rebase-suites: 0` (173 pass incl. run-check/reconcile/init/sync/docs-links/phase suites) on `035c34f`.
- Red run before fix: `check leaf-slices-retry: 1` — the closed-target vehicle collides with criterion 5; repaired via `Test-Change` commit `f2bd0e7`, rerun `check leaf-slices-fix: 0` (12 pass).
- `akrogon verify` on `5d6e4dc`: green — setup, format, test (879 pass across 53 files, 106.36 s), typecheck; receipt `run 2b1a2598-a052-4b8b-928f-d044057cba62`. `5d6e4dc` was amended to `b1d5464` (message-only: `Test-Change` trailer added); the tree is unchanged, so the tree-keyed receipt covers the handed-off head. An earlier verify on `f2bd0e7` was red on prettier drift only (`src/reconcile.ts`, `tests/close-pack.test.ts`), fixed by that commit.
- Refresh: `git fetch` + rebase onto `origin/main` moved the branch; prior base `fa0f4c2`, new base `38d7a95`, prior head `330f37f`, new head `035c34f`; one conflict in `src/AREA.md` resolved keeping both sides. A second commit (`f2bd0e7`) and the format fix (`5d6e4dc`) followed on the new base.

## Done-criteria → proof

All eight criteria proven by `tests/close-pack.test.ts` (command per plan, green on `035c34f` and inside the green verify run on `5d6e4dc`):

1. pack + member names + byte re-read + no-log no-archive — test 'completion packs every log…'.
2. retry union via `akrogon next` — 'a retried completion merges…'.
3. symlink refusal, owner open, logs unchanged — 'a symlinked log stops…'.
4. `.closing` present through failed pack, absent under `issues/closed` — 'the .closing marker rides…'.
5. early closed/closing refusals, late refusal keeping `out.log`/`refusal.json`, no recreated open folder, reconcile keeps run root, chart `--holder` accepted — 'run-check refuses…'.
6. byte-conflict member refusal with archive and plains unchanged — 'a member byte conflict…'.
7. sync skips `.closing` and `.tar.zst.tmp`, commits other records — 'sync commits neither…'.
8. init adds the three ignore lines once; sync stages no new plain log — 'init adds the log ignore lines…' plus `tests/init.test.ts` (21 pass).

## Known limitations

- A completion killed between archive rename and owner rename retries cleanly by union (criterion 2); a `.closing` stranded on a still-open owner refuses new run-checks until the retry clears it — intended guard.
- `packFolder` holds the whole owner in memory (design-accepted, ~148 MB ceiling today).
- `Bun.Archive` member order is normalized by sorting the union keys.

## Unverified criteria

None.
