# Design: audit-fixes-batch

## Binding decisions, verbatim

### F13: reuse the pre-lock pane owners or drop the fix
Operator answer: `1a`, 2026-09-14. Drop F13. Reason: the note's rule that no fix changes behavior for valid input; B's park-during-lock-wait case shows reuse changes the outcome. Foreclosed: reusing the pre-lock result; a routing redesign that looks ownership up once under the lock.

### F7: where the GitHub source pattern lives
Operator answer: `2a`, 2026-09-14. Export the source pattern from `src/state.ts`, use it in the state schema, and import it in `closeSource` in `src/pull.ts`. Reason: one grammar in one place. Foreclosed: duplicating the literal.

### F6: what "missing worktree" covers
Operator answer: `3a`, 2026-09-14. Criterion 4 covers transitions and merge recovery that reach `requireClean`. Reason: matches the fix text. Foreclosed: a second check in `closeSources` or a shell-wide missing-cwd guard.

### When muse-audit.md is deleted
Operator answer: `4a`, 2026-09-14. Delete `muse-audit.md` in the leaf diff. Reason: same merge, no manual step. Foreclosed: an operator deletion on main after merge.

### Note rule, verbatim from issues/AKROGON-AUDIT-FIXES.md
The rule for this issue: no fix may add a cache, a snapshot, a map threaded through calls, or a new parameter that exists only for speed. If a speed fix cannot be done by removing code, it does not get done. Speed is fine to gain, but not at the cost of a clean mental model.

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser or secret surface exists here. The user-visible flow is the `akrogon` CLI; the existing test fixtures invoke the real command in temporary git repos with fake `gh` and fake `herdr`, which exercises the flow end to end. (B) Fixtures delete themselves in `f.clean()` and `cli()` keeps output in memory, so the artifact comes from the verification command in done-criterion 8, which tees the full test output to `/tmp/akrogon-audit-fixes-batch-test.log`; the implementation report records that path. No `.env` values are needed.

## Leaf architecture

Owned surfaces: `src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts`, the `closeSource` import in `src/pull.ts`, `tests/state.test.ts`, `tests/config.test.ts`, `tests/next.test.ts`, `tests/phase.test.ts`, `tests/fetch-deadline-harness.ts`, `muse-audit.md`.

Literal interfaces:
- `export const sourcePattern = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/` in `src/state.ts`. `stateSchema.sources` becomes `z.array(z.string().regex(sourcePattern)).optional()`. `closeSource` runs `sourcePattern.exec(source)` and keeps its `SourceError` for the null case so runtime behavior on a bad string is unchanged in shape.
- `commonDirectory(cwd)`: one `run(['git', 'rev-parse', '--git-common-dir'], cwd)`. `code !== 0 && stderr.includes('not a git repository')` returns null. Other non-zero throws `new Error(JSON.stringify({ cwd, ...result }))`. Zero returns `realpathSync(resolve(cwd, result.stdout))`.
- `requireClean(worktree)`: first line `if (!existsSync(worktree)) throw new Error(\`Missing worktree: ${worktree}\`)`.
- `stateSchema` identifiers: `z.string().min(1).optional()` for `tab` and `worktree`; `pane` and `prompted` objects keep `.default({})` with `z.string().min(1).optional()` members. `prompted_at` unchanged.
- `dispatchLeaf` in `src/next.ts` and `phaseCommand` in `src/phase.ts` call their inner action directly where `withLeafLocks(leaf, ...)` wrapped it. No other line moves.

Tests:
- `tests/fake-gh.ts` is unchanged. Probes at `tests/phase.test.ts:267,542,547,635` and `tests/next.test.ts:673,906,1509` set `lock: resolve(f.root, 'issues/.lock')`.
- `tests/next.test.ts:1064` iterates `['global', 'repo']`.
- `tests/phase.test.ts:329` drops `'malformed'`. Its warning count and gh script are unchanged because the malformed entry consumed no gh step. A new test writes a state with `sources: ['malformed']` and one with `worktree: ''`, runs `akrogon phase`, asserts non-zero exit, the field name in stderr, the state file byte-identical, no `issues/log.jsonl`, and no gh calls.
- `tests/fetch-deadline-harness.ts:87-94` reacquires only the global and repo locks.
- F9 test: a fake `git` on PATH that records invocations, or a counter through the existing fake-command style, asserting one spawn per `commonDirectory` call across the four cwd kinds, plus a failure with a different stderr that throws. Existing indirect coverage at `tests/config.test.ts` and `tests/pull.test.ts:167` stays.
- F6 test: a leaf in `plan.synthesis` with `worktree` pointing at a removed folder; `akrogon phase <slug> implement` exits non-zero with `Missing worktree:` and the path, and state and log are unchanged.

Exclusions: F13 and everything under Off route in the chart. No shell-wide guard, no cache, no reordering of `currentRepo` checks, no change to `tests/fake-gh.ts`, no change to lock ignore or sync policy. The issue note `issues/AKROGON-AUDIT-FIXES.md` is not touched by the leaf.

Dependencies: none. Credentials: none.
