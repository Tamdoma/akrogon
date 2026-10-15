# Review B: log-reader

Date: 2026-10-15. Phase: check.review. Verdict: **fix**.

Base: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`.
Reviewed head: `584b869a514e55e88c7cc91eb575dfbcbc9ba6b0`.
Initial blind review. Debate is off, so no positions/rebuttal artifacts are expected. No peer review was read. No code or tests changed during review.

## Fixes

### F1: An existing owner without an archive breaks flaky's missing-log contract

`src/evidence.ts:69-78` selects the first existing owner directory and unconditionally calls `readMember`, even when `evidence.tar.zst` does not exist. The resulting ENOENT becomes `LogError('archive')`, which `src/flaky.ts:15-17` rethrows.

Source and consequence: a completed red-then-green verify pair whose recorded red log is gone, while its issue folder still exists without an archive. This is the missing-evidence scenario explicitly covered by brief criterion 4 and design item 6. `flakyLines` aborts with `unreadable archive` instead of reporting `(log gone)`. Other issue records or sibling leaves can keep that owner directory present. The existing gone test removes the owner from the scenario and therefore misses this failure.

Reproduction: the `review-B-contracts` probe creates a real fixture leaf, leaves both its recorded log and owner archive absent, then passes completed same-tree red/green runs to the exported flaky boundary. Output: `flaky with neither plain nor archive: archive unreadable archive: .../issues/open/issue/evidence.tar.zst`. The probe exits 0 because it records the thrown result for review. Criterion 4 requires `(log gone)` here. Classify absence of both plain log and archive as `nomatch`; preserve errors for an existing broken archive or missing member. Add a regression for the existing-owner case.

### F2: Relative paths lose cwd when no registered checkout root matches

`src/evidence.ts:31-36` computes `absolute`, but initializes the boundary-search input to `recorded`. It replaces that value only when a known checkout root matches. For a relative input outside those roots, boundary search therefore ignores cwd entirely.

Source and consequence: run `akrogon log check-test.log` from the `issues/open/issue/leaf` directory of a checkout not in the registered repo's current worktree list. The registered repo still has that recorded log. This is the design's supported unknown-checkout boundary-cut path, combined with criterion 1's cwd-relative input. The absolute spelling succeeds, but the identical path written relative to cwd exits nonzero with `nomatch`.

Reproduction: `review-B-contracts` writes `recorded output` in the registered fixture repo, creates an outside `retired/issues/open/issue/leaf` cwd, and invokes the real CLI from that cwd. The absolute old-checkout argument exits 0 with `recorded output`; `check-test.log` exits 1 with `no log for recorded path: check-test.log`. Use the resolved absolute path for the boundary cut when no known root matches, as plan D2 and the design's resolution rules require. Add a regression comparing both spellings from that cwd.

## Evidence

All paths below are under `/home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/`. Cited logs were read back with this branch's `bun src/akrogon.ts log <path>`: the installed `akrogon` still points at main and has no `log` verb yet.

- `check review-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-review-B-context-1792098739467-865391.log` records the clean worktree, reviewed head, diff and commit trailers.
- `check review-B-contracts: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-review-B-contracts-1792098786502-1032807.log` records both failing outcomes above. It ran `bun -e` over existing fixture/CLI helpers, `readRepo`, and `flakyLines`, with temporary fixtures cleaned in `finally`. Dependency setup had already completed under the configured install lock before the probe.
- `check review-B-doc-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-review-B-doc-paths-1792098762157-961356.log` lists the paths named in both changed AREA files from the repo root. All listed paths exist. Read README command behavior, the reference index, and the unchanged `docs/guide/files.md` flaky section. The reader instructions and README row correctly describe the intended behavior. No further documentation defect found.
- `check review-B-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-review-B-receipt-1792098786599-1033159.log` records verify receipt `a659eb30-6cc7-4f63-a0de-21fe54999199`, with setup/format/test/typecheck all 0 on `8d0364b39275703726e65b30898816b4530fc19d`. `git diff --name-only 8d0364b..HEAD` is empty, so no proof inputs changed afterward.
- Implementation's planned criterion suites ran through `akrogon run-check --name log-reader -- sh -c 'bun test tests/log-reader.test.ts tests/flaky.test.ts tests/command-reference.test.ts'`: 12 pass, 0 fail, in `check-log-reader-1792098581241-4127210.log`. This executes all planned criterion tests together. No planned test or runner was skipped, filtered away or disabled by the implementation. The tests do not exercise F1/F2.
- Required verify logs read back: `check-format-1792098586542-4150815.log` reports clean formatting; `check-test-1792098693222-4150815.log` reports 855 pass, 0 fail; `check-typecheck-1792098696179-4150815.log` records `tsc --noEmit`. The green receipt supplies each exit status. No full-suite rerun was needed for this unchanged tree.

## Test-Change trailers

Reviewed every trailer in `0a80ab91e9388e60ce148f500fa92eb9859e1aeb..HEAD` against its source and the path rule in `src/test-files.ts`:

- `d5aef0a`, `tests/flaky.test.ts`: `plan.md C4: flakyLines takes the repo and reads through the log resolver; the existing case is awaited and its log moves under issues/open, a packed/gone/broken case is added.` Valid API adaptation and new criterion proof. Existing flip expectations remain.
- `d5aef0a`, `tests/command-reference.test.ts`: `plan.md C5: akrogon log <path> verb added; contracts gains its row.` Valid command contract change.
- `b5dcb18`, `tests/log-reader.test.ts`: `plan.md brief done-criteria: recorded paths are issues/<state>/<issue>/<leaf>/... per real verify-runs.jsonl entries; planned args assumed the leaf sat directly under the state folder, so owners and members resolve under the correct owner now.` Valid fixture/path correction, supported by the report's mismatch evidence, the existing leaf helper and real receipt paths.
- `b5dcb18`, `tests/flaky.test.ts`: `plan.md brief done-criteria: same layout correction for the red log paths and owner-archive members; no existing expectation changed.` Same supported correction.
- `1ae47f5`, `tests/log-reader.test.ts`: `u2 worker evidence in implementation/u2-evidence.log: fakeAkrogon symlinkSync throws EEXIST on the second logRun of a fixture; cache the shim env per fixture, no expectation changed.` Valid harness correction. The cited worker output shows the second-call EEXIST, and the final green run follows this correction.
- `584b869`, `tests/AREA.md`: `plan.md docs list: adds one Key-files line for the new tests/log-reader.test.ts; area doc update required by the plan, no test logic changed.` Valid citation for the earlier AREA addition. This final commit changes no tree content.

The planned red proofs precede implementation. Final green evidence follows all test/helper changes. No removed lesson lines, operator actions, or deferred Nits.

## check.repair — 2026-10-15

Repair base: `584b869a514e55e88c7cc91eb575dfbcbc9ba6b0`. Repaired head: `fa0f4c2`.

Read both initial reviews. A's F1 is the same defect as B's F1; B's F2 is the remaining independent Fix. Both are repaired without changing existing test expectations or any locked decision. No live actions or operator access are required.

- F1: reproduction test commit `d4e4af4`, fix commit `ae22366`. `readLog` now reports `nomatch` when the first existing owner has no archive after the plain-file search fails. `readMember` still errors for a present broken archive or missing member. The regression deletes a recorded log while retaining the real fixture leaf, verifies flaky's `(log gone)` result, and checks that CLI failure names the original missing path.
- F2: reproduction test commit `365dcd3`, fix commit `fa0f4c2`. `locate` uses the resolved absolute input for boundary lookup outside known roots. The regression invokes the real CLI with absolute and cwd-relative spellings from an unlisted checkout directory and compares the raw output bytes.

Each reproduction was run red before its product fix. Test commits carry `Test-Change` trailers citing the finding, source and criterion. Existing assertions remain unchanged. All fixture resources are local and cleaned in `finally` through the existing helpers. No temporary scripts were created.

### Repair evidence

The commands below ran from the leaf worktree. The configured dependency setup ran first under `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`. Each cited log was read back through this branch's `bun src/akrogon.ts log <path>`.

- `bun test tests/flaky.test.ts -t 'flaky reports a deleted log'`: `check repair-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-F1-red-1792098892320-1662254.log` on the reviewed product head, then `check repair-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-F1-green-1792098898771-1696337.log` with the fix. Before: absent archive throws. After: 1 pass, including the CLI missing-path assertion.
- `bun test tests/log-reader.test.ts -t 'log resolves cwd-relative paths'`: `check repair-F2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-F2-red-1792098910530-1757640.log` before the F2 fix, then `check repair-F2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-F2-green-1792098910822-1759238.log` with it. Before: absolute succeeds, relative exits 1. After: both return exact fixture bytes.
- All criterion proofs rerun because the shared resolver changed: `akrogon run-check --name repair-criteria -- bun test tests/log-reader.test.ts tests/flaky.test.ts tests/command-reference.test.ts`. `check repair-criteria: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-criteria-1792098914031-1775392.log`: 14 pass, 0 fail on committed `fa0f4c2`, including the planned C1–C5 tests B did not write. Existing corrupt-archive and missing-member proofs stay green.
- `check repair-B-final-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-B-final-diff-1792098926275-1863428.log` records a clean worktree, clean `git diff --check 584b869..HEAD`, and only the two resolver fixes and their regression tests.

No Fix handed to A. No open operator actions or deferred Nits.

### Final verification

`akrogon verify` completed green on `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07`, receipt `27fb8ada-2caf-4978-a584-02dfcc9eed1e`: setup 0, format 0, test 0 (857 pass, 0 fail), typecheck 0. No merge checks were run. Logs, read back through the branch log command:

- Format: `implementation/check-format-1792098916759-1780513.log`.
- Test: `implementation/check-test-1792099207546-1780513.log`.
- Typecheck: `implementation/check-typecheck-1792099209939-1780513.log`.

`check repair-B-verified-head: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-repair-B-verified-head-1792099214809-3587993.log` confirms the receipt, unchanged committed head and clean worktree. Both initial reviews' Fixes are resolved. Ready for merge.

## merge — 2026-10-15

Attempt: `802cf470-6ff3-471c-885a-2e04d72a9a7a`. Applied top: `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07`, base `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`, no members. No fetch, rebase or code changes were needed.

`check merge-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-merge-B-context-1792099237972-3718729.log` confirms the clean worktree, exact prompted head, active batch and documented merge contract. Read back through the branch log command.

`akrogon verify --attempt 802cf470-6ff3-471c-885a-2e04d72a9a7a` returned `reuse receipt 27fb8ada-2caf-4978-a584-02dfcc9eed1e tree=528b41eaaa0f272692cb33990f038e167d761702`. This is the unchanged tree verified above: format and typecheck green, 857 tests passed. Config has no merge-only checks or advisory commands.

`akrogon phase log-reader merged --slot B --check --attempt 802cf470-6ff3-471c-885a-2e04d72a9a7a` returned `ok`, approving the receipt, tested top and test-change trailers.

Gathered the containing check-evidence issue and all four leaf briefs before landing. `check merge-completion-briefs: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/log-reader/implementation/check-merge-completion-briefs-1792099243285-3740816.log` records their locations; read back through the branch log command. No operator actions or unresolved findings.

Landing returned `moved merged` (exit 0). No `issue complete` or `epic complete` line was printed, so no broadcast is due. The command also reported: `checkout pending: error: Entry 'README.md' not uptodate. Cannot merge.; 13 behind origin/main; commit or finish the overlapping edit`. The remote push and leaf merge completed; the registered checkout update remains pending because of an overlapping local README edit. That unrelated edit was left intact.
