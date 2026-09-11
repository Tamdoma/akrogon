# Review A: docs-shell

Base: 2932b4e1f996af6a2b289b7aee7c35b774af06b7
Reviewed head: f0abc5e (Create shared documentation shell and entry pages)
Debate: no, so no positions or rebuttal input.

## Verification (rerun by A in the worktree)

- CSS inner bytes of guide.html `<style>` equal docs/style.css (Bun string compare: true). `git diff --exit-code 2932b4e -- docs/guide.html` clean. `git diff --check` clean. No `<style` in either new page. C1 holds.
- `bunx playwright test --config tests/browser/playwright.config.ts`: 4 passed (desktop, mobile, desktop-reduced, mobile-reduced), exit 0. Spec asserts the sixteen-link nav order, exactly one `aria-current="page"` matching the document, one section in `main#top`, Home → Idea → Home clicks over `file://`, real font load of Spectral/Bricolage Grotesque/Martian Mono, reveal of every `[data-animate]`, sticky header at top 0 after scroll, no horizontal overflow, computed-style equality against guide.html for the hero/idea text and grid elements, sixteen toc items with descriptions, and `#hero-rail` mpath present in normal motion. C2, C3, C4 hold.
- Screenshots inspected: `.evidence/docs-shell/browser/docs-shell.pw.ts-source-copies-and-complete-file-navigation-{desktop,mobile}/{index,idea}.png`. Fonts, palette, hero SVG, idea illustration and callouts match the guide. Nav wraps to three lines at 390px and stays reachable. trace.zip present in all four project dirs, video off. C5 holds.
- `bun test`: 52 pass, 0 fail. `bun run typecheck`: exit 0. `bun run format` (prettier --write src tests): no changes. All blocking checks pass.
- Lockfile records @playwright/test 1.63.0 with playwright and playwright-core. `.pw.ts` is not picked up by `bun test` (9 files ran, none under tests/browser).
- REFERENCE.md already points at docs/ generically. No index update needed for this leaf.

## Findings

- N1 (nit): index toc link labels render horizontally centered while their descriptions are left-aligned, because `.hero` sets `text-align:center` and the new `<div>` wrapper makes the `<a>` an inline in a centered block while `p` gets the body alignment. Cosmetic only, and fixing it would need a CSS rule the plan locks out (D2). Leave for a later docs leaf if the operator wants it.
- N2 (nit): `bunx prettier --check docs` warns on index.html and style.css, but the configured format command covers only src and tests, so this is not a blocking check. style.css must stay byte-identical to the guide anyway.

No Fix findings. No plan decision or exclusion is violated. Report section 8 matches what A reproduced.

## Verdict

nits

## Merge (slot A)

Rebase target: origin/main at 2932b4e1f996af6a2b289b7aee7c35b774af06b7. Branch already up to date, rebase was a no-op, head f0abc5e.
Checks after rebase: `bun run format` unchanged files, exit 0. `bun test` 52 pass, 0 fail. `bun run typecheck` exit 0. `bun test --changed=2932b4e…` 0 affected Bun tests, exit 0. Worktree clean.
Lessons: nits N1 and N2 are leaf-specific, no reusable mechanism, no LESSONS.md line added.
