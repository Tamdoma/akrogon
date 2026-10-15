# Plan: close-pack

`debate: no`, so this synthesis is written directly from the brief and the locked design. `blocked-by: log-reader` is merged: `src/evidence.ts` (`locate`, `readMember`, `readLog`) is present on this branch and supplies the resolver the pack verifies through.

## Decisions

- D1. New module `src/pack.ts` exports one function `packFolder(repo: Repo, folder: string, cwd?: string): Promise<void>`. `folder` is the member-name root (the owner folder for completeOwner, `<chart>/direct` for folder-pack). Steps in order: list every `*.log` under it with `new Bun.Glob('**/*.log').scanSync({ cwd: folder, dot: true })` (the listing covers symlinks and directories, verified on Bun 1.4.3: `onlyFiles` drops symlinks, so `lstat` each entry; symlinked entries are refused with an error naming the repo-relative link, directories are skipped); read any existing `evidence.tar.zst` with `Bun.Archive(Bun.zstdDecompressSync(...)).files()`; stop before any write when a member exists in both with different bytes, error naming the member; union members with plain files winning only absent names; nothing to pack and no existing archive writes nothing; build `new Bun.Archive(Record<member, Uint8Array>)`, `Bun.zstdCompressSync(bytes, { level: 19 })`, write `evidence.tar.zst.tmp`, read the temp back byte-equal, `renameSync` over `evidence.tar.zst`; then for each member resolve its recorded path `resolve(folder, member)` through `evidence.locate(path, cwd ?? repo.root, repo)`, require `target.member === member`, pick the first existing `ownerDirs` entry and `readMember` it, require byte equality, and only then `unlinkSync` the plain file. A member the resolver maps differently stops before deletes (existing-backlog item 3).
- D2. `completeOwner` in `src/phase.ts`, at the `complete` gate after the destination-exists check: `writeFileSync(<owner>/.closing, '')`, `await packFolder(repo, owner, leaf.path)`, `renameSync(owner, destination)`, then remove `issues/closed/<owner>/.closing`. A failure leaves `.closing` behind; the existing `MoveCommittedError` wrap makes it retryable through `akrogon next`.
- D3. `checkedRun` in `src/run-check.ts` resolves the target's owner through `evidence.locate(target, repo.root, repo)`: a null target or `ownerDirs.length === 1` (a chart direct holder) is never refused; `ownerDirs` order is `[open, closed, parked]`. Early check before `mkdtempSync`: refuse when the closed dir exists or the open dir holds `.closing`. Late check inside the admission callback immediately before `mkdirSync(target)`: refuse when the open dir is missing, the closed dir exists, or the open dir holds `.closing`. On late refusal write `refusal.json` (`{ reason }`, naming the target and `runRoot/out.log`) into the run root, remove `.owner`, throw `new PublishRefusedError(...)` naming `out.log`, and skip `rmSync(runRoot)` via a `refused` flag in the `finally`. No `check_end` timing line is appended for a refused publish.
- D4. `src/reconcile.ts` run-folder sweep: a `refusal.json` beside a missing `.owner` is kept with reason `publish refused: <reason>` ahead of the existing `no .owner record` branch. `ownerCompletes` needs no change (confirmed: it predicts only whether the owner moves, and packing does not alter that).
- D5. `eligibleRecord` in `src/sync.ts` also excludes `basename(path) === '.closing'` and `basename(path).endsWith('.tar.zst.tmp')`, beside the `.lock` exclusion.
- D6. `additions` in `src/init.ts` gains `issues/open/**/*.log`, `issues/parked/**/*.log`, `issues/chart/*/direct/**/*.log`, appended after `.lock`, deduplicated by the existing filter.
- D7. All eight criteria are proven by `tests/close-pack.test.ts` (committed, red) plus updated `.gitignore` expectations in `tests/init.test.ts` (committed, red). No new proof machinery: fixtures, `cli`, `holding`, `fakeAkrogon`, `Bun.Archive`/`zstd` round-trips and `spawnCaptured` are all existing surfaces.
- D8. Held disagreement (B): run-check does not refuse a `<chart>/direct` holder while it packs. Kept per evidence-location Taken item 4; a change needs a new operator decision.

## Read-first

- `docs/reference-index.md` — area map.
- `src/AREA.md` — module summaries; add the `src/pack.ts` line here.
- `src/evidence.ts` — `locate` returns `{ ownerDirs, member }`; three dirs for open/closed/parked owners, one for chart direct.
- `src/phase.ts` `completeOwner` (~line 221) and `src/next.ts` `dispatchLeaf` merged branch (~line 772) — completion and its retry.
- `src/run-check.ts` `checkedRun`, `src/reconcile.ts` scratch sweep, `src/sync.ts` `eligibleRecord`, `src/init.ts` `additions`.
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `holding`, `fakeAkrogon`, `leafTempRoot`), `tests/close-pack.test.ts`, `tests/log-reader.test.ts` (`packEvidence`, `logBytes` precedents), `tests/run-check.test.ts`.
- `learnings/LESSONS.md` — relevant: refusal/reason/side-effect assertions over prose; verify the committed diff before reporting.

