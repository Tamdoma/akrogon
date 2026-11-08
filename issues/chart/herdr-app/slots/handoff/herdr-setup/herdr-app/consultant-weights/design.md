# Design: consultant-weights

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

### Patches in herdr-setup (forks/patch-mechanism.md)

Operator 2026-11-07, door t15, verbatim: "1a | 2b |"

Read as:
- A herdr-setup patch is herdr-setup files on public surfaces only: mods (clones carry `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers that call `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. No PATH wrappers shadowing `hc` or `herdr-app`, no binary edits, no version pin.
- Q1 1a: no source patches to herdr-core or herdr-app, even though their source is public. A gap that only their code can fix gets a `herdr-app feedback` draft and comes back to the operator as a new decision.
- Q2 2b: herdr-setup gets one check command the operator runs after an hc or herdr-app update. It runs herdr-setup's checks and behavior tests (observing the new build actually loaded, not assuming a layout switch did it), probes a named session (`herdrapp session list`, `hc ls` inside it, since `HC_SESSION` is undocumented), diffs clones against the shipped copies, and prints the installed hc and herdr-app versions beside the last pair that passed. No automatic trigger and no timer: herdr-app has no post-update hook.
- Agreed, not asked: when upstream ships the missing feature, the patch is deleted and the caller moves to the native surface in one change, after it passes the same behavior test, no fallback. Each real gap gets one feedback draft for the operator, recorded with the patch as drafted, sent or declined. Tests on both sides: herdr-setup tests its half; akrogon's e2e in a throwaway session tests the contract against real hc and herdr-app (notices observe the toast posted before deletion and pending kept on a posting failure) and fails clearly when herdr-setup is not installed. herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs.

### Exclusions

- The door's call sites are akrogon's chart-door-on-hc. The start verb and its labels (consultants get the door's space and tab) are akrogon's engine-on-hc; this helper owns only the document shape of the door's tab (B,C,E).
- identity, engine-shape, delivery, session-id, notices, containment, watcher, herdr-skill, tests, cutover, config: akrogon leaves, other herdr-setup leaves and operator steps.
- patch-mechanism: applies as "a named `bin/` helper calling `hc connect` (`doc.get`/`doc.set`)".

### Standing design

Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf: the column rewrite is pure logic, tested on the recorded P11 document shapes; the versioned write and conflict retry are runtime behavior of the real core, shown once in the attended window tier with a deliberate change between read and write.

## Leaf architecture

Owned surfaces: `bin/herdr-consultant-column` (and a routine file if the plan wants one), `install` (one `link` line), its tests, recorded P11 document fixtures.

Literal interfaces:
- `echo '{"jsonrpc":"2.0","id":1,"method":"doc.get","params":{"name":"herdr-app"}}' | hc connect` and the matching `doc.set` with `version`; `conflict` means re-read (forks/proofs.md P7).
- CLI: `herdr-consultant-column [--save | --restart] <door terminal> <consultant terminal>...`; snapshot document `herdr-setup.consultant-column` (`doc.get`/`doc.set` by name, versioned like the layout document) holding per door terminal the ordered consultant terminals and their weights (B,E), exit 0 when the re-read shows the column as intended, non-zero with the reason otherwise.
- Layout nodes: `row`, `column`, `block` with `size.weight` and `content.terminal` (herdr-app AGENTS.md; P11).

State and preconditions changed, with consumers:
- The document's weights for the consultant column. Consumer: herdr-app's layout drawing, and the operator's dragged sizes, which only this helper overwrites and only when the door calls it.
- Terminals map to `block` nodes by `content.terminal`; the door's tab is the one whose tree holds the door's terminal (P11 `doc3.json`). A restart is told by the door with `--save` before the kill and `--restart` after the new start: after `hc rm` the old block's weight is gone and a last-seat restart looks like an added last seat (B,D,E); the replaced position is the one where the new list differs from the saved list. What the document holds after `hc kill` and `hc rm` of an adopted (kept) terminal is not yet observed (P11 saw a killed kept child keep its pane; AGENTS.md says a killed terminal is closed); criterion 2 records it, and the helper drops any block whose terminal is not live, so either answer works (C).
- Upstream gaps met while building get one `herdr-app feedback` draft text each in the report; the operator sends (B).

Dependencies: none (akrogon's chart-door-on-hc needs it installed before its window tier).
