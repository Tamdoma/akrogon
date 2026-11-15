# Territory map: slot B

Independent map, using the intake already read and the operator's signposts `1a 2a 3a 4a 5a 6a`. No product changes or agents.

## Inspected findings

- **F1:** `src/verify.ts::knownRedReceipt` is the shared acceptance function. It requires an eligible whole head row, then matches each unblocked red command to a completed linked base row at the current merge-base. Its test-name parser is the specific obstruction. `completed` already requires an end and successful setup. `sameCommands` already checks the head against the current configured list. Do not duplicate those guarantees.
- **F2:** There are two separate facts today: whether the command accepts a receipt and whether the seat agrees with its causal meaning. The seat's agreement lives in its report, not in `VerifyRun`. `requireGreenReceipt` does not read that report. The signposts retain this division and do not authorize a new persisted approval system.
- **F3:** `failedTests` is also used by flaky reporting and main-red notices. It distinguishes `(no test name)` from `(log gone)`. Removing or changing these sentinels globally would change other consumers. `src/evidence.ts::readLog` already reads plain, moved and archived evidence and reports specific errors.
- **F4:** The old test `a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work` mixes the policy being reopened with guards that must survive. It currently rejects a nameless head against a named base. Other tests reject different named failures and accept later qualifying comparisons. Their expected meaning depends on M1 below.

## Material forks

### M1. Is the function-only gate uniform, or is nameless output a special case?

- **Uniform, recommended:** For every unblocked red configured command, the machine establishes the same command, a red counterpart on a completed linked base run, and readable logs on both sides. The seat judges equivalent failure from logs and diff. Remove test-name comparison from receipt acceptance, retaining it for reporting.
- **Nameless exception:** Keep named-test subset comparison, adding a separate path when the head has no test names. This is a smaller behavioral change but preserves runner-specific output interpretation, makes mixed named/nameless failures asymmetric and leaves two definitions of eligibility.

The operator's signpost 3a lists functional facts only, so the uniform option fits its literal rule. Settle this explicitly: under that option, a named `alpha`/`beta` pair can satisfy machine eligibility while the seat must reject its causal agreement. Do not keep a test asserting machine rejection of that pair without reconciling the chosen rule. A mechanical test cannot prove the seat made the right causal judgment.

### M2. How is missing evidence separated from nameless evidence?

- **Read through the existing evidence interface, recommended:** Use `readLog` for each candidate red pair. Missing evidence makes that candidate ineligible. Preserve specific archive/member errors rather than treating unreadable evidence as a successful read. Reuse existing owner relocation and archive lookup.
- **Reuse `failedTests` sentinels:** Distinguish only `(log gone)` from other returned names. This avoids another log reader but keeps acceptance coupled to test-name extraction and its synthetic strings.
- **Check the recorded pathname directly:** Cheap initially, but rejects valid moved/packed logs and duplicates evidence ownership rules. Reject this option.

Only the paired red logs need the new eligibility read. Do not add a new requirement that green or intentionally blocked entries have independently readable test output. An empty existing log is still evidence that a command emitted nothing. The seat must refuse equivalence if it cannot establish a cause from the available evidence, without a new machine output-content rule.

### M3. Does a completed capture imply complete test coverage?

- **Separate them, recommended:** Preserve the existing `end`/setup eligibility rule. A completed nonzero command can be compared even if its own `&&` chain stops early. The seat judges the same cause and requires the leaf's own done-criteria to prove changed behavior. Untouched hidden work is the inherited gap the operator accepted.
- **Require all internal units to have run:** Recreates the old lock and leaves the reported case unresolved. It would also require interpreting arbitrary command internals or new configuration, both outside the chosen scope.

Do not add an exit-code denylist to infer crashes or timeouts. The receipt has command exits, not a per-command runner-completeness model. A killed or unfinished verification attempt remains insufficient. A command that finished reporting a runner crash is not thereby proof that tests ran. The seat must distinguish those facts from the logs and the change's proof obligations.

### M4. Does the rule change require new receipt state or a new leaf per consumer?

- **One shared predicate and one atomic leaf, recommended:** Reuse the existing linked receipts and reports. Update all consuming seat rules in that leaf. Old receipt rows remain usable only when their existing provenance and evidence qualify.
- **New judgment fields, schema or route-specific exemptions:** Introduces migration, consistency and bypass problems without a requested new decision boundary. Splitting code and seat rules into independently landable leaves also creates a period when the machine accepts evidence the instructions forbid.

## Practitioner questions and lifetime pitfalls

- **P1: Could the same generic error conceal a leaf regression?** Yes. Equal exits and shared diagnostics are not sufficient causal proof. Remove the bypass by retaining diff review, rejecting any plausible leaf cause and proving the leaf's own change, including changed behavior hidden by the inherited failure. A green done-criterion must not be inferred from known-red eligibility.
- **P2: Could a base failure cover work it never ran?** Existing `blocked` entries borrow a blocker's exit and log. Keep skipping them on the head and refusing them as base counterparts. `tests/verify.test.ts` already exercises this rule. Do not change scheduling to force hidden checks through.
- **P3: Could unrelated receipts or config changes provide cover?** Keep the whole eligible head row, current command list, exact command identity, `compares` link and current merge-base checks. Preserve acceptance of a later qualifying comparison rather than letting an earlier bad comparison poison it. Do not assemble a green head from different runs.
- **P4: Could missing logs pass after a rename, cleanup or archive?** Use the existing evidence reader and test both missing head/base evidence and packed evidence. Do not accept `(log gone)` as an unnamed failure. A successful green receipt continues to use its existing rules.
- **P5: Could the command's `pass` be mistaken for causal approval?** State the two obligations consistently in all four seat paths: function eligibility plus recorded seat agreement. Different failures can be mechanically eligible under M1 and must still block when judged different. Avoid new persisted approvals or prose-format validators.
- **P6: Will each leaf report the same inherited failure again?** Retain the existing Lifecycle filing behavior and evidence reuse. `newRedUnits` already deals in nameless synthetic units for notices. Do not redefine its deduplication or flaky identities as part of this fix.

