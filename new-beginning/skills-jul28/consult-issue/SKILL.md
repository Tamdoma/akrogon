---
name: consult-issue
description: Create or continue a dual-consult issue workflow with planning and implementation phases organized around canonical `plan.md` briefs plus `a.md` and `b.md` position files, using `state.yaml` lifecycle state to show the next durable step (`P-draft`, `P-synth`, `I-draft`, `I-synth`, `I-ready`, `C-ready`, `C-fix`, `D-merge`). Use when opening a new issue, importing a portable seeded issue report from `seed-issue`, continuing a planning or implementation phase, writing one owned rebuttal addendum against the peer slot's independent take, migrating legacy issue folders, or synthesizing slot A and slot B positions into one shared plan.
---

# Consult Issue

Run this workflow directly through the LLM. Do not depend on helper scripts.

## Consult References

Read `authoring-reference.md` in this skill's folder before creating or rewriting any `plan.md`, seeding or rewriting any consultant file scaffold, running any synthesis pass or synthesis response, evaluating approval text, deriving terminal response labels or `Next step`, or editing or relying on the duplicated `### Question Authoring Standard` block.

Read `series-materialization-reference.md` in this skill's folder before validating or authoring any `### Issue Series Breakdown`, or before entering the series materialization lane.

## Codebase Grounding

Before invoking any base-skill behavior, read the configured grounding from `issues/config.yaml`. Use `grounding.index` as the first lookup surface when present, then read the relevant index section, configured docs, and directly linked live codebase files relevant to the current issue. Do not perform broad scans of the codebase.

Before asserting a codebase contract, open the live surface that carries the asserted contract in the current pass. A `grounding.index` row is a pointer to grounding, not grounding by itself.

Use live code as behavior and contract truth; use the configured grounding docs as vocabulary and naming truth. When issue language diverges from the configured codebase vocabulary, surface the divergence, resolve it against those configured docs, and record the resolved term inside the issue artifacts under `## Doc/Code Tensions` in the same pass the divergence is discovered. When configured docs and live code disagree, record the tension either way.

Treat `## Grounding Anchors` and `## Doc/Code Tensions` as the durable issue-artifact capture surfaces for grounding.

This methodology is derived from the published `grill-with-docs` pattern at <https://www.aihero.dev/grill-with-docs> and <https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md>. Only the docs-first grounding, terminology challenge, fuzzy-language sharpening, concrete-scenario verification, live-surface verification, and inline durable-capture concepts apply. The source's forced user-interview behavior - its user-question API names, its sequential single-question pattern, its per-question gating, and its design-tree walking - is explicitly excluded.

## Per-Skill Anchor Map

This skill does not carry hardcoded document paths. When configured grounding is active, use `grounding.index` as the lookup map and `grounding.docs` as vocabulary entry points. Apply the configured entry points and the directly linked codebase surfaces relevant to the current issue; when `grounding: none` is configured, skip this section and follow the base workflow.

## Activation And Fallback

If `issues/config.yaml` is absent at the active checkout root, halt with this sentence: `Issue lifecycle is not initialized: run init-issues first to create issues/config.yaml, issues/.scripts/, and issues/worktrees/.`

Before invoking the codebase-grounding methodology, read `issues/config.yaml` from the active checkout root through `issues/.scripts/lifecycle.ts` / `parseIssuesConfig`. When an issue worktree is active, read that worktree's config; resolve and write issue lifecycle phase only against the control-root (primary checkout) `state.yaml`. The worktree's `state.yaml` is an inert snapshot — never gate phase on it. When `grounding: none` is configured, follow the base skill behavior and emit no grounding-specific footer or anchor capture for that turn.

When configured grounding is active, use `grounding.index` as the first lookup surface when present, then read the configured `grounding.docs` entries and any configured or directly linked live codebase surfaces relevant to the current issue. A present-but-malformed grounding config is a hard setup error from the lifecycle parser, not a silent fallback. Emit the `Grounding:` footer line as an honest list of every file actually consulted that turn, formatted as `Grounding: <path> (read), <path> (confirmed), <path> (diverged)`. When configured grounding is active but no files were consulted that turn, the line reads `Grounding: none`.

Use `(read)` when the file was consulted, `(confirmed)` when a cited contract was checked against that live surface and matched, and `(diverged)` when that check found a mismatch. For `(confirmed)` and `(diverged)`, cite the smallest stable locator that actually carries the asserted contract: prefer a symbol or leaf heading; use a line span only when no stable named surface exists. For partial index reads, use `(read, partial: <omitted span and reason>)`. Record per-contract confirmation or divergence details in `## Doc/Code Tensions`; the footer is the trail, not the full analysis.

Grounding reports codebase surfaces actually consulted: configured `index`/`docs` entry points, plus configured or followed live code/markdown surfaces. Issue work product under `issues/open/`, issue seeds, and phase artifacts remain artifact context, not grounding surfaces; durable lifecycle root artifacts listed in `grounding.surfaces` may appear.

