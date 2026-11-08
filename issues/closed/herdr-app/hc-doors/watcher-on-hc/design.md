# Design: watcher-on-hc

## Binding decisions, verbatim

Copied verbatim from each fork's Taken section in the akrogon chart `issues/chart/herdr-app/` (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/`). Proof records: `forks/proofs.md`.

### Signposts: herdr-app (forks/signposts.md)


Operator 2026-11-06, door t15, verbatim: "1a | 2a - we just need to make sure to test everything out, including e2e to make sure it works before we delete the old stuff. But yes, we're removing everything old, no fallbacks either | 3 - if it doesn't have something we need, use the herdr-setup space (you can find the repo in this session) to create patches that will survive upstream updates. | 4a - if the crashes happen, we need an auto-fix with the watcher (/watch-issues) agent. Pretty much the same what we have now. I don't want to change how the workflow is done, I just want to move and upgrade everything to herd-core and herdr-app. | 5a - but I still need a global herdr skill that pulls from that agents.md file (which exists in herdr-app), so I don't have to remind them. Maybe you can create a symlink skill that links to that file and call it /herdr and symlink it from pi, claude code and codex to that file? | 6a so we can test - but then everything old needs to be completely removed | 7a |"

Read as:
- 1a: akrogon code only for starting an agent (name, labels, visible pane, harness argv); every other hc step is plain `hc` commands in skill text.
- 2a: everything that exists only for old herdr is removed, no fallbacks. Before anything old is deleted, the new path is tested end to end and shown working.
- 3: a missing hc or herdr-app capability is filled by a patch in the herdr-setup repo (`/home/ivan/Work/infra/herdr-setup`, registered as `herdr-setup`) built to survive upstream updates. Not 3a, 3b or 3c as written.
- 4a: an event listener notices crashes, and crash recovery is an automatic fix by the watch-issues agent, as today. The workflow does not change; only the substrate moves to herdr-core and herdr-app.
- 5a: global CLAUDE.md and AGENTS.md stay untouched. Added: one global `herdr` skill whose content comes from herdr-app's AGENTS.md, linked into pi, Claude Code and Codex (operator's proposed mechanism: a symlink skill), replacing the old herdr skill.
- 6a: the engine is ported first so the rest can run and be tested on it; after that every old part is removed completely.
- 7a: one smallest live run per operation per agent kind at charting, in a throwaway herdr-app session, within one paid budget the operator approves.

What the session prioritizes and gives up (A): the same workflow on a new substrate, proven end to end before old code is deleted, with gaps patched in herdr-setup rather than worked around in akrogon or waited on upstream. It gives up any period where old and new both work, and features that only old herdr made possible unless the operator names them.

Correction 2026-11-06 (operator, round 1 engine-shape, door t15), verbatim: "the goal is not to invent new stuff, it's to move from the old herdr to the new herdr-core and herdr app while keeping and making everything elegant and working". Binding for every fork: when options differ, the one closest to how akrogon works on old herdr wins unless it is less elegant or does not work.

Correction, operator 2026-11-06, door t15, verbatim: "just make sure that we have all the behavior very similar to what the old akrogon is doing for now, with the addition of all the improvements of herdr-core and herdr-app"

Read as: every remaining fork keeps today's akrogon behavior as close as hc and herdr-app allow, and takes what herdr-core and herdr-app do better (events instead of the plugin, turns instead of session-file offsets, labels, core-side terminals that outlive the window) where they replace an old mechanism. No new features beyond that; improvements to behavior wait for later work.

Clarification, operator 2026-11-06, door t15, verbatim: "Yes, by improvements, I mean no polling or waiting, and using <hc> wherever possible for communication."

