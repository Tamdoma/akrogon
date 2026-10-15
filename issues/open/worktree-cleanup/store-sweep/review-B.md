# Review B: store-sweep

Date: 2026-10-16. Phase: check.review. Verdict: fix.
Base: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307.
Reviewed head: 0ab2552078bbafb7cf9bb4c7a2cc2c52706d6625.
Initial blind review. No peer review read. Debate is disabled, so positions-B.md and rebuttal-B.md do not exist. No code changes or commits.

## Evidence

- `check review-b-diff: 0 implementation/check-review-b-diff-1792104775935-3266460.log` records the product diff.
- `check review-b-scenarios: 0 implementation/check-review-b-scenarios-1792104813815-3288649.log` records the probe source and observed outcomes. Exit zero means the observation script completed, not that the criteria passed.
- `check review-b-running: 0 implementation/check-review-b-running-1792104833543-3298663.log` repeats those observations and adds the finished/live-tab case. Read back with `akrogon log` using the absolute leaf-prefixed path. All probes use disposable existing fixtures, isolate HOME and both temp roots, and clean fixtures and explicitly owned child PIDs.
- `check review-b-proof-context: 0 implementation/check-review-b-proof-context-1792104791992-3278207.log` includes the single-command listing of paths named by changed `src/AREA.md`. Every listed path exists. Read back with `akrogon log`.
- Current-head verify receipt `a8a108d8-7b22-45c8-8ff3-488400136bb8` records format, test and typecheck exit 0. Read back absolute leaf log paths for `check-format-1792104627059-2857863.log`, `check-test-1792104739702-2857863.log`, and `check-typecheck-1792104741739-2857863.log`. Test log: 901 pass, 0 fail. No checks rerun because current evidence exists and code was unchanged.
- Implementation's combined sweep-tests command covers the planned files. It does not demonstrate that each planned filtered command was replayed. In particular the planned C6 filter `vetoes` matches no current test title. Current full-suite evidence covers the actual process/pane test, but misses the failures below. The busy-slice case keeps a live tab during its only occupied assertion, so the tab guard masks the slice guard. C1 checks dangling symlinks with existsSync, which cannot detect their survival.

## Fixes

### F1. Dangling symlinks are skipped and hidden

`src/reconcile.ts:624` skips a candidate when existsSync returns false, which is exactly what it returns for a dangling symlink. Host leaf-temp enumeration similarly skips statSync-undefined entries at line 987. Report pruning and leftovers existence checks also hide these surviving links.

Source/outcome: criterion 1 explicitly requires deletion of dangling symlinks in both store and legacy root. Probe `dangling` creates that exact candidate and runs reconcile on a zero-leaf fixture. lstatSync reports it still present and reconcile returns empty removed/kept arrays. This fails criterion 1 today. Use entry-aware existence checks through enumeration, pruning and display. Correct the planned symlink assertion to detect the directory entry itself, with this criterion as its source.

### F2. Leaf-owned deletion bypasses the process veto

`src/reconcile.ts:693-708` drops a finished leaf's unregistered `<slug>-*` entry after pane checks without checking pidsInside. The leaf-temp removal at lines 782-805 also calls drop without that veto. The common drop helper validates deletion results but has no safety checks.

Source/outcome: criterion 6 explicitly requires retaining any candidate containing a same-user process cwd/open file, including processes outside the leaf slice. Probe `leaf-process` runs a real sleep process with cwd inside `done-old` for a merged leaf with no tab. Reconcile deletes that directory while the child remains live, reporting it removed with no keep. This fails criterion 6 and plan D5. Route these deletions through the common safety decision while retaining the explicit dead-owner-run exception.

### F3. Parent cleanup ignores live descendant owner records

`src/reconcile.ts:949-950,973-989` recursively deletes retired/unregistered host temp parents without inspecting descendant run or batch owner records. Pane/process location is not proof that an owner record is dead.

Source/outcome: criterion 4 says a live-owner run stays in every case, including when its enclosing folder would otherwise go. Probe `host-owner` seeds an unregistered-repo temp parent with a run whose owner is the live probe process, located outside that tree. reconcileHost deletes the parent and live run. This directly fails criterion 4. Apply owner protection before every recursive parent deletion, including the retired root and store parents.

### F4. Repository activity is inferred from phase instead of live tabs/slices

`src/reconcile.ts:581` defines repoRunning as any unfinished leaf. Plan D3 and the design define it as a live tab or slice with a running unit, across all leaf records.

