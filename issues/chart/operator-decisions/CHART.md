# Chart: operator-decisions

## Destination

In the akrogon repo, an operator decision recorded in a seed under a fixed marker counts as already taken: seed-issue has a sanctioned place and writer rule for it, the chart door records it as a taken fork at import and shows it in the opening map, charting covers only what it leaves open, a finding against it goes to the operator, autopilot never picks against it, and every leaf design carries it verbatim. Worked case: Tamdoma/tamdoma-framework#714.

Route: lifecycle (direct refused: the draft needs `grants`)

Handoff review approved by the operator 2026-11-19, verbatim: "approved, Just make sure to use Claude Opus 5.5 with high effort as a slot A in the life cycle For this specific issue." Seats: ISSUE.md `slots:` a claude claude-opus-5-5 high; b from machine config. Leaf review by B: slots/leaf-review-B.md (F1-F9 adopted into the written contracts, changed lines tagged (A,B)). Written: issues/open/operator-decisions/ (ISSUE.md, seed-decisions/ brief, design, readiness, state last); `akrogon status` shows seed-decisions in plan.synthesis.

## Forks taken

- [signposts](forks/signposts.md): operator 1a 2a 3a 4a 5a 6a, with the 2a correction; needs none
- [marker](forks/marker.md): heading `## Operator decision (<name>, <date>)` locks to the next `## `; counts when author and every editor have write or admin on the issue's repo
- [seed-writer](forks/seed-writer.md): seed-issue infers the decision from the person's own words, no confirm; may add it to an open report by one body edit; requested background allowed, locks nothing
- [door-record](forks/door-record.md): one verbatim taken fork per counting section, shown first; one definition sentence in questions.md; later sections taken at the next open; uncounted ones are plain intake, no wait
- [finding-against](forks/finding-against.md): only evidenced breakage counts; blocking asks or parks, other is shown once; conflicts always to the operator; A labels a two-reading pick; person at the door wins
- [leaf-carry](forks/leaf-carry.md): decision copied verbatim, criteria trace to `Done when:`, `## Held disagreements` heading; false docs lines fixed; one leaf, lifecycle

## Open forks


## Fog

## Off route

- Charting Tamdoma/tamdoma-framework#714 (signposts 6a: a later session after release).
- Command code, paid door runs, comment and mid-chart entry points (signposts 4a, 5a).
- Rule text for consultants' held disagreements on drafts (leaf-carry 1).

## Pending steps

none

## Recorded only

- `chartRow` in src/status.ts counts an empty `## Taken` as taken when another section follows: `/^## Taken\s*\n\s*\S/m` lets `\s*` cross blank lines into the next `## ` heading, which is the signposts shape with `## Needs` (B map Q5, A confirmed by reading 2026-11-19). Seed candidate, outside this chart.

## Mode record

- mode 2026-11-18T22:40:46Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/48f33098-9add-4352-b6e7-36b108a68792.jsonl: manual (operator answers signposts and forks); consultant B door-created claude claude-fable-5-2 high (operator: "slot P consultant, which is Fable 5.2. High effort", read as B, harness claude by A's default)

Handed off 2026-11-19
