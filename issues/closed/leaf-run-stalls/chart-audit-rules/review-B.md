# Review B: chart-audit-rules

Verdict: ready.
Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`.
Reviewed head: `646fa457d2160461b389b4c6b605bb643d61924a`.
Worktree clean at review. Initial review, `debate: no`, so no positions or rebuttal artifacts are expected. Reviewed independently without reading the other seat's review.

## Findings

No Fixes or Nits.

## Verification

- Read the brief, locked design, plan, implementation report, reference index, skills area, chart handoff skill, standing design, merge skill and relevant human documentation before judging the two-line diff.
- Criterion 1: both the placeholder and audit allow only destination blocking checks or leaf-added tests/runs, explicitly preserving standing-design's end-to-end and live evidence. In the brief's framework:verify scenario, a repo-wide command outside checks is refused and must first be made passing by a prerequisite and added to checks. Both prerequisite ordering and refusal are explicit.
- Criterion 2: every blocked-by entry requires its consumed output in the dependent's What or Why. For the documented download-button/export-csv dependency, the door must name the export output it consumes and propose a separately provable producer part as a prerequisite when applicable. No count, size or duration condition or kept-bundle explanation was added.
- Criterion 3: base-to-head diff changes only shapes.md:132 and shapes.md:170. The spine paragraph, chart-issues/SKILL.md and standing-design.md are unchanged. The referenced standing-design.md exists beside shapes.md. No AREA.md changed.
- Criterion 4: reused implementation evidence at the exact reviewed head: format unchanged and clean, 339 tests passing with zero failures, typecheck exit 0, and changed-tests zero affected tests with zero failures. No code changed, evidence is present, and no specific concern justifies rerunning checks. Prose assertion tests are correctly omitted under design and plan D4.
- Read docs/guide/chart.md's handoff contract and docs/guide/create.md's dependency example. Swept docs for criteria, audit, proof, repo-wide commands, consumed outputs and checks. No human page restates a conflicting rule. The documented handoff and dependency behavior remains accurate, with the detailed new audit duties owned by shapes.md.

No reusable new lesson found. The plan's stated limitation that the door applies these rules as prose remains explicit and is not a defect against the locked scope.

## Merge verification

Fetched origin and rebased onto `origin/main` at `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`; branch already up to date, no conflicts. Reviewed and final head remains `646fa457d2160461b389b4c6b605bb643d61924a`. Refreshed AKROGON_BASE from config after rebase: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`.

Blocking checks on this integrated head:
- `bun run format`: exit 0, all files unchanged.
- `bun test`: exit 0, 339 pass, 0 fail, 3937 assertions, 15 files, 80.48 seconds.
- `bun run typecheck`: exit 0.
- `export AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca; : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`: exit 0, one changed file, no affected tests, 0 fail.

No advisory checks configured. Worktree clean after checks. Completion-owner ISSUE.md and all three leaf briefs gathered before completion.

Fast-forward push succeeded: `origin main` advanced from `2ad0acf` to `646fa45` (`git push origin HEAD:main`, exit 0).
