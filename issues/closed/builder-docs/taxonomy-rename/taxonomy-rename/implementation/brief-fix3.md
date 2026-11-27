# Sub-brief fix3 — legacy `continue autopilot` with a bare or missing `on` entry resolves to Semi-autopilot (F5)

## 1. Goal

Repair review finding F5: the F1 repair made legacy `continue autopilot` resolve through the chart's earlier `on` entry but left records whose `on` entry carries no mode word unresolved. Restore defined continuation for those records while keeping explicitly recorded Full autopilot. Plan decisions involved: corrected D2 (plan.md `## Implementation notes`, 2026-11-27 entries including the F5 refinement).

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md:128` (the `Old record words:` line) resolves a legacy `continue autopilot` as:
   - `continue full autopilot` only when the chart's mode record holds an earlier `on` entry explicitly recording full autopilot (`on full autopilot` or `on autopilot signposts`);
   - `continue semi-autopilot` otherwise — including `on autopilot`, an earlier `on` entry with no mode word (the legacy shape `on; handed: …` or `on handed …`, which predates Full autopilot), and no earlier `on` entry at all.
2. The line stays exactly one line starting with `Old record words:` in SKILL.md (none anywhere else in the repo) and still names all six old record words: `manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`.
3. No other rule text changes meaning; no other file is edited.
4. Tracing these real records through your final text yields: Full autopilot for `issues/chart/test-temp-leftovers/CHART.md:35,37` and `issues/chart/direct-visible/CHART.md:30,35`; Semi-autopilot for `issues/chart/config-walls/CHART.md:30,32`, `issues/chart/orphan-pane/CHART.md:27,29`, `issues/chart/killed-run-fixture/CHART.md:33,35`, `issues/chart/pull-gh-path/CHART.md:32,34`, `issues/chart/merge-lanes/CHART.md:33` and `issues/chart/builder-docs/CHART.md:30`.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` lines 125–141
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- For trace evidence only (do not edit): the CHART.md files cited in criterion 4 under `/home/ivan/Work/infra/akrogon/issues/chart/`.

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/SKILL.md` only. No chunks must land first; no shared test resource; no consumed output. Worktree creation commit: `2ee085e72842d4c9e82e6c7d904c2ee0d5bfbc28` (HEAD at wave start, rebased onto origin/main `4aff0f68`).

Current text at SKILL.md:128 (one line):

```
Old record words: `manual` and `attended` read as `no autopilot`, `on autopilot` as `on semi-autopilot`, `continue attended` as `continue no autopilot`, and `autopilot signposts` as `full autopilot`. `continue autopilot` reads as the `continue` entry of the mode recorded in that chart's earlier `on` entry — `on full autopilot` or `on autopilot signposts` as `continue full autopilot`, `on autopilot` as `continue semi-autopilot` — falling back to `continue semi-autopilot` when no earlier `on` entry exists in that chart's mode record.
```

Reshape the second sentence so both resolution arms of criterion 1 are covered and a bare `on` entry is explicitly included in the semi-autopilot arm. Suggested shape (adjust wording as long as the criteria hold): "`continue autopilot` reads as `continue full autopilot` when the chart's mode record holds an earlier `on` entry recording full autopilot (`on full autopilot` or `on autopilot signposts`), and as `continue semi-autopilot` otherwise, including an earlier `on` entry with no mode word and no earlier `on` entry at all." Keep every other mapping and all six old words. Touch nothing else.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `skills/chart-issues/SKILL.md` — scope discipline; every other file is verified green. Exception: a mismatch returned to A.
- Do not add a second `Old record words:` line and do not drop any of the six old words from it — brief criterion 2 requires exactly one line mapping all six.
- Do not change any behavior rule's meaning beyond the F5 correction — this leaf's contract is no behavior change. Exception: the correction itself as specified.
- Do not write or edit any test — workers never write tests; a red planned test is a mismatch.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once.
- Run every command unattended: no command that waits on a human; no poll or sleep loop; run a slow command once in the foreground with the tool timeout above its expected run time, waiting on its exit inside your turn. Re-express a harness denial inside the same grant and identity (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim. Name no env file path on a command line; a needed undeclared value is a mismatch, not a formulation to work around. The reason: no human answers a seat's command, and you read only this brief. There is no exception.

## 6. Ordered steps

1. Read SKILL.md 125–141 and this brief.
2. Edit the second sentence of the compat line per section 4 (criteria 1–2).
3. Verify the line count and the six words with grep; write the trace conclusion for every sequence in criterion 4 in your report.
4. Run the targeted test commands in section 7.
5. Commit once with a message naming the F5 repair.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```
akrogon run-check --name fix3-docs-links -- bun test tests/docs-links.test.ts
akrogon run-check --name fix3-chart-shapes -- bun test tests/chart-shapes.test.ts
```

Both must exit 0. Run from your worktree root. If bun complains about missing modules, run `bun install` once first.

## 8. Done-when, evidence and report

Done when criteria 1–4 hold, both commands in section 7 pass, and one commit carries the edit. Keep command output only through `akrogon run-check` and cite its `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
