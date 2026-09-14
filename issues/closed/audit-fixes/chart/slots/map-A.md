# Map A (claude)

## Claim checks
- F16 holds. `withLeafLocks` (src/state.ts:138) is called only at src/next.ts:489 and src/phase.ts:191, both already inside global `.lock` + `issues/.lock`. `pull` holds only the repo lock and writes only `issues/seeds/*` (src/pull.ts:43,73). `park` and `sync` hold global (+repo). No writer of leaf state runs outside the global lock.
- F17 holds. `dependenciesReady` has zero callers in src/ and tests/.
- F18 holds. `relative()` returns a relative path on POSIX; `isAbsolute` import used only there.
- F7 holds. `sources: z.array(z.string())` at state.ts:19. Invalid entry throws `SourceError` inside `closeSource` (pull.ts:110), caught per source into AggregateError; folder never closes.
- F9 holds. `git rev-parse --git-common-dir` outside a repo exits 128 with `fatal: not a git repository` on stderr (probed in /tmp). Same message the current probe matches.
- F13 holds. `paneOwners` runs at next.ts:646 (for `hooked`) and again at 691. But the first call is short-circuited when `event !== undefined`, so the hook branch cannot blindly reuse a value that was never computed.
- F6 holds. `requireClean` (phase.ts:152) spawns git with `cwd: worktree`; Bun throws ENOENT before `run` wraps it.
- F8 holds. tab/worktree/pane/prompted are `z.string().optional()` with no min.

## Material forks
1. F16 test probes. `tests/fake-gh.ts:31` asserts the lock at `probe.lock` is HELD during every gh call (throws when `flock -n` succeeds). Eight probes point at issue/leaf `.lock` paths: phase.test.ts:267,542,547,635; next.test.ts:673,906,1509; plus `for scope of ['global','repo','leaf']` at next.test.ts:1064. Removing leaf locks makes those probes fail. Recommend: repoint every probe `lock` to `issues/.lock` (the invariant "source closure runs under a lock" survives, now against the repo lock) and drop the `'leaf'` scope from the lock-failure test. Alternative: delete the probes entirely, which loses the under-lock invariant.
2. F7 regex home. `pull.ts` imports from `state.ts`, so `state.ts` cannot import the regex from `pull.ts` without a cycle. Recommend: define the source regex once in `state.ts` (or `routing.ts`), export it, and have `closeSource` use it. Keep `SourceError` in pull for runtime gh failures. Alternative: duplicate the regex, violates DRY.
3. F13 shape. Recommend computing `owners` once whenever `hookPane !== undefined` and deriving `hooked` from it: `const owners = hookPane === undefined ? [] : await paneOwners(...)`. Cost: one extra scan in the `tab_closed` event path, which already scans all repos itself. Alternative: keep lazy short-circuit and a nullable variable, more branching for no gain at this scale.

## Practitioner questions
- Does anything read a leaf `.lock` file as a signal? `sync.ts` ignore-collision tests list nested `.lock` paths but those are gitignore checks, not lock acquisition. No.
- `fetch-deadline-harness.ts:88-91` reacquires leaf/issue locks after the run. With no leaf locks these lines pass trivially. Trim to global+repo or leave.
- F6: should `recoverMerge` (phase.ts:169) also benefit? It calls `requireClean` so yes, automatically.
- F9: keep the `realpathSync(resolve(cwd, ...))` wrapping; only the probe call goes.

## Pitfalls
- Note says "delete tests that covered deleted code" but the probe tests cover source closure, not locks. They must be edited, not deleted. Test count must not drop except `'leaf'` scope iteration (one test).
- `phase.test.ts` around 259 titled "under open locks" may assert leaf-level locking by name. Rename is fine, keep the assertion against `issues/.lock`.
- F8 `.min(1)` on `pane.A` etc.: `z.string().min(1).optional()` keeps absent fields valid. Tool code sets `pane: {A: first.pane_id, ...}` from herdr JSON, never empty.
- F7 error must name the field: zod path `sources[0]` in the ZodError does that.

## Split
One leaf. All eight touch four source files with overlapping tests, are independently checkable by criteria, and there is no dependency ordering. Splitting would create merge conflicts in state.ts and next.test.ts for no parallel gain.
