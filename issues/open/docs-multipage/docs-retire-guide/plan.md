# Plan: docs-retire-guide

Direct slot B synthesis. `debate: no`, so no positions or rebuttals apply. The brief and locked design govern scope.

## Read first

- Authoritative leaf: `issues/open/docs-multipage/docs-retire-guide/brief.md` and `design.md`.
- `REFERENCE.md`, then `docs/index.html`, `docs/idea.html`, and `docs/style.css` for the deployed file/navigation structure.
- `tests/browser/docs-shell.pw.ts`, `docs-concepts.pw.ts`, `docs-operate.pw.ts`, and `docs-practice.pw.ts`.
- `tests/browser/playwright.config.ts` and the three page-group configs beside it.
- `package.json`, `bunfig.toml`, and `.gitignore` for checks and artifacts.
- `learnings/LESSONS.md` and `learnings/history/2026-09-11-guide-source-spec.md` for the confirmed test dependency on the retiring source.

## Live evidence

All 16 replacement HTML files and `style.css` exist. A read-only HTML-parser check, excluding the retiring guide, found 288 relative hrefs and zero missing targets. Four browser specs read the guide at module initialization and open it as a comparison page. Deleting only the HTML would break those specs before navigation can run. No application interface or build step is involved.

## Decisions

- **D1 — Delete the source.** Remove `docs/guide.html`, without a redirect, replacement fixture, or runtime retrieval from Git. Execution requires the shell and all page migrations to be present. The configured dependencies are docs-concepts, docs-operate, and docs-practice; inspect the live checkout before deletion, without adding a new ordering requirement.
- **D2 — Retire obsolete comparisons in the same diff.** Edit the four existing browser specs only as needed to remove guide reads, comparison tabs, byte-copy assertions, computed-style/geometry comparisons against the guide, and helpers/imports used solely by those assertions. Keep current-page checks and reader navigation. This is necessary repair of consumers of the deleted file, grounded in the recorded lesson, not permission for test-suite refactoring. Do not delete the suites or add a shared-helper cleanup.
- **D3 — Preserve surviving coverage.** Keep navigation order/current-page state, stylesheet and font loading, section/anchor presence, animations/reduced motion, sticky header, scrolling, screenshots, and independent overflow checks. Keep comparisons to the surviving idea-page shell where currently independent of the guide. In operate, derive the existing shell title expectation from the migrated section rather than the deleted source, without comparing content to itself. Remove only source-dependent geometry checks for parts, next, and day. Do not replace these with stricter overflow expectations or alter page layout.
- **D4 — Check links once.** Use a disposable HTML-parser script or inline invocation to extract every href from every remaining `docs/*.html`, including stylesheet links. Exclude absolute URLs and bare fragments. Resolve the path component of relative URLs against the source page, stripping query/fragment and decoding URL escapes, and require a regular file within `docs/`. Report source page and raw href for failures, exit nonzero on failure, and print page/href/failure counts. Record the exact command and output in completion evidence and discard temporary helpers. If a link is broken, edit only that href on its owning page and rerun. No content or CSS edits.

## Acceptance criteria

- **AC1:** `docs/guide.html` is absent. Exactly the 16 locked replacement pages remain: index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat.
- **AC2:** The recorded link-check command succeeds for every applicable href, with zero missing or outside-docs file targets. Exclusions do not hide relative file links containing fragments or queries.
- **AC3:** `grep -rn "guide.html" src skills plugin docs REFERENCE.md` produces no output and exits 1. An execution error is not a passing search. Browser specs likewise contain no reads or navigation to the retired guide.
- **AC4:** All four Playwright suites pass after deletion under their existing desktop/mobile and reduced-motion projects. Traces and screenshots are retained and their actual paths recorded.
- **AC5:** Configured format, unit-test, typecheck, and changed-test checks pass. The implementation diff contains only the deletion, necessary consumer-spec repairs, and any proven broken-href corrections. No temporary scripts remain.

## Ordered file/criterion checklist

1. **A1 — Confirm prerequisites (AC1).** Verify the complete page set and review current guide references before edits. Existing replacement pages are the source of truth after retirement.
2. **A2 — Delete and repair consumers (AC1, AC3, AC4).** Delete `docs/guide.html` and make the D2/D3 changes in the four named specs together. Update test names only where they still promise retired source comparisons. Leave browser configs, dependencies, and page contents unchanged unless a concrete execution requirement proves otherwise.
3. **A3 — Prove link resolution (AC2, AC3).** Run the disposable check on the resulting tree and the requested grep. Validate the checker in an isolated temporary fixture with an existing file, a missing file, a relative file plus fragment/query, a bare fragment, an external URL, and an escaping relative path. Missing/escaping targets must fail with identifying output. Delete fixtures afterward. No permanent checker or tests are needed for this one-time operation.
4. **A4 — Run browser and repository checks (AC4, AC5).** Capture command exit codes and actual artifact paths. Inspect the final diff for unrelated edits, including formatter changes, and remove only unrelated changes introduced during this implementation. Record limitations and completion evidence through the implementation workflow.

## Concrete verification

From the worktree, after deletion and consumer repairs:

```sh
test ! -e docs/guide.html
grep -rn "guide.html" src skills plugin docs REFERENCE.md
rg -n 'guide\.html' tests/browser
bunx playwright test --config tests/browser/playwright.config.ts
bunx playwright test --config tests/browser/docs-concepts.config.ts
bunx playwright test --config tests/browser/docs-operate.config.ts
bunx playwright test --config tests/browser/docs-practice.config.ts
bun run format
bun test
bun run typecheck
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
git --no-pager diff --check
```

Run the search commands with their expected no-match exit code handled explicitly. Use the configured `AKROGON_BASE`, not a guessed revision. Run the D4 checker separately and preserve its full invocation/output. Playwright is already a consumer dev dependency and all configs specify headless Chromium, trace on, and video off. Artifacts go to `.evidence/docs-shell/browser`, `.evidence/docs-concepts/browser`, `.evidence/docs-operate/browser`, and `.evidence/docs-practice/browser`. The retained reader flows navigate from the index through each group and back, and exercise the surviving site after the guide is gone.

## Open limitations

Source-equivalence checks intentionally end with the source's retirement. Existing geometry exceptions for parts, next, and day remain outside this deletion's scope, and removing their source comparisons does not establish that those layouts are overflow-free. Browser font checks depend on the existing external font service. The one-time file check proves local target existence, not external URL availability or every fragment's validity. No missing grounding resource was encountered.
