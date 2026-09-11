# Review A: seed-slug-cut

Base: d40b08a40c2991d216e51ba48c9003727a04221d
Reviewed head: 6ca2468 (fix: shorten seed slugs at word boundaries)
Debate: no, so no positions or rebuttal input.

## Scope
Diff touches only `src/pull.ts` (`slug()`) and `tests/pull.test.ts`, as the brief and design lock. Worktree clean. No docs or REFERENCE.md mention the slug length, so no index or doc pointer is affected.

## Criteria
- C1 at most 40, no trailing hyphen, normalization/fallback/number prefix unchanged: code keeps the same normalization chain and `issue` fallback; the trailing-hyphen strip runs on the shortened value. Pass.
- C2 150 X title yields 40 x: existing assertion rewritten and green. Pass.
- C3 multiword title yields `alpha-bravo-charlie-delta-echo-foxtrot`: covered by test issue 104 and retained CLI artifact `evidence/104-alpha-bravo-charlie-delta-echo-foxtrot.md`. Pass.
- C4 41-X word alone or before another word yields 40 x: issues 105, 106. Pass.
- C5 exact-40 kept, `alpha-` + 34 x kept before a hyphen, 39 x + tail yields 39 x: issues 107, 108, 109, 110. Pass.
- C6 regex, fallback, reconciliation, body and failure scenarios: unchanged tests in the same file green. Pass.
- C7 blocking checks: `test.log` 45 pass / 508 assertions exit 0, `typecheck.log` exit 0, `format.log` exit 0, `cli-artifact.log` exit 0. Pass.

## Verification evidence
- Reran `bun test tests/pull.test.ts` at head: 7 pass, 0 fail, 77 assertions.
- Probed the head algorithm directly with extra inputs: `alpha ` + 33 x + ` tail` gives 39 chars (hyphen dropped), `!!!` gives `issue`, `aaa…(39)-bbbbb` gives 39 a characters, `ab ` repeated 20 times gives a 38 char boundary cut. All at most 40, none ending in a hyphen.
- Red log shows 2 failing tests on the old implementation, green log shows 7 passing after the change. Red/green claim matches.

## Tests vs criteria
The new test exercises the real CLI against the fake gh fixture and asserts exact filenames plus the length and no-trailing-hyphen properties. No mocks of the unit under test. Literal filename assertions are fixed references produced by the code, so they are acceptable.

## Ponytail
Implementation is five typed locals inside the existing function, no helper, no export, no config. Fewest moving parts for the stated rule. No concerns.

## Findings
None.

## Verdict
ready

## Merge
Rebase target: origin/main at d40b08a (branch already up to date, no rebase changes). Head: 6ca2468.
Checks in worktree after fetch: `bun run format` exit 0 (no files changed), `bun test` exit 0 (45 pass, 508 assertions), `bun run typecheck` exit 0, `bun test --changed=d40b08a` exit 0 (7 pass, 77 assertions). No advisory commands configured. No reusable Nit to record.
