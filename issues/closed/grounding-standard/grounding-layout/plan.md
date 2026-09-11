# Plan: grounding-layout

Direct synthesis by B for `debate: no`. No positions or rebuttals were produced or needed. The locked design governs scope.

## Decisions

- D1. Move all 16 guide HTML pages and `docs/style.css` together into `docs/guide/`. Preserve filenames, sibling links, shared CSS and page shells. Change only copy that describes this grounding layout. Repoint the four existing browser specs to `../../docs/guide/`. Their configs contain evidence directories, not guide source paths, so leave those configs unchanged unless live inspection finds a source-path dependency.
- D2. Move `REFERENCE.md` to `docs/reference-index.md`, retaining seven one-line area entries. Link command, skills and tests to their adjacent `AREA.md` files. Link integration, documentation, issue records and learnings to their existing folders. Markdown hrefs resolve from the index directory, for example `../src/AREA.md` and `guide/`. Update the README link and setup example.
- D3. Write only `src/AREA.md`, `skills/AREA.md` and `tests/AREA.md`. Use `# <folder> area` and exactly Commands, Key files, Non-obvious patterns and See also as second-level sections. Keep each file 25–40 lines, satisfying both the brief's size target and design's 40-line cap, with no padding or overview. Named paths are repository-relative and must exist. Prefer inline code for repository-relative paths so Markdown does not resolve them from the area directory. These documents select useful entry points and mechanisms, not every file.
- D4. Change only the named rules in the three skills. Init proposes `docs/reference-index.md` when a suitable index is absent, preserving valid configured/discovered indexes and repeat-setup choices. It creates adjacent four-section `AREA.md` files, at most 40 lines, for areas that cannot be explained in one index line and links them from the top index. Replace the prohibition on area documents with this narrow authorship allowance. Implement's existing affected-docs sentence names `AREA.md`, its four sections and cap. Check's review rule uses one shell command per changed `AREA.md` to list its named paths and existence, recording missing paths as a Fix. It opens no area file absent from the reviewed diff. Do not add an extractor, new test file or automated prose gate.
- D5. Change only `grounding.index` in `/home/ivan/Work/infra/akrogon/issues/config.yaml`, in the registered checkout. Never commit this change on the leaf branch: `src/phase.ts:155` rejects every branch diff under `issues/`, including config. Record the registered-checkout diff in implementation evidence and leave persistence to the existing issue sync lifecycle. Do not run sync or widen this leaf into command changes. The worktree's inherited config may retain the old value until normal synchronization. Review criterion 4 against the authoritative registered config.
- D6. Keep `auditdeepseek.md` unchanged. It contains historical old-index mentions at line 413 and guide locations elsewhere, but is outside the design's owned surfaces. The literal repository-wide zero-match clause of brief criterion 4 therefore cannot pass. Record this precise residual as a scope conflict in implementation and review, rather than hiding it with an extra search exclusion or claiming full compliance. The design wins.
- D7. Verify navigation and rendering through the existing Playwright suites and retain their traces/screenshots. Use one-off filesystem/path checks for the new documents, including missing-path and no-area-diff scenarios. Do not introduce repository tests of prose or a permanent dead-path checker. No production TypeScript, schema, config key, dependency, deployment or other skill changes are required.

## Read first

Paths below are relative to the leaf worktree unless explicitly absolute.

- P1. `REFERENCE.md` until moved, then `docs/reference-index.md`. The destination and all three area files are absent at planning time by design, not missing external prerequisites.
- P2. `skills/init-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`. Follow the implementation skill's own brief/protocol references during execution.
- P3. `tests/browser/docs-shell.pw.ts`, `tests/browser/docs-concepts.pw.ts`, `tests/browser/docs-operate.pw.ts`, `tests/browser/docs-practice.pw.ts` and their four configs. Existing specs use file URLs, shared page-shell checks, desktop/mobile and reduced-motion projects. No server is needed.
- P4. `docs/setup.html`, `docs/files.html`, `README.md`, `package.json`, `.gitignore`. Guide paths become `docs/guide/` during implementation. Search remaining guide copy for descriptions of the changed rules before editing it.
- P5. For the command area: `src/akrogon.ts`, `src/config.ts`, `src/phase.ts`, `src/shell.ts`. For tests: `tests/helpers.ts` and relevant existing test files. Use these to ground key-file selections and patterns, without changing them.
- P6. `/home/ivan/Work/infra/akrogon/issues/config.yaml` and this authoritative leaf's `brief.md` and `design.md`. Issue artifacts belong beside this plan, never under worktree `issues/`.

