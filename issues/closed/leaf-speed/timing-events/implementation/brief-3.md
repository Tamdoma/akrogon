# Brief U3: src/run-check.ts check_start/check_end + worker/base scope

## 1. Goal

Emit `check_start` before the child spawns and `check_end` with exit/duration/log after `runCheck` finishes, and resolve `scope`/`unit`/`phase`/`attempt` in `leafTarget` (plan decisions D5, D11).

## 2. Acceptance criteria

1. `leafTarget` returns `{ slug, target, baseSha?, scope: 'leaf'|'worker'|'base', unit?: string, phase?: Phase, attempt?: string }`:
   - `--leaf` override: `scope: 'leaf'`, `slug` from `readState`, `phase` from that state, `attempt` from `state.batch?.attempt`.
   - exact leaf worktree match: `scope: 'leaf'`, `phase`/`attempt` from the leaf's state.
   - worktree-store dir whose basename matches `^<slug>-u(\d+)$` for an existing leaf: `scope: 'worker'`, `unit: 'u<N>'`, `phase`/`attempt` from the leaf's state. Match this case right after the exact-match loop, scanning `allLeaves(repo)` for `leaf.state.slug === basename.slice(0, -suffix.length)`; the leaf's own `state.worktree` need not exist.
   - open `base-runs.jsonl` row: `scope: 'base'`, `attempt: run.attempt`, `phase` from the caller leaf's state, plus the existing `baseSha`.
   - `--holder` fallback: `scope: 'leaf'`, slug `'checkout'`, no `phase`.
2. In `runCheck`, before `spawnLogged`: `appendTiming(repo, { kind: 'check_start', slug, run: randomUUID(), phase?, name: name ?? 'run', scope, unit?, attempt? })`. `run` is one `randomUUID()` shared by start and end.
3. After `spawnLogged` returns and `copyFileSync` writes the kept log: `appendTiming` `check_end` with the same fields plus `exit: result.code`, `duration_ms: Date.now() - started` where `started` is captured immediately before `spawnLogged`, and `log: <kept log path>`.
4. `check_end` appends before `return result.code`; a killed run-check leaves `check_start` without an end (no finally block needed).
5. Timing failures warn on stderr and never change the exit code.

## 3. Read-first

- `src/run-check.ts` — `leafTarget`, `runCheck`, `spawnLogged`; note `mkdtempSync` `runRoot` lifetime.
- `src/base-run.ts` — `baseRunSchema` (`attempt`, `end` marks a closed run), `readBaseRuns`.
- `src/timing.ts` — `appendTiming`, `check_start`/`check_end` shapes (D11).
- `src/state.ts` — `allLeaves`, `Leaf`.
- `skills/implement-issue/worker-protocol.md` — `<slug>-u<N>` worker worktree naming.
- ponytail.md.

## 4. Change list and needed interfaces

Owns: `src/run-check.ts` only. Prerequisite: U1 on HEAD (`src/timing.ts` exists; if absent, mismatch). Imports: `appendTiming` from `./timing`, `randomUUID` from `node:crypto`, `basename` from `node:path`, `phaseSchema`/`Phase` only if needed for the `phase` field type (read `state.phase` directly — it is already a `Phase`).

Worker match detail: for the toplevel dir basename `name`, test `/-u(\d+)$/`; when it matches, find a leaf whose `state.slug` equals the captured prefix. Only then is it `scope: 'worker'` — a leaf whose slug itself ends `-uN` already matched the exact-match loop above.

## 5. Do-not, reasons and exceptions

- Do NOT touch `constructedEnv`, `refuse`, `spawnLogged` or the `.owner` write. Reason: out of scope. Exception: revised brief.
- Do NOT put `check_end` in the `finally` — a killed process must leave no end event, and `rmSync(runRoot)` cleanup already runs in `finally`. Reason: criterion 2's killed-check case.
- Do NOT write or edit tests; `tests/timing.test.ts` red is expected until all units land. Exception: none.
- No argv, cwd list or env values in the events. Reason: the brief forbids them.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Extend `leafTarget`'s return type and all four resolution paths per section 2.
2. Emit `check_start` and `check_end` in `runCheck` per section 2.
3. `bun install --frozen-lockfile`, run section 7; `tests/timing.test.ts` red is expected — report it, fix only diff-caused failures.

Advisory: 1 file, under 10 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

All four scope paths return the right `scope`/`unit`, both events emit per run, typecheck clean. Commit message: `timing-events: check_start/check_end with leaf/worker/base scope`. `Test-Change:` trailer only if an existing test file changed (none should).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
