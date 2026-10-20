# Review B

Date: 2026-10-19. Phase: check.review. Verdict: fix.

Base: `21422a68da2dd676f7e97077f18e4321ea7064f3`.
Reviewed head: `d818f81b888a71e6405c1c890d8ecc0b3df0f3ac`.

Read brief, design, plan, implementation report, ponytail guidance, reference index, command/test areas, install guide and standing design. No debate artifacts exist on this debate:no leaf. No peer review was read. Worktree clean; no product changes or commits made.

## Fixes

### F1 — Preserve tabs in incoming filenames before deciding that an ignored path has no overlap

Location: `src/sync.ts:112`, reaching the exemption at line 140 and checkout move at line 158.

Real source and trace: a contributor can force-track an ignored file whose name contains a tab with `git --literal-pathspecs add -f -- <path>`, commit and push it to the configured remote. Git accepts and preserves that filename. The operator then runs the real `akrogon sync` CLI with a differing ignored file at that same path. Fetch supplies the incoming tree to `git ls-tree -r -z`; its record is `<mode> <type> <id>\tcollision\tfile\0`. Splitting the entire record on tabs truncates the path to `collision`. The ignored listing correctly returns `collision\tfile`, so the lookup misses, line 140 exempts it without comparing bytes, and rebase overwrites the operator file.

Observed consequence today: CLI exits 0 and replaces `operator bytes\n` with `incoming bytes\n`, losing the ignored local contents without a refusal. This violates brief criterion 2 (differing bytes must refuse with contents and checkout unchanged), the design's literal-path tree interface, and its requirement that every other overlap retain refusal. This is a reachable Git integration input causing data loss, not an argument based only on hypothetical parser output.

Proof: `check review-B-tab-loss: 0 /home/ivan/Work/infra/akrogon/issues/open/sync-ignored/identical-ignored/implementation/check-review-B-tab-loss-1792431944100-3283366.log`, read back with `akrogon log`. Exit 0 means the diagnostic confirmed the defect, not that the product behavior passed.

```json
{"path":"collision\tfile","before":"operator bytes\n","result":{"code":0,"stdout":"","stderr":""},"after":"incoming bytes\n"}
```

Reproduction used existing `fixture()` and `cli()` helpers with real temporary Git repositories: commit `.gitignore` containing `collision*` and the fixture config, push; clone the bare remote; create `collision\tfile` containing `incoming bytes\n`, force-add literally, commit and push; create the same ignored local path containing `operator bytes\n`; invoke `cli(f, ['sync'])`; read the local file afterward. Fixture and temporary script were removed in finally blocks. No outside service or credentials were used. The preceding diagnostic attempt (`check-review-B-tab-loss-1792431934864-3278387.log`) failed before execution because of shell quoting and supplies no product evidence.

Repair: separate metadata at the first tab only, preserving the entire remaining filename. Add a CLI regression for this differing-file source, show it red before the fix and green afterward. Keep existing expectations intact.

## Verification

Read back the report's kept proof logs with `akrogon log`. Planned commands retain their scope and use the configured timeout in their logs; no test runner or config changes occur in the diff. Existing assertions were not removed or changed. Added criterion tests match the planned boundaries.

- C1 sync: `check c1-sync-adopts: 0 implementation/check-c1-sync-adopts-1792430640330-2243265.log` (1 pass).
- C1 self-update: `check c1-self-update-adopts: 0 implementation/check-c1-self-update-adopts-1792431873698-3258699.log` (1 pass, after its whitespace change).
- C2: `check c2-differs: 0 implementation/check-c2-differs-1792430661856-2287813.log` (5 pass).
- C3: `check c3-replayed: 0 implementation/check-c3-replayed-1792430662283-2291508.log` (3 pass).
- C4: `check c4-mixed: 0 implementation/check-c4-mixed-1792430662689-2295044.log` (1 pass).

Paths above are relative to this leaf. Product change precedes those proof runs; only the self-update test whitespace changed later, and its proof was rerun. The full-head verify receipt `c47b977d-e66f-47c9-b78c-f3e90c55d68a` records setup 0 and all three configured checks green on the reviewed head. Read back format, test and typecheck logs: `check-format-1792431677787-2698605.log`, `check-test-1792431862774-2698605.log` (1083 pass, 0 fail), `check-typecheck-1792431865302-2698605.log`. These checks miss F1. No full check rerun was needed for this read-only review.

Additional kept inspection: `check review-B-context: 0 implementation/check-review-B-context-1792431903468-3261984.log`; `check review-B-detail: 0 implementation/check-review-B-detail-1792431909591-3266815.log`; `check review-B-lines: 0 implementation/check-review-B-lines-1792431963751-3307473.log`. No AREA.md files changed. The install-guide update reflects the intended differing-entry refusal; F1 prevents that behavior for tab-containing incoming names.

