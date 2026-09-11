# Deleting a skill folder left dangling links in out-of-scope skills

Case: bootstrap/core-skills check.review, 2026-09-10, slot A Nit N1.

Evidence: the leaf deleted `skills/consult-issue/` and `skills/explain-issue/` as the brief required. `skills/seed-issue/SKILL.md` line 143 still links to `../consult-issue/series-materialization-reference.md`, and `skills/init-issues/scripts/sync-payload.ts` still lists both deleted skills. The brief kept seed-issue and init-issues out of scope until their own leaves, so the implementer could not fix them and the checker recorded a Nit. The implementation report did not mention the dangling references, so the owning leaves have nothing pointing them at the breakage except this file.

Learning: when a leaf deletes or renames a file that other folders reference, the implementer greps the repo for the old path and names every out-of-scope hit in the report's known limitations. The checker verifies that list. The owning leaves then find the breakage in the report instead of by accident.
