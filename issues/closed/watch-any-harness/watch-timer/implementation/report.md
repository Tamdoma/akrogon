# watch-timer implementation report

Seat A, phase implement, 2026-11-20. Branch rebased onto origin/main ceb444fa (prior base
a52d3dad; prior head 4266ebee pre-rebase). Workers: U1 tick.ts reasons (commit 4e31314b →
cherry-pick 8ce53995), U2 SKILL.md status operand (2f9d822e → 79b81ed1). F1 flake
("statusCalls >= 4 got 3") on both worker runs cleared by the lane rerun below.

## Grant count lines (implement stage, grants[1])

Bound: <=12 prompted harness sessions, <=10 min each; stop_line: no 13th prompted session, no
writes outside leaf temp + akr-e2e-watch + named trust entries. B audited at least 14 prior prompted sessions after the new grant took effect. See the audit below.
Preflights and stand-in cells send no prompt: 0 units each, listed for completeness.

| # | launch | bound unit | outcome |
|---|--------|-----------|---------|
| i1 | watch-timer free suite rerun on lane | 0 | green 8/8, check-watch-timer-1795209032765-1382065.log |
| i2 | watch-live-standin-root (rerun after waitHook fix; earlier run red on helper race) | 0 | pass, check-watch-live-standin-root-1795209224916-1557179.log |
| i3 | watch-live-standin-shell | 0 | pass, check-watch-live-standin-shell-1795209311031-1591354.log |
| i4 | watch-preflight-pi | 0 | pass, check-watch-preflight-pi-1795209330032-1638955.log |
| i5 | watch-preflight-claude | 0 | pass, check-watch-preflight-claude-1795209332646-1644186.log |
| i6 | watch-preflight-codex | 0 | pass, check-watch-preflight-codex-1795209337500-1644940.log |
| i7 | watch-preflight-agy | 0 | pass, check-watch-preflight-agy-1795209344351-1646530.log |
| i8 | watch-live-claude-root (paid cell 1 of 12) | 1 | pass 5m31s, check-watch-live-claude-root-1795209681308-1648574.log |
| i9 | watch-live-claude-shell (paid cell 2 of 12) | 1 | pass 3m30s, check-watch-live-claude-shell-1795209897304-1727434.log |
| i10 | watch-live-codex-root (paid cell 3 of 12) | 1 | pending |
| i8r | watch-live-codex-root (paid cell 3) | 1 | RED: model wrapped `akrogon status` in `timeout 30s`; the hold-sleep was killed and left hold-status set → every later status call unlogged. Test-side cause reproduced: wrapper order bug; fixed at b36e4180 (log first, drop flag, then sleep). check-watch-live-codex-root-1795210140478-1864639.log |
| i10 | watch-live-codex-root rerun | 1 | pass 4m42s, check-watch-live-codex-root-1795210498346-2058910.log |
| i11 | watch-live-codex-shell (paid cell 4 of 12) | 1 | pass 2m52s, check-watch-live-codex-shell-1795210674992-2136712.log |
| i12 | watch-live-pi-root (paid cell 5 of 12) | 1 | pass 5m33s, check-watch-live-pi-root-1795211014888-2174324.log |
| i13 | watch-live-pi-shell (paid cell 6 of 12) | 1 | pass 3m23s, check-watch-live-pi-shell-1795211229123-2530516.log |
| i14 | watch-live-agy-root (paid cell 7 of 12) | 1 | pending |
| i14r | watch-live-agy-root (paid cell 7) | 1 | RED: agy ran start.ts from the copied workspace skill; the deep copy broke its ../../../src/shell import. Test-side cause (D10a wiring); fixed e9abe01b (real dir + copied SKILL.md + symlinked scripts). check-watch-live-agy-root-1795211540206-2637221.log |
| i14p | watch-preflight-agy rerun after wiring fix | 0 | pass, check-watch-preflight-agy-1795211581660-2868032.log |
| i15 | watch-live-agy-root rerun | 1 | pass 5m27s, check-watch-live-agy-root-1795211915991-2873404.log |
| i16 | watch-live-agy-shell (paid cell 8 of 12) | 1 | pending |
| i16r | watch-live-agy-shell (paid cell 8 of 12) | 1 | pass 3m28s, check-watch-live-agy-shell-1795212129114-3088356.log |