## Test-Change trailers

`4b16b98823fc5f334ba8aa9e25792b63c86452de`:

- `Test-Change: tests/sync.test.ts adds the criterion tests: 'adopts identical ignored entries' (criterion 1 sync route), 'refuses an ignored entry differing only in <variant>' x5 (criterion 2 deltas), 'refuses an identical ignored <X> replayed <Y>' x3 (criterion 3 replayed overlaps), 'refusing a mixed ignored batch names only the differing path' (criterion 4)`
- `Test-Change: tests/self-update.test.ts adds 'a behind-only move adopts identical ignored entries from the incoming tree' (criterion 1 self-update route), imports chmodSync/readlinkSync and chmods the seed collide/tool before add so the incoming blob is 100755 like the clone`

`d818f81b888a71e6405c1c890d8ecc0b3df0f3ac`:

- `Test-Change: tests/self-update.test.ts prettier whitespace fix on the added self-update adoption test line; no existing expectation changed`

Both files match `src/test-files.ts`. Trailers agree with the diff and brief criteria. The chmod correction makes the new fixture exercise criterion 1's identical executable case. The whitespace change alters no expectation. No existing test assertion was changed or deleted.

## Nits and operator actions

None.

## 2026-10-19 check.repair

Repaired F1 from both initial reviews (the same defect). Prior reviewed head: `d818f81b888a71e6405c1c890d8ecc0b3df0f3ac`. Repair head: `dbb51e195255da7fdfd2b7d345c11c1c395a9461`.

- Reproduction commit `549c8ba`: one CLI regression for a contributor force-tracking an ignored tab-containing filename, then the operator syncing with differing local bytes. The test checks refusal, the literal reported path, retained operator bytes and issue record, unchanged HEAD/remote/index and released locks. Its `Test-Change` trailer cites this F1 source. No existing assertions changed.
- Fix commit `dbb51e1`: split each incoming tree record at its first tab, preserving every remaining filename byte represented by the existing string interface. This also prevents the truncated-name Map shadowing described by A. No locked decision changed.

Red proof on the original product code: `check repair-B-tab-regression-red: 1 /home/ivan/Work/infra/akrogon/issues/open/sync-ignored/identical-ignored/implementation/check-repair-B-tab-regression-red-1792432030556-3405826.log`. The assertion failed because sync exited 0 instead of refusing. Green proof after repair: `check repair-B-tab-regression-green: 0 /home/ivan/Work/infra/akrogon/issues/open/sync-ignored/identical-ignored/implementation/check-repair-B-tab-regression-green-1792432037114-3410054.log` (1 pass, 6 assertions). Both were read back with `akrogon log` and ran `bun test --timeout=30000 -t "differing ignored path containing a tab" tests/sync.test.ts` after the locked setup command. An earlier test-development run failed in fixture setup because `advance` cannot force-add an ignored path; it supplies no product red evidence and was replaced before committing.

All planned proofs were rerun on the committed repair head, using the exact commands in plan.md after `check repair-B-proof-setup: 0 implementation/check-repair-B-proof-setup-1792432044279-3415426.log`. These are A's planned tests, unchanged by B, so repair acceptance does not depend only on B's new regression:

- `check c1-sync-adopts: 0 implementation/check-c1-sync-adopts-1792432044690-3415624.log` (1 pass).
- `check c1-self-update-adopts: 0 implementation/check-c1-self-update-adopts-1792432044681-3415619.log` (1 pass).
- `check c2-differs: 0 implementation/check-c2-differs-1792432044693-3415627.log` (5 pass).
- `check c3-replayed: 0 implementation/check-c3-replayed-1792432044690-3415629.log` (3 pass).
- `check c4-mixed: 0 implementation/check-c4-mixed-1792432044690-3415626.log` (1 pass).

All proof logs were read back with `akrogon log`. Relative paths resolve under this leaf. `check repair-B-final-diff: 0 implementation/check-repair-B-final-diff-1792432052221-3442801.log` confirms only the parser repair and reproduction test changed, `git diff --check` passes, and the worktree is clean. Fixture cleanup uses existing finally blocks. No live action, credentials, operator actions, reusable Nits or Handed to A items remain.

`akrogon verify` on committed head `dbb51e195255da7fdfd2b7d345c11c1c395a9461` finished green, receipt `9297a53f-ab6d-4c54-88c7-d8ec8f707fdb`: setup 0, format 0, test 0 (1084 pass, 0 fail), typecheck 0. Logs read back with `akrogon log`: `implementation/check-format-1792432047398-3417533.log`, `implementation/check-test-1792432220643-3417533.log`, `implementation/check-typecheck-1792432222861-3417533.log`. No merge checks run. All Fixes repaired; ready for merge.
