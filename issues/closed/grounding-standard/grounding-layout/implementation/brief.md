# Implementation brief

## 1. Goal
Implement plan D1–D7: relocate guide/index, add three useful area documents, and maintain the grounding standard through existing skills.

## 2. Numbered acceptance criteria
1. C1: All 16 pages/CSS move intact except affected copy, four browser specs resolve the new path, existing browser checks pass with traces.
2. C2: Seven working index links, three 25–40-line area files with the four locked sections and real repository-relative paths, no old root index.
3. C3: README/setup and authoritative config name the new index. Report historical audit exception rather than claiming zero matches.
4. C4: Init preserves valid custom indexes and creates needed areas, implement maintains area shape, check examines only changed area files and reports missing paths.
5. C5–C6: Blocking checks pass, changes stay scoped, authoritative config/artifacts remain off the committed leaf branch, clean handoff.

## 3. Read-first list
Read ../plan.md and ../design.md. Use current REFERENCE.md, the three named skill files, tests/browser/*.pw.ts and configs, package.json, README.md, docs/setup.html, src/{akrogon,config,phase,shell}.ts, tests/helpers.ts and skills/implement-issue/ponytail.md. Copy existing browser URL and file-navigation patterns.

## 4. Change list and needed interfaces
Worker owns guide relocation, index/README, three AREA.md files, four browser URL constants and three skill edits. B alone changes /home/ivan/Work/infra/akrogon/issues/config.yaml grounding.index after destination exists. No schema change. Paths within AREA.md are repository-relative, index hrefs are document-relative.

## 5. Do-not, reasons and exceptions
Do not edit production code, add tests/dependencies/helpers, edit historical audit or unrelated guide copy, or put issues files on the leaf branch. These are locked exclusions and prevent scope expansion and lifecycle conflicts. Return a mismatch with evidence instead of widening scope. Only B's revised brief can authorize a correction. The sole external write besides reports is B's authoritative config edit, as plan D5 requires.

## 6. Ordered steps
Worker executes A1–A3 from the plan: capture inventory, repoint specs and capture red evidence, move guide, create index/areas, update affected text/rules, run changed tests and browser checks. B validates worker report, performs A4 config change, runs A5 full checks, records evidence and commits. Advisory size is about 30 paths, mostly moves, with one bounded worker. Return scope mismatches, not partial success.

## 7. Commands
Worker changed-tests command:
`AKROGON_BASE=e3881142f23eee780a114664c7a71770a5965d8f bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'`
B owns configured format/typecheck/full suite. Browser commands and one-off path verification are in the plan and produce evidence, not new test files.

## 8. Done-when, evidence and report
Record actual commands/exits and Playwright traces/screenshots. Verify positive/missing named paths and no-area-diff behavior without adding a parser. Report D6's audit exception and D5's temporary authoritative-checkout gap explicitly. B commits only scoped worktree changes and hands off through akrogon.

Changed files and reasons: Commit `421934b6a38fc03bee7abc06a446812c7f01f6e7` changes 30 paths: 16 guide pages/CSS relocated, index relocated/relinked, README/setup index references updated, three area documents added, three grounding rules updated and four existing browser URL constants repointed. No production code, test files or dependencies added. Authoritative `/home/ivan/Work/infra/akrogon/issues/config.yaml` changed only grounding.index to docs/reference-index.md outside the leaf branch. Its diff is `.evidence/grounding-layout/authoritative-config.diff`. Worker detail and command evidence are in `brief-1.md`.

Tests run:
- `bun run format`: exit 0, `.evidence/grounding-layout/format.log`. It also reformatted an unrelated clean `src/next.ts` file. B restored that file exactly from HEAD, leaving no production-code diff.
- `bun run typecheck`: exit 0, `.evidence/grounding-layout/typecheck.log`.
- Guarded `bun test --changed` against base `e3881142f23eee780a114664c7a71770a5965d8f`: exit 0, no affected Bun tests, `.evidence/grounding-layout/changed-tests.log`.
- `bun test`: exit 0, 211 pass, 0 fail, 2728 assertions, `.evidence/grounding-layout/full-test.log`.
- Existing shell Playwright config first failed all four projects on absent docs/guide/index.html. After the move, all four browser configs passed: shell 4, concepts 4, operate 4, practice 24. Logs `.evidence/grounding-layout/green-{shell,concepts,operate,practice}.log`. Red traces are under `.evidence/grounding-layout/red-browser/`; 36 green traces and 64 screenshots are under `.evidence/docs-{shell,concepts,operate,practice}/browser/`. These are real headless Chromium runs with trace on and video off.
- Inventory/hash validation proves 15 HTML pages and CSS unchanged, setup changes only its index path. Seven index links and every area path resolve. Area sizes are 26/27/27 lines with four required sections. Evidence: `.evidence/grounding-layout/layout.log`, `original-guide.sha256`, `{src,skills,tests}-paths.log`.
- Negative named-path fixture reports the missing file, source-only sample opens zero area docs, temporary fixture removed. Evidence: `.evidence/grounding-layout/missing-path.log`, `no-area-diff.log`.
- B reviewed skill behavior and area facts, correcting the test command description against bunfig.toml. Init retains valid custom indexes and creates needed area docs, check reports missing paths only in changed areas. No prose tests added.
- `git diff --cached --check`: exit 0 before commit. After commit, `git status --porcelain` and `git diff --name-only origin/main...HEAD -- issues` are empty. Committed head is ahead of the supplied base. No unrelated or generated file is committed.

Known limitations: R1/D6 remains: `.evidence/grounding-layout/old-index.log` records historical `auditdeepseek.md:413` references, preserved by locked scope. R2/D5 remains: registered config is updated but its new index arrives through normal merge, and the inherited worktree config still has the old path. No sync, push or unmerged main copy was performed. R3 did not occur: browser font checks passed. Changed-test selection alone ran no tests, so full Bun and browser results provide coverage.

Unverified criteria: The literal zero-old-reference clause of brief criterion 4 is not satisfied because of D6's documented scope conflict. C1, C2, C4 and C5 pass, C3's operational references and authoritative config pass, and C6's committed clean leaf/issue ownership checks pass. Final registered-checkout config/index consistency awaits normal merge/sync under D5.