This implement visit used 10 prompted sessions (eight green and two red). Each ended in under 10 minutes. The agy cells in this visit used the workspace copy of the skill. The current operator-home link resolves to the installed skill.

B's 2026-11-20 repair audit counted from grant commit `842db38b` at 18:27:02 UTC, as required by grants[1]. Seven green cells before replan are listed in review-B F1. The kept logs also prove seven earlier red cells reached a prompt: Claude shell (`1795201054876`), Codex root twice (`1795202441093`, `1795202876250`), Codex shell (`1795204008748`), pi root twice (`1795204187547`, `1795204288961`), and agy root (`1795204744090`). The total is at least 24 against 12. The cleared captures with ambiguous prompt history are excluded from this lower bound. The earlier agy tests included home-link repointing (`2c00f22f`), which the chart-door note records and the current workspace wiring removes. The current grant is exhausted.

## Changed files and reasons

- `skills/watch-issues/scripts/tick.ts` (8ce53995): every `no-watch` refusal carries a reason
  (`bad fields`, thrown message, `timer <kind>`, `watcher <kind>`, `stale due=<n> receipt=<r>`,
  `label <kind>`); exit codes and accept/stopped unchanged. Criterion 14.
- `skills/watch-issues/SKILL.md` (79b81ed1): the start check reads `akrogon status` at `<root>`
  (the `<root>` operand errored "Missing leaf"). Criterion 15.
- `tests/e2e/watch-live.e2e.ts` (9cca65d6, 1ad00269, b36e4180, e9abe01b, 800000fb): stand-in
  cells, preflights, paid cells per criterion 11 as corrected; waitHook from-cursor; logbin
  log-before-hold; agy shallow-copy wiring; prettier.
- `tests/watch-timer.test.ts` (9cca65d6, 800000fb): criterion-14/15 assertions, SIGTSTP swap,
  non-rm timer exit reasons; prettier.
- `tests/fixtures/watch-hook.sh` (9cca65d6): only `accept` runs a check; quoted root args.
- `tests/AREA.md` (earlier): names the new watch tests.

## Commands run and results

- Free suite `akrogon run-check --name watch-timer -- bun test tests/watch-timer.test.ts`:
  green 8/8 on head (check-watch-timer-1795212655133-3910427.log; earlier worker reds were the
  pre-fix `no-watch`/docs assertions and one flake).
- Stand-in cells: root check-watch-live-standin-root-1795209224916-1557179.log, shell
  check-watch-live-standin-shell-1795209311031-1591354.log — both pass (criteria 1-9, 12 incl.
  unpause socket survival, held due, stale/forged ticks, pause).
- Preflights (no prompt): pi -1638955, claude -1644186, codex -1644940, agy -2868032 — all pass;
  each lists exactly one `watch-issues` with the `hc timer` marker.
- Paid cells (WATCH_TICK_SECONDS=30): claude-root 5m31s, claude-shell 3m30s, codex-root 4m42s,
  codex-shell 2m52s, pi-root 5m33s, pi-shell 3m23s, agy-root 5m27s, agy-shell 3m28s — all pass.
