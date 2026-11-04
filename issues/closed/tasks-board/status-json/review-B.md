# Review B: status-json

Date: 2026-11-03
Phase: check.review, initial blind review
Base: `2489ef32925837514f1452aaa1fc2f7d1c530225`
Reviewed head: `27dff5a909492f6cd020033a68c237338bacfdae`
Verdict: **fix**

## Fixes

### F1: Closed merged dependencies are labelled unreadable

Location: `src/status.ts:598`, the inventory passed to `blockedBy`.

Real source: completing an issue or epic moves its merged leaves to
`issues/closed/`. Another open owner can still name one of those leaves in
`blocked-by`. This is the normal completion path documented in
`docs/use/merge-and-announce.md` and implemented by `completeOwner` in
`src/phase.ts`. `repoInventory` includes both open and closed leaves, and
`unmergedDeps` correctly treats that closed merged dependency as satisfied.

The JSON serializer passes only `scan.leaves` (open leaves) to `blockedBy`.
It therefore misses the readable closed state, finds the closed folder via
`hasLeafFolder`, and emits `label: 'unreadable'`. The Tasks consumer receives
a false unreadable dependency for completed work today.

Hits brief criteria 2 and 4 and plan D3's explicit satisfied-dependency
`merged` label. Preserve the closed part of the existing inventory when
resolving these labels. Add a regression at the CLI boundary for an open
leaf depending on a closed merged leaf. The existing dependency fixture
keeps `dep-done` in open, so it cannot catch this failure.

### F2: Recent merges omit merged leaves in unfinished owners

Location: `src/status.ts:743`, `return scan.closed`.

Real source: a leaf merges while another leaf in the same issue or epic is
unfinished. `commandMerged` records the merged state, but `completeOwner`
does not move the owner to closed until its leaves are all merged. This
normal state can last for the remaining work's entire duration.

The recent-merges builder considers only `scan.closed`, so the newly merged
leaf is absent from `merges` even with a valid merge event and prompt
timing. Older closed merges appear in its place, or the list is empty.

Hits brief criterion 5 and the design's last five merged leaves across
repos, closed issues included. Include merged leaves from both parts of the
existing inventory before sorting and taking five. Plan D9's closed-only
restriction is inconsistent with that locked result. The current test's
comment mentions merged leaves in open, but its only remaining open leaf
is `staying` in phase `failed`, so it does not exercise the case.

## Reproduction evidence

Ran the current CLI using existing isolated fixture helpers after the
configured locked setup. The fixture contains a closed merged `archived`,
an open merged `latest` sharing an owner with unfinished `remaining`, and
`remaining` depends on both. Merge log entries put `latest` one minute ago
and `archived` ten minutes ago. Both have delivered prompt timing entries.
The diagnostic also calls `unmergedDeps` with the same repo inventory.

`check review-b-lifecycle-json: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-review-b-lifecycle-json-1793722008096-3063460.log`

Read back with `akrogon log`. The diagnostic exits zero after recording
observations, rather than asserting correct product behavior. Its CLI
result also exits zero. Output:

```text
actual_dependencies: archived=unreadable, latest=merged
scheduler_blockers: []
actual_merges: [archived]
expected_dependencies: archived=merged, latest=merged
expected_merge_slugs: [latest, archived]
```

All fixture and suite directories were removed in `finally`. No product or
test files were changed and no commits were made during review.

## Verification and scope

Reviewed the whole base-to-head diff against brief, design, plan, report,
the command reference, area/index pointers and the live lifecycle contracts.
No `AREA.md` or lesson files changed. The command reference describes the
new all-repo JSON surface and last-five-merges promise. F2 violates that
promise. The text changes retain the existing formatting expressions.

The planned commands ran without filtering or runner changes. The recorded
verify run `3ef3baf7-21a0-4650-b589-b4f33bd9afd1` completed with setup,
format, typecheck and test all zero. Its tested commit `9370b95` and reviewed
head have identical tree `7d4f052cf98f5dba9d3be0a9e1f7a96636c7269d`.
The final amendment changes only the commit message. Thus the proofs cover
the current tests, fixtures, helpers and product. No proof-command
correction was recorded or needed. Existing whole-suite evidence was
reused rather than rerun without a cause.

Read back the following kept logs with `akrogon log`:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-format-1793721799862-2746235.log`
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-typecheck-1793721802228-2746235.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-test-1793721872736-2746235.log` — 1277 pass, zero fail.
- `check status-json: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-status-json-1793721876296-3055737.log` — nine pass.
- `check status-text: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-status-text-1793721877195-3056382.log` — 36 pass.
- `check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-review-b-receipt-1793722019707-3064181.log` — receipt, matching trees and clean worktree.

The planning red log was also read. Contrary to the report's shorthand,
not all nine failures were JSON parse errors: two fixture setup operations
failed with ENOENT before invoking the product. The final fixture repairs
and current green proof are present. This historical description does not
add a correctness blocker beyond F1/F2.

