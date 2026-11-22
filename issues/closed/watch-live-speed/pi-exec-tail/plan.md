# Plan: pi-exec-tail

Slot A synthesis, 2026-11-20. Serial-solo: one unit, implement-issue's rule has A implement it with no workers.

## Sources

- Leaf: `issues/open/watch-live-speed/pi-exec-tail/{brief,design}.md`.
- Chart evidence: `issues/chart/watch-live-speed/forks/disposition.md` Taken 6 + Correction 1; `slots/leaf-review-b.md` F7; `slots/leaf-review-e.md` X1.
- Live shape verified against `~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-akrogon-watch-timer-u1--/2026-11-20T14-25-44-288Z_01a1f959-5760-75b0-ba6d-92fd661f2b43.jsonl` (176 exec call/result pairs; 169 carry `message.details.traces`; 7 syntax-error results have none; trace statuses seen: `done` 179, `running` 8).
- Standing design: `~/.pi/agent/skills/chart-issues/assets/standing-design.md` — fixtures are recorded output, cut verbatim, never hand-edited; hand-written edge records stay allowed.

## Decisions

- **D1 — Result-driven lines come from `details.traces`, never the code.** When an exec `toolCall` pairs to a `toolResult` whose `message.details.traces` is a non-empty array, each trace becomes one printed line: `ts` = result record timestamp, `name` = `trace.name`, `target`/`kind`/`editOld`/`editNew`/`status`/`excerpt` from the trace's `input`/`status`/`result` per D2. The exec call's own line is replaced. The source code is never scanned for a call that has a result (X1: scan disagreed with what ran in 6/176).
- **D2 — Trace → line mapping.** `bash` → kind `shell`, target = `input.command`, status from `trace.result` through the existing `piBashStatus` (`details.capture.termination.exitCode`, verified at `trace.result.details.capture.termination`). `edit` → kind `edit`, target = `input.path`, `editOld`/`editNew` = joined `input.edits[].oldText`/`newText` (same join as the native pi `edit` call). `read`/`write`/`ls`/any other name → kind `other`, target = `genericTarget(input)` (path/file_path/pattern/url). `trace.status === 'running'` → the line gets no result → prints `running`. `done` → the converted result. Any other status → `unknown`. Excerpt = first non-empty line of the trace result's `content` text through the existing pi path (`[exit N.` meta lines filtered for bash). Entries share the result record's `index`; an `Entry.sub` field (0 for call lines, trace position for inner lines) is the sort tie-break.
- **D3 — Running exec (no result record) is scanned for `\btools\.(bash|edit|read|write|ls)\s*\(` in order, one line per match.** `bash`: kind `shell`, target = literal `command` arg or `<expr>`; non-literal → `allLiteral=false` → `#-`; literal → `#<sha8(command)>`. `edit`: literal `path` + fully literal `edits[].oldText/newText` → kind `edit` (path target, `old#`/`new#`); otherwise kind `other`. `read`/`write`/`ls`: kind `other`, target = literal `path` arg or `<expr>`. Each scanned line has no result → `running`. Only the five names the brief lists are matched; anything else in the code is ignored.
- **D4 — Result with no traces (or empty) keeps today's single exec line:** `<ts> exec <empty> #- -> unknown:` plus the result's own text where it parses. Never a scanned target, never a counting identity. This already satisfies "prints `unknown` and never counts as a repeated command or edit"; only its position in the join changes (it pairs to its call as before).
- **D5 — Orphan exec results expand identically** (per-trace lines at the result's index; untraced orphan keeps today's orphan line). Uniformity, not a criterion, but the expansion happens in the result-attach path so orphans get it free.
- **D6 — Data flow.** `piSchema` result branch also captures `details.traces` (loose array: `name`, `input` object, `status`, `result` object) onto `RawResult.traces`. At result-attach time in `main`, an `exec` entry whose paired result has traces is replaced in `entries` by the trace-derived entries; `statusOf`/`excerptOf`/`render` then run unchanged because `Entry.name` is already the inner tool name (`bash` hits `piBashStatus`, others hit `isError ? 'error' : 'ok'`). New scanner `scanPiExecSource` reuses `readArg`/`readString`/`skipWs` for arg literals; for `edits` it locates the array at depth 1 and `readArg`s each `{…}` element.
- **D7 — The existing last test's expectations change.** The two verbatim 2026-09-13 records each hold a literal `tools.bash` command; under D3 they now print `bash <cmd> #<sha8> -> running:` instead of `exec  #- -> running:`. Test renamed; commit carries `Test-Change:` trailer citing brief What paragraph (frozen record is taken at the implement move, so the trailer is required by the commit rule, not the freeze).
- **D8 — All lines, including expanded inner calls, pass through the existing `entries.slice(-20)` tail window after expansion.** Inner calls of old execs can fill the window: intended, the watcher wants recent inner calls.
- **D9 — Docs:** `skills/watch-issues/SKILL.md` Busy rule is contract-level ("the existing loop bar is judged on those lines", `#<hash>`/`old#`/`#-`/`running` semantics all unchanged); no doc change. `skills/AREA.md`, `docs/`: no log-tail line-shape claims found.

