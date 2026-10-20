# Review B: shared-inventory

Date: 2026-10-19. Phase: check.review. Verdict: **fix**.
Base: `21422a68da2dd676f7e97077f18e4321ea7064f3`.
Reviewed head: `d6a0c0807be6b53e73c54e40cffd5dc5dba85c0b`.
Initial blind review. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No product code was changed or committed.

## Fixes

### F1: Owner completion bypasses repo-key and duplicate-slug failures

Locations: `src/phase.ts:201–225`, `src/reconcile.ts:262–272`, `src/state.ts:readInventory/repoInventory`.

Source and trace: a repository contains two leaf records sharing a slug, or a leaf whose operator-editable `repo` field names another registration. Both are explicitly supported failure categories under design unknown-keys and plan D1/D2. A user merges a different healthy leaf in that owner with `akrogon phase healthy merged`. `repoInventory` classifies the duplicates as unreadable or the wrong-key leaf as foreign, but `ownerScope` and `ownerCompletes` use `readInventory`, which performs neither check and always leaves `foreign` empty. When those readable records carry phase merged, the owner is considered complete.

Consequence today: the command reports `issue complete owner` and moves the entire owner, including its invalid records, to issues/closed. Owner sources can also be closed through the same completion decision. Reconcile's mirrored decision has the same incomplete view. This breaks criterion 4's owner-completion protection, the binding rule that a whole-set decision blocks on failures inside its own scope, and D6/D7. Failures outside the owner must continue to leave it independent.

Proof: `implementation/review-B-owner-proof.ts` invokes the existing CLI fixture for both cases. Each first prints the actual repoInventory failure entries, then the actual phase command result. Both return code 0, print `issue complete owner`, and show `closed:true`. The fixture cleans up in finally. Replay from this worktree with `akrogon run-check --name review-B-owner-proof -- bun <leaf>/implementation/review-B-owner-proof.ts`.

Evidence: `check review-B-owner-proof: 0 implementation/check-review-B-owner-proof-1792432917185-307197.log` (exit 0 is the probe finishing, not the required outcome passing). The existing criterion-4 test covers parse errors, but does not catch either classification gap. Repair the shared classification consumed by both completion paths and add a regression at the CLI boundary.

### F2: A missing status target reports an unrelated leaf's parse error

Location: `src/status.ts:439–442`.

Source and trace: an operator runs `akrogon status missing-leaf`, for example after a typo or leaf removal, while another leaf has malformed state. No target folder exists, but the new branch selects `inventory.unreadable[0]` and throws that unrelated leaf's error. The ordinary findLeaf missing/parked diagnostic is bypassed.

Consequence today: the diagnostic names `issues/open/issue/bad/state.yaml` and never identifies the requested missing leaf. This violates the target-scoped lookup contract in D3/D15 and the design rule that one bad sibling affects only itself. A target with no matching failure must go through the normal missing/parked lookup.

Proof: `akrogon run-check --name review-B-lookup-proof -- bun -e 'import {fixture,leaf,cli} from "./tests/helpers.ts"; import {writeFileSync} from "node:fs"; import {resolve} from "node:path"; const f=await fixture(); try {const p=leaf(f,"bad","implement"); writeFileSync(resolve(p,"state.yaml"),"slug: ["); const r=await cli(f,["status","missing-leaf"]); console.log(JSON.stringify(r));} finally {f.clean();}'`.

Evidence: `check review-B-lookup-proof: 0 implementation/check-review-B-lookup-proof-1792432949360-467709.log`. Captured CLI exit 1 reports `Invalid state .../issue/bad/state.yaml: YAML Parse error: Unexpected token`, from status.ts:442. No existing missing-target-with-bad-sibling test catches this.

## Verification

All cited logs were read back with `akrogon log`.

