# Review B: fixture-repo-identity

Date: 2026-11-09. Phase: check.review. Verdict: **fix**.

Base: `8647fc24247a6841c9fa85dcc1b05be484a0afb6`.
Reviewed head: `432eeba2f8782b833a4a7442c4e82dde23aa8ab9`.
Reviewed tree: `4c26bd17d0784ca11eab2685c608bb1898231c5c`.
Worktree was clean. No code edits or commits made during review. Initial review was blind.

## Fixes

### F1: Generated prefixes collide in configs containing multiple repos

`tests/helpers.ts:34` maps the fixture home into only 676 prefixes. That is safe only while every config holds one fixture. The changed `otherRepo()` in `tests/next.test.ts:108-118` combines `f.prefix` and `g.prefix` in one config. Real tests then dispatch both repos, including “machine-wide capacity includes another registered repo and folder selection respects it” at line 605 and “foreign leaves do not consume capacity while healthy leaves in both repos dispatch” at line 1230. `src/seat.ts:218` calls `repoPrefix()`, and `src/config.ts:230-233` rejects equal prefixes even though the repo names differ. `tests/session-routing.test.ts:126` also combines the generated prefix with the fixed prefix `sc`, and `tests/pause-next.test.ts:139` combines it with `yp`.

**Consequence today:** these changed tests can fail randomly under the configured suite. Repo identity isolation removes the shared slice but introduces another source of intermittent test failures. This violates done-criterion 2 and the existing healthy multi-repo dispatch contract. Plan D2's claim that a two-letter collision is harmless overlooks the shared configs in the suite.

**Representative real output:** the review created ordinary `fixture()` homes without overriding their names, hashes or prefixes. After 51 fixtures, `akrogon-80Vol2` and `akrogon-ttyMGU` both had prefix `xi`. Registering that pair together, as `otherRepo()` does, made the real `init` command exit 1:

```text
error: prefixes: repos akrogon-80Vol2 and akrogon-ttyMGU both hold prefix xi
at repoPrefix (.../src/config.ts:233:38)
at initialize (.../src/init.ts:56:58)
```

Evidence: `check review-B-prefix-collision: 1 implementation/check-review-B-prefix-collision-1794219058173-777268.log`. Read back with `akrogon log`. The reproduction's final exception reports the observed CLI failure. All generated fixtures were removed in `finally`. This red is caused by the leaf's new derivation and consumers, so the unrelated-red retry/known-red route does not apply.

**Required result:** every config used for healthy dispatch must have distinct schema-valid prefixes, including configs combining fixture identities and fixed secondary names. Keep fixture-derived repo names and the tests-only scope. Show a deterministic failing reproduction before the repair and passing results after, then rerun the planned proofs whose inputs changed. Reconcile plan D2 if the chosen repair changes its derivation decision.

## Verification and acceptance audit

- Criterion 1: read the synchronized two-core/FIFO proof and its base red and final green logs. The base run fails on the duplicate slice assertion after teardown. The repaired run also checks the survivor's real cgroup and its completed plan/implement delivery. The latest test change was `f0086672`; the latest helper change was `a49cc3cb`, both before the final green proof. Evidence: `check fixture-repo-identity-red2: 1 implementation/check-fixture-repo-identity-red2-1794217294718-1765716.log` and `check fixture-repo-identity-green: 0 implementation/check-fixture-repo-identity-green-1794218934841-628635.log`, both read through `akrogon log`.
- Criterion 2: receipt `65fd9530-6b0a-4eba-9946-0c08447bb6ab` records the exact planned/configured command, `bun test --timeout=30000 --parallel=4 --no-isolate`, with 1145 pass and 0 fail. The receipt's head `8141f505572ed40bc7dbadc76c3811fdc611e1ef` and reviewed head have the identical tree above. The later commit adds trailer provenance only. Evidence: `check test: 0 implementation/check-test-1794218925024-290614.log`, read through `akrogon log`. This successful run does not remove F1's demonstrated intermittent failure.
- Required checks: the same receipt records `check format: 0 implementation/check-format-1794218840175-290614.log` and `check typecheck: 0 implementation/check-typecheck-1794218843268-290614.log`, both read through `akrogon log`. No checks, test selection, runner settings or timeouts changed. No proof-command correction was recorded or needed.
- Scope: all 59 changed paths are under `tests/`. Product code is unchanged. The literal sweep leaves pure schema inputs, deliberately foreign ownership, product-name deploy fixtures and fake-only repo names. The host slice consumers use fixture repo names. No lesson-list changes were part of the diff.
- Grants: `readiness.yaml` has no grants or retained resources. Review launched no paid operation or external live mutation. The additional reproduction used temporary local test fixtures and the CLI's normal duplicate-prefix refusal.

