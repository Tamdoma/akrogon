# Plan: serial-plan-solo

## User intent

In delegated mode (`implement: subagents`), a final `plan.md` whose waves all hold exactly one unit gains nothing from worker hand-offs (about 1 min median each, up to 14 min, per the brief). A implements such a leaf itself in wave order as inline mode does, with no sub-briefs and no worker worktrees. Any wave with two or more units keeps delegation. Repair passes are unchanged.

Slot A synthesized this plan on 2026-10-13 from `brief.md`, `design.md`, `state.yaml` (`debate: "no"`) and the live checkout. No positions or rebuttals exist. The design's locked decisions are carried verbatim into D1–D3.

## Decisions

### D1. Serial-solo runs the implement pass inline; repairs stay delegated

Locked design (chained-units fork, operator 2026-10-12, `1a`): "When every wave in the final plan holds exactly one unit, A builds the whole leaf itself with no workers, whatever the reason for the serial order (prerequisite, shared path or shared test resource). Any wave with two or more units keeps workers." Repair passes are unchanged (brief).

Consequences for the skill text: "delegated" in an implement-time rule means a run that actually delegates. A serial-solo run takes the inline path for every implement-time rule (no workers, no sub-briefs, no worktrees, A repairs failures itself, no worker overlap during a slow run). In `check.fix`, a delegated-config leaf still uses worker waves for repairs per the existing check.fix text; that text is not touched.

### D2. State the rule once in implement-issue, cross-reference elsewhere

`skills/implement-issue/SKILL.md` carries the full serial-solo statement. `skills/implement-issue/worker-protocol.md` gains one boundary sentence (the protocol governs delegating runs only). `skills/AREA.md` and `docs/guide/phases.md` each carry a consistent short version of the rule. `skills/plan-issue/SKILL.md` gains exactly one cross-reference sentence at the end of the plan.synthesis wave-rules paragraph, preserving the per-unit record of why serial order exists; its wave rules change in no other way.

No other file changes. `skills/implement-issue/brief-template.md` keeps its "a delegated leaf writes brief-1.md…" text: it describes delegated runs, not a mandate, and the design's owned-file list excludes it. `src/config.ts` `implement` modes and `plan-issue` wave rules are excluded by the design.

### D3. This leaf's own plan is serial-solo

All edits are prose consistency edits in five owned files; splitting them across workers would create review churn for no parallelism gain, and a multi-wave plan could accidentally keep workers under the rule being added. One wave, one unit. Under D1's rule this plan therefore implements with no workers — the first exercising of the path is incidental to the leaf.

### D4. Text proof, no new test

Standing design: "a skill-text leaf; proof is the existing checks (`format`, `test`, `typecheck`) plus review of the stated text… No new test unless an existing skill-text test already pins the delegation sentence, in which case that test changes with a `Test-Change` trailer."

Inspected `tests/`: `red-docs.test.ts` asserts only literal flag/command/record tokens (`--compare`, `known-red`, `base-run`), never delegation or wave wording; `docs-links.test.ts` asserts link integrity. No test pins a delegation sentence, so no test is added and none is changed.

## Read-first list

- `issues/open/leaf-speed/serial-plan-solo/{brief.md,design.md}` — binding contract.
- `skills/implement-issue/SKILL.md` — the `implement` section (wave-mode paragraph ~L55, inline paragraph ~L57), the proof-order overlap item (~L44), and the front-matter `description` are the edit sites.
- `skills/implement-issue/worker-protocol.md` — "Launch and return" opening paragraph, including the plan-without-wave-grouping regroup sentence.
- `skills/AREA.md` — "Non-obvious patterns" implementation-mode bullet (~L23).
- `docs/guide/phases.md` — implement-issue section (~L90).
- `skills/plan-issue/SKILL.md` — plan.synthesis wave-rules paragraph (~L59), target of the one cross-reference.
- `tests/red-docs.test.ts` — confirms literal-token assertions only; new sentences must not introduce literal `failed --reason` or flag patterns that collide.

## Interfaces

None. This leaf changes prose in agent-facing skill files and the operator guide; no code interface, schema or command changes.

