# Brief 2: locked `setup` rule in implement-issue and check-issue

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-setup-u2`

## 1. Goal

Skills tell a seat to run the locked `setup` before a dependency-using proof outside the printed commands. Plan decisions D7.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` Shared context: when `akrogon config` prints `setup`, a dependency-using proof outside the printed commands runs `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup>` first; the detached base-checkout run installs dependencies with this locked `setup` form when `setup` is printed (the existing "installing dependencies there with the leaf's installation method" clause).
2. `skills/check-issue/SKILL.md` Shared context carries the same two rules (direct proofs and base-run clause, in its own check.review paragraph).
3. No change to printed `checks`/`merge_checks`/`advisory` usage — those already run composed from `akrogon config`; merge-issue untouched.
4. Match surrounding prose style: one clause or short sentence each, no new sections, no examples.

## 3. Read-first

- `skills/implement-issue/SKILL.md` (Shared context: the "Effective settings supply …" sentence and the long base-run sentence), `skills/check-issue/SKILL.md` (Shared context; the check.review base-run paragraph beginning "During check.review, a red test or check"), `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`. Wave 1, no prerequisites, no shared test resource.

- implement-issue Shared context: add `setup` to the effective-settings list, then one rule sentence: a dependency-using proof outside the printed commands runs `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup>` first when `setup` is printed.
- implement-issue base-run clause: amend "installing dependencies there with the leaf's installation method" to name the locked `setup` form when printed.
- check-issue: same two edits in its Shared context / base-run paragraph.

## 5. Do-not, reasons and exceptions

- No examples, no new headings, no restructuring: skills are prose contracts and reviews reject wording churn. Exception: none.
- No rule that runs `setup` inside printed commands in the skills — composition lives in `akrogon config` only. Exception: none.
- Don't touch other skills or docs — not owned. Return a mismatch with evidence instead; exception is a revised brief from A.

## 6. Ordered steps

Advisory size: 2 files, under 10 turns.

1. implement-issue SKILL.md: effective-settings sentence + one rule sentence (criteria 1).
2. implement-issue base-run clause amendment (criterion 1).
3. check-issue SKILL.md: same rule in Shared context + base-run clause in the check.review paragraph (criterion 2).
4. Re-read both diffs; confirm no other paragraph needs the rule (e.g. check.fix inherits via Shared context) and no printed-command path got a second `setup`. Commit.

## 7. Commands

```
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```
with `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602`. Run `bun install` in your worktree first. SKILL.md edits should produce no changed-test hits; report what the command actually printed.

## 8. Done-when, evidence and report

Criteria 1–4 verified by re-reading the diff; prose verified by inspection, not asserted by test (akrogon tests must not assert prose wording).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
