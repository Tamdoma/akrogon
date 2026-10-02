# Brief 5: write log-tail.test.ts (log-tail U5)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u5` (created by A at the lane HEAD after wave 1 lands; it contains the committed fixtures but NOT `log-tail.ts` — a sibling unit writes it in parallel; your test cannot run green in your worktree, which is expected and not your defect).

## 1. Goal

Write `skills/watch-issues/scripts/log-tail.test.ts` (new, the only file you own). Leaf done-criteria 1-4 test coverage; plan D8, D10. Expected lines are written independently of the script — derive them from fixture contents and the output contract below, never by running a log-tail implementation.

## 2. Numbered acceptance criteria

1. Top of file: a comment block noting per fixture the harness version, capture date and exact capture command (values are in `/home/ivan/Work/infra/akrogon/issues/open/busy-seat-evidence/log-tail/implementation/provenance.md` — read it; it is written by A from wave-1 returns).
2. Fixture tests spawn `process.execPath log-tail.ts <fixture>` from `skills/watch-issues/scripts/` (same `Bun.spawn` pattern as `observe.test.ts`) and assert exact expected stdout lines: 
   - claude fixture: three `Bash` `false` lines show `exit 1` or `error` (accept either per the contract), `echo done` shows `ok`, `Read` and `Edit` lines show the `note.txt` path as target, all `#<8hex>` identities differ between different commands, lines are in record order.
   - codex fixture: `exec` lines show each literal `cmd` joined ` ; `; statuses are per `output[]` block in order (this log's blocks are envelope text → `unknown`, result JSON → `exit 1`/`ok`, so a `false` call reads `unknown,exit 1`); the excerpt shows the inner `output` field text, never the envelope; a call with a pending `session_id` block includes `running` in its joined status; `echo done` includes `ok`.
   - pi fixture: `bash` lines show `exit 1` ×3 — this capture records failure as `isError:true` + text "Command exited with code 1" (no `details.capture.termination`), so assert `exit 1`, not `error` — and `ok` for `echo done`; `read`/`edit` lines show `note.txt` target; edit shows `old#... new#...`.
   - pi incident excerpt: the lines for source lines 422, 684, 686 show `exit 1`, `exit 143`, `exit 2` respectively (results recorded with `isError:false`); the edit lines for 461/485/487 show `launch-core.ts` target with `old#`/`new#`.
   - codex excerpt: line-18's call shows three literal cmds joined ` ; ` (assert each command substring, not the whole string — it is >120 chars and gets cut/`…`); the line-466 exec call contains `session_id:prev.session_id` (non-literal) → `session <expr>`; the call paired to output line 460 shows per-block statuses in order including `exit 1` and `running` among `unknown`/`ok` blocks.
   Derive exact expectations by reading the fixture records (a small local sha256 helper matching the contract is allowed to compute expected `#` values — that is not "running the script"). Where strict string equality would couple to a modeling choice the contract leaves open, assert the contract's required parts (`toContain`/`match`) — e.g. accept `exit 1` or `error` for claude `false` results.
3. Hand-written edge tests (inline JSONL strings in `mkdtemp` files, each format minimal):
   a. 21+ calls → exactly the last 20 lines printed.
   b. Two commands sharing their first 120 chars → different `#` identities.
   c. Two different non-literal `cmd`s (e.g. `cmd: someVar`, `cmd: \`x${y}\``) → both `#-`.
   d. An `exec` output block that is not JSON → `unknown` status.
   e. An `edit` then its exact inverse → swapped `old#`/`new#`.
   f. A target and an excerpt over 120 chars → each ends `…`.
   g. A call with no result record → `running`.
   h. An unterminated final record → skipped (earlier calls still print).
   i. A complete unparsable record → non-zero exit, stderr names path and line.
   j. Missing file and unknown format → non-zero exit naming the path.
4. The test asserts exit code 0 and only stdout lines for good inputs, and stdout empty on error paths (matching observe.test.ts conventions).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/watch-issues/scripts/observe.test.ts` — spawn pattern (`Bun.spawn([process.execPath, script, arg])`, `Response(child.stdout).text()`, `mkdtemp` cleanup with `rmSync`). Copy it.
- `skills/watch-issues/scripts/fixtures/` — the five committed fixtures: `claude-session.jsonl`, `codex-session.jsonl`, `pi-session.jsonl`, `pi-incident-excerpt.jsonl`, `codex-exec-excerpt.jsonl`. Read the records to derive expected lines (check for `tool_use`/`tool_result`, `custom_tool_call`/`custom_tool_call_output`, `toolCall`/`toolResult` shapes).
- `/home/ivan/Work/infra/akrogon/issues/open/busy-seat-evidence/log-tail/implementation/provenance.md` — fixture provenance for the comment block.
- The leaf `plan.md` (`/home/ivan/Work/infra/akrogon/issues/open/busy-seat-evidence/log-tail/plan.md`) D1-D10 — the output contract.

## 4. Change list and needed interfaces

Owns exactly `skills/watch-issues/scripts/log-tail.test.ts`. Shared test resource: reads `fixtures/` read-only (fixture mtimes/content unchanged by you). Land-first: U1-U3 fixtures (committed in your worktree). `log-tail.ts` is owned by U4 — never create or edit it.

Output contract (the spec you test):
`<timestamp> <tool> <target> <identity> -> <status>: <excerpt>` — timestamp is the record's own; tool is the recorded tool name; target per format (claude `Bash`→`input.command`, `Read`/`Edit`→`input.file_path`; pi `bash`→`arguments.command`, `edit`/`read`→`arguments.path`; codex/pi `exec`→ literal `cmd`s joined ` ; ` with `<expr>` for non-literals, `write_stdin`→`session <id|expr>`); identity `#<8hex>` sha256 of full joined target (`#-` if any `<expr>`), edits `old#<8hex> new#<8hex>` over concatenated before/after texts, other tools `-`; status `ok|exit <n>|error|running|unknown` — claude: `Exit code <n>` text → `exit <n>`, else `is_error` → `error`, else `ok`; pi bash: `details.capture.termination.exitCode` when present (0 → `ok`, n → `exit n`), else `isError:true` + `code N`/`exit N` in text → `exit n` (or `error` when no code), else `ok`; exec (codex + pi): EVERY output/content block gets a status joined `,` — result JSON `exit_code` 0 → `ok`, non-zero → `exit n`, `session_id` w/o `exit_code` → `running`, all other blocks (envelope prose, `{}`, non-JSON) → `unknown`; no paired result → `running`; excerpt first non-empty line of own output (`output` field inside exec blocks, envelope text never; pi bash capture-log `[exit N. Full output...]` lines are metadata, not excerpt); 120-char cut marked `…`; last 20 calls oldest-first; errors non-zero naming path (and line for parse failures).

## 5. Do-not, reasons and exceptions

- Do not create, edit or copy `log-tail.ts` or any implementation: expected lines must be independent of the script — deriving them by running an implementation voids the criterion. Exception: none.
- Do not modify fixtures or other test/script files. Exception: none.
- Do not weaken assertions to match hypothetical output; write what the contract requires, mark genuinely open points as `exit 1`/`error` alternation. Exception: none.
- A red test in your worktree caused solely by `log-tail.ts` being absent is expected: assert that the spawn failure is the only failure mode before reporting; a test that fails for a different reason is yours to fix. Exception: none.
- Return a mismatch with evidence instead of changing scope; exception is a revised brief from A.

These exclusions keep the independence guarantee the brief demands; the only exception is a revised brief.

## 6. Ordered steps

1. Read `observe.test.ts`, `provenance.md`, and each fixture's relevant records.
2. Write the file: provenance comment block, spawn helper, per-fixture tests, edge tests a-j.
3. Compute expected `#`/`old#`/`new#` values in-test with a local sha256 helper (`Bun.CryptoHasher`/`crypto`) over the fixture's recorded strings — do not paste script-derived values.
4. Attempt `bun test scripts/log-tail.test.ts` in `skills/watch-issues` — record the actual result; if the only failure is the missing script, that is the expected state. Also run `bun run typecheck` in `skills/watch-issues` — it must pass (it compiles your file).
5. `git add` your file only; commit `Add log-tail tests`. Return the commit ID.

Advisory size: 1 file (~250-350 lines), under 40 turns.

## 7. Commands

- `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed="$AKROGON_BASE" --timeout=30000` at worktree root (may select nothing — the root runner only sees `tests/`; paste whatever it prints).
- `cd skills/watch-issues && bun run typecheck` — must pass; paste output.

## 8. Done-when, evidence and report

Done when the commit exists with exactly the test file, typecheck output is pasted, the test's current run result is described honestly (expected: script absent → spawn failure only), and each criterion 1-4 is linked to the test names covering it.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
