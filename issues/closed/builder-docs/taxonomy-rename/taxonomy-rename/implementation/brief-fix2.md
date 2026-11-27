# Sub-brief fix2 — switch-on record specifies the lower-case mode value (F2)

## 1. Goal

Repair review finding F2 so the mode-record writer's template in `skills/chart-issues/assets/shapes.md` tells the door exactly how to write a switch-on entry: its detail starts with the lower-case mode value (`on semi-autopilot` or `on full autopilot`). Plan decisions involved: D3 rule 5 (refined per plan.md `## Implementation notes` 2026-11-27), D4.

## 2. Numbered acceptance criteria

1. In `skills/chart-issues/assets/shapes.md` `## Mode record`, the template block carries one switch-on template or example line whose entry starts `- mode <time> <A address> <A transcript path>: on semi-autopilot` — the lower-case mode value spelled as the start of the detail — so a new switch-on has an instruction for encoding which mode started. Covering `on full autopilot` in the same or a second line, or a covering sentence, satisfies the criterion as long as `on semi-autopilot` appears lower case in the template block.
2. Nothing else in shapes.md changes; no other file is edited. The existing lines `continue semi-autopilot (handover <time>)` and `continue no autopilot (handover <time>)` and the `### readiness.yaml` fenced block further down stay byte-identical.
3. Realistic shape: the line resembles how switch-on entries are actually written (mode first, then handed list/consultants/signposts detail), e.g. `- mode <time> <A address> <A transcript path>: on semi-autopilot <detail>` or a fuller realistic detail; either is acceptable.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` lines 44–95 (`## Mode record` and the CHART.md prose)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- For realistic shape only (do not edit): `/home/ivan/Work/infra/akrogon/issues/chart/builder-docs/CHART.md` line 30 — a real switch-on entry.

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/assets/shapes.md` only. No chunks must land first; no shared test resource; no consumed output. Worktree creation commit: `217406398f277d8f3b7920a2ef5092ebb866d4bc` (HEAD at wave start, rebased onto origin/main `5d425ea8`).

The current template block (shapes.md:54–58):

```
- mode <time> <A address> <A transcript path>: <on | off | changed list | continue <mode value>> <detail>
- mode <time> <A address> <A transcript path>: handover <time> <log>: handed <remaining list>; consultants <surviving>; signposts <path or none>; instructions <verbatim with provenance and scope, or none>
- mode <time> <A address> <A transcript path>: handover <time> <log>: no autopilot next <chart>; consultants <surviving>; signposts <path or none>; instructions <verbatim with provenance and scope, or none>
- mode <time> <A address> <A transcript path>: continue semi-autopilot (handover <time>)
- mode <time> <A address> <A transcript path>: continue no autopilot (handover <time>)
```

Add or reshape exactly what criterion 1 needs and nothing more. The generic first line may stay; the new line(s) go beside the other concrete templates.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `skills/chart-issues/assets/shapes.md` — F1 owns SKILL.md in parallel; overlapping edits break the cherry-pick. Exception: a mismatch returned to A.
- Do not change the `### readiness.yaml` fence or any heading — `tests/chart-shapes.test.ts` pins them. Exception: none; a red pinned test is a mismatch.
- Do not alter the meaning of any handover/continue template — this leaf's contract is no behavior change beyond the F2 specification. Exception: none.
- Do not write or edit any test — workers never write tests; a red planned test is a mismatch.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base use a second worktree of the base instead. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once.
- Run every command unattended: no command that waits on a human; no poll or sleep loop; run a slow command once in the foreground with the tool timeout above its expected run time, waiting on its exit inside your turn. Re-express a harness denial inside the same grant and identity (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted formulation answers, return a mismatch to A with the denial text verbatim. Name no env file path on a command line; a needed undeclared value is a mismatch, not a formulation to work around. The reason: no human answers a seat's command, and you read only this brief. There is no exception.

## 6. Ordered steps

1. Read shapes.md 44–95 and this brief.
2. Add the switch-on template/example line(s) (criterion 1).
3. Verify: grep the template block shows `on semi-autopilot` lower case; the `### readiness.yaml` fence and the two continue lines are byte-identical to before your edit (git diff shows only your addition).
4. Run the targeted test commands in section 7.
5. Commit once with a message naming the F2 repair.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```
akrogon run-check --name fix2-chart-shapes -- bun test tests/chart-shapes.test.ts
akrogon run-check --name fix2-docs-links -- bun test tests/docs-links.test.ts
```

Both must exit 0. Run from your worktree root.

## 8. Done-when, evidence and report

Done when criteria 1–3 hold, both commands in section 7 pass, and one commit carries the edit. Keep command output only through `akrogon run-check` and cite its `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
