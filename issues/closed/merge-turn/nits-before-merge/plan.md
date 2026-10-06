# Plan: nits-before-merge

Debate is off (`debate: "no"`); this plan synthesizes directly from the brief and design. Prose-only leaf: no new tests (standing design). The branch never touches `learnings/` or `issues/`; lessons written at runtime go to the registered checkout and stay uncommitted for the operator.

## Decisions

- D1 — Placement mirrors the removed step's wording rules. In `skills/check-issue/SKILL.md`, B records each held reusable Nit before a non-`fix` check.review verdict and before the check.repair move to `merge`, skipping Nits already written for this leaf (tracked in `review-B.md`). Output shape stays: one mechanism/date/history line in the registered checkout's `learnings/LESSONS.md` plus `learnings/history/<date>-<slug>.md` with case, evidence and learning, never a worktree copy, left for the operator to commit, no reading of the active list as pass input, no extra turn.
- D2 — `skills/merge-issue/SKILL.md` loses the `## merge` first paragraph ("Turn a Nit B still holds…"). Nothing else in that section changes.
- D3 — `docs/guide/learn.md` line 9 is the only `docs/` page placing the step in the merge pass ("The merge skill can turn that nit…"). Rewrite it to name the check skill's recording before merge, keeping the surrounding fix/nit/lesson framing.
- D4 — Timing sits before the verdict/move, not before findings are written. In check.review, B needs its Nits recorded in `review-<slot>.md` first, then writes lessons, then calls `akrogon phase` with the non-`fix` verdict. In check.repair, lessons are written after repairs, before the `akrogon phase <slug> merge --slot B` call.

## Open limitation (accepted in brief)

A lesson can be written for a leaf that later fails. Additionally, B's post-`check.fix` re-check has no recording trigger: a re-check ending ready/nits moves to `merge` through the same verdict call without a separate lesson step. The skip rule keeps carried Nits from duplicating on the next repair pass; Nits first raised in a re-check are unrecorded. Left for review.

## Read-first

- `skills/check-issue/SKILL.md` — `## check.review` verdict/finish paragraph and `## check.repair` finish paragraph.
- `skills/merge-issue/SKILL.md` — `## merge` first paragraph (the step being removed; source of the wording rules in D1).
- `docs/guide/learn.md` — the lesson paragraph at line 9.
- `learnings/LESSONS.md` — line format precedent (`mechanism. date. history/<file>`); observations, not input rules.
- `skills/AREA.md` — confirms skills guide agents while the command owns phase moves (relevant to why B cannot see the aggregate move).
- `src/phase.ts` around lines 241-250 — verdict aggregation; the reason recording must precede a non-`fix` verdict.

## Interfaces

- `akrogon phase <slug> merge --slot B --verdict <ready|nits>` (check.review finish) and `akrogon phase <slug> merge --slot B` (check.repair finish): lesson writes happen before these calls.
- Registered checkout path: `repos.<repo>` from `akrogon config` → `learnings/LESSONS.md` and `learnings/history/`.
- `review-B.md` under the leaf folder records which Nits were written, feeding the skip rule.

## Checklist

### Wave 1

- U1 — owns `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `docs/guide/learn.md`. No shared test resource, no prerequisites. One small prose edit is cheapest as a single unit.
  - Criterion 1: check.review gains the record-before-non-`fix`-verdict rule; check.repair gains the record-before-`merge`-move rule with the skip clause; both name the registered checkout's `learnings/LESSONS.md`, a history file, and operator commits it.
  - Criterion 2: the `## merge` Nit paragraph is gone.
  - Criterion 3: learn.md no longer assigns the step to the merge skill/pass.

Docs affected: `docs/guide/learn.md` (one line rewritten). Agent docs affected: `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`. No other doc names the step's pass placement.

## Verification

| Criterion | Proof | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | Read the edited `## check.review` and `## check.repair` sections; confirm the rule sits before the verdict call / merge move and carries the skip clause and write target. | Rule placed after the phase call, missing skip clause, or writes to the worktree. | seconds | Any diff in `check-issue/SKILL.md`. |
| 2 | `grep -n -i 'nit' skills/merge-issue/SKILL.md` returns no Nit-to-LESSONS step; `## merge` opens with the commit/rebase paragraph. | Step only partially removed. | seconds | Any diff in `merge-issue/SKILL.md`. |
| 3 | `grep -rn -i 'merge' docs/` shows no page assigning lesson recording to the merge pass. | A second stale doc hit missed by the initial sweep. | seconds | Any diff under `docs/`. |
| All | `bun run format` clean; `bun test --changed="$AKROGON_BASE" --timeout=30000` reports no affected tests (prose-only diff). | Formatting drift; an unexpected test-file hit. | seconds | Every implementation commit. |

No `merge_checks` are configured and the brief names no whole-suite run; `bun test` and `bun run typecheck` are not required for a diff touching only `.md` files. No credentials are named by the design; `akrogon status` shows no `Missing:` lines.
