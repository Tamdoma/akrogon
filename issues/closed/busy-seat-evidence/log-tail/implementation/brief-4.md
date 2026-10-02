# Brief 4: implement log-tail.ts (log-tail U4)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u4` (created by A at the lane HEAD after wave 1 lands; it contains the committed fixtures).

## 1. Goal

Implement `skills/watch-issues/scripts/log-tail.ts` (new) plus a one-line `skills/AREA.md` update. Plan D1-D7, D11. It reads one claude, codex or pi session jsonl and prints its last 20 outer tool calls, oldest first, one line per outer tool call. The script summarizes only; it never judges "stuck" and never executes log source.

## 2. Numbered acceptance criteria

1. `bun log-tail.ts <path>` prints `<timestamp> <tool> <target> <identity> -> <status>: <excerpt>`, at most 20 lines, oldest first, exit 0.
2. Missing/unreadable file or unknown format: non-zero exit, stderr names the path. Complete record failing `JSON.parse`: non-zero, stderr names path and 1-based line number. An unterminated final line is skipped.
3. Format detection from records: pi `{"type":"session"}`, codex `{"type":"session_meta"}` (any record), claude any record carrying `sessionId`. Scan complete records until a shape matches.
4. Shell targets: claude `Bash` `input.command`; pi `bash` `arguments.command`; codex `exec` `payload.input` and pi `exec` `arguments.code` — scan the JS source for every `tools.exec_command({cmd: ...})` in order; each literal `cmd` (single/double-quoted string, or backtick template without `${`) joins with ` ; `, each non-literal shows `<expr>`. `write_stdin` (codex/pi exec source, or a codex `custom_tool_call` named `write_stdin`) shows `session <id>` for a literal `session_id`, `session <expr>` otherwise. Other tools: first present of `file_path`, `path`, `pattern`, `url` in the call input/arguments, else empty.
5. Identity: shell `#<8hex>` = sha256 hex[0:8] of the full joined target string before truncation; `#-` when any `cmd` is non-literal. Edit: `old#<8hex> new#<8hex>` where old hashes the concatenation in order of before-strings (claude `Edit` `input.old_string`; pi `edit` `arguments.edits[].oldText`) and new likewise. All other tools print `-`.
6. Status: claude `tool_result` — text starting `Exit code <n>` gives `exit <n>`; else `is_error:true` gives `error`; else `ok`. pi `bash` result — first `details.capture.termination`: `exitCode` 0 → `ok`, non-zero → `exit <n>`, `kind` other than `exit` without exitCode → `unknown`; else `isError:true` → the first `code <n>` or `exit <n>` in `content[].text` gives `exit <n>` (pi 1.0.0 prints "Command exited with code 1" with NO `details`; the incident log uses `termination` with `isError:false` — both shapes exist), otherwise `error`; else `ok`. codex `custom_tool_call_output` and pi `exec` result `content[].text` blocks — EVERY `output[]`/content block gets its own status in block order, joined with `,`: a block whose text is JSON with `exit_code` 0 → `ok`, non-zero → `exit <n>`, `session_id` without `exit_code` → `running`, anything else (including plain-text envelope lines like "Script completed\nWall time..." and JSON like `{}`) → `unknown`. A normal single-command codex result therefore reads e.g. `unknown,exit 1` (envelope + result). Any call without a paired result prints `running`.
7. Excerpt: first non-empty line of the result's own output text — claude `tool_result.content` (string or text blocks), pi `bash` `content[].text` (skip lines like `[exit N. Full output...]` that are capture metadata, not command output), exec calls the `output` field of the first parsed block that has one (envelope text blocks are never excerpt sources). Target and excerpt each cut to 120 chars, `…` appended when cut.
8. Smoke-verified by you against the committed fixtures (`claude-session.jsonl`, `codex-session.jsonl`, `pi-session.jsonl`, `pi-incident-excerpt.jsonl`, `codex-exec-excerpt.jsonl` under `skills/watch-issues/scripts/fixtures/`): it exits 0 on each and the lines show plausible per-format targets and statuses (pi excerpt shows `exit 1`, `exit 143`, `exit 2`; pi-session shows `exit 1` ×3 via the isError+text path; codex excerpt shows ` ; `-joined literals, an `exit 1`-bearing multi-block status, and `session <expr>` on the write_stdin line). The authoritative expected lines live in the sibling test; you verify plausibility, not a golden copy.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/watch-issues/scripts/observe.ts` (worktree) — copy its style: `#!/usr/bin/env bun`, zod schemas at the boundary, `main()` + `import.meta.main`, `Bun.spawn`-free pure parsing, `console.error` + `process.exit(1)`.
- `skills/watch-issues/scripts/fixtures/` — the five committed fixture files; skim each format's records.
- `skills/watch-issues/tsconfig.json` — strict TS, `types: ["bun"]`.
- `/home/ivan/Work/infra/tamdoma/framework/issues/chart/busy-seat-evidence/slots/leaf-review-B.md` sections B1-B4 — the failure modes this parser must handle.

