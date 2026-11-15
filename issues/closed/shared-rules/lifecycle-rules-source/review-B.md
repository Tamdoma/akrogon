# Review B: lifecycle-rules-source

Date: 2026-11-11. Phase: check.review. Verdict: **fix**.

Base: `81c6bc8338846fb397c55fd46988bcd03d945573`.
Reviewed head: `e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66`.
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/lifecycle-rules-source`.

Reviewed independently from the brief, design, plan including implementation notes, implementation report, base-to-head diff, affected documentation and current verification evidence. No peer review was read or peer contacted. No code edits, commits, live operations or paid launches were made.

## Fixes

### F1. Preserve B's ownership of known-red judgment during review

Location: `skills/lifecycle-rules.md:23`, reached from `skills/check-issue/SKILL.md` Shared context and check.review.

The old check.review paragraph specifically assigns the head/base log reading and causal judgment to B: “B reads the head and base logs”, “B, having read both logs whole”, and “B withholds agreement”. The new shared paragraph assigns all three to “the seat”, and the local check.review stub supplies no ownership exception.

Real source: an ordinary `check-issue <slug> slot=A phase=check.review leaf=<folder>` pass encountering an unrelated check that remains red after its retry. A follows the local stub into the shared rule and is now required to perform the log-completeness/causal-fit judgment previously assigned to B. B still receives that duty too. This changes the review seats' responsibilities in a change explicitly required to preserve them. It is a responsibility change, not a preference for particular wording.

Hits brief criteria 2 and 3 and the locked “no seat gains or loses a rule” decision. Preserve B's review-specific ownership while retaining A's ownership in plan/implement/check.fix and B's in repair/merge. Describe that distinction in the clause trace.

Before/after evidence: `check review-B-judgment-ownership: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-review-B-judgment-ownership-1794394310358-3912372.log`. The command extracts the old owner-bearing clauses and the new shared clauses plus the local stub directly from the reviewed revisions. This is a documentation/contract Fix and needs no prose-wording test.

### F2. Supply the required clause-level preservation evidence

Location: `implementation/report.md`, “Clause table (old place → new place → seats)”.

The report supplies five family-level rows. For example, its grant row maps all four old paragraphs together to one new section, and its red-check row labels all four skill families together. The separate per-seat paragraph lists selected differences but does not map every old clause or distinguish each old copy's ownership and applicability. In particular, it neither identifies nor explains F1's B-specific judgment clauses.

Real source: this implementation handoff and its designated criterion-2 proof. The report is the planned evidence for preserving the rules along all phase and standalone/direct reading paths. A family summary cannot establish that each old copy's clauses and seat restrictions survived, and the actual ownership change in F1 demonstrates the verification consequence today. This is missing preservation evidence, not a demand for a particular Markdown layout.

Hits brief criterion 2 and plan D9. Expand the existing trace to account for each clause of each old grant, environment, producer-save, kept-output and red-check copy, including plan's pointer, with its destination and holding seats. Account for the seat differences required by criterion 3 in that trace. Keep the existing phase reading-path audit and correct its conclusions after F1 is addressed. No new test is needed.

## Remaining review results

The grant section preserves the comparison, authorization bounds, pre-launch count, completion records, prior-use handling, repeat-count warnings and stop-type restrictions. The environment section preserves secret-file restrictions and limits producer-key saving to plan/implement. The kept-output rule preserves capture, citations, log read-back and exemptions. The retry rule otherwise retains the same-command retry, known-red comparison, named/nameless judgment, blocked-command handling, independent criterion proof and base-red filing conditions.

The local rules retain record-file substitutions, merge's `.env.example` exception, check.review's launch prohibition, setup flock in check and implement, fixture cleanup/absence proof in check and merge, and the short-excerpt restriction outside plan. The implement opening sentence agrees with its conditional ponytail/template/worker-protocol reads, including delegated repairs, while preserving fresh skill/brief/design reads.

Reading paths checked: plan.synthesis uses Shared context plus its retry pointer and intended-red exception. Implement and check.fix use Shared context and their red-check pointer. Check.review uses its local stub, and check.repair's existing borrow still resolves to that stub and then the shared rule. Merge uses Shared context and Shared endings with its attempt command forms and endings. Ordinary standalone implement retains its command-output exemption. Direct implement retains its chart holder/report overrides. Direct check retains its out-file and chart-holder overrides. Apart from F1, no further changed duty or permission was established.

The four new files are Git symlinks, mode `120000`, targeting `../lifecycle-rules.md`; their SKILL.md links stay inside their own folders. The shared file contains no relative Markdown links. The existing link checker covers the new tracked files and their dereferenced contents. The installed-layout mechanism is supplied by the preceding link-file leaf; this review launched no new installed-harness proof.

Opened `docs/reference/checks.md`, the live page describing the moved seat rules, and followed the reference index/skills area. Its two moved-rule pointers now name the shared file. The test-change pointer remains local because its rule did not move. The other checked docs describe commands, phases or artifacts rather than a moved rule's home. All paths named by the changed `skills/AREA.md`, including its contextual asset/script names, exist in the repository-root listing. Word counts match the report: plan 1938→1587, implement 4948→4105, check 4373→3558, merge 3052→2324, shared 1307.

## Test changes and verification

`Test-Change:` trailers in `81c6bc8338846fb397c55fd46988bcd03d945573..HEAD`:

| Commit | Trailer | Judgment |
|---|---|---|
| `c49650bbae565188acd02bc45595816463a2a527` | `Test-Change: tests/docs-links.test.ts criterion 6: command literals moved to skills/lifecycle-rules.md` | Accepted. Criterion 6 explicitly moves this literal check to the files now carrying the commands. Merge's attempt-form assertion remains. |
| `e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66` | `Test-Change: tests/run-units.test.ts criterion 1: run-check rule literals moved to skills/lifecycle-rules.md` | Accepted. Criterion 1 removes the local rule copies this old expectation read. The shared file and both unchanged worker-facing copies remain checked. The plan's dated implementation note records this discovered consumer. |

Both files match `src/test-files.ts`. No planned cases, configured runners, helpers or fixtures were skipped, filtered out of the required check command, or disabled. The targeted `-t` commands match the planned criterion proofs. No proof-command replacement requiring an equivalence correction was made.

Read the planning red logs: criterion 5 fails when the new in-folder pointer reaches an absent shared file, and criterion 6 fails because that file is absent. Read the corresponding planned green logs. The completed final-head full test run additionally proves both cases and the changed run-check literal test after the last test-file edit.

Current receipt `3ac7526f-35e2-4a64-a2ea-31eb4cf8006d` is for the reviewed head/tree and contains setup 0, format 0, typecheck 0, test 0. The command is the configured `bun test --timeout=30000 --parallel=4 --no-isolate`: **1163 pass, 0 fail**. Its test log is `implementation/check-test-1794394102627-3121571.log` and was read with `akrogon log`.

The preceding same-head receipt `b1a7f49f-454a-4225-9ab5-4688c887d7a2` has one failing door-reset test, `agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript`, in `implementation/check-test-1794393981361-2778738.log`. Its unchanged-head retry is green. Both logs were read. The leaf changes no reset implementation/test or plausible reset dependency. Classification: **inconsistent**, not a base red. No known-red cover or filing is claimed. No blocked check is reported as passing.

No further check rerun was needed: current committed-head evidence already covers both changed test files and all required checks. No grants/paid/live proofs are part of this leaf, and none were launched. No operator action or Nit remains.

## Kept review evidence

The cited logs were read back using `akrogon log`.

- `check review-B-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-review-B-diff-1794394146531-3742935.log`
- `check review-B-receipts: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-review-B-receipts-1794394176288-3773348.log`
- `check review-B-area-all-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-review-B-area-all-paths-1794394272637-3874558.log`
- `check review-B-final-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-review-B-final-audit-1794394257034-3858856.log`

Requested next phase: `check.repair`, verdict `fix`.

## 2026-11-11 check.repair

Repair starts from reviewed head `e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66`, with unchanged base `81c6bc8338846fb397c55fd46988bcd03d945573`. Repaired head: `085b541307c74cc0dbf78dbc7af09cb63328db18`.

| Finding | Repair and commit | Before/after evidence |
|---|---|---|
| A-F1 | `9384c58965be5e5221cc5402e52092dcd25c2386` removes only the shared `.env.example` parenthetical. The existing merge-local permission is the sole statement of that exception. | `check repair-A-F1: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-A-F1-1794394494067-4098265.log` retains the old/new text and commit. |
| B-F1 | `1f471950f7c9a57da4b3e6b23b5315ba4c309474` defines the shared judging-seat substitution and assigns check's head/base judgment to B in its local stub. All three judgment clauses use that substitution. Plan/implement/check.fix still use A, repair/merge use B, and check.repair's borrow still resolves. A dated plan note records the omitted step required by brief criterion 2. | `check repair-B-F1: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-B-F1-1794394512906-4117015.log` retains the old/new text and commit. |
| B-F2 | `085b541307c74cc0dbf78dbc7af09cb63328db18` records the artifact-only repair. The implementation report now maps 241 semantic clauses from individual old copies, with source/destination references, holders, and ten phase/route reading paths. The commit is empty because the authoritative artifact is outside this branch and the design forbids committing `issues/` paths. | `check repair-B-F2-trace: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-B-F2-trace-1794394655409-71048.log`; `check repair-B-trace-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-B-trace-audit-1794394737452-165649.log`. |

All three are documentation/artifact fixes. Before/after text and the planned judgment proof apply, so no prose-wording reproduction test was added. No existing test expectation, runner, helper or fixture changed. No Fix meets a handoff exception, and there is no operator action. A's N1/N2 remain deferred and unchanged under the Fix-only repair rule. B holds no reusable Nit requiring a lesson entry.

The clause trace was audited against each base paragraph and the repaired destinations, including grant bounds/counts, secret consumption and producer save, output exemptions, the full named/nameless known-red chain, blocked checks, filing, seat-specific endings, fixtures, setup and record files. Its literal reference audit finds no missing file/line references. This is the planned human judgment proof for criteria 2/3, supported by the table, not a test of prose wording. The first trace-generation attempt stopped on a merge-stub punctuation lookup before writing the artifact, then succeeded after that one-off lookup was corrected. The first reference-audit attempt selected the wrong table column, then succeeded after its column selection was corrected. Neither was a product/test failure, neither altered the proof commands, and no helper file was left behind.

### Repair verification

Criteria 1/2/3/7 were rechecked because shared/check text changed. The four symlinks and fresh word counts are retained in `check repair-B-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-B-final-state-1794394768542-354154.log`. The report's counts are current: plan 1587, implement 4105, check 3566, merge 2324, shared 1316, total 12898 versus base 14311. The diff has no whitespace errors and the code worktree is clean.

After the configured flock setup, the exact planned criterion-5/6 commands passed:

- `check repair-link-check: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-link-check-1794394688695-116965.log` — `bun test tests/docs-links.test.ts -t 'README, docs and skill links resolve'`.
- `check repair-known-red-literals: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-known-red-literals-1794394688686-116964.log` — `bun test tests/docs-links.test.ts -t 'seat skills name the known-red command'`.

These planned proofs were written by A, not the repair seat. They ran after the last input change; the later B-F2 commit changes no tree content. Criteria 4 and 8 retain their earlier green evidence because their source/pointer inputs did not change. No grant-covered operation or paid launch occurred. No merge check was run.

Full committed-head verification: `akrogon verify` exited 0 on `085b541307c74cc0dbf78dbc7af09cb63328db18`. Receipt `42fdb760-a8f0-4217-a0c3-614155736f93` records setup 0, format 0, typecheck 0 and test 0. The configured full test command reports **1163 pass, 0 fail**. Log: `implementation/check-test-1794394800132-165774.log`, read back with `akrogon log`. Receipt evidence: `check repair-B-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/lifecycle-rules-source/implementation/check-repair-B-receipt-1794394837846-520393.log`.

All initial Fixes are repaired. No item is handed to A. Requested next phase: `merge`.