When a pass relies on or edits an indexed file, spot-check that file's `grounding.index` row against live reality in the current pass. Record index drift in `## Doc/Code Tensions`.

Before emitting a footer from a configured index, classify index coverage as `complete`, `partial: <omitted area and reason>`, or `not consulted`; line counts may be used as a diagnostic only and never as the status.

## Anchor Capture Format

Every `planning/plan.md` and `implementation/plan.md` this skill writes or rewrites under `issues/open/<slug>/` includes:

- `## Grounding Anchors` - list each codebase file consulted while building the brief as `<path> - <minimal reason it grounds>`, for example `<path from grounding.docs> - vocabulary source for issue lifecycle terms`.
- `## Doc/Code Tensions` - list every place where a doc claims a contract the live surface does not honor (or vice versa). Use `None observed during the planning grounding pass.` (or implementation grounding pass) when no tension was found.

Consultant files (`a.md`, `b.md`) must cite the relevant grounding anchor inline whenever the consultant asserts a codebase contract, using the configured path form at the end of the asserting sentence.

When asserting the absence of an existing primitive, name the searched surfaces as anchors, bounded by the no-broad-scan ceiling: relevant configured index slices, configured docs, and directly relevant live surfaces opened in the pass. A codebase-contract assertion in a consultant file with no inline anchor citation is an ungrounded assertion and a grounding defect.

When `grounding: none` is configured the variant defers to base `consult-issue` and does not produce these sections or inline citations.

## Slot Identity

Resolve the active slot before reading or writing a consultant artifact:

1. An explicit `slot a` or `slot b` in the invocation wins.
2. Otherwise read exactly one line from `<install-root>/slot-default`; the only valid values are `a` and `b`.
3. Missing or malformed identity input is a hard error. Never infer a slot from runtime, model, role, file occupancy, or `pair.yaml`, and never fall back to the peer slot.

The install roots and deployed skills roots are distinct: `~/.claude` / `~/.claude/skills`, `~/.codex` / `~/.codex/skills`, and `~/.pi` / `~/.pi/agent/skills`.

After resolving, validate and record provenance in `pair.yaml` beside the issue or series `state.yaml`. The file has optional top-level `a` and `b` keys while passes enroll, and every present key maps to exactly `{runtime, model, role}`. Roles are fixed as `a: strategist` and `b: implementer`; roles validate provenance and never resolve identity. Identity anchors are `runtime` and `role`: every consultant pass fresh-reads the file immediately before writing, hard-fails on a runtime or role contradiction in its own-slot record, preserves the peer mapping, and atomically replaces the whole file when adding its own-slot record. `model` means the currently serving model and is refreshable metadata, never an identity anchor: one session legitimately spans models (safeguard or capacity fallback, an operator model switch), so on a model-only mismatch refresh the own-slot `model` to the session-verified current value during the same atomic rewrite instead of failing; durable per-pass model provenance lives in the `plan.md` addendum entries. Record only runtime and model values verified by the current session; do not guess. Orchestrated runs pre-write both records and always pass explicit slots.

## Most Intuitive Mental Model

Treat `plan.md` as the canonical judge file for the phase.

- In `planning/`, `plan.md` is the decision plan.
- In `implementation/`, `plan.md` is the execution plan.

This keeps both phases aligned on one canonical filename the user can act on directly.

## Issue Root State

Resolve the current lifecycle phase from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts`; issue paths are slug-only or marker-only and do not encode lifecycle phase, and a worktree's `state.yaml` copy is an inert snapshot, never the authority. Every durable state transition calls the `transition` verb in `issues/.scripts/lifecycle.ts`, which performs the guarded write and checkpoint commit against the control-root `state.yaml` only; it does not write the worktree copy, which stays an inert snapshot. At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.

The issue state must carry the next durable step:

- `P-draft` = at least one planning consultant file is still missing a substantive independent position or any response owed by `## Rebuttal Round Policy`
- `P-synth` = both planning consultant files contain substantive independent positions plus all owed responses and planning is not yet approved to advance
- `I-draft` = planning is approved and at least one implementation consultant file is still missing a substantive independent position or any response owed by `## Rebuttal Round Policy`
- `I-synth` = both implementation consultant files contain substantive independent positions plus all owed responses and implementation is not yet approved to execute
- `I-ready` = implementation plan is complete and execution is next
- `C-ready` = implementation is complete and checking is next
- `C-fix` = checking found implementation fixes and repair plus re-check is next
- `D-merge` = checking is complete and merge/cleanup is next

This state value means the next durable step, not whether synthesis prose already exists on disk. A phase can stay in `P-synth` or `I-synth` after `plan.md` has been synthesized if approval is still pending.

Blocked work does not get its own path marker. Do not rewind a checked issue back into `I-*`; keep review-phase rework in `C-fix`. Record blocked reasons in the active phase `plan.md` with:

- `Status: Blocked`
- `Blocked by: <reason>`
- `Unblocks when: <condition>`

## Active Worktree Rule

