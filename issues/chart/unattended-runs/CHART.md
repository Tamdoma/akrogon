# Chart: unattended-runs

## Destination

Unattended leaves keep moving honestly. A seat's no-report budget is spent only by turns that really ended without a report, with a separate bound on seats lost before ending a turn (#137). A failed leaf refuses new run-check launches (#136). A seat stuck on a prompt reaches the operator at once instead of after an hour, and claude seats can no longer open question dialogs (#135). A chart door uses its live hc address for the consultant column and every report step, never one carried over from before a restart (#138).

Route: lifecycle

## Forks taken

- [turn-count](forks/turn-count.md): count at the seen silent turn end, defer while a run-check run is live, `lost` bound of 3, `seat_lost` timing row, no migration (A's picks)
- [failed-refusal](forks/failed-refusal.md): refuse leaf and worker runs of a failed leaf before admission and before spawn, `check_refused` row (A's picks)
- [blocked-prompts](forks/blocked-prompts.md): akrogon appends `--disallowedTools=AskUserQuestion` for claude, one attention notice per blocked episode, doors out of reach (A's picks)
- [door-address](forks/door-address.md): `$HC_TERMINAL_ID` read at each use is the door's address (A's picks)

## Open forks

none

## Fog

none

## Off route

- Listener boot PATH crash (`Executable not found in $PATH: "akrogon"`, src/listen.ts spawn): the reporter marked it "Separate observation, not part of this report"; systemd restarted 2 s later and nothing was lost. Recorded only under autopilot (B and C proposed a leaf; dissent stands).
- What killed the two boot seats on 2026-11-16: unknown, no evidence survives, likely outside akrogon (hc, herdr restore or the harness). akrogon only stops it from costing attempts (forks/turn-count.md).

## Pending steps

- Tamdoma/akrogon#135 stays open as a partial match: claude seats lose the question tool and blocked seats notify at once (epic unattended-runs, issue blocked-seats), while the asked-for watch confirming prompts in tabs is not built by design (signposts 1a, 3a; blocked-prompts Q3). It is in no leaf's `sources`. Close or re-scope it is the operator's call.

- Lesson learnings/history/2026-11-15-background-wait-fails-leaf.md (uncommitted on main): no leaf stops it on every path (plain background shell jobs stay unseen), so the line stays; count-silent-turns and refuse-failed-runs each say so.

## Mode record

- mode 2026-11-16T09:38:45Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/d810649d-c899-4771-8adb-a0ed2c5c7d5d.jsonl: on full autopilot (signposts by A); handed: unattended-runs (Tamdoma/akrogon#135, #136, #137); consultants B codex gpt-6.1-sol high, C pi meta/muse-wonder-full-1.0-contributor high (door-created)
- mode 2026-11-16T09:53:32Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/d810649d-c899-4771-8adb-a0ed2c5c7d5d.jsonl: changed list: Tamdoma/akrogon#138 added to unattended-runs by the operator ("Another issue was filed, pull it up, and consolidate it here for the build. Still full autopilot mode.")

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-11-16 switch-on`; changed list INTAKE.md `## Source: operator 2026-11-16T09:53Z changed list`
- signposts: A — original in issues/chart/unattended-runs/forks/signposts.md
- route: lifecycle
- recorded only: open-time flaky list (20 tests, last 2026-10-24) and no failed leaves; none in the handed list
- handoff 2026-11-16: epic unattended-runs with issues seat-budget (count-silent-turns, refuse-failed-runs; sources #136, #137), blocked-seats (claude-seat-no-questions, blocked-seat-notice; no sources) and door-live-address (door-reads-live-address; source #138); all parallel, no blocked-by; reviewed by B and C (slots/leaf-review-B.md, -C.md); needs N1 and N2 cut as unneeded; A's handoff review under full autopilot

Handed off 2026-11-16
