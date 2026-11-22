# Report: slow-alarm-baseline

Slot A implement, delegated run (one wave, U1 + U2). Base `4f5e3fd2` (origin/main), head `2983cb0b`.

## Changed files and reasons

- `src/verify.ts` — new alarm rule per plan D1–D8: `slow.accepted_notice` schema key; carried normal lowered to the rolling median (never up; rolling outright after an `accepted` close, bare rule with no stored row); `recovered` needs the episode's own last-20 eligible median under the pinned threshold at >= 5 rows; `accepted` adds the 14-day age check (keeps the old normal on the closing row); `foldShown` folds `accepted_notice`; the locked rewrite sends/retries `merge-slow-accepted` in place on the closing row (`episodeWindow`, `acceptedBody`, `sendAccepted`).
- `tests/slow-merge.test.ts` — the four revisions the new rule contradicts (commit `248c6b16` carries the `Test-Change:` trailer citing criteria 3 and 4); planned test defect corrected under the wrong-expectation exception: the `noticeFiles(core)` call inside `blockNotices` threw ENOTDIR, deleted since `accepted_notice === 'error'` already proves the failed send.
- `docs/reference/checks.md`, `src/AREA.md` — slow section/verify line state the new rule plus the strict-key parse consequence (commit `2983cb0b`).
- No change: `src/status.ts`, `docs/reference/files.md` (presence-level, per plan).

## Worker commits landed

- U1 `98e0a7d8` → cherry-picked `248c6b16` (src/verify.ts + test revisions). One mismatch resolved by brief revision + authorized expectation corrections; worker report at `implementation/worker-u1-report.md`.
- U2 `6aa7bb15` → cherry-picked `2983cb0b` (docs). Worker report at `implementation/worker-u2-report.md`.

## Commands and results

- Criterion proofs (rerun after landing, all green, kept logs under `implementation/`):
  - C1/C2: `check c1-carried: 0 .../check-c1-carried-1795295846085-1868428.log` (2 tests)
  - C3: `check c3-recovered: 0 .../check-c3-recovered-1795295848353-1869094.log` (3 tests)
  - C4: `check c4-accepted: 0 .../check-c4-accepted-1795295850966-1870678.log` (8 tests)
  - C5: `check c5-starts: 0 .../check-c5-starts-1795295852830-1873616.log` (2 tests)
  - Whole file: `check slow-merge-file: 0 .../check-slow-merge-file-1795295855551-1874678.log` (18 pass)
- `akrogon verify` on `2983cb0b`, scope leaf: run `df9f9cb2`, receipt green (`setup:0`, format/typecheck/test all `0`; test `1273 pass / 0 fail`, `check-test-1795296660694-2813112.log`). ~6.5 min wall.
  - First attempt (`11ab79df`) ran all checks green but exited 1: its pass launched under release `ef2b5c6e` while the installed `akrogon`/`toolRoot` resolved to `eb9f22ab`, and the old schema threw `unrecognized_keys: patch_base, patch_id` finalizing the receipt (journald evidence). Cause is a release flip mid-run outside this leaf's diff — `patch_*` keys come from main's newer code. Recorded `inconsistent`; the rerun under one release went green.
- Refresh: `git fetch origin` + rebase onto `origin/main` at pass start — already current, no move. No conflicts.

## Grant/env lines

None — `readiness.yaml` empty, no `Missing:` on `akrogon status`, all tests local fixtures, no paid or live launches.

## Known limitations / unverified criteria

- C6 (docs state the rule) has no command proof by design; the reviewing seat reads `docs/reference/checks.md` and `src/AREA.md` against Taken 2.
- `merge_checks` untouched (none configured); merge turn runs `akrogon verify --attempt`.
- Old ledgers: a ledger holding `accepted_notice` does not parse under an older akrogon — documented consequence, mirrors `failures`.

## Lessons

None new.

## 2026-11-21 check.fix

Head `62acec49` after rebase onto origin/main `852ddb91` (two conflicts resolved: `src/AREA.md` verify line spliced main's `patch_*`/cover text with the slow clause; `src/verify.ts` merged `inheritedPatchId` with the F2 decision-order reorder; typecheck + 20-file run green post-rebase).

Slot A's Fix round: B's review handed F3 (criterion 3 lacked proofs for the two recovery limits).

- **F3** `62acec49` — two new cases in `tests/slow-merge.test.ts`:
  - `an episode with under five eligible runs does not recover`: episode of 4 in-episode eligible rows (opener + 2 stamped + me) with an under-threshold median stays open. Red when `episode.length >= 5` was neutralized (`check-c3-undersize-red: 1`, log `check-check-c3-undersize-red-1795297492043-360033.log`), green after restore (`check-c3-new-green: 0`).
  - `an episode median counts only its own last 20 eligible runs`: 21 early fast rows + 20 flagged-tail rows; last-20 median 950000 is flagged so the episode stays open while the all-episode median reads 300000. Red when `episodeWindow`'s `.slice(-20)` was removed (`check-c3-window-red2: 1`, log `check-check-c3-window-red2-1795297498643-366485.log`), green after restore.
  - Whole file green: `check-slow-file2: 0`, 22 pass (`check-check-slow-file2-1795297511557-386915.log`); post-rebase typecheck `check-check-typecheck-1795297432027-294906.log` 0.
  - Commit carries the `Test-Change:` trailer naming both new cases.
