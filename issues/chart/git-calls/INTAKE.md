# Intake: git-calls

## Scope

akrogon spends less CPU on repeated subprocess calls (git, the fake tools in tests), measured first by a census of every process one full `test` check starts and its share of user and sys CPU. Product code and test tooling; the workflow stays the same. Opened from issues/chart/suite-time/forks/suite-shape.md Q4.

## Provenance

- Operator: door pane w8:pNP, 2026-10-25.

## Source: operator 2026-10-25 w8:pNP

"if we need to improve the background tools like bun etc, or replace it with something better, that's also an option. Look at it from a systemic point of view. I'm not locked into anything except for the overall workflow and how it works today. We can replace stack in the backend if it will improve something and if it doesn't change the actual workflow or make things worse. Communicate this to yourself and the agents."

"1a | 2a | 3a | 4a" (4a: chart akrogon's repeated git calls as their own chart after suite-time, starting with a census)

## Agent findings

- tests/next.test.ts: about 14,000 git calls, 82% from akrogon `next`; top `rev-parse --git-common-dir` 1,389, `rev-parse HEAD` 1,093, `rev-parse --verify` 1,006 (A, PATH shim, 2026-10-25).
- tests/phase.test.ts: 3,057 git spawns; src/ has 167 git call sites; src/config.ts `commonDirectory` spawns `git rev-parse --git-common-dir` per call (C, issues/chart/suite-time/slots/suite-shape-addendum-C.md).
- tests/peer-wait.test.ts about 200 CPU-s in 23 s wall, mostly fake herdr relaunches; bytecode-prebuilt fake about 49% less CPU per call (B, issues/chart/suite-time/slots/suite-shape-addendum-B.md).
- Caching risk: akrogon moves refs during a run, so only facts fixed for the run may be cached (C P2).
- Fake herdr prebuild landed 083d3048 from chart suite-time: each test worker builds one bytecode bundle; next.test.ts 25.4 s to 16.7 s alone. akrogon's own `next` work (about 200 ms and about 25 git calls per call) is the remaining cost (A, 2026-10-26).
- Every `bun test` run leaves its worker suite roots in /tmp despite the exit handler at tests/isolation.ts:94-100 serial and parallel alike; 186 folders, 37 GB of tmpfs on 2026-10-26, some 708 MB each from akrogon-state-home-* folders (A, 2026-10-26). Fixed 02dc5f91 (operator "d1 yes, delete them and fix the leak"): bun test never runs exit handlers, so each worker now removes roots of exited workers at preload. Runs under `akrogon verify` were not affected, since their TMPDIR is the run root that akrogon removes.
