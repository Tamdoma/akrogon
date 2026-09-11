# Review B: grounding-layout

Verdict: nits. No blocking Fix found.

Base: `e3881142f23eee780a114664c7a71770a5965d8f`.
Reviewed head: `421934b6a38fc03bee7abc06a446812c7f01f6e7`.
The head is one commit ahead of base. Worktree status is clean and branch changes under `issues/` are absent. Initial review performed without reading or contacting A's review.

## Findings

- R1 — Nit, plan D6: `auditdeepseek.md:413` retains historical references to the removed root index and old guide locations. The requested search outside issues/learnings reproduces this hit, so the brief's literal zero-match clause is not satisfied. This is explicitly acknowledged in plan and implementation, and the locked owned surfaces exclude the audit. It does not break an operational link in the changed guide/index and does not justify expanding this repair into historical text.
- R2 — Nit, plan D5: authoritative `issues/config.yaml` points to `docs/reference-index.md`, but that file is still absent from the registered checkout until merge. A planner there currently encounters a missing grounding resource. The index exists in the leaf worktree, execution has explicit read-first paths, and ordinary merge resolves the gap. The config edit remains outside the leaf branch as required by the existing phase guard. Verify registered config/index consistency when merging and retain the config edit through normal issue sync. No guard bypass or command change is warranted in this leaf.

## Acceptance and evidence

- C1: Independently compared all 17 original docs files from the reviewed base with their new locations. Fifteen HTML pages and CSS are byte-identical. Setup differs only in its index path. No old top-level HTML or root index remains. Four browser specs change only their file-URL base. Existing assertions/configs are unchanged.
- C2: Seven index links resolve relative to docs/reference-index.md. All three added AREA files have the required four sections, meaningful commands/key files/patterns and repository-relative named paths, within the 40-line cap (26/27/27 lines). Inspected only area files present in the reviewed diff.
- C3: README and setup name the new index. Effective config and the registered config diff confirm only grounding.index changed. Historical search residual and checkout timing are R1/R2, not hidden passes.
- C4: Init retains valid configured/discovered indexes, creates the default if no suitable index exists including missing configured files, and writes adjacent areas only where a one-line index entry is insufficient. Implement's affected-docs rule names AREA.md, four sections and cap. Check's new rule covers changed area files, missing paths as Fix, no unrelated area reads and deleted files without opening absent content. The implementation's missing-path and source-only sample evidence matches that behavior. No parser, new test, dependency or production code was added.
- C5: Inspected saved execution evidence from this implementation: formatter exit 0, typecheck exit 0, full Bun suite 211 pass/0 fail with 2728 assertions, changed-test selection exit 0 with no affected Bun tests. Browser results are 4 shell + 4 concepts + 4 operate + 24 practice = 36 passes. Independently checked all 36 saved trace ZIPs for archive integrity. Real browser assertions cover navigation/rendering with desktop/mobile/reduced-motion projects, trace on and video off. No mock of the unit or new prose gate is present.
- C6: Clean committed head, no issues files on branch, correct authoritative config edit, implementation report complete with stated limits. `git diff --check origin/main...HEAD` passes. The formatter's unrelated src/next.ts whitespace changes were restored, and the reviewed branch contains no production-code diff.

No full-suite rerun was needed: code/assertions are unchanged since the recorded passing runs, evidence exists, and the final factual AREA wording correction has no runtime effect.

## Diff-scoped named-path checks

Executed one shell invocation per changed area file, using the named paths already inspected in its diff. Each invocation listed every path and tested existence from repository root. All exited 0, no missing paths:

- `src/AREA.md`: src/akrogon.ts, tests/phase.test.ts, src/config.ts, src/phase.ts, src/shell.ts, issues/, docs/reference-index.md, tests/helpers.ts.
- `skills/AREA.md`: src/akrogon.ts, tests/install.test.ts, tests/phase.test.ts, skills/init-issues/SKILL.md, skills/implement-issue/SKILL.md, skills/implement-issue/worker-protocol.md, skills/check-issue/SKILL.md, skills/implement-issue/brief-template.md, src/routing.ts, docs/reference-index.md.
- `tests/AREA.md`: tests/, bunfig.toml, tests/phase.test.ts, tests/browser/playwright.config.ts, tests/helpers.ts, tests/command-reference.test.ts, docs/guide/, src/shell.ts, docs/reference-index.md.

Implementation logs are in `.evidence/grounding-layout/` relative to the worktree. Browser traces/screenshots are in `.evidence/docs-{shell,concepts,operate,practice}/browser/`. No new reusable lesson or unresolved blocking question was found.
