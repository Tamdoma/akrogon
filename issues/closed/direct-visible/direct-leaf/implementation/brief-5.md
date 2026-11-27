# Brief 5 — U5: broadcast turn and landing (broadcastPass direct branch, closed-leaf status scan, existing-test target sweep)

## 1. Goal

Implement plan decisions D14, D8 (test-sweep half) and the U5 wave line of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (read it first — D14, D8, the Implementation constraints section on closed-but-broadcasting leaves, Criterion 7 landing + Criterion 8 constructions). Outcome: a merged direct leaf's broadcast prompt is sent to recorded seat B when B reads idle/done — no allocation, no new terminal; holds and retries follow the existing settle rules; closed broadcast-pending leaves appear in status JSON; existing broadcast-positive tests gain webhook config; `tests/direct-land.test.ts` passes unmodified in full (all 6 tests: landing, gate, idle, working-hold, send-failure).

## 2. Numbered acceptance criteria

1. `bun test tests/direct-land.test.ts --timeout=120000` — all 6 tests pass unmodified.
2. `bun test tests/green-merge.test.ts --timeout=120000` — passes WITH your webhook_env additions (see below); the broadcast-positive tests in it stay meaningful (they still assert broadcast recorded/prompted).
3. `bun test tests/batch-dispatch.test.ts tests/session-routing.test.ts --timeout=120000` — pass with your additions.
4. `bun test tests/status-json.test.ts tests/status.test.ts --timeout=120000` — pass unmodified.
5. `bun run typecheck` exits 0.
6. Lifecycle broadcast behavior unchanged except the config gate: with webhook config a lifecycle leaf's broadcast flow is byte-identical to before.

Test edits here are assigned unit content (the D8 sweep), not violations: each commit touching an existing test file carries the `Test-Change:` trailer — section 8.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — D14, D8, implementation constraints (closed-but-broadcasting scan, send-failure shape, cross-session).
- `src/next.ts` — `broadcastPass` (~L1256), `dispatchSlot` send/record mechanics (prompted/delivery_error/turn settle rules) — replicate the RECORD semantics exactly, only the delivery path differs.
- `src/reconcile.ts` — `broadcastInProgress` direct probe (U3 lands this in wave 2; verify presence, don't duplicate).
- `src/phase.ts` — `commandMerged` gate (U2 lands it in wave 2; verify presence).
- `src/status.ts` — `scanRepo`/`leafJson` leaf filtering (`scan.leaves` open-only at present).
- `src/hc.ts` — `terminal()`, `send`, HcError kinds.
- `tests/direct-land.test.ts` — the executable contract; read FULLY including the helper constructions. Note T6 arms the shim failure before the land because the land's own exit wake may be the first sending pass.
- `tests/green-merge.test.ts` — how broadcast-positive tests are built; what adding `webhook_env` to the fixture config means (`issues/config.yaml` `broadcast: discord: webhook_env: [X]`).
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `src/next.ts` (broadcastPass direct branch only — U3's wave-2 edits are already landed when you start; work around them), `src/status.ts` (scanRepo/leafJson inclusion of closed broadcast-pending leaves — U4's wave-2 edits already landed; work around them), `tests/green-merge.test.ts`, `tests/batch-dispatch.test.ts`, `tests/session-routing.test.ts` (webhook_env fixture additions ONLY, per D8), possibly `src/turn.ts` verification only (plan says merge queue needs no change — verify, don't edit unless evidence demands it; evidence demanding it is a mismatch).

Must land first: wave 2 complete (U2 phase routing + gate, U3 observeBusy/reconcile probes, U4 status surface). Creation commit: filled by A below.

Binding facts copied from the plan:

- broadcastPass direct branch: for a direct leaf NO allocate/dispatchSlot. Probe `terminal(state.seat.B.session, state.seat.B.address)`. Probe failure or status working/attention/unset → send nothing, broadcast_pending stays true. Status idle/done → `send` the exact same prompt text lifecycle dispatchSlot uses for broadcast (`broadcast-issue <slug> slot=B owner=<kind>:<name> closed=<destination> sha=<pushed> sources=<sources or 'none'> leaf=<path>`), record `prompted.B` with the send's returned turn; send failure records `delivery_error.B` (tolerate HcError kind=unavailable shape) and retries follow the existing settle rules — a turn advancing past the prompt clears the error; a re-failed send re-records it; no resend while the turn stands still. Lifecycle path byte-identical.
- ADDRESSES COLLIDE ACROSS SESSIONS: send/probe always through `seat.B.session`, never the repo session.
- scanRepo/leafJson: closed leaves whose `broadcastPending(state)` is true must appear in the JSON `leaves` array (uniform, all leaf kinds — lifecycle benefits too). Keep the scan filter minimal: open leaves plus closed broadcast-pending leaves. Text tables unaffected.
- D8 test sweep: broadcast-positive tests whose fixtures configure no target get `webhook_env` added to their fixture `issues/config.yaml` (broadcast: discord: webhook_env list); the tests' assertions otherwise unchanged. Do NOT add config to negative tests (green-merge.test.ts:185 broadcast-undefined assertion — it is the gate's control).
- `state.direct === true` is the only true form.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/direct-land.test.ts` or any planned criterion test: contract. Exception: none.
- Do not touch the lifecycle broadcast dispatch path beyond the minimal branch structure: lifecycle behavior is pinned by existing tests. Exception: none.
- Do not send when B is working 'to queue it': the plan explicitly forbids queuing tricks — a working B means nothing sent. No exception.
- Never run any `git stash` subcommand: every worktree shares one stash. Replacement: commit WIP and squash per the reset rule.
- Do not kill processes by pattern.

## 6. Ordered steps

1. Read the plan sections and direct-land.test.ts fully (it is long and precise — the HOLD-gate and shim-arming choreography matters).
2. Verify wave-2 prerequisites present in your worktree (routing direct param, commandMerged gate, observeBusy branch, broadcastInProgress probe, leafStart). If missing, STOP and return a mismatch — do not reimplement them.
3. `src/next.ts` broadcastPass direct branch.
4. `src/status.ts` closed-leaf inclusion.
5. D8 test sweep with webhook_env additions.
6. Run section-7 commands; iterate — these tests are the leaf's heaviest, expect tens of seconds each.
7. Squash; single commit `feat: direct leaf broadcast turn` (or similar) with Test-Change trailers.

Advisory size: 5 files, under 60 turns.

## 7. Commands

- `bun test tests/direct-land.test.ts --timeout=120000`
- `bun test tests/green-merge.test.ts --timeout=120000`
- `bun test tests/batch-dispatch.test.ts tests/session-routing.test.ts --timeout=120000`
- `bun test tests/status-json.test.ts tests/status.test.ts --timeout=120000`
- `bun run typecheck`

Install first if node_modules absent: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify`. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold and the single squashed commit exists. Each commit changing an existing test file carries `Test-Change: <exact path> design consumers note: broadcast-positive fixtures gain webhook_env for the configured-target gate` in the final trailer block, one per file. Report the four lines plus commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): be39d36a — VERIFY with `git log --oneline -1` at start and use what is there.
