# Plan: skills-never-ask

Prose-only leaf. Remove every instruction that invites a lifecycle seat to ask the operator or wait, and give the four phase skills the seat-declared stop: record the blocker in the current pass artifact and end the pass with `akrogon phase <slug> failed`.

## Decisions

- D1: Each lifecycle skill states the rule in its own words: the seat never asks the operator anything and never waits. No lifecycle skill file may contain the literal substrings `ask the operator`, `wait for the operator`, or `and wait` in any instruction, including negated ones; done-criterion 1 is a grep, so phrasing like "never ask the operator" is still a hit. Use wording such as "the seat never asks" or "no operator questions".
- D2: The stop instruction in the four phase skills: when a step physically requires the operator (a permission the seat cannot grant, an env value it cannot obtain), the seat writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason "<one line naming the blocker and the artifact>" --slot <its seat from the dispatch prompt>`, and ends the pass. Pass artifacts: `plan.md` for plan-issue, `implementation/report.md` for implement-issue, `review-<slot>.md` for check-issue and merge-issue.
- D3: `skills/plan-issue/SKILL.md`: state the rule once in shared context. Line 29's brief/design conflict rule keeps "the design wins" but drops "never ask the operator" phrasing. Line 55's `## Operator actions` flow is replaced: a credential absent from `.env` and unobtainable is a human-only blocker, recorded in `plan.md` with the exact action (`add <VAR> to .env`, what it is, where to obtain it), then the seat stops with `failed --slot B` instead of finishing the pass.
- D4: `skills/implement-issue/SKILL.md`: state the rule in shared context. Line 39 is rewritten: a credential still absent from `.env` is a blocker recorded in `report.md` with the `add <VAR> to .env` action, then `failed --slot B`; the "wait" and "proceed without it" paths are removed. The Standalone section gains the no-questions rule in its own words with no stop command, keeping its existing terminal-error and footer behavior.
- D5: `skills/check-issue/SKILL.md`: state the rule plus the stop instruction; a human-only blocker is recorded in `review-<slot>.md` and ends the pass with `failed --slot <A|B>`.
- D6: `skills/merge-issue/SKILL.md`: state the rule plus the stop instruction; a human-only blocker is recorded in `review-A.md` and ends the pass with `failed --slot A`. Existing error paths are unchanged: rebase conflicts are resolved, red checks go to `check.fix`, non-fast-forward pushes retry; the stop covers only blockers only the operator can clear. Footer printing and the final `herdr tab close` remain.
- D7: `skills/broadcast-issue/SKILL.md`: state the no-questions rule in its own words with no stop command; the existing loud-error behavior for a missing env file or target is unchanged.
- D8: `skills/AREA.md`: name the rule once under Non-obvious patterns.
- D9: Out of scope per design: `skills/chart-issues/` (attended, asks by design), `skills/init-issues/SKILL.md` and `skills/seed-issue/SKILL.md` (not in the owned list; their remaining grep hits are not lifecycle-skill instructions), the pi harness template (operator config), and all of `src/` (owned by failed-with-cause, already live).

## Read first

- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `skills/AREA.md` — the owned files.
- `src/routing.ts`, `src/phase.ts` — the `failed` interface the prose points at.
- `design.md`, `brief.md` in the leaf folder.

## Interfaces

- `akrogon phase <slug> failed --reason <text> --slot <A|B>`: legal from every active phase (`src/routing.ts:27-33`), `--reason` required (`src/phase.ts:116`), cause `blocked` recorded and `requireClean` skipped on the return move (`src/phase.ts:129-138`), `failed -> <interrupted phase>` legal (`src/routing.ts:35-41`). Verified live; no code change here.

## Checklist

1. `skills/plan-issue/SKILL.md` — rule in shared context; reword the line-29 conflict rule; replace the line-55 operator-actions flow with the blocker-plus-stop flow. Criteria: done-criteria 1, 2.
2. `skills/implement-issue/SKILL.md` — rule in shared context; rewrite line 39 to blocker-plus-stop; add the no-questions rule to Standalone without a stop command. Criteria: done-criteria 1, 2.
3. `skills/check-issue/SKILL.md` — rule and stop instruction naming the artifact and `failed --slot`. Criteria: done-criteria 1, 2.
4. `skills/merge-issue/SKILL.md` — rule and stop instruction; preserve existing conflict/check/push error paths. Criteria: done-criteria 1, 2.
5. `skills/broadcast-issue/SKILL.md` — no-questions rule, no stop command. Criteria: done-criteria 1, 2.
6. `skills/AREA.md` — one line naming the rule under Non-obvious patterns. Criterion: brief done-criteria.
7. Verify: run the greps and `bun test` below. Criterion: done-criteria 1-3.

## Acceptance criteria

1. `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` returns no instruction to ask or wait in any lifecycle skill; remaining hits are confined to non-lifecycle files (chart-issues assets) or non-instructions.
2. Each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` contains the stop instruction naming `akrogon phase <slug> failed --reason ... --slot`; `skills/broadcast-issue/SKILL.md` and the standalone implement path state the no-questions rule without a stop command.
3. `bun test` passes.

## Verification

- `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` — inspect every hit; each must be outside the five lifecycle skills or not an instruction to ask/wait.
- `grep -ln "akrogon phase <slug> failed --reason" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` — all four listed; each also names `--slot`.
- `grep -n "failed" skills/broadcast-issue/SKILL.md` — no stop command added.
- `bun test` — full suite green.

## Open limitation

Prose cannot physically prevent a seat from asking; enforcement is the pi harness `--exclude-tools request_user_input` flag, an operator config step outside this leaf. chart-issues and init-issues still ask by design.

## Dependencies

- failed-with-cause: provides the `failed` command and `blocked` cause; verified live in this checkout, no ordering needed.