Managed issue worktrees are implementation roots, not consult-artifact authorities. Consult-issue planning, implementation planning, consultant positions, rebuttals, syntheses, and lifecycle state stay in the lifecycle control root (the primary checkout) unless the operator explicitly provides an absolute path outside it.

- Interpret user-provided issue paths, phase paths, file references, and relative `issues/...` paths as pointing to the primary checkout's `issues/` tree.
- Do not translate consult artifact paths into an active worktree for `plan.md`, `a.md`, `b.md`, `pair.yaml`, or `state.yaml`.
- Write consultant positions, rebuttals, syntheses, and phase-plan updates in the primary checkout even when an implementation worktree exists.
- Treat an active issue worktree only as the location for actual implementation/code edits during implement-issue, check/fix repair work, and merge mechanics.
- If the operator explicitly asks for a worktree path or gives an absolute path under a worktree, honor that path for inspection, but do not use it as the default consult-artifact write target.

## Cross-Repository Work Rule

An issue worktree changes only its own repository. Install trees and herdr configuration are post-merge deploy targets, not issue-worktree edit targets. A genuinely multi-repository change requires one portable seed per repository, with companion-seed references and a park barrier recorded in each seed. Importing one seed may read those references but never writes files, lifecycle state, or run status in the companion repository; this is guidance and seed metadata, not cross-repository transition authority.

## Series Slug Collision Guard

Before any series issue materialization, inspect both the main checkout and the active issue worktree for `issues/open/<series-slug>/` directories matching the breakdown's `series_slug`. A series-slug collision with an existing series folder must be caught pre-materialization, not after the folder is half-written.

## Substantive Consultant File Rule

A consultant file is phase-complete for draft exit only when it contains:

- a substantive independent position for the active phase
- substantive responses for all rebuttal rounds owed by `orchestrator.rebuttal_rounds`, under round-numbered subheadings in `## Rebuttal Addendum`

Additional rules:

- Placeholder scaffolds do not count.
- Text such as `Pending independent ... position`, `Pending rebuttal ...`, `To be written from ...`, or `Placeholder file created ...` is non-substantive.
- Restored or migrated content can count as substantive when it records a real consultant position or rebuttal instead of a placeholder.
- If an independent position is materially rewritten after a rebuttal addendum already exists, reset that rebuttal addendum to pending and keep the phase in `P-draft` or `I-draft` until fresh rebuttals are written.

## Rebuttal Round Policy

Resolve `orchestrator.rebuttal_rounds` before draft exit. When the section or key is absent, use the existing one-round manual protocol.

- `1`: both slots owe round 1, then synthesis begins.
- `2`: after both round-1 responses, the synthesizing slot writes a shared frozen fork brief and both slots owe round 2 before synthesis.
- `auto`: after both round-1 responses, the synthesizing slot classifies the remaining disagreement. A real fork changes observable behavior or policy. Wording preferences, conceded defects, and residual implementation risk are not forks. With no real fork, continue into synthesis in the same invocation. With a real fork, write the shared frozen fork brief and require both round-2 responses before synthesis.

The shared frozen fork brief is a temporary canonical `## Frozen Fork Brief - <fork-id>` section in the active `plan.md`. The synthesizing slot writes it in neutral language, naming unresolved choices, consequences, and evidence without taking a side, and quotes the specific round-1 claims it classifies as unresolved. Both slots read the same frozen brief and their own consultant file, do not read the peer's round-2 response, and write under `### Rebuttal Round 2` inside their existing `## Rebuttal Addendum`; later explicitly authorized rounds follow the same numbered-subheading shape. Final synthesis integrates each fork and replaces the temporary section with structured preservation in `## Addendum Log` containing the fork identifier, quoted claims, consequence statement, and disposition.

## Parallel Stage Token Rule

Position and rebuttal stages are parallel stages: both slots owe an artifact within the stage, and the singular run-status token (`planning.position.a`, `planning.rebuttal.round1.b`, and their implementation forms) records ordering, not a slot lock. An invoked slot whose own artifact for the recorded stage is still pending writes that artifact even when the token names the peer, honoring the stage's read restrictions unchanged, then derives and records the stage's true remaining successor: the peer's token while the peer artifact is still pending, or the stage's next step once both are substantive. An invoked slot whose own stage artifact is already substantive reports the token's named work instead of rewriting its artifact. Serial steps - round-2 classification, synthesis, the fidelity audit, approvals, and every other single-owner token - keep the strict token reading and refuse out-of-turn slots.

## Decision Identity Rule

Planning synthesis assigns stable decision IDs in order as `D1..Dn`. Refining the same decision preserves its ID; a materially different decision receives a new ID and marks the old ID superseded in `## Addendum Log`. Never renumber or reuse an ID. Implementation checklists, fidelity joins, and every other downstream reference use active decision IDs only.

## Standard Review Sequence

Before any pass below - initial independent position, rebuttal addendum, or synthesis - first read enough of the host codebase to understand how it actually works. That includes the modules, scripts, conventions, folder layout, naming conventions, existing abstraction types, established patterns for where documents, scripts, and code live, configuration and registration patterns, and extension points. The recommendation that comes out of the pass must be grounded in that scan.