- Setup ran under the printed install lock: `check review-B-setup: 0 implementation/check-review-B-setup-1792432903117-303540.log`.
- Current planned state/isolation/capacity proofs: `bun test tests/state-inventory.test.ts tests/next.test.ts tests/state.test.ts`, **290 pass, 0 fail**. `check review-B-planned-state: 0 implementation/check-review-B-planned-state-1792432957105-307196.log`.
- Current planned observer proof, exact directory and scope: `cd skills/watch-issues && bun test scripts`, **48 pass, 0 fail**. `check review-B-planned-observe: 0 implementation/check-review-B-planned-observe-1792432919049-307195.log`. This replaces the report's unkept inline observer evidence with a retained current run.
- Configured checks already have a completed green receipt on the identical current tree `0a99e2e6345d7759345c6830a118f6e09e7763c2`: actual receipt ID `e037d134-919d-4c44-87fb-95071a65fe2f` at d7f05174. The report's `9d79ed65` is inaccurate, but the receipt itself exists and matches HEAD's tree. Format 0 (`implementation/check-format-1792432665837-4008944.log`), test 0 with **1084 pass** (`implementation/check-test-1792432823883-4008944.log`), typecheck 0 (`implementation/check-typecheck-1792432826162-4008944.log`). Read all three logs. No code changed after these runs, so no full-check rerun was needed.
- Reviewed the source property directly alongside its current green test. No other module walks leaf state or parses it directly. No AREA.md is changed, so the changed-area pointer listing rule does not apply.
- Grounding: read docs/reference-index.md, src/AREA.md, docs/guide/state.md and docs/guide/problems.md. These pages describe state identity, phase moves and status lookup. The failures above are code contract defects. No additional documented behavior claim needs changing for this diff.
- The source-scan correction IN7 is equivalent to criterion 7: constructing a failure-report path is not walking or parsing state. Existing retired-key fixtures and removed shim expectations are contradicted by the explicit Taken 2a decision. Narrowing the ownership assertion to the bad leaf's own tab preserves criterion 4 while allowing normal merged-tab cleanup. The retained green runs postdate the final test/fixture changes. The initial retired-key red log fails during import, so it is not evidence of individual retired-key assertion failures. Current acceptance of those rejection outcomes is demonstrated by the 40 state tests and the directly inspected removed normalization code.

## Test-Change trailers

Inspected every trailer in base..HEAD against its source and `src/test-files.ts`. All changed old test files are accounted for. Formatting-only trailers do not alter expectations. The exact trailers are:

```text
Test-Change: tests/state-inventory.test.ts formatting only in d7f05174 (repo format check); no expectation changed
Test-Change: tests/batch-dispatch.test.ts formatting only; no expectation changed, required by the repo's configured format check (bunx prettier --check src tests skills/chart-issues/scripts)
Test-Change: tests/batch-dispatch.test.ts brief/design Taken 2a deletes the batch.members shim; the case asserting members:[] is silently dropped is removed with it
Test-Change: tests/state-inventory.test.ts on old code the walk threw and reconcile never ran so every tab survived; now the pass cleans up the merged leaf's dead broadcast tab, so the assertion narrows to the invariant — the bad leaf's own tab and worktree survive
Test-Change: tests/status.test.ts brief/design Taken 2a deletes the readState retired-key filter; fixtures carrying priority/slot relied on the silent drop and are now corrected to canonical states (the assertions they fed never read those keys)
Test-Change: tests/pause-next.test.ts same Taken 2a; the holder states carried solo:true which readState previously dropped, so the merge holder behaves identically without it
Test-Change: tests/batch.test.ts same Taken 2a; the 'readState drops a legacy solo key' case asserted the deleted filter behavior and is removed
Test-Change: skills/watch-issues/scripts/observe.test.ts same Taken 2a; the legacy fail fixture's retired keys are dropped so it still exercises failed-without-record under strict parsing
Test-Change: tests/state-inventory.test.ts brief criterion 7 bans walking for state.yaml or parsing leaf state outside readState; resolve(folder, 'state.yaml') in a failure report is neither, so the scan flags marker comparisons, fs reads/parses of a state file, and stateSchema references
Test-Change: tests/state.test.ts design Taken 2a removes the readState skip list and the empty batch.members shim, so the lazily-migrates cases are rewritten to expect the leaf's own readState error for every retired-key variant (priority, slot, failed_notified, solo, empty members) and the depth tests expect per-leaf inventory failures instead of allLeaves throwing
Test-Change: skills/watch-issues/scripts/observe.test.ts design interpretation (B) has observe.ts report each unreadable leaf beside healthy output instead of aborting, so the five exit-nonzero cases are rewritten to expect exit 0, the healthy slug line, and one unreadable= line naming the bad state.yaml
```

No additional Nits or operator actions. Reusable-Nit recording does not apply to this fix verdict.

## Handoff

Request check.repair for F1 and F2. Both are product repairs within the locked scope, with no operator-only action or decision change required.

