# Map A: per-leaf seat override

Surface: `src/config.ts:11-71` (slot schema, repo override, `seats()`), `src/next.ts:252-260` (`launch()`), `src/next.ts:527` (launch only when `pane.agent === null`), `src/next.ts:405-437` (one tab and two panes per leaf), `src/state.ts:60-87` (strict state schema), `config.yaml:12` (claude template forces subagent model sonnet), `issues/config.yaml` `implement: subagents`, `skills/implement-issue/SKILL.md:53`, `skills/chart-issues/assets/shapes.md:250-260`, `docs/guide/cheat.md:24-33`, `docs/guide/state.md:27-32`.

## Fork 1: where the setting lives and precedence

Pick: leaf `state.yaml` carries the same `slots:` block the repo override uses, door-authored like `debate`; precedence global < repo < leaf. Per epic or per issue means the door writes the same block into every leaf under that owner at handoff; the operator may also edit a leaf's state before dispatch (documented operator-touched fields). Reason: one resolver `seats(global, repo, leaf)` and one consumer `launch()`, the seat is allocated per leaf anyway (tab and panes per leaf), each leaf stays self-contained like binding decisions, no new file, no new format. Cost: changing an epic's seat after handoff edits one line per remaining leaf.

Rejected: front matter or a block in `EPIC.md`/`ISSUE.md` with walk-up inheritance. Five levels (global, repo, epic, issue, leaf), markdown gains config, and `shapes.md:122` locks indexes to hold no state. Rejected: a slug-keyed map in `issues/config.yaml`. Config names issues that come and go, entries go stale, and it is not in the issue folder. Rejected: a new `seats.yaml` in the issue folder, excluded by the operator.

Evidence: better-than-training, inspected lines above, 2026-10-07.

Pitfalls: a leaf naming a harness with no template fails at launch inside dispatch. Removed by validating the leaf's seats where states are parsed (`akrogon status`, which handoff already runs) with the leaf path in the error, and by the door's presence check before handoff.

## Fork 2: shape of the block

Pick: whole-seat replacement per seat, `a` and/or `b`, each `{harness, model, effort}`, identical to the repo override at `config.ts:49`. Reason: a seat is one coherent triple; a `model`-only patch invites `model: claude-opus` under `harness: pi`. Cost: three lines instead of one.

Rejected: partial merge. Saves typing, invites harness/model mismatch, two merge semantics in one system.

## Fork 3: the writing use-case actually reaching the prose

Finding: the claude template forces every subagent to sonnet (`config.yaml:12`, Claude Code docs sub-agents page read 2026-10-07: with FORCE on, "Claude Code ignores the model field in subagent definitions, and Claude can't pass a model when it starts a subagent"). With repo `implement: subagents`, implement-issue delegates units to workers, so seat A's model never writes the prose.

Pick: the leaf block may also carry `implement: inline`, same key and values as the repo config, leaf wins; seat A then writes itself with its own model. Reason: reuses an existing concept, no harness template change, no claude-specific field. Cost: inline implement is slower on a large leaf; writing leaves are small.

Rejected: a slot-level `workers` or `subagent_model` field fed into the template. Claude-only concept in a harness-neutral schema. Rejected: dropping FORCE globally. Changes every other leaf's worker cost and still needs the skill to pass a model.

Required companion: `akrogon config` run inside a leaf worktree prints the leaf-effective `slots` and `implement`, because implement-issue reads `implement` from `akrogon config` (`SKILL.md:27,53`). `effectiveConfig()` already detects a linked worktree (`config.ts:180`); it resolves the leaf whose `state.worktree` equals the toplevel. This also answers visibility.

## Fork 4: when it takes effect

Fact: `launch()` runs only when the seat pane has no agent (`next.ts:527`). The block applies at the next agent start for that seat; an edit while an agent runs does nothing until that agent exits. Same rule as the repo override (`cheat.md:26`). A per-phase switch would need stopping the seat agent between phases and losing its session; not worth it, named as the cost.

## Fork 5: visibility

Pick: `akrogon config` in the worktree (Fork 3 companion). Optional: `akrogon status` marks an overridden seat on the leaf line. Not required for the use-case.

## Fork 6: chart door capture

Pick: `shapes.md` state template gains optional `slots` and `implement`; the handoff review lists each leaf's seats; the door asks one seat question at the door only when the intake or map names a model-sensitive leaf (writing, long context), default none, like `debate`. Per-epic choice is written into every leaf under the owner.

## Fork 7: validation

`stateSchema` is strict, so a misspelled key fails parse at status, good. `readState()` legacy filter untouched. `seats()` keeps its missing-template throw and adds the leaf path. Tests: `tests/config.test.ts` seat merge cases gain a leaf level; `tests/next.test.ts` launch case with a leaf override; `tests/init.test.ts` unchanged.

## Questions the intake does not ask

- Does the operator want the door to ask about seats on every handoff, or only when it sees a model-sensitive leaf? (Fork 6)
- Is `implement: inline` per leaf acceptable as the way the writing model reaches the prose, or must workers also run the chosen model? (Fork 3)