## Interfaces

- `packFolder(repo, folder, cwd?)` — D1; the only caller in this leaf is `completeOwner`; folder-pack reuses it for `akrogon pack` and closed-owner packing.
- `PublishRefusedError extends Error` in `src/run-check.ts`, carrying the refused target, owner and `out.log` path.
- No exports added to `evidence.ts`; the pack consumes `locate`/`readMember` as-is.

## Checklist

One wave, three units with disjoint owned paths and no shared resource:

- U1 (paths: `src/pack.ts`, `src/phase.ts`, `src/AREA.md`): D1 and D2.
- U2 (paths: `src/run-check.ts`, `src/reconcile.ts`): D3 and D4.
- U3 (paths: `src/sync.ts`, `src/init.ts`, `tests/AREA.md`, `docs/guide/files.md`, `docs/guide/merge.md`, `docs/guide/setup.md`): D5 and D6 plus the doc lines below.

Docs (one line each): `src/AREA.md` gains a `src/pack.ts` module line; `tests/AREA.md` gains a `tests/close-pack.test.ts` key-files line; `docs/guide/files.md` closed-store paragraph names `evidence.tar.zst` and the `akrogon log` read path; `docs/guide/merge.md` completion paragraph names the pack and `.closing` marker; `docs/guide/setup.md` names the run-check closed/closing refusal and the init ignore lines. README's `run-check` row and the skills need no change.

## Verification

Criterion → observation, all at `bun test tests/close-pack.test.ts -t '<name>'` through `akrogon run-check` (fixture: temp repo + `AKROGON_HOME`; size: seconds; rerun trigger: any diff in the owning src paths or the test file):

1. `completion packs every log into evidence.tar.zst...` — `akrogon phase <slug> merged` on a leaf with nested and dotfile `*.log`s; archive members are owner-relative, plain logs deleted, `akrogon log` re-reads bytes; a logless owner holds no archive. Catches member-naming, dotfile and delete-ordering bugs. RED: `expect(members).not.toBeNull()` — no archive written today. Log: `implementation/check-close-pack-1792099991103-3599742.log`.
2. `a retried completion merges the partial archive...` — pre-seeded archive + `.closing` + one plain log, retried via `akrogon next`; union archive, no plain logs, both readable. Catches overwrite-instead-of-merge. RED: `members` keys lack `b.log` — plain `b.log` survives unpacked.
3. `a symlinked log stops the completion...` — symlink inside `implementation/`; move exits non-zero naming the link, owner stays open, logs unchanged. RED: exit 0 — the link is packed/moved silently today.
4. `the .closing marker rides through the failed pack...` — refused pack leaves `<owner>/.closing`; after repair and `akrogon next`, `issues/closed/<owner>` holds no `.closing`. RED: `failed.code` is 0.
5. `run-check refuses closed and closing owners...` — early `--leaf` refusals on a closed owner and a `.closing` owner (marker not created, `implementation/` not created); late refusal after the leaf's own `phase merged` lands mid-run: non-zero, stderr names `run-*/out.log` holding `before-close`, `refusal.json` in the surviving run root, `issues/open` not recreated, reconcile keeps the run folder (checked a second `next`); `--holder issues/chart/...` accepted. RED: `refused.code` is 0 — the log lands inside `issues/closed/`.
6. `a member byte conflict...` — seeded archive member vs differing plain log; non-zero naming the member, archive bytes and both plain files untouched, no `.tmp`. RED: exit 0.
7. `sync commits neither a stranded .closing nor a pack temp file...` — `akrogon sync` with `.closing` + `evidence.tar.zst.tmp` + a real note under an open owner; `git ls-files` shows only the note. RED: `.closing` is staged and committed.
8. `init adds the log ignore lines once...` — two `akrogon init` runs; each line present once; new plain logs under open/parked/chart-direct are untracked after `sync`. RED: ignore lines absent (also drives the eight updated `init.test.ts` assertions, red on the missing lines).

`checks` (`format`, `test`, `typecheck`) run unchanged under `akrogon verify`; the brief names no `merge_checks`. Limitation kept: a completion killed between archive rename and owner rename retries cleanly by union (criterion 2); a `.closing` stranded on a still-open owner refuses new run-checks until the retry clears it — intended guard, not a bug.
