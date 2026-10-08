# Layout scope — blind Slot B notes

Read Intake and Layout scope Question/Carries. No layout-scope-A.md or merged file read. No live pane mutations. All evidence below inspected 2026-10-08, installed Herdr version 0.9.3. Repository references are relative to /home/ivan/Work/infra/akrogon.

## Q1 — Replacement repair or permanent order enforcement?

### 1. Pick, reason and cost

Recommend the local repair: when the recorded A is absent and the recorded B survives in the reused leaf tab, split B to the right, then swap the new pane with that B by explicit IDs. Preserve B's pane identity and agent session. The new A ends up in B's former position and B in the new right-hand position. Do not reorder already-present A/B panes or unrelated operator panes.

This matches the chart's stated scope and the reported reproduction. Cost: allocation gains a mutating swap operation, and failure between split, swap and state save must be handled explicitly. This is not a promise that manually rearranged seats are corrected on every next pass. A replacement may change the widths occupied by B as an inherent consequence of splitting its former area.

### 2. Rejected options and reasons

- Enforce A left of B after every allocation: can undo operator rearrangements and requires a policy for vertical layouts, extra panes and arbitrary split trees. Geometry inspection makes this technically possible but does not make that expanded policy necessary for #60.
- Split left: the installed split command only accepts right/down. This is not a supported API option.
- Relabel surviving B as A and create a new B: preserves visual order by breaking seat identity, potentially routing work to the wrong session or harness.
- Recreate the whole tab: interrupts the surviving B agent and any operator panes for a local layout defect.

### 3. Evidence, tier, source and date

- Operator tier: `issues/chart/seat-a-left/INTAKE.md`, https://github.com/Tamdoma/akrogon/issues/60. The reported split-right followed by explicit-ID swap restored layout on five live tabs. This is operator evidence, not a fresh proof performed by Slot B.
- Better-than-training, repository source: `src/next.ts:414` resolves recorded seat IDs among tab members; `src/next.ts:417` creates missing A right of surviving B; `src/next.ts:427` keeps surviving B. The combination explains the defect without relying on pane-list order.
- Better-than-training, tests: `tests/next.test.ts:1856` covers neither/A/B/both missing with an extra operator pane. It preserves recorded seat IDs, checks the split parent at :1886, and checks prompt routing at :1888. It does not establish geometry. The intake's :1888 pointer is the prompt assertion, not the split-parent assertion.
- Better-than-training, fake: `tests/fake-herdr.ts:123` implements split by appending a pane at :136. It does not model the parent-relative split tree or rectangles. There is no swap implementation, so swap reaches the final unexpected-invocation error at :202. Array order is not a sound substitute for geometry under this fake.
- Better-than-training, installed primary CLI: `herdr pane split --help` permits right/down; `herdr pane swap --help` accepts --source-pane and --target-pane. `herdr pane list --help` offers a workspace filter. Actual pane list/get output contains identity/session/status fields but no pane position rectangle. Do not infer visual order from those arrays.
- Better-than-training, measured read-only CLI: `herdr pane layout --help` supports --pane <ID> or --current. `herdr pane layout --current` succeeded and returned `result.layout.panes[]` entries containing pane_id and rect {x,y,width,height}, plus the tab ID and split-tree rectangles/ratios. Observed three-pane example: x=0,width=77 for the left pane; x=77,width=42 for each of the two right panes at y=0 and y=19. This exposes real position evidence without moving anything. Explicit --pane should be used for a disposable proof tab, avoiding focused-pane assumptions.

### 4. Pitfalls and what removes each

- Seat identity confused with visual order: use recorded pane IDs to choose the surviving B and explicit swap endpoints. Keep the extra-pane and recorded-seat regression outcomes.
- A command-recording test passes while layout is wrong: extend the fake with the minimum parent-relative layout model and swap semantics, then assert new A lies left of the same B. Independently ground that fake behavior with a real disposable split/swap/layout probe before handoff. The right/left relation can be observed as A.rect.x + A.rect.width <= B.rect.x, with matching vertical span for the sibling split. Do not require a fixed list ordering.
- Swap fails after split, leaving an unrecorded A: require error propagation, no prompting of the incorrectly positioned replacement, and an explicit repeat-next outcome. Current allocation saves the tab before pane creation (`src/next.ts:410`) and final pane IDs only after allocation (`src/next.ts:435`). Simply inserting swap before the final save can orphan a new pane and cause another split next time. Saving A first without recording unfinished placement can instead make the next pass skip the repair. The leaf must choose a concrete recoverable sequence, not silently swallow the swap error.
- Blind retry reverses an already-successful swap: swapping the same IDs twice restores the bad order. If retry/recovery is needed, inspect geometry to distinguish an unapplied operation from a completed swap whose reply was lost. The generic retry helper (`src/shell.ts:54`) must not be applied blindly to this operation.
- Live proof disturbs operator work: the door's later probe must create its own disposable tab, use returned IDs, read layout before/after, verify seat identity, and clean up only that tab. This brief forbids pane mutation, so no split/swap or cleanup probe was performed here. Help proves available arguments and the read proves geometry exposure, not swap identity/focus/ratio behavior.

### 5. Questions missing from the fork

- What must the next next invocation do after split succeeded but swap failed or its acknowledgement was lost? This is a material recovery question for the local fix. Recommend no duplicate replacement panes and no wrong-seat prompts, with recovery based on the observed position of the identified replacement.
- Does “left” mean A precedes B within their split area, leaving other panes where they are? Recommend yes. The chart scope does not require A to become the leftmost pane in an arbitrary tab.

## Bootstrap inspection

There is no corresponding A/B order defect when both seats are missing in an existing tab:

- When both recorded IDs are stale/absent but still stored, bootstrap is false (`src/next.ts:416`). A is split right of members[0], then B is split right of that new A (`src/next.ts:423`, :431). A remains left of B within the newly created pair. The operator pane need not be leftmost or adopted as a seat.
- When neither A nor B ID is recorded, bootstrap is true. A adopts members[0], and B is split right of A (`src/next.ts:419`, :431). Again A precedes B. `tests/next.test.ts:1900` separately exercises interrupted/recreated allocation.
- A newly created tab uses the same bootstrap route and also puts B right of A. Replacing B alone likewise splits right of surviving A. Those paths need preserved behavior, not the new swap.

Only missing A with surviving recorded B needs the reported layout repair. The current fake's append-only ordering cannot by itself prove any of these geometric conclusions, but the inspected right-split sequence explains them under the CLI's split semantics.
