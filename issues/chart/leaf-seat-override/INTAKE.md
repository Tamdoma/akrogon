# Intake: leaf-seat-override

## Scope

Destination: akrogon. Let the operator choose the harness, model and effort for seat A and seat B per epic, per issue or per leaf, as a setting inside existing issue-folder files, resolved by the same machinery that launches seats today, and make a chosen writing model actually author the delegated prose. Proposed grouping: one issue, leaves split by surface (command resolver and launch; chart door shapes and handoff; docs) once the forks settle.

## Provenance

- Operator: 2026-10-07 `/chart-issues` invocation in pane w8:pCT

## Source: operator 2026-10-07

We need to update the system itself. I need to be able to run specific models in slot A and slot B, sometimes even on a per issue or per epic basis. For example, one of the problems that I've encountered is that there is a specific issue that we are fixing right now in the framework which has to do with writing. nd only specific models by Claude are good for writing. So I want to have the freedom to choose the models on a per epic or a per issue basis. So that has to be elegant and the solution has to work from a systemic perspective. Think about how to include that in the issue folder itself, but only as a setting that doesn't necessarily create new files, so maybe we can do it in the epic or issue config itself, where we can touch the specific part of the file to point the acrogon machinery towards. Look at this from all angles. Use slot B (already active, codex) as a consultant.

## Agent findings

- Seats resolve in one place, `seats()` at `src/config.ts:60-71`: global `config.yaml` `slots.{a,b}` with a whole-seat repo override in `issues/config.yaml` (`src/config.ts:49`). One consumer, `launch()` at `src/next.ts:252-260`, runs only when a seat pane has no agent (`src/next.ts:527`). Each leaf gets its own tab and two panes (`src/next.ts:405-437`), so the seat is already allocated per leaf.
- `EPIC.md` and `ISSUE.md` are markdown indexes that hold no lifecycle state (`skills/chart-issues/assets/shapes.md:122`). Leaf `state.yaml` is strict (`src/state.ts:60-87`) with door-authored fields `debate`, `blocked-by`, `sources`, `hand_built`.
- The global claude harness template forces every subagent to `sonnet` (`config.yaml:12`, `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`). Claude Code docs (sub-agents page, read 2026-10-07) state that with FORCE on the `model` field in subagent definitions is ignored and Claude cannot pass a model when it starts a subagent. With repo `implement: subagents` (`issues/config.yaml`, `skills/implement-issue/SKILL.md:53`), implementation units are written by workers, so a writing model chosen for seat A would not author the prose unless the template or the implement mode changes.
- Batch merge runs on one holder's seat B (`src/next.ts:649-653`, `src/batch.ts:42-47`), so a per-leaf B choice governs that leaf's review and any merge pass it holds, not a merge carried by another holder.
- A leaf branch carries code only and `akrogon phase` rejects `issues/` diffs, so any setting under `issues/open/` is written by the door at handoff or by the operator on main.