## Documentation and AREA paths

Opened `tests/AREA.md`, the unchanged `docs/reference-index.md` and `docs/reference/where-things-go.md`. No documented product behavior changed. The changed fixture description matches the new repo-name contract.

One repository-root command listed the paths named by `tests/AREA.md`: `check review-B-area-paths: 0 implementation/check-review-B-area-paths-1794219000426-707700.log`, read back with `akrogon log`. The named source/test/doc paths exist. `issues/config.yaml` is absent in the worktree because configuration lives in the registered checkout, where `akrogon config` read it successfully. This pre-existing pointer is not a new dead-path defect. The hcFixture paragraph still mentions prefix `rp`; it is stale descriptive text, with no demonstrated current behavioral consequence.

## Test-Change source judgments

Applied the changed-file rule in `src/test-files.ts`, which includes every path under `tests/`, including helpers and AREA.md. The complete trailer list follows. Judged the identity substitutions as a batch against the brief's fixture-consumer requirement, rather than requiring the old literal expectations to remain.

- `f0086672`, `27201bcc`, `70885127`, `7b2b20a7`, `cda08ab6`, `beca42dc`, `51ab0212`: the brief and plan D1/D3/D4/D6 require the identity substitutions and corresponding expected values. F1 challenges the combined-prefix behavior in `f0086672`/`7b2b20a7`, not the replacement of obsolete repo literals. The unchanged `state-home` trailer in `beca42dc` describes an audit, not a removed assertion.
- `66a9c95c`: the product's deploy/install/rollback paths require the literal product repo name `akrogon`. Restoring that name and dropping the new optional key from old-release fixture config preserves the deployed-release scenario. The earlier intermediate substitutions in `70885127` are superseded.
- `eadcc9e8`: formatting only. Assertions remain.
- `a49cc3cb`: `src/init.ts` derives registration from `basename(root)`, supporting the helper root rename. With prefixes now registered, recovery reaches real allocation, supporting the added commit and receipt setup in abandoned-capture. Existing refusal assertions remain.
- `87dc7883`: the renamed root makes the old shim path invalid. Reading `f.root` preserves the original pause-at-unlock assertion.
- `8141f505`: read the real configured-suite failure log `implementation/check-test-1794218780439-3964732.log` through `akrogon log`. It shows the pi transcript directory `ENOENT` and `hc wait` returning 3 for removed helper terminals. Those real outputs support creating the fixture directory and accepting 3 while retaining the gone/finished terminal assertion. The final configured suite ran after these changes.
- `432eeba2`: supplies AREA.md provenance for the earlier contract update. The batch contains its source and reason. It changes no tree content.

No operator action is required. No other blocking finding is held.

## Test-Change trailers in base..HEAD

### a379013b

New proof test only. No existing test changed in this commit.

### f0086672

```text
Test-Change: tests/helpers.ts fixture() registers repo/prefix derived from home; leaf/storeDir/seedRun/verified read f.repo
Test-Change: tests/hc-fixture.ts hcCore discovery doc defaults to f.repo; hcFixture drops its setPrefixes
Test-Change: tests/fixture-repo-identity.test.ts proof test updated to read identity from config
Test-Change: tests/install.test.ts leafTempRoot call-site stub gains repo/prefix fields
Test-Change: tests/self-update.test.ts leafTempRoot call-site stub gains repo/prefix fields
```

### 27201bcc

