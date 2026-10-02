# Plan: log-tail

Synthesis mode: `debate: no`, built directly from brief and locked design. No positions or rebuttals exist.

All code paths are relative to the worktree `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail`.

## Decisions

- D1. New `skills/watch-issues/scripts/log-tail.ts`, invoked `bun log-tail.ts <path>`, prints at most the last 20 outer tool calls, oldest first, one line each: `<timestamp> <tool> <target> <identity> -> <status>: <excerpt>`. Exit 0 on success; non-zero naming the path for missing/unreadable file or unknown format, and non-zero naming path and line for a complete record that fails `JSON.parse`.
- D2. Format detection from the first complete record's fields: `{"type":"session"}` is pi, `type: "session_meta"` is codex, a record carrying `sessionId` is claude. Detection scans records until one of the three shapes appears; a file with no recognizable shape after all complete records is unknown format.
- D3. Reading is a snapshot: read the file once, split on `\n`, drop the final element when it does not end in `\n` (unterminated fragment the seat is still writing), `JSON.parse` each remaining line and collect call/result events. Log source text is never executed.
- D4. Target extraction. Shell calls: claude `Bash` `input.command`; pi native `bash` `arguments.command`; codex `custom_tool_call` `input` and pi `exec` `arguments.code` are JS source scanned for every `tools.exec_command({cmd: ...})` in source order. A `cmd` that is a double/single-quoted string or a template literal without `${}` interpolation counts as literal; anything else (identifier, `load(...)`, interpolated template) shows `<expr>` in the joined target. Literals join with ` ; `. `write_stdin` calls show `session <id>` for a literal `session_id`, `session <expr>` otherwise. Other tools: first present of `file_path`, `path`, `pattern`, `url` in the call's input/arguments, else empty. Target is cut to 120 chars, `…` appended on cut.
- D5. Identity. Shell call with all-literal cmds: `#<8hex>` of sha256 over the full joined target; any `<expr>` gives `#-`. Edit calls: `old#<8hex> new#<8hex>` where old is the concatenation of all before-strings in recorded order (claude `Edit` `input.old_string`; pi native `edit` `arguments.edits[].oldText` joined in array order) and new likewise (`new_string` / `newText`). Other tools print `-` for identity; the loop bar keys only on `#`/`old#`/`new#` (busy-rule-log), so a `-` never counts as "same". sha256 over the exact recorded bytes; never reconstruct a truncated value.
- D6. Status mapping. claude `tool_result` (paired by `tool_use_id` to `tool_use.id`): content text starting `Exit code <n>` gives `exit <n>`; else `is_error: true` gives `error`; else `ok`. pi native `bash` result (paired by `toolCallId` to `toolCall.id`): `details.capture.termination.exitCode` when present (0 → `ok`, non-zero → `exit <n>`); else `isError: true` → first `code <n>`/`exit <n>` in `content[].text` gives `exit <n>`, otherwise `error` (pi 1.0.0 non-interactive writes `isError:true` + "Command exited with code N" with no `details`; the incident log writes `termination` with `isError:false` — both shapes verified in fixtures); else `ok`/`unknown`. codex `custom_tool_call_output` and pi `exec` `toolResult` `content[].text`: EVERY `output[]`/content block gets a status in block order joined `,` — JSON with `exit_code` 0 → `ok`, non-zero → `exit <n>`, `session_id` without `exit_code` → `running`, anything else (envelope prose like `Script completed...`, `{}`, non-JSON) → `unknown`; a normal single-command codex result therefore reads `unknown,exit 1`. A call with no paired result prints `running`.
- D7. Excerpt. First non-empty line of the command's own output or error text: claude `tool_result` `content` (string or `{type:"text"}` blocks' text); pi native `bash` `content[].text`, skipping `[exit N. Full output...]` capture-metadata lines; codex/pi `exec` the `output` field inside the first parsed block that has one (envelope text never feeds the excerpt). Cut to 120 chars, `…` appended on cut. Multi-line text flattens newlines to `⏎` to hold one line per call (implemented; contract left it open).
- D8. Fixtures are captured, never hand-built: for each harness run the chart-proven command in a fresh `mkdtemp` cwd — `claude -p "<prompt>" --model claude-haiku-4-5-20251001 --allowedTools Bash,Read,Edit`, `codex exec -s workspace-write --skip-git-repo-check "<prompt>"`, `pi -p "<prompt>"` — where the prompt runs `false` three times, `echo done`, reads one file and edits one file (claude needs `Read,Edit` allowed; write `note.txt` into the scratch cwd first). Copy the produced session log verbatim into `skills/watch-issues/scripts/fixtures/` (`claude-session.jsonl`, `codex-session.jsonl`, `pi-session.jsonl`), record harness version, date and capture command in the test file, then delete the capture session log/folder and scratch cwd and confirm absent.
- D9. Two recorded excerpts land under `fixtures/` as `pi-incident-excerpt.jsonl` (source `~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/2026-10-01T10-40-07-084Z_01a0f70c-cfac-7437-a9a0-f4ec47260613.jsonl`, must include lines 8, 422, 461-462, 485-488, 684-686 verbatim — verified: native `bash` results with `details.capture.termination {kind, exitCode}` and `isError` false at 422/684/686, native `edit` calls with `edits[].oldText/newText` at 461/485/487) and `codex-exec-excerpt.jsonl` (source `~/.codex/sessions/2026/10/02/rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl`, must include lines 18, 460, 466 verbatim — verified: `Promise.allSettled` batched `exec` at 18, multi-block output with `exit_code` 1 and `session_id` at 460, `write_stdin` at 466). Extra copied lines are allowed; the named lines must be present unmodified. Before commit, check each excerpt holds no framework `.env` value: run a script that loads `/home/ivan/Work/infra/tamdoma/framework/.env` and prints only `clean`/`hit <NAME>` per value compared against the excerpt bytes, e.g. `bun --env-file=/home/ivan/Work/infra/tamdoma/framework/.env -e '<compare each defined value against both fixture files; print key name on hit, never the value>'`. A hit blocks commit; remove the offending line and recheck.
- D10. One test file `skills/watch-issues/scripts/log-tail.test.ts` spawns `process.execPath log-tail.ts <fixture>` (same spawn pattern as `observe.test.ts`) and asserts full expected stdout lines written independently of the script implementation: failing shell calls show `exit 1` (claude may show `error`), `echo done` shows `ok`, reads/edits show their file target, pi incident non-zero exits show `exit 1`, `exit 143`, `exit 2` where recorded, the codex excerpt shows every literal `cmd` joined ` ; ` and per-block statuses `exit 1,ok,running` ordering where excerpt mixes them, line order follows file order. Edge cases use hand-written inline temp files (mkdtemp, never fixture edits): 21 calls prints exactly the last 20; two commands sharing their first 120 chars print different `#` identities; two distinct non-literal `cmd`s both print `#-`; a non-JSON `exec` output block prints `unknown`; an edit then its exact inverse prints swapped `old#`/`new#`; a 121-char target and excerpt each end with `…`; a call with no result prints `running`; an unterminated final line is skipped; a complete unparsable line exits non-zero naming path and line; a missing path and a random-JSON file exit non-zero naming the path.
- D11. No other paths change. `skills/watch-issues/package.json` already runs `bun test scripts`, which discovers `log-tail.test.ts` automatically. `observe.ts`, `SKILL.md`, root configs and `checks` belong to sibling leaves. `skills/AREA.md` gets one line naming `log-tail.ts` next to `observe.ts`.
- D12. No `.env` credential is needed: captures use the operator's existing claude/codex/pi logins (design confirms; verified binaries present: claude 2.1.287, codex 0.160.0, pi 1.0.0). The only `.env` interaction is the read-only value-absence check of D9 against the framework `.env`; this seat never opens or prints it.

