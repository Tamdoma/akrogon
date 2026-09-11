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

Changed files and reasons:
- Moved all 16 `docs/*.html` and `docs/style.css` to `docs/guide/`. SHA-256 inventory confirms 15 pages and CSS unchanged; setup changes only its index value.
- Moved `REFERENCE.md` to `docs/reference-index.md`, retained seven one-line entries and resolved their document-relative links. README now names this index.
- Added `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md` (26, 27, 27 lines), selecting commands, entry points and observed mechanisms with exactly four required sections. B corrected the Bun suite description against `bunfig.toml` (root `tests/` excludes supporting skill script tests); worker refreshed named-path evidence for `tests/` and `bunfig.toml`.
- Repointed only the URL constant in each of four existing browser specs. Configs/assertions unchanged.
- Init uses the new default while preserving valid indexes and allows needed adjacent area files; implement maintains their shape/cap; check lists named-path existence only for changed areas, reports missing paths as Fix, and handles deleted areas without opening them.

Tests run (from leaf worktree):
- `bun install --frozen-lockfile`: exit 0, existing locked dependencies installed, no manifest or lockfile change. Log `.evidence/grounding-layout/install.log`.
- `bunx --no-install playwright test --config tests/browser/playwright.config.ts` before move: exit 1, all four projects fail with ENOENT for `docs/guide/index.html`. Red log `.evidence/grounding-layout/red.log`, four traces under `.evidence/grounding-layout/red-browser/`.
- Same shell command after move: exit 0, 4 passed. Log `.evidence/grounding-layout/green-shell.log`.
- `bunx --no-install playwright test --config tests/browser/docs-concepts.config.ts`: exit 0, 4 passed. Log `.evidence/grounding-layout/green-concepts.log`.
- `bunx --no-install playwright test --config tests/browser/docs-operate.config.ts`: exit 0, 4 passed. Log `.evidence/grounding-layout/green-operate.log`.
- `bunx --no-install playwright test --config tests/browser/docs-practice.config.ts`: exit 0, 24 passed. Log `.evidence/grounding-layout/green-practice.log`.
- All four browser configurations ran sequentially, with their desktop/mobile and reduced-motion projects unchanged. Green traces and screenshots are under `.evidence/docs-shell/browser/`, `.evidence/docs-concepts/browser/`, `.evidence/docs-operate/browser/`, `.evidence/docs-practice/browser/`.
- `AKROGON_BASE=e3881142f23eee780a114664c7a71770a5965d8f bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'`: exit 0. Output: `--changed: 30 changed files, but no test files are affected`; `0 pass`, `0 fail`, `Ran 0 tests across 0 files. [7.00ms]`. Saved `.evidence/grounding-layout/changed-tests.log`. Browser coverage is separate above.
- One-off Python filesystem/hash/link assertions: exit 0, `.evidence/grounding-layout/layout.log` and original inventory `.evidence/grounding-layout/original-guide.sha256`. Confirms 17 relocated files, old HTML/root index absent, all seven index links, required section shape and line cap.
- One shell invocation per area's explicitly enumerated named paths with `test -e`: all present, logs `.evidence/grounding-layout/src-paths.log`, `skills-paths.log`, `tests-paths.log`. No parser or added test/helper file.
- Temporary area fixture explicitly named `src/akrogon.ts` and `src/grounding-layout-missing.ts`: reports present and missing respectively, evidence `.evidence/grounding-layout/missing-path.log`. Missing path would be a Fix against C2's real-path requirement. Temporary fixture and directory removed.
- Source-only sample diff `src/akrogon.ts` processed with shell `case AREA.md|*/AREA.md`: zero area files opened, `.evidence/grounding-layout/no-area-diff.log`.
- Human inspection of init verifies configured/discovered valid-index reuse, replacement of missing configured index by default, and needed-area creation for complex areas only. Review rule handles missing paths and deletions and never opens unaffected area docs.
- `rg -n 'REFERENCE[.]md' --glob '!issues/**' --glob '!learnings/**' .`: exit 0 because the historical `auditdeepseek.md:413` residual exists, saved `.evidence/grounding-layout/old-index.log`. No passing zero-match claim. Moved-guide relevant-copy search found only setup's grounding example, now current, saved `guide-copy.log`.
- `git --no-pager diff --check`: exit 0. Inspected owned diff and area contents; no production code, new test/dependency, other skill, or issue path edited by worker.

Known limitations:
- R1/D6: historical `auditdeepseek.md:413` retains old index/guide mentions. Literal repository-wide zero matches conflicts with the locked exclusion; the audit is unchanged.
- R2/D5: B owns the authoritative config update. The registered checkout temporarily lacks the new index until merge, and the inherited worktree config may retain its old index until normal synchronization. Worker did not edit config, sync, or copy unmerged docs into main.
- Changed Bun selection reports no affected tests, so it alone does not establish browser coverage. All 36 browser tests passed separately with artifacts.

Unverified criteria: Worker-owned C1, C2 and C4 verified; C3's README/setup portion verified with the explicit historical exception. B owns authoritative config validation, configured final checks, commit/clean branch and phase handoff for C3/C5/C6. No remaining worker scope mismatch beyond the planned historical/config timing limitations.