```text
Test-Change: tests/hc-delivery.test.ts setPrefixes calls dropped; slice stops name f.repo
Test-Change: tests/hc-identity.test.ts setup defaults prefixes to f.repo/f.prefix; seat name, leafSlice, repos and leaf-state read the fixture identity
Test-Change: tests/hc-start.test.ts setPrefixes dropped; seat names, akrogon.repo label, slice and slug hash derive from f.repo/f.prefix
Test-Change: tests/hc-teardown.test.ts setPrefixes dropped; slice stop and restart name use f.repo/f.prefix
Test-Change: tests/hc-window-calls.test.ts setPrefixes dropped; slice stop names f.repo
Test-Change: tests/leaf-slices.test.ts repos/prefixes keys, stored repo, leafSlice names, run records and kept report name the fixture identities
Test-Change: tests/green-merge.test.ts timing record, leafSlice and stopped.yaml key read f.repo
Test-Change: tests/store-sweep-safety.test.ts readRepo args, leafSlice and report filename read f.repo
Test-Change: tests/run-units.test.ts seeded run records and expectedSlice calls read f.repo
Test-Change: tests/run-check.test.ts readRepo arg reads f.repo
```

### 70885127

```text
Test-Change: tests/hc-status.test.ts setPrefixes dropped; fixture already registers f.repo -> f.prefix
Test-Change: tests/hc-observe.test.ts seatLabels takes the fixture and labels akrogon.repo=f.repo; shallow leaf stores f.repo
Test-Change: tests/session-routing.test.ts setPrefixes re-keyed to f.repo/f.prefix, repos write keyed f.repo, seat-name and notice-title assertions interpolate f.repo/f.prefix
Test-Change: tests/door-exchange.test.ts setPrefixes dropped; rp-door-* names and rp-slot-* lookup interpolate f.prefix
Test-Change: tests/door-reset.test.ts setPrefixes dropped; door terminal name interpolates f.prefix
Test-Change: tests/leaf-stop.test.ts stopped-keys assertions interpolate f.repo; closed leaf stores f.repo
Test-Change: tests/state-inventory.test.ts config/repo assertion, bad-leaf repo field and reconcile report path read f.repo
Test-Change: tests/deploy-fixture.ts repos key becomes f.repo
Test-Change: tests/release-deploy.test.ts global.repos read keyed d.f.repo
```

### 7b2b20a7

```text
Test-Change: tests/next.test.ts otherRepo keys on g.repo/g.prefix; repos/seatName/notice/leaves read f.repo, foreign names stay
Test-Change: tests/phase.test.ts noticeId and notice titles read f.repo; registered-key assertion names f.repo
Test-Change: tests/config.test.ts repos/prefixes keys, readRepo name and repo assertions read f.repo/g.repo
Test-Change: tests/pull.test.ts repos keys and pull output assertions read f.repo
Test-Change: tests/init.test.ts repos toMatchObject key reads f.repo
Test-Change: tests/reconcile.test.ts kept/removed reports, verify-run records and readRepo read f.repo
Test-Change: tests/pause-next.test.ts paused.yaml keys, prefixes and repo label read f.repo
Test-Change: tests/pause.test.ts paused.yaml keys and pause output read f.repo
Test-Change: tests/pause-status.test.ts status heading lookups read f.repo
Test-Change: tests/solo-turns.test.ts attempt/timing records and readRepo read f.repo
Test-Change: tests/release-any-phase.test.ts readRepo, kept report, stopped keys and run record read f.repo
```

### 66a9c95c

```text
Test-Change: tests/deploy-fixture.ts repos key restored to akrogon (deployStage/install/rollback gate on it); prefixes removed so an installed previous release's strict global schema still parses
Test-Change: tests/release-deploy.test.ts global.repos['akrogon'] read restored
```

### cda08ab6

