# Review B: docs-practice

Verdict: ready.

Base: `e31834df16a47c8cf0ad2e1824dc7b306a5dab7f`.
Reviewed head: `e8286f031e9b6b4f98bac5278ee9d8b307dd7ac0`.
The head is one commit ahead of base. `git status --porcelain` is empty. The diff contains only the five planned pages and two browser verification files.

## Findings

No Fixes or Nits. The implementation satisfies the locked migration scope and revised plan C1–C5.

The inherited day-section mobile overflow is an acknowledged limitation, not an introduced defect. The source and copied section have identical 390px clientWidth and 806px scrollWidth. Correcting the plan's unconditional containment expectation respects the locked source-markup and stylesheet preservation requirements. The regression test still compares the day section and command geometry against source and requires containment for every other section.

Nine navigation destinations belong to parallel leaves and are absent at this head. Their relative links are intentional. Full-site resolution and guide removal remain with docs-retire-guide. Google Fonts remain an external dependency and loaded during verification.

## Verification

- C1/C2: independently compared all six full source sections and each complete document prefix/suffix against guide/idea. All match, allowing only page title, current marker, required In practice heading, and assigned content. Reviewed day-before-cases order, band wrappers, cheat's ink-band, relative navigation, and unchanged reveal script. Protected guide, idea, index, and CSS have no diff from base.
- C3/C4: inspected the browser spec against the criteria. It uses real file navigation in headless Chromium without mocking pages or forcing animation visibility, checks source styles, unique IDs/current markers, local fragments, sticky reachable nav, and viewport geometry in desktop/mobile and normal/reduced-motion projects. Exact source-copy comparisons enforce the locked markup requirement. Existing screenshot inspections from this same session cover all five desktop and mobile pages.
- C5: verified retained logs showing 24 passing browser checks, 52 passing Bun tests with 540 assertions, successful typecheck and formatting, plus 20 screenshots and 24 traces under `.evidence/docs-practice/browser/`. The resolved changed-test command previously exited 0 with no affected Bun tests. The explicit Playwright command exercises the changed HTML. No code changed after that verification, so the full checks were not repeated.
- Additional live review scenario: the existing suite checks scroll-container CSS but does not operate horizontal scrolling. Used Playwright mouse-wheel input at 390×844 to confirm the Problems table reaches scrollLeft 492 of 492 and Cheat reaches 514 of 514, while both document widths stay 390. Exit 0. Evidence: `.evidence/docs-practice/review-B/horizontal-scroll.json`, `problems-scrolled.png`, `cheat-scrolled.png`, and `trace.zip`.

The top-level reference already links the docs directory and index already links all five destinations. No index edit is needed. No product or test files changed during review.
