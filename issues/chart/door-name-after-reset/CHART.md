# Chart: door-name-after-reset

## Destination

On a claude door, the handover reset keeps the A session's own name, and a door whose session has none gets the name of its tab before the reset. Each handover logs what happened to the name. Destination repo: akrogon, one leaf.

Route: lifecycle

## Forks taken

- [signposts](forks/signposts.md): 1b 2a 3a 4a 5a 6a 7a, A's picks
- [name-restore](forks/name-restore.md): 1a 2a 3a, A's picks: own name first, else tab name; rename before the reset only when missing; one `name` log line, skip and continue

## Open forks


## Fog

## Off route

- Naming codex, pi and agy doors: no proven rename-and-carry there (signpost 4a). pi 1.5.2 drops the name on `/new` by source inspection; codex 0.169.0 unobserved.
- Naming a door when the operator starts a new process: outside the reset helper (signpost 3a). The door gets its tab name at its next handover.
- Renaming the framework door t3k now: a real door, not touched without its own approval.

## Pending steps

none

## Mode record

- mode 2026-11-14T09:49:37Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a.jsonl: on full autopilot (signposts: A); handed: operator note 2026-11-14 (this chart); consultants: B codex gpt-6.1-sol high, C claude claude-fable-5-2 medium (door-created); route lifecycle

- mode 2026-11-14T10:06:01Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a.jsonl: off (every handed chart handed off)

## Autopilot

- switch-on: INTAKE.md, Source: operator 2026-11-14 door t126
- consultant: B codex gpt-6.1-sol high (operator named codex only, model and effort from the machine config slot b); C claude claude-fable-5-2 medium
- signposts: A — original in issues/chart/door-name-after-reset/forks/signposts.md
- route: lifecycle
- recorded only: 15 `akrogon flaky` entries, newest 2026-10-24, outside the handed list
- recorded only: hc notices that t1cv (ak-slot-b) and t1cw (ak-slot-c), consultants of an earlier door session, exited with signal 1
- handed off: issues/open/door-name-after-reset/reset-name-restore (phase plan.synthesis, `akrogon status` lists it)
- main step: lesson line and learnings/history/2026-11-14-hc-keys-cannot-carry-text.md
- pick against recommendation: none
- recorded only: the framework door t3k (tab c-framework) has had no session name since 2026-11-12; it gets its tab name at its first handover after the leaf's release link, or the operator renames it once by hand
- friction: A's edit script dropped two backticked tokens from the Q3 correction; C's final check caught it and it was repaired before any handoff write
- friction: signpost 5a (log and continue) needed two narrow exceptions found only at rebuttal and leaf review (open rename turn, thrown error)
- usage: [USAGE.md](USAGE.md)

Handed off 2026-11-14
