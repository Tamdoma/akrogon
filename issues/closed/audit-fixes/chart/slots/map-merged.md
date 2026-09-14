# Merged territory map: akrogon audit fixes

Attribution: (A) claude, (B) codex, (both) independent agreement.

## Claim checks
- F16 holds (both). Two call sites, both under global + repo lock. pull writes only seeds under repo lock. park/sync hold global. Historical deadlock attribution unverified (B).
- F17 holds (both). Zero callers.
- F18 holds (both). POSIX only, not a Windows claim (B).
- F7 holds (both). Regex private in `closeSource` pull.ts:110; invalid entry aggregates and the owner never closes. Schema validation rejects at load; it does not repair an existing bad file (B).
- F9 holds (both). `--git-common-dir` outside a repo exits 128 with `not a git repository` (A probed). Non-repo already costs one spawn; the win is on success paths (B). Must use `run`, not `command` + catch, to keep null-vs-throw (B).
- F13: duplicate exists (both). Claim of identical data does not hold: first call is pre-lock at :646, second post-lock at :691, and the first is skipped when an event exists (both). Reusing the pre-lock result freezes ownership across the lock wait (B). The routing decision (`hooked`) is already made from that pre-lock data, so reuse is consistent with existing staleness; a stale-owner dispatch runs `dispatchLeaf`, which re-reads live state and does what a sweep would do to that leaf anyway; a parked leaf becomes a `Missing or unreadable leaf` skip with exit 1 (A).
- F6 holds (both). Narrow to `requireClean`; already-merged repair via `closeSources` still spawns git in the worktree and would still ENOENT (B).
- F8 holds (both). `.min(1).optional()` keeps omission valid. Herdr schemas in shell.ts still accept empty IDs, so "only hand-edited files" is slightly too absolute (B).

## Material forks
1. F13 (both raised). Options: (a) reuse the pre-lock owners in the hook branch, accepting the lock-wait window as already-existing staleness (A recommends); (b) drop F13 under the note's own no-snapshot rule (B recommends); (c) restructure so ownership is looked up once under the lock, which is a routing change and breaks tests requiring invalid-target rejection before any flock (both reject).
2. F7 regex home (both). pull.ts imports state.ts, so the constant must live in state.ts (or routing.ts) and pull.ts consumes it. This adds pull.ts to the note's four-file scope (B). Alternative: duplicate the literal, violates DRY (both reject).
3. F6 contract (B). Criterion 4 as written covers "phase on a leaf whose worktree is gone". Narrow it to transitions that reach `requireClean`; leave already-merged repair and deleted cwd out.
4. muse-audit.md deletion timing (B). "Once the leaf merges" reads as an operator step on main. Alternative: delete it in the leaf diff (root file, not under issues/, so allowed). (A recommends in-leaf deletion, fewer steps.)

## Practitioner points (settled by recommendation, not forks)
- Closure probes (both): fake-gh asserts `probe.lock` is held. Repoint eight probes to `issues/.lock`: phase.test.ts:267,542,547,635; next.test.ts:673,906,1509. Drop the `'leaf'` scope at next.test.ts:1064. Remove `basename`/`dirname` imports left dead in state.ts (B).
- Malformed retry test (B): phase.test.ts:329 includes `'malformed'` and asserts it in stderr. Move it out, keep the retry scenario with valid sources, add a load-rejection case naming `sources`.
- F9 tests (B): one git spawn per call verified through the existing fake-command style, covering checkout, nested cwd, linked worktree, non-repo, and a non-"not a git repository" failure that still throws.
- Gates (B): `bun test`, `bun run typecheck`, `prettier --check src tests` (the `format` script writes).
- fetch-deadline-harness.ts:88-91 reacquires leaf locks; passes trivially, trim or leave (both).
- No credentials needed (both).

## Split
One leaf (both). No ordering dependency among the eight. F13 must be settled or dropped, never redesigned inside this batch (B).
