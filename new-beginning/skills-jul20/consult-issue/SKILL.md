---
name: consult-issue
description: Create or continue a dual-consult issue workflow with planning and implementation phases organized around canonical `plan.md` briefs plus `codex.md` and `claude.md` position files, using `state.yaml` lifecycle state to show the next durable step (`P-draft`, `P-synth`, `I-draft`, `I-synth`, `I-ready`, `C-ready`, `C-fix`, `D-merge`). Use when opening a new issue, importing a portable seeded issue report from `seed-issue`, continuing a planning or implementation phase, writing one owned rebuttal addendum against the peer's independent take, migrating legacy issue folders, or synthesizing Codex and Claude positions into one shared plan.
---

# Consult Issue

Run this workflow directly through the LLM. Do not depend on helper scripts.

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

Consultant files (`claude.md`, `codex.md`) must cite the relevant grounding anchor inline whenever the consultant asserts a codebase contract, using the configured path form at the end of the asserting sentence.

When asserting the absence of an existing primitive, name the searched surfaces as anchors, bounded by the no-broad-scan ceiling: relevant configured index slices, configured docs, and directly relevant live surfaces opened in the pass. A codebase-contract assertion in a consultant file with no inline anchor citation is an ungrounded assertion and a grounding defect.

When `grounding: none` is configured the variant defers to base `consult-issue` and does not produce these sections or inline citations.

## Canonical File Model

Each phase should use:

- `plan.md`
- `codex.md`
- `claude.md`

Preferred structure:

- `planning/plan.md`
- `planning/codex.md`
- `planning/claude.md`
- `implementation/plan.md`
- `implementation/codex.md`
- `implementation/claude.md`

This skill exists as three global copies at `C:/Users/ijura/.claude/skills/consult-issue/SKILL.md`, `C:/Users/ijura/.codex/skills/consult-issue/SKILL.md`, and `C:/Users/ijura/.pi/agent/skills/consult-issue/SKILL.md`; the `.codex` and `.pi` copies are byte-identical, while the `.claude` copy differs only by Claude<->Codex role swaps and the `AskUserQuestion`/`request_user_input` tool-name swap. Any edit to one copy must be applied to all three while preserving only those adaptations.

## Most Intuitive Mental Model

Treat `plan.md` as the canonical judge file for the phase.

- In `planning/`, `plan.md` is the decision plan.
- In `implementation/`, `plan.md` is the execution plan.

This keeps both phases aligned on one canonical filename the user can act on directly.

## Issue Root State

Resolve the current lifecycle phase from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts`; issue paths are slug-only or marker-only and do not encode lifecycle phase, and a worktree's `state.yaml` copy is an inert snapshot, never the authority. Every durable state transition calls the `transition` verb in `issues/.scripts/lifecycle.ts`, which performs the guarded write and checkpoint commit against the control-root `state.yaml` only; it does not write the worktree copy, which stays an inert snapshot. At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.

The issue state must carry the next durable step:

- `P-draft` = at least one planning consultant file is still missing a substantive independent position or a substantive rebuttal addendum
- `P-synth` = both planning consultant files contain substantive independent positions plus substantive rebuttal addendums and planning is not yet approved to advance
- `I-draft` = planning is approved and at least one implementation consultant file is still missing a substantive independent position or a substantive rebuttal addendum
- `I-synth` = both implementation consultant files contain substantive independent positions plus substantive rebuttal addendums and implementation is not yet approved to execute
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
- Do not translate consult artifact paths into an active worktree for `plan.md`, `claude.md`, `codex.md`, or `state.yaml`.
- Write consultant positions, rebuttals, syntheses, and phase-plan updates in the primary checkout even when an implementation worktree exists.
- Treat an active issue worktree only as the location for actual implementation/code edits during implement-issue, check/fix repair work, and merge mechanics.
- If the operator explicitly asks for a worktree path or gives an absolute path under a worktree, honor that path for inspection, but do not use it as the default consult-artifact write target.

## Series Slug Collision Guard

Before any series issue materialization, inspect both the main checkout and the active issue worktree for `issues/open/<series-slug>/` directories matching the breakdown's `series_slug`. A series-slug collision with an existing series folder must be caught pre-materialization, not after the folder is half-written.

## Substantive Consultant File Rule

A consultant file is phase-complete for draft exit only when it contains both:

- a substantive independent position for the active phase
- a substantive `## Rebuttal Addendum` that responds to the peer's independent position

Additional rules:

- Placeholder scaffolds do not count.
- Text such as `Pending independent ... position`, `Pending rebuttal ...`, `To be written from ...`, or `Placeholder file created ...` is non-substantive.
- Restored or migrated content can count as substantive when it records a real consultant position or rebuttal instead of a placeholder.
- If an independent position is materially rewritten after a rebuttal addendum already exists, reset that rebuttal addendum to pending and keep the phase in `P-draft` or `I-draft` until fresh rebuttals are written.

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

