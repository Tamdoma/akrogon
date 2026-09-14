# Implementation brief: audit-fixes-batch

## 1. Goal

Land the seven audit fixes from `plan.md` (D1–D13): delete `withLeafLocks` and `dependenciesReady`, drop the `isAbsolute` clause in `within`, export `sourcePattern` and share it between the state schema and `closeSource`, make `commonDirectory` spawn git once, add the `Missing worktree:` guard in `requireClean`, add `.min(1)` to identifier fields, delete `muse-audit.md`, and update/add tests. Valid input behaves exactly as before.

## 2. Acceptance criteria

1. `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` returns nothing.
2. A test proves `commonDirectory` spawns git exactly once per call for a normal checkout, a nested cwd, a linked worktree and a non-repository; non-repository returns null; a git failure whose stderr is not `not a git repository` throws with cwd and the result.
3. A test proves a state file with a `sources` entry not matching `owner/repo#n`, or an empty `worktree`, fails at load with an error naming that field and leaves state, log and gh untouched.
4. A test proves `akrogon phase <slug> implement` on a leaf whose recorded worktree folder is gone fails with `Missing worktree: <path>` before any state or log write.
5. Every existing gh probe test still asserts the lock at `issues/.lock` is held during closure.
6. `bun test --changed="$AKROGON_BASE"` passes after the work lands.
7. `muse-audit.md` no longer exists at the repo root.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `plan.md` in the leaf folder (decisions D1–D13 are binding)
- `src/state.ts`, `src/config.ts`, `src/phase.ts`, `src/next.ts` (`dispatchLeaf` ~line 489), `src/pull.ts` (`closeSource` ~line 104)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeGh`), `tests/fake-gh.ts` (probe lock check, unchanged)
- `tests/phase.test.ts` (probe sites 267, 542, 547, 635; source retry test ~320–400), `tests/next.test.ts` (probe sites 673, 906, 1509; scope loop ~1065), `tests/fetch-deadline-harness.ts` (87–94), `tests/config.test.ts`
- Pattern to copy for the F9 test: `tests/fetch-deadline-harness.ts` writes a `git` shim in `f.home/bin` that logs then `exec`s real git; reuse that shim style inline in `tests/config.test.ts` with a `bun -e` child.

## 4. Change list and needed interfaces

- `src/state.ts`: add `export const sourcePattern = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/`; `sources` becomes `z.array(z.string().regex(sourcePattern)).optional()`; `tab`, `worktree` become `z.string().min(1).optional()`; `pane` and `prompted` members become `z.string().min(1).optional()` (`prompted_at` unchanged); delete `withLeafLocks` and `dependenciesReady`; drop `basename`/`dirname` from the `node:path` import.
- `src/config.ts`: `within` drops `&& !isAbsolute(diff)` and the `isAbsolute` import; `commonDirectory` becomes one `run(['git', 'rev-parse', '--git-common-dir'], cwd)` — `code !== 0 && stderr.includes('not a git repository')` → null, other non-zero → `throw new Error(JSON.stringify({ cwd, ...result }))`, zero → `realpathSync(resolve(cwd, result.stdout))`. `command` import stays.
- `src/phase.ts`: first line of `requireClean`: `if (!existsSync(worktree)) throw new Error(\`Missing worktree: ${worktree}\`)`; `phaseCommand` calls the inner body directly inside `withRepoLock`; drop `withLeafLocks` import.
- `src/next.ts`: in `dispatchLeaf`, the `try/catch` inside `withLeafLocks` becomes the direct return of the `withRepoLock` callback; drop `withLeafLocks` import.
- `src/pull.ts`: import `sourcePattern` from `./state`; `closeSource` uses `sourcePattern.exec(source)`; `SourceError` unchanged.
- `tests/phase.test.ts`: repoint probe `lock` at lines 267, 542, 547, 635 to `resolve(f.root, 'issues/.lock')`; remove `'malformed'` from the `sources` array ~line 329 (gh script and warning count unchanged); add the load-rejection test and the missing-worktree test.
- `tests/next.test.ts`: repoint probe `lock` at 673, 906, 1509; scope loop iterates `['global', 'repo']` and the lock path becomes `scope === 'global' ? f.home : resolve(f.root, 'issues')`.
- `tests/fetch-deadline-harness.ts`: reacquire loop keeps only `resolve(f.home, '.lock')` and `resolve(f.root, 'issues/.lock')`.
- `tests/config.test.ts`: add the F9 single-spawn test.
- Delete `muse-audit.md` at the repo root.

## 5. Do-not, reasons and exceptions

- Do not touch `tests/fake-gh.ts`, `issues/AKROGON-AUDIT-FIXES.md`, lock ignore/sync policy, or `currentRepo` check ordering — all excluded by the design.
- Do not add a shell-wide missing-cwd guard, a second check in `closeSources`, caches, snapshots, or speed-only parameters — foreclosed by the design and the note rule.
- Do not change `prompted_at` members — design says unchanged.
- Do not weaken or delete existing assertions beyond the listed edits; the `'malformed'` stderr assertion in the retry test stays because `view(8, '{malformed-json')` still produces it.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: exclusions exist because the design forecloses them or they change behavior for valid input; the only exception is a revised brief from B.

## 6. Ordered steps

1. Write the three new tests first and capture red evidence:
   a. `tests/config.test.ts`: F9 test — `git` shim on `PATH` appending `"$1 $2"` to a log then `exec`ing real git; `bun -e 'import { commonDirectory } from "./src/config.ts"; ...'` child (cwd = repo root, `process.argv[2]` is the first positional) calls `commonDirectory` once per cwd kind: `f.root`, a nested subdir, a linked worktree (`git worktree add`), and a non-repo dir. Assert one log line per call, resolved `.git` path for repo cases, null for non-repo. Second shim variant emits `fatal: disk gone`, exits 128 → assert throw containing `cwd` and `disk gone`.
   b. `tests/phase.test.ts`: load-rejection test — leaf with `sources: ['malformed']` and leaf with `worktree: ''`, each via `cli(f, ['phase', slug, 'implement'])`; assert non-zero, field name in stderr, state file byte-identical, no `issues/log.jsonl`, no `gh.db + '.calls'`.
   c. `tests/phase.test.ts`: missing-worktree test — leaf in `plan.synthesis` with `worktree` pointing at a removed folder; `cli(f, ['phase', slug, 'implement'])` exits non-zero with `Missing worktree:` and the path; state and log untouched.
   Run `bun test tests/config.test.ts tests/phase.test.ts` and record the new tests failing (red).
2. `src/state.ts` edits (criterion 1, 3).
3. `src/config.ts` edits (criterion 1, 2).
4. `src/phase.ts` edits (criterion 1, 4).
5. `src/next.ts` and `src/pull.ts` edits (criterion 1).
6. Existing test edits: `tests/phase.test.ts` probe locks and `'malformed'` removal; `tests/next.test.ts` probe locks and scope loop; `tests/fetch-deadline-harness.ts` reacquire list (criterion 5).
7. Delete `muse-audit.md` (criterion 7).
8. Run the changed-tests command; record green.

Advisory size: about 10 files, under 50 turns.

## 7. Commands

```
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

with `AKROGON_BASE=20c613b599acfbfd7d19277c883cf13bd0920e46` in the environment. Red evidence in step 1 uses `bun test tests/config.test.ts tests/phase.test.ts` directly.

## 8. Done-when, evidence and report

All seven acceptance criteria hold, the three new tests have recorded red-then-green evidence, and the changed-tests command output is pasted. Report ends with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
