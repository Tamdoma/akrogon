# Brief 3: capture codex fixture and codex excerpt (log-tail U3)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u3` (detached at `5bb552d`).

## 1. Goal

Produce `skills/watch-issues/scripts/fixtures/codex-session.jsonl` (verbatim fresh capture) and `codex-exec-excerpt.jsonl` (verbatim selected lines from a live session log). Leaf done-criteria 1, 2 and 3 (codex parts). Plan D8, D9.

## 2. Numbered acceptance criteria

1. `codex-session.jsonl` is byte-identical (`cmp`) to a `rollout-*.jsonl` produced this run and contains `response_item` `custom_tool_call` records named `exec` whose `input` holds literal `cmd` values including at least three `false` and one `echo done`, with `custom_tool_call_output` records carrying `exit_code` 1 for the `false` calls and 0 for `echo done`.
2. `codex-exec-excerpt.jsonl` contains, in order: source line 1 (`session_meta`), then verbatim lines 18, 460 and 466 of `~/.codex/sessions/2026/10/02/rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl`. Line 18 is a `Promise.allSettled` batched `exec` (three `exec_command` calls), 460 a `custom_tool_call_output` mixing `exit_code` and a `session_id` (pending) block, 466 an `exec` using `write_stdin`. Prove byte-identity per mapped line.
3. Before commit, the `.env` absence check (section 4) prints `clean` for the excerpt. A hit removes the offending line and rechecks; never record or repeat the value.
4. The capture `rollout-*.jsonl` and the scratch cwd are deleted and confirmed absent.
5. Neither file is hand-edited.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Worktree `skills/watch-issues/scripts/observe.test.ts` — `mkdtemp` pattern reference.
- Excerpt source log (read-only): path above.
- Chart evidence: `/home/ivan/Work/infra/tamdoma/framework/issues/chart/busy-seat-evidence/forks/log-reading.md`.

## 4. Change list and needed interfaces

Owns exactly `skills/watch-issues/scripts/fixtures/codex-session.jsonl` and `skills/watch-issues/scripts/fixtures/codex-exec-excerpt.jsonl` (both new). No code changes. Shared test resource: none. Land-first: nothing.

Codex log location: `~/.codex/sessions/<YYYY>/<MM>/<DD>/rollout-<ts>-<id>.jsonl` — identify the file created during your run by mtime. Record shape (verified live): `{"timestamp", "ordinal", "type":"response_item", "payload":{"type":"custom_tool_call","call_id","name":"exec","input":"<js source>"}}`; results are `payload.type:"custom_tool_call_output"` with `call_id` and `output[]` blocks whose text is JSON holding `exit_code` or `session_id`. First record is `type:"session_meta"`.

`.env` absence check (prints only `clean` or `hit <file>`):

```
bun --env-file=/home/ivan/Work/infra/tamdoma/framework/.env -e 'import {readFileSync} from "fs"; const f=process.argv[2]; const t=readFileSync(f,"utf8"); const hits=Object.values(process.env).filter(v=>typeof v==="string"&&v.length>=4&&t.includes(v)); console.log(hits.length?("hit in "+f):"clean")' skills/watch-issues/scripts/fixtures/codex-exec-excerpt.jsonl
```

(Note: `bun -e` shifts argv; verify `process.argv[1]`/`[2]` once and use whichever holds the path.)

## 5. Do-not, reasons and exceptions

- Do not edit/patch either file post-capture: verbatim is the criterion. Exception: the `.env` hit case removes a whole line and rechecks.
- Do not open or print `.env`/`.env.*` with any tool; use only the `bun --env-file` check. Exception: none.
- Do not copy lines beyond the listed set. Exception: none.
- Do not commit under `issues/` or outside your owned paths. Exception: none.
- Codex may perform the read/edit via shell `cat`/`sed` inside `exec` rather than a file tool; that is acceptable — do not force a file tool. Exception to the read/edit expectation only; all other criteria stand.
- Return a mismatch with evidence rather than changing scope; exception is a revised brief from A.

These exclusions exist because verbatim provenance and secret hygiene are the acceptance bar; the only exceptions are a revised brief or the stated hit-removal and shell-read cases.

## 6. Ordered steps

1. `mktemp -d` scratch cwd; write `note.txt` with `hello`.
2. `cd` scratch; run `codex exec -s workspace-write --skip-git-repo-check "Run the shell command \`false\` three times, one at a time, then run \`echo done\`. Then read the file note.txt and edit it to say bye. Reply with one word."`. Expect exit 0. Find the `rollout-*.jsonl` created this run under `~/.codex/sessions/` today. On failure or no new file, retry once then mismatch with output.
3. `mkdir -p` `skills/watch-issues/scripts/fixtures/`; `cp` the rollout log to `codex-session.jsonl`; `cmp` source vs copy. Delete the rollout file and the scratch cwd; confirm absent.
4. Build `codex-exec-excerpt.jsonl`: `{ sed -n '1p' SOURCE; sed -n '18p;460p;466p' SOURCE; } > fixture`; verify each mapped line byte-identical.
5. Run the `.env` check; require `clean`.
6. `git add` both fixtures; commit `Add codex session fixture and exec excerpt for log-tail`. Return the commit ID.

Advisory size: 2 files, under 20 turns.

## 7. Commands

- `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed="$AKROGON_BASE" --timeout=30000` at worktree root. No code changed; `nothing to run` is expected.

## 8. Done-when, evidence and report

Done when both files are committed, criteria 1-5 hold with pasted evidence (cmp lines, grep counts for `exec`/`exit_code`/`false`/`echo done`, mapped-line byte checks, `clean` env output, ls-absence lines, capture command and `codex --version`). Note for the test file (return verbatim): codex version, capture date, exact capture command, and the excerpt's source path + line list.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