- Prefer reusing or reshaping what the host codebase already provides over introducing parallel paths, parallel naming conventions, parallel abstraction types, or parallel placement locations.
- Adding new code, new files, new folders, new abstractions, or new placement locations is permitted, but only when no existing primitive of any kind - whether a module, helper, configuration, convention, or extension point - covers the need. Any new addition must still follow the host codebase's existing naming conventions, layout patterns, abstraction types, and registration or extension points. The absence-of-primitive reason must follow the grounded-absence rule in `## Anchor Capture Format`.
- When writing a rebuttal addendum, measure the peer's recommendation against the same host-codebase reality. Do not argue against the peer using an abstract ideal or patterns from a different codebase; the rebuttal must be grounded in the same scan that grounds the independent position.
- When synthesizing, weigh both consultant positions through host-codebase fit alongside the six internal review lenses in `authoring-reference.md`. Do not promote a recommendation that quietly clashes with the host codebase's existing infrastructure.
- The rule's wording is framework-agnostic so the same text applies to whatever codebase this skill is invoked inside; the behavior it mandates is context-specific to whichever codebase that is.

1. Initial slot A pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read `b.md`
   - write slot A's independent position to `a.md`
2. Initial slot B pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read `a.md`
   - write slot B's independent position to `b.md`
3. Slot A rebuttal pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read `a.md`
   - read slot B's independent position in `b.md`
   - do not read or answer slot B's rebuttal addendum
   - write or update slot A's owned `## Rebuttal Addendum`
4. Slot B rebuttal pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read `b.md`
   - read slot A's independent position in `a.md`
   - do not read or answer slot A's rebuttal addendum
   - write or update slot B's owned `## Rebuttal Addendum`
5. Synthesis pass
   - synthesis ownership is fixed per phase: slot A (strategist) synthesizes `planning/`; slot B (implementer) synthesizes `implementation/` so the slot that will execute the plan is the one that writes it; the implementation fidelity audit then belongs to slot A as the non-synthesizing peer and author of the planning decisions it verifies against
   - read `plan.md`, `a.md`, and `b.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - evaluate both independent positions plus all responses owed in both rebuttal addendums
   - rewrite `plan.md` into one coherent decision or execution brief
   - when synthesizing `implementation/`, read `advisory-quality-standards.md` in this skill's folder and record the standards applicable to the planned surfaces as named execution constraints inside the decisions and checklist the executor will follow; a standard with no applicable surface is omitted, not disclaimed
   - prepare one visible explain-style synthesis walkthrough for the terminal-facing response using `authoring-reference.md`
   - escalate to the user only if a real decision fork remains
6. Implementation fidelity audit
   - run after implementation synthesis and before evaluating `I-synth -> I-ready`
   - the non-synthesizing peer owns `## Fidelity Audit` in its implementation slot file
   - read only `planning/plan.md`, `implementation/plan.md`, and `advisory-quality-standards.md` in this skill's folder; the peer's implementation position is excluded and is not audit evidence
   - record each attempt's `faithful` or `drift` verdict, audited implementation-plan revision, and mismatch list
   - verify the bidirectional join: every active `D` has implementation work and verification, and every executable implementation item cites an active `D` without contradicting it
   - verify the synthesized plan incorporates the applicable advisory quality standards as execution constraints; missing or contradicted incorporation is a mismatch like any other; judging code quality itself stays excluded - the standards remain advisory and are measured only against written code by implement-issue and check-issue
   - this audit gates issues entering `I-ready` through the current contract; if an older issue is already in `I-ready`, `C-ready`, `C-fix`, or `D-merge` without this evidence, log the fidelity gap instead of forcing a consult-phase rewind

The operator may invoke the brief-grill lane before any initial planning position pass (steps 1 and 2 above) to sharpen the planning brief in place against operator-answered material fuzz. Each initial planning position pass also runs the position-interview lane when real consequence-bearing ambiguity remains. See `## Planning Grill Gate` for both contracts.

Require every rebuttal round owed by `## Rebuttal Round Policy` before synthesis. Responses within a round can happen in either order once their shared inputs exist. Do not create additional rounds outside that policy unless the user explicitly asks for a deeper debate.

## Planning Grill Gate

The planning grill gate has two distinct lanes that share the `### Question Authoring Standard` in `authoring-reference.md`: an operator-invoked brief grill that sharpens the shared brief before either position, and an automatic per-position interview that resolves real consequence-bearing ambiguity for each initial planning position.

### Brief Grill Lane

**When the gate fires.** The gate is default-off. It fires only when the operator includes a grill-mode signal in a `consult-issue` invocation that runs `## Create Flow` or `## Portable Seed Report Import Flow` - example phrases: "grill the brief first," "do a planning grill pass," "grill the planning phase," "sharpen the brief." When no grill-mode signal is present, the create flow or seed-import flow runs as today (the creating consultant writes its own first independent position in the same invocation per step 10 / step 17). When the signal is present, the creating consultant runs the grill in place of writing its first independent position. Only one grill runs per planning phase, and it is always run by the issue-creating agent - the runner the operator invoked to run create flow or seed-import flow.

