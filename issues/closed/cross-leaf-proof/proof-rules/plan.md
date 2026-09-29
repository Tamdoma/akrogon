# Plan: proof-rules

Direct synthesis. `debate: no`, no positions or rebuttals. Source is brief.md plus the locked design. Worktree diff is empty, so live line numbers below are origin/main numbers.

## Decisions

- D1: `standing-design.md` gains exactly 4 inserted bullets after line 9 (the E2E lock), one physical line per rule, at most 3 sentences each. Zero deleted lines in that file.
- D2: Every edit in this leaf is a pure insertion. No existing line is rewritten anywhere, so the criterion 9 rewrite list is `none`.
- D3: `shapes.md` gains one inserted block of at most 4 lines after the implementer-audit paragraph (`Read the briefs as an implementer...`, before `Write the leaf files...`). It carries only chart/audit actions and points at the standing-design rules instead of restating them.
- D4: `plan-issue/SKILL.md` gains at most 2 inserted lines under `## plan.synthesis`: per-criterion mapping (command, failure caught, size, rerun trigger) plus slow-run restart boundaries.
- D5: `implement-issue/SKILL.md` gains at most 3 inserted lines total: the design-stop line immediately after the :31 B-seat paragraph, and report-recording lines in `## implement` after the report sentence.
- D6: `check-issue/SKILL.md` gains at most 3 inserted lines after the Fix definition (:43-45): the three Fix triggers, the look-alike exclusion, and the no-rerun-beyond-:49 pointer.
- D7: Line budget is 4 + 4 + 2 + 3 + 3 = 16 planned, hard cap 20 added lines repo-wide per numstat. If over, compress wording, never substance.
- D8: Wording is free, substance is fixed by the design's binding decisions. Each standing-design bullet carries its brief criterion's full trigger list; phase files say `per standing-design rule N` rather than restating.
- D9: No new tests, no `src/` or `tests/` change, no new file. Verification is diff inspection plus `bun test`. `bun run format` is skipped per criterion 10 because package.json:8 scopes it to `src tests`.
- D10: One implementation unit holds all 5 files in one wave. The 20-line budget is shared and cannot be split across parallel workers.

## Read-first

- `skills/chart-issues/assets/standing-design.md` (insertion target, rules 1-4)
- `skills/chart-issues/assets/shapes.md` (audit paragraph anchor)
- `skills/plan-issue/SKILL.md` (`plan.synthesis` section)
- `skills/implement-issue/SKILL.md` (:31 seat paragraph, `implement` report sentence)
- `skills/check-issue/SKILL.md` (:43-45 Fix paragraph, :49 rerun rule)
- `package.json` (format scope evidence for criterion 10)
- Leaf `brief.md` and `design.md` (contract and locked substance)

## Needed interfaces

No code interfaces. Anchors, verified live on the clean worktree:

- standing-design.md:9 E2E lock (`Any leaf touching a user-visible flow...`); insert 4 bullets after it.
- standing-design.md:8 `Mandatory negative and edge-case tests` (stays unchanged; basis for D9).
- shapes.md `Read the briefs as an implementer...` paragraph; insert D3 block after it.
- plan-issue `## plan.synthesis` paragraph; append D4 lines.
- implement-issue :31 B-seat paragraph; insert design-stop line directly after. `## implement` report sentence (`write <leaf>/implementation/report.md...`); insert wall-time and slow-run report lines after it.
- check-issue :43 `A Fix is wrong behavior...` and :45 prose-test rejection; insert D6 lines after :45. :49 rerun rule stays untouched.

## Acceptance criteria

