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
