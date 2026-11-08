# Design: chart-door-on-hc

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

### Chart door on hc (forks/chart-door.md)


Operator 2026-11-07, door t15, verbatim: "1a | 2a | 3a"

Read as:
- Q1 1a: the five peer scripts go; `chart-usage.ts` (on transcript paths) and `direct-guards.ts` stay. Consultants are created and restarted by the start command (`--parent <door>`, restart is `hc kill` then start), asked by plain `hc send <seat> "<brief instruction>"`, and collected by their `<hc>` report from the seat's current address plus the exchange's return file (delivery Q4: one nudge, then drop). After A finishes its own notes for an exchange, A runs one `hc wait --children all` and stays in its own turn, as today. The wait ends at once on a report, on a blocked, errored or exited child, or when every child has stopped working; a child that stopped without a report gets delivery Q4's nudge. A timeout is a check-in, never a drop. This is hc's own child signal, not a repeated read.
- Q2 2a: A's handover reset stays a small detached helper, ported to hc. Operator exception to signpost 1a: this helper is the one akrogon script besides the start step. A appends the handover entry and starts the helper with `hc run --bg --no-notify --rm` as its last action. The helper follows A's turn end on `hc events`, cancels if the operator has typed into A's input, types the reset as keys into A's terminal (`/clear` for claude, `/new` for codex and pi; a send from another terminal would arrive wrapped as chat), confirms through the session-id resolver that A now has a new transcript path, then sends the start prompt naming the next chart and presses enter if it sits unsubmitted. Fresh A finds the latest unconsumed handover entry from its start prompt as today, comparing transcript paths. Each stage's wake and the fresh conversation are proven per harness kind before handoff (B's rebuttal), with today's codex warm-up step kept where a new transcript appears only after the next prompt.
- Q3 3a: the door restarts only consultants it started. Operator-supplied consultant terminals are used as given, never moved, killed or restarted, and keep their context; the door says so at open. This narrows today's chart-entry restart rule for supplied consultants only.
- Gates and records (not contested): the door's hc gate is `HC_TERMINAL_ID` set and `hc get $HC_TERMINAL_ID` answering; "outside herdr" becomes "outside hc". The temp-path rule goes: the chart folder and seats.yaml are written at Open. seats.yaml holds per seat the hc address and name, the launch recipe used for restart, and `session` as the transcript path from the session-id resolver; a new entry is appended when the address or path changes, and an unknown path is never treated as the same conversation. The skill text sweep covers the 65/35 geometry (now start-and-pane's layout with equal consultant heights), drop and collection wording, Mode record session-id uses and the direct-route reviewer B by `hc send` plus report.

Correction, operator 2026-11-07, door t15 (probe round, forks/proofs.md P3), verbatim: "1a | 2b - if that doesn't work, I'll approve the working akrogon folder manually so it can work in any repo. | 3 - I don't understand, elid. What are the consequences"

Read as (1a), amending Q2 2a's confirmation: after typing the reset, the helper sends one tiny warm-up prompt ("reply OK <code>") with a fresh code, finds the transcript containing the code through the session-id resolver's code lookup, and continues only when that file differs from A's pre-reset transcript; then it sends the start prompt. Today's codex warm-up step, used for every kind (P3).

Final-shape check, 2026-11-07 (slots/final-probe-B..E.md), applied by A within 1a: the helper waits for the warm-up turn to end (turn advanced, idle or done, on `hc events`) before the code lookup and before the start prompt, and writes the found path to A's transcript label (B,C,E).

Correction, operator 2026-11-07, door t15 (leaf review round, slots/leaf-review-merged.md S3), verbatim: "1a | 2a | 3a"

Read as (3a): the reset helper's cancel check reads the operator's submitted input from A's transcript per kind, as today's `door-reset.ts` does (SKILL.md Handover input records); the watcher's empty-input confirmation reads the screen by `hc read`, as today's watcher reads it. Stated limit: text typed but not submitted is not seen. Foreclosed: a new input source.

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

### Start command, lifetime and visible panes (forks/start-and-pane.md)


