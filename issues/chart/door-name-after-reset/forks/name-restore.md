# Name restore

## Question

Q1. Where does the reset helper get the name it puts back?
Q2. When and how does it put the name back?
Q3. What does the helper log, what happens on failure, and what about harnesses other than claude?

### Carries

- forks/signposts.md Taken: `1b 2a 3a 4a 5a 6a 7a` (A's picks).
- Operator, 2026-11-14: "The name has to be the previous name. I always give the name initially, but it's usually the name of the tab".

## Findings

Leaf review: slots/leaf-review-B.md (no disagreement), slots/leaf-review-C.md (four corrections, all adopted). Maps: slots/map-A.md, slots/map-B.md, slots/map-C.md. Merged notes: slots/name-restore-merged.md. Rebuttals: slots/name-restore-rebuttal-B.md, slots/name-restore-rebuttal-C.md.

Research, tier better-than-training, all read or run 2026-11-14:

- INTAKE.md F1 to F6: the name is claude's `custom-title` transcript record; claude carries an existing name across `/clear`; the framework door has had none since a new process on 2026-11-12.
- Probes by A, slots/map-A.md P1 to P7, claude 2.1.325, haiku, throwaway terminals t1v2, t1v3, t1v6, t1v9 (4 of 8 allowed sessions, each killed and removed, `hc ls` shows none left):
  - P3 `hc keys` refuses `_` and types `A` as `a`, so keys cannot carry a general name.
  - P4 `env -u HC_TERMINAL_ID hc send --json <t> "/rename c-Probe_2 x"` runs the command, keeps the name exact, makes no model reply and counts as an hc turn. Limits: one claude version, one account.
  - P6 unnamed session, send `/rename c-Tab Name_4` (answer `started: true`, turn 1; after `hc wait` status done, turn 2), `/clear` by keys, a prompt by send: the new transcript's line 1 is `custom-title: c-Tab Name_4`. Limits: proves claude's behavior for this order on 2.1.325; does not prove the helper's code, which is the leaf's own tests.
  - P7 `docGet(session)` at d44920b8 lists t126 only under tab `c-akrogon` of the akrogon space. Limits: read of one live document.
- Existing checker, `bun test --timeout=60000 tests/door-reset.test.ts` on main d44920b8: 11 pass, 0 fail (slots/evidence/door-reset-main-d44920b8.log). Limits: shows the stand-in, the real hc test core and the current stages work on the base; shows nothing about the name stage.
- B, source inspection: pi 1.5.2 `/new` builds a fresh session without the old `session_info` name. B and C: codex 0.169.0 has a rename dialog; carry across `/new` unobserved.

Attribution: 1a (A,B,C); order 2a (C, then A after P3 to P6), 2b (B's map, dropped in rebuttal); send not keys (A, by probe); log stage (C, B on the catch boundary); stand-in runs the rename as a turn (B,C rebuttals); wait condition and stop at the bound (C rebuttal). No disagreement remains.

## Taken

A's picks under full autopilot (2026-11-14, door t126), not operator words: `1a 2a 3a`.

Q1 1a. The session's own name is the `customTitle` of the last `custom-title` record in the pre-reset transcript, read after the input check. When there is none, the name of the tab in the repo's resolved space whose terminals list A's address, read from the herdr-app document at that moment. Nothing is stored between sessions. Reason: signposts 1b, 2a, 6a. Rejected: the hc `title` (an auto title on an unnamed session); the `where` label (display text); claude's per-process session file (needs a pid the transcript code keeps private); the `herdr.tab` label route (same tab, one more input, dropped by C).

Q2 2a. Only when the session has no name of its own and a tab name was found, the helper sends `/rename <tab name>` as text to the old idle session, after the input check and before the reset keys; a send answering `started: false` gets one enter, as the start prompt does. It then waits until that rename turn has ended: A idle or done with a turn count above the one the send answered. Then the reset and start prompt run as today. A session with its own name gets no extra input, because claude carries the name across `/clear`. Reason: signpost 5a ranks the handover above the name, and this order adds nothing between the reset and the start prompt. Stated cost: it rests on claude carrying the name across `/clear` (seen on 2.1.322, 2.1.323, 2.1.325); if that stops, the log shows `sent` at every handover while names stay lost. Rejected: rename after the reset every time (B's map; an input stuck there glues to the start prompt and breaks the handover); both sides; keys (P3); a bare `/rename` (may call the model).

Q3 3a. One new stage `name`, logged at every handover, between `input-check` and `reset-keys`: `kept` with the name, `sent` with the name, or `skipped` with the reason (harness is not claude, no tab lists A or its name is blank, the name holds a control character or line break, or the name read or send failed). A skip continues the handover; only failures of the name stage are caught, by their own types, and reset, cancel and start-prompt failures keep today's paths. The helper does not confirm the name landed. One exception to "skip and continue": when the rename turn is still open at the bound, the helper logs the stop, types nothing more and exits non-zero, the same rule as `wait-turn-end: turn open`. Codex, pi and agy log `skipped`; handover.md states the limit. Reason: signposts 4a and 5a; the exception because typing a reset into an open turn is the glue case. Rejected: logging only when something was sent; stopping the handover whenever no name can be set (B's signposts dissent, recorded there).

Correction to Q3, adopted by A on 2026-11-14 after the leaf review (C D1, D2; final check by B and C in slots/name-restore-final-check-*.md): the skip reasons are only these three: the harness is not claude, no tab lists A or its name is blank, the name holds a control character or line break. The name stage catches nothing. A thrown error while reading the name or sending the rename keeps today's failing path: the error lands in the log, the helper exits non-zero and types nothing more. Reason: the transcript was already read by the input check; the tab read is a second document call that can fail by itself, but a core that fails it would likely fail the reset keys next, so ending there loses nothing (C); and a send that throws may have pasted `/rename <name>` without enter, onto which the reset keys would glue (C). This replaces "or the name read or send failed" and "only failures of the name stage are caught, by their own types". A blank `customTitle` counts as no name of its own (C). The thrown-error path is a second narrow exception to signpost 5a, beside the open-turn stop (C).

Pitfalls avoided, binding: no name is sent as keys; no name with a control character or line break is sent; the reset is never typed into an open rename turn; the test stand-in runs `/rename <name>` as an hc turn with no model reply and carries the last name to the new transcript on `/clear`, as claude does; the tests read the name from the resulting transcript, not only the inputs; the operator-input cancel rule and its stated limit stay as they are.