## Standard Review Sequence

Before any pass below - initial independent position, rebuttal addendum, or synthesis - first read enough of the host codebase to understand how it actually works. That includes the modules, scripts, conventions, folder layout, naming conventions, existing abstraction types, established patterns for where documents, scripts, and code live, configuration and registration patterns, and extension points. The recommendation that comes out of the pass must be grounded in that scan.

- Prefer reusing or reshaping what the host codebase already provides over introducing parallel paths, parallel naming conventions, parallel abstraction types, or parallel placement locations.
- Adding new code, new files, new folders, new abstractions, or new placement locations is permitted, but only when no existing primitive of any kind - whether a module, helper, configuration, convention, or extension point - covers the need. Any new addition must still follow the host codebase's existing naming conventions, layout patterns, abstraction types, and registration or extension points. The absence-of-primitive reason must follow the grounded-absence rule in `## Anchor Capture Format`.
- When writing a rebuttal addendum, measure the peer's recommendation against the same host-codebase reality. Do not argue against the peer using an abstract ideal or patterns from a different codebase; the rebuttal must be grounded in the same scan that grounds the independent position.
- When synthesizing, weigh both consultant positions through host-codebase fit alongside the six internal review lenses. Do not promote a recommendation that quietly clashes with the host codebase's existing infrastructure.
- The rule's wording is framework-agnostic so the same text applies to whatever codebase this skill is invoked inside; the behavior it mandates is context-specific to whichever codebase that is.

1. Initial Claude pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read `codex.md`
   - write Claude's independent position
2. Initial Codex pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read `claude.md`
   - write Codex's independent position
3. Claude rebuttal pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read `claude.md`
   - read Codex's independent position in `codex.md`
   - do not read or answer Codex's rebuttal addendum
   - write or update Claude's owned `## Rebuttal Addendum`
4. Codex rebuttal pass
   - read phase `plan.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read `codex.md`
   - read Claude's independent position in `claude.md`
   - do not read or answer Claude's rebuttal addendum
   - write or update Codex's owned `## Rebuttal Addendum`
5. Synthesis pass
   - read `plan.md`, `codex.md`, and `claude.md`
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - evaluate both independent positions plus both rebuttal addendums
   - rewrite `plan.md` into one coherent decision or execution brief
   - prepare one visible explain-style synthesis walkthrough for the terminal-facing response
   - escalate to the user only if a real decision fork remains

The operator may invoke `planning grill pass` mode before any initial planning position pass (steps 1 and 2 above) to sharpen the planning brief in place against operator-answered material fuzz - see `## Planning Grill Gate` for the gate's full contract. The gate is default-off; when not invoked, the consultant runs the initial planning position pass as listed above.

Require exactly one rebuttal round before synthesis. The two rebuttal passes can happen in either order once both independent positions exist. Do not create rebuttal-of-rebuttal loops unless the user explicitly asks for a deeper debate.

## Planning Grill Gate

The planning grill gate is a single-consultant, operator-invoked mode that runs once per planning phase before any independent planning position is written. It sharpens the planning brief in place against operator-answered material fuzz.

**When the gate fires.** The gate is default-off. It fires only when the operator includes a grill-mode signal in a `consult-issue` invocation that runs `## Create Flow` or `## Portable Seed Report Import Flow` - example phrases: "grill the brief first," "do a planning grill pass," "grill the planning phase," "sharpen the brief." When no grill-mode signal is present, the create flow or seed-import flow runs as today (the creating consultant writes its own first independent position in the same invocation per step 10 / step 16). When the signal is present, the creating consultant runs the grill in place of writing its first independent position. Only one grill runs per planning phase, and it is always run by the issue-creating agent - the runner the operator invoked to run create flow or seed-import flow.

**Trigger position.** The grill mode fires after codebase grounding, phase-brief reading, and relevant host-codebase context - after the consultant has read `grounding.index`, the linked docs and live codebase surfaces relevant to the issue, the phase brief, and the host-codebase patterns that ground the recommendation.

**What the gate does.** The consultant scans the planning brief for material fuzz against five consequence surfaces - scope, decision triggers, acceptance criteria, non-goals, and risk/rollout posture. When material fuzz remains, the consultant asks the operator the batched questions through the `AskUserQuestion` tool, grouped by category: each tool call carries up to four questions from one category or adjacent categories, every question offers two to four concrete answer options with the recommended option first when one exists, and the tool's built-in free-text escape covers answers outside the listed options. The consultant fires as many category-batched tool calls as the material fuzz requires within the same grill pass and never delivers grill questions as plain prose. The consultant does not use per-question gating loops and does not walk a design tree of follow-up questions; category-batched `AskUserQuestion` calls within a single grill pass are the only in-grill question delivery.