## Read-first

- `brief.md`, `design.md` (this leaf folder)
- `skills/watch-issues/scripts/observe.ts`, `observe.test.ts` — spawn pattern, zod boundary style, `mkdtemp` test setup
- `skills/watch-issues/package.json`, `tsconfig.json` — `bun test scripts` scope, strict TS
- `/home/ivan/Work/infra/tamdoma/framework/issues/chart/busy-seat-evidence/forks/log-reading.md` — proven capture commands and format findings
- `/home/ivan/Work/infra/tamdoma/framework/issues/chart/busy-seat-evidence/slots/leaf-review-B.md` — B1-B4 evidence requirements this brief already integrates
- The two excerpt source logs (paths in D9) — verify cited lines before copying
- `tests/watch-issues-scripts.test.ts` — the blocking gate that will run this leaf's tests
- `skills/AREA.md` — doc line to update

## Needed interfaces

- `Bun.spawn` / `process.execPath` in tests (existing pattern in `observe.test.ts`).
- `zod` schemas per format at the parse boundary (dependency already in subpackage).
- `crypto.subtle.digest` or `Bun.CryptoHasher` for sha256 hex.
- Harness CLIs on PATH: `claude`, `codex`, `pi` (verified present 2026-10-02).

## Checklist

### Wave 1 (capture only; three units, disjoint paths, no shared state)

