# Sub-brief 1 (unit U1): src/scope.ts shell identity split

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u1`
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls`

## 1. Goal

Split the herdr `pane process-info` read from the /proc scope check so a pane's shell is asked for once per scope check or boxing (plan decisions D1, criterion 1). Only `src/scope.ts` changes; `src/next.ts` callers land in a later unit, so the new parameters stay optional and the old signatures must still work.

## 2. Numbered acceptance criteria

1. `Shell = { pid: number; start: string }` is exported; `paneShell(paneId: string, session: string): Promise<Shell>` is exported and is today's private `shell()` under a public name.
2. `inOwnScope(slice: string, paneId: string, session: string, prior?: Shell)` resolves `prior ?? (await paneShell(paneId, session))`, then reads only /proc: `startTime(pid)` and the pid's `cgroup` file. With `prior` supplied and `startTime(pid) !== prior.start` it throws `Error` naming the pane: `Pane <paneId> shell start changed: expected <prior.start>, reads <current>` — thrown before the cgroup comparison, a recycled pid is never accepted or adopted.
3. `adoptShell(slice: string, paneId: string, session: string, shell?: Shell)` uses `shell ?? (await paneShell(paneId, session))` for the scope name and `PIDs` property; its herdr read happens only when no identity was passed.
4. Behavior unchanged without the new parameters: same `ScopePlace` results, same `unreadable` mapping for read failures, same scope-name and busctl argv.
5. `bun run typecheck` is clean.

## 3. Read-first list

- `src/scope.ts` (the whole file; `shellPid`, `shell`, `adoptShell`, `inOwnScope`, `startTime`, `ScopePlace`)
- `src/next.ts` lines ~515–680 (`allocate`, `box`) for how callers will use the new parameters — read only, do not edit
- `tests/fake-proc.ts` (`seedShell`, `SHELL_START`) for the /proc stat layout field 22
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/scope.ts` only:
  - `type Shell` → `export type Shell = { pid: number; start: string }`
  - private `shell(paneId, session)` → `export async function paneShell(paneId: string, session: string): Promise<Shell>` (keep or inline; no internal callers remain in this file once signatures below take `prior`/`shell` optional)
  - `inOwnScope` gains optional `prior?: Shell`, resolves the identity once, and throws on a differing /proc start before computing `place`
  - `adoptShell` gains optional `shell?: Shell`, uses the passed identity
- Owned paths: `src/scope.ts` only. No shared test resource. No prerequisite units.
- Later unit U2 (src/next.ts) will pass `prior`/`shell` and may drop the optional fallbacks; leave them.

## 5. Do-not, reasons and exceptions

- Do not edit `src/next.ts`, tests, fakes, or any other file — other units own them; the exception is a revised brief from A.
- Do not read herdr anywhere in `inOwnScope` after the identity is resolved — the adoption poll must be /proc-only (criterion 1).
- Do not change `paneScope`, `leafSlice` (stays on `node:crypto`), `ScopePlace` variants, error texts, or the busctl argv — callers and tests depend on them.
- Do not write or edit tests — a red planned test is a mismatch returned to A.
- Do not add caches, retries, or fallback paths — reuse the passed identity or read once.
- On any conflict with this brief, return a mismatch with evidence instead of widening scope; the exception is a revised brief from A authorizing the change.

Restated: edit only `src/scope.ts`; keep old calls working; no new herdr reads, tests, caches or fallbacks; conflicts come back as a mismatch, resolved only by a revised brief.

## 6. Ordered steps

1. Read `src/scope.ts` fully; apply the signature split (criteria 1–3).
2. `bun run typecheck` in the worktree (criterion 5).
3. Commit with message `scope: read a pane shell identity once per scope check` and return the sha.

Advisory size: 1 file, under 8 turns.

## 7. Commands

- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u1 --name u1-typecheck -- bun run typecheck` (run from the worktree; cite the printed `check u1-typecheck: <exit> <path>` line)
- No test-file runs: this unit's planned tests stay red until U2 lands; that is expected, not a mismatch.

## 8. Done-when, evidence and report

All acceptance criteria hold and the typecheck check printed exit 0. Report with these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
