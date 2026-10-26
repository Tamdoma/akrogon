# Brief 2: skill text — attended handover, seat-C default, batched final check (U2)

## 1. Goal

Implement decisions D6-D9 of `plan.md` for leaf `cost-rules`: the chart-issues skill text describes the attended handover and continuation, a door-created seat C defaults to `pi` with empty argv, and final-shape checks batch per operator reply.

## 2. Acceptance criteria

1. `tests/door-reset.test.ts` `docs describe the handover entries and footer wording` turns green: `SKILL.md` and `shapes.md` each contain `handover`, `continue autopilot (handover`, `attended next`, `continue attended (handover`, `agent_session.value`; SKILL.md keeps `handover queued`, `/clear`, `/new`.
2. Brief What 1: SKILL.md and shapes.md describe the attended handover entry, the continuation entry, fresh-A resume rule and the no-folder CHART.md pending Destination.
3. Brief What 3: both places describing created peers (SKILL.md `## Open`, questions.md `## Blind peer exchange`) state the seat C default.
4. Brief What 4: both places describing the final-shape check (SKILL.md `## Take`, questions.md `## Blind peer exchange`) state the batched check.

## 3. Read-first list

`skills/chart-issues/SKILL.md` (all sections, especially `## Open`, `## Drain`, `## Take`, `## Autopilot`, `## Printed footer`), `skills/chart-issues/assets/questions.md` (`## Blind peer exchange`), `skills/chart-issues/assets/shapes.md` (`## Chart records` Mode record), `tests/door-reset.test.ts` final test (`docs describe`), `issues/chart/door-cost/` is not needed; plan.md decisions D6-D9 (reproduced in section 4). `ponytail.md` in the implement-issue skill folder. Pattern to copy: the existing autopilot handover paragraph in `## Autopilot`.

## 4. Change list and needed interfaces

Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`. No shared resource; runs parallel to U1 (scripts).

Locked Mode record entry forms (write verbatim where shape text quotes them):

- autopilot: `handover <time> <log>: handed <remaining list>; consultants <surviving>; instructions <verbatim with provenance and scope, or none>`
- attended: `handover <time> <log>: attended next <chart>; consultants <surviving>; instructions <verbatim with provenance and scope, or none>`
- continuations: `continue autopilot (handover <time>)`, `continue attended (handover <time>)`

Changes:

- SKILL.md: new `## Handover` section between `## Autopilot` and `## Printed footer`, holding the shared steps once: trigger (Drain moves on to a named next chart — handed off, closed, held, or waiting on an approval/need/prerequisite — after outgoing records, collected consultant turns and span close; never at first entry, inside a chart, at a presented round or handoff review, after compaction, or at pass end); old A's steps (handover entry appended to the next chart's Mode record; CHART.md-only creation with pending Destination when the next chart has no folder; `door-reset.ts` run; turn end); fresh A's resume rule (start prompt must match the latest Mode entry and it must be an unconsumed handover; append `continue <mode> (handover <time>)`, record its A seat with live `agent_session.value`, open its span before chart work; no match → attended in no chart); the reset-cancel rule (operator input recorded after the queue point cancels with `superseded` logged and nothing more sent; checked while waiting and at the last check before send; per-kind input records named: claude `user` entry or `queued_command` attachment with `origin.kind` `human`, codex `task_started` or role-`user` `response_item` message, pi role-`user` `message`); supported kinds line (`/clear`, `/new`, unsupported kinds and non-herdr runs keep same-session behavior); the two mode differences only (trigger/next-chart selection, resume entry name).
- SKILL.md `## Drain`: the move-on sentence gains that the door appends the handover entry per `## Handover` for the attended switch.
- SKILL.md `## Autopilot`: shrink the two handover paragraphs to autopilot-only differences: entry appended to the mode record of every handed chart still open (`handed <remaining list>`), folder creation carries INTAKE.md plus CHART.md with its mode record (attended creates only CHART.md with pending Destination), the fresh-A `seats.yaml` deferral paragraph stays, `continue autopilot (handover <time>)` stays.
- SKILL.md `## Open` seat-record paragraph: fresh A appends its A seat entry and opens its first span on continuation before chart work (existing exchange-appended rule covers later sessions).
- shapes.md `## Chart records`: Mode record block gains the attended handover and `continue attended` lines and `; instructions <verbatim with provenance and scope, or none>` on both handover forms; the "Under autopilot the CHART.md carries `## Mode record`" sentence changes so the record exists for attended charts once a handover can land (the section is created for every chart, empty until then); add the pending Destination: a CHART.md created for a next chart with no folder holds `pending map by fresh A (<seed path, legacy path or operator note reference>)` under Destination plus the Mode record, and no INTAKE.md, until fresh A writes the Destination after its map.
- questions.md `## Blind peer exchange` and SKILL.md `## Open`, created-peer sentence: "asking once for each created peer's harness kind and arguments" → B and later seats are asked; a created seat C with no operator-named kind starts as `pi` with empty argv (`{"seat":"C","kind":"pi","argv":[]}` in the seats list); operator-named kind or arguments win; supplied panes untouched. `peer-create.ts` stays unchanged (do not name a change to it).
- SKILL.md `## Take` and questions.md `## Blind peer exchange`, final-shape check: all mechanism or contract corrections from one operator reply (under autopilot, one pick) for one fork go into one proposed final shape with the corrections marked, sent to every named peer for one focused check before A records them; the batched brief names its round; a correction adopted after the check gets another check only when it adds a mechanism or changes the contract; restatements stay exempt; corrections conflicting in meaning, obligations or behavior — with each other or with a lock or Taken answer — go back to the operator before the check (under autopilot, A's recorded pick); fresh research on a reshaped question, the one rebuttal and leaf review keep their own triggers.

Keep the edits inside the existing sentence style; do not restructure other paragraphs. No script parses `- mode` lines.

## 5. Do-not, reasons and exceptions

- Do not touch any `.ts` file or test; docs only.
- Do not drop the autopilot `handover`/`continue autopilot`/`handover queued` wording — the docs test asserts it.
- Do not add seats/config changes to `peer-create.ts` prose; its argv contract is unchanged.
- Do not widen the handover trigger: no handover at first entry, mid-chart, at rounds/reviews, after compaction or at pass end.
- Conflicts with the locked entry forms or missing-strings → return a mismatch; the exception is a revised brief from A.

## 6. Ordered steps

1. Read SKILL.md `## Autopilot` handover paragraphs, `## Open`, `## Drain`, `## Take`; shapes.md Mode record; questions.md created-peer and final-shape sentences; the docs test.
2. Draft `## Handover` once; place it before `## Printed footer`.
3. Rewire Autopilot/Drain/Open sentences to it.
4. shapes.md Mode record + pending Destination.
5. Created-peer paragraphs in both files (seat C default).
6. Final-shape sentences in both files (batched check).
7. Run the section-7 command; the docs test must pass.

Advisory size: 3 files, under 25 turns.

## 7. Commands

`akrogon run-check --name u2 -- bun test tests/door-reset.test.ts --timeout=30000 -t 'docs describe'` after `bun install --frozen-lockfile` in your worktree. Also run `bunx prettier --check skills/chart-issues` and fix formatting only in the files you touched.

## 8. Done-when, evidence and report

Criteria 1-4 green; commit on the detached HEAD with message `chart-issues: attended handover, seat C pi default, batched final checks`; paste results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
