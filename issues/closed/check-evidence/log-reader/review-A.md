# review-A: log-reader

Base: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`. Reviewed head: `584b869` (same tree as verified `8d0364b` plus an empty trailer commit).

## Evidence

- `akrogon verify` green on `8d0364b` (855 pass; receipt per `implementation/check-*.log`), plan proofs re-ran green on the rebased head (`implementation/check-log-reader-1792098581241-4127210.log`).
- Diff read in full: `src/evidence.ts`, `src/akrogon.ts`, `src/flaky.ts`, README, both skill lines, `src/AREA.md` (40 lines, all named paths verified to exist), `tests/AREA.md` (39 lines, same check), both test files.
- AREA path listing: `src/evidence.ts`, `src/akrogon.ts`, `src/flaky.ts`, `tests/log-reader.test.ts`, `README.md` all exist — `ok` each.
- Live probe: `bun src/akrogon.ts log /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/no-such-file.log` → exit 1, `error: unreadable archive: .../issues/open/check-evidence/evidence.tar.zst` (owner `check-evidence` exists; no plain file, no archive).
- Doc behavior: README row and AREA lines describe the implemented behavior accurately; no other documented behavior changed. `docs/guide/cheat.md` is a task cheat sheet, not a command table — no `log` row needed there.

## Findings

### Fix F1 — missing archive maps to `archive` instead of `nomatch`

- **Source:** a recorded `issues/open/<issue>/<leaf>/...` path whose owner folder exists but holds neither the plain file nor `evidence.tar.zst` — reachable today by `rm` of a leaf's check log between the receipt write and close, exactly the "log gone" window `akrogon flaky` exists to report.
- **Consequence today:** `readLog` treats `readFileSync` ENOENT on the archive as `LogError('archive', 'unreadable archive: ...')`. `akrogon log` claims an archive exists and is unreadable when none exists, and `akrogon flaky` crashes instead of printing `(log gone)` — the criterion-4 contract names precisely this state: *"`(log gone)` only when neither a plain file nor an archive exists for the owner."* The same wrong error also feeds `akrogon log`'s "a path that matches nothing" case (criterion 3 names the path, not an archive).
- **Defect location:** `src/evidence.ts` `readLog` — it calls `readMember` on the first existing `ownerDir` without checking `evidence.tar.zst` exists; a missing archive must be `nomatch`, only a present-but-broken or member-missing archive is `archive`/`member`.
- **Criterion/check hit:** brief done-criterion 4 (`(log gone)` contract) and criterion 3 (no-match error names the path).
- **Why the green C4 case missed it:** the `(log gone)` case uses an owner folder that does not exist at all; the owner-exists/no-archive sub-case was never exercised.

## Verdict

`fix` — one Fix (F1). Everything else matches plan D1–D9 and the design: byte-exact output, boundary-cut member semantics, open→closed→parked plain-file order, `ambiguous` repo naming, async flaky plumbing, README/skill/AREA coverage.
