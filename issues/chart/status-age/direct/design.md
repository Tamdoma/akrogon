# Design: total-time-column

## Binding decisions, verbatim

### What the status time column measures (issues/chart/status-age/forks/age-meaning.md)
Operator 2026-10-17: `1a | 2a | 3a | 4a`

- Q1 1a: finished leaves (merged, failed) show first-prompt to the move into that phase, frozen. Running leaves show first-prompt to now. Reason: one meaning, total time spent. Foreclosed: 1b time-in-current-phase for running leaves. Busy seats keep their own NOTE clock.
- Q2 2a: the clock starts at the leaf's first `prompt` record with `outcome: delivered` in `issues/timings.jsonl`. A leaf with no such record shows `-`. Foreclosed: 2b first `visit_start`, which counts prerequisite wait.
- Q3 3a: printed as `<h>h<mm>m` (`0h29m`, `17h28m`), the same format as the busy note. Foreclosed: whole minutes.
- Q4 4a: header `TIME`. Foreclosed: `AGE`.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: no auth, secrets, outside calls, browser or live runs. Each done-criterion is proven at the CLI boundary by running `akrogon status` against a fixture repo with written `log.jsonl` and `timings.jsonl`, in `tests/status.test.ts`, the cheapest test that catches a wrong value. Existing AGE expectations in that file are false after this change and are replaced, not kept beside the new ones. Criterion 2 needs one deliberate break: make the finished-leaf end use now, and the frozen-value test turns red. No new machinery.

## Leaf architecture
- Owned: `src/status.ts` (`header`, `cells`, the `statusCommand` scan that feeds `cells`) and `tests/status.test.ts`.
- Inputs: `readTimings(root)` from `src/timing.ts` returns parsed `TimingEvent[]`, `prompt` events carry `slug`, `outcome` and `ts`. `readLog` already supplies `LogRecord[]` to `cells`. `readTimings` warns and returns `[]` on a read or parse failure. That behavior is existing and unchanged here, so such a repo shows `-`.
- Start: earliest `ts` among `prompt` events for the slug with `outcome: delivered`, in the leaf's own repo.
- End: for `merged` and `failed`, the existing `log.findLast` lookup of the last move whose `to` equals the current phase. Otherwise `now`.
- Format: the busy note in `note` already builds `${h}h${mm}m`. Use one shared function for both, do not copy the expression.
- `widths` reads columns by index (`natural[2]`). The header keeps its position, so this stays valid.
- Excluded: `--charts` table `AGE` column (chart file time, operator did not ask), `akrogon status <slug>` detail view, `akrogon timing`.
- Open for the plan: whether the scan reads timings once per repo in `scanRepo` (beside `log`) or in `rows`. Either works, one read per repo.
