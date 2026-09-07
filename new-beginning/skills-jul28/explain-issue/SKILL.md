---
name: explain-issue
description: Explain an issue, issue plan, phase folder, or issue disagreement in plain language using first-principles reasoning, beginner-friendly mental models, simple analogies, and compact ASCII before/after sketches. Use when the user asks what an issue is about, wants the big picture, wants a noob-friendly explanation, asks for a mental model, says they are confused, or needs a proposed code change explained simply before planning, implementing, reviewing, or approving it.
---

# Explain Issue

Run this workflow directly through the LLM. This skill is for understanding, not for planning, implementation, checking, or merging.

## Codebase Grounding

Before invoking any base-skill behavior, read the configured grounding from `issues/config.yaml`. Use `grounding.index` as the first lookup surface when present, then read only configured docs and directly linked live codebase files relevant to the current issue. Do not perform broad scans of the codebase.

Use the configured grounding docs as vocabulary surfaces. When issue language diverges from the configured codebase vocabulary, surface the divergence, resolve it against those configured docs, and record the resolved term inside the issue artifacts under `## Doc/Code Tensions` in the same pass the divergence is discovered.

Treat `## Grounding Anchors` and `## Doc/Code Tensions` as the durable issue-artifact capture surfaces for grounding.

This methodology is derived from the published `grill-with-docs` pattern at <https://www.aihero.dev/grill-with-docs> and <https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md>. Only the docs-first grounding, terminology challenge, fuzzy-language sharpening, concrete-scenario verification, live-surface verification, and inline durable-capture concepts apply. The source's forced user-interview behavior - its user-question API names, its sequential single-question pattern, its per-question gating, and its design-tree walking - is explicitly excluded; the full forbidden-term list the validation scan enforces lives in this plan's `## Locked Text Fragments`, `### Forbidden-term scan list`.

## Per-Skill Anchor Map

This skill does not carry hardcoded document paths. When configured grounding is active, use `grounding.index` as the lookup map and `grounding.docs` as vocabulary entry points. Apply the configured entry points and the directly linked codebase surfaces relevant to the current issue; when `grounding: none` is configured, skip this section and follow the base workflow.

## Activation And Fallback

If `issues/config.yaml` is absent at the active checkout root, halt with this sentence: `Issue lifecycle is not initialized: run init-issues first to create issues/config.yaml, issues/.scripts/, and issues/worktrees/.`

Before invoking the codebase-grounding methodology, read `issues/config.yaml` from the active checkout root through `issues/.scripts/lifecycle.ts` / `parseIssuesConfig`. When an issue worktree is active, read that worktree's config; resolve and write issue lifecycle phase only against the control-root (primary checkout) `state.yaml`. The worktree's `state.yaml` is an inert snapshot — never gate phase on it. When `grounding: none` is configured, follow the base skill behavior and emit no grounding-specific footer or anchor capture for that turn.

When configured grounding is active, use `grounding.index` as the first lookup surface when present, then read the configured `grounding.docs` entries and any configured or directly linked live codebase surfaces relevant to the current issue. A present-but-malformed grounding config is a hard setup error from the lifecycle parser, not a silent fallback. Emit the `Grounding:` footer line as an honest list of every file actually consulted that turn, formatted as `Grounding: <path> (read), <path> (confirmed), <path> (diverged)`. When configured grounding is active but no files were consulted that turn, the line reads `Grounding: none`.

Use `(read)` when the file was consulted, `(confirmed)` when a cited contract was checked against that live surface and matched, and `(diverged)` when that check found a mismatch. For partial index reads, use `(read, partial: <omitted span and reason>)`. Record per-contract confirmation or divergence details in `## Doc/Code Tensions`; the footer is the trail, not the full analysis.

Grounding reports codebase surfaces actually consulted: configured `index`/`docs` entry points, plus configured or followed live code/markdown surfaces. Issue work product under `issues/open/`, issue seeds, and phase artifacts remain artifact context, not grounding surfaces; durable lifecycle root artifacts listed in `grounding.surfaces` may appear.

Before emitting a footer from a configured index, classify index coverage as `complete`, `partial: <omitted area and reason>`, or `not consulted`; line counts may be used as a diagnostic only and never as the status.


## Anchor Capture Format

Explanations this skill produces pull canonical definitions for the codebase's domain terms from configured grounding docs verbatim, rather than paraphrasing. (For example, in a Tamdoma-style codebase these include skill, subroutine, handoff, checkpoint, phase, blueprint, workspace, deterministic verification, verification phase, lifecycle prefix, dual-consult, worktree sync, and duplicate-state guard.)

Flow explanations are grounded in live repo evidence under the configured grounding surfaces; the variant does not invent flow shapes that do not appear in the live surface or in configured grounding docs.

When `grounding: none` is configured the variant defers to base `explain-issue` and does not impose this canonical-definition rule.

## Core Intent

Treat the following request as the default teaching brief even when the user phrases it differently:

`What is this issue all about? Give me a mental model and explain it to me as if I were a complete noob and a moron. Reason from first principles when creating the mental model.`

Honor the spirit, not the insult.

- Assume zero background.
- Explain patiently.
- Do not mock the user.
- Do not mirror the self-insult back at them.

## Canonical Input

Accept any of:

- an issue root
- a `planning/` folder
- an `implementation/` folder
- a `plan.md` path
- a legacy `agreement.md` path
- a review addendum section
- an explicit question about an issue already on disk

Prefer:

- `planning/plan.md` when the user asks what the issue is about
- `implementation/plan.md` when the user asks how execution is supposed to work

If the user points at the issue root without saying otherwise, default to `planning/`.

