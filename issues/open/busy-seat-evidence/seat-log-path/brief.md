# Brief: seat-log-path

## What
`skills/watch-issues/scripts/observe.ts` appends ` log<seat>=<path|->` (` logA=`, ` logB=`) after that seat's field, after any ` busy=HhMMm` suffix, when the seat's herdr `agent_status` is `working`. Seats in any other status get no `log<seat>` field. The path comes from the pane's entry in the `herdr agent list` call observe already makes:
- `agent_session.kind` `path`: its `value`.
- `agent_session.kind` `id` with `agent` `claude`: `$HOME/.claude/projects/<cwd with each character outside [A-Za-z0-9] replaced by ->/<value>.jsonl`, `cwd` taken from the same entry.
- `agent_session.kind` `id` with `agent` `codex`: the one file matching `$HOME/.codex/sessions/*/*/*/rollout-*-<value>.jsonl`. More than one match fails observe with an error naming the pane and every match.
- `-` when the entry has no `agent_session`, names another agent kind, or the resolved file does not exist.
`skills/watch-issues/SKILL.md:28` documents the new field in the line format. Nothing else in SKILL.md changes here (busy-rule-log owns the Busy rule).
Consumes: watch-scripts-check's root test, which runs this leaf's tests and the subpackage typecheck in the blocking `test` check. (A,B)

## Why
Tamdoma/tamdoma-framework#118: the watch's Busy rule cannot read a working seat (`herdr agent read --lines 80` returns `agent_not_idle`), and the seat's own session log holds the history the loop bar needs. This leaf finds that log. busy-rule-log consumes the ` log<seat>=` field. This is stage 1 of the issue's spine (`bun test scripts` in `skills/watch-issues`).

## Done-criteria
1. A test in `skills/watch-issues/scripts/observe.test.ts` parses JSON recorded unmodified from one real `herdr agent list` run (herdr version, date and capture command noted in the test file) with observe's list schema and passes. (A,B)
2. Tests in `skills/watch-issues/scripts/observe.test.ts` drive path resolution with typed hand-written agent entries and files created inside a temp directory (temp `HOME` for claude and codex, a pi `kind: path` value pointing into the temp directory), touch no file outside it, and pass for: a working claude seat (path built from cwd and id), a working codex seat (rollout file found), a working pi seat (supplied path used), a working seat with no `agent_session` (`logA=-`), a working seat whose file is absent (`logA=-`), two codex matches (observe exits non-zero naming both), and an idle seat (no `log<seat>` field). (A,B)
3. The blocking `test` command passes, including watch-scripts-check's root test, which runs these tests and the subpackage typecheck. (A,B)
4. `skills/watch-issues/SKILL.md:28` shows ` log<seat>=<path|->` in the line format with when it appears.