```text
Test-Change: tests/status-fixture.ts event/mergeRecord/prompt/needs take the fixture and write f.repo; seedRunRecord uses f.repo
Test-Change: tests/status.test.ts repos keys, Missing/holder/unreadable/repo names and reconcile/<repo>.json paths use f.repo
Test-Change: tests/status-json.test.ts repos keys, leafOf/repoOf names, stopped/paused keys, merges and watch order use f.repo
Test-Change: tests/timing.test.ts holder and repo_pause repo assertions use f.repo
Test-Change: tests/timing-report.test.ts move/event/visitStart/prompt/member take the fixture and write f.repo; carrier uses f.repo
Test-Change: tests/merge-attempts.test.ts readRepo names, seeded attempt lines, line.repo and mergePassBody's readRepo use f.repo
Test-Change: tests/log-reader.test.ts ambiguous-repo assertion uses f.repo
```

### beca42dc

```text
Test-Change: tests/batch.test.ts readRepo calls and spawned driver use f.repo; baseState stays a pure schema input
Test-Change: tests/batch-merge.test.ts readRepo calls use f.repo
Test-Change: tests/batch-dispatch.test.ts commitMove readRepo and merged-notice title use f.repo
Test-Change: tests/state.test.ts fixture-written state.yaml repo fields and Repo names use f.repo; canonical stays a pure schema input
Test-Change: tests/state-home.test.ts unchanged; no fixture() identity literals (self-built repos only)
Test-Change: tests/worktree-store.test.ts spawned build script's readRepo uses f.repo
Test-Change: tests/readiness.test.ts repos key, holderRoot call and gap holders use f.repo; complete stays a pure schema input
Test-Change: tests/receipt-gates.test.ts readRepo and direct-guards repo key use f.repo
Test-Change: tests/verify.test.ts readRepo calls, repo field assertion and main-red notice ids/titles use f.repo
```

### 51ab0212

```text
Test-Change: tests/flaky.test.ts readRepo(f.repo) and the seeded VerifyRun repo field
Test-Change: tests/keep-rule.test.ts reconcile/<f.repo>.json and the seeded VerifyRun repo field
Test-Change: tests/hold-retired.test.ts merge-attempts record repo field
Test-Change: tests/retired-debate.test.ts state.yaml, log, timings and readRepo names read f.repo
Test-Change: tests/slow-merge.test.ts notice titles, notice id, repos key and Slow merge line read f.repo
Test-Change: tests/run-permit.test.ts waiting-for holder regexes and the repos key read f.repo
Test-Change: tests/direct-guards.test.ts the direct-guards repo key is f.repo
Test-Change: tests/chart-shapes.test.ts the example readiness holder 'repo' maps to f.repo
```

### eadcc9e8

```text
Test-Change: tests/chart-shapes.test.ts formatting only
Test-Change: tests/door-exchange.test.ts formatting only
Test-Change: tests/flaky.test.ts formatting only
Test-Change: tests/hc-start.test.ts formatting only
Test-Change: tests/merge-attempts.test.ts formatting only
Test-Change: tests/phase.test.ts formatting only
Test-Change: tests/state.test.ts formatting only
Test-Change: tests/status-json.test.ts formatting only
Test-Change: tests/timing-report.test.ts formatting only
```

### a49cc3cb

```text
Test-Change: tests/helpers.ts <fixture root named for the registered identity so init stays idempotent; closes the close-pack regression>
Test-Change: tests/abandoned-capture.test.ts <recovered leaf now holds a worktree; commit and verify before the check gate>
```

### 87dc7883

```text
Test-Change: tests/timing.test.ts <fixture repo dir renamed; shim resolves timings.jsonl from f.root>
```

### 8141f505

```text
Test-Change: tests/door-reset.test.ts <suite races: wait exit 3 on an exited --rm terminal, and the pi folder is created before the fixture writes>
```

### 432eeba2

```text
Test-Change: tests/AREA.md <fixture contract updated to name per-fixture repo identity; part of the sweep>
```

## check.repair — 2026-11-09

Repair starts from reviewed head `432eeba2f8782b833a4a7442c4e82dde23aa8ab9`. Read both reviews. Review-A F2 and review-B F1 are the same prefix-collision defect.