Read as: the herdr-core improvements taken are event-driven: no polling loops, no sleeps or timed waits standing in for a signal, and seats talk to each other by `hc send`, arriving as `<hc from=...>` messages, wherever a message can carry it. Where a bounded wait remains (start's 60 s first-task check, delivery Q1), it follows hc events, not repeated reads.

Direction, operator 2026-11-06, door t15, verbatim: "when it comes to the new way of communication, I want the most elegant solutions so that the least amount of things can break. I had the old akrogon and herdr working perfectly, nothing should break with this migration. Only made better."

Read as: for communication between seats and with the engine, each fork picks the option with the fewest moving parts that can fail, preferring hc's own mechanisms (`hc send` / `<hc>` messages, events, labels) over akrogon-built ones. Every behavior that works today must still work after the migration, proven by the e2e tests before old herdr is removed (signpost 2a); a regression is a failed migration, not a cost.

Exception, operator 2026-11-07, door t15 (chart-door round, picking 2a, which stated the exception): the chart door's handover reset helper stays akrogon code besides the start step.

Read as: signpost 1a holds everywhere else. The reset helper is the only other akrogon script in the chart door, ported to hc events (forks/chart-door.md `## Taken`).

### watch-issues on hc (forks/watcher.md)


Operator 2026-11-06, door t15, verbatim: "1a, 2a, 3a - wat her must not be mandatory, like it isnt today."

Read as:
- The watcher stays optional, as today: nothing in the engine, listener, start or handoff requires a running watcher. With no live watch terminal for a repo the listener sends no wake and everything else runs as without a watcher today; `akrogon status` shows whether a watcher is live as information only, never a warning, gate or notice.
- Q1 1a: the 20-minute Claude cron stays as today (`*/20 * * * *`, `/watch-issues tick <root>`, 7-day expiry, operator-created and -deleted). Added: the listener, and any committed move of a leaf to failed, sends the repo's live watch terminal one `/watch-issues tick <root>` by plain `hc send` for a lost or exited seat, a seat replaced by hc's keep shell, a blocked seat, a failed leaf (delivery's silent-stop bound included) and the 60-minute busy deadline; coalesced to one wake in flight per repo; a wake or a cron fire runs one full check, and queued ticks run one check. The watch terminal is found by the label `akrogon.watch=<repo>` the skill sets on its own terminal at start and removes at stop; only a live terminal running an agent counts; two live matches are reported.
- Q2 2a: `observe.ts` keeps its line format on `hc ls --json` filtered by akrogon labels in the resolved session, cross-checked against recorded addresses; null status prints `unknown` (hands off), a keep shell or exited terminal is absent; logs from the session-id resolver; screens by `hc read`. Stop by `hc interrupt` (a per-harness probe names `hc keys esc` for any kind where interrupt would press ctrl+c), then confirm idle, empty input, same address and same conversation, then one corrective `hc send`; unknown conversation or missing history means notify. Never `--force`, kill or park; notices through the notices verb.
- Q3 3a: the operator starts `/watch-issues` in a Claude terminal inside hc in the repo's session, one per repo; the skill refuses outside hc (no `HC_TERMINAL_ID`) as it refuses without cron today; nothing restarts it after a reboot.

Correction, operator 2026-11-07, door t15 (leaf review round, slots/leaf-review-merged.md S3), verbatim: "1a | 2a | 3a"

Read as (3a): the reset helper's cancel check reads the operator's submitted input from A's transcript per kind, as today's `door-reset.ts` does (SKILL.md Handover input records); the watcher's empty-input confirmation reads the screen by `hc read`, as today's watcher reads it. Stated limit: text typed but not submitted is not seen. Foreclosed: a new input source.

### Task delivery and report proof (forks/delivery.md)


Operator 2026-11-06, door t15, verbatim: "1a 1c | 2a | 3a | 3c | 4a |"

Read as:
- Q1 1a: the first task goes in the start argv (`hc run --bg ... -- <argv> "<task>"`); start follows hc events for that terminal (`hc events --terminal <t>`, no repeated reads) for up to 60 s until the seat reports `working` or `turn >= 1`, and records that turn as `prompted`. No repeated `hc get` loop, no templates.
- Q1 1c: no `working` within 60 s (popup, slow start, `blocked`): the seat stays running, start reports "started, not confirmed" with the address and the screen, and the state records it for the watcher or operator; only an exited or `error` seat fails the start. Never a blind resend of the first task.
- Q2 2a: later tasks by plain `hc send --json` (no `--if`, `--force`); sent only to a seat whose status is `idle` or `done` (`working`, `blocked`, `error`, null mean hands off). Delivered = `started: true`, its turn recorded as `prompted` with the address. `started: false`: record `delivery_error` with the send turn and the screen; a later pass that sees the turn moved past it resettles as delivered; while the turn is unchanged no automatic resend, the watcher inspects first. Session-file proof and `--wait --until working` are deleted; the 60-minute busy notice stays (channel in the notices fork).
- Q3 3a 3c: the engine keeps today's re-prompt of an idle or done seat whose phase did not move, keyed on hc turn (the seat's turn is past the recorded `prompted` turn and the seat is not in `done`); prompts the engine sends per seat per phase are counted in state and reset on any phase move; the third prompt without `phase` moves the leaf to `failed` with reason "seat <x> ended <n> turns without reporting", handled by the watcher's existing failed rules and shown by status.
- Q4 4a: the door counts a consultant done only when its return file for the current exchange exists and its report came from its current address; a missing one gets one nudge naming what is missing; a second silent stop drops the seat for the rest of the session (chart skill rule), recorded with harness kind and model.
- Recurrence: silent stops are recorded per harness kind and model so the config fork can swap a kind that repeats them.
- Engine-shape wording correction (C, recommended in round 4, not objected): "one prompt per seat per phase" reads "one prompt per seat per turn".

### Features keyed on agent session id (forks/session-id.md)


Operator 2026-11-06, door t15, verbatim, first on Q1: "q1 - why does it need to know the id? isn't it enough to just know the file with the response? challenge me"; A answered that the file is what features need and the id is only a lookup step for claude and pi, and proposed "1a (path)"; operator then: "1a 2a 3a"

Read as (A reads the reply as accepting the path form A had just proposed; operator may correct):
- Q1 1a: keep chart usage, seats.yaml session, the watcher's log tail and the `session` field in log.jsonl and timings.jsonl. What is recorded per seat is the agent's transcript file path, not an id; readers open it directly (`observe.ts` and `chart-usage.ts` already accept a path kind).
- Q2 2a: the path is read from the live agent where today's code asked herdr (observe, log, timing, door at each exchange, usage): codex and agy from their open file in `/proc/<pid>/fd`; claude from its open `/tmp/claude-<uid>/<cwd>/<id>/tasks` handle, the id there giving `~/.claude/projects/<cwd>/<id>.jsonl`; pi from the fresh `--session-id` start put in its argv; the door's own from its environment (`CLAUDE_CODE_SESSION_ID`, `CODEX_THREAD_ID`). Lookup checks `foreground.pid` then `pid`. The path read is saved on the terminal (label) so it survives exit; a `/clear` or `/new` is followed because the next read finds the new file. No cwd/time scans.
- Q3 3a: unknown path: usage shows the seat unmeasured with the reason and continues; observe prints `log<seat>=-` and the watcher judges from the screen, "no log"; log and timings write `session: null`; a start never fails over it.
- Corrections from the path check (B,C,D,E, 2026-11-06), no pick changed:
  - One resolver in `src/` owns finding the file, used by engine, watcher, usage and door (D,B): codex and agy from the open file; claude from the open `tasks` handle's id under the same projects root `chart-usage.ts` uses (`CLAUDE_CONFIG_DIR`, else `~/.claude`) (C); pi from the argv id by the `*_<id>.jsonl` match in its session store (today's lookup in `src/session-file.ts:11-34` moves into the resolver, the delivery proof that used it is deleted) (D,E). pi's path is saved at its first read after the file exists (D).
  - Process order: the program hc started (`pid`) first; its foreground process only when `pid` holds no transcript, as for a terminal you opened yourself where `pid` is the shell (C,E). A nested `claude -p` or `codex exec` run as a tool is never picked (C).
  - The door finds its own file by the same resolver on its own terminal, not from environment variables (E: `CLAUDE_CODE_SESSION_ID` is absent from claude's process environment and does not change after `/clear`). One rule for every seat.
  - `chart-usage.ts` takes paths for claude and codex too (today it treats those values as ids, B); a test shows usage numbers unchanged on known transcripts.
  - The chart skill's session wording, the "never with a null session" rule and the handover continuation rules (SKILL.md:39,137,147) move to paths in the chart-door leaf; an unknown current path never counts as the same conversation, and saved older paths stay usable for usage only (B,C).
  - Probes: codex with and without `--no-daemon` holds its rollout (C); claude derived path exists for a worktree seat (C); claude after `/clear`, codex after `/new`, pi after `/new` give the new file (C,E); reset with a late new file and an exited seat (B).

Correction, operator 2026-11-07, door t15 (probe round, forks/proofs.md P3), verbatim: "1a | 2b - if that doesn't work, I'll approve the working akrogon folder manually so it can work in any repo. | 3 - I don't understand, elid. What are the consequences"

Read as (1a): the resolver's claude lookup reads the open `tasks` handle under the seat's own `TMPDIR` (`<TMPDIR>/claude-<uid>/<cwd-mangled>/<id>/tasks`), not `/tmp/claude-<uid>` when `TMPDIR` is set; codex takes the newest rollout the process holds; pi as taken. These hold for seats that are never reset in place (leaf seats and consultants restart by kill and start). After an in-place reset (`/clear`, `/new`), the current transcript is found by a unique code: the first prompt after the reset carries a fresh code, and the transcript is the file in that kind's transcript folder for the seat's cwd that contains it (P3: claude keeps the old handle open, codex opens the new rollout only after the next prompt, pi switches file names).

Final-shape check, 2026-11-07 (slots/final-probe-B..E.md; D no disagreement), applied by A within the operator's 1a:
- The claude handle is found by its fd target pattern `…/claude-<uid>/<cwd-mangled>/<id>/tasks` in `/proc/<pid>/fd`, whatever `TMPDIR` is (C).
- The code lookup runs only after the warm-up turn has ended (turn advanced, status idle or done) and is bounded: claude `~/.claude/projects/<cwd-mangled>/` and pi's sessions folder for the cwd, files modified after the reset began; codex the rollouts open in `/proc/<pid>/fd`, newest first (codex stores rollouts by date, not cwd) (B,C,E).
- The found path is saved as the terminal's transcript label (as taken), and later lookups without a code return the label's path, so fresh A, usage and the watcher see the post-reset transcript (E).
- Stated limit: a reset akrogon did not perform (an operator typing `/clear` in a supplied consultant or door) is not detected; that seat's usage may count the old file until its next akrogon reset or restart (B).

### Test fakes and e2e (forks/tests.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2a | how long is the testing going to last for? Make sure the tests are meaningful and don't take too much time, ok?"

Read as:
- Q1 1a: `tests/fake-herdr.ts` is replaced by a real throwaway hc core per fixture (`HC_SESSION` unique per fixture, scratch XDG runtime and state under the suite root with the socket path under 107 bytes, inherited `HC_TERMINAL_*`/`HC_SCOPE` stripped, stopped on teardown, swept by `tests/isolation.ts`'s subreaper) and a small stand-in agent script that emits OSC 7501 status and does the scripted thing (write a return file, `hc send` its parent, block, exit, stay silent, stay idle). Error cases are produced on the real core (second `--name`, `state=blocked`, idle stand-in for `started: false`, `hc server restart`, `chmod 000` socket, stopped core). Only `herdr-app` is faked: strict, refusing unplanned calls, captures dated and refreshed by the window tier. No fake `hc`. `fake-busctl.ts` goes with `adoptShell`; `fake-proc.ts` keeps only helpers of the new design (resolver fds, leaf-slice identity).
- Q2 2a: the real-hc tests run inside the normal `test` check, so every verify and merge sees an hc regression; separate files, each with its own core; a machine without hc fails the check clearly. The window tier and the paid per-kind tier stay separate attended runs that fail rather than skip.
- Time and meaning (operator condition, binding for every leaf): the `test` check stays about as fast as today (median 75 s, max 121 s over the last 60 verify runs, `issues/verify-runs.jsonl`; a test check took 73-74 s on 2026-11-04, `issues/timings.jsonl`). Real-hc tests wait on hc events or `hc wait`, never sleeps, and each finishes in a few seconds. Each test checks a behavior akrogon relies on from a taken fork (start and first-task proof, delivery and turns, reports, listener wakes, silent-stop bound, restart, containment, notices, weights, session-id path, observe lines); none re-tests hc itself. Tests of removed behavior are deleted, not ported. Done-criterion per leaf: the leaf's verify `test` duration is recorded and compared with today's; a leaf that adds more than about 10 s says why in its evidence.
- Agreed, not asked: 2a proof before deleting old herdr is the full suite green plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check, logs kept. Each leaf ports its own tests; the engine leaf lands the fixture core, stand-in and fake `herdr-app`; each leaf names the old tests it replaces; ownership and partial-state guarantees are kept; the sweep removes obsolete machinery after the proof (wording scope stays with cutover).

### Exclusions

- notices: the watcher's needs-you notice moves to akrogon's notice verb in notices-on-hc, which owns that line of the watch skill; this leaf leaves notice wording to it.
- identity, engine-shape, start-and-pane, containment, config: engine-on-hc. The listener's wakes and `akrogon status`'s watcher liveness line are engine-on-hc's.
- delivery: the silent-stop bound and the failed reason are engine-on-hc's; this leaf handles a failed leaf with the watcher's existing failed rules.
- session-id: the resolver is engine-on-hc's; this leaf reads through it.
- chart-door, herdr-skill, patch-mechanism, cutover: other leaves and the operator.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- `observe.ts` output is proven against a real core with stand-ins, the cheapest test that catches a wrong label filter or status mapping.
- Which key stops codex and agy is a harness property not reached at charting (forks/proofs.md P4: `esc` left codex working on a background terminal; agy not reached), so a real session per kind settles it, with today's notify path when neither key works (B,C); claude and pi were observed stopping on `hc interrupt`.
- The wake reaching a live watcher is cross-component wiring (listener, label, skill) no smaller check shows; the leaf runs it itself before merge, with the listener program pointed at its throwaway session, and the end-to-end proof repeats it (C).
- The watcher stays optional: no test makes anything depend on a running watcher.

## Leaf architecture

Owned surfaces: `skills/watch-issues/SKILL.md` (except its needs-you notice line), `skills/watch-issues/scripts/observe.ts`, its tests (`observe.test.ts`, `observe-log-tail.test.ts`) and fixtures (`fixtures/herdr-agent-list.json`, `fixtures/herdr-session-list.json` replaced).

Literal interfaces:
- Label at start `hc label $HC_TERMINAL_ID akrogon.watch=<repo>`, at stop `hc label $HC_TERMINAL_ID akrogon.watch=`.
- Observe: `hc ls --json` in the resolved session, filtered by the akrogon labels (`akrogon.repo`, `akrogon.leaf`, `akrogon.seat`) and cross-checked against the addresses recorded in state; screens `hc read <address> --lines <n>`.
- Stop: `hc interrupt <address> --json` or `hc keys <address> esc` per kind, confirmation by `hc get --json` (status, turn, address) and the resolver's transcript path; corrective `hc send --json <address> <text>`.

State and preconditions changed, with consumers:
- The `akrogon.watch=<repo>` label is what the engine's listener looks up for wakes (engine-on-hc, wake sender); two live matches are reported there.
- observe's line format is consumed by the watch skill's judgment rules, unchanged.
- `Open for the plan:` how `observe.ts` reaches the resolver (import from `src/` in the release or an akrogon CLI verb), keeping one resolver.
- `Open for the plan:` the codex and agy stop keys, settled by criterion 3 before the skill text names them.
- Empty-input confirmation reads the screen by `hc read`, as today; unsubmitted text the screen does not show is a stated limit (operator 3a).
- `observe.ts` today imports `herdrArgv`, `repoSession` and `SessionResolution` from `src/shell.ts`; this leaf moves it to the hc module so herdr-sweep can delete those exports (B,E).

Dependencies: engine-on-hc (blocked-by).