## Test-Change trailers

Listed every trailer in `2489ef32925837514f1452aaa1fc2f7d1c530225..HEAD`,
using `src/test-files.ts` as the changed-test path rule:

- `d0be699`: `Test-Change: tests/status.test.ts fixture helpers moved to tests/status-fixture.ts for reuse; no expectation changed`
  — accepted. Plan D11 names the extraction. The helpers moved without
  assertion changes, and the original 36 tests still run.
- `27dff5a`: `Test-Change: tests/status-json.test.ts fixture fixes (paused/stopped yaml values, parked owner twin conflict, per-repo logs) and merged:number->nullable schema for record-less closed leaves`
  — fixture corrections match the real YAML schemas, ownership rules and
  per-repo log readers. Nullable merge time represents missing log evidence
  already acknowledged in the report. It does not explain or excuse F2's
  omission of a merged leaf with a valid event. Current green proof follows
  these changes.
- `27dff5a`: `Test-Change: tests/command-reference.test.ts status contract gains --json, mirroring the new flag`
  — accepted. Brief criterion 1 requires the new invocation and the CLI
  option supplies its real source.
- `27dff5a`: `Test-Change: tests/status.test.ts prettier format only; no expectation changed`
  — accepted. No assertion was changed or removed after extraction.

## Operator actions

None. Both findings are product defects with local fixture reproductions.

## 2026-11-03 check.repair

Starting head: `27dff5a909492f6cd020033a68c237338bacfdae`.
Repaired head: `ada0dab9faca8227e320626f6f2821f9b3ee7e39`.
Read both initial reviews. A's F1 and B's F1 describe the same defect.

### F1 repaired

Committed the reproduction test first as `2e41788`, then the product fix as
`4f9e086`. Dependency labels now use open and closed leaves from the same
existing scan. No extra inventory scan is introduced.

The new CLI test places a merged dependency in a closed owner while its
dependent remains open. Before the fix it received `unreadable` instead of
`merged`. After the fix it passes. These are the same command and scope:
`bun test tests/status-json.test.ts`, after the configured locked setup.

- `check repair-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-repair-f1-red-1793722182182-3067813.log` — nine pass, only the new reproduction fails.
- `check repair-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-repair-f1-green-1793722189992-3068657.log` — ten pass.

### F2 repaired

Added the dated implementation note required by brief criterion 5 and the
design's cross-repo merged-leaf result before changing the implementation.
It supersedes plan D9's closed-only restriction. No other plan text or
locked design text changed.

Committed the reproduction test first as `9b8e255`, then the product fix as
`ada0dab`. Recent merges now consider both open and closed leaves before
filtering by merged phase, sorting and taking five.

The new CLI test retains a merged leaf beside an unfinished sibling, and
compares its position and times against an older closed merge. Before the
fix only the older merge appeared. After the fix both appear in time order.
These are the same command and scope: `bun test tests/status-json.test.ts`,
after the configured locked setup.

- `check repair-f2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-repair-f2-red-1793722201378-3069821.log` — ten pass, only the new reproduction fails.
- `check repair-f2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-repair-f2-green-1793722208553-3071012.log` — eleven pass.

### Current planned proof

Ran the unchanged planned command on repaired head `ada0dab`:
`akrogon run-check --name status-json -- bun test tests/status-json.test.ts`.
The nine original tests authored by A all pass, along with the two bug
reproductions. This reruns the proof for all eight criteria after the last
test and product changes. The original assertions, fixtures and runner
configuration were preserved. Both test commits carry a `Test-Change`
trailer citing their finding and its real lifecycle source.

- `check status-json: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-status-json-1793722232714-3072741.log` — eleven pass.
- `check status-text: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-status-text-1793722233099-3072740.log` — all 36 existing text tests pass.

All red and green proof logs above were read back with `akrogon log`.
Fixture cleanup remains in each test's `finally`. No temporary test files
or helpers were created.

### Handed to A

None. A's F1 missing regression is the allowed reproduction test for the
proven product bug and was repaired here. No existing test expectation or
proof command required correction.

### Remaining concerns

No operator actions or deferred Nits held by B. A's N1 envelope additions
were already reviewed against their text-board facts. N2's structured-run
alternative is outside the locked text-field design. N3's open-merge
omission is resolved by F2. The repair introduces no documentation change:
the existing command reference already promises these results.

### Final verification

`akrogon verify` completed green on committed head
`ada0dab9faca8227e320626f6f2821f9b3ee7e39`, pass
`0542d697-4878-4d83-b52c-00bb8c0f7e09`. Setup and every configured check
completed with exit zero. No merge checks ran.

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-format-1793722242951-3076627.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-typecheck-1793722245282-3076627.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-test-1793722315624-3076627.log` — 1279 pass, zero fail across 73 files.

Read back all three logs with `akrogon log`. F1 and F2 are resolved, all
required current proofs pass, and nothing is handed to A. Ready for merge.