## 4. Change list and needed interfaces

Owns exactly `skills/watch-issues/scripts/log-tail.ts` and `skills/AREA.md` (extend the watch-issues Key-files line to name `scripts/log-tail.ts` as the session-log summarizer). Shared test resource: reads `fixtures/` read-only. Land-first: U1-U3 fixtures (already committed in your worktree).

Record shapes (verified live, use zod `looseObject`-style parsing — parse only the fields you need):

- claude: top-level `{type, sessionId, timestamp, message}`. Calls: `type:"assistant"` records whose `message.content[]` has `{type:"tool_use", id, name, input}`. Results: `type:"user"` records whose `message.content[]` has `{type:"tool_result", tool_use_id, is_error, content}` where `content` is a string or `[{type:"text", text}]`. Pair by `tool_use_id`/`id`. An assistant message may hold several `tool_use` blocks — each is one output line. Timestamp is the record's top-level `timestamp`.
- codex: top-level `{timestamp, type:"response_item", payload}`. Calls: `payload.type:"custom_tool_call"` → `call_id`, `name` (`exec` or `write_stdin`), `input` (JS source string). Results: `payload.type:"custom_tool_call_output"` → `call_id`, `output[]` blocks `[{type:"input_text", text}]`; block texts mix envelope prose (`Script completed\nWall time...`), empty JSON (`{}`), and result JSON `{exit_code|session_id, output, chunk_id,...}` — every block still gets a status, and only result-JSON `output` fields feed the excerpt. `exec` sources may also call `tools.apply_patch` etc. — only `exec_command` `cmd`s join the target. Pair by `call_id`. Timestamp is top-level `timestamp`.
- pi: top-level `{type:"message"|"session"|..., timestamp, message}`. Calls: `message.role:"assistant"`, `message.content[]` items `{type:"toolCall", id, name, arguments}` — names include `bash`, `exec` (`arguments.code`), `edit` (`arguments.path`, `arguments.edits[]`), `read` (`arguments.path`). Results: `message.role:"toolResult"` → `toolCallId`, `toolName`, `content[].text`, `isError`; `details.capture.termination {kind, exitCode}` is present only on captured-output bash runs (incident log), absent on simple exits (fresh fixture). For `exec` results `content[].text` is per-block JSON like codex's. Pair by `toolCallId`/`id`. Timestamp is top-level `timestamp`.
- `write_stdin` inside exec source: `tools.write_stdin({session_id: <lit|expr>, ...})` → target `session <id>` / `session <expr>`.

JS literal scanning: tokenize with a small scanner honoring `'`, `"` and backtick strings (handle escapes; a backtick containing `${` is non-literal). Find `cmd:` / `session_id:` and take the first token after the colon: literal → its decoded string value, anything else → `<expr>`. Keep it small — a hand scanner, no parser dependency.

sha256: `Bun.CryptoHasher` or `crypto.subtle`; take first 8 hex chars.

## 5. Do-not, reasons and exceptions

- Do not execute or eval log source text: it is untrusted data. Exception: none — extraction is pure text scanning.
- Do not add stuck/loop judgment, colors, flags or extra commands: the contract is one line per call, summarization only. Exception: none.
- Do not add dependencies, files or a shared helper module: one new script file only. Exception: none.
- Do not modify fixtures, tests or `observe.ts`. Exception: none.
- Return a mismatch with evidence instead of changing the interface; exception is a revised brief from A.

These exclusions keep the loop rule owned solely by SKILL.md and the diff minimal; the only exception is a revised brief.

## 6. Ordered steps

1. Read `observe.ts` and skim one record of each fixture format. Confirm the shapes in section 4.
2. Write `log-tail.ts`: line reading (drop unterminated tail), per-format detection, call/result extraction, pairing, target/identity/status/excerpt mapping, 20-line slice, printing.
3. Smoke-run against each of the five fixtures; check criterion 8's expectations. Iterate until plausible.
4. Update `skills/AREA.md` one line.
5. `git add` exactly your two files; commit `Add log-tail session summarizer`. Return the commit ID.

Advisory size: 2 files (~250-350 lines for the script), under 40 turns.

## 7. Commands

- `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed="$AKROGON_BASE" --timeout=30000` at the worktree root. Note: the root runner may select no files for a `scripts/` change; if it prints `nothing to run`, also run `cd skills/watch-issues && bun run typecheck` and paste that result. Do not run `bun test scripts` expecting log-tail.test.ts to pass — the test file lands via a sibling unit after yours; a missing-test-file error there is not your failure.

## 8. Done-when, evidence and report

Done when the commit exists with exactly the two owned files, the five smoke runs are pasted (first/last few lines each suffice), typecheck output is pasted, and criteria 1-8 hold. Known limitations belong in the report (e.g. unverified pi `exec` fixture shape if the fresh fixture lacks `exec` calls).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
