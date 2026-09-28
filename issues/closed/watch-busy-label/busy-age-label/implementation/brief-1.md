# Brief-1: label observer age as busy time (single unit)

## 1. Goal

Implement plan decisions D1–D4 for leaf `busy-age-label`: the watch-issues observer prints a seat's age as ` busy=<h>h<mm>m` after the status instead of `+<h>h<mm>m`. Value still comes from `busy_since`. No new state.

## 2. Numbered acceptance criteria

1. Seat with `busy_since` set prints ` busy=<h>h<mm>m` right after the status (example: `busy_since` 100 minutes ago with status working prints `A=<pane>/working busy=1h40m`); seat without `busy_since` appends nothing.
2. Unparsable `busy_since` prints no suffix; future `busy_since` prints ` busy=0h00m`.
3. `skills/watch-issues/SKILL.md` line 28 shows the `[ busy=HhMMm]` tokens for both seats.
4. One observer run against a fixture repo with one busy seat prints the new line; stdout is saved to a file under the OS temp dir and this report records that path.

## 3. Read-first list

- `<worktree>/skills/watch-issues/scripts/observe.ts` lines 200–235 (`ageSuffix`, `formatLeaf`)
- `<worktree>/skills/watch-issues/scripts/observe.test.ts` lines 100–135 (copy the busy-seat stub pattern for new cases)
- `<worktree>/skills/watch-issues/SKILL.md` lines 22–30 (Observe section, format line)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (follow it; smallest diff wins)
- `<worktree>/src/next.ts` observeBusy is read-only context for why `busy_since` spans working and blocked; open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

This unit owns all three files; no chunk must land first and no output is consumed. Paths are relative to the worker worktree:

- `skills/watch-issues/scripts/observe.ts`: `ageSuffix` return changes from `` `+${h}h${String(m).padStart(2, '0')}m` `` to `` ` busy=${h}h${String(m).padStart(2, '0')}m` `` (one leading space added, `+` replaced by ` busy=`). `formatLeaf` stays unchanged.
- `skills/watch-issues/scripts/observe.test.ts`: update the two `+0h00m` expectations to ` busy=0h00m`; add one test with `busy_since: "not-a-date"` expecting no suffix and one with a future ISO date expecting ` busy=0h00m`, both copied from the existing busy test pattern.
- `skills/watch-issues/SKILL.md` line 28: replace both `[+HhMMm]` tokens with `[ busy=HhMMm]`, nothing else on the line.

Needed interface: `ageSuffix(value: string | undefined, now: number): string` keeps its type; only the returned string changes. CLI contract `bun skills/watch-issues/scripts/observe.ts <root>` with `OBSERVE_AKROGON`/`OBSERVE_HERDR` stub overrides is unchanged. No shared test resource. No credentials.

## 5. Do-not, reasons and exceptions

- Do not change `src/next.ts`, `busy_since`, `busy_notified`, or any state handling. Reason: the locked design forbids new state; the label is the whole fix. Exception: none.
- Do not change scope or an interface instead of returning a mismatch with evidence to B. Reason: B owns the plan and revises the brief. Exception: a revised brief from B authorizing that change.
- Do not edit anything under `issues/`. Reason: issue artifacts live only in the registered checkout and break the phase guard. Exception: none.
- Do not run the full suite. Reason: B runs it after landing; the worker runs only section 7. Exception: none.
- Do not invent helpers or refactor surrounding code. Reason: smallest diff wins. Exception: none.

Reasons restated: locked design owns scope, B owns plan revisions, `issues/` edits break handoff, full suite belongs to B, smallest diff wins. Exceptions restated: only a revised brief from B authorizes a scope or interface change; all other exclusions have no exception.

## 6. Ordered steps

Advisory size: about 3 files and under 12 turns; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

1. Run `bun install` in the worker worktree (no `node_modules` there yet).
2. Read the section 3 files. No criterion; understanding first.
3. Update `observe.test.ts` expectations and add the unparsable and future tests (criteria 1, 2). Run section 7 command 2 and paste the red failure: old `+` output against new expectations.
4. Edit `ageSuffix` in `observe.ts` (criteria 1, 2). Rerun section 7 command 2 for green.
5. Edit `SKILL.md` line 28 (criterion 3). Grep for remaining `[+HhMMm]` or `+0h00m` copies.
6. End-to-end (criterion 4): build a temp fixture root with `issues/open/owner/e2e-leaf/state.yaml` (`busy_since` exactly 100 minutes ago, truncated to the minute, one working pane), stub `akrogon` printing `repo: testrepo`, stub `herdr` printing the agent list, then run `bun <worktree>/skills/watch-issues/scripts/observe.ts <root> | tee "$TMPDIR/observe-busy-$(date +%s).txt"` and confirm the line contains ` busy=1h40m`.
7. Run section 7 command 1 for the record, then `git diff --check`.
8. Commit only this chunk in the worker worktree (`git add` the three files, no `issues/` paths) and return the commit id with the section 8 report.

## 7. Commands

Run in the worker worktree. `AKROGON_BASE` is `ccea397163b8fda774916f2f6a4a60b10506f7d3`.

1. `: "${AKROGON_BASE:?AKROGON_BASE is required}" && AKROGON_BASE=ccea397163b8fda774916f2f6a4a60b10506f7d3 bun test --changed="$AKROGON_BASE"` (covers only `tests/`, expected to report no matching tests for this skills-only change; run for the record).
2. `bun test skills/watch-issues/scripts/observe.test.ts` (the meaningful targeted check; `bunfig.toml` sets `root = "tests"` so the default suite skips this file).

## 8. Done-when, evidence and report

Done when criteria 1–4 hold with pasted red then green output for command 2, the e2e artifact path, and one worker-worktree commit containing only the three files. Keep limitations and unverified criteria explicit; equivalent wording is accepted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
