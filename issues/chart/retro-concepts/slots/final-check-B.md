# Slot B final-shape check

Name pick: `learn-issues`. It matches the existing `learnings/` store and Learn guide while following the operator's verb-issues naming requirement (`docs/guide/learn.md:1`, `issues/chart/retro-concepts/forks/adopt.md:32–33`).

No concrete defect found in the proposed shape. It follows the binding separate-skill decision and preserves operator acceptance of seed offers (`issues/chart/retro-concepts/forks/adopt.md:27`, `:33`). Leaving lesson edits for the operator matches `docs/guide/files.md:56`.

No installer change is needed: skill directories are discovered dynamically, and installation tests check those discovered directories in every harness root (`src/install.ts:12–21`, `tests/install.test.ts:21`, `:71–75`).
