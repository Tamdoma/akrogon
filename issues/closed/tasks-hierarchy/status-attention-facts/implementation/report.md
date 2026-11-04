# Report: status-attention-facts

Serial-solo run (one wave, one unit; plan U1). No workers, no sub-briefs.

## Commits

Base: `7f697eee` (origin/main). Head: `f96367e`.

- `673fcf03` Plan tests (planning pass): `tests/status-json.test.ts` strict schema gains required `attention`/`waits_on`, four criterion cases; `Test-Change` trailer.
- `8a663fa1` Calm-control correction: `quiet` blocked on `absent-dep` = `missing`, a real attention fact under brief criterion 1; re-blocked it on a live dep (`live-dep`) so it stays the non-red control. `Test-Change` trailer citing the brief line.
- `1565e9a` Product: `src/status.ts` `leafAttention` (failed, missing gaps, idle-seat prompt errors, parked/missing/unreadable deps, dead unrecorded command-owned land job), `waits_on` via `requiredSlots` minus done/busy, `red = attention.length > 0`, `landAlive` result shared between `land` field and the merge-job fact, `blockedBy` computed once, `leafRed`/`undelivered` removed; `docs/reference/commands.md` `--json` row names the two fields.
- `f96367e` Prettier on the two touched check-covered files; `Test-Change` trailer (reflow only, no expectation changed).

## Criterion proofs (head `f96367e`, all `bun test tests/status-json.test.ts -t <pattern>` under `akrogon run-check`)

- C1 parked/missing/unreadable deps: `check crit1: 0 .../check-crit1-1793749223559-2953227.log`
- C2 stopped land job: `check crit2: 0 .../check-crit2-1793749223873-2953453.log`
- C3 failed/missing/prompt facts and clean leaf: `check crit3: 0 .../check-crit3-1793749224174-2953749.log`
- C4 waits_on seats: `check crit4: 0 .../check-crit4-1793749224459-2953917.log`
- C5 envelope composition: pinned sums inside crit1 (`env.red` 2 = 1 red leaf + 1 unreadable dep) and crit2 (`env.red` 1), same logs.
- Whole status files (all 15 json tests + text view): `check statusfile: 0 .../check-statusfile-1793749111231-2634676.log` at `8a663fa1`; the later format commit reflowed assertions only and `verify` re-ran the whole suite at `f96367e`.

## Checks

- `akrogon verify` on `1565e9a`: red — format exit 1 (prettier drift in the two touched files), test blocked; log `check-format-1793749126413-2641772.log`. Fixed by `f96367e`.
- `akrogon verify` on `f96367e`: green — format 0, typecheck 0, test 0 (1303 tests, 75 files); receipt `verify leaf f96367e65953e5f34546f807eeb672a70c0be43a: green`. Wall time ~4 min over the two runs.

## Plan deviations and notes

- Proof commands ran exactly as planned; no proof-command correction.
- One existing expectation needed the cited correction above (`quiet`'s dep); covered by the wrong-expectation exception with `Test-Change` trailer.
- Refresh: branch already on `origin/main` `7f697eee`; rebase no-op, no move recorded.
- Known limitation (from plan): `unreadable` depends on `hasLeafFolder`; a dep folder without `state.yaml` reads `missing`, matching `blockedBy` behavior.
- No unverified criteria; no env/producer/grant operations involved.
