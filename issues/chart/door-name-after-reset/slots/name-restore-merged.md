# Merged notes: name-restore

Sources: slots/map-A.md, slots/map-B.md, slots/map-C.md. Tags name the slots that wrote the point.

## Q1 Where does the name come from?

- 1a (A,B,C) The session's own name is the last `custom-title` record's `customTitle` in the pre-reset transcript, read with `transcriptRecords(pre, 0)` after the input check. When there is none, the name of the tab that holds A, from `docGet(session)`: the tab in the resolved space whose `terminals` lists A's address (A,B). C would find the tab through A's `herdr.tab` label and then `docGet` by id; same result, one more input.
- 1b (rejected A,B,C) hc `title`: an auto title on an unnamed session. `where` label split: display text.
- 1c (rejected C) claude's `~/.claude/sessions/<pid>.json` (`name`, `nameSource`): agrees with 1a on both doors, needs a pid the transcript code keeps private.
- Evidence: P7 (live document lists t126 only under `c-akrogon`); t126 transcript holds `custom-title: c-akrogon`, t3k's chain holds none (INTAKE F4).

## Q2 When and how is it put back?

- 2a (C; A after P3 to P6) Before the reset, and only when the session has no name of its own: after the input check the helper sends `/rename <tab name>` to the old idle session, waits for that short turn to end, then types `/clear` as today. A named session gets nothing extra, because claude carries its name across `/clear`. Cost: rests on claude carrying the name (seen on 2.1.322, 2.1.323, 2.1.325, about ten real handovers and probes P1, P2, P6). If a later claude stops carrying it, names are lost at every handover and the log shows `sent` each time.
- 2b (B; A's first view) After `/clear`, before the start prompt, always. Does not rest on the carry. Cost: one more input inside the stretch between the reset and the start prompt, which the stand-in records as timing-sensitive (the clear turn ended 2 ms after the next input on t3k, C); a rename left unsubmitted there glues to the start prompt and breaks the handover, a worse failure than a missing name (signpost 5a). P5 showed it working once.
- 2c (rejected A,B,C) both sides, or fresh A renaming itself.
- How (A, by probe): `send(session, a, '/rename <name>')`, not keys. P3: `hc keys` refuses `_` and types `A` as `a`. P4: the pasted command runs as `/rename`, keeps case, `_` and spaces, makes no model reply, and counts as an hc turn. B's map asked for keys on the comment in door-reset.ts; P4 answers that for `/rename`. Always pass the name: a bare `/rename` may ask the model (C).
- A send answering `started: false` gets one enter, like the start prompt (A).

## Q3 What does the helper log, and what happens on failure?

- 3a (C; B agrees on the boundary) One new stage `name`, always logged, between `input-check` and `reset-keys`: `kept` (own name found, with the name), `sent` (tab name sent, with the name), `skipped` (with the reason: harness not claude, no tab or blank tab name, name holds a control character or newline, or the send failed). Only failures of the name stage are caught, by their specific types; reset, cancel and start-prompt failures keep today's paths (B). The helper does not confirm the name landed (B,C).
- 3b (rejected) log only when something was sent; stop the handover (B's signposts dissent, recorded there).

## Q4 Other harnesses

- (A,B,C) codex, pi and agy log `skipped`. Evidence: pi 1.5.2 `/new` builds a fresh session and drops `session_info` (B, source inspection); codex 0.169.0 has a rename dialog, carry across `/new` unobserved (B,C). The limit goes into handover.md.

## Pitfalls and what removes each

- A rename glued to the next input: the `started: false` enter and the wait for the rename turn to end before `/clear` (2a).
- A name that cannot be sent safely (newline, control character): skipped and logged (B).
- Operator input: the name stage runs after the existing cancel check and adds no new check; the stated limit on unsubmitted text stays (B).
- Tab renamed later: read at each unnamed handover, never stored (B). Once sent, the name is the session's own and wins (C).
- Stand-in: tests/door-agent.ts gains `/rename <name>` as a local command that appends `custom-title` with no turn, and carries the last title to the new transcript on `/clear`, as claude does (C). The test reads the resulting transcript, not only the inputs (B). The hc test core already writes a herdr-app document (C).

## Where slots differ

- Order: C before the reset; B after it; A moved from after to before on the handover-safety cost. B's point that the operator asked for the name "after the restart" is met by the outcome under both.
- Tab lookup: membership (A,B) or `herdr.tab` label (C).
