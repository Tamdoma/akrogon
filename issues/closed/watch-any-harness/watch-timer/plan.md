# Plan: watch-timer

Slot A re-plan synthesis, 2026-11-20, under `design.md` Corrections (issues/chart/watch-live-speed
forks/disposition.md Taken 1-8, Probes P1-P3, Corrections 1-3) and `brief.md` Corrections (criteria
4 restated, 11 replaced, 12-15 added). Sources: `brief.md`, `design.md` (items 1-10, corrections
1-4, exclusions), `readiness.yaml` grants, chart proofs P1-P13
(`issues/chart/watch-any-harness/forks/timer-design.md`) and P1-P3
(`issues/chart/watch-live-speed/forks/disposition.md`), live surfaces below.

This pass: the branch keeps the committed product code. The plan seat rewrites the tests so each
defect test runs red against that code; product fixes land at implement. Open-for-the-plan items
from the design are settled at D2, D3, D16.

## Read-first paths

- `skills/watch-issues/SKILL.md` — current skill; needs the criterion-15 fix (`akrogon status <root>`
  → `akrogon status` at `<root>`); everything else stays.
- `skills/watch-issues/scripts/` — committed scripts: `timer.ts` (due engine, reason printing),
  `start.ts`, `stop.ts`, `tick.ts` (needs criterion-14 refusal reasons), `hc.ts`, `repo.ts`,
  `proc.ts`, `observe.ts`, `log-tail.ts`.
- `src/hc.ts` — `terminals`, `terminal`, `send`, `label`, `repoSpace`, `waitFor`, `HcError`;
  `hcEnv` strips terminal vars (untagged sends from the timer; scripts/hc.ts keeps them for
  `hc run` parenting and `hc get`).
