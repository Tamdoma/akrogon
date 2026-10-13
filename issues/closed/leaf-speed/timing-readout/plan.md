# Plan: timing-readout

New read-only `akrogon timing` command. `akrogon timing <slug>` decomposes each closed phase visit into exclusive time components; `akrogon timing --cohort --since <iso>` applies the fixed leaves-as-chunks gate over fixture records. No writing of events, no status changes, no automatic action on a gate result.

## Decisions

- **D1: Records are the only input.** The report reads `issues/timings.jsonl`, `issues/log.jsonl` and `issues/merge-attempts.jsonl` via `readTimings`, `readLog` and a new `merge-attempts` reader parsed with `attemptRecordSchema` from `src/attempts.ts`. No state.yaml, no worktree, no transcripts.
- **D2: Visit identity comes from `visit_start` events; closure comes from `log.jsonl`.** A `visit_start` for `(slug, phase, v)` opens visit `v`; the next `log.jsonl` record for that slug with `from === phase` after the start closes it. The initial visit for each phase is the one whose `visit_start` carries `visit: 0`. A visit with no closing move prints `<phase> #<v> open` and is exempt from incomplete checks.
- **D3: Exclusive decomposition by priority.** Within `[visit_start, close)` intervals are assigned in this fixed order, each layer taking only time not already claimed: (1) `repo_pause` on/off windows; (2) leaf `wait` windows by reason — each wait event sets the leaf's current reason until the next wait event, non-`none` reasons (`parked`, `prerequisite`, `merge_turn`) claim their time; (3) prompted = the span first `prompt` event with `outcome: delivered` to the visit close, minus time already claimed by waits (overlapping A and B prompts are one interval by construction); (4) `wait none` = the remainder. Components sum exactly to elapsed. `check_start`/`check_end` pairs starting inside a visit print as `    check <scope>:<name>[/<unit>] <dur>` lines nested under `prompted`, never added. Output shape (locked by the test): `<phase> #<v> <dur>` then `  wait <reason> <dur>` lines for nonzero non-none waits in the order repo_pause, parked, prerequisite, merge_turn, then `  prompted <dur>` with `    check <scope>:<name>[/<unit>] <dur>` sublines, then `  wait none <dur>` when nonzero, then `  incomplete <name>` lines. Durations print as `XhYmZs` omitting zero parts.
- **D4: Expected events on closed visits only.** A visit whose phase routes slots (`requiredSlots(phase, entry fix_rounds)`, so `merged`/`failed` expect nothing) expects one delivered `prompt` per routed slot — when none arrived prints `incomplete prompt`, when some arrived prints `incomplete prompt:<slot>` per missing slot. A `check.review` visit is B-only when its *entry* move (the `to === phase` log record at the visit index, `fix_rounds` is the post-move value) has `fix_rounds > 0`; a paired review (`fix_rounds === 0`) expects one `seat_done` — missing prints `incomplete seat_done`. A visit closed by a move `to: 'failed'` expects nothing. Every `check_start` in a closed visit expects a `check_end` before the close — missing prints `incomplete check_end <name>`.
- **D5: Cohort membership and order.** Candidates are slugs with a delivered `prompt` event in a `plan.*` phase at `ts > --since`, ordered by that prompt's ts. Each candidate leaves the candidate set only when its first `log.jsonl` move `from: 'implement'` (implement exit) carries a diff over 600 changed lines, where changed lines = insertions + deletions parsed from the `diff` shortstat text (empty diff = 0). The first 20 remaining candidates are the members; they print in join order.
- **D6: Member outcome and F.** From each member's own records: `failed` = last log move is `to: 'failed'` (a leaf retried past a failure is not failed); `merged` = a `to: 'merged'` move exists, its ts is the merged time; `stalled` = neither merged nor failed and the first plan prompt is 24h+ before command runtime. `F = merged_ts − plan_prompt_ts − implement prompted time` where implement prompted time sums every implement visit's prompted component (D3). Failed or stalled members count F above 45 min and print `<slug> over 45 (failed|stalled)`; merged members print `<slug> F <dur>`.
- **D7: Ejections are per named member.** One `merge-attempts.jsonl` record with `outcome` `ejected` or `red` counts one ejection for each member it names as `holder` or `members[]`. A `red` batch naming four members is four ejections; the gate's "at most 2" is therefore strict about multi-leaf failures. Verdict: `fail` when merged members can no longer reach 18, when F ≤ 45 can no longer reach 15, when the median can no longer be ≤ 35, or when ejections exceed 2 — evaluated as "can no longer" so a partial cohort still accumulating can fail only on an impossible condition; `pass` needs all four bounds met; otherwise `insufficient`, including while a member is unmerged, not failed and under 24 h.
- **D8: Member line carries wait totals and coverage gaps.** Format: `<slug> (F <dur>|over 45 \(<reason>\)) [wait <reason> <dur> ...] [gaps: <phase>#<v> <name> [, ...]]`. Waits are the member's whole-record wait totals by reason (repo_pause, parked, prerequisite, merge_turn); gaps reuse D4's named missing events for that slug.
- **D9: Gate thresholds are constants in one place** at the top of `src/timing-report.ts` with a comment naming the fork file `issues/chart/leaf-speed/forks/measure-and-revisit.md`: cohort size 20, implement-exit cap 600 lines, F pass median ≤ 35 min, ≥ 15 of 20 at F ≤ 45 min, ≤ 2 ejections, ≥ 18 merged, 24 h stall.
- **D10: Output and arg contract.** `akrogon timing <slug>` prints the per-visit report on stdout; `akrogon timing --cohort --since <iso>` prints the verdict word (`pass`|`fail`|`insufficient`) then one member line each. Exactly one of `<slug>` or `--cohort --since <iso>` is required; a slug plus cohort flags, cohort without `--since`, or neither refuses. README row: `akrogon timing [<slug>\|--cohort --since <iso>]`.
- **D11: Repo resolution.** The command resolves the repo with `requireRepo(readGlobal(), process.cwd())` like `status <slug>`; no `--all` or repo flag. `akrogon timing` never mutates records.