## Consumers and affected surfaces

- **C1: `src/verify.ts::knownRedReceipt`, `noTestNames`, `verify`, `requireGreenReceipt`.** Change eligibility once. `verify` already captures/links the base and skips a whole-green base, which never covers a red head. Both CLI result and subsequent gates must agree. Leave `verifyRunSchema`, `runOnce`, completion and scheduling unchanged unless a concrete failing proof requires otherwise.
- **C2: `src/phase.ts::transition`.** Its move into `check.review` and its `check.repair` move into `merge` inherit the shared leaf receipt rule. No independent exemption is needed.
- **C3: `src/phase.ts::recordTested`, `batchCheck`, `landGates`, `batchPush`.** Merge checks, tested-head stamping and final push gates inherit the shared merge receipt rule. Keep tested-top and rebase boundaries intact.
- **C4: `skills/chart-issues/scripts/direct-guards.ts` top-level guard.** It calls the same merge receipt gate. `tests/receipt-gates.test.ts` covers that route alongside merge stamping.
- **C5: `skills/implement-issue/SKILL.md`, Shared context retry/known-red paragraph and its `implement`/`check.fix` consumers; `skills/check-issue/SKILL.md`, `check.review` known-red paragraph and `check.repair` evidence duties.** Replace the real-test-name condition with the chosen equivalence and own-change proof rule. The brief calls the latter a Shared-context paragraph, but it is physically in `check.review`.
- **C6: `skills/merge-issue/SKILL.md`, Shared endings; `skills/chart-issues/SKILL.md`, Direct route landing step 3.** Both consume command eligibility and seat causal agreement. Carry the same unnamed-failure, hidden-work and incomplete-evidence boundaries. Preserve retries, filing and repair limits.
- **C7: `skills/seed-issue/SKILL.md`, Lifecycle filing.** Already accepts a failing command path, excerpt, revisions and logs without requiring test names. Nameless configured base reds use it unchanged, with no extra proof run or filing turn. Ad-hoc/done-criterion reds retain their existing blocking behavior.
- **C8: `src/flaky.ts::failedTests`, `flips`, `flakyLines`, `flakyCommand`; `src/verify.ts::newRedUnits`, `matching`, `runOnce` notice write.** Shared parser consumers to preserve. Removing its use from acceptance need not change reporting or incident identity.
- **C9: `src/evidence.ts::readLog`, `locate`, `readMember`.** Reuse their relocation/archive semantics and specific errors. No evidence format or storage migration is needed.
- **C10: `src/land.ts::land`, `redRun`; `src/status.ts::scanRepo`; `src/reconcile.ts::reconcile`.** Inspected receipt readers. The land service initially runs ordinary verification and hands red results to a seat. Status reads slow metadata, and reconciliation reads run ownership/end state. They do not need nameless acceptance branches or receipt schema changes.
- **C11: `tests/verify.test.ts`, `tests/receipt-gates.test.ts`, `tests/flaky.test.ts`.** Revise only superseded policy expectations, retain provenance/completion/green-base/blocked/cross-scope protections and add the unnamed route proofs. Flaky tests provide an existing guard against altering reporting semantics.
- **C12: `src/AREA.md`, Key files, verify paragraph.** It currently states named-test acceptance as the current contract. If this repository maintains this surface description with code changes, amend that specific claim, without expanding documentation scope or editing historical chart decisions. `tests/AREA.md` already describes receipt coverage generally.

## Proposed leaf split and standalone proof

**L1: One leaf for configured known-red eligibility and its seat contract.** It owns the shared predicate, directly required evidence handling, affected seat paragraphs and focused regressions. These are one behavior change, not independent features.

L1 can prove alone that a configured compound syntax check with the same inherited missing-file failure becomes mechanically eligible in leaf and merge/direct scopes, while the leaf's change still needs its own proof. Its red-before/green-after test should call the real verify path and confirm the linked base SHA, kept red logs, exit statuses and subsequent receipt gate. It should also prove absent/unfinished/failed-setup evidence, wrong command/link/base and green base do not cover. Under uniform M1, separately demonstrate that differing diagnostics can be machine-eligible and document that the seat's disagreement remains blocking. Existing named-test cases must be reconciled with that distinction rather than indiscriminately deleted.

No consumer-repair, stopped-leaf recovery, scheduler, notice, configuration or schema leaf is justified by the selected destination.

## Smallest observations

**V1, run here:** `bash -c 'bash -n /dev/null && bash -n /dev/fd/2147483647 && printf "third-check-ran\n"'` exited 127 with `No such file or directory`; the third-command marker was absent. This read-only local observation confirms the short-circuit distinction without touching herdr-setup. It is not a verifier regression test.

**V2, required implementation proof:** Add the isolated real-CLI regression in L1, observe its new acceptance assertion fail before the change, then pass afterward. Use the existing `fixture`, `callerWorktree`, `fakeAkrogon` and verify helpers. No live or paid observation is needed before handoff. Existing source and tests settle the failure mechanism; causal judgment and own-change proof remain explicit seat obligations.
