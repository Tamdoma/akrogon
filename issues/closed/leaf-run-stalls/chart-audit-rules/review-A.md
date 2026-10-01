# Review-A: chart-audit-rules

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Reviewed head: `646fa457d2160461b389b4c6b605bb643d61924a`. Worktree clean, head one commit ahead of base, no `issues/` paths on the branch. Blind review; peer review not read.

## Diff inspected

One file, two lines: `skills/chart-issues/assets/shapes.md` (placeholder line plus implementer-audit paragraph). No `AREA.md` in the diff, so no path listing applies. The changed behavior's doc page is `shapes.md` itself; `docs/guide/chart.md` and `docs/guide/phases.md` describe handoff only in general terms (bounded outcomes, matching owners, pull checks) and restate neither rule, so no other documented behavior changed and no doc is stale.

## Criterion checks

1. Placeholder names only the two allowed proof kinds (blocking-`checks` command or leaf-added test with the standing-design cases). Audit paragraph states rule 1 with the prerequisite route ("added to `checks` first, after a prerequisite leaf makes it pass") and the refusal ("the audit refuses a criterion citing a repo-wide command outside `checks`"). Holds.
2. Audit paragraph states rule 2 keyed on every `blocked-by` entry: consumed output into the dependent's What or Why, prerequisite proposal for a separately mergeable part, no count/size/duration trigger, no recorded reason for a kept bundle. Holds.
3. Spine paragraph outside the diff (zero added/removed spine lines); `skills/chart-issues/SKILL.md` diff is 0 bytes. Holds.
4. Report evidence complete: `bun test` 339 pass / 0 fail (76s), `bun run format` unchanged, `bun run typecheck` exit 0, resolved changed-tests 0 affected. No rerun: prose-only diff, evidence present, no specific concern.

## Scenario and contract checks

- Concrete case: a criterion citing `bun run framework:verify` (repo-wide, outside blocking `checks`) is now refused by the audit paragraph, with the prerequisite route as the escape hatch. Rule 1 closes the cited failure class.
- Design exclusions respected: `SKILL.md`, `standing-design.md`, `questions.md`, spine paragraph, other skills and `issues/` all untouched.
- No wording test added, correct per the standing-design vanity-test rule; each criterion's failure is caught by reading the diff, which the report records.
- Ponytail: smallest sufficient diff, one file, no abstraction.

## Findings

- Fixes: none.
- Nits: none.

## Verdict

`ready`
