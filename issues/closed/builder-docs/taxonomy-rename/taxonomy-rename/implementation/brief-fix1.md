# Sub-brief fix1 — legacy `continue autopilot` keeps the session's recorded mode (F1)

## 1. Goal

Repair review finding F1 so a legacy `continue autopilot` mode entry resumes the autopilot mode the session recorded, instead of always reading as Semi-autopilot. Plan decisions involved: corrected D2 (see plan.md `## Implementation notes` 2026-11-27 entries), D3, D4.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md` `## Autopilot` instructs that a legacy `continue autopilot` entry (written before the rename) resumes the autopilot mode recorded in that chart's earlier `on` mode entry — `on autopilot signposts` or `on full autopilot` → Full autopilot, `on autopilot` → Semi-autopilot — and falls back to `continue semi-autopilot` only when no earlier `on` entry exists in that chart's mode record.
2. The single `Old record words:` line (exactly one line starting with `Old record words:` in SKILL.md, none anywhere else) still mentions every old record word the brief lists: `manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`. The compat rule for `continue autopilot` may live inside that line or in one immediately following sentence.
3. No other rule text changes meaning; no other file is edited.
4. Tracing the real legacy records `on full autopilot …` then `continue autopilot (handover …)` through your final text yields Full autopilot for the continuation.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` lines 125–141 (`## Autopilot` and start of `## Handover`)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- For behavior evidence only (do not edit): `/home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/CHART.md` lines 35–37 and `/home/ivan/Work/infra/akrogon/issues/chart/direct-visible/CHART.md` lines 30–35 — real legacy sequences `on full autopilot` → `continue autopilot`.

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/SKILL.md` only. No chunks must land first; no shared test resource; no consumed output. Worktree creation commit: `217406398f277d8f3b7920a2ef5092ebb866d4bc` (HEAD at wave start, rebased onto origin/main `5d425ea8`).

Current text at SKILL.md:128 (one line):

```
Old record words: `manual` and `attended` read as `no autopilot`, `on autopilot` as `on semi-autopilot`, `continue attended` as `continue no autopilot`, `continue autopilot` as `continue semi-autopilot`, and `autopilot signposts` as `full autopilot`.
```

Change the `continue autopilot` mapping so it no longer flatly reads as semi-autopilot. Suggested shape (adjust wording as long as the criteria hold): keep the line with `continue autopilot` present, and resolve it as *the autopilot mode of the session it continues* — the mode of that chart's earlier `on` entry — with `continue semi-autopilot` as the fallback when the chart's mode record holds no `on` entry. Keep every other mapping exactly as written. Do not rename keys, do not touch any other sentence.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `skills/chart-issues/SKILL.md` — F2 owns shapes.md in parallel; overlapping edits break the cherry-pick. Exception: a mismatch returned to A.
- Do not add a second `Old record words:` line and do not remove any of the six old words from it — brief criterion 2 requires exactly one line mapping all six.
- Do not change any behavior rule's meaning beyond the F1 correction — this leaf's whole contract is no behavior change. Exception: the correction itself as specified above.
- Do not write or edit any test — workers never write tests; a red planned test is a mismatch.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once.
- Run every command unattended: no command that waits on a human; no poll or sleep loop; run a slow command once in the foreground with the tool timeout above its expected run time, waiting on its exit inside your turn. Re-express a harness denial inside the same grant and identity (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim. Name no env file path on a command line; a needed undeclared value is a mismatch, not a formulation to work around. The reason: no human answers a seat's command, and you read only this brief. There is no exception.

## 6. Ordered steps

1. Read SKILL.md 125–141 and this brief (criterion 3).
2. Edit the compat rule per section 4 (criteria 1, 2).
3. Verify: grep that exactly one `^Old record words:` line exists and contains all six old words; trace the two real CHART.md sequences against your final text (criterion 4) — write the trace conclusion in your report.
4. Run the targeted test commands in section 7.
5. Commit once with a message naming the F1 repair.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```
akrogon run-check --name fix1-docs-links -- bun test tests/docs-links.test.ts
akrogon run-check --name fix1-chart-shapes -- bun test tests/chart-shapes.test.ts
```

Both must exit 0. Run from your worktree root.

## 8. Done-when, evidence and report

Done when criteria 1–4 hold, both commands in section 7 pass, and one commit carries the edit. Keep command output only through `akrogon run-check` and cite its `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