Operator 2026-11-06, door t15, verbatim: "1a | 2a - but it needs to show as a visible tab in herdr-app if herdr-app turns on or is turned on | 3a 3c | 4a"

Read as:
- Q1 1a: leaf seats start `--no-parent` and outlive doors and listener restarts; consultants and direct reviewers start with `--parent <door>` and die with it.
- Q2 2a: a leaf's seats join a tab through labels with an akrogon-minted tab id (A first, then B beside it); no app command and no focus change at start. Operator addition: the tab must show as a visible tab both in an already running herdr-app window and when herdr-app starts later. That is a done-criterion of start, proven live in a throwaway session for both cases. Tab naming: see Q2b.
- Q3 3a 3c: equal consultant heights come from a herdr-setup helper the door calls, which reads the core document, sets equal weights in the consultant column with the read version and re-reads to verify; the engine never calls it. A consultant restart keeps the operator's dragged sizes; heights go back to equal only when a consultant is added or removed.
- Q4 4a: one start function in akrogon, exposed to skills as one CLI verb with a new name; it derives name, labels, parent, cwd and env, starts, places, and on failed placement kills the agent it started and exits non-zero with the address. Restart is the door's `hc kill`, then the same start.

Operator 2026-11-06, door t15, verbatim, on Q2b (tab name, 2c mod vs 2d write at start): "whatever is the closest to how it it now. Don't invent new stuff. WE can always improve later"

Superseded 2026-11-06 by the final-shape check (C,D,E; `hc schema` doc.get/doc.set "opaque JSON document"): only a running herdr-app window creates a tab entry, with an empty name, after `hc run` returns; with the window closed there is no tab to name, and akrogon writing the entry itself makes herdr-app skip adoption (E). Re-asked as N1 (herdr-setup mod names the tab when herdr-app creates it) vs N2 (akrogon renames with `tab.rename`).

Operator 2026-11-06, door t15, verbatim: "N2"

Read as:
- Q2b N2: akrogon names the leaf tab itself, as today, with herdr-app's `tab.rename`. Window open at start: start waits until the tab and pane show (its placement check) and renames the tab to the slug. Window closed: the first engine pass that finds the window open renames any leaf tab of a recorded leaf whose name is not its slug. No mod and no `doc.set` from akrogon. Cost: after the window opens, a tab may show its place number until the next turn ends.
- F1 (B): any versioned `doc.set` (the 3a weights helper) re-reads the latest document on conflict and applies its change to that, never resending a stale copy; a probe changes another tab between read and write and checks the change survives.
- F2 (C): start reads the caller's `HC_TERMINAL_ID` before stripping inherited hc variables and passes it as `--parent` for consultants and direct reviewers.
- F3 (C): the engine's hc module list (engine-shape Q1) also holds the start command and `doc.get`; akrogon also calls herdr-app's `tab.rename`; `doc.set` lives only in the herdr-setup weights helper.
- F4 (D): the open-window probe also checks that the active tab and focused pane do not change.
- F5 (D): a failed rename leaves the seat running and status shows the tab unnamed; only a pane that never shows kills the agent (Q4).
- Probes for Q2: tab and slug name show in an already open window and in a window opened after start; B splits into A's tab in both; a running window keeps the name after B joins and after a split (C3).
- Corrections from the N2 check (B,C,D,E, 2026-11-06), recorded without changing a pick:
  - Window check first (C,E): start asks `herdr-app ls` with the session's `HERDR_APP_HOME`; only the "no Herdr window" answer means closed, any other error is reported (`doc.get` alone cannot tell, it serves the saved document with no window). Open: wait for the pane, kill on timeout (Q4), then `tab.rename`. Closed: start returns after `hc run` with the labels set, and adoption plus naming wait for the window; a closed window is never a failed placement (B,E).
  - Expected name follows the leaf's phase (D): `<slug> failed` when failed (`src/phase.ts:125-127`), the slug otherwise (`src/phase.ts:230-231`). akrogon owns leaf tab names as today, so a manual rename of a leaf tab is not kept (C note).
  - Scope (C): every engine pass that finds the window open renames every recorded leaf tab of the repo whose name differs from its expected name.
  - Window home source (C): `~/.config/herdr-app-sessions/<session>` is herdr-setup's convention and `default` has no such folder; where akrogon reads it goes to the config fork.
  - Probes added: window closed longer than start's pane wait, then opened: seats alive, named tab shows (B); a leaf failed while the window was closed shows `<slug> failed` after opening (D); window closed gives a clean pass with status showing the tab unnamed (C).

