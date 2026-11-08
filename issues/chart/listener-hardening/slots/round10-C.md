# Round 10, slot C: the transcript label names the wrong file

## Q1: why the tasks folder id is not the conversation id

- The id in `/tmp/claude-<uid>/<project>/<id>/tasks` is the claude *process's* startup session id, not its current conversation. Claude Code's task-list key (`jk()` in the 2.1.317 binary) is `CLAUDE_CODE_TASK_LIST_ID`, else the team list, else the process session id. Every record of t3k's conversation `9f0e4ce4…jsonl` carries `"session_id":"d577da64…"` in its metadata (345 times), and so do two older conversations of the same process (`52d0121e…jsonl`, `18bc70d0…jsonl`). So d577da64 is what pid 1114954 was born as on Nov 3; `/clear` (and resume) start a new conversation file but keep the process id, and the tasks folder follows the process id.
- The folder appeared at 12:21:04Z because it is created lazily by the first background task: it holds only `.output` files named by background Bash and Agent ids (`bp638nv06.output`, `a4344bd7d3335f698.output` = `9f0e4ce4…/subagents/agent-a4344bd7d3335f698.jsonl`), and t3k's first background `Bash` tool use is at 12:21:03Z (transcript line 50). Medium confidence on "first background task"; the contents and birth time match.
- How common (all 7 live claude seats, `~/.claude/sessions/<pid>.json` vs open tasks handle vs label):

| seat | pid | tasks handle | real sessionId | label |
|---|---|---|---|---|
| t3k c-framework | 1114954 | d577da64 | 9f0e4ce4 | d577da64 (file missing) |
| t6 w-framework | 3437925 | 480f6019 | 51af12b2 | none |
| t3g herdr-setup | 1016553 | c191fd0a | 2aef8302 | none |
| t32 c-pricing | 3514724 | none | 48c0f67b | none |
| t3f c-herdr-setup | 504051 | none | e88bf023 | none |
| t15 door A | 2197513 | 4a3df037 | 4a3df037 | none |
| t6d (me) | 2617605 | f91fd55b | f91fd55b | none |

  The handle is right for 2 of 7, wrong for 3 (every seat the operator ever `/clear`ed), absent for 2 (`fromProcess` returns null, "transcript unknown"). `src/transcript.ts:62-73` and `:142-143` already name this as P3; the label cache (`:131-137`) then freezes the wrong answer.

## Q2: root fix

- The reliable source is Claude Code's own per-process record `~/.claude/sessions/<pid>.json` (under `CLAUDE_CONFIG_DIR` when set): `{pid, sessionId, cwd, startedAt, version, status, name, updatedAt}`. For t3k it says `sessionId 9f0e4ce4`, `cwd /home/ivan/Work/infra/tamdoma/framework`, updated 13:49; for all 7 seats it named the conversation that exists and is being written (t32's has no file yet: no prompt sent). It tracks `/clear`: t3k and t6 both show the post-clear id. Transcript path = `<config>/projects/<cwd with every non-alphanumeric as "-">/<sessionId>.jsonl` (`/home/ivan/.pi/agent/extensions` is `-home-ivan--pi-agent-extensions`). No `/proc/<pid>/fd` scan for claude at all; `claudeHandle` (`src/transcript.ts:63-73`) goes.
- Cache: delete the write at `src/transcript.ts:136` and `door-reset.ts:125`; resolve live on every call (one small JSON read, codex's open rollout and pi's argv are live already). Keep reading the label only *after* a live lookup fails, so a fixture label (`tests/hc-observe.test.ts:119-134`, `tests/session-reads.test.ts:238`) still works and a stale label can never beat the live answer. The fake claude in `tests/door-agent.ts:43-51` then writes `sessions/<pid>.json` instead of holding a tasks fd.
- Who trusts the label today: `door-reset.ts:76-81` (fatal, this incident), `skills/chart-issues/scripts/transcript.ts:12` (the path A writes into the Mode record), `skills/watch-issues/scripts/observe.ts:75-76` (hides a stale path as `-`, which masked this), `src/next.ts:430` and `src/log.ts:43` (diagnostic `session` fields in timings and `issues/log.jsonl`). The listener does not use it.
- Follow-on simplification for door-reset: after `/clear` the sessions record flips to the new `sessionId` by itself, so for claude the paid warm-up turn (`door-reset.ts:104-120`, `transcriptByCode`) can be replaced by waiting for `sessionId !== pre id`. pi still needs the code (nothing of pi's changes on `/new`); codex's newest open rollout changes on `/new`.

## Q3: door-reset must not fail silently

- Everything before the first `step()` (`door-reset.ts:48-81`: argv parse, `repoSpace`, `transcriptFor`, `readFileSync(pre)`) and every rejected await between steps dies as an uncaught error on stderr, and `--rm` deletes the terminal with it. Smallest change, no code in the helper: start it through the shell with stderr appended to the log, in `skills/chart-issues/SKILL.md:159`:
  `hc run --bg --no-notify --rm --no-parent -- sh -c 'exec bun "$0" "$@" 2>>"$2"' <skill-folder>/scripts/door-reset.ts <A address> <log> "<start prompt>"`.
  Every failure class (missing bun, zod parse, ENOENT, hc error, a bug) then leaves its message in `<log>`, the file fresh A and the operator already look at; the helper's exit stays non-zero. A reader of the log treats a non-JSON tail as a failed stage. No try/catch anywhere.
