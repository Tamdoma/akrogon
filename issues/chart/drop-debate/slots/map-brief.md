# Opening map brief: drop-debate

You are a consultant seat on an akrogon chart. Work independently. Do not read any other `map-*.md` file in this folder. Do not edit any repo file. Write only your return file.

Return path by seat:
- B: /home/ivan/Work/infra/akrogon/issues/chart/drop-debate/slots/map-B.md
- C: /home/ivan/Work/infra/akrogon/issues/chart/drop-debate/slots/map-C.md
- D: /home/ivan/Work/infra/akrogon/issues/chart/drop-debate/slots/map-D.md

## Reading rule

Read process text by named section for the step you answer: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work (here: `skills/plan-issue/SKILL.md`, the debate code paths, and the leaf-file shapes are the subject). Name sections, never line ranges.

## Intake

Read /home/ivan/Work/infra/akrogon/issues/chart/drop-debate/INTAKE.md (operator words verbatim plus the usage count).

## Live surfaces (repo root /home/ivan/Work/infra/akrogon, main at 69390138)

- Debate in the command: `src/state.ts`, `src/routing.ts`, `src/next.ts`, `src/phase.ts`, `src/config.ts`; tests that name `plan.positions`, `plan.rebuttal`, `debate` or `rebuttal` (start with `tests/next.test.ts`).
- Planning skill: `skills/plan-issue/SKILL.md` and its resources.
- Review skill reading debate artifacts: `skills/check-issue/SKILL.md`.
- Door: `skills/chart-issues/SKILL.md` (`## Handoff`, `## Direct route`, `## Autopilot`) and `skills/chart-issues/assets/shapes.md` (`## Chart records`, `## Leaf files`), `skills/chart-issues/assets/standing-design.md`.
- Implementer: `skills/implement-issue/SKILL.md` (what it consumes from `plan.md`).
- Docs: `docs/reference/state-and-phases.md`, `docs/use/*.md`, `docs/start/one-change.md`, `docs/reference/files.md`, `docs/pictures/phases.svg`, `docs/examples/autopilot-story.md`.
- Live records: existing open/closed `state.yaml` files carry `debate:` in every registered repo; `akrogon config` shows `rebuttal: true`.
- Evidence of plan quality: closed leaves' `plan.md`, `brief.md`, `design.md` and check-issue review returns under `issues/closed/**` (akrogon and `/home/ivan/Work/infra/tamdoma/framework/issues/closed/**`). Compare debate-yes leaves (listed in INTAKE) with debate-no leaves: did the review find plan-caused Fixes, and what did the plan get wrong that a better brief/design would have prevented?

## Existing locks

None in this chart yet.

## Task

Write a proportional territory map with these parts:

1. Forks: each material decision the removal and the handoff question need, with the options, what each option could break or invite later (not only now), and your pick with reason and cost.
2. Practitioner questions: what someone who has removed a phase from a running state machine with live records would ask (schema strictness on old `debate:` fields, records mid-phase at `plan.positions`/`plan.rebuttal`, other registered repos' records, installed release vs repo skill copy).
3. Pitfalls over the work's lifetime and what removes each.
4. Handoff format: does brief.md/design.md need strengthening so A writes the best plan by direct synthesis? Answer with evidence from closed leaves (paths), not opinion. If yes, name the smallest change; if no, say why the current shape already suffices.
5. Evidence lines: tier (operator, practitioner, better-than-training, model-knowledge), source path or URL, date read, finding.
6. Any question you would ask that this brief does not.

Keep it compact. Cite path and function or section for every claim about this repo.
