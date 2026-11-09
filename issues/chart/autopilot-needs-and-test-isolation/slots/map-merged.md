# Opening map, merged (A, B, C)

## #131 pinned hc schema
- Delivered by 47186f90: the test asks a fixture core (`hcCore`, `cleanEnv`, `core.hc`), pinned copy refreshed; report base 75f61f00 predates it. Passes on main, also with `HC_SESSION=default`. (A,B,C)
- Spawns without `env` elsewhere in tests (door-agent.ts:121, door-exchange.test.ts:92, hc-observe.test.ts:63) are a possible same-class risk. (C) Out of reach under signpost 3a: recorded only. (A,B)
- Finish: close naming 47186f90, no leaf. (A,B,C)

## #130 hd-send timing
- 97034315 (2026-11-08 10:48, after report base e3202dff) moved test cores to their own runtime, so the suite starts no hc units; the lesson 2026-11-08-hc-shutdown-unit-leak records leaked units turning dispatch tests red on 15 s / 30 s timeouts. (B; A)
- Observed 2026-11-09 (A, scratch logs): 5 idle runs 14.9-16.4 s; 5 runs under 32 CPU burners on 32 cores (load 19-30) 15.4 s each; full `test` check (`--parallel=4`) 55 s, hd-send passed; host unit count 1109 before and after (the suite added none). Time is flat under CPU load, so the remaining ~15 s is fixed waiting, not load-scaled work. (A)
- C saw one fail at line 145 in 10.6 s at low load. (C) Possibly an overlap with B's run of the same slug, whose teardown stops the repo/slug slice (B's warning). Not reproduced in A's 10 runs. (A) Open.
- Options if work remains: split scenarios (B O1), shim a controlled negative reply where real-core coverage exists elsewhere (B O2), trim per-pass fixed cost keeping all assertions (C). Never raise the timeout or change product waits (signpost 2a). (A,B,C)
- Sibling `hd-silent` has the same shape and was in the 90 s revert. (C) Signpost 3a decides.

## #129 needs before charting
- Real contradiction in current source: Open puts signposts before maps, Take puts the needs sheet after forks, Autopilot excludes approvals from the first supply list and lists needs and approvals as chart waits, Drain moves on. Adding one "ask early" sentence leaves contrary text active. (B,C; A)
- Close example: current Open already makes closing a delivered identity the door's own step; no close-approval barrier to rebuild. (B; A low confidence on what made that door ask)
- Grants are per leaf and shaped by settled forks; full grant scoping before the map may be impossible. Options: early inventory of foreseen needs and approval classes for the recommended route (B Q3 O1, C fork 4) vs conditional inventories per alternative (B O2). (A,B,C)
- Late discovery: continue a useful route already within recorded authority, else park visibly with the exact missing action; never a silent cut or invented consent. (B Q4; C fork 2) How the ask reaches the operator: a message when the chart parks, once per park. (C fork 3)
- Under full autopilot A answers signposts but cannot approve: the needs sheet must still reach the operator. (C)
- Surfaces to reconcile as one contract: SKILL.md Open/Take/Drain/Autopilot, assets/questions.md, assets/shapes.md, docs/use/autopilot.md, docs/use/plan-work.md, docs/reference/limits.md. (B,C; A)
- Seeds of a parked chart re-mirror by design (src/pull.ts); no change. (C)
- Validation by semantic scenario review, not exact-phrase checks. (B) The change reaches doors at the next release link. (A,B,C)

## Split
- #131: close, no leaf. (A,B,C)
- #130: verification first; at most one test leaf if a cause remains. (A,B; C proposed a leaf)
- #129: one leaf for the whole contract. (A,B,C)
- No dependency between #129 and #130 work. (A,B,C)

## Recorded only
- Full-suite run 2026-11-09: 2 `hc-listener` failures (subscribes before its catch-up 21.5 s; cleared foreground 15.1 s), seen on main in earlier rounds too. Outside the handed list.
