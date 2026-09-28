# Brief U2: dispatch gate, fixture remote, dispatch tests

## 1. Goal

Implement plan decisions D4, D6 (dispatch half), D7: gate `next` dispatch on the base, point `worktree add` at the tracking ref, give `tests/helpers.ts fixture()` a real remote, adapt colliding `remote add` sites, and add dispatch tests for criteria C5-C7.

## 2. Numbered acceptance criteria

1. A new leaf with missing tracking commit refuses: `akrogon next <slug>` exits 1 with exactly one JSON skip line naming the case remediation, no `issues/worktrees/<slug>` directory, no `state.worktree`, zero herdr tab/pane creation. Verified by new dispatch tests for C1, C2, C3 each.
2. An existing leaf branch without a worktree still requires remote proof: tracking valid but remote branch gone refuses before `worktree add`. Verified by dispatch test.
3. An existing worktree with deleted tracking ref refuses with the classified case (C3 when remote present, C2 when remote branch gone). Verified by dispatch tests.
4. Existing worktree plus valid local ref makes no remote query: remote pointed at an unreachable URL still dispatches and prompts. Verified by dispatch test.
5. Worktree creation proves the remote: same unreachable URL with no worktree refuses. Verified by dispatch test.
6. Conflicting same-named local branch/tag never wins: new worktree's leaf branch starts at the tracking commit, and `AKROGON_BASE` passed to herdr equals the tracking commit. Verified by dispatch tests.
7. The whole existing suite passes with the real-remote fixture. Verified by the changed-test run covering the touched test files.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/next.ts` dispatchLeaf/allocate/ensureWorktree, `src/preflight.ts` (landed U1 exports below), `tests/helpers.ts`, `tests/next.test.ts` (`dispatchFixture`, `database`, `calls`, `skips` helpers), `tests/fake-herdr.ts`
- Pattern to copy: existing `next refuses ...` tests using `skips(result)` for the JSON stderr line and `calls(f)`/`database(f)` for herdr side-effect assertions.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Owns: `src/next.ts`, `tests/helpers.ts`, `tests/next.test.ts`, `tests/pull.test.ts`, `tests/sync.test.ts`. Nothing else. Prerequisite landed: U1 commit `4b81295` (`src/preflight.ts` with the exact exports below; the worktree already contains it).

```ts
// src/preflight.ts (landed, import from './preflight')
trackingRef(repo: Repo): string;
checkBase(repo: Repo, remoteRequired: boolean): Promise<string>;
```

`src/next.ts`: in `dispatchLeaf` after the `seats(global, repo);` line and before `allocate(...)`, insert the gate with an inline comment naming the shared predicate:
`const mustCreate: boolean = !existsSync(resolve(repo.root, repo.config.worktree_root, slug)); await checkBase(repo, mustCreate);`
(`existsSync`, `resolve`, and `slug` are already in scope.) Change the `worktree add` start revision from `target(repo)` to `trackingRef(repo)`. The throw reaches the existing catch → `report()` funnel; add no new error presentation.

`tests/helpers.ts` `fixture()`: create a real bare remote — `git init --bare remote.git` under `home`, `git remote add origin <that path>`, `git push origin HEAD:main` — and delete the fake `git update-ref refs/remotes/origin/main HEAD` line.

Adapt every `git remote add` site by reading it (blanket replace is wrong: `next.test.ts:746` adds a second remote named `upstream`, which still works; `pull.test.ts:217` targets a second fixture root):
- `tests/next.test.ts:746, 871, 928, 1623, 1677, 2232`, `tests/pull.test.ts:44, 92, 128, 172-173, 209, 217`, `tests/sync.test.ts:12, 51`. Prefer `set-url` where the test needs its own URL, delete where the fixture remote suffices.
- `pull.test.ts` missing-origin case: run `git remote remove origin` first.

New dispatch tests in `tests/next.test.ts` (copy the `dispatchFixture`/`fakeHerdr` shape): build C1 by removing the remote, C2 with an empty bare remote, C3 by pushing then `git update-ref -d` the tracking ref; unreachable URL via `set-url`. Assert `AKROGON_BASE` from `calls(f)` args (`--env`, `AKROGON_BASE=<sha>`) against `git rev-parse refs/remotes/origin/main`; assert branch start with `git rev-parse <slug>` in `repo.root`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/preflight.ts`, `src/config.ts`, `src/akrogon.ts`, `tests/preflight.test.ts`, `tests/command-reference.test.ts`, `README.md`, or `shapes.md`; U1 owns them and is landed. Exception: none.
- Do not add capacity, tab, or pane logic around the gate; the gate is three lines before `allocate()`. Exception: none.
- Do not classify cases anywhere except `checkBase`; dispatch only awaits it. Exception: none.
- Do not change a locked decision or the landed U1 interface; return a mismatch with evidence instead. Exception: a revised brief from B authorizing the change.
- Restated: stay inside the owned paths because U1 is landed; keep the gate minimal because the funnel already presents errors; never widen scope without a revised brief.

## 6. Ordered steps

1. `tests/helpers.ts` (criterion 7): real-remote fixture. Adapt the `remote add` sites file by file, running the changed-test command as each file lands.
2. `tests/next.test.ts` (criteria 1-6): write the new dispatch tests first for red evidence (today they fail inside `git worktree add` or pass vacuously — paste which).
3. `src/next.ts` (criteria 1-6): gate plus `trackingRef` start revision. Run changed tests for green.
4. `bun run typecheck` in the worktree; fix only own-path errors. Commit only this unit's chunk.

Advisory size: about 5 files, under 24 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff. Start with `bun install` in the worktree before any test run.

## 7. Commands

Run in the worker worktree only:

```sh
export AKROGON_BASE=1607ee7fbf4a2362340c2d6b8de4257d72684ec6
bun test --changed="$AKROGON_BASE"
```

If that command selects no tests, fall back once to the named files directly (`bun test tests/next.test.ts tests/pull.test.ts tests/sync.test.ts`) and note it. Do not run the full suite; B runs it.

## 8. Done-when, evidence and report

Done when criteria 1-7 hold with red then green pasted output. Return the commit ID, the changed-test output, and any required artifact path. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
