# Position B: chart-issues

## Recommendation

Rewrite the owned skill and its four assets as one attended door, keeping the workflow in SKILL.md and concrete artifact shapes in the assets. Delete the three absorbed skill directories and the chart's installer, fixtures and tests. No command changes, replacement installer, prose-validation framework or new lifecycle state are needed.

The locked brief and design govern this position. Slot A's position was not read.

## Grounding and read-first paths

- Authoritative leaf: `issues/open/akrogon-loop/doors/chart-issues/brief.md` and `design.md` in `/home/ivan/Work/infra/akrogon`.
- `skills/chart-issues/SKILL.md` and its `assets/{question-authoring,materialization-contract,seed-shapes,standing-design}.md` are the owned surfaces.
- `src/config.ts`, `src/state.ts`, `src/routing.ts`, `src/pull.ts` define repo resolution, accepted leaf fields, initial phases and imported source identity.
- `tests/helpers.ts`, `tests/fake-herdr.ts` and `tests/next.test.ts` provide the existing isolated command-scenario pattern.
- `learnings/LESSONS.md` was read as evidence about prior work. Its review-by-reading and dangling-link cases support executing the handoff scenario and reporting references outside this leaf's scope. No history claim needs additional verification for this position.

Resource gap: effective config says `grounding: none`, so there is no configured top index or linked area to read. README.md describes the bootstrap snapshot and cannot override the live command. Index and lesson maintenance belong to retire-old, not this leaf.

## Concrete changes

### D1. One short workflow with explicit reference triggers

SKILL.md starts with compaction recovery, names `akrogon` as its dependency, preserves the four Pocock lines, and covers open, decision, handoff and printed footer. Keep comfortably below 300 lines, 4,000 tokens and 20 substantive rules, judged by a reader rather than a sentence parser. Do not hide the old long workflow in an asset to meet the cap.

Read question-authoring when forming a map or operator batch, seed-shapes when consuming intake, materialization-contract when preparing handoff, and standing-design when emitting binding design. Keep each contract in one place. Remove the old installer/version-comparison workflow and all owned pointers to deleted machinery.

### D2. Open, drain and stop have distinct outcomes

The first reply identifies the operator-named B pane or says single slot. This is separate from implementation debate. Open runs `akrogon pull`, reads the source list and offers lesson pruning. An unregistered or non-GitHub repo is reported and charting continues, without claiming a fresh mirror. Other pull failures remain visible failures, not a successful refresh.

Inspect `issues/seeds/*.md` and legacy `issues/open/<slug>.md` reports. Extract GitHub identity from the current mirror's `Source: owner/repo#n` line. Skip identities already recorded in sources in open/closed leaf states or chart intakes. Preserve imported text verbatim and put scope, source ownership and agent findings outside that copied text. Legacy reports without a GitHub identity retain their source path as intake provenance, not a fabricated GitHub state source.

Map proportionally before grilling. Where B is present the opening map is blind. Show a proposed split by destination and speed of resolution before writing. Shared destination and independent acceptance permit parallel leaves, while independent destinations become separate charts. File overlap alone imposes no ordering.

A drain creates `issues/chart/<slug>/{CHART.md,INTAKE.md,decisions/}` for each destination and stops for the operator to choose, including a drain that yields one chart. An attended single-item map with no unspecified work still writes that chart structure, then goes directly to handoff. This distinction preserves both locked stop behavior and the single-issue fast path.

### D3. Keep independent thinking and operator ownership explicit

For each decision, B receives intake, the Question and carries, relevant decision paths, locks and verbatim operator corrections. A's draft and current Findings stay out of that input. Both positions finish before A reads B's batch and merges attribution tags `(A)`, `(B)` and `(both)`. B gets one disagreement-only rebuttal, which A includes in the operator's challenge check.

Return peer work through named files under the chart, using a small `questions/<id>.md` convention while there is no leaf. After handoff peer answers use `<leaf>/questions/<id>.md`. Files carry answers, not readiness or lifecycle state. Remove the existing question-authoring requirement to read entire peer panes and its contradictory “no file” instruction. A owns the interview and recording, and B answers direct operator requests in its own pane.

An operator-added mechanism or changed contract gets one focused B check before recording. A restatement does not. Preserve the useful decision lifecycle: sharp questions become files, resolutions carry rationale and foreclosed alternatives, answers reshape remaining questions, and termination requires both resolved questions and no material unspecified work. Do not retain unrelated research machinery or old migration lanes simply because they are in the current skill.

### D4. Handoff writes the command's current contract

Use the configured authoritative repo root, never the inert issues copy in a worktree. The selected repo must be registered before leaf materialization. Continuing a chart after an unregistered-repo pull failure does not authorize creating undispatchable state or require restoring proposal-output mode.

Ask the implementation debate question once at the door, default yes, with very small issues using no and skipping the question. There is no separate consult election. Identify genuinely human-only work early, warn the operator, and complete known human prerequisites before opening a leaf. Do not reintroduce a parking state.

Materialization-contract owns these shapes:

