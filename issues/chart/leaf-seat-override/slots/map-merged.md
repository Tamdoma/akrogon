# Merged map (A merges, attribution by slot)

Merge tag: B's F1 pick sentence "optional YAML front matter in existing `EPIC.md` and `ISSUE.md`, containing a strict `slots` setting" (slots/map-B.md:9) is the only line quoted from B verbatim.

## Fork: where the setting lives and how an epic reaches leaves

- Leaf `state.yaml` `slots:` only, door copies the epic or issue choice into every leaf at handoff; precedence global < repo < leaf (A). Reason: one resolver, one consumer, three levels, leaf self-contained, no markdown parsing. Cost: an epic change after handoff edits one line per remaining leaf; copied values hide which leaf was a deliberate exception (B's objection).
- Front matter in `EPIC.md` and `ISSUE.md` plus optional leaf `slots`, live walk-up global < repo < epic < issue < leaf, read from the registered checkout at each resolution (B). Reason: one owner per inherited choice, an epic edit reaches every descendant's next start, new leaves inherit. Cost: a front-matter parser and bounded ancestor lookup shared by launch, config and status; `shapes.md:122` index contract must be amended to permit settings; five levels to reason about (A's objection).
- Slug-keyed map in `issues/config.yaml` (rejected A,B): outside the folder, stale entries, needs move/close cleanup.
- New container YAML file (rejected A,B): excluded by the operator.

Evidence: better-than-training, `src/config.ts:60-71,110-120`, `src/next.ts:252-260,405-437,527`, `src/state.ts:114-129`, `src/phase.ts:185-195` (completion moves the whole owner folder, so container settings travel with it) (A,B), 2026-10-07.

Pitfalls: a container `state.yaml` beside an index would be read as a leaf by `leavesUnder()` (B), avoided by never placing state in containers. Unknown or malformed front matter must fail with its file path, never become "no override" (B). Read main's authoritative files, never a worktree's inert `issues/` copy (A,B).

Where slots differ: A values fewest levels and copies at handoff; B values live inheritance and one owner. B asks: must an epic edit affect leaves already handed off? That is the operator's call.

## Fork: shape of the block

- Whole-seat `{harness, model, effort}` per seat, `a` and/or `b`, omitted seat inherits, same schema at every level (A,B). Reason: a seat is one runnable selection; partial merge invites a claude model under a pi harness. Cost: three values to change one model.
- Partial field merge (rejected A,B). Named profiles (rejected B): another indirection.

Evidence: `src/config.ts:11-16,49,60-68`, `tests/config.test.ts:130-146`, `tests/next.test.ts:3080-3100` (B), 2026-10-07.

Pitfall: `text = z.string().min(1)` accepts whitespace (B, and LESSONS 2026-09-19); the new boundary uses nonblank.

## Fork: the writing model authoring delegated prose

Finding (A,B): the claude template forces subagents to `sonnet` (`config.yaml:12`); with `implement: subagents` workers author the units; Claude Code docs read 2026-10-07 confirm FORCE ignores definition and invocation model choices (A,B).

- Replace the hardcoded `sonnet` in the claude template's subagent env with `{model}`, keep FORCE; `launch()` already replaces every `{model}` occurrence (B). Reason: one line in machine config, no schema, no new axis. Cost: every claude seat's workers run the seat model, so an expensive seat makes expensive workers; must prove `{model}` inside the JSON `--settings` string survives quoting.
- Leaf block may carry `implement: inline`, same key as repo config, leaf wins; A writes itself (A). Reason: reuses an existing concept. Cost: expands execution policy per leaf and needs `akrogon config` in the worktree to print leaf-effective `implement`; slower on a large leaf (B's objection: expands policy when the template can carry it).
- A separate worker-model field on the seat (rejected A,B unless the operator wants cheap coordination with specialist writers).
- Drop FORCE and rely on inheritance (rejected A,B): definitions or invocations can still pick another model.

Pitfall (B): prove the installed Claude version is at or above v2.1.257 and run one disposable delegated unit with the real model, checking the worker's model; a mock launch test proves nothing about worker routing.

Where slots differ: B's template fix is simpler; A's inline override keeps worker cost unchanged for other leaves. A now leans to B's option as the recommendation, with worker cost stated as its price.

## Fork: when it takes effect

Agreed (A,B): applies at the next agent start per pane (`src/next.ts:527`), an edit while a session runs does nothing until that session ends, no per-phase switch, no automatic restart. Lock, not a question. Pitfall (B): display desired next-start seat separately from any claim about the running model.

## Fork: visibility

- One resolver used by launch, `akrogon config` inside a managed leaf worktree (leaf-effective seats with their source), and `akrogon status` per leaf showing desired next-start A/B (A,B). B adds: detached worker worktrees have no leaf record, pass leaf context explicitly.
- Status left unchanged, config only (A, optional).

Evidence: `src/config.ts:168-180`, `tests/config.test.ts:152-174`, `src/status.ts:94-135,294-308`, `src/next.ts:198-203` (B).

## Fork: chart door capture

Agreed (A,B): the door records an explicitly requested seat choice at its chosen scope, shows the effective seats per leaf once in the handoff review, writes nothing when no choice is made, and asks only when the intake or map names a model-sensitive leaf. `shapes.md:250-260` state template gains the optional fields. Batch merge (B): one holder's B runs the shared merge pass, so a per-leaf B choice does not govern a merge carried by another holder; batching is preserved and this is stated in the design.

## Fork: validation

Agreed (A,B): strict optional `slots` at every level, only `a`/`b`, complete nonblank seats, harness template presence checked where states are parsed and before tab or worktree allocation (`src/next.ts:655-659`), errors naming file and seat, legacy filter in `readState()` unchanged.

## Open questions from peers

- B Q1: live inheritance or fixed copy at handoff (fork 1).
- B Q4: all claude workers on the seat model, or an independent writer choice (fork 3).
- B Q5/A: status board shows desired seats, or config only (visibility).
- B Q7: apply nonblank to existing seat boundaries too, or only the new ones.