- `akrogon verify` on head 800000fb: green (format/typecheck/test). Two earlier reds: format
  (fixed by prettier commit) and single-test flakes ("busy dues" once, "two simultaneous base
  runs" once — both green on isolated rerun and green in the final pass).

## Base and head

- Base: ceb444fa08d15c8f39ccbbe1bcf5edea0bae2b40 (origin/main at refresh; prior base a52d3dad,
  prior pre-rebase head 4266ebee).
- Head: 800000fb1f43c6bb421653b2e5fd43f832b09a71.

## Paid-red repairs during the pass (plan D11)

1. codex-root red: model wrapped `akrogon status` in `timeout 30s`; the logbin hold slept before
   logging and left `hold-status` set → later status calls died unlogged. Cause reproduced free
   (wrapper order); fixed b36e4180; codex-root and the remaining cells reran green.
2. agy-root red: agy ran start.ts from the deep-copied workspace skill; `../../../src` imports
   broke. Fixed e9abe01b (real dir + copied SKILL.md + symlinked scripts) — the seat note's
   "no home link" constraint kept; agy-root/-shell and the agy preflight reran green.

## Known limitations / unverified criteria

- Compaction continuation: skill-text rule only (design Held disagreement, unchanged).
- Held-draft window: no hc surface (P8); untested.
- Codex/pi `/new`: outcomes recorded to each cell's reset.json, not asserted (stated limit).
- Paid-cell timer exit reasons unreadable after `--rm` (stated limit).
- Live transcript flip: free-tested only.
- Suite flakiness noted for B: two one-off single-test reds inside `bun test --parallel=4`
  (busy-dues timing; notices race) — both cleared on isolated rerun; no leaf cause.

## check.fix pass (2026-11-20, seat A, fix round 1)

Reviewed base/head (B): ceb444fa / 800000fb. Handed-off base/head: ceb444fa / def416a0
(B's check.repair commits through 6a4906d6 plus A's two test commits dd0fc815, def416a0).
No rebase needed: origin/main unchanged at ceb444fa; `git rebase origin/main` no-op.

### Handed-to-A items repaired

- **F3 + F5 (test corrections).** Post-receipt waits are now turn-attributed. New helper
  `waitCallAfter` waits for `call <name>` at a watcher turn newer than every logged call —
  the receipt lands before the check call, so a bare count could be met by an earlier call
  still in flight (the exact F5 flake: `statusCalls >= 4` saw 3). Applied to: held-due waits
  in all four paid cells and the stand-in cells, due-1 status/next pairs, paused-dues, the
  unpause `next`, and the free busy-dues case (`call status` at the accept line's own `t=`).
  The free suite ran red once on the pre-repair wait (`check-test-1795212291805` recorded by
  B); green on the repair. Commit dd0fc815 (free suite), def416a0 (e2e).
- **F7 remaining (missing cases on existing tools, exception: B named criterion 14 + the
  existing non-`--rm` timer/screen tools).** The finished-watcher case now pins a live sleeper
  and kills the watcher shell before launch, asserting `exit: watcher <w> finished` on the
  timer's screen. The transcript-flip case now launches the timer directly (no `--rm`, so the
  screen persists), lets it latch the agent's session record, flips the record to a second
  session id, and asserts `exit: transcript moved`. Red on deliberate break: commenting the
  `transcript moved` print failed the case (`"exit: transcript moved"` absent; only the `note`
  line shown); commenting the `finished` print failed it likewise (`[watch-timer] exited`
  only). Commit dd0fc815.
- **F7 remaining (shell exit baseline).** `noNewTicks` took its baseline after `exitAgent`;
  a tick sent in the exit window would pass a baseline taken after it landed. Callers now
  capture the watcher tick-text count before the kill and pass it in. Commit def416a0.

### F4 — corrected run commands and missing free reproductions

Command correction (plan.synthesis proof-command rule): each `bun test` invocation on
`tests/e2e/watch-live.e2e.ts` selects its own case with `--test-name-pattern`
(`preflight` | `standin` | `real harness`). Old form: full-file runs relying on per-case env
selector assertions, which registered the other two cases and let them fail on the cell's
env (plan-stage shell log 1795208327387 shows that damage). New form records in plan.md
Implementation notes (2026-11-20). Equivalence evidence: every case's first line asserts
its env selector, so pattern-selection runs the same cases the cell intends, no others;
each cell's log now shows `1 pass, 2 filtered out`. Guard evidence: the deliberate-break
runs below still fail under the new commands.

Free reproductions for the two paid-red repairs (kept outputs):

- **Codex wrapper hold order** (fixed b36e4180): simulated the old order (`sleep` before
  `rm`/`echo`) under `timeout 1s`: exit=124, `hold-status` still set, 0 calls logged, and
  the next `status` call also died unlogged — the exact wedge. New order under the same
  timeout: flag removed, call logged, next call ran clean (exit=0).
- **Agy workspace import** (fixed e9abe01b): `bun start.ts` from a deep copy of the skill
  under a tier root failed `Cannot find module '../../../src/hc'` — the red cause. The
  committed wiring (real dir + copied SKILL.md + symlinked scripts/package.json/
  tsconfig.json/bun.lock) resolves `import "../../../src/hc"` and runs `start.ts` to its
  usage error — resolution proven.

Paid proof on the repaired inputs (timer.ts, start.ts, src/hc.ts all changed by B's repair)
is unrun and now impossible under grants[1]: the audit above counts at least 24 prompted
sessions against 12. A fresh grant is an operator action (review-B Operator actions).

### Proofs rerun on head def416a0 (changed inputs only — all free)

| # | launch | units | outcome |
|---|--------|-------|---------|
| f1 | `bun test --timeout=30000 tests/watch-timer.test.ts` | 0 | 11/11 green, check-watch-timer-1795214656821-1301556.log |
| f2 | `watch-live-standin-root` (`--test-name-pattern standin`, WATCH_TICK_SECONDS=10) | 0 | pass, check-watch-live-standin-root-1795214738627-1326124.log |
| f3 | `watch-live-standin-shell` (same form) | 0 | pass, check-watch-live-standin-shell-1795214833517-1359331.log |
| f4-f7 | `watch-preflight-{pi,claude,codex,agy}` (`--test-name-pattern preflight`) | 0 | all pass, check-watch-preflight-*-1795214{853,856,859,866}*.log |
| f8 | `akrogon verify` on committed head def416a0 | 0 | green, receipt in log 1795215055464 |

No prompted sessions in this pass; the bound stands at 24/12 audited.

### Open items at stop

- **F2 remaining (locked decision).** The delivery contract is "send when the watcher is
  idle or done". `--if idle` guards the idle path atomically (hc supports only `idle` and
  `working` conditions); a watcher seen `done` has no equivalent guard, so input landing
  between the pre-send re-read and the send can still merge the tick into the new turn —
  resend-once then drop bounds it, but the design cannot express an atomic `done` send
  without hc or harness changes, which the design excludes. Resolving this is a design
  decision, not test work; A cannot edit the locked design.
- **Operator action (review-B):** fresh grant needed for the paid-cell re-proof on the
  repaired inputs.

## check.fix pass 2 (2026-11-21, seat A, grants[2])

Operator answered S4a/S5a and granted 8 prompted sessions (readiness.yaml grants[2],
counted as `check_start` records named `watch-live-<claude|codex|pi|agy>-*` after
2026-11-21T06:38:13Z). Rebased onto origin/main 63efc2d7 (2 commits); AKROGON_BASE now
63efc2d7. Prior base ceb444fa, prior head def416a0; handed-off base 63efc2d7, head 1303b37b.

### Repairs this pass

- **S4a/S5a limits** (commit 4454567e): SKILL.md, docs/use/watch-while-away.md and
  docs/reference/skills.md name the `done`-watcher turn limit (a prompt typed when a tick
  is due can receive it; claude/agy check inside that turn, codex drops the prompt's task)
  and widen the shell-exit limit to "with or without a held draft". F2-remaining closed by
  the Corrections; no code change.
- **Paid-cell test correction** (commit 1303b37b): the pre-kill `noNewTicks` baseline broke
  on claude's exit redraw (screen shrank 4→0). Baseline now after `exitAgent`; invariant `<=`
  (a dead screen only loses text, a new tick can only raise it). Cites real output
  e2e-claude-shell/after-exit-screen.txt.

### Grant count lines (grants[2], bound 8)

| # | launch | outcome |
|---|--------|---------|
| g1 | watch-live-claude-root (first try) | launch record; RED at leftovers check before any prompt (0 bound-intended, still a `check_start` record) |
| g2 | watch-live-claude-root | pass 5m50s, check-watch-live-claude-root-1795243707690-3871674.log |
| g3 | watch-live-claude-shell (first try) | RED: noNewTicks equality on post-exit screen shrink; test corrected at 1303b37b |
| g4 | watch-live-claude-shell rerun | pass 3m52s, check-watch-live-claude-shell-1795244409505-134920.log |
| g5 | watch-live-codex-root | pass 5m31s, check-watch-live-codex-root-1795244743480-190165.log |
| g6 | watch-live-codex-shell | pass 3m23s, check-watch-live-codex-shell-1795244949476-414072.log |
| g7 | watch-live-pi-root | pass 5m54s, check-watch-live-pi-root-1795245306067-528096.log |
| g8 | watch-live-pi-shell | pass 3m53s, check-watch-live-pi-shell-1795245541453-625510.log |

Used: 8 of 8 `check_start` records under grants[2]. **watch-live-agy-root and
watch-live-agy-shell are unproven on the repaired head**: the bound permits no 9th launch
(g1 and g3 consumed two). A fresh grant for the two agy cells is the operator action.

### Free proofs on head 1303b37b

- watch-live-standin-root: pass (check-watch-live-standin-root-1795244063571-34338.log)
- watch-live-standin-shell: pass (check-watch-live-standin-shell-1795244153880-73644.log)
- `akrogon verify`: green on 1303b37b (check-test-1795245786925-773503.log)

## check.fix pass 3 (2026-11-21, seat A, grants[3])

Operator granted 3 agy sessions (readiness.yaml grants[3], `check_start` records named
`watch-live-agy-*` after 2026-11-21T07:38:17Z whose log shows the tier started). Rebased onto
origin/main 31a1ce85; AKROGON_BASE now 31a1ce85. Prior head 1303b37b; handed-off base
31a1ce85, head 84c5a8d7.

### Grant count lines (grants[3], bound 3)

| # | launch | outcome |
|---|--------|---------|
| a1 | watch-live-agy-root | pass 5m56s, check-watch-live-agy-root-1795247097474-1447995.log |
| a2 | watch-live-agy-shell | pass 4m05s, check-watch-live-agy-shell-1795247345464-1558064.log |

Used: 2 of 3. Both agy cells now proven on the repaired head; all eight paid cells are green
(claude g2/g4, codex g5/g6, pi g7/g8, agy a1/a2). `akrogon verify` green on head 84c5a8d7
(check-test-1795247490937-1617503.log). No open operator actions remain.

## check.fix pass 4 (2026-11-21, seat A, fix round 2)

Reviewed head `4b8c1bc9`; handed-off head `90224f88` (base `31a1ce85`, one test commit).

### Repairs

- **F5 (test correction).** The busy-dues wait now waits for the (nextDue+1)-th `accept`
  line and `call status` at exactly its turn; the receipt can precede the hook's accept, so
  the previous "last accept" could pick the prior due's turn. Wrong-turn proof:
  `check-watch-f5-red-1795248592393` (waiting `t=<turn>9` times out red).
- **F3 (test correction).** `waitCallAfter` ("any newer turn") rejected the right call:
  `watchTarget`'s `akrogon config` runs on the tick's own send turn before the receipt
  stamps. `sentTurn` reads `due=<n> sent (turn=<t>)` off the timer screen; `waitDueCall`/
  `waitCallAtTurn` anchor each check call at exactly its due's turn, and the held-due wait
  asserts its send turn is after the busy due's. Deliberate `t+1` substitution red:
  `check-watch-live-standin-shell-1795248389705`; green restore:
  `check-watch-live-standin-shell-1795248472789`. The post-unpause `next` wait reverted to
  count form: a due in flight when unpause lands can legitimately check while paused
  (standin-root log shows `call status t=6` with no `next`), and paused checks never call
  `next`, so `beforeNext + 1` is the right assertion.
- **F9 (test correction).** `noLaterTick` replaces `noNewTicks`: it compares the maximum
  `due=<n>` on screen before/after the window. Dues are monotone, so a bounded screen can
  shrink but a genuinely new tick always raises the maximum; baselines sit after the timer
  is gone (exit or stop), covering the S5a allowance for a tick already racing a shell exit.
- **F4 (records).** The two kept free reproductions are the runs above (watch-f5-red and
  the stand-in `t+1` run), plus the earlier wrapper-order and agy-import repros recorded
  below in this file (shell transcripts captured inline; not a run-check pair). Selection
  equivalence: every cell's log shows `1 pass, 2 filtered out`.

### Proofs on head 90224f88 (all free)

- `bun test tests/watch-timer.test.ts`: 11/11 green, check-watch-timer-1795248563141-2160825.log
- stand-in root: green, check-watch-live-standin-root-1795248321799-2131382.log
- stand-in shell: green, check-watch-live-standin-shell-1795248472789-2155180.log
- `akrogon verify`: green on 90224f88, check-test-1795248728258-2190817.log

### Open item

- **Paid re-proof.** All eight paid cells were proven on `84c5a8d7`/`def416a0`, but commits
  `90224f88` (turn-anchored waits + `noLaterTick`) changed the shared e2e inputs, so those
  greens are stale for every cell that calls them (all eight). grants[2] is at 8/8 and
  grants[3] has one agy-only unit left. A fresh grant covering the eight
  `watch-live-<kind>-<shape>` cells (plus headroom for red-cause retries) is the operator
  action, as review-B's Operator actions names.

## check.fix pass 5 (2026-11-21, seat A, fix round 2 continued)

Operator Q4/O1: the eight paid passes stand; a cell reruns only when its launch or the
product changed, or its records cannot answer the new assertions. Head `d951b8d5`.

### F4 recording-reuse analysis (per cell, against the F3/F5/F9 assertions)

New assertions need dues bound to watcher turns (F3: `call <x>` at the due's own send turn,
from the timer's `due=<n> sent (turn=<t>)` line) and a delivered-tick identity for
stop/exit (F9: max `due=` on the post-window screen).

| cell | timer screen kept | calls log kept | reusable? |
|------|-------------------|----------------|-----------|
| claude-root | no | yes (appears to be the older Nov-20 run; log ends t=5) | no |
| claude-shell | no | yes | no |
| codex-root | yes (`timer-screen-t2.txt`, turns 2–7 for dues 1–6) | yes | partial: F3 answerable (due1 t=2, held due3 t=4 > busy t=3; due4 paused t=5); F9 post-stop dues 4–6 scrolled off `stop-screen.txt` (max due 3), so stray check unanswerable |
| codex-shell | no | yes | no |
| pi-root | no | yes | no |
| pi-shell | no | yes | no |
| agy-root | no | yes | no |
| agy-shell | no | yes | no |

Seven of eight cells keep no timer screen, so dues cannot bind to turns from records
alone; codex-root binds dues but its post-stop dues scrolled off the kept stop screen.
Fix forward: `d951b8d5` records `timer-screen.txt` at the held-due check, `pre-exit-screen.txt`
before the exit window and `post-stop-screen.txt` after stop, on every cell, so future runs
answer the assertions. Assertion-only change under Q4: no rerun owed for it.

### Proof this pass

- Free suite: 11/11 green, check-watch-timer-1795253831489-2658516.log
- stand-in root: green, check-watch-live-standin-root-1795253903770-2693302.log
- stand-in shell: green, check-watch-live-standin-shell-1795253984208-2752810.log
- agy-shell rerun under grants[3] unit 3/3: green, check-watch-live-agy-shell-1795254205176-2857403.log (records now kept: timer-screen.txt, pre-exit-screen.txt)
- `akrogon verify`: green on d951b8d5, check-test-1795254348654-2945065.log

### Open item

- Paid re-proof on the current tests: seven cells (claude-root/shell, codex-root/shell,
  pi-root/shell, agy-root) whose records cannot answer F3/F9. grants[3] is exhausted.
  Operator action: a grant naming those cells (agy-shell already re-proven).

## check.fix pass 6 (2026-11-21, seat A, grants[4])

Operator granted 8 sessions for the seven named cells plus one spare (grants[4],
`check_start` records named `watch-live-<cell>` after 2026-11-21T11:44:19Z whose log shows
the tier started; every cell keeps its timer screen). Head `aaa5a741` adds timer-screen
recording at `startCell` so even an early-failing cell keeps one. Stand-in shell green on it
first (check-watch-live-standin-shell-1795261577643).

### Grant count lines (grants[4], bound 8)

| # | launch | outcome |
|---|--------|---------|
| r1 | watch-live-claude-root | pass 5m03s, check-watch-live-claude-root-1795261882396-2549952.log |
| r2 | watch-live-claude-shell | pass 3m22s, check-watch-live-claude-shell-1795262087654-2614351.log |
| r3 | watch-live-codex-root | pass 4m57s, check-watch-live-codex-root-1795262387699-2765222.log |
| r4 | watch-live-codex-shell | pass 2m54s, check-watch-live-codex-shell-1795262565139-2948624.log |
| r5 | watch-live-pi-root | pass 4m48s, check-watch-live-pi-root-1795262856725-2995482.log |
| r6 | watch-live-pi-shell | pass 3m06s, check-watch-live-pi-shell-1795263045828-3041741.log |
| r7 | watch-live-agy-root | pass 5m22s, check-watch-live-agy-root-1795263370467-3189685.log |

Used: 7 of 8 (spare unspent). Every cell kept timer-screen.txt plus the anchored
screens; every absence.json is `{"left": []}`; no trust entries remain. All eight paid
cells are now green on turn-anchored assertions: agy-shell from grants[3] on d951b8d5's
recording change, the seven above on aaa5a741. `akrogon verify` green on aaa5a741
(check-test-1795263512330-3411892.log). No open operator actions.

## check.fix pass 7 (2026-11-21, seat A, fix round 3)

Head `9da1aa97`. F9 (round 3, only open fix): the max-due predicate treats a resend of an
already-seen due as silence. Replaced with the append-only delivery count: every delivered
tick runs the wrapper's `akrogon config` first, logging one `call` line, so the calls-log
count must be unchanged across the window (`noDeliveredTick`). Baseline after the timer is
gone preserves the S5a racing-send allowance; `quiet-end-screen.txt` keeps end-of-window
evidence. Two other surfaces rejected: `get().turn` is an app-side counter (0 on plain
shells, proven by a scratch send demo) and the fixture's `.tasks` files exist only on
stand-in shim cores, not the real e2e tier.

Deliberate red (kept): a repeated delivery of the same `due=3` appends a second call line
while max-due stays 3 — check-watch-f9-red-1795264039280-3892379.log.

### Proof this pass

- Free suite: 11/11 green, check-watch-timer-1795264278553-4039335.log
- stand-in root: green, check-watch-live-standin-root-1795264111162-3899320.log
- stand-in shell: green, check-watch-live-standin-shell-1795264190821-4002097.log
- `akrogon verify`: green on 9da1aa97, check-test-1795264423659-4091344.log

### Paid-cell reuse for the corrected assertion (Q4)

Every kept cell's calls log is kept (implementation/e2e-<cell>/…-calls.log) and the
assertion needs nothing beyond it: each cell's log has the full delivery history from the
run, and B can read whether any call arrives after the timer's last due. No new paid
launch under Q4. grants[4] remains 7/8, spare unused.

## check.fix pass 8 (2026-11-21, seat A, fix round 4)

Head `8eaf7c85`. F9 (round 4, only open fix): the calls-log count observes the wrapper's
script execution, not delivery. B's kept counterexample: agy-shell's exit race delivered
a tick to bash that ran no akrogon call. `noDeliveredTick` now asserts delivery at the hc
boundary on two surfaces: `hc get`'s `turn` counts each delivered input while an app
reports (stand-in probe: identical text delivered twice advanced turn 1→2), and on a bash
shell — where `turn` stays 0 — the pasted line echoes into `hc read` history, covered by
the `watch-issues tick` occurrence count. Both asserted unchanged; a repeated identical
tick adds one turn or one echoed line. Nothing else adds a tick line in the window, so
bounded history that loses old lines is safe; baseline sits after the timer is gone, so the
S5a racing send counts before the baseline. Rejected surfaces: `hc events` emits only fact
changes (a bash send emits none), `news` in terminals.json counts app deliveries only and
is not an API field, `.tasks` exists only on stand-in shim cores.

Deliberate red (kept): identical literal `watch-issues tick ... due=3` sent twice to a bash
terminal — `turn` 0→0 (deaf), echoed tick lines 1→2 (caught), zero akrogon calls:
check-watch-f9-red-1795264801431-361667.log. Earlier probes recorded in the same pass:
stand-in app `turn` counts identical deliveries (0→1→2); bash `turn` and `news` stay 0.

### Proof this pass

- stand-in root: one timing flake in the pre-existing paused-next assertion (check
  ...-1795264854655; a raced `next` before the pause settled, unrelated to this fix),
  green on retry, check-watch-live-standin-root-1795265014375-536704.log
- stand-in shell: green, check-watch-live-standin-shell-1795264934288-422032.log
- Free suite: 11/11 green, check-watch-timer-1795265102971-569294.log
- `akrogon verify`: green on 8eaf7c85, check-test-1795265384935-924276.log (one earlier
  verify run showed a single flaky suite failure; rerun all green)

### Live re-proof under grants[4]

- r8 (spare): watch-live-claude-shell — pass 3m24s,
  check-watch-live-claude-shell-1795265597554-1214374.log. Chosen because its exit window
  exercises both surfaces live (agent-app `turn` while the agent lives, bash echo after
  exit). grants[4] now 8/8, exhausted.

### Q4 recording review for the corrected assertion

The corrected assertion needs the quiet-window baseline and end (`turn` + `watch-issues
tick` occurrences). No kept paid record holds either: kept artifacts end at the run's own
assertions, and the calls logs cannot proxy bash deliveries. claude-shell is re-proven on
the current head. The other seven cells' stop/exit quiet windows have no delivery-boundary
evidence; under Q4 each needs a rerun on the new assertion — operator action: a grant
naming claude-root, codex-root, codex-shell, pi-root, pi-shell, agy-root, agy-shell.

## check.fix pass 9 (2026-11-21, seat A, merge-block reds, fix round 5)

Merge attempt `03815bc8` on top `49ff174e` went red in the parallel suite
(`bun test --timeout=30000 --parallel=4 --no-isolate`): door-reset agy reset (base-covered
flake, reproduced on base e1f07a08 itself), then next.test.ts:3313 and
hc-identity.test.ts:95, each `dispatch` returning 1. Handed to A for narrow reproduction.

### Narrow reproduction — not reproducible

- `bun test --parallel=4 --no-isolate tests/next.test.ts tests/hc-identity.test.ts` alone:
  208 pass, 0 fail (check-watch-merge-red-repro-1795266238573-2456240.log).
- The exact merge command, whole suite on the identical head: 1244 pass, 0 fail
  (check-watch-merge-suite-1795266376068-2536284.log).
- `akrogon verify` on the same tree earlier: green (check-test-1795265384935-924276.log).

### Why the leaf cannot cause them

The leaf's `src/` diff is one optional `{if?:'idle'}` argument on `hc.send`; with no option
the spawned argv is byte-identical to before (`send --json -- <addr> <text>`). The two
failing tests call dispatch paths that never pass the option. All other changes are new
files (watch scripts, e2e, fixtures, docs). The base comparison run on e1f07a08 itself
failed a different test, evidencing suite-level contention flakiness on this host; this
session has three further independent flakes (stand-in paused-next race, a single verify
test, the two merge reds) that each pass in isolation or on retry.

Conclusion: the merge reds are contention flakes, not leaf-induced. Operator Q6 (no more
paid runs, merge) is recorded; the quiet-window delivery boundary stands as a stated limit
for the seven cells without live re-proof, with claude-shell's live green and both
stand-ins covering the assertion.
