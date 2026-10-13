# Review A — timing-readout

- Base reviewed: `e00f5dd` → head `418c094`
- Evidence: `bun test tests/timing-report.test.ts tests/command-reference.test.ts` → 9 pass; `bun test --timeout=30000` → 855 pass 0 fail; `tsc --noEmit` clean; `prettier --write` no remaining diff; `akrogon guard own-modules` pass; live sanity `bun src/akrogon.ts timing timing-readout` prints correct decomposition on real records; `--cohort` prints `insufficient`/`pending`.
- Doc check: changed behavior documented in `docs/guide/files.md` + README row; all paths named in `src/AREA.md`/`tests/AREA.md` exist (listed from repo root, all OK).

## Findings

### Fix F-A1 — parked/stalled members under-report waiting time

- **Source (realistic):** `akrogon park <issue>` (real operator action) writes only a `wait` timing event — no `log.jsonl` move (`src/park.ts:73`). A cohort member parked weeks ago with no move since has `moves.at(-1)` far in the past.
- **Consequence today:** in `memberOf` (`src/timing-report.ts`), `outcome = merged ?? (last === undefined ? now : ms(last.ts))` caps the wait window at the member's last *move* timestamp. For a parked/stalled member, parked waiting accrued after that last move is silently dropped — the member line prints `wait parked 12m` while the leaf has been parked for days. This is exactly the column the brief adds ("paused, parked and prerequisite waiting beside it") on exactly the members it matters for (unresolved ones).
- **Criterion hit:** brief §What, cohort member line — "paused, parked and prerequisite waiting beside it".
- **Repair:** unresolved members (merged === null, not failed) must use `now` as the wait-window end; only failed members should cap at the last move. One line: `const outcome = merged ?? (failed ? ms((last as Move).ts) : now);`

### Nits

- **N-A1:** `pauseOpenAt`/`reasonAt` rescan `timings` per segment — O(segments × events) per member. Ceiling ~20 members × small files, fine today; if `timings.jsonl` grows large, pre-sort events once. Deferred: no realistic input makes this slow today (files are per-repo, bounded by lifecycle volume).
- **N-A2:** Duplicate `visit: 0` numbering when a leaf is created at a phase and later re-enters it (writer emits `visit 0` twice — `next.ts` starts the counter at `max(0, visitOf-1)`). Display shows two `#0` lines for that phase; attribution still correct via ts-window checks. Writer-side issue, cosmetic here.
- **N-A3:** `slugReport` with no records prints an empty body (exit 0). Acceptable — the command is a readout, not a validator.

## Verdict

**fix** — one Fix (F-A1), repairable in one line by the repair seat.