## 2026-10-19 check.repair (slot B)

Starting head: `d6a0c0807be6b53e73c54e40cffd5dc5dba85c0b`.
Repaired head: `fd63a70aa70de0ebaeebd5a1c121d34b7d050a9a`.
Base remains `21422a68da2dd676f7e97077f18e4321ea7064f3`. Read both initial reviews and the current brief, design, plan and implementation report before repair. No refresh/rebase and no locked-decision or existing-test-expectation changes.

Findings below are prefixed by their review slot because both initial reviews use F1/F2.

### B-F1 repaired: owner completion retains identity failures

- Reproduction commit `96848bd6` adds one CLI regression test covering foreign and duplicate sibling records inside an epic, followed by completion of an independent owner.
- Product commit `2e22b7dd` makes both phase completion and reconcile's completion decision consume the classified repo inventory through `inventoryUnder`. The shared projection retains failures inside the owner and unknown directories enclosing it. It preserves repo-wide duplicate detection before narrowing to the owner. Failures outside the owner remain independent. Follow-up `fd63a70a` removes the now-unused area-root variables from these same functions.
- Root search: both `ownerScope` and `ownerCompletes` were using unclassified subtree reads. Both now use the same classified projection. Reviewed all remaining `readInventory` and `inventoryFailures` callers (`implementation/check-repair-B-final-diff-1792433409766-614526.log`); none is another owner-completion decision.
- Same command before/after: `bun test tests/state-inventory.test.ts`. Red: **8 pass, 1 fail**, the epic wrongly disappeared from issues/open. Green: **9 pass, 0 fail**, both failure classes remain open and the independent owner completes.
- `check repair-B-owner-red: 1 implementation/check-repair-B-owner-red-1792433328703-563220.log`
- `check repair-B-owner-green: 0 implementation/check-repair-B-owner-green-1792433351089-575394.log`

### B-F2 repaired: missing status target keeps its own diagnostic

- Reproduction commit `7173180d` adds one CLI regression for `status missing-leaf` beside malformed sibling state. Assertions bind to the requested slug and sibling file path, not prose wording.
- Product commit `516ec076` resolves the named target first with findLeaf and checks only a failure attached to the resolved path. It removes the arbitrary first-unreadable-sibling selection and the redundant hasLeafFolder traversal. Existing target-specific depth/duplicate validation remains.
- Same command before/after: `bun test tests/state-inventory.test.ts`. Red: **9 pass, 1 fail**, diagnostic names the sibling file and omits missing-leaf. Green: **10 pass, 0 fail**.
- `check repair-B-lookup-red: 1 implementation/check-repair-B-lookup-red-1792433359801-581980.log`
- `check repair-B-lookup-green: 0 implementation/check-repair-B-lookup-green-1792433373592-587776.log`

### A-F1 repaired: foreign leaf ownership survives cleanup

- Reproduction commit `70676920` adds one CLI regression for an operator-edited repo key with unregistered `foreign-leaf` and `foreign-leaf-old` directories carrying work. `next --all` must retain both directories and their file contents.
- Product commit `d76e6802` includes foreign folder basenames in inventoryFailures.ownedNames and explicitly protects their slice identities in reconcileHost, alongside unreadable leaves.
- The test uses the actual configured store and the existing supported exact-slug/hyphen-suffix ownership convention. A's illustrative `.old` spelling is not part of matchSlug's existing convention and was not added as a new naming rule.
- Same command before/after: `bun test tests/state-inventory.test.ts`. Red: **10 pass, 1 fail**, owned data directory deleted. Green: **11 pass, 0 fail**, both payloads retained.
- `check repair-B-foreign-red: 1 implementation/check-repair-B-foreign-red-1792433389814-597893.log`
- `check repair-B-foreign-green: 0 implementation/check-repair-B-foreign-green-1792433399728-605824.log`

### A-F2 repaired: observer documentation matches failure output

- Commit `37e2668a` updates only skills/watch-issues/SKILL.md's Observe paragraph. Before: one line per leaf, with no failure-line contract. After: sorted readable lines followed by sorted `unreadable=<path> error=<message>` lines for unreadable states, foreign leaves and unknown directories, including failures-only output.
- Before/after text is retained and read back in `check repair-B-observer-doc: 0 implementation/check-repair-B-observer-doc-1792433409635-614367.log`.
- Current observer proofs pass, including unreadable/foreign/depth/duplicate sibling reporting. No watch was started and no external messages were sent.