**Authorized `plan.md` edit lane during the grill.** The consultant in grill mode is authorized to write operator answers into `plan.md` in place, scoped by three explicit constraints:

1. Edits are limited to the brief's existing content sections (scope, decision triggers, acceptance criteria, non-goals, constraints) - integrating operator answers as sharpened wording inside those sections, per the existing `## Plan Editing Rule`.
2. One neutral one-line entry per grill round may be appended to the brief's existing `## Addendum Log` section.
3. No new subheading is introduced anywhere - not in `plan.md`, not in `claude.md`, not in `codex.md`, not in the seed file.

**Termination.** Termination is self-attested: the consultant declares the grill complete when no remaining material fuzz threatens any of the five consequence surfaces. The same five-surface list serves as both the scanning prompt ("is there ambiguity in any of these surfaces?") and the termination test ("does any remaining fuzz still threaten one of these surfaces?"). There is no minimum-batch floor; zero-question-batch termination is a valid run on a clean brief.

**Mid-grill operator short-circuit.** The operator may short-circuit the grill at any time with natural language - example phrases: "that's enough," "fast path from here," "skip the rest." The consultant honors the short-circuit, writes any sharpening gathered so far (if any), appends the addendum-log entry, and exits.

**Exit.** The consultant in grill mode exits without writing a consultant position to `claude.md` or `codex.md` - the grill replaces step 10 of `## Create Flow` or step 16 of `## Portable Seed Report Import Flow` for the invocation that triggered it. After the grill pass completes, the operator launches separate `consult-issue` invocations - serially, in parallel, or one at a time - to obtain both consultants' first independent positions against the now-sharpened `plan.md`. Both first independent positions are written against the same sharpened input, with no information asymmetry from the live grilling exchange.

**Scope of application.** The grill gate applies only to initial planning position passes invoked through `## Create Flow` or `## Portable Seed Report Import Flow`. It does not fire on rebuttal addendums, on synthesis passes, on `## Attach Flow` invocations against an already-existing issue, or on any implementation-phase pass.

### Question Authoring Standard

- **Self-contained background:** state the decision context in plain language, define necessary jargon at first use, and explain why the answer matters.
- **Current-state inventory:** before or within the first question batch, enumerate the relevant existing surfaces, settled constraints, and known gap so the operator does not have to reconstruct prior context. Bound this to what the current choice needs; do not replay issue history.
- **Consequence-bearing options:** every option description states the concrete behavior, scope, or tradeoff that selecting it authorizes.
- **Evidence-based recommendation:** when evidence favors an option, place it first and mark it recommended; when evidence does not favor one, do not manufacture a recommendation.

These rules govern question content only. They change nothing about when the gate fires, how questions batch, or how the gate terminates.

Any operator-facing question this skill asks follows the Question Authoring Standard.

The two `### Question Authoring Standard` blocks must remain word-for-word identical.

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
5. Create:
   - `planning/plan.md`
   - `planning/codex.md`
   - `planning/claude.md`
   - `implementation/plan.md`
   - `implementation/codex.md`
   - `implementation/claude.md`
6. Seed `planning/plan.md` with:
   - user intent snapshot
   - scope
   - non-goals when needed
   - deliverables
   - inputs reviewed
   - inherited agreements when present
   - findings
   - decision framing
   - detailed checklist
   - acceptance criteria
   - done means
   - addendum log
7. Seed `implementation/plan.md` with:
   - inherited intent snapshot
   - implementation scope
   - non-goals
   - deliverables
   - complexity posture
   - risks
   - ordered execution structure
   - review addendum
   - regression checklist
   - rollout notes
   - done means
   - addendum log
8. Seed each consultant file with the standard consultant structure:
   - `# Position`
   - `# Recommended Direction`
   - `# Risks`
   - `# Simpler Alternative`
   - `# Checklist`
   - `## Rebuttal Addendum`
   - `## Addendum Log`
   - leave the independent position and rebuttal sections explicitly pending until their pass is run
9. Read the new `planning/plan.md` first.
10. If the operator's invocation message included a planning-grill signal (see `## Planning Grill Gate`), run the grill in place of this step and exit. Otherwise, write or update `planning/claude.md`.
11. Keep `state.yaml` at `P-draft` until both planning consultant files contain substantive independent positions plus substantive rebuttal addendums.
12. Write consult artifacts in the primary checkout; do not redirect them to an active implementation worktree.

### Generated Seed Series Branch

When Create Flow step 3 elects a series, this branch authors only a portable seed and returns through the existing import flow; it is not a materialization lane and must not call `### Complex Series Issue Materialization Sub-Flow` directly.

1. Reuse the `<series-slug>` settled in Create Flow step 3. Do not re-derive, shorten, or rename it.
2. Before any write, run both collision checks:
   - Run `## Series Slug Collision Guard` for `issues/open/<series-slug>/`.
   - Check for an existing seed file at `issues/open/<series-slug>.md`; halt before writing if it exists.
