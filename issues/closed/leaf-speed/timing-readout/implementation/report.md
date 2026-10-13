# Implementation report: timing-readout

Serial-solo run (plan holds one unit). Base `e00f5dd`, head `8f332fc`.

## Changed files

- `src/timing-report.ts` (new): `akrogon timing` implementation. Reads `timings.jsonl`, `log.jsonl` and `merge-attempts.jsonl` only. Slug mode decomposes each closed `visit_start` visit into waits (repo_pause, parked, prerequisite, merge_turn — each layer claims before prompted), prompted span (first delivered prompt to close, net of waits), `wait none` remainder, paired check lines, and `incomplete` flags per plan D3–D4. Cohort mode applies the gate constants (top of file, fork path in comment) per plan D5–D9.
- `src/akrogon.ts`: `timing` verb options (`--cohort`, `--since`), dispatch case with usage guards, usage line.
- `README.md`: command row `akrogon timing [<slug>|--cohort --since <iso>]`.
- `docs/guide/files.md`: `akrogon timing` section after the `timings.jsonl` event list.
- `src/AREA.md`, `tests/AREA.md`: file index lines for the new module and test.
- `tests/timing-report.test.ts` (committed at `ead2803`, corrected at `4a4a7cb`, `b967f58`): five fixture tests covering all three done-criteria.
- `tests/command-reference.test.ts` (`ead2803`): `timing` contract row.

## Plan corrections made during implement

- D3 restated: waits claim before prompted; exclusive components sum to elapsed (first draft summed to more than elapsed).
- D4 restated: B-only re-check detection uses the visit's *entry* move `fix_rounds`, not the closing move — `fix_rounds` on a log record is the post-move value and `check.fix` increments on entry.
- `visitGaps` emits `prompt:<slot>` when only some routed slots have delivered prompts (test covers the all-missing `prompt` form).

## Verification

Done-criteria proofs (`bun test tests/timing-report.test.ts`, seconds, head `8f332fc`):

- Criterion 1 (visit decomposition, exclusive sum, check-within-prompt, overlapping prompts once, initial visit from `visit_start`): `slug report: each closed visit decomposes...` — pass.
- Criterion 2 (expected events: missing prompt/seat_done named; open visit, failed visit, B-only re-check and running check exempt; unended `check_start` in a closed visit named): `slug report: missing expected events...` — pass.
- Criterion 3 (cohort pass/fail/insufficient incl. failed-in-planning member, 24h stall, >600-line exit replacement, sub-24h unmerged member): three `cohort gate:` tests — pass.

Checks, all on head `8f332fc`:

- `bun test --changed=$AKROGON_BASE --timeout=30000`: 9 pass 0 fail (~0.1s).
- `bun test --timeout=30000` (full): 855 pass 0 fail (~81s).
- `bun run typecheck`: clean. `bun run format`: no remaining diffs.
- `akrogon guard own-modules`: pass.
- `bun test tests/command-reference.test.ts`: green (README row + contract present).

Live sanity (read-only): `bun src/akrogon.ts timing timing-readout` on real records prints `plan.synthesis #0 10m17s / prompted 10m13s / wait none 4s`, `implement #0 open`; `timing --cohort --since 2026-10-12` prints `insufficient` + `timing-readout pending`. The installed `akrogon` binary predates this branch, so the new verb runs via the worktree entry until merge.

## Known limitations

- Ejection counting is per named member (a `red` batch naming 4 members counts 4), per plan D7.
- `pending` members print as `pending`; only failed/stalled print `over 45 (...)`.
- A `repo_pause` spanning a visit boundary is charged per visit correctly, but a `repo_pause` with no `off` yet counts against the closed visit's end (correct) — open visits print only `open`.