**Trigger position.** The grill mode fires after codebase grounding, phase-brief reading, and relevant host-codebase context - after the consultant has read `grounding.index`, the linked docs and live codebase surfaces relevant to the issue, the phase brief, and the host-codebase patterns that ground the recommendation.

**What the gate does.** The consultant scans the planning brief for material fuzz against five consequence surfaces - scope, decision triggers, acceptance criteria, non-goals, and risk/rollout posture. When material fuzz remains, the consultant asks the operator the batched questions through the runtime's structured user-input tool, grouped by category: each tool call carries up to four questions from one category or adjacent categories, every question offers two to four concrete answer options with the recommended option first when one exists, and the tool's built-in free-text escape covers answers outside the listed options. Before each structured user-input tool call pauses the run, invoke the target-qualified `status-write` form from `authoring-reference.md` `## Output Standard` with `operator.answers.wait`. The consultant fires as many category-batched tool calls as the material fuzz requires within the same grill pass and never delivers grill questions as plain prose. The consultant does not use per-question gating loops and does not walk a design tree of follow-up questions; category-batched structured user-input calls within a single grill pass are the only in-grill question delivery.

**Authorized `plan.md` edit lane during the grill.** The consultant in grill mode is authorized to write operator answers into `plan.md` in place, scoped by three explicit constraints:

1. Edits are limited to the brief's existing content sections (scope, decision triggers, acceptance criteria, non-goals, constraints) - integrating operator answers as sharpened wording inside those sections, per the `authoring-reference.md` `## Plan Editing Rule`.
2. One neutral one-line entry per grill round may be appended to the brief's existing `## Addendum Log` section.
3. No new subheading is introduced anywhere - not in `plan.md`, not in `a.md`, not in `b.md`, not in the seed file.

**Termination.** Termination is self-attested: the consultant declares the grill complete when no remaining material fuzz threatens any of the five consequence surfaces. The same five-surface list serves as both the scanning prompt ("is there ambiguity in any of these surfaces?") and the termination test ("does any remaining fuzz still threaten one of these surfaces?"). There is no minimum-batch floor; zero-question-batch termination is a valid run on a clean brief.

**Mid-grill operator short-circuit.** The operator may short-circuit the grill at any time with natural language - example phrases: "that's enough," "fast path from here," "skip the rest." The consultant honors the short-circuit, writes any sharpening gathered so far (if any), appends the addendum-log entry, and exits.

**Exit.** The consultant in grill mode exits without writing a consultant position to `a.md` or `b.md` - the grill replaces step 10 of `## Create Flow` or step 17 of `## Portable Seed Report Import Flow` for the invocation that triggered it. After the grill pass completes, the operator launches separate `consult-issue` invocations - serially, in parallel, or one at a time - to obtain both slots' first independent positions against the now-sharpened `plan.md`. Both first independent positions are written against the same sharpened input, with no information asymmetry from the live grilling exchange.

**Scope of application.** The brief-grill lane applies only to initial planning position passes invoked through `## Create Flow` or `## Portable Seed Report Import Flow`. It does not fire on rebuttal addendums, synthesis passes, `## Attach Flow` invocations against an already-existing issue, or implementation-phase passes. Those exclusions do not exclude Attach Flow initial planning positions from the position-interview lane.

### Position Interview Lane

The position-interview lane runs automatically and independently for both slots during each slot's own initial planning position pass, including passes reached through Create Flow, Portable Seed Report Import Flow, series materialization, and Attach Flow. The five-surface scan itself is mandatory on every such pass and must leave a visible per-surface artifact in the active slot file's `# Position` section: one `Interview scan:` line block covering all five surfaces (scope, decision triggers, acceptance criteria, non-goals, risk/rollout posture), marking each surface either `asked` (with its question batch fired) or `no material fuzz`. A pass with no such block is an incomplete position pass, not a clean scan. Questions fire only for surfaces with real consequence-bearing ambiguity; a complete brief produces the all-clean declaration block and proceeds without pausing. An open item the brief itself acknowledges - anything marked open, TBD, deferred, or unresolved - is never declarable `no material fuzz`; it must be asked or quoted as an operator-locked answer already on record. The active slot asks and owns the interview, then writes its own slot file; it never edits the peer slot file.

Use the brief grill's batched structured-question delivery, self-attested termination, operator short-circuit, and `### Question Authoring Standard` by reference rather than restating them. Before a structured question pauses the run, invoke the target-qualified `status-write` form from `authoring-reference.md` `## Output Standard` with `operator.answers.wait`.

Interview answers are captured by consequence. If an answer changes what is being built, append only that consequence-bearing scope lock to the shared `plan.md` `## Addendum Log`; otherwise keep the reasoning only in the active slot's consultant file. The position interview may not otherwise rewrite shared brief sections. If a shared scope lock lands after the peer began its position, that peer input is stale: refresh the peer position against the updated brief and reset its rebuttal to pending when one exists.

