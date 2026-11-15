# Direct report: round-rewrites

## Change

- `skills/chart-issues/assets/questions.md`, paragraph "Every round uses this shape": one sentence added between the register sentence and the pre-send read sentence. Reason: forks/change.md, Taken, 1b and 2a.
- Added sentence: "The first print of every operator-facing output — a fork round, the signposts round, the split proposal and the handoff review, each keeping its own required parts — is written, in the same single pass, as the simpler second version an operator would otherwise ask for: the same structure with every part kept, shorter without dropping a part, each option stated by what happens for the operator after picking it, the background that makes a good and informed choice easy, and concrete words with no analogy."
- Nothing removed. The register sentence and "Before sending a round, A reads it once against these rules and fixes what fails" are unchanged, so the pre-send read still covers every round, autopilot rounds included.

## Base and head

- base: 452a2f1441bf82e8afcf0ce0f21b696eecd0c4b2 (origin/main, fetched 2026-11-11, rebase was a no-op)
- head: 97e88038a7d26ee0940de20a074d3ad71d8f9840

## Done-criteria

1. First print written as the simpler second version, one pass, every part kept: the diff at 97e88038 ("in the same single pass", "the same structure with every part kept").
2. The four outputs named: the diff at 97e88038.
3. Existing checks pass: `akrogon run-check --holder <chart>/direct --name docs-links -- bun test tests/docs-links.test.ts` on 97e88038, exit 0, 11 pass, 0 fail, log `check-docs-links-1794398550319-412078.log`. The full check set runs at landing through `akrogon verify --holder <chart>/direct`.

## Landing

- Review: slots/review-B-1.md, verdict ready, no Fixes, no Nits, head 97e88038.
- Refresh before landing: fetch and rebase onto origin/main 452a2f14, no-op, head unchanged.
- `akrogon verify --holder <chart>/direct` run 1 on 97e88038: red, `test` exit 1, 1162 pass, 1 fail, log `check-test-1794398746976-545357.log`. The failing test is `tests/next.test.ts` "new tab keeps existing scratch for checks that outlive their tab, and seats disable the node compile cache" (`expect((await next(f, ['stale-tmp'])).code).toBe(0)` received 1). Judgment: no cause in the diff, which is one sentence in a Markdown skill file that this test does not read.
- Retry on the same head, run 2: green, `test` exit 0, 1163 pass, 0 fail, log `check-test-1794398821416-862279.log`; format and typecheck green in both runs. The retry result is `inconsistent`, so nothing is filed as a base red and no known-red run was needed.
- `direct-guards.ts`: "direct guards passed", exit 0.
- Push attempt 1 of 2: `git push origin 97e88038a7d26ee0940de20a074d3ad71d8f9840:refs/heads/main`, `452a2f14..97e88038`, exit 0. origin/main read back as 97e88038.
- Sources closed: none, the chart is unsourced.

## Docs

No live copy of the register wording outside questions.md (`grep` over skills, docs, src, tests). Matches under `issues/` are closed records and stay as written.

## Tests

None written or changed.

## Known limits

- The wording is not expected to end `elid` requests (forks/change.md, Taken, expectation). The operator accepted that.
- The change reaches doors only at the next release link. The installed skill copy is unchanged by this landing.
