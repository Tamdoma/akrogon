# split-proof

## Question

1. How many leaves, and how is a prose rule change proven?
   - 1a (recommended) One leaf, all files. Mechanical half: the repo's existing `checks` stay green (links, install, the shapes readiness example). Choice half: the implementer's report walks cases through the new text, which both review seats judge: the serp-wireframing six-step trace naming the sentence that now changes each step; a kept function check still blocking (`[wf-c3]` blank rationale, a spend bound); a kept outside-standard threshold; a site table of every place the old rule lived (standing-design, implement-issue restatement, plan, check, questions, shapes, autopilot, lessons) so no sibling restatement survives. No grep, word count or expected wording. The leaf states what stays unproven: behavior on the next real chart.
   - 1b Two leaves: core chain, and lessons.

### Carries

Signposts 1a 2a 3a 4a 5a 6a and hard limits (forks/signposts.md). Intake Tamdoma/akrogon#140. Merged notes slots/forks-merged.md; rebuttals slots/forks-rebuttal-B.md, slots/forks-rebuttal-C.md.

## Findings

- One leaf (A,C; B withdrew its two-leaf pick: a lessons leaf would need blocked-by on the standing line).
- Proof (A,B,C); tests/docs-links.test.ts says "Ordering and phrasing are judgment, not mechanics" (B).
- Probes: `akrogon status` no open leaves; open charts mine-issues (no file overlap) and this one; door skills run from the release link, so the change reaches doors at the next release link (B T10). A leaf planned under the old text and reviewed under the new meets the on-sight Fix; the plan-issue reading is the remover (B rebuttal); stated at the handoff review.

## Taken

A's pick under full autopilot, 2026-11-17: **1a**. Reason: the rules reference one line; a half-landed chain fails valid plans (B T6). Rejected 1b. Standing dissent: none.

Correction 2026-11-17 (A, final-shape check): criterion 'the repo's existing checks pass' dropped as a repo-health claim (B14); the leaf-owned mechanical results are that links in the changed files resolve (tests/docs-links.test.ts) and the shapes readiness example still parses (tests/chart-shapes.test.ts).

Proof 2026-11-17 (charting observation, free): command `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` at main 7cecb045, bun 1.4.4, identity: local operator checkout, no credentials. Result: 14 pass, 0 fail. Cleanup: none needed (read-only). Limits: proves both existing checkers run and pass on today's text; does not prove they will accept the leaf's edited files, which is the leaf's own proof.
