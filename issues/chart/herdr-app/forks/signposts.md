# Signposts: herdr-app

Original for the door session opened 2026-11-06T11:09:05Z in door t15 (chart herdr-app). Angles merged from slots/signposts-A.md, slots/signposts-B.md, slots/signposts-C.md, slots/signposts-D.md, slots/signposts-E.md. Proposed answers from the latest earlier record (issues/chart/round-drawings/forks/signposts.md, 2026-11-04) are shown where a question matches one of its answers.

Settled in the intake, not asked: one cutover with no compatibility layer or fallback; every agent akrogon starts gets a visible pane in the same step, owned by the start helper; consultant names `<repo prefix>-slot-<letter>`; chart work in the chart folder from open; consultant reset is kill and restart; a seat's own `hc send` report is the finish signal, no polling (operator 2026-11-06). This session charts herdr-app only.

## Question

1. Code or written rule: when a step can be either an akrogon helper (code) or an `hc` command the agent types from skill text, which do we pick?
   - 1a (recommended, A,C) Code only for the start step you already asked for (name, labels, visible pane, harness argv). Everything else becomes plain `hc` commands in skill text.
   - 1b Code for every step that talks to hc (start, send, wait, restart).
   - 1c Skill text for all of it, start included. Last session you picked "written rules only" (1c there).
   - Steers: what is left of the peer-*/door-reset scripts, whether a shared `hc` module exists in `src/`, how much the tests pin.

2. Old guards and features: when something exists only because old herdr needed it, do we keep it?
   - 2a (recommended, A,D,E) Delete by default. Keep a guard only where testing recorded hc being wrong (`started: true` not proof, a codex popup eating prompts, a sandbox blocking `hc send`). Features that only old herdr made possible (per-seat usage from the agent session id, desktop toasts, systemd boxing of agent panes, the cron-based observer) are dropped unless you name one to keep.
   - 2b Keep every feature, rebuilt on hc.
   - Steers: session-id lookups per harness, `scope.ts`, notices, watch-issues, `seats.yaml` and `state.yaml` shape, leaf count.

3. Gaps in hc or herdr-app (no agent session id, codex shows `working` while asking a question, no notify command): what do we do?
   - 3a (recommended, A,C,D,E) Ship on what hc and herdr-app offer today through their public commands. Report each gap through `herdr-app feedback`. Never write herdr-app's own private files. (Equal pane heights turned out reachable today by placing panes in a set order, so that one is no longer a gap for four seats.)
   - 3b (B) Get the missing feature into hc or herdr-app first, then build on it.
   - 3c Fill gaps inside akrogon however works, private files included.
   - Steers: epic order, codex stall handling, notifications, whether any leaf waits on a herdr release.

4. Nobody watching: when an agent dies without reporting, or the computer restarts, who notices?
   - 4a (recommended, A,C,E) One small always-on listener follows hc's event stream (a push, not polling), records the death and wakes the next step. A dead task is never redone automatically.
   - 4b (B,D) Nothing always-on. Each slot moves the work forward itself when it finishes. A silent death waits until you or the next command notices.
   - Steers: what replaces the herdr plugin, startup `pull` and `--resume`, whether leaf slots outlive their starter, watch-issues.

5. Agents outside akrogon: may anything change how Claude Code, Codex, pi or agy behave when they run outside herdr-app?
   - 5a (recommended, A,B,D) No. Awareness reaches an agent only when it runs inside herdr-core (`HC_TERMINAL_ID` set). Global CLAUDE.md and AGENTS.md stay untouched.
   - 5b (C,E) One short line in the global files is allowed, if it only acts when `HC_TERMINAL_ID` is set.
   - Steers: the awareness fork (skill, gated line, or akrogon's own briefs), removing the old `herdr` skill, what `akrogon install` owns outside the repo.

6. Getting started: the port's own work is normally run by akrogon's engine, which still talks to old herdr, and every merge to main goes live at once. How does the port itself run?
   - 6a (recommended, A,C,D,E) The engine part first, as one small piece built by the door itself or by hand in herdr-app. Once it is live, every later piece runs through the new engine, which also proves it.
   - 6b Run every piece in the old herdr `infra` session (still running) one last time, holding releases until the last piece lands. A hold that long does not exist yet.
   - 6c Build the whole port by hand outside akrogon's normal flow.
   - Steers: piece order, whether a release hold is built, where you watch the work during the port.

7. Live proof: proving start, report, restart and pane placement on four agent kinds costs paid model runs. How much do we prove before handing the work off?
   - 7a (recommended, A,B) One smallest live run per operation per agent kind while charting, in a throwaway herdr-app session, within one paid budget you approve. Last session you picked this (3a there).
   - 7b Use the hand tests already recorded in the intake as proof, and let the build prove the rest.
   - Steers: the proof list, charting time, which agent quirks become done-criteria.

## Taken

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
