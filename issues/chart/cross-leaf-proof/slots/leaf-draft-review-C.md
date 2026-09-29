# Leaf-draft review C: proof-rules

1. Binding substance with no criterion. Review judges the diff against the criteria (`skills/check-issue/SKILL.md:41`), so a taken point missing from every criterion can be dropped under the cap without a Fix. Missing points:
   - proof-selection Q1: "A slow or live run names what no smaller test proves" (design.md:12). Criterion 1 and the What (brief.md:4) state only the cheapest-test half.
   - spine-growth Q1: "The spine runs in the consumer's blocking checks" and "A stage labelled real that fakes its result does not count" (design.md:24). Neither criterion 2 nor 5 has them. Without the first, nothing gates merge on the spine (`skills/merge-issue/SKILL.md:33` runs only `checks`).
   - spine-growth Q3: "names the property it proves" and "an outside change that makes a recording unreliable also triggers re-recording" (design.md:32). Both are absent from criterion 2.
   - proof-leaf-policy Q3: "product gates still stop the product" and "Follow-on failures grouped under their root" (design.md:53). Both are absent from criterion 3. The first is the guard that keeps collect-all out of product gates.
   - proof-leaf-policy Homes: "chart states repair scope and final-proof rule" (design.md:61). No criterion gives this a home. Criterion 5 covers only the spine and rule owners.
   Fix: add these to criteria 1, 2, 3 and 5 by content. They fit inside the existing bullets' three-sentence limit (design.md:88) without new lines.

2. Criterion 10 is a check that cannot fail. `bun run format` is `prettier --write src tests` (`package.json:8`). It rewrites files and exits 0, and it never reads the diff's files, since this leaf changes no `src/` or `tests/` (design.md:90). Replace it with `bun test` alone, or `bunx prettier --check src tests` if an untouched-code check is wanted. Per the taken proof-selection rule, drop commands that catch no failure of this leaf.

3. Criterion 9's last sentence is vague: "No existing standing-design rule or check is removed or loosened." Make it checkable: `git --no-pager diff --numstat origin/main...HEAD -- skills/chart-issues/assets/standing-design.md` shows 0 deleted lines, and the report names each rewritten line elsewhere with why it is not loosened. The cap already counts rewrites as added lines (design.md:88), so the implementer needs to know whether rewriting an existing standing-design bullet is allowed at all.
