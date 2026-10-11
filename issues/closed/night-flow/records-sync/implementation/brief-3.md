# Worker brief 3: per-repo self-update record sync (unit U3)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/records-sync-u3`

Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

## 1. Goal

Reshape `src/self-update.ts` so the git stage runs for every registered repo — classify ahead commits against `eligibleRecord`, replay eligible ones onto the fetched default branch in a scratch worktree, push, move the root checkout with `git reset --keep` — while `bun install` and skill links stay akrogon-only. Implements plan D2-D7. All 7 currently-red tests in `tests/self-update.test.ts` must turn green, plus the two `install.test.ts` updates below.

## 2. Acceptance criteria

1. `bun test tests/self-update.test.ts --timeout=30000`: 8 pass, 0 fail. The tests are the contract; read them first and match the asserted tokens: `pushed`, `record`, `pending`, `skipped`, `coordination lock`, `ignored operator path`, `issues/log.jsonl`, `akrogon sync`. Side effects asserted: remote tips, `git rev-parse HEAD`, `git worktree list` count stays 1 (no scratch left, ever), dirty file contents, empty `git stash list`, no `rebase-merge`/`rebase-apply`.
2. `bun test tests/install.test.ts --timeout=30000` passes after exactly two expectation updates you make to that file (these are the plan's authorized test edits, in your own commit with the `Test-Change:` trailer from section 8):
   a. `refuses a fast-forward overlapping a dirty edit...` (line ~331): the line vocabulary changes to the pending outcome; update the `toContain('self-update skipped: fast-forward refused')` expectation to the new line's pending form and keep the path/lag/remedy assertions.
   b. `is a silent no-op when repo.root is not ownRoot` (line ~457): self-update is no longer a silent no-op for other repos — it now runs the git stage. Update this test to cover that: keep `elsewhere` as ownRoot, give the clone a record-only ahead commit (`issues/record` file), expect exactly one git-outcome line containing `pushed`, expect the clone's HEAD and `remote.git` moved, and keep the no-links assertions (`.local/bin` absent, `akrogon-install.lock` absent).
3. `bun test tests/sync.test.ts --timeout=30000` unchanged green; `bun run typecheck` green; `bun run format` applied to `src/self-update.ts`.
4. Behavior contract (from plan D2-D7, binding):
   - Git stage first, for every repo, inside `integrate(repo, opts, move)` from `src/sync.ts`; the whole fetch-through-push region holds the global `.lock`.
   - `opts.pre`: classify commits in `<incoming>..HEAD` with `git rev-list --parents <incoming>..HEAD` then per commit `git diff-tree --no-commit-id --name-only --no-renames -r -z <sha>` (empty output = merge or no paths; a merge commit — more than one parent in the rev-list line — is ineligible). Every path of every commit must satisfy `eligibleRecord(repo.root, worktreeStore(repo), path)`; any ineligible path returns the skip string that reproduces today's line: `<n> behind <target>` context plus the `diverged`/`ahead of` and `run akrogon sync` wording, so the final line still reads `self-update skipped: ... run akrogon sync`.
   - `move(incoming)`: replay the local commits onto `incoming` in the scratch worktree — `rmSync(scratch, { recursive: true, force: true })`, `git worktree prune`, `git worktree add --detach <scratch> incoming`, `git -C <scratch> rebase incoming` — producing tip `T`. Return `{ tip: T }` when `T !== incoming` (a push is needed), `{ tip: null }` when `T === incoming` (ahead was 0, or every local commit was already upstream: no push, no scratch needed beyond the rebase), or `{ conflict: { paths } }` on a rebase conflict.
   - `{ tip: null }` widening: `integrate`'s `move` type on this branch only accepts `{ tip: string } | { conflict }`. You MAY edit `src/sync.ts` minimally so `move` may return `{ tip: null }` meaning "no push"; `integrate` then skips the push and returns `pushed: null`. Keep `syncCommand` returning a real sha. This is the authorized interface refinement; keep it minimal.
   - Both-sides record conflict: inside `move`, after rebase fails, detect `git -C <scratch> diff --name-only --diff-filter=U -z` non-empty → `git -C <scratch> rebase --abort`, cleanup scratch, return `{ conflict: { paths } }`; `integrate` throws `record conflict: <paths>; run akrogon sync`; selfUpdate catches (it is the only integrate caller seeing this) and prints a line containing each path and `akrogon sync`, no `skipped` prefix needed.
   - The checkout move: after `integrate` returns `{ pushed, incoming, skip }`, when `skip === null` and HEAD is behind `incoming`, run `git reset --keep <pushed ?? incoming>` in `repo.root`. On refusal (`run` code !== 0), the line is the pending form: contains `pending`, the path from git's stderr (the stderr already names it — pass `errorLine(result)` through), the lag count, and `commit or finish the overlapping edit`. When a push happened, the line also contains `pushed` (outcomes stay separate, e.g. `pushed 1 record commit(s); checkout pending: ...`).
   - Success line forms: checkout moved after push → contains `pushed` and the moved/`deployed` wording; behind-only move → `deployed <old>..<new>` (keep the existing token for own repo; same wording acceptable for other repos since install is separate); nothing to do → `current <sha>` (own) or silent/short for non-own (tests only require: no `pushed`, HEAD/remote right).
   - Install/links stage: only when `realpathSync(repo.root) === realpathSync(ownRoot)`, run today's `bun install --frozen-lockfile` + skill-link reconcile; the `akrogon-install.lock` flock wraps the whole own-repo `selfUpdate` as today (install lock outside, `.lock` inside via `integrate`); for non-own repos skip install/links and skip the install lock entirely.
   - Scratch: `leafTemp(repo, 'self-update')` from `src/config.ts`; on EVERY exit path (conflict, push rejection, reset step, success) the scratch worktree is removed (`git worktree remove --force` or rm+`git worktree prune`) before the line prints. A rejected push: report the push error, `retried at the next trigger`, cleanup scratch, HEAD unchanged.
   - Never `git stash`, never `--autostash` in this path, never force-push, never stage anything.
   - Fetch failure keeps today's `fetch failed: ...; <lag>; retried at the next trigger` line. Branch/detached checks keep today's skip lines but must still let own-repo install/links run (today's structure: skip does not skip install).
5. `src/next.ts` unchanged unless a signature forces it (none expected — flag mismatch if it seems needed).

## 3. Read-first list

- `src/self-update.ts` — the file you own.
- `src/sync.ts` — `integrate`, `eligibleRecord` (already exported on this branch).
- `tests/self-update.test.ts` — the 8 tests; read every assertion.
- `tests/install.test.ts` — the describe block + the two tests to update.
- `src/config.ts` — `leafTemp`, `worktreeStore`, `globalHome`, `toolRoot`.
- `src/state.ts` — `withLock`. `src/shell.ts` — `command`, `run`, `Result`, `CommandError`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `src/self-update.ts`; `tests/install.test.ts` (only the two authorized edits); `src/sync.ts` (only the `{ tip: null }` widening if needed). Depends on U1's `integrate` (landed on this branch).

`integrate` signature on this branch:
```ts
integrate(repo, opts: { checkStaged?: boolean; pre?: (incoming: string) => Promise<string | null> },
  move: (incoming: string) => Promise<{ tip: string } | { conflict: { paths: string[] } }>)
  => Promise<{ pushed: string | null; incoming: string; skip: string | null }>
```
`move` conflict throws `record conflict: <paths>; run akrogon sync` inside the lock.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/self-update.test.ts` or `tests/sync.test.ts`: locked tests; a red planned test is a mismatch returned to A.
- Do not change `integrate`'s hazard checks, `.lock` span, or `syncCommand`'s behavior: criterion 6.
- Do not stash, autostash, stage, or force-push anywhere in this path: brief criteria 3 and the design's binding decisions.
- Do not run install or links for a non-akrogon repo, and do not take `akrogon-install.lock` for one: design decision 2.
- Do not leave the scratch worktree behind on any path: criterion 4 asserts `git worktree list` count.
- Do not write or edit tests beyond the two authorized `install.test.ts` edits: everything else is a mismatch.
- Keep one-line `console.log` output; do not print extra lines.

Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `tests/self-update.test.ts` fully, then `src/self-update.ts`, `src/sync.ts`, `src/config.ts` (`leafTemp`).
2. Rewrite `src/self-update.ts` per section 2 (keep `errorLine`/`describeError` helpers, the `lag()` helper, the fetch-failed and branch skip lines).
3. Make the two authorized `install.test.ts` edits.
4. `bun install --frozen-lockfile`; `bun run typecheck`; `bunx prettier --write src/self-update.ts tests/install.test.ts`; then `bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts --timeout=30000` — all green.
5. Commit in at most two commits: product code first, then the `install.test.ts` edits with the required trailer — or one commit containing both with the trailer. Report sha(s).

Advisory size: 3 files, under 25 turns.

## 7. Commands

```sh
bun install --frozen-lockfile
bun test --changed=c53f6196533289555518577f08907ec9c713721c --timeout=30000
bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

A commit that changes `tests/install.test.ts` ends its message with this trailer in the final trailer block:

```
Test-Change: tests/install.test.ts plan-authorized updates for the pending vocabulary and non-own-repo git stage (records-sync plan)
```

Done when: 8/8 self-update tests green, install+sync tests green, typecheck green, scratch never left, commits reported. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
