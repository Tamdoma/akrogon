# brief-1: peer-wait.ts script (plan U1, decisions D1–D4)

## 1. Goal

Create `skills/chart-issues/scripts/peer-wait.ts`: a self-contained Bun script that foreground-waits on a prompted herdr peer so the caller stays in its turn. Plan decisions D1 (single file, monotonic deadline, strict outcome order), D2 (no imports from `src/`; `process.stderr.write` for verbatim pass-through), D3 (timeout = stderr JSON `{"error":{"code":"timeout"}}` only; every other non-zero exit is pass-through), D4 (file check after EVERY herdr return, including timeout and `working`).

## 2. Acceptance criteria

1. `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` runs. `budget-seconds` is parsed as a positive finite number of seconds (accept `10`, `2.5`; reject missing/garbage/negative args with a stderr usage/error line and non-zero exit).
2. Loop: `deadline = start + budget*1000` on a monotonic clock (`performance.now()`). While `remaining = deadline - now > 0`, run `herdr agent wait <pane> --timeout <ms>` where `ms = floor(min(10000, remaining))`. No herdr call starts once the deadline passed. Nothing is printed per loop iteration.
3. On non-zero herdr exit: if stderr parses as JSON with `.error.code === "timeout"`, treat as a timeout return (continue below). Any other non-zero exit: write `result.stderr` to stderr via `process.stderr.write` byte-identical, write nothing to stdout, `process.exit(<herdr exit code>)`. No result line.
4. After every herdr return that was not passed through (success result or timeout), in this order:
   a. if returned status is `blocked` → outcome `blocked`
   b. if return file exists and size > 0 → outcome `done` (even when herdr timed out or reported `working`)
   c. if returned status is `idle` or `done` AND file missing or 0 bytes → outcome `failure`
   d. if `remaining <= 0` → outcome `budget`
   e. otherwise loop again
5. `status` in the result line is the last `agent_status` value herdr returned in a successful body; `null` when herdr never returned one (only timeouts, or deadline passed before the first wait). A successful body reporting `working` counts as a returned status and falls through to the loop like a timeout.
6. Every terminating outcome a–d prints exactly one line to stdout and exits 0: `{"outcome":"done"|"blocked"|"failure"|"budget","pane":"<pane arg>","file":"<return-file arg>","status":"<last status or null>"}` — key order as shown, single line, nothing else on stdout.
7. `bun test --changed=$AKROGON_BASE --timeout=30000` passes (the file is new but outside `tests/`; an empty changed set is fine).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/watch-issues/scripts/observe.ts` — repo style for a self-contained Bun script under `skills/*/scripts/` (shebang, node:fs, zod)
- `src/shell.ts` — `Result` shape and `herdrError` parse pattern; do NOT import it
- `design.md` leaf interfaces for the exact herdr 0.9.3 bodies (reproduced in section 4)

## 4. Change list and needed interfaces

Owns exactly one new file: `skills/chart-issues/scripts/peer-wait.ts`. Nothing else may change in this worktree.

Interfaces (from locked design, verbatim facts):

- Spawn: `herdr agent wait <pane> --timeout <ms>` via `Bun.spawn(['herdr','agent','wait',pane,'--timeout',String(ms)], {stdout:'pipe', stderr:'pipe'})`, awaiting `exited`.
- Success body (exit 0): `{"result":{"agent":{"agent_status":"idle"|"done"|"blocked"|...}}}`. Parse stdout JSON and read `.result.agent.agent_status` with a zod schema (or guarded JSON.parse + field check); a success with unparseable body is a pass-through failure (herdr did not return a status — propagate raw stderr, which may be empty, exit non-zero).
- Timeout (exit 1): stderr `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}`
- File check: `statSync`/`existsSync` on the return-file path; non-empty = exists and `.size > 0`; a read error means missing/empty (file is an outside artifact, absence is a normal state).
- Precedence per return: pass-through error → `blocked` → file non-empty `done` → `idle`/`done` + missing/empty `failure` → deadline `budget` → repeat. `unknown`/`working` statuses continue the loop.
- This brief's unit is script-only; `tests/peer-wait.test.ts` is a later unit (U4) — do not write it.

## 5. Do-not, reasons and exceptions

- Do not import anything outside `node:`/`bun:` modules and `zod`: the script runs from the consumer repo root via `bun <path>` and `src/` sits under a different project root; importing it would also inherit its trimming (`run()` trimEnd) breaking the verbatim stderr contract.
- Do not use `console.error`/`console.warn` for pass-through (appends a newline → breaks "stderr passed through unchanged"); use `process.stderr.write(result.stderr)` and preserve the herdr exit code, defaulting to 1 only if code is 0 on a weird path.
- Do not print anything except the single result line on stdout (a stray line breaks callers parsing the contract).
- Do not retry or sleep inside the script; rerun-on-budget is the caller's rule.
- Do not write the test file, fake-herdr changes, tsconfig or prose edits; other units own them.
- Return a mismatch with evidence instead of changing scope or interfaces; the exception is a revised brief from A authorizing it.

Restated: no imports beyond node/bun/zod, no newline-appending writers, no stray output, no retry/sleep, no out-of-scope files; mismatch evidence over scope change unless A revises the brief.

## 6. Ordered steps

1. Read `skills/watch-issues/scripts/observe.ts` for style (criterion: match repo conventions).
2. Write `peer-wait.ts` implementing sections 2 and 4 (criteria 1–6).
3. Run `AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377 bun test --changed=$AKROGON_BASE --timeout=30000` (criterion 7).
4. Sanity-invoke once by hand, e.g. `bun skills/chart-issues/scripts/peer-wait.ts w9:pXX /tmp/nonexistent 0.2` expecting exactly one JSON line `{"outcome":"budget",...,"status":null}` when no herdr is on PATH — record the observed line (criteria 2,6). If real herdr is on PATH prefer a fake or a tiny budget and record what happened; do not install anything.
5. `bun x tsc --noEmit` is NOT your job (U5 runs checks); but keep the file strict-clean: explicit types on every variable/return.
6. `git add skills/chart-issues/scripts/peer-wait.ts && git commit -m "add peer-wait foreground wait script"` and return the commit ID.

Advisory size: 1 file (~120–160 lines), under 12 turns.

## 7. Commands

```bash
export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377
bun test --changed=$AKROGON_BASE --timeout=30000
```

## 8. Done-when, evidence and report

Done when all acceptance criteria hold and the commit exists. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
