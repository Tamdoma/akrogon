# Review A: docs-operate

Base: e31834df16a47c8cf0ad2e1824dc7b306a5dab7f
Reviewed head: 9f9def720ab1a28e1f535ed00ad89826ae145096

## Verification

- Diff contains only docs/{install,setup,create,next,merge}.html, tests/browser/docs-operate.pw.ts and tests/browser/docs-operate.config.ts (C5).
- `git diff --exit-code e31834d -- docs/guide.html docs/idea.html docs/index.html docs/style.css` exited 0. `git diff --check` clean.
- Reran `bunx playwright test --config tests/browser/docs-operate.config.ts`: exit 0, 4 passed (desktop, mobile, desktop-reduced, mobile-reduced). Artifacts present under `.evidence/docs-operate/browser/*/{install,setup,create,next,merge,source-next}.png` and `trace.zip`; red-run traces retained under `.evidence/docs-operate/red-browser/`.
- Spec asserts byte-equal section extraction against guide.html, band wrapper for install/create, ink-band on merge, shell head/header/footer/script equality with idea.html modulo title and current marker, sixteen nav hrefs, single aria-current, no `<style>`, resolvable local fragments, font loading, revealed animated elements, sticky header at page bottom, scrollable pre/.tbl, computed-style equality with the source section, and next geometry parity (L4). These match C1–C4 and do not test prose wording or pixels.
- Inspected mobile merge screenshot: dark band, stat cards and code block retain source contrast; nav wraps and stays reachable.
- Page structure spot-checked: merge keeps `class="ink-band"` with no `sec`; install/next keep `class="sec"`; titles use the section aria-label plus ` · Akrogon Guide`.
- B's recorded blocking checks (format, test 52 pass, typecheck, changed-test) are consistent with the diff; no code changed since, so not rerun.

## Findings

- N1 (Nit): the spec reads `docs/guide.html` as its source of truth, and the parent design deletes guide.html in a later leaf. That leaf must update or retire this comparison. Not a defect here because the shell spec already uses the same pattern and the deletion is out of this leaf's scope.

## Verdict

nits

## Merge

Rebase target: origin/main at e31834df16a47c8cf0ad2e1824dc7b306a5dab7f (branch already up to date, no conflicts). Merge head: 2ac6b40 (adds the N1 lesson line and history file on top of 9f9def7).
Checks in worktree after rebase: `bun run format` exit 0 (all unchanged), `bun test` 52 pass / 0 fail, `bun run typecheck` exit 0, `bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f` exit 0 (0 affected tests). No advisory checks configured.
First push rejected non-fast-forward. Refetched: main advanced to 6ca8f1a409bc9f249733e698cb4fcd8b656e6d9b (docs-concepts pages plus a lesson line). Rebase conflicted only in `learnings/LESSONS.md` on the appended lesson line from this merge phase, not in leaf work; kept both entries and continued. New merge head: acdd72c on top of 51800bb (the leaf commit, rebased).
Checks rerun after rebase with AKROGON_BASE=6ca8f1a4: `bun run format` exit 0, `bun test` 52 pass / 0 fail, `bun run typecheck` exit 0, changed-test exit 0 (0 affected), `bunx playwright test --config tests/browser/docs-operate.config.ts` exit 0, 4 passed.
