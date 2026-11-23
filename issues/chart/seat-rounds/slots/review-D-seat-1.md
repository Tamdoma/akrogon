# Slot D review of seat-rounds

**Verdict `fix`**

Base `814a2387`  
Head `a5a7237ef68edb02e54c33d7775d6de13c4454c2`

## Findings

- **F1 · `skills/check-issue/SKILL.md:79`.** The handoff depends on whether B has already changed the code. The design hands A the pair when both the code and the proof must change. With a missing edge-case proof and a defect in the same behavior, B can take the proof first because it has yet to change the code. The rule then assigns B the code fix by default, but B's new proof cannot accept it and there may be no independent proof of that edge case. Route the pair before either edit. When no unchanged proof covers the repaired behavior, the code and its accepting proof belong to A for B to review.
- **F2 · `skills/check-issue/SKILL.md:79`, `:85`.** A proof-command-only correction is assigned to B but also requires a commit and a `Test-Change:` trailer. A plan can name a direct CLI proof with a wrong argument. Correcting its invocation and recording the evidence in `review-B.md` changes no branch file, and there is no test path to cite. The leaf worktree excludes `issues/`. Record the citation in the review for command-only corrections and require trailers when the correction actually changes a path covered by the gate.
- **F3 · `skills/check-issue/SKILL.md:79`.** The repeated-Fix rule still requires a command red on the head before repair and green after. A repeated false-green test can pass on the unchanged head both before and after its assertion is strengthened. A still-missing case has no old run. On a rebase-exposed expectation the old head can also be green because the mismatch appears only with the new base. Make the correction-specific evidence rule apply to repeats, and use the recorded rebase candidate with the old expectation for a mismatch first exposed there.
- **F4 · `skills/check-issue/SKILL.md:87`, `skills/implement-issue/SKILL.md:83`.** The trailer instructions still miss paths the gate refuses. B's rule names path-matched tests, but a proof script such as `scripts/proof.sh` can already be frozen and need a trailer when edited. A's handback rule still names existing tests only, so a new test accompanying A's code repair is also missed. The existing phase test reproduces both refusals. Use the same frozen-path and new-test rule for both seats.
- **F5 · `skills/lifecycle-rules.md:35`.** The replacement instruction applies to any named means, immediately after the previous sentence says an explicitly required means is locked. A required public CLI call could fail while an internal helper produces the result. The replacement procedure would let a seat accept the helper without meeting the locked CLI contract. Limit this procedure to means the decision leaves open.

## Verification

- All 87 tests passed across `docs-links`, `phase` and `command-reference` with `--timeout=120000 --max-concurrency=5`. `git diff --check` passed. The phase tests cover a new test file, a changed frozen non-test file and a rebase with no leaf commit touching the frozen path.
- The ordinary first-pass evidence now accounts for an old test that passed on broken behavior and a new case with no old run. The live repair rules no longer assign every expectation change to A. The remaining old split in `docs/examples/autopilot-story.md` is explicitly a past run, as the design allows.
