# Direct review B, round 1

Verdict: **fix**.

Base: `00f90c62d5c949321a581e26f7c716aa85b0fb24`.
Reviewed head: `b1281398e90468eb3146b933e81da40a0b7cdeee`.
Worktree: `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-overnight-recs`, clean at the reviewed head.
Contract: `CHART.md` D1, D3 skill text and D4. D5 batching is outside this diff. My earlier preference to remove the pi default is not an acceptance criterion.

## F1: the existing-file case rule contradicts D1's required citation

Changed `skills/implement-issue/SKILL.md:59` permits A to add B's missing criterion case and requires its `Test-Change:` trailer to cite the criterion line. The same paragraph prefers extending existing tests. However, `:66` still explicitly instructs a commit adding a case to an existing test file to describe the addition and unchanged expectations, **“citing no source.”** `:78` sends check.fix through the new exception without resolving that instruction.

Source and consequence: D1's intended check.fix action, adding B's missing case to an existing test file, activates both instructions. A following the existing-file commit rule omits the criterion citation required by the new exception and the chart. This is a conflict in the instructions executed by the repair seat, not a request for a particular sentence format. The mechanical gate checks cited paths (`src/phase.ts:473–481`), so it does not ensure the missing criterion reference is present. B must then reject or repair that evidence during re-review, recreating an avoidable repair round in the flow being changed.

Repair: qualify `:66` so the missing-criterion exception retains its required criterion citation. No new gate, test, or broader policy change is needed. The generic “a new test needs no cited source” at `skills/check-issue/SKILL.md:53` is permission rather than an instruction to omit one, so I am not making its wording a separate Fix.

## Verification and accepted behavior

- Read the chart decisions, my consultation/rebuttal, all four changed files, their surrounding rules, `docs/guide/phases.md:80–106`, and the existing test-citation gate. No AREA.md changed.
- D1: `check-issue:79` explicitly hands missing cases/captures/recordings on existing tools to A and reserves the machinery stop for the specified absent machinery or unmerged dependency. `implement-issue:59,78` limits authorship to check.fix A, requires the deliberate-product-break red result and keeps workers excluded. `check-issue:83` no longer bans A's exception. Existing `implement-issue:86` and `check-issue:69` retain green proof and B re-review. The remaining citation conflict is F1.
- D3: `implement-issue:45` removes the shell-managed background/PID/log recipe, retains terminal-exit waiting and one launch, and implements the chosen foreground/explicit-timeout rule for pi. The paired pi review separately covers its helper and two call paths. No Claude settings changed.
- D4: traced mixed readiness through `chart-issues:45,47,69`: a settled chart can proceed without an unrelated unresolved chart, while the existing handoff review and actual dependency ordering remain. No numeric buffer was introduced.
- `git diff --check <base>..<head>` exits 0. No executable code or test files changed, and no `Test-Change:` trailers occur in the reviewed commit. Verification here was semantic inspection, not tests of prose wording. No full suite was run.
- `<chart>/direct/report.md` was absent when inspected. No implementation check results were available, so this review does not claim the repository checks passed. No code, commits or phase state changed during review.

Last operation: direct review written, verdict fix.
Next: chart door repairs F1 and supplies its verification report, then B re-checks the repair diff.
