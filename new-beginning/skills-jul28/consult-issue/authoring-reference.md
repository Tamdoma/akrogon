# Consult Issue Authoring Reference

## Contents

- Question Duplication Contract
- Canonical File Model
- Required User Intent Block
- Review Lenses
- Single-Agent Review Standard
- Plan Editing Rule
- Checklist Quality Bar
- File Roles
- Disagreement Walkthrough Standard
- Synthesis Rule
- Approval Templates
- Output Standard

## Question Duplication Contract

### Question Authoring Standard

- **Self-contained background:** state the decision context in plain language, define necessary jargon at first use, and explain why the answer matters.
- **Current-state inventory:** before or within the first question batch, enumerate the relevant existing surfaces, settled constraints, and known gap so the operator does not have to reconstruct prior context. Bound this to what the current choice needs; do not replay issue history.
- **Consequence-bearing options:** every option description states the concrete behavior, scope, or tradeoff that selecting it authorizes.
- **Evidence-based recommendation:** when evidence favors an option, place it first and mark it recommended; when evidence does not favor one, do not manufacture a recommendation.

These rules govern question content only. They change nothing about when the gate fires, how questions batch, or how the gate terminates.

Any operator-facing question this skill asks follows the Question Authoring Standard.

The two `### Question Authoring Standard` blocks must remain word-for-word identical.

## Canonical File Model

Each phase should use:

- `plan.md`
- `a.md`
- `b.md`

Preferred structure:

- `planning/plan.md`
- `planning/a.md`
- `planning/b.md`
- `implementation/plan.md`
- `implementation/a.md`
- `implementation/b.md`

The repo `skills/` tree is canonical. Install trees are byte-identical deploy targets except for their install-root `slot-default` markers; edit the repo source and deploy it with `sync-payload.ts deploy`.

## Required User Intent Block

At the top of every new or rewritten `plan.md`, include a robust intent section near the top.

For planning, use:

- `## User Intent Snapshot`
- `Requested change`
- `Outcome sought`
- `Why this matters now`
- `Constraints and exclusions`
- `Decision trigger`

For implementation, use:

- `## Inherited Intent Snapshot`
- `Requested change`
- `Execution outcome sought`
- `Why this implementation matters now`
- `Constraints and exclusions`
- `Complexity posture`
- `Execution trigger`

Keep this section short, concrete, and user-centered.
Default `Complexity posture` to: "Prefer the lowest net complexity change that satisfies the issue. Reuse, reshape, or remove existing code when safe instead of layering parallel paths."

## Review Lenses

Apply these internally. Do not turn them into six separate visible transcripts unless the issue truly needs it.

### Planning

- QA
- Systems
- Security
- Scale
- Intent
- DRY

### Implementation

- QA and repro
- Systems and regression
- Security and exploitability
- Scale and bottlenecks
- Intent and root-cause alignment
- DRY and patch-vs-refactor

## Single-Agent Review Standard

Do not spawn subagents for this workflow.

When reviewing:

1. Read the phase brief first.
2. If reviewing `implementation/`, also read sibling `planning/plan.md` before judging the execution brief.
3. Read the peer consultant file only when the user asks for synthesis or rebuttal. In rebuttal mode, target only the peer's independent position.
4. Apply the review lenses internally.
5. Turn the result into one judged active-slot position, not a reviewer transcript.
6. Make material issues:
   - evidence-backed
   - severity-ordered
   - tied to the smallest safe fix
   - paired with explicit verification
7. When synthesizing `plan.md`, act like a judge:
   - dedupe overlap
   - resolve conflicts explicitly
   - weigh both consultant positions through all six review lenses and the broader codebase contract
   - do not privilege the synthesizer's own earlier position just because it is theirs
   - state the recommended path
   - record residual risks or open questions

## Plan Editing Rule

When updating `plan.md`:

1. Integrate new material into the existing section structure instead of stacking fresh prose on top.
2. Rewrite affected sections so the document reads as one current brief.
3. Remove redundant or stale material.
4. Keep history in `## Addendum Log`, not duplicated in the main body.
5. Keep `plan.md` authoritative; do not introduce alternate canonical filenames.

## Checklist Quality Bar

The plan checklists must be extensive and execution-grade. This bar applies to every `plan.md` this skill writes or rewrites, including materialized series leaf briefs.

When creating or rewriting a phase brief:

1. Treat the checklist as the execution contract, not a short recap.
2. Break larger issues into workstreams or phases.
3. Use sub-checklists for each major workstream.
4. Name concrete files, paths, runtime surfaces, schemas, artifacts, or deliverables when knowable.
5. Include verification and regression items, not just build steps.
6. Include preservation constraints so the brief records what must not regress.
7. Carry forward already-agreed items as inherited detail instead of flattening them into generic bullets.
8. Prefer an over-complete but actionable checklist over a minimal one.
9. Give every executable implementation item `Basis: D<n>[, D<m>]` using active decision IDs and `Verify: <condition>`.
10. For an executable surface, `Verify:` names a non-interactive command. For a non-executable surface such as contract prose, it names the concrete artifact state to inspect and the condition that makes it correct. Adjacent items may share one command when the coverage is explicit; a bare `verify` is not sufficient.

Minimum planning content:

- user intent snapshot
- workstreams or phases
- deliverables
- dependencies
- decision gates or open questions
- acceptance criteria
- done means

Minimum implementation content:

- inherited intent snapshot
- ordered execution steps
- concrete target surfaces
- regression sub-checklists
- verification steps
- rollout notes when risk exists
- cleanup or follow-up notes when migration residue exists

## File Roles

- `plan.md`: shared brief, decision, checklist
- `a.md`: slot A position, recommendation, risks, simpler alternative, checklist, rebuttal addendum, addendum log
- `b.md`: slot B position, recommendation, risks, simpler alternative, checklist, rebuttal addendum, addendum log

For `plan.md`, the expected visible structure should usually include:

- intent snapshot
- scope
- non-goals when needed
- deliverables
- inputs reviewed
- findings
- judge synthesis
- decision
- dependencies when relevant
- detailed checklist
- acceptance criteria
- done means
- addendum log

## Disagreement Walkthrough Standard

During every synthesis response, explain the merged result in the reply itself using the same plain teaching style as the `consult-issue` synthesis output and `explain-issue`. The user should not need to run `explain-issue` afterward just to understand what changed.

The terminal response is for understanding. The rewritten `plan.md` is the exhaustive contract. Do not turn the terminal response into a technical checklist or debate transcript.

Use this default section order:

1. `What this issue is about`
2. `How the phase brief actually looked`
3. `Where the disagreements were`
4. `What the merged plan changed`
5. `What it does NOT change`
6. `The one-sentence version`

Add `How the system actually works` between sections 1 and 2 only when a runtime flow, ownership split, document structure, or process shape needs a separate mental model before the disagreements make sense.

Walkthrough rules:

- Start with purpose before filenames.
- Explain the old brief before the merged repair.
- Define jargon once, in plain English.
- Use short sentences and concrete nouns.
- Prefer plain cause-and-effect over implementation jargon.
- Use enough detail for the user to understand the issue without rereading the consultant files; do not compress away the mental model just to be brief.
- Ground the walkthrough in actual repo files, phase files, runtime surfaces, or explicit inference.
- Keep the tone beginner-safe and decision-oriented.
- Do not duplicate the walkthrough inside `plan.md` unless the user explicitly asks for it there.

ASCII mental model rules:

- Include one compact ASCII sketch when the issue involves runtime flow, document flow, ownership, or process change.
- Put the main sketch under `What this issue is about`, or under `How the system actually works` when that optional section is included.
- The sketch should show the reader the mental model: what moves, who touches it, what can fail, and why the merged decision fixes the shape.
- Put a `Before` / `After` mini-sketch under `What the merged plan changed` only when it clarifies the change better than prose.
- Keep diagrams small, terminal-friendly, and labeled in simple language.
- Show only the parts that matter to the explanation.
- Do not force a second diagram if prose is clearer.

Disagreement rules:

- Use `Where the disagreements were` for real disagreements.
- If both sides agree, rename it to `Where both sides landed`.
- Reduce each disagreement to a plain-English choice, not a technical transcript.
- For each choice, use this plain shape:
  - `### Fork N: [plain-English question]`
  - `What this choice means:` explain the decision context in plain language before naming either side's view
  - `Slot A:` explain slot A's argument in beginner-readable cause-and-effect terms
  - `Slot B:` explain slot B's argument in beginner-readable cause-and-effect terms
  - `Merged decision:` explain the chosen path, why it fits the issue, and what tradeoff it accepts
- Use `Merged decision: User choice required` only when evidence does not clearly favor one path.
- If any choice needs the user's call, stop before finalizing `## Decision` and ask the user to choose.

Change-summary rules:

- In `How the phase brief actually looked`, explain the pre-synthesis brief in simple current-state terms.
- In `What the merged plan changed`, contrast the pre-synthesis brief with the merged result.
- In `What it does NOT change`, stop the reader from imagining scope creep or behavior changes that are not part of the merged plan.
- In `The one-sentence version`, say plainly whether the merged path is ready to approve or whether a user choice still remains.

