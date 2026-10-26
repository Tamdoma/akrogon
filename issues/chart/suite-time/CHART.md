# Chart: akrogon

## Destination

akrogon's full `test` check finishes at least 20% faster in wall time than a baseline measured on the same host with before and after recorded, with no test's covered outcome lost.

Route: direct (L1 faster-suite-files), then main step S1

## Forks taken

- [Load-sensitive tests](forks/load-sensitive-tests.md): fix shared slice names, short budgets, sleep ordering and status clock; trial in-file cap 4; three at once is the target with a return to the operator on cap-only stretch.
- [Suite shape](forks/suite-shape.md): 4 files at once (no-isolate) in `checks.test`, plus O1b and O1a; O1c fallback only; proof quiet-host 20% plus three-at-once green.

## Open forks

none

## Fog

none

## Off route

- O2 cross-scope receipt reuse: dropped, about 1.9% of merge verify time.
- O3 `test` to merge_checks: held as operator policy, reverses the 2026-10-14 choice.
- O5 per-test timeout raises: operator "2 no".
- O4 status clock fixtures: folded into this chart (operator 3a).
- O6 verify fail-fast: its own chart.
- Prebuilt fake herdr and akrogon's repeated git calls: chart issues/chart/git-calls (operator 4a).
- Plain hand `bun test` runs stay serial (operator 2a).
- Rewrite work for the operator: seven `tests/next.test.ts` tests fail at their 15 s caps when two suites start at once ("a leaf re-entering merge queues behind the two leaves stamped earlier", "an idle hook retries a faulted merge holder before its waiter", "a stale prompt never re-prompts a busy or done seat, and repeated delivery failures keep the leaf in phase", "busy seats persist, warn strictly after an hour, retry delivery and clear independent episodes", "merge, check.fix, check.repair and post-repair review dispatch to their swapped seats", "merged phase closes tab on typed next and starts the dependent", "the prompt delivery fault holder exit wakes the next merge leaf without a manual next"). Done 083d3048 on operator "fix the seven tests too" (2026-10-26): each test worker builds the fake herdr once as a bytecode bundle, and the merge-queue tests allocate their leaves in one dispatch pass. next.test.ts 25.4 s to 16.7 s, suite 61 s to 48 s alone, two at once 6 of 8 copies green (was 0 of 8). The one remaining fail is the re-entering test, whose sequence B's F29 protects. Runs in slots/s1-runs.txt.
- One-at-a-time waiting line (host-wide or akrogon-only): not brought back (operator O1, 2026-10-26).

## Pending steps

none

## Main steps done

- S1 landed be59c9e2 (2026-10-26): `checks.test` is `bun test --timeout=30000 --parallel=4 --no-isolate` (cap 20; cap 4 was 40 s slower and no greener alone). Verify on be59c9e2: 70.27 s, 1175 pass, 0 fail, 11676 expects, the same counts as the serial receipt on 51ee341c (165.99 s). Paired quiet runs 61 s vs 163 s serial, 63% faster. Three at once and two at once fail on per-test caps, with the old serial command too; the operator chose O1 (no waiting line) on that data (forks/suite-shape.md, S1 landing 2026-10-26).

## Direct attempt

- branch: faster-suite-files
- worktree: /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files
- base: e48585a5d197b50114cafa685a759367dab89973
- head: 51ee341c54fdd0e9b1805306b69d211bce8654d6
- rounds used / fix_rounds: 1 / 8
- push attempts: 1 / 2
- done: criteria 1-4 (criterion 3 peer-wait half restated, operator "ok, do o1")
- not done: none
- trigger: none
- review files: slots/review-B-1.md (fix: F32, F33), slots/review-B-2.md (ready)
- landed SHA: 51ee341c54fdd0e9b1805306b69d211bce8654d6 (2026-10-25; broadcast delivered to both targets; worktree and branch removed)

## Mode record

- mode 2026-10-26T00:17:48Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: on, handed: S1 of this chart (operator words in INTAKE.md, Autopilot switch-on 2026-10-26)
- mode 2026-10-26T00:18:15Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: off, every handed chart Closed
- mode 2026-10-26T00:22:00Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: on, handed: the seven-test rewrite (operator "fix the seven tests too\nI'm going to sleep.")
- mode 2026-10-26T01:02:00Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: off, 083d3048 landed

## Autopilot

- switch-on: INTAKE.md, Autopilot switch-on 2026-10-26
- consultant: none used in this autopilot pass
- route: direct (chosen attended before switch-on)
- main step: S1 be59c9e2 pushed to main and verified green
- pick against recommendation: none (O1 was the operator's pick)
- seven-test rewrite picks: A pulled the prebuilt fake herdr forward from chart git-calls (operator 4a had placed it there) because it removed the most CPU per test; bytecode bundle over the compiled binary because suite folders leak in /tmp and the binary is 92 MB; one-pass leaf allocation keeps every merge sequence (F29)
- usage at close: operator wait 217.8 min, operator turns 35; A=235228, C=84661, B=124456 output (outcome partial)

Closed 2026-10-26