- A1 (criterion 1): standing-design states cheapest-sufficient-test rule, cheapest counts creation plus upkeep, a real model or outside call can be cheapest when that behavior is under test, slow or live run names what no smaller test proves.
- A2 (criterion 2): standing-design states chain rule: trigger is one leaf's output (data, files, state, build input) consumed by another leaf's code; own code real; model and outside stages replay output recorded from one real run with source, revision or date, and capture command, re-recorded never hand-patched; prompt, model, settings, output-shape, or outside-call change runs one real call through consumer and checks, names the property proved, re-records; unreliable-making outside change also triggers re-recording; spine runs in consumer blocking checks; a stage labelled real that fakes its result does not count; hand-written negative and edge inputs allowed; no live model run per merge.
- A3 (criterion 3): standing-design states slow-run rule: in-branch fixes bounded by no locked-decision, feature, or acceptance-rule change, each with a fail-first test in the owning code's own tests; rerun every changed stage plus every consumer of its outputs (shared files, lockfile, env count as inputs; unsure means restart from a trustworthy point); run every check whose prerequisites are valid, mark the rest blocked, run still fails, product gates still stop the product, follow-on failures grouped under their root; stand-ins only in a separate diagnostic run that never counts as proof; final proof valid at the final commit, clean full run only when reuse cannot be shown or fresh start, order, or whole-run behavior is under test.
- A4 (criterion 4): standing-design states writer/checker rule: one shared rule definition, model writer instructions state it, a kept second copy says why and has an agreement test, tests keep independent expected results; group-size-dependent check states what it needs for the target count counting what renders, tested at real size with the real pool (pass) and a too-small pool (the design's refusal); model-judged such check tests one known-acceptable and one known-unacceptable case at target size and states what stays unproven.
- A5 (criterion 5): shapes.md makes a chart with a chain name the spine command and a stage table, gives each stage-owning leaf a done-criterion putting its stage in the spine and deleting obsolete stand-ins (blocked-by where it needs the spine first), names a rule owner when writer and checker sit in different leaves, states a slow-run leaf's repair scope and final-proof rule, and makes the implementer audit refuse a stage-owning leaf without the spine criterion.
- A6 (criterion 6): plan-issue makes `plan.md` map each done-criterion to its command, the failure it catches, a size (seconds, minutes, hours, unknown), and a rerun trigger; a slow-run leaf's plan names restart boundaries.
- A7 (criterion 7): implement-issue ends the pass with `akrogon phase <slug> failed --reason` naming the decision when a fix needs a locked decision changed, placed beside :31; its report records wall time for commands sized minutes, hours, or unknown, and for a slow run lists in-branch fixes, reused stages with source commit, what changed and which stages it feeds, and blocked checks.
- A8 (criterion 8): check-issue makes a Fix of a failure the leaf's code can cause left untested in the leaf (a slow but correct test is a Nit); a second copy of a rule without reason and agreement test, or a reproducible writer/checker disagreement; a group-size-dependent check without a stated need or target-size test. Look-alike code alone is not a Fix. No review rerun is added beyond :49.
- A9 (criterion 9): added-lines total at most 20, both ponytail.md files unchanged, 0 deleted lines in standing-design.md, every rewritten line elsewhere named with why it removes or loosens no check.
- A10 (criterion 10): `bun test` passes.

## Checklist

- S1 standing-design.md (A1-A4): insert 4 bullets after line 9 per D1. Done when each rule's substance above reads in full from the new lines and `git diff --numstat` for the file shows 0 deletions.
- S2 shapes.md (A5): insert D3 block after the audit paragraph. Done when all six chart/audit duties (spine command, stage table, per-stage criterion with stand-in deletion, blocked-by, rule owner, repair scope plus final-proof, audit refusal) are present by pointer.
- S3 plan-issue SKILL.md (A6): insert D4 lines. Done when the four mapping fields plus restart boundaries are required text.
- S4 implement-issue SKILL.md (A7): insert D5 lines. Done when the design-stop line sits beside :31 and the report gains wall-time plus slow-run contents.
- S5 check-issue SKILL.md (A8): insert D6 lines. Done when the three Fix triggers, the look-alike exclusion, and the :49 pointer are present and :49 itself is byte-identical.
- S6 budget and unchanged files (A9): run V1-V4. Done when total added is at most 20, standing-design deletions are 0, both ponytail.md files are untouched, and the diff names only the 5 files.
- S7 full check (A10): run V5 from the worktree root on the committed head. Done when `bun test` passes.

## Verification

- V1: `git --no-pager diff --numstat origin/main...HEAD | awk '{a+=$1} END {print a}'` prints at most 20; paste the output in the report.
- V2: `git --no-pager diff --numstat origin/main...HEAD -- skills/chart-issues/assets/standing-design.md` shows 0 in the deleted column.
- V3: `git --no-pager diff --name-only origin/main...HEAD` lists only the 5 owned files; `git --no-pager diff --numstat origin/main...HEAD -- skills/implement-issue/ponytail.md skills/check-issue/ponytail.md` prints nothing.
- V4: `grep -c` each new block for its load phrase (`cheapest sufficient`, `recorded from one real run`, `fail-first`, `agreement test`, `spine command`, `restart boundaries`, `wall time`, `target-size`) as a manual substance read, not an automated test.
- V5: `bun test` passes from the worktree root. `bun run format` is not run per A10; package.json:8 (`prettier --write src tests`) is the evidence it cannot touch this markdown-only diff.

## Affected docs

- `skills/chart-issues/assets/standing-design.md`: gains the 4 proof rules (agent rule file).
- `skills/chart-issues/assets/shapes.md`: gains chain charting and audit duties (agent rule file).
- `skills/plan-issue/SKILL.md`: gains plan mapping and restart boundaries (agent workflow).
- `skills/implement-issue/SKILL.md`: gains design-stop and report contents (agent workflow).
- `skills/check-issue/SKILL.md`: gains Fix triggers (agent workflow).
- No human doc under `docs/guide/` and no `AREA.md` is affected: none state a conflicting test, proof, or review rule (grep for cheapest, spine, proof, rerun, wall time found only unrelated hits).

## Open limitation

L1: The new rules bind future leaf designs only; existing contracts including framework live-replay keep their old behavior until the operator changes them, so this leaf proves the rule text, not a faster live run.

## Dependencies

None. S1-S5 share one line budget inside one unit, so they run as a single edit sequence, not parallel work.

## Credentials

None. The design's Standing design section states agent-owned with no env values, and a scan of design.md names no variable, so no `bun --env-file` presence check applies.

## Notes

- No brief/design conflict. `Implementer audit` (brief 5) and `handoff audit` (design spine Q1) are the same shapes.md paragraph; the plan anchors it literally.
- Concrete scenario: leaf P emits `events.json` consumed by leaf C's importer. Under A2/A5 the chart names `bun test spine/` plus a stage table, P's criterion puts emission in the spine and deletes its stub, C's blocking checks run the spine, and a model stage in between replays a recording stamped with source, date, and capture command. A prompt tweak in P runs one real call through C and re-records.
- Fuzzy terms pinned: cheapest counts creation plus upkeep; spine is the one chain command in the consumer's blocking checks; real means executed or replayed-from-real, never hand-authored positive output; in-branch fix meets an already-settled requirement with no locked-decision change.