## Synthesis Rule

1. Write the active slot's main position first from the phase brief without reading the peer slot file unless the user explicitly asks for synthesis or rebuttal.
2. Expect the peer slot to write its own independent position from the same phase brief without reading the active slot file.
3. Require every response owed by `## Rebuttal Round Policy` from each side before synthesis. Round 1 answers the peer's independent position; round 2 answers the shared frozen fork brief under its symmetric read restrictions.
4. Treat the two independent consultant files plus all owed responses in their owned rebuttal addendums as the normal inputs to synthesis.
5. Judge both consultant files as if neither one belongs to you; authorship is not evidence.
6. Evaluate both paths against the phase brief, the host-codebase fit, the whole-codebase fit, and all six internal review lenses before recommending a path.
7. Do not create rounds beyond `## Rebuttal Round Policy` unless the user explicitly asks for a deeper debate.
8. During the rewrite, merge any older `plan.md` comparison, "agreements and disagreements", or separate "conflict" sections into the synthesized decision prose instead of duplicating them.
9. In the terminal-facing synthesis response, use the walkthrough structure from `## Disagreement Walkthrough Standard`, not a separate summary block.
10. Make the walkthrough beginner-friendly enough that a user can understand the old brief, the real forks, and the merged outcome without rereading both consultant files.
11. Use actual repo evidence for the walkthrough. If something is inferred rather than directly stated, say so.
12. Resolve each real fork using the plain choice format from `## Disagreement Walkthrough Standard`. Be willing to choose `Slot A`, `Slot B`, or `Merged` based on evidence rather than authorship.
13. If every real fork is resolved, finalize `## Decision` and present the phase as awaiting approval.
14. If a real unresolved fork remains with non-obvious consequences and neither side clearly wins on evidence, end that choice's `Merged decision:` with `User choice required` and `Why this needs your call:`, stop before finalizing `## Decision`, and ask the user to choose.

## Approval Templates

Match each authorization below exactly; near misses do not authorize evaluation:

- Planning approval: `approved, move the issue`
- Implementation-synthesis approval: `Authorize faithful implementation synthesis for execution.`
- Merge release: use the canonical exact form in `check-issue` `## Merge Release Authorization`.

Only the implementation-synthesis authorization may be emitted by an automated actor. Planning approval and merge release are operator-only and must not appear in orchestrator prompt templates.

An exact phrase authorizes evaluation, not a transition by itself:

- Planning approval additionally requires the fresh-read authoritative phase, active decision IDs, and a planning synthesis in `planning/plan.md` that is ready to advance into implementation planning; it does not require implementation artifacts, the implementation join, or fidelity evidence.
- Implementation-synthesis approval additionally requires the fresh-read authoritative phase, active decision IDs, the implementation join, and the latest fidelity verdict before acting.
- Merge release additionally requires the fresh-read authoritative phase plus the review evidence and merge-ready verdicts required by `check-issue`.

`orchestrator.gates.implementation_synth: auto` means advance only after a fresh `faithful` audit, never skip the audit.

## Output Standard

