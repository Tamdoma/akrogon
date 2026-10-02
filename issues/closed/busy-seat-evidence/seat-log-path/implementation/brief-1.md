# Brief-1: observe.ts gains per-seat session log path

## 1. Goal

`skills/watch-issues/scripts/observe.ts` resolves each working seat's session log path from the `herdr agent list` entry it already parses, and appends ` logA=<path|->` / ` logB=<path|->` to the observe line. Plan decisions D2, D3, D4, D5.

## 2. Acceptance criteria

1. `herdrListSchema` agent entries gain optional `agent: string`, `cwd: string`, and `agent_session: {kind: 'id'|'path', value: string}`; the schema stays non-strict (live entries carry extra keys) and is exported. Existing tests still pass unchanged semantics for status-only entries.
2. For a seat whose `agent_status` is `working`, the line carries ` log<seat>=<path|->` immediately after that seat's `[ busy=HhMMm]` suffix and before the next seat's field / ` notified=`. Any other status or absent pane adds no `log` field.
3. Resolution rules, in `resolveLog(paneId, entry, home)`:
   - no `agent_session` → `-`
   - `kind === 'path'` → `session.value` regardless of `agent`
   - `kind === 'id'` and `entry.agent === 'claude'` → `join(home, '.claude', 'projects', entry.cwd.replaceAll(/[^A-Za-z0-9]/g, '-'), session.value + '.jsonl')`
   - `kind === 'id'` and `entry.agent === 'codex'` → files matching `rollout-*-<value>.jsonl` exactly three directory levels under `join(home, '.codex', 'sessions')` (walk with `readdirSync` Dirents; a missing directory contributes no matches; mirror the bounded-walk style of `src/session-file.ts:11-34`); exactly one match → that path; zero → `-`; more than one → throw `Error` whose message names `paneId` and every matched path
   - any other `agent` value or `kind` → `-`
   - every resolved candidate goes through `existsSync`; absent file → `-`
   - `home === ''` with `kind === 'id'` → `-`
4. Resolution happens in `main` before any line prints: collect the set of pane ids referenced by leaf `state.yaml` `pane` fields whose entry status is `working`, resolve each, then print. A multi-match throw exits non-zero with empty stdout.
5. `agentStatuses` returns `Map<pane_id, AgentEntry>` (full parsed row); `formatLeaf` takes that map plus a `Map<pane_id, string>` of resolved log paths and `now`, staying lookup-only.
6. `HOME` is read once in `main` as `process.env.HOME ?? ''` and passed into `resolveLog`.

## 3. Read-first list

- `skills/watch-issues/scripts/observe.ts` — the file being changed (`herdrListSchema`, `agentStatuses`, `formatLeaf`, `main`)
- `skills/watch-issues/scripts/observe.test.ts` — the `OBSERVE_HERDR`/`OBSERVE_AKROGON`/`HOME` seams your change must not break
- `src/session-file.ts` lines 11–34 — bounded `readdirSync` walk to mirror (do not import it)
- `src/shell.ts` lines 74–85 — existing `agent_session`/`agent`/`cwd` pane schema shape
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

Owns: `skills/watch-issues/scripts/observe.ts` only. Lands first: nothing. Shared test resource: none (a later unit writes `observe.test.ts`; keep every existing exported/tested surface intact so that file still runs against your version).

Interfaces to keep working:

- `main()` reads `process.env.OBSERVE_AKROGON ?? 'akrogon'`, `OBSERVE_HERDR`, root arg; unchanged.
- `formatLeaf(leaf, entries, logs, now): string` — you may choose exact parameter names; the line contract is pinned by AC2.
- New exported surface: `export const herdrListSchema` (the whole-list schema). Deriving an `AgentEntry` type via `z.infer` is fine.

Reference live entry shape (herdr 0.9.3 `agent list`, do not copy verbatim): `{"agent":"pi","agent_session":{"agent":"pi","kind":"path","source":"herdr:pi","value":"/...jsonl"},"agent_status":"working","cwd":"/...","pane_id":"w8:pFR", ...extra keys}`; idle/absent-session entries may omit `agent_session` entirely.

## 5. Do-not

- Do not import from `src/` — the subpackage tsconfig includes only `scripts/*.ts`; a cross-root import breaks `bun run typecheck`.
- Do not touch `observe.test.ts`, `SKILL.md`, or any other file; other units own them.
- Do not add `log` fields for non-working seats or seats with `-` pane; the consumer joins on field presence.
- Do not resolve unreferenced panes — an unrelated pane's ambiguous codex session must not break this repo's fire.
- Do not read `os.homedir()`; `HOME` comes from the passed argument only.
- Do not change existing line fields, ordering, or the failed-leaf suffix.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `observe.ts` fully; read `observe.test.ts` seams (AC1, AC5).
2. Extend `herdrListSchema` and export it (AC1).
3. Write `resolveLog` per D4 rules (AC3). Run a quick `bun -e` import smoke to check it compiles.
4. Rework `agentStatuses` → `Map<pane_id, AgentEntry>`; add the pre-print resolution pass in `main` (AC3, AC4, AC6).
5. Update `formatLeaf` signature and line assembly (AC2, AC5).
6. Run the changed-tests command below; every existing test must still pass. Expected diffs in existing expectations: none — a stub entry without the new optional fields resolves to `logA=-` only when status is `working`, so `mixed A working and B idle` and the busy tests now show ` logA=-`; that expectation change is the NEXT unit's job. Report exactly which existing tests go red because of the new field and their old/new line strings — do not fix them.

Advisory size: 1 file, under 30 turns.

## 7. Commands

```
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u1 && bun install
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u1 && bun install --cwd skills/watch-issues 2>/dev/null || (cd skills/watch-issues && bun install)
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u1 && AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed=5bb552d0e2726cab6469699541317fe53053bd6c --timeout=30000
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u1/skills/watch-issues && bun run typecheck && bun test scripts
```

## 8. Done-when

`observe.ts` implements AC1–AC6, the typecheck passes, and the changed-tests run's result plus which existing tests red on the new field is reported. Commit your chunk (`observe.ts` only) and return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