## Interfaces

- `src/timing.ts` (landed, read-only use): `readTimings(root)` → `TimingEvent[]`; event kinds `visit_start`, `prompt` (`outcome`, `session`), `seat_done`, `check_start`, `check_end` (`run`, `name`, `scope`, `unit?`, `exit`, `duration_ms`, `log`), `batch`, `wait` (`reason`, `blocking?`), `repo_pause`. `visitOf(log, slug, phase)` is available if needed.
- `src/log.ts`: `readLog(root)` → `LogRecord[]`; `record.from/to/ts/diff/fix_rounds`.
- `src/attempts.ts`: `attemptRecordSchema` for parsing `issues/merge-attempts.jsonl` (`outcome`, `holder`, `members`, `end`).
- `src/config.ts`: `readGlobal`, `requireRepo`.
- `src/routing.ts`: `routing[phase].slots` drives D4's prompt expectation.
- `src/akrogon.ts`: add `timing` to the options map (`cohort: boolean`, `since: string`) and a `case 'timing'` importing `./timing-report`.

## Units

Serial-solo: one unit in one wave. A implements this plan directly.

- **U1 — timing readout.** Owns `src/timing-report.ts` (new: merge-attempts reader, visit decomposition, expected-event check, cohort gate, printing), `src/akrogon.ts` (verb registration, option parsing, dispatch), `README.md` (command row), `docs/guide/files.md` (a `timing` section after the `timings.jsonl` section describing both modes), `tests/timing-report.test.ts` and `tests/command-reference.test.ts` (already committed at `ead2803`). Shared test resource: none beyond the standard fixture. Dependencies: none.
- Docs affected: `README.md` command table row; `docs/guide/files.md` new section. One line each; no other guide names the command surface.

## Verification

Done-criterion → proof (`bun test tests/timing-report.test.ts`, seconds; rerun on any change to `src/timing-report.ts`, `src/akrogon.ts` or the records' schemas):

1. Visit decomposition, exclusive components, check-within-prompt, overlapping prompts counted once, initial visit from `visit_start` → test `slug report: each closed visit decomposes...` asserts exact stdout. Currently red: `akrogon timing` is an unknown verb (usage error, exit 1).
2. Expected events: missing prompt named, paired-review missing `seat_done` named, B-only re-check (`fix_rounds > 0`) exempt from `seat_done`, failed-destination visit exempt, open visit exempt including its running check, unended `check_start` in a closed visit named → test `slug report: missing expected events...`. Currently red: same unknown-verb failure.
3. Cohort verdicts and membership: `pass` with exact member lines over a fixture covering since-filtering, 600-line implement-exit removal, member 21 exclusion, failed-in-planning and stalled members, wait totals and a `seat_done` gap; `fail` with 17 of 20 merged; `insufficient` with a sub-24 h unmerged member → three `cohort gate:` tests. Currently red: same unknown-verb failure.
4. Command surface consistency → `bun test tests/command-reference.test.ts` (`timing` contract already added at `ead2803`; red until the verb and README row land).

Existing `checks` (`format`, `test`, `typecheck`) must pass at implementation end; no merge-time additions beyond the brief.

## Limitations kept

- Ejection counting (D7) is a reading choice the brief leaves implicit: per named member, not per attempt.
- `insufficient` verdicts on partial cohorts use "can no longer be met" for `fail`; a verdict on a full resolved cohort is exact.
- Prompt-failed visits decompose as waiting with no prompted component; the failed delivery is visible only via `incomplete prompt` when a phase expects one.

## Test commit

`ead2803` on branch `timing-readout`: `tests/timing-report.test.ts` (new) and `tests/command-reference.test.ts` (contract row, `Test-Change` trailer). No product code yet.
