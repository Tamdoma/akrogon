# Review A: docs-concepts

Base: e31834df16a47c8cf0ad2e1824dc7b306a5dab7f
Reviewed head: 8b5b9e1 (docs: split concept sections into standalone pages)
Debate: no, so no positions/rebuttal input.

## Verification evidence (rerun by A in the worktree)

- Section fidelity: `diff` of each `<section id="…">…</section>` block between `docs/guide.html` and the four new pages is empty for parts, state, phases, files. Parts and phases keep the `<div class="band">` wrapper and close it before `</main>`. Covers C1.
- Shell fidelity: after normalizing `<title>` and stripping `aria-current="page"`, and dropping the main block, each page's remaining HTML equals `docs/idea.html`. No `<style` element in any page. Exactly one `aria-current="page"` per page, on its own link. Covers C2.
- Cross-section anchors: the four guide sections contain no `href="#…"` anchors, so D5 required no rewrites. Only the two inherited `#top` anchors exist per page.
- Locked files: `git diff --exit-code e31834d -- docs/guide.html docs/idea.html docs/index.html docs/style.css` exits 0.
- Browser: `bunx playwright test --config tests/browser/docs-concepts.config.ts` exited 0, 4 passed (10.9s), projects desktop, mobile, desktop-reduced, mobile-reduced. Real Google fonts loaded. Output under `.evidence/docs-concepts/browser/…/{parts,state,phases,files}.png` plus `trace.zip` in each project directory (16 screenshots, 4 traces). Covers C3, C4, C5.
- Screenshots inspected: desktop parts.png and mobile phases.png show complete content, band backgrounds, wrapped reachable nav, sticky header, readable tables/code. Inherited Parts mobile overflow matches L4 and is asserted equal to guide geometry by the spec.
- Report: B's final block records `bun test` 52 pass, typecheck and format clean, committed `8b5b9e1`. Consistent with what I observed. Not rerun: no code change since and no specific concern.

## Findings

No Fix findings. Every done criterion is met.

- Nit N1: `tests/browser/docs-concepts.pw.ts` duplicates `destinations`, `extract`, `fonts`, `reveal` and `styles` verbatim from `docs-shell.pw.ts`. Reason: the plan (D6) and brief forbade touching the existing shell test, so duplication was the sanctioned path here, but a shared helper module is the obvious cleanup once the sibling page leaves land and the pattern repeats a third time. Not a defect, nothing to repair on this leaf.

## Verdict

nits

## Merge (slot A)

Rebase target: origin/main at e31834d, branch already up to date, no conflicts. Added lesson commit 6ca8f1a (learnings/LESSONS.md + history/2026-09-11-duplicated-browser-helpers.md) from Nit N1. Checks on 6ca8f1a: `bun run format` exit 0 (all unchanged), `bun test` exit 0 (52 pass, 0 fail, 540 assertions), `bun run typecheck` exit 0, `test_changed` exit 0 (0 affected tests). No advisory checks configured.