3. Confirm authorization:
   - An explicit complex or series request authorizes seed authoring once the three claims in Create Flow step 3 pass.
   - A skill-proposed series upgrade from an ordinary create request must present the phase and leaf split to the operator and receive confirmation before writing the seed.
   - On an explicit request where the three claims fail, report the failed claims and create no scaffold; do not force a split and do not silently downgrade.
4. Author the portable seed at `issues/open/<series-slug>.md` with the parent intent snapshot, observed gap, expected behavior, constraints, operator-locked decisions already known from the conversation, recommended direction, series-wide acceptance criteria, and a `### Issue Series Breakdown` block that satisfies the Locked Breakdown Schema. The breakdown's `series_slug` field must be the identical `<series-slug>` used in the seed filename.
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
   - If the block is present and parses cleanly against the **Locked Breakdown Schema** below, treat it as the proposed split plan, then validate that the leaves are actually parallelizable real issues before materializing them.
   - If present but malformed (missing required fields, indentation error, schema mismatch), halt with a structured error that names the offending fields. Do not create any scaffold. Do not fall through to the single-issue path. Example error format: `Halt: \`### Issue Series Breakdown\` block missing required fields: \`acceptance_independent\` on phase 02. No scaffold created. Parent seed unchanged.`
   - If the block is absent, analyze the seed report and the grounded live codebase surfaces to decide whether the work naturally separates into two or more independently plannable, independently acceptable issues.
   - Create a series only when the split can state true `files_disjoint`, `runtime_independent`, and `acceptance_independent` claims for each phase, with dependency barriers made explicit where phases must run in order.
   - If the work is merely large, sequential, or acceptance-coupled, continue with the next step (single-issue path).
   - If the work qualifies for a series, author or normalize a breakdown that satisfies the **Locked Breakdown Schema**, do not create the parent's issue folder, hand off to the `### Complex Series Issue Materialization Sub-Flow` below, and return after the materializer completes.
   - Activation is determined once at the start of the turn per `## Activation And Fallback`. The materialization sub-flow inherits that determination. The `Grounding:` footer follows the same honest inline-tagged codebase-surface rule as the parent turn. Root artifacts such as `issue-series-structure.md` are surfaced via `## Grounding Anchors` on each materialized leaf issue's `planning/plan.md`, not by treating issue work product as grounding.
9. Create the issue root as `issues/open/<slug>/` and write its initial `state.yaml` with `createIssueState(execRoot, slug, created, <resolved-report-path>)`.
10. Create:
   - `planning/plan.md`
   - `planning/codex.md`
   - `planning/claude.md`
   - `implementation/plan.md`
   - `implementation/codex.md`
   - `implementation/claude.md`
11. Seed `planning/plan.md` from the seed report by translating the report into the canonical planning brief structure.
12. Carry forward the report's:
   - user intent snapshot
   - observed symptom
   - expected behavior
   - violated intent
   - broken systemic contract
   - recommended direction
   - acceptance criteria
   - constraints and exclusions
13. Re-resolve every inherited `## Grounding Anchors` entry against live code or markdown before trusting the brief; write each confirmed or diverged result into the new planning brief's `## Doc/Code Tensions`, and flag any seed-asserted contract that resolves to nothing before it enters `plan.md`.
14. Record the imported report path under inputs reviewed or addendum history so the source artifact is traceable; the same resolved report path is the lifecycle state's `seed_path`.
15. Seed `implementation/plan.md` and the consultant files using the normal create flow rules.
16. Read the new `planning/plan.md` first.
17. If the operator's invocation message included a planning-grill signal (see `## Planning Grill Gate`), run the grill in place of this step and exit. Otherwise, write or update `planning/claude.md`.
18. Keep `state.yaml` at `P-draft` until both planning consultant files contain substantive independent positions plus substantive rebuttal addendums.
19. Write consult artifacts in the primary checkout; do not redirect them to an active implementation worktree.

### Complex Series Issue Materialization Sub-Flow

When the import decision gate elects a series using either an explicit seed breakdown or an LLM-authored breakdown:

