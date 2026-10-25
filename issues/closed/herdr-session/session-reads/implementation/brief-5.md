# Brief U5: sibling test suites gain hook socket env and workspace_id

## 1. Goal

Companion to U4: four existing test files fire `HERDR_PLUGIN_EVENT_JSON` hook events. The new origin gate (src/next.ts) requires `HERDR_SOCKET_PATH` identifying the emitting session and `workspace_id` inside the event payload; update these suites so their asserted behavior survives the gate. Plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/plan.md`.

## 2. Acceptance criteria

1. `tests/pause-next.test.ts`: `paneEvent` and `tabEvent` helpers carry `workspace_id` in `data` (default `'w1'` matching the fixture's repo workspace; parametrize only if a test seeds a different one); every `next()` call meant to act on the event also passes `HERDR_SOCKET_PATH` = `<f.db>-default.sock`. Events with `agent_status: 'working'` early-return but still need `workspace_id` to parse (the schema requires it).
2. `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts`: same treatment at each `HERDR_PLUGIN_EVENT_JSON` site — matching `workspace_id` (note `release-any-phase.test.ts` reseeds workspaces to `w2` in places; use the id the leaf resolves to) plus `HERDR_SOCKET_PATH` for the default session.
3. `HERDR_PANE_ID` entries stay (harmless) or are removed where they no longer matter — but do not rely on them for action; pane ids must come from the event payload.
4. Each file's commit carries a `Test-Change: <path> session-reads hook gate: invocations carry HERDR_SOCKET_PATH and workspace_id` trailer.

## 3. Read-first list

- The four test files; grep each for `HERDR_PLUGIN_EVENT_JSON` (sites: `pause-next` ~5, `keep-rule` ~1, `leaf-stop` ~1, `release-any-phase` ~2).
- `tests/fake-herdr.ts` — `sessionList()` derives `socket_path` as `<db>-<name>.sock`.
- `tests/session-routing.test.ts` — `socket(f, name)` helper shape.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files: `tests/pause-next.test.ts`, `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts`. No product code.

Interface context (landed in wave 2 sibling U4): `hookEventSchema` requires `workspace_id` on every event `data`; hooks act only when `HERDR_SOCKET_PATH` matches the resolved session's `socket_path` and `workspace_id` equals the resolved workspace. Where a test's hook must NOT act (paused-repo cases), the socket/workspace may still be provided — the pause gate happens after.

For each suite prefer a local helper (`socket(f)` or inline `${f.db}-default.sock`) over repeating literals.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/next.test.ts` (U4), `tests/session-reads.test.ts` (A's), or `tests/fake-herdr.ts`.
- Do not change assertions' meaning — only the env/payload the invocation carries. A test whose expectation contradicts the gate is a mismatch to return, not a rewrite.
- Do not delete test cases.
- Plan conflict → mismatch. Exception: revised brief from A.

Restated: four test files, env+payload updates only, Test-Change trailers required, mismatch on contradiction.

## 6. Ordered steps

1. Grep each file for `HERDR_PLUGIN_EVENT_JSON`; read each site's fixture seeding to learn the expected `workspace_id` (`w1` default; check `workspaces:` seeds nearby).
2. Add `workspace_id` to payload constructors (`paneEvent`/`tabEvent` helpers and inline JSON literals).
3. Add `HERDR_SOCKET_PATH` to the invocation env at each site (only where the event should be honored — but supplying it for `working` early-returns is harmless and consistent).
4. Run each file, then commit with `Test-Change:` trailers per file (one trailer line per changed file; a single commit is fine).

Size: 4 files, under 20 turns; `pause-next.test.ts` is the slow suite.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/session-reads-u5 && bun install --frozen-lockfile`
- `akrogon run-check --name u5-suites -- bun test tests/pause-next.test.ts tests/keep-rule.test.ts tests/leaf-stop.test.ts tests/release-any-phase.test.ts` (report runtime; if a failure looks like missing U4 gate code in the worktree, note it — your edits are compatible either way since old code ignores the new env fields).

## 8. Done-when, evidence and report

All four files green via the cited `check u5-suites` line (or remaining reds quoted verbatim with cause), commits carry the `Test-Change:` trailers. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
