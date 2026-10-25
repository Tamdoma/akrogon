# Brief U1: session-tagged pane union in src/shell.ts

## 1. Goal

Add the session-tagged cross-session pane read the rest of this leaf consumes (plan D1). Plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/plan.md`.

## 2. Acceptance criteria

1. `sessionPanes(exe?: string): Promise<{session: string; pane: Pane}[] | null>` is exported from `src/shell.ts`. It lists panes for every session the cached `session list` marks `running`, each pane tagged with that session's name.
2. A running session whose `pane list` dies `server_not_running` is skipped (stopped), like `resolveSession` and `secondSeat` already do.
3. Any other per-session read error or the `DISCOVERY_DEADLINE_MS` deadline, or a failed session list (`listSessions` → null), makes the result `null`.
4. Pane lists are re-fetched on every call (no caching beyond the existing process-level session-list cache).
5. `allSessionPanes(exe?: string): Promise<Pane[] | null>` keeps its signature and `null` semantics, reimplemented as a projection of `sessionPanes` (`entries.map(e => e.pane)` or equivalent).

## 3. Read-first list

- `src/shell.ts` — the whole file is under 400 lines; the pattern to copy is `secondSeat` in `src/next.ts` (liveness probe order and the `server_not_running` skip) and `resolveSession` in this file.
- `tests/fake-herdr.ts` — session store seams (`deadRead`, `paneListStdout`, `delayMs`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files: `src/shell.ts` only.

Current `allSessionPanes` (in `src/next.ts`, lines ~212-228) is the code this replaces — it lives in next.ts today:

```ts
async function allSessionPanes(): Promise<Pane[] | null> {
  const sessions: Session[] | null = await listSessions();
  if (sessions === null) return null;
  const found: Pane[] = [];
  for (const session of sessions) {
    if (!session.running) continue;
    try {
      found.push(...(await panes(session.name)));
    } catch {
      return null;
    }
  }
  return found;
}
```

Wait — verify the actual location during implementation: if `allSessionPanes` is in `src/next.ts` (it is), leave it there but reimplement it over a new `sessionPanes` exported from `src/shell.ts`, and keep the `server_not_running` skip inside `sessionPanes`. Check `src/next.ts` lines ~212-228 for the current definition and its callers (`hostPanesOnce` in `nextCommand`, `unpausePass`).

Owned paths: `src/shell.ts` (new export), `src/next.ts` (reimplement `allSessionPanes` over `sessionPanes` only — no other edits; U4 owns next.ts later but this one-function change is yours to avoid a wave split). Note for the report: the dead-session skip is new behavior vs the current catch-all; it matches the resolution rule.

## 5. Do-not, reasons and exceptions

- Do not touch `hookEventSchema`, `activeCount`, `reconcile` signature or any other `src/next.ts` code — U4 owns them. Exception: the `allSessionPanes` reimplementation above only.
- Do not write or edit tests — the leaf's planned tests are already committed (`tests/session-reads.test.ts`) and run red until later units land.
- Do not change `DISCOVERY_DEADLINE_MS` or the session-list cache — the discovery contract is locked design.
- A plan conflict: return a mismatch, do not widen scope. Exception is a revised brief from A.

Restated: only `src/shell.ts` plus the `allSessionPanes` function body in `src/next.ts`; no tests, no schema changes; mismatch on conflict.

## 6. Ordered steps

1. Read `src/shell.ts` and the `allSessionPanes` function + its callers in `src/next.ts`.
2. In `src/shell.ts`, add `sessionPanes` after `listSessions`: loop `listSessions()` output, skip `!running`, `panes(session.name, exe)` inside try, skip `CommandError` whose `herdrError(result).code === 'server_not_running'`, return `null` on other throws; return tagged entries.
3. In `src/next.ts`, reimplement `allSessionPanes` to call `sessionPanes()` and project `.pane`, returning `null` through.
4. Update the comment above `allSessionPanes` to name the tagged source and the dead-session skip.

Size: ~2 files, under 12 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/session-reads-u1 && bun install --frozen-lockfile`
- Targeted: `akrogon run-check --name u1-routing -- bun test tests/session-routing.test.ts` (run from the worktree; the `tests/session-reads.test.ts` file is A's — do not run it, several of its tests are still red until wave 2).

## 8. Done-when, evidence and report

Both functions exist per criteria 1-5, `session-routing.test.ts` is green (cite the `check u1-routing: <exit> <path>` line), one commit on the worktree HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
