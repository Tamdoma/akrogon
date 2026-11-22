# Chart: watch-any-harness

## Destination

`watch-issues` runs the same watch from a claude, codex, pi or agy conversation through one timer script, `skills/watch-issues/scripts/timer.ts`, with no Claude cron, no expiry and one watch per repo, and `akrogon install` links every akrogon skill into agy's global skill folder. Today's Claude watch behaviors (start check, duplicate start, ticks, a check per due tick while busy, stop, reset stop, paused repo) hold on all four harnesses.

Route: lifecycle

## Forks taken

- [signposts](forks/signposts.md): operator 1a-6a, N1 approved; corrections S1, S2a, S3a
- [timer-design](forks/timer-design.md): A's picks, shell-pinned hc child timer, per-due delivery with receipt label, verified `<prefix>-watch` timer, agy global link

## Open forks

none



## Fog

## Off route

- hc change to cancel a held send when the program changes: operator S2a/S3a accept the race as a stated limit; signpost 5a keeps hc unchanged.
- Native harness schedulers (Claude cron, agy schedule): signpost 1a.

## Pending steps

none

## Mode record

- mode 2026-11-20T11:31:14Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/2b32091a-f4f9-4382-8ed3-14ed9495e28b.jsonl: on autopilot (operator answers signposts, A answers forks); handed watch-any-harness; consultants B codex gpt-6.2-astra high, C agy neon high (door-created)

## Autopilot

- breach: 2026-11-20T13:31:06Z pi charting probe sent from the door arrived tagged and reached pi's model (one paid turn, interrupted about 11 s), a ninth paid charting session beyond N1's 8 (forks/timer-design.md P12); further launches stopped
- switch-on: INTAKE.md `## Source: operator 2026-11-20 door t126`
- consultant: B codex gpt-6.2-astra high; C agy neon high
- signposts: operator — original in watch-any-harness
- route: lifecycle
- handed off: watch-any-harness/agy-skill-link, watch-any-harness/watch-timer (2026-11-20T13:40:38Z)
- wait: none (N2 answered by the operator 2026-11-20T13:36:50Z)
- usage: chart watch-any-harness - operator wait 65.8 min, operator turns 6; A=157183, B=21877, C=unmeasured output; outcome partial
- recorded only: flaky tests from 2026-10 (akrogon flaky), seed Tamdoma/akrogon#145 (charted in run-check-kept-evidence); seed Tamdoma/akrogon#146 (watch consultants; same skill file, different outcome, not handed)

Handed off 2026-11-20
