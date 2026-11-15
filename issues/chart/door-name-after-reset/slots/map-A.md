# Map, slot A

Probes run by A on 2026-11-14 with claude 2.1.325, haiku, throwaway terminals t1v2, t1v3, t1v6 (all killed and removed; 3 of the 8 allowed sessions used):

- P1 `-n probe-kept`, `/clear` by keys, one prompt: new transcript line 1 is `custom-title: probe-kept`.
- P2 unnamed, `hc keys ... / r e n a m e space p r o b e - m i d enter`: hc title became `probe-mid` at once; after `/clear` the new transcript starts with it.
- P3 `hc keys` cannot type a general name: `_` is refused with `unknown key "_"` and the whole call types nothing; `A` is typed as `a`.
- P4 `env -u HC_TERMINAL_ID hc send --json <t> "/rename c-Probe_2 x"`: ran as the command (`Session renamed to: c-Probe_2 x`), wrote `custom-title` and `agent-name`, kept case, `_` and the space, no model reply. hc counted it as a turn (status working, then done). The helper's `hc()` wrapper in src/hc.ts already drops HC_TERMINAL_ID, so its sends arrive without the `<hc from>` wrapper.
- P5 the real order back to back: `/clear` keys, send `/rename c-After Reset_3` (answered started true, status working), send a prompt (started true): the new transcript holds the carried old name on line 1 and `c-After Reset_3` on line 9, the hc title is the new name, and the prompt ran after the rename.

Forks:

- M1 who sets the name. (a) the reset helper sends `/rename <name>` after the reset keys and before the start prompt, pick; (b) rename before the reset and rely on claude carrying it, which depends on a claude behavior nothing here checks; (c) fresh A does it, but an agent cannot run its own slash command.
- M2 always or only when missing. (a) always send the resolved name, pick: one path, no dependence on claude carrying the name; cost one `Session renamed` line and one system reminder per fresh session. (b) only when the session has none.
- M3 the session's own name. The last `custom-title` record's `customTitle` in the pre-reset transcript (`transcriptRecords(pre, 0)`), pick. Never the hc `title`, an auto title on an unnamed session.
- M4 the tab name. `docGet(session)`, the tab whose `terminals` holds A, its `name`, pick; an empty name means no name. Not the `where` label, whose ` / ` split is text parsing.
- M5 other harnesses. codex, pi, agy: log a skip, state the limit in handover.md, unless B or C show a rename command.
- M6 failure. Every failure of the name stage logs one line and the start prompt still goes (signpost 5a).
- M7 test. tests/door-agent.ts must act on `/rename <name>` as claude does, and the hc test core needs a herdr-app document with a named tab for the tab case.

Pitfalls:

- A rename left unsubmitted in the input box would glue to the start prompt. The rename needs the same "press enter when not started" handling as the start prompt, and the start prompt follows only after it.
- The rename is a turn for hc. The start prompt sent while it runs was accepted in P5; whether the helper should wait for idle first is a plan question.
- A name with a newline, or one that starts with `/`, must not be sent.
- `hc send` waits up to 60 s for an operator's unfinished draft, as the start prompt already does.
- The skill text change reaches running doors only at the next release link.

Added after the consultant maps, same day:

- P6 the rename-before-reset order, claude 2.1.325 haiku, throwaway t1v9 (killed and removed; 4 of 8 sessions used): unnamed session (0 `custom-title` records, hc title `Ok`), `env -u HC_TERMINAL_ID hc send --json t1v9 "/rename c-Tab Name_4"` answered `started: true`, `hc wait` showed status done at turn 2, then `/clear` by keys, then a prompt by send. The new transcript differs from the old and its line 1 is `custom-title: c-Tab Name_4`; hc title `c-Tab Name_4`.
- P7 tab lookup, read-only, at d44920b8: `docGet(session)` for the akrogon space returns tabs `t-akrogon`, `c-akrogon`, `w-akrogon`, and only `c-akrogon` lists t126 in `terminals`.
