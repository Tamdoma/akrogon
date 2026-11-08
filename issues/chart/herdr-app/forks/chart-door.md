# Chart door on hc

## Question

Today the chart door drives consultants through herdr scripts in `skills/chart-issues/scripts/` (`peer-create.ts`, `peer-ask.ts`, `peer-wait.ts`, `peer-anchor.ts`, `peer-restart.ts`), resets itself at handover with `door-reset.ts` (claude `/clear`, codex and pi `/new`), gates pane creation on `HERDR_ENV=1`, and records seats by herdr pane and session (`skills/chart-issues/SKILL.md` Open, Handover; `assets/questions.md` peer rules). This chart's own door already runs the new way by hand: consultants started with `hc run`, briefs sent by `hc send`, reports arriving as `<hc from=...>done X: <path></hc>`, with `hc wait --children all` as a safety net. Operator 2026-11-06: no polling or waiting, `<hc>` messages wherever possible, fewest moving parts, nothing that works today may break.

1. Consultants: create and restart through the start command (start-and-pane), ask by plain `hc send`, collect by their `<hc>` report (delivery Q4: return file plus report, one nudge, then drop). What, if anything, replaces `peer-wait`'s safety net: hc's own child notes typed into the door when a child's turn ends, blocks or exits (consultants are the door's children), a kept `hc wait --children`, or nothing beyond the reports? Does any script survive?
2. A's own reset at handover: the door sends itself `/clear` or `/new` through hc (delivered when its turn ends), a successor door started by the start command, or something else? How does fresh A find the handover entry?
3. Gates and records: `HERDR_ENV=1` becomes `HC_TERMINAL_ID`; the door's temp-path rule goes; seats.yaml `pane` becomes the hc address (and name), `session` the transcript path (session-id Taken). Anything else in the skill text tied to herdr?

### Carries

- Operator clarification 2026-11-06 (signposts.md): no polling or waiting; seats communicate by `hc send` / `<hc>` messages wherever possible. Today's door safety-net `hc wait --children` and timed checks are to be judged against it.

- Signposts: forks/signposts.md `## Taken` and its 2026-11-06 directions.
- All taken forks' `## Taken` (binding): engine-shape, identity, start-and-pane, delivery, session-id, notices, containment, watcher.
- Map: slots/map-merged.md fork "chart-door".

## Findings

- Merged notes: slots/fork-chart-door-merged.md (A,B,C,D,E with rebuttal corrections).
- Corrected: hc types a child note only when a child cannot report (blocked, error, exited); a quiet `done` without a report produces nothing (C,E; `hc --skill`); E's live silent stop was caught by `hc wait --children all`.
- Q1: peer scripts go, `chart-usage.ts` and `direct-guards.ts` stay; start command, `hc send`, `<hc>` report plus return file (all). Silent-end net: one `hc wait --children all` per exchange (C,E) vs only at restart/handoff/handover (D) vs none, with an herdr-setup capability if hc lacks the push (B). Supplied consultants: never restarted by the door (D) vs restarted at chart entry when the door may (B).
- Q2: detached reset helper on hc events, typing the reset as keys and confirming a new transcript before the start prompt (C,D,E; needs an operator exception to signpost 1a, B; stages to be proven, B) vs two self-sends (simpler, loses cancel and new-session checks).
- Q3: gate `HC_TERMINAL_ID` plus `hc get` answering; folder at Open; seats.yaml address, name, launch recipe, transcript path; sweep of 65/35, drop/collection wording, Mode record, direct reviewer (all).

## Taken

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