- U1. Capture the claude fixture. Owns `skills/watch-issues/scripts/fixtures/claude-session.jsonl`. mkdtemp scratch cwd, write `note.txt`, run `claude -p "Run the shell command \`false\` three times, one at a time, then run \`echo done\`, read note.txt and edit it to say bye. Reply with one word." --model claude-haiku-4-5-20251001 --allowedTools Bash,Read,Edit`; copy the new `~/.claude/projects/<scratch-slug>/*.jsonl` verbatim to the fixture; record version/date/command for the test note; delete the session file, project folder entry and scratch cwd; confirm absent. No shared test resource, depends on nothing.
- U2. Capture the pi fixture and the pi incident excerpt. Owns `fixtures/pi-session.jsonl`, `fixtures/pi-incident-excerpt.jsonl`. mkdtemp cwd, run `pi -p "Run the shell command \`false\` three times, one at a time, then run \`echo done\`, read note.txt and edit it to say bye. Reply with one word."`; copy `~/.pi/agent/sessions/--<scratch>--/*.jsonl` to the fixture; delete capture session and scratch cwd, confirm absent. Then extract verbatim lines 8, 422, 461-462, 485-488, 684-686 from the incident log (D9) into the excerpt and run the D9 `.env` absence check.
- U3. Capture the codex fixture and the codex excerpt. Owns `fixtures/codex-session.jsonl`, `fixtures/codex-exec-excerpt.jsonl`. mkdtemp cwd, run `codex exec -s workspace-write --skip-git-repo-check "<same prompt>"`; copy `~/.codex/sessions/<Y>/<M>/<D>/rollout-*.jsonl` produced to the fixture; delete capture log and scratch cwd, confirm absent. Then extract verbatim lines 18, 460, 466 (D9) into the excerpt and run the D9 `.env` absence check.

### Wave 2 (implementation; both units depend on the fixtures existing)

- U4. Write `skills/watch-issues/scripts/log-tail.ts` per D1-D7 and the one-line `skills/AREA.md` update. Owns `skills/watch-issues/scripts/log-tail.ts`, `skills/AREA.md`. Shared test resource: reads the Wave 1 fixtures read-only. Depends on U1-U3.
- U5. Write `skills/watch-issues/scripts/log-tail.test.ts` per D8/D10 with expected lines derived from fixture/excerpt contents, not from script output. Owns `skills/watch-issues/scripts/log-tail.test.ts`. Shared test resource: reads the Wave 1 fixtures read-only. Depends on U1-U3. Written independently of log-tail.ts (separate unit enforces the brief's independence requirement); the suite only passes once U4 lands.

## Verification

| Done-criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1-4: fixtures, excerpts, all fixture and edge expectations | `cd skills/watch-issues && bun test scripts` | wrong parsing, status, identity, truncation, ordering or error behavior | seconds | any change to `scripts/` |
| 4 (type errors in new code) | `cd skills/watch-issues && bun run typecheck` | untyped or mistyped script code | seconds | any change to `scripts/` |
| 1: fixtures unmodified after capture | `git status --porcelain skills/watch-issues/scripts/fixtures/` clean after copy; capture scratch dirs absent (`ls /tmp`/`mkdtemp` paths reported in test notes) | hand-edited fixtures, leaked capture sessions | seconds | at report time |
| 2: excerpt provenance and `.env` safety | `grep -c` the required source lines inside each excerpt; D9 check prints `clean` for both files | missing cited lines, leaked secret value | seconds | before commit |
| 5: blocking gate | `bun test --timeout=30000` at worktree root | `tests/watch-issues-scripts.test.ts` failure running the subpackage suite and typecheck | minutes | before report |
| repo checks | `bun run format`, `bun run typecheck` at worktree root | formatting drift, root type errors | seconds | before report |

Restart boundaries: not a slow-run leaf; single pass.

## Doc impact

- `skills/AREA.md`: extend the watch-issues line to name `scripts/log-tail.ts` as the session-log summarizer (U4).
- `tests/AREA.md`: no change; `bun test scripts` discovery covers the new test.
- No other agent or human doc names these scripts; grep over `docs/`, `README.md`, `skills/` confirmed.

## Implementation notes

Dated 2026-10-02, mechanics only:

- The configured `test_changed` is `bun test --changed="$AKROGON_BASE"` at the worktree root with `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c`; root `bunfig.toml` scopes test discovery to `tests/`, so this command runs nothing for files under `skills/watch-issues/scripts/`. Workers get it verbatim; the worker for U5 additionally runs `cd skills/watch-issues && bun test scripts` when `--changed` selects no files, the actual targeted check for this suite (brief-template rule for checkouts where the runner cannot see the changed files). Criterion proof (`bun test scripts`, `bun run typecheck` in the subpackage, root `bun test --timeout=30000`, `bun run format`, `bun run typecheck`) stays with A.
- Codex has no dedicated file tool in observed logs; criterion 3's "reads and edits print their file target" is proven by the claude and pi fixtures. The landed codex fixture read via `cat note.txt` inside `exec` and edited via `apply_patch`, so codex file-target coverage is the shell target line; `<expr>`/`#-` coverage stays with the hand-written edge inputs and excerpt.
- Excerpt fixtures contain results whose calls are outside the copied line set (pi source 422/684/686, codex 460). The implementation prints such orphan results as lines with empty target and `-` identity interleaved in file order — the brief's "one line per outer tool call" vs. required status evidence resolves in favor of surfacing the recorded exits; recorded as a limitation for review.
- `write_stdin` occurrences inside exec source join the ` ; ` target after `exec_command` entries (codex excerpt line 466 prints `<expr> ; session <expr>`); a `session <expr>` target is non-literal, so identity is `#-`.
- Fixture files must not be edited after capture, so per-fixture provenance (harness version, capture date, capture command) lives in a comment block at the top of `log-tail.test.ts`, one line per fixture, not in the fixture files.
