# Brief 4: repair remaining test failures

## 1. Goal

Fix the 8 failing tests left after brief-1/2. Each failure is a test still asserting deleted machinery or a buggy rewrite — `src/` is correct and must not change.

## 2. Acceptance criteria

`AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` passes with 0 failures.

## 3. Read-first list

`plan.md` D1–D10, `implementation/report-2.md` (failure list), `tests/next.test.ts`, `tests/pull.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/fake-gh.ts`, `ponytail.md`.

## 4. Change list

1. `tests/pull.test.ts` 'concurrent pulls serialize listing and reconciliation' — **delete**. Serialization was the deleted repo lock's only function; the design accepts interleaved pulls, so no deterministic assertion survives.
2. `tests/next.test.ts` 'a stale prompt never re-prompts a busy or done seat, and three stale misses fail the leaf' — rewrite for no peer fallback: `working` + stale → no prompt, attempts stay 1; `idle` + `done:['B']` → no prompt; `done:[]` + `idle` → prompt 2, attempts 2; stale + `idle` → prompt 3, attempts 3; stale + `idle` → `failed`. All prompts hit pane B.
3. `tests/next.test.ts` 'logical B fallback warns for physical A and unknown agents retain busy observations' — retitle (e.g. 'unknown panes wait, warn after an hour and keep busy observations'). The final `saveDatabase` must set `agent: 'fake'` on every pane, not just `agent_status: 'unknown'` — a null agent clears `busy_since`, which is why `busy_since.A` was undefined.
4. `tests/next.test.ts` 'unreadable state reserves its capacity and reports its path' — the retry needs `configure(f, { max_active: 4 })`: total is 2 leaves + 1 unreadable = 3, so cap 3 still blocks.
5. `tests/next.test.ts` 'next recovers only merge-phase work by ancestry against a non-default remote target' — rewrite without auto-recovery: keep the upstream/trunk setup, pushed branch, gh probe (`lock: resolve(f.home, '.lock')`) and `sources`; `next` on the `merge` leaf with A idle now prompts A (`merge-issue landed slot=A phase=merge`, phase stays `merge`); then `cli phase landed merged --slot A` from the worktree prints `issue complete landing`, fires both probes, and `next --all` removes tab, worktree and branch.
6. `tests/next.test.ts` 'uncommitted work in a merge worktree is never recovered as merged' — rewrite: dirty merge worktree + A idle → `next` prompts A and phase stays `merge`, dirty file intact. Retitle (e.g. 'uncommitted work in a merge worktree is left to the merge seat'). No error expected.
7. `tests/next.test.ts` 'a live merge retains its completion call after pushing, including a peer retry' — rewrite without seat fallback: merge leaf, branch pushed, A pane `working` with `busy_since` 61 minutes old → `next --all` sends no prompt, sets `busy_notified.A` ('seat A'), phase stays `merge`; then `cli phase active-merge merged --slot A` from the worktree completes. Drop the B-seat iteration.
8. `tests/next.test.ts` 'blocked merge seat B prevents fetch and clean checks in a dirty worktree' — rewrite: merge leaf with dirty worktree, B pane `blocked` (agent 'fake'), A `idle` → `next` prompts A (`merge-issue … slot=A phase=merge`), `busy_since.B` set, phase stays `merge`, dirty file intact. Retitle (e.g. 'a blocked non-merge seat does not stall a merge leaf'). Drop the git-call-log assertions — dispatch no longer fetches.

## 5. Do-not

Do not edit `src/`, `docs/`, helpers or fakes. Do not weaken the new contract: prompts go to the recorded slot's pane only; `unknown`/`blocked`/`working` never receive prompts. If a spec contradicts the fixtures, return a mismatch with evidence.

## 6. Ordered steps

1. pull.test.ts deletion.
2. next.test.ts items 2–8.
3. Run the §2 command; paste output.

Advisory size: 2 files, under 30 turns.

## 7. Commands

`AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"`.

## 8. Done-when

Changed tests green.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
