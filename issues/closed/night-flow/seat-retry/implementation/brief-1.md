# Unit 1: remove delivery-fault failed moves and bind the offset to its session

Worktree: /home/ivan/.akrogon/worktrees/akrogon/seat-retry-u1
Leaf: seat-retry, akrogon repo, base `c53f619`, HEAD `f2fba96` (tests already committed by the planner).

## 1. Goal

Implement plan decisions D1 and D2 of `plan.md` (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/night-flow/seat-retry/plan.md`): a seat whose herdr call fails — retryable or not — records `delivery_error` and `attempts` and retries next pass; the pending-offset late-delivery reconcile reads the recorded offset only while the pane's current session equals the session recorded with the error.

## 2. Acceptance criteria

1. After a retryable `herdr agent start` or `herdr agent prompt` failure on any pass number, the leaf's `state.yaml` keeps its `phase`, grows `attempts[slot]` and `delivery_error[slot]` (command, code, message, pane, session, at, offset only when a session-file offset was taken), and `failure` stays absent. No `commitMove` to `failed` exists on this path.
2. A non-retryable herdr error (`boom`, `exit 1`, malformed stderr) records the same `delivery_error` and `attempts` and never fails the leaf.
3. A later successful delivery still clears `delivery_error` and resets `attempts` via `recordDelivery` (unchanged).
4. The pending-offset reconcile in `dispatchSlot` calls `deliveredAfter` only when `pendingOffset !== undefined`, `pane.agent_session` is set, and `pane.agent_session.value === delivery_error[slot].session`. On any mismatch (including recorded `session === null` vs any live session) the code falls through to `agent start`/`agent prompt` as today, and a fresh successful prompt clears the error.
5. `bun run typecheck` shows no unused-import or unused-symbol error; `retryable` stays imported (used by `mergeNotice` at ~:1055).

## 3. Read-first list

- `src/next.ts` `dispatchSlot` (function starts ~:541): `recordFailure` ~:568-602, `unreachable` ~:604-615, body ~:617-719 — the only code you touch.
- `src/state.ts` `deliveryErrorSchema` :22-29 (`session: z.string().nullable()`, `offset` optional).
- `src/shell.ts` `retryableCodes`/`herdrError`/`retryable` :163-184 — `retryable(result)` stays imported; only its routing inside `dispatchSlot` goes.
- `src/session-file.ts` `deliveredAfter` signature — unchanged.
- One pattern to copy: the existing `recordFailure` state-write shape (read `readState`, spread, `saveState`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/next.ts` only. No test edits (planned tests are committed and locked; a red planned test is a mismatch, not your edit).

Changes inside `dispatchSlot`:

a) `recordFailure(argv, error, pane, offset)`: delete the `if (next.attempts[slot] >= 3) { await commitMove(...) } else { saveState(...) }` split; the function ends with `saveState(leaf.path, next)` unconditionally. Function becomes fully synchronous except `readState`/`saveState`; keep the `async` signature or drop it — follow surrounding style, keep diff minimal.

b) Delete the `unreachable` function entirely.

c) `agent start` failure branch: replace `if (retryable(started)) await recordFailure(startArgv, error, pane, undefined); else await unreachable(error, pane);` with `await recordFailure(startArgv, error, pane, undefined);`.

d) `agent prompt` failure tail: delete `if (retryable(result)) { await recordFailure(...) ; return; } await unreachable(error, ready);` and keep only `await recordFailure(args, error, ready, error.code === 'timeout' ? offset : undefined); return;` (preserve the existing timeout-offset argument).

e) Reconcile guard: today `if (pendingOffset !== undefined && pane.agent_session !== null && pane.agent_session !== undefined)`. Add the session binding: also require `pane.agent_session.value === state.delivery_error[slot]!.session`. The recorded `session` is `string | null`; strict equality is the whole check (recorded `null` can never equal a live `value`, which correctly forces a resend).

f) `commitMove` import stays (used elsewhere in the file). Confirm no other caller of `unreachable` or the deleted branch remains.

Nothing lands before this unit; no shared test resource (worker runs `bun test --changed` which uses only fixture temp dirs).

## 5. Do-not, reasons and exceptions

- Do not touch `tests/` — tests are locked; a red or wrong planned test returns a mismatch with evidence, never a test fix. Exception: none.
- Do not touch `src/state.ts`, `src/session-file.ts`, `src/status.ts`, `src/shell.ts` or any doc — out of scope, other unit owns docs. Exception: none.
- Do not add relaunch, naming, timer, or trigger changes — locked exclusions in the design. Exception: none.
- Do not keep `unreachable` "for other callers" — it has none after (b). Exception: none.
- Do not change the `recorded.phase !== leaf.state.phase || recorded.done.includes(slot)` early return, the busy/grace guards, the `blockOnStart` path, `observeBusy`, `recordDelivery`, or the timeout `deliveredAfter` settlement — they are the invariant surface the tests prove. Exception: a revised brief from A.
- A mismatch names the conflicting requirement and smallest brief correction; return it instead of working around. Exception: a revised brief from A authorizes the change.

## 6. Ordered steps

1. Read `src/next.ts` `dispatchSlot` end to end (AC1-5).
2. Apply edits (a)-(e); verify `retryable(` no longer appears inside `dispatchSlot` (AC1, AC2, AC5).
3. `bun run typecheck` — clean (AC5).
4. Run the section-7 command; every dispatch-fault test in `tests/next.test.ts` flips green, nothing else regresses (AC1-4).
5. Commit only `src/next.ts` with a message describing the behavior change; return the commit id.

Advisory size: ~1 file, ~40 changed lines, under 15 turns.

## 7. Commands

```sh
AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c bun test --changed="$AKROGON_BASE" --timeout=30000
```

(run in the worktree; install deps first with `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile` if `node_modules` is missing)

## 8. Done-when, evidence and report

All 5 acceptance criteria hold; the section-7 run is green for the leaf's changed tests (the committed planned tests in `tests/next.test.ts` now pass and no unrelated test regressed); one commit on the lane branch HEAD containing only `src/next.ts`. The full suite still has no failures outside the leaf's planned reds — none should remain.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
