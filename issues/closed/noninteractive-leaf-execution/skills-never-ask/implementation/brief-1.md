# Brief 1: skills-never-ask prose rewrite

## 1. Goal

Remove every instruction that invites a lifecycle seat to ask the operator or wait, and give the four phase skills the seat-declared stop. Implements plan.md decisions D1-D9. Prose only; no code changes.

## 2. Numbered acceptance criteria

1. `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` returns no instruction to ask or wait in any lifecycle skill. Hits confined to `skills/chart-issues/` assets or non-instructions are acceptable.
2. Each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` contains the stop instruction naming `akrogon phase <slug> failed --reason ... --slot`.
3. `skills/broadcast-issue/SKILL.md` and the Standalone section of `skills/implement-issue/SKILL.md` state the no-questions rule without a stop command.
4. `skills/AREA.md` names the rule once under Non-obvious patterns.
5. `bun test` passes (B runs the full suite; worker runs the changed-tests command and the greps).

## 3. Read-first list

- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `skills/AREA.md` — the owned files, all in the worktree.
- `skills/implement-issue/ponytail.md` — read before editing.
- `src/routing.ts` lines 27-41 and `src/phase.ts` lines 116-138 — the live `failed` interface the prose points at (read-only, do not edit).
- `/home/ivan/Work/infra/akrogon/issues/open/noninteractive-leaf-execution/skills-never-ask/plan.md` — the contract.

## 4. Change list and needed interfaces

The rule, stated in each skill's own words (do not copy one identical sentence across files): the seat never asks the operator anything and never waits. The stop instruction for the four phase skills: when a step physically requires the operator (a permission the seat cannot grant, an env value it cannot obtain), the seat writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason "<one line naming the blocker and the artifact>" --slot <its seat from the dispatch prompt>`, and ends the pass.

Per file:

- `skills/plan-issue/SKILL.md`: state the rule once in shared context. Reword the line "When the brief and the locked design disagree, never ask the operator: ..." so the design-wins rule remains but the literal `ask the operator` substring is gone. Replace the `## Operator actions` credential flow (currently: absent credentials go into the plan under `## Operator actions` and the footer repeats the list) with: each credential absent from `.env` and unobtainable is a human-only blocker recorded in `plan.md` with the `add <VAR> to .env` action (what it is, where the operator obtains it), then the seat stops with `failed --slot B` and ends the pass instead of finishing with `implement`.
- `skills/implement-issue/SKILL.md`: state the rule in shared context. Rewrite the credential line (currently "tell the operator to add the named variable to `.env` and wait, and only when the operator says to proceed without it record the affected criterion as unverified") to the blocker-plus-stop flow recording into `implementation/report.md` with `failed --slot B`; remove the wait and proceed-without-it paths. Add the no-questions rule to the Standalone section in its own words, no stop command.
- `skills/check-issue/SKILL.md`: state the rule plus the stop instruction; a human-only blocker is recorded in `review-<slot>.md` and ends the pass with `failed --slot <A|B>`.
- `skills/merge-issue/SKILL.md`: state the rule plus the stop instruction; a human-only blocker is recorded in `review-A.md` and ends the pass with `failed --slot A`. Keep all existing error paths (rebase conflict resolution, red checks to `check.fix`, non-fast-forward retry, other push errors reported); the stop covers only blockers only the operator can clear. Footer printing and the final `herdr tab close` remain.
- `skills/broadcast-issue/SKILL.md`: state the no-questions rule in its own words, no stop command; existing loud-error behavior for missing env file or target is unchanged.
- `skills/AREA.md`: one line naming the rule under Non-obvious patterns.

Interface (already live, prose points at it only): `akrogon phase <slug> failed --reason <text> --slot <A|B>`.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/chart-issues/`, `skills/init-issues/SKILL.md`, `skills/seed-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/brief-template.md`, `skills/implement-issue/ponytail.md`, or anything under `src/`, `tests/`, `docs/`, `plugin/` — the design's owned list is the six files above; chart-issues asks by design and `src/` belongs to failed-with-cause. Exception: a revised brief from B authorizing the change.
- Do not leave the literal substrings `ask the operator`, `wait for the operator`, or `and wait` (case-insensitive) anywhere in the six owned files, including in negated phrasing like "never ask the operator" — done-criterion 1 is a mechanical grep and a negation still matches. Exception: none; reword instead.
- Do not add a stop command to broadcast-issue or the standalone implement path — they run after completion or outside a leaf, so no phase move exists. Exception: none.
- Do not change the design-wins rule, the loud-error broadcast behavior, merge's existing error paths, or any command/number/fixed reference — scope is the ask/wait prose only. Exception: a revised brief from B.
- Do not write any file under `issues/` in the worktree — artifacts live in the registered checkout only. Exception: none.

Restated: owned files only; no forbidden substrings even negated; no stop where no phase exists; no scope creep; no issue files in the worktree. A conflict with these returns a mismatch with evidence, not a silent deviation.

## 6. Ordered steps

1. Edit `skills/plan-issue/SKILL.md` (criteria 1, 2).
2. Edit `skills/implement-issue/SKILL.md` (criteria 1, 2, 3).
3. Edit `skills/check-issue/SKILL.md` (criteria 1, 2).
4. Edit `skills/merge-issue/SKILL.md` (criteria 1, 2).
5. Edit `skills/broadcast-issue/SKILL.md` (criteria 1, 3).
6. Edit `skills/AREA.md` (criterion 4).
7. Run the verification greps from section 8 and the changed-tests command from section 7; paste results.

Advisory size: 6 files, under 30 turns.

## 7. Commands

```bash
: "${AKROGON_BASE:=f91cea968ac46f5a30119e4ce03eac611cc66abd}" && bun test --changed="$AKROGON_BASE"
```

Run from the worktree root. Prose-only changes may exercise no tests; paste whatever it prints.

## 8. Done-when, evidence and report

Done when all six files are edited, the greps below are clean per criteria 1-3, and the changed-tests command output is pasted.

Verification greps (run from worktree root, paste output):

```bash
grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/
grep -ln "akrogon phase <slug> failed --reason" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md
grep -c "failed" skills/broadcast-issue/SKILL.md || true
```

The first must show no ask/wait instruction in the five lifecycle skills; the second must list all four files; the third is evidence no stop command was added to broadcast-issue.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
