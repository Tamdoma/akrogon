# Implementation report: lesson-write-rule

Base: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`. Head: `135add6`.

## Changed files and reasons

Wave 1, unit U1 (worker, commit `9946bed`, cherry-picked as `e8ceb2a`):
- `skills/lesson-rule.md` — new shared rule: Match, Seed, Home clauses; links `learn-issues/SKILL.md` and `seed-issue/SKILL.md`.
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` (lines 59 and 89), `skills/chart-issues/SKILL.md` — lesson-writing clauses gain `([lesson rule](../lesson-rule.md))`; no mechanics restated.
- `skills/AREA.md` — Key files bullet for `skills/lesson-rule.md` (33 lines, 4 sections).
- `tests/docs-links.test.ts` — new test asserting the four write sites contain `lesson-rule.md` (Test-Change trailer on the commit).

Wave 1, unit U2 (worker, commit `78e894d`, cherry-picked as `135add6`):
- `docs/guide/learn.md` — learn-issues sentence replaced by a `../../skills/lesson-rule.md` link naming its outcome; `/learn-issues` scoped to backlog triage.
- `docs/guide/cheat.md` — `Triage lessons` row renamed `Triage the lesson backlog`.

Wave 2, unit U3 (A): case records under `<leaf>/cases/` plus two fresh-agent decision runs (artifacts, not committed).

## Done-criterion proof

- **1**: `grep -rn "same failure cause\|shared keywords\|Checkable" skills/ docs/` — hits only in `skills/lesson-rule.md`, `learn-issues/SKILL.md` (the referenced definition) and `seed-issue/SKILL.md:67` (a different judgment-by-mechanism rule, not the lesson rule). All five write sites carry the link; `docs-links.test.ts` new test green.
- **2, 3, 4, 5** (re-run after check.repair F1; first runs were contaminated by Expected lines visible to the decider and are kept only as history at transcripts `sa-3`/`sa-4`, 2026-10-10T08-57-40 / 08-58-16): fresh subagent (`devin/swe-2-max`, high effort, transcript `sa-5`, `2026-10-10T09-04-59-825Z_...jsonl`), given only the rule file, its two references and six answer-free case records (`cases/case-1..6.md`, expectations private in `cases/expected-verdicts.md`), decided all six without posting: `append-case | seed` (1), `new-line | seed` (2), `new-line | no-seed` (3), `akrogon-learnings /home/ivan/Work/infra/akrogon/learnings/ | seed Tamdoma/akrogon` (4), `new-line | no-seed` (5), `new-line | local+notice | seed-stops` (6). **6/6 match Expected.**
- **5 broken variant**: same subagent kind (`sa-6`, transcript `2026-10-10T09-04-59-831Z_...jsonl`) on a variant rule where shared keywords count as a match decided case 2 as `append-case` — the predicted failure (case 2 diverging from expected `new-line`).
- **4 root-missing** (check.repair F3): case 6 exercises the unresolvable-root environment; the decider produced `local+notice` for the lesson write and `seed-stops` for the filing (owner test stops visibly before posting, per seed-issue's contract).
- **6**: `bun test tests/docs-links.test.ts` — 4 pass, 0 fail; learn.md links the rule and names its outcome; cheat.md row rescoped.

## Commands run

- `AKROGON_BASE=1d7d536... bun test --changed="$AKROGON_BASE" --timeout=30000` after each cherry-pick: 4 pass, 0 fail (docs-links.test.ts selected).
- `bun run format`: rewrote only pre-existing drift in `src/status.ts` (known lesson `2026-10-08-pause-dispatch`); reverted, worktree clean.
- `bun run typecheck`: clean.
- `bun test --timeout=30000`: 647 pass, 0 fail, 33 files, 51.69s (wall ~1 min).

## Known limitations

- `skills/lesson-rule.md`'s own outbound links (`learn-issues/SKILL.md`, `seed-issue/SKILL.md`) are not swept by `docs-links.test.ts`, which scans SKILL.md files only; they were verified manually to resolve.
- Case evidence except case 1's real framework history excerpt is fabricated per the plan; the proof exercises decidability, not live filing.
- Under the broken variant the decider omitted the `new-line` token on case 6 while still deciding `local+notice | seed-stops`; the substantive outcomes were correct.

## check.fix — 2026-10-10

Findings repaired: F1 (answer-contaminated acceptance runs) and F3 (missing-root scenario unexercised), both handed to A; F2 was repaired by B in commit `2d9beca`.

- Case records rewritten answer-free: `cases/case-1..5.md` stripped of Expected/Reason/Variant lines, `cases/case-6.md` added for the missing-root scenario, expectations moved to `cases/expected-verdicts.md` (not in decider input). Broken variant regenerated at `$TMPDIR/lesson-write-rule/lesson-rule-variant.md` against the repaired Seed clause.
- Fresh decisions rerun on the repaired head's rule (contains B's `2d9beca`): sa-5 shipped 6/6, sa-6 variant fails case 2 as required. Transcripts cited above.
- Before/after commits: reviewed head `135add6` → repaired head `2d9beca` (B's F2 commit); my repair changed leaf artifacts only, no new commits on the branch.
- Checks rerun: `bun test tests/docs-links.test.ts` 4/0, `AKROGON_BASE=1d7d536... bun test --changed` 4 pass/0 fail, `bun run typecheck` clean, `bun run format` clean (only pre-existing `src/status.ts` drift, reverted); full suite reused from B's repair run (647 pass, exit 0) since no worktree file changed after `2d9beca`.

## Unverified criteria

None.