Correction proposed 2026-11-07 by A within Q3 (leaf review K3: B,C,E; forks/proofs.md P11), pending the operator's final approval: labels alone put a door and its consultants in one row with uneven weights, and an added consultant joins as a split of the last pane, so the herdr-setup helper also builds the column. Consultants start with the door's `herdr.space` and `herdr.tab` labels (read by the start verb from `doc.get` for the caller's terminal); the helper lays the door's tab out as the door on the left and one column on the right holding the door-created consultants in seat-letter order (door and column 50% each when it first builds it, per the operator's 2026-11-03 rule in INTAKE), equal heights when the set changes, and on a restart keeps the weight at that position; it works from its argument list and the current document only, and never moves supplied consultants or other panes (final check B,C,E). `doc.set` still lives only in herdr-setup; the engine never calls the helper.

Operator 2026-11-07, door t15, verbatim: "1a | 2a | 3a" (final handoff review Q1 approves the column correction above).

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

### Process containment and environment (forks/containment.md)


Operator 2026-11-06, door t15, verbatim: "1a, 2a - what does this fence even mean? Elid, 3a - this is only for charting, right?, 4a,"

A's answers to the questions (no pick changed): the fence is the systemd slice `akrogon.slice` (memory high 64G, max 96G, no swap, CPU weight 20 against the default 100) with one child slice per leaf; a leaf seat's processes and everything they start live there, so a runaway leaf is slowed or killed alone and `akrogon stop` ends every process of that leaf. 3a is not for charting: the settings are the leaf seats' (`AKROGON_BASE`, `TMPDIR` the leaf temp folder, `GIT_EDITOR=true`, `NODE_DISABLE_COMPILE_CACHE=1`); chart consultants and the door get none, as today.

Read as:
- Q1 1a: per-leaf boxing kept for leaf seats A and B, same slice and limits; consultants, direct reviewers and doors unboxed as today.
- Q2 2a: the start command wraps a leaf seat's harness as `systemd-run --user --scope --quiet --expand-environment=no --unit=<leaf slice base>-<seat name>-<random suffix>.scope --slice=<leaf slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -p SendSIGHUP=yes -- env ... <harness argv> "<task>"`; one read of `/proc/<pid>/cgroup` after the start proof confirms the scope, no loop. `adoptShell`, `paneShell`, the busctl call and the 50 ms poll in `src/next.ts:626-631` are deleted; `callerScope`, `stop-run`, `stop` and reconcile keep working unchanged.
- Q3 3a: leaf seat env by `env AKROGON_BASE=... GIT_EDITOR=true TMPDIR=<leaf temp> NODE_DISABLE_COMPILE_CACHE=1` inside the wrapped argv; one `hc run` path.
- Q4 4a: land, verify and check runs resolve the repo's hc session themselves per call (identity Taken), no forwarding of the caller's values; land's `--setenv` gains `XDG_RUNTIME_DIR` as verify has; check runs keep their allowlist and bus isolation.

Addition, operator 2026-11-07, door t15 (probe round Q3, forks/proofs.md P0), verbatim: "3a"

Read as: the start command clears, for every seat it starts, the session variables a running Claude Code hands to its children (`CLAUDECODE`, `CLAUDE_CODE_*`, `CLAUDE_PID`, `CLAUDE_EFFORT`) before the harness runs, inside the same exec chain so the terminal's `pid` stays the harness; the operator's own settings such as `CLAUDE_CONFIG_DIR` stay. Reason: a core restarted by a call from inside a Claude agent inherits that agent's variables (P0), and every Claude seat it starts then runs as a child session that writes no transcript, silently breaking usage, the watcher's log reads and reset confirmation. Done-criterion: a seat started from a core whose environment carries those variables shows none of them in `/proc/<pid>/environ`, writes its transcript, and its `pid` is the harness.

Final-shape check, 2026-11-07 (slots/final-probe-B.md, -C.md), applied by A within 3a: the cleared set is the child-session markers a running Claude Code exports, enumerated from P0: `CLAUDECODE`, `CLAUDE_CODE_CHILD_SESSION`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_EXECPATH`, `CLAUDE_CODE_MESSAGING_SOCKET`, `CLAUDE_CODE_MESSAGING_TOKEN`, `CLAUDE_CODE_SESSION_ATTENDED`, `CLAUDE_PID`, `CLAUDE_EFFORT`, by `env -u` in the existing `env` step; configuration keys are kept (B over C's prefix glob: the prefix also holds settings). The done-criterion adds a kept configuration variable to the case.

### Harness config (forks/config.md)

Operator 2026-11-07, door t15, verbatim: "1a, it needs to be on the list as well | 2a |"

Read as:
- `harnesses.codex` becomes `codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access` (agreed). Consultants keep the recipe recorded for their seat; a sandboxed codex consultant keeps `-c sandbox_workspace_write.network_access=true`.
- Q1 1a: `harnesses:` gains an `agy` entry: `agy --model {model} --effort {effort} <auto-approve> -i`, with `-i` last so the start verb's appended first task follows it. `<auto-approve>` is `--mode auto` or `--dangerously-skip-permissions`, decided by one probe before handoff that checks the effective mode and that tool use outside cwd and the `hc send` report work unattended for the chosen model and effort; a failed probe is reported, never silently swapped. No slot changes; agy becomes selectable for slots and for consultants through the start verb, with delivery's silent-stop handling and the session-id `/proc` path applying as for other kinds (watcher log tail keeps today's no-log path for agy).
- `harnesses.claude` unchanged (agreed). Doors in auto mode: a probe checks the existing `Bash(akrogon:*)` lets the start verb pass; the legacy `herdr agent start` `autoMode.allow` entry is retired at cutover (removed, or replaced by one narrow entry naming the start verb if the probe needs it); no `Bash(hc:*)`; akrogon never writes Claude settings.
- App home (agreed): one function in akrogon's hc module from herdr-setup's convention (`default` → `~/.config/herdr-app`, else `~/.config/herdr-app-sessions/<session>`); the caller's environment is never used; a missing folder is an error naming the expected path; `herdrapp session list --json` is used only in the e2e assertion that the two agree.
- Q2 2a (operator answer to A's separate question on the deleted Tasks board): the final sweep deletes akrogon's Tasks mod (`herdr-app/tasks/`), its tests (`tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`) and akrogon install's herdr-app mod linking with its stale-link pruning, since `tasks` is the only mod akrogon ships; the installed link `~/.config/herdr-app/mods/tasks` is removed by that install, and the infra session's link to it (`~/.config/herdr-app-sessions/infra/mods/tasks`, made by herdr-setup's `session link`) is checked and removed in the same step.

Correction, operator 2026-11-07, door t15 (probe round, forks/proofs.md P3), verbatim: "1a | 2b - if that doesn't work, I'll approve the working akrogon folder manually so it can work in any repo. | 3 - I don't understand, elid. What are the consequences"

Read as (2b, proven by P8): the start verb starts agy without the task in argv (`harnesses.agy` is `agy --model {model} --effort {effort} --mode auto`, no `-i`); when agy's status is `blocked`, `kind: permission`, `msg: Trust this folder?` it presses enter once, waits for `idle`, then delivers the first task by `hc send`, so the turn counts and the start proof follows delivery Q1. Cost: agy adds each answered folder to `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces`, one entry per agy leaf worktree. The operator's fallback (trusting the akrogon worktree folder once) would not cover worktrees inside it: P5 showed trust is per exact folder (`/home/ivan` listed did not cover its subfolders).

Final-shape check, 2026-11-07 (slots/final-probe-B..E.md), applied by A within 2b: agy's ready state is either `idle`, turn 0, with no dialog (already trusted folder: repo-root consultants, a restarted seat in the same worktree), or the trust dialog (`blocked`, `kind: permission`, `msg: Trust this folder?`), answered by exactly one enter, then `idle`; then exactly one first-task send and the normal start proof (B,C,E). For every kind, a first send refused with `kind: unavailable` ("still starting", nothing typed) is sent again on the seat's next status event within the 60 s start budget; this is not the `started: false` case delivery Q2 forbids resending (C). Unattended tool use outside cwd under `--mode auto` is shown by P5's fourth agy run (wrote `agy-outside.txt` outside its cwd); the agy leaf keeps it as a done-criterion (C).

### Test fakes and e2e (forks/tests.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2a | how long is the testing going to last for? Make sure the tests are meaningful and don't take too much time, ok?"

Read as:
- Q1 1a: `tests/fake-herdr.ts` is replaced by a real throwaway hc core per fixture (`HC_SESSION` unique per fixture, scratch XDG runtime and state under the suite root with the socket path under 107 bytes, inherited `HC_TERMINAL_*`/`HC_SCOPE` stripped, stopped on teardown, swept by `tests/isolation.ts`'s subreaper) and a small stand-in agent script that emits OSC 7501 status and does the scripted thing (write a return file, `hc send` its parent, block, exit, stay silent, stay idle). Error cases are produced on the real core (second `--name`, `state=blocked`, idle stand-in for `started: false`, `hc server restart`, `chmod 000` socket, stopped core). Only `herdr-app` is faked: strict, refusing unplanned calls, captures dated and refreshed by the window tier. No fake `hc`. `fake-busctl.ts` goes with `adoptShell`; `fake-proc.ts` keeps only helpers of the new design (resolver fds, leaf-slice identity).
- Q2 2a: the real-hc tests run inside the normal `test` check, so every verify and merge sees an hc regression; separate files, each with its own core; a machine without hc fails the check clearly. The window tier and the paid per-kind tier stay separate attended runs that fail rather than skip.
- Time and meaning (operator condition, binding for every leaf): the `test` check stays about as fast as today (median 75 s, max 121 s over the last 60 verify runs, `issues/verify-runs.jsonl`; a test check took 73-74 s on 2026-11-04, `issues/timings.jsonl`). Real-hc tests wait on hc events or `hc wait`, never sleeps, and each finishes in a few seconds. Each test checks a behavior akrogon relies on from a taken fork (start and first-task proof, delivery and turns, reports, listener wakes, silent-stop bound, restart, containment, notices, weights, session-id path, observe lines); none re-tests hc itself. Tests of removed behavior are deleted, not ported. Done-criterion per leaf: the leaf's verify `test` duration is recorded and compared with today's; a leaf that adds more than about 10 s says why in its evidence.
- Agreed, not asked: 2a proof before deleting old herdr is the full suite green plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check, logs kept. Each leaf ports its own tests; the engine leaf lands the fixture core, stand-in and fake `herdr-app`; each leaf names the old tests it replaces; ownership and partial-state guarantees are kept; the sweep removes obsolete machinery after the proof (wording scope stays with cutover).

### Exclusions

- identity, engine-shape, start-and-pane Q1/Q2/Q4, delivery Q1-Q3, containment, config codex/agy lines and app home: delivered by engine-on-hc; this leaf uses the start verb and resolver as delivered. containment applies only through the start verb's `env -u` step (consultants are unboxed).
- watcher, notices: watcher-on-hc and notices-on-hc.
- herdr-skill, patch-mechanism: herdr-setup leaves. The weights helper is consultant-weights in herdr-setup; this leaf calls it and needs it installed (needs N6).
- cutover: removal and wording outside the chart skill belong to herdr-sweep and the operator; the legacy `herdr agent start` `autoMode.allow` entry is retired by the operator (needs N2).
- tests: the fixture core and stand-in are engine-on-hc's; this leaf ports its own tests.

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- Exchange wiring and reset logic are proven at the real hc boundary with stand-ins (criteria 1, 3), the cheapest test that catches a wrong wake or a missed cancel; nudge and drop are skill text, proven in one attended round (criterion 2) (C,E).
- Whether a reset gives a new conversation and where its transcript lands is a property of each harness (forks/proofs.md P3), so criterion 4 runs real claude, codex and pi once each, side by side, each with its own throwaway cwd and log; it names the live-interaction property (keys typed into a live agent, a new transcript) that recordings cannot show.
- Criterion 6 is a Claude Code permission decision only a real Claude door shows (E).
- `chart-usage.ts` uses committed transcript recordings as test input.
- This leaf changes the door's own skill: the change reaches doors at the next release link.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/scripts/` (deleting the peer scripts, porting `door-reset.ts`, `chart-usage.ts`), the resolver's code lookup in `src/`, `tests/peer-*.test.ts`, `tests/door-reset.test.ts` and their replacements.

Literal interfaces:
- Consultant start: the engine's start verb with the seat letter and recipe; restart `hc kill <address>`, `hc rm <address>`, then the same start (C); ask `hc send <address> "You are slot <X>. Read and follow <brief path>"`; report `hc send <door> "done <X>: <path>"`; wait `hc wait --children all --timeout <s> --json` (a timeout is a check-in, never a drop).
- Column helper: herdr-setup's `herdr-consultant-column [--save | --restart] <door terminal> <consultant terminal>...` (consultant-weights leaf), with the door-created consultants in seat-letter order: plain after a start or removal; for a restart, `--save` before `hc kill`, then `hc kill`, `hc rm`, the same start, then `--restart` (B,D,E); a "door not in a tab" exit is recorded once in the round log and the round continues; any other non-zero exit is a check-in for A, never a stop (C); supplied consultants are never passed and never moved (B,C,E).
- Cancel check: the operator input records of A's transcript per kind (claude `user` entry or `queued_command` attachment with `origin.kind` `human`, codex `task_started` or role-`user` `response_item`, pi role-`user` `message`), read through the resolver's path, as today's `door-reset.ts` does (operator 3a).
- Reset helper: `hc run --bg --no-notify --rm --no-parent -- <helper> <A address> ...`; keys `/clear` (claude) or `/new` (codex, pi) then `enter` by `hc keys`; warm-up `hc send <A> "reply OK <code>"`; label `hc label <A> akrogon.transcript=<path>`.
- Code lookup (resolver): runs after the warm-up turn ended; claude `~/.claude/projects/<cwd-mangled>/` (`CLAUDE_CONFIG_DIR` else `~/.claude`) and pi's sessions folder for the cwd, files modified after the reset began; codex the rollouts open in `/proc/<pid>/fd`, newest first; the file containing the code wins.
- seats.yaml per seat: `seat`, hc `address`, `name`, launch recipe, `session` as the transcript path; a new entry when address or path changes; an unknown path is never the same conversation.

State and preconditions changed, with consumers:
- seats.yaml `session` becomes a path for every kind. Consumers: `chart-usage.ts` (reads it), the handover continuation rule in `SKILL.md` (compares paths), shapes.md's seats.yaml section.
- The transcript label after a reset. Consumer: the engine's resolver returns the label's path for later lookups without a code (session-id final-shape), used by usage and the watcher.
- The old exchange used `peer-wait.ts` and pane ids; the Mode record's handover entry keeps its shape with the pane replaced by the hc address. `Open for the plan:` the exact handover entry and start prompt wording with hc addresses.
- `Open for the plan:` how the reset helper reaches the resolver's code lookup (import from `src/` in the release or an akrogon CLI verb), keeping one resolver.

Stated limit (session-id final-shape): a reset akrogon did not perform is not detected.

Dependencies: engine-on-hc (blocked-by); herdr-setup consultant-weights merged and `./install` run, held by the readiness input `herdr-consultant-column` (B,E; needs N6); needs N2 if criterion 6 is refused.
