# Design: log-tail

## Binding decisions, verbatim
### busy-evidence
Q1. What should the watch's Busy rule read to judge a working seat, now that `herdr agent read <pane> --lines 80` is refused on every working seat?
- 1a: the tail of the seat's own session log (claude, codex or pi jsonl), with loop evidence judged on its tool calls and results; the visible screen stays secondary.
- 1b: replace `--lines 80` with `--source visible` (about 35-40 lines).

Q2 (only with 1a). Who finds the session log path?
- 2a: `scripts/observe.ts` prints it per busy seat from `herdr agent list` (`agent_session.value` plus `cwd`).
- 2b: SKILL.md prose tells the watch how to find it per harness on each fire.

Taken:
Operator 2026-10-02, verbatim: "1a | 2a |"
- Q1 1a: the Busy rule judges a working seat from the tail of its own session log, with loop evidence taken from tool calls and results; the visible screen stays secondary. Reason: the loop bar needs history that 35 visible lines cannot hold and `--lines 80` is refused on working seats. Foreclosed: 1b, `--source visible` as the only evidence.
- Q2 2a: `scripts/observe.ts` prints each busy seat's session log path from `herdr agent list` (`agent_session.value` plus `cwd`). Reason: path resolution happens once in tested code. Foreclosed: 2b, per-fire prose resolution.

### log-reading
Q1. How does the watch read a busy seat's log, given a raw 60-line tail is 108-235 KB?
- 1a: a new `scripts/log-tail.ts <path>` prints the last tool calls of any of the three formats as one short line each (tool, command or target, result or first error line), and the watch judges loops from that.
- 1b: the watch reads the raw tail itself with `tail`/`jq` on each fire.

Q2. What does observe print for a busy seat with no usable log (no `agent_session`, or a path not written yet)?
- 2a: `logA=-`; the watch then judges from `--source visible` and reports "no log".
- 2b: observe exits non-zero for that fire.

Taken:
Operator 2026-10-02, verbatim: "1a | 2a |"
- Q1 1a: a new `skills/watch-issues/scripts/log-tail.ts <path>` prints the last tool calls of a claude, codex or pi session log as one short line each (tool, command or target, result or first error line); the watch judges loops from those lines. Reason: a raw 60-line tail is 108-235 KB per seat per fire, in three formats. Foreclosed: 1b, raw tail read by the watch. The script summarizes only and never judges "stuck".
- Q2 2a: observe prints `log<seat>=-` for a busy seat with no `agent_session` or an unwritten path; the watch judges that seat from `herdr agent read <pane> --source visible` and reports "no log". Reason: a missing log is an observed normal state, and one seat must not stop the fire. Foreclosed: 2b, failing the whole observe run.

### Locks carried
- No clock, watchdog, elapsed trigger or numeric size gate (akrogon leaf-run-stalls and long-implement Off route). No elapsed ceiling for busy seats.
- The stall notice stays as is (akrogon long-implement/forks/stall-notice.md, 1a).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: harness session logs are outside output, so fixtures are captured from real fresh sessions with the chart's proven commands (chart forks/log-reading.md), plus two unmodified excerpts of real logs that hold shapes a fresh session does not produce (pi native `bash` and edits from the incident, codex batched `exec` with a pending session) (A,B). Each is noted with version or source, date and capture command, re-captured rather than hand-patched, and checked for `.env` values before commit. Hand-written edge inputs stay allowed. Capture uses the operator's existing claude, codex and pi logins on this machine; no `.env` key is needed. Each test case maps to a done-criterion, and expected lines are written independently of the script. Writer and checker: the loop bar lives only in SKILL.md and this script carries no judgment. No auth, browser or slow-run rule applies.

## Leaf architecture
Owned: new `skills/watch-issues/scripts/log-tail.ts`, new `skills/watch-issues/scripts/log-tail.test.ts`, fixtures under `skills/watch-issues/scripts/fixtures/`.
Interface: `bun log-tail.ts <path>`. Stdout holds at most 20 lines, oldest first, one per outer tool call, each `<timestamp> <tool> <target> <identity> -> <ok|exit N|error|running>: <excerpt>`, as the brief defines. Exit 0 on success; non-zero with the path in the message for a missing or unreadable file, an unknown format, or a complete record that fails to parse (with its line) (A,B). Exec status is per output block, joined with `,`, with `unknown` for a block that is not exec JSON (A,B). A non-literal `cmd` gives identity `#-` (A,B). Records are parsed with one schema per format at the boundary; only complete newline-terminated records are read.
Known shapes (chart forks/log-reading.md and slots/leaf-review-B.md, read 2026-10-02): claude assistant `tool_use` (`id`, `name`, `input`) and user `tool_result` (`tool_use_id`, `is_error`, `content`); codex `response_item` payload `custom_tool_call` named `exec` (`call_id`, `input` code with one or more `tools.exec_command({cmd: ...})`, possibly under `Promise.allSettled`) and `custom_tool_call_output` (`call_id`, `output[]` blocks whose JSON holds `exit_code`, or `session_id` while still running), and `write_stdin` continuations; pi wrapped `exec` (`arguments.code`, `toolResult` `isError` false, `content[0].text` JSON with `exit_code`) and pi native `bash` (`arguments.command`, result `details.capture.termination {kind, exitCode}`, `isError` false on non-zero exit) and native edit (`arguments.path`, `arguments.edits[]` with `oldText`/`newText`) (A,B). Calls pair with results by call id. Log source is never executed (A,B).
Excluded: path resolution (seat-log-path), SKILL.md (busy-rule-log), any stuck verdict, the package `test` script (watch-scripts-check).
Dependencies: blocked-by watch-scripts-check (its root test is the blocking proof of these tests and the subpackage typecheck).

Spine (A,B): `bun test scripts` in `skills/watch-issues`, run inside akrogon's blocking `test` by watch-scripts-check's root test `tests/watch-issues-scripts.test.ts`.

| Stage | Owner | Real or recorded |
|---|---|---|
| list herdr seats and resolve each working seat's log path | seat-log-path (`observe.ts`) | real script; herdr output recorded once from a real `herdr agent list` |
| summarize a session log | log-tail (`log-tail.ts`) | real script; harness logs recorded from real sessions and two incident excerpts |
| join: observe path into log-tail | busy-rule-log (join test) | real scripts; recorded fixture reused |
| loop judgment | busy-rule-log (`SKILL.md` Busy rule) | watch agent, not tested by code |

Rule owner: the loop bar is defined only in `skills/watch-issues/SKILL.md` (busy-rule-log). log-tail.ts carries no judgment.