- Review-A F1 repaired in `e4d63b93`: AREA.md now says `hcFixture` uses the registered `f.prefix`, and the helper's matching comment was corrected. Before: “adds prefix `rp`”. After: “uses the fixture's registered `f.prefix`”. Evidence: `check repair-B-doc-fix: 0 implementation/check-repair-B-doc-fix-1794219584770-1420054.log`, read back with `akrogon log`.
- Review-A F2 / review-B F1: reproduction committed as `7b5d0f8d`, repair committed as `50d925f2`. `fixtureRepo(home, occupiedPrefix)` preserves D2's hash mapping unless it equals the other repo's prefix, in which case it advances the first letter modulo 26. One occupied prefix is sufficient for every current shared config. `fixture`, `hcFixture`, `otherRepo`, and the linked-slice setup carry this choice into the fixture's registered config and its returned fields. The session-routing and pause-next setups reserve their existing `sc` and `yp` prefixes. Existing assertions and expectations were unchanged. No global allocator, retry, new dependency or product change was added.

The supplying-side search covered every `setPrefixes`/`prefixes` use under tests. It found the two generated-fixture pairs (`next` and `leaf-slices`) and the two fixed-secondary pairs (`session-routing` and `pause-next`), all repaired. `hc-identity` intentionally tests duplicate-prefix refusal, `config` tests invalid shapes, and e2e uses its own product-name fixtures. Those remain unchanged.

One implementation-note line was appended to plan.md, citing brief done-criterion 2 and the design's prefix-schema requirement. The default hash derivation is preserved. No brief or design decision changed, and no finding requires handoff to A or an operator action.

### Reproduction and proof evidence

The regression test's two home strings are recorded output from real temporary home creation, preserved in `check repair-B-collision-inputs: 0 implementation/check-repair-B-collision-inputs-1794219560617-1391296.log`, read back with `akrogon log`. Both originally map to `sz`. The test calls the existing pure derivation, with the first prefix reserved for the second home. It is the one reproduction test added for this bug. Exporting the existing derivation only exposes that logic for this small check.

- Fail-before on the unrepaired derivation: `check repair-B-prefix-red: 1 implementation/check-repair-B-prefix-red-1794219600418-1437861.log`. The test was then committed before the repair. When the API was reduced from an occupied-prefix list to the one occupied prefix current callers need, the final test input was also rerun against the pre-fix helper: `check repair-B-prefix-red-current: 1 implementation/check-repair-B-prefix-red-current-1794219676720-1527316.log`. It fails the distinct-prefix assertion with `Expected: not "sz"`. The temporary helper copy was restored and deleted by the command's EXIT trap.
- Pass-after on committed repair `50d925f2`: `check repair-B-prefix-final: 0 implementation/check-repair-B-prefix-final-1794219711861-1558748.log`, one test passing. The current red and final green logs were read back with `akrogon log`.
- Planned criterion 1 proof, written by A, rerun unchanged after the helper changes on committed repair `50d925f2`: `akrogon run-check --name fixture-repo-identity -- bun test tests/fixture-repo-identity.test.ts --timeout=30000`. Result: `check fixture-repo-identity: 0 implementation/check-fixture-repo-identity-1794219712169-1557362.log`, one test passing with 11 assertions. Read back with `akrogon log`. Dependency setup ran under the configured install lock first.

Merge preparation ran `akrogon verify` on committed repair `50d925f2d952fcfca06db529b49b9cfe21efe22c`, receipt `eba37bdb-f6de-4608-aa25-03b729a84601`. The exact configured `bun test --timeout=30000 --parallel=4 --no-isolate` command passed with 1146 tests, 0 failures, across 81 files. `verify test: 0 implementation/check-test-1794219830874-1605411.log`. Formatting and typecheck also passed: `verify format: 0 implementation/check-format-1794219767858-1605411.log` and `verify typecheck: 0 implementation/check-typecheck-1794219770452-1605411.log`. All three logs were read back through `akrogon log`. This is current proof for criterion 2 after every test/helper change. No merge_checks command was launched.

There are no open Fixes or operator actions and no additional reusable Nit held by B. A's N1–N4 remain deferred concerns under their recorded promotion conditions. Worktree is clean. The repair is ready for the merge phase.

