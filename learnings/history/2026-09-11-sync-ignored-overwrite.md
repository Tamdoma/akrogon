# Git rebase can overwrite ignored files

Case: scoped-branch-sync review B on 2026-09-11, reviewed commit 17048a06f95dfd332d2fd9ccacb91353aa2d0f29.

Evidence: a real CLI fixture with a baseline .gitignore entry for collision, local ignored operator bytes, and an incoming force-added tracked collision completed sync with exit 0 and replaced the operator bytes with remote bytes. The otherwise identical nonignored fixture refused checkout, preserved bytes and did not push. The detailed reproduction is recorded in the leaf review-B.md, finding F1.

Learning: Git autostash protects tracked edits, while checkout/rebase can overwrite ignored untracked files. A preservation contract must verify ignored-file collisions separately from ordinary untracked collisions.

Applied 2026-09-11 in scoped-branch-sync repair round 1: preflight ignored incoming/replay path collisions, with fail-first real CLI regressions and preserved-byte evidence.