- `src/transcript.ts` — `transcriptFor` (resolution over seat pids; the timer's exit key).
- `src/config.ts` — `readRepo`; `src/shell.ts` — `spawnCaptured`, `command`.
- `tests/watch-timer.test.ts` — free mechanical suite on `hcFixture` cores (criteria 1-10, 14, 15).
- `tests/fixtures/watch-agent.sh`, `tests/fixtures/watch-hook.sh`, `tests/stand-in.sh` — watcher
  program and model-playing hook; the hook also plays the model for stand-in tier cells.
- `tests/hc-fixture.ts`, `tests/helpers.ts`, `tests/isolation.ts` (suite TMPDIR/home isolation).
- `tests/e2e/watch-tier.ts` — `startWatchTier`, `stopWatchTier`, `observeReady` (criterion-12
  worktree folder already committed); `tests/e2e/tier.ts` — `answerTrust`, `realHome`,
  `realRuntime`, `required`.
- `tests/e2e/watch-live.e2e.ts` — the live file this plan rewrites (stand-in cells, preflight
  cells, paid cells).
- `docs/use/watch-while-away.md`, `docs/reference/skills.md`, `docs/pictures/watch-loop.svg`,
  `tests/AREA.md`, `skills/AREA.md` — the doc set the docs gate reads.
- Leaf folder: `implementation/report.md` (grant count lines and cell log), `readiness.yaml`
  grants[1].

## Decisions

- D1 — Product diff at implement is small: `tick.ts` prints a reason on every refusal
  (`no-watch <reason>`), `SKILL.md` drops `<root>` from the one `akrogon status` line. `timer.ts`,
  `start.ts`, `stop.ts`, `hc.ts`, `repo.ts`, `proc.ts`, `observe.ts`, `tests/e2e/watch-tier.ts`
  stay as committed (Corrections item-4 product fixes already landed at 6bc522ef, f74358cf).
- D2 — Open-for-the-plan (design item 2, identification rule): settled by the design's own
  Correction 1 — `start.ts` pins the watcher terminal's `foreground.pid`, required to be an
  ancestor of the start step (committed; holds in root and shell shapes per P11/P12).
- D3 — Open-for-the-plan (design leaf architecture, `hc run`/`hc get` route): settled as committed —
  scripts/hc.ts keeps the caller's terminal env so `hc run` default-parents and `hc get` resolves;
  `send`/`terminals`/`label`/`repoSpace` reuse `src/hc.ts` (untagged env). No src/ change.
- D4 — tick.ts outcome lines (criterion 14): `accept`, `stopped` unchanged; every refusal prints
  `no-watch <reason>` exit 1: missing/unparseable `timer=`/`pid=`/`due=`/root
  (`bad fields`), `watchTarget` failure (the thrown message), timer dead/unverified/foreign or
  parent ≠ caller (`timer <state|kind>`), own foreground unreadable (`watcher <kind>`),
  `due <= receipt` (`stale due=<n> receipt=<r>`), receipt write failure (`label <kind>`). The
  trailing `catch` binds `error.message` into the line so no catch-all hides it.
- D5 — Timer exit reasons (criterion 14, timer part): committed timer prints each new failed-read,
  skipped-send, failed-send and exit reason to its own output. Free tests launch timers without
  `--rm` and read the screen for each reason; paid cells use `--rm` (stated limit: the reason is
  not readable after removal).
- D6 — Live file shape (criterion 11 as replaced): `tests/e2e/watch-live.e2e.ts`,
  `AKROGON_E2E=watch-live`, `AKROGON_E2E_KIND=<claude|codex|pi|agy|standin>`,
  `AKROGON_E2E_SHAPE=<root|shell>`; `AKROGON_E2E=watch-preflight` with `AKROGON_E2E_KIND` for the
  no-prompt cells. Each cell is its own `run-check` with its own tier, registered root and
  `AKROGON_E2E_OUT` folder; `AKROGON_E2E_ROOT` must resolve under `os.tmpdir()` (writes rule) and
  the file refuses otherwise.
- D7 — Skill loading per cell (criterion 13): claude → `<root>/.claude/skills/watch-issues`
  symlink + `--setting-sources project,local`; codex and agy → `<root>/.agents/skills/watch-issues`
  symlink, codex launched with `-c skills.config` disabling each user `watch-issues` SKILL.md
  path that exists (`~/.codex/skills`, `~/.agents/skills`); pi → `--no-skills --skill <leaf>`
  (P1). No home skill file is touched anywhere (writes rule; P1 proves agy's workspace copy
  shadows the global one). The SKILL.md description marker `hc timer` identifies the leaf copy.
- D8 — Stand-in cells (free, no prompt): `kind=standin` launches `fake --model work`
  (`tests/stand-in.sh` via the tier's standinBin) as the watcher, root shape as the terminal's
  program and shell shape typed into `bash` through a launch script. A copy of
  `tests/fixtures/watch-hook.sh` at `$STANDIN_DIR/hook` plays the model: runs `tick.ts`/`start.ts`/
  `stop.ts`, stamps the receipt before the check, then `akrogon status` and `akrogon next --all`
  through the tier's logging wrapper (`call status`/`call next --all` with `t=<hc turn>`).
  Root shape covers: start + check + timer verification, second start (one check, still one
  timer), per-due tick with receipt and `next` for the waiting leaf, the held due, `stop`,
  repeated stop, restart, the old-address tick refused, the old cron tick refused, forged pid
  (timer stopped), stale due refused, `akrogon pause` + `unpause` (criterion 12: the socket keeps
  answering and dues keep flowing), agent-as-program exit ending the timer. Shell shape covers:
  the space root, paused start + paused check, `unpause` + acting check, the held due, agent exit
  leaving no new tick text in the shell. `startWatchTier`'s disjointness is asserted once
  (worktree folder outside root, runtime and helper folders — criterion 12).
- D9 — Paid cells (criterion 11 verbatim, `WATCH_TICK_SECONDS=30`):
  shape=root per kind: launch as the terminal's program → `watch-issues <root>` → one status call,
  one verified labelled timer `aw-watch` parented to the watcher, argv running the leaf's
  `timer.ts` by absolute path with the watcher's foreground pid → `waitDue(1)` → one status call
  plus `next` for the waiting leaf → `hold-status=75` (2.5 intervals) → the next due falls behind
  the busy check and runs once after it (`waitDue(2)`, exactly one `due=2 sent` line on the timer
  screen, one more status call) → `watch-issues stop` → timer gone and no new `watch-issues tick`
  text over a full interval → `watch-issues <root>` → new timer address → `hc keys` `/clear`
  (claude, agy: timer exits) or `/new` (codex, pi: outcome recorded to `AKROGON_E2E_OUT`, not
  asserted).
  shape=shell per kind: `pause` nothing (pause moves to the stand-in cells) → `bash` in the space
  root → launch script → trust → `watch-issues <root>` → timer + one status call → `waitDue(1)`
  → `hold-status=75` → the held due runs once → SIGTERM the agent pid → timer exits → the shell's
  screen gains no `watch-issues tick` lines over an interval+.
  Second starts, repeated stops, the old tick, pause/unpause and every refusal are stand-in cell
  proofs, per the corrected criterion's delegation.
- D10 — Preflight cells (criterion 13, free, no prompt): real tier, real launch flags, then read
  and stop before any paid turn: pi — the TUI screen shows no `watch-issues` collision warning;
  codex — `codex debug prompt-input` run under the tier env with the cell's exact
  `-c skills.config` prints a `skills` section listing `watch-issues` once with the `hc timer`
  marker (the model-visible skill list; the TUI screen is also read for errors);
  agy — `/skills` typed via `hc keys` (a client-side overlay, no prompt) lists `watch-issues` once
  carrying the marker; claude — the `.claude/skills/watch-issues` symlink resolves into the leaf
  and the screen shows no skill-load error. An empty or ambiguous list stops before any paid
  cell (Corrections: preflights send no prompt and do not count against the bound).
- D10a — agy wiring per the chart-door seat note
  (issues/chart/watch-live-speed/slots/seat-note-agy-link.md): agy 1.5.13 does not list a
  symlinked workspace skill (the first agy preflight showed only the global cron-era copy), so
  the test copies the leaf skill folder into `<tier root>/.agents/skills/watch-issues` for agy;
  every other harness keeps the symlink. `/skills` then lists exactly one `watch-issues`
  carrying the marker — the workspace copy shadows the global one.
- D11 — Run order (Corrections plan rules, binding): free preflight (typecheck, config parse,
  tier start+teardown via the two stand-in cells, D10 skill checks) → stand-in root and shell
  cells → one paid cell (claude-root) → the rest one at a time. After a paid red, no further
  paid cell until a free reproduction of the cause passes after repair; a live-only diagnostic
  launch names an observation no earlier run produced and a repeat of the known failure without
  it ends paid launches (operator-blocker stop). A rerun repeats the failed cell and every cell
  whose inputs a shared fix changed. Assertions are exact on observable effects per due (call
  counts, receipts, timer screens) and never count model commands or match model wording.
  A failed cell records the watcher screen and the timer's printed reason (or the failing
  operation and error before any terminal exists) into `AKROGON_E2E_OUT`.
- D12 — Grant accounting: `grants[0]` spent (>=26 prompted launches recorded in report.md,
  disposition Findings); `grants[1]` binds at most 12 harness sessions that receive a prompt,
  each ending within 10 minutes, stop_line = no 13th prompted session and no write outside leaf
  temp / akr-e2e-watch / named trust entries / harness session records. Plan-stage launches: 0
  paid (preflights and stand-in cells are free; count lines recorded below). Implement stage:
  8 paid cells + up to 4 reruns = 12. Any 13th prompted session is the operator-blocker stop.
  `env_names: []`, no `Missing:` lines — no credential blocker.
- D13 — Commits and trailers: every commit touching a frozen path
  (`tests/e2e/watch-check.e2e.ts`, `tests/e2e/watch-live.e2e.ts`, `tests/e2e/watch-tier.ts`,
  `tests/fixtures/watch-agent.sh`, `tests/fixtures/watch-hook.sh`, `tests/watch-timer.test.ts`)
  carries `Test-Change: <path> issues/chart/watch-live-speed Corrections …`; the dropped frozen
  path `tests/e2e/watch-check.e2e.ts` already got its empty-commit citation range covered by
  e2c7b47b's trailer on the deleting commit. Implement-stage commits fixing product files carry
  `Test-Change:` for each touched product path citing Corrections item 4 (the next freeze covers
  them). `tests/e2e/tier.ts` edits cite it too (test-matched file under the frozen-citation rule;
  it is not in the frozen record but citations keep it unambiguous).
- D14 — Writes: tests and scripts write only under `$TMPDIR` (`AKROGON_E2E_ROOT`, logbin, flags,
  launch scripts, hook copies) and the leaf folder (`AKROGON_E2E_OUT`, report.md, run-check logs).
  `dropTrust` removes only the run's own trust entries (grant-named). No `/tmp` literal path, no
  home skill link changes; the e2e file refuses an `AKROGON_E2E_ROOT` outside `os.tmpdir()`.
- D15 — Criterion-13 argv proof: every cell asserts the timer's `argv` contains the leaf's
  `skills/watch-issues/scripts/timer.ts` as an absolute path (the watcher's PATH puts the leaf
  checkout first; a foreign skill running a foreign script fails this line).
- D16 — Open-for-the-plan (design leaf architecture, exit keys per harness): the shell-shape exit
  is SIGTERM on the agent's foreground pid with a SIGKILL fallback; all harnesses take the same
  key (a real user exit is indistinguishable at process level).
- D17 — Reset keys (criterion 11 root cell): `hc keys` `/`,`c`,`l`,`e`,`a`,`r`,`enter` for claude
  and agy; `/`,`n`,`e`,`w`,`enter` for codex and pi.
- D18 — `tests/AREA.md` line 15 updated once: names `watch-timer.test.ts`, `watch-live.e2e.ts`
  with its stand-in/preflight/live cells, the fixtures, and keeps `watch-stop.e2e.ts`
  (`watch-check.e2e.ts` stays deleted). Doc set otherwise stands (criterion 10 already asserted).
- D19 — What stays unproven: compaction continuation (skill-text rule), the held-draft window
  (no hc surface), codex/pi `/new` (recorded), timer exit reasons in paid cells (`--rm` removes
  the screen — stated limit), live transcript flip (free-tested only).

## Waves

Wave 1 — two units, disjoint paths:

- U1 `skills/watch-issues/scripts/tick.ts` — D4 refusal reasons (owns tick.ts only).
- U2 `skills/watch-issues/SKILL.md` — D1/criterion-15 `akrogon status` fix (owns SKILL.md only;
  docs gate assertions already cover the rest of the doc set).

Wave 2 — one unit (needs U1+U2 green to pass reds; owns the live proof):

- U3 verification — run the free suite, both stand-in cells, all four preflights, then the eight
  paid cells in order with report.md count lines and failed-cell records (owns
  `implementation/report.md` and `implementation/e2e-*` folders only).

Not serial-solo: wave 1 holds 2 units → worker dispatch per implement-issue.

Docs affected (one line each): `skills/watch-issues/SKILL.md` (U2), `tests/AREA.md` (this plan's
test-commit edit). No other doc changes — the criterion-10 set is already written and asserted.

## Criterion → proof map

| # | Observation (boundary, before → after, failure caught) | Command | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | hcFixture core: watcher runs `start.ts` → one live `aw-watch`/`sp-watch`-named, labelled, parented timer whose argv runs timer.ts with the watcher foreground pid+start; one `call status` logged; paused start still starts. Catches: no timer, wrong parent/label/argv, missing check, ancestor refusal bypass. | `akrogon run-check --name watch-timer -- bun test --timeout=30000 tests/watch-timer.test.ts` | ~1 min | start.ts, timer.ts, verification |
| 2 | second start: +1 status call, still one timer; 2 labelled → `conflict`, calls unchanged; squatter → `conflict`. | same file | ~1 min | counting/verification |
| 3 | per-due `watch-issues tick timer=… due=n <root>` lands once per interval; `receipt=<n>` logged before `status`; space root end-to-end; no-leaf watch keeps running. | same | ~1 min | tick.ts parse, timer send |
| 4 | two dues accrue behind a held `status` call; each runs its own check (`tickLines(due)` = 1 each, receipts = dues, status calls one per due); unreceipted due → sent once, resent once, dropped, later dues continue. | same | ~1 min | due engine |
| 5 | stop from watcher and foreign terminal; repeat stop `stopped`; restart = new address; old-address tick → `no-watch`, no check. | same | ~1 min | stop.ts, parent check |
| 6 | no `timer=` / dead timer / `due<=receipt` / wrong `pid=` → refused or `stopped`, no check. | same | ~1 min | tick verification |
| 7 | pin death, pin-start mismatch, watcher finished, watcher not_found, foreground swap, transcript flip → timer exits with its printed reason; name freed. | same | ~1 min | exit predicates |
| 8 | paused: due receipts, status logged, no `call next` at the check's own turn. | same | ~1 min | paused short-circuit |
| 9 | unset `HC_TERMINAL_ID` and foreign-session watcher → `refused <reason>`, nothing changed. | same | ~1 min | refusal order |
| 10 | six doc files: no `cron`/`CronCreate`/`CronList`/`CronDelete`/`expir`; SKILL has all four harness names + `/new`/`compaction`/`draft`. | same (docs case) | seconds | doc edits |
| 11 | stand-in cells (free): the corrected criterion-11 stand-in sequence end to end on real hc through the tier incl. `akrogon unpause`. Paid cells: D9 sequences per kind×shape, observable effects only. | `akrogon run-check --name watch-live-<kind>-<shape> -- env AKROGON_E2E=watch-live AKROGON_E2E_KIND=<kind> AKROGON_E2E_SHAPE=<shape> AKROGON_E2E_ROOT=<tmp> AKROGON_E2E_OUT=<leaf>/implementation/e2e-<kind>-<shape> WATCH_TICK_SECONDS=<10|30> bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts` | stand-in ~3 min; paid ~6 min | any shared fix → all cells it touches |
| 12 | tier worktree folder disjoint from root/runtime/helpers (asserted); `akrogon unpause` inside a stand-in cell leaves `hc ls` answering and dues flowing (F2's exact failure). | same file, `watch-live-standin-*` | ~3 min | watch-tier.ts |
| 13 | preflight cells list exactly one `watch-issues` with the marker (pi: no collision; codex: debug prompt-input skills entry; agy: `/skills`; claude: link + screen); every paid cell's timer argv holds the leaf's absolute timer.ts. | `akrogon run-check --name watch-preflight-<kind> -- env AKROGON_E2E=watch-preflight AKROGON_E2E_KIND=<kind> AKROGON_E2E_ROOT=<tmp> AKROGON_E2E_OUT=<leaf>/implementation/e2e-preflight-<kind> bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts` + argv assertions in cells | ~1 min | skill wiring |
| 14 | tick `no-watch` lines carry reasons; each timer exit reason is read from the timer's own screen (direct launches without `--rm`). | watch-timer.test.ts | ~1 min | reason printing |
| 15 | SKILL.md check step reads `akrogon status` (no `<root>` operand; `status <root>` errors "Missing leaf"). | docs case in watch-timer.test.ts | seconds | SKILL.md |

Model-choice readings: criteria keep their function checks; no test binds a model's wording.
Criterion 11's live cells are read under the standing-design model-choice line: the model-facing
inputs are the `watch-issues …` texts the test sends; the recording is the wrapper call log, hc
`get` product state, timer/watcher screens and `tier.record` files under `AKROGON_E2E_OUT`; the
replaying consumer is the reviewing seat. The one `next` floor (`>=1`) is a floor on checks
acting, not on model judgment — a repeated `next` is the Judge's discretion, unasserted.

## Breakable-condition cases

Each done-criterion condition a decision can break gets a case in the same process/session where
the decision's state lives; the deliberate-break red at plan stage is the missing product edit
(`no-watch` bare, `status <root>`), recorded below.

- C14a (crit 14, D4): every refusal path of tick.ts asserts a non-empty reason — parse failure
  (old cron tick `watch-issues tick <root>`), foreign/stale timer (`timer=<old>` after restart),
  stale due (`due=1` after receipt 1), watchTarget failure (tick on an unregistered root),
  label failure traced (unreachable without breaking hc — the schema'd reply only fails when hc
  errors, covered by `timer <kind>` reason family). Red now: `no-watch` prints bare.
- C14b (crit 14, D5): each timer exit reason read from the screen of a non-`--rm` timer:
  `pinned process <pid> gone`, `replaced (start …)`, `watcher … finished`, `watcher … not_found`,
  `foreground <pid> is not the pinned`, `transcript moved`, plus `dropped:` and `send … failed`
  notes. Green at commit (the printing already landed); red evidence = the plan-stage run.
- C15a (crit 15, D1): docs case asserts SKILL.md contains `akrogon status` and never
  `akrogon status <root>` — red now (the committed text holds `<root>`).
- C11a (crit 11, D9): the held due behind a busy check — `hold-status` makes a check span ≥2
  interval boundaries; asserted: the accrued due is sent once after the check and runs one
  status call (no merge: hc turn per due).
- C13a (crit 13, D7/D15): agy cell repointing a home link is forbidden; the `.agents/skills`
  route is asserted by the preflight listing and the argv absolute path.
- C12a (crit 12, D8): worktree-folder disjointness asserted; the unpause-then-dues path is the
  socket-survival proof (red at 17:51 when the socket was deleted).
- C4a (crit 4 restated, committed fix): the free busy-dues case already proves dues send at first
  readiness, not only at a boundary (boundary-only would show due n+1 delivered a full interval
  late). Kept and run.
- C-conditions unchanged from the prior plan (ancestor pin, conflict counting, receipt-first,
  resend-once, stale due, pid stop, exits) stay proven by the existing free cases.

## Plan-stage run order (this pass)

1. Rewrite `tests/watch-timer.test.ts` (C14a/C14b/C15a assertions), rewrite
   `tests/e2e/watch-live.e2e.ts` (D6-D11), minor `tests/fixtures/*` only if the stand-in hook
   needs them for the tier (currently none expected).
2. Run `watch-timer.test.ts` → record reds (C14a, C15a; also any C14b miss) beside the criteria.
3. Typecheck the rewritten e2e file; run both stand-in cells and the four preflights free
   (count lines below); record results.
4. Commit tests with `Test-Change:` trailers; write reds into this plan; `akrogon phase
   watch-timer implement --slot A`.

## Grant count lines (plan stage, grants[1])

| # | launch | prompts sent | bound units | outcome |
|---|--------|--------------|-------------|---------|
| 1 | pi preflight (`akrogon run-check --name watch-preflight-pi`) | 0 | 0 | pass |
| 2 | claude preflight (`watch-preflight-claude`) | 0 | 0 | pass |
| 3 | codex preflight (`watch-preflight-codex`) | 0 | 0 | pass |
| 4 | agy preflight run A (`watch-preflight-agy`) | 0 | 0 | red: agy ignores a symlinked workspace skill |
| 5 | agy preflight rerun after real-copy fix | 0 | 0 | pass |
| 6 | stand-in root cell (`watch-live-standin-root`) | 0 | 0 | intended red (bare `no-watch`) |
| 7 | stand-in shell cell (`watch-live-standin-shell`) | 0 | 0 | pass |

Prior use under grants[1]: 0 prompted sessions (grant created at 19:27; all earlier launches
recorded under grants[0], now spent). This seat: 0 prompted sessions, 0 bound units. No 13th
prompted session occurred; no home file was touched (the agy wiring copies the leaf skill into
the tier root's `.agents/skills`; no home link was repointed — the chart-door restoration is
untouched).

## Plan-stage red evidence

- C14a red, free suite: case "stop kills the verified timer; stale and forged ticks run
  nothing" — the stop tick logs bare `no-watch` instead of `no-watch <reason>`:
  check-watch-timer-1795207363302-181494.log.
- C14a red, stand-in root cell: hook line `tick exit=1 no-watch t=8` for the stale forged tick:
  capture-watch-live-standin-root-302d6437-fec6-41dd-949c-d6c9c66ee4-out.log.
- C15a red, free suite: docs case — SKILL.md carries `akrogon status <root>`:
  check-watch-timer-1795207390930-194171.log.
- Stand-in root (pre-fix variant) also red at the same line; shell cell green end to end
  including unpause socket survival and agent-exit (e2e-standin-shell,
  check-watch-live-standin-shell-1795208327387-862203.log).
- Preflights green: pi check-watch-preflight-pi-1795208477688-974431.log, claude
  1795208484064-984884, codex 1795208492469-987168, agy 1795208578735-1015463.

## Known limitations

- Compaction continuation unproven (skill-text rule).
- Held-draft window untested (no hc surface, P8).
- Codex/pi `/new` recorded, not asserted.
- Paid-cell timer exit reasons unreadable after `--rm` (stated limit).
- Live transcript flip unproven (free-tested only).

## Restart boundaries

Each live cell is one run-check; a rerun starts at `startWatchTier`'s leftovers check. The free
suite reruns whole-file; stand-in cells share nothing between shapes. A slow-run leaf boundary
note: no cell continues from another's state; a killed cell leaves `absent()` clean or fails the
next cell's leftovers check.

## Implementation notes

- 2026-11-20 B check.repair: Exercise the simultaneous timer claim before validating the winning holder, as design item 6 Corrections 3–4 require.
- 2026-11-20 A check.fix: Every cell and preflight of `tests/e2e/watch-live.e2e.ts` runs with `--test-name-pattern` naming its own case (`preflight`, `standin`, `real harness`), because all three cases register unconditionally and assert their env selectors. Executable check: a cell's run log shows `1 pass, 2 filtered out`.
- 2026-11-20 A check.fix: Post-receipt waits in live cells are attributed by watcher turn (`waitCallAfter`: a `call <name>` at a turn newer than every logged call), because the receipt lands before the check call and a bare count can be satisfied by an earlier call still in flight (review-B F3/F5). Executable check: `bunx tsc --noEmit` and the stand-in cells pass.
