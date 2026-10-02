# Design: seat-log-path

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

Interpretation: no vanity tests, and each criterion is proven by the cheapest sufficient test, here unit tests through observe's existing `OBSERVE_HERDR` seam. herdr output is an outside stage: one JSON recorded unmodified from a real `herdr agent list` run proves the list schema, and is re-recorded rather than hand-patched. Path resolution is proven separately with typed hand-written entries and files inside a temp directory, so no test touches the real `~/.claude`, `~/.codex` or `~/.pi` trees (A,B). No auth, secrets, browser, live run or slow-run rule applies.

## Leaf architecture
Owned: `skills/watch-issues/scripts/observe.ts` (herdr list schema gains optional `agent`, `cwd` and `agent_session {kind, value}`; one pure path-resolution function; `formatLeaf` appends the field), `skills/watch-issues/scripts/observe.test.ts`, and the line-format text at `skills/watch-issues/SKILL.md:28` only.
Interface: ` logA=<absolute path|->` after seat A's field and ` logB=<absolute path|->` after seat B's, each after that seat's ` busy=` suffix when present, only for a seat whose herdr status is `working`. `HOME` is read from the environment.
Excluded: the closer-look line and Busy rule in SKILL.md (busy-rule-log), reading log contents (log-tail), any elapsed limit, notification or state change.
Dependencies: blocked-by watch-scripts-check (its root test is the blocking proof of these tests and the subpackage typecheck).

Spine (A,B): `bun test scripts` in `skills/watch-issues`, run inside akrogon's blocking `test` by watch-scripts-check's root test `tests/watch-issues-scripts.test.ts`.

| Stage | Owner | Real or recorded |
|---|---|---|
| list herdr seats and resolve each working seat's log path | seat-log-path (`observe.ts`) | real script; herdr output recorded once from a real `herdr agent list` |
| summarize a session log | log-tail (`log-tail.ts`) | real script; harness logs recorded from real sessions and two incident excerpts |
| join: observe path into log-tail | busy-rule-log (join test) | real scripts; recorded fixture reused |
| loop judgment | busy-rule-log (`SKILL.md` Busy rule) | watch agent, not tested by code |

Rule owner: the loop bar is defined only in `skills/watch-issues/SKILL.md` (busy-rule-log). log-tail.ts carries no judgment.
