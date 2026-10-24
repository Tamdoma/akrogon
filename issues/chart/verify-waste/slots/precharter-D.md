# Consultant D: cut the CPU burned by framework tests

Sources: FW = /home/ivan/Work/infra/tamdoma/framework, AK = /home/ivan/Work/infra/akrogon/src. CPU seconds come from systemd's own
accounting: `journalctl --user` "akrogon-run-<uuid>.scope: Consumed X CPU time" lines (11,945 scopes, 2026-10-14..24), joined to
FW/issues/timings.jsonl `check_end` rows by run id (7,978 matched). Wall and exits come from FW/issues/verify-runs.jsonl (1,163 runs).

## Findings

- F1 Total CPU in akrogon run scopes over 11 days: 484 CPU-h (44 CPU-h/day, 96 CPU-h on 10-24). One full `framework:verify` costs a
  median 1,735 CPU-s over 364 s wall (4.1 cores average, 9.3 GB peak). Cheap: 42 CPU-s. Setup: 1 CPU-s median, 0.4 CPU-h total.
  Setup and cheap are not the problem; the full suite is: 597 suites, 271 CPU-h, 56% of all CPU.
- F2 Half of all full suites are red: ledger 235 red / 475 merge runs; journal 298 red / 597 (123 CPU-h, 25% of all CPU). First
  merge attempt red for 131 of 232 leaves. 2.05 full suites per landed leaf (475/232), up to 11 (audit-ledger-seed).
- F3 Reds are flakes under the suite's own load, not code: every surviving red log (36, all 10-23/24) fails in `hooks:selftest` with
  "timed out after 120000ms" / "beforeEach hook timed out" (e.g. FW/issues/open/verify-revisit/verify-dedup-guard/implementation/
  check-verify-1792869593981-726979.log). 25 cross-leaf red streaks (106 runs, 47,517 s wall) and 46 identical-tree reruns say the
  same. fixture-flakes already owns these tests; what remains is how much each red costs.
- F4 A red run keeps burning after the verdict: `framework:verify:core` is `bun run --parallel --no-exit-on-error` (FW/package.json:177)
  and each rest lane is `--sequential --no-exit-on-error`. In the 35 red logs the failing member finished at median 309 s of a 465 s
  core; a median 34% of the run's wall (and all 14 lanes' CPU in it) came after the suite was already red.
- F5 Each flake is paid up to three times: merge-issue SKILL.md:79 orders one rerun on the unchanged head, then `--known-red`, which
  runs the merge-base fresh (AK/verify.ts:412 calls runOnce for the base without the greenRun lookup that heads get at verify.ts:398).
  The base tree is a landed main tip, so it already holds a green receipt: 13 of 19 `compares` base runs had one. 42 base-like runs
  (sha on main, >10 min old at start) = 20,397 s wall, about 20 CPU-h.
- F6 Seats run the full suite outside `akrogon verify`: 105 run-check scopes over 600 CPU-s, 50 CPU-h (10%), 64 of them in check.fix,
  labels like `merge-verify-rerun7`, `fix-verify-rerun`, `test_changed`. implement-issue SKILL.md:25 forbids this in prose only.
  These runs leave no receipt in verify-runs.jsonl, so nothing can be reused from them.
- F7 Merge runs never overlap each other (471 of 475 alone; max 4 concurrent runs of any kind), so the heat is one suite at a time
  at 4 cores average with bursts, not a pile-up. 20% of CPU is other repos: ~/.akrogon/current 64 CPU-h, lingua-relay 34 CPU-h.

## Ideas, ranked

- I1 Member receipts (top pick). Make the 14 core members the unit akrogon records, reuses and cancels, instead of one opaque
  `framework:verify` command. Config: `merge_checks` gains a parallel group (the 14 members; cheap stays a prior stage). AK/verify.ts:338
  runs the group concurrently, writes one receipt per member keyed by tree (the ledger already stores tree and per-command exit), skips
  every member that holds a green receipt for this tree, and cancels the group's remaining members on the first red (TimeoutStopSec=5
  scopes already make that clean, AK/scope.ts:43). Saved: fail-fast ≥34% of red-suite CPU (F4) ≈ 42 CPU-h; identical-tree reruns and
  base runs (46 + 42) then run only the red member ≈ 34 CPU-h; together 60-70 CPU-h of 484 (13-15% of all CPU, a quarter of suite CPU),
  and more once fail-fast lands at test grain. Tradeoff: B sees one red member per run, not all; in the 36 logs there was one anyway.
  Could break: `akrogon flaky` and `baseCoversHead` parse one log for names (AK/flaky.ts:11); they get simpler, per member. Rest lanes
  stay as they are inside their member. Files: AK/config.ts:48, AK/verify.ts:338-346 and 398-412, AK/flaky.ts, FW/issues/config.yaml,
  FW/package.json:177-181 (core becomes a list, run-verify-stages.ts goes), merge-issue SKILL.md:77-79 (receipt wording).
- I2 Base receipt reuse now. Give the base run at AK/verify.ts:412 the same greenRun lookup heads get at :398. One expression; ships
  today and is subsumed by I1. Saved: ≈20 CPU-h (F5) and 6 min of merge wall per flake. Tradeoff: none; a landed tree is a green tree.
- I3 run-check refuses the suite. `akrogon run-check` (AK/run-check.ts:185) refuses a command whose text equals a configured `checks` or
  `merge_checks` entry and prints `use akrogon verify`, making implement-issue:25 mechanical. Every full suite then has a receipt and
  tree reuse. Saved: the duplicate part of F6, 20-40 CPU-h; the rest of the 50 CPU-h stays because check.fix sometimes needs the suite.
  Could break: a worker that legitimately runs one member by hand is unaffected (only exact suite text matches).
- I4 Stop the three-run flake tax at the policy level. With I1 a same-head rerun costs one member, so merge-issue:79 can keep its
  shape; without I1, drop the unconditional base run and let `--known-red` consult the base receipt (I2). Saved: inside I1/I2.
- I5 Build on fixture-flakes: its done-criteria shrink fixtures but keep `bun test --timeout=30000 --parallel=8` for hooks:selftest
  (FW/package.json:8) under 13 sibling lanes. After it lands, re-measure F3 from the journal join; if timeouts remain, the cause is the
  suite's own contention and I1 is what stops a timeout from costing a full suite. No change proposed here.
- I6 Out of scope but on the same CPU: ~/.akrogon/current and lingua-relay runs are 98 CPU-h (F7). Report only.

## Why I1

Every other option guards a symptom: fewer reds, cheaper reds, fewer duplicates. I1 removes the class "work whose verdict is already
known": a member that passed on this tree never runs again, a member that failed stops its siblings, and the base run collapses into
receipt reads. It is the existing identical-tree reuse rule (verify.ts:398) applied at the grain the suite already has, so no new
concept enters: receipts, trees, scopes and `flaky` all exist. It touches no test, keeps every member blocking every merge, and makes
the ledger finally say which member burned what, which the lanes leaf needs anyway.

Last operation: wrote this file from the ledger, timings, journal join and 36 surviving red logs; edited nothing else; ran no suites.
Next: operator picks I1 (chart leaf in verify-revisit or akrogon) or ships I2 alone; I3 can go as a small akrogon leaf either way.