The position-interview lane applies only to initial planning positions. It never runs for implementation positions, rebuttal passes, or synthesis passes.

## Start Gate

1. Determine whether the user is creating a new issue, importing a portable exported report, or attaching to an existing issue or phase folder.
2. If creating a new issue, require:
   - short issue name
   - issue name limited to 3 words maximum
   - issue name should follow a `verb-scope-noun` pattern when possible
   - user intent
   - optional complex / series intent; explicit complex or series requests may proceed after validation, while a skill-proposed series upgrade from an ordinary issue request requires operator confirmation before any generated seed is written
3. If importing a portable exported report, require:
   - explicit markdown report path or file reference
   - report should normally look like `issues/open/<slug>.md`
4. If attaching to an existing issue, require:
   - explicit issue or phase folder reference
   - optional extra note only
5. Keep the workflow deterministic even though it is prompt-native.

## Create Flow

When creating a new issue:

1. Ensure repo-root `issues/` exists.
2. Convert the short issue name into a lowercase hyphen slug with no more than three hyphen-separated words.
3. Decide whether the new issue remains a single issue or qualifies as a series before creating `issues/open/<slug>/`.
   - Reuse the settled slug as `<series-slug>` for a series outcome; do not derive a second slug.
   - Create a series only when the requested split can state true `files_disjoint`, `runtime_independent`, and `acceptance_independent` claims for each phase, with dependency barriers made explicit where phases must run in order, matching the qualification bar in Portable Seed Report Import Flow step 8.
   - If the work is merely large, sequential, or acceptance-coupled, continue with the next step unchanged.
   - If the operator explicitly requested a complex or series issue and the claims do not hold, report the validation failure and create no scaffold; do not silently downgrade to a single issue.
   - If the work qualifies for a series, hand off to `### Generated Seed Series Branch` and return after that branch routes through the import flow.
4. Create the folder as `issues/open/<slug>/` and write its initial `state.yaml` with `createIssueState(execRoot, slug, created)`.
5. Create the canonical planning and implementation file set from `authoring-reference.md` `## Canonical File Model`.
6. Seed `planning/plan.md` with the planning intent block from `authoring-reference.md` `## Required User Intent Block` and the canonical planning brief structure.
7. Seed `implementation/plan.md` with the implementation intent block from `authoring-reference.md` `## Required User Intent Block` and the canonical implementation brief structure.
8. Seed each consultant file with the locked heading scaffold from `authoring-reference.md` `## Output Standard`, leaving the independent position and rebuttal sections explicitly pending until their pass is run.
9. Read the new `planning/plan.md` first.
10. If parsed config sets `orchestrator.gates.park_after_scaffold: operator`, invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> park.hold` after the scaffold, `state.yaml` at `P-draft`, and seeded `plan.md` exist, then exit without writing a consultant position, using the same separate-position exit shape as `## Planning Grill Gate`. Otherwise, if the operator's invocation message included a planning-grill signal, run the brief-grill lane in place of this step and exit. Otherwise, run the position-interview lane when it fires and write or update the active slot's planning consultant file.
11. Keep `state.yaml` at `P-draft` until both planning consultant files contain substantive independent positions plus all responses owed by `## Rebuttal Round Policy`.
12. Write consult artifacts in the primary checkout; do not redirect them to an active implementation worktree.

### Generated Seed Series Branch

When Create Flow step 3 elects a series, this branch authors only a portable seed and returns through the existing import flow; it is not a materialization lane and must not call the materialization sub-flow directly.

1. Reuse the `<series-slug>` settled in Create Flow step 3. Do not re-derive, shorten, or rename it.
2. Before any write, run both collision checks:
   - Run `## Series Slug Collision Guard` for `issues/open/<series-slug>/`.
   - Check for an existing seed file at `issues/open/<series-slug>.md`; halt before writing if it exists.
3. Confirm authorization:
   - An explicit complex or series request authorizes seed authoring once the three claims in Create Flow step 3 pass.
   - A skill-proposed series upgrade from an ordinary create request must present the phase and leaf split to the operator and receive confirmation before writing the seed.
   - On an explicit request where the three claims fail, report the failed claims and create no scaffold; do not force a split and do not silently downgrade.
4. Author the portable seed at `issues/open/<series-slug>.md` with the parent intent snapshot, observed gap, expected behavior, constraints, operator-locked decisions already known from the conversation, recommended direction, series-wide acceptance criteria, and a `### Issue Series Breakdown` block that satisfies the locked breakdown schema in `series-materialization-reference.md`. The breakdown's `series_slug` field must be the identical `<series-slug>` used in the seed filename.
5. Route to Portable Seed Report Import Flow step 1 with the generated seed path and return. The generated breakdown is re-read and re-validated by import step 8's parse-and-halt branch; this branch does not duplicate that validation.

## Portable Seed Report Import Flow

When the user references a portable seeded issue report:

1. Resolve the markdown report path.
2. Read the report first.
3. Treat the report as pre-planning source material, not as a canonical phase brief.
4. Derive the issue slug from the report filename, shortening it to no more than three hyphen-separated words when needed.
5. Ensure repo-root `issues/` exists.
6. Before creating anything, inspect the main checkout and any active worktree for an existing `issues/open/<slug>/` root.
7. Stop and reconcile first if a same-slug issue root already exists anywhere under `issues/open/`.
8. Decide whether the seed imports as one issue or as a complex, parallelizable issue series.
   - First inspect the root seed's `## Recommended Direction` for an `### Issue Series Breakdown` block.
   - If the block is present and parses cleanly against the locked breakdown schema in `series-materialization-reference.md`, treat it as the proposed split plan, then validate that the leaves are actually parallelizable real issues before materializing them.
   - If present but malformed (missing required fields, indentation error, schema mismatch), halt with a structured error that names the offending fields. Do not create any scaffold. Do not fall through to the single-issue path. Example error format: `Halt: \`### Issue Series Breakdown\` block missing required fields: \`acceptance_independent\` on phase 02. No scaffold created. Parent seed unchanged.`
   - If the block is absent, analyze the seed report and the grounded live codebase surfaces to decide whether the work naturally separates into two or more independently plannable, independently acceptable issues.
   - Create a series only when the split can state true `files_disjoint`, `runtime_independent`, and `acceptance_independent` claims for each phase, with dependency barriers made explicit where phases must run in order.
   - If the work is merely large, sequential, or acceptance-coupled, continue with the next step (single-issue path).
   - If the work qualifies for a series, author or normalize a breakdown that satisfies the locked breakdown schema in `series-materialization-reference.md`, do not create the parent's issue folder, hand off to the materialization sub-flow in `series-materialization-reference.md`, and return after the materializer completes.
   - Activation is determined once at the start of the turn per `## Activation And Fallback`. The materialization sub-flow inherits that determination. The `Grounding:` footer follows the same honest inline-tagged codebase-surface rule as the parent turn. Root artifacts such as `issue-series-structure.md` are surfaced via `## Grounding Anchors` on each materialized leaf issue's `planning/plan.md`, not by treating issue work product as grounding.
9. Create the issue root as `issues/open/<slug>/` and write its initial `state.yaml` with `createIssueState(execRoot, slug, created, <resolved-report-path>)`.
10. Create the canonical planning and implementation file set from `authoring-reference.md` `## Canonical File Model`.
11. Seed `planning/plan.md` from the seed report by translating the report into the canonical planning brief structure from `authoring-reference.md`.
12. Carry forward the report's user intent snapshot, observed symptom, expected behavior, violated intent, broken systemic contract, recommended direction, acceptance criteria, and constraints and exclusions.
13. Re-resolve every inherited `## Grounding Anchors` entry against live code or markdown before trusting the brief; write each confirmed or diverged result into the new planning brief's `## Doc/Code Tensions`, and flag any seed-asserted contract that resolves to nothing before it enters `plan.md`.
14. Record the imported report path under inputs reviewed or addendum history so the source artifact is traceable; the same resolved report path is the lifecycle state's `seed_path`.
15. Seed `implementation/plan.md` and the consultant files using the normal create flow rules and the locked scaffold in `authoring-reference.md`.
16. Read the new `planning/plan.md` first.
17. If parsed config sets `orchestrator.gates.park_after_scaffold: operator`, invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> park.hold` after the imported scaffold, `state.yaml` at `P-draft`, and seeded `plan.md` exist, then exit without writing a consultant position, using the same separate-position exit shape as `## Planning Grill Gate`. Otherwise, if the operator's invocation message included a planning-grill signal, run the brief-grill lane in place of this step and exit. Otherwise, run the position-interview lane when it fires and write or update the active slot's planning consultant file.
18. Keep `state.yaml` at `P-draft` until both planning consultant files contain substantive independent positions plus all responses owed by `## Rebuttal Round Policy`.
19. Write consult artifacts in the primary checkout; do not redirect them to an active implementation worktree.

## Series Materialization Lane

When import elects a series, read `series-materialization-reference.md` and follow its `## Complex Series Issue Materialization Sub-Flow`, `## Series Leaf Execution Marker Rule`, locked breakdown schema, `SERIES.md` template, and locked series leaf issue template verbatim.

## Attach Flow

When the user references an existing issue or phase folder:

1. Resolve the explicit issue or phase folder reference.
2. If the user points at the issue root, default to `planning/`.
3. Resolve the phase's canonical brief:
   - use `plan.md`