For every active, materialized, nonterminal issue run after target resolution, fresh-read the authoritative phase and current artifacts, derive exactly one final legal successor token, and invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> <next-step>` for a standalone issue or `bun issues/.scripts/lifecycle.ts status-write series <series> <leaf> <next-step>` for a series leaf against the active checkout. Slug shorthand is permitted only when resolution is unique. When the same run performs a lifecycle transition, invoke `status-write` before `transition` so the checkpoint captures both. The shared lifecycle CLI resolves the control root and is the only run-status write surface; never construct or edit run-status YAML. The four exclusions are `init-issues`, pre-materialization `seed-issue`, unresolved-target errors, and successful terminal merge. The transient `park.release` handshake is the sole intermediate status write: its same invocation must replace it with the substantive pass's final successor before returning.

All four qualifying skills may write issue-level `next_step`. Only the slot-aware `consult-issue` and `check-issue` skills may invoke the target-qualified `status-verdict` form for a standalone issue or series leaf; `implement-issue` and `merge-issue` are next_step-only writers and acquire no slot identity.

Write the active slot's `a.md` or `b.md` using:

```markdown
# Position
# Recommended Direction
# Risks
# Simpler Alternative
# Checklist
## Rebuttal Addendum
## Fidelity Audit
## Addendum Log
```

End every terminal-facing response with the `Grounding:` footer line first, then:

`My last operation: <operation label>`

If there is a next issue-phase action for the user, add a separate line immediately below it:

`Next step: <short issue-phase instruction>`

Choose `<operation label>` verbatim from this closed list. Do not paraphrase, reword, extend, or invent labels; the same operation must emit the identical string in every deployed copy of this skill:

- `new issue creation`
- `portable seed import`
- `series seed creation`
- `series materialization`
- `planning grill pass`
- `initial independent planning position`
- `initial independent implementation position`
- `planning rebuttal round <N>`
- `implementation rebuttal round <N>`
- `planning synthesis walkthrough`
- `implementation synthesis walkthrough`
- `implementation fidelity audit`
- `planning plan migration`
- `implementation plan migration`
- `planning addendum update`
- `implementation addendum update`
- `lifecycle state transition`
- `no consult operation`

Outcome-label routing is closed:

- A parked create, import, or materialization run uses its existing creation, import, or materialization label.
- Park release inherits the substantive pass label as required by `## Attach Flow`; no release-only label exists.
- A position interview paused only for answers, or a second-drift operator-direction wait, uses `no consult operation`; a consequence-bearing scope-lock write uses the last planning artifact operation it actually completed.
- Round-2 classification uses `planning addendum update` or `implementation addendum update`, according to the active phase.
- Fidelity-plan repair uses `implementation synthesis walkthrough`; the audit itself uses `implementation fidelity audit`.

Label rules:

- `<N>` is the rebuttal round number written as a digit. Round 1 is always normal. Use `round 2` when `orchestrator.rebuttal_rounds` is `2`, when `auto` classification finds a real fork, or when the operator explicitly requests a deeper debate; use higher numbers only for an explicitly requested deeper debate.
- When one turn performs several operations, label the last durable artifact operation completed in that turn (position, rebuttal, synthesis, plan, addendum, seed, or migration work).
- A `state.yaml` update that happens in the same turn as an artifact operation is a side effect of that operation, not an operation of its own; it never changes the label. Example: the turn that writes the second rebuttal and thereby advances `P-draft -> P-synth` is labeled `planning rebuttal round 1`, never `lifecycle state transition`.
- Use `lifecycle state transition` only when the turn's sole durable change is to `state.yaml` and no artifact was touched (for example, an operator-requested state correction or approval advance).
- Use `no consult operation` when the turn changed no consult artifact and no lifecycle state (for example, answering a question); a run-status-only wait write is status bookkeeping, not a consult artifact operation.

Write `Next step` for the user, not for the workflow engine. For ordinary consult routing, choose the sentence verbatim from this closed list, filling `<slot>` with `slot A` or `slot B`:

- `Next step: Run consult-issue in <slot> to write its independent planning position.`
- `Next step: Run consult-issue in <slot> to write its planning rebuttal.`
- `Next step: Run consult-issue to synthesize the planning phase.`
- `Next step: Approve the planning synthesis to begin implementation planning.`
- `Next step: Run consult-issue in <slot> to write its independent implementation position.`
- `Next step: Run consult-issue in <slot> to write its implementation rebuttal.`
- `Next step: Run consult-issue to synthesize the implementation phase.`
- `Next step: Run consult-issue to audit implementation-plan fidelity.`
- `Next step: Approve the implementation synthesis to make the issue execution-ready.`
- `Next step: Run implement-issue to execute the implementation plan.`
- `Next step: Run check-issue to review the implementation.`
- `Next step: Run merge-issue to merge and clean up the issue.`
- `Next step: None.`

When a qualifying run writes a successor token, use that token's exact terminal sentence from the shared lifecycle mapping instead of inventing wording. This covers park hold and release, interview wait, round-2 classification and response, fidelity repair, second-drift operator direction, and every other tokenized outcome; the mapping is closed and parser-owned.

Next-step rules:

- only describe the next step in the current issue phase
- do not add general suggestions or optional ideas
- if no canonical sentence fits the situation (blocked issue, halt, reconciliation), write one short plain custom sentence instead
- if there is no next issue-phase action for the user, say `Next step: None.`

For synthesis responses specifically:

- Follow the section order from `## Disagreement Walkthrough Standard`.
- Use `How the system actually works` only when it materially helps the reader understand the disagreements.
- Put tiny ASCII sketches inside the section where they help. Do not append a separate footer diagram block by default.
- Use the plain disagreement format inside `Where the disagreements were`.
- Keep the whole response plain enough that it should not need a follow-up `explain-issue` pass.
- Keep the last substantive section compact, plain, and explicit about whether approval is ready or a user choice still remains.
