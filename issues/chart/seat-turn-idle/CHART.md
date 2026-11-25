# Chart: seat-turn-idle

## Destination

A leaf seat whose agent turn has ended receives the next phase prompt even when it started a background shell: leftover seat shells end when the leaf's phase advances, and a seat terminal hc recovered as a bare shell after a reboot is relaunched. Destination repo: akrogon.

Route: lifecycle (autopilot)

## Forks taken

- [Seed decision](forks/seed-decision.md): taken at import from Tamdoma/akrogon#157
- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks
- [Shell sweep](forks/shell-sweep.md): A's pick 2026-11-25, with final-shape check

## Open forks

none

## Fog

none

## Off route

- An hc change: hc passes the program's status word through untranslated, and the masking is claude's own (map-merged.md, Shared facts).
- A watch-side kill permission: the decision's `Not in scope:`.

## Pending steps

none

## Mode record

- mode 2026-11-24T22:57:50Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/99903986-d780-4c50-93c1-6f67616882a6.jsonl: on full autopilot (autopilot signposts); handed list seat-turn-idle (#157), fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153); consultants B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high (door-created); words in INTAKE.md "Source: operator door message 2026-11-24"

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-24"
- consultant: B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high, door-created at the first exchange
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md
- route: lifecycle
- shell-sweep: A picked Q1 a, Q2 a, Q3 a. Standing dissent: B and D hold Q1 c (delivery-time sweep).
- finding: F1 non-blocking in forks/seed-decision.md `## Findings` (the post-phase-call shell and a masked silent end stay masked, with no wake). The chart goes on.
- breach: slot B ran live claude probes during the opening map although its brief said no paid launches (map-merged.md)
- recorded only: akrogon flaky lists 20 tests (latest 2026-10-24), outside the handed list; no failed leaves; Tamdoma/akrogon footprint chart (another door, t350) deleted logs in b9fe5027, related to #154, not the same outcome

Handed off 2026-11-25
