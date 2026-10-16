# Report: release-rollback

Serial-solo run (every wave held one unit); no workers.

Base: `6121559` (origin/main after rebase from `4e2ecd2`; record: rebased d692a3d, no conflicts, AKROGON_BASE=6121559ee158f559842715a552248645f05bd026). Head: `d6e7cb7`.

## Changes

- `src/rollback.ts` (new): `rollback()` — `readGlobal()`, then under the akrogon repo's `akrogon-install.lock` (skipped when unregistered or absent): refuse without a recorded previous release or a non-release current, `flip(previous)`, `writeReleaseHold(held)` where `held` is the rolled-away commit — on a retry with `current === previous`, the existing hold or the record's commit — then `install()` restores links and prints `rolled back <old12> -> <prev12>`.
- `src/release.ts`: `writeReleaseHold(commit)` beside `readReleaseHold`/`clearReleaseHold`.
- `src/config.ts`: `readGlobal` wraps parse/schema errors with the `config.yaml` path, mirroring `readRepo`.
- `src/akrogon.ts`: `rollback` verb case (zero positionals) and usage string.
- `README.md`: command row plus a Rollback section naming the manual steps that need no current-release code.
- `docs/guide/install.md`: one rollback sentence; `src/AREA.md`, `tests/AREA.md`: one line each for `src/rollback.ts`, `tests/deploy-fixture.ts`, `tests/rollback.test.ts`.
- `tests/` (plan commit `d692a3d`): `tests/deploy-fixture.ts` extracted from `release-deploy.test.ts` (stub gains an `install` branch delegating to `AKROGON_FIXTURE_ENTRY`, plus `deployedPair`); `tests/rollback.test.ts` six criterion proofs; `command-reference.test.ts` contract row.

## Commands run

- `akrogon run-check --name rollback-criteria -- bun test tests/rollback.test.ts` — `check rollback-criteria: 0 implementation/check-rollback-criteria-1792127253719-3930047.log`, 6/6 pass on the product commit (earlier runs on the same name recorded the pre-product reds).
- `akrogon run-check --name deploy-and-contract -- bun test tests/release-deploy.test.ts tests/command-reference.test.ts tests/config.test.ts` — `check deploy-and-contract: 0 implementation/check-deploy-and-contract-1792127261871-3934796.log`, 44/44 pass.
- `akrogon verify` — green on tree of `d6e7cb7` (receipt matches by tree; the head is a trailer-only amend of verified `ff7a8bb`), 986 tests, typecheck and format, run af234a72-394f-40b1-b48d-22f9336009b7.

## Criterion proofs

1. Flip + print: `rollback flips current…` — exit 0, `rolled back <cur12> -> <prev12>`, `current` → `releases/<prev>`. Green in rollback-criteria log.
2. Hold loop: `the hold blocks redeploy…` — `deploy held: <sha12>` while main is held; `deployed <next12>` and hold file gone after main moves. Green.
3. Manual path: `the README manual steps…` — broken release entry exits non-zero; README's three steps (temp-link rename, hold write, previous release's install) reach the same end-state predicate as criterion 1. Green.
4. No previous: `rollback with no previous release…` — non-zero naming `no previous release`, `current` and hold untouched. Green.
5. Bad config: `rollback with a global config key…` — non-zero, stderr contains the `config.yaml` path and `bogus_key`, no state change. Green.
6. Links: `rollback restores the previous release skill links…` — added skill unlinked, removed skill relinked through `current`; a seeded conflict fails non-zero with the path printed and `current` still on previous; retry completes. Green.

## Test fixes during implement

Two construction fixes folded into the test/feat commits, no expectation changed: `command()` replaces `Bun.$` for `mv -T` (BunShell builtin lacks `-T`); the rejected config key is injected inside the parsed YAML map because `Bun.YAML.stringify` emits flow style. `Test-Change` trailer on `d6e7cb7`.

## Limitations