1. Derive `<series-slug>` from the breakdown's `series_slug` field.
2. Run the series slug collision guard with `<series-slug>` against existing series folders.
3. Create `issues/open/<series-slug>/`.
4. Apply the **Series Leaf Execution Marker Rule** below before writing `SERIES.md` or any leaf issue root.
5. Write `issues/open/<series-slug>/SERIES.md` using the **Locked SERIES.md Template** below. `SERIES.md` indexes the nested issue roots and does not carry grounding anchor sections or phase state.
6. For each phase entry in order:
   - Create `issues/open/<series-slug>/<phase_folder>/`.
   - For each leaf entry in that phase, derive `<leaf-root>` from the normalized marker by removing one trailing `.md`; `<leaf-root>` must be `<NN><mode>-<leaf-slug>`.
   - Create the real issue root `issues/open/<series-slug>/<phase_folder>/<leaf-root>/`.
   - Create all six issue files under that root: `planning/plan.md`, `planning/codex.md`, `planning/claude.md`, `implementation/plan.md`, `implementation/codex.md`, and `implementation/claude.md`.
   - Seed `planning/plan.md` using the **Locked Series Leaf Issue Template** below. Translate the breakdown's per-leaf fields into the canonical planning brief and expand it to the `## Checklist Quality Bar` standard - a leaf brief whose sections are bare one-line copies of the breakdown fields is a materialization defect; write no standalone markdown file for the leaf.
   - When the breakdown was LLM-authored during this import, derive each per-leaf field from the seed report and the grounded analysis performed in this invocation.
   - Seed `implementation/plan.md` and all consultant files using the normal create flow rules.
7. After every leaf issue root exists, write the series master `state.yaml` with `createSeriesState(execRoot, series, created, <resolved-report-path>)`. Leaf identity is derived from the physical `SERIES.md` rows and marker artifacts; no per-leaf `created` value is stored.
8. After every leaf issue root exists, read each new `planning/plan.md` first. If the operator's invocation message included a planning-grill signal, run the grill for each leaf issue in place of this step and exit. Otherwise, write or update this skill's own `planning/claude.md` in every leaf issue with a substantive first independent planning position. Leave `planning/codex.md` pending for the peer consultant.
9. Leave the parent seed at its resolved `issues/open/<systemic-slug>.md` path untouched.
10. Do not create `planning/` or `implementation/` subfolders for the parent seed.
11. Keep each leaf state at `P-draft` until both planning consultant files contain substantive independent positions plus substantive rebuttal addendums.
12. End the consult turn after real leaf issue materialization and this skill's planning positions are complete.

### Series Leaf Execution Marker Rule

Materialized series leaf issue roots use a visible execution marker in the root name:

```text
<NN><mode>-<leaf-slug>/
```

- `<NN>` is the two-digit global leaf order across the whole series, starting at `01`.
- `<mode>` is `p` for parallelizable within its wave or `s` for sequential.
- Use lowercase `p` and `s`; do not use uppercase `P` or `S` inside the slug because marker slugs remain lowercase.
- `p` means the leaf can be planned or implemented concurrently with the other `p` leaves in the same dependency wave after the wave's dependency barrier is satisfied.
- `s` means the leaf should be run after the prior numbered leaf or after the dependency named in `SERIES.md`.
- If the breakdown already supplies `leaf_file` in marker form, preserve that order/mode unless it conflicts with the phase dependency barrier.
- If the breakdown supplies legacy `leaf_file: P-draft-<leaf-slug>.md`, normalize it during materialization to marker form and reflect the normalized issue root in `SERIES.md`; do not mutate the parent seed just to normalize the imported example.
- When authoring or normalizing a breakdown, prefer explicit per-leaf `execution_mode: parallel` or `execution_mode: sequential`. If absent, infer `s` for integration leaves and dependency-gate leaves, and infer `p` only for leaves whose `files_disjoint`, `runtime_independent`, and `acceptance_independent` claims truly hold within the same wave.

### Locked Breakdown Schema

````markdown
### Issue Series Breakdown

