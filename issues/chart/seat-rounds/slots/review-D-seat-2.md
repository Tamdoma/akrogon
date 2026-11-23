# Slot D review of seat-rounds, round 2

**Verdict `fix`**

Base `814a2387`  
Head `3ba5c91bdb28d1546e490c8ae206ab2033c43432`

## Remaining findings

- **F1 · `skills/check-issue/SKILL.md:79`.** Routing now happens before edits, but the same paragraph later says a proven defect whose repair needs planned live replay stays with B. Consider a live proof with the wrong expected response that must change together with the code. The unchanged proof cannot accept the repair, so the first rule hands the pair to A, while the replay rule assigns it to B. Make live replay subject to the same independent-proof requirement.
- **F3 · `skills/check-issue/SKILL.md:79`.** Repeated corrections now use the right evidence. The rebase clause still unconditionally requires the old expectation to go red. A rebase can expose a false-green proof that only checks exit status even when the required output is missing. Its old expectation stays green on the rebased head with that output deliberately removed. Use the rebased head for the before-run and keep the evidence branch for an old proof that passes on broken behavior.
- **F4 · `skills/check-issue/SKILL.md:87`.** Both seats now point to the complete rule at `implement-issue:63`, but B's summary drops old tests that were untouched during planning. Editing such a test still needs a trailer under `src/phase.ts:627–640`, even though the path was neither frozen nor newly added. The summary also reads as requiring trailers for unchanged frozen paths, which `src/phase.ts:680–685` excludes. Keep the reference to the shared rule and remove the summary.

## Closed

- **F2.** A proof-command correction with no branch edit records its source and evidence in `review-B.md`. There is no commit or path citation to invent.
- **F5.** A seat can replace a named means only when the decision leaves that means open. Explicitly required means and every stated result remain locked.

All 87 tests passed across `docs-links`, `phase` and `command-reference` with `--timeout=120000 --max-concurrency=5`. The phase tests exercised old-test edits, added tests, changed frozen non-test files and rebase-only drift. `git diff --check` passed.
