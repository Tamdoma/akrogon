# Review A: slow-alarm-baseline

Base `4f5e3fd2` (merge-base with origin/main), reviewed head `2983cb0b`. Diff: `src/verify.ts`, `tests/slow-merge.test.ts`, `docs/reference/checks.md`, `src/AREA.md`. Read: brief.md, design.md, plan.md (incl. decisions D1-D8), implementation/report.md, worker reports.

## Verdict: fix

One Fix. Everything else verified clean.

## Fixes

### F1 — accepted-notice send/retry runs on every pass, not only checked runs

`src/verify.ts` ~678-703: the `findLastIndex(run => run.slow?.close === 'accepted')` scan and send sit outside the `decision !== undefined` block and run for every `runOnce` — merge-scope, leaf-scope and `compares` (base) runs.

Realistic source: `akrogon verify` in any leaf worktree (leaf scope) or `verify --known-red`'s base pass (compares) on the real repo, once a ledger holds an accepted close.

Consequences today:

- On a leaf-scope run `notices.folder` is null, so `noticeCovers('pending', null, id)` is false: a pending accepted notice (file still waiting for the handler) is overwritten to `'error'` on the closing row. `foldShown` then no longer folds it to `'shown'` when the file is consumed, and the next merge run resends under the same id — the send-state field is corrupted by runs that are not the alarm's checked runs, and the operator's notice fires again. Source trace: `akrogon verify` inside a leaf between the accepted send and the handler's read.
- On a `compares` (known-red base) run with a resolvable notice folder the scan retries an errored send or retro-sends for an `undefined` state — runs never counted or checked still mutate send state.
- On either scope an `undefined`/`error` state gets stamped `'error'` — harmless outcome, still an out-of-contract write.

Hits criterion 4's contract "retried by the next checked run" and the design's "the next checked run retries a failed send". Repair: gate the scan on `slowChecked(runs[index])` (the same boundary `decideSlow` uses), so only merge-scope non-compares completed runs send or retry.

## Verified (no findings)

- D1-D8 all present and matching plan: `Math.min` ratchet (D1), episode-median `recovered` with `episodeWindow` capped 20, `me` included, `length >= 5`, same flagged formula on the median (D2), `accepted` adds `firstRow`-anchored `>= 14d` (D3, `earlier.find` opener), `accepted_notice` on the closing row with in-place retry and `foldShown` fold on `merge-slow-accepted` id (D4/D5), `latest.close === 'accepted'` → rolling reset (D6), `recovered` first via `else if` (D7), additive optional schema key (D8).
- Criterion proofs: all 10 planned tests pass (`check slow-merge-file: 0`, 18/18 in file; C1/C2 `check-c1-carried`, C3 `check-c3-recovered`, C4 `check-c4-accepted`, C5 `check-c5-starts` — all kept logs under `implementation/`); leaf verify `df9f9cb2` green (format, typecheck, test 1273/0).
- Red-first evidence in plan.md: T1, T3a, T4a, T4b, T4c, T5b red on base; T2, T3b, T4d, T5a green on base shown red under recorded deliberate breaks; step-up break proven with the notice asserts temporarily neutralized — all logs kept.
- Test revisions: four existing cases aged/extended per criteria 3-4, `Test-Change:` trailers on `a75e77ba` and `248c6b16` citing the added cases and criteria — correct.
- Planned-test defect correction (ENOTDIR `noticeFiles` under `blockNotices`) recorded in report.md; the deletion is sound (`accepted_notice === 'error'` still proves the failed send).
- Docs: `docs/reference/checks.md` slow paragraph and `src/AREA.md` verify line state the full new rule plus the strict-key consequence; `src/AREA.md` is 39 lines with the required sections; every path its bullets name exists (checked all 26 bullets, zero missing). `docs/reference/files.md` and `tests/AREA.md` correctly untouched.
- No model-choice criteria in this leaf — all mechanical arithmetic; the `5m`/`8m` body assertions test literal computed values, not wording choice.
- `foldShown`'s `first!.run` reads: rows carrying `notice`/`accepted_notice` always carry `first` (stamped rows, no crash path).
- `sendAccepted` body computed once in `decideSlow` for the fresh close; the retry path recomputes via `acceptedBody` bounded to the closing row's index — consistent.
- Refresh: `origin/main` moved to `eb9f22ab` after the branch point (patch_id/patch_base feature). Its `src/verify.ts` changes do not touch `decideSlow`/`foldShown`/slow schema (checked `git diff 4f5e3fd2..origin/main`); textual overlap only at the `slow` schema region — a trivial merge-base rebase resolution at merge, no semantic conflict. Report's base `4f5e3fd2` is the real merge-base.
- Verify attempt `11ab79df` failure (release flip, `patch_id` schema) recorded `inconsistent` with the green retry — matches the retry rule; evidence in report.md.
- `noticeCovers`/`recordNotice`/`status.ts` unchanged; `Slow merge:` line still open-only; no `status.ts` reopen path (T4c asserts it).

## Nits

None recorded. (Deviation noted: post-`accepted` rows with `rolling === undefined` get `return undefined` rather than plan D6's documented carried fallback — unreachable without ledger truncation since an accepted close implies >= 20 eligible rows; no consequence today.)

## Operator actions

None.