```yaml
series_slug: <series-slug>
phases:
  - phase_folder: 01-<phase-slug>
    parallelization_claim:
      files_disjoint: <one-line assertion>
      runtime_independent: <one-line assertion>
      acceptance_independent: <one-line assertion>
    dependency_barrier: <optional one-line condition or omit field>
    is_integration_phase: false
    leaves:
      - leaf_slug: <leaf-slug>
        leaf_file: 01p-<leaf-slug>.md
        execution_mode: parallel
        summary: <one-line summary - sources `## User Intent Snapshot`>
        scope: <one-line bounded surface - sources `## Scope Of The Leaf`>
        observed_symptom: <one-line, leaf-scoped - sources `## Observed Symptom`>
        expected_behavior: <one-line, leaf-scoped - sources `## Expected Behavior`>
        recommended_direction: <one-line direction - sources `## Recommended Direction`>
        acceptance_criteria: <one-line acceptance - sources `## Acceptance Criteria`>
        constraints_and_exclusions: <one-line constraints - sources `## Constraints And Exclusions`>
      - leaf_slug: <leaf-slug>
        leaf_file: 02p-<leaf-slug>.md
        execution_mode: parallel
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
  - phase_folder: 02-<phase-slug>
    parallelization_claim:
      files_disjoint: <one-line assertion>
      runtime_independent: <one-line assertion>
      acceptance_independent: <one-line assertion>
    leaves:
      - leaf_slug: <leaf-slug>
        leaf_file: 03s-<leaf-slug>.md
        execution_mode: sequential
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
  - phase_folder: NN-<integration-phase-slug>
    is_integration_phase: true
    parallelization_claim:
      files_disjoint: sequential single-leaf integration phase
      runtime_independent: sequential single-leaf integration phase
      acceptance_independent: sequential single-leaf integration phase
    leaves:
      - leaf_slug: <integration-leaf-slug>
        leaf_file: <NN>s-<integration-leaf-slug>.md
        execution_mode: sequential
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
```
````

snake_case YAML keys inside the fence; title-case markdown heading outside. Required per-leaf fields: nine (`leaf_slug`, `leaf_file`, `summary`, `scope`, `observed_symptom`, `expected_behavior`, `recommended_direction`, `acceptance_criteria`, `constraints_and_exclusions`). `leaf_file` is retained for portable seed compatibility; the materializer normalizes legacy names and strips one trailing `.md` to derive the nested issue-root folder name. Each verbatim-sourced planning-brief section opens with its single authored source field; the materializer then expands every section of the leaf brief to the `## Checklist Quality Bar` standard using the parent seed, the operator-locked decisions, and the grounded codebase analysis from the materialization turn. Expansion must never contradict its verbatim source line, and detail the materializer cannot ground is named as an open item rather than invented. Optional per-leaf fields: `execution_mode` (`parallel` or `sequential`). Optional per-phase fields: `dependency_barrier`, `is_integration_phase`.

### Locked SERIES.md Template

```markdown
# <Series Slug> - Series Index

Parent seed: `issues/open/<systemic-slug>.md`

## Execution Legend

- `p` in `<NN>p-...` = parallelizable within its dependency wave.
- `s` in `<NN>s-...` = sequential; run after the prior numbered issue or named dependency.

## Phases

### 01-<phase-slug>

- Parallelization claim:
  - files_disjoint: <verbatim from breakdown>
  - runtime_independent: <verbatim from breakdown>
  - acceptance_independent: <verbatim from breakdown>
- Dependency barrier before next phase: <verbatim or `none`>

| Order | Mode | Leaf            | File                                      |
|-------|------|-----------------|-------------------------------------------|
| 01    | p    | <leaf-slug>     | `01-<phase-slug>/01p-<leaf-slug>/`       |
| 02    | p    | <leaf-slug>     | `01-<phase-slug>/02p-<leaf-slug>/`       |

### 02-<phase-slug>
...
```

`SERIES.md` carries no grounding anchors and no phase state. It is a stateless locator table; lifecycle phase lives in the series master `state.yaml`.

### Locked Series Leaf Issue Template

```markdown
# Planning Brief

Parent seed: `issues/open/<systemic-slug>.md`
Series: `issues/open/<series-slug>/`
Phase: `<phase_folder>`
Issue root: `issues/open/<series-slug>/<phase_folder>/<NN><mode>-<leaf-slug>/`

## User Intent Snapshot

<verbatim from the breakdown's per-leaf `summary` field, then expanded with `Requested change`, `Outcome sought`, `Why this matters now`, `Constraints and exclusions`, and `Decision trigger` lines drawn from the parent seed>

## Observed Symptom

<verbatim from the breakdown's per-leaf `observed_symptom` field, then expanded with the concrete codebase evidence - files, schemas, routes, behaviors - that makes the symptom real>

## Expected Behavior

<verbatim from the breakdown's per-leaf `expected_behavior` field, then expanded into the full observable end state across the runtime surfaces where it shows>

## Scope Of The Leaf

<verbatim from the breakdown's per-leaf `scope` field, then expanded into a named-surface inventory: the concrete files, schemas, workers, routes, and artifacts this leaf touches>

## Non-Goals

<the exclusions this leaf must not absorb, drawn from the breakdown's `constraints_and_exclusions`, the parent seed, and sibling-leaf boundaries>

## Deliverables

<enumerated concrete deliverables: migrations, modules, endpoints, UI surfaces, config, docs, tests>

## Inputs Reviewed

<the parent seed, the operator-locked decisions inherited by this leaf, and the grounded codebase surfaces consulted>

## Findings

<what the materialization-time grounding pass established about the live codebase that planning must respect, as evidence-backed bullets>

## Recommended Direction

<verbatim from the breakdown's per-leaf `recommended_direction` field, then expanded with the reasoning the parent seed and grounding support>

## Decision Framing

<the real forks planning must resolve, each stated as a question with its known option space; inherited operator-locked decisions are listed as settled and are not re-opened>

## Detailed Checklist

<execution-grade checklist per `## Checklist Quality Bar`: workstreams with sub-checklists, concrete files and runtime surfaces, verification and regression items, preservation constraints>

## Acceptance Criteria

<verbatim from the breakdown's per-leaf `acceptance_criteria` field, then expanded into individually checkable criteria>

