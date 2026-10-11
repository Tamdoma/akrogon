# Implementation report: records-sync

Base: `c53f6196533289555518577f08907ec9c713721c` · Head: `778ef94`

## check.fix round 3 (review-B F3: single-tree read-tree discarded staged edits)

- `e3b8595` (A): repro test — a staged edit on an unrelated path survives an incoming update; pre-fix the worktree file was reverted to the old committed bytes and the index went clean, post-fix `M` staging and new bytes remain.
- `778ef94` (A): the fix — `git read-tree -m -u <head> <moveTo>` (two-tree merge, the actual `reset --keep` machinery) instead of the single-tree form; staged/unstaged edits on unchanged paths carry forward, edits on colliding paths refuse pending. CAS-fail rollback now restores the index with plain `git read-tree HEAD` while leaving worktree bytes. CAS and the index-only rescue unchanged.
- Post-repair proof: `bun test --timeout=30000` under `akrogon run-check test`: **805 pass, 0 fail**, 42 files, 79.3s — `/tmp/records-sync-f3.log`; typecheck and format green; `tests/self-update.test.ts` 13/13 green.

## check.fix round 2 (review-B reopened A F1: HEAD check and reset were separate operations)

- `plan.md` implementation note (A): the D4 move is now `git read-tree -m -u <moveTo>` + `git update-ref <branch> <moveTo> <head>` — a compare-and-swap on the validated HEAD. A commit anywhere in the move window fails the CAS, restores index/worktree to the real HEAD, and reports pending. The content-equal rescue adopts the index tree under the same all-colliders-equal gate, then the same CAS. `reset --keep` is gone.
- `d8c5bda` (A): repro test — a PATH-shimmed `git` pauses only the `update-ref refs/heads/main` CAS while a real external commit lands; pre-fix the run reported `deployed` and the commit vanished, post-fix it reports `checkout pending: the checkout moved to <sha> during integration` and the commit stays on the branch. The shimmed `selfUpdate` runs in a `Bun.spawn` child with an explicit env because Bun snapshots `process.env` for its own spawned children.
- `a803e56` (A): the CAS fix in `moveCheckout` (amended once for the repro test's ReadableStream cast, cited by trailer).
- Post-repair proof: `bun test --timeout=30000` under `akrogon run-check test`: **804 pass, 0 fail**, 42 files, 78.2s — `/tmp/records-sync-cas.log`; typecheck and format green; `tests/self-update.test.ts` 12/12 green.

## check.fix round 1 (after review-A F1/F2, review-B F1/F2)

- `58c689e`, `25f4112` (B): B F1 repair — non-own repos now also move their checkout (own-repo gate removed); repro + fix commits.
- `9142378`, `f0d0084` (B): A/B F2 repair — `reset --mixed` rescue gated on every changed path being a content-equal collider; otherwise pending.
- `f39f422`, `6a7f2e2` (A): A F1 repair — repro test (a record commit landed while `.lock` waits under an external `flock` is replayed, not dropped) + fix: replay base captured in `pre` under `.lock`, `moveCheckout` refuses pending when HEAD advanced since.
- `24ca71d` (A): B F1 handed-off test corrections — `hold.test.ts` advances a valid record (`issues/log.jsonl`, not an invalid-depth `state.yaml`) and expects the `deployed` line; `batch-merge.test.ts` expects `deployed` after the merge output. Both with `Test-Change` trailers.
- `6e3ef1d` (A): prettier pass over the repair files.
- Post-repair proof: `bun test --timeout=30000` under `akrogon run-check test`: **803 pass, 0 fail**, 42 files, 76.5s — `/tmp/records-sync-checkfix.log`; typecheck and format green; `tests/self-update.test.ts` 11/11 green.

## Changed files and reasons

| Commit | Files | Why |
|---|---|---|
| `dd3c183` | `tests/self-update.test.ts` (new) | Planned done-criterion tests, committed red at synthesis |
| `e0a0521` | `src/sync.ts` | U1: extract `integrate(repo, opts, move)` — `.lock`, fetch, four hazard checks, caller `move`, push — used unchanged by `syncCommand` (`checkStaged`, stage/commit/`rebase --autostash` as `move`) |
| `07654ac` | `docs/guide/install.md`, `README.md` | U2: self-update scope for every registered checkout, replay, pending/conflict lines, remedy changes (criterion 7) |
| `6d7b399` | `src/self-update.ts`, `src/sync.ts` | U3: git stage for every repo — per-commit `eligibleRecord` classification, scratch replay via `leafTemp(repo,'self-update')`, `reset --keep` move, own-repo-only install/links; `move` may return `{tip: null}` |
| `9e28d73` | `tests/install.test.ts` | Authorized expectation updates (pending vocabulary; non-own git stage) with `Test-Change` trailer |
| `0827334` | `src/self-update.ts`, `src/sync.ts` | Repair: `after` hook moves the checkout inside `.lock` (today's guarantee), dropLocal history-rewrite removed (design keeps local history), `ignoredAt` probe removed, `fetch failed`/`push failed` lines name `retried at the next trigger`, bare `record conflict:` line |
| `2bc2e09` | `tests/self-update.test.ts` | A's planner corrections: pending keeps local history (HEAD = local tip, not merge-base); ignored-collision supplies the rule via the worktree's `.gitignore`. `Test-Change` trailer |
| `d6ea570` | `src/self-update.ts` | Up-to-date and untracked-ref checkouts skip `integrate` entirely (no `.lock`, no push); empty-path commits are ineligible (prevents replaying/pushing empty commits) |

`src/next.ts` untouched — call sites needed no change.

## How it works

`selfUpdate` per repo: tracking-ref present → fetch → counts. Up-to-date returns without locking. Otherwise `integrate` under the global `.lock`: `pre` classifies every commit in `incoming..HEAD` per-commit against `eligibleRecord` (merge and empty commits ineligible → today's ahead/diverged `run akrogon sync` skip); hazard checks run; `move` replays onto `incoming` in a detached scratch worktree (`git rebase`, conflict → `{conflict}` → `record conflict: <paths>; run akrogon sync`, `tip === incoming` → no push), pushes `<tip>:<branch>`; `after` moves the root checkout with `git reset --keep` still inside `.lock`. Keep-refusal with every collider content-equal adopts via `reset --mixed`; otherwise `checkout pending: <git output>; <lag>; commit or finish the overlapping edit`, keeping local history. Fetch/push failures print `<op> failed: …; retried at the next trigger`. Own repo additionally runs `bun install --frozen-lockfile` + skill links under `akrogon-install.lock` (install lock outside, `.lock` inside).

## Commands run

- `bun test --timeout=30000` (the leaf's `test` check, wrapped by `akrogon run-check` + guards): **800 pass, 0 fail**, 8152 expects, 42 files, 120.85s — `/tmp/records-sync-final2.log`
- `bun test --changed=c53f619…` (`test_changed`): **156 pass, 0 fail**, 8 files, 43.6s
- `bun run typecheck` (`typecheck` check): clean
- `bun run format` (`format` check): applied, no drift
- Targeted during implementation: `bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts tests/next.test.ts tests/pause-next.test.ts tests/hold.test.ts tests/docs-links.test.ts tests/red-docs.test.ts` — all green

Wall time: full suite ~2 min per run, run twice (mid-implementation red triage, final proof).

## Criterion → test mapping

- C1: `self-update pushes and moves record-only commits on own/other repo`
- C2: `a local code commit ahead leaves the checkout and remote unchanged` + existing install.test ahead/diverged cases
- C3: `pushes then reports a pending checkout the next trigger moves`, `pending checkout on a behind-only move`
- C4: `a record changed on both sides pushes nothing and names the path and akrogon sync`
- C5: `incoming tracked active lock path`, `incoming tracked path colliding with an ignored file`
- C6: whole `tests/sync.test.ts` (31 tests) unchanged and green
- C7: docs commits `07654ac`, `tests/docs-links.test.ts` green

## Worker notes folded in

- U3's `rebase incoming local` (not bare `rebase incoming`) is what performs the replay; correct.
- Mid-suite red triage found and fixed two real defects of the first cut: unconditional `.lock` on up-to-date checkouts (broke `before any flock` refusals, serialized `next`) and empty commits classifying as record-only (pushed an impostor commit, moved `origin/main`).
- The C3-preflight tests forced the tracking-ref skip: a successful fetch recreates a deleted `origin/main`, which would silently erase preflight's `C3` refusal. Self-update now leaves that ref alone.

## Known limitations

- L1 (resolved in check.fix): the earlier own-repo-only move gate was removed by B's repair (`25f4112`); every registered checkout now moves on a behind-only update too.
- L2: pushes from a temporary worktree and branch-protection changes are not covered by the readiness proof (its stated limit); leaf tests use local bare remotes.
- L3: work cases fetch twice (light-path fetch + `integrate`'s fetch under `.lock`); the up-to-date and wrong-branch cases fetch once, matching today's cost.
- L4: a `record conflict` outcome leaves the local commits in place for `akrogon sync` to rebase-and-resolve, same as sync's own rebase conflict route.

## Unverified criteria

None — every done-criterion is green in the suite. Live GitHub push identity is the recorded readiness door proof; no live push during implementation per the standing design.
