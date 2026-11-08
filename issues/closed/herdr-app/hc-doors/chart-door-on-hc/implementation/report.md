# Implementation report: chart-door-on-hc

## Grant use (readiness.yaml grants[0])

Bound: at most 9 harness sessions (every harness session the leaf's live runs start, whatever its outcome); at most 4 prompts per session. Prior use read from plan.md: 0 at planning. Count lines are written before each launch and completed after it.

Recorded cwds (grant naming, written before use): `/var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-claude`, `-codex`, `-pi` (criterion 4); the door and consultant of criteria 6 and 2 run in the scratch repo `/var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-root`.

Count lines (grants[0], bound 9 harness sessions, unit: one harness session started by a live run):
- launch 1 of 9 (prior 0): criterion 4 claude A, claude-haiku-5-5 low, cwd /var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-claude. Outcome: hc t9, 4 prompts (task, run-helper, warm-up, start); every helper stage passed, start prompt reached claude as the skill command; killed after the check. Cost not shown.
- launch 2 of 9 (prior 1): criterion 4 codex A, gpt-6.1-sol low, cwd /var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-codex. Outcome: hc t10, 4 prompts; every helper stage passed, but codex rejected the `/chart-issues` start prompt (D9 corrected, commit below); killed after the check.
- launch 3 of 9 (prior 2): criterion 4 pi A, devin/swe-2-max low, cwd /var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-pi. Outcome: hc t11, 4 prompts; every helper stage passed, start prompt recorded as pi's last user message; killed after the check. Cost $0.000 shown by pi.
- launch 4 of 9 (prior 3): criterion 4 repeat, claude A (grant: one repeat per kind), same cwd. Outcome: hc t16, 4 prompts, every stage passed, start prompt received; killed after the check.
- launch 5 of 9 (prior 4): criterion 4 repeat, codex A, same cwd. Outcome: hc t17, 4 prompts, every stage passed, start prompt received; killed after the check.
- launch 6 of 9 (prior 5): criterion 4 repeat, pi A, same cwd. Outcome: hc t18, 4 prompts, every stage passed, start prompt received; killed after the check.
- launch 7 of 9 (prior 6): criteria 6 and 2, Claude door in auto mode with the operator's settings unchanged (claude-sonnet-5-5, medium), cwd /var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-claude (trusted in launch 1). Outcome: hc t1f, prompt 1 ran the round (start B, nudge, drop); $0.20 shown after prompt 1; prompt 2 is the repeat below.
- launch 8 of 9 (prior 7): criterion 2, consultant B started by the door (claude-haiku-5-5, low), cwd the chart folder under the same trusted cwd. Outcome: hc t1g ad-slot-b, 2 prompts (task, nudge), replied `no` twice, dropped.
- launch 9 of 9 (prior 8): criterion 2 repeat (grant: one fresh consultant for a repeat of the round, reusing the same door), consultant C started by door t1f (claude-haiku-5-5, low). Door prompt 2 of 4. Outcome: hc t1h ad-slot-c, 2 prompts (task, nudge), replied `no` twice, dropped; door total $0.27 shown after prompt 2. Bound reached: 9 of 9 sessions; no further launch.
- Warning (check.fix, 2026-11-08): launches 10 and 11 go past the grant's repeat-count bound of 9 paid harness sessions. The bound is a repeat count on a paid operation with no spend cap, and no stop_line clause stops it, so the skill's rule is warn and continue (review-B.md check.repair disposition of OA1). Operation, target (`akr-e2e-door`), identity, effects, prompt bound and stop_line are unchanged and rechecked.
- launch 10 of 9 (prior 9, past the bound, warned above): criterion 2 rerun on `3ffe7422`, Claude door in auto mode with the operator's settings unchanged (claude-sonnet-5-5, medium), cwd /var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-claude (same recorded cwd, trust entry retained). Outcome: hc t3 `ad-door`, 1 prompt (the round), no trust dialog, `auto mode on`; ran the round in 35 s; killed and removed in cleanup. Cost not read.
- launch 11 of 9 (prior 10, past the bound, warned above): criterion 2 rerun, consultant B started by the door (claude-haiku-5-5, low), same cwd. Outcome: hc t4 `ad-slot-b`, child of t3, 2 prompts (task, nudge), replied `no` twice, dropped; killed and removed in cleanup. Total use: 11 sessions against the bound of 9 (warned).

## Base and head

- Base `e3202dff` (`AKROGON_BASE`, equal to `origin/main` at the pass start; no refresh moved the branch).
- Commits: `784a20ca`, `24695d05` (planning tests), `b3bd8643` (implementation), `afd49c99` (start prompt fix), `22e923c4` (wait read rule fix). Final verify head below.

## Changed files

- `src/transcript.ts`: `transcriptByCode` (after an in-place reset, the one file of the kind's folder holding the warm-up code: claude project folder and pi sessions folder by mtime since the reset, codex rollouts held open) and `transcriptKind`; shared `claudeHandle`, `rollouts`, `piStart`, `seatPids` helpers so the code lookup and `transcriptFor` read the process one way.
- `skills/chart-issues/scripts/door-reset.ts`: rewritten on hc (D7, D8): stages started, wait-turn-end, input-check, reset-keys, warm-up, warm-up-turn-end, code-lookup, differing-path, label, start-prompt, one JSON line each.
- `skills/chart-issues/scripts/transcript.ts` (new, D3 refined): prints a terminal's transcript path or `-`.
- `skills/chart-issues/scripts/chart-usage.ts`: strict seats.yaml entry `{seat, address, name, recipe, session}`; `session` read as a path for every kind; id lookup removed.
- `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md`: hc gate and "outside hc"; consultants by `akrogon seat --slot` and `herdr-consultant-column`; restart by save, kill, rm, start, restart; supplied consultants never restarted; seats.yaml at Open with address, name, recipe, transcript path; exchange by `hc send`, report plus return file, `hc wait --children any` re-armed, state read from the wait's JSON; nudge then drop with kind and model; handover by the hc helper with a plain-text start prompt; direct-route B by `hc send` plus report.
- Deleted: `skills/chart-issues/scripts/peer-{create,ask,wait,restart,anchor}.ts`, `tests/peer-{create,ask,wait,restart}.test.ts`.
- Docs: `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md`, `docs/reference/skills.md`.
- Out of scope, handed to herdr-sweep per the design's exclusions (wording outside the chart skill): `docs/use/plan-work.md:26`, `docs/use/autopilot.md:9,29`, `docs/use/a-working-day.md:28` still say Herdr or "helper panes".

## Criteria

1. Exchange wiring. `akrogon run-check --name c1 -- bun test --timeout=30000 tests/door-exchange.test.ts` on `b3bd8643`: `check c1: 0 .../check-c1-1794105679091-1664344.log` (6 pass). Proof-command correction (plan Q1 answer O1): old wording `hc wait --children all` (brief criterion 1, design literal), new literal `hc wait --children any`, re-armed; reason: `all` does not end on a blocked, errored or exited consultant while a sibling works (`check c1-red: 1 .../check-c1-red-1794103311481-25484.log`). Guard: the same five cases still run plus the re-arm case, and deliberate breaks fail (`c1-red`, `c1-break-rearm`, `c1-break-parent`, plan.md).
2. Silent consultant. Current proof: the rerun on `3ffe7422` under check.fix below (one nudge, drop with kind and model, both waits immediate). Earlier rounds on `afd49c99`: attended paid round (door t1f, claude-sonnet-5-5 in auto mode; consultants claude-haiku-5-5). Round 1: the door started B (`akrogon seat --slot b ...` → `t1g`, child of `t1f`, named `ad-slot-b`), B replied `no` without a file or report; the door sent one nudge, quoted from B's transcript: `<hc from="t1f ad-door">Nudge: you stopped without the return file .../slots/probe-B.md and without the report to t1f. Both are missing.`; B replied `no` again; the door dropped it and wrote to CHART.md: `- consultant: B dropped (harness claude, model claude-haiku-5-5): stopped twice without return file or report, even after one nudge.` Repeat with C (`t1h`, `ad-slot-c`): the same nudge and the line `- consultant: C dropped (harness claude, model claude-haiku-5-5): ...`. Records: `door-round/` (prompts, screens, `transcript-excerpts.txt`, `transcript-excerpts-2.txt`). Wall time: round 1 door turn 4 min 25 s, repeat 5 min 17 s.
3. Reset helper stages. `akrogon run-check --name c3 -- bun test --timeout=30000 tests/door-reset.test.ts` on `b3bd8643`: `check c3: 0 .../check-c3-1794105683224-1680727.log` (6 pass). Deliberate break on the real helper (differing-path check removed): `check c3-break-real: 1 .../check-c3-break-real-1794105498426-1147843.log`.
4. Real reset per kind, attended paid run, run 2 on `afd49c99` (after the start-prompt fix), `door-reset-tier/` (run 1 in `door-reset-tier/run1/`). Each A started its own helper as its last action through its shell tool (`*-prompt2.txt`). Result (`door-reset-tier/c4-result.txt`): claude, codex and pi each `label==found True; found!=pre True; code in new file True; code in pre file False`, and fresh A's last user record is the start prompt `Run the chart-issues skill (.../SKILL.md): continue handover ...`. Wall time: run 2 about 1 min from start to the last helper line.
5. Usage on paths. `akrogon run-check --name c5 -- bun test --timeout=30000 tests/chart-usage.test.ts` on `b3bd8643`: `check c5: 0 .../check-c5-1794105684162-1701238.log` (21 pass).
6. Auto-mode start. Door t1f started as plain `claude --model claude-sonnet-5-5 --effort medium` with the operator's settings (`defaultMode: auto`, `Bash(akrogon:*)`), screen `auto mode on`. It ran `akrogon seat --slot b --harness claude --model claude-haiku-5-5 --effort low --task "You are slot B. ..."` and got `t1g` back; no permission prompt or denial marker in its transcript (`door-round/transcript-excerpts.txt`: "door permission prompt/denial markers found: none"). No settings were written by akrogon.
7. Window placement, attended window run with stand-ins, `door-window-tier/`: consultants `ae-slot-b`/`-c` children of door `t2` with the door's tab labels; after the column helper `row[t2, column[t4 0.5, t5 0.5], t3]` (`1-after-add.json`); b dragged to 0.7, c restarted by save, kill, rm, start, restart: `column[t4 0.7, t6 0.3]` (`3-after-restart.json`); three consultants `0.333` each, after removing d `0.5/0.5` (`5-`, `6-`); supplied `t3` alive and in the tab in every snapshot, never passed; consultant cgroup `app.slice/hc-hold-*.service` (unboxed). Window frame `7-window.png`. The supplied terminal's weight changed only when herdr-app split it to adopt a new consultant, not by the helper. Wall time about 2 min.
8. Old names gone. `akrogon run-check --name c8 -- sh -c "! grep -rnE 'herdr agent|herdr pane|HERDR_ENV|peer-create|peer-ask|peer-wait|peer-restart|peer-anchor' skills/chart-issues"`: `check c8: 0 .../check-c8-1794105685130-1705712.log`. Outside-hc line: SKILL.md `## Open` ("outside hc the door says it is outside hc and continues single slot or with supplied consultants").
9. Test duration. Baseline median 75 s. This leaf's verify `test`: 84.1 s on `b3bd8643` (1161 tests, 80 files), final head below. The rise of about 9 s is under the 10 s line; concurrent verifies on the same base took 79-84 s at the same time (notices-on-hc 79.4 s, watcher-on-hc 84.3 s), so the machine load explains most of it. Old tests replaced: `tests/peer-create.test.ts`, `tests/peer-ask.test.ts`, `tests/peer-wait.test.ts`, `tests/peer-restart.test.ts` (deleted, removed behavior), `tests/door-reset.test.ts` (replaced by the hc helper cases).

## Findings from the live runs

- F1 (fixed `afd49c99`): codex 0.167.0 rejects `/chart-issues ...` as an unknown command (`run1/codex-screen-after.txt`); the start prompt is now plain text.
- F2 (fixed `22e923c4`, completed by B's `3ffe7422`): a parent's `hc get <child>` hides that child's news from the next `hc wait --children any`; the door's second wait in the repeat ran 300 s. Stand-in probe: 0 s without the read, 15 s timeout with it (`door-round/hc-get-probe/`). Rerun in a paid round on `3ffe7422` (check.fix below): both waits woke at once.
- F3 (limit of the engine's resolver, not changed here): claude 2.1.319 holds its `tasks` handle only after its first shell tool run, so `transcriptFor` returns unknown for a claude seat that has run no shell command (run 1 claude A before its helper command; consultant B, which ran no tool). A door at handover and a working consultant have run shell commands, so the reset and seats.yaml paths resolve; an unknown path is never recorded (session-id Q3 3a).
- F4 (run setup, not product): the door was started with a scratch `XDG_RUNTIME_DIR`, which makes hc treat its shell as outside its terminal (`hc wait --children any` without a target: `needs_target`, reproduced from this seat's shell with the same override). Real doors keep the real runtime folder.

## check.fix (2026-11-08)

Input: review-B.md check.repair entry, `Handed to A`: criterion 2's current attended recording on B's repaired head. B repaired A:F1 (`1e9fa343`, model and effort asked for every created consultant) and B:F1 (`3ffe7422`, consultant transcript lookups only after the exchange is collected). OA1 was resolved by B as the paid repeat-count warn rule; launches 10 and 11 carry the warning above. Refresh: `origin/main` still `e3202dff`, no move. A made no commit in this pass. Before commit `064dd523` (last reviewed head), after commit `3ffe7422` (handoff head, unchanged here).

Criterion 2 rerun on `3ffe7422` (`door-round/rerun-3ffe7422/`):
- Setup as the earlier round: throwaway core and herdr-app session `akr-e2e-door` (`check c2r3-core-start: 0`, `check c2r3-space: 0`), scratch repo `akredoor` (prefix `ad`) at the recorded cwd with an `AKROGON_HOME` holding only it, the same silent brief. One change from the earlier round (F4): the door kept the real `XDG_RUNTIME_DIR`, so its prompt needs no hc prefix.
- Door t3 started (`check c2r3-door-start: 0 .../check-c2r3-door-start-1794109040882-238217.log`) and given `door-round/rerun-3ffe7422/door-prompt.txt` (`check c2r3-door-ask: 0`), the earlier prompt plus the Open seat record paragraph and a seats.yaml step. Turn end: `check c2r3-door-turn: 0 .../check-c2r3-door-turn-1794109093788-300927.log`.
- Observed (`transcript-excerpts.txt`): `akrogon seat --slot b ...` → `t4`, no permission denial; column helper exit 0; first `hc wait --children any` woke at once on B's stop (0 s); one nudge by `hc send`, quoted from B's transcript: `You stopped without the return file at .../slots/probe-B.md and without the report. Write the file, then run: hc send t3 "done B: .../slots/probe-B.md"`; B replied `no` again; the second wait woke 2 s after the nudge; drop recorded in `CHART.md`: `- consultant: B (claude, claude-haiku-5-5) dropped, stopped twice without its return file and report.` No `hc get t4` ran between the waits; `transcript.ts` for t3 and t4 and `hc get t4` ran only after the drop, as repaired Open says. `seats.yaml`: A with its transcript path, B with recipe and no `session` (its path printed `-`, F3).
- Cleanup (`grants[0].fixtures[0]`, identity operator user ivan): `check c2r3-cleanup-terminals: 0` (t4, t3, t2, t1 killed and removed, `terminal.list` empty), `check c2r3-cleanup-app-stop: 0` (the core, pid 138078, exited with it, so no `hc server stop`), `check c2r3-cleanup-app-delete: 0`; removed `~/.local/state/herdr-core/akr-e2e-door`, the recorded cwd, the scratch akrogon home and the claude projects folder of the cwd. Absence: `check c2r3-absence: 0 .../check-c2r3-absence-1794109130329-515967.log` (no socket, no app-session folder, no core state, no cwd, no run transcripts). Kept: the retained trust entry.

### check.fix verification: `test` check red, blocker

- c8 is unchanged since B's green rerun on `3ffe7422` (`check c8: 0 .../check-c8-1794108837855-3784371.log`). Criteria 1, 3, 4, 5, 6 and 7 have unchanged code, tests and inputs. Criterion 2 is above.
- `akrogon verify` on `3ffe7422`: setup, format and typecheck 0. `test` red in 5 of 5 runs, with the starting load average from 0.15 to 11: `check-test-1794109264711-557749.log`, `check-test-1794109454845-939678.log` (retry), `check-test-1794110806447-2824599.log`, `check-test-1794111756885-968374.log`, `check-test-1794112968144-2811644.log`. Every run fails `tests/hc-delivery.test.ts` "a working seat gets no send; ..." at its 30 s timeout. Some runs add `tests/session-routing.test.ts` "skips a stopped session and a dead socket, ..." and hc-delivery "silent stops are re-prompted, ...", also at 30 s. `akrogon verify --known-red`: `fail` (the base tree holds a whole-green row).
- Cause is the leaf's test set, not its product code. The leaf diff does not touch these tests, `src/next.ts`, `src/hc.ts`, `src/seat.ts` or `src/shell.ts`, and `src/transcript.ts` keeps `transcriptFor` behavior. Interleaved full-suite A/B through run-check, same command (`bun test --timeout=30000 --parallel=4 --no-isolate`), same machine:
  - base `e3202dff`, full set: pass 19.9 s and 18.7 s (`check-ab-full-base-1-1794113171163-3084640.log`, `check-ab-full-base-2-1794113390121-3673014.log`)
  - leaf `3ffe7422`: fail 30 s twice (`check-ab-full-leaf-1-1794113279380-3417663.log`, `check-ab-full-leaf-2-1794113505651-3999282.log`)
  - base `e3202dff` without the four `tests/peer-*.test.ts` the brief deletes: fail 30 s twice, with the same three tests as the leaf run (`check-base-nopeer-1-*.log`, `check-base-nopeer-2-1794113753879-324838.log`)
  - Alone, the test passes on both trees in about 17 s at low load (`check-hc-delivery-alone-1794109488087-1556096.log`). Alone at heavy load it reaches 28.8 s on the leaf and fails at 30 s on base (`check-hcd-alone-*`).
- Reading: removing the peer test files (a brief requirement) changes the suite's schedule, and three pre-existing hc tests with little margin under their 30 s timeout then overlap and time out. Within the test, the time is in `akrogon next` and `akrogon phase` passes (temporary instrumentation, discarded: 10.2 s, 5.3 s and 12.6 s alone; the first `next` took 30 s in the full suite). The exact contention was not isolated: session probing (2 ms per session), leaked cores (they exit when idle) and the door tests next to it (16 to 20 s together) were ruled out.
- Filed as unverified intake, `https://github.com/Tamdoma/akrogon/issues/130`, before the peer-file A/B. Its suspected cause names machine load; the A/B above shows the trigger is the test set.
- Blocker (operator): the configured `test` check cannot go green on this leaf's required test set. A writes and edits no test and changes no runner config, and the failing tests are base tests outside the leaf's owned paths. Attempted operation: `akrogon verify` on `3ffe7422`, identity operator user ivan (seat A). Error: the three tests above time out at 30 s. Owner: operator. Operator action, one of:
  - land a fix for the three timing-tight tests on main (issue #130), then re-prompt check.fix so A refreshes onto it
  - approve, in readiness or plan.md, a change to those tests in this leaf

### check.fix, second pass (2026-11-08, after plan.md Operator decision 2)

- Refresh: fetched `origin`. Rebased from base `e3202dff`, head `3ffe7422`, onto base `d40c1556` (`AKROGON_BASE`, notices-on-hc and others landed); new head `1bcc0abe`. Conflicts were only in `src/AREA.md` and `tests/AREA.md`. Both sides were kept: main's notice text, plus this leaf's `transcriptByCode` clause and door-tests line. Both files are 40 lines. Rebased commits: `9d61d344`, `8485077f`, `bf663e97`, `00e76abb`, `ef15e3c9`, `00afadf5`, `4541b73e`, `1bcc0abe`.
- Repair `59638e5d`, per Operator decision 2: per-test timeout 90 s for `tests/hc-delivery.test.ts` "silent stops are re-prompted, ..." and "a working seat gets no send; ..." (30 s default before), and `tests/session-routing.test.ts` "skips a stopped session and a dead socket, ..." (explicit 30000 before). No assertion, fixture or runner config changed. Two `Test-Change:` trailers cite the decision, the base-without-peer A/B and Tamdoma/akrogon#130. `akrogon phase ... check.review --check` refused only for the missing receipt.
- Prior reviewed base and head: `e3202dff`, `064dd523`. Handed-off base and head: `d40c1556` and the verified head below.
- c8 on `59638e5d`: `check c8: 0 .../check-c8-1794114208807-868728.log`.
- Criterion 2 proof stays the `3ffe7422` rerun: the rebase changed no chart-issues text (`git diff 3ffe7422 1bcc0abe -- skills/` shows only main's `skills/watch-issues/SKILL.md` notice wording).

### check.fix, second pass: verify on `59638e5d`, blocker

- `akrogon verify` on `59638e5d`, setup, format and typecheck 0:
  - run 1: `test` red, 13 timeouts, 200.8 s (`check-test-1794114434371-884255.log`)
  - run 2, the retry from load 1.75: red, 13 different timeouts, 131.3 s (`check-test-1794114916786-1930741.log`)
  - `akrogon verify --known-red`: `fail` (green base row)
  - The three tests raised to 90 s passed in every run.
- Interleaved full-suite A/B on the new base `d40c1556`, same command:
  - base: 1 fail, then 16 fails (merge and holder tests, unrelated to this leaf) (`check-ab2-full-base-1-1794115062738-2198149.log`, `check-ab2-full-base-2-1794115313050-2782955.log`)
  - leaf: 1 fail, then 2 fails (`check-ab2-full-leaf-1-1794115188710-2524773.log`, `check-ab2-full-leaf-2-1794115443469-3109747.log`)
  - The machine's load swings make the suite flaky on base too.
- Leaf-specific and consistent: `tests/hc-delivery.test.ts` "a phase run during the turn and the turn-end pass prompt the next idle turn exactly once" times out at 30 s in 4 of 4 leaf full runs this pass and in 0 of 2 base runs. It is the fourth test of the same file and the same mechanism as Operator decision 2 (timing-tight hc tests after the peer tests are gone). Decision 2 names only three tests, so A left this one unchanged.
- Blocker (operator): attempted `akrogon verify` on `59638e5d`, identity operator user ivan (seat A). Error: the test above times out at 30 s on every leaf run, and other tests time out at random on base and leaf under the machine's load. Owner: operator. Operator action:
  - extend Operator decision 2's timeout-only change to "a phase run during the turn and the turn-end pass prompt the next idle turn exactly once", or to every test in `tests/hc-delivery.test.ts`
  - then re-prompt check.fix, ideally while no other leaf's live runs or verifies load the machine

### check.fix, third pass (2026-11-08, after plan.md "Operator decision 2 withdrawn")

- Refresh: fetched `origin`; `origin/main` is still `d40c1556`, so the branch did not move.
- Repair `f5d98e5c` reverts `59638e5d` in its own commit. `tests/hc-delivery.test.ts` and `tests/session-routing.test.ts` now match base `d40c1556` exactly. The two `Test-Change:` trailers cite the withdrawal section.
- Host before verify: the leaked units were cleared, leaving 18 `hc-shutdown-*` units (32,575 earlier) and load 1.0. During the suite they grew to 1,016, so hc still leaks one unit per core stop (`learnings/history/2026-11-08-hc-shutdown-unit-leak.md`).
- Before and after commits: `59638e5d` and `f5d98e5c`. Prior reviewed base and head: `e3202dff`, `064dd523`. Handed-off base and head: `d40c1556`, `f5d98e5c`.
- c8 on `f5d98e5c`: `check c8: 0 .../check-c8-1794123539317-3596510.log`.
- `akrogon verify` on `f5d98e5c`: green on the first run. 1165 pass, 0 fail across 81 files in 69.61 s. Logs: setup `check-setup-1794123542058-3614836.log`, format `check-format-1794123547051-3614836.log`, typecheck `check-typecheck-1794123549846-3614836.log`, test `check-test-1794123669857-3614836.log`. All four hc tests named in the earlier blockers pass at their base timeouts, which supports the unit leak as the cause of the earlier reds. Criterion 9 figure: 69.61 s, under the 75 s baseline.
- Criterion 2 proof stays the `3ffe7422` rerun: no skill text changed since then.

## Retained (readiness `retained`)

- `~/.claude.json` project trust entry `/var/tmp/akr-1000/5d20/34e9098a/akr-e2e-door-claude` (written by Claude Code when the folder-trust dialog was answered with down, enter in launch 1). No codex or pi trust entry was written.

## Known limitations

- Typed but unsubmitted text in A is not seen by the reset helper (operator 3a).
- A `/clear` or `/new` the operator types into a door or supplied consultant is not detected (session-id final shape).
- F3 above.

## Grant cleanup (grants[0].fixtures[0])

Identity: operator user ivan (this seat). Done after the report quoted what it needs: killed and removed every terminal of `akr-e2e-door` (t1, t12, t1d, t1f, t1g, t1h, t1j..t24, listed from `terminal.list`), `herdrapp session stop akr-e2e-door` (the core exited with it, pid 2027104 gone, so no `hc server stop` call was needed), `herdrapp session delete akr-e2e-door`, removed `~/.local/state/herdr-core/akr-e2e-door`, the recorded cwds and scratch folders under the leaf temp, the claude projects folders of the recorded cwd (`-var-tmp-akr-1000-5d20-34e9098a-akr-e2e-door-claude` and its `-issues-chart-e2e-round` child), the four recorded codex rollouts and the pi sessions folder of the pi cwd. Absence check: no `akr-e2e-door` socket under `/run/user/1000/herdr-core/`, no `~/.config/herdr-app-sessions/akr-e2e-door`, no `~/.local/state/herdr-core/akr-e2e-door`; no run transcripts left. Kept: the `retained` trust entry above.

## Final verification

- `akrogon run-check --name c8 ...` on `22e923c4`: `check c8: 0 .../check-c8-1794108105142-3105003.log`.
- `akrogon verify` on `22e923c4`: green; `verify test: 0 .../check-test-1794108194417-3105124.log`, 1161 tests across 80 files in 84.38 s (criterion 9 final figure: +9.4 s over the 75 s baseline, explained above). The `test` check runs criteria 1, 3 and 5's test files on this head. Wall time 1 min 30 s.
- No refresh moved the branch: `origin/main` is still `e3202dff`.
- Trailer-only commit `064dd523` (same tree as `22e923c4`) cites `tests/AREA.md`; `akrogon phase ... --check` printed `ok`.