## Execution checklist

### Wave 1

- [ ] U1. Apply the serial-solo rule text across the five owned surfaces.
  - Owns: `skills/implement-issue/SKILL.md` (implement-section wave paragraph gains the rule: with `implement: subagents` and every wave holding exactly one unit, A implements the plan itself in wave order as `inline` does — no sub-briefs, no worker worktrees, whatever the serial reason; any wave with two or more units delegates; front-matter description mentions the solo path; overlap item reads "delegated run only" so serial-solo waits like inline; inline paragraph covers a serial-solo run under subagents config having no workers or mismatch returns), `skills/implement-issue/worker-protocol.md` (opening boundary sentence: the protocol governs delegating runs; when every wave holds one unit there are no workers, sub-briefs or worktrees and A implements itself, and a regrouped plan producing all single-unit waves is also A-implemented), `skills/AREA.md` (mode bullet: delegated mode runs each wave whole up to 3 independent units, while a plan whose waves all hold one unit is implemented by A inline; repair passes still delegate), `docs/guide/phases.md` (same short rule in the implement-issue paragraph), `skills/plan-issue/SKILL.md` (one appended cross-reference sentence: units serial by prerequisite, shared path or shared test resource land one per wave, and in delegated mode such a plan is implemented by A itself under implement-issue's rule).
  - Shared test resources: none.
  - Must land first: none.
  - Docs affected: `skills/AREA.md`, `docs/guide/phases.md` (both in the checklist; no other agent or human doc is affected — README and `docs/guide/*.md` beyond phases.md never state the delegation mandate, verified by grep).

## Verification

| Criterion | Proof command | Catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. Four files state the rule consistently; none still requires delegating an all-single-unit plan | `grep -rn "single-unit\|every wave\|one unit" skills/implement-issue/SKILL.md skills/implement-issue/worker-protocol.md skills/AREA.md docs/guide/phases.md` returns the rule in each file; seat review of the same files plus `grep -rn "delegate\|worker" skills/AREA.md docs/guide/phases.md` confirms every remaining delegation statement is conditional on a multi-unit wave or a repair pass | Edits missed a file; a leftover sentence still orders sub-briefs for a serial plan | seconds | Any commit touching the four files |
| 1 (cont). Repo has no unconditional delegation text outside the four files | `grep -rn "delegate them to subagents\|write one sub-brief per unit" skills/ docs/` — hits only inside already-corrected context | A fifth file requiring delegation goes stale | seconds | Same as above |
| 2. plan-issue wave rules unchanged except one cross-reference | `git --no-pager diff "$AKROGON_BASE"..HEAD -- skills/plan-issue/SKILL.md` shows a single appended sentence in the wave-rules paragraph and no other hunk | Wave-grouping logic silently reworded | seconds | Any commit touching plan-issue |
| Both | `akrogon run-check --name 'format' -- sh -c '…'` (the configured format command) and `… 'test' …` and `… 'typecheck' …` — the three `checks` commands from `akrogon config` | Prettier drift in edited markdown; a literal-token assertion broken by new prose (e.g. `red-docs.test.ts`); type drift (none expected) | minutes | Any commit on the leaf branch |

A slow run is not involved; no restart boundaries are needed.

## Notes for review

- The brief says implement "as inline mode does"; the design resolves this as the implement pass only, with repair passes unchanged. The check.fix text therefore stays delegated and was left untouched on purpose.
- `merge-issue`'s "solo leaf" wording is a different concept (rebase mode); the leaf uses the term `serial-solo` throughout to avoid collision.
- `issues/config.yaml` `implement` values and `plan-issue` wave grouping rules are excluded surfaces per the design; untouched.

## Implementation notes

2026-10-13: term choice refines D2 — `serial-solo` is the coined term across all five files (defined once in `skills/implement-issue/SKILL.md`), not bare `solo`, to stay distinct from merge-issue's `solo` rebase mode. This pass runs on the rule it adds: one wave, one unit, `implement: subagents`, so A implements directly with no sub-briefs or worker worktrees.
