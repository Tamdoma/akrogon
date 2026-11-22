# Chart: merge-lanes

## Destination

In akrogon, a red or seat-needing merge run gives up the repo's merge line at once so the next leaf starts, the failed leaf is judged and repaired off the line without a second full suite and returns to the queue, a red already on main stops costing every leaf extra runs, and leaves waiting in merge stop using up the host-wide seat cap, so time from first entry to merge until landed falls with no new red on main, no extra PC load and no token growth. Map: slots/map-merged.md.

Route: lifecycle

## Forks taken

- [red-exit](forks/red-exit.md): red and seat hand-offs move merge -> check.repair by the command; other push errors -> failed; B judges off the line with no full suite; no-edit receipt skip; flaky re-key; first return keeps the first stamp (A's pick against the 2026-10-05 operator answer); main-red ledger cover; first-observation base pass waits on N3
- [waiting-seats](forks/waiting-seats.md): merge leaves stop counting in `activeCount`; seats stay alive; `capacity` wait reason; slice kept while a merge leaf holds a batch; reopen triggers as a pending step
- [extras](forks/extras.md): D1 and D2 removed by red-exit with two criteria; D3 slow-alarm baseline as its own leaf (carried normal, last-20 recovery, 14-day accepted with notice); guards before verify not taken

## Open forks


## Fog

## Off route

- From red-exit Taken 9, not taken: framework `full: [verify]` to close `verify --holder` beside the line (B,C); leaf receipt limited to non-`full` checks for edited returns (B); active covers in `akrogon status` (C); gates before verify (B).
- From extras Taken 4: per-command `duration_ms` on verify-runs command entries (C); seat silence in `check.repair` with no busy notice (B,C).

## Pending steps

- After framework suite-lanes lands: N2 two-suite load probe (signposts N2, approved 2026-11-21); if it passes, speculative depth-2 testing is new intake for its own chart (map-merged 2a). Owner: the door; check: wall times and failures of both runs recorded in a merge-lanes fork.
- After the waiting-seats change lands: read `akrogon.slice` MemoryPeak and memory.events high and per-repo merge depth; reopen per forks/waiting-seats.md Taken 4. Owner: the door; check: the readings recorded in a merge-lanes fork.


## Mode record

- mode 2026-11-21T17:21:10Z t2z2 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953.jsonl: on autopilot (operator answers signposts, A answers forks); handed merge-lanes; consultants B claude claude-fable-5-2 high, C agy neon xhigh
- mode 2026-11-21T17:49:24Z t2z2 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953.jsonl: changed list: operator signpost 4b adds suite-regrowth (framework), taken before merge-lanes; handed list suite-regrowth, merge-lanes
- mode 2026-11-21T17:49:24Z t2z2 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953.jsonl: handover 2026-11-21T17:49:24Z /home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth/door-reset.log: handed suite-regrowth, merge-lanes; consultants B claude claude-fable-5-2 high (t2z4 ak9902-slot-b), C agy neon xhigh (t2z3 ak9aaf-slot-c), both door-created under a random name prefix per the operator's 2026-11-21 words "just use a different name for the helpers and redo the step, random names, man."; signposts /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/signposts.md; instructions: operator 2026-11-21, scope this door session: "just use a different name for the helpers and redo the step, random names, man." (consultant restarts use a random name prefix because ak-slot-b/c and fw-slot-* names may be held by other doors; start through seat.ts startConsultant with a prefixed global, script /tmp/claude-1000/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953/scratchpad/start-consultant.ts)
- mode 2026-11-21T18:35:03Z t2z2 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1bf33f67-033f-4cd7-874f-8da5ff6fbae5.jsonl: handover 2026-11-21T18:35:03Z /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/door-reset.log: handed merge-lanes (suite-regrowth handed off 2026-11-21); consultants B claude claude-fable-5-2 high (t2z6 ak788e-slot-b), C agy neon xhigh (t2z7 akc0a9-slot-c), both door-created under a random name prefix; signposts /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/signposts.md; instructions: operator 2026-11-21, scope this door session: "just use a different name for the helpers and redo the step, random names, man." (consultant restarts use a random name prefix because ak-slot-b/c and fw-slot-* names may be held by other doors; start through seat.ts startConsultant with a prefixed global, script /tmp/claude-1000/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953/scratchpad/start-consultant.ts); operator 2026-11-21T17:48Z signposts reply, still unanswered in words: "What did Fable and Neon come up with?" (answered in the suite-regrowth pass output; repeat in the pass-end); carried from suite-regrowth: akrogon's slow alarm closes `recovered` and its rolling 20-run median absorbs each step, per-script seconds are not in the ledger (suite-regrowth forks/suite-cuts.md Q5), and N2 runs after suite-regrowth/suite-lanes lands
- mode 2026-11-21T18:36:02Z t2z2 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/a6b8daac-b25d-4f61-aa42-e82a6f320dc1.jsonl: continue autopilot (handover 2026-11-21T18:35:03Z)

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-11-21 door message`
- consultant: B claude claude-fable-5-2 high and C agy neon xhigh: start failed 2026-11-21T17:25Z (approx), `akrogon seat` hc run `name_taken` (ak-slot-b held by t2z0, ak-slot-c by t2z1, consultants of door t126's open chart watch-consultants); operator 2026-11-21: "just use a different name for the helpers and redo the step, random names, man." Restarted 2026-11-21T17:34:34Z through seat.ts startConsultant with a random prefix: B t2z4 ak9902-slot-b, C t2z3 ak9aaf-slot-c
- signposts: operator — original in issues/chart/merge-lanes/forks/signposts.md
- route: lifecycle
- wait: signposts answered 2026-11-21T17:48Z; order puts suite-regrowth (framework) first — next: resume after suite-regrowth hands off; N2 load probe supplied, runs after suite-regrowth lands
- recorded only: akrogon flaky lists 10 tests (latest 2026-11-21T13:09Z); framework flaky lists 19; akrogon has no open or failed leaves; seed Tamdoma/akrogon#146 holds a decision section, unrelated, not imported
- consultant: restarted fresh for merge-lanes 2026-11-21T18:3xZ (handover continuation): B t2zf ak1ec3-slot-b, C t2zg ak73a5-slot-c, random prefix per the operator's 2026-11-21 words
- pick against an operator answer: red-exit Taken 6 keeps the first merge_stamp on the first return, against merge-turn forks/turn-release.md Q3 "3a" (operator 2026-10-05); its reason (batches) lapsed in 6e7a33ff
- wait: N3 (late, forks/signposts.md `## Needs`) held leaf merge-red-exit; four leaves handed 2026-11-21; notice /home/ivan/.config/herdr-app-sessions/infra/akrogon-notices/akrogon.notice.e8d77e3e-3f50-420c-b6b1-dbf75b4d6250.json; N3 supplied 2026-11-21T20:03Z (operator yes), merge-red-exit handed with red-exit Taken 8
- friction: consultant names are `<prefix>-slot-<x>` per repo, so a second door on the same repo cannot start consultants while another door's consultants live (src/hc.ts consultantName)

Handed off 2026-11-21
