# Plan: round-labels

Direct synthesis (debate off). Source: brief.md and design.md plus live `skills/chart-issues/assets/questions.md` (lines 5-27).

## Decisions

- D1: Edit only `skills/chart-issues/assets/questions.md`. No change to `SKILL.md`, `shapes.md`, other skills, `docs/`, operator `CLAUDE.md`, or recorded charts under `issues/`.
- D2: Template block becomes `### 1 ·` / `### 2 ·` headings, `- **1a (recommended)**` / `- **1b**` options, and reply key ``Reply `1a 2b`, or a numbered free-text answer.`` per design target lines.
- D3: Extend the line-27 paragraph at the restart sentence with: label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round. This overrides the operator global `Q1`/`O1` rule inside rounds.
- D4: No tests added. Wording test would be vanity; verification is grep plus read checks and configured checks.

## Read-first

- `skills/chart-issues/assets/questions.md`
- `skills/AREA.md`
- `docs/reference-index.md`
- `learnings/LESSONS.md` (2026-09-11 lock-vs-criterion: checked, no verbatim block collides with the grep criterion; 2026-09-11 stale-rule-in-docs: `docs/` grep is part of verification)

## Needed interfaces

None. Text-only edit, no code or schema surface.

## Checklist

1. `skills/chart-issues/assets/questions.md` template block (lines 5-25): replace `### Q1 ·` with `### 1 ·`, `### Q2 · ...` with `### 2 · ...`, `- **A (recommended)**` with `- **1a (recommended)**`, `- **B**` with `- **1b**`, reply key `` `1-A 2-B` `` with `` `1a 2b` ``. Criterion: brief done-1.
2. Same file line-27 paragraph: add the D3 sentence at the restart sentence. Criterion: brief done-2.
3. Confirm `grep -rnE "\bQ[0-9]\b|\b[0-9]-[A-B]\b" skills/ docs/` returns no hit. Pre-check: only hits are the three lines this edit removes. Criterion: brief done-3.
4. Confirm `git status --porcelain` shows only `skills/chart-issues/assets/questions.md`. Criterion: brief done-4.
5. Run configured checks: `bun run format`, `bun test`, `bun run typecheck`.

## Acceptance criteria

- AC1: Template shows `### 1 ·`, `### 2 ·`, `**1a (recommended)**`, `**1b**`, reply key `1a 2b`; no `Q1`, `Q2`, `1-A`, `2-B`, `**A`, `**B` label remains.
- AC2: Paragraph after template states `1`/`1a` labels, forbids any other code scheme in a round, keeps per-round restart at 1.
- AC3: Grep in step 3 returns no hit outside lockfiles.
- AC4: No other file changes.
- AC5: Format, test, typecheck pass.

## Verification

- Read the edited template block and paragraph; eyeball AC1 and AC2 verbatim.
- Run the step-3 grep from the worktree root; expect exit 1 with no output.
- Run `git status --porcelain` and `git diff --stat`; expect one file.
- Run the step-5 checks.

## Docs affected

- Agent doc: `skills/chart-issues/assets/questions.md` — the edited round template itself.
- Human doc: none affected.

## Open limitation

Older charts under `issues/` keep answers recorded under prior schemes (`Q1`, `1-A`, invented `QQ`/`O1`); they are not migrated.

## Dependencies

None.

## Credentials

Design names no variable names; no env check required.
