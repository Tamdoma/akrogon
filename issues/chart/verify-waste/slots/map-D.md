# Map D: verify-waste

AK = /home/ivan/Work/infra/akrogon, FW = /home/ivan/Work/infra/tamdoma/framework. Read-only; no suite run, nothing edited.

## Measured (recomputed 2026-10-24 ~22:00)

Query J: `journalctl --user -o short-iso --since 2026-10-14 | grep 'akrogon-run-.*\.scope: Consumed'`, joined to FW/issues/timings.jsonl `check_end` rows by run id. Query L: FW/issues/verify-runs.jsonl, completed = `end` set and `setup` 0, red = any command exit != 0, since 2026-10-14. Query G: surviving `check-verify-*.log` files named by L (46 of 477 merge receipts still have a log).

- M1 (J) 11,825 run scopes, 493.3 CPU-h. Framework-matched 7,985 scopes, 364.5 CPU-h: `verify` 600 runs 274.8 CPU-h (median 1,736 CPU-s), `run-check` 5,479 runs 80.3 CPU-h, `cheap` 740 runs 9.0 CPU-h, `setup` 0.4 CPU-h. Unmatched (other repos) 3,840 scopes 128.8 CPU-h (26%).
- M2 (L) 477 completed merge runs: 457 head runs (223 red), 20 base runs (`compares` set). 232 leaves, first attempt red for 131, 1.97 head runs per leaf. Red head runs 82.3 CPU-h, green head runs 107.2 CPU-h.
- M3 (L) Identical-tree head reruns: 70 (31.3 CPU-h); 26 flipped red to green, 44 stayed red.
- M4 (L+G) Base runs: 20, 12.6 CPU-h. 14 had a prior green merge receipt for the base tree; of those 14 the fresh base run came out red 9 times and green 5. Of the 10 base runs whose head and base logs survive, `baseCoversHead` (AK/src/verify.ts:111) would pass 0 (head and base fail different test names; e.g. home-display-copy head "join prep reads the branch head...", base "runParity is importable..."). All 10 `notice: shown` records in the ledger are these base runs: 10 "main red" notices, every one a flake on a tree that holds a green receipt.
- M5 (G) 37 red merge logs: red members hooks:selftest 33, test:render-satellite 13, rest-d 9, rest-a 8, rest-c 6, cf-workers-deploy 2, others 2; 73 red members over 37 runs, so about 2 red members per red run, not 1. First red member finished at median 285 s of a 489 s core; median 42% of core wall ran after the verdict was known. Green-run member walls (median): meta-content-coverage 223 s, cf-workers-deploy 184 s, render-satellite 169 s, hooks:selftest 165 s, playback-probe 101 s.
- M6 (J) run-check scopes over 600 CPU-s: 105, 50.3 CPU-h; phases check.fix 64, implement 22, none 8, check.repair 7, plan.synthesis 4; labels test_changed 17, selftest 5, member-times-head 4, fix-verify-rerun 3. timings.jsonl keeps no argv, so how many equal the full suite text is not measurable.
- M7 (L) 473 of 477 merge runs overlapped no other merge run.

## Locks that bind here

- K1 FW verify-gate reporting-main-run 1a: "one run shows every failing step", foreclosed "1b stop at first failure" (FW/issues/chart/verify-gate/forks/reporting-main-run.md:27, operator 2026-10-03). FW merge-gate fail-fast 1a: core and rest lanes keep `--no-exit-on-error`, "so every failure inside a stage is listed" (FW/issues/chart/merge-gate/forks/fail-fast.md:24, operator 2026-10-10). Cancelling sibling members on first red breaks both; it is not an akrogon-side pick.
- K2 FW reporting-main-run 2a: no scheduled main run, "an outside break surfaces as red on base at the next leaf" (reporting-main-run.md:28). The base run is the only place that sentence is true.
- K3 AK base-red: "runs the exact base fresh, never reusing a receipt on the base side" (AK/issues/chart/base-red/forks/red-base-policy.md:27). The Taken text carries no reason for that line; the reason sits in slot C's pitfall P1: "Stale green receipt makes the base look green, so the leaf blocks" (AK/issues/chart/base-red/slots/red-base-policy-C.md:33). Autopilot pick, not operator words (base-red/CHART.md:34).
- K4 AK check-reruns Q1 1a: scheduling only, "passing-record reuse showed no savings" on six emdash runs (AK/issues/chart/check-reruns/forks/check-scheduling.md:22). Receipt reuse by tree landed anyway (verify.ts:398), so this lock is already superseded for whole receipts.
- K5 Operator 2026-10-24: no host caps, no one-at-a-time line, no CPU quota, no fewer workers, no seconds ceilings. FW verify-speed 1a and verify-gate 2a/2c: full suite at every merge, no selection, no nightly.

## Forks

F1 Base side of `--known-red` (verify.ts:412 runs the base with no `greenRun` check; heads get it at :398).
- O1 keep fresh. Cost 12.6 CPU-h per 11 days, 0 observed passes, 10 false main-red notices.
- O2 give the base the head's `greenRun` lookup: a base tree with a green receipt is read, not run; known-red then fails at once and the leaf goes to check.fix. One expression. Breaks: K3 as written; the K2 sentence (an outside break on main no longer shows on a base run, it shows as a head red that A cannot reproduce in check.fix). Invites: nothing new; it is the head rule applied to the base.
- O3 drop the base run entirely from merge; known-red compares head units against the newest completed receipt of the base tree, red or green. Same savings as O2 plus the 6 no-receipt cases; breaks K3 harder and loses the only fresh look at main.
- Pick O2. K3's reason (P1) guards a pass that has never happened under this suite: a base that flaked red 9 of 14 times on a green tree is measuring the suite's load, not main. Reopen K3 with that number, keep K2's intent by naming check.fix as where an outside break now surfaces.

