# Archive boundary: independent round B

Read the assigned Question and Carries, related forks, intake, and live code/docs/tests. Did not read this fork's Findings or other peer slot files. References are relative to the akrogon root. Research concerns repository-owned behavior, so primary code and local contracts are the applicable sources. No outside source was needed or searched. No runtime probe or implementation performed.

## Q1. What keeps chart files outside leaf inventory?

**O1 (recommended): stop moving charts at owner completion.** Keep `issues/chart/<chart-slug>/` in place. Continue moving completed lifecycle records into `issues/closed/<owner>/`.

Why: the contaminating operation is exactly `src/phase.ts:173-174`. Both inventory implementations already limit roots to open/closed (`src/next.ts:110-113`, `src/state.ts:104-107`). Removing this operation preserves that existing separation without adding exceptions to each reader. The door already retains charts after handoff (`skills/chart-issues/SKILL.md:67`, `skills/chart-issues/assets/shapes.md:15,36`), and `status --charts` reads the chart store only (`src/status.ts:275-285`). Those contracts do not explicitly prohibit moving charts at eventual completion, so this is a proposed completion policy, not merely enforcing unambiguous existing wording.

**O2: retain the move and exclude the archived chart subtree from leaf traversal.** This can protect existing archives containing draft state files. It adds a reserved-path rule to `discover` and `leavesUnder`, whose consumers include detailed status, phase lookup and park dependency checks (`src/state.ts:93-107,133-135`, `src/status.ts:292`, `src/park.ts:39-42`). It also keeps completed charts outside the current chart listing. Choose this only if grouping chart evidence with the closed owner is a required outcome.

**O3: rely on the door writing no draft `state.yaml`.** This aligns with `skills/chart-issues/assets/shapes.md:15` and is useful in the draft-contract fork, but is insufficient as the inventory boundary. The supplied incident demonstrates that a door can place executable-looking drafts in retained evidence. Completion would still transfer arbitrary evidence into a recursive state reader (`src/next.ts:95-108`).

Practitioner challenge: “Does O1 fix existing contaminated archives?” No. The intake reports that live misplaced states were already renamed and consumer repair is explicitly out of scope. O1 prevents recurrence through completion, not arbitrary malformed files in closed. Do not describe it as automatic repair of historical archives. If support for unrenamed historical archives is required, that changes the contract and makes O2 or an explicit recovery operation necessary.

My opening map preferred O2. This round recommends O1 because preserving archive placement is not a supplied requirement, while removing the transfer avoids introducing a second directory classification rule.

## Q2. Should completion append `Closed <YYYY-MM-DD>` to retained CHART.md?

**O4 (recommended): no automatic marker change in this fix.** Leave the existing handoff record intact. `Handed off` continues to mean contracts were handed off, not that implementation remains unfinished. Lifecycle completion remains recorded by merged states and the closed owner. The chart door defines the markers and last-marker precedence, but does not require lifecycle completion to author them (`skills/chart-issues/SKILL.md:67`). This confines the change to the archive boundary.

**O5: append Closed on full owner completion.** Choose this if `status --charts` must show implementation completion. The existing renderer already displays the last `Closed` marker (`src/status.ts:267-272`, `tests/status.test.ts:480-515`). This is a new producer of chart metadata and needs explicit semantics: only full owner completion, a known chart-owner association, no invented chart for owners without one, and a defined failure/retry order.

Practitioner challenge: “Will a completed chart keep showing handed off?” Yes under O4. That is accurate handoff history, but it is not an implementation progress indicator. If the operator expects that indicator, O5 is the appropriate product choice, not a prerequisite for keeping drafts out of inventory.

## Pitfalls and acceptance boundaries

- R1: A blanket rule to skip directories named `chart` could hide a valid depth-2 leaf or depth-3 child under that slug. Current validation permits those depths without a reserved-name rule (`src/state.ts:86-101`). O1 avoids that new ambiguity. Preserve existing invalid-depth diagnostics (`tests/state.test.ts:114-135`, `tests/next.test.ts:2102-2133`).
- R2: A Closed append after moving the owner can fail after irreversible-in-this-command progress. `completeOwner` immediately returns for already-closed leaves (`src/phase.ts:139`), so retry cannot simply finish the append. Writing the marker first instead risks reporting closure before a failed move. O5 must settle this explicitly rather than adding one unchecked append after `renameSync` (`src/phase.ts:171-174`).
- R3: Existing closure and source-close retry tests require the chart to move (`tests/phase.test.ts:169-185,638-683`). For O1, replace those expectations and include a retained chart with nested state.yaml drafts, then verify real-leaf lookup and healthy dispatch after standalone and epic completion. Assert chart files remain unchanged under O4. Keep unrelated unreadable-capacity policy in its own fork.

Decision requested: choose Q1's boundary and Q2's metadata behavior. B recommends O1 + O4. Draft naming remains for draft-contract; historical consumer repair remains outside this chart's scope.
