# Brief 1: capture claude fixture (log-tail U1)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u1` (detached at `5bb552d`, branch `log-tail` lane).

## 1. Goal

Produce `skills/watch-issues/scripts/fixtures/claude-session.jsonl`, a verbatim copy of a real `claude` session log captured by this worker. Leaf done-criteria 1 and 3 (claude part). Plan D8.

## 2. Numbered acceptance criteria

1. The fixture file exists and is byte-identical to a session log produced this run (compare with `cmp` before deleting the source).
2. The fixture contains `tool_use` entries: at least three `Bash` calls with `input.command` `false`, one with `echo done`, plus a `Read` and an `Edit` whose `input.file_path` names the scratch `note.txt`.
3. The capture session file/folder under `~/.claude/projects/` and the scratch cwd are deleted and confirmed absent (`ls` prints no such file).
4. The fixture is never hand-edited.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u1/skills/watch-issues/scripts/observe.test.ts` — `mkdtemp` scratch pattern (test files only; your scratch is a plain dir, not a test).
- Chart evidence (read-only, do not copy from): `/home/ivan/Work/infra/tamdoma/framework/issues/chart/busy-seat-evidence/forks/log-reading.md`.

## 4. Change list and needed interfaces

Owns exactly `skills/watch-issues/scripts/fixtures/claude-session.jsonl` (new). No code changes. Shared test resource: none. Land-first: nothing; this is wave 1.

Claude log location: `~/.claude/projects/<cwd with every non-alphanumeric replaced by ->/<session-uuid>.jsonl`. Record shape (verified live): `tool_use` blocks inside assistant `message.content` carry `id`, `name`, `input`; `tool_result` blocks inside user `message.content` carry `tool_use_id`, `is_error`, `content`. Every record carries top-level `sessionId` and `timestamp`.

## 5. Do-not, reasons and exceptions

- Do not edit, patch or regenerate the fixture after copying: the brief requires verbatim capture; a defective capture is re-run, never patched. Exception: none.
- Do not commit anything under `issues/` or outside your owned path: the lane forbids it. Exception: none.
- Do not open, print or write any `.env*` file. Exception: none.
- Return a mismatch with evidence instead of changing scope or inventing a second file; exception is a revised brief from A.

These exclusions stand because fixture authenticity is a done-criterion, and scope creep blocks merge; the only exception is an explicit revised brief.

## 6. Ordered steps

1. `mkdir` a scratch cwd via `mktemp -d` (under system temp). Write `note.txt` containing `hello` into it.
2. `cd` scratch; run `claude -p "Run the shell command \`false\` three times, one at a time, then run \`echo done\`. Then read the file note.txt and edit it to say bye. Reply with one word." --model claude-haiku-4-5-20251001 --allowedTools Bash,Read,Edit`. Expect exit 0. If it exits non-zero once, retry once with the same command; if it fails again or produced no new `~/.claude/projects/<scratch>/*.jsonl`, return a mismatch naming the output.
3. Copy the new session `.jsonl` verbatim to `<worktree>/skills/watch-issues/scripts/fixtures/claude-session.jsonl` (`mkdir -p` the fixtures dir, `cp`, then `cmp` source vs fixture).
4. Grep-verify the fixture holds the required `tool_use` names and `false`/`echo done`/`note.txt` strings.
5. Delete the session file (and the scratch project dir if now empty), the scratch cwd, and any `.claude` artifacts the run created inside the scratch. Confirm each absent.
6. `git add` the fixture only, `git commit` with message `Add claude session fixture for log-tail`. Return the commit ID.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed="$AKROGON_BASE" --timeout=30000` run at the worktree root. This unit changes no code; a `nothing to run` result is expected and acceptable.

## 8. Done-when, evidence and report

Done when the committed fixture exists, criteria 1-4 hold with pasted evidence (cmp result, grep counts, ls-absence lines, capture command and `claude --version`), and the worktree is clean except your commit. Note for the test file (return verbatim): harness version, capture date, exact capture command.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
