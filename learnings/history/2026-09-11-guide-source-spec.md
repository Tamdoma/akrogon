# Page specs bound to guide.html

2026-09-11. docs-operate (and docs-shell before it) verify extracted pages by byte-comparing sections against `docs/guide.html`. The docs-multipage design deletes guide.html in a later leaf, so every page spec that reads it fails the moment that leaf lands.

Evidence: `tests/browser/docs-operate.pw.ts` and `tests/browser/docs-shell.pw.ts` both `readFileSync` guide.html.

Learning: the leaf that deletes a source file must inventory every spec reading it and retire or re-anchor the comparison in the same diff, listed as a done criterion at chart time.