## Read-first

- `skills/watch-issues/scripts/log-tail.ts` — `collectPi`, `scanExecSource`, `readArg`, `execBlockStatus`, `statusOf`, `render`, `main`.
- `skills/watch-issues/scripts/log-tail.test.ts` — `runLogTail`, `sha8`, `lines`, `piIncidentCalls` pattern for fixture-derived expectations.
- `skills/watch-issues/SKILL.md` Busy rule — the consumer contract for `#<hash>`, `#-`, `old#`/`new#`, `running`.
- `tests/hc-observe.test.ts:239` — the only other test invoking log-tail (pi fixture, unaffected).
- `issues/chart/watch-live-speed/slots/leaf-review-e.md` X1 — the traces evidence.

## Waves

Serial-solo (single unit).

**U1 — log-tail pi exec expansion + tests.** Owns: `skills/watch-issues/scripts/log-tail.ts`, `skills/watch-issues/scripts/log-tail.test.ts`, `skills/watch-issues/scripts/fixtures/pi-exec-u1-excerpt.jsonl`. No shared test resource, no prerequisite.

## Criterion proof map

| # | Criterion result | Boundary & observation | Failure it catches | Command | Size | Rerun trigger |
|---|---|---|---|---|---|---|
| 1 | traced exec → per-call lines with trace name/input/status, bash exit code, same `#` for identical command; running exec → scanned code, non-literal → `#-` | `log-tail.ts <fixture>` (smallest real boundary: the product CLI on recorded input). Before: `exec #- -> unknown` per call. After: `bash <cmd> #h -> exit 1:`, `bash <cmd> #h -> running:` etc. | Watcher blind to pi worker commands; loop counting on invisible repeated commands; a regression to source-scan prints wrong targets | `akrogon run-check --name c1 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts -t 'pi exec traced'` | seconds | log-tail.ts pi path changed |
| 2 | `tools.edit/read/write/ls` literal path printed as target; edit `old#`/`new#` like native edit | same run, `edit`/`read`/`write`/`ls` lines from traced execs | Path-less lines the watcher can't tie to a file; edit undo invisible without old#/new# | `akrogon run-check --name c2 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts -t 'pi exec traced'` | seconds | same |
| 3 | multi-call exec → one line per call in order; untraced exec → `unknown`, never counted; codex unchanged | same run (order, unknown line) + existing codex tests | Lost ordering → wrong loop verdicts; phantom repeated commands | `akrogon run-check --name c3 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts` | seconds | same |

All three proofs use `bun test` (configured runner, `test` check) on the existing test file — no new proof machinery. Slow-run: n/a.

## Condition checks (decisions vs criterion conditions)