4. Invoke the target-qualified `status-read issue <slug>` or `status-read series <series> <leaf>` form before choosing an Attach Flow pass. If the lifecycle CLI reports a malformed run-status file, surface that failure and stop. A structured `statusState: absent` result is the normal absent-tolerant legacy/manual path, not a park failure. Interpret position and rebuttal tokens per `## Parallel Stage Token Rule`; a peer-named parallel-stage token never turns the active slot's pending pass into a no-op.
5. If `statusState` is `present` and the returned successor is `park.hold`, treat the issue as parked rather than as an ordinary position, rebuttal, synthesis, or audit request. Require the explicit release form `release park and continue`; without it, refuse the request. On release, invoke the same target-qualified `status-write` form with `park.release`, then continue into the substantive pass it unblocks and inherit that pass's operation label. Before returning, derive that substantive pass's actual next durable step and replace `park.release` through `status-write`, leaving exactly one final successor on disk. Release-only runs are forbidden, and release never changes `state.yaml`.
6. If the user does not explicitly ask for synthesis, rebuttal, response, critique, addendum, or implementation-plan fidelity audit, use the default independent-position route:
   - read the resolved phase brief
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read the peer consultant file
   - write or update the active slot's consultant file from the phase brief and live repo context only
   - if this is an initial planning position pass, run the position-interview lane when it fires before writing
   - if you materially rewrite the independent position after a rebuttal addendum already exists, reset the active slot's `## Rebuttal Addendum` to pending so the rebuttal round can be refreshed
7. If the user explicitly asks for synthesis:
   - the active slot performs the synthesis; canonical per-phase ownership follows `## Standard Review Sequence` step 5, and a slot must not refuse a synthesis pass routed to it by the operator or an orchestrated dispatch
   - read the phase brief plus both consultant files
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - stop and direct the user to finish the missing independent position first if either consultant file lacks a substantive independent position
   - stop and direct the user to finish every response owed by `## Rebuttal Round Policy` if either consultant file is missing one
   - rewrite the phase brief as one coherent current document using `authoring-reference.md`
8. If the user explicitly asks for implementation-plan fidelity audit:
   - stop if not working in `implementation/`
   - read only `planning/plan.md` and `implementation/plan.md` as audit evidence
   - use the non-synthesizing peer slot and write or update that slot's owned `## Fidelity Audit`
   - do not read the peer's implementation position as audit evidence
9. If the user explicitly asks for rebuttal, response, critique, or addendum against the peer:
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read the active slot's consultant file
   - stop and direct the user to finish the peer's independent position first if it is missing or non-substantive
   - read the peer consultant file's independent position
   - for round 1, do not read or answer the peer rebuttal addendum; update the active slot's owned `## Rebuttal Addendum` accordingly
   - for round 2, follow the shared frozen fork brief and symmetric read restrictions in `## Rebuttal Round Policy`
10. If working in `planning/`, write or update `planning/a.md` for slot A or `planning/b.md` for slot B.
11. If working in `implementation/`, write or update `implementation/a.md` for slot A or `implementation/b.md` for slot B.
12. Reuse the canonical intent already stored on disk.
13. Preserve `## Review Addendum` and `## Addendum Log` when rewriting the phase brief. The active review addendum is the repair checklist source of truth; the addendum log is the history trail.
14. If the user supplied a new note, append it under `## Addendum Log` in the phase brief.
15. Keep the issue lifecycle state synced to the next durable step:
   - `P-draft -> P-synth` when both planning consultant files contain substantive independent positions and all responses owed by `## Rebuttal Round Policy`
   - `P-synth -> I-draft` when planning synthesis exists in `planning/plan.md` and the user has approved implementation planning to begin under `authoring-reference.md` `## Approval Templates`
   - `I-draft -> I-synth` when both implementation consultant files contain substantive independent positions and all responses owed by `## Rebuttal Round Policy`
   - derive `I-synth -> I-ready` identically for manual and orchestrated runs: require implementation synthesis in `implementation/plan.md` plus the non-synthesizing peer's fresh `faithful` verdict from `## Standard Review Sequence` step 6; explicit approval or `orchestrator.gates.implementation_synth: auto` requests evaluation but cannot replace that evidence
   - on the first `drift` verdict, keep `I-synth` and route the mismatch list to the synthesizing slot for repair and a fresh audit
   - on a second consecutive `drift` verdict, keep `I-synth` and require the operator to choose implementation-plan repair or a planning amendment; the operator cannot waive fidelity
   - a planning amendment during `I-synth` invalidates the implementation join and every earlier audit verdict until implementation synthesis and the fidelity audit are refreshed
   - issues already in `I-ready`, `C-ready`, `C-fix`, or `D-merge` without the qualifying fidelity audit carry a logged fidelity gap instead of a consult-driven bounce
   - do not advance the phase just because `plan.md` was restored, migrated, or rewritten
   - a synthesized `plan.md` may remain in `P-synth` or `I-synth` until the approval gate is met
16. Apply durable state transitions with one `transition` command:
   - standalone issue: `bun issues/.scripts/lifecycle.ts transition issue <slug> <to-phase> --message <commit-message>`
   - series leaf: `bun issues/.scripts/lifecycle.ts transition series <series> <leaf> <to-phase> --message <commit-message>`
17. Let the command perform the active-worktree and main-checkout state writes and checkpoint commits.

## Output Standard

Read and follow `authoring-reference.md` `## Output Standard` for every run-status write and every terminal-facing response. Its target-qualified CLI forms, four exclusions, locked operation labels, locked `Next step:` sentences, and output templates are mandatory parts of this skill contract.
