# Map A: Tamdoma/akrogon#43

Destination: akrogon `skills/check-issue/SKILL.md` Fix/Nit rules, one leaf. Review stops blocking on defects that need input no real build, user or integration would produce.

## Live surface
- `skills/check-issue/SKILL.md:41,43,47`: a Fix is any reproducible defect or untested failure the code can cause. No reachability bar.
- `:53`: re-check adds a blocker only for a repair-introduced defect. The framework case stayed inside this rule: F12 was "partly repaired" (same finding, new input) and F17 was proven repair-introduced against the prior head. So `:53` alone does not stop the loop.
- Real case `framework/.../offer-join-deploy/review-B.md:469-622`: F12 nested template in `${}`, F16 PROPFIND, F17 regex literal in `${}`. All crafted HTML, each round ~1.5h of suites.

## Forks
1. What makes a reproducible defect a Fix instead of a Nit?
   - 1a (rec) Reachability bar with reviewer burden: each Fix names the realistic source of its input (real build output, real user content, real integration, or untrusted input an attacker controls). Without one it is a Nit under a deferred heading. Checkable in the review file.
   - 1b Priority bar: only P0/P1 block. B already labels F12/F17 as P1, so it would not have stopped this case.
   - 1c Round bar: after round N only regressions on realistic input block. Adds a counter-dependent mode.
2. Where do deferred contrived findings go?
   - 2a (rec) Stay as Nits in `review-<slot>.md` under a "Deferred" line. merge-issue `:31` already turns held reusable Nits into lessons. No new mechanism.
   - 2b Merge slot files each as a GitHub seed via seed-issue. Visible backlog, but more noise and a new merge step.
3. Does the bar apply to initial review and re-check, both slots?
   - 3a (rec) Yes, it lives in the shared Fix definition.

## Practitioner
- Google eng-practices, "The Standard of Code Review" (https://google.github.io/eng-practices/review/reviewer/standard.html, read 2026-09-30): approve once the change "definitely improves the overall code health", "there is no such thing as 'perfect' code", balance "forward progress" against importance, mark polish as "Nit:". Supports 1a.

## Pitfalls
- Security code: adversarial input is the realistic input. The bar must count attacker-controlled input as real, or sanitizers and auth checks lose review.
- "Realistic" is fuzzy. Without the reviewer naming the source, B can call anything realistic and the loop returns.
- A done-criterion that literally covers the edge case still blocks. The bar applies to defects found beyond criteria, not to criteria.
- Docs sweep: `docs/guide/phases.md:17` and any Fix/Nit wording in docs.

## Off route
- `fix_rounds` limit and failure routing (command-owned, `src/`).
- Fixing the framework leaf itself. That is an operator action on that leaf.

## Fog
None.
