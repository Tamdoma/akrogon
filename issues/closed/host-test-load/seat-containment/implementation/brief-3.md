# Brief 3: pane boxing (U3)

## 1. Goal
Every leaf pane shell akrogon allocates runs in its own systemd scope under a per-leaf slice before any seat starts. Recorded panes found outside their scope are closed and recreated, and an unreadable check skips the leaf. New panes get the session bus cut. Plan decisions D1-D4, D5 (placement part). Criteria C2, C3 (placement), C4, C5, C6, all fixture parts.

## 2. Acceptance criteria
1. New `src/scope.ts` exports:
```ts
export function leafSlice(repo: Pick<Repo, 'name'>, slug: string): string; // `akrogon-l${sha256(`${repo.name}/${slug}`).hex.slice(0,12)}.slice`
export function paneScope(slice: string, paneId: string, pid: number, start: string): string; // `${slice without .slice}-p${paneId with [^A-Za-z0-9] removed}-${pid}-${start}.scope`
export function procRoot(): string; // AKROGON_PROC_ROOT if set (throw `Invalid AKROGON_PROC_ROOT: must be a non-blank absolute path` when blank or relative, same pattern as AKROGON_LEAF_TEMP_ROOT in src/config.ts:266), else '/proc'
export async function adoptShell(slice: string, paneId: string): Promise<void>;
export type ScopePlace = { place: 'inside' } | { place: 'outside'; cgroup: string } | { place: 'unreadable'; error: string };
export async function inOwnScope(slice: string, paneId: string): Promise<ScopePlace>;
```
   - Shell pid: `herdr(['pane', 'process-info', '--pane', paneId], z.object({ process_info: z.object({ shell_pid: z.number().int().positive() }) }))` using `herdr` from src/shell.ts. Real herdr 0.9.1 output: `{"result":{"process_info":{"pane_id":"w8:pP4","shell_pid":40349,...},"type":"pane_process_info"}}`.
   - Start time: `<procRoot>/<pid>/stat` field 22. Split the text after the last `)`. The remainder starts at field 3, so field 22 is index 19 of the space-split remainder.
   - `adoptShell` runs exactly this argv with `spawnCaptured` and env `{ ...process.env, DBUS_SESSION_BUS_ADDRESS: `unix:path=${XDG_RUNTIME_DIR}/bus` }` for that subprocess only (XDG_RUNTIME_DIR required; throw a clear error if unset or blank). A non-zero exit throws `CommandError(argv, cwd, result)`:
     `busctl --user call org.freedesktop.systemd1 /org/freedesktop/systemd1 org.freedesktop.systemd1.Manager StartTransientUnit 'ssa(sv)a(sa(sv))' <scope> fail 4 PIDs au 1 <pid> Slice s <slice> TimeoutStopUSec t 5000000 SendSIGHUP b true 0` (argv elements, no shell quoting).
   - `inOwnScope`: get pid and start, read `<procRoot>/<pid>/cgroup`. `inside` iff its trimmed content ends with `/${slice}/${paneScope(slice, paneId, pid, start)}`. Any other readable content is `outside`. An fs read error with an errno `code` (stat or cgroup) is `unreadable` with the message. Other errors propagate.
2. `src/next.ts` `allocate` (~427-534):
   - Ensure step first: `const slice = leafSlice(repo, leaf.state.slug)`. For each recorded id in `leaf.state.pane.A`/`.B` that is a live pane, `inOwnScope`. `unreadable` throws `Error` naming the pane id, the slug and the error. `outside` runs `herdr(['pane', 'close', id], z.object({}))`. After any close, list `panes()` and `tabs()` again before the existing tab matching. A closed last pane removes the tab, so the existing no-tab path runs.
   - `placement` gains `'--env', 'DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent'`.
   - Before the final `saveState(leaf.path, allocated)`, for `first` and `second`: `inOwnScope`. `inside` passes. `outside` gets `adoptShell`, then `inOwnScope` must return `inside`, otherwise throw naming pane, slug and observed cgroup. `unreadable` throws. A throw leaves the leaf undispatched, and the caller's existing catch reports it with the slug (`report(..., slug)`).
Planned tests (committed, run them, never edit them): all of tests/seat-containment.test.ts:
- "next boxes every pane shell in its own scope under the leaf slice before the seat starts"
- "new leaf pane shells get the session bus cut"
- "a failed adoption stops dispatch and reports the slug", "a misplaced shell stops dispatch and reports the slug"
- "an outside pane is closed and recreated boxed before any prompt"
- "an unreadable cgroup never closes the pane and skips the leaf this pass"
Every other test that uses the fake herdr (tests/next.test.ts, batch-dispatch, pause-next, peer-wait, park, timing, reconcile, phase...) must stay green. Fixtures: tests/helpers.ts `fakeHerdr` links tests/fake-busctl.ts as `busctl` and sets AKROGON_PROC_ROOT and XDG_RUNTIME_DIR. tests/fake-herdr.ts seeds an outside cgroup for panes it creates, and treats a pane seeded directly into its db with no proc entry as already boxed (tab label as slug, workspace label as repo).

## 3. Read first
- src/next.ts 427-534 (`allocate`), ~789 (its caller and catch), `report` at ~127.
- src/shell.ts `herdr`, `spawnCaptured`, `CommandError`. src/config.ts:262-270 (`leafTemp` override validation, the pattern for procRoot).
- tests/seat-containment.test.ts, tests/fake-herdr.ts, tests/fake-busctl.ts, tests/fake-proc.ts, tests/helpers.ts `fakeHerdr`.
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list
- New src/scope.ts (AC1). src/next.ts allocate (AC2).
Owned paths: src/scope.ts, src/next.ts. Nothing must land first. No shared test resource (fixtures only).

## 5. Do-not, reasons, exceptions
- Do not edit tests/ in any form, fixtures included. If a planned test or another test turns red and the cause is the fixture or an expectation, return a mismatch with the failing output and the smallest fixture or test correction. A applies it with a Test-Change trailer.
- Do not adopt a recorded pane that checks outside. Close it. The design forecloses adopting restored shells.
- Do not add retries, polling or sleeps around busctl or the check. A failure throws.
- Do not touch src/run-check.ts, src/config.ts, src/install.ts, src/self-update.ts. Other workers own them. Do not add stop/start verbs or slice removal (leaf-stop owns those).
- Do not call real busctl or herdr outside tests.
Reasons and exceptions: the tests, design and other units' paths are locked. The only exception is a revised brief from A.

## 6. Steps
1. src/scope.ts (AC1).
2. allocate ensure step and placement (AC2), then the final check/adopt (AC2).
3. Run section 7. Then also run `bun test --timeout=30000 tests/next.test.ts tests/batch-dispatch.test.ts tests/pause-next.test.ts tests/peer-wait.test.ts tests/park.test.ts tests/timing.test.ts tests/reconcile.test.ts tests/phase.test.ts` and report the result.
Advisory size: 2 files, under 16 turns.

## 7. Commands
From the worktree, after `bun install --frozen-lockfile`:
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`

## 8. Done-when
AC hold, the six planned tests pass, and the listed consumer files pass, or each remaining red is returned as a mismatch with output. Run `bun run typecheck`. Commit only src/scope.ts and src/next.ts with message `feat: box leaf pane shells in per-pane scopes`. Add no co-author line. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