F2 Grain of the merge receipt (one `verify` command of 14 parallel members, FW/package.json:177).
- O1 keep one receipt per run.
- O2 member receipts: `merge_checks` gains a parallel group; verify runs members concurrently in one scope each, records exit and log per member keyed by tree, skips members holding a green receipt for this tree, keeps running every red member's siblings (K1 holds). Same-tree reruns (M3, 70 runs) and base runs then cost only the red members, about 2 of 14 (M5), so roughly 35-45% of a suite instead of 100%: order 15-20 CPU-h of the 31.3 plus most of the 12.6 if F1 stays O1. Breaks: FW package.json core list moves into FW issues/config.yaml, run-verify-stages.ts loses its job, `flips` keys by tree+command (AK/src/flaky.ts:33) so flaky history restarts per member, merge-issue:77-79 wording ("receipt lists each command"). Invites: 14 scopes per run instead of 1 (permit is per run-check, so admission needs one permit for the group, not 14).
- O3 O2 plus cancel siblings on first red. Saves the 42% tail of red runs (about 35 of 82 CPU-h) but breaks K1; with 2 red members per red run B would see one. Operator-only reopen.
- Pick O2. It removes "member already green on this tree runs again" without touching K1; O3 is the single largest saving left and only the operator can take it.

F3 Full suite by hand through `run-check` (M6).
- O1 prose rule only (implement-issue SKILL.md:25, check-issue:18, merge-issue:18).
- O2 `run-check` refuses argv whose joined text equals a configured `checks` or `merge_checks` command and prints `use akrogon verify` (AK/src/run-check.ts:141). Mechanical, no new concept; verify reuses by tree, so an unchanged tree costs nothing. Breaks: a seat that wants the suite on uncommitted work (verify checks out HEAD). Invites: seats wrapping the command in `sh -c` to dodge the text match; refuse on substring of the script name instead.
- O3 O2 plus `run-check` writes a receipt for a matched command. Rejected: two writers of verify-runs.jsonl for no gain over O2.
- Pick O2. Savings unknowable until argv is recorded (M6); bounded above by 50 CPU-h.

F4 Rerun policy (merge-issue SKILL.md:79: one same-head rerun, then known-red). Under F1 O2 and F2 O2 the chain costs red members only and the base step becomes a read; no wording change needed beyond "the base side reuses a green receipt". No separate pick.

## Pitfalls

- P1 M4 says the flake tax is paid in check.fix rounds, not in known-red passes: 26 of 70 same-head reruns went green; 0 of 10 known-red base comparisons passed. Any plan that counts known-red savings as "6 min of merge wall per flake" overstates; the pass never fires.
- P2 Reds are hooks:selftest and render-satellite timeouts under the suite's own load (M5); fixture-flakes owns them. No receipt change lowers the 49% red rate; it lowers what a red costs.
- P3 Journal CPU is per scope, so member CPU is invisible until F2 O2 lands; member walls (M5) are the only split available now.
- P4 After F1 O2 the main-red notice (verify.ts:359-367) fires only when a base tree without a green receipt runs fresh; its 10 firings so far were all noise, so nothing real is lost, but K2's wording must change or the chart leaves a false sentence in force.
- P5 Tree-keyed reuse ignores environment drift (bun pin, Chrome, host); already accepted for heads since verify.ts:398 landed. F1 O2 extends that acceptance to the base; name it in the fork.

## Sources

From memory, not fetched this session: Bazel test result caching, https://bazel.build/docs/user-manual#cache-test-results (per-target cached pass keyed by inputs, `--nocache_test_results` to force); Google "Flaky Tests at Google and How We Mitigate Them" (2016), https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html (reruns mask flakes, fix the test or the harness); Nx computation caching, https://nx.dev/concepts/how-caching-works (hash of inputs keys the cached task result). All three cache at the task, not the suite, which is F2 O2.

## Is "I2 has no tradeoff" true?

No. Reusing a green base receipt changes the base-side observation in 9 of 14 cases (M4: the fresh run flaked red where the receipt was green) and silences the main-red notice path. It changed the known-red exit in 0 of the 10 observable cases, because the pass needs identical failing names and the flakes never matched. Savings are about 14 runs at ~0.6 CPU-h, 8 CPU-h per 11 days, not 20 (the 20 counted 42 "base-like" runs, most of them ordinary head runs on a main sha). Worth taking, but as a reopen of K3 with K2 reworded, not as a free change.

Last operation: recomputed M1-M7 from the journal, timings.jsonl, verify-runs.jsonl and 46 surviving logs; read verify.ts, run-check.ts, flaky.ts, land.ts, config.ts, scope.ts, the three skills, FW package.json:176-221, config.yaml, and the locks via two read-only extractors; wrote this file only.
Next: A merges maps; F1 O2 and F3 O2 are small akrogon leaves, F2 O2 needs one akrogon leaf and one framework leaf, F2 O3 and K3 need operator words.