None beyond the design's exclusions (build, flip and pruning belong to release-deploy; state home to state-home). The rolled-away release keeps its directory and gets its prune stamp at the next deploy pass, per plan D5.

## check.fix F2 (2026-10-16, head `17e9d9d`)

B's repair (`e7076a6` reproduction, `90ee806` fix) handled F1; the only `Handed to A` item was F2.

- `plan.md` gains a dated implementation note for the corrected proof.
- `tests/rollback.test.ts` criterion-3 test rewritten: the previous release is the real tree at `git merge-base origin/main HEAD` built in-test by `buildRelease` into the fixture state home (its own `install`, `writeDeploySuccess`, hold reader and `next`; no `rollback` verb). The manual steps run verbatim on that release including B's new `bun -e` record step, then its own `next --all` prints `deploy held:`. A `ROLLBACK_BREAK_PREV=1` gate removes the predecessor's `install.ts`.
- `tests/deploy-fixture.ts` reverts the stub to the original one-line marker and drops `AKROGON_FIXTURE_ENTRY`; `tests/release-deploy.test.ts` restores the exact byte assertion.
- Commits `333d2f3`, `17e9d9d`, each with `Test-Change` trailers.

Proof: `check fix-F2-red: 1 implementation/check-fix-F2-red-1792127994343-939741.log` — `ROLLBACK_BREAK_PREV=1` fails at the real predecessor install (code 1 vs 0), showing only predecessor modules satisfy the proof. `check fix-F2-green: 0 implementation/check-fix-F2-green-1792127998102-940876.log` — 6/6. `check fix-criteria: 0 implementation/check-fix-criteria-1792128052925-971839.log` — 27/27 across rollback, rollback-record, release-deploy and command-reference.

`akrogon verify` on `17e9d9d` ran red on `tests/self-update.test.ts` 'a record commit landed at the branch write is pending, not dropped' (runs `379403d8`, `60cae9a1`): the child runner resolves `globalHome()` to `<suite home>/.akrogon` — absent `config.yaml` at toolRoot since state-home — and `withLock` flock fails ENOENT on the missing directory; it passes only when a sibling test created `.akrogon` first (green in B's earlier verify `0da29407` and my first run, red in two later ones). The diff touched none of `self-update.ts`, `sync.ts`, `state.ts` or the globalHome branch; one `run-check` retry stayed red (`check self-update-retry: 1`) and a detached `6121559` base worktree reproduced it (`check self-update-repro: 1`).

Repaired at the root rather than handing off: `096aab1` adds `mkdirSync(dirname(path), { recursive: true })` to `withLock` — flock creates the lock file but not its parent, so the first lock against an uncreated state home must not ENOENT. `check self-update-fixed: 0 implementation/check-self-update-fixed-1792128601435-2080177.log` — 14/14 green; `check fix-criteria-2: 0` — 7/7 criterion tests on the new head; `akrogon verify` green on `096aab1` (run `7e7e9be0`, 987 tests, typecheck, format).

## check.fix F3 (2026-10-16, head `afc7f32`)

B's re-check found the F2 repair's predecessor selection (`git merge-base origin/main HEAD`) picks a rollback-containing commit once the leaf lands, breaking the proof and every later verify (`check recheck-B-main-build: 1` reproduces on a post-merge tracking state). Repaired in `afc7f32`: the predecessor is pinned to `6121559`, the newest commit before the rollback work — permanently a real release-deploy tree without the `rollback` verb in both tracking states.

Proof: `check fix-F3-green: 0 implementation/check-fix-F3-green-1792128968375-2680089.log` — B's exact post-merge scenario (clone, `origin/main` = leaf head) green; `check fix-F3-red: 1 implementation/check-fix-F3-red-1792128973290-2682846.log` — `ROLLBACK_BREAK_PREV` still red on the real predecessor install; `check fix-criteria-3: 0` — 27/27; `akrogon verify` green on `afc7f32` (run `6296a9ef`).