### Current planned acceptance proofs

All cited red/green, documentation and current proof logs were read back with `akrogon log`. Each behavior repair has its own red test commit and product commit. Each modified test commit has a Test-Change trailer citing the corresponding review finding and user action. No existing test expectation was corrected.

The following planned proofs ran on repaired head fd63a70a after the final product and test changes:

- `bun test tests/state-inventory.test.ts tests/next.test.ts tests/state.test.ts`: **293 pass, 0 fail**. `check repair-B-planned-state: 0 implementation/check-repair-B-planned-state-1792433463954-618947.log`. Covers criteria 1–4, 6 and 7, plus all three new regressions.
- `cd skills/watch-issues && bun test scripts`: **48 pass, 0 fail**. `check repair-B-planned-observe: 0 implementation/check-repair-B-planned-observe-1792433424731-618946.log`. Covers criterion 5 and the documented failure-line behavior.

These include the original planned acceptance tests B did not write. They were rerun because state.ts, phase.ts, reconcile.ts, status.ts and the criterion test file changed. No dependencies, helpers or fixtures changed. Temporary CLI repositories clean up in finally on success and failure. No new temporary scripts or resources remain.

All four Fixes are repaired. No items are handed to A, no operator actions are open, and B holds no remaining reusable Nit. A's nonblocking observations do not introduce additional acceptance criteria.

### Full-verification follow-up

First configured verify on fd63a70a was red: receipt `6834b4a9-79bf-4d81-9e94-ce4000845445`, format 0, test 1 (**1085 pass, 2 fail**), typecheck 0. Read all command logs. Test log: `implementation/check-test-1792433634343-793891.log`; format: `implementation/check-format-1792433474950-793891.log`; typecheck: `implementation/check-typecheck-1792433636945-793891.log`.

Both failures had direct causes in B's repair, so the unrelated-red retry/known-red procedure does not apply:

- A-F1 follow-up commit `5c8d32f` keeps the recorded identity-error context when badSlices protects a foreign slice. The original repair reached the earlier generic keep branch, hiding the stored repo key that the existing slice diagnostic contract requires. `bad leaf ownership keeps uncertain slices without aborting failed-unit cleanup` failed in the full run, then passed with every existing assertion unchanged: `check repair-B-slice-detail-green: 0 implementation/check-repair-B-slice-detail-green-1792433680180-1261471.log` (**15 pass**).
- B-F2 follow-up commit `3e772e5` preserves refusal when a state marker at issues/open or issues/closed itself hides that entire area's leaf tree. Such an invalid root prevents proving a requested leaf absent. It differs from an unrelated bad sibling, which must never replace the target's missing-leaf error. `status reports invalid open/ while showing another repo without writes` failed in the full run, then passed unchanged alongside the new missing-sibling regression: `check repair-B-status-scope-green: 0 implementation/check-repair-B-status-scope-green-1792433682095-1266611.log` (**46 pass** across status and inventory tests).

Both follow-ups preserve the existing test expectations. No tests were added or edited for them. Their green logs were read back. The fd63a70a receipt is rejected evidence, not a passing receipt.

Final follow-up head: `3e772e548d2267798ce01549a9dbc90840dbfa0c`. Worktree clean and diff check green. Current planned proofs after these follow-ups:

- `bun test tests/state-inventory.test.ts tests/next.test.ts`: **253 pass, 0 fail**. `check repair-B-final-planned-state: 0 implementation/check-repair-B-final-planned-state-1792433737900-1280492.log`.
- `cd skills/watch-issues && bun test scripts`: **48 pass, 0 fail**. `check repair-B-final-planned-observe: 0 implementation/check-repair-B-final-planned-observe-1792433699358-1280493.log`.
- Retained the earlier **40 passing state tests** from repair-B-planned-state because state.ts and every parser-test input/helper/fixture remain unchanged after that proof. Both current logs were read back.

### Final configured verification and handoff

`akrogon verify` passed on final committed head `3e772e548d2267798ce01549a9dbc90840dbfa0c`, tree `54e889093275ffc8e3d07bafe4c8ec842e34c002`. Completed green receipt: `99a302a1-bb2a-434d-be55-7cd0be4e97cb`.

