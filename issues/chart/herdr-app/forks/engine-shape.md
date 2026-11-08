# Engine on hc

## Question

Q1. Signpost 1a says "akrogon code only for starting an agent; every other hc step is plain `hc` commands in skill text." Does that bind the engine's own hc calls (prompting a leaf seat, reading seat status, closing a finished leaf's tab), or only steps an agent performs from skill text (door, consultants, watcher)?

Q2. What wakes the engine once the herdr plugin is gone (today: `plugin/herdr-plugin.toml` runs `pull --all` and `next --resume` at herdr start, and `next` on status, exit and close events), and who installs and restarts it (akrogon install/self-update, or herdr-setup)?

Q3. What advances a leaf on success? Today a seat runs `akrogon phase` during its turn, and the next seat is prompted by `next` when the plugin reports the seat's status change (`akrogon phase` itself only wakes merge work, `src/akrogon.ts:79-96`). On hc: a turn-end event from `hc events` (same flow as today), `akrogon phase` dispatching the next seat directly, or both?

### Carries

- Signposts (forks/signposts.md `## Taken`): 1a code only for the start step; 2a remove everything old, e2e proof before deletion; 3 gaps patched in herdr-setup; 4a an event listener notices crashes, watch-issues auto-fixes, workflow unchanged; 6a engine first.
- Operator 2026-11-06 verbatim: "There will also be no polling. Every time the slot needs to communicate something with the other slot, we need to make sure that it sends the message." and "I don't want to change how the workflow is done, I just want to move and upgrade everything to herd-core and herdr-app."
- Map: slots/map-merged.md fork 1; related forks: identity.md, lifetime.md, watcher.md.

## Findings

Merged notes: slots/fork-engine-shape-merged.md (with rebuttal corrections); seat notes slots/fork-engine-shape-{A,B,C,D,E}.md; rebuttals slots/fork-engine-shape-rebuttal-{B,C,D,E}.md.

- Q1: all seats read 1a as binding agent steps in skill text, not the engine's own hc calls. B asks the operator to confirm it.
- Q2: all seats pick a systemd user listener per hc session, installed and restarted by akrogon install/self-update, running `pull --all`, `next --resume`, then following `hc events` with single-flight passes. Restart only after a deploy completes (B).
- Q3: split. Turn-end event only (B,C) versus phase also running `next <slug>` through the same dispatcher (A,D,E; C's mechanism). Today phase already dispatches merge and broadcast seats directly (`src/next.ts:1148-1333`, verified).
- Research: better-than-training · `plugin/herdr-plugin.toml`, `src/next.ts`, `src/akrogon.ts:79-96`, `hc events --help` (no replay cursor) · 2026-11-06. practitioner · Supervisor event listener docs (https://www.supervisord.org/events.html) and superlance crashmail (https://superlance.readthedocs.io/en/latest/crashmail.html): listeners act on unexpected exits, must survive redelivery and buffer loss · 2026-11-06. practitioner · Evil Martians, Overmind (https://evilmartians.com/chronicles/introducing-overmind-and-hivemind, 2017): keep process control separate from the work it runs · 2026-11-06.

## Taken

Operator 2026-11-06, door t15, verbatim: "1a | 2 - whatever is the closest to how akrogon works now on the old herdr. Again, the goal is not to invent new stuff, it's to move from the old herdr to the new herdr-core and herdr app while keeping and making everything elegant and working | 3b - let's test with that, but if 3a is better, I have no problem swapping to it |"

Read as:
- Q1 1a: signpost 1a binds steps agents perform from skill text. The engine keeps one small hc module in `src/` with a closed command list (prompt a seat with its guards, read status, close a finished tab, kill on stop), exporting nothing for skills. Foreclosed: an agent or the seats driving dispatch.
- Q2 2a, by A applying the operator's criterion "closest to how akrogon works now": the old plugin is installed by akrogon (`herdr plugin link`) and lives as long as the herdr server; the closest equivalent is a systemd user service installed and restarted by akrogon install/self-update that lives as long as herdr-core runs. It runs `pull --all` then `next --resume` at start (the plugin's startup pair), follows `hc events` filtered to akrogon terminals, runs `next` on turn end, blocked and exit (the plugin's events), single-flight, restarts and catches up when the stream ends, and is restarted only after a deploy fully completes. Foreclosed: a herdr-app mod (window lifetime, not core lifetime), herdr-setup ownership (the plugin was akrogon's).
- Q3 3b, as a tested choice: `akrogon phase` ends by running `next` for its own leaf through the existing dispatcher (busy seat refused, one prompt per phase and seat); the turn-end event covers same-seat phases, crash, exit and blocked. The engine leaf's end-to-end test exercises it; if the test shows 3a is better (for example a mid-turn prompt or a double prompt), the operator accepts swapping to 3a, recorded as a correction here.
- Binding decisions carried to the engine leaf: one hc module with a closed command list; listener subscribes before its catch-up pass; listener restart only after a completed deploy, proven by a self-update triggered through the listener; `akrogon status` shows listener liveness; status is a wake, never success evidence (advancement reads phase/done state); one prompt per seat per phase proven end to end.
- Amended 2026-11-06 by start-and-pane F3: the hc module's closed list also holds the start command and `doc.get`; akrogon also calls herdr-app's `tab.rename`.
- Corrected 2026-11-06 by delivery round 4: "one prompt per seat per phase" reads "one prompt per seat per turn" (phase run and turn-end event never both prompt the same idle turn; a re-prompt after a silent stop is allowed, bounded per delivery Q3).
