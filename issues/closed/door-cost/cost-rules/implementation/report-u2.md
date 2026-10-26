# U2 report: skill text — attended handover, seat-C default, batched final check

Changed files and reasons:
- `skills/chart-issues/SKILL.md` — new `## Handover` section between `## Autopilot` and `## Printed footer` holding the shared steps once (trigger, old-A steps incl. pending-Destination CHART.md creation, fresh-A resume rule, reset-cancel with per-kind input records, supported kinds, mode differences); `## Autopilot` handover paragraphs shrunk to autopilot-only differences (`handed <remaining list>` entries, INTAKE.md folder creation, seats.yaml deferral, `continue autopilot` entry); `## Drain` move-on sentence gains the handover note; `## Open` seat-record paragraph gains the fresh-A continuation seat/span rule and the created-peer sentence gains the seat C `pi`/empty-argv default; `## Take` final-shape sentence gains the batched check.
- `skills/chart-issues/assets/shapes.md` — Mode record block gains the attended handover and `continue attended (handover <time>)` lines and `; instructions <verbatim with provenance and scope, or none>` on both handover forms; governing paragraph now creates `## Mode record` for every chart (empty until a mode or handover entry lands) and states the pending-Destination rule for a folderless next chart.
- `skills/chart-issues/assets/questions.md` — created-peer sentence gains the seat C `pi`/empty-argv default (operator-named kind/arguments win); final-shape sentence gains the batched check (one reply's corrections in one marked shape to every named peer, batched brief names its round, post-check correction re-checked only when it adds a mechanism or changes the contract, conflicting corrections back to the operator, existing triggers kept).

Tests run:
- `bun install --frozen-lockfile` — ok (9 packages)
- `akrogon run-check --name u2 -- bun test tests/door-reset.test.ts --timeout=30000 -t 'docs describe'` — pass, 1 pass / 0 fail, check exit 0 (log: check-u2-1793011689502-181217.log)
- `bunx prettier --check skills/chart-issues` — clean, no fixes needed

Known limitations: none known.

Unverified criteria: none.