- Format 0: `implementation/check-format-1792433753707-1455226.log`.
- Test 0: **1087 pass, 0 fail**, 66 files, `implementation/check-test-1792433912979-1455226.log`. Includes both previously failing tests with their original assertions.
- Typecheck 0: `implementation/check-typecheck-1792433915501-1455226.log`.

All three logs were read back with `akrogon log`. The worktree is clean, every Fix is committed, and no code/test/input changed after the current proofs or full verification. No merge_checks ran. No handoff to A, operator action, or held reusable Nit remains. Request merge as slot B.

Phase result: `akrogon phase shared-inventory merge --slot B` returned exit 0, `moved merge`. It waited for an existing `akrogon next` holder of the global lock, then completed without stopping that process. All repairs and the green receipt are handed to merge.

## 2026-10-19 merge attempt 1bcd3933-ee9f-4218-9036-e5307b16abb0

Command-applied rebase target: `dbb51e195255da7fdfd2b7d345c11c1c395a9461` (origin/main).
Applied/tested head: `e35e33fdd4a048db88c36ccac21c9341d076e1a2`, matching prompt top and batch.top.
Prior reviewed head: `3e772e548d2267798ce01549a9dbc90840dbfa0c`, prior base `21422a68da2dd676f7e97077f18e4321ea7064f3`.
Worktree clean. No fetch, rebase, commit or push by B on this applied-top pass. Read the current brief, design, plan, implementation report, both reviews and docs/guide/merge.md. Gathered the standalone owner's ISSUE.md and its sole leaf brief before landing.

### Command-run red and causal judgment

Wake red receipt: `f7bbecc0-0775-481c-91a0-8c0da28780a8`, merge scope, head e35e33fd, tree `2cd2635bab45f2bd0e121a16aaebbe64bf04a43d`.

- Format command `bunx prettier --check src tests skills/chart-issues/scripts`: exit 0, `implementation/check-format-1792434037542-1945363.log`.
- Test command exactly `bun test --timeout=30000`: exit 1, **1098 pass, 1 fail**, `implementation/check-test-1792434192531-1945363.log`.
- Typecheck command `bun run typecheck`: exit 0, `implementation/check-typecheck-1792434194816-1945363.log`.

Read every log with akrogon log. The only failing test is `overview reads multiple repos outside git, retains hierarchy and recorded fields without writes`, tests/status.test.ts:149. Failing output: expected `0h 23m`, received `0h 22m`.

Judgment: no cause in the leaf diff. The fixture creates the terminal event with Date.now()-7 minutes, then separately creates the prompt with Date.now()-30 minutes. A later prompt clock read makes their difference slightly less than 23 minutes, which the unchanged elapsed formatter floors to 22. The leaf only removes retired keys from this fixture and changes inventory collection, not its clock reads, elapsed calculation or assertion. This exact 22/23-minute inconsistency was also recorded in the implementation report before merge. Inspected the current fixture, formatter and base..HEAD diff in `implementation/check-merge-B-time-cause-1792434215880-2422386.log` and gathered completion context.

Following Shared endings, B reruns `akrogon verify --attempt 1bcd3933-ee9f-4218-9036-e5307b16abb0` once on the unchanged head. No test expectation correction or product repair was made.

### Unchanged-head rerun: green, original test result inconsistent

The exact rerun `akrogon verify --attempt 1bcd3933-ee9f-4218-9036-e5307b16abb0` passed with receipt `39f984ee-b7c9-49f2-9997-e0334a43538d` on the same e35e33fd head and tree `2cd2635bab45f2bd0e121a16aaebbe64bf04a43d`.

- Format exit 0: `implementation/check-format-1792434218243-2422514.log`.
- Test `bun test --timeout=30000` exit 0: **1099 pass, 0 fail**, `implementation/check-test-1792434374253-2422514.log`.
- Typecheck exit 0: `implementation/check-typecheck-1792434376512-2422514.log`.

Read all three rerun logs with akrogon log. The original elapsed-time failure is **inconsistent**, with the rejected and passing log paths retained above. No known-red comparison is needed after this green retry. No branch changes were made. Proceed to merged --check and the command-owned landing under the same attempt.

Merge gate: `akrogon phase shared-inventory merged --slot B --check --attempt 1bcd3933-ee9f-4218-9036-e5307b16abb0` returned exit 0, `ok`. Completion context is the standalone bad-state-isolation issue, with the sole shared-inventory leaf brief gathered. Submit the tested e35e33fd head through the command-owned landing.
