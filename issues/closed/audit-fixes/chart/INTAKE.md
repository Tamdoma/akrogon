# Intake: audit-fixes

## Scope
One leaf in the akrogon repo implementing eight selected audit findings. The audit file `muse-audit.md` is a referenced input, not a source.

## Provenance
- Operator: issues/AKROGON-AUDIT-FIXES.md, 2026-09-14

## Source: operator issues/AKROGON-AUDIT-FIXES.md
# Akrogon audit fixes: less code, same behavior

## What I want

A consultant audit of `src/` (`muse-audit.md` at the repo root) listed 20 findings. I checked each one against the code. Fifteen are true on paper, eight are worth doing. I want those eight done and nothing else. Every one of them either deletes code or turns a confusing failure into a clear one. None of them changes what the tool does for valid input.

The rule for this issue: no fix may add a cache, a snapshot, a map threaded through calls, or a new parameter that exists only for speed. If a speed fix cannot be done by removing code, it does not get done. Speed is fine to gain, but not at the cost of a clean mental model.

## Why

Akrogon runs a few times a minute over three repos and about twenty leaves. It does not need to be fast. It needs to be small enough that I can hold the whole dispatch path in my head, and its errors need to point at the real cause the first time. Every helper nobody calls and every lock that guards nothing is a thing I have to reason about for no return.

Two of the audit's three "do first" picks were wrong. F4 claims cleanup leaks branches. It does not, worktrees are cut from `origin/main` and the branch delete succeeds against that. F2 claims a repair path is a bug. The tests say the exit code is intended. I am writing this down so nobody re-litigates them inside the leaf.

## The fixes

F16. Delete `withLeafLocks` in `src/state.ts` and its two call sites in `src/next.ts` and `src/phase.ts`. Every writer of leaf state already holds the global lock, and `pull` holds the repo lock and writes only seeds. The leaf locks guard nothing and they are the nesting depth that deadlocked before.

F17. Delete `dependenciesReady` in `src/state.ts`. No caller in `src/` or `tests/`.

F18. In `within` in `src/config.ts`, drop the `!isAbsolute(diff)` clause and the `isAbsolute` import. `relative()` on Linux never returns an absolute path.

F7. Validate `sources` entries in the state schema in `src/state.ts` with the same GitHub source pattern `src/pull.ts` already uses. Today a malformed entry passes load, then `closeSources` throws on every sweep and the merged leaf never closes. A bad file must fail at read time like every other field.

F9. In `commonDirectory` in `src/config.ts`, drop the `git rev-parse --is-inside-work-tree` probe. Run only `--git-common-dir`. If it fails with "not a git repository" return null, otherwise throw. Same return values, half the git spawns.

F13. In `nextCommand` in `src/next.ts`, keep the first `paneOwners` result and reuse it in the hook branch instead of calling it a second time.

F6. At the top of `requireClean` in `src/phase.ts`, throw `Missing worktree: <path>` when the folder does not exist. Today a missing worktree surfaces as `ENOENT posix_spawn 'git'`, which blames the wrong thing.

F8. Add `.min(1)` to `tab`, `worktree`, `pane.A`, `pane.B`, `prompted.A`, `prompted.B` in the state schema. Tool-written states already satisfy it. Only hand-edited files change, from a late obscure failure to an early clear one.

## Off route

F1, F2, F4, F5, F19, F20: not real bugs or taste.
F10, F11, F12, F14, F15: speed fixes that need a cache or a snapshot. Not at this scale.
The four smaller notes in the audit: leave as is.

## Scope

`src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts` and their tests. One leaf. Debate no. Delete `muse-audit.md` from the repo root once the leaf merges, it was the input and it is not documentation.

## Operator inputs

None.

## Done-criteria

1. `withLeafLocks` and `dependenciesReady` no longer exist anywhere in `src/`.
2. `commonDirectory` spawns git once per call.
3. A state file with a malformed `sources` entry or an empty `worktree` fails at load with an error naming the field.
4. `akrogon phase` on a leaf whose worktree folder is gone reports the missing path, not a spawn error.
5. Full test suite, typecheck and prettier pass. Test count does not go down except for tests that covered deleted code.

## Agent findings
Both slots verified all eight claims against the code. Full maps in `slots/`. F13's "same data" claim does not hold: the first `paneOwners` call runs before the global lock and is skipped when a hook event exists; the second runs under the lock. Everything else holds as written. See CHART.md for carried findings.
