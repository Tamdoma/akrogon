# Review B: rename-vocabulary

Base: d554f78d87bb7b29a4da8528da4c641e3ba66785. Reviewed head: 0a6ea42. Worktree clean, one commit ahead of base, no issues/ paths on the branch.

## Evidence

- `bun test tests/status.test.ts`: 15 pass 0 fail (rerun by reviewer).
- `bun test` full suite: 217 pass (reported by implementer, spot-verified via status.test.ts rerun).
- Criterion 2 grep: only binding-decisions lines in shapes.md leaf-design section and SKILL.md audit line. Verified.
- Criterion 6 at root: `find issues/chart issues/closed -type d -name decisions` empty; heading grep empty. Verified.
- Criterion 7: only files.html:99 design.md row matches. Verified.
- Criterion 5: e2e run of worktree `src/akrogon.ts status --charts` against a scratch repo holding the real migrated charts printed `TAKEN`/`FOG` header, `charting-vocabulary 5/5`, `status-empty-open 1/1`, both `handed off`. Verified output.
- Chart migration at root inspected: all 10 charts renamed `decisions/` -> `forks/`, four CHART.md headings rewritten, `## Resolution` -> `## Taken` in 59 fork files, `decisions/` links rewritten; charting-vocabulary INTAKE/slots and disk-names.md keep historical `decisions/` mentions verbatim (they record the rename itself). Closed leaf design.md `## Resolution` headings untouched.
- src/status.ts: header `CHART TAKEN FOG STAGE AGE`; chartRow reads `forks/`, `/^## Taken\s*\n\s*\S/m`, `section(markdown,'Fog')`; stage rule unchanged. No dual-format reading.
- Skill rewrite: eight words present with design meanings; shapes.md carries the three criterion-3 statements; `## Decide` -> `## Take`; batch -> round with handoff kept distinct; slot examples renamed to fork-name-*.
- AREA.md files: skills/src/tests AREA.md contain no chart-vocabulary references; nothing to update.

## Findings

- Nit: the migrated charts at the authoritative root are uncommitted working-tree changes. Correct call (requireCodeOnly bars issues/ on the branch; committing on main would diverge local main), but they sit unprotected among other dirty files until the operator's pending work lands.
- Nit: files.html:102 and create.html:63 were reworded beyond the design's named four lines because criterion 7's grep admits only the design.md row. Right call; noted for the record.

## Verdict

ready
