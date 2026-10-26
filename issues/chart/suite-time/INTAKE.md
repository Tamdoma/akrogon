# Intake: suite-time

## Scope

akrogon's full `test` check (`bun test --timeout=30000`, issues/config.yaml) finishes at least 20% faster in wall time than a baseline measured on the same host, keeping every test's coverage. Operator grouping 2026-10-25: O1a (peer-wait test budgets), O1b (split the nine-case named-target test) and O1c (discovery-deadline waits) as one "faster suite" job. Sibling charts from the same opening map: O4 status clock fixtures, O6 verify fail-fast. O2, O3 and O5 are off route by operator choice.

## Provenance

- Operator: door pane w8:pNP, 2026-10-25, chart-issues arguments and later replies.

## Source: operator 2026-10-25 w8:pNP

"I need you to find me an inefficiency in akrogon that we can improve by at least 20%. One small thing that will either improve the cost, the speed or the quality or all three, or just the two. Use slot b and slot c consultants (they're already active in this herdr tab, codex and pi). Once you discuss it and find it, before charting tell me what it is, and then I'll decide if this will be autopilot mode."

"Fresh start both consultant panes."

"We can use all slots suggestions, so make all 3 of you agents debate them and then we can get a full list, not just one thing."

"1a 2 no" (round: 1a chart O1a, O1b and O1c as one faster-suite job plus O4 on its own; 2 no, skip O5)

"ok, can you ask slot C to do it's own second run on ideas and debates? The reason why I'm asking is that I was using a wrong model in pi, i've now turned it back to wonder-full from meta muse. But you can still use the old C if there's something useful in there."

"1a | 2a" (round: 1a add O6 as its own chart, settling the known-red stuck case first; 2a file a GitHub issue for the 25 unfinished verify runs, filed as Tamdoma/akrogon#119)

"if we need to improve the background tools like bun etc, or replace it with something better, that's also an option. Look at it from a systemic point of view. I'm not locked into anything except for the overall workflow and how it works today. We can replace stack in the backend if it will improve something and if it doesn't change the actual workflow or make things worse. Communicate this to yourself and the agents."

## Agent findings

Shared opening map and debates: slots/map-merged.md, slots/debate-*.md, slots/debate2-*.md.

- Suite 191.9 s wall over 69 files, files one after another, tests concurrent within a file up to 20 (A, bun 1.4.4, JUnit per-file times, 2026-10-25 19:30, load ~2). Recent green verify test checks 190-235 s.
- tests/peer-wait.test.ts 22.8 s: test-supplied '11' second budgets (13 sites), longest test "carried exchange binds the original turn on rerun" (~line 730) 22.3 s waits twice (B, C). The cause is the test budgets, not IDLE_GRACE_MS (B).
- tests/next.test.ts 49.2 s: "named target equivalence" (line 5594) loops 9 cases serially, 28.5-29.3 s against its 30 s timeout, flaky count 3 (A, C).
- tests/session-routing.test.ts 10.2 s: two tests (lines 265, 741) wait out DISCOVERY_DEADLINE_MS = 10_000 (src/shell.ts:199) in an `akrogon next` subprocess against a fake `sleep 12`. Tests in a file run at once, so shortening one saves nothing; both must shrink (A).
- O1a + O1b + O1c estimated 37-45 s off 190-235 s, about 19-23%, unproven (A, B, C).
- Bun 1.4.4 offers `--parallel[=N]` (files across N worker processes, implies `--isolate`, default one worker per core; no bunfig key documented, https://bun.com/docs/test/parallel read 2026-10-25). Not used today (A).
- Earlier chart issues/chart/akrogon-slow-phases/forks/suite-speed.md (2026-10-02) foreclosed `--parallel` when next.test.ts was 64 of an 80 s suite (63 s measured). The suite has since grown to ~192 s over 69 files (A).

## Autopilot switch-on 2026-10-26

Operator, verbatim: "o1, do it on autopilot, I'm going to sleep. If there are any decisions to be made for this particular issue, always prioritize speed and least amount of failures."
