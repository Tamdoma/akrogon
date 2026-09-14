# Chart: audit fixes, less code, same behavior

## Destination
Seven audit findings (F16, F17, F18, F7, F9, F6, F8) land in one leaf against `src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts` and their tests. Every fix deletes code or turns a confusing failure into a clear one. Valid input behaves as before. Full suite, typecheck and prettier pass.

## Forks taken
- [F13: reuse the pre-lock pane owners or drop the fix](forks/f13-reuse-or-drop.md): dropped, F13 leaves the batch.
- [F7: where the GitHub source pattern lives](forks/source-pattern-home.md): exported from `src/state.ts`, imported by `src/pull.ts`.
- [F6: what "missing worktree" covers](forks/missing-worktree-contract.md): only paths reaching `requireClean`.
- [When muse-audit.md is deleted](forks/audit-file-deletion.md): in the leaf diff.

## Forks open
None.

## Fog
None.

## Findings carried into handoff
- Closure probes. `tests/fake-gh.ts:31` asserts the lock at `probe.lock` is held during every gh call. Eight probes point at issue/leaf `.lock` paths: `tests/phase.test.ts:267,542,547,635`, `tests/next.test.ts:673,906,1509`. Repoint them to `issues/.lock`. Drop the `'leaf'` scope at `tests/next.test.ts:1064`. Remove `basename`/`dirname` imports left dead in `src/state.ts`.
- Malformed retry test. `tests/phase.test.ts:329` includes `'malformed'` in sources and asserts it in stderr. Under F7 the leaf never loads. Move the malformed entry out, keep the retry scenario with valid sources, add a load-rejection case whose error names `sources`.
- F9 uses `run`, not `command` plus catch, so null stays limited to `not a git repository` and every other failure throws with full context. Keep `realpathSync(resolve(cwd, stdout))`.
- F8 is `.min(1).optional()`. Omission stays valid, sessionless prompts stay valid.
- Gates: `bun test`, `bun run typecheck`, `prettier --check src tests`. The `format` script writes files.
- `tests/fetch-deadline-harness.ts:88-91` reacquires leaf locks after failure; passes trivially once leaf locks are gone. Trim to global and repo.
- No credentials or human-only prerequisites.

## Off route
- F1, F2, F4, F5, F19, F20: operator ruled not bugs or taste. F4 is wrong because worktrees are cut from `origin/main`; F2 exit code is intended by tests.
- F10, F11, F12, F14, F15: need a cache or snapshot. Excluded by the note's rule.
- F13: reusing the pre-lock owner scan changes outcomes when ownership changes during the lock wait. Dropped by operator (Q1).
- The audit's four smaller notes: leave as is.
- Any shell-wide missing-cwd guard in `src/shell.ts`: the note asks for the narrow `requireClean` check only.

Handed off 2026-09-14 into `../../open/audit-fixes/`.
