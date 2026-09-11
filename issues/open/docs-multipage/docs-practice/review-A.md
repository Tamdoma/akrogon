# Review A: docs-practice

Base: e31834df16a47c8cf0ad2e1824dc7b306a5dab7f
Reviewed head: e8286f0 (`docs: split practice and reference sections into pages`)
Diff: 7 new files, 805 insertions. No protected file changed, worktree clean.

## Verification (rerun by A in the worktree)

- Section fidelity: script extracted `day`, `cases`, `limits`, `problems`, `learn`, `cheat` from `docs/guide.html` and compared byte-for-byte with each page. All six IDENTICAL, each once on its assigned page. `cases` and `problems` keep the `.band` wrapper, `cheat` keeps `class="ink-band"` first as in source. `in-practice.html` has one `<h1>In practice</h1>` in `.wrap.hero` before `day`. No cross-section anchor links exist in the six source sections, so no D5 rewrite was needed.
- Shell: `diff` of each page against `docs/idea.html` with `<main>` removed shows only the title line and the moved `aria-current` marker. Sixteen links in the agreed order, one marker per page, no `<style>` element, `style.css` linked.
- `git diff --exit-code e31834d -- docs/guide.html docs/idea.html docs/index.html docs/style.css`: clean. `git diff --check`: clean.
- `bunx playwright test --config tests/browser/docs-practice.config.ts`: 24 passed, exit 0. 20 full-page screenshots and 24 traces under `.evidence/docs-practice/browser/`.
- `bun run format` exit 0 (no changes), `bun test` 52 pass / 0 fail, `bun run typecheck` exit 0.
- Inspected `in-practice` mobile and `cheat` desktop screenshots: fonts loaded, wrappers and dark band render, nav visible. The mobile screenshot is 806px wide, which is the inherited day-section overflow documented in L2 and identical to the source guide.
- Tests: no mocks of the unit under test. Exact-text assertions are limited to the locked source copy, the idea shell fragments and the required heading, which the plan explicitly locks. Negative cases covered: marker count, duplicate IDs, invalid local fragments, containment, reduced motion.

## Findings

None blocking.

## Verdict

ready

## Merge (slot A)

Fetched origin; rebased cleanly onto origin/main 6ca8f1a (docs-concepts pages plus a lessons note). New head 4e69bc3, AKROGON_BASE 6ca8f1a409bc9f249733e698cb4fcd8b656e6d9b.
Checks after rebase: `bun run format` exit 0 (no changes), `bun test` 52 pass / 0 fail, `bun run typecheck` exit 0, `test_changed` exit 0 (0 affected tests), `bunx playwright test --config tests/browser/docs-practice.config.ts` 24 passed. Worktree clean.
First push rejected non-fast-forward (docs-operate landed). Rebased again onto origin/main acdd72c, head f95584a, AKROGON_BASE acdd72cfa509c293401e486197e1e96a64958706. All checks rerun green: format 0, test 52/0, typecheck 0, test_changed 0, browser 24 passed.
Pushed f95584a to origin/main fast-forward (acdd72c..f95584a); merge-base --is-ancestor confirms it landed.
