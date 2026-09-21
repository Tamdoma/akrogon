# Brief 2: reference contract and door docs

## 1. Goal

Wire the `close` command reference and document the chart-door use. Plan D5, D6, D7. Covers acceptance A5, A6, and the A7 doc/format part. Runs after brief 1 lands `src/akrogon.ts` usage with `close`.

## 2. Numbered acceptance criteria

1. `tests/command-reference.test.ts` `contracts` contains `close: '<owner/repo#n> --by <text>'` and `bun test tests/command-reference.test.ts` passes against the live `src/akrogon.ts` dispatcher and README table.
2. `README.md` Command table contains exactly `` | `akrogon close <owner/repo#n> --by <text>` | <non-empty effect> | `` with args equal to the contract after space normalization.
3. `skills/chart-issues/SKILL.md` Open section, immediately after the dedup sentence containing `skip exact GitHub identities already in`, adds prose stating: at open the door names each skipped GitHub identity still open on GitHub, offers `akrogon close <owner/repo#n> --by <text>` for each, and runs it during the pass for any identity the chart records as delivered or duplicate, with `<text>` naming the delivering leaf and commit or the other identity.
4. `docs/guide/chart.md` gains one sentence saying the door closes such delivered-or-duplicate reports with `akrogon close <owner/repo#n> --by <text>`.
5. `src/AREA.md` Commands list gains one `close` line and the file keeps at most 40 lines with exactly Commands, Key files, Non-obvious patterns, See also as second-level sections.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/tests/command-reference.test.ts` (`contracts`, `argumentGroups`, `checkReference`).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/README.md` Command table rows.
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/src/akrogon.ts` usage string (must already list `close` from brief 1).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/skills/chart-issues/SKILL.md` Open section dedup sentence.
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/docs/guide/chart.md`, `src/AREA.md`.
- Pattern to copy: the existing `pull` row plus contract entry and how `argumentGroups` treats a required multi-token group with no `|`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `tests/command-reference.test.ts`: add `close: '<owner/repo#n> --by <text>'` to `contracts`. No other test change.
- `README.md`: add one Command-table row `` | `akrogon close <owner/repo#n> --by <text>` | Close one unowned GitHub issue with a delivered-by note. | `` (effect wording may vary but must be non-empty). No `|` in args so no `\|` escaping.
- `skills/chart-issues/SKILL.md`: after the `skip exact GitHub identities` sentence in Open, append one paragraph covering criterion 3 verbatim in meaning: name each skipped identity still open on GitHub, offer the verb per identity, run it for delivered-or-duplicate chart records with the delivering reference as `<text>`.
- `docs/guide/chart.md`: add one sentence in the intake/dedup area covering criterion 4.
- `src/AREA.md`: add `- \`bun src/akrogon.ts close <owner/repo#n> --by <text>\` closes one unowned GitHub issue.` to Commands; keep file at most 40 lines and the four required second-level sections.
- Input from brief 1: `src/akrogon.ts` already dispatches `close` and lists it in usage; if usage lacks `close`, return a mismatch instead of editing the dispatcher here.

## 5. Do-not, reasons and exceptions

- Do not edit `src/akrogon.ts`, `src/pull.ts`, `src/phase.ts`, or `tests/close.test.ts`. Reason: owned by brief 1; this unit is reference plus prose. Exception: revised brief from B.
- Do not add pull warnings, chart/intake parsing, seed deletion, `--leaf`, `--duplicate-of`, bulk/`--all`, config keys, or state fields. Reason: locked exclusions. Exception: revised brief from B.
- Do not touch the installed skill copy under `~/.claude/skills` or anything under `issues/`. Reason: install links it; issue artifacts live only in the registered checkout. Exception: revised brief from B.
- Do not run the full suite or `typecheck`/`format` as gates here. Reason: this worker owns only the changed-test command; B runs the full suite. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.
- Restated: the exclusions above hold because the plan splits code and prose ownership and locks the door behavior to prose; each lifts only on a revised brief from B.

## 6. Ordered steps

1. Update `tests/command-reference.test.ts` contracts with the `close` entry. Covers criterion 1.
2. Add the `README.md` Command row matching the contract. Covers criterion 2.
3. Run the changed-test command; `tests/command-reference.test.ts` must pass against the live dispatcher. Covers criteria 1-2.
4. Edit `skills/chart-issues/SKILL.md` Open prose at the locked insertion point. Covers criterion 3.
5. Edit `docs/guide/chart.md` with the one sentence and `src/AREA.md` Commands line within the 40-line limit. Covers criteria 4-5.
6. Rerun the changed-test command. Covers criteria 1-5.

Advisory size: about 5 files and under 20 turns (at least four turns per file for read, edit, test).

## 7. Commands

Run only this, with the supplied base (B runs the full suite separately):

```sh
AKROGON_BASE=20926c68f7664015b23ea0224147f69059d5b881 bun test --changed="20926c68f7664015b23ea0224147f69059d5b881"
```

If that command reports no tests in the changed set, also run `bun test tests/command-reference.test.ts tests/docs-links.test.ts` once as the targeted check and paste both results.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold with pasted changed-test output. No end-to-end GitHub artifact applies; the contract test plus `docs-links` coverage is the evidence. Keep prose to the locked insertion points; report any pre-existing doc staleness found by grep as a limitation rather than widening scope.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
