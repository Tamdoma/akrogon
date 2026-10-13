# Brief 1: stop core and CLI (U1)

## 1. Goal
Add `akrogon stop <slug>`, `akrogon stop --all` and `akrogon start <slug>` with the host-local `stopped.yaml` record. Plan decisions D1, D2, D3, D4, D8 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md).

## 2. Acceptance criteria
Planned tests (already committed, do not edit): `tests/leaf-stop.test.ts`.
1. `stop records the leaf, then stops its leaf slice and keeps the worktree` passes.
2. `a failed slice stop keeps the record, prints the error, exits non-zero and is retryable` passes.
3. `stop --all stops every allocated leaf, reports each, and one failure does not block the others` passes.
4. `start removes the stopped record and runs the targeted pass, and refuses a leaf that is not stopped` passes.
The other tests in that file need U2/U3 (dispatch gate, merge gate, status) and may stay red: only their failures past the `stop` step are expected. `tests/command-reference.test.ts` README cases go red when the verbs are added; U4 adds the README rows in parallel, so that red is expected in your worktree.

## 3. Read first
- `src/pause.ts` whole file: copy its record/schema/error/lock shape.
- `src/scope.ts:13-15` `leafSlice(repo, slug)`.
- `src/state.ts:155` `allLeaves(repo)`, `:199` `findLeaf(repo, slug)`, `:205-226` `withLock`.
- `src/shell.ts:8-16` `CommandError`, `:108-112` `command(argv)` (throws `CommandError` on non-zero; its message is JSON with argv, cwd, code, stdout, stderr).
- `src/akrogon.ts` lines 14-45 (per-verb options) and the `switch (verb)` with `pause`/`unpause` cases and the usage string.
- `src/next.ts` `export async function nextCommand(input: string | undefined, ...)` (around line 1527): the targeted pass. It takes the global lock itself, so call it after releasing the lock.
- `.gitignore` line 6 `paused.yaml`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Changes and interfaces
Owned paths: `src/stop.ts` (new), `src/akrogon.ts`, `.gitignore`. Prerequisites: none. Shared test resource: none.
- `src/stop.ts` exports (U2/U3 consume these exact names):
  - `stopFile(): string` = `resolve(globalHome(), 'stopped.yaml')`.
  - `readStopped(): Set<string>` keys `<repo>/<slug>`; ENOENT → empty set; schema `z.record(z.string().min(1), z.literal(true))`; invalid YAML or schema → `StopStateError` (mirror `PauseStateError`).
  - `isStopped(repoName: string, slug: string): boolean`.
  - `stopCommand(target: string | undefined, all: boolean, cwd: string): Promise<void>`, `startCommand(slug: string, cwd: string): Promise<void>`.
- D2 `stop <slug>`: `requireRepo(readGlobal(), cwd)`, `findLeaf(repo, slug)` (unknown slug errors), add key under `withLock(resolve(globalHome(), '.lock'), ...)`, release, then `await command(['systemctl', '--user', 'stop', leafSlice(repo, slug)])`. Failure throws (record stays, process exits non-zero, stderr shows the slice). Success prints `stopped: <repo>/<slug>`.
- D3 `stop --all`: leaves from `allLeaves(repo)` with `state.tab !== undefined`; write all keys in one lock before any systemctl call; then stop each in turn, catching only `CommandError`; print `stopped: <repo>/<slug>` (stdout) or `failed: <repo>/<slug> <error.message>` (stderr) per leaf; `process.exitCode = 1` if any failed.
- D4 `start <slug>`: `findLeaf` first; under the lock, throw `Leaf is not stopped: <repo>/<slug>` when absent, else delete the key and write; after the lock, `await (await import('./next')).nextCommand(slug)`.
- D8 `src/akrogon.ts`: `stop` gets `{ all: { type: 'boolean' } }`; cases `stop` (exactly one of a positional or `--all`, else throw a usage error) and `start` (`z.tuple([z.string()])`); lazy `await import('./stop')`; add both verbs to the usage string.
- `.gitignore`: `stopped.yaml` beside `paused.yaml`.

## 5. Do-not
- Do not edit any test file: a wrong or still-red planned test is a mismatch returned to A. Exception: none.
- Do not touch `src/next.ts`, `src/turn.ts`, `src/status.ts`, README or docs: other units own them. Exception: a revised brief.
- No fallback or broad catch: catch only `CommandError` in `--all`. Reason: errors must surface.
- Do not special-case an unloaded slice: systemd exits 0 for it.
- Do not change interfaces or scope; return a mismatch with evidence instead. Exception: a revised brief from A.
Reasons restated: tests are locked after planning; other paths belong to parallel units; the user forbids success-shaped error handling.

## 6. Steps
1. `bun install --frozen-lockfile` in the worktree.
2. Write `src/stop.ts` (criteria 1-4).
3. Wire `src/akrogon.ts`, `.gitignore`.
4. Run section 7; criteria 1-4 tests green.
5. Commit only your files, message `feat: stop and start a leaf`. No co-author line.
Advisory size: 3 files, under 15 turns.

## 7. Commands
`cd <worktree> && AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`
Also `bun test tests/leaf-stop.test.ts --timeout=30000` to read the four criteria tests.

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
