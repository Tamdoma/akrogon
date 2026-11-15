# Disagreement-only rebuttal: coverage-rule, slot B

## Q2. “Could not load” is an additional exclusion

The merged rejection of 2b says 2a already stops a runner that “could not load.” That is broader than 2a's explicit crash/interruption exclusions. A command can finish by its own verdict with a configuration or module-load diagnostic, name no tests, and reproduce the same inherited cause on the base. Lack of test execution alone cannot settle eligibility after signpost 2a.

Keep the distinction between an ordinary completed error verdict and a crashed, killed or timed-out run. Require causal agreement and independent proof of the leaf's changed behavior. Do not add a blanket load-failure exclusion through the reason for rejecting 2b.

Evidence: operator signposts 1a and 2a, 2026-11-09, accept nameless configured failures while retaining own-change proof duties. Inspected `src/verify.ts::runOnce` records command completion separately from blocked work. The selected 2a text excludes crashes and interruptions, not every command that reports an inability to load an input.

What would change my mind: an explicit operator boundary that all runner load failures remain excluded, or evidence that “could not load” here means an unfinished/crashed run rather than an ordinary error verdict. If the leaf's own proof cannot pass, that specific leaf still stops under the existing agreed condition.

## Q3. Choose an omitted option: apply the inherited-gap rule to blocked entries

**Proposed 3d:** Once the blocker is an agreed known-red, keep the blocked entries recorded as unexecuted. Untouched work behind that same inherited failure does not independently stop the leaf. The leaf must still prove its changed behavior through its own done-criteria. A blocked entry cannot supply base coverage or proof that it ran.

I disagree with 3a. It makes identical verification work acceptable when written inside one `&&` command but blocking when expressed as a separate configured check. That distinction does not appear in the selected signpost 2a: “untouched work hidden by the same base failure does not stop it.” Signpost 5a carries the changed rule through every existing configured-check route. Neither explicitly confines the inherited-gap allowance to one shell command.

Evidence: operator signposts 2a and 5a, 2026-11-09. Inspected `src/verify.ts::knownRedReceipt` already skips blocked head entries and refuses blocked base counterparts. `runOnce` records blocked work explicitly. Thus 3d needs no new scheduling, automatic execution or receipt state. The remaining change is to reconcile the seat's unconditional “blocker is fixed first” sentence with the operator's chosen rule.

The cost of 3d is the accepted inherited verification gap, potentially including full suites. It must be stated plainly. The protection remains independent proof of everything the leaf changes. If that proof cannot be established, the leaf stops. Do not claim skipped suites passed.

What would change my mind: an operator decision explicitly limiting signpost 2a to work inside the red command and retaining unconditional stops for separately configured blocked checks. The reported consumer lacking such checks shows that 3a fixes that example. It does not establish that the narrower policy matches the operator's selected rule.

3b and 3c add execution to recover coverage. They are unnecessary for 3d and change the selected tradeoff from accepting inherited gaps to filling them. I do not recommend either.
