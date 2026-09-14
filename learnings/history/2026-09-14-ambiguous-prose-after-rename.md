# Renamed contract leaves ambiguous prose in excluded files

2026-09-14. Leaf plan-is-contract-skills removed the whole-leaf `implementation/brief.md` contract. Review found `docs/guide/in-practice.html:86` and `docs/guide/problems.html:61` still say "fix the brief if the brief was the problem" for a failed leaf. The intake `brief.md` still exists so the sentences are not wrong, but a reader can map "the brief" to the removed file. Both files were in the design's exclusions, so it was recorded as a Nit.

Learning: when a leaf renames or removes a contract file, sweep prose for the old term itself, not only the old path. A dangling-path grep misses sentences that still parse but now point at the wrong referent; report ambiguous hits as Nits when the files are out of scope.
