# Plan: records-sync

Every registered checkout self-syncs record-only local commits during self-update: classify ahead commits against `eligibleRecord`, replay them onto the fetched default branch in a scratch worktree, push, move the root checkout with `git reset --keep`, and keep install/links akrogon-only. No stash, no force-push, no staging by this path.

## Decisions

- D1: `src/sync.ts` exports one shared inner sequence `integrate(repo, opts, land)` taking the global `.lock` once: branch check, fetch, incoming-tree hazard checks (tracked/incoming/replayed active lock paths, ignored operator collisions), then caller `land(incoming)`, then `push <remote> <sha>:<default_branch>`. `syncCommand` calls it with a `checkStaged` preamble plus its existing stage/commit/`rebase --autostash` work as `land`; self-update calls it with no staging and a scratch-replay `land`. `syncCommand`'s observable behavior is unchanged.
- D2: Ahead commits are classified per commit with `git log --format= --name-only --no-renames <incoming>..HEAD`; a merge commit (`%P` more than one parent) is ineligible. Any ineligible path keeps today's ahead/diverged skip line naming `akrogon sync`. Classification runs before hazard checks; a skip does no hazard work.
- D3: Replay runs in a detached-HEAD worktree at `leafTemp(repo, 'self-update')` (already `~/.akrogon/scratch/<repo>/`, already `AKROGON_LEAF_TEMP_ROOT`-overridable in tests), created with `git worktree add --detach <scratch> <incoming>` and integrated with `git rebase <incoming>` so patches already upstream drop out. On any failure: `git rebase --abort` when applicable, `git worktree remove --force`, `git worktree prune`, then the line is returned. The push runs from `repo.root` as `git push <remote> <sha>:<default_branch>`; a rejected push reports the error and retries at the next trigger.
- D4: The root checkout moves with `git reset --keep <pushed>` after a push, or `git reset --keep <incoming>` on a behind-only move (replaces today's `merge --ff-only`; same dirty-file refusal, also covers replayed tips). A refusal is the pending outcome: the line carries the keep output, which names the dirty path, plus the lag and remedy.
- D5: Line vocabulary: `pushed <n> record commit(s) to <remote>/<branch>` combined with the deploy state; `checkout pending: <keep output>; <lag>; commit or finish the overlapping edit`; a both-sides record conflict reports `record conflict: <paths>; run akrogon sync` with no push and no move; ineligible-ahead keeps `self-update skipped: ...; run akrogon sync`; hazard refusals reuse sync's `Cannot sync ...` wording. Non-own repos print the same git-outcome lines; install/link wording stays own-repo only.
- D6: `selfUpdate`'s own-repo branch becomes two independent stages: the git stage above runs for every registered repo; `bun install --frozen-lockfile` plus skill links run only when `realpath(repo.root) === realpath(ownRoot)`, and the per-repo `akrogon-install.lock` flock stays akrogon-only. The global `.lock` is taken inside `integrate` for every repo. Fetch failure keeps today's `fetch failed: ...; retried at the next trigger` line.
- D7: Scratch path pre-clean: `rmSync(scratch)` + `git worktree prune` before `worktree add`, so a stale leftover from a killed run cannot wedge the next trigger.
- D8: Docs edits only where named: `docs/guide/install.md` self-update paragraph + remedy paragraph; `README.md` self-update line + remedy sentence. `docs/guide/files.md` keeps its text: `akrogon sync`'s staging behavior is unchanged.

## Read-first

- `src/self-update.ts` (the function being reshaped)
- `src/sync.ts` (`eligibleRecord` :6-13, hazard checks :37-109, rebase/push :130-150)
- `src/config.ts` (`worktreeStore` :257, `leafTemp` :263, `globalHome` :197, `within` :221)
- `src/state.ts` (`withLock` :204)
- `src/next.ts` (call sites :1387, :1548)
- `tests/install.test.ts` (self-update describe :222-518 — fixture + helpers to mirror)
- `tests/sync.test.ts` (hazard test shapes)
- `tests/self-update.test.ts` (planned tests, committed red)
- `docs/guide/install.md` :36-40, `README.md` :82, `docs/guide/files.md` sync section
- `issues/chart/night-flow/forks/keep-running.md` (locked findings)

## Needed interfaces

- `integrate(repo, opts: { checkStaged?: boolean }, land: (incoming: string) => Promise<string>): Promise<string>` in `src/sync.ts`; returns the pushed sha. Throws `Error`/`CommandError` with the refusal text.
- `eligibleRecord` exported or reused within `sync.ts` for per-commit classification (exported if self-update imports it; otherwise a shared `recordCommitPaths` helper lives beside it).
- `selfUpdate(repo, ownRoot, home)` keeps its signature; internally splits `runGitSync(repo)` and `runInstall(repo, ownRoot, home)`.

## Waves

### Wave 1

- U1 `src/sync.ts` shared inner sequence. Owns `src/sync.ts`. Extract hazard checks and the `.lock`-taking `integrate` from `syncCommand`; rewire `syncCommand` to call it (staged-paths preamble + stage/commit/rebase as `land`, pushes `HEAD`). No behavior change; existing `tests/sync.test.ts` stays green.
- U2 Docs. Owns `docs/guide/install.md`, `README.md`. No dependency on U1 (wording follows the design, not the code).

### Wave 2

- U3 `src/self-update.ts`. Owns `src/self-update.ts`, `src/next.ts` only if a call-site signature change is needed (none expected). Needs U1's `integrate`. Implements D2-D6: classify, hazard-checked replay+push, `reset --keep` move, line outcomes, own-repo install/links split.

## Criterion → proof

| Criterion | Proof | Command | Catches | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 record-only ahead+diverged pushes, moves, keeps edits (own + other repo) | `tests/self-update.test.ts` two parametrized tests (`own` true/false) | `bun test tests/self-update.test.ts --timeout=30000` | push skipped, checkout not moved, links run on non-own repo, scratch left behind | seconds | src/sync.ts, src/self-update.ts, src/config.ts changes |
| 2 ineligible path (incl. undone code commit) keeps skip | `tests/self-update.test.ts` `a local code commit ahead` + existing `install.test.ts` ahead/diverged cases | `bun test tests/self-update.test.ts tests/install.test.ts --timeout=30000` | net-diff classification, unconditional push | seconds | classification changes |
| 3 dirty file overlapped by incoming: no stash, pending line, second trigger moves without re-push | `tests/self-update.test.ts` `pushes then reports a pending checkout` + `pending checkout on a behind-only move` | `bun test tests/self-update.test.ts --timeout=30000` | stash/autostash use, lost push record, re-push duplication | seconds | move/replay changes |
| 4 both-sides record conflict: no push, no move, paths + `akrogon sync`, no rebase/worktree left | `tests/self-update.test.ts` `a record changed on both sides` | `bun test tests/self-update.test.ts --timeout=30000` | force-push, scratch leak, rebase-in-progress leak | seconds | replay/conflict changes |
| 5 incoming lock path / ignored collision refused on behind-only | `tests/self-update.test.ts` `incoming tracked active lock path` + `incoming tracked path colliding with an ignored file` | `bun test tests/self-update.test.ts --timeout=30000` | hazards only checked in `akrogon sync`, ff-only merge bypassing checks | seconds | hazard-check changes |
| 6 `akrogon sync` unchanged incl. staging | existing `tests/sync.test.ts` suite | `bun test tests/sync.test.ts --timeout=30000` | refactor regressions | minutes | src/sync.ts changes |
| 7 docs | `tests/docs-links.test.ts` + `tests/red-docs.test.ts` | `bun test tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000` | dangling links, broken anchors | seconds | docs edits |

Full suite: `bun test --timeout=30000` (the leaf's `checks.test`); `bun run typecheck`; `bun run format`. Each new test shown red once on the base commit in the synthesis run below; implementers prove green. Deliberate-break evidence: the same tests were run against current main behavior (no record sync, no pending vocabulary, no hazards) and failed on the new assertions — see Red evidence.

## Red evidence (planned tests on unmodified product code)

`bun test tests/self-update.test.ts --timeout=30000`: 1 pass, 7 fail —

- `self-update pushes and moves record-only commits on own repo` / `on other repo`: Received `self-update skipped: diverged from origin/main; 1 behind origin/main; run akrogon sync` — no record sync exists.
- `pushes then reports a pending checkout the next trigger moves` / `pending checkout on a behind-only move`: line lacks `pending` (today: `fast-forward refused`).
- `incoming tracked active lock path` / `incoming tracked path colliding with an ignored file`: hazard checks absent from self-update; ff-only merge reports the untracked-overwrite refusal, not `coordination lock` / `ignored operator path`.
- `a record changed on both sides`: diverged skip names no paths and no `akrogon sync` route from the conflict state.
- `a local code commit ahead` passes: today's ahead-skip already satisfies criterion 2's base shape; the test locks it for the new classifier.

Existing `install.test.ts` expectations needing updates during implementation (not planned-test files): the `fast-forward refused` test's line must match the pending vocabulary, and `is a silent no-op when repo.root is not ownRoot` must become a non-own git-stage assertion (silent only for install/links).

## Checklist

### U1 — src/sync.ts shared inner sequence

- [ ] `integrate(repo, opts, land)` owns `.lock`, fetch, `incoming` resolution, all four hazard checks (tracked local locks, incoming locks, replayed locks, ignored collisions), `land(incoming)`, push `<sha>:<default_branch>`
- [ ] `syncCommand` calls `integrate` with its staged-paths preamble, stage/commit/`rebase --autostash`/unmerged-check as `land`; messages, ordering and staged behavior identical
- [ ] `eligibleRecord` and lock-path computation shared, not duplicated

### U2 — docs

- [ ] `docs/guide/install.md`: self-update runs for every registered checkout, replays record-only commits, drops the `akrogon sync` remedy for record-only ahead/diverged, keeps remedies for wrong branch, detached HEAD, local code commits, overlapping edits
- [ ] `README.md`: self-update line updated for every registered checkout and record replay
- [ ] `docs/guide/files.md`: unchanged (verified, sync semantics intact)

### U3 — src/self-update.ts

- [ ] git stage runs for every repo: fetch, branch/detached skip, per-commit classification (merge commits ineligible), hazard checks, scratch replay, push, `reset --keep` move
- [ ] outcomes: pushed+moved, pushed+pending (keep refusal naming dirty path), not pushed, both-sides record conflict naming paths + `akrogon sync`, hazard refusal reusing sync wording, ineligible-ahead skip
- [ ] install+links own-repo only; `akrogon-install.lock` own-repo only; `.lock` inside `integrate`
- [ ] scratch cleanup on every exit path incl. push rejection; `leafTemp(repo, 'self-update')` + pre-clean
- [ ] uncommitted records never staged; no stash/autostash; never force-push

## Affected docs

- `docs/guide/install.md` — one line each for new scope, replay, pending and conflict outcomes; remedy paragraph reworded
- `README.md` — self-update bullet reworded
- `skills/` — none affected
- `src/AREA.md` — one line if `sync.ts`'s exported surface is described there (verify during U1; otherwise no doc affected)

## Implementation notes

- 2026-10-11 check.fix round 2 (review-A F1, repeated by review-B): the checkout move in D4 reconciles worktree and index with `git read-tree -m -u <head> <moveTo>` — the two-tree merge `reset --keep` is built on, so staged and unstaged edits on unchanged paths carry forward and edits on colliding paths refuse — followed by `git update-ref refs/heads/<branch> <moveTo> <head>`, a compare-and-swap on the ref validated under `.lock`. A commit landing anywhere in the move window fails the CAS, restores the index to the real HEAD without touching worktree bytes, and reports pending instead of being silently dropped. The content-equal rescue adopts the index tree (`git read-tree <moveTo>`) under the all-colliders-equal gate, then the same CAS. `reset --keep` is no longer used. (Round 3 correction of this note's earlier single-tree form, which review-B F3 showed silently reverts a staged edit on an unchanged path.)
