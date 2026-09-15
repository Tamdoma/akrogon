# Fork: ponytail

## Question
How does check-issue share the ponytail?

## Carries
skills/check-issue/ponytail.md, skills/implement-issue/ponytail.md, check-issue:14, src/install.ts:11-21.

## Findings
- operator tier, Astra F7: one canonical file, the other a relative symlink, no loader.
- repo (both): install links whole skill folders into four harness roots, so a relative symlink resolves; a copied folder would carry a dangling link.

## Taken
Operator answer (2026-09-14): `21a` check-issue/ponytail.md becomes a relative symlink to ../implement-issue/ponytail.md, resolved through the installer's folder links. Forecloses deleting the copy and repointing check-issue:14.
