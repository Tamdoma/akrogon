# Report: slow-merge-notice

Base `3e49c3d5` (AKROGON_BASE; refresh no-op, branch already at origin/main tip). Head `488ace4e`. Two delegated units in wave 1: U1 mechanism `b5126e38` (worker), U2 docs `736c5d78` (worker), both cherry-picked clean onto the lane.

## Changed files and reasons

- `src/verify.ts` — `slow` receipt field on `verifyRunSchema` (optional, strict: `ms`, `normal_ms`, `first{run,leaf}`, `close: recovered|accepted`, `notice`); `slowChecked`/`slowEligible`/`median`/`minutes` helpers; `decideSlow` run once inside `runOnce`'s locked final rewrite over earlier ledger rows; `sendMergeSlowNotice` sibling of `sendMainRedNotice`; shared `rewriteRun`/`noticeSend` extracted with main-red behavior unchanged (D1–D7).
- `src/status.ts` — `Scan.slow` (last ledger row holding `slow`), read inside `scanRepo`'s existing try; `Slow merge: <repo> first seen at <leaf> <run>, last <ms>m vs normal <normal>m` printed next to `unpackedLines` while the episode is open (D8).
- `tests/slow-merge.test.ts` — 6 planned tests (committed red at planning, three `Test-Change` corrections at implement, see below).
- `src/AREA.md`, `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `tests/AREA.md` — the contract lines the plan named.

## Tests run (all through `akrogon run-check`)

- Criterion proofs C1–C4: `bun test --timeout=30000 tests/slow-merge.test.ts` → `check slow-merge: 0 .../check-slow-merge-1793193934508-1431949.log`, 6 pass (on `488ace4e`'s content; rerun after format commit below identical suite).
- `format` → `check format: 0 .../check-format-1793193947625-1437802.log` on `488ace4e`.
- `typecheck` → `check typecheck: 0 .../check-typecheck-1793193951459-1437961.log` on `488ace4e`.
- `test` (full suite, 1234 tests) → `check test: 0 .../check-test-1793194019595-1438119.log` on `488ace4e`.
- `akrogon verify` on `488ace4e` → `verify leaf 488ace4e…: green` (format/test/typecheck receipts above are the ones it consumed/ran; its own fresh-run logs `check-test-1793194090966`, `check-typecheck-1793194093294`). Wall time ~80s (minutes-class proof).

## Test corrections during implement (each in its own commit with Test-Change trailer)

- `af39d6b2` — run A in T1 carries no `slow` at all (≥5-eligible gate proven directly); dropped needless backdates on unflagged runs.
- `140ae761` — status test used a second `fakeHerdr(f)` (EEXIST); known-red head sha lacked `check.sh` → head verified the pushed main tip instead.
- `626faeff` — holder moved inside `issues/chart/slow/direct`; at `f.home/chart/direct` `evidence.locate` returns `(log gone)` so known-red coverage could never pass (worker F2 confirmed).
- `488ace4e` — prettier formatting of the three touched files.

## Proof status per brief criterion

1. Flagged run: `verify slow:` line, `slow` receipt record, one `repo merge slow` notification, exit/receipt unchanged — T1 pass.
2. Eligibility bounds (reused/blocked/setup≠0/leaf/compares; ≥5 gate; partial checked; compares never `slow`) — T2 + T3 pass.
3. Episode: pinned normal vs rolling, `first seen at` citation, one notice per episode, failed/pending retry, `recovered` and `accepted` closes — T3, T4, T6 pass.
4. `Slow merge:` status line while open only, per-repo — T7 pass.

## Known limitations

- `median` rounds the even-count midpoint average so `normal_ms` stays an integer.
- Notification body wording (`merge verify Nm vs Nm normal; first seen at …`) is plan-chosen, not brief-pinned.
- A `recovered` close prints no `verify slow:` line (design enumerates flagged and accepted only); the status line disappearing is the recovery signal.
- No credential use; herdr delivery proven only through the recorded fake seam (readiness proof, herdr 0.9.1).

## Unverified criteria

None.
