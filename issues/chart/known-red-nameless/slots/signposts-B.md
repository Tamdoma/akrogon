# Signposts proposal: slot B

Independent view for known-red-nameless. These are proposed answers, not operator decisions.

The central choice is a policy change. The earlier `red-base-wait` comparison explicitly rejects command-exit comparison and short-circuited coverage. The reported command stops before its third syntax check. Accepting its identical base failure therefore requires deciding what unexecuted work may remain unverified, not merely removing the test-name guard.

## Questions

### Q1. May this session reopen the earlier lock for non-test failures?

- **1a (recommended):** Permit a configured command that names no tests to qualify as known-red when completed head/base evidence establishes the same failure and the seat finds no plausible cause in the leaf diff. Explicitly reopen the earlier ban to that extent.
- **1b:** Keep the earlier lock. Resolve the consumer's broken check before allowing leaves forward.
- **1c:** Accept matching nonzero exit codes alone for any command.

Steers: the destination, acceptance criteria, receipt eligibility and seat rules. Recommend 1a because 1b leaves the reported interruption intact and 1c cannot distinguish unrelated failures. A missing log or unfinished verification attempt remains insufficient evidence.

### Q2. What proof must replace work hidden by the shared failure?

- **2a (recommended):** Require proof for changed behavior that the blocked or short-circuited work would have checked. Existing done-criteria evidence can supply it. Untouched work hidden by the same base failure need not all be rerun before the leaf proceeds.
- **2b:** Require every hidden unit to run, including untouched units. Identical command failures alone cannot clear the reported compound check.
- **2c:** Waive all hidden work whenever the command qualifies as known-red.

Steers: the remaining boundary of the earlier completeness lock, handling of `&&` commands and blocked checks, review duties and negative regression cases. Recommend 2a as the explicit tradeoff: the leaf must prove its own change, while inherited gaps do not stop unrelated work. It does not label skipped tests as executed or passing. If the changed behavior cannot be proved, the leaf still stops.

### Q3. Must failure equivalence mean identical text, or the same demonstrated cause?

- **3a (recommended):** The seat judges the same substantive failure from both kept logs, recorded exits, command identity, revisions and material conditions, together with the diff. Differences such as checkout paths do not by themselves disqualify the comparison.
- **3b:** Require identical nonempty output and exit status. Any output difference remains blocking.
- **3c:** Require only matching exit status.

Steers: what evidence is sufficient, how much judgment stays with the seat, whether output normalization is needed, and tests for unrelated failures sharing an exit code. Recommend 3a under the operator's function-over-form principle. Mechanical validation can establish that evidence exists and belongs to the compared runs. It cannot establish causal equivalence from a generic exit code.

### Q4. How far does the changed rule reach?

- **4a (recommended):** All existing configured-check known-red routes: implementation, review, merge and direct landing. Carry the same eligibility and judgment rule through their consuming instructions. Keep independent done-criterion requirements intact.
- **4b:** Only `check.review` and the reported syntax-check case.
- **4c:** Also repair consumer configuration, recover stopped consumer leaves, and change handling of ad-hoc or done-criterion failures.

Steers: owned surfaces, route coverage and regression scope. Recommend 4a because one configured check should not be accepted at review and rejected again at merge. The herdr-setup configuration defect and stopped leaf remain recorded outside this chart's destination.

### Q5. What proof spending and external reach are authorized?

- **5a (recommended):** Deterministic local fixtures and required repository checks, using isolated repositories and captured command failures. No paid calls, live consumer changes or consumer-leaf replay.
- **5b:** Also rehearse against a disposable local reproduction of the consumer command.
- **5c:** Require a live replay or recovery of the reported consumer leaf.

Steers: acceptance evidence, test isolation, completion conditions and operator grants. Recommend 5a. Fixtures can demonstrate matching nameless failures, different causes with the same exit, absent/incomplete evidence, hidden changed work and the existing named-test path without touching the consumer.

Proposed reply: `1a 2a 3a 4a 5a`.

## Operator-only needs

The signposts answer must explicitly settle reopening the earlier operator lock in Q1 and the proof boundary in Q2. That decision should not be inferred from identical output or silently supplied by a later fork.

Keys, paid or live grants, and external-action approvals: none under the recommended scope. No access to the watcher or reporting consumer is needed for this consultation.