## Constraints And Exclusions

<verbatim from the breakdown's per-leaf `constraints_and_exclusions` field, then expanded with every inherited operator-locked decision that binds this leaf>

## Done Means

<one short plain-language statement of the observable state that ends the leaf>

## Grounding Anchors

- <codebase files consulted during the materialization turn, including the configured `grounding.index` when consulted>
- `issue-series-structure.md` - the structural reference this series materialization honors.

## Doc/Code Tensions

<every doc-versus-live-surface mismatch and vocabulary resolution observed during the materialization grounding pass, or `None observed during the materialization grounding pass.`>

## Addendum Log

- <one-line materialization entry naming the parent seed and the grill round when one ran>
```

Each materialized leaf is a complete issue root, not a seed file, and its brief is held to the same `## Checklist Quality Bar` as any standalone planning brief. The initial creating Claude pass writes its own `planning/claude.md` independent position unless the planning grill gate fires; the peer `planning/codex.md` and both implementation consultant files remain explicit pending scaffolds.

## Attach Flow

When the user references an existing issue or phase folder:

1. Resolve the explicit issue or phase folder reference.
2. If the user points at the issue root, default to `planning/`.
3. Resolve the phase's canonical brief:
   - use `plan.md`
4. If the user points at a phase folder without explicitly asking for synthesis or rebuttal, treat it as a request for Claude's own independent phase position.
5. In that default independent mode:
   - read the resolved phase brief
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - do not read the peer consultant file
   - write or update Claude's consultant file from the phase brief and live repo context only
   - if you materially rewrite the independent position after a rebuttal addendum already exists, reset Claude's `## Rebuttal Addendum` to pending so the rebuttal round can be refreshed
6. If the user explicitly asks for synthesis:
   - read the phase brief plus both consultant files
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - stop and direct the user to finish the missing independent position first if either consultant file lacks a substantive independent position
   - stop and direct the user to finish both owned rebuttal addendums first if either rebuttal addendum is missing or non-substantive
   - rewrite the phase brief as one coherent current document
7. If the user explicitly asks for rebuttal, response, critique, or addendum against the peer:
   - if working in `implementation/`, also read sibling `planning/plan.md` as inherited decision context
   - read `claude.md`
   - stop and direct the user to finish the peer's independent position first if it is missing or non-substantive
   - read the peer consultant file's independent position
   - do not read or answer the peer rebuttal addendum
   - update Claude's owned `## Rebuttal Addendum` accordingly
8. If working in `planning/`, write or update `planning/claude.md`.
9. If working in `implementation/`, write or update `implementation/claude.md`.
10. Reuse the canonical intent already stored on disk.
11. Preserve `## Review Addendum` and `## Addendum Log` when rewriting the phase brief. The active review addendum is the repair checklist source of truth; the addendum log is the history trail.
12. If the user supplied a new note, append it under `## Addendum Log` in the phase brief.
13. Keep the issue lifecycle state synced to the next durable step:
   - `P-draft -> P-synth` when both planning consultant files contain substantive independent positions plus substantive rebuttal addendums
   - `P-synth -> I-draft` when planning synthesis exists in `planning/plan.md` and the user has approved implementation planning to begin
   - `I-draft -> I-synth` when both implementation consultant files contain substantive independent positions plus substantive rebuttal addendums
   - `I-synth -> I-ready` when implementation synthesis exists in `implementation/plan.md` and the issue is explicitly execution-ready
   - do not advance the phase just because `plan.md` was restored, migrated, or rewritten
   - a synthesized `plan.md` may remain in `P-synth` or `I-synth` until the approval gate is met
14. Apply durable state transitions with one `transition` command:
   - standalone issue: `bun issues/.scripts/lifecycle.ts transition issue <slug> <to-phase> --message <commit-message>`
   - series leaf: `bun issues/.scripts/lifecycle.ts transition series <series> <leaf> <to-phase> --message <commit-message>`
15. Let the command perform the active-worktree and main-checkout state writes and checkpoint commits.

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
5. Turn the result into one judged Claude position, not a reviewer transcript.
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
- `codex.md`: Codex position, recommendation, risks, simpler alternative, checklist, rebuttal addendum, addendum log
- `claude.md`: Claude position, recommendation, risks, simpler alternative, checklist, rebuttal addendum, addendum log

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
  - `Claude:` explain Claude's argument in beginner-readable cause-and-effect terms
  - `Codex:` explain Codex's argument in beginner-readable cause-and-effect terms
  - `Merged decision:` explain the chosen path, why it fits the issue, and what tradeoff it accepts
- Use `Merged decision: User choice required` only when evidence does not clearly favor one path.
- If any choice needs the user's call, stop before finalizing `## Decision` and ask the user to choose.

Change-summary rules:

