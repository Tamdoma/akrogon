# Brief U4: hook origin gate, event ids, and cross-session reads in src/next.ts

## 1. Goal

Plan D2, D4, D5, D6, D7: hooks act only for the repo whose resolved session matches the emitting socket and whose workspace matches `event.data.workspace_id`; pane ids come from the event; capacity counting reads the tagged cross-session union; reconcile gets both pane views. Plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/plan.md`.

## 2. Acceptance criteria

1. `hookEventSchema` keeps `workspace_id`: every event variant's `data` gains `workspace_id: z.string()` (required).
2. Origin gate in `nextCommand`: when `event !== undefined`, after `readPaused()`/`readGlobal()` and before leaf selection, the emitting session is the `listSessions()` entry whose `socket_path === process.env.HERDR_SOCKET_PATH` and which is `running`.
   - `listSessions()` → `null` (list failed): one `console.error` JSON line naming the failure, `process.exitCode = 1`, return.
   - No matching entry: one `console.error` JSON line naming `unknown origin` and the socket value's presence (log the env value only as present/missing or the path string itself is fine — it is a path, not a secret), return with exit 0.
3. `hookScope(repo, event, emitting, invocation)` (new internal helper): `repoSession(repo)` refused → reported once through `report()` (adds to `invocation.skipped`, exit 1), returns null. `emitting.name !== resolution.session.name` or `event.data.workspace_id !== resolution.workspace.workspace_id` → `console.error` JSON line `{repo, event, reason: 'session mismatch' | 'workspace mismatch', ...naming the mismatched values}`, returns null, exit stays 0. Otherwise returns the resolution.
4. The `tab_closed` branch finds owners only across repos passing `hookScope`, matching `leaf.state.tab === event.data.tab_id`; the `owners.length > 1` guard stays.
5. Pane events (`pane_exited`, `pane_closed`, `pane_agent_status_changed`): the existing pane-hook branch keeps its position; the hook pane is `event.data.pane_id`, never `process.env.HERDR_PANE_ID`. `paneOwners` gains the `event` parameter and scans only repos passing `hookScope`. `process.env.HERDR_PANE_ID` is read nowhere in `src/next.ts`.
6. `activeCount` uses `sessionPanes()` (exported from `src/shell.ts` by U1 — `Promise<{session: string; pane: Pane}[] | null>`): a `null` union returns `global.max_active` immediately. Per repo, `live` = entries tagged with the resolved session's name (`null` when resolution refuses); a leaf counts as active when unfinished and either an own-session pane matches `state.tab` or any union pane's cwd is inside `state.worktree`. The refused-resolution fallback (`unreadable + unfinished`) and `unknown → max_active` stay.
7. `reconcileRepos` passes `reconcile(repo, leaves, live, union, failures)`: `live` as today (`reconcileNeedsPanes ? panesForRepo : []`), `union` = `(needsPanes ? await hostPanesOnce() : [])`. The `tab_closed` branch's inline `reconcile` call gets the same treatment. `reconcileHost` signature untouched.
8. `tests/next.test.ts` updated so its assertions hold under the gate: every `HERDR_PLUGIN_EVENT_JSON` invocation that must act gets `HERDR_SOCKET_PATH` = the session's socket (`${db}-default.sock` via the `socket()`-style helper — check how the fixture names it; fake-herdr derives `<db>-<name>.sock`) and `workspace_id` matching the workspace the leaf resolves to (usually `w1` for the default fixture; `w2` where the test reseeds workspaces to `w2`). `pane_agent_status_changed` `working` events early-return before the gate but still need `workspace_id` in the payload to parse. Keep each test's asserted behavior; where a test relies on env-pane attribution that no longer exists, prefer the event's `pane_id`.

## 3. Read-first list

- `src/next.ts` — `hookEventSchema` (~line 75), `resolveFor`/`resolveQuiet` (~120-145), `panesForRepo`/`allSessionPanes` (~200-230), `activeCount` (~365), `paneOwners` (~1440), `reconcileRepos` (~1490), `nextCommand` (~1534 to end: origin read, `tab_closed` branch ~1620, pane-hook branch ~1670).
- `src/shell.ts` — `listSessions`, `sessionPanes` (added by U1; if absent in your worktree, implement against the interface above and flag it).
- `src/reconcile.ts` — `reconcile`'s new `union` parameter (4th arg, `Pane[] | null`, added by U3).
- `tests/session-reads.test.ts` — the committed criterion tests; tests 4/5 pin the exact stderr/log and no-action expectations your implementation must satisfy.
- `tests/session-routing.test.ts` — `socket(f, name)` helper and `toSession` call inspection.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files: `src/next.ts`, `tests/next.test.ts`.

Interfaces you consume: `sessionPanes(exe?): Promise<{session: string; pane: Pane}[] | null>` (shell.ts); `reconcile(repo, leaves, live, union?, failures?)` (reconcile.ts). Do not change either signature.

`hookScope` needs `event.data.workspace_id` for all variants — that's what criterion 1 guarantees.

Delete `const hookPane = process.env.HERDR_PANE_ID || undefined` entirely; the pane-hook branch reads `event.data.pane_id` (the schema gives it on all non-`tab_closed` variants — narrow via the discriminated union or `!('pane_id' in event.data)`; simplest is checking `event.event !== 'tab_closed'` before the branch, which the existing `else if` chain already does structurally).

## 5. Do-not, reasons and exceptions

- Do not weaken the gate: a mismatch takes no action; only a refused repo reports into `skipped`. Session/workspace mismatches log via `console.error`, never `report()` — they are expected filtering, not errors.
- Do not change `selectLeaves`, dispatch, `observeBusy`, `dispatchSlot`, `mergeTurn` — out of scope.
- Do not edit `tests/session-reads.test.ts` (A's criterion tests; if one is wrong it's a mismatch), `tests/fake-herdr.ts`, or other suites' files — U5 owns `pause-next`, `keep-rule`, `leaf-stop`, `release-any-phase`.
- Do not delete existing test cases in `tests/next.test.ts`; update their envs/payloads. A test whose asserted behavior genuinely contradicts the gate (e.g. asserts action on env pane alone) is a mismatch — return it, don't rewrite the assertion.
- Plan conflict → mismatch with evidence. Exception: revised brief from A.

Restated: `src/next.ts` + `tests/next.test.ts` only; gate per D6; no env pane reads; mismatch on conflict.

## 6. Ordered steps

1. Read the listed `src/next.ts` regions and the U1/U3 interfaces (verify `sessionPanes` exists in `src/shell.ts`; the worktree carries wave-1 commits).
2. `hookEventSchema`: add `workspace_id: z.string()` to all four `data` objects.
3. Origin resolution block in `nextCommand` per criterion 2.
4. `hookScope` helper + wire it into `paneOwners` and the `tab_closed` branch.
5. Replace `hookPane` with the event's `pane_id`; delete the env read.
6. `activeCount` rewrite per criterion 6.
7. `reconcileRepos` + `tab_closed` reconcile calls gain the union arg.
8. Update `tests/next.test.ts` hook invocations per criterion 8; grep the file for `HERDR_PLUGIN_EVENT_JSON` (~19 sites) and fix each.
9. Run the targeted checks, commit each logical step or one commit — your choice, but `tests/next.test.ts` edits require a `Test-Change: tests/next.test.ts session-reads hook gate: event invocations carry HERDR_SOCKET_PATH and workspace_id` trailer on a commit touching it.

Size: 2 files, under 25 turns. The test-file sweep is most of the work.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/session-reads-u4 && bun install --frozen-lockfile`
- `akrogon run-check --name u4-next -- bun test tests/next.test.ts tests/session-routing.test.ts` (report runtime; the file is large — expect ~2-4 min).
- A's `tests/session-reads.test.ts` and the checks commands are not yours; do not run them.

## 8. Done-when, evidence and report

Criteria 1-8 hold; `tests/next.test.ts` + `tests/session-routing.test.ts` green via the cited `check u4-next` line; commits on worktree HEAD including the `Test-Change:` trailer for `tests/next.test.ts`. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
