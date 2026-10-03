# Round 2 merged (K5, what is worth testing)

## Agreed (A,B)
- Value is in tests whose expected result comes from outside the code: a criterion, a contract, real output or a recorded real sample. Agent tests that restate code add little and lock it in (Stack 2026-09-23, deftai #5141, Ma et al. 2606.28430).
- No credible source with measured results supports deleting every unit test. Wu, dwlz and AlNeaimy give no before/after numbers. Beck, TigerBeetle, Dodds, Stack's own Swamp setup keep a mix (B: Stack still runs units, contract and property tests on each PR).
- Our real catches went through public CLI or real browser (failure-log, readiness-contract, capture-asset-bytes). Our pure-waste blocker was an environment-detail assertion (TMPDIR, 175b862, pi worker).
- A bad criterion can force a bad test past every review rule (check-issue:55, plan-issue:65). The bar must apply where criteria are written (chart and brief), with a route to raise a bad locked criterion to its owner (B found this, A agrees).
- Shortlist signals (never failed, flaky, slow, coverage, mutation score) are not deletion rules on their own (B). Deleting several tests needs a check of the batch, since two tests can each look redundant only because the other exists (B, Chromium 2026-02-18).

## Different
- A proposed a one-time prune pass per repo. B proposed a rule only, no audit machinery.
- A said a fake reply must match a recorded real one. B says inducing an outside failure with a fake is fine (failure-log Herdr error) as long as the code under test is real. standing-design.md:11-13 already requires provenance for replayed outside outputs.
- B adds a question on proving a new test catches its failure (bounded mutation or known-bad case, no score quota).
- B: the raw dwlz post (thread.json) does not contain the 800k claim. The screenshot is the only source for it.

## Questions
- Q4 criterion bar (B 1a = A G1 merged)
- Q5 level (A 5a = B 2a)
- Q6 deleting existing tests (B 3a, A 6a audit variant)
- Q7 proof a test detects its failure (B 4a)