If the user asks about implementation, review, or merge implications, also read the sibling `planning/plan.md` first so the explanation preserves the original why.

Read consultant files such as `a.md` or `b.md` only when the user asks to explain a disagreement, synthesis result, or competing approaches.

## First-Principles Mental Model

Before writing the explanation, answer these questions internally:

1. What real-world problem is this issue trying to solve?
2. What is the smallest thing moving through the system?
   - task
   - state
   - file
   - request
   - user action
3. Who touches that thing, and why does each actor exist?
4. What is wrong with the old shape?
5. What exactly changes in ownership, flow, structure, or validation?
6. What must still remain true after the change?
7. What new risk appears if the issue is implemented badly?

Then choose one simple analogy that preserves cause and effect.

Good analogies preserve:

- who decides
- who checks
- who does the work
- what gets handed off
- what can fail

Do not stack multiple mixed metaphors unless the issue truly needs them.

## Investigation Workflow

1. Resolve the target issue or phase path.
2. Identify the current issue stage from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts` when present; use the prefix only as the legacy mirror/shape cue, and treat any worktree `state.yaml` copy as an inert snapshot, never the authority:
   - `P-*` = planning
   - `I-*` = implementation planning or execution readiness
   - `C-*` = review and fixes
   - `D-*` = merge readiness
   At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.
3. Read the canonical brief first.
4. If explaining implementation, review, or merge implications, read the sibling planning brief too.
5. Consult `grounding.index` for relevant files and documentation when configured.
   - Find entries relevant to the issue by matching file paths, skill names, or topic keywords from the brief.
   - If the index provides sufficient references to ground the explanation, use those directly without a full-codebase search.
   - If the index provides partial matches, use them to narrow the scope of the next step.
   - If the index provides no relevant matches or is missing, continue with the full inspection step unchanged.
6. Inspect the concrete files, runtime surfaces, or docs named by the issue until the explanation is grounded in actual repo evidence.
7. If the user asks about disagreement, read both consultant files and reduce the disagreement to one plain-English fork.
8. Distill everything into a noob-safe explanation.

The index is a guide, not the only evidence source. If the issue names a concrete file the index misses, still inspect that file.

## Explanation Rules

- Start with purpose before filenames.
- Explain the problem before the solution.
- Define jargon the first time it appears.
- Define the real-world domain primitives the issue depends on from zero before using them; keep this distinct from codebase jargon definitions.
- Prefer short sentences and concrete nouns.
- Separate:
  - what exists now
  - what is broken now
  - what the issue wants to change
  - why that change should help
- If the issue is in a named lifecycle stage, explain what that stage means in plain English.
- Keep the explanation grounded in actual files and behavior, not vague abstraction.
- If something is inferred rather than directly stated, say so.
- Do not turn this into a code review unless the user explicitly asks for judgment or findings.

## Default Output Shape

When the user does not request a different format, use this exact order:

1. `What this issue is about`
2. `How the system actually works`
3. `What the problem is`
4. `What this issue does about it`
5. `What it does NOT do`
6. `The one-sentence version`

Within that structure:

- Put the main mental model inside `What this issue is about`.
- Put the compact runtime ASCII graph directly under `How the system actually works`.
- Put a second ASCII graph or `Before`/`After` mini-sketch directly under `What this issue does about it` when the issue changes flow, ownership, document structure, or another shape that benefits from visualization.
- Use first-principles reasoning to explain why the current design exists before explaining why the docs are confusing.
- Keep the explanation readable to a complete beginner without losing the real mechanics.
- Include at least one concrete end-to-end worked example that follows the smallest moving thing through the system and names the exact step where it fails, placed inside "What the problem is" or "What this issue does about it".

If the issue includes a real consultant disagreement, add one extra section after `What the problem is`:

`Where the disagreement is`

Keep that section plain-English and decision-oriented.

## ASCII Mental Model Standard

When the issue is about runtime flow, documentation flow, ownership, or a process change, include a compact ASCII sketch.

Rules:

- Keep diagrams terminal-friendly and small.
- Show only the parts that matter to the explanation.
- Label boxes and arrows in simple language.
- Prefer clarity over completeness.
- Do not rely on unexplained issue jargon inside the diagram.
- Put the runtime diagram under `How the system actually works`, not under another section.
- Put the change diagram under `What this issue does about it` when applicable.
- When a before or runtime diagram is included, mark the exact failure point inline.
- Use `Before` and `After` mini-sketches only when they clarify the proposed change better than prose alone.
- Do not force a second diagram if the fix is simple enough in prose.

## Quality Bar

Before finishing, make sure a first-time reader could answer all of these:

- What problem is this issue solving?
- How does the current runtime actually work end to end?
- Why does that problem exist?
- What is the current mental model?
- What is the new mental model?
- Which files or surfaces matter most?
- What stage is the issue in right now?
- What is the main tradeoff or risk?
- What real-world domain concepts does the reader need before the codebase terms make sense?
- Which concrete example shows the smallest moving thing failing end to end?
- Where does the diagram mark the exact failure point?

If the repo evidence is incomplete, say what you could verify and what remains uncertain.

## Preferred Tone Pattern

Aim for the same teaching pattern as this model:

- `What this issue is about`: "The machine works; the docs are the confusing part."
- `How the system actually works`: show the real runtime as a short, concrete flow, then place the diagram there.
- `What the problem is`: explain why a newcomer would get lost.
- `What this issue does about it`: list the exact repairs in plain English and place a second diagram there if it helps show the new shape.
- `What it does NOT do`: stop the reader from imagining behavior changes or scope creep.
- `The one-sentence version`: end with the shortest true summary.

If a shorter analogy helps, use one. If the ASCII flow already does the job, do not force extra metaphors.