Planning also consulted `learnings/LESSONS.md` and verified the cited scope mechanisms in `learnings/history/2026-09-11-stale-rule-in-docs.md` and `learnings/history/2026-09-11-lock-vs-criterion.md`. These observations support checking affected guide text and reporting D6, not new implementation requirements. No lesson edit is needed.

## Interfaces and concrete scenarios

- I1. `grounding.index` remains a path-valued existing config field. Init proposes its new default in prose/YAML, not in `src/config.ts`. An existing consumer configured to use a valid custom index retains it. With no suitable index, init creates the default and the necessary adjacent area documents. With a configured missing index, it still creates a real suitable index and updates the proposal rather than keeping a dead pointer.
- I2. A planner opens `docs/reference-index.md`, follows `../src/AREA.md`, then reads a named command source path from repository root. Every step resolves to a real file. For simple folders, the one-line index remains sufficient.
- I3. A review diff containing `src/AREA.md` checks its named paths in one shell invocation. Existing paths are listed as present, a nonexistent path is listed as missing and becomes a criterion-backed Fix. A source-only diff opens zero area files. A deleted area file has no post-change named paths to read, so review its deletion and affected index pointers against the plan without attempting to open the removed file. Check commands are tailored to the actual document's paths, not a mandatory text parser or guessed extraction format.
- I4. A user opens `docs/guide/index.html` through a file URL and visits all 16 guide pages. CSS, current-page state, internal anchors and narrow-screen rendering still work. Old top-level HTML files are absent.

## Acceptance criteria before implementation

- C1. Brief 1–2: all original guide pages and stylesheet exist under `docs/guide/`, no `docs/*.html` remains, all four specs use the new source directory, and browser navigation/rendering checks pass with artifacts.
- C2. Brief 3 and 5: the new index contains seven meaningful area lines and working links, root `REFERENCE.md` is absent, exactly the three requested area files exist, each has the four locked sections and at most 40 lines, and all named paths exist. D3 targets at least 25 lines without padding.
- C3. Brief 4 and 9: authoritative config, README and setup example name the new index, affected guide descriptions match the layout. Search outside `issues/` and `learnings/` reports no obsolete operational references. Preserve and explicitly report the known historical `auditdeepseek.md` exception under D6, so the literal zero-match portion remains an acknowledged contract limitation.
- C4. Brief 6–8: the three skill edits implement D4, preserve unrelated behavior and contain no contradictory prohibition. Human review verifies intent, including valid-index reuse, missing-index handling, simple versus complex areas, missing named paths and no-area-diff cases. No exact-wording test is introduced.
- C5. Typecheck, full Bun suite, configured formatter and guarded changed-tests command pass. Inspect formatter output so unrelated formatting changes do not enter this leaf. No source code changes, new tests, dependencies, extra area files or other excluded changes enter the final diff.
- C6. All issue artifacts and the D5 config edit are saved in the registered checkout. Code/docs/skills/test-path changes are committed in the leaf worktree, its status is clean, and its branch diff contains no `issues/` paths at implementation handoff.

## Ordered file and criterion checklist

