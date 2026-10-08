# Map brief for slot B (codex, pane w8:pGY)

You are slot B, an independent charting peer. Slot A (claude, pane w8:pCT) maps the same territory blind. Do not read any file written by A under the scratchpad. Write your map, as plain markdown, to exactly this path and nothing else:

Return path: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d37e972e-0280-4777-9a14-780b925a82b1/scratchpad/chart/map-B.md

Repo: /home/ivan/Work/infra/akrogon (registered key `akrogon`). Read-only task: inspect, do not edit any repo file, do not run `akrogon next` or `akrogon phase`.

## Intake (operator note, verbatim)

> We need to update the system itself. I need to be able to run specific models in slot A and slot B, sometimes even on a per issue or per epic basis. For example, one of the problems that I've encountered is that there is a specific issue that we are fixing right now in the framework which has to do with writing. nd only specific models by Claude are good for writing. So I want to have the freedom to choose the models on a per epic or a per issue basis. So that has to be elegant and the solution has to work from a systemic perspective. Think about how to include that in the issue folder itself, but only as a setting that doesn't necessarily create new files, so maybe we can do it in the epic or issue config itself, where we can touch the specific part of the file to point the acrogon machinery towards. Look at this from all angles. Use slot B (already active, codex) as a consultant.

## Live surface to inspect

- /home/ivan/Work/infra/akrogon/src/config.ts (globalSchema slots, repoSchema slots override, `seats()`, `effectiveConfig()`)
- /home/ivan/Work/infra/akrogon/src/next.ts lines 252-260 (`launch()`), lines 405-437 (tab and pane allocation per leaf), line 527 (launch only when `pane.agent === null`)
- /home/ivan/Work/infra/akrogon/src/state.ts (`stateSchema`, door-authored fields `debate`, `hand_built`, `blocked-by`, `sources`)
- /home/ivan/Work/infra/akrogon/src/routing.ts (which slot runs which phase)
- /home/ivan/Work/infra/akrogon/src/status.ts (what `akrogon status` prints per leaf)
- /home/ivan/Work/infra/akrogon/config.yaml (global slots and harness templates; note the claude template hardcodes `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` with `_FORCE=1`)
- /home/ivan/Work/infra/akrogon/issues/config.yaml (repo config, `implement: subagents`)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md (handoff tree: EPIC.md, ISSUE.md are markdown indexes that "hold no lifecycle state"; state.yaml door-authored fields)
- /home/ivan/Work/infra/akrogon/skills/implement-issue/SKILL.md line 53 (subagents vs inline from config)
- /home/ivan/Work/infra/akrogon/docs/guide/cheat.md lines 24-33 and docs/guide/state.md (documented repo slot override and state fields)
- /home/ivan/Work/infra/akrogon/tests/config.test.ts, tests/next.test.ts, tests/init.test.ts (existing seat tests)

## Existing locks

- Global `config.yaml` `slots.{a,b}` = `{harness, model, effort}`; repo `issues/config.yaml` may override a whole seat; `seats()` is the single resolver and `launch()` the single consumer, run once per seat pane at agent start.
- A leaf branch carries code only; `akrogon phase` rejects diffs under `issues/`, so any setting under `issues/open/...` is written by the chart door at handoff or by the operator on main, never by a leaf.
- Operator constraint: the per-epic or per-issue setting lives in the issue folder as a setting in an existing file, not a new file.

## Your task

Produce a territory map: the material forks that change the outcome, the questions a practitioner would ask, and the pitfalls over the work's lifetime (what each option could break or invite later, not only now). Ground each claim in an inspected path and line. For each fork give: your pick with reason and cost; each rejected option with reason; evidence with tier (operator / practitioner / better-than-training / model-knowledge), source and date; pitfalls with what removes each; and any question you would ask that the intake does not.

Angles to cover at minimum:
1. Where the setting lives (leaf `state.yaml` field; front matter or a block in `EPIC.md`/`ISSUE.md`; keyed map in repo `issues/config.yaml`; something else) and the precedence chain, including how a per-epic choice reaches every leaf.
2. Shape of the setting (whole-seat replacement vs partial merge of `harness/model/effort`; both seats or one).
3. When it takes effect (agent start per pane) and what a mid-leaf edit does; whether a per-phase switch is worth it.
4. The writing use-case end to end: with `implement: subagents` and the claude harness template forcing subagent model `sonnet`, does choosing a writing model for seat A actually change who writes the prose? What is the smallest change that makes the use-case real?
5. Visibility: how the operator sees the effective seat per leaf (`akrogon config` in a leaf worktree, `akrogon status`).
6. Chart door: how `/chart-issues` captures the choice at handoff (shapes.md, state.yaml template) without a new question for every small issue.
7. Validation: unknown harness, missing fields, schema strictness, `readState()` legacy-key filtering.

Keep it compact. Finish by writing the file; do not print the map to the pane instead of the file.
