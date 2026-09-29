# Brief 1: proof-rules inserts in 5 skill files

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/proof-rules-u1`, detached at `ea43b14eaa195c168d078b291eefd2fc3c5f4586`. Do all edits and commits there. Do not touch the lane worktree or the leaf folder.

## 1. Goal

Add the four proof rules to standing-design.md and their phase pointers to the four phase files, as pure insertions totaling at most 16 added lines against the 20-line hard cap. Plan decisions D1-D10.

## 2. Numbered acceptance criteria

1. standing-design.md: 4 new `- ` bullets immediately after the line starting `- Any leaf touching a user-visible flow` (line 9). Bullet 1 states: each done-criterion is proven by the cheapest sufficient test that catches its failure; cheapest counts creation plus upkeep; a real model or outside call can be cheapest when that behavior is under test; a slow or live run names what no smaller test proves. Bullet 2 states: chain trigger is one leaf's output (data, files, state, build input) consumed by code another leaf owns; own scripts, consumers and checks run real; model and outside stages replay output recorded from one real run with source, revision or date, and capture command, re-recorded never hand-patched; a leaf changing prompt, model, settings, output shape, or outside call runs one real call through its consumer and checks, names the property proved, and re-records; an outside change making a recording unreliable also triggers re-recording; the spine runs in the consumer's blocking checks; a stage labelled real that fakes its result does not count; hand-written negative and edge inputs stay allowed; no live model run per merge. Bullet 3 states: a slow or live-run leaf fixes another leaf's bug in-branch only when no locked decision changes, no new feature, no changed acceptance rule; each fix gets a fail-first test in the owning code's own tests; rerun every changed stage plus every consumer of its outputs (shared files, lockfile, env count as inputs; unsure means restart from a trustworthy point); run every check whose prerequisites are valid, mark the rest blocked, the run still fails, product gates still stop the product, follow-on failures grouped under their root; stand-ins only in a separate diagnostic run that never counts as proof; final proof valid at the final commit, clean full run only when reuse cannot be shown or fresh start, order, or whole-run behavior is under test. Bullet 4 states: writer and checker share one rule definition; a model writer's instructions state the checker's rule; a kept second copy says why and has an agreement test; tests keep independent expected results; a group-size-dependent check states what it needs for the target count counting what renders, tested at real target size with the real pool (must pass) and a too-small pool (must get the design's refusal); a model-judged such check tests one known-acceptable and one known-unacceptable case at target size and states what stays unproven. Each bullet is one physical line of at most 3 sentences. No existing line changed.
2. shapes.md: inserted block of at most 4 lines directly after the paragraph starting `Read the briefs as an implementer`, stating: a chart with a chain names the spine command and a stage table; each stage-owning leaf gets a done-criterion putting its stage in the spine and deleting obsolete stand-ins (blocked-by where it needs the spine first); the chart names the rule owner when writer and checker sit in different leaves; a slow-run leaf's brief states repair scope and final-proof rule; the audit refuses a stage-owning leaf without the spine criterion. Points at the standing-design rules, does not restate them.
3. plan-issue/SKILL.md: at most 2 inserted lines under `## plan.synthesis` requiring plan.md to map each done-criterion to its command, the failure it catches, a size (seconds, minutes, hours, unknown), and a rerun trigger, and requiring a slow-run leaf's plan to name restart boundaries.
4. implement-issue/SKILL.md: at most 3 inserted lines total: one design-stop line immediately after the :31 B-seat paragraph (`The B seat proceeds without posing questions...`) stating a fix needing a locked decision changed ends the pass with `akrogon phase <slug> failed --reason` naming the decision; report lines in `## implement` after the report sentence requiring wall time for commands sized minutes, hours, or unknown, and for a slow run the in-branch fixes, reused stages with source commit, what changed and which stages it feeds, and blocked checks.
5. check-issue/SKILL.md: at most 3 inserted lines after the :45 prose-test paragraph stating the three Fix triggers (a failure the leaf's code can cause left untested in the leaf, with a slow but correct test as Nit; a second rule copy without reason and agreement test, or a reproducible writer/checker disagreement; a group-size-dependent check without a stated need or target-size test), that look-alike code alone is not a Fix, and that no review rerun is added beyond :49. Line :49 byte-identical.
6. Budget: numstat added total across the repo at most 16 planned, 20 hard; 0 deleted lines in standing-design.md; both `ponytail.md` files untouched; diff names only the 5 files.
7. The section 7 command exits 0. No new test files: prose-wording tests are rejected by check-issue:45 and the design, so grep plus numstat is the evidence (criterion 9).

## 3. Read-first list

- `skills/chart-issues/assets/standing-design.md`
- `skills/chart-issues/assets/shapes.md`
- `skills/plan-issue/SKILL.md`
- `skills/implement-issue/SKILL.md`
- `skills/check-issue/SKILL.md`
- `skills/implement-issue/ponytail.md` (read before editing)
- Pattern to copy: the existing standing-design bullets, each one `- ` line of plain sentences.
- All paths relative to your worktree root. Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns the 5 files above; no other file may change.
- No code interfaces; anchors are the literal paragraphs named in criteria 1-5.
- Prerequisites: none; this is the only unit, first and last.
- Shared test resources: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not rewrite or delete any existing line: pure insertions keep the added-line budget exact and criterion 9 demands 0 deletions in standing-design. Exception: none; a missing anchor is a mismatch with evidence, not an improvisation.
- Do not touch `src/`, `tests/`, either ponytail.md, or create any file: the design excludes them and criterion 9 forbids new files. Exception: none.
- Do not restate rule substance in the four phase files: each rule is stated once in standing-design and the 20-line cap leaves no room for copies. Exception: none.
- Do not run the full suite: it belongs to B after the wave. Exception: none.
- Do not change scope or an anchor: the plan owns the contract. Exception: a revised brief from B authorizing that change.
- Restated: no rewrites, no extra files, no restated substance, no full suite, no scope change; the only way forward on a conflict is a mismatch return unless B revises this brief.

## 6. Ordered steps

1. standing-design.md for criterion 1: insert the 4 bullets, then grep each load phrase (`cheapest sufficient`, `recorded from one real run`, `fail-first`, `agreement test`).
2. shapes.md for criterion 2: insert the block, then grep `spine command`.
3. plan-issue for criterion 3: insert the lines, then grep `rerun trigger` and `restart boundaries`.
4. implement-issue for criterion 4: insert the lines, then grep `failed --reason` and `wall time`.
5. check-issue for criterion 5: insert the lines, then grep `target-size`; diff line :49 against HEAD to prove it is byte-identical.
6. Budget for criterion 6: run `git --no-pager diff --numstat` and `git --no-pager diff --name-only` (against HEAD, uncommitted); total added at most 16, only the 5 files, both ponytail files absent. If over budget, compress wording, never substance.
7. Tests for criterion 7: run `bun install` once, then the section 7 command.
8. Commit all 5 files in one commit (message `proof-rules u1: insert proof rules`) and record the SHA for your report.
- Advisory size: about 5 files and under 24 turns; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

From the worktree root only:

```sh
AKROGON_BASE=ea43b14eaa195c168d078b291eefd2fc3c5f4586; : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

Done when criteria 1-7 hold on your committed worktree. Paste the numstat output, the name-only output, the section 7 output, and the commit SHA. No end-to-end artifact exists for this prose leaf; the diff is the artifact. Name limits and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