- C1 "takes from `details.traces`" — D1. Case: fixture pair call 30/31 whose traces are `read,read,ls,read` while the code also holds them — and pair 178/179 where a huge code cell contains multiple `tools.*` matches but the result records `write,bash`: a source scan would print >2 lines/wrong targets. Violation = current code; natural red recorded below.
- C1 "bash's exit code" — D2. Case: pair 178/179 exitCode 1 → `-> exit 1:`; pair 102/103 exitCode 0 → `-> ok:`.
- C1 "same `#<hash>` as an identical command" — D2 (hash8(command) exactly). Case: result pairs 185/186 and 187/188, identical `grep -v "transcript changed" …` commands → both `#<same sha8>`; `…​-> ok:`.
- C1 "not a literal → `#-`" — D3, running only. Case: T2 `tools.bash({command: someVar})` → `bash <expr> #- -> running:`.
- C2 literal path target — D2/D3. Case: traced `write`/`read`/`ls` lines print `input.path` verbatim.
- C2 edit `old#`/`new#` — D2 join parity. Case: traced edit (pair 102/103) → `edit <path> old#<sha8(joined oldText)> new#<sha8(joined newText)>`.
- C3 one line per inner call, in order — D1/D6 sub-sort. Case: pair 30/31 prints exactly 4 lines in trace order.
- C3 untraced → `unknown`, never counted — D4. Case: pair 94/95 → exactly one line `exec  #- -> unknown`, containing no `#<hex8>`; green already today (no violation possible under current code — recorded, not invented red).
- C3 codex unchanged — exclusion. Cases: existing `codex fixture`, `codex exec excerpt`, `edge c`, `edge d`, concatenated-command tests unchanged.
- Time: no calendar-dependent expectations; recorded timestamps only.

## Tests to write (red-first)

New fixture `fixtures/pi-exec-u1-excerpt.jsonl`: verbatim source lines 1, 30, 31, 78, 79, 94, 95, 102, 103, 178, 179, 185, 186, 187, 188 of the U1 transcript above (session marker + 7 exec call/result pairs; ~50 KB), provenance comment updated.

1. `pi exec traced: per-inner-call lines, statuses, identities` (proves C1, C2, C3): expected lines derived from the fixture's own records (helper reads fixture like `piIncidentCalls`); asserts order, `exit 1`/`ok`/`running` statuses, identical `#` for the two identical greps, edit `old#`/`new#`, path targets, the single `unknown` untraced line, and total line count = trace count + 1.
2. `pi exec running: scanned tools calls` (proves C1 `#-`, C2 literal paths, C3 order): handwritten exec call with no result whose code holds literal+non-literal `tools.bash`, a literal `tools.edit`, a `tools.write` literal path, a `tools.read` non-literal path; asserts per-call `running` lines.
3. Rename + re-expect the last existing test (`unrecognized recorded pi exec…` → literal `tools.bash` running lines), same verbatim records.

## Red evidence

All three fails are the intended missing behavior (current code prints one `exec #- -> unknown:` per call); no other test failed. Logs kept:

- `check c1: 1 implementation/check-c1-1795200196766-1605394.log` — `pi exec traced` fails: `Expected: 12, Received: 8` (current output is one exec line per call, no inner-call expansion).
- `check c2: 1 implementation/check-c2-1795200198798-1607808.log` — `pi exec running` tests fail: expected 6 inner lines + bash line with `#<sha8>`, received `t1 exec  #- -> running:` / `exec  #- -> running:`.
- `check c3: 1 implementation/check-c3-1795200200644-1609522.log` — whole file: 16 pass (all codex, claude, pi fixture and edge tests), 3 fail (the two new tests plus the renamed last test, all on `exec  #-` output).

Per condition above: the C1-from-traces violation is today's code (natural red in c1/c3); the C3 untraced-`unknown` condition cannot be violated by current code (recorded, see c3's still-printing `exec  #- -> unknown:` line).

## Known limitations

- `tools.find`/`tools.grep`/`tools.wait` inside exec code are not scanned (brief lists exactly five); a transcript using them prints nothing for those calls while running, and traces still cover them once the result lands.
- Traces with statuses beyond `done`/`running` print `unknown` (none observed in the cited transcript).
- Inner non-bash tools print `ok`/`error` only (no recorded exit-code channel exists for them).

## Human blockers

None. `grants: []`, `env_names: []` — all proof is free tests.

## Implementation notes

- 2026-11-20, slot B repair F1. Preserve pi's recorded `error` outcome and diagnostic from `details.traces`, as required by brief criterion 1 and the design's rule that a record with no outcome stays unknown.
- 2026-11-20, slot B repair F2. Apply terminal `wait` trace updates to the pending exec traces with the same ID, as required by brief criterion 1's bash exit-code outcome and the design's `details.traces` source of truth.
