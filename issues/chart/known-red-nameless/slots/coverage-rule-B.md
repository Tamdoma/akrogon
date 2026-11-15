# Blind notes: coverage-rule, slot B

## Q1. Mechanical acceptance

### Pick, reason and cost

**Pick 1b.** The operator's signpost 3a explicitly assigns the command functional facts: same command, both red, completed runs and present logs. Failure equivalence belongs to the seat. Apply that division uniformly rather than making eligibility depend on which output happens to match bun's test-name convention.

Cost: named `alpha`/`beta` pairs become mechanically eligible. Existing tests that treat their mismatch as a machine veto must change deliberately. The seat must still reject different failures, so this changes the machine's responsibility without broadening what the combined command-plus-seat judgment may accept. All four seat paths must carry that obligation in the same change.

### Rejected options

- **1a:** Keeps a runner-specific output parser in acceptance and treats its synthetic nameless marker as a failure identity. A named/nameless boundary does not establish whether causes match. It also preserves two mechanical policies despite the explicit function-only signpost. Its smaller behavioral diff is its benefit, but does not outweigh this mismatch.
- **1c:** Adds exit-code equality to 1a without establishing cause. Different failures can share an exit. Equivalent substantive failures can have different exits through wrappers or reporting changes. It retains 1a's costs and adds another output-dependent restriction the signposts did not select.

### Evidence

- **Tier operator, 2026-11-09:** `forks/signposts.md`, Question 3 and Taken. The selected functional gate lists facts only and gives causal judgment to the seat. Questions 1 and 2 preserve missing/unfinished-evidence refusal and the leaf's own proof duties.
- **Tier operator, 2026-10-10, read this session:** `issues/chart/red-base-wait/forks/comparison.md`, Taken. The old rule refused unverified work. The new signposts explicitly reopen that policy within stated limits. They do not authorize treating matching nonzero exits as causal proof.
- **Tier better-than-training, inspected 2026-11-09:** `src/verify.ts::knownRedReceipt`, `completed`, `sameCommands`, `requireGreenReceipt`, `verify`. The shared gate already supplies head eligibility, exact command matching, completed linked base runs and merge-base identity. It currently adds failed-name subset comparison, so 1b requires removing that acceptance responsibility explicitly.
- **Tier better-than-training, inspected 2026-11-09:** `src/flaky.ts::failedTests` and `src/evidence.ts::readLog`. Parsing and evidence lookup serve different purposes. `readLog` already handles moved/packed logs. `failedTests` is also used by notices and flaky reporting, which do not need to change.

### Pitfalls and what removes them

- **R1: A mechanical pass becomes mistaken for approval.** All seat paths must state that receipt eligibility plus recorded causal agreement is required. Preserve disagreement as blocking, including named mismatches. Do not introduce a persisted approval field or prose-format validator.
- **R2: New eligibility accepts absent evidence.** Read each red head/base log through the existing evidence interface. A missing log cannot cover. Keep completed/setup, command, link and base guards already present. Preserve specific archive errors rather than converting unreadable evidence into success.
- **R3: Replacing the parser changes reporting identities.** Remove it from acceptance only. Keep `failedTests`, notice deduplication and flaky reporting behavior intact.

### Question the fork does not ask

Which current negative tests now prove machine ineligibility, and which asserted causal mismatch that now belongs to the seat? Explicitly classify the named mismatch tests, the later-comparison test and the mixed unnamed-head/named-base test before changing expectations. Missing logs, unfinished runs, wrong links/commands and green bases remain machine negatives.

## Q2. Seat judgment

### Pick, reason and cost

**Pick 2a.** Judge evidence and behavior, not whether the configured command looks like a test runner. An ordinary runner can exit by its own verdict before naming tests because configuration or an input is broken. The operator selected unchanged own-change proof duties as the protection against hidden regressions.

Cost: the seat must read both full logs, inspect the diff, distinguish a completed command verdict from a crash/interruption and check the leaf's own proofs. This is substantive review work. A machine-eligible pair remains blocking if the seat cannot establish those facts.

Interpret “the head log shows no failure the base log lacks” as substantive failure coverage, allowing irrelevant checkout-path differences. It must not become exact text matching or a demand to find identical sentences. Under 1b, the seat must apply equivalent causal scrutiny to named failures too.

### Rejected option

**2b:** A blanket test-runner exclusion makes command classification another policy gate without a configuration marker. The same underlying validator can be called directly, through a test runner or through a shell wrapper. Classification adds ambiguity and can exclude valid ordinary failures while doing nothing to prove the leaf's changed behavior. It is stricter than the operator's selected boundary.

### Evidence

- **Tier operator, 2026-11-09:** `forks/signposts.md`, Questions 1–5 and Taken. Own done-criteria still pass independently. Untouched hidden work does not block. Plausible leaf causes, absent evidence and unfinished runs never cover. No new configuration is permitted.
- **Tier operator, report dated 2026-11-09:** `INTAKE.md`, Observation and Agent findings. The reported syntax-check chain stops at its second file, leaving its third file unchecked. Requiring all hidden work would recreate the rejected policy.
- **Tier better-than-training, inspected 2026-11-09:** `src/verify.ts::runOnce` and `verifyRunSchema`. A receipt records command exits, blocked entries and overall completion. It does not record an independent per-command test-runner completion classification. The seat cannot infer complete internal coverage from receipt completion alone.
- **Tier better-than-training, measured 2026-11-09:** The read-only local command recorded in `slots/map-B.md`, V1, exited 127 at a missing file and did not execute its third command. This confirms short-circuiting, not causal safety or verifier acceptance.

### Pitfalls and what removes them

- **R4: The inherited failure hides a regression introduced by the leaf.** Require the leaf's own done-criteria to prove the changed behavior independently, including changed work hidden by the failure. If that cannot be proved, stop. Known-red eligibility cannot substitute for that proof.
- **R5: A finished capture is mistaken for a runner finishing its work.** Judge the command's verdict and the logs. Keep killed, timed-out and crashed runs outside 2a. Do not guess them from an exit-code denylist or add command-kind configuration.
- **R6: One route keeps the real-test-name condition or demands fixing every inherited blocker first.** Update implementation, review, merge and direct landing together. Reconcile their blocked-check wording with the chosen inherited-gap rule while preserving refusal to use a blocked base entry as evidence.

### Question the fork does not ask

What happens when both logs exist but emit too little to establish a cause? The answer should be that the machine can establish evidence availability while the seat withholds causal agreement and keeps the existing blocking path. Do not add a new minimum-output rule, parser or fallback to guess the missing cause.
