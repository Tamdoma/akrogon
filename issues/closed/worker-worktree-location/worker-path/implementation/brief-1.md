# Sub-brief 1: shared worktree-store resolver, config output, wiring, tests

## 1. Goal

Plan D1, D2, D3, D4. Outcome: one exported resolver shared by `akrogon config` and leaf worktree creation, and real-CLI tests proving the printed value matches the creation path in every configured shape.

## 2. Numbered acceptance criteria

1. `src/config.ts` exports `worktreeStore(repo: Repo): string` returning `resolve(repo.root, repo.config.worktree_root)`. `effectiveConfig` prints `worktree_store` whenever a registered repo resolves and omits it when `repo: none`. Printed `worktree_root` stays exactly as configured.
2. `src/next.ts` holds no inline `resolve(repo.root, repo.config.worktree_root`. `ensureWorktree` (~:231) and `allocate` (~:290) build the leaf path as `resolve(worktreeStore(repo), leaf.state.slug)`, with behavior and error text unchanged.
3. `tests/config.test.ts` adds real-CLI coverage on real temp repos: default `issues/worktrees`, a custom relative root, an absolute root, a caller at the registered root, a caller in a linked worktree, and an unregistered cwd with no `worktree_store` key. Asserts: the value is absolute, equals `resolve(root, worktree_root)`, is identical from root and linked worktree, and `worktree_root` output still equals the configured string.

Criterion 3 is nontrivial: show red (new tests fail before the src change, naming `worktree_store`) then green, and paste both runs.

## 3. Read-first list

- `skills/implement-issue/ponytail.md` (read first and follow it)
- `src/config.ts` (full file; `effectiveConfig` is at the end)
- `src/next.ts` lines 225-262 and 285-295 (the two path sites)
- `tests/config.test.ts` (pattern to copy: the test `config prints merged slots from root, linked worktree, and global outside`)
- `tests/helpers.ts` (`fixture()` and `cli()` helpers)

Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Files owned, and no others: `src/config.ts`, `src/next.ts`, `tests/config.test.ts`.

Needed interfaces: `Repo { name, root, config }` in `src/config.ts`; new `worktreeStore(repo: Repo): string` returning an absolute path; config YAML gains `worktree_store: <absolute path>` next to `repo`, present only when a registered repo resolves.

Chunks that must land first: none. Paths this unit owns: the three files above. Shared test resource: none, each test builds its own temp fixture. Consumed output: none.

## 5. Do-not, reasons and exceptions

1. Do not touch `src/sync.ts` or `src/init.ts`. Reason: the design keeps their `expandPath` and `~` handling unchanged, and the split is a recorded limitation. Exception: none.
2. Do not add a script, verb, env var, or state field. Reason: the design forecloses them as new failure points for unobserved problems. Exception: none.
3. Do not mock the resolver in tests. Reason: the design requires the real CLI on real temp repos. Exception: none.
4. Do not change the worktree-mismatch error text or any git logic in `src/next.ts`. Reason: behavior must stay identical; only the path expression moves into the shared resolver. Exception: none.
5. Do not edit `skills/implement-issue/worker-protocol.md`. Reason: another worker owns it and parallel edits would conflict at cherry-pick. Exception: none.
6. Do not commit `bun.lock`, `node_modules`, or anything outside the three owned files. Reason: keeps this chunk cherry-pickable onto the lane. Exception: report it in your return if `bun install` rewrites `bun.lock`.
7. Return a mismatch with evidence to B instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.

Reasons restated: exclusions 1-4 protect the locked design, 5-6 keep waves independent and picks clean. The only exception to any exclusion is a revised brief from B.

## 6. Ordered steps

1. Read the read-first files (all criteria).
2. Run `bun install`, then section 7's command to record the current state (criterion 3 baseline).
3. Write the new tests first. Run `bun test tests/config.test.ts` and paste the red failure naming `worktree_store` (criterion 3 red).
4. Add `worktreeStore` and wire `effectiveConfig` in `src/config.ts`: `...(repo !== null ? { worktree_store: worktreeStore(repo) } : {})` next to `repo`, unlike `AKROGON_BASE` with no `top` condition (criterion 1).
5. Rewire the two `src/next.ts` sites to `resolve(worktreeStore(repo), leaf.state.slug)` and import `worktreeStore` from `./config` (criterion 2).
6. Run `bun test tests/config.test.ts` green, run section 7's command, run the two grep checks from section 8 (criteria 1-3 green).
7. Commit only the three owned files with message `worker-path: shared worktree store plus config tests`. Return the commit ID.

Advisory size: 3 files, under 12 turns (about 4 per file for read, edit, and test). Work clearly beyond this returns a mismatch with evidence, not silent scope growth.

## 7. Commands

From the worktree root, after `bun install`, run only this plus the targeted `bun test tests/config.test.ts` and the greps named in this brief. B runs the full suite separately.

```sh
AKROGON_BASE=f984c8ae83156b31aaa5502abab4b02a0c96f360 bun test --changed="f984c8ae83156b31aaa5502abab4b02a0c96f360"
```

## 8. Done-when, evidence and report

Done when criteria 1-3 hold with red then green pasted for criterion 3, `bun test tests/config.test.ts` is green, `grep -rn "resolve(repo.root, repo.config.worktree_root" src/next.ts` is empty, and `grep -n "worktree_store" src/config.ts tests/config.test.ts` shows the resolver, the output wiring, and the tests.

Scenarios use temp repos through `tests/helpers.ts` with real files and processes. End your return with these four lines, equivalent wording accepted by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