- [ ] A1. Record original guide file names and stylesheet content for move verification. Repoint the four existing `.pw.ts` URL constants first. An existing suite should fail against the not-yet-created guide path, providing meaningful red evidence without adding a test. Then move the 16 HTML files and stylesheet together. Criteria C1, C5.
- [ ] A2. Move and relink the index, author the three area files from inspected live surfaces, update the README, setup example and any other guide copy that actually describes the changed layout/rules. Keep unrelated guide claims and page shells intact. Validate links from the index directory and area paths from repository root. Criteria C2, C3.
- [ ] A3. Edit the three skill sentences/sections as D4 specifies. Review their behavior using I1 and I3, with no new parser or prose test. Criteria C4.
- [ ] A4. After the new index exists in the leaf worktree, B changes only the authoritative config value under D5, preserves other checkout changes and records the before/after diff. Record the temporary checkout-path limitation below. Criteria C3, C6.
- [ ] A5. Run concrete verification below, record commands, exit codes and actual evidence paths in the implementation report, inspect the complete diff for ownership and remaining old references, commit only leaf-owned worktree files, and perform the normal implementation phase handoff. Criteria C1–C6. Never report the D6 search exception as a passing zero-match result.

No dependency on another leaf. The steps are one implementation sequence, not separate leaves. Effective `implement: subagents` governs execution with sequential bounded workers, while B owns the authoritative config edit and final checks.

## Concrete verification

Run from the leaf worktree. The configured baseline at planning was `e3881142f23eee780a114664c7a71770a5965d8f`. Execution uses its freshly resolved `AKROGON_BASE`.

```sh
bun run format
bun run typecheck
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
bun test
bunx --no-install playwright test --config tests/browser/playwright.config.ts
bunx --no-install playwright test --config tests/browser/docs-concepts.config.ts
bunx --no-install playwright test --config tests/browser/docs-operate.config.ts
bunx --no-install playwright test --config tests/browser/docs-practice.config.ts
```

The installed Playwright dev dependency and configs already specify headless Chromium, trace on and video off. Keep the existing desktop/mobile/reduced-motion projects. Capture actual traces/screenshots under `.evidence/docs-shell/browser`, `.evidence/docs-concepts/browser`, `.evidence/docs-operate/browser` and `.evidence/docs-practice/browser` in the report. Evidence is gitignored. Do not weaken font, navigation, anchor or overflow assertions to get a pass.

One-off acceptance checks, recorded in the report without adding test files:

- V1. Compare the initial guide inventory with the destination, confirm the stylesheet is unchanged, and check old HTML/index absence. Run `wc -l src/AREA.md skills/AREA.md tests/AREA.md`, inspect section shape/content, and resolve every index link and every area path. This verifies fixed references and numbers, while an agent judges usefulness.
- V2. For each new area file, use one shell invocation to list the document's actual named paths and their filesystem existence. Prove a missing path is reported with an isolated temporary fixture, then remove it. Review a source-only sample diff to demonstrate no area reads. This is verification evidence for the skill rule, not a new automated subsystem.
- V3. Run `rg -n 'REFERENCE[.]md' --glob '!issues/**' --glob '!learnings/**' .` and record the actual residual at `auditdeepseek.md:413`. Search the moved guide for descriptions of grounding, area docs and docs locations, judging content rather than broad keyword absence. Inspect the registered config diff independently of the leaf diff.
- V4. Inspect `git --no-pager diff --stat`, the full owned diff, and after commit `git status --porcelain` plus `git diff --name-only origin/main...HEAD -- issues`. The last two must be empty. Confirm the committed head is ahead of its base. Do not alter unrelated changes to satisfy these checks.

## Open limitations and review notes

- R1. D6 is a real brief/design conflict. The tracked historical audit outside the locked owned surfaces means criterion 4's literal zero-match requirement is not fully achievable within scope. Preserve this finding through implementation and review.
- R2. The authoritative config path changes before the new index reaches the registered checkout through merge. During that interval another planner in that checkout may see a missing index. Keep the implementation read-first paths explicit and record the gap. Normal merge/sync must ultimately leave the registered config and index consistent. Do not copy unmerged content to main, run an unsolicited sync, or change the lifecycle guard to mask the mismatch.
- R3. Existing browser checks require external Google Fonts to load. A network/font failure is a failed verification command with its trace, not proof that navigation passed. Report or resolve the actual execution failure without adding a fallback or changing the guide's fonts.