- An issue with leaves is `issues/open/<issue>/<leaf>/`; two or more issues can be enclosed by `<epic>/`. ISSUE.md and, when applicable, EPIC.md list immediate children with one-line purposes.
- A brief has What, Why and executable Done-criteria. A design copies binding decisions verbatim and supplies Leaf architecture. Preserve the substance of standing security and verification constraints, replacing obsolete chunk/gate/parking language with the current worker, checker and human-step behavior.
- State contains slug, phase, created, priority, repo, debate, blocked-by and sources. Use `sources: []` for direct input so the brief's explicit handoff criterion is covered. Include `hand_built` only when true. Quote debate values as strings. Initial phase is `plan.positions` for yes or `plan.synthesis` for no. Do not prepopulate command-owned attempts, done, pane, tab or worktree fields.

Check repo-wide leaf slug uniqueness against open and closed trees and all proposed leaves. Check occupied destinations before writing. Resolve every blocked-by against a real existing leaf or a leaf being emitted in this handoff. Validate the complete proposed set first, then emit prerequisites before dependents so no written leaf points to a missing folder. Reject nonexistent dependencies before opening the affected leaf. No dependency is invented for file overlap or presentation order.

Assign each GitHub report one completion owner, an issue or epic, and copy its source identity into every leaf below that owner. A source shared by two issues therefore belongs to their epic rather than unrelated completion owners. Keep charts where created and append `Handed off <date>` only after the handoff is valid. Print Last operation and Next, with `Next: none` at the door. Do not invoke next or a chart phase transition.

### D5. Replace obsolete assets and remove absorbed doors

Rewrite seed-shapes as input examples for current GitHub mirror reports and legacy proposals, including provenance and undecided proposal handling. It no longer emits portable proposal trees or a second materialization mode. Replace materialization-contract and standing-design with the handoff above, and shorten question-authoring around intelligible questions, evidence, the challenge check and the actual peer protocol.

Delete all of `skills/create-issue/`, `skills/braindump-issues/`, `skills/consolidate-issues/` and chart-issues/{fixtures,scripts,tests}. Search all owned files for obsolete references and inspect repository-wide hits to report out-of-scope consumers without editing them. Preserve unrelated changes.

## Acceptance evidence

### A1. Fresh-reader workflow scenarios

Give a fresh agent the rewritten skill and its triggered references, not this position, and have it describe concrete actions for: a tiny direct request without B, a named-B decision with a late contract change, and a drain with duplicate sources and multiple destinations. The reader should identify chart creation, stopping behavior, blindness, one rebuttal, human prerequisites, the one debate election, provenance and final handoff without guessing. Semantic review judges the rule budget and instructional completeness. File counts, token counts and literal schema fields may be mechanically checked.

### A2. Real isolated handoff and dispatch

In a temporary Git repo beneath an isolated AKROGON_HOME, register the repo and use the new handoff asset to write an epic with two issues, their indexes and valid leaf briefs/designs/states. Include a debate-no leaf with sources and a debate-yes case. Parse emitted state with the live readState/stateSchema. Verify unique slugs, preserved source text, owner-wide sources and retained chart with handoff date.

Attempt a missing blocked-by and demonstrate the handoff refusal before the invalid leaf is opened. Separately exercise the command's existing missing-dependency rejection for defense against externally malformed state. The latter alone does not prove the handoff's preflight worked.

Use the existing tests/helpers.ts and fake-herdr.ts pattern to run the real CLI next only inside this verification sandbox. Check and print `plan-issue <slug> slot=B phase=plan.synthesis` for the no-debate leaf and verify the appropriate positions dispatch for yes. Substitute herdr and any gh calls at the executable boundary. Use no real panes, socket, install roots or GitHub. Keep command results and reader findings as implementation evidence, then delete temporary helpers and sandboxes. Do not add persistent tests that merely mirror prose or recreate deleted skill fixtures.

### A3. Scope and regression checks

Verify folder deletion, local links, main skill size and owned absence of the retired terms specified in done-criteria. Run the configured format, test and typecheck commands during implementation, recording results. The checker independently verifies the handoff scenario. No tests were executed in this planning pass because no implementation has been made.

## Risks and limitations

- R1. Removing only SKILL.md's stale instructions would leave active contradictory asset contracts. Rewrite all four assets together, particularly pane transport, proposal output and standing human-step language.
- R2. The CLI schema accepts state but does not author handoffs. Existing next tests cannot prove that an agent follows the new handoff, so the fresh-reader and emitted-artifact exercises are necessary evidence.
- R3. Unregistered repositories can be charted but cannot dispatch leaves until registration exists. Registration/init, pull implementation, seed-issue text, repository index and lessons are explicitly outside this leaf. Report their gaps rather than extending scope.

## Simpler alternative

Patch the existing skill in place and retain most assets. This reduces immediate editing but leaves duplicate modes, the wrong state phase, installer references and pane-answer rules competing with the new instructions. A short workflow and four focused assets remove those conflicts without adding executable machinery. No execution dependency on another leaf is required by the current checkout: pull, state parsing, routing and the fake-herdr boundary already exist.
