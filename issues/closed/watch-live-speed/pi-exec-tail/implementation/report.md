# Report: pi-exec-tail

Serial-solo implement (every wave holds one unit), slot A, 2026-11-20.

## Base and head

- Base (AKROGON_BASE): `a52d3dad76ee78769b62a18c6798a84030a75a18` (branch rebased onto `origin/main` `a52d3dad` at pass start; prior base `842db38b`, prior head `d836b0e6` → `c2764116` after rebase).
- Head: `efb6ca4c7790707ef9d311676df73f38e74bc5c7`, worktree clean.
- Commits: `c2764116` test (red, planned), `a095fce2` feat, `efb6ca4c` test type fix.

## What changed

- `skills/watch-issues/scripts/log-tail.ts` — per plan D1–D8:
  - `collectPi` exec calls now keep `target ''`, `allLiteral false` and a `scan` of `scanPiExecSource(code)`; no more codex `exec_command` scan for pi.
  - `scanPiExecSource` returns one `ScannedCall` per `tools.(bash|edit|read|write|ls)(` match: bash literal `command` → shell target/hash, non-literal → `<expr>` `#-`; edit literal `path`+fully literal `edits[].oldText/newText` → edit kind with joined old/new (else other); read/write/ls literal `path` → other-kind target else `<expr>`.
  - `collectPi` toolResult now parses `details.traces` into `RawResult.traces` (name/status/input/inner result with `content` texts, `isError`, inner `details.capture.termination`).
  - `piExecEntries`: result with traces → one `Entry` per trace (result ts, trace name/input/status via `traceEntry`; bash exit via `piBashStatus` on the inner result, non-done/non-running statuses → `statusOverride 'unknown'`); result without traces → the kept `exec  #-` line (status `unknown` via `execBlockStatus` on result text); no result → the scanned per-call lines (status `running`); empty scan → today's single `exec  #-` line.
  - `main` expands `exec` entries (paired and orphan) after result attach, before index sort; sort is stable so trace order holds. `render` honors `statusOverride`. `argValueAt`/`objEnd`/`readEditsArg` added; `readArg` reuses `argValueAt`.
- `skills/watch-issues/scripts/log-tail.test.ts` — new `pi exec traced` (fixture-driven expected lines), new `pi exec running` (handwritten six-call scan), renamed last test with re-derived expected output, helpers `PI_SESSION`/`piExecCall`/`flat`/`cutLike`.
- `skills/watch-issues/scripts/fixtures/pi-exec-u1-excerpt.jsonl` — verbatim source lines 1, 30, 31, 78, 79, 94, 95, 102, 103, 178, 179, 185, 186, 187, 188 of the cited U1 transcript.
- No doc changes (plan D9: SKILL.md Busy rule is contract-level and unchanged).

## Commands and results

- `akrogon run-check --name c1 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts -t 'pi exec traced'` → `check c1: 0` (`implementation/check-c1-1795200693455-1732104.log`), head `a095fce2`.
- `akrogon run-check --name c2 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts -t 'pi exec traced'` → `check c2: 0` (`implementation/check-c2-1795200696549-1732499.log`), head `a095fce2`. (C1+C2 share the one traced test, as planned.)
- `akrogon run-check --name c3 -- bun test ./skills/watch-issues/scripts/log-tail.test.ts` → `check c3: 0` (`implementation/check-c3-1795200696700-1732596.log`), 19 pass, head `a095fce2`.
- `bun test ./scripts/log-tail.test.ts` inside `skills/watch-issues` → 19 pass on `efb6ca4c`; `bun run typecheck` in the same dir → clean on `efb6ca4c`.
- `akrogon verify` run 1 → red: `watch-issues scripts test and typecheck pass` failed on `scripts/log-tail.test.ts` TS2339 (`toolCallId` cast at record level; the skill's own `tsc -p` is stricter than root `tsc --noEmit`), plus one unrelated red `no session, several sessions…` in the same log; fixed by `efb6ca4c`, and the unrelated red did not recur.
- `akrogon verify` run 2 → `verify leaf efb6ca4c: green`, 1233 pass 0 fail (`implementation/check-test-1795200942409-2277566.log` plus format/typecheck/setup logs in `implementation/`).
- Red-before evidence is in `plan.md` (`check-c1/c2/c3-17952001…` logs).

## Criterion map

1. Traced exec → one line per inner call with trace name/input/status, bash exit from `details.traces`; running exec → scanned tools calls, non-literal → `#-`: proven by `pi exec traced` + `pi exec running` (c1/c2/c3 logs).
2. edit/read/write/ls literal path as target; edit `old#`/`new#`: proven by the same tests (traced edit and write/read/ls lines, running edit `old#`/`new#`).
3. Multi-call exec one line per call in order; untraced → `unknown`, never counted; codex output unchanged: proven by the fixture's 15-line expectation and all codex tests green in c3.

## Known limitations / unverified

- `tools.find`/`tools.grep`/`tools.wait` inside exec code are not scanned (brief names exactly five); their calls appear only via traces once a result lands.
- Trace statuses beyond `done`/`running` print `unknown` (none observed in the cited transcript).
- Inner non-bash tools print `ok`/`error` only — no recorded exit-code channel for them.
- The untraced exec keeps the call timestamp; only traced inner lines use the result timestamp (chosen in implementation; no criterion pins the untraced line's ts).
- Pre-existing prettier drift in `skills/watch-issues/scripts/` is untouched; the configured `format` check does not cover this path.