- In `How the phase brief actually looked`, explain the pre-synthesis brief in simple current-state terms.
- In `What the merged plan changed`, contrast the pre-synthesis brief with the merged result.
- In `What it does NOT change`, stop the reader from imagining scope creep or behavior changes that are not part of the merged plan.
- In `The one-sentence version`, say plainly whether the merged path is ready to approve or whether a user choice still remains.

## Synthesis Rule

1. Write one main Claude position first from the phase brief without reading `codex.md` unless the user explicitly asks for synthesis or rebuttal.
2. Expect Codex to write its own independent position from the same phase brief without reading `claude.md`.
3. Require exactly one explicit rebuttal addendum from each side before synthesis. Each rebuttal must answer the peer's independent position, not the peer's rebuttal.
4. Treat the two independent consultant files plus the two owned rebuttal addendums as the normal inputs to synthesis.
5. Judge both consultant files as if neither one belongs to you; authorship is not evidence.
6. Evaluate both paths against the phase brief, the host-codebase fit, the whole-codebase fit, and all six internal review lenses before recommending a path.
7. Do not invent extra rebuttal rounds unless the user explicitly asks for a deeper debate.
8. During the rewrite, merge any older `plan.md` comparison, "agreements and disagreements", or separate "conflict" sections into the synthesized decision prose instead of duplicating them.
9. In the terminal-facing synthesis response, use the walkthrough structure from `## Disagreement Walkthrough Standard`, not a separate summary block.
10. Make the walkthrough beginner-friendly enough that a user can understand the old brief, the real forks, and the merged outcome without rereading both consultant files.
11. Use actual repo evidence for the walkthrough. If something is inferred rather than directly stated, say so.
12. Resolve each real fork using the plain choice format from `## Disagreement Walkthrough Standard`. Be willing to choose `Claude`, `Codex`, or `Merged` based on evidence rather than authorship.
13. If every real fork is resolved, finalize `## Decision` and present the phase as awaiting approval.
14. If a real unresolved fork remains with non-obvious consequences and neither side clearly wins on evidence, end that choice's `Merged decision:` with `User choice required` and `Why this needs your call:`, stop before finalizing `## Decision`, and ask the user to choose.

## Output Standard

Write `claude.md` using:

```markdown
# Position
# Recommended Direction
# Risks
# Simpler Alternative
# Checklist
## Rebuttal Addendum
## Addendum Log
```

End every terminal-facing response with the `Grounding:` footer line first, then:

`My last operation: <operation label>`

If there is a next issue-phase action for the user, add a separate line immediately below it:

`Next step: <short issue-phase instruction>`

Choose `<operation label>` verbatim from this closed list. Do not paraphrase, reword, extend, or invent labels; the same operation must emit the identical string in every run and in both the Claude and Codex copies of this skill:

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
- `planning plan migration`
- `implementation plan migration`
- `planning addendum update`
- `implementation addendum update`
- `lifecycle state transition`
- `no consult operation`

Label rules:

- `<N>` is the rebuttal round number written as a digit. The standard flow has exactly one rebuttal round, so the normal labels are `planning rebuttal round 1` and `implementation rebuttal round 1`. Use `round 2` and higher only when the operator explicitly requested a deeper debate.
- When one turn performs several operations, label the last durable artifact operation completed in that turn (position, rebuttal, synthesis, plan, addendum, seed, or migration work).
- A `state.yaml` update that happens in the same turn as an artifact operation is a side effect of that operation, not an operation of its own; it never changes the label. Example: the turn that writes the second rebuttal and thereby advances `P-draft -> P-synth` is labeled `planning rebuttal round 1`, never `lifecycle state transition`.
- Use `lifecycle state transition` only when the turn's sole durable change is to `state.yaml` and no artifact was touched (for example, an operator-requested state correction or approval advance).
- Use `no consult operation` when the turn changed no issue artifact and no lifecycle state (for example, answering a question).

Write `Next step` for the user, not for the workflow engine. Choose the sentence verbatim from this closed list, filling `<consultant>` with `Claude` or `Codex`:

- `Next step: Run consult-issue in <consultant> to write its independent planning position.`
- `Next step: Run consult-issue in <consultant> to write its planning rebuttal.`
- `Next step: Run consult-issue to synthesize the planning phase.`
- `Next step: Approve the planning synthesis to begin implementation planning.`
- `Next step: Run consult-issue in <consultant> to write its independent implementation position.`
- `Next step: Run consult-issue in <consultant> to write its implementation rebuttal.`
- `Next step: Run consult-issue to synthesize the implementation phase.`
- `Next step: Approve the implementation synthesis to make the issue execution-ready.`
- `Next step: Run implement-issue to execute the implementation plan.`
- `Next step: Run check-issue to review the implementation.`
- `Next step: Run merge-issue to merge and clean up the issue.`
- `Next step: None.`

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
