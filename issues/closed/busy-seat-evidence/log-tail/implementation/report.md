# Implementation report: log-tail

Base: `5bb552d` · Head: `082033a` · Branch: `log-tail` · Mode: subagents, 2 waves (3 + 2 workers), all worker worktrees removed.

## Changed files and reasons

| Commit | Files | Reason |
|---|---|---|
| `0ea5762` | `skills/watch-issues/scripts/fixtures/claude-session.jsonl` | verbatim claude 2.1.287 capture (criterion 1) |
| `7989ef5` | `fixtures/pi-session.jsonl`, `fixtures/pi-incident-excerpt.jsonl` | verbatim pi 1.0.0 capture + verbatim incident excerpt lines 1,8,422,461-462,485-488,684-686 (criteria 1,2) |
| `3a1bd9f` | `fixtures/codex-session.jsonl`, `fixtures/codex-exec-excerpt.jsonl` | verbatim codex-cli 0.160.0 capture + verbatim excerpt lines 1,18,460,466 (criteria 1,2) |
| `11fb163` | `skills/watch-issues/scripts/log-tail.ts`, `skills/AREA.md` | the summarizer (criteria 3,4) + doc line |
| `082033a` | `skills/watch-issues/scripts/log-tail.test.ts` | fixture + excerpt + edge tests, expected lines derived from fixtures, not the script (criteria 3,4) |

Worker returns folded in from `implementation/brief-1..5.md`; fixture provenance for the test-file comment recorded in `implementation/provenance.md` (harness versions, dates, capture commands, excerpt sources and line lists, `.env` check results — all `clean` under an `env -i`-scrubbed env check; no `.env` file was ever opened).

## Commands run and results

- `cd skills/watch-issues && bun test scripts` → 37 pass / 0 fail (22 observe + 15 log-tail). Seconds.
- `cd skills/watch-issues && bun run typecheck` (`tsc -p tsconfig.json`) → exit 0. Seconds.
- `bun test --timeout=30000` at root → 356 pass / 0 fail, includes `tests/watch-issues-scripts.test.ts` gate (1.4 s). ~13 s total.
- `bun run typecheck` at root → exit 0. Seconds.
- `bun run format` → all files unchanged. Seconds.
- `AKROGON_BASE=5bb552d… bun test --changed` → selects nothing (root `bunfig` scopes tests to `tests/`); documented in plan Implementation notes.
- Per-worker `bun test --changed` runs: 0 affected (fixture/test files outside root scope) — pasted in worker returns.

## Criterion proof map

1. Fresh captures: three fixtures committed verbatim with cmp-verified copies; versions/dates/commands in `provenance.md` and the test-file header; capture sessions and scratch cwds deleted (ls-absence pasted by workers).
2. Excerpts: per-line byte-identity checks pasted by workers; `.env`-value absence check printed `clean` for both excerpt files.
3. Fixture tests: `log-tail.test.ts` fixture cases pass — `exit 1`/`error` alternation for claude `false`, `ok` for `echo done`, `note.txt` targets on read/edit lines, `exit 1/143/2` on the pi incident excerpt, joined literal cmds + `session <expr>` + `unknown,exit 1,ok,running,running` on the codex excerpt, record order asserted.
4. Edge tests a–j all pass (last-20 slice, 120-char-prefix distinct hashes, `#-` ×2, `unknown` block, swapped `old#`/`new#`, `…` cuts, `running`, unterminated tail skipped, parse error names path+line, missing file and unknown format name path).
5. Blocking `test` (`bun test --timeout=30000`) green including the gate test.

## Known limitations

- Orphan results: excerpts hold results whose calls aren't in the copied lines; they print as lines with empty target and `-` identity in file order so the recorded `exit`/`running` statuses surface. Resolves "one line per outer tool call" vs. required evidence in favor of evidence; flagged for review.
- Newlines inside multi-line targets/excerpts render as `⏎` (contract didn't specify one-line flattening).
- `write_stdin` inside exec source joins the ` ; ` target after `exec_command` entries (`<expr> ; session <expr>` on excerpt line 466); non-literal session target ⇒ `#-`.
- Pi `exec` (wrapped `arguments.code`) path is implemented and covered only by the codex excerpt shape; the fresh pi fixture contains no `exec` calls — pi 1.0.0 `-p` uses native `bash`.
- Pi 1.0.0 bash non-zero exits surface via `isError:true` + `Command exited with code N` text (no `details.capture`); handled, tested, noted in plan notes.
- `.env` check caveat: `bun --env-file` merges into ambient `process.env`; under the operator's ambient env `HOME`/`USER` match log text. The committed check ran under `env -i`; future reruns need the same scrub.

## Unverified criteria

None — all five done-criteria have pasted passing evidence.

Last operation: wave-2 commits landed (`11fb163`, `082033a`), all proofs and `checks` green, report written.
Next: check-issue log-tail slot=<A|B> phase=check.review leaf=/home/ivan/Work/infra/akrogon/issues/open/busy-seat-evidence/log-tail