Source/outcome: criterion 3 protects unowned entries while any leaf runs, including a merged seat finishing its final turn. Probe `finished-tab` supplies a merged leaf with its recorded live working pane outside the candidate. Its unowned store directory is deleted. Conversely `idle-leaf` has a queued plan.synthesis record with no tab or slice, and its junk is kept indefinitely, contradicting criterion 1's no-running-leaf outcome. Compute activity from the agreed tab/slice evidence, including finished records.

### F5. Dead-pid temporary files bypass unavailable-pane protection

`src/reconcile.ts:725-729` calls drop directly for `<file>.<pid>.tmp`, bypassing the unavailable pane and process checks.

Source/outcome: criterion 6 permits only dead-owner run dirs to be deleted when pane inventory is unavailable. Probe `unavailable-tmp` passes live=null with an unregistered writer.4194303.tmp in the store. Reconcile deletes it and reports it removed. The exception applies to run dirs, not atomic-write files. Require the shared vetoes after proving the writer dead.

### F6. Most newly kept candidates omit what clears them

`src/reconcile.ts` passes no clears value for new pane/process keeps (e.g. lines 590,594,599,701,705,928,932,937), unmanaged worktrees, invalid owner records and delete failures. Making the field optional for backward compatibility does not fulfill the new-write contract.

Source/outcome: criterion 8 explicitly requires each kept item to carry its reason and what clears it in the report. A real pane-in-use or process-in-use candidate generates only path/reason at these branches. The existing report tests parse a schema that strips clears and never assert it, so they cannot catch this missing required outcome. Populate actionable clearing conditions for new keeps and prove the report contract at the reconcile boundary.

### F7. The test suite can delete the user's real retired root

`tests/isolation.ts` and `tests/helpers.ts` isolate HOME and AKROGON_LEAF_TEMP_ROOT but never set AKROGON_RETIRED_TEMP_ROOT by default. Most reconcile/next tests therefore exercise `src/reconcile.ts:949-950` against real `/tmp/akr-<uid>`. Only the dedicated host test overrides it.

Real source: `bun test` through the required verify command. implementation/report.md explicitly records that U1's test runs deleted the real `/tmp/akr-1000`. This is confirmed by the fixture environment and retiredLeafTempRoot's default, not a hypothetical input. It violates the binding design's retired-root override requirement that tests never touch the real root and its isolated-fixture contract. Set the override in the shared isolation/CLI environment and cover subprocess fixtures. Do not treat deleting the user's real files during tests as expected behavior.

## Test-Change trailers

All trailers in base..HEAD, in log order:

```text
Test-Change: tests/reconcile.test.ts formatting only, no expectation changes.
Test-Change: tests/run-permit.test.ts run.lock pattern gains a reconcile.ts exemption citing the design's retired-lock line; every other pattern and file still scanned.
Test-Change: tests/reconcile.test.ts expected-sweep surface unchanged — repoTempDir helper computes the repo-hash dir under leafTempRoot(f); lost-leaf seeds a dead tab so 'next --all' exits 0 (src/next.ts:786 guard).
Test-Change: tests/leaf-slices.test.ts busy-temp resolves its temp under leafTempRoot(f) with leafTemp's own hashing; expectations unchanged.
Test-Change: tests/reconcile.test.ts brief criteria 1,3-7,9,10: new unowned/leaf-owned/veto/report cases; 'unknown directory', 'sweeps unused registered variants' and pane-inventory expectations updated to the brief's keep rules.
Test-Change: tests/leaf-slices.test.ts brief criterion 2 and the slice-holds-temp rule: new host-step and finished-temp cases.
Test-Change: tests/status.test.ts design corrections: the plain-status kept-lines case becomes the leftovers case.
Test-Change: tests/command-reference.test.ts leftovers command contract added; no existing expectation changed.
```

Judgment: the planned criterion additions and revised unknown-worktree/unowned cleanup expectations have the cited brief sources. The fixture-path/dead-tab corrections preserve the intended outcomes. The retired-run.lock guard exemption is justified by the binding exact-name cleanup requirement. The formatting commit preserves expectations. The command-reference trailer names a file absent from the final diff because the command landed on the refreshed base. The status-test changes extend the upstream leftovers contract and use the binding host-block correction. No unsupported existing expectation change found. F1 identifies the planned test expectation that needs correction by A under the test-proof rules.

## Documentation

Opened the live behavior page docs/guide/next.md, README and docs/reference-index.md before judging the sweep. The guide now describes host filesystem leftovers under host. The changed AREA paths all exist. Its older claim that status prints kept reports is stale, but the live guide and command behavior point to leftovers, so no additional blocking documentation finding is raised.

## Operator actions

None. No credentials or live external mutations required.

## Verdict

fix. F1-F7 require repair. No separate Nits retained. The current green suite does not establish these required safety outcomes.
