# Rebuttal A: pull-close

Read positions-A.md and positions-B.md. Peer rebuttal not read. Both positions agree on the architecture: `src/pull.ts`, a `gh` call through `src/shell.ts`, an awaited close loop after the rename in `completeOwner`, a `pull` verb, a startup entry above `next`, tests through a fake `gh` on PATH. The forks below are the behavioral differences; everything else is wording.

## Forks and resolutions

### K1 Listing call

A: `gh issue list --limit 1000`. B: `gh api repos/<o>/<r>/issues?state=open&per_page=100 --paginate --slurp`, flatten, drop entries carrying `pull_request`.

Conceded to B. Installed `gh api --help` (2.100.0) documents `--paginate` and `--slurp`. A fixed limit cannot justify deleting seed files, and the REST endpoint returns pull requests, so the filter is a consequence of the correct call, not extra scope. This also removes A's stated R2 limitation.

### K2 Which remote

A: `repo.config.remote`. B: the literal `origin`.

Conceded to B. Brief and design both say the checkout's origin, and `remote` is described in # Config Shape as the merge target. Reading the merge target as the intake source couples two unrelated facts.

### K3 Lock during pull

A: no lock. B: hold the repo lock across fetch and reconciliation.

Resolved between them: fetch outside any lock, reconcile the folder under `withRepoLock`. `issues/.lock` is the lock every `phase` and `next` pass takes, so holding it across a GitHub round trip on every herdr startup stalls dispatch for network time with no benefit; the interleave B wants to prevent (two pulls deleting and writing the same number) only exists in the write step, which takes milliseconds.

### K4 Retry unit for close

A: `retryCommand` on `view` and on `close` separately. B: retry the check-and-close pair, rechecking state before the second `close`.

Conceded to B. A `close` whose response is lost after GitHub applied it would post a second comment under A's scheme. Rechecking state before the retry is the one path that keeps "never double-comments" true. `retryCommand` is not the tool here; the retry is one explicit second pass over check-then-close with the warning line printed.

### K5 Exit code after a close failure

A: attempt every source, print each failure, then exit non-zero. B: report and continue, exit code unstated.

Kept as A. The live code already exits non-zero when the log append fails after state is committed, and the completion test asserts that shape. A repeated `phase merged` is refused as terminal, so nothing retries a failed close; a zero exit would hide the only signal the operator gets. Non-zero after all sources were attempted, move intact, log line written.

### K6 `--all` failure boundary

A: catch around `pullRepo` only. B: catch around loading the registration too.

Conceded to B. A registered repo without `issues/config.yaml` makes `readRepo` throw; under A that aborts every later repo, which contradicts criterion 2's "continues with the other repos".

### K7 Callers of `completeOwner`

A claimed two callers and that worktrees are never removed. Live `src/next.ts` lines 303 to 312 show a third caller and a `git worktree remove` right after it. B is correct. All three callers await the async `completeOwner`. Because `next` removes the worktree only after `completeOwner` returns, and a thrown rename error stops `next` before removal, the triggering leaf's worktree exists whenever the close loop runs; the commit is `git rev-parse HEAD` there, no fallback.

### K8 One commit per move

B's D5 says the triggering leaf's HEAD for every comment; B's A3 says "each unique open source with its distinct worktree commit". The brief fixes one commit, the merged head of the leaf whose transition moved the folder. The test asserts one sha across all comments of one move.

### K9 Files in `issues/seeds/` that are not numbered seeds

A: delete them. B: leave them.

Conceded to B. No criterion asks for it, and the mirror contract is one file per open number, which holds either way.

## Not forks

- Dedupe of repeated `owner/repo#n` across leaves (B): agreed, one `Set`.
- Where the startup-shape assertion lives (`tests/pull.test.ts` per B, a separate file per A): either; B's placement avoids a file with one test.
- B's A4 nonblocking `flock` probe from inside the fake `gh` to prove the lock is held during close: agreed, it is the only executable form of criterion 3's "inside the issue lock".
- Slug derivation, seed file content, `pull` verb parsing, startup entry order: same in both.
