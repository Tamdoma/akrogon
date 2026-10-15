# Review A: store-sweep

Base `fb60ccd`, reviewed head `0ab2552` (6 commits, `fb60ccd..0ab2552`). Diff read in full: `src/reconcile.ts` (528 lines changed), `src/config.ts`, `src/leftovers.ts`, `README.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/*` (4 files).

## Evidence

- `akrogon verify` on `0ab2552`: green — 901 tests, typecheck, format (`implementation/check-test-1792104739702-2857863.log`, `check-typecheck-1792104741739-2857863.log`).
- `akrogon log`-cited criterion proof `check sweep-tests: 0 implementation/check-sweep-tests-1792104219284-1571990.log` — 92 pass, all planned cases green.
- `src/AREA.md` paths named by the edited bullet verified present from repo root (`src/reconcile.ts`, `src/leftovers.ts` named elsewhere in the file — all exist).
- `git worktree list` confirms no worker worktrees left; `git status` clean; only src/docs/tests files on the branch.

## Judgment vs plan and design

D1–D11 implemented as written. Registered-unknown worktrees now keep `unmanaged worktree` (removal-rule P1 honored — no force path reaches them). Orphan `batch-*.owner` keeps under `live === null` (D1.3's pane blanket) and live owners are recorded. `reconcileNeedsPanes` covers file candidates, repo-hash children and repo-side retired locks. Host sweep deletes retired root, unregistered `worktrees/<name>` without `.git`, temp-root strays, `runs/last-start`, dead-pid tmp files and the four retired locks behind held-open and pane checks. `clears` is written on new keeps and reports existence-prune path entries; `leftovers` host block lists path entries that still exist. Test-Change trailers: `189f1dc` (planned, cited), `aa2a072` (worker mismatch M1 — verified `src/next.ts:786` guard and the fixture env seam myself; expectation unchanged), `869e2a5` (run-permit guard vs design's retired-lock line — the design contradicts the blanket ban; exemption is scoped to `reconcile.ts` only, correct), `0ab2552` (format only).

## Nits

- N1 — host dead-pid `*.<pid>.tmp` files route through `dropPath`, which keeps them when the pane list is unavailable (`keep 'pane list unavailable'`). D5's dead-pid exemption says these need neither panes nor processes; the repo-side tmp path does drop them unconditionally. Consequence today: a stale tmp file survives one extra pass; promote to Fix if a done-criterion ever needs host tmp deletion under an unavailable pane list. Deferred: trivial, self-heals next pass.
- N2 — `keep(path, 'unowned entry', ...)` lists in `akrogon leftovers` (reason not in `inUse`), while semantically identical auto-clear keeps like `active leaf` are hidden. Cosmetic inconsistency in the listing; no wrong deletion. Deferred: the keep is truthful and the report carries `clears`.
- N3 — an unorphaned `batch-<id>.owner` (copy present) falls to `dropUnowned`, so on an idle repo the owner record is deleted while its owner pid may still be live. The copy stays protected by pane/process vetoes and its terminal fate is unchanged once the owner exits, so consequence today is the record's early disappearance only. Deferred: no code path reads the record post-build.
- N4 — `src/AREA.md` still says the kept reports are what "`status` prints"; plain status dropped kept lines upstream (`fb60ccd`) and this leaf edited the same bullet without correcting the claim. Cosmetic; deferred as doc drift predating this diff's change.
- N5 — `retiredLeafTempRoot()` throws inside `reconcileHost` (outside `reconcileRepos`' per-repo try) on an invalid `AKROGON_RETIRED_TEMP_ROOT`, so a bad env aborts the whole pass rather than being reported per repo. Same failure shape as `leafTempRoot` in `reconcileNeedsPanes`; deferred as pre-existing config-error behavior, not new.
- N6 — `reconcileNeedsPanes` spawns `git rev-parse --git-path` per repo per pass to locate the base-runs lock; cheap, matches surrounding `command` usage.

## Operator actions

None.

## Verdict

`nits` — all criteria proofs green on the reviewed head; the findings are deferred-level, none with a concrete wrong behavior today.
